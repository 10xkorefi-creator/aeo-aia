import { redirect } from 'next/navigation';

// ChatGPT now lives on the AI assistants page next to Gemini and Perplexity. Old links keep working.
export default async function ChatGPT({ searchParams }) {
  const sp = await searchParams;
  redirect(`/assistants?engine=chatgpt${sp?.run ? `&run=${encodeURIComponent(sp.run)}` : ''}`);
}
