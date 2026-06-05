import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Cards() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [front, setFront] = useState("");
  const [flipped, setFlipped] = useState({});

  const load = async () => {
    const { data } = await api.get(`/decks/${id}/cards`);
    setCards(data);
  };

  useEffect(() => { load(); }, [id]);

  const create = async (e) => {
    e.preventDefault();
    await api.post(`/decks/${id}/cards`, { front, source_lang: "pt" });
    setFront("");
    load();
  };

  const remove = async (cid) => {
    await api.delete(`/cards/${cid}`);
    load();
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn-secondary" onClick={() => navigate("/")}>← Voltar</button>
        <h1>Cards</h1>
      </div>

      <form onSubmit={create} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Palavra ou frase em português"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          required
          style={{ flex: 1 }}
        />
        <button className="btn-primary" type="submit">Adicionar</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cards.map((c) => (
          <div key={c.id} className="card"
            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={() => setFlipped((f) => ({ ...f, [c.id]: !f[c.id] }))}>
            <div>
              <strong>{c.front}</strong>
              {flipped[c.id] && (
                <p style={{ marginTop: 6, color: "#4f46e5", fontSize: "1.1rem" }}>{c.back}</p>
              )}
              {!flipped[c.id] && <p style={{ fontSize: "0.8rem", color: "#999" }}>Clique para ver a tradução</p>}
            </div>
            <button className="btn-danger" style={{ fontSize: "0.8rem" }}
              onClick={(e) => { e.stopPropagation(); remove(c.id); }}>
              ✕
            </button>
          </div>
        ))}
        {cards.length === 0 && <p style={{ color: "#888" }}>Nenhum card ainda.</p>}
      </div>
    </div>
  );
}
