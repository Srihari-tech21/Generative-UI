'use client';
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, prefer-const */

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Users, 
  Circle, 
  Check, 
  Plus, 
  Calendar,
  IndianRupee
} from 'lucide-react';
import { Widget } from '../types/schema';
import { MockDataset, formatIndianCurrency } from '../lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { METRIC_LOOKUP, getFallbackMetric } from '../lib/metricLookup';

interface RendererProps {
  widget: Widget;
  data: MockDataset;
  onUpdateData: (updater: (prev: MockDataset) => MockDataset) => void;
}

// Color Palette for charts
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

// Hook to ensure client-side rendering (avoids hydration mismatch for Recharts)
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export function AnimateNumericValue({ value, duration = 800 }: { value: string | number; duration?: number }) {
  const [displayVal, setDisplayVal] = useState(typeof value === 'number' ? '0' : String(value));

  useEffect(() => {
    const valStr = String(value);
    const digitsMatch = valStr.match(/\d+/g);
    if (!digitsMatch) {
      setDisplayVal(valStr);
      return;
    }

    const cleanDigits = valStr.replace(/[^\d]/g, '');
    const targetNum = parseInt(cleanDigits, 10);
    if (isNaN(targetNum)) {
      setDisplayVal(valStr);
      return;
    }

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * targetNum);

      let formatted = '';
      if (valStr.includes('₹')) {
        formatted = formatIndianCurrency(current);
      } else if (valStr.includes('%')) {
        formatted = `${current}%`;
      } else {
        const formatRegex = /\b\d[\d,]*(\.\d+)?\b/;
        if (valStr.includes('days')) {
          formatted = `${current} days`;
        } else if (valStr.includes('months')) {
          formatted = `${current} months`;
        } else if (valStr.includes('guests')) {
          formatted = `${current} guests`;
        } else if (valStr.includes('SKUs')) {
          formatted = `${current} SKUs`;
        } else if (valStr.includes('active SKUs')) {
          formatted = `${current} active SKUs`;
        } else {
          formatted = valStr.replace(formatRegex, current.toLocaleString());
        }
      }
      setDisplayVal(formatted);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{displayVal}</>;
}

// 1. KPI Card Renderer
export function KPICardRenderer({ widget, data }: RendererProps) {
  const key = widget.config.key || Object.keys(data.kpis)[0];
  const def = METRIC_LOOKUP[key] || getFallbackMetric(key);
  
  // Retrieve current metric value
  const kpi = data.kpis[key] || {
    id: key,
    label: def.label,
    value: def.min,
    unit: def.unit,
    context: def.context
  };

  // Choose icon based on title/key
  const getIcon = () => {
    const title = (kpi.label || widget.title).toLowerCase();
    if (title.includes('cash') || title.includes('burn') || title.includes('revenue') || title.includes('dollar') || title.includes('gmv') || title.includes('mrr') || title.includes('value')) {
      return <IndianRupee className="w-5 h-5 text-indigo-500" />;
    }
    if (title.includes('streak') || title.includes('rate') || title.includes('completion')) {
      return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    }
    if (title.includes('guest') || title.includes('rsvp') || title.includes('attend')) {
      return <Users className="w-5 h-5 text-amber-500" />;
    }
    if (title.includes('stock') || title.includes('warehouse') || title.includes('item')) {
      return <Package className="w-5 h-5 text-blue-500" />;
    }
    return <TrendingUp className="w-5 h-5 text-slate-500" />;
  };

  const getFormattedValue = () => {
    const valNum = Number(kpi.value);
    if (isNaN(valNum)) return String(kpi.value);
    
    if (kpi.unit === '₹') {
      return formatIndianCurrency(valNum);
    }
    if (kpi.unit === '%') {
      return `${valNum}%`;
    }
    return `${valNum} ${kpi.unit || ''}`.trim();
  };

  const formattedVal = getFormattedValue();

  const trend = kpi.trend;
  const changeColor = trend
    ? (trend.isGood 
      ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' 
      : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30')
    : '';

  const getTrendText = () => {
    if (!trend) return '';
    const prefix = trend.direction === 'up' ? '+' : '-';
    if (kpi.unit === '₹') {
      return `${prefix}₹${trend.amount.toLocaleString()}`;
    }
    if (kpi.unit === '%') {
      return `${prefix}${trend.amount}%`;
    }
    return `${prefix}${trend.amount} ${kpi.unit}`;
  };

  const trendText = getTrendText();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label || widget.title}</span>
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
          {getIcon()}
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          <AnimateNumericValue value={formattedVal} />
        </span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center ${changeColor}`}>
            {trendText}
          </span>
        )}
      </div>
      {kpi.context && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{kpi.context}</p>
      )}
    </div>
  );
}

// 2. Line Chart Renderer
export function LineChartRenderer({ widget, data }: RendererProps) {
  const mounted = useMounted();
  const chartKey = widget.config.chartKey || Object.keys(data.charts)[0];
  const chartData = data.charts[chartKey] || [];
  const xAxisKey = widget.config.xAxisKey || 'name';
  const dataKeys: string[] = widget.config.dataKeys || [];

  if (!mounted) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-xs">Loading chart...</div>;
  }

  const formatYAxis = (tickVal: any) => {
    const isFinancial = chartKey === 'burn_history' || chartKey === 'pipeline_stages' || chartKey === 'sales_by_category';
    if (isFinancial) {
      if (tickVal >= 10000000) return `₹${(tickVal / 10000000).toFixed(1)}Cr`;
      if (tickVal >= 100000) return `₹${(tickVal / 100000).toFixed(0)}L`;
      return `₹${tickVal.toLocaleString('en-IN')}`;
    }
    if (chartKey === 'stock_by_category') {
      return `${tickVal} SKUs`;
    }
    return tickVal;
  };

  const formatTooltip = (value: any, name: any) => {
    const cleanName = String(name).charAt(0).toUpperCase() + String(name).slice(1);
    const keyLower = String(name).toLowerCase();
    if (
      keyLower.includes('burn') ||
      keyLower.includes('revenue') ||
      keyLower.includes('expenses') ||
      keyLower.includes('value') ||
      keyLower.includes('sales') ||
      keyLower.includes('price') ||
      keyLower.includes('gmv') ||
      chartKey === 'burn_history' ||
      chartKey === 'pipeline_stages' ||
      chartKey === 'sales_by_category'
    ) {
      if (keyLower.includes('percent') || keyLower.includes('rate') || keyLower.includes('count')) {
        return [value, cleanName];
      }
      return [formatIndianCurrency(Number(value)), cleanName];
    }
    if (chartKey === 'stock_by_category' || keyLower.includes('stock')) {
      return [`${value} SKUs`, cleanName];
    }
    if (keyLower.includes('orders') || chartKey === 'orders_by_hour') {
      return [`${value} orders`, cleanName];
    }
    if (keyLower.includes('admissions') || chartKey === 'admissions_by_department') {
      return [`${value} admissions`, cleanName];
    }
    return [value, cleanName];
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <h3 className="text-base font-semibold text-slate-950 dark:text-white mb-4">{widget.title}</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff',
                fontSize: '12px'
              }} 
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            {dataKeys.map((key: string, idx: number) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationDuration={800}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 3. Bar Chart Renderer
export function BarChartRenderer({ widget, data }: RendererProps) {
  const mounted = useMounted();
  const chartKey = widget.config.chartKey || Object.keys(data.charts)[0];
  const chartData = data.charts[chartKey] || [];
  const xAxisKey = widget.config.xAxisKey || 'name';
  const dataKeys: string[] = widget.config.dataKeys || [];

  if (!mounted) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-xs">Loading chart...</div>;
  }

  const formatYAxis = (tickVal: any) => {
    const isFinancial = chartKey === 'burn_history' || chartKey === 'pipeline_stages' || chartKey === 'sales_by_category';
    if (isFinancial) {
      if (tickVal >= 10000000) return `₹${(tickVal / 10000000).toFixed(1)}Cr`;
      if (tickVal >= 100000) return `₹${(tickVal / 100000).toFixed(0)}L`;
      return `₹${tickVal.toLocaleString('en-IN')}`;
    }
    if (chartKey === 'stock_by_category') {
      return `${tickVal} SKUs`;
    }
    return tickVal;
  };

  const formatTooltip = (value: any, name: any) => {
    const cleanName = String(name).charAt(0).toUpperCase() + String(name).slice(1);
    const keyLower = String(name).toLowerCase();
    if (
      keyLower.includes('burn') ||
      keyLower.includes('revenue') ||
      keyLower.includes('expenses') ||
      keyLower.includes('value') ||
      keyLower.includes('sales') ||
      keyLower.includes('price') ||
      keyLower.includes('gmv') ||
      chartKey === 'burn_history' ||
      chartKey === 'pipeline_stages' ||
      chartKey === 'sales_by_category'
    ) {
      if (keyLower.includes('percent') || keyLower.includes('rate') || keyLower.includes('count')) {
        return [value, cleanName];
      }
      return [formatIndianCurrency(Number(value)), cleanName];
    }
    if (chartKey === 'stock_by_category' || keyLower.includes('stock')) {
      return [`${value} SKUs`, cleanName];
    }
    if (keyLower.includes('orders') || chartKey === 'orders_by_hour') {
      return [`${value} orders`, cleanName];
    }
    if (keyLower.includes('admissions') || chartKey === 'admissions_by_department') {
      return [`${value} admissions`, cleanName];
    }
    return [value, cleanName];
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <h3 className="text-base font-semibold text-slate-950 dark:text-white mb-4">{widget.title}</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff',
                fontSize: '12px'
              }} 
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            {dataKeys.map((key: string, idx: number) => (
              <Bar
                key={key}
                dataKey={key}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                radius={[6, 6, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 4. Pie Chart Renderer
export function PieChartRenderer({ widget, data }: RendererProps) {
  const mounted = useMounted();
  const chartKey = widget.config.chartKey || Object.keys(data.charts)[0];
  const chartData = data.charts[chartKey] || [];
  const valueKey = widget.config.dataKeys?.[0] || 'value';
  const nameKey = widget.config.xAxisKey || 'name';

  if (!mounted) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400 text-xs">Loading chart...</div>;
  }

  const formatPieTooltip = (value: any, name: any) => {
    const cleanName = String(name || '').charAt(0).toUpperCase() + String(name || '').slice(1);
    const keyLower = String(chartKey).toLowerCase();
    if (keyLower.includes('payment') || keyLower.includes('method') || keyLower === 'payment_methods') {
      return [`${value}%`, cleanName];
    }
    if (chartKey === 'stock_by_category') {
      return [`${value} SKUs`, 'Stock Level'];
    }
    return [value, cleanName];
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <h3 className="text-base font-semibold text-slate-950 dark:text-white mb-4">{widget.title}</h3>
      <div className="h-[280px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey={valueKey}
              nameKey={nameKey}
              isAnimationActive={true}
              animationDuration={800}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={formatPieTooltip}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff',
                fontSize: '12px'
              }} 
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 5. Table Renderer
export function TableRenderer({ widget, data }: RendererProps) {
  const tableKey = widget.config.tableKey || Object.keys(data.tables)[0];
  const tableData = data.tables[tableKey] || [];
  const columns: { key: string; label: string }[] = widget.config.columns || [];

  // Helper to render badges in table cells based on content
  const renderCellContent = (key: string, val: any) => {
    if (typeof val === 'number' && key === 'amount') {
      const isNeg = val < 0;
      return (
        <span className={`font-mono font-semibold ${isNeg ? 'text-red-500' : 'text-emerald-500'}`}>
          {val > 0 ? '+' : ''}{formatIndianCurrency(val)}
        </span>
      );
    }
    if (typeof val === 'number' && (key === 'value' || key === 'price' || key === 'gmv' || key === 'revenue')) {
      return <span className="font-mono font-medium">{formatIndianCurrency(val)}</span>;
    }

    const strVal = String(val);
    const lower = strVal.toLowerCase();

    if (lower === 'completed' || lower === 'confirmed' || lower === 'in stock') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Check className="w-3 h-3 mr-1" />
          {strVal}
        </span>
      );
    }
    if (lower === 'skipped' || lower === 'cancelled' || lower === 'out of stock') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          {strVal}
        </span>
      );
    }
    if (lower === 'pending' || lower === 'in progress' || lower === 'low stock' || lower === 'proposal sent' || lower === 'negotiation') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <Circle className="w-2.5 h-2.5 fill-current mr-1.5 animate-pulse" />
          {strVal}
        </span>
      );
    }

    return <span className="text-slate-700 dark:text-slate-300">{strVal}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">{widget.title}</h3>
        <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
          {tableData.length} records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {columns.map(col => (
                <th key={col.key} className="pb-3 pt-1 px-4">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400">
                  No records found
                </td>
              </tr>
            ) : (
              tableData.map((row: any, idx: number) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  {columns.map((col: any) => (
                    <td key={col.key} className="py-3 px-4 font-normal text-slate-900 dark:text-slate-100">
                      {renderCellContent(col.key, row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 6. Progress Bar Renderer
export function ProgressBarRenderer({ widget, data }: RendererProps) {
  let value = widget.config.value ?? 50;
  let label = widget.config.label || '';

  if (data) {
    const titleLower = widget.title.toLowerCase();
    if (titleLower.includes("capacity") || titleLower.includes("rsvp")) {
      const currentRSVPs = data.kpis.attendee_count?.value || 284;
      value = Math.min(100, Math.round((Number(currentRSVPs) / 400) * 100));
      label = `${currentRSVPs} out of 400 RSVPs (${value}% filled)`;
    } else if (titleLower.includes("icu")) {
      const currentICU = data.kpis.icu_occupancy?.value || 75;
      value = Math.min(100, Number(currentICU));
      label = `${Math.round(Number(currentICU) * 20 / 100)} out of 20 ICU beds occupied`;
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{widget.title}</h3>
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden relative">
        <motion.div 
          className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {label && (
        <p className="text-xs text-slate-400 mt-2 flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {label}
        </p>
      )}
    </div>
  );
}

// 7. Form Renderer
export function FormRenderer({ widget, onUpdateData }: RendererProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fields: Array<{ name: string; label: string; type: string; placeholder?: string; required?: boolean; options?: string[] }> = 
    widget.config.fields || [];
  const submitText = widget.config.submitText || "Submit";

  const handleInputChange = (name: string, val: string) => {
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);

      // Mutate local state in parent component! 
      // Connect form submission dynamically to table/list datasets.
      onUpdateData((prevData) => {
        // Create an deep clone of data
        const nextData = { ...prevData };

        // Determine target destination based on form fields or known domains
        if (formData.habit) {
          // 1. Habit Tracker Update
          const newHabit = {
            id: `hb-${Date.now()}`,
            habit: formData.habit,
            category: "Logged Activity",
            status: "Completed",
            time: formData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          if (nextData.tables.habit_logs) {
            nextData.tables.habit_logs = [newHabit, ...nextData.tables.habit_logs];
          }
          if (nextData.lists) {
            const listArr = Array.isArray(nextData.lists) ? nextData.lists : [];
            const newListItem = {
              title: newHabit.habit,
              subtitle: newHabit.category,
              value: newHabit.time,
              status: newHabit.status
            };
            nextData.lists = [newListItem, ...listArr] as any;
          }
          // Increment completion rate
          if (nextData.kpis.completion_rate) {
            const currentVal = Number(nextData.kpis.completion_rate.value) || 80;
            nextData.kpis.completion_rate = {
              ...nextData.kpis.completion_rate,
              value: Math.min(currentVal + 2, 100),
              trend: { direction: 'up', amount: 2, isGood: true }
            };
          }
        } else if (formData.name && formData.email) {
          // 2. RSVP Signup Update
          const newGuest = {
            title: formData.name,
            name: formData.name,
            email: formData.email,
            ticket: formData.ticket || formData.diet || "General Admin",
            status: "Confirmed"
          };
          if (nextData.lists && nextData.lists.attendees) {
            nextData.lists.attendees = [newGuest, ...nextData.lists.attendees];
          }
          // Increment total RSVP KPI
          const rsvpKey = nextData.kpis.attendee_count ? "attendee_count" : "total_rsvps";
          if (nextData.kpis[rsvpKey]) {
            const num = Number(nextData.kpis[rsvpKey].value) || 284;
            nextData.kpis[rsvpKey] = {
              ...nextData.kpis[rsvpKey],
              value: num + 1,
              trend: { direction: 'up', amount: 1, isGood: true }
            };
          }
        } else if (formData.patient_name || formData.patient) {
          // 3. Hospital Patient Admission Update
          const newPatient = {
            id: `pt-${Date.now()}`,
            patient_name: formData.patient_name || formData.patient,
            age: formData.age || "32",
            ward: formData.ward || "Emergency Ward",
            status: "In Triage",
            wait_time: "10 mins"
          };
          if (nextData.tables.patient_admissions) {
            nextData.tables.patient_admissions = [newPatient, ...nextData.tables.patient_admissions];
          }
          // Increment occupancy or wait times
          if (nextData.kpis.bed_occupancy) {
            const val = Number(nextData.kpis.bed_occupancy.value) || 82;
            nextData.kpis.bed_occupancy = {
              ...nextData.kpis.bed_occupancy,
              value: Math.min(val + 1, 100),
              trend: { direction: 'up', amount: 1, isGood: false }
            };
          }
        } else {
          // 4. Generic Custom Form Update
          const tableKey = Object.keys(nextData.tables)[0];
          if (tableKey) {
            const newRow = {
              id: `custom-${Date.now()}`,
              ...formData,
              status: "Active",
              date: new Date().toISOString().split('T')[0]
            };
            nextData.tables[tableKey] = [newRow, ...nextData.tables[tableKey]];
          }
        }

        return nextData;
      });

      // Reset form notification after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({});
      }, 3000);
    }, 800); // realistic network delay simulation
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <h3 className="text-base font-semibold text-slate-950 dark:text-white mb-4">{widget.title}</h3>
      {submitted ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Action Completed!</p>
            <p className="text-xs opacity-90">Form submitted and dashboard metrics updated.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field: any) => (
            <div key={field.name} className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose options...</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  rows={3}
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <Plus className="w-4.5 h-4.5 mr-1" />
                {submitText}
              </span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// 8. List Renderer (Checklist type)
export function ListRenderer({ widget, data, onUpdateData }: RendererProps) {
  // Try to read list items. If lists is an array or indexed by key
  const listKey = widget.config.listKey;
  let rawItems: any[] = [];
  
  if (listKey && data.tables[listKey]) {
    rawItems = data.tables[listKey];
  } else if (Array.isArray(data.lists)) {
    rawItems = data.lists;
  } else if (listKey && (data as any)[listKey]) {
    rawItems = (data as any)[listKey];
  } else {
    rawItems = data.lists ? Object.values(data.lists)[0] || [] : [];
  }

  const titleKey = widget.config.titleKey || 'title';
  const subtitleKey = widget.config.subtitleKey || 'subtitle';
  const valueKey = widget.config.valueKey || 'value';
  const statusKey = widget.config.statusKey || 'status';

  // Toggle item status interactively in state!
  const handleToggleStatus = (idx: number, itemTitle: string) => {
    onUpdateData((prevData) => {
      const nextData = { ...prevData };
      let listArr = [...rawItems];
      
      const item = { ...listArr[idx] };
      const currentStatus = item[statusKey] || item.status;
      const isCompleted = String(currentStatus).toLowerCase() === 'completed';
      
      const nextStatus = isCompleted ? 'Pending' : 'Completed';
      item[statusKey] = nextStatus;
      if (item.status !== undefined) item.status = nextStatus;
      
      listArr[idx] = item;

      // Put back to correct place
      if (listKey && nextData.tables[listKey]) {
        nextData.tables[listKey] = listArr;
      } else if (Array.isArray(nextData.lists)) {
        nextData.lists = listArr as any;
      } else if (nextData.lists && typeof nextData.lists === 'object') {
        const key = listKey || Object.keys(nextData.lists)[0] || 'attendees';
        (nextData.lists as any)[key] = listArr;
      }

      // Update completion rate KPI if it exists
      if (nextData.kpis.completion_rate) {
        const completedCount = listArr.filter(i => String(i[statusKey] || i.status).toLowerCase() === 'completed').length;
        const total = listArr.length || 1;
        const rate = Math.round((completedCount / total) * 100);
        nextData.kpis.completion_rate = {
          ...nextData.kpis.completion_rate,
          value: rate,
          trend: {
            direction: rate >= 84 ? 'up' : 'down',
            amount: Math.abs(rate - 84),
            isGood: rate >= 84
          }
        };
      }

      return nextData;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">{widget.title}</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
          Checklist
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {rawItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No items checklist found</p>
        ) : (
          rawItems.map((item: any, idx: number) => {
            const title = item[titleKey] || item.title || item.habit || '';
            const subtitle = item[subtitleKey] || item.subtitle || item.category || '';
            const val = item[valueKey] || item.value || item.time || '';
            const status = item[statusKey] || item.status || '';
            const isCompleted = String(status).toLowerCase() === 'completed';

            return (
              <div 
                key={idx} 
                onClick={() => handleToggleStatus(idx, title)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/10 px-2 rounded-xl transition-all cursor-pointer select-none group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="flex-shrink-0 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/10" />
                    ) : (
                      <div className="w-5.5 h-5.5 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent flex items-center justify-center group-hover:border-indigo-500" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold text-slate-900 dark:text-slate-100 transition-all ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {title}
                    </p>
                    {subtitle && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
                    )}
                  </div>
                </div>
                {val && (
                  <span className="text-xs font-mono font-medium px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg">
                    {val}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 9. Board (Kanban style columns) Renderer
export function BoardRenderer({ widget, data }: RendererProps) {
  const boardKey = widget.config.boardKey || (data.boards ? Object.keys(data.boards)[0] : 'sales_board');
  const board = data.boards?.[boardKey] || { columns: [] };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm col-span-1 md:col-span-3 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">{widget.title}</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
          Kanban Board
        </span>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-3">
        {board.columns.map((col: any, colIdx: number) => (
          <div key={colIdx} className="flex-1 min-w-[250px] max-w-[300px] bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl space-y-3 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col.title}</span>
              <span className="text-xs px-2 py-0.5 bg-slate-200/50 dark:bg-slate-800 text-slate-500 rounded-lg font-bold">{col.cards.length}</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {col.cards.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No cards
                </div>
              ) : (
                col.cards.map((card: any) => (
                  <div key={card.id} className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm hover:shadow hover:border-indigo-400/50 cursor-grab active:cursor-grabbing transition-all space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{card.title}</p>
                    {card.subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{card.subtitle}</p>}
                    {card.value && (
                      <div className="flex justify-end pt-1">
                        <span className="text-[10px] font-mono font-bold bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                          {card.value}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 10. Streak Counter Renderer
export function StreakCounterRenderer({ widget, data }: RendererProps) {
  const streakKey = widget.config.streakKey || (data.streaks ? Object.keys(data.streaks)[0] : 'habit_streak');
  const streak = data.streaks?.[streakKey] || { count: 0, label: widget.title };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center space-x-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center animate-pulse">
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C12 2 17 6.5 17 10.5C17 13.5 14.8 15.5 12 15.5C9.2 15.5 7 13.5 7 10.5C7 6.5 12 2 12 2ZM12 4.4C10.5 5.9 8.8 8.6 8.8 10.5C8.8 12.4 10.2 13.7 12 13.7C13.8 13.7 15.2 12.4 15.2 10.5C15.2 8.6 13.5 5.9 12 4.4Z" />
          <path d="M12 16.5C14.8 16.5 18.5 18.5 18.5 20.5C18.5 21.5 17.5 22 16.5 22H7.5C6.5 22 5.5 21.5 5.5 20.5C5.5 18.5 9.2 16.5 12 16.5Z" />
        </svg>
      </div>
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{streak.label || "Gamified Streak"}</span>
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white block mt-0.5">
          <AnimateNumericValue value={`${streak.count} Days`} />
        </span>
      </div>
    </div>
  );
}

// 11. Calendar Heatmap Renderer
export function CalendarHeatmapRenderer({ widget, data }: RendererProps) {
  const heatmapKey = widget.config.heatmapKey || (data.heatmaps ? Object.keys(data.heatmaps)[0] : 'habit_history');
  const heatmap = data.heatmaps?.[heatmapKey] || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-white mb-4">{widget.title}</h3>
      <div className="flex flex-wrap gap-1.5 max-w-sm md:max-w-md">
        {heatmap.map((cell: any, idx: number) => {
          const isAct = cell.value === 1;
          return (
            <div
              key={idx}
              title={`${cell.date}: ${isAct ? 'Completed' : 'Skipped'}`}
              className={`w-5 h-5 rounded-md transition-all ${
                isAct 
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow shadow-emerald-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center space-x-2 mt-4 text-[10px] text-slate-400 font-medium">
        <span>Less</span>
        <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="w-3.5 h-3.5 rounded bg-emerald-500 shadow shadow-emerald-500/20" />
        <span>More</span>
        <span className="ml-2 font-mono">(Showing past 30 days)</span>
      </div>
    </div>
  );
}
