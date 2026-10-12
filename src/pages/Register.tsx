import AuthLayout from "../components/layout/AuthLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";

type FormData = {
  nome: string;
  email: string;
  senha: string;
};

type FormErrors = Partial<FormData> & {
  general?: string;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Erro ao cadastrar";
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    nome: "",
    email: "",
    senha: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // 🔥 CHANGE HANDLER (robusto)
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // limpa erro específico + erro geral
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  }

  // 🔥 VALIDAÇÃO
  function validate() {
    const newErrors: FormErrors = {};

    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!form.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!form.senha.trim()) newErrors.senha = "Senha é obrigatória";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // 🔥 SUBMIT
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const response = await fetch("/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          status: "PENDENTE_VERIFICACAO",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.mensagem ||
          data?.message ||
          "Erro ao cadastrar"
        );
      }

      navigate("/login");

    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        general: getErrorMessage(err),
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
        >
          <h2 className="text-2xl font-bold text-center">
            Criar conta
          </h2>

          {/* ERRO GERAL */}
          {errors.general && (
            <p role="alert" className="fb-alert-error">
              {errors.general}
            </p>
          )}

          {/* NOME */}
          <div>
            <Input
              name="nome"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange}
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
            )}
          </div>

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
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          {/* LOGIN */}
          <p className="text-sm text-center text-gray-600">
            Já tem conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-emerald-700 cursor-pointer hover:underline"
            >
              Fazer login
            </button>
          </p>
        </form>
    </AuthLayout>
  );
}
