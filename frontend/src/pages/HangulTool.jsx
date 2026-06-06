import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Flag, IconArrowLeft } from "../components/Icons";

const EXAMPLES = [
  { latin: "annyeong",     hangul: "안녕" },
  { latin: "hanguk",       hangul: "한국" },
  { latin: "saranghae",    hangul: "사랑해" },
  { latin: "gamsahamnida", hangul: "감사합니다" },
];

export default function HangulTool() {
  const [input, setInput]     = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const convert = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.post("/translate/hangul", { text: input.trim() });
      setResult(data);
    } catch {
      setError("Não foi possível converter. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      <div style={{ textAlign: "center", marginBottom: 24, width: "100%" }}>
        <Link to="/">
          <button className="btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <IconArrowLeft size={14} color="var(--purple)" /> Voltar
          </button>
        </Link>
        <Flag code="kr" height={42} />
        <h1 style={{ fontSize: "1.6rem", marginTop: 10 }}>Romanização para Hangul</h1>
        <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.88rem", marginTop: 4 }}>
          Digite a pronúncia e veja em coreano
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={convert} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Ex: annyeong" value={input}
            onChange={(e) => setInput(e.target.value)} required />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Converter"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {result && (
        <div className="card" style={{ marginBottom: 20, background: "var(--purple-l)" }}>
          <p style={{ color: "var(--purple)", fontSize: "0.85rem", fontWeight: 700, marginBottom: 8 }}>
            Você digitou: <strong>{result.original}</strong>
          </p>
          <p style={{ fontSize: "4rem", fontWeight: 900, color: "var(--purple)", lineHeight: 1.1 }}>
            {result.hangul}
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.76rem", fontWeight: 600, marginTop: 10 }}>
            via Google Input Tools
          </p>
        </div>
      )}

      <div className="card">
        <p style={{ fontWeight: 800, marginBottom: 14 }}>Exemplos — clique para testar:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {EXAMPLES.map(({ latin, hangul }) => (
            <button key={latin} className="btn-secondary"
              style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", borderRadius: 12, padding: "10px 18px" }}
              onClick={() => setInput(latin)}>
              <code style={{ fontWeight: 800, color: "var(--purple)" }}>{latin}</code>
              <span style={{ fontSize: "1.4rem" }}>{hangul}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
