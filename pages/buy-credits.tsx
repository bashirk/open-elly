import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Card, Icon, Metric, Subtitle, Title } from '@tremor/react';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Slider } from '../components/ui/slider';
import styles from '../styles/BuyButton.module.css';

const PaystackLinks = [
  'https://paystack.com/pay/zubfy380ha', //min
  // `https://paystack.com/pay/zubfy380ha?email=${encodeURIComponent(gsession.user.email)}`, //min
  'https://paystack.com/pay/-kylnxks08',
  'https://paystack.com/pay/01tus9xbji',
  'https://paystack.com/pay/o85e9hdfx1', //max
];

const BuyButtons = [
  {
    numberOfCredits: 20,
    cost: 5,
  },
  {
    numberOfCredits: 100,
    cost: 20,
  },
  {
    numberOfCredits: 250,
    cost: 35,
  },
  {
    numberOfCredits: 750,
    cost: 80,
  },
];

export default function Pricing() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState([100]);
  const [isClicked, setIsClicked] = useState(false);

  // Function to handle button click
  const handleClick = () => {
    setIsClicked(true);
    // Optional: Add additional functionality for button click
  };

  const [button, setButton] = useState<JSX.Element | null>(
    <a href={PaystackLinks[1]} target="_blank" rel="noopener noreferrer" 
        className={`${styles.buyButton} ${isClicked ? styles.clicked : ''}`} onClick={handleClick}>
      Buy Now
    </a>
  );

  useEffect(() => {
    setButton(
      credits[0] <= 20 ? (
        <a href={PaystackLinks[0]} target="_blank" rel="noopener noreferrer" 
            className={`${styles.buyButton} ${isClicked ? styles.clicked : ''}`} onClick={handleClick}>
          Buy Now
        </a>
      ) : credits[0] <= 100 ? (
        <a href={PaystackLinks[1]} target="_blank" rel="noopener noreferrer" 
            className={`${styles.buyButton} ${isClicked ? styles.clicked : ''}`} onClick={handleClick}>
          Buy Now
        </a>
      ) : credits[0] <= 250 ? (
        <a href={PaystackLinks[2]} target="_blank" rel="noopener noreferrer" 
            className={`${styles.buyButton} ${isClicked ? styles.clicked : ''}`} onClick={handleClick}>
          Buy Now
        </a>
      ) : credits[0] <= 750 ? (
        <a href={PaystackLinks[3]} target="_blank" rel="noopener noreferrer" 
            className={`${styles.buyButton} ${isClicked ? styles.clicked : ''}`} onClick={handleClick}>
          Buy Now
        </a>
      ) : null
    );
  }, [credits]);

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data } = useSWR('/api/remaining', fetcher);

  return (
    <div className="flex mx-auto max-w-7xl overflow-visible flex-col items-center justify-center">
      <Head>
        <title>Get TryElly Credits</title>
      </Head>
      <Script src="https://cdn.paritydeals.com/banner.js" />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4">
        <h1 className="mx-auto max-w-4xl text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Get TryElly Credits
        </h1>
        <Title className="text-zinc-500 dark:text-zinc-400 font-normal mt-6">
          You currently have{' '}
          <span className="font-semibold text-zinc-900 dark:text-white">
            {data?.remainingGenerations}{' '}
            {data?.remainingGenerations > 1 || data?.remainingGenerations === 0
              ? 'credits'
              : 'credit'}
          </span>
          . Purchase more below.
        </Title>
      </main>

      <Title className="dark:text-zinc-200 my-6">
        How many extra credits do you need?
      </Title>
      <div>
        <div className="flex items-baseline space-x-2">
          <Metric className="dark:text-zinc-100">{credits} credits</Metric>
          <Subtitle className="dark:text-zinc-400">
            $
            {credits[0] <= 20
              ? BuyButtons[0].cost
              : credits[0] <= 100
              ? BuyButtons[1].cost
              : credits[0] <= 250
              ? BuyButtons[2].cost
              : credits[0] <= 750
              ? BuyButtons[3].cost
              : null}{' '}
            one time
          </Subtitle>
        </div>
        <Slider
          defaultValue={[100]}
          min={20}
          max={750}
          step={10}
          className="max-w-[288px] my-6"
          value={credits}
          onValueChange={setCredits}
        />
        {/* TODO: Handle the scenario of logged out, need to prompt to log in */}
        {session && button}
      </div>

      <Card className="max-w-[400px] dark:bg-black dark:ring-zinc-800 mt-16">
        <Title className="dark:text-white">What’s included?</Title>
        <ul className="space-y-2 mt-3">
          <li>
            <Icon
              icon={CheckCircleIcon}
              variant="light"
              size="xs"
              color="emerald"
              className="mr-2 dark:bg-emerald-300/20"
            />
            <span className="text-zinc-600 dark:text-zinc-400 dark:text-zinc text-base font-normal">
              Open source interface
            </span>
          </li>
          <li>
            <Icon
              icon={CheckCircleIcon}
              variant="light"
              size="xs"
              color="emerald"
              className="mr-2 dark:bg-emerald-300/20"
            />
            <span className="text-zinc-600 dark:text-zinc-400 dark:text-zinc text-base font-normal">
              .PNG download
            </span>
          </li>
          <li>
            <Icon
              icon={CheckCircleIcon}
              variant="light"
              size="xs"
              color="emerald"
              className="mr-2 dark:bg-emerald-300/20"
            />
            <span className="text-zinc-600 dark:text-zinc-400 dark:text-zinc text-base font-normal">
              PowerPoint exports
            </span>
            <span className="ml-1 text-zinc-400 dark:text-zinc-500 text-base font-normal italic">
              (coming soon)
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
