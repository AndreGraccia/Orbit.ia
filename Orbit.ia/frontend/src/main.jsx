import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, Check, Copy, Menu, Palette, RotateCw, Sparkles, SquarePen, Square, Trash2, X } from 'lucide-react';
import { THEMES, DEFAULT_THEME, applyTheme } from './themes.js';
import './styles.css';

const WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
const MODEL_LABEL = import.meta.env.VITE_MODEL_LABEL || 'Orbit · multi-agente';
const TIMEOUT_MS = 120000;
const STORE = 'orbit.chats.v1';

const SUGGESTIONS = [
  'Resuma meus últimos e-mails não lidos',
  'Crie um documento com o plano da minha semana',
  'Escreva um script Python que renomeie arquivos em lote',
  'Abra uma issue no GitHub descrevendo um bug'
];

const THEME_KEY = 'orbit.theme';
const savedTheme = () => { try { return localStorage.getItem(THEME_KEY) || DEFAULT_THEME; } catch { return DEFAULT_THEME; } };
applyTheme(savedTheme());

const uid = () => crypto.randomUUID();
const newChat = () => ({ id: uid(), title: 'Nova conversa', messages: [], updated: Date.now() });

function load() {
  try {
    const list = JSON.parse(localStorage.getItem(STORE) || '[]');
    if (Array.isArray(list) && list.length) return list;
  } catch { /* storage blocked or corrupted: start clean */ }
  return [newChat()];
}

function extractText(raw, type) {
  const t = raw.trim();
  if (!t) return '';
  if (type.includes('json') || t[0] === '{' || t[0] === '[') {
    try {
      const j = JSON.parse(t);
      if (typeof j === 'string') return j;
      const o = Array.isArray(j) ? j[0] : j;
      return o?.output ?? o?.text ?? o?.response ?? o?.message ?? o?.data?.output ?? raw;
    } catch { /* plain text */ }
  }
  return raw;
}

async function askAgent(chat, text, signal) {
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, chatInput: text, sessionId: chat.id, source: 'orbit-frontend' }),
    signal
  });
  const body = await res.text();
  const answer = extractText(body, res.headers.get('content-type') || '');
  if (!res.ok) throw new Error(answer.slice(0, 300) || `HTTP ${res.status}`);
  if (!String(answer).trim()) throw new Error('O agente respondeu sem conteúdo.');
  return String(answer);
}

function CopyButton({ text, label }) {
  const [done, setDone] = useState(false);
  const click = () => {
    navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); });
  };
  return <button className="ghost" onClick={click} aria-label={label}>{done ? <Check size={14} /> : <Copy size={14} />}{label === 'Copiar código' ? '' : done ? ' Copiado' : ' Copiar'}</button>;
}

const mdComponents = {
  pre: ({ children }) => {
    const code = children?.props?.children;
    const lang = /language-(\w+)/.exec(children?.props?.className || '')?.[1] || 'código';
    return (
      <div className="codeblock">
        <div className="code-head"><span>{lang}</span><CopyButton text={String(code ?? '')} label="Copiar código" /></div>
        <pre>{children}</pre>
      </div>
    );
  },
  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>
};

