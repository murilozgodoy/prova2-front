import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import { isAdminToken } from "./auth";

// Em producao, a Vercel repassa /api para o back na EC2 (vercel.json).
// Em desenvolvimento, quem repassa e o proxy do Vite (vite.config.js).
const API_URL = "/api";

const FORM_VAZIO = { emailAvaliado: "", comentario: "", nota: "" };

async function mensagemDeErro(response) {
  if (response.status === 401) return "Sessão inválida ou expirada. Saia e entre de novo.";
  if (response.status === 403) return "Apenas ADMIN pode cadastrar avaliações.";
  try {
    const corpo = await response.json();
    return corpo.message || `Erro ${response.status}`;
  } catch {
    return `Erro ${response.status}`;
  }
}

function formatarData(data) {
  try {
    return new Date(data).toLocaleString("pt-BR");
  } catch {
    return data;
  }
}

export default function Avaliacoes() {
  const { getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [form, setForm] = useState(FORM_VAZIO);
  const [enviando, setEnviando] = useState(false);

  // 1. Busca o token antes de qualquer chamada a API
  useEffect(() => {
    getAccessTokenSilently()
      .then((t) => {
        setToken(t);
        setIsAdmin(isAdminToken(t));
      })
      .catch(() => setErro("Não foi possível obter o token de acesso."));
  }, [getAccessTokenSilently]);

  // 2. Com o token em mãos, lista as avaliações (GET: ADMIN e USER)
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/avaliacoes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await mensagemDeErro(response));
      setAvaliacoes(await response.json());
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) carregar();
  }, [token, carregar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  };

  // 3. Cadastro (POST: somente ADMIN)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    const nota = Number(form.nota);
    if (!form.emailAvaliado || form.nota === "") {
      setErro("Preencha o email do avaliado e a nota.");
      return;
    }
    if (!Number.isInteger(nota) || nota < 0 || nota > 10) {
      setErro("A nota deve ser um número inteiro de 0 a 10.");
      return;
    }

    try {
      setEnviando(true);
      const response = await fetch(`${API_URL}/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailAvaliado: form.emailAvaliado,
          comentario: form.comentario,
          nota,
        }),
      });
      if (!response.ok) throw new Error(await mensagemDeErro(response));
      const nova = await response.json();
      setAvaliacoes((anteriores) => [...anteriores, nova]);
      setForm(FORM_VAZIO);
      setSucesso("Avaliação cadastrada!");
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="card header">
        <h1>Avaliações</h1>
        <LogoutButton />
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      {isAdmin ? (
        <div className="card">
          <h2>Nova avaliação</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Email do avaliado
              <input
                type="email"
                name="emailAvaliado"
                value={form.emailAvaliado}
                onChange={handleChange}
                placeholder="pessoa@empresa.com"
              />
            </label>
            <label>
              Nota (0 a 10)
              <input
                type="number"
                name="nota"
                min="0"
                max="10"
                step="1"
                value={form.nota}
                onChange={handleChange}
              />
            </label>
            <label>
              Comentários
              <textarea
                name="comentario"
                rows="3"
                value={form.comentario}
                onChange={handleChange}
              />
            </label>
            <button type="submit" className="btn" disabled={enviando}>
              {enviando ? "Enviando..." : "Cadastrar avaliação"}
            </button>
          </form>
        </div>
      ) : (
        token && (
          <div className="alert alert-info">
            Você pode ver as avaliações. Somente administradores podem cadastrar.
          </div>
        )
      )}

      <div className="card">
        <h2>Avaliações cadastradas</h2>
        {loading ? (
          <p className="muted">Carregando...</p>
        ) : avaliacoes.length === 0 ? (
          <p className="muted">Nenhuma avaliação cadastrada ainda.</p>
        ) : (
          <ul className="lista">
            {avaliacoes.map((a) => (
              <li key={a.id} className="item">
                <div className="item-topo">
                  <span>
                    <strong>{a.emailAvaliador}</strong> avaliou <strong>{a.emailAvaliado}</strong>
                  </span>
                  <span className="nota">{a.nota}/10</span>
                </div>
                {a.comentario && <p>{a.comentario}</p>}
                <p className="muted small">{formatarData(a.dataAvaliacao)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
