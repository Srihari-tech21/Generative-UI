'use client';
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { UISchema, Widget } from '../types/schema';
import { getMockDataForDomain, MockDataset } from '../lib/mockData';
import { ErrorBoundary } from './ErrorBoundary';
import { motion } from 'framer-motion';
import { validateAndCorrectSchema } from '../lib/validation';
import {
  KPICardRenderer,
  LineChartRenderer,
  BarChartRenderer,
  PieChartRenderer,
  TableRenderer,
  ProgressBarRenderer,
  FormRenderer,
  ListRenderer,
  BoardRenderer,
  StreakCounterRenderer,
  CalendarHeatmapRenderer
} from './WidgetRenderers';

interface DynamicRendererProps {
  schema: UISchema;
  prompt: string;
}

export function DynamicRenderer({ schema, prompt }: DynamicRendererProps) {
  // Sync state data with prompt domain
  const [data, setData] = useState<MockDataset>(() => getMockDataForDomain(prompt));

  useEffect(() => {
    setData(getMockDataForDomain(prompt));
  }, [prompt]);

  // Validation Layer Execution Pass
  const { schema: validatedSchema, data: validatedData } = useMemo(() => {
    return validateAndCorrectSchema(schema, data);
  }, [schema, data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 100, 
        damping: 15 
      } 
    }
  };

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
      case 'pie_chart':
        return <PieChartRenderer key={widget.id} {...props} />;
      case 'table':
        return <TableRenderer key={widget.id} {...props} />;
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
          <div key={widget.id} className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <AlertCircle className="w-7 h-7 text-slate-400 dark:text-slate-500 mb-2" />
            <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Unrecognized Widget "{widget.title}"</h4>
            <p className="text-[10px] text-slate-400 mt-1">Type "{widget.type}" is not supported by the renderer library.</p>
          </div>
        );
    }
  };

  const layoutClass = validatedSchema.layout === 'stack'
    ? 'flex flex-col space-y-6'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            {validatedSchema.title || "Generated Workflow Canvas"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
            Layout style: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 text-[10px] capitalize">{validatedSchema.layout}</span>
          </p>
        </div>
      </div>

      {/* Render layout with isolated widget Error Boundaries */}
      <motion.div 
        className={layoutClass}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {validatedSchema.widgets.map((widget) => (
          <ErrorBoundary key={widget.id}>
            <motion.div variants={itemVariants}>
              {renderWidget(widget)}
            </motion.div>
          </ErrorBoundary>
        ))}
      </motion.div>
    </div>
  );
}

export default DynamicRenderer;
