export type OrganizationSummary = {
  organizacaoId: number;
  nome: string;
  role: string;
  status: string;
};

export type User = {
  tempToken?: string | null;
  accessToken?: string | null;
  nome: string;
  email: string;
  organizacoes: OrganizationSummary[];
  status?: string;
};

export type SelectionResponse = {
  token?: string;
  accessToken?: string;
  organizacaoId?: number;
  usuarioId?: number;
  vinculoId?: number;
  role?: string;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Claims = {
  sub: string;
  type: "TEMP" | "ACCESS";
  exp: number;
  organizacaoId?: number;
  bond?: number;
  role?: string;
};

const sessionKeys = ["user", "token", "tempToken", "selectedOrganization", "role", "organizacaoId", "usuarioId", "vinculoId"];

function parse<T>(value: string | null): T | null {
  try { return value ? JSON.parse(value) as T : null; } catch { return null; }
}

/** Decodificação apenas para estado da UI. A API verifica assinatura e autorização. */
export function tokenClaims(token: string | null | undefined, now = Date.now()): Claims | null {
  if (!token || token === "null" || token === "undefined") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")), c => c.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as Claims;
    if ((claims.type !== "TEMP" && claims.type !== "ACCESS") ||
        !Number.isFinite(claims.exp) || claims.exp * 1000 <= now ||
        !Number.isSafeInteger(Number(claims.sub)) || Number(claims.sub) <= 0) return null;
    if (claims.type === "ACCESS" &&
        (!Number.isSafeInteger(claims.organizacaoId) || Number(claims.organizacaoId) <= 0 ||
         !Number.isSafeInteger(claims.bond) || Number(claims.bond) <= 0 || !claims.role)) return null;
    return claims;
  } catch { return null; }
}

export function clearSession(storage: StorageLike): void {
  for (const key of sessionKeys) storage.removeItem(key);
}

export function readSession(storage: StorageLike, now = Date.now()) {
  const stored = parse<User>(storage.getItem("user"));
  const accessToken = storage.getItem("token");
  const tempToken = storage.getItem("tempToken");
  const access = tokenClaims(accessToken, now);
  const temp = tokenClaims(tempToken, now);
  const claims = access?.type === "ACCESS" ? access : temp?.type === "TEMP" ? temp : null;
  if (!stored || !Array.isArray(stored.organizacoes) || !claims ||
      ["SUSPENSO", "INATIVO"].includes(stored.status || "")) {
    return { user: null, claims: null, organization: null };
  }
  const organization = claims.type === "ACCESS"
    ? stored.organizacoes.find(org => org.organizacaoId === claims.organizacaoId) || null : null;
  if (claims.type === "ACCESS" && !organization) return { user: null, claims: null, organization: null };
  return {
    user: { ...stored, accessToken: claims.type === "ACCESS" ? accessToken : null,
      tempToken: claims.type === "TEMP" ? tempToken : null },
    claims,
    organization,
  };
}

function persist(storage: StorageLike, user: User, token: string, claims: Claims): User {
  const organization = claims.type === "ACCESS"
    ? user.organizacoes.find(org => org.organizacaoId === claims.organizacaoId) : null;
  if (claims.type === "ACCESS" && !organization) throw new Error("Organização do token não encontrada na sessão.");
  clearSession(storage);
  const updated = { ...user, accessToken: claims.type === "ACCESS" ? token : null,
    tempToken: claims.type === "TEMP" ? token : null };
  storage.setItem("user", JSON.stringify({ ...updated, accessToken: null, tempToken: null }));
  storage.setItem(claims.type === "ACCESS" ? "token" : "tempToken", token);
  storage.setItem("usuarioId", claims.sub);
  if (organization) {
    storage.setItem("selectedOrganization", JSON.stringify({ ...organization, role: claims.role }));
    storage.setItem("organizacaoId", String(claims.organizacaoId));
    storage.setItem("vinculoId", String(claims.bond));
    storage.setItem("role", claims.role!);
  }
  return updated;
}

export function saveLogin(storage: StorageLike, user: User): User {
  const token = user.accessToken || user.tempToken;
  const claims = tokenClaims(token);
  if (!claims || !Array.isArray(user.organizacoes) || ["SUSPENSO", "INATIVO"].includes(user.status || "")) {
    clearSession(storage);
    throw new Error("Sessão inválida. Faça login novamente.");
  }
  return persist(storage, user, token!, claims);
}

export function saveSelection(storage: StorageLike, response: SelectionResponse | string): User {
  const token = typeof response === "string" ? response : response.token || response.accessToken;
  const claims = tokenClaims(token);
  const current = readSession(storage);
  if (!claims || claims.type !== "ACCESS" || !current.user || current.claims?.type !== "TEMP" ||
      claims.sub !== current.claims.sub) throw new Error("Sessão inválida. Faça login novamente.");
  return persist(storage, current.user, token!, claims);
}
