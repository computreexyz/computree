import { useEffect, useState } from 'react';

/** Tracks the `.dark` class on <html> so charts can pick ink colors. */
export function useIsDark(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

export function useChartInk() {
  const dark = useIsDark();
  return {
    ink: dark ? '#e6ebf0' : '#151a21',
    line: dark ? 'hsl(217 15% 23%)' : '#dfe3e7',
    meta: dark ? 'hsl(215 10% 65%)' : '#79838e',
    blue: '#4489e5',
  };
}
