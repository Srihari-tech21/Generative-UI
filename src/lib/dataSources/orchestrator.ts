import { NormalizedDataPacket } from './types';
import { parseAnalyticalIntent, AnalyticalIntent } from './intentParser';
import { fetchWeatherIntelligence } from './connectors/openMeteo';
import { fetchWorldBankIntelligence } from './connectors/worldBank';
import { fetchIndianEVMarketIntelligence } from './connectors/evMarket';
import { fetchMarketIntelligence } from './connectors/marketData';
import { processUploadedDataset } from './csvParser';

export interface OrchestrationRequest {
  prompt: string;
  fileContent?: string;
  fileName?: string;
}

export interface OrchestrationResult {
  dataPacket: NormalizedDataPacket;
  connectorId: string;
  intent: AnalyticalIntent;
}

export async function orchestrateDataRetrieval(request: OrchestrationRequest): Promise<OrchestrationResult> {
  const { prompt, fileContent, fileName } = request;

  // 1. Parse natural language analytical intent
  const intent = parseAnalyticalIntent(prompt, Boolean(fileContent && fileContent.trim().length > 0), fileName);
  console.log(`[Data Orchestrator] Parsed Analytical Intent:`, {
    subject: intent.subject,
    geo: intent.geographicScope.locationName,
    connector: intent.recommendedConnectorId,
    assumptions: intent.dataSufficiency.assumptionsUsed
  });

  // 2. In-memory user dataset processor
  if (intent.recommendedConnectorId === 'user_dataset' && fileContent) {
    console.log(`[Data Orchestrator] Routing to in-memory dataset processor for "${fileName || 'uploaded file'}"`);
    const packet = processUploadedDataset(fileContent, fileName || 'uploaded_data.csv');
    // Augment packet with intent assumptions
    if (intent.dataSufficiency.assumptionsUsed.length > 0) {
      packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
    }
    return { dataPacket: packet, connectorId: 'user_dataset', intent };
  }

  // 3. Open-Meteo Weather Service
  if (intent.recommendedConnectorId === 'open_meteo') {
    console.log(`[Data Orchestrator] Routing to Open-Meteo Weather Connector for ${intent.geographicScope.locationName}...`);
    const packet = await fetchWeatherIntelligence(prompt || intent.geographicScope.locationName);
    if (intent.dataSufficiency.assumptionsUsed.length > 0) {
      packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
    }
    return { dataPacket: packet, connectorId: 'open_meteo', intent };
  }

  // 4. Indian EV & Clean Mobility
  if (intent.recommendedConnectorId === 'indian_ev_mobility') {
    console.log(`[Data Orchestrator] Routing to Indian EV & Clean Mobility Benchmark...`);
    const packet = await fetchIndianEVMarketIntelligence(prompt);
    if (intent.dataSufficiency.assumptionsUsed.length > 0) {
      packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
    }
    return { dataPacket: packet, connectorId: 'indian_ev_mobility', intent };
  }

  // 5. World Bank Open Data
  if (intent.recommendedConnectorId === 'world_bank') {
    console.log(`[Data Orchestrator] Routing to World Bank Open Data Connector for ${intent.geographicScope.locationName}...`);
    const packet = await fetchWorldBankIntelligence(prompt);
    if (intent.dataSufficiency.assumptionsUsed.length > 0) {
      packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
    }
    return { dataPacket: packet, connectorId: 'world_bank', intent };
  }

  // 6. Market & Corporate Intelligence
  console.log(`[Data Orchestrator] Routing to Market & Corporate Intelligence Benchmark...`);
  const packet = await fetchMarketIntelligence(prompt);
  if (intent.dataSufficiency.assumptionsUsed.length > 0) {
    packet.limitationsList = [...(packet.limitationsList || []), ...intent.dataSufficiency.assumptionsUsed];
  }
  return { dataPacket: packet, connectorId: 'market_intelligence', intent };
}
