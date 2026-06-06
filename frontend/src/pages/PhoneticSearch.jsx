import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Flag, IconVolume, IconArrowLeft } from "../components/Icons";
import { PageBackground } from "../components/PageBackground";

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "ko-KR"; utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
}

export default function PhoneticSearch() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const search = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setResults(null);
    try {
      const { data } = await api.post("/translate/phonetic-search", { text: query.trim() });
      setResults(data);
    } catch { setError("Não foi possível buscar. Verifique sua conexão."); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ position: "relative", zIndex: 1 }}>
      <PageBackground seed={3} />
      <div style={{ textAlign: "center", marginBottom: 20, width: "100%" }}>

        <Link to="/">
          <button className="btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <IconArrowLeft size={14} /> Voltar
          </button>
        </Link>
        <div>
          <img src="https://cdn-icons-png.flaticon.com/512/4043/4043603.png"
            alt="Ouvir" width={70}
            style={{ animation: "float 3s ease-in-out infinite", marginBottom: 8 }} />
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--orange)" }}>
            O que eu ouvi?
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.88rem", marginTop: 4 }}>
            Assistindo uma série? Escreva como soa!
          </p>
        </div>
      </div>

      {/* Aviso */}
      <div style={{ background: "#FFF7E6", border: "2.5px solid #FF9F43",
        borderRadius: 14, padding: "10px 16px", marginBottom: 12,
        boxShadow: "3px 3px 0px #FF9F43", fontWeight: 800, fontSize: "0.88rem",
        color: "#8C5A00", textAlign: "center", width: "100%" }}>
        Busca exclusiva para o idioma{" "}
        <Flag code="kr" height={14} />{" "}
        <strong>Coreano</strong>
      </div>

      {/* Dica */}
      <div style={{ background: "#FFFBEB", border: "2.5px solid #FFD93D",
        borderRadius: 14, padding: "10px 16px", marginBottom: 20,
        boxShadow: "3px 3px 0px #FFD93D", fontSize: "0.85rem", fontWeight: 700,
        color: "#854D0E", textAlign: "center", width: "100%" }}>
        Escreva como você acha que soa!<br />
        <span style={{ fontWeight: 600, opacity: 0.8 }}>Ex: "anyong", "saranghae", "oppa"</span>
      </div>

      <div className="card" style={{ marginBottom: 20,
        background: "linear-gradient(135deg,#FFF7ED,#FFEDD5)" }}>
        <form onSubmit={search} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Ex: anyong, saranghae, aigoo..."
            value={query} onChange={(e) => setQuery(e.target.value)} required />
          <button className="btn-yellow" type="submit" disabled={loading}>
            {loading ? <span className="spinner spinner-dark" /> : "Buscar"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {results && results.results.length === 0 && (
        <div className="empty">
          <img src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png"
            alt="Sem resultado" width={80}
            style={{ marginBottom: 14, opacity: 0.6, animation: "float 3s ease-in-out infinite" }} />
          <p style={{ fontWeight: 900, fontSize: "1.05rem" }}>
            Nenhuma alternativa para "{results.query}"
          </p>
          <p style={{ color: "var(--muted)", marginTop: 4 }}>Tente escrever de outro jeito!</p>
        </div>
      )}

      {results && results.results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          <p style={{ textAlign: "center", color: "var(--muted)", fontWeight: 800, fontSize: "0.88rem" }}>
            {results.results.length} alternativa{results.results.length > 1 ? "s" : ""} para{" "}
            <strong>"{results.query}"</strong>
          </p>

          {results.results.map((r, i) => (
            <div key={i} className="card" style={{
              background: i === 0 ? "linear-gradient(135deg,#FFF7ED,#FFEDD5)" : "var(--white)",
              border: `2.5px solid ${i === 0 ? "#FF9F43" : "#D1D5DB"}`,
              boxShadow: i === 0 ? "5px 5px 0px #FF9F43" : "var(--shadow)",
              position: "relative",
            }}>
              {i === 0 && (
                <span className="badge badge-yellow"
                  style={{ position: "absolute", top: 12, right: 12 }}>
                  mais provável
                </span>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: "2.6rem", fontWeight: 900,
                  color: i === 0 ? "#CC7700" : "var(--purple)" }}>
                  {r.hangul}
                </span>
                <button className="btn-secondary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                  onClick={() => speak(r.hangul)}>
                  <IconVolume size={16} color={i === 0 ? "#CC7700" : "var(--purple)"} />
                </button>
              </div>

              {r.romanization && (
                <p style={{ color: i === 0 ? "#CC7700" : "var(--purple)", fontStyle: "italic",
                  fontWeight: 800, fontSize: "0.95rem", marginBottom: 6 }}>
                  {r.romanization}
                </p>
              )}

              {r.translation ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#F0FFF4", border: "2px solid #16A34A",
                  borderRadius: 999, padding: "4px 14px" }}>
                  <Flag code={r.trans_lang === "en" ? "us" : "br"} height={14} />
                  <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#16A34A" }}>
                    {r.translation}
                  </span>
                  {r.trans_lang === "en" && (
                    <span style={{ fontSize: "0.72rem", color: "#6B7280" }}>(inglês)</span>
                  )}
                </div>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", fontWeight: 700 }}>
                  Tradução não encontrada
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
