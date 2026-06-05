import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao cadastrar");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div className="card" style={{ width: 340 }}>
        <h2 style={{ marginBottom: 20 }}>Criar conta</h2>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input name="username" placeholder="Usuário" value={form.username} onChange={handle} required />
          <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handle} required />
          {error && <p style={{ color: "red", fontSize: "0.85rem" }}>{error}</p>}
          <button className="btn-primary" type="submit">Cadastrar</button>
          <p style={{ textAlign: "center", fontSize: "0.85rem" }}>
            Já tem conta? <Link to="/login" style={{ color: "#4f46e5" }}>Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
