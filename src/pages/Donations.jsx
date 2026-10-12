import Icon from "../components/ui/Icon";
import { useEffect, useState } from "react";
import api from "../api/client";
import AppShell from "../components/layout/AppShell";

const emptyDonation = {
  tipoComida: "FRUTAS",
  descricaoComida: "",
  quantidade: "",
  unidade: "KG",
  dataExpiracao: "",
  status: "PUBLICADO",
  janelasDisponiveis: [{ inicio: "", fim: "" }],
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
  organizacao: null,
};

const foodTypes = ["VEGETAIS", "FRUTAS", "GRAOS", "LATICINIO", "CARNE", "COMIDA_PREPARADA", "PADARIA", "BEBIDAS", "OUTROS"];
const units = ["KG", "LITRO", "UNIDADE", "CAIXA", "LOTE"];
const statuses = ["RASCUNHO", "PUBLICADO", "DISPONIVEL", "CANCELADO"];

function msg(err) {
  return err?.response?.data?.error || err?.response?.data?.mensagem || err?.message || "Erro ao processar";
}

function role() {
  const selected = JSON.parse(localStorage.getItem("selectedOrganization") || "{}");
  return localStorage.getItem("role") || selected.role || "";
}

function onlyDigits(value = "") {
  return value.replace(/\D/g, "");
}

function getDonationId(item) {
  return item?.id || item?.doacaoId || item?.doacao?.id || null;
}

