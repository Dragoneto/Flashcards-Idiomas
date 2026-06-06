from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests as http
from app import db
from app.models import Deck, Card

cards_bp = Blueprint("cards", __name__)

MYMEMORY_URL = "https://api.mymemory.translated.net/get"

# Unicode ranges for script validation
_HANGUL   = lambda ch: "가" <= ch <= "힣"
_HIRAGANA = lambda ch: "぀" <= ch <= "ゟ"
_KATAKANA = lambda ch: "゠" <= ch <= "ヿ"
_KANJI    = lambda ch: "一" <= ch <= "鿿"
_JAPANESE = lambda ch: _HIRAGANA(ch) or _KATAKANA(ch) or _KANJI(ch)


def translate_text(text: str, lang_pair: str) -> str:
    """Translate via MyMemory with script validation for CJK languages."""
    parts = lang_pair.split("|")
    if len(parts) != 2:
        return text
    target_lang = parts[1]

    try:
        resp = http.get(MYMEMORY_URL, params={"q": text, "langpair": lang_pair}, timeout=6)
        result = resp.json()["responseData"]["translatedText"]

        # Discard if same as input
        if result.strip().lower() == text.strip().lower():
            return text

        # Validate script for Korean
        if target_lang == "ko" and not any(_HANGUL(ch) for ch in result):
            return text

        # Validate script for Japanese
        if target_lang == "ja" and not any(_JAPANESE(ch) for ch in result):
            return text

        return result
    except Exception:
        return text


def romanize(text: str, language: str) -> str | None:
    if language != "ko":
        return None
    try:
        from hangul_romanize import Transliter
        from hangul_romanize import rule
        return Transliter(rule.academic).translit(text)
    except Exception:
        return None


def make_syllable_guide(text: str, language: str) -> str | None:
    if language != "ko":
        return None
    try:
        from hangul_romanize import Transliter
        from hangul_romanize import rule
        t = Transliter(rule.academic)
        parts = [t.translit(ch).upper() for ch in text if "가" <= ch <= "힣"]
        return " - ".join(parts) if parts else None
    except Exception:
        return None


@cards_bp.route("/decks/<int:deck_id>/cards", methods=["GET"])
@jwt_required()
def list_cards(deck_id):
    user_id = int(get_jwt_identity())
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first_or_404()
    return jsonify([c.to_dict() for c in deck.cards]), 200


@cards_bp.route("/decks/<int:deck_id>/cards", methods=["POST"])
@jwt_required()
def create_card(deck_id):
    user_id = int(get_jwt_identity())
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first_or_404()

    data = request.get_json()
    front = (data or {}).get("front", "").strip()
    source_lang = (data or {}).get("source_lang", "pt")

    if not front:
        return jsonify({"error": "Frente do card é obrigatória"}), 400

    lang_pair = f"{source_lang}|{deck.language}"
    back      = translate_text(front, lang_pair)
    roman     = romanize(back, deck.language)
    syllables = make_syllable_guide(back, deck.language)

    card = Card(front=front, back=back, romanization=roman,
                syllable_guide=syllables, deck_id=deck.id)
    db.session.add(card)
    db.session.commit()
    return jsonify(card.to_dict()), 201


@cards_bp.route("/cards/<int:card_id>", methods=["DELETE"])
@jwt_required()
def delete_card(card_id):
    user_id = int(get_jwt_identity())
    card = Card.query.get_or_404(card_id)
    if card.deck.user_id != user_id:
        return jsonify({"error": "Não autorizado"}), 403
    db.session.delete(card)
    db.session.commit()
    return jsonify({"message": "Card deletado"}), 200
