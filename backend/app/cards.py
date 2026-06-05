from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests as http
from app import db
from app.models import Deck, Card

cards_bp = Blueprint("cards", __name__)

MYMEMORY_URL = "https://api.mymemory.translated.net/get"


def translate_text(text: str, lang_pair: str) -> str:
    try:
        resp = http.get(MYMEMORY_URL, params={"q": text, "langpair": lang_pair}, timeout=5)
        data = resp.json()
        return data["responseData"]["translatedText"]
    except Exception:
        return text


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
    back = translate_text(front, lang_pair)

    card = Card(front=front, back=back, deck_id=deck.id)
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
