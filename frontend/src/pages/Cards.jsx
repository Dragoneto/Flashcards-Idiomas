import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Flag, IconTrash, IconVolume, IconArrowLeft } from "../components/Icons";

function speak(text, lang = "ko-KR") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
}

function Flashcard({ card, onDelete, deleting }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div style={{ position: "relative" }}>

      {/* Botão deletar */}
      <button
        className="btn-danger btn-sm"
        disabled={deleting}
        onClick={onDelete}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 10,
          display: "flex", alignItems: "center", gap: 4, padding: "5px 12px" }}
        title="Apagar card"
      >
        {deleting
          ? <span className="spinner" style={{ width: 12, height: 12 }} />
          : <IconTrash size={14} color="#fff" />}
      </button>

      {/* Flip */}
      <div className="flashcard" onClick={() => setFlipped(f => !f)} style={{ height: 170 }}>
        <div className={`flashcard-inner${flipped ? " flipped" : ""}`} style={{ height: 170 }}>

          {/* Frente — português */}
          <div className="flashcard-front">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Flag code="br" height={14} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)" }}>
                Português · toque para revelar
              </span>
            </div>
            <p style={{ fontSize: "1.6rem", fontWeight: 800 }}>{card.front}</p>
          </div>

          {/* Verso — coreano */}
          <div className="flashcard-back">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Flag code="kr" height={14} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--purple)" }}>
                Coreano
              </span>
            </div>

            {/* Hangul + botão de áudio */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--purple)" }}>
                {card.back}
              </span>
              <button
                className="btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); speak(card.back); }}
                title="Ouvir pronuncia"
              >
                <IconVolume size={16} color="var(--purple)" />
              </button>
            </div>

            {/* Guia silábico */}
            {card.syllable_guide && (
              <p style={{
                marginTop: 8,
                background: "rgba(124,58,237,0.12)",
                borderRadius: 999,
                padding: "4px 14px",
                display: "inline-block",
                color: "var(--purple)",
                fontWeight: 800,
                fontSize: "0.88rem",
                letterSpacing: "0.05em",
              }}>
                {card.syllable_guide}
              </p>
            )}

            {/* Romanização */}
            {card.romanization && (
              <p style={{ marginTop: 4, color: "var(--purple)", fontStyle: "italic",
                fontSize: "0.82rem", fontWeight: 600, opacity: 0.75 }}>
                {card.romanization}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Cards() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cards, setCards]         = useState([]);
  const [front, setFront]         = useState("");
  const [deckName, setDeckName]   = useState("Cards");
  const [creating, setCreating]   = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [formError, setFormError]   = useState("");

  const load = useCallback(async () => {
    setFetchError("");
    try {
      const { data } = await api.get(`/decks/${id}/cards`);
      setCards(data);
    } catch {
      setFetchError("Não foi possível carregar os cards.");
    }
  }, [id]);

  useEffect(() => {
    api.get("/decks")
      .then(({ data }) => {
        const deck = data.find(d => String(d.id) === String(id));
        if (deck) setDeckName(deck.name);
      })
      .catch(() => {});
    load();
  }, [id, load]);

  const create = async (e) => {
    e.preventDefault();
    if (!front.trim()) return;
    setCreating(true);
    setFormError("");
    try {
      await api.post(`/decks/${id}/cards`, { front: front.trim(), source_lang: "pt" });
      setFront("");
      await load();
    } catch {
      setFormError("Não foi possível criar o card.");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (cid) => {
    setDeleting(cid);
    try {
      await api.delete(`/cards/${cid}`);
      setCards(prev => prev.filter(c => c.id !== cid));
    } catch {
      setFormError("Não foi possível apagar o card.");
      setDeleting(null);
    }
  };

  return (
    <div className="page">

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24, width: "100%" }}>
        <button className="btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}
          onClick={() => navigate("/")}>
          <IconArrowLeft size={14} color="var(--purple)" /> Voltar
        </button>
        <Flag code="kr" height={36} />
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, marginTop: 10 }}>{deckName}</h1>
        <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.88rem", marginTop: 4 }}>
          {cards.length} card{cards.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Adicionar card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ fontWeight: 800, marginBottom: 12 }}>Adicionar palavra</p>
        <form onSubmit={create} style={{ display: "flex", gap: 8 }}>
          <input placeholder="Digite em português (ex: gato)"
            value={front} onChange={(e) => setFront(e.target.value)}
            required style={{ flex: 1 }} />
          <button className="btn-primary" type="submit" disabled={creating} style={{ flexShrink: 0 }}>
            {creating ? <span className="spinner" /> : "Adicionar"}
          </button>
        </form>
        {creating && (
          <p style={{ marginTop: 10, color: "var(--muted)", fontSize: "0.85rem", fontWeight: 600 }}>
            Traduzindo automaticamente...
          </p>
        )}
        {formError && <div className="alert alert-error" style={{ marginTop: 10 }}>{formError}</div>}
      </div>

      {/* Erro de carregamento */}
      {fetchError && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div className="alert alert-error" style={{ width: "100%" }}>{fetchError}</div>
          <button className="btn-secondary btn-sm" onClick={load}>Tentar novamente</button>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {cards.map((c) => (
          <Flashcard key={c.id} card={c}
            deleting={deleting === c.id}
            onDelete={() => remove(c.id)} />
        ))}
        {cards.length === 0 && !fetchError && (
          <div className="empty">
            <img src="https://cdn-icons-png.flaticon.com/128/2232/2232688.png"
              alt="Sem cards" width={80} style={{ marginBottom: 12, opacity: 0.55 }} />
            <p>Nenhum card ainda!<br />Digite uma palavra acima para traduzir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
