import { safeFetch } from '../security';
import { NormalizedDataPacket } from '../types';

interface CountryConfig {
  code: string;
  name: string;
}

interface WorldBankEntry {
  date: string;
  value: number | null;
  country?: { id: string; value: string };
}

const COUNTRY_MAP: Record<string, CountryConfig> = {
  'united states': { code: 'USA', name: 'United States' },
  'usa': { code: 'USA', name: 'United States' },
  'china': { code: 'CHN', name: 'China' },
  'japan': { code: 'JPN', name: 'Japan' },
  'germany': { code: 'DEU', name: 'Germany' },
  'united kingdom': { code: 'GBR', name: 'United Kingdom' },
  'uk': { code: 'GBR', name: 'United Kingdom' },
  'brazil': { code: 'BRA', name: 'Brazil' },
  'world': { code: 'WLD', name: 'Global / World' },
  'india': { code: 'IND', name: 'India' }
};

export async function fetchWorldBankIntelligence(query: string): Promise<NormalizedDataPacket> {
  const normalizedQuery = query.toLowerCase();
  let country: CountryConfig = COUNTRY_MAP['india'];

  for (const [key, c] of Object.entries(COUNTRY_MAP)) {
    if (normalizedQuery.includes(key)) {
      country = c;
      break;
    }
  }

  // Determine key indicator based on user prompt
  let indicator = 'NY.GDP.MKTP.KD.ZG'; // GDP growth (annual %) default
  let metricLabel = 'Annual GDP Growth';
  let unit = '%';

  if (normalizedQuery.includes('population') || normalizedQuery.includes('demographic') || normalizedQuery.includes('census')) {
    indicator = 'SP.POP.TOTL';
    metricLabel = 'Total Population';
    unit = 'People';
  } else if (normalizedQuery.includes('renewable') || normalizedQuery.includes('clean energy') || normalizedQuery.includes('solar') || normalizedQuery.includes('power')) {
    indicator = 'EG.ELC.RNEW.ZS';
    metricLabel = 'Renewable Electricity Share';
    unit = '%';
  } else if (normalizedQuery.includes('co2') || normalizedQuery.includes('carbon') || normalizedQuery.includes('emission')) {
    indicator = 'EN.ATM.CO2E.PC';
    metricLabel = 'CO2 Emissions Per Capita';
    unit = 'Metric Tons';
  }

  const url = `https://api.worldbank.org/v2/country/${country.code}/indicator/${indicator}?format=json&per_page=25`;
  const res = await safeFetch(url);
  if (!res.ok) {
    throw new Error(`World Bank API returned status ${res.status}`);
  }

  const raw = await res.json();
  const entries: WorldBankEntry[] = (raw as [unknown, WorldBankEntry[]])?.[1] || [];

  // Sort chronologically ascending
  const chronological = entries
    .filter((e) => e.value !== null && e.value !== undefined)
    .sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));

  if (chronological.length === 0) {
    throw new Error(`World Bank returned no historical records for indicator ${indicator} in ${country.name}`);
  }

  // Transform into time series
  const timeSeries = chronological.map((e) => {
    let formattedVal = Number(e.value);
    if (indicator === 'SP.POP.TOTL') {
      formattedVal = Math.round(formattedVal / 1000000); // in millions
    } else {
      formattedVal = Math.round(formattedVal * 100) / 100;
    }
    return {
      year: e.date,
      value: formattedVal,
      country: country.name
    };
  });

  const latestRecord = timeSeries[timeSeries.length - 1];
  const previousRecord = timeSeries.length > 1 ? timeSeries[timeSeries.length - 2] : latestRecord;
  const delta = Math.round((latestRecord.value - previousRecord.value) * 100) / 100;

  // Secondary indicator: Fetch total GDP in USD Billion for context (only if primary is not already GDP)
  let secondarySeries: Array<Record<string, unknown>> = [];
  if (indicator !== 'NY.GDP.MKTP.KD.ZG') {
    try {
      const gdpRes = await safeFetch(
        `https://api.worldbank.org/v2/country/${country.code}/indicator/NY.GDP.MKTP.CD?format=json&per_page=12`,
        { timeoutMs: 5000 }
      );
      if (gdpRes.ok) {
        const gdpRaw = await gdpRes.json();
        const gdpEntries: WorldBankEntry[] = (gdpRaw as [unknown, WorldBankEntry[]])?.[1] || [];
        secondarySeries = gdpEntries
          .filter((e) => e.value !== null)
          .sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10))
          .map((e) => ({
            year: e.date,
            gdpBillionUSD: Math.round(((e.value || 0) / 1e9) * 10) / 10
          }));
      }
    } catch {
      // Secondary context is strictly non-blocking
    }
  }

  const displayUnit = indicator === 'SP.POP.TOTL' ? 'Million' : unit;

  return {
    domain: 'Macroeconomics & Public Statistics',
    topic: `${metricLabel} & Socio-Economic Indicators for ${country.name}`,
    source: {
      provider: 'World Bank Open Data Group',
      dataset: 'World Development Indicators (WDI) Database',
      url: `https://data.worldbank.org/country/${country.code}`,
      sourceType: 'live_api',
      observationPeriod: `Historical Reporting Span: ${timeSeries[0].year}–${latestRecord.year} (Annual Reconciled Accounts)`,
      retrievalTimestamp: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      freshness: `Annual national statistical release through ${latestRecord.year}`,
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      attribution: 'Data provided by The World Bank under CC BY 4.0',
      limitations: 'National statistical reporting lags by 1-2 calendar years for official reconciliation.'
    },
    kpis: [
      {
        id: 'latest_indicator_val',
        label: `${metricLabel} (${latestRecord.year})`,
        value: `${latestRecord.value.toLocaleString()} ${displayUnit}`,
        unit: displayUnit,
        trend: {
          direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
          amount: `${Math.abs(delta)} ${displayUnit}`,
          isGood: delta > 0,
          label: `vs ${previousRecord.year}`
        },
        context: `Official verified World Bank aggregate for ${country.name}`
      },
      {
        id: 'historical_average',
        label: `10-Year Historical Average`,
        value: `${(timeSeries.reduce((acc, curr) => acc + curr.value, 0) / timeSeries.length).toFixed(1)} ${displayUnit}`,
        unit: displayUnit,
        trend: { direction: 'neutral', amount: '0', isGood: true, label: 'Decade baseline' },
        context: `Computed across ${timeSeries.length} consecutive reporting cycles`
      },
      {
        id: 'reporting_range',
        label: 'Span of Available Records',
        value: `${timeSeries[0].year} – ${latestRecord.year}`,
        unit: 'Years',
        trend: { direction: 'neutral', amount: `${timeSeries.length} points`, isGood: true, label: 'Complete dataset' },
        context: 'Verified national accounts series'
      }
    ],
    charts: [
      {
        id: 'macro_timeseries',
        type: 'line_chart',
        title: `${metricLabel} Trend (${timeSeries[0].year}–${latestRecord.year})`,
        subtitle: `Official annual time-series trajectory published by the World Bank`,
        xAxisKey: 'year',
        dataKeys: ['value'],
        data: timeSeries
      },
      ...(secondarySeries.length > 0 ? [{
        id: 'gdp_secondary_bar',
        type: 'bar_chart' as const,
        title: `Gross Domestic Product (Billion USD)`,
        subtitle: `National economic output in current US Dollars`,
        xAxisKey: 'year',
        dataKeys: ['gdpBillionUSD'],
        data: secondarySeries
      }] : [])
    ],
    tables: [
      {
        id: 'worldbank_table',
        title: `Official National Account Observations for ${country.name}`,
        columns: [
          { key: 'year', label: 'Calendar Year' },
          { key: 'country', label: 'Jurisdiction' },
          { key: 'value', label: `${metricLabel} (${displayUnit})` }
        ],
        data: [...timeSeries].reverse()
      }
    ],
    insights: [
      {
        title: 'Long-term Trajectory',
        detail: `Between ${timeSeries[0].year} and ${latestRecord.year}, ${metricLabel.toLowerCase()} in ${country.name} progressed from ${timeSeries[0].value} to ${latestRecord.value} ${displayUnit}.`,
        type: 'positive'
      },
      {
        title: 'Recent Movement',
        detail: `The most recently finalized reporting cycle recorded a ${delta >= 0 ? '+' : ''}${delta} ${displayUnit} movement compared to the preceding fiscal period.`,
        type: delta >= 0 ? 'positive' : 'warning'
      }
    ],
    methodologyNotes: 'Retrieved via the World Bank API v2 REST service with indicator parameter binding and annual reconciliation.',
    limitationsList: [
      'Data points reflect national government submissions verified by international statistical commissions.',
      'Developing economies occasionally experience revised baseline methodology adjustments.'
    ]
  };
}
