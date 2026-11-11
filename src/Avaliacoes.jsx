import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

// Em producao, a Vercel repassa /api para o back na EC2 (vercel.json).
const API_URL = "/api/tarefa";

const FORM_VAZIO = { titulo: "", descricao: "", prioridade: "" };

export default function Avaliacoes() {
  const { getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState(FORM_VAZIO);

  // 1. Busca o token antes de qualquer chamada a API
  useEffect(() => {
    getAccessTokenSilently()
      .then(setToken)
      .catch(() => setErro("Não foi possível obter o token de acesso."));
  }, [getAccessTokenSilently]);

  //aq lista as tarefas
  const carregar = useCallback(async () => {
    const response = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) setTarefas(await response.json());
    else setErro(`Erro ${response.status}`);
  }, [token]);

  useEffect(() => {
    if (token) carregar();
  }, [token, carregar]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  //criar tarefa
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(API_URL,{
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
    });
    if (!response.ok) return setErro(`Erro ${response.status}`);
    setErro("");
    setForm(FORM_VAZIO);
    carregar();
    };

    //deletar
    const deletar = async (id) => {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return setErro(`Erro ${response.status}`);
      carregar();
    };

  return (
    <>
      <div className="card header">
        <h1>Tarefas</h1>
        <LogoutButton />
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      {token && (
        <div className="card">
          <h2>Nova tarefa</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Titulo
              <input name="titulo" value={form.titulo} onChange={handleChange} />
            </label>
            <label>
              Descricao
              <textarea name="descricao" rows="3" value={form.descricao} onChange={handleChange} />
            </label>
            <label>
              Prioridade
              <input name="prioridade" value={form.prioridade} onChange={handleChange} />
            </label>
            <button type="submit" className="btn">Criar tarefa</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Tarefas</h2>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Descrição</th>
              <th>Prioridade</th>
              <th>Criada por</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tarefas.map((t) => (
              <tr key={t.id}>
                <td>{t.titulo}</td>
                <td>{t.descricao}</td>
                <td>{t.prioridade}</td>
                <td>{t.emailCriador}</td>
                <td>
                  <button className="btn" onClick={() => deletar(t.id)}>Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
