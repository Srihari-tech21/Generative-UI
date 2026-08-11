import { UISchema, Widget } from '../types/schema';
import { METRIC_LOOKUP, getFallbackMetric } from './metricLookup';
import { MockDataset } from './mockData';

/**
 * Lightweight Validation Layer
 * Runs after schema generation/fallback selection, sanitizing and clamping metrics.
 */
export function validateAndCorrectSchema(schema: UISchema, data: MockDataset): { schema: UISchema; data: MockDataset } {
  console.log("[Validation Layer] Starting validation pass on schema and dataset...");
  
  // Deep clone to prevent mutating static schemas/fallbacks
  const nextSchema = JSON.parse(JSON.stringify(schema)) as UISchema;
  const nextData = JSON.parse(JSON.stringify(data)) as MockDataset;

  const validWidgets: Widget[] = [];

  for (const widget of nextSchema.widgets) {
    let isValid = true;

    try {
      if (widget.type === 'kpi_card') {
        const key = widget.config.key || widget.config.metricId;
        if (!key) {
          console.warn(`[Validation Layer] kpi_card widget "${widget.title}" has no key configured. Correcting...`);
          widget.config.key = Object.keys(nextData.kpis)[0] || 'cash_runway';
        }
        
        const metricId = widget.config.key;
        const def = METRIC_LOOKUP[metricId] || getFallbackMetric(metricId);
        
        // Ensure metric exists in dataset
        if (!nextData.kpis[metricId]) {
          console.warn(`[Validation Layer] KPI metric "${metricId}" missing from dataset. Injecting fallback...`);
          // Generate a value within ranges
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

        const kpi = nextData.kpis[metricId];
        
        // 1. Force exact unit match
        if (kpi.unit !== def.unit) {
          console.warn(`[Validation Layer] KPI "${metricId}" unit mismatch: dataset has "${kpi.unit}", expected "${def.unit}". Correcting...`);
          kpi.unit = def.unit;
        }

        // 2. Validate and clamp numeric values
        const valNum = Number(kpi.value);
        if (isNaN(valNum)) {
          console.warn(`[Validation Layer] KPI "${metricId}" value is non-numeric: "${kpi.value}". Correcting...`);
          kpi.value = def.min;
        } else if (valNum < def.min || valNum > def.max) {
          console.warn(`[Validation Layer] KPI "${metricId}" value ${valNum} is out of bounds [${def.min}, ${def.max}]. Clamping...`);
          kpi.value = Math.max(def.min, Math.min(def.max, valNum));
        }

        // 3. Force exact label & context consistency from lookup registry
        kpi.label = def.label;
        kpi.context = def.context;

        // 4. Verify trend magnitudes and color logic semantically
        if (kpi.trend) {
          const baseVal = Number(kpi.value);
          const maxTrend = baseVal * 0.15;
          if (kpi.trend.amount > maxTrend) {
            kpi.trend.amount = Math.max(1, Math.round(baseVal * 0.05));
          }
          // directionally enforce correct semantic sign
          const isUp = kpi.trend.direction === "up";
          kpi.trend.isGood = isUp ? def.isTrendUpGood : !def.isTrendUpGood;
        }
      } 
      else if (widget.type === 'progress_bar') {
        const val = Number(widget.config.value);
        if (isNaN(val) || val < 0 || val > 100) {
          console.warn(`[Validation Layer] progress_bar "${widget.title}" value "${widget.config.value}" is invalid. Clamping to [0, 100]...`);
          widget.config.value = Math.max(0, Math.min(100, val || 0));
        }
      } 
      else if (widget.type === 'table') {
        const tableKey = widget.config.tableKey;
        if (!tableKey || !nextData.tables[tableKey]) {
          console.warn(`[Validation Layer] table "${widget.title}" references missing tableKey "${tableKey}". Dropping widget...`);
          isValid = false;
        }
      } 
      else if (widget.type === 'line_chart' || widget.type === 'bar_chart' || widget.type === 'pie_chart') {
        const chartKey = widget.config.chartKey;
        if (!chartKey || !nextData.charts[chartKey]) {
          console.warn(`[Validation Layer] chart "${widget.title}" references missing chartKey "${chartKey}". Dropping widget...`);
          isValid = false;
        }
      }
      else if (widget.type === 'list') {
        const listKey = widget.config.listKey;
        if (!listKey) {
          console.warn(`[Validation Layer] list "${widget.title}" has no listKey configured. Correcting...`);
          widget.config.listKey = 'habit_logs';
        }
        if (!widget.config.titleKey) widget.config.titleKey = 'title';
        if (!widget.config.subtitleKey) widget.config.subtitleKey = 'subtitle';
        if (!widget.config.valueKey) widget.config.valueKey = 'value';
        if (!widget.config.statusKey) widget.config.statusKey = 'status';
      } 
      else if (widget.type === 'board') {
        const boardKey = widget.config.boardKey;
        if (!boardKey || !nextData.boards?.[boardKey]) {
          console.warn(`[Validation Layer] board "${widget.title}" has missing or invalid boardKey. Correcting...`);
          widget.config.boardKey = Object.keys(nextData.boards || {})[0] || 'sales_board';
        }
      } 
      else if (widget.type === 'streak_counter') {
        const streakKey = widget.config.streakKey;
        if (!streakKey || !nextData.streaks?.[streakKey]) {
          console.warn(`[Validation Layer] streak_counter "${widget.title}" has missing or invalid streakKey. Correcting...`);
          widget.config.streakKey = Object.keys(nextData.streaks || {})[0] || 'habit_streak';
        }
      } 
      else if (widget.type === 'calendar_heatmap') {
        const heatmapKey = widget.config.heatmapKey;
        if (!heatmapKey || !nextData.heatmaps?.[heatmapKey]) {
          console.warn(`[Validation Layer] calendar_heatmap "${widget.title}" has missing or invalid heatmapKey. Correcting...`);
          widget.config.heatmapKey = Object.keys(nextData.heatmaps || {})[0] || 'habit_history';
        }
      } 
      else if (widget.type === 'form') {
        if (!widget.config.submitText) {
          widget.config.submitText = 'Submit';
        }
        if (!Array.isArray(widget.config.fields)) {
          console.warn(`[Validation Layer] form "${widget.title}" has no fields configured. Correcting...`);
          widget.config.fields = [
            { name: 'name', label: 'Full Name', type: 'text', required: true }
          ];
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
