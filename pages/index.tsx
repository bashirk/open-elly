import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BookmarkSquareIcon,
  SparklesIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Callout,
  Card,
  Col,
  Color,
  Divider,
  Grid,
  Subtitle,
  Text,
  Title,
} from '@tremor/react';
import axios from 'axios';
import concat from 'concat-stream';
import GifEncoder from 'gif-encoder';
import JSZip from 'jszip';
import download from 'downloadjs';
import { toPng } from 'html-to-image';
import { NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';
import Chart from '../components/ChartComponent';
import LoadingDots from '../components/LoadingDots';
import { GreenOrb, OrangeOrb, WhiteOrb } from '../components/atoms/Orbs';
import { IconColor, Select } from '../components/atoms/Select';
import { TextArea } from '../components/atoms/TextArea';
import { Toggle } from '../components/atoms/Toggle';

const SectionHeader = ({
  stepNumber,
  title,
}: {
  stepNumber: number;
  title: string;
}) => {
  return (
    <div className="flex items-center">
      <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-500 font-semi-bold font-mono mr-2 h-6 w-6 rounded-full flex items-center justify-center">
        {stepNumber}
      </div>
      <Subtitle className="text-gray-700 dark:text-gray-300">{title}</Subtitle>
    </div>
  );
};

const CHART_TYPES = [
  'area',
  'bar',
  'line',
  'composed',
  'scatter',
  'pie',
  'radar',
  'radialbar',
  'treemap',
  'funnel',
];

const NewHome: NextPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(false);
  const [shouldRenderChart, setShouldRenderChart] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [chartColor, setChartColor] = useState<Color>('blue');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dataSource, setDataSource] = useState('Statista');

  const chartComponent = useMemo(() => {
    return (
      <Chart
        data={chartData}
        chartType={chartType}
        color={chartColor as Color}
        showLegend={showLegend}
      />
    );
  }, [chartData, chartType, chartColor, showLegend]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(event.target.value);
    },
    []
  );

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    setError(false);
    setIsLoading(true);

    try {
      const chartTypeResponse = await axios.post('/api/get-type', {
        inputData: inputValue,
      });

      console.log({ res: chartTypeResponse.data });

      const session = await getSession();

      if (!CHART_TYPES.includes(chartTypeResponse.data.toLowerCase()))
        return setError(true);

      setChartType(chartTypeResponse.data);

      const libraryPrompt = `Find data about ${inputValue} and you have to include data source where you get this data from, do not include data source in JSON, but add as text below`;

      const chartDataResponse = await axios.post('/api/parse-graph', {
        prompt: libraryPrompt,
        session: session,
      });

      // Extract JSON from the initial data
      const parsedJSON = await axios.post('/api/get-json', {
        inputData: chartDataResponse.data,
        chart: chartType,
      });

      // Extract data source from the text
      const dataSource = await axios.post('/api/get-source', {
        inputData: chartDataResponse.data,
      });

      console.log('JSON:' + parsedJSON.data);
      setDataSource(dataSource.data);
      setChartData(parsedJSON.data);
      setChartType(chartTypeResponse.data);
      setShouldRenderChart(true);
    } catch (error) {
      setError(true);
      console.error('Failed to generate graph data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadClick = async (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) {
      return;
    }
    toPng(element).then(function (dataUrl) {
      download(dataUrl, 'chart.png');
    });
  };

  const pixelsToGIF = (pixels, width, height) =>
    new Promise((resolve, reject) => {
      const gif = new GifEncoder(width, height);
      gif.pipe(concat(resolve));
      gif.writeHeader();
      gif.addFrame(pixels);
      gif.finish();
      gif.on('error', reject);
    });
  
  const downloadChartAsGIF = async (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) {
      return;
    }
  
    try {
      const { width, height } = element.getBoundingClientRect();
      const pixels = await domtoimage.toPixelData(element, { width, height });
      const gif = await pixelsToGIF(pixels, width, height);
      const zip = new JSZip();
      zip.file('chart.gif', gif);
      const blob = await zip.generateAsync({ type: 'blob' });
      download(blob, 'chart.gif', 'image/gif');
    } catch (e) {
      console.error('Could not export to GIF:', e);
    }
  };

  const handleGIFDownloadClick = async (selector: string) => {
    await downloadChartAsGIF(selector);
  };

  return (
    <div className="dark:bg-[#0c2b35] dark:bg-[radial-gradient(#0c2b35_1px,#000000_1px)] bg-[size:20px_20px]">
    <Grid
      numCols={1}
      numColsSm={2}
      numColsLg={3}
      className="gap-y-4 lg:gap-x-4 h-full"
    >
      <aside className="h-full shrink-0 w-full flex flex-col justify-between lg:col-span-1 col-span-2 order-last lg:order-first">
        <form id="generate-chart" onSubmit={handleSubmit} className="space-y-4">
          <SectionHeader
            stepNumber={1}
            title="What would you like to visualize?"
          />
          <TextArea
            id="input"
            name="prompt"
            placeholder="Show me a bar chart with COVID-19 cases in London in March 2020..."
            value={inputValue}
            required
            autoFocus
            onChange={handleInputChange}
            onKeyDown={event => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                handleSubmit(event);
              }
            }}
          />

            {/* divider component to break sections with gaps */}
          {/* <div className="py-2">
            <Divider className="h-px dark:bg-black" />
          </div> */}

          <SectionHeader stepNumber={2} title="Use the options below to adjust your chart presentation" />
          <div>
            <Text className="text-black-500 mb-1 dark:text-zinc-400">Select your chart style</Text>
            <Select
              name="chart-type"
              value={chartType}
              onValueChange={setChartType}
              items={[
                { value: 'pie', textValue: 'Pie Chart' },
                { value: 'scatter', textValue: 'Scatter Chart' },
                { value: 'radar', textValue: 'Radar Chart' },
                { value: 'radialbar', textValue: 'Radial Bar Chart' },
                { value: 'treemap', textValue: 'Treemap' },
                { value: 'funnel', textValue: 'Funnel Chart' },
                { value: 'bar', textValue: 'Bar Chart' },
                { value: 'area', textValue: 'Area Chart' },
                { value: 'line', textValue: 'Line Chart' },
                { value: 'composed', textValue: 'Composed Chart' },
              ]}
            />
          </div>
          <div>
            <label
              htmlFor="title"
              className="text-black-500 dark:text-zinc-400 text-sm font-normal select-none	mb-3"
            >
              Set Color
            </label>
            <Select
              value={chartColor as Color}
              onValueChange={value => setChartColor(value as Color)}
              leftIcon={SwatchIcon}
              leftIconColor={chartColor as IconColor}
              items={[
                { value: 'green', textValue: 'Green' },
                { value: 'pink', textValue: 'Pink' },
                { value: 'blue', textValue: 'Blue' },
                { value: 'purple', textValue: 'Purple' },
                { value: 'yellow', textValue: 'Yellow' },
              ]}
            />
          </div>

          <div className="flex justify-between w-full">
            <label
              htmlFor="title"
              className="text-black-500 dark:text-zinc-400 text-sm font-normal select-none	"
            >
              Include Title
            </label>
            <Toggle
              id="title"
              size="sm"
              label="Show chart Title"
              checked={showTitle}
              setChecked={setShowTitle}
            />
          </div>
          <div className="flex justify-between w-full pb-6">
            <label
              htmlFor="legend"
              className="text-black-500 dark:text-zinc-400 text-sm font-normal select-none"
            >
              Include Legend
            </label>
            <Toggle
              id="legend"
              size="sm"
              label="Show chart Legend"
              checked={showLegend}
              setChecked={setShowLegend}
            />
          </div>
          
          <Button
            type="submit"
            form="generate-chart"
            className="w-full cursor-pointer py-2 px-4 mt-4 rounded-full blue-button-w-gradient-border [text-shadow:0_0_1px_rgba(0,0,0,0.25)] shadow-2xl items-center justify-center false"
            icon={SparklesIcon}
          >
            Generate Visual
          </Button>
        </form>
      </aside>

      <Col numColSpan={1} numColSpanSm={2} numColSpanMd={2} className="h-full">
      {/* original css */}
      {/* <div className="bg-zinc-100 h-fit sm:h-[calc(100%-100px)] rounded-md py-12 lg:py-4 px-4 border border-zinc-200 dark:border-zinc-900 dark:bg-black dot-grid-gradient-light dark:dot-grid-gradient-dark flex justify-center items-center relative"> */}
      <div className="relative h-full w-full bg-zinc dark:bg-black">
      <div className="bg-zinc-100 dark:bg-black h-fit sm:h-[calc(100%-100px)] rounded-md py-12 lg:py-4 px-4 border border-zinc-200 dark:border-zinc-900 flex justify-center items-center relative">
          {error ? (
            <Callout
              className="my-6"
              title="Something went wrong! Common issues:"
              color="rose"
            >
              <ul className="list-disc list-inside">
                <li>
                  Quota issues, make sure you have enough
                  <Link
                    href="/buy-credits"
                    className="hover:text-red-500 underline decoration-dotted underline-offset-2 mx-1"
                  >
                    Credits
                  </Link>
                </li>
                <li>Try modifying the prompt, make it as clear as possible </li>
                <li>
                  Make sure you are using the correct format for your chart type
                </li>
                <li>
                  AI model could be hallucinating, in this case, please, try
                  again
                </li>
              </ul>
            </Callout>
          ) : (
            <div className="w-full max-w-full p-3 md:p-4">
              {!isLoading && !shouldRenderChart && selectedIndex !== 1 ? (
                <div className="text-left font-medium text-sm max-w-fit mx-auto">
                  Some ideas to try:
                  <ul className="list-disc list-inside">
                    <li className="text-zinc-500 dark:text-zinc-400 text-sm font-normal ">
                      Top 3 market leaders in the sneaker industry by millions
                      in market share
                    </li>
                    <li className="text-zinc-500 dark:text-zinc-400 text-sm font-normal ">
                      Distribution of renewable energy sources in the United
                      States by percentage
                    </li>
                    <li className="text-zinc-500 dark:text-zinc-400 text-sm font-normal ">
                      Average annual rainfall in major cities around the world
                      in cm
                    </li>
                  </ul>
                </div>
              ) : (
                !isLoading &&
                !shouldRenderChart &&
                selectedIndex === 1 && (
                  <div className="text-center">
                    PowerPoint exports coming soon!
                  </div>
                )
              )}

              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <LoadingDots />
                </div>
              ) : (
                shouldRenderChart && (
                  <Card
                    id="chart-card"
                    className="bg-white dark:bg-black dark:ring-zinc-800 w-full"
                  >
                    {showTitle && (
                      <Title className="dark:text-white text-base sm:text-lg">
                        {inputValue}
                      </Title>
                    )}
                    {!showLegend && <div className="h-5" />}
                    {chartComponent}
                    <Subtitle className="dark:text-white flex items-center justify-left text-xs sm:text-base">
                      <BookmarkSquareIcon
                        height={20}
                        width={20}
                        className="mr-3 shrink-0"
                      />
                      {dataSource}
                    </Subtitle>
                  </Card>
                )
              )}
            </div>
          )}
          <div className="flex absolute bottom-4 right-6 space-x-4">
            {(chartData == undefined || chartData?.length > 0) && (
              <Button
                variant="light"
                color="gray"
                icon={ArrowPathIcon}
                className="dark:text-zinc-100 dark:hover:text-zinc-300 outline-none"
                type="submit"
                form="generate-chart"
              >
                Retry
              </Button>
            )}
            {shouldRenderChart && (
              <Button
                size="xs"
                color="gray"
                icon={ArrowDownTrayIcon}
                className="dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 outline-none"
                onClick={() => handleDownloadClick('#chart-card')}
              >
                Download (PNG)
              </Button>
            )}
            {shouldRenderChart && (
              <Button
                size="xs"
                color="gray"
                icon={ArrowDownTrayIcon}
                className="dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 outline-none"
                onClick={() => handleGIFDownloadClick('#chart-card')}
              >
                Download (GIF)
              </Button>
            )}
          </div> 
      </div>
  </div>
      </Col>
    </Grid>
  </div>
  );
};

export default NewHome;
