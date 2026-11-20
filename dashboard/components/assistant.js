// Names and logos of the AI assistants, so every tab shows them the same way.
// Keys are the ids used in the data (GA4 ai_source, HubSpot ai_channel) plus 'google'.
const ASSISTANTS = {
  chatgpt: { name: 'ChatGPT', logo: '/logos/openai.svg' },
  gemini: { name: 'Gemini', logo: '/logos/gemini.svg' },
  perplexity: { name: 'Perplexity', logo: '/logos/perplexity.svg' },
  claude: { name: 'Claude', logo: '/logos/claude.svg' },
  copilot: { name: 'Copilot' },
  google: { name: 'Google', logo: '/logos/google.svg' },
  openai_utm_likely_automated: { name: 'Automated (OpenAI tag)', logo: '/logos/openai.svg', muted: true },
  other_ai: { name: 'Other assistants' },
  other: { name: 'Other' },
};
const find = (id) => ASSISTANTS[String(id ?? '').toLowerCase()] || { name: String(id ?? '–') };
export const assistantName = (id) => find(id).name;

// Logo only. Assistants without a logo file get a neutral initial, so rows still line up.
export function AssistantIcon({ id, size = 16 }) {
  const a = find(id);
  const box = { width: size, height: size };
  if (!a.logo) return <span className="asst-fallback" style={{ ...box, fontSize: Math.round(size * 0.6) }} aria-hidden="true">{a.name.charAt(0)}</span>;
  return <img className={`asst-icon${a.muted ? ' muted' : ''}`} src={a.logo} alt="" {...box} />;
}

// Logo + name, for table cells and list rows
export function Assistant({ id, size = 16 }) {
  return <span className="asst"><AssistantIcon id={id} size={size} />{assistantName(id)}</span>;
}
