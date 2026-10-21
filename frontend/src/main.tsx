import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeAuth } from './auth'

const root = createRoot(document.getElementById('root')!)

root.render(
    <div className="auth-loading" role="status">
        Opening FreelanceHub…
    </div>,
)

initializeAuth()
    .then(() => {
        root.render(
            <StrictMode>
                <App />
            </StrictMode>,
        )
    })
    .catch(() => {
        root.render(
            <main className="auth-loading">
                <h1>Unable to connect</h1>
                <p>We couldn’t connect to sign-in. Please try again.</p>
                <button
                    className="account-button"
                    onClick={() => window.location.reload()}
                >
                    Try again
                </button>
            </main>,
        )
    })