import { useId } from "react";
import Icon from "../ui/Icon";

const units = [
  { key: "KG", label: "Quilogramas", suffix: "kg", note: "de alimentos aproveitados" },
  { key: "LITRO", label: "Litros", suffix: "L", note: "de alimentos e bebidas" },
  { key: "UNIDADE", label: "Unidades", suffix: "un.", note: "de itens alimentares" },
  { key: "CAIXA", label: "Caixas", suffix: "cx.", note: "de alimentos distribuídos" },
  { key: "LOTE", label: "Lotes", suffix: "lotes", note: "de alimentos encaminhados" },
];
const categories = {
  VEGETAIS: "Vegetais", FRUTAS: "Frutas", GRAOS: "Grãos", LATICINIO: "Laticínios",
  CARNE: "Carnes", COMIDA_PREPARADA: "Comida preparada", PADARIA: "Padaria",
  BEBIDAS: "Bebidas", OUTROS: "Outros alimentos",
};
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export default function ImpactSummary({ data, loading, error, onRetry, title, subtitle, details = true, publicView = false }) {
  const headingId = useId();
  const ready = !loading && !error && !!data;
  const facts = [
    ["Coletas concluídas", "coletasConcluidas"],
    ["Doações aproveitadas", "doacoesAproveitadas"],
    ["ONGs beneficiadas", "organizacoesBeneficiadas"],
    ["Voluntários participantes", "voluntariosParticipantes"],
    ["Categorias de alimentos", "categoriasDeAlimentos"],
  ];

  return (
    <section className={`fb-impact${publicView ? " fb-impact-public" : ""}`} aria-labelledby={headingId} aria-busy={loading}>
      <div className="fb-impact-heading">
        <div>
          <p className="fb-impact-eyebrow"><Icon name="leaf" size={17} /> CADA ALIMENTO CONTA</p>
          <h2 id={headingId}>{title || "Alimentos com um novo destino"}</h2>
          <p className="fb-impact-subtitle">{subtitle}</p>
        </div>
        <span className="fb-impact-badge"><Icon name="shield" size={15} /> Aproveitamento confirmado</span>
      </div>

      {!loading && !ready ? (
        <div className="fb-impact-unavailable" role="status">
          <p>Os indicadores de aproveitamento estão indisponíveis no momento.</p>
          {onRetry && <button type="button" className="fb-secondary" onClick={onRetry}>Tentar novamente</button>}
        </div>
      ) : (
        <>
          <div className="fb-impact-volumes">
            {units.map((unit, index) => (
              <article className={`fb-impact-unit${index === 0 ? " fb-impact-unit-main" : ""}`} key={unit.key}>
                {index === 0 && <Icon name="leaf" size={26} />}
                <h3>{unit.label}</h3>
                <p className="fb-impact-value">{ready ? number.format(data.quantidadesPorUnidade?.[unit.key] ?? 0) : "—"}<span>{unit.suffix}</span></p>
                <p className="fb-impact-unit-note">{unit.note}</p>
              </article>
            ))}
          </div>
          <dl className="fb-impact-facts">
            {facts.map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{ready ? number.format(data[key] ?? 0) : "—"}</dd></div>)}
          </dl>
          {loading && <p className="fb-impact-method" role="status">Carregando os resultados de aproveitamento…</p>}
          {ready && (
            <>
              <p className="fb-impact-method">Cada coleta concluída é contabilizada uma única vez. As quantidades permanecem na unidade registrada, sem conversão estimada para kg.{data.fechamentosManuais > 0 && " Os totais incluem quantidades confirmadas no fechamento de doações, sem duplicar suas coletas."}</p>
              {data.incluiDadosDemonstrativos && <p className="fb-impact-demo">Demonstração acadêmica: os indicadores incluem registros fictícios identificados na plataforma.</p>}
              {details && data.porCategoria?.length > 0 && (
                <details className="fb-impact-details">
                  <summary>Ver alimentos por categoria <span>{number.format(data.categoriasDeAlimentos)} categorias</span></summary>
                  <div className="fb-impact-table-wrap"><table>
                    <caption className="sr-only">Alimentos aproveitados por categoria e unidade de medida</caption>
                    <thead><tr><th scope="col">Categoria de alimento</th><th scope="col">Quantidade aproveitada</th></tr></thead>
                    <tbody>{data.porCategoria.map(row => <tr key={`${row.tipoComida}-${row.unidade}`}><th scope="row">{categories[row.tipoComida] || row.tipoComida}</th><td>{number.format(row.quantidade)} {units.find(unit => unit.key === row.unidade)?.suffix || row.unidade}</td></tr>)}</tbody>
                  </table></div>
                </details>
              )}
              {data.doacoesAproveitadas === 0 && <p className="fb-impact-empty">As primeiras coletas concluídas aparecerão aqui.</p>}
            </>
          )}
        </>
      )}
    </section>
  );
}
