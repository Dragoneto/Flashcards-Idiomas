import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Flag, IconTrash, IconVolume, IconArrowLeft, LANG_FLAGS, LANG_NAMES } from "../components/Icons";
import { DECO_IMGS } from "../components/Decorations";
import { PageBackground } from "../components/PageBackground";

const LANG_TTS = { ko: "ko-KR", en: "en-US", ja: "ja-JP", es: "es-ES", fr: "fr-FR" };

const CARD_COLORS = [
  { front: "#FFF0F5", back: "linear-gradient(135deg,#FFD6E7,#FFACC7)", accent: "#CC3366" },
  { front: "#F0F4FF", back: "linear-gradient(135deg,#C7D7FF,#A5B8FF)", accent: "#3355CC" },
  { front: "#F0FFF4", back: "linear-gradient(135deg,#C7FFD8,#A5FFBE)", accent: "#1A8C42" },
  { front: "#FFFBF0", back: "linear-gradient(135deg,#FFE9A0,#FFD84D)", accent: "#8C6A00" },
  { front: "#F5F0FF", back: "linear-gradient(135deg,#DDD6FE,#C4B5FD)", accent: "#5B21B6" },
];

function speak(text, langCode = "ko") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = LANG_TTS[langCode] || "ko-KR";
  utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
}

function Flashcard({ card, index, deckLang, onDelete, deleting }) {
  const [flipped, setFlipped] = useState(false);
  const colors  = CARD_COLORS[index % CARD_COLORS.length];
  const flagCode = LANG_FLAGS[deckLang] || "kr";
  const langName = LANG_NAMES[deckLang] || deckLang;

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn-danger btn-sm"
        disabled={deleting}
        onClick={onDelete}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 10,
          display: "flex", alignItems: "center", gap: 4, padding: "5px 12px" }}
      >
        {deleting ? <span className="spinner" style={{ width: 12, height: 12 }} />
          : <IconTrash size={14} color="#fff" />}
      </button>

      <div className="flashcard" onClick={() => setFlipped(f => !f)} style={{ height: 190 }}>
        <div className={`flashcard-inner${flipped ? " flipped" : ""}`} style={{ height: 190 }}>

          {/* Frente */}
          <div className="flashcard-front" style={{ background: colors.front }}>
            {/* Tira colorida no topo */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8,
              background: colors.accent, borderRadius: "20px 20px 0 0" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10, marginTop: 4 }}>
              <Flag code="br" height={16} />
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted)" }}>
                Português · toque para revelar!
              </span>
            </div>
            <p style={{ fontSize: "1.7rem", fontWeight: 900, color: colors.accent }}>{card.front}</p>
            <p style={{ fontSize: "1.4rem", marginTop: 6, opacity: 0.35 }}>❓</p>
          </div>

          {/* Verso */}
          <div className="flashcard-back" style={{ background: colors.back }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8,
              background: colors.accent, borderRadius: "20px 20px 0 0" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, marginTop: 4 }}>
              <Flag code={flagCode} height={16} />
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: colors.accent }}>{langName}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: "2.4rem", fontWeight: 900, color: colors.accent }}>{card.back}</span>
              <button className="btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                  background: "#fff", border: `2px solid ${colors.accent}` }}
                onClick={(e) => { e.stopPropagation(); speak(card.back, deckLang); }}>
                <IconVolume size={16} color={colors.accent} />
              </button>
            </div>

            {card.syllable_guide && (
              <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 999,
                padding: "4px 14px", display: "inline-block", border: `2px solid ${colors.accent}`,
                color: colors.accent, fontWeight: 900, fontSize: "0.9rem",
                letterSpacing: "0.06em", marginBottom: 4 }}>
                {card.syllable_guide}
              </div>
            )}
            {card.romanization && (
              <p style={{ color: colors.accent, fontStyle: "italic",
                fontSize: "0.82rem", fontWeight: 700, opacity: 0.8 }}>
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
  const [cards, setCards]       = useState([]);
  const [front, setFront]       = useState("");
  const [deck, setDeck]         = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [formError, setFormError]   = useState("");

  const load = useCallback(async () => {
    setFetchError("");
    try {
      const { data } = await api.get(`/decks/${id}/cards`);
      setCards(data);
    } catch { setFetchError("Não foi possível carregar os cards."); }
  }, [id]);

  useEffect(() => {
    api.get("/decks").then(({ data }) => {
      const found = data.find(d => String(d.id) === String(id));
      if (found) setDeck(found);
    }).catch(() => {});
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
    } catch { setFormError("Não foi possível criar o card."); }
    finally { setCreating(false); }
  };

  const remove = async (cid) => {
    setDeleting(cid);
    try {
      await api.delete(`/cards/${cid}`);
      setCards(prev => prev.filter(c => c.id !== cid));
    } catch { setFormError("Não foi possível apagar o card."); }
    finally { setDeleting(null); }
  };

  const deckLang = deck?.language || "ko";
  const deckName = deck?.name || "Cards";

  return (
    <div className="page" style={{ position: "relative", zIndex: 1 }}>
      <PageBackground seed={1} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20, width: "100%" }}>

        <button className="btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}
          onClick={() => navigate("/")}>
          <IconArrowLeft size={14} /> Voltar
        </button>

        <div>
          <Flag code={LANG_FLAGS[deckLang] || "kr"} height={40} />
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, marginTop: 8, color: "var(--purple)" }}>
            {deckName}
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.88rem", marginTop: 4 }}>
            {LANG_NAMES[deckLang]} · {cards.length} card{cards.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Adicionar */}
      <div className="card" style={{ marginBottom: 24,
        background: "linear-gradient(135deg,#F3E8FF,#EDE9FE)" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
          <img src={DECO_IMGS.pencil} alt="" width={20} />
          <p style={{ fontWeight: 900, color: "var(--purple)" }}>Adicionar palavra</p>
        </div>
        <form onSubmit={create} style={{ display: "flex", gap: 8 }}>
          <input
            placeholder={`Em português → ${LANG_NAMES[deckLang] || deckLang}`}
            value={front} onChange={(e) => setFront(e.target.value)}
            required style={{ flex: 1 }} />
          <button className="btn-primary" type="submit" disabled={creating} style={{ flexShrink: 0 }}>
            {creating ? <span className="spinner" /> : "Adicionar"}
          </button>
        </form>
        {creating && (
          <p style={{ marginTop: 10, color: "var(--purple)", fontSize: "0.85rem", fontWeight: 700 }}>
            ✨ Traduzindo para {LANG_NAMES[deckLang]}...
          </p>
        )}
        {formError && <div className="alert alert-error" style={{ marginTop: 10 }}>{formError}</div>}
      </div>

      {fetchError && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div className="alert alert-error" style={{ width: "100%" }}>{fetchError}</div>
          <button className="btn-secondary btn-sm" onClick={load}>🔄 Tentar novamente</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {cards.map((c, i) => (
          <Flashcard key={c.id} card={c} index={i} deckLang={deckLang}
            deleting={deleting === c.id} onDelete={() => remove(c.id)} />
        ))}
        {cards.length === 0 && !fetchError && (
          <div className="empty">
            <img src="https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
              alt="Sem cards" width={90}
              style={{ marginBottom: 14, opacity: 0.65, animation: "float 3s ease-in-out infinite" }} />
            <p style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--purple)" }}>Nenhum card ainda!</p>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>
              Digite uma palavra acima para traduzir para {LANG_NAMES[deckLang]} 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
