import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Flag } from "../components/Icons";

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
    <div className="auth-wrap">
      <div className="auth-box">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Flag code="kr" height={40} />
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--purple)", marginTop: 12 }}>
            Criar conta
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 600, marginTop: 6 }}>
            Vamos aprender coreano juntos!
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input name="username" placeholder="Escolha um nome de usuário"
            value={form.username} onChange={handle} required minLength={3} autoComplete="username" />
          <input name="password" type="password" placeholder="Crie uma senha"
            value={form.password} onChange={handle} required autoComplete="new-password" />

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading}
            style={{ padding: "14px", fontSize: "1.05rem", marginTop: 4 }}>
            {loading ? <span className="spinner" /> : "Criar conta"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, color: "var(--muted)", fontWeight: 600 }}>
          Já tem conta?{" "}
          <Link to="/login" style={{ color: "var(--purple)", fontWeight: 800 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
