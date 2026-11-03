import { z } from 'zod';

export const WidgetTypeSchema = z.enum([
  'kpi_card',
  'line_chart',
  'bar_chart',
  'pie_chart',
  'area_chart',
  'scatter_plot',
  'table',
  'progress_bar',
  'form',
  'list',
  'board',
  'streak_counter',
  'calendar_heatmap',
  'insight_card',
  'source_transparency'
]);

export const SourceMetadataSchema = z.object({
  provider: z.string(),
  dataset: z.string(),
  url: z.string().optional(),
  timestamp: z.string(),
  sourceType: z.enum(['live_api', 'curated_dataset', 'user_upload']).optional(),
  observationPeriod: z.string().optional(),
  retrievalTimestamp: z.string().optional(),
  freshness: z.string().optional(),
  license: z.string().optional(),
  attribution: z.string(),
  limitations: z.string().optional()
});

export const InsightItemSchema = z.object({
  title: z.string(),
  detail: z.string(),
  type: z.enum(['positive', 'warning', 'neutral']).optional()
});

export const WidgetSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  width: z.enum(['full', 'half', 'third', 'two-thirds']).optional(),
  config: z.record(z.string(), z.any())
});

export const UISchemaSchema = z.object({
  reasoning: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  objective: z.string().optional(),
  layout: z.enum(['grid', 'stack']),
  generationMode: z.enum(['ai_synthesized', 'deterministic_compiled', 'fallback_compiled']).optional(),
  aiStatus: z.string().optional(),
  generationNotes: z.string().optional(),
  sources: z.array(SourceMetadataSchema).optional(),
  methodology: z.string().optional(),
  limitations: z.array(z.string()).optional(),
  insights: z.array(InsightItemSchema).optional(),
  generatedAt: z.string().optional(),
  widgets: z.array(WidgetSchema)
});

export type WidgetType = z.infer<typeof WidgetTypeSchema>;
export type SourceMetadata = z.infer<typeof SourceMetadataSchema>;
export type InsightItem = z.infer<typeof InsightItemSchema>;
export type Widget = z.infer<typeof WidgetSchema>;
export type UISchema = z.infer<typeof UISchemaSchema>;
