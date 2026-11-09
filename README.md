# Orbit — agente pessoal de IA

Chat React/Vite conectado a um workflow **n8n multi-agente** (orquestrador + subagentes de Docs/Gmail/Drive e de código/GitHub), usando modelos **gratuitos** do OpenRouter.

```
Frontend (React) ──POST /webhook/orbit-chat──▶ n8n
                                               ├─ Orquestrador (memória por sessão)
                                               ├─ agente_workspace_docs → Docs · Drive · Gmail
                                               └─ agente_dev_codigo     → GitHub issues
```

## Rodar em 5 passos

Requisitos: Docker Desktop e Node.js LTS.

```bash
# 1. Segredos do backend
cp .env.example .env        # troque todo CHANGE_ME por valores aleatórios

# 2. n8n + PostgreSQL
docker compose up -d        # pgAdmin é opcional: docker compose --profile admin up -d

# 3. Frontend
cd frontend && cp .env.example .env && npm install && npm run dev   # http://localhost:5173
```

4. Abra `http://localhost:5678`, crie o usuário dono e **importe** `Mente_de_IAs_Estrutura_n8n.json`.
5. Crie a credencial **OpenAI API** com `Base URL = https://openrouter.ai/api/v1` e sua chave do OpenRouter (grátis), selecione-a nos 3 nós `modelo-*`, conecte Google/GitHub se quiser as ferramentas e **ative** o workflow.

> Sem a chave/credencial, o chat funciona mas responde com um erro amigável (HTTP 502) — é o comportamento esperado.

## Modelos gratuitos (OpenRouter)

Atual, por papel (verificado na API do OpenRouter; todos com suporte a *tool calling*):

| Papel | Modelo | Por quê |
|---|---|---|
| Orquestrador | `nvidia/nemotron-3-ultra-550b-a55b:free` | maior raciocínio, 1M de contexto |
| Docs/Gmail/Drive | `nvidia/nemotron-3.5-lightning:free` | rápido, tarefas curtas de ferramenta |
| Código | `cohere/north-mini-code:free` | afinado para código |

Alternativas gratuitas com *tools*: `google/gemma-4-31b-it:free` (generalista forte, 262k), `google/gemma-4-26b-a4b-it:free` (mais rápido), `nvidia/nemotron-3.5-super-vl:free` (1M, visão), `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` (leve, raciocínio). Modelos `:free` mudam e têm limite de requisições; se um falhar, troque o campo *Model* do nó. Lista atual: `https://openrouter.ai/api/v1/models` (filtre `:free`).

## O que o workflow faz

- Memória isolada por conversa (`sessionId` enviado pelo frontend; subagentes com sufixo próprio).
- Subagentes recebem a tarefa real via `$fromAI` (antes recebiam um texto fixo).
- Falhas do modelo/ferramentas → resposta JSON `502` tratada pelo chat.
- Gmail limitado a 10 mensagens; ferramenta Git removida (inútil dentro do Docker).
- CORS restrito a `localhost:5173`; ajuste `N8N_CORS_ALLOW_ORIGIN` e `allowedOrigins` do webhook ao publicar.

## Infra

- Imagens fixadas (`n8n 2.46.6`, `postgres 16.6`, `pgadmin 8.14`), healthcheck no n8n, portas só em `127.0.0.1`, limite de payload e timeout de execução, poda de execuções (7 dias).
- Projeto Compose chama-se `orbit`; volumes de versões anteriores (`n8n-agent_*`) não são tocados. Se o n8n reiniciar em loop com *Mismatching encryption keys*, o volume é de outra chave: use o projeto novo ou restaure a chave antiga.

## Segurança

- Nunca faça commit do `.env`. Segredos que já estiveram no Git devem ser rotacionados.
- Não exponha n8n/pgAdmin à internet sem autenticação. CORS não é autenticação.
- Histórico do chat fica no `localStorage` do navegador (até 50 conversas).

