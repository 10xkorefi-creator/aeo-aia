'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hint } from '@/components/info';

// Active tab is marked instantly (no animation): navigation is used many times a day.
export function NavLinks({ tabs, tips = {} }) {
  const path = usePathname();
  return (
    <nav>
      {tabs.map(([href, label]) => {
        const active = href === '/' ? path === '/' : path.startsWith(href);
        return <Hint key={href} tip={tips[href]}><Link href={href} aria-current={active ? 'page' : undefined}>{label}</Link></Hint>;
      })}
    </nav>
  );
}
