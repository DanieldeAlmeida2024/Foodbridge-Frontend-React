import AuthLayout from "../components/layout/AuthLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

import Input from "../components/ui/Input";

type Endereco = {
  linha1: string;
  linha2: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
};

type FormData = {
  nome: string;
  cnpj: string;
  description: string;
  telefone: string;
  email: string;
  website: string;
  role: "ONG" | "DOADOR" | "PRODUTOR" | "DISTRIBUIDOR";
  endereco: Endereco;
};

function getErrorMessage(err: unknown, fallback: string) {
  const apiError = err as { response?: { data?: { error?: string; message?: string; mensagem?: string } } };
  return apiError?.response?.data?.error ||
    apiError?.response?.data?.message ||
    apiError?.response?.data?.mensagem ||
    (err instanceof Error ? err.message : fallback);
}

export default function OrganizationForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    nome: "",
    cnpj: "",
    description: "",
    telefone: "",
    email: "",
    website: "",
    role: "ONG",
    endereco: {
      linha1: "",
      linha2: "",
      numero: "",
      cep: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "Brasil",
    },
  });

  const [loading, setLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [error, setError] = useState("");

  // 🔥 UPDATE GENÉRICO (suporta nested)
  function updateField(name: string, value: string) {
    if (name.includes(".")) {
      const [, child] = name.split(".");

      setForm((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    updateField(e.target.name, e.target.value);
  }

  // 🔍 CNPJ
  async function handleCnpjBlur() {
    if (!form.cnpj) return;

    try {
      setCnpjLoading(true);

      const { data } = await api.get(`/organizacoes/cnpj/${form.cnpj}`);

      setForm((prev) => ({
        ...prev,
        ...data,
      }));

      setIsExisting(true);
    } catch {
      setIsExisting(false);
    } finally {
      setCnpjLoading(false);
    }
  }

  // 🔍 CEP (CORRIGIDO)
  async function handleCepBlur() {
    const cep = form.endereco.cep.replace(/\D/g, "");

    if (cep.length !== 8) return;

    try {
      setCepLoading(true);

      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        throw new Error("CEP inválido");
      }

      setForm((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          linha1: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        },
      }));
    } catch {
      setError("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  // 🚀 SUBMIT
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("tempToken");

      if (!token) throw new Error("Sessão inválida");

      const headers = { Authorization: `Bearer ${token}` };

      await api.post("/organizacoes", form, { headers });

      // 🔥 REDIRECT COM DELAY
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao processar"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout wide>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
        >
          <h2 className="text-2xl font-bold text-center">
            Organização
          </h2>

          {error && (
            <p role="alert" className="fb-alert-error">
              {error}
            </p>
          )}

          {/* CNPJ */}
          <Input
            name="cnpj"
            placeholder="CNPJ"
            value={form.cnpj}
            onChange={handleChange}
            onBlur={handleCnpjBlur}
          />

          {cnpjLoading && <p className="text-sm">Consultando...</p>}

          {/* DADOS */}
          <Input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} disabled={isExisting} />
          <Input name="description" placeholder="Descrição" value={form.description} onChange={handleChange} disabled={isExisting} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
            <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          </div>

          <Input name="website" placeholder="Website" value={form.website} onChange={handleChange} />

          {/* ENDEREÇO */}
          <h3 className="font-semibold">Endereço</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="endereco.cep"
              placeholder="CEP"
              value={form.endereco.cep}
              onChange={handleChange}
              onBlur={handleCepBlur}
            />

            <Input
              name="endereco.numero"
              placeholder="Número"
              value={form.endereco.numero}
              onChange={handleChange}
            />
          </div>

          {cepLoading && <p className="text-sm">Buscando CEP...</p>}

          <Input name="endereco.linha1" placeholder="Rua" value={form.endereco.linha1} onChange={handleChange} />
          <Input name="endereco.linha2" placeholder="Complemento" value={form.endereco.linha2} onChange={handleChange} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="endereco.bairro" placeholder="Bairro" value={form.endereco.bairro} onChange={handleChange} />
            <Input name="endereco.cidade" placeholder="Cidade" value={form.endereco.cidade} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="endereco.estado" placeholder="Estado" value={form.endereco.estado} onChange={handleChange} />
            <Input name="endereco.pais" placeholder="País" value={form.endereco.pais} onChange={handleChange} />
          </div>

          {/* ROLE */}
          <label className="fb-field"><span>Tipo de organização</span><select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          >
            <option value="ONG">ONG</option>
            <option value="DOADOR">Doador</option>
            <option value="PRODUTOR">Produtor</option>
            <option value="DISTRIBUIDOR">Distribuidor</option>
          </select></label>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold bg-emerald-700 text-white"
          >
            {loading
              ? "Processando..."
              : isExisting
              ? "Solicitar vínculo"
              : "Cadastrar organização"}
          </button>
        </form>
    </AuthLayout>
  );
}
