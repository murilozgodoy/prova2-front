// Mesmo namespace da Action do Auth0 (guia do professor)
export const ROLES_CLAIM = "https://social-insper.com/roles"

// O payload do JWT vem em base64url; atob sozinho falha com "-" e "_"
export function decodeJwt(token) {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  return JSON.parse(atob(padded))
}

export function isAdminToken(token) {
  const roles = decodeJwt(token)[ROLES_CLAIM] || []
  return roles.includes("ADMIN")
}
