import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import { decodeJwt, isAdminToken } from "./auth";

export default function Home() {
  const [token, setToken] = useState("");
  const { user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    getAccessTokenSilently()
      .then(setToken)
      .catch((e) => console.error("Erro ao buscar token:", e));
  }, [getAccessTokenSilently]);

  return (
    <>
      <div className="card profile">
        <img src={user.picture} alt={user.name} className="avatar" />
        <div className="grow">
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          {token && isAdminToken(token) && <span className="badge">ADMIN</span>}
        </div>
        <LogoutButton />
      </div>

      <div className="card">
        <h2>Token JWT</h2>
        <code className="token">{token || "Carregando..."}</code>
        {token && (
          <>
            <p className="label">Payload decodificado:</p>
            <pre className="token">{JSON.stringify(decodeJwt(token), null, 2)}</pre>
          </>
        )}
      </div>
    </>
  );
}
