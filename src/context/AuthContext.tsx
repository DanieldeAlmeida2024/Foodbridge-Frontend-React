import { createContext, useEffect, useState } from "react";
import { clearSession, readSession, saveLogin, saveSelection } from "../auth/session";
import type { SelectionResponse, User } from "../auth/session";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

type AuthContextType = {
  user: User | null;
  loginTemp: (data: User) => void;
  loginFinal: (response: SelectionResponse | string) => void;
  logout: () => void;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readSession(localStorage).user);

  useEffect(() => {
    const synchronize = () => setUser(readSession(localStorage).user);
    window.addEventListener("storage", synchronize);
    window.addEventListener("foodbridge:session-expired", synchronize);
    return () => {
      window.removeEventListener("storage", synchronize);
      window.removeEventListener("foodbridge:session-expired", synchronize);
    };
  }, []);

  const loginTemp = (data: User) => setUser(saveLogin(localStorage, data));
  const loginFinal = (response: SelectionResponse | string) => setUser(saveSelection(localStorage, response));
  const logout = () => {
    clearSession(localStorage);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loginTemp, loginFinal, logout }}>{children}</AuthContext.Provider>;
}
