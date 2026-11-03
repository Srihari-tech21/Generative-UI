export type IndustryId =
  | 'restaurants'
  | 'business'
  | 'theatres'
  | 'healthcare'
  | 'retail'
  | 'education'
  | 'hotels'
  | 'logistics'
  | 'banking'
  | 'fitness'
  | 'energy'
  | 'agriculture';

export interface IndustryDefinition {
  id: IndustryId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  color: string;
  benchmarkMetric: string;
}

export type DataOrigin = 'SYNTHETIC_SAMPLE' | 'PUBLIC_VERIFIED';

export interface DatasetCatalogItem {
  id: string;
  name: string;
  industry: IndustryId;
  industryName: string;
  description: string;
  filePath: string;
  format: 'csv' | 'json';
  recordCount: number;
  columns: string[];
  supportedMetrics: string[];
  samplePrompts: string[];
  dataOrigin: DataOrigin;
  license: string;
  attribution: string;
  limitations: string;
  freshness: string;
  observationPeriod: string;
}

export interface DatasetPreviewResult {
  metadata: DatasetCatalogItem;
  headers: string[];
  rows: Array<Record<string, unknown>>;
  totalRows: number;
}
