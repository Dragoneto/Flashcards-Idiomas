from app import db
from datetime import datetime


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    decks = db.relationship("Deck", backref="owner", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "username": self.username}


class Deck(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    language = db.Column(db.String(10), nullable=False, default="ko")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    cards = db.relationship("Card", backref="deck", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "language": self.language,
            "card_count": len(self.cards),
            "created_at": self.created_at.isoformat(),
        }


class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    front = db.Column(db.String(500), nullable=False)
    back = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deck_id = db.Column(db.Integer, db.ForeignKey("deck.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "front": self.front,
            "back": self.back,
            "created_at": self.created_at.isoformat(),
        }
