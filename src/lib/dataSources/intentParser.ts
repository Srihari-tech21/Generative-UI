/**
 * Natural-Language Analytical Intent Parser
 * Dissects incoming user queries to determine:
 * - Analytical subject & objective
 * - Geographic scope (Country, Region, City)
 * - Time period (Forecast, Current, Historical series, TTM)
 * - Required metrics
 * - Target connector selection
 * - Data sufficiency evaluation & explicit assumptions
 */

export interface AnalyticalIntent {
  rawPrompt: string;
  subject: string;
  objective: string;
  geographicScope: {
    locationName: string;
    countryCode?: string;
    isSpecificCityOrState: boolean;
  };
  timePeriod: {
    type: 'live_current' | 'forecast_7day' | 'historical_series' | 'ttm' | 'user_file';
    description: string;
    yearSpan?: string;
  };
  requiredMetrics: string[];
  recommendedConnectorId: 'open_meteo' | 'world_bank' | 'indian_ev_mobility' | 'market_intelligence' | 'user_dataset';
  visualizationStrategy: {
    primaryChartType: 'line_chart' | 'bar_chart' | 'area_chart' | 'pie_chart';
    secondaryChartType?: 'bar_chart' | 'line_chart' | 'area_chart' | 'pie_chart';
    suggestedTitle: string;
    layout: 'grid' | 'stack';
  };
  dataSufficiency: {
    isSufficient: boolean;
    assumptionsUsed: string[];
    suggestedFollowUps?: string[];
  };
}

const GEOGRAPHIC_DICTIONARY: Record<string, { name: string; countryCode?: string; isCityOrState: boolean }> = {
  'andhra pradesh': { name: 'Andhra Pradesh (Amaravati)', countryCode: 'IND', isCityOrState: true },
  'amaravati': { name: 'Amaravati, Andhra Pradesh', countryCode: 'IND', isCityOrState: true },
  'visakhapatnam': { name: 'Visakhapatnam, Andhra Pradesh', countryCode: 'IND', isCityOrState: true },
  'vizag': { name: 'Visakhapatnam, Andhra Pradesh', countryCode: 'IND', isCityOrState: true },
  'maharashtra': { name: 'Maharashtra (Mumbai)', countryCode: 'IND', isCityOrState: true },
  'mumbai': { name: 'Mumbai, Maharashtra', countryCode: 'IND', isCityOrState: true },
  'delhi': { name: 'Delhi (NCT)', countryCode: 'IND', isCityOrState: true },
  'bengaluru': { name: 'Bengaluru, Karnataka', countryCode: 'IND', isCityOrState: true },
  'bangalore': { name: 'Bengaluru, Karnataka', countryCode: 'IND', isCityOrState: true },
  'karnataka': { name: 'Karnataka', countryCode: 'IND', isCityOrState: true },
  'tamil nadu': { name: 'Tamil Nadu (Chennai)', countryCode: 'IND', isCityOrState: true },
  'chennai': { name: 'Chennai, Tamil Nadu', countryCode: 'IND', isCityOrState: true },
  'gujarat': { name: 'Gujarat', countryCode: 'IND', isCityOrState: true },
  'telangana': { name: 'Telangana (Hyderabad)', countryCode: 'IND', isCityOrState: true },
  'hyderabad': { name: 'Hyderabad, Telangana', countryCode: 'IND', isCityOrState: true },
  'india': { name: 'India', countryCode: 'IND', isCityOrState: false },
  'united states': { name: 'United States', countryCode: 'USA', isCityOrState: false },
  'usa': { name: 'United States', countryCode: 'USA', isCityOrState: false },
  'china': { name: 'China', countryCode: 'CHN', isCityOrState: false },
  'japan': { name: 'Japan', countryCode: 'JPN', isCityOrState: false },
  'germany': { name: 'Germany', countryCode: 'DEU', isCityOrState: false },
  'united kingdom': { name: 'United Kingdom', countryCode: 'GBR', isCityOrState: false },
  'uk': { name: 'United Kingdom', countryCode: 'GBR', isCityOrState: false },
  'brazil': { name: 'Brazil', countryCode: 'BRA', isCityOrState: false },
  'france': { name: 'France', countryCode: 'FRA', isCityOrState: false },
  'london': { name: 'London, United Kingdom', countryCode: 'GBR', isCityOrState: true },
  'tokyo': { name: 'Tokyo, Japan', countryCode: 'JPN', isCityOrState: true },
  'new york': { name: 'New York, United States', countryCode: 'USA', isCityOrState: true },
  'paris': { name: 'Paris, France', countryCode: 'FRA', isCityOrState: true }
};

