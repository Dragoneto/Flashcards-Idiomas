import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Flag, IconArrowLeft } from "../components/Icons";
import { PageBackground } from "../components/PageBackground";

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
    setLoading(true); setError(""); setResult(null);
    try {
      const { data } = await api.post("/translate/hangul", { text: input.trim() });
      setResult(data);
    } catch { setError("Não foi possível converter. Verifique sua conexão."); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ position: "relative", zIndex: 1 }}>
      <PageBackground seed={2} />
      <div style={{ textAlign: "center", marginBottom: 24, width: "100%" }}>

        <Link to="/">
          <button className="btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <IconArrowLeft size={14} /> Voltar
          </button>
        </Link>
        <div>
          <img src="https://cdn-icons-png.flaticon.com/512/3898/3898070.png"
            alt="Hangul" width={70}
            style={{ animation: "float 3s ease-in-out infinite", marginBottom: 8 }} />
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--teal)" }}>
            Romanização para Hangul
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.88rem", marginTop: 4 }}>
            Digite a pronúncia e veja em coreano!
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg,#E0FDFA,#CCFBF1)" }}>
        <form onSubmit={convert} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Ex: annyeong" value={input}
            onChange={(e) => setInput(e.target.value)} required />
          <button className="btn-teal" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Converter"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {result && (
        <div className="card" style={{ marginBottom: 20,
          background: "linear-gradient(135deg,#CCFBF1,#99F6E4)", border: "2.5px solid #2D9E97" }}>
          <p style={{ color: "#0F766E", fontSize: "0.88rem", fontWeight: 800, marginBottom: 8 }}>
            Você digitou: <strong>{result.original}</strong>
          </p>
          <p style={{ fontSize: "4rem", fontWeight: 900, color: "#0F766E", lineHeight: 1 }}>
            {result.hangul}
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.76rem", fontWeight: 700, marginTop: 10 }}>
            via Google Input Tools
          </p>
        </div>
      )}

      <div className="card">
        <p style={{ fontWeight: 900, marginBottom: 14, color: "var(--teal)" }}>
          Exemplos — clique para testar:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {EXAMPLES.map(({ latin, hangul }) => (
            <button key={latin}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                borderRadius: 14, padding: "12px 18px", background: "#F0FDFA",
                border: "2.5px solid #2D9E97", boxShadow: "3px 3px 0px #2D9E97",
                cursor: "pointer", fontFamily: "inherit", fontWeight: 800 }}
              onClick={() => setInput(latin)}>
              <code style={{ fontWeight: 900, color: "#0F766E" }}>{latin}</code>
              <span style={{ fontSize: "1.5rem", color: "#0F766E" }}>{hangul}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
