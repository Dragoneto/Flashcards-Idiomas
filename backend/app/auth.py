from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = (data or {}).get("username", "").strip()
    password = (data or {}).get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username e password são obrigatórios"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username já existe"}), 409

    user = User(
        username=username,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = (data or {}).get("username", "").strip()
    password = (data or {}).get("password", "").strip()

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Credenciais inválidas"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200