function Message({ m, last, onRetry }) {
  if (m.role === 'user') return <div className="msg user"><div className="bubble">{m.content}</div></div>;
  return (
    <div className={`msg assistant ${m.error ? 'err' : ''}`}>
      <div className="avatar"><Sparkles size={15} /></div>
      <div className="body">
        <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{m.content}</ReactMarkdown></div>
        <div className="actions">
          {!m.error && <CopyButton text={m.content} label="Copiar" />}
          {last && <button className="ghost" onClick={onRetry}><RotateCw size={14} /> Tentar novamente</button>}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [chats, setChats] = useState(load);
  const [activeId, setActiveId] = useState(() => chats[0].id);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [theme, setTheme] = useState(savedTheme);
  const [themesOpen, setThemesOpen] = useState(false);
  const abortRef = useRef(null);
  const endRef = useRef(null);
  const taRef = useRef(null);

  const chat = chats.find(c => c.id === activeId) || chats[0];

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(chats.slice(0, 50))); } catch { /* quota/blocked */ }
  }, [chats]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [chat.messages, busy]);
  useEffect(() => {
    const el = taRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 200) + 'px'; }
  }, [input]);
  useEffect(() => {
    const onKey = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); create(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function pickTheme(id) {
    applyTheme(id);
    setTheme(id);
    try { localStorage.setItem(THEME_KEY, id); } catch { /* storage blocked */ }
  }

  const patch = (id, fn) => setChats(cs => cs.map(c => (c.id === id ? { ...fn(c), updated: Date.now() } : c)));

  function create() {
    if (!chat.messages.length) { setDrawer(false); return; }
    const c = newChat();
    setChats(cs => [c, ...cs]);
    setActiveId(c.id);
    setDrawer(false);
  }

  function remove(id) {
    const rest = chats.filter(c => c.id !== id);
    const next = rest.length ? rest : [newChat()];
    setChats(next);
    if (id === activeId) setActiveId(next[0].id);
  }

  async function send(text, { retry = false } = {}) {
    const clean = text.trim();
    if (!clean || busy) return;
    if (!WEBHOOK) {
      patch(chat.id, c => ({ ...c, messages: [...c.messages, { id: uid(), role: 'assistant', error: true, content: 'Defina `VITE_N8N_WEBHOOK_URL` em `frontend/.env` e reinicie o `npm run dev`.' }] }));
      return;
    }
    const snapshot = chat;
    patch(chat.id, c => ({
      ...c,
      title: c.messages.length ? c.title : clean.slice(0, 44),
      messages: retry ? c.messages : [...c.messages, { id: uid(), role: 'user', content: clean }]
    }));
    setInput('');
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timer = setTimeout(() => ctrl.abort('timeout'), TIMEOUT_MS);
    try {
      const answer = await askAgent(snapshot, clean, ctrl.signal);
      patch(snapshot.id, c => ({ ...c, messages: [...c.messages, { id: uid(), role: 'assistant', content: answer }] }));
    } catch (e) {
      // fetch rejects with signal.reason (not AbortError) when abort(reason) is used
      const timedOut = ctrl.signal.reason === 'timeout';
      const reason = ctrl.signal.aborted ? (timedOut ? 'Tempo limite de 120 s excedido.' : 'Resposta interrompida.') : `Falha ao falar com o agente: ${e.message}`;
      patch(snapshot.id, c => ({ ...c, messages: [...c.messages, { id: uid(), role: 'assistant', error: true, content: reason }] }));
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }

  function retry() {
    // Drop trailing assistant message(s) and resend the last user prompt.
    const msgs = [...chat.messages];
    while (msgs.length && msgs[msgs.length - 1].role === 'assistant') msgs.pop();
    const lastUser = msgs[msgs.length - 1];
    if (!lastUser) return;
    patch(chat.id, c => ({ ...c, messages: msgs }));
    send(lastUser.content, { retry: true });
  }

  const empty = chat.messages.length === 0;
  const lastIdx = chat.messages.length - 1;

  return (
    <div className="app">
      <aside className={`side ${drawer ? 'open' : ''}`}>
        <div className="side-top">
          <div className="logo"><Sparkles size={16} /> orbit</div>
          <button className="icon mob" onClick={() => setDrawer(false)} aria-label="Fechar menu"><X size={18} /></button>
        </div>
        <button className="new" onClick={create}><SquarePen size={15} /> Nova conversa <kbd>Ctrl K</kbd></button>
        <div className="label">Conversas</div>
        <nav className="list">
          {chats.filter(c => c.messages.length).map(c => (
            <div key={c.id} className={`item ${c.id === chat.id ? 'on' : ''}`}>
              <button onClick={() => { setActiveId(c.id); setDrawer(false); }}>{c.title}</button>
              <button className="del" onClick={() => remove(c.id)} aria-label="Apagar conversa"><Trash2 size={14} /></button>
            </div>
          ))}
        </nav>
        {themesOpen && (
          <div className="themes">
            {['Orbit', 'Sistemas', 'Extras'].map(g => (
              <React.Fragment key={g}>
                <h4>{g}</h4>
                <div className="sw-row">
                  {THEMES.filter(x => x.group === g).map(x => (
                    <button key={x.id} className={`sw ${x.id === theme ? 'on' : ''}`} title={x.name} aria-label={`Tema ${x.name}`} aria-pressed={x.id === theme} onClick={() => pickTheme(x.id)}>
                      <i style={{ background: x.vars.bg }} /><b style={{ background: x.vars.accent }} />
                    </button>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
        <button className="theme-btn" onClick={() => setThemesOpen(o => !o)} aria-expanded={themesOpen}><Palette size={15} /> Tema: {THEMES.find(x => x.id === theme)?.name}</button>
        <div className="side-foot">Conversas ficam só neste navegador.</div>
      </aside>
      {drawer && <button className="scrim" aria-label="Fechar menu" onClick={() => setDrawer(false)} />}

      <main className="main">
        <header className="top">
          <button className="icon mob" onClick={() => setDrawer(true)} aria-label="Abrir menu"><Menu size={19} /></button>
          <span className="model">{MODEL_LABEL}</span>
          <span className={`pill ${WEBHOOK ? 'ok' : 'off'}`}><i />{WEBHOOK ? 'n8n' : 'sem webhook'}</span>
        </header>

        <section className="scroll">
          {empty ? (
            <div className="hero">
              <div className="orb"><Sparkles size={22} /></div>
              <h1>Como posso ajudar?</h1>
              <div className="chips">
                {SUGGESTIONS.map(s => <button key={s} onClick={() => send(s)}>{s}</button>)}
              </div>
            </div>
          ) : (
            <div className="thread">
              {chat.messages.map((m, i) => <Message key={m.id} m={m} last={i === lastIdx && m.role === 'assistant' && !busy} onRetry={retry} />)}
              {busy && <div className="msg assistant"><div className="avatar pulse"><Sparkles size={15} /></div><div className="body"><div className="typing"><i /><i /><i /></div></div></div>}
              <div ref={endRef} />
            </div>
          )}
        </section>

        <footer className="dock">
          <form className="composer" onSubmit={e => { e.preventDefault(); send(input); }}>
            <textarea ref={taRef} rows={1} value={input} placeholder="Pergunte qualquer coisa…" aria-label="Mensagem"
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input); } }} />
            {busy
              ? <button type="button" className="send stop" onClick={() => abortRef.current?.abort()} aria-label="Parar"><Square size={14} fill="currentColor" /></button>
              : <button type="submit" className="send" disabled={!input.trim()} aria-label="Enviar"><ArrowUp size={18} /></button>}
          </form>
          <p className="fine">O Orbit pode errar. Confira informações importantes antes de agir.</p>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
