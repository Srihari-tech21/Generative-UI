/**
 * Natural-Language Analytical Intent Parser & Relevance Classifier
 * Dissects incoming user queries to determine:
 * - Analytical subject & objective
 * - Domain and subdomain classification
 * - Strict relevance validation against registered data connectors
 * - Structured response state (SUCCESS, DATASET_REQUIRED, UNSUPPORTED_DOMAIN, CLARIFICATION_REQUIRED, NO_DATA_FOUND)
 * - Geographic scope (Country, Region, City)
 * - Time period (Forecast, Current, Historical series, TTM, User File)
 * - Multi-metric and multi-requirement extraction
 * - Data sufficiency evaluation & explicit assumptions
 */

export type PipelineResponseState =
  | 'SUCCESS'
  | 'DATASET_REQUIRED'
  | 'UNSUPPORTED_DOMAIN'
  | 'CLARIFICATION_REQUIRED'
  | 'NO_DATA_FOUND'
  | 'DATA_SOURCE_ERROR';

export interface StructuredGuidance {
  state: PipelineResponseState;
  title?: string;
  message: string;
  suggestedActions?: string[];
  suggestedPrompts?: string[];
  detectedDomain?: string;
  detectedSubdomain?: string;
  domain?: string;
  subdomain?: string;
  actionRequired?: 'UPLOAD_DATASET' | 'REFINE_PROMPT' | 'CHOOSE_ALTERNATIVE' | 'NONE';
  supportedConnectors?: string[];
  missingParameters?: string[];
  matchedCatalogDatasetId?: string;
}

export interface DomainClassification {
  domain: 
    | 'meteorology'
    | 'macroeconomics'
    | 'demographics'
    | 'renewable_energy'
    | 'indian_ev_mobility'
    | 'corporate_finance'
    | 'restaurant_hospitality'
    | 'academic_performance'
    | 'human_resources'
    | 'ecommerce_sales'
    | 'user_upload'
    | 'unsupported'
    | 'ambiguous';
  subdomain: string;
  isApprovedLiveConnector: boolean;
  isDatasetRequired: boolean;
  requiresFile: boolean;
}

