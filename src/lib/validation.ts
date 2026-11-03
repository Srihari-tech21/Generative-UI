import { UISchema, Widget } from '../types/schema';
import { METRIC_LOOKUP, getFallbackMetric } from './metricLookup';
import { MockDataset } from './mockData';

/**
 * Lightweight Validation Layer
 * Sanitizes and validates schema widgets, supporting both live embedded data and legacy datasets.
 */
export function validateAndCorrectSchema(schema: UISchema, data: MockDataset): { schema: UISchema; data: MockDataset } {
  // Deep clone to prevent mutating static schemas
  const nextSchema = JSON.parse(JSON.stringify(schema)) as UISchema;
  const nextData = data ? (JSON.parse(JSON.stringify(data)) as MockDataset) : ({ kpis: {}, charts: {}, tables: {} } as unknown as MockDataset);

  const validWidgets: Widget[] = [];

  for (const widget of nextSchema.widgets) {
    let isValid = true;

    try {
      if (widget.type === 'kpi_card') {
        // If live value is directly embedded in config, it is valid
        if (widget.config.value !== undefined) {
          validWidgets.push(widget);
          continue;
        }

        const key = widget.config.key || widget.config.metricId;
        if (!key) {
          widget.config.key = Object.keys(nextData.kpis || {})[0] || 'cash_runway';
        }
        
        const metricId = widget.config.key;
        const def = METRIC_LOOKUP[metricId] || getFallbackMetric(metricId);
        
        if (nextData.kpis && !nextData.kpis[metricId]) {
          const rangeVal = def.min + Math.round((def.max - def.min) / 2);
          nextData.kpis[metricId] = {
            id: metricId,
            label: def.label,
            value: rangeVal,
            unit: def.unit,
            trend: { direction: "up", amount: Math.max(1, Math.round(rangeVal * 0.05)), isGood: def.isTrendUpGood },
            context: def.context
          };
        }
      } 
      else if (
        widget.type === 'line_chart' || 
        widget.type === 'bar_chart' || 
        widget.type === 'pie_chart' || 
        widget.type === 'area_chart' ||
        widget.type === 'scatter_plot'
      ) {
        // If data is provided in widget config, it is completely valid
        if (Array.isArray(widget.config.data) && widget.config.data.length > 0) {
          validWidgets.push(widget);
          continue;
        }

        const chartKey = widget.config.chartKey;
        if (!chartKey || !nextData.charts?.[chartKey]) {
          // If legacy chart key missing, only drop if no config.data
          if (!Array.isArray(widget.config.data)) {
            isValid = false;
          }
        }
      }
      else if (widget.type === 'table') {
        // If data is provided in widget config, it is completely valid
        if (Array.isArray(widget.config.data)) {
          validWidgets.push(widget);
          continue;
        }

        const tableKey = widget.config.tableKey;
        if (!tableKey || !nextData.tables?.[tableKey]) {
          isValid = false;
        }
      } 
      else if (widget.type === 'insight_card' || widget.type === 'source_transparency') {
        // These are always valid first-class analytics widgets
        validWidgets.push(widget);
        continue;
      }
      else if (widget.type === 'progress_bar') {
        const val = Number(widget.config.value);
        if (isNaN(val) || val < 0 || val > 100) {
          widget.config.value = Math.max(0, Math.min(100, val || 0));
        }
      } 
      else if (widget.type === 'list') {
        if (!widget.config.listKey) widget.config.listKey = 'habit_logs';
        if (!widget.config.titleKey) widget.config.titleKey = 'title';
        if (!widget.config.subtitleKey) widget.config.subtitleKey = 'subtitle';
        if (!widget.config.valueKey) widget.config.valueKey = 'value';
        if (!widget.config.statusKey) widget.config.statusKey = 'status';
      } 
      else if (widget.type === 'board') {
        const boardKey = widget.config.boardKey;
        if (!boardKey || !nextData.boards?.[boardKey]) {
          widget.config.boardKey = Object.keys(nextData.boards || {})[0] || 'sales_board';
        }
      } 
      else if (widget.type === 'streak_counter') {
        const streakKey = widget.config.streakKey;
        if (!streakKey || !nextData.streaks?.[streakKey]) {
          widget.config.streakKey = Object.keys(nextData.streaks || {})[0] || 'habit_streak';
        }
      } 
      else if (widget.type === 'calendar_heatmap') {
        const heatmapKey = widget.config.heatmapKey;
        if (!heatmapKey || !nextData.heatmaps?.[heatmapKey]) {
          widget.config.heatmapKey = Object.keys(nextData.heatmaps || {})[0] || 'habit_history';
        }
      } 
      else if (widget.type === 'form') {
        if (!widget.config.submitText) widget.config.submitText = 'Submit';
        if (!Array.isArray(widget.config.fields)) {
          widget.config.fields = [{ name: 'name', label: 'Full Name', type: 'text', required: true }];
        }
      }
    } catch (e) {
      console.error(`[Validation Layer] Exception validating widget "${widget.title}":`, e);
      isValid = false;
    }

    if (isValid) {
      validWidgets.push(widget);
    }
  }

  nextSchema.widgets = validWidgets;
  return { schema: nextSchema, data: nextData };
}
