import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Flag, IconTrash, IconLogout, IconSearch, LANG_FLAGS, LANG_NAMES } from "../components/Icons";
import { DECO_IMGS } from "../components/Decorations";
import { PageBackground } from "../components/PageBackground";

const DECK_STYLES = [
  { bg: "#FFE0E0", accent: "#FF6B6B", border: "#CC4444" },
  { bg: "#FFF3CD", accent: "#FFD93D", border: "#B8960A" },
  { bg: "#D4EDDA", accent: "#6BCB77", border: "#3E9947" },
  { bg: "#D1ECF1", accent: "#4ECDC4", border: "#2D9E97" },
  { bg: "#E8D5FF", accent: "#7C3AED", border: "#5B21B6" },
];

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
    <div className="page" style={{ position: "relative", zIndex: 1 }}>
      <PageBackground seed={0} />

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 20, width: "100%" }}>

        <img
          src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
          alt="Estudante"
          width={80}
          style={{ animation: "float 3s ease-in-out infinite", marginBottom: 8 }}
        />
        <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--purple)" }}>
          Meus Decks
        </h1>
        <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.9rem", marginTop: 4 }}>
          {decks.length} deck{decks.length !== 1 ? "s" : ""} · Vamos estudar! 💪
        </p>
      </div>

      {/* ── Nav ── */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <Link to="/hangul">
          <button className="btn-teal btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Flag code="kr" height={13} /> Hangul
          </button>
        </Link>
        <Link to="/phonetic">
          <button className="btn-yellow btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <IconSearch size={13} color="var(--dark)" /> O que ouvi?
          </button>
        </Link>
        <button className="btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 5 }}
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
          <IconLogout size={13} /> Sair
        </button>
      </div>

      {/* ── Criar deck ── */}
      <div className="card" style={{ marginBottom: 24, background: "linear-gradient(135deg, #F3E8FF, #EDE9FE)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 12 }}>
          <img src={DECO_IMGS.pencil} alt="" width={22} />
          <p style={{ fontWeight: 900, fontSize: "1.05rem", color: "var(--purple)" }}>Criar novo deck</p>
        </div>
        <form onSubmit={create} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Nome do deck (ex: Séries coreanas)"
            value={name} onChange={(e) => setName(e.target.value)} required />
          <div style={{ display: "flex", gap: 8 }}>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ flex: 1 }}>
              {Object.entries(LANG_NAMES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button className="btn-primary" type="submit" disabled={creating} style={{ flexShrink: 0, display:"flex", alignItems:"center", gap:6 }}>
              {creating ? <span className="spinner" /> : <><img src={DECO_IMGS.rocket} alt="" width={16} /> Criar</>}
            </button>
          </div>
          {formError && <div className="alert alert-error">{formError}</div>}
        </form>
      </div>

      {fetchError && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div className="alert alert-error" style={{ width: "100%" }}>{fetchError}</div>
          <button className="btn-secondary btn-sm" onClick={load}>🔄 Tentar novamente</button>
        </div>
      )}

      {/* ── Lista ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
        {decks.map((d, i) => {
          const style = DECK_STYLES[i % DECK_STYLES.length];
          return (
            <div key={d.id} className="deck-card"
              style={{ background: style.bg, borderColor: style.border }}
              onClick={() => navigate(`/decks/${d.id}/cards`)}>

              {/* Ícone da bandeira */}
              <div style={{ width: 52, height: 52, borderRadius: 14,
                background: "#fff", border: `2.5px solid ${style.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxShadow: "3px 3px 0px rgba(0,0,0,0.12)" }}>
                <Flag code={LANG_FLAGS[d.language] || "kr"} height={24} />
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: "1.05rem", color: style.border }}>{d.name}</p>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", fontWeight: 700, marginTop: 2 }}>
                  {d.card_count} card{d.card_count !== 1 ? "s" : ""} · {LANG_NAMES[d.language] || d.language}
                </p>
              </div>

              <button className="btn-danger btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
                disabled={deleting === d.id}
                onClick={(e) => { e.stopPropagation(); remove(d.id); }}>
                {deleting === d.id
                  ? <span className="spinner" style={{ width: 14, height: 14 }} />
                  : <IconTrash size={14} color="#fff" />}
              </button>
            </div>
          );
        })}

        {decks.length === 0 && !fetchError && (
          <div className="empty">
            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="Sem decks" width={90}
              style={{ marginBottom: 14, opacity: 0.7, animation: "float 3s ease-in-out infinite" }} />
            <p style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--purple)" }}>
              Nenhum deck ainda!
            </p>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>
              Crie um deck acima para começar a aprender 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
