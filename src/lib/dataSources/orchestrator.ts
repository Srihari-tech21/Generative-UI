import { NormalizedDataPacket } from './types';
import { parseAnalyticalIntent, AnalyticalIntent, PipelineResponseState, StructuredGuidance } from './intentParser';
import { fetchWeatherIntelligence } from './connectors/openMeteo';
import { fetchWorldBankIntelligence } from './connectors/worldBank';
import { fetchIndianEVMarketIntelligence } from './connectors/evMarket';
import { fetchMarketIntelligence } from './connectors/marketData';
import { processUploadedDataset } from './csvParser';

import { loadDatasetContent } from '../datasets/datasetLoader';
import { getDatasetById, findMatchingDatasetForPrompt } from '../datasets/catalog';

export interface OrchestrationRequest {
  prompt: string;
  fileContent?: string;
  fileName?: string;
  datasetId?: string;
}

export interface OrchestrationResult {
  state: PipelineResponseState;
  dataPacket?: NormalizedDataPacket;
  connectorId?: string;
  intent: AnalyticalIntent;
  guidance?: StructuredGuidance;
}

export async function orchestrateDataRetrieval(request: OrchestrationRequest): Promise<OrchestrationResult> {
  const { prompt } = request;
  let { fileContent, fileName } = request;

  // On-demand resolution of catalog datasets if datasetId is supplied or prompt directly references a catalog file
  if (!fileContent && request.datasetId) {
    const catalogItem = getDatasetById(request.datasetId);
    if (catalogItem) {
      console.log(`[Data Orchestrator] Resolving catalog dataset "${catalogItem.id}" (${catalogItem.name})...`);
      fileContent = await loadDatasetContent(catalogItem);
      fileName = catalogItem.filePath.split('/').pop() || `${catalogItem.id}.csv`;
    }
  } else if (!fileContent && prompt && (prompt.includes('.csv') || prompt.toLowerCase().includes('sample dataset') || prompt.toLowerCase().includes('sample data'))) {
    const matched = findMatchingDatasetForPrompt(prompt);
    if (matched) {
      console.log(`[Data Orchestrator] Auto-detected catalog sample dataset "${matched.id}" for prompt "${prompt}"`);
      fileContent = await loadDatasetContent(matched);
      fileName = matched.filePath.split('/').pop() || `${matched.id}.csv`;
    }
  }

  // 1. Parse natural language analytical intent & strict relevance validation
  const intent = parseAnalyticalIntent(prompt, Boolean(fileContent && fileContent.trim().length > 0), fileName);
  console.log(`[Data Orchestrator] Parsed Analytical Intent:`, {
    status: intent.status,
    domain: intent.domainClassification?.domain,
    connector: intent.recommendedConnectorId
  });

  // 2. Strict Relevance Gate: If intent indicates dataset required, unsupported domain, or clarification, halt before invoking connectors
  if (intent.status !== 'SUCCESS') {
    console.log(`[Data Orchestrator] Intent validation non-success status: ${intent.status} for "${prompt}". Yielding structured guidance.`);
    return {
      state: intent.status,
      intent,
      guidance: intent.guidance
    };
  }

  // 3. In-memory user dataset processor
  if (intent.recommendedConnectorId === 'user_dataset' && fileContent) {
    console.log(`[Data Orchestrator] Routing to in-memory dataset processor for "${fileName || 'uploaded file'}"`);
    try {
      const packet = processUploadedDataset(fileContent, fileName || 'uploaded_data.csv');
      if (intent.dataSufficiency.assumptionsUsed.length > 0) {
        packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
      }
      return { state: 'SUCCESS', dataPacket: packet, connectorId: 'user_dataset', intent };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid CSV/JSON format';
      return {
        state: 'DATA_SOURCE_ERROR',
        intent,
        guidance: {
          state: 'DATA_SOURCE_ERROR',
          domain: intent.domainClassification?.domain || 'Uploaded Dataset',
          subdomain: intent.domainClassification?.subdomain,
          message: `Unable to process the uploaded file: ${errorMsg}. Please ensure the file contains valid CSV or JSON format with tabular data.`,
          actionRequired: 'UPLOAD_DATASET',
          suggestedPrompts: [
            'Upload a CSV file with valid headers in the first row',
            'Verify columns contain clean numeric and categorical values'
          ],
          supportedConnectors: ['In-Memory User File Processor (CSV/JSON)']
        }
      };
    }
  }

  // 4. Open-Meteo Weather Service
  if (intent.recommendedConnectorId === 'open_meteo') {
    console.log(`[Data Orchestrator] Routing to Open-Meteo Weather Connector for ${intent.geographicScope.locationName}...`);
    try {
      const packet = await fetchWeatherIntelligence(prompt || intent.geographicScope.locationName);
      if (intent.dataSufficiency.assumptionsUsed.length > 0) {
        packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
      }
      return { state: 'SUCCESS', dataPacket: packet, connectorId: 'open_meteo', intent };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Location lookup failed';
      const isNotFound = errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('location');
      return {
        state: isNotFound ? 'NO_DATA_FOUND' : 'DATA_SOURCE_ERROR',
        intent,
        guidance: {
          state: isNotFound ? 'NO_DATA_FOUND' : 'DATA_SOURCE_ERROR',
          domain: 'Meteorology & Weather Intelligence',
          message: `Could not retrieve meteorological records for "${intent.geographicScope.locationName}": ${errorMsg}.`,
          actionRequired: 'REFINE_PROMPT',
          suggestedPrompts: [
            'Show weather trends in Andhra Pradesh',
            'Show weather in Tokyo',
            'Show weather forecast in London'
          ],
          supportedConnectors: ['Open-Meteo Meteorological Service']
        }
      };
    }
  }

  // 5. Indian EV & Clean Mobility Benchmark
  if (intent.recommendedConnectorId === 'indian_ev_mobility') {
    console.log(`[Data Orchestrator] Routing to Indian EV & Clean Mobility Benchmark...`);
    try {
      const packet = await fetchIndianEVMarketIntelligence(prompt);
      if (intent.dataSufficiency.assumptionsUsed.length > 0) {
        packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
      }
      return { state: 'SUCCESS', dataPacket: packet, connectorId: 'indian_ev_mobility', intent };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Internal failure';
      return {
        state: 'DATA_SOURCE_ERROR',
        intent,
        guidance: {
          state: 'DATA_SOURCE_ERROR',
          domain: 'Clean Mobility & Automotive',
          message: `Unable to compile Indian EV benchmark: ${errorMsg}`,
          actionRequired: 'REFINE_PROMPT',
          suggestedPrompts: [
            'Analyze Indian EV sales',
            'Compare EV adoption across Indian states'
          ],
          supportedConnectors: ['VAHAN e-Services & BEE India']
        }
      };
    }
  }

  // 6. World Bank Open Data
  if (intent.recommendedConnectorId === 'world_bank') {
    console.log(`[Data Orchestrator] Routing to World Bank Open Data Connector for ${intent.geographicScope.locationName}...`);
    try {
      const packet = await fetchWorldBankIntelligence(prompt);
      if (intent.dataSufficiency.assumptionsUsed.length > 0) {
        packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
      }
      return { state: 'SUCCESS', dataPacket: packet, connectorId: 'world_bank', intent };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Data series unavailable';
      return {
        state: 'NO_DATA_FOUND',
        intent,
        guidance: {
          state: 'NO_DATA_FOUND',
          domain: 'Macroeconomics & National Development',
          message: `The World Bank Open Data connector could not find valid indicator series for the requested scope: ${errorMsg}`,
          actionRequired: 'REFINE_PROMPT',
          suggestedPrompts: [
            "Show India's GDP growth",
            'Compare population growth across countries',
            'Show renewable energy adoption in Germany'
          ],
          supportedConnectors: ['The World Bank Open Data Group']
        }
      };
    }
  }

  // 7. Market & Corporate Intelligence
  if (intent.recommendedConnectorId === 'market_intelligence') {
    console.log(`[Data Orchestrator] Routing to Market & Corporate Intelligence Benchmark...`);
    try {
      const packet = await fetchMarketIntelligence(prompt);
      if (intent.dataSufficiency.assumptionsUsed.length > 0) {
        packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
      }
      return { state: 'SUCCESS', dataPacket: packet, connectorId: 'market_intelligence', intent };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Market benchmark failed';
      return {
        state: 'DATA_SOURCE_ERROR',
        intent,
        guidance: {
          state: 'DATA_SOURCE_ERROR',
          domain: 'Corporate & Market Intelligence',
          message: `Unable to compile corporate benchmark: ${errorMsg}`,
          actionRequired: 'REFINE_PROMPT',
          suggestedPrompts: [
            'Show the financial performance of Microsoft',
            'Compare big tech revenue and net margins'
          ],
          supportedConnectors: ['SEC Filings & Market Consensus Intelligence']
        }
      };
    }
  }

  // 8. Strict Guard: No arbitrary fallbacks!
  return {
    state: 'UNSUPPORTED_DOMAIN',
    intent,
    guidance: {
      state: 'UNSUPPORTED_DOMAIN',
      domain: intent.domainClassification?.domain || 'Unsupported Domain',
      message: 'No connected data source is configured for this domain. Please select an approved topic or upload a dataset.',
      actionRequired: 'UPLOAD_DATASET',
      suggestedPrompts: [
        "Show India's GDP growth",
        'Analyze Indian EV sales',
        'Show weather trends in Andhra Pradesh'
      ],
      supportedConnectors: [
        'The World Bank Open Data Group',
        'Open-Meteo Meteorological Service',
        'VAHAN Indian EV & Clean Mobility',
        'SEC Filings & Market Consensus Intelligence',
        'In-Memory User File Processor (CSV/JSON)'
      ]
    }
  };
}
