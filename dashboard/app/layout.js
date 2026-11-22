import './globals.css';
import { NavLinks } from '@/components/nav';
import { TipProvider } from '@/components/info';
import { RunDialog } from '@/components/run-dialog';
import { tabs as tabTips } from '@/lib/glossary';

export const metadata = { title: 'AEO Baseline', description: 'AI Accountant visibility in ChatGPT, Gemini, Perplexity and Google AI Overviews', robots: { index: false, follow: false } };

const tabs = [
  ['/', 'Overview'],
  ['/recommendations', 'Recommendations'],
  ['/assistants', 'AI assistants'],
  ['/ai-overviews', 'Google AI Overviews'],
  ['/traffic', 'Visits & leads'],
  ['/lists', 'Prompts & keywords'],
  ['/runs', 'Runs & raw data'],
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TipProvider>
        <header className="top">
          <div className="brand">AEO Baseline <span>· AI Accountant · India</span></div>
          <NavLinks tabs={tabs} tips={tabTips} />
          <RunDialog />
        </header>
        <main>{children}</main>
        <footer>Data: Supabase aeo_* tables · capture via treg (cloro, DataForSEO) · every number traces to a run_id and raw response.</footer>
        </TipProvider>
      </body>
    </html>
  );
}
