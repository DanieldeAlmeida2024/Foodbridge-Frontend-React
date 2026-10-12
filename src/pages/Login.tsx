import AuthLayout from "../components/layout/AuthLayout";
import api from "../api/client";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../components/ui/Input";
import { AuthContext } from "../context/AuthContext";

// ================= TYPES =================
type FormData = {
  email: string;
  senha: string;
};

type Errors = {
  email?: string;
  senha?: string;
  general?: string;
};

type LoginResponse = {
  id?: number;
  usuarioId?: number;
  userId?: number;
  accessToken?: string;
  tempToken?: string | null;
  nome: string;
  email: string;
  organizacoes?: {
    organizacaoId: number;
    nome: string;
    role: string;
    status: string;
  }[];
  status?: string;
};

// ================= HOOK =================
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

function getErrorMessage(err: unknown, fallback: string) {
  const apiError = err as { response?: { data?: { error?: string; message?: string; mensagem?: string } } };
  return apiError?.response?.data?.error ||
    apiError?.response?.data?.message ||
    apiError?.response?.data?.mensagem ||
    (err instanceof Error ? err.message : fallback);
}

// ================= COMPONENT =================
export default function Login() {
  const { loginTemp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    email: "",
    senha: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // ================= CHANGE =================
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // limpa erros ao digitar
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  }

  // ================= VALIDATION =================
  function validate(): boolean {
    const newErrors: Errors = {};

    if (!form.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!form.senha.trim()) newErrors.senha = "Senha é obrigatória";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // ================= REDIRECT RULE =================
  function handleRedirect(user: LoginResponse) {
    const hasOrg = (user.organizacoes?.length || 0) > 0;

    if (user.accessToken) {
      const selectedOrg = user.organizacoes?.[0];
      if (selectedOrg) {
        localStorage.setItem("selectedOrganization", JSON.stringify(selectedOrg));
        localStorage.setItem("role", selectedOrg.role);
        localStorage.setItem("organizacaoId", String(selectedOrg.organizacaoId));
      }

      navigate("/dashboard");
      return;
    }

    if (!hasOrg) {
      navigate("/organizacao");
      return;
    }

    // 🔥 fluxo correto: seleção de organização
    navigate("/selecionar-organizacao");
  }

  // ================= SUBMIT =================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      const { data } = await api.post("/auth/login", form);

      // 🔐 bloqueio de status inválido
      if (["SUSPENSO", "INATIVO"].includes(data.status)) {
        throw new Error("Sua conta está indisponível. Contate o suporte.");
      }

      // 💾 salva temp session
      loginTemp(data);

      // 🔥 ESSENCIAL (persistência)
      localStorage.setItem("user", JSON.stringify(data));

      // 🚀 redirect correto
      handleRedirect(data);

    } catch (err: unknown) {
      setErrors({ general: getErrorMessage(err, "Erro ao fazer login") });

    } finally {
      setLoading(false);
    }
  }

  // ================= STATUS WARNING =================
  function renderStatusWarning(status?: string) {
    if (!status || status === "VERIFICADO") return null;

    if (status === "PENDENTE_VERIFICACAO") {
      return (
        <p className="text-yellow-600 text-sm text-center">
          Conta pendente de verificação. Algumas funcionalidades podem estar limitadas.
        </p>
      );
    }

    return null;
  }

  // ================= UI =================
  return (
    <AuthLayout>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
        >
          <h2 className="text-2xl font-bold text-center">
            Entrar na plataforma
          </h2>

          {/* ERRO GERAL */}
          {errors.general && (
            <p role="alert" className="fb-alert-error">
              {errors.general}
            </p>
          )}

          {/* STATUS */}
          {renderStatusWarning()}

          {/* EMAIL */}
          <div>
            <Input
              name="email"
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* SENHA */}
          <div>
            <Input
              name="senha"
              type="password"
              placeholder="Senha"
              value={form.senha}
              onChange={handleChange}
            />
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
            )}
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-2.5 rounded-lg font-semibold transition
              ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-emerald-700 text-white hover:bg-emerald-800"
              }
            `}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* CADASTRO */}
          <p className="text-sm text-center text-gray-600">
            Não tem conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className="text-emerald-700 cursor-pointer hover:underline"
            >
              Criar conta
            </button>
          </p>
        </form>
    </AuthLayout>
  );
}
