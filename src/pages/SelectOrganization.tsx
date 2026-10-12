import AuthLayout from "../components/layout/AuthLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

type Org = {
  organizacaoId: number;
  nome: string;
  role: string;
  status: string;
};

type StoredUser = {
  id?: number;
  usuarioId?: number;
  userId?: number;
  tempToken?: string;
  organizacoes?: Org[];
};

type JwtClaims = {
  id?: number | string;
  usuarioId?: number | string;
  userId?: number | string;
  sub?: number | string;
};

function decodeJwtPayload(token?: string | null): JwtClaims {
  if (!token) return {};

  try {
    const payload = token.split(".")[1];
    if (!payload) return {};

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
}

function getUsuarioId(user: StoredUser, tempToken?: string | null) {
  const claims = decodeJwtPayload(tempToken || user.tempToken);
  return user.usuarioId || user.id || user.userId || claims.usuarioId || claims.userId || claims.id || claims.sub;
}

function isValidToken(token?: string | null) {
  return !!token && token !== "null" && token !== "undefined";
}

function getErrorMessage(err: unknown) {
  const apiError = err as { response?: { data?: { error?: string; mensagem?: string; message?: string } } };
  return apiError?.response?.data?.error ||
    apiError?.response?.data?.mensagem ||
    apiError?.response?.data?.message ||
    (err instanceof Error ? err.message : "Erro ao selecionar organizacao");
}

export default function SelectOrganization() {
  const navigate = useNavigate();

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const user: StoredUser = JSON.parse(localStorage.getItem("user") || "{}");
    setOrgs(user.organizacoes || []);
  }, []);

  function getStatusColor(status: string) {
    if (status === "VERIFICADO") return "bg-green-100 text-green-700";
    if (status === "SUSPENSO" || status === "INATIVO") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  }

  async function handleSelect(orgId: number) {
    const selectedOrg = orgs.find((org) => org.organizacaoId === orgId);

    if (!selectedOrg || selectedOrg.status !== "VERIFICADO") {
      setError("Esta organizacao ainda nao esta verificada.");
      return;
    }

    try {
      setSelecting(orgId);
      setError("");

      const tempToken = localStorage.getItem("tempToken");
      const user: StoredUser = JSON.parse(localStorage.getItem("user") || "{}");
      const usuarioId = getUsuarioId(user, tempToken);

      if (!isValidToken(tempToken)) {
        throw new Error("Sessao temporaria invalida. Faca login novamente.");
      }

      if (!usuarioId) {
        throw new Error("Nao foi possivel identificar o usuario da sessao. Faca login novamente.");
      }

      const { data } = await api.post(
        "/auth/select-org",
        { usuarioId: Number(usuarioId), organizacaoId: orgId },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioId", String(data.usuarioId || usuarioId));
      localStorage.setItem("vinculoId", String(data.vinculoId || ""));

      const selectedOrg = orgs.find((org) => org.organizacaoId === orgId);
      if (selectedOrg) {
        localStorage.setItem("selectedOrganization", JSON.stringify(selectedOrg));
        localStorage.setItem("role", data.role || selectedOrg.role);
        localStorage.setItem("organizacaoId", String(data.organizacaoId || selectedOrg.organizacaoId));
      }

      localStorage.removeItem("tempToken");
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSelecting(null);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Escolha uma organização
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Selecione com qual organização deseja continuar
          </p>
          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {orgs.map((org) => (
            <button
              key={org.organizacaoId}
              onClick={() => handleSelect(org.organizacaoId)}
              disabled={!!selecting || org.status !== "VERIFICADO"}
              className={`
                w-full p-5 rounded-lg border text-left
                bg-white shadow-sm
                transition-all duration-200
                hover:shadow-md hover:border-gray-300
                ${selecting === org.organizacaoId ? "opacity-50" : ""}
              `}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{org.nome}</p>
                  <p className="text-sm text-gray-500 mt-1">{org.role}</p>
                </div>

                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(org.status)}`}>
                  {org.status}
                </span>
              </div>

              {selecting === org.organizacaoId && (
                <p className="text-sm text-gray-400 mt-2">Entrando...</p>
              )}
            </button>
          ))}
        </div>

        {orgs.length === 0 && (
          <div className="text-center mt-6 text-gray-500">
            Nenhuma organização encontrada
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/organizacao")}
            className="text-sm text-emerald-700 hover:underline"
          >
            Cadastrar nova organização
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
