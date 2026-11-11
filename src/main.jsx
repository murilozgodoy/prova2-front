import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'

// Valores do Auth0: domain e clientId na Application, audience na API
const AUTH0_DOMAIN = "dev-ko6dei5u8dvfadka.us.auth0.com"
const AUTH0_CLIENT_ID = "aOxmQT45m9Iqb8g1SkIKjc5EdVHzdFXU"
const AUTH0_AUDIENCE = "https://dev-ko6dei5u8dvfadka.us.auth0.com/api/v2/"

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={AUTH0_DOMAIN}
    clientId={AUTH0_CLIENT_ID}
    authorizationParams={{
      audience: AUTH0_AUDIENCE,
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
)
