import { Link } from "react-router-dom";
import Icon from "../components/ui/Icon";

const steps = [
  { number: "01", title: "Cadastre sua organização", description: "Crie sua conta e informe os dados da organização que vai participar da rede." },
  { number: "02", title: "Disponibilize ou solicite alimentos", description: "Doadores publicam alimentos, quantidades e validade. ONGs consultam as doações e enviam suas requisições." },
  { number: "03", title: "Organize a retirada", description: "Acompanhe a aprovação da requisição, combine a coleta e registre sua conclusão na plataforma." },
];
export default function Landing() {
  return (
    <div className="fb-landing">
      <a className="fb-skip" href="#principal">Ir para o conteúdo</a>
      <header className="lp-header lp-wrap">
        <Link className="lp-brand" to="/" aria-label="FoodBridge — início"><span className="fb-brand-symbol"><Icon name="leaf" size={25} /></span>FoodBridge</Link>
        <nav aria-label="Navegação da página"><a href="#sobre">O projeto</a><a href="#como-funciona">Como funciona</a><a href="#participantes">Quem participa</a></nav>
        <Link className="fb-secondary" to="/login">Entrar na plataforma <Icon name="arrow" size={16} /></Link>
      </header>
      <main id="principal">
        <section className="lp-hero lp-wrap">
          <div className="lp-hero-copy"><p className="lp-eyebrow">MENOS DESPERDÍCIO. MAIS POSSIBILIDADES.</p><h1>Reduza o desperdício de alimentos,<br /><em>amplie o impacto social.</em></h1><p className="lp-intro">Alimentos que ainda podem ser aproveitados merecem um novo destino. O FoodBridge aproxima doadores e organizações sociais para facilitar doações e organizar a retirada.</p><div className="lp-actions"><Link to="/cadastro" className="fb-primary">Quero participar <Icon name="arrow" size={16} /></Link><a href="#como-funciona" className="lp-text-link">Entenda como funciona</a></div><p className="lp-hero-note">Uma ponte entre quem pode doar e quem trabalha para ajudar.</p></div>

        </section>
        <section id="sobre" className="lp-about"><div className="lp-wrap lp-about-grid"><div><p className="lp-eyebrow">POR QUE FOODBRIDGE?</p><h2>O valor de um alimento<br />vai além da sua origem.</h2></div><div><p>O desperdício pode começar quando alimentos disponíveis não encontram quem consiga aproveitá-los. Nosso projeto propõe aproximar essas duas pontas: organizações que têm alimentos para doar e ONGs que precisam deles para suas atividades.</p><p>Com informações sobre quantidade, validade e local de retirada, a plataforma ajuda a tornar esse processo mais organizado e fácil de acompanhar.</p></div></div></section>
        <section id="como-funciona" className="lp-wrap lp-section"><div className="lp-section-heading"><div><p className="lp-eyebrow">DA DISPONIBILIDADE À RETIRADA</p><h2>Como funciona</h2></div><p>Três etapas para aproximar sua organização da rede.</p></div><div className="lp-steps">{steps.map(step => <article key={step.number}><span className="lp-number">{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></section>
        <section id="participantes" className="lp-wrap lp-section lp-participants"><div className="lp-section-heading"><div><p className="lp-eyebrow">DIFERENTES PAPÉIS. UM PROPÓSITO EM COMUM.</p><h2>Quem participa</h2></div></div><div className="lp-participant-grid"><article><Icon name="food" size={28} /><h3>Organizações doadoras</h3><p>Restaurantes, produtores rurais, distribuidores e outras organizações que desejam disponibilizar alimentos para doação.</p><Link to="/cadastro">Participar como doador <Icon name="arrow" size={16} /></Link></article><article><Icon name="people" size={28} /><h3>ONGs e organizações sociais</h3><p>Organizações que consultam alimentos disponíveis, solicitam doações e coordenam a retirada com sua equipe de voluntários.</p><Link to="/cadastro">Participar como ONG <Icon name="arrow" size={16} /></Link></article></div></section>
        <section className="lp-wrap lp-cta"><div><p className="lp-eyebrow">CADA DOAÇÃO ABRE UMA POSSIBILIDADE.</p><h2>Conecte sua organização a esse propósito.</h2><p>Comece pelo cadastro e faça parte do FoodBridge.</p></div><Link to="/cadastro" className="fb-primary">Criar minha conta <Icon name="arrow" size={16} /></Link></section>
      </main>
      <footer className="lp-footer lp-wrap"><div><Link to="/" className="lp-brand">FoodBridge</Link><p>Reduza o desperdício de alimentos, amplie o impacto social.</p></div><div><p>Projeto acadêmico de Engenharia de Software.</p><p>© {new Date().getFullYear()} FoodBridge</p></div></footer>
    </div>
  );
}