function isRequestableDonation(item) {
  return ["PUBLICADO", "DISPONIVEL", "PARCIALMENTE_REIVINDICADO"].includes(item?.status);
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

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [visualQuery, setVisualQuery] = useState("");
  const [visualCategory, setVisualCategory] = useState("");
  const [visualFormOpen, setVisualFormOpen] = useState(false);
  const [form, setForm] = useState(emptyDonation);
  const [editingId, setEditingId] = useState(null);
  const [requestingDonation, setRequestingDonation] = useState(null);
  const [request, setRequest] = useState({ quantidadeSolicitada: "", observacao: "" });
  const [requestError, setRequestError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const isOng = role() === "ONG";
  // Estado de exibição: não modifica os dados enviados ao backend.
  useEffect(() => { if (editingId !== null) setVisualFormOpen(true); }, [editingId]);
  const visualDonations = donations.filter(item => (!visualCategory || item.tipoComida === visualCategory) &&
    [item.descricaoComida, item.tipoComida, item.endereco?.cidade].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR").includes(visualQuery.toLocaleLowerCase("pt-BR")));
  const categoryImage = (type) => ({FRUTAS:"frutas",VEGETAIS:"vegetais",PADARIA:"padaria",GRAOS:"mantimentos",LATICINIO:"mantimentos",CARNE:"mantimentos",COMIDA_PREPARADA:"doacao-alimentos",BEBIDAS:"mantimentos"}[type] || "doacao-alimentos");


  async function getDonationsForRole() {
    if (!isOng) {
      const { data } = await api.get("/doacoes");
      return Array.isArray(data) ? data : [];
    }

    const endpoints = ["/doacoes/disponiveis", "/doacoes/publicadas", "/doacoes"];
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const { data } = await api.get(endpoint);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        lastError = err;
        if (err?.response?.status && ![404, 405].includes(err.response.status)) {
          throw err;
        }
      }
    }

    throw lastError;
  }

  async function load() {
    try {
      const data = await getDonationsForRole();
      setDonations(data);
    } catch (err) {
      setError(msg(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(name, value) {
    if (name.startsWith("endereco.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, endereco: { ...prev.endereco, [key]: value } }));
    } else if (name.startsWith("janela.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, janelasDisponiveis: [{ ...prev.janelasDisponiveis[0], [key]: value }] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function edit(item) {
    setEditingId(item.id || item.doacaoId || null);
    setForm({
      ...emptyDonation,
      ...item,
      quantidade: item.quantidade || "",
      janelasDisponiveis: item.janelasDisponiveis?.length ? item.janelasDisponiveis : emptyDonation.janelasDisponiveis,
      endereco: { ...emptyDonation.endereco, ...(item.endereco || {}) },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm() {
    setForm(emptyDonation);
    setEditingId(null);
    setError("");
    setNotice("");
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

      const payload = { ...form, quantidade: Number(form.quantidade), organizacao: null };
      if (editingId) {
        await api.put(`/doacoes/${editingId}`, payload);
        setNotice("Doacao atualizada.");
      } else {
        await api.post("/doacoes", payload);
        setNotice("Doacao criada.");
      }
      setForm(emptyDonation);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(msg(err));
    } finally {
      setLoading(false);
    }
  }

  async function remove(item) {
    const id = getDonationId(item);
    if (!id) return;
    try {
      await api.delete(`/doacoes/${id}`);
      setNotice("Doacao removida.");
      await load();
    } catch (err) {
      setError(msg(err));
    }
  }

  function openRequest(item) {
    const id = getDonationId(item);
    if (!id) {
      setError("Nao foi possivel identificar a doacao selecionada.");
      return;
    }

    setError("");
    setNotice("");
    setRequestError("");
    setRequestingDonation(item);
    setRequest({ quantidadeSolicitada: "", observacao: "" });
  }

  function closeRequest() {
    setRequestingDonation(null);
    setRequest({ quantidadeSolicitada: "", observacao: "" });
    setRequestError("");
    setRequestLoading(false);
  }

  async function createRequest(e) {
    e.preventDefault();

    const doacaoId = getDonationId(requestingDonation);
    const quantidadeSolicitada = Number(request.quantidadeSolicitada);
    const quantidadeDisponivel = Number(requestingDonation?.quantidade);

    if (!doacaoId) {
      setRequestError("Doacao invalida. Atualize a lista e tente novamente.");
      return;
    }

    if (!quantidadeSolicitada || quantidadeSolicitada <= 0) {
      setRequestError("Informe uma quantidade maior que zero.");
      return;
    }

    if (quantidadeDisponivel > 0 && quantidadeSolicitada > quantidadeDisponivel) {
      setRequestError(`A quantidade solicitada nao pode passar de ${quantidadeDisponivel} ${requestingDonation?.unidade || ""}.`);
      return;
    }

    try {
      setRequestLoading(true);
      setRequestError("");
      setError("");
      setNotice("");

      await api.post("/requisicoes", {
        doacaoId,
        quantidadeSolicitada,
        observacao: request.observacao.trim(),
      });

      closeRequest();
      setNotice("Requisicao enviada.");
      await load();
    } catch (err) {
      setRequestError(msg(err));
    } finally {
      setRequestLoading(false);
    }
  }

  return (
    <AppShell title={isOng ? "Doações disponíveis" : "Doações"} subtitle={isOng ? "Encontre alimentos e solicite a quantidade que sua organização precisa." : "Organize suas doações e acompanhe os alimentos disponíveis para coleta."}>
      <div className="fb-toolbar">
        <label className="fb-search"><Icon name="search"/><input aria-label="Buscar doações" placeholder="Buscar alimento ou cidade" value={visualQuery} onChange={e => setVisualQuery(e.target.value)}/></label>
        <select className="fb-filter" aria-label="Filtrar por categoria" value={visualCategory} onChange={e => setVisualCategory(e.target.value)}><option value="">Todas as categorias</option>{foodTypes.map(type => <option key={type} value={type}>{type.replaceAll("_"," ")}</option>)}</select>
        {!isOng && <button type="button" className="fb-primary" onClick={() => { if (!visualFormOpen) clearForm(); setVisualFormOpen(open => !open); }}><Icon name="plus" size={17}/>{visualFormOpen ? "Fechar cadastro" : "Nova doação"}</button>}
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

      {!isOng && visualFormOpen && (
        <form onSubmit={submit} className="fb-ui-section mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">{editingId ? "Editar doacao" : "Nova doacao"}</h2>
                <p className="text-sm text-slate-500">Informe os alimentos, validade, janela de coleta e local de retirada.</p>
              </div>

              {editingId && (
                <button type="button" onClick={clearForm} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
                  Cancelar edicao
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6 p-5">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Alimentos</h3>
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{form.status}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-12">
                <Field label="Tipo" className="md:col-span-3">
                  <select value={form.tipoComida} onChange={(e) => update("tipoComida", e.target.value)} className={inputClass}>
                    {foodTypes.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>

                <Field label="Quantidade" className="md:col-span-2">
                  <input value={form.quantidade} onChange={(e) => update("quantidade", e.target.value)} type="number" min="0" step="0.01" placeholder="20" className={inputClass} />
                </Field>

                <Field label="Unidade" className="md:col-span-2">
                  <select value={form.unidade} onChange={(e) => update("unidade", e.target.value)} className={inputClass}>
                    {units.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>

                <Field label="Status" className="md:col-span-2">
                  <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputClass}>
                    {statuses.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>

                <Field label="Expiracao" className="md:col-span-3">
                  <input value={form.dataExpiracao} onChange={(e) => update("dataExpiracao", e.target.value)} type="datetime-local" className={inputClass} />
                </Field>
              </div>

              <Field label="Descricao" className="mt-4">
                <textarea
                  value={form.descricaoComida}
                  onChange={(e) => update("descricaoComida", e.target.value)}
                  placeholder="Descreva os alimentos, condicoes de armazenamento e observacoes importantes"
                  className={`${inputClass} min-h-24 resize-y`}
                />
              </Field>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Janela de coleta</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Inicio">
                  <input value={form.janelasDisponiveis[0].inicio} onChange={(e) => update("janela.inicio", e.target.value)} type="datetime-local" className={inputClass} />
                </Field>

                <Field label="Fim">
                  <input value={form.janelasDisponiveis[0].fim} onChange={(e) => update("janela.fim", e.target.value)} type="datetime-local" className={inputClass} />
                </Field>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Local de retirada</h3>
                {cepLoading && <span className="text-xs font-semibold text-slate-500">Buscando CEP...</span>}
              </div>

              <div className="grid gap-4 md:grid-cols-12">
                <Field label="CEP" className="md:col-span-3">
                  <input value={form.endereco.cep || ""} onChange={(e) => update("endereco.cep", e.target.value)} onBlur={handleCepBlur} placeholder="01001000" className={inputClass} />
                </Field>

                <Field label="Rua" className="md:col-span-6">
                  <input value={form.endereco.linha1 || ""} onChange={(e) => update("endereco.linha1", e.target.value)} placeholder="Rua, avenida ou estrada" className={inputClass} />
                </Field>

                <Field label="Numero" className="md:col-span-3">
                  <input value={form.endereco.numero || ""} onChange={(e) => update("endereco.numero", e.target.value)} placeholder="100" className={inputClass} />
                </Field>

                <Field label="Complemento" className="md:col-span-4">
                  <input value={form.endereco.linha2 || ""} onChange={(e) => update("endereco.linha2", e.target.value)} placeholder="Portao, doca, referencia" className={inputClass} />
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
                {loading ? "Salvando..." : editingId ? "Salvar alteracoes" : "Publicar doacao"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="ref-categories" role="group" aria-label="Categorias de alimentos">
        <button className={!visualCategory ? "is-active" : ""} onClick={() => setVisualCategory("")}>Todos</button>
        {foodTypes.map(type => <button key={type} className={visualCategory === type ? "is-active" : ""} onClick={() => setVisualCategory(type)}>{type.replaceAll("_", " ")}</button>)}
      </div>
      <div className="fb-list-heading"><h2>{isOng ? "Alimentos para sua organização" : "Doações cadastradas"}</h2><span>{`${visualDonations.length} ${visualDonations.length === 1 ? "doação" : "doações"}`}</span></div>
      <div className="fb-donation-grid fb-result-list">
        {visualDonations.map((item, index) => {
          const id = getDonationId(item);
          const canRequest = isOng && id && isRequestableDonation(item);
          return <article key={id || index} className="fb-donation">
            <div className="ref-food-photo"><img src={`/images/${categoryImage(item.tipoComida)}.webp`} alt="" loading="lazy"/><span>Imagem ilustrativa da categoria</span></div>
            <div className="fb-donation-top"><span className="fb-food-tag"><Icon name={item.tipoComida === "FRUTAS" || item.tipoComida === "VEGETAIS" ? "leaf" : "food"}/>{item.tipoComida?.replaceAll("_", " ") || "Alimentos"}</span><span className="fb-badge">{item.status || "—"}</span></div>
            <div className="fb-donation-body"><h3>{item.descricaoComida || "Doação sem descrição"}</h3><p className="fb-quantity">{item.quantidade} <span>{item.unidade}</span></p>
              <div className="fb-meta"><p>Validade: {item.dataExpiracao || "Não informada"}</p><p className="fb-location"><Icon name="pin" size={15}/>{[item.endereco?.linha1,item.endereco?.numero,item.endereco?.cidade,item.endereco?.estado].filter(Boolean).join(", ") || "Endereço não informado"}</p></div>
            </div>
            <div className="fb-donation-actions">
              {isOng ? <button className="fb-primary" disabled={!canRequest} onClick={() => openRequest(item)}>Solicitar doação</button> : <><button className="fb-secondary" onClick={() => { edit(item); setVisualFormOpen(true); }}>Editar</button><button className="fb-secondary" onClick={() => remove(item)}>Excluir</button></>}
            </div>
          </article>;
        })}
      </div>
      {visualDonations.length === 0 && <div className="fb-empty"><h2>{visualQuery || visualCategory ? "Nenhuma doação encontrada" : isOng ? "Nenhuma doação disponível" : "Nenhuma doação cadastrada"}</h2><p>{visualQuery || visualCategory ? "Altere a busca ou a categoria." : isOng ? "Quando houver doações publicadas elas aparecerão aqui." : "Cadastre uma nova doação para começar."}</p></div>}

      {requestingDonation && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 px-4 py-4 sm:items-center">
          <form onSubmit={createRequest} className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-emerald-700">{requestingDonation.tipoComida}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">Solicitar doacao</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {requestingDonation.descricaoComida || "Doacao sem descricao"}
                  </p>
                </div>

                <button type="button" onClick={closeRequest} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
                  Fechar
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Disponivel</p>
                  <p className="mt-1 font-bold text-slate-950">{requestingDonation.quantidade} {requestingDonation.unidade}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Expiracao</p>
                  <p className="mt-1 font-bold text-slate-950">{requestingDonation.dataExpiracao || "--"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-slate-500">Retirada</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {[requestingDonation.endereco?.linha1, requestingDonation.endereco?.numero, requestingDonation.endereco?.cidade, requestingDonation.endereco?.estado].filter(Boolean).join(", ") || "Endereco nao informado"}
                  </p>
                </div>
              </div>

              {requestError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {requestError}
                </div>
              )}

              <Field label={`Quantidade solicitada (${requestingDonation.unidade || "unidade"})`}>
                <input
                  value={request.quantidadeSolicitada}
                  onChange={(e) => setRequest((prev) => ({ ...prev, quantidadeSolicitada: e.target.value }))}
                  type="number"
                  min="0"
                  max={requestingDonation.quantidade || undefined}
                  step="0.01"
                  placeholder="Informe a quantidade"
                  className={inputClass}
                />
              </Field>

              <Field label="Observacao">
                <textarea
                  value={request.observacao}
                  onChange={(e) => setRequest((prev) => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Ex.: Podemos recolher pela manha."
                  className={`${inputClass} min-h-24 resize-y`}
                />
              </Field>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeRequest} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancelar
                </button>
                <button disabled={requestLoading} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300">
                  {requestLoading ? "Enviando..." : "Enviar requisicao"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
