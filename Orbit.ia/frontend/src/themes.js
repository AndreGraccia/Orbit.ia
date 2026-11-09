// Temas do Orbit. Os 12 primeiros derivam de ~/.claude/global-design-systems/*.md
// (cores/raios/fontes do frontmatter); "orbit*" e "extras" são originais.
// bg/panel/raise: fundo, barra lateral, cartões · line/line2: bordas · link: cor de links
// r: raio de cartões · rp: raio do composer/botões grandes · mono: fonte de código
const sans = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
const sf = "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', sans-serif";
const mono = "'JetBrains Mono', ui-monospace, Consolas, monospace";

const t = (id, name, group, dark, c, r, rp, font = sans) => ({ id, name, group, dark, vars: { ...c, r: r + 'px', rp: rp + 'px', font, mono } });

export const THEMES = [
  // ── Orbit (original)
  t('orbit', 'Orbit Escuro', 'Orbit', true, { bg: '#0b0c10', panel: '#101118', raise: '#171923', line: '#23252f', line2: '#2f3240', text: '#ecedf2', muted: '#8b8fa0', accent: '#8b7bff', accent2: '#5ec2ff', link: '#5ec2ff' }, 14, 22),
  t('orbit-light', 'Orbit Claro', 'Orbit', false, { bg: '#fafafc', panel: '#f3f3f7', raise: '#ffffff', line: '#e4e5ec', line2: '#d3d5e0', text: '#14151c', muted: '#6a6e80', accent: '#6b5bff', accent2: '#2aa5ee', link: '#4a3fd6' }, 14, 22),

  // ── Design systems globais
  t('linear', 'Linear', 'Sistemas', true, { bg: '#010102', panel: '#0f1011', raise: '#141516', line: '#23252a', line2: '#34343a', text: '#f7f8f8', muted: '#8a8f98', accent: '#5e6ad2', accent2: '#828fff', link: '#828fff' }, 8, 12),
  t('raycast', 'Raycast', 'Sistemas', true, { bg: '#07080a', panel: '#0d0d0d', raise: '#121212', line: '#242728', line2: '#3a3d3f', text: '#f4f4f6', muted: '#9c9c9d', accent: '#ff6161', accent2: '#57c1ff', link: '#57c1ff' }, 10, 16),
  t('supabase', 'Supabase', 'Sistemas', true, { bg: '#1c1c1c', panel: '#171717', raise: '#202020', line: '#2e2e2e', line2: '#3e3e3e', text: '#fafafa', muted: '#9a9a9a', accent: '#3ecf8e', accent2: '#24b47e', link: '#3ecf8e' }, 8, 12),
  t('vercel', 'Vercel', 'Sistemas', false, { bg: '#fafafa', panel: '#ffffff', raise: '#ffffff', line: '#ebebeb', line2: '#d4d4d4', text: '#171717', muted: '#8f8f8f', accent: '#171717', accent2: '#7928ca', link: '#0070f3' }, 12, 12, "'Geist', " + sans),
  t('openai', 'OpenAI', 'Sistemas', false, { bg: '#ffffff', panel: '#fafafa', raise: '#ffffff', line: '#e5e5e5', line2: '#d4d4d4', text: '#000000', muted: '#737373', accent: '#000000', accent2: '#737373', link: '#000000' }, 12, 26),
  t('apple', 'Apple', 'Sistemas', false, { bg: '#ffffff', panel: '#f5f5f7', raise: '#ffffff', line: '#e0e0e0', line2: '#d2d2d7', text: '#1d1d1f', muted: '#7a7a7a', accent: '#0066cc', accent2: '#2997ff', link: '#0066cc' }, 11, 22, sf),
  t('stripe', 'Stripe', 'Sistemas', false, { bg: '#ffffff', panel: '#f6f9fc', raise: '#ffffff', line: '#e3e8ee', line2: '#cbd5e1', text: '#0d253d', muted: '#64748d', accent: '#533afd', accent2: '#f96bee', link: '#533afd' }, 8, 12),
  t('notion', 'Notion', 'Sistemas', false, { bg: '#ffffff', panel: '#f6f5f4', raise: '#ffffff', line: '#e6e6e6', line2: '#d5d3cf', text: '#000000', muted: '#615d59', accent: '#0075de', accent2: '#62aef0', link: '#0075de' }, 8, 12),
  t('figma', 'Figma', 'Sistemas', false, { bg: '#ffffff', panel: '#f7f7f5', raise: '#ffffff', line: '#e6e6e6', line2: '#d0d0d0', text: '#000000', muted: '#6b6b6b', accent: '#000000', accent2: '#c5b0f4', link: '#7a4de0' }, 8, 24),
  t('coinbase', 'Coinbase', 'Sistemas', false, { bg: '#ffffff', panel: '#f7f7f7', raise: '#ffffff', line: '#dee1e6', line2: '#c5cad2', text: '#0a0b0d', muted: '#5b616e', accent: '#0052ff', accent2: '#05b169', link: '#0052ff' }, 12, 24),
  t('cursor', 'Cursor', 'Sistemas', false, { bg: '#f7f7f4', panel: '#efeee8', raise: '#ffffff', line: '#e6e5e0', line2: '#cfcdc4', text: '#26251e', muted: '#807d72', accent: '#f54e00', accent2: '#dfa88f', link: '#d04200' }, 8, 12),
  t('airbnb', 'Airbnb', 'Sistemas', false, { bg: '#ffffff', panel: '#f7f7f7', raise: '#ffffff', line: '#ebebeb', line2: '#c1c1c1', text: '#222222', muted: '#6a6a6a', accent: '#ff385c', accent2: '#e00b41', link: '#c13515' }, 14, 32),

  // ── Extras (novos)
  t('aurora', 'Aurora', 'Extras', true, { bg: '#080a14', panel: '#0c1020', raise: '#12172b', line: '#1e2540', line2: '#2b3459', text: '#e8ecff', muted: '#8a93b8', accent: '#7c5cff', accent2: '#2de2c5', link: '#2de2c5' }, 16, 28),
  t('terminal', 'Terminal', 'Extras', true, { bg: '#050805', panel: '#080d08', raise: '#0c130c', line: '#16261a', line2: '#21402a', text: '#c9f7d0', muted: '#6fa77b', accent: '#39ff7a', accent2: '#b6ff3d', link: '#39ff7a' }, 4, 6, mono),
  t('sunset', 'Sunset', 'Extras', true, { bg: '#120b0f', panel: '#180f14', raise: '#21151b', line: '#33202a', line2: '#4a2f3d', text: '#fdeee6', muted: '#b69a9a', accent: '#ff7a45', accent2: '#ffc15e', link: '#ffc15e' }, 14, 24),
  t('paper', 'Papel', 'Extras', false, { bg: '#f6f1e7', panel: '#efe8da', raise: '#fffdf8', line: '#e0d7c4', line2: '#cbbfa5', text: '#2b2418', muted: '#7a6e58', accent: '#9a3b1f', accent2: '#c9822b', link: '#9a3b1f' }, 6, 14, "'Fraunces', Georgia, 'Times New Roman', serif")
];

export const DEFAULT_THEME = 'orbit';
export const themeById = id => THEMES.find(x => x.id === id) || THEMES[0];

export function applyTheme(id) {
  const th = themeById(id);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(th.vars)) root.style.setProperty('--' + k, v);
  root.style.colorScheme = th.dark ? 'dark' : 'light';
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', th.vars.bg);
  return th;
}
