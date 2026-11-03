'use client';
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, ShieldCheck, Target } from 'lucide-react';
import { UISchema, Widget } from '../types/schema';
import { getMockDataForDomain, MockDataset } from '../lib/mockData';
import { ErrorBoundary } from './ErrorBoundary';
import { validateAndCorrectSchema } from '../lib/validation';
import {
  KPICardRenderer,
  LineChartRenderer,
  BarChartRenderer,
  AreaChartRenderer,
  PieChartRenderer,
  TableRenderer,
  ProgressBarRenderer,
  FormRenderer,
  ListRenderer,
  BoardRenderer,
  StreakCounterRenderer,
  CalendarHeatmapRenderer,
  InsightCardRenderer,
  SourceTransparencyRenderer
} from './WidgetRenderers';

interface DynamicRendererProps {
  schema: UISchema;
  prompt: string;
}

export function DynamicRenderer({ schema, prompt }: DynamicRendererProps) {
  // Sync state data with prompt domain (for legacy mockData fallback components)
  const [data, setData] = useState<MockDataset>(() => getMockDataForDomain(prompt));

  useEffect(() => {
    setData(getMockDataForDomain(prompt));
  }, [prompt]);

  // Validation Layer Execution Pass
  const { schema: validatedSchema, data: validatedData } = useMemo(() => {
    return validateAndCorrectSchema(schema, data);
  }, [schema, data]);

  const renderWidget = (widget: Widget) => {
    const props = {
      widget,
      data: validatedData,
      onUpdateData: setData
    };

    switch (widget.type) {
      case 'kpi_card':
        return <KPICardRenderer key={widget.id} {...props} />;
      case 'line_chart':
        return <LineChartRenderer key={widget.id} {...props} />;
      case 'bar_chart':
        return <BarChartRenderer key={widget.id} {...props} />;
      case 'area_chart':
        return <AreaChartRenderer key={widget.id} {...props} />;
      case 'pie_chart':
        return <PieChartRenderer key={widget.id} {...props} />;
      case 'table':
        return <TableRenderer key={widget.id} {...props} />;
      case 'insight_card':
        return <InsightCardRenderer key={widget.id} {...props} />;
      case 'source_transparency':
        return <SourceTransparencyRenderer key={widget.id} {...props} />;
      case 'progress_bar':
        return <ProgressBarRenderer key={widget.id} {...props} />;
      case 'form':
        return <FormRenderer key={widget.id} {...props} />;
      case 'list':
        return <ListRenderer key={widget.id} {...props} />;
      case 'board':
        return <BoardRenderer key={widget.id} {...props} />;
      case 'streak_counter':
        return <StreakCounterRenderer key={widget.id} {...props} />;
      case 'calendar_heatmap':
        return <CalendarHeatmapRenderer key={widget.id} {...props} />;
      default:
        return (
          <div key={widget.id} className="bg-white/95 dark:bg-[#0d1017]/95 border border-dashed border-slate-200 dark:border-[#1e2533] rounded-lg p-5 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-5 h-5 text-slate-500 mb-2" />
            <h4 className="font-semibold text-xs text-slate-300">Widget "{widget.title}"</h4>
            <p className="text-[11px] text-slate-500 mt-1">Configured for specialized telemetry renderer.</p>
          </div>
        );
    }
  };

  // Partition widgets into leading KPI cards and subsequent analytical visualizations
  const { initialKpis, otherWidgets } = useMemo(() => {
    const kpis: Widget[] = [];
    const others: Widget[] = [];
    let isLeading = true;

    for (const w of validatedSchema.widgets) {
      if (w.type === 'kpi_card' && isLeading) {
        kpis.push(w);
      } else {
        isLeading = false;
        others.push(w);
      }
    }
    return { initialKpis: kpis, otherWidgets: others };
  }, [validatedSchema.widgets]);

  // Analyze chart distribution in otherWidgets for dynamic column balancing
  const chartWidgets = useMemo(() => {
    const chartTypes = new Set(['line_chart', 'bar_chart', 'area_chart', 'pie_chart']);
    return otherWidgets.filter(w => chartTypes.has(w.type));
  }, [otherWidgets]);

  const getWidgetGridClass = (widget: Widget): string => {
    // Explicit schema width definitions take precedence
    if (widget.width === 'full') return 'col-span-12';
    if (widget.width === 'half') return 'col-span-12 lg:col-span-6';
    if (widget.width === 'two-thirds') return 'col-span-12 lg:col-span-8';
    if (widget.width === 'third') return 'col-span-12 lg:col-span-4';

    // Widget type specific defaults
    if (widget.type === 'table' || widget.type === 'source_transparency' || widget.type === 'insight_card') {
      return 'col-span-12';
    }

    if (widget.type === 'kpi_card') {
      return 'col-span-12 sm:col-span-6 lg:col-span-3';
    }

    // Dynamic balancing for charts when width is unspecified
    if (chartWidgets.length === 1) {
      return 'col-span-12';
    }

    if (chartWidgets.length === 2) {
      // If one is a line/bar/area chart and one is pie, allocate 8/4 columns for optical balance
      const hasPie = chartWidgets.some(w => w.type === 'pie_chart');
      if (hasPie) {
        return widget.type === 'pie_chart' ? 'col-span-12 lg:col-span-4' : 'col-span-12 lg:col-span-8';
      }
      return 'col-span-12 lg:col-span-6';
    }

    if (chartWidgets.length === 3) {
      return 'col-span-12 lg:col-span-4';
    }

    // Default for 4+ widgets or specialized cards
    return 'col-span-12 lg:col-span-6';
  };

    return (
    <div id="genui-dashboard-container" className="space-y-6">
      {/* Executive Header with Analytical Objective & Context */}
      <div className="bg-white dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] rounded-lg p-6 sm:p-7 relative shadow-md shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/50 transition-colors">
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d7c0f] dark:text-lime-400 font-semibold px-2 py-0.5 rounded bg-lime-500/10 border border-lime-600/30 dark:border-lime-500/20">
                Live Intelligence Workspace
              </span>
              {validatedSchema.sources && validatedSchema.sources.length > 0 && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-600/30 dark:border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 mr-1 inline" />
                  {validatedSchema.sources[0].provider}
                </span>
              )}
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-slate-100">
              {validatedSchema.title || "Analytics Overview"}
            </h1>
            
            {validatedSchema.subtitle && (
              <p className="text-xs sm:text-sm text-[#4b5563] dark:text-slate-400 mt-1">
                {validatedSchema.subtitle}
              </p>
            )}
          </div>

          {validatedSchema.objective && (
            <div className="flex items-start space-x-2.5 p-3.5 bg-[#f8fafc] dark:bg-[#080a0f]/90 rounded-md border border-[#cbd5e1] dark:border-[#1e2533] text-xs">
              <Target className="w-4 h-4 text-[#4d7c0f] dark:text-lime-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#172033] dark:text-slate-300 mr-1.5 uppercase text-[10px] font-mono tracking-wider">Analytical Objective:</span>
                <span className="text-[#374151] dark:text-slate-400">{validatedSchema.objective}</span>
              </div>
            </div>
          )}

          {/* Key Insights Preview */}
          {validatedSchema.insights && validatedSchema.insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {validatedSchema.insights.map((ins, i) => (
                <div key={i} className="p-3 bg-[#f8fafc] dark:bg-[#080a0f]/90 rounded-md border border-[#cbd5e1] dark:border-[#1e2533] text-xs space-y-1">
                  <h4 className="font-semibold text-[#172033] dark:text-slate-200 text-[11px] flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 mr-2" />
                    {ins.title}
                  </h4>
                  <p className="text-[11px] text-[#374151] dark:text-slate-400 line-clamp-2 leading-relaxed">{ins.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Balanced Top KPI Row */}
      {initialKpis.length > 0 && (
        <div className={`grid gap-4 ${
          initialKpis.length === 1 ? 'grid-cols-1 max-w-sm' :
          initialKpis.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          initialKpis.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          initialKpis.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {initialKpis.map((widget) => (
            <ErrorBoundary key={widget.id}>
              {renderWidget(widget)}
            </ErrorBoundary>
          ))}
        </div>
      )}

      {/* Main Analytical Visualizations Grid */}
      {otherWidgets.length > 0 && (
        validatedSchema.layout === 'stack' ? (
          <div className="flex flex-col space-y-5">
            {otherWidgets.map((widget) => (
              <ErrorBoundary key={widget.id}>
                {renderWidget(widget)}
              </ErrorBoundary>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {otherWidgets.map((widget) => (
              <ErrorBoundary key={widget.id}>
                <div className={`${getWidgetGridClass(widget)} flex flex-col`}>
                  {renderWidget(widget)}
                </div>
              </ErrorBoundary>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default DynamicRenderer;
