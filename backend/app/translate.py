from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import requests as http
from app.hangul import latin_to_hangul

translate_bp = Blueprint("translate", __name__)

MYMEMORY_URL = "https://api.mymemory.translated.net/get"


@translate_bp.route("", methods=["POST"])
@jwt_required()
def translate():
    """Translate text via MyMemory API."""
    data = request.get_json()
    text = (data or {}).get("text", "").strip()
    lang_pair = (data or {}).get("lang_pair", "pt|en")

    if not text:
        return jsonify({"error": "text é obrigatório"}), 400

    try:
        resp = http.get(MYMEMORY_URL, params={"q": text, "langpair": lang_pair}, timeout=5)
        result = resp.json()
        translated = result["responseData"]["translatedText"]
        return jsonify({"original": text, "translated": translated, "lang_pair": lang_pair}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@translate_bp.route("/hangul", methods=["POST"])
@jwt_required()
def translate_hangul():
    """
    Convert Latin keyboard input to Hangul.

    Body: { "text": "gksrmf" }
    Returns: { "original": "gksrmf", "hangul": "한국어" }

    Useful for typing Korean words using a QWERTY keyboard without switching
    the system input method.
    """
    data = request.get_json()
    text = (data or {}).get("text", "")

    if not text:
        return jsonify({"error": "text é obrigatório"}), 400

    hangul = latin_to_hangul(text)
    return jsonify({"original": text, "hangul": hangul}), 200
