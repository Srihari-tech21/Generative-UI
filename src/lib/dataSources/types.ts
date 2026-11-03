import { SourceMetadata } from '../../types/schema';

export type ConnectorCategory = 'live_api' | 'curated_dataset' | 'user_upload';

export interface DataConnector {
  id: string;
  name: string;
  type: ConnectorCategory;
  description: string;
  domains: string[];
  endpoints: string[];
  requiresAuth: boolean;
  rateLimit: string;
  attribution: string;
  observationPeriod: string;
  freshness: string;
  limitations: string;
}

export interface NormalizedDataPacket {
  domain: string;
  topic: string;
  source: SourceMetadata;
  kpis: Array<{
    id: string;
    label: string;
    value: number | string;
    unit: string;
    trend?: {
      direction: 'up' | 'down' | 'neutral';
      amount: number | string;
      isGood: boolean;
      label?: string;
    };
    context?: string;
  }>;
  charts: Array<{
    id: string;
    type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'area_chart' | 'scatter_plot';
    title: string;
    subtitle?: string;
    xAxisKey?: string;
    dataKeys: string[];
    data: Array<Record<string, unknown>>;
  }>;
  tables: Array<{
    id: string;
    title: string;
    columns: Array<{ key: string; label: string; format?: string }>;
    data: Array<Record<string, unknown>>;
  }>;
  insights: Array<{
    title: string;
    detail: string;
    type?: 'positive' | 'warning' | 'neutral';
  }>;
  methodologyNotes?: string;
  limitationsList?: string[];
}
