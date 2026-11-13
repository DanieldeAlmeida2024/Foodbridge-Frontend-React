import test from "node:test";
import assert from "node:assert/strict";
import { clearSession, readSession, saveLogin, saveSelection, tokenClaims } from "../src/auth/session.ts";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
}
const orgs = [
  { organizacaoId: 1, nome: "ONG A", role: "ONG", status: "VERIFICADO" },
  { organizacaoId: 2, nome: "Admin B", role: "ADMIN", status: "VERIFICADO" },
];
const user = { nome: "Pessoa sintética", email: "pessoa@example.invalid", status: "VERIFICADO", organizacoes: orgs };
const jwt = (claims: object) => "e30." + Buffer.from(JSON.stringify({ sub: "7", exp: Math.floor(Date.now() / 1000) + 300, ...claims })).toString("base64url") + ".assinatura-sintetica";
const access = (orgId = 2) => jwt({ type: "ACCESS", organizacaoId: orgId, bond: 19, role: orgId === 2 ? "ADMIN" : "ONG" });

test("restaura sessão após recarregar e escolhe organização do JWT, mesmo fora da primeira posição", () => {
  const storage = new MemoryStorage();
  saveLogin(storage, { ...user, accessToken: access() });
  assert.equal(readSession(storage).organization?.organizacaoId, 2);
  assert.equal(storage.getItem("role"), "ADMIN");
  assert.equal(storage.getItem("vinculoId"), "19");
  assert.ok(readSession(storage).user?.accessToken);
});
test("seleção substitui TEMP por ACCESS e atualiza usuário/contexto", () => {
  const storage = new MemoryStorage();
  saveLogin(storage, { ...user, tempToken: jwt({ type: "TEMP" }) });
  const updated = saveSelection(storage, { token: access(1), role: "ADMIN", organizacaoId: 2 });
  assert.ok(updated.accessToken);
  assert.equal(updated.tempToken, null);
  assert.equal(storage.getItem("tempToken"), null);
  assert.equal(storage.getItem("role"), "ONG");
  assert.equal(readSession(storage).organization?.organizacaoId, 1);
});
test("novo login temporário remove organização e role da conta anterior", () => {
  const storage = new MemoryStorage();
  saveLogin(storage, { ...user, accessToken: access() });
  saveLogin(storage, { ...user, tempToken: jwt({ type: "TEMP" }) });
  assert.equal(storage.getItem("role"), null);
  assert.equal(storage.getItem("selectedOrganization"), null);
  assert.equal(readSession(storage).claims?.type, "TEMP");
});
test("logout remove somente chaves FoodBridge", () => {
  const storage = new MemoryStorage();
  storage.setItem("outra-aplicacao", "preservar");
  saveLogin(storage, { ...user, accessToken: access() });
  clearSession(storage);
  assert.equal(storage.getItem("outra-aplicacao"), "preservar");
  assert.equal(readSession(storage).user, null);
});
test("dados JSON corrompidos não quebram renderização", () => {
  const storage = new MemoryStorage();
  storage.setItem("user", "{invalido");
  storage.setItem("token", access());
  assert.equal(readSession(storage).user, null);
});
test("tokens expirados, malformados e literais são recusados", () => {
  for (const token of ["null", "undefined", "invalido", jwt({ type: "TEMP", exp: 1 }), jwt({ type: "OUTRO" })]) {
    assert.equal(tokenClaims(token), null);
  }
});
test("token de organização ausente não autentica", () => {
  const storage = new MemoryStorage();
  assert.throws(() => saveLogin(storage, { ...user, accessToken: access(99) }));
  assert.equal(readSession(storage).user, null);
});
test("conta suspensa limpa sessão anterior e recusa login", () => {
  const storage = new MemoryStorage();
  saveLogin(storage, { ...user, accessToken: access() });
  assert.throws(() => saveLogin(storage, { ...user, status: "SUSPENSO", accessToken: access() }));
  assert.equal(storage.getItem("token"), null);
});
test("ACCESS sem vínculo e subject inválido são recusados", () => {
  assert.equal(tokenClaims(jwt({ type: "ACCESS", organizacaoId: 1, role: "ONG" })), null);
  assert.equal(tokenClaims(jwt({ type: "TEMP", sub: "outra-pessoa" })), null);
});
test("seleção sem sessão temporária não cria contexto autenticado", () => {
  const storage = new MemoryStorage();
  assert.throws(() => saveSelection(storage, { token: access() }));
  assert.equal(storage.getItem("token"), null);
});
