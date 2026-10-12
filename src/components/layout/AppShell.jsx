import { NavLink, useNavigate } from "react-router-dom";
import StyleIcon from "../ui/StyleIcon";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/doacoes", label: "Doacoes" },
  { to: "/requisicoes", label: "Requisicoes" },
  { to: "/voluntarios", label: "Voluntarios", roles: ["ONG"] },
  { to: "/admin", label: "Admin", roles: ["ADMIN"] },
];

function getSessionRole() {
  const storedRole = localStorage.getItem("role");
  if (storedRole) return storedRole;

  const selected = localStorage.getItem("selectedOrganization");
  if (selected) return JSON.parse(selected)?.role;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user?.role || user?.organizacoes?.[0]?.role || "";
}

export default function AppShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const role = getSessionRole();
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  function logout() {
    localStorage.clear();
    navigate("/login");
  }


  // Dados somente para exibir a identidade visual; não alteram permissões nem sessão.
  const safeStored = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); }
    catch { return {}; }
  };
  const visualOrg = safeStored("selectedOrganization");
  const visualUser = safeStored("user");
  const roleNames = {
    ONG: "Organização social", DOADOR: "Doador", PRODUTOR: "Produtor",
    DISTRIBUIDOR: "Distribuidor", ADMIN: "Administração"
  };

  return (
    <div className="fb-app">
      <a href="#conteudo" className="fb-skip">Ir para o conteúdo</a>
      <aside className="fb-sidebar">
        <button className="fb-brand" onClick={() => navigate("/dashboard")}>
          <span className="fb-brand-symbol"><StyleIcon name="leaf" size={25} /></span>
          <span>FoodBridge<span className="fb-brand-caption">Alimentos que conectam</span></span>
        </button>
        <p className="fb-nav-label">ÁREA DE TRABALHO</p>
        <nav aria-label="Navegação principal">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `fb-nav-item ${isActive ? "is-active" : ""}`}
            >
              <StyleIcon name={{"/dashboard": "grid", "/doacoes": "food", "/requisicoes": "requests", "/voluntarios": "people", "/admin": "shield"}[item.to] || "grid"} />
              <span>{item.to === "/doacoes" && role === "ONG" ? "Doações disponíveis" : item.to === "/requisicoes" ? role === "ONG" ? "Meus pedidos" : "Requisições recebidas" : item.to === "/admin" ? "Administração" : item.to === "/voluntarios" ? "Voluntários" : item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="fb-sidebar-bottom">
          <div className="fb-workspace">
            <span className="fb-org-avatar">{(visualOrg.nome || "F").slice(0, 1).toUpperCase()}</span>
            <div><strong>{visualOrg.nome || "FoodBridge"}</strong><span>{roleNames[role] || "Organização"}</span></div>
          </div>
          <button className="fb-nav-item" onClick={logout}>
            <StyleIcon name="exit" /><span>Encerrar sessão</span>
          </button>
        </div>
      </aside>
      <div className="fb-workarea">
        <header className="fb-topbar">
          <span className="fb-breadcrumb">Área de trabalho <span>/</span> <strong>{title}</strong></span>
          <div className="fb-user"><span className="fb-user-dot" />{roleNames[role] || "FoodBridge"}<span className="fb-user-avatar">{(visualUser.nome || "U").slice(0, 1).toUpperCase()}</span></div>
        </header>
        <main id="conteudo" className="fb-content">
          <div className="fb-page-heading">
            <p className="fb-eyebrow">FOODBRIDGE / {roleNames[role] || "GESTÃO"}</p>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
