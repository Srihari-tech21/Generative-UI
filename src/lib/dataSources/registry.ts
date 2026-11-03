import { DataConnector } from './types';

export const DATA_CONNECTORS_REGISTRY: Record<string, DataConnector> = {
  open_meteo: {
    id: 'open_meteo',
    name: 'Open-Meteo Meteorological Service',
    type: 'live_api',
    description: 'Free global atmospheric and numerical weather prediction service covering current conditions, hourly series, and 7-day forecasts.',
    domains: ['Weather', 'Climate', 'Rainfall', 'Agriculture', 'Temperature', 'Meteorology'],
    endpoints: ['https://api.open-meteo.com/v1/forecast', 'https://geocoding-api.open-meteo.com/v1/search'],
    requiresAuth: false,
    rateLimit: '10,000 calls/day per IP',
    attribution: 'Weather data by Open-Meteo.com under CC BY 4.0',
    observationPeriod: 'Live real-time observation and rolling 7-day model projections',
    freshness: 'Hourly live observations & rolling 7-day model projections',
    limitations: 'Spatial grid resolution ~11km; localized terrain micro-climates may vary slightly.'
  },
  world_bank: {
    id: 'world_bank',
    name: 'The World Bank Open Data Group',
    type: 'live_api',
    description: 'Authoritative national development indicators including GDP growth, population demographics, renewable energy share, and CO2 emissions.',
    domains: ['Economics', 'Demographics', 'Population', 'Renewable Energy', 'CO2 Emissions', 'Global Development'],
    endpoints: ['https://api.worldbank.org/v2/country/{country}/indicator/{indicator}'],
    requiresAuth: false,
    rateLimit: 'Unmetered public development API with standard backoff',
    attribution: 'World Development Indicators, The World Bank (CC BY 4.0)',
    observationPeriod: 'Annual national accounts series through latest finalized reporting cycle (typically 1-2 year lag)',
    freshness: 'Annual national accounts updated through the latest finalized reporting cycle',
    limitations: 'Official national statistics typically carry a 1-year publication reconciliation lag.'
  },
  indian_ev_mobility: {
    id: 'indian_ev_mobility',
    name: 'VAHAN e-Services & Bureau of Energy Efficiency (BEE)',
    type: 'curated_dataset',
    description: 'National and state-wise electric vehicle adoption statistics, vehicle segment breakdown (2W, 3W, 4W), and public charging station density across India.',
    domains: ['Electric Vehicles', 'EV Market', 'Clean Mobility', 'Automotive', 'Renewable Energy', 'India Infrastructure'],
    endpoints: ['https://vahan.parivahan.gov.in', 'https://beeindia.gov.in'],
    requiresAuth: false,
    rateLimit: 'Official public register and Open Data Portal',
    attribution: 'Ministry of Road Transport & Highways (MoRTH) & BEE India',
    observationPeriod: 'Consolidated statutory vehicle registration filings (2020–2025 calendar years)',
    freshness: 'Curated benchmark from consolidated vehicle registration filings',
    limitations: 'Excludes unorganized non-registered low-speed (<25km/h) battery vehicles and military fleet.'
  },
  market_intelligence: {
    id: 'market_intelligence',
    name: 'SEC Filings & Market Consensus Intelligence',
    type: 'curated_dataset',
    description: 'Audited GAAP quarterly 10-K/10-Q corporate financial statements, technology company comparisons, startup unit economics, and e-commerce GMV velocity.',
    domains: ['Finance', 'Tech Companies', 'Startup Financials', 'E-Commerce', 'Revenue & Burn', 'Valuation'],
    endpoints: ['https://www.sec.gov/edgar'],
    requiresAuth: false,
    rateLimit: 'Standard public EDGAR SEC fair use guidelines',
    attribution: 'SEC EDGAR Filings & Audited Corporate Statements',
    observationPeriod: 'Audited Trailing Twelve Months (TTM) SEC 10-K/10-Q & monthly close metrics',
    freshness: 'Trailing twelve months (TTM) audited figures and reconciled monthly ledgers',
    limitations: 'Calculations based on GAAP trailing twelve months; intraday stock prices fluctuate continuously.'
  },
  user_dataset: {
    id: 'user_dataset',
    name: 'In-Memory User File Processor (CSV/JSON)',
    type: 'user_upload',
    description: 'Safe in-memory ingestion and analysis of user-uploaded structured business datasets without permanent cloud database persistence.',
    domains: ['Custom Datasets', 'Uploaded Files', 'CSV Analysis', 'JSON Metrics'],
    endpoints: ['Local client/server in-memory stream'],
    requiresAuth: false,
    rateLimit: 'Client/server in-memory execution up to 5MB file size',
    attribution: 'User-provided proprietary dataset',
    observationPeriod: 'Defined dynamically by the uploaded file data points',
    freshness: 'Instantaneous parsing at moment of file upload',
    limitations: 'Data retained exclusively in memory for the active user session; zero permanent database persistence.'
  }
};
