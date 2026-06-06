import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { FloatImg, DECO_IMGS } from "../components/Decorations";

const OTHER_FLAGS = ["us", "jp", "es", "fr"];

export default function Register() {
  const [form, setForm]       = useState({ username: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 4) {
      setError("A senha precisa ter pelo menos 4 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap" style={{ position: "relative", overflow: "hidden" }}>

      {/* ── Fundo poluído ── */}
      <FloatImg src={DECO_IMGS.rainbow} size={58} delay={0}    style={{ position:"fixed", top:"4%",  left:"3%" }} />
      <FloatImg src={DECO_IMGS.star}    size={42} delay={0.5}  style={{ position:"fixed", top:"10%", left:"18%" }} />
      <FloatImg src={DECO_IMGS.globe}   size={50} delay={1.0}  style={{ position:"fixed", top:"3%",  right:"6%" }} />
      <FloatImg src={DECO_IMGS.balloon} size={46} delay={0.3}  style={{ position:"fixed", top:"16%", right:"18%" }} />
      <FloatImg src={DECO_IMGS.flower}  size={44} delay={1.3}  style={{ position:"fixed", top:"6%",  right:"30%" }} />
      <FloatImg src={DECO_IMGS.sun}     size={54} delay={0.8}  style={{ position:"fixed", top:"25%", left:"4%" }} />
      <FloatImg src={DECO_IMGS.sparkle} size={34} delay={0.2}  style={{ position:"fixed", top:"35%", left:"16%" }} />
      <FloatImg src={DECO_IMGS.book}    size={50} delay={1.5}  style={{ position:"fixed", top:"42%", right:"4%" }} />
      <FloatImg src={DECO_IMGS.music}   size={38} delay={0.7}  style={{ position:"fixed", top:"48%", right:"18%" }} />
      <FloatImg src={DECO_IMGS.heart}   size={40} delay={1.2}  style={{ position:"fixed", top:"55%", left:"6%" }} />
      <FloatImg src={DECO_IMGS.trophy}  size={48} delay={0.4}  style={{ position:"fixed", bottom:"25%", left:"3%" }} />
      <FloatImg src={DECO_IMGS.crown}   size={42} delay={1.7}  style={{ position:"fixed", bottom:"18%", left:"20%" }} />
      <FloatImg src={DECO_IMGS.ramen}   size={48} delay={0.9}  style={{ position:"fixed", bottom:"12%", right:"5%" }} />
      <FloatImg src={DECO_IMGS.diamond} size={36} delay={1.1}  style={{ position:"fixed", bottom:"20%", right:"22%" }} />
      <FloatImg src={DECO_IMGS.cloud}   size={52} delay={1.9}  style={{ position:"fixed", bottom:"8%",  left:"40%" }} />
      <FloatImg src={DECO_IMGS.pencil}  size={36} delay={0.6}  style={{ position:"fixed", bottom:"30%", right:"35%" }} />
      <FloatImg src={DECO_IMGS.medal}   size={40} delay={1.4}  style={{ position:"fixed", bottom:"5%",  left:"10%" }} />
      <FloatImg src={DECO_IMGS.moon}    size={44} delay={2.1}  style={{ position:"fixed", bottom:"15%", right:"40%" }} />
      <FloatImg src={DECO_IMGS.note}    size={38} delay={0.1}  style={{ position:"fixed", top:"70%",  left:"30%" }} />
      <FloatImg src={DECO_IMGS.book}    size={44} delay={1.6}  style={{ position:"fixed", top:"60%",  right:"30%" }} />

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
              style={{ borderRadius: 3, border: "1.5px solid #ccc", opacity: 0.75 }} />
          ))}
        </div>

        <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--coral)", marginBottom: 4 }}>
          Criar conta!
        </h1>
        <p style={{ color: "var(--muted)", fontWeight: 700, marginBottom: 24, fontSize: "0.95rem" }}>
          Vamos aprender idiomas juntos!
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input name="username" placeholder="Escolha um apelido"
            value={form.username} onChange={handle} required minLength={3} autoComplete="username" />
          <input name="password" type="password" placeholder="Crie uma senha"
            value={form.password} onChange={handle} required autoComplete="new-password" />

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn-coral" type="submit" disabled={loading}
            style={{ padding: "14px", fontSize: "1.1rem", marginTop: 4 }}>
            {loading ? <span className="spinner" /> : "Criar conta"}
          </button>
        </form>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
          <img src={DECO_IMGS.trophy}  alt="" width={24} />
          <img src={DECO_IMGS.star}    alt="" width={24} />
          <img src={DECO_IMGS.sparkle} alt="" width={24} />
          <img src={DECO_IMGS.medal}   alt="" width={24} />
        </div>

        <p style={{ textAlign: "center", marginTop: 16, color: "var(--muted)", fontWeight: 700 }}>
          Já tem conta?{" "}
          <Link to="/login" style={{ color: "var(--purple)", fontWeight: 900 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
