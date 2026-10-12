import { useEffect, useState } from "react";
import api from "../api/client";
import AppShell from "../components/layout/AppShell";

function sessionRole() {
  const selected = JSON.parse(localStorage.getItem("selectedOrganization") || "{}");
  return localStorage.getItem("role") || selected.role || "";
}

function message(err) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.mensagem ||
    err?.message ||
    "Erro ao processar"
  );
}

function Status({ value }) {
  const tone = {
    PENDENTE: "bg-amber-50 text-amber-700",
    APROVADO: "bg-blue-50 text-blue-700",
    CONCLUIDO: "bg-emerald-50 text-emerald-700",
    REJEITADO: "bg-red-50 text-red-700",
    CANCELADO: "bg-slate-100 text-slate-700",
  }[value] || "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {value}
    </span>
  );
}

export default function Requests() {
  const role = sessionRole();
  const isOng = role === "ONG";

  const [requests, setRequests] = useState([]);
  const [visualQuery, setVisualQuery] = useState("");
  const [visualStatus, setVisualStatus] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [volunteerByRequest, setVolunteerByRequest] = useState({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");

      const endpoint = isOng
        ? "/requisicoes/minhas"
        : "/requisicoes/recebidas";

      const requestRes = await api.get(endpoint);

      setRequests(
        Array.isArray(requestRes.data)
          ? requestRes.data
          : []
      );

      if (isOng) {
        const volunteerRes = await api.get("/voluntarios");

        setVolunteers(
          Array.isArray(volunteerRes.data)
            ? volunteerRes.data
            : []
        );
      } else {
        setVolunteers([]);
        setVolunteerByRequest({});
      }
    } catch (err) {
      setError(message(err));
    }
  }

  useEffect(() => {
    load();
  }, [isOng]);

  async function patch(id, action, body) {
    try {
      setError("");
      setNotice("");

      await api.patch(
        `/requisicoes/${id}/${action}`,
        body
      );

      setNotice("Operação realizada com sucesso.");
      await load();
    } catch (err) {
      setError(message(err));
    }
  }

  async function vincularVoluntario(id) {
    const voluntarioId = Number(volunteerByRequest[id]);

    if (!voluntarioId) {
      setError("Selecione um voluntário antes de vincular.");
      return;
    }

    await patch(id, "vincular-voluntario", {
      voluntarioId,
    });
  }

  const visualRequests = requests.filter(item => (!visualStatus || item.status === visualStatus) && [item.organizacaoDoadoraNome,item.organizacaoSolicitanteNome,item.doacaoId].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR").includes(visualQuery.toLocaleLowerCase("pt-BR")));
  return (
    <AppShell
      title={isOng ? "Meus pedidos" : "Requisições recebidas"}
      subtitle={
        isOng
          ? "Acompanhe os pedidos enviados pela sua ONG e atribua voluntários após a aprovação."
          : "Responda pedidos recebidos e confirme recolhimentos."
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <div className="fb-toolbar"><label className="fb-search"><input aria-label="Buscar pedidos" placeholder="Buscar organização ou número da doação" value={visualQuery} onChange={e => setVisualQuery(e.target.value)}/></label><select className="fb-filter" aria-label="Filtrar por status" value={visualStatus} onChange={e => setVisualStatus(e.target.value)}><option value="">Todos os status</option>{["PENDENTE","APROVADO","CONCLUIDO","REJEITADO","CANCELADO"].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
      <div className="fb-table-panel overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Organizacao",
                "Quantidade",
                "Voluntario",
                "Status",
                "Acoes",
              ].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {visualRequests.map((item) => {
              const podeAtribuir =
                isOng &&
                item.status === "APROVADO" &&
                !item.voluntarioId;

              return (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">
                      {isOng
                        ? item.organizacaoDoadoraNome
                        : item.organizacaoSolicitanteNome}
                    </p>

                    <p className="text-xs text-slate-500">
                      Doacao #{item.doacaoId}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {item.quantidadeSolicitada}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {item.voluntarioNome ? (
                      <span className="font-medium text-slate-700">
                        {item.voluntarioNome}
                      </span>
                    ) : podeAtribuir ? (
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={
                            volunteerByRequest[item.id] || ""
                          }
                          onChange={(e) =>
                            setVolunteerByRequest((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          className="w-44 rounded-lg border border-slate-300 p-2"
                        >
                          <option value="">
                            Selecionar
                          </option>

                          {volunteers.map((volunteer) => (
                            <option
                              key={volunteer.id}
                              value={volunteer.id}
                            >
                              {volunteer.nome}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() =>
                            vincularVoluntario(item.id)
                          }
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
                        >
                          Vincular
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">
                        Não atribuído
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Status value={item.status} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {isOng &&
                        item.status === "PENDENTE" && (
                          <button
                            onClick={() =>
                              patch(item.id, "cancelar")
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold"
                          >
                            Cancelar
                          </button>
                        )}

                      {!isOng &&
                        item.status === "PENDENTE" && (
                          <>
                            <button
                              onClick={() =>
                                patch(item.id, "aprovar")
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
                            >
                              Aprovar
                            </button>

                            <button
                              onClick={() =>
                                patch(item.id, "rejeitar")
                              }
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700"
                            >
                              Rejeitar
                            </button>
                          </>
                        )}

                      {!isOng &&
                        item.status === "APROVADO" && (
                          <button
                            onClick={() =>
                              patch(item.id, "concluir")
                            }
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
                          >
                            Concluir
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visualRequests.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            Nenhuma requisicao encontrada.
          </div>
        )}
      </div>
    </AppShell>
  );
}
