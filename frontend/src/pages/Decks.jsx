import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Flag, IconTrash, IconLogout, IconSearch, LANG_FLAGS, LANG_NAMES } from "../components/Icons";

const DECK_COLORS = ["#EDE9FE", "#FEF3C7", "#D1FAE5", "#DBEAFE", "#FCE7F3"];

export default function Decks() {
  const [decks, setDecks]         = useState([]);
  const [name, setName]           = useState("");
  const [language, setLanguage]   = useState("ko");
  const [creating, setCreating]   = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [formError, setFormError]   = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setFetchError("");
    try {
      const { data } = await api.get("/decks");
      setDecks(data);
    } catch {
      setFetchError("Não foi possível carregar os decks.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setFormError("");
    try {
      await api.post("/decks", { name: name.trim(), language });
      setName("");
      await load();
    } catch {
      setFormError("Não foi possível criar o deck.");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Apagar este deck e todos os cards?")) return;
    setDeleting(id);
    try {
      await api.delete(`/decks/${id}`);
      setDecks(prev => prev.filter(d => d.id !== id));
    } catch {
      setFetchError("Não foi possível apagar o deck.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page">

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8, width: "100%" }}>
        <Flag code="kr" height={48} />
        <h1 style={{ fontSize: "1.9rem", marginTop: 10 }}>Meus Decks</h1>
        <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.88rem", marginTop: 4 }}>
          {decks.length} deck{decks.length !== 1 ? "s" : ""} criado{decks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        <Link to="/hangul">
          <button className="btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Flag code="kr" height={14} /> Hangul
          </button>
        </Link>
        <Link to="/phonetic">
          <button className="btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconSearch size={14} color="var(--purple)" /> O que ouvi?
          </button>
        </Link>
        <button className="btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
          <IconLogout size={14} color="var(--purple)" /> Sair
        </button>
      </div>

      {/* Criar deck */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ fontWeight: 800, marginBottom: 14 }}>Criar novo deck</p>
        <form onSubmit={create} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Nome do deck (ex: Séries coreanas)"
            value={name} onChange={(e) => setName(e.target.value)} required />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                style={{ paddingRight: 36 }}>
                {Object.entries(LANG_NAMES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                pointerEvents: "none", color: "var(--purple)", fontSize: "0.8rem" }}>▾</span>
            </div>
            <button className="btn-primary" type="submit" disabled={creating} style={{ flexShrink: 0 }}>
              {creating ? <span className="spinner" /> : "Criar"}
            </button>
          </div>
          {formError && <div className="alert alert-error">{formError}</div>}
        </form>
      </div>

      {/* Erro de carregamento */}
      {fetchError && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div className="alert alert-error" style={{ width: "100%" }}>{fetchError}</div>
          <button className="btn-secondary btn-sm" onClick={load}>Tentar novamente</button>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        {decks.map((d, i) => (
          <div key={d.id} className="deck-card"
            style={{ background: DECK_COLORS[i % DECK_COLORS.length] }}
            onClick={() => navigate(`/decks/${d.id}/cards`)}>

            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Flag code={LANG_FLAGS[d.language] || "kr"} height={22} />
            </div>

            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ fontWeight: 800, fontSize: "1rem" }}>{d.name}</p>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", fontWeight: 600, marginTop: 2 }}>
                {d.card_count} card{d.card_count !== 1 ? "s" : ""} · {LANG_NAMES[d.language] || d.language}
              </p>
            </div>

            <button className="btn-danger btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
              disabled={deleting === d.id}
              onClick={(e) => { e.stopPropagation(); remove(d.id); }}>
              {deleting === d.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <IconTrash size={15} color="#fff" />}
            </button>
          </div>
        ))}

        {decks.length === 0 && !fetchError && (
          <div className="empty">
            <img src="https://cdn-icons-png.flaticon.com/128/4076/4076549.png"
              alt="Sem decks" width={80} style={{ marginBottom: 12, opacity: 0.6 }} />
            <p>Você ainda não tem nenhum deck!<br />Crie um acima para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
