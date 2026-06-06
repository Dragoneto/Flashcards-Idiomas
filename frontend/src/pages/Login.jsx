import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { FloatImg, DECO_IMGS } from "../components/Decorations";

// All languages supported by the app
const OTHER_FLAGS = ["us", "jp", "es", "fr"];

export default function Login() {
  const [form, setForm]       = useState({ username: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Usuário ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap" style={{ position: "relative", overflow: "hidden" }}>

      {/* ── Fundo poluído de decorações ── */}
      <FloatImg src={DECO_IMGS.star}    size={44} delay={0}    style={{ position:"fixed", top:"5%",  left:"3%" }} />
      <FloatImg src={DECO_IMGS.book}    size={50} delay={0.4}  style={{ position:"fixed", top:"12%", left:"10%" }} />
      <FloatImg src={DECO_IMGS.globe}   size={52} delay={1.2}  style={{ position:"fixed", top:"3%",  left:"22%" }} />
      <FloatImg src={DECO_IMGS.rainbow} size={58} delay={0.7}  style={{ position:"fixed", top:"8%",  right:"5%" }} />
      <FloatImg src={DECO_IMGS.balloon} size={44} delay={0.2}  style={{ position:"fixed", top:"18%", right:"12%" }} />
      <FloatImg src={DECO_IMGS.sun}     size={56} delay={1.5}  style={{ position:"fixed", top:"2%",  right:"25%" }} />
      <FloatImg src={DECO_IMGS.heart}   size={38} delay={0.9}  style={{ position:"fixed", top:"30%", left:"2%" }} />
      <FloatImg src={DECO_IMGS.sparkle} size={36} delay={0.3}  style={{ position:"fixed", top:"38%", left:"14%" }} />
      <FloatImg src={DECO_IMGS.flower}  size={48} delay={1.1}  style={{ position:"fixed", top:"45%", right:"3%" }} />
      <FloatImg src={DECO_IMGS.music}   size={40} delay={0.6}  style={{ position:"fixed", top:"40%", right:"16%" }} />
      <FloatImg src={DECO_IMGS.trophy}  size={46} delay={1.8}  style={{ position:"fixed", bottom:"20%", left:"4%" }} />
      <FloatImg src={DECO_IMGS.crown}   size={44} delay={0.5}  style={{ position:"fixed", bottom:"15%", left:"18%" }} />
      <FloatImg src={DECO_IMGS.ramen}   size={50} delay={1.3}  style={{ position:"fixed", bottom:"10%", right:"6%" }} />
      <FloatImg src={DECO_IMGS.diamond} size={36} delay={0.8}  style={{ position:"fixed", bottom:"22%", right:"20%" }} />
      <FloatImg src={DECO_IMGS.moon}    size={42} delay={2.0}  style={{ position:"fixed", bottom:"5%",  left:"35%" }} />
      <FloatImg src={DECO_IMGS.cloud}   size={54} delay={1.6}  style={{ position:"fixed", bottom:"30%", right:"32%" }} />
      <FloatImg src={DECO_IMGS.pencil}  size={38} delay={0.1}  style={{ position:"fixed", bottom:"8%",  left:"8%" }} />
      <FloatImg src={DECO_IMGS.medal}   size={40} delay={1.0}  style={{ position:"fixed", bottom:"35%", left:"28%" }} />
      <FloatImg src={DECO_IMGS.note}    size={42} delay={1.4}  style={{ position:"fixed", top:"55%",  right:"28%" }} />
      <FloatImg src={DECO_IMGS.book}    size={46} delay={0.6}  style={{ position:"fixed", bottom:"18%", right:"42%" }} />

      {/* ── Card de login ── */}
      <div className="auth-box bounce-in" style={{ position: "relative", zIndex: 10 }}>

        {/* Bandeira coreana grande */}
        <div style={{ marginBottom: 8 }}>
          <img src="https://flagcdn.com/h80/kr.png" alt="Coreia do Sul"
            height={52} style={{ borderRadius: 6, border: "2.5px solid #2D3436",
              boxShadow: "3px 3px 0px rgba(0,0,0,0.15)" }} />
        </div>

        {/* Bandeiras dos outros idiomas menores */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          {OTHER_FLAGS.map(code => (
            <img key={code} src={`https://flagcdn.com/h40/${code}.png`}
              alt={code} height={18}
              style={{ borderRadius: 3, border: "1.5px solid #ccc",
                opacity: 0.75, transition: "opacity 0.2s" }}
              onMouseOver={e => e.target.style.opacity = 1}
              onMouseOut={e => e.target.style.opacity = 0.75} />
          ))}
        </div>

        <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--purple)", marginBottom: 4 }}>
          Flashcards Coreano
        </h1>
        <p style={{ color: "var(--muted)", fontWeight: 700, marginBottom: 24, fontSize: "0.95rem" }}>
          Bem-vindo de volta! Vamos estudar?
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input name="username" placeholder="Seu nome de usuário"
            value={form.username} onChange={handle} required autoComplete="username" />
          <input name="password" type="password" placeholder="Sua senha secreta"
            value={form.password} onChange={handle} required autoComplete="current-password" />

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading}
            style={{ padding: "14px", fontSize: "1.1rem", marginTop: 4 }}>
            {loading ? <span className="spinner" /> : "Entrar"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, color: "var(--muted)", fontWeight: 700 }}>
          Não tem conta?{" "}
          <Link to="/register" style={{ color: "var(--coral)", fontWeight: 900 }}>
            Cadastre-se grátis!
          </Link>
        </p>
      </div>
    </div>
  );
}
