from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Deck

decks_bp = Blueprint("decks", __name__)


@decks_bp.route("", methods=["GET"])
@jwt_required()
def list_decks():
    user_id = int(get_jwt_identity())
    decks = Deck.query.filter_by(user_id=user_id).order_by(Deck.created_at.desc()).all()
    return jsonify([d.to_dict() for d in decks]), 200


@decks_bp.route("", methods=["POST"])
@jwt_required()
def create_deck():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    name = (data or {}).get("name", "").strip()
    language = (data or {}).get("language", "ko").strip()

    if not name:
        return jsonify({"error": "Nome do deck é obrigatório"}), 400

    deck = Deck(name=name, language=language, user_id=user_id)
    db.session.add(deck)
    db.session.commit()
    return jsonify(deck.to_dict()), 201


@decks_bp.route("/<int:deck_id>", methods=["DELETE"])
@jwt_required()
def delete_deck(deck_id):
    user_id = int(get_jwt_identity())
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first_or_404()
    db.session.delete(deck)
    db.session.commit()
    return jsonify({"message": "Deck deletado"}), 200
