from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///flashcards.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-prod")

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    from app.auth import auth_bp
    from app.decks import decks_bp
    from app.cards import cards_bp
    from app.translate import translate_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(decks_bp, url_prefix="/decks")
    app.register_blueprint(cards_bp)
    app.register_blueprint(translate_bp, url_prefix="/translate")

    with app.app_context():
        db.create_all()

    return app
