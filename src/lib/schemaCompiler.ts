import { NormalizedDataPacket } from './dataSources/types';
import { UISchema, Widget } from '../types/schema';

export function compileSchemaFromDataPacket(
  packet: NormalizedDataPacket,
  userPrompt: string,
  options?: {
    reasoningNote?: string;
    generationMode?: 'deterministic_compiled' | 'ai_synthesized' | 'fallback_compiled';
    aiStatus?: string;
    generationNotes?: string;
  }
): UISchema {
  const {
    reasoningNote,
    generationMode = 'deterministic_compiled',
    aiStatus = 'Not configured (Deterministic Engine active)',
    generationNotes
  } = options || {};

  const widgets: Widget[] = [];

  // 1. KPI Cards (up to 4)
  packet.kpis.forEach((kpi, idx) => {
    widgets.push({
      id: `kpi-${kpi.id || idx}`,
      type: 'kpi_card',
      title: kpi.label,
      width: 'third',
      config: {
        key: kpi.id,
        label: kpi.label,
        value: kpi.value,
        unit: kpi.unit,
        trend: kpi.trend,
        context: kpi.context,
        sourceBadge: packet.source.provider
      }
    });
  });

  // 2. Charts
  packet.charts.forEach((chart, idx) => {
    widgets.push({
      id: `chart-${chart.id || idx}`,
      type: chart.type,
      title: chart.title,
      description: chart.subtitle,
      width: idx === 0 && chart.type === 'line_chart' ? 'two-thirds' : 'half',
      config: {
        chartKey: chart.id,
        xAxisKey: chart.xAxisKey || 'name',
        dataKeys: chart.dataKeys,
        data: chart.data,
        title: chart.title,
        subtitle: chart.subtitle
      }
    });
  });

  // 3. Tables
  packet.tables.forEach((table, idx) => {
    widgets.push({
      id: `table-${table.id || idx}`,
      type: 'table',
      title: table.title,
      width: 'full',
      config: {
        tableKey: table.id,
        columns: table.columns,
        data: table.data,
        searchable: true,
        sortable: true
      }
    });
  });

  // 4. Source Transparency Widget
  widgets.push({
    id: 'source-transparency-widget',
    type: 'source_transparency',
    title: 'Source Attribution & Data Provenance',
    width: 'full',
    config: {
      source: packet.source,
      generationMode,
      aiStatus,
      methodology: packet.methodologyNotes,
      limitations: packet.limitationsList
    }
  });

  // Construct honest subtitle based on data category
  let sourceQualifier = 'Live API';
  if (packet.source.sourceType === 'curated_dataset') {
    sourceQualifier = 'Verified Benchmark Dataset';
  } else if (packet.source.sourceType === 'user_upload') {
    sourceQualifier = 'User In-Memory File';
  }

  const engineQualifier = generationMode === 'ai_synthesized'
    ? 'Claude 3.5 AI'
    : generationMode === 'fallback_compiled'
    ? 'Deterministic Fallback'
    : 'Deterministic Pipeline';

  return {
    reasoning: reasoningNote || `Synthesized via ${engineQualifier} from ${packet.source.provider} for query: "${userPrompt}".`,
    title: packet.topic,
    subtitle: `${packet.domain} • ${sourceQualifier} (${packet.source.provider})`,
    description: `Analytical dashboard grounded in ${sourceQualifier.toLowerCase()} data. Observation: ${packet.source.observationPeriod || packet.source.freshness || 'N/A'}.`,
    objective: `Provide data-grounded insights, historical trajectories, and granular metrics regarding "${userPrompt}".`,
    layout: 'grid',
    generationMode,
    aiStatus,
    generationNotes,
    sources: [packet.source],
    methodology: packet.methodologyNotes,
    limitations: packet.limitationsList,
    insights: packet.insights,
    generatedAt: new Date().toISOString(),
    widgets
  };
}
