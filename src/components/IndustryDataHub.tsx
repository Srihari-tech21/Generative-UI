'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Utensils,
  Briefcase,
  Film,
  Activity,
  ShoppingBag,
  GraduationCap,
  Hotel,
  Truck,
  Landmark,
  Dumbbell,
  Zap,
  Wheat,
  Search,
  Database,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  X,
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';
import { 
  DATASETS_CATALOG, 
  getAllIndustries,
  getDatasetById
} from '../lib/datasets/catalog';
import { IndustryId } from '../lib/datasets/datasetTypes';

interface IndustryDataHubProps {
  onSelectDataset: (datasetId: string, samplePrompt?: string) => void;
  isGenerating?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Utensils,
  Briefcase,
  Film,
  Activity,
  ShoppingBag,
  GraduationCap,
  Hotel,
  Truck,
  Landmark,
  Dumbbell,
  Zap,
  Wheat
};

export function IndustryDataHub({ onSelectDataset, isGenerating = false }: IndustryDataHubProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDatasetId, setPreviewDatasetId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: Record<string, any>[] } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const industries = useMemo(() => getAllIndustries(), []);

  // Filter datasets by industry and search query
  const filteredDatasets = useMemo(() => {
    let list = DATASETS_CATALOG;
    if (selectedIndustry !== 'all') {
      list = list.filter(d => d.industry === selectedIndustry);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.industryName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.columns.some(c => c.toLowerCase().includes(q)) ||
        d.supportedMetrics.some(m => m.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedIndustry, searchQuery]);

  // Load preview data when previewDatasetId changes
  useEffect(() => {
    if (!previewDatasetId) return;

    const item = getDatasetById(previewDatasetId);
    if (!item) return;

    let active = true;
    const timer = setTimeout(() => {
      if (active) setIsPreviewLoading(true);
    }, 0);

    // Fetch the CSV directly from the public folder
    fetch(item.filePath)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        if (!active) return;
        const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const rows: Record<string, any>[] = [];
          for (let i = 1; i < Math.min(lines.length, 11); i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: Record<string, any> = {};
            headers.forEach((h, idx) => {
              row[h] = values[idx] ?? '';
            });
            rows.push(row);
          }
          setPreviewData({ headers, rows });
        }
      })
      .catch(err => {
        if (!active) return;
        console.error('Failed to load dataset preview:', err);
        // Fallback to headers from catalog
        setPreviewData({
          headers: item.columns,
          rows: []
        });
      })
      .finally(() => {
        if (active) setIsPreviewLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [previewDatasetId]);

  const activePreviewItem = useMemo(() => {
    if (!previewDatasetId) return null;
    return getDatasetById(previewDatasetId);
  }, [previewDatasetId]);

  return (
    <section id="industry-hub" className="w-full py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#cbd5e1] dark:border-[#1e2533]">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-lime-500/10 text-lime-700 dark:text-lime-400 border border-lime-500/20 mb-3">
              <Database className="w-3.5 h-3.5" />
              <span>Multi-Industry Analytics Library</span>
              <span className="text-slate-400">•</span>
              <span>12 Industries • 36 Datasets</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Industry Data Hub
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explore mathematically consistent benchmark datasets across 12 sectors. Select any dataset to inspect columns, preview actual records, and immediately compile an executive analytics dashboard.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search datasets, columns, metrics..."
              className="w-full pl-9 pr-8 py-2 rounded-lg text-xs bg-white dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] text-[#111827] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#84cc16] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Industry Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedIndustry('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              selectedIndustry === 'all'
                ? 'bg-[#84cc16] text-[#0f172a] font-bold shadow-sm'
                : 'bg-white dark:bg-[#0d1017] text-[#475569] dark:text-slate-300 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-lime-500/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Industries</span>
            <span className="text-[10px] opacity-75 ml-1 px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">36</span>
          </button>

          {industries.map(ind => {
            const Icon = ICON_MAP[ind.iconName] || Database;
            const isSelected = selectedIndustry === ind.id;
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => setSelectedIndustry(ind.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#84cc16] text-[#0f172a] font-bold shadow-sm'
                    : 'bg-white dark:bg-[#0d1017] text-[#475569] dark:text-slate-300 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-lime-500/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? '#0f172a' : ind.color }} />
                <span>{ind.name}</span>
                <span className="text-[10px] opacity-75 ml-0.5 px-1 py-0.2 rounded-full bg-black/10 dark:bg-white/10">3</span>
              </button>
            );
          })}
        </div>

        {/* Selected Industry Banner (when a specific industry is chosen) */}
        {selectedIndustry !== 'all' && (
          (() => {
            const ind = industries.find(i => i.id === selectedIndustry);
            if (!ind) return null;
            const Icon = ICON_MAP[ind.iconName] || Database;
            return (
              <div className="p-4 rounded-xl bg-white dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-[#141824]" style={{ borderLeft: `3px solid ${ind.color}` }}>
                    <Icon className="w-5 h-5" style={{ color: ind.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                      {ind.name}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141824] text-slate-500 font-normal">
                        {ind.tagline}
                      </span>
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-slate-400 mt-0.5">
                      {ind.description}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right text-[11px] font-mono text-slate-500">
                  Benchmark Focus: <span className="font-semibold text-lime-700 dark:text-lime-400">{ind.benchmarkMetric}</span>
                </div>
              </div>
            );
          })()
        )}

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDatasets.map(dataset => {
            const industryMeta = industries.find(i => i.id === dataset.industry);
            const Icon = industryMeta ? (ICON_MAP[industryMeta.iconName] || Database) : Database;
            const accentColor = industryMeta?.color || '#84cc16';

            return (
              <div
                key={dataset.id}
                className="group rounded-xl bg-white dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-lime-500/50 dark:hover:border-lime-500/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="space-y-3.5">
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border"
                      style={{ 
                        backgroundColor: `${accentColor}12`, 
                        borderColor: `${accentColor}30`,
                        color: accentColor
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{dataset.industryName}</span>
                    </span>

                    <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#141824] px-2 py-0.5 rounded border border-[#cbd5e1] dark:border-[#1e2533]">
                      {dataset.recordCount} records • CSV
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white group-hover:text-lime-700 dark:group-hover:text-lime-400 transition-colors line-clamp-1">
                      {dataset.name}
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                      {dataset.description}
                    </p>
                  </div>

                  {/* Synthetic badge notice */}
                  <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>SYNTHETIC SAMPLE DATA</span>
                  </div>

                  {/* Columns preview */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                      Columns ({dataset.columns.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dataset.columns.slice(0, 4).map((col, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141824] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e2533]"
                        >
                          {col}
                        </span>
                      ))}
                      {dataset.columns.length > 4 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-400">
                          +{dataset.columns.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Supported Metrics */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                      Supported Metrics
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dataset.supportedMetrics.slice(0, 3).map((metric, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-800 dark:text-lime-300 border border-lime-500/20 font-medium"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-[#cbd5e1] dark:border-[#1e2533] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewDatasetId(dataset.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#141824] hover:bg-slate-200 dark:hover:bg-[#1e2533] text-[#334155] dark:text-slate-200 border border-[#cbd5e1] dark:border-[#1e2533] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Explore</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => onSelectDataset(dataset.id, dataset.samplePrompts[0])}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] transition-all shadow-sm hover:shadow shadow-lime-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <span>Generate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty search results state */}
        {filteredDatasets.length === 0 && (
          <div className="text-center py-12 rounded-xl bg-white dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">No datasets matched your filter</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No dataset found for "{searchQuery}". Try selecting "All Industries" or clearing your search keywords.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('all');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#84cc16] text-[#0f172a]"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* DATASET EXPLORE & PREVIEW MODAL */}
      {previewDatasetId && activePreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#cbd5e1] dark:border-[#1e2533] flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-lime-500/10 text-lime-700 dark:text-lime-400 border border-lime-500/20">
                    {activePreviewItem.industryName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
                    SYNTHETIC SAMPLE DATA – NOT REAL BUSINESS RECORDS
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] dark:text-white">
                  {activePreviewItem.name}
                </h3>
                <p className="text-xs text-[#475569] dark:text-slate-300 max-w-2xl">
                  {activePreviewItem.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDatasetId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141824] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Provenance & Metadata Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533]">
                  <div className="text-[10px] font-mono text-slate-400">Total Records</div>
                  <div className="text-sm font-bold text-[#111827] dark:text-white mt-0.5">{activePreviewItem.recordCount} rows</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533]">
                  <div className="text-[10px] font-mono text-slate-400">Storage Format</div>
                  <div className="text-sm font-bold text-[#111827] dark:text-white mt-0.5">RFC 4180 CSV</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533]">
                  <div className="text-[10px] font-mono text-slate-400">Origin Classification</div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">Synthetic Benchmark</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533]">
                  <div className="text-[10px] font-mono text-slate-400">License</div>
                  <div className="text-sm font-bold text-[#111827] dark:text-white mt-0.5">Open Synthetic License</div>
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827] dark:text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                    <span>Raw Data Sample (Top 10 Records)</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {activePreviewItem.filePath}
                  </span>
                </div>

                {isPreviewLoading ? (
                  <div className="h-48 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533]">
                    <div className="animate-spin w-5 h-5 border-2 border-lime-500 border-t-transparent rounded-full" />
                  </div>
                ) : previewData && previewData.rows.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-[#cbd5e1] dark:border-[#1e2533] max-h-64 scrollbar-thin">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-[#141824] text-slate-700 dark:text-slate-200 border-b border-[#cbd5e1] dark:border-[#1e2533]">
                        <tr>
                          {previewData.headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 font-bold whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#cbd5e1] dark:divide-[#1e2533] bg-white dark:bg-[#0d1017]">
                        {previewData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-[#141824]/60">
                            {previewData.headers.map((h, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                {String(row[h] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533] text-slate-500">
                    No preview records available.
                  </div>
                )}
              </div>

              {/* Sample Prompts */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#111827] dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                  <span>Sample Analytical Prompts for this Dataset</span>
                </span>
                <div className="flex flex-col gap-2">
                  {activePreviewItem.samplePrompts.map((promptText, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        setPreviewDatasetId(null);
                        onSelectDataset(activePreviewItem.id, promptText);
                      }}
                      className="text-left p-2.5 rounded-lg bg-slate-50 dark:bg-[#141824] hover:bg-lime-500/10 dark:hover:bg-lime-500/10 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-lime-500/40 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="font-mono text-xs">"{promptText}"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-lime-600 dark:group-hover:text-lime-400 transform group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Provenance & Limitations */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533] space-y-1 text-[11px] text-slate-500">
                <div className="font-semibold text-slate-700 dark:text-slate-300">Source Transparency & Limitations:</div>
                <p><strong>Attribution:</strong> {activePreviewItem.attribution}</p>
                <p><strong>Validation:</strong> {activePreviewItem.limitations}</p>
                <p><strong>Period:</strong> {activePreviewItem.observationPeriod}</p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#cbd5e1] dark:border-[#1e2533] bg-slate-50 dark:bg-[#080a0f] flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-slate-500">
                Loaded directly via in-memory CSV pipeline
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewDatasetId(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533] text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => {
                    const promptText = activePreviewItem.samplePrompts[0];
                    setPreviewDatasetId(null);
                    onSelectDataset(activePreviewItem.id, promptText);
                  }}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] transition-all shadow-md shadow-lime-500/25 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Generate Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
