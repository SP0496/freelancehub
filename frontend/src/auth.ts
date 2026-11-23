import Keycloak from 'keycloak-js'
import { authService } from './services/authService'

const keycloakUrl =
  import.meta.env.VITE_KEYCLOAK_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//${window.location.hostname}:8180`
    : 'http://localhost:8180')

export const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: 'freelancehub',
  clientId: 'freelancehub-web',
})

// Wire up updateToken to our authService to refresh JWTs seamlessly
keycloak.updateToken = async (minValidity?: number) => {
  const refreshed = await authService.updateToken(minValidity ?? 30)
  return refreshed
}

let initialization: Promise<boolean> | undefined

export function initializeAuth(): Promise<boolean> {
  if (initialization) return initialization

  initialization = (async () => {
    // Check if an existing active session was saved in local storage
    const stored = authService.getStoredSession()
    if (stored) {
      return true
    }
    return false
  })()

  return initialization
}
