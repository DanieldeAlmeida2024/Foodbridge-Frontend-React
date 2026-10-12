import { useEffect, useState } from "react";
import api from "../api/client";
import AppShell from "../components/layout/AppShell";

function message(err) {
  return err?.response?.data?.error || err?.response?.data?.mensagem || err?.message || "Erro ao processar";
}

export default function Admin() {
  const [tab, setTab] = useState("organizacoes");
  const [visualQuery, setVisualQuery] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const [orgRes, userRes] = await Promise.allSettled([
        api.get("/admin/organizacoes/pendentes"),
        api.get("/admin/usuarios/pendentes"),
      ]);
      if (orgRes.status === "fulfilled") setOrganizations(Array.isArray(orgRes.value.data) ? orgRes.value.data : []);
      if (userRes.status === "fulfilled") setUsers(Array.isArray(userRes.value.data) ? userRes.value.data : []);
      if (orgRes.status === "rejected") setError(message(orgRes.reason));
    } catch (err) {
      setError(message(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(kind, id, action) {
    try {
      setError("");
      setNotice("");
      await api.patch(`/admin/${kind}/${id}/${action}`);
      setNotice(action === "aprovar" ? "Registro aprovado." : "Registro reprovado.");
      await load();
    } catch (err) {
      setError(message(err));
    }
  }

  const rows = (tab === "organizacoes" ? organizations : users).filter(item => [item.nome,item.email,item.cnpj].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR").includes(visualQuery.toLocaleLowerCase("pt-BR")));
  const kind = tab === "organizacoes" ? "organizacoes" : "usuarios";

  return (
    <AppShell title="Administração" subtitle="Revise os cadastros de organizações e usuários que aguardam verificação.">
      <div className="fb-toolbar"><label className="fb-search"><input aria-label="Buscar cadastros" placeholder="Buscar nome, e-mail ou CNPJ" value={visualQuery} onChange={e => setVisualQuery(e.target.value)}/></label><span className="fb-results-count">{rows.length} cadastros pendentes</span></div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button onClick={() => setTab("organizacoes")} className={`rounded-md px-4 py-2 text-sm font-semibold ${tab === "organizacoes" ? "bg-emerald-50 text-emerald-700" : "text-slate-600"}`}>
          Organizacoes
        </button>
        <button onClick={() => setTab("usuarios")} className={`rounded-md px-4 py-2 text-sm font-semibold ${tab === "usuarios" ? "bg-emerald-50 text-emerald-700" : "text-slate-600"}`}>
          Usuarios
        </button>
      </div>

      <div className="fb-table-panel">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Contato</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold">{item.nome}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.email || item.cnpj || "--"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.status || "--"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => decide(kind, item.id, "aprovar")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white">Aprovar</button>
                    <button onClick={() => decide(kind, item.id, "reprovar")} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700">Reprovar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-8 text-center text-sm text-slate-500">Nenhum registro pendente.</div>}
      </div>
    </AppShell>
  );
}
