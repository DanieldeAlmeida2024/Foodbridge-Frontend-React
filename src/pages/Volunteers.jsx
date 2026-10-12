import { useEffect, useState } from "react";
import api from "../api/client";
import AppShell from "../components/layout/AppShell";

const emptyVolunteer = {
  nome: "",
  telefone: "",
  email: "",
  cpf: "",
  endereco: {
    linha1: "",
    linha2: "",
    numero: "",
    cep: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
  },
};

function message(err) {
  return err?.response?.data?.error || err?.response?.data?.mensagem || err?.message || "Erro ao processar";
}

function onlyDigits(value = "") {
  return value.replace(/\D/g, "");
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [visualQuery, setVisualQuery] = useState("");
  const [visualFormOpen, setVisualFormOpen] = useState(false);
  const [form, setForm] = useState(emptyVolunteer);
  const [editingId, setEditingId] = useState(null);
  const [linkingVolunteerId, setLinkingVolunteerId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/voluntarios");
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(message(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(name, value) {
    if (name === "cpf") {
      setEditingId(null);
      setLinkingVolunteerId(null);
    }

    if (name.startsWith("endereco.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, endereco: { ...prev.endereco, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleCpfBlur() {
    const cpf = onlyDigits(form.cpf);
    if (cpf.length !== 11) return;

    try {
      setError("");
      setNotice("");

      const { data } = await api.get(`/voluntarios/cpf/${cpf}`);
      const linkedVolunteer = volunteers.find((volunteer) => onlyDigits(volunteer.cpf) === cpf);

      setEditingId(linkedVolunteer?.id || null);
      setLinkingVolunteerId(linkedVolunteer ? null : data.id || null);
      setForm({
        ...emptyVolunteer,
        ...data,
        cpf: data.cpf || form.cpf,
        endereco: { ...emptyVolunteer.endereco, ...(data.endereco || {}) },
      });
      setNotice(
        linkedVolunteer
          ? "Voluntario ja vinculado. Os dados foram preenchidos para atualizacao."
          : "Voluntario encontrado. Salve para vincular a esta organizacao."
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        setEditingId(null);
        setLinkingVolunteerId(null);
        setNotice("");
        return;
      }

      setError(message(err));
    }
  }

  async function handleCepBlur() {
    const cep = onlyDigits(form.endereco.cep);
    if (cep.length !== 8) return;

    try {
      setCepLoading(true);
      setError("");

      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error("CEP invalido");
      }

      setForm((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          linha1: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
          pais: "Brasil",
        },
      }));
    } catch {
      setError("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setNotice("");

      if (editingId) {
        const { data } = await api.put(`/voluntarios/${editingId}`, form);
        if (data?.id) {
          setForm({ ...emptyVolunteer, ...data, endereco: { ...emptyVolunteer.endereco, ...(data.endereco || {}) } });
        }
        setNotice("Voluntario atualizado.");
      } else {
        const { data } = await api.post("/voluntarios", form);
        const nextId = data?.id || linkingVolunteerId;
        if (nextId) setEditingId(nextId);
        setLinkingVolunteerId(null);
        if (data) {
          setForm({ ...emptyVolunteer, ...data, endereco: { ...emptyVolunteer.endereco, ...(data.endereco || {}) } });
        }
        setNotice(linkingVolunteerId ? "Voluntario vinculado. A partir de agora use salvar alteracoes." : "Voluntario cadastrado.");
      }

      await load();
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  }

  async function deactivate(id) {
    try {
      await api.patch(`/voluntarios/${id}/desativar`);
      setNotice("Vinculo desativado.");
      await load();
    } catch (err) {
      setError(message(err));
    }
  }

  function edit(volunteer) {
    setEditingId(volunteer.id);
    setLinkingVolunteerId(null);
    setForm({ ...emptyVolunteer, ...volunteer, endereco: { ...emptyVolunteer.endereco, ...(volunteer.endereco || {}) } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm() {
    setEditingId(null);
    setLinkingVolunteerId(null);
    setForm(emptyVolunteer);
    setError("");
    setNotice("");
  }

  useEffect(() => { if (editingId !== null || linkingVolunteerId !== null) setVisualFormOpen(true); }, [editingId, linkingVolunteerId]);
  const visualVolunteers = volunteers.filter(item => [item.nome,item.email,item.telefone].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR").includes(visualQuery.toLocaleLowerCase("pt-BR")));
  return (
    <AppShell title="Voluntários" subtitle="Organize sua equipe e mantenha os contatos de coleta atualizados.">
      <div className="fb-toolbar"><label className="fb-search"><input aria-label="Buscar voluntários" placeholder="Buscar nome, e-mail ou telefone" value={visualQuery} onChange={e => setVisualQuery(e.target.value)}/></label><button className="fb-primary" type="button" onClick={() => { if (!visualFormOpen) clearForm(); setVisualFormOpen(open => !open); }}>{visualFormOpen ? "Fechar cadastro" : "+ Novo voluntário"}</button></div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

      {visualFormOpen && <form onSubmit={submit} className="fb-ui-section mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {editingId ? "Editar voluntario" : linkingVolunteerId ? "Vincular voluntario" : "Novo voluntario"}
              </h2>
              <p className="text-sm text-slate-500">Informe o CPF primeiro para recuperar um cadastro existente.</p>
            </div>

            {(editingId || linkingVolunteerId) && (
              <button type="button" onClick={clearForm} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Dados pessoais</h3>
              {editingId && <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Vinculado</span>}
              {linkingVolunteerId && <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Aguardando vinculo</span>}
            </div>

            <div className="grid gap-4 md:grid-cols-12">
              <Field label="CPF" className="md:col-span-3">
                <input
                  value={form.cpf || ""}
                  onChange={(e) => update("cpf", e.target.value)}
                  onBlur={handleCpfBlur}
                  placeholder="12345678909"
                  className={inputClass}
                />
              </Field>

              <Field label="Nome completo" className="md:col-span-5">
                <input value={form.nome || ""} onChange={(e) => update("nome", e.target.value)} placeholder="Nome do voluntario" className={inputClass} />
              </Field>

              <Field label="Telefone" className="md:col-span-2">
                <input value={form.telefone || ""} onChange={(e) => update("telefone", e.target.value)} placeholder="11999999999" className={inputClass} />
              </Field>

              <Field label="E-mail" className="md:col-span-2">
                <input value={form.email || ""} onChange={(e) => update("email", e.target.value)} placeholder="email@exemplo.com" className={inputClass} />
              </Field>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Endereco</h3>
              {cepLoading && <span className="text-xs font-semibold text-slate-500">Buscando CEP...</span>}
            </div>

            <div className="grid gap-4 md:grid-cols-12">
              <Field label="CEP" className="md:col-span-3">
                <input
                  value={form.endereco.cep || ""}
                  onChange={(e) => update("endereco.cep", e.target.value)}
                  onBlur={handleCepBlur}
                  placeholder="01001000"
                  className={inputClass}
                />
              </Field>

              <Field label="Rua" className="md:col-span-6">
                <input value={form.endereco.linha1 || ""} onChange={(e) => update("endereco.linha1", e.target.value)} placeholder="Rua, avenida ou estrada" className={inputClass} />
              </Field>

              <Field label="Numero" className="md:col-span-3">
                <input value={form.endereco.numero || ""} onChange={(e) => update("endereco.numero", e.target.value)} placeholder="123" className={inputClass} />
              </Field>

              <Field label="Complemento" className="md:col-span-4">
                <input value={form.endereco.linha2 || ""} onChange={(e) => update("endereco.linha2", e.target.value)} placeholder="Apto, bloco, referencia" className={inputClass} />
              </Field>

              <Field label="Bairro" className="md:col-span-3">
                <input value={form.endereco.bairro || ""} onChange={(e) => update("endereco.bairro", e.target.value)} placeholder="Bairro" className={inputClass} />
              </Field>

              <Field label="Cidade" className="md:col-span-3">
                <input value={form.endereco.cidade || ""} onChange={(e) => update("endereco.cidade", e.target.value)} placeholder="Cidade" className={inputClass} />
              </Field>

              <Field label="UF" className="md:col-span-2">
                <input value={form.endereco.estado || ""} onChange={(e) => update("endereco.estado", e.target.value)} placeholder="SP" className={inputClass} />
              </Field>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={clearForm} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Limpar
            </button>
            <button disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300">
              {loading ? "Salvando..." : editingId ? "Salvar alteracoes" : linkingVolunteerId ? "Vincular voluntario" : "Cadastrar voluntario"}
            </button>
          </div>
        </div>
      </form>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visualVolunteers.map((volunteer) => (
          <article key={volunteer.id} className="fb-profile-card">
            <h3 className="text-lg font-bold">{volunteer.nome}</h3>
            <p className="mt-1 text-sm text-slate-500">{volunteer.email}</p>
            <p className="text-sm text-slate-500">{volunteer.telefone}</p>
            <p className="mt-3 text-sm text-slate-600">{[volunteer.endereco?.linha1, volunteer.endereco?.numero, volunteer.endereco?.cidade].filter(Boolean).join(", ")}</p>
            <div className="fb-button-row">
              <button onClick={() => { edit(volunteer); setVisualFormOpen(true); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">Editar</button>
              <button onClick={() => deactivate(volunteer.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Desativar</button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