export function parseAnalyticalIntent(prompt: string, hasUploadedFile = false, fileName?: string): AnalyticalIntent {
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // If user uploaded a file, route directly to user dataset
  if (hasUploadedFile) {
    return {
      rawPrompt: clean,
      subject: `Uploaded Tabular Dataset (${fileName || 'Custom File'})`,
      objective: `Extract descriptive statistics, distributions, and column aggregates from ${fileName || 'user data'}.`,
      geographicScope: { locationName: 'User-Provided Scope', isSpecificCityOrState: false },
      timePeriod: { type: 'user_file', description: 'Bound to record timestamps in uploaded file' },
      requiredMetrics: ['Row counts', 'Numerical aggregates', 'Categorical distributions'],
      recommendedConnectorId: 'user_dataset',
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        secondaryChartType: 'line_chart',
        suggestedTitle: `In-Memory Analysis: ${fileName || 'Dataset'}`,
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: true,
        assumptionsUsed: ['Ingested into ephemeral memory; calculations computed across complete row count.']
      }
    };
  }

  // 1. Detect Geographic Scope
  let detectedGeo: { name: string; countryCode?: string; isCityOrState: boolean } = { 
    name: 'India', 
    countryCode: 'IND', 
    isCityOrState: false 
  };
  let geoFound = false;
  const matchedGeos: Array<{ name: string; countryCode?: string; isCityOrState: boolean }> = [];

  for (const [key, geo] of Object.entries(GEOGRAPHIC_DICTIONARY)) {
    if (lower.includes(key)) {
      if (!geoFound) {
        detectedGeo = geo;
        geoFound = true;
      }
      if (!matchedGeos.some(g => g.name === geo.name)) {
        matchedGeos.push(geo);
      }
    }
  }

  const assumptions: string[] = [];

  // Multi-location comparative detection
  if (matchedGeos.length > 1) {
    assumptions.push(`Comparative inquiry across multiple locations detected: ${matchedGeos.map(g => g.name).join(' vs ')}.`);
  }

  // Cross-domain conflicting requirement detection (e.g. EV + Weather)
  if (
    (lower.includes('ev') || lower.includes('electric vehicle')) &&
    (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature'))
  ) {
    assumptions.push('Cross-domain analytical request detected combining EV mobility and meteorology.');
    assumptions.push('Prioritized Indian Clean Mobility registry for EV penetration; meteorological correlation requires separate query or combined CSV upload.');
  }

  // Future year limitation detection (e.g. 2045 or 2050)
  const futureYearMatch = lower.match(/\b(20[3-9]\d|2[1-9]\d{2})\b/);
  if (futureYearMatch) {
    assumptions.push(`Requested horizon (${futureYearMatch[1]}) exceeds official verified historical accounts (~1998–2024); displaying verified historical national accounts without fabricating speculative projections.`);
  }

  // UNSUPPORTED DOMAIN 1: Cryptocurrency & Blockchain Telemetry
  if (
    lower.includes('bitcoin') ||
    lower.includes('crypto') ||
    lower.includes('btc') ||
    lower.includes('ethereum') ||
    lower.includes('blockchain') ||
    lower.includes('hash rate') ||
    lower.includes('mining difficulty')
  ) {
    return {
      rawPrompt: clean,
      subject: 'Cryptocurrency & Blockchain Network Telemetry (Unsupported Registry Domain)',
      objective: 'Address cryptocurrency inquiry within approved data registry boundaries with honest disclosure.',
      geographicScope: { locationName: 'Global Decentralized Networks', isSpecificCityOrState: false },
      timePeriod: { type: 'live_current', description: 'Real-time telemetry outside approved registry' },
      requiredMetrics: ['Hash Rate (EH/s)', 'Network Difficulty', 'Transaction Fees'],
      recommendedConnectorId: 'market_intelligence',
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        suggestedTitle: 'Approved Registry Coverage vs. Cryptocurrency Telemetry',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: [
          'Cryptocurrency and blockchain network telemetry are not included in GenUI’s approved data connector registry.',
          'To visualize crypto data, please upload an export as a CSV or JSON file.',
          'Mapped query to Corporate Financial Benchmark to illustrate available valuation metrics.'
        ],
        suggestedFollowUps: [
          'Upload a CSV file containing your crypto trades or wallet records',
          'Compare technology giants (Apple, Microsoft, Alphabet, Nvidia)',
          'Analyze India GDP growth or economic trajectory'
        ]
      }
    };
  }

  // UNSUPPORTED DOMAIN 2: Deep Space & Interplanetary Telemetry
  if (
    lower.includes('mars') ||
    lower.includes('rover') ||
    lower.includes('astronomy') ||
    lower.includes('exoplanet') ||
    lower.includes('deep space')
  ) {
    return {
      rawPrompt: clean,
      subject: 'Planetary & Deep Space Telemetry (Unsupported Registry Domain)',
      objective: 'Address planetary request within approved registry boundaries with transparent disclosures.',
      geographicScope: { locationName: 'Interplanetary Space', isSpecificCityOrState: false },
      timePeriod: { type: 'live_current', description: 'Extraterrestrial Telemetry' },
      requiredMetrics: ['Atmospheric pressure (Pa)', 'Surface telemetry'],
      recommendedConnectorId: 'open_meteo',
      visualizationStrategy: {
        primaryChartType: 'line_chart',
        suggestedTitle: 'Approved Meteorology Registry vs. Planetary Telemetry',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: [
          'Extraterrestrial planetary telemetry (e.g., Mars Perseverance/Curiosity) is outside the approved terrestrial registry.',
          'Displaying terrestrial Open-Meteo atmospheric modeling with clear disclosure.',
          'You can upload Mars atmospheric datasets as a CSV for in-memory synthesis.'
        ],
        suggestedFollowUps: [
          'Check terrestrial weather in any city (e.g. "Weather in London" or "Weather in Mumbai")',
          'Upload custom Mars telemetry CSV for local visualization'
        ]
      }
    };
  }

  const isEconomicOrFinancial = 
    lower.includes('gdp') || 
    lower.includes('revenue') || 
    lower.includes('economic') || 
    lower.includes('valuation') || 
    lower.includes('profit') || 
    lower.includes('margin') || 
    lower.includes('market cap') ||
    lower.includes('company') ||
    lower.includes('alphabet') ||
    lower.includes('meta') ||
    lower.includes('apple') ||
    lower.includes('microsoft');

  // 2. Weather & Meteorology
  if (
    !isEconomicOrFinancial && (
      lower.includes('weather') ||
      lower.includes('rainfall') ||
      lower.includes('precipitation') ||
      lower.includes('temperature') ||
      lower.includes('climate') ||
      lower.includes('forecast') ||
      lower.includes('monsoon') ||
      (lower.includes('andhra') && !lower.includes('ev') && !lower.includes('vehicle'))
    )
  ) {
    if (!geoFound) {
      detectedGeo = { name: 'Andhra Pradesh (Amaravati)', countryCode: 'IND', isCityOrState: true };
      assumptions.push('No location specified in prompt; defaulted to Andhra Pradesh (Amaravati) meteorological station.');
    }

    return {
      rawPrompt: clean,
      subject: `Atmospheric Conditions for ${detectedGeo.name}`,
      objective: `Analyze real-time ambient temperature, precipitation probability, humidity, and 7-day model projections.`,
      geographicScope: {
        locationName: detectedGeo.name,
        countryCode: detectedGeo.countryCode,
        isSpecificCityOrState: detectedGeo.isCityOrState
      },
      timePeriod: {
        type: 'forecast_7day',
        description: 'Current real-time observation + 7-day numerical forecast'
      },
      requiredMetrics: ['Ambient temperature (°C)', 'Precipitation volume (mm)', 'Relative humidity (%)', 'Wind speed (km/h)'],
      recommendedConnectorId: 'open_meteo',
      visualizationStrategy: {
        primaryChartType: 'line_chart',
        secondaryChartType: 'area_chart',
        suggestedTitle: `Meteorological Outlook for ${detectedGeo.name}`,
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: true,
        assumptionsUsed: assumptions.length > 0 ? assumptions : ['Live telemetry retrieved from Open-Meteo 11km numerical grid model.']
      }
    };
  }

  // 3. Indian EV & Clean Mobility (use word boundary for 'ev' to avoid matching 'revenue')
  const isEV = 
    /\b(ev|evs)\b/i.test(lower) ||
    lower.includes('electric vehicle') ||
    lower.includes('clean mobility') ||
    lower.includes('vahan') ||
    lower.includes('charging station') ||
    lower.includes('charging point') ||
    lower.includes('two wheeler') ||
    lower.includes('three wheeler') ||
    lower.includes('four wheeler') ||
    lower.includes('2-wheeler') ||
    lower.includes('3-wheeler') ||
    lower.includes('4-wheeler') ||
    (lower.includes('vehicle') && (lower.includes('india') || lower.includes('state')));

  if (isEV) {
    const isSpecificState = lower.includes('andhra') || lower.includes('maharashtra') || lower.includes('karnataka');
    if (!isSpecificState) {
      assumptions.push('Analyzed nationwide statutory VAHAN registrations with state leaderboard rankings.');
    }

    return {
      rawPrompt: clean,
      subject: 'Indian Electric Vehicle Market & Charging Infrastructure',
      objective: 'Evaluate EV adoption inflection curves, 2W/3W volume dominance, state-level penetration, and charging network density.',
      geographicScope: {
        locationName: detectedGeo.name,
        countryCode: 'IND',
        isSpecificCityOrState: detectedGeo.isCityOrState
      },
      timePeriod: {
        type: 'historical_series',
        description: '2020–2025 Calendar Years',
        yearSpan: '2020–2025'
      },
      requiredMetrics: ['Annual EV sales', 'Segment volume split (2W, 3W, 4W)', 'State adoption share (%)', 'Public charging points'],
      recommendedConnectorId: 'indian_ev_mobility',
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        secondaryChartType: 'pie_chart',
        suggestedTitle: 'Indian EV Market Landscape & Infrastructure Penetration',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: true,
        assumptionsUsed: assumptions.length > 0 ? assumptions : ['Dataset compiled from official MoRTH VAHAN & BEE public registry filings.']
      }
    };
  }

  // 4. Macroeconomics, GDP, Population, Renewable Energy (World Bank)
  if (
    lower.includes('gdp') ||
    lower.includes('population') ||
    lower.includes('demographic') ||
    lower.includes('renewable') ||
    lower.includes('clean energy') ||
    lower.includes('co2') ||
    lower.includes('emissions') ||
    lower.includes('world bank')
  ) {
    let metricType = 'Annual GDP Growth (%)';
    if (lower.includes('population') || lower.includes('demographic')) {
      metricType = 'Total Population';
    } else if (lower.includes('renewable') || lower.includes('clean energy')) {
      metricType = 'Renewable Electricity Output Share (%)';
    } else if (lower.includes('co2') || lower.includes('emissions')) {
      metricType = 'CO2 Emissions Per Capita (Metric Tons)';
    }

    if (!geoFound) {
      assumptions.push('No country specified; benchmarked national statistics for India (IND).');
    }

    return {
      rawPrompt: clean,
      subject: `${metricType} for ${detectedGeo.name}`,
      objective: `Evaluate long-term national trajectory, decade averages, and annual movements from official World Bank accounts.`,
      geographicScope: {
        locationName: detectedGeo.name,
        countryCode: detectedGeo.countryCode || 'IND',
        isSpecificCityOrState: false
      },
      timePeriod: {
        type: 'historical_series',
        description: '2001–2025 Annual Reporting Window',
        yearSpan: '2001–2025'
      },
      requiredMetrics: [metricType, '10-Year Historical Average', 'YoY Delta'],
      recommendedConnectorId: 'world_bank',
      visualizationStrategy: {
        primaryChartType: 'line_chart',
        secondaryChartType: 'bar_chart',
        suggestedTitle: `${metricType} Trend for ${detectedGeo.name}`,
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: true,
        assumptionsUsed: assumptions.length > 0 ? assumptions : ['World Bank accounts carry standard 1-2 year national statistical reconciliation lag.']
      }
    };
  }

  // 5. Tech Giants & Corporate Market Intelligence
  if (
    lower.includes('company') ||
    lower.includes('tech') ||
    lower.includes('apple') ||
    lower.includes('microsoft') ||
    lower.includes('google') ||
    lower.includes('alphabet') ||
    lower.includes('nvidia') ||
    lower.includes('amazon') ||
    lower.includes('meta') ||
    lower.includes('financial') ||
    lower.includes('valuation') ||
    lower.includes('burn') ||
    lower.includes('runway') ||
    lower.includes('startup')
  ) {
    const isStartup = lower.includes('startup') || lower.includes('burn') || lower.includes('runway') || lower.includes('mrr');

    return {
      rawPrompt: clean,
      subject: isStartup ? 'Startup Operating Ledger & Runway Analytics' : 'Global Technology Giants Financial Architecture',
      objective: isStartup
        ? 'Analyze monthly recurring revenue, operating burn, cash runway, and gross merchandise volume (GMV).'
        : 'Compare market capitalization, TTM revenue scale, net profit margins, and price-to-earnings multiples.',
      geographicScope: {
        locationName: isStartup ? 'India / Domestic Market' : 'Global Capital Markets',
        isSpecificCityOrState: false
      },
      timePeriod: {
        type: isStartup ? 'historical_series' : 'ttm',
        description: isStartup ? 'Trailing 6 Months Operating Ledger' : 'Trailing Twelve Months (TTM) Audited SEC Statements'
      },
      requiredMetrics: isStartup
        ? ['Monthly Recurring Revenue (MRR)', 'Cash Runway (Months)', 'Operating Burn', 'Order Volume']
        : ['Market Capitalization ($B)', 'TTM Revenue ($B)', 'Net Profit Margin (%)', 'P/E Ratio', 'YoY Growth (%)'],
      recommendedConnectorId: 'market_intelligence',
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        secondaryChartType: isStartup ? 'line_chart' : 'bar_chart',
        suggestedTitle: isStartup ? 'Startup Unit Economics & Operating Velocity' : 'Comparative Technology Financial Benchmark',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: true,
        assumptionsUsed: isStartup
          ? ['Accrual accounting ledger reconciled with payment gateway receipts.']
          : ['Figures derived from audited GAAP SEC 10-K/10-Q disclosures and trailing consensus.']
      }
    };
  }

  // Fallback for general or ambiguous queries:
  // Use intelligent default with explicit documented assumptions
  return {
    rawPrompt: clean,
    subject: `Macroeconomic Overview for ${detectedGeo.name}`,
    objective: `Examine macroeconomic growth, annual trajectory, and national accounts for ${detectedGeo.name}.`,
    geographicScope: {
      locationName: detectedGeo.name,
      countryCode: detectedGeo.countryCode || 'IND',
      isSpecificCityOrState: false
    },
    timePeriod: {
      type: 'historical_series',
      description: 'Official Annual Reporting Series'
    },
    requiredMetrics: ['Annual GDP Growth (%)', 'Total GDP (USD Billion)', '10-Year Average'],
    recommendedConnectorId: 'world_bank',
    visualizationStrategy: {
      primaryChartType: 'line_chart',
      secondaryChartType: 'bar_chart',
      suggestedTitle: `Economic Intelligence for ${detectedGeo.name}`,
      layout: 'grid'
    },
    dataSufficiency: {
      isSufficient: true,
      assumptionsUsed: [
        `Prompt "${clean}" was mapped to macroeconomic national accounts for ${detectedGeo.name}.`,
        'For specific climate or corporate indicators, include keywords like "weather", "EV", or "tech companies".'
      ]
    }
  };
}
