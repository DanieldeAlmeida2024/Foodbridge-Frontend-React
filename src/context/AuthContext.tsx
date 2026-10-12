import { createContext, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);
type OrganizationSummary = {
  organizacaoId: number;
  nome: string;
  role: string;
  status: string;
};

type User = {
  tempToken?: string | null;
  accessToken?: string | null;
  nome: string;
  email: string;
  organizacoes: OrganizationSummary[];
  status?: string;
};

type AuthContextType = {
  user: User | null;
  loginTemp: (data: User) => void;
  loginFinal: (token: string) => void;
  logout: () => void;
};
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginTemp = (data: User) => {
    if (data.tempToken) {
      localStorage.setItem("tempToken", data.tempToken);
    } else {
      localStorage.removeItem("tempToken");
    }

    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
    } else {
      localStorage.removeItem("token");
    }

    setUser(data);
  };

  const loginFinal = (token: string) => {
    localStorage.setItem("token", token);
    localStorage.removeItem("tempToken");
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginTemp, loginFinal, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
