import { z } from 'zod';

export const WidgetTypeSchema = z.enum([
  'kpi_card',
  'line_chart',
  'bar_chart',
  'pie_chart',
  'table',
  'progress_bar',
  'form',
  'list',
  'board',
  'streak_counter',
  'calendar_heatmap'
]);

export const WidgetSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  title: z.string(),
  config: z.record(z.string(), z.any())
});

export const UISchemaSchema = z.object({
  reasoning: z.string().optional(),
  title: z.string(),
  layout: z.enum(['grid', 'stack']),
  widgets: z.array(WidgetSchema)
});

export type WidgetType = z.infer<typeof WidgetTypeSchema>;
export type Widget = z.infer<typeof WidgetSchema>;
export type UISchema = z.infer<typeof UISchemaSchema>;
