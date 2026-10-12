import Icon from "../components/ui/Icon";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import AppShell from "../components/layout/AppShell";

const donorRoles = ["DOADOR", "PRODUTOR", "DISTRIBUIDOR"];

function sessionRole() {
  const selected = JSON.parse(localStorage.getItem("selectedOrganization") || "{}");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return localStorage.getItem("role") || selected.role || user?.organizacoes?.[0]?.role || "";
}

function errorMessage(err) {
  return err?.response?.data?.error || err?.response?.data?.mensagem || err?.message || "Nao foi possivel carregar";
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value ?? "--"}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const role = sessionRole();
  const [data, setData] = useState(null);
  const [org, setOrg] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const endpoint = useMemo(() => {
    if (role === "ONG") return "/dashboards/ong";
    if (role === "ADMIN") return "/dashboards/publico";
    if (donorRoles.includes(role)) return "/dashboards/doador";
    return "/dashboards/publico";
  }, [role]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [dashboardRes, orgRes] = await Promise.allSettled([
          api.get(endpoint),
          localStorage.getItem("token") ? api.get("/organizacoes/me") : Promise.resolve({ data: null }),
        ]);

        if (dashboardRes.status === "fulfilled") setData(dashboardRes.value.data);
        if (orgRes.status === "fulfilled") setOrg(orgRes.value.data);
        if (dashboardRes.status === "rejected") setError(errorMessage(dashboardRes.reason));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [endpoint]);

  const stats = Object.entries(data || {}).map(([key, value]) => ({
    label: key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
    value,
  }));
  const visualCards = role === "ONG"
    ? [["Doações disponíveis", "doacoesDisponiveis", "food"],["Pedidos concluídos", "requisicoesConcluidas", "requests"],["Voluntários ativos", "voluntariosAtivos", "people"]]
    : role === "ADMIN" || !role
    ? [["Doações disponíveis", "doacoesDisponiveis", "food"],["Organizações doadoras", "organizacoesDoadoras", "people"],["ONGs ativas", "ongsAtivas", "shield"]]
    : [["Doações publicadas", "doacoesPublicadas", "food"],["Requisições pendentes", "requisicoesPendentes", "requests"],["Coletas concluídas", "coletasConcluidas", "people"]];


  return (
    <AppShell
      title={role === "ONG" ? "Painel da ONG" : role === "ADMIN" ? "Painel administrativo" : "Painel do doador"}
      subtitle={org?.nome ? `Bem-vindo de volta, ${org.nome}.` : "Acompanhe suas doações e os resultados da sua organização."}
    >
      {error && <div role="alert" className="ref-warning">{error}</div>}
      <section className="ref-stats" aria-label="Indicadores da plataforma">
        {visualCards.map(([label,key,icon]) => <article key={key} className="ref-stat"><div className="ref-stat-icon"><Icon name={icon} size={24}/></div><p>{label}</p><strong>{loading ? "Carregando…" : data?.[key] == null ? "—" : typeof data[key] === "number" ? data[key].toLocaleString("pt-BR") : String(data[key])}</strong></article>)}
      </section>
      <section className="ref-panels">
        <article className="ref-panel">
          <h2>{role === "ONG" ? "Situação dos pedidos" : "Situação das doações"}</h2>
          {loading ? <p className="fb-muted">Carregando indicadores...</p> : stats.length ? stats.slice(0,5).map((item) => <div className="ref-progress" key={item.label}><div className="ref-progress-label"><span>{item.label}</span><strong>{item.value ?? "—"}</strong></div><div className="ref-progress-track"><span style={{width:`${Math.max(0,Math.min(100,Number(item.value || 0) / Math.max(1,...stats.map(s => Number(s.value)||0)) *100))}%`}}/></div></div>) : <p className="fb-muted">Os indicadores aparecerão quando os dados estiverem disponíveis.</p>}
          <p className="ref-panel-note">Resumo dos registros atuais da plataforma.</p>
        </article>
        <article className="ref-panel">
          <h2>Acesso rápido</h2>
          <p className="fb-muted">Acompanhe as requisições, as doações e a equipe da sua organização.</p>
          <div className="fb-quick-actions mt-5">
            <button className="fb-secondary" onClick={() => navigate("/requisicoes")}>Ver pedidos <Icon name="arrow" size={16}/></button>
            <button className="fb-secondary" onClick={() => navigate("/doacoes")}>Ver doações <Icon name="arrow" size={16}/></button>
          </div>
        </article>
      </section>
      <div className="fb-quick-actions">
        <button className="fb-primary" onClick={() => navigate("/doacoes")}>{role === "ONG" ? "Encontrar doações" : "Gerenciar doações"}<Icon name="arrow" size={16}/></button>
        {role === "ONG" && <button className="fb-secondary" onClick={() => navigate("/voluntarios")}>Gerenciar voluntários</button>}
        {role === "ADMIN" && <button className="fb-secondary" onClick={() => navigate("/admin")}>Revisar organizações e usuários</button>}
      </div>
    </AppShell>
  );
}
