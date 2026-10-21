import Keycloak from 'keycloak-js'

export const keycloak = new Keycloak({
    url: 'http://localhost:8180',
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