export interface AnalyticalIntent {
  rawPrompt: string;
  status: PipelineResponseState;
  guidance?: StructuredGuidance;
  domainClassification: DomainClassification;
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
  multiRequirements: string[];
  recommendedConnectorId?: 'open_meteo' | 'world_bank' | 'indian_ev_mobility' | 'market_intelligence' | 'user_dataset';
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
  'uttar pradesh': { name: 'Uttar Pradesh', countryCode: 'IND', isCityOrState: true },
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

export function parseAnalyticalIntent(
  prompt: string,
  hasUploadedFile = false,
  fileName?: string
): AnalyticalIntent {
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // -------------------------------------------------------------------------
  // 1. IF USER ATTACHED A FILE: Directly route to in-memory dataset processor
  // -------------------------------------------------------------------------
  if (hasUploadedFile) {
    return {
      rawPrompt: clean,
      status: 'SUCCESS',
      domainClassification: {
        domain: 'user_upload',
        subdomain: fileName || 'tabular_data',
        isApprovedLiveConnector: false,
        isDatasetRequired: true,
        requiresFile: true
      },
      subject: `Uploaded Tabular Dataset (${fileName || 'Custom File'})`,
      objective: `Extract descriptive statistics, distributions, and column aggregates from ${fileName || 'user data'}.`,
      geographicScope: { locationName: 'User-Provided Scope', isSpecificCityOrState: false },
      timePeriod: { type: 'user_file', description: 'Bound to record timestamps in uploaded file' },
      requiredMetrics: ['Row counts', 'Numerical aggregates', 'Categorical distributions'],
      multiRequirements: ['Descriptive statistics', 'Distribution charts', 'Tabular register preview'],
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

  // -------------------------------------------------------------------------
  // 2. CHECK FOR AMBIGUOUS OR VAGUE QUERIES (CLARIFICATION_REQUIRED)
  // -------------------------------------------------------------------------
  const words = clean.split(/\s+/).filter(Boolean);
  const isVague =
    words.length <= 1 ||
    clean === '' ||
    ['dashboard', 'analytics', 'data', 'charts', 'report', 'trends', 'show me', 'kpi', 'analysis', 'test'].includes(lower);

  if (isVague) {
    return {
      rawPrompt: clean,
      status: 'CLARIFICATION_REQUIRED',
      guidance: {
        state: 'CLARIFICATION_REQUIRED',
        title: 'Analytical Scope Clarification Required',
        message: 'Your request is too broad or ambiguous to select a relevant data source. Please specify the subject, metrics, or geographic scope you wish to analyze, or attach a dataset.',
        suggestedActions: [
          'Specify an analytical question (e.g. "Show India GDP growth" or "Weather in Mumbai")',
          'Attach a CSV or JSON dataset for instant in-memory analysis'
        ],
        suggestedPrompts: [
          'Show India GDP growth and macroeconomic trajectory',
          'Compare current weather between Mumbai and Delhi',
          'Break down electric vehicle market share in India',
          'Compare financial performance of Microsoft, Apple, and Alphabet'
        ],
        missingParameters: ['Subject/Topic', 'Entity/Geography', 'Observation metric']
      },
      domainClassification: {
        domain: 'ambiguous',
        subdomain: 'unspecified',
        isApprovedLiveConnector: false,
        isDatasetRequired: false,
        requiresFile: false
      },
      subject: 'Ambiguous Query',
      objective: 'Clarify user analytical intent before initiating data retrieval.',
      geographicScope: { locationName: 'Unspecified', isSpecificCityOrState: false },
      timePeriod: { type: 'live_current', description: 'Unspecified' },
      requiredMetrics: [],
      multiRequirements: [],
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        suggestedTitle: 'Analytical Clarification',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: ['Query lacks specific subject, metrics, or geographic parameters.']
      }
    };
  }

  // Detect geographic entities from query
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

  const multiRequirements: string[] = [];
  const assumptions: string[] = [];

  if (matchedGeos.length > 1) {
    multiRequirements.push(`Comparative location analysis: ${matchedGeos.map(g => g.name).join(' vs ')}`);
    assumptions.push(`Comparative inquiry across multiple locations detected: ${matchedGeos.map(g => g.name).join(' vs ')}.`);
  }

  // -------------------------------------------------------------------------
  // 3. KNOWN ANALYTICAL DOMAINS REQUIRING USER DATASETS (DATASET_REQUIRED)
  // Strict relevance check: Do NOT select World Bank or other unrelated connectors!
  // -------------------------------------------------------------------------

  // (A) Restaurant, Food, Dining, Menu, Hospitality
  const isRestaurant =
    lower.includes('restaurant') ||
    lower.includes('cafe') ||
    lower.includes('dining') ||
    lower.includes('food order') ||
    lower.includes('menu item') ||
    lower.includes('table order') ||
    lower.includes('cuisine') ||
    (lower.includes('order') && (lower.includes('dish') || lower.includes('food') || lower.includes('meal')));

  if (isRestaurant) {
    return {
      rawPrompt: clean,
      status: 'DATASET_REQUIRED',
      guidance: {
        state: 'DATASET_REQUIRED',
        title: 'Dataset Required for Restaurant Analytics',
        message: 'To generate a restaurant analytics dashboard, please upload your restaurant sales, orders, or customer dataset (.csv or .json). Currently, no connected restaurant data source is available in the public registry.',
        detectedDomain: 'Restaurant & Hospitality Analytics',
        detectedSubdomain: 'Sales, Orders & Menu Performance',
        suggestedActions: [
          'Click "Attach Dataset" to upload a CSV/JSON file of restaurant orders or revenue',
          'File can contain columns like: order_id, item_name, category, price, quantity, order_date, customer'
        ],
        suggestedPrompts: [
          'Attach a restaurant sales CSV to analyze AOV, top-selling dishes, and daily revenue',
          'Explore registered live sources: "Show weather in Mumbai" or "Analyze India GDP growth"'
        ],
        missingParameters: ['Restaurant sales or order register (.csv or .json)']
      },
      domainClassification: {
        domain: 'restaurant_hospitality',
        subdomain: 'restaurant_sales',
        isApprovedLiveConnector: false,
        isDatasetRequired: true,
        requiresFile: true
      },
      subject: 'Restaurant Sales & Menu Analytics',
      objective: 'Analyze restaurant order volume, average order value (AOV), best-selling items, and daily revenue.',
      geographicScope: { locationName: 'Store / Local Level', isSpecificCityOrState: true },
      timePeriod: { type: 'user_file', description: 'Requires uploaded store ledger' },
      requiredMetrics: ['Total Revenue', 'Total Orders', 'Average Order Value (AOV)', 'Top-Selling Items'],
      multiRequirements: ['Total revenue summary', 'Order volume & AOV', 'Category breakdown', 'Item leaderboard'],
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        suggestedTitle: 'Restaurant Sales & Menu Analytics',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: ['No external public registry for private restaurant point-of-sale data; dataset upload required.']
      }
    };
  }

  // (B) Student, Academic Performance, Grades, School/University Exams
  const isAcademic =
    lower.includes('student') ||
    lower.includes('academic') ||
    lower.includes('exam mark') ||
    lower.includes('student performance') ||
    lower.includes('school mark') ||
    lower.includes('grades') ||
    lower.includes('subject-wise') ||
    lower.includes('gpa') ||
    (lower.includes('marks') && (lower.includes('class') || lower.includes('pass') || lower.includes('student')));

  if (isAcademic) {
    return {
      rawPrompt: clean,
      status: 'DATASET_REQUIRED',
      guidance: {
        state: 'DATASET_REQUIRED',
        title: 'Dataset Required for Academic & Student Performance',
        message: 'To analyze student academic performance and grades, please upload your student marks or assessment dataset (.csv or .json). Student records are private and not accessible via public data connectors.',
        detectedDomain: 'Education & Academic Performance',
        detectedSubdomain: 'Student Grades & Assessments',
        suggestedActions: [
          'Attach a CSV or JSON file containing student grades or marks',
          'Supported columns: student_id, student_name, subject, marks, grade, attendance'
        ],
        suggestedPrompts: [
          'Attach a student assessment CSV to compute class averages, pass rates, and top performers'
        ],
        missingParameters: ['Student examination or assessment marks file']
      },
      domainClassification: {
        domain: 'academic_performance',
        subdomain: 'student_marks',
        isApprovedLiveConnector: false,
        isDatasetRequired: true,
        requiresFile: true
      },
      subject: 'Student Academic Performance Evaluation',
      objective: 'Calculate class average, pass percentage, subject-wise distribution, and top performers.',
      geographicScope: { locationName: 'Academic Institution', isSpecificCityOrState: true },
      timePeriod: { type: 'user_file', description: 'Requires assessment ledger' },
      requiredMetrics: ['Average Marks', 'Pass Percentage', 'Highest Score', 'Student Count'],
      multiRequirements: ['Class average', 'Pass percentage', 'Subject-wise performance', 'Student rankings'],
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        suggestedTitle: 'Student Academic Performance',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: ['Private institutional student records require uploaded CSV dataset.']
      }
    };
  }

