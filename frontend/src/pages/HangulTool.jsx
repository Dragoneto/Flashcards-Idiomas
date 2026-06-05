import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const EXAMPLES = [
  { latin: "annyeong", hangul: "안녕" },
  { latin: "hanguk", hangul: "한국" },
  { latin: "saranghae", hangul: "사랑해" },
  { latin: "gamsahamnida", hangul: "감사합니다" },
];

export default function HangulTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const convert = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/translate/hangul", { text: input });
      setResult(data);
    } catch {
      setResult({ error: "Erro ao converter. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link to="/"><button className="btn-secondary">← Voltar</button></Link>
        <h1>🇰🇷 Romanização → Hangul</h1>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: "0.88rem", color: "#555", marginBottom: 14 }}>
          Digite a pronúncia em letras latinas e converta para Hangul via{" "}
          <strong>Google Input Tools</strong>.
        </p>
        <form onSubmit={convert} style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Ex: annyeong"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "..." : "Converter"}
          </button>
        </form>
      </div>

      {result && (
        <div className="card" style={{ marginBottom: 16 }}>
          {result.error ? (
            <p style={{ color: "red" }}>{result.error}</p>
          ) : (
            <>
              <p style={{ fontSize: "0.82rem", color: "#888" }}>Romanização:</p>
              <p style={{ fontFamily: "monospace", marginBottom: 10 }}>{result.original}</p>
              <p style={{ fontSize: "0.82rem", color: "#888" }}>Hangul (Google Input Tools):</p>
              <p style={{ fontSize: "2.2rem", color: "#4f46e5", lineHeight: 1.2 }}>{result.hangul}</p>
            </>
          )}
        </div>
      )}

      <div className="card" style={{ fontSize: "0.84rem", color: "#555" }}>
        <strong>Exemplos:</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {EXAMPLES.map(({ latin, hangul }) => (
            <div key={latin} style={{ display: "flex", justifyContent: "space-between",
              background: "#f9f9f9", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
              onClick={() => setInput(latin)}>
              <code>{latin}</code>
              <span style={{ color: "#4f46e5", fontSize: "1rem" }}>{hangul}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
