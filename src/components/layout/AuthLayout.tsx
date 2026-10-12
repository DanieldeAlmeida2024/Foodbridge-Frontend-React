import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export default function AuthLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`fb-auth ${wide ? "fb-auth-wide" : ""}`}>
    <aside className="fb-auth-story"><Link to="/" className="fb-auth-logo">FoodBridge</Link><div><span className="fb-auth-kicker">ALIMENTOS QUE CONECTAM</span><h1>Reduza o desperdício de alimentos,<br />amplie o impacto social.</h1><p>Uma rede entre organizações doadoras e ONGs para transformar alimentos disponíveis em novas possibilidades.</p></div><p className="fb-auth-caption">Disponibilidade. Conexão. Impacto social.</p></aside>
    <main className="fb-auth-main"><div className="fb-auth-top"><Link to="/">← Voltar ao início</Link><span>FoodBridge</span></div><div className="fb-auth-card">{children}</div><p className="fb-auth-bottom">FoodBridge · Projeto acadêmico de Engenharia de Software</p></main>
  </div>;
}