  // (C) Employee, HR, Workforce, Department Performance, Payroll
  const isHR =
    (lower.includes('employee') && (lower.includes('department') || lower.includes('performance') || lower.includes('salary') || lower.includes('attendance'))) ||
    lower.includes('workforce') ||
    lower.includes('headcount') ||
    lower.includes('department-wise') ||
    lower.includes('staff performance') ||
    (lower.includes('salary') && lower.includes('department'));

  if (isHR) {
    return {
      rawPrompt: clean,
      status: 'DATASET_REQUIRED',
      guidance: {
        state: 'DATASET_REQUIRED',
        title: 'Dataset Required for Human Resources & Workforce Analytics',
        message: 'To analyze employee performance and department distributions, please upload your organization\'s employee dataset (.csv or .json). Private workforce records are not available in public data registries.',
        detectedDomain: 'Human Resources & Workforce Management',
        detectedSubdomain: 'Department Headcount & Performance',
        suggestedActions: [
          'Attach a CSV or JSON file containing employee or HR records',
          'Supported columns: emp_id, name, department, role, salary, performance_score, attendance'
        ],
        suggestedPrompts: [
          'Upload an employee roster CSV to analyze department headcount, average salary, and performance'
        ],
        missingParameters: ['Employee / HR roster dataset']
      },
      domainClassification: {
        domain: 'human_resources',
        subdomain: 'workforce_management',
        isApprovedLiveConnector: false,
        isDatasetRequired: true,
        requiresFile: true
      },
      subject: 'Workforce & Department Performance Analytics',
      objective: 'Evaluate department headcount, compensation distribution, performance scores, and attendance.',
      geographicScope: { locationName: 'Organization / Enterprise', isSpecificCityOrState: false },
      timePeriod: { type: 'user_file', description: 'Requires internal HR records' },
      requiredMetrics: ['Total Headcount', 'Average Salary', 'Department Count', 'Performance Index'],
      multiRequirements: ['Headcount distribution', 'Salary overview', 'Department comparison', 'Performance ratings'],
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        suggestedTitle: 'Department Workforce & Performance Analytics',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: ['Internal corporate HR records require uploaded file buffer.']
      }
    };
  }

  // (D) Private Product Sales, E-Commerce, Retail Store Inventory
  const isProductSales =
    (lower.includes('product') && (lower.includes('sales') || lower.includes('revenue') || lower.includes('highest sales') || lower.includes('best selling'))) ||
    lower.includes('monthly product sales') ||
    lower.includes('store sales') ||
    lower.includes('retail sales') ||
    lower.includes('inventory sales');

  if (isProductSales) {
    return {
      rawPrompt: clean,
      status: 'DATASET_REQUIRED',
      guidance: {
        state: 'DATASET_REQUIRED',
        title: 'Dataset Required for Product Sales Analytics',
        message: 'To analyze your monthly product sales and identify your highest-performing products, please attach your product sales or order register (.csv or .json). Currently, no public retail product sales registry is connected.',
        detectedDomain: 'Product Sales & Retail Analytics',
        detectedSubdomain: 'Product Revenue & Unit Volume',
        suggestedActions: [
          'Attach a CSV or JSON file containing sales records or product orders',
          'Supported columns: product_name, category, units_sold, unit_price, total_sales, sale_date'
        ],
        suggestedPrompts: [
          'Upload a sales CSV to analyze best-selling products, category distributions, and monthly trends',
          'Or analyze public tech giants: "Show the financial performance of Microsoft"'
        ],
        missingParameters: ['Product sales register (.csv or .json)']
      },
      domainClassification: {
        domain: 'ecommerce_sales',
        subdomain: 'product_sales',
        isApprovedLiveConnector: false,
        isDatasetRequired: true,
        requiresFile: true
      },
      subject: 'Product Sales & Inventory Performance',
      objective: 'Identify top-selling products, category revenue distribution, unit velocity, and monthly sales trends.',
      geographicScope: { locationName: 'Retail / Commercial Scope', isSpecificCityOrState: false },
      timePeriod: { type: 'user_file', description: 'Requires store sales register' },
      requiredMetrics: ['Total Revenue', 'Units Sold', 'Top Products', 'Average Transaction Value'],
      multiRequirements: ['Top products by sales', 'Category distribution', 'Monthly sales trend'],
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        suggestedTitle: 'Product Sales & Revenue Analytics',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: ['Proprietary product sales data requires user-provided file.']
      }
    };
  }

  // -------------------------------------------------------------------------
  // 4. UNSUPPORTED DOMAINS: Honest Disclosures (UNSUPPORTED_DOMAIN)
  // -------------------------------------------------------------------------

  // (A) Cryptocurrency & Blockchain Telemetry
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
      status: 'UNSUPPORTED_DOMAIN',
      guidance: {
        state: 'UNSUPPORTED_DOMAIN',
        title: 'Cryptocurrency Telemetry is Not a Registered Data Source',
        message: 'Cryptocurrency network telemetry (hash rate, blockchain difficulty, mempool fees) is outside GenUI’s approved public data registry. To visualize crypto transactions, please upload a CSV or JSON export.',
        detectedDomain: 'Cryptocurrency & Blockchain',
        suggestedActions: [
          'Attach a CSV or JSON file containing cryptocurrency transactions or trade records',
          'Explore registered sources: Meteorology (Open-Meteo), Macroeconomics (World Bank), Clean Mobility (VAHAN), Tech Giants (SEC)'
        ],
        suggestedPrompts: [
          'Show financial performance of Microsoft, Apple, or Alphabet (SEC EDGAR)',
          'Show India GDP growth and economic trajectory (World Bank)',
          'Compare weather in Mumbai and Delhi (Open-Meteo)'
        ]
      },
      domainClassification: {
        domain: 'unsupported',
        subdomain: 'cryptocurrency',
        isApprovedLiveConnector: false,
        isDatasetRequired: false,
        requiresFile: false
      },
      subject: 'Cryptocurrency Telemetry (Unsupported Domain)',
      objective: 'Transparently disclose registry boundaries without fabricating synthetic crypto telemetry.',
      geographicScope: { locationName: 'Global Decentralized Networks', isSpecificCityOrState: false },
      timePeriod: { type: 'live_current', description: 'Unregistered' },
      requiredMetrics: [],
      multiRequirements: [],
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        suggestedTitle: 'Unsupported Data Source',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: ['Cryptocurrency telemetry is not included in GenUI’s registered connectors.']
      }
    };
  }

  // (B) Deep Space / Extraterrestrial / Explicit Unsupported
  if (
    lower.includes('unsupported domain') ||
    lower.includes('mars') ||
    lower.includes('rover') ||
    lower.includes('astronomy') ||
    lower.includes('exoplanet') ||
    lower.includes('deep space') ||
    lower.includes('horoscope') ||
    lower.includes('astrology')
  ) {
    return {
      rawPrompt: clean,
      status: 'UNSUPPORTED_DOMAIN',
      guidance: {
        state: 'UNSUPPORTED_DOMAIN',
        title: 'Requested Topic Outside Registered Data Connectors',
        message: `The requested domain ("${clean}") is outside GenUI's registered public data sources. GenUI strictly connects to pre-verified public endpoints and statutory registries rather than scraping unverified web content.`,
        detectedDomain: 'External / Unregistered Domain',
        suggestedActions: [
          'Upload custom datasets (.csv, .json) for instant in-memory synthesis',
          'Query supported live connectors: Weather (Open-Meteo), GDP/Demographics (World Bank), Indian EVs (VAHAN/BEE), Corporate Financials (SEC)'
        ],
        suggestedPrompts: [
          'Show India GDP growth over time',
          'Analyze Indian EV sales and charging infrastructure',
          'Show weather trends in Andhra Pradesh',
          'Compare financial performance of Microsoft'
        ]
      },
      domainClassification: {
        domain: 'unsupported',
        subdomain: 'unsupported_topic',
        isApprovedLiveConnector: false,
        isDatasetRequired: false,
        requiresFile: false
      },
      subject: 'Unsupported Domain Inquiry',
      objective: 'Provide honest boundary disclosure without arbitrary connector substitution.',
      geographicScope: { locationName: 'External', isSpecificCityOrState: false },
      timePeriod: { type: 'live_current', description: 'N/A' },
      requiredMetrics: [],
      multiRequirements: [],
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        suggestedTitle: 'Unsupported Domain',
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: false,
        assumptionsUsed: ['Topic is outside approved data registry; no arbitrary fallback applied.']
      }
    };
  }

  // -------------------------------------------------------------------------
  // 5. WEATHER & METEOROLOGY (Live Open-Meteo Connector)
  // -------------------------------------------------------------------------
  const isWeather =
    lower.includes('weather') ||
    lower.includes('rainfall') ||
    lower.includes('precipitation') ||
    lower.includes('temperature') ||
    lower.includes('climate') ||
    lower.includes('forecast') ||
    lower.includes('monsoon') ||
    (lower.includes('andhra') && !lower.includes('ev') && !lower.includes('vehicle') && !lower.includes('gdp'));

  if (isWeather) {
    if (!geoFound) {
      detectedGeo = { name: 'Andhra Pradesh (Amaravati)', countryCode: 'IND', isCityOrState: true };
      assumptions.push('No specific city specified; defaulted to Andhra Pradesh (Amaravati) meteorological grid.');
    }

    if (lower.includes('trend') || lower.includes('forecast') || lower.includes('weekly')) {
      multiRequirements.push('7-day temperature & precipitation trajectory');
    }
    if (lower.includes('humidity') || lower.includes('wind')) {
      multiRequirements.push('Atmospheric moisture & wind velocity telemetry');
    }

    return {
      rawPrompt: clean,
      status: 'SUCCESS',
      domainClassification: {
        domain: 'meteorology',
        subdomain: 'weather_telemetry',
        isApprovedLiveConnector: true,
        isDatasetRequired: false,
        requiresFile: false
      },
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
      multiRequirements: multiRequirements.length > 0 ? multiRequirements : ['Live ambient observations', '7-day forecast model', 'Precipitation outlook'],
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

  // -------------------------------------------------------------------------
  // 6. INDIAN EV & CLEAN MOBILITY (Curated VAHAN/BEE Benchmark)
  // -------------------------------------------------------------------------
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
    (lower.includes('vehicle') && (lower.includes('india') || lower.includes('state') || lower.includes('sales')));

  if (isEV) {
    if (lower.includes('category') || lower.includes('segment') || lower.includes('compare vehicle categories') || lower.includes('2w')) {
      multiRequirements.push('Segment breakdown across 2W, 3W, 4W, and commercial categories');
    }
    if (lower.includes('yearly') || lower.includes('annual') || lower.includes('growth') || lower.includes('trajectory')) {
      multiRequirements.push('6-year annual adoption growth trajectory (2020–2025)');
    }
    if (lower.includes('state') || lower.includes('leading states') || lower.includes('leaderboard')) {
      multiRequirements.push('State-wise adoption rankings and EV-to-charger infrastructure matrix');
    }
    if (lower.includes('charging') || lower.includes('infrastructure')) {
      multiRequirements.push('BEE public fast charging corridor density');
    }

    return {
      rawPrompt: clean,
      status: 'SUCCESS',
      domainClassification: {
        domain: 'indian_ev_mobility',
        subdomain: 'ev_market_penetration',
        isApprovedLiveConnector: true,
        isDatasetRequired: false,
        requiresFile: false
      },
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
      multiRequirements: multiRequirements.length > 0 ? multiRequirements : [
        'Annual volume trajectory',
        'Segment category split (2W/3W/4W)',
        'State adoption leaderboard',
        'Charging infrastructure density'
      ],
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

  // -------------------------------------------------------------------------
  // 7. MACROECONOMICS, GDP, POPULATION, RENEWABLE ENERGY (World Bank Connector)
  // -------------------------------------------------------------------------
  const isGDP = lower.includes('gdp') || lower.includes('economic growth') || lower.includes('macroeconomic') || (lower.includes('economy') && (lower.includes('performed') || lower.includes('india') || lower.includes('growth')));
  const isPopulation = lower.includes('population') || lower.includes('demographic') || lower.includes('population growth');
  const isRenewable = lower.includes('renewable') || lower.includes('clean energy') || lower.includes('power share') || lower.includes('energy adoption');
  const isEmissions = lower.includes('co2') || lower.includes('emission');

  if (isGDP || isPopulation || isRenewable || isEmissions) {
    let metricType = 'Annual GDP Growth (%)';
    let domain: 'macroeconomics' | 'demographics' | 'renewable_energy' = 'macroeconomics';
    let subdomain = 'gdp_growth';

    if (isPopulation) {
      metricType = 'Total Population';
      domain = 'demographics';
      subdomain = 'population_demographics';
      multiRequirements.push('Long-term sovereign population counts', 'Demographic expansion pace');
    } else if (isRenewable) {
      metricType = 'Renewable Electricity Output Share (%)';
      domain = 'renewable_energy';
      subdomain = 'clean_power_generation';
      multiRequirements.push('Renewable electricity generation share', 'Clean power adoption trajectory');
    } else if (isEmissions) {
      metricType = 'CO2 Emissions Per Capita (Metric Tons)';
      domain = 'renewable_energy';
      subdomain = 'carbon_emissions';
      multiRequirements.push('Per capita carbon emissions', 'Long-term decarbonization trend');
    } else {
      multiRequirements.push('Annual real GDP percentage growth rate', '10-Year historical baseline average', 'National accounts movements');
    }

    if (!geoFound) {
      assumptions.push('No sovereign country specified in query; defaulted to India (IND).');
    }

    return {
      rawPrompt: clean,
      status: 'SUCCESS',
      domainClassification: {
        domain,
        subdomain,
        isApprovedLiveConnector: true,
        isDatasetRequired: false,
        requiresFile: false
      },
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
      multiRequirements: multiRequirements.length > 0 ? multiRequirements : ['Historical timeline', 'Annual growth movements', 'Decade averages'],
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

  // -------------------------------------------------------------------------
  // 8. CORPORATE FINANCIAL BENCHMARK (Public Tech Giants - SEC EDGAR)
  // -------------------------------------------------------------------------
  const isCorporateFinance =
    lower.includes('microsoft') ||
    lower.includes('apple') ||
    lower.includes('google') ||
    lower.includes('alphabet') ||
    lower.includes('nvidia') ||
    lower.includes('amazon') ||
    lower.includes('meta') ||
    lower.includes('tesla') ||
    lower.includes('tech giant') ||
    lower.includes('tech companies') ||
    lower.includes('technology companies') ||
    lower.includes('technology company') ||
    lower.includes('sec edgar') ||
    lower.includes('market cap') ||
    lower.includes('p/e ratio') ||
    (lower.includes('performance') && lower.includes('technolog')) ||
    (lower.includes('financial performance') && (lower.includes('company') || lower.includes('giant') || lower.includes('corporation')));

  if (isCorporateFinance) {
    let focusEntity = 'Major Technology Giants';
    if (lower.includes('microsoft')) focusEntity = 'Microsoft Corporation';
    else if (lower.includes('apple')) focusEntity = 'Apple Inc.';
    else if (lower.includes('nvidia')) focusEntity = 'Nvidia Corporation';
    else if (lower.includes('alphabet') || lower.includes('google')) focusEntity = 'Alphabet Inc.';
    else if (lower.includes('amazon')) focusEntity = 'Amazon.com Inc.';
    else if (lower.includes('meta')) focusEntity = 'Meta Platforms Inc.';

    return {
      rawPrompt: clean,
      status: 'SUCCESS',
      domainClassification: {
        domain: 'corporate_finance',
        subdomain: 'public_company_financials',
        isApprovedLiveConnector: true,
        isDatasetRequired: false,
        requiresFile: false
      },
      subject: `Audited Financial Performance: ${focusEntity}`,
      objective: `Analyze market capitalization, TTM revenue scale, net profit margins, and price-to-earnings multiples from audited SEC disclosures.`,
      geographicScope: {
        locationName: 'Global Capital Markets',
        isSpecificCityOrState: false
      },
      timePeriod: {
        type: 'ttm',
        description: 'Trailing Twelve Months (TTM) Audited SEC Statements'
      },
      requiredMetrics: ['Market Capitalization ($B)', 'TTM Revenue ($B)', 'Net Profit Margin (%)', 'P/E Ratio', 'YoY Growth (%)'],
      multiRequirements: [
        'TTM GAAP revenue volume',
        'Net profit margin efficiency',
        'Market capitalization valuation',
        'Price-to-earnings ratio comparison'
      ],
      recommendedConnectorId: 'market_intelligence',
      visualizationStrategy: {
        primaryChartType: 'bar_chart',
        secondaryChartType: 'bar_chart',
        suggestedTitle: `${focusEntity} Financial Architecture`,
        layout: 'grid'
      },
      dataSufficiency: {
        isSufficient: true,
        assumptionsUsed: ['Figures derived from audited GAAP SEC 10-K/10-Q disclosures and trailing consensus statements.']
      }
    };
  }

  // -------------------------------------------------------------------------
  // 9. UNMATCHED / UNSUPPORTED DOMAIN: STRICT VALIDATION
  // DO NOT FALL BACK TO WORLD BANK OR GDP!
  // Return explicit UNSUPPORTED_DOMAIN status with helpful suggestions!
  // -------------------------------------------------------------------------
  return {
    rawPrompt: clean,
    status: 'UNSUPPORTED_DOMAIN',
    guidance: {
      state: 'UNSUPPORTED_DOMAIN',
      title: 'Requested Topic Outside Registered Data Connectors',
      message: `GenUI does not have a registered data connector for "${clean}". Rather than fabricating synthetic data or substituting an unrelated topic, GenUI requires an approved connector or an uploaded dataset.`,
      detectedDomain: 'Unregistered Subject Domain',
      suggestedActions: [
        'Attach a CSV or JSON file containing your dataset for in-memory synthesis',
        'Or query one of GenUI\'s registered public connectors'
      ],
      suggestedPrompts: [
        'Show India GDP growth and macroeconomic trajectory',
        'Analyze Indian EV sales and charging infrastructure',
        'Show weather trends in Andhra Pradesh',
        'Show the financial performance of Microsoft'
      ]
    },
    domainClassification: {
      domain: 'unsupported',
      subdomain: 'unknown_domain',
      isApprovedLiveConnector: false,
      isDatasetRequired: false,
      requiresFile: false
    },
    subject: `Unregistered Domain: ${clean}`,
    objective: 'Provide honest transparency regarding data source availability without arbitrary fallbacks.',
    geographicScope: { locationName: 'Unspecified', isSpecificCityOrState: false },
    timePeriod: { type: 'live_current', description: 'N/A' },
    requiredMetrics: [],
    multiRequirements: [],
    visualizationStrategy: {
      primaryChartType: 'bar_chart',
      suggestedTitle: 'Data Source Unavailable',
      layout: 'grid'
    },
    dataSufficiency: {
      isSufficient: false,
      assumptionsUsed: [
        `Prompt "${clean}" does not match any approved public connector (Open-Meteo, World Bank, VAHAN, SEC).`,
        'No unrelated fallback was applied to ensure strict data relevance.'
      ]
    }
  };
}
