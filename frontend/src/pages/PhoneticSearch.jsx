import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Flag, IconVolume, IconArrowLeft } from "../components/Icons";

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "ko-KR";
  utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
}

export default function PhoneticSearch() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const { data } = await api.post("/translate/phonetic-search", { text: query.trim() });
      setResults(data);
    } catch {
      setError("Não foi possível buscar. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24, width: "100%" }}>
        <Link to="/">
          <button className="btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <IconArrowLeft size={14} color="var(--purple)" /> Voltar
          </button>
        </Link>
        <img src="https://cdn-icons-png.flaticon.com/128/4043/4043603.png"
          alt="Ouvir" width={52} style={{ marginBottom: 10 }} />
        <h1 style={{ fontSize: "1.6rem" }}>O que eu ouvi?</h1>
        <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.88rem", marginTop: 4 }}>
          Assistindo uma série? Escreva como soa e descubra!
        </p>
      </div>

      {/* Aviso de idioma */}
      <div className="alert alert-info" style={{ marginBottom: 12 }}>
        Esta busca é exclusiva para palavras em <strong>coreano</strong>.
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 6 }}>
          <Flag code="kr" height={13} />
        </div>
      </div>

      {/* Dica de uso */}
      <div style={{
        background: "var(--yellow-l)", borderRadius: 12, padding: "10px 16px",
        fontSize: "0.85rem", fontWeight: 600, color: "#92400E", marginBottom: 20, textAlign: "center"
      }}>
        Escreva como você acha que soa — do jeito que quiser!<br />
        <span style={{ fontWeight: 400 }}>Ex: "anyong", "saranghae", "oppa"</span>
      </div>

      {/* Input */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={search} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="Ex: anyong, saranghae, aigoo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button className="btn-yellow" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Buscar"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Sem resultados */}
      {results && results.results.length === 0 && (
        <div className="empty">
          <img src="https://cdn-icons-png.flaticon.com/128/6598/6598519.png"
            alt="Sem resultado" width={70} style={{ marginBottom: 12, opacity: 0.55 }} />
          <p>Nenhuma alternativa para <strong>"{results.query}"</strong>.<br />Tente escrever de outro jeito!</p>
        </div>
      )}

      {/* Resultados */}
      {results && results.results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <p style={{ textAlign: "center", color: "var(--muted)", fontWeight: 700, fontSize: "0.88rem" }}>
            {results.results.length} alternativa{results.results.length > 1 ? "s" : ""} para{" "}
            <strong>"{results.query}"</strong>
          </p>

          {results.results.map((r, i) => (
            <div key={i} className="card"
              style={{ border: `2.5px solid ${i === 0 ? "var(--purple)" : "var(--purple-l)"}`, position: "relative" }}>

              {i === 0 && (
                <span className="badge badge-purple" style={{ position: "absolute", top: 12, right: 12 }}>
                  mais provável
                </span>
              )}

              {/* Hangul + áudio */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--purple)" }}>{r.hangul}</span>
                <button className="btn-secondary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                  onClick={() => speak(r.hangul)} title="Ouvir">
                  <IconVolume size={16} color="var(--purple)" />
                </button>
              </div>

              {/* Romanização */}
              {r.romanization && (
                <p style={{ color: "var(--purple)", fontStyle: "italic", fontWeight: 700,
                  fontSize: "0.92rem", marginBottom: 6 }}>
                  {r.romanization}
                </p>
              )}

              {/* Tradução */}
              {r.translation ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--green-l)", borderRadius: 999, padding: "5px 14px" }}>
                  <Flag code={r.trans_lang === "en" ? "us" : "br"} height={14} />
                  <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#065F46" }}>
                    {r.translation}
                  </span>
                  {r.trans_lang === "en" && (
                    <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 600 }}>(inglês)</span>
                  )}
                </div>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", fontWeight: 600 }}>
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
