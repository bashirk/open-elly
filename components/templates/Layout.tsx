import { parse } from 'cookie';
import Link from 'next/link';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import useSWR from 'swr';
import Balance from '../Balance';
import SignIn from '../SignIn';
import ThemeButton from '../molecules/ThemeButton';

const Logo = () => (
<svg
  width="152"
  height="24"
  viewBox="0 0 152 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <style>
    @import url(&apos;https://fonts.googleapis.com/css2?family=Comfortaa:wght@400&display=swap&apos;);
  </style>
  <text x="30" y="20" font-family="Comfortaa" font-size="20" font-weight="700" fill="#9AC8CD">🙃 Elly AI</text>
</svg>
);

export const DefaultLayout: FC<PropsWithChildren> = ({ children }) => {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: credits, isLoading } = useSWR('/api/remaining', fetcher);
  let creditsRemaining = null;

  const [remainingGenerations, setRemainingGenerations] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = parse(document.cookie);

      if (!cookies.chart_generations) {
        document.cookie = `chart_generations=0;path=/;max-age=${
          60 * 60 * 24 * 7
        };samesite=lax`;
      }

      const interval = setInterval(() => {
        const newGenerations = parseInt(
          parse(document.cookie).chart_generations,
          10
        );
        if (newGenerations !== remainingGenerations) {
          setRemainingGenerations(newGenerations);
        }
      }, 1000); // check every second

      return () => clearInterval(interval); // cleanup on component unmount
    }
  }, [remainingGenerations]);

  console.log('credits: ' + credits);
  if (credits?.remainingGenerations != null) {
    creditsRemaining = credits?.remainingGenerations;
  } else {
    creditsRemaining = remainingGenerations;
  }

  return (
    <main className="h-[calc(100vh-48px)]">
      <nav className="w-full flex items-center justify-between h-12 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center space-x-1">
          {creditsRemaining !== undefined && (
              <Balance
                creditsRemaining={creditsRemaining}
                creditsLoading={isLoading}
              />
          )}
          <ThemeButton />
          <SignIn />
        </div>
      </nav>
      <div className="font-normal p-3 md:p-8 h-full bg-white dark:bg-black overflow-y-auto">
        {children}
      </div>
    </main>
  );
};
