import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Decks() {
  const [decks, setDecks] = useState([]);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("ko");
  const navigate = useNavigate();

  const load = async () => {
    const { data } = await api.get("/decks");
    setDecks(data);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/decks", { name, language });
    setName("");
    load();
  };

  const remove = async (id) => {
    await api.delete(`/decks/${id}`);
    load();
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>🃏 Meus Decks</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/hangul"><button className="btn-secondary">🇰🇷 Hangul</button></Link>
          <button className="btn-secondary" onClick={logout}>Sair</button>
        </div>
      </div>

      <form onSubmit={create} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Nome do deck"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: 1 }}
        />
        <select value={language} onChange={(e) => setLanguage(e.target.value)}
          style={{ border: "1px solid #ccc", borderRadius: 6, padding: "8px 10px" }}>
          <option value="ko">Coreano</option>
          <option value="en">Inglês</option>
          <option value="ja">Japonês</option>
          <option value="es">Espanhol</option>
          <option value="fr">Francês</option>
        </select>
        <button className="btn-primary" type="submit">Criar</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {decks.map((d) => (
          <div key={d.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div onClick={() => navigate(`/decks/${d.id}/cards`)} style={{ cursor: "pointer", flex: 1 }}>
              <strong>{d.name}</strong>
              <span style={{ marginLeft: 8, fontSize: "0.8rem", color: "#666" }}>
                {d.language.toUpperCase()} · {d.card_count} cards
              </span>
            </div>
            <button className="btn-danger" style={{ fontSize: "0.8rem" }} onClick={() => remove(d.id)}>
              Deletar
            </button>
          </div>
        ))}
        {decks.length === 0 && <p style={{ color: "#888" }}>Nenhum deck ainda. Crie um!</p>}
      </div>
    </div>
  );
}
