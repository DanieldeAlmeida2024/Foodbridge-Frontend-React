import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";

type ProfileData = { nome: string; email: string; status: string };
type ApiError = { response?: { data?: { mensagem?: string; error?: string } } };

export default function Profile() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function errorMessage(error: unknown) {
    const response = (error as ApiError).response?.data;
    return response?.mensagem || response?.error || "Não foi possível concluir. Tente novamente.";
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data } = await api.get<ProfileData>("/usuarios/me");
        if (active) setForm({ nome: data.nome || "", email: data.email || "", senha: "" });
      } catch (error) {
        if (active) setError(errorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.nome.trim() || !form.email.trim()) {
      setError("Informe seu nome e e-mail.");
      return;
    }
    setSaving(true);
    try {
      const body = { nome: form.nome.trim(), email: form.email.trim(),
        ...(form.senha ? { senha: form.senha } : {}) };
      const { data } = await api.put<ProfileData>("/usuarios/me", body);
      if (auth?.user) auth.loginTemp({ ...auth.user, nome: data.nome, email: data.email });
      setForm(current => ({ ...current, senha: "" }));
      setMessage("Perfil atualizado.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function removeAccount() {
    if (!window.confirm("Excluir sua conta e seus vínculos? Esta ação é permanente.")) return;
    setSaving(true);
    setError("");
    try {
      await api.delete("/usuarios/me");
      auth?.logout();
      navigate("/", { replace: true });
    } catch (error) {
      setError(errorMessage(error));
      setSaving(false);
    }
  }

  return (
    <AppShell title="Meu perfil" subtitle="Atualize seus dados e mantenha sua conta em dia.">
      {error && <p role="alert" className="fb-alert-error">{error}</p>}
      {message && <p role="status" className="fb-alert-success">{message}</p>}
      {loading ? <p>Carregando perfil...</p> : (
        <form onSubmit={save} className="ref-panel flex flex-col gap-5 max-w-xl">
          <label className="flex flex-col gap-2">
            <span>Nome</span>
            <input className="fb-input" autoComplete="name" value={form.nome} required
              onChange={event => setForm(current => ({ ...current, nome: event.target.value }))} />
          </label>
          <label className="flex flex-col gap-2">
            <span>E-mail</span>
            <input className="fb-input" type="email" autoComplete="email" value={form.email} required
              onChange={event => setForm(current => ({ ...current, email: event.target.value }))} />
          </label>
          <label className="flex flex-col gap-2">
            <span>Nova senha</span>
            <input className="fb-input" type="password" autoComplete="new-password" value={form.senha}
              onChange={event => setForm(current => ({ ...current, senha: event.target.value }))} />
            <small>Deixe em branco para manter a senha atual.</small>
          </label>
          <button type="submit" className="fb-primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      )}
      {!loading && <section className="ref-panel mt-6 max-w-xl">
        <h2>Excluir conta</h2>
        <p className="fb-muted">Seus vínculos serão removidos. Os registros das organizações serão preservados.</p>
        <button className="fb-secondary mt-4" type="button" disabled={saving} onClick={removeAccount}>Excluir minha conta</button>
      </section>}
    </AppShell>
  );
}
