import Keycloak from 'keycloak-js'

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

let initialization: Promise<boolean> | undefined

export function initializeAuth() {
    initialization ??= keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        redirectUri: window.location.origin + '/',
    })

    return initialization
}
