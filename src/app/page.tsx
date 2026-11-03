'use client';
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCw, 
  ArrowRight, 
  Layers, 
  Upload, 
  FileText, 
  X, 
  Download, 
  ShieldCheck, 
  Database, 
  CloudRain, 
  CloudSun,
  Landmark,
  TrendingUp, 
  Zap, 
  Globe, 
  Cpu, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Command,
  Activity,
  Lock,
  ExternalLink,
  Target,
  Search,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { AnimatedEcosystem3D } from '@/components/AnimatedEcosystem3D';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useChartTheme } from '@/components/WidgetRenderers';

import { UISchema } from '../types/schema';
import { DynamicRenderer } from '../components/DynamicRenderer';
import { IndustryDataHub } from '../components/IndustryDataHub';
import { exportDashboardToPDF } from '../lib/pdfExport';
import { downloadCSV } from '../lib/csvExport';
import { StructuredGuidance, PipelineResponseState } from '../lib/dataSources/intentParser';

const SUGGESTED_PROMPTS = [
  { text: "Analyze India's GDP growth and macro economic trajectory.", label: "India GDP Growth", domain: "World Bank Macro", icon: TrendingUp },
  { text: "Analyze the Indian electric vehicle market.", label: "Indian EV Mobility", domain: "VAHAN / BEE", icon: Zap },
  { text: "Create a dashboard for weather conditions in Andhra Pradesh.", label: "Andhra Pradesh Weather", domain: "Open-Meteo Live", icon: CloudRain },
  { text: "Compare the performance of technology companies.", label: "Tech Giants Financials", domain: "SEC EDGAR", icon: Cpu },
  { text: "Analyze energy consumption and renewable energy adoption in India.", label: "Renewable Energy Share", domain: "World Bank WDI", icon: BarChart3 },
  { text: "Compare current weather between Mumbai and Delhi.", label: "Mumbai vs Delhi Weather", domain: "Comparative Live", icon: CloudRain },
  { text: "Analyze startup revenue, expenses, profitability, and growth.", label: "Startup Operating Ledger", domain: "Corporate TTM", icon: Activity }
];

export default function GenUIPage() {
  const [prompt, setPrompt] = useState('');
  const [activePrompt, setActivePrompt] = useState('');
  const [schema, setSchema] = useState<UISchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Parsing analytical intent...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string; sizeKb: number } | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    source: string;
    connector?: string;
    provider?: string;
    generationMode?: string;
    aiStatus?: string;
  } | null>(null);
  const [guidance, setGuidance] = useState<{
    state: PipelineResponseState;
    info: StructuredGuidance;
  } | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Array<{ prompt: string; schema: UISchema; timestamp: string }>>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chartTheme = useChartTheme();

  // Timed loading steps during generation
  useEffect(() => {
    if (!isLoading) return;
    const steps = [
      { delay: 0, text: "Parsing analytical intent and geographic scope..." },
      { delay: 1000, text: "Selecting verified data connector from registry..." },
      { delay: 2400, text: "Fetching real-time online data via secure HTTPS..." },
      { delay: 4200, text: "Validating data integrity and computing mathematical aggregates..." },
      { delay: 6000, text: "Synthesizing dynamic dashboard schema and visual components..." }
    ];

    const timers = steps.map(s => setTimeout(() => setLoadingStep(s.text), s.delay));
    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      setErrorMessage('Please upload a valid .csv or .json file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB in-memory processing limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        content,
        sizeKb: Math.round(file.size / 1024)
      });
      setErrorMessage(null);
    };
    reader.readAsText(file);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Main Dashboard Generation Function
  const handleGenerate = async (queryText?: string, explicitDatasetId?: string) => {
    const targetQuery = (queryText !== undefined ? queryText : prompt).trim();
    if (!targetQuery && !uploadedFile && !explicitDatasetId) {
      setErrorMessage('Please enter an analytical prompt, select an industry dataset, or upload a CSV dataset.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGuidance(null);
    const displayPrompt = targetQuery || (explicitDatasetId ? `Analyze dataset: ${explicitDatasetId}` : (uploadedFile?.name || 'Dataset Ingestion'));
    setActivePrompt(displayPrompt);
    if (queryText !== undefined) setPrompt(queryText);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetQuery,
          fileContent: uploadedFile?.content,
          fileName: uploadedFile?.name,
          datasetId: explicitDatasetId
        })
      });

      const data = await res.json();

      if (!res.ok && !data.guidance) {
        setSchema(null);
        throw new Error(data.error || 'Failed to generate dashboard');
      }

      // Check if server yielded structured guidance (e.g. DATASET_REQUIRED, UNSUPPORTED_DOMAIN, CLARIFICATION_REQUIRED, NO_DATA_FOUND)
      if (data.state && data.state !== 'SUCCESS') {
        // Prevent stale dashboard reuse
        setSchema(null);
        setGuidance({
          state: data.state,
          info: data.guidance || {
            domain: 'Data Domain',
            message: data.error || 'The requested analytical domain requires attention or an attached dataset.',
            actionRequired: 'NONE',
            suggestedPrompts: [],
            supportedConnectors: []
          }
        });
        setTimeout(() => {
          dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return;
      }

      if (data.schema) {
        setGuidance(null);
        setSchema(data.schema);
        setDebugInfo({
          source: data.source || 'verified_engine',
          connector: data.connector,
          provider: data.provider,
          generationMode: data.generationMode,
          aiStatus: data.aiStatus
        });

        // Add to active session history
        setSessionHistory(prev => [
          {
            prompt: targetQuery || uploadedFile?.name || 'Custom Query',
            schema: data.schema,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...prev.slice(0, 9)
        ]);

        // Smooth scroll to generated dashboard
        setTimeout(() => {
          dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        setSchema(null);
        throw new Error('Server returned an empty dashboard schema.');
      }
    } catch (err: unknown) {
      console.error('[GenUI Generation Error]:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred during dashboard generation.';
      setErrorMessage(msg);
      setSchema(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate(prompt);
    }
  };

  const handleDownloadPDF = async () => {
    if (!schema || isExportingPDF) return;
    setIsExportingPDF(true);
    try {
      await exportDashboardToPDF({
        title: schema.title || 'GenUI_Dashboard',
        subtitle: schema.subtitle,
        elementId: 'genui-dashboard-container'
      });
    } catch (err: unknown) {
      console.error('[GenUI PDF Error]:', err);
      alert('Failed to generate PDF document. Please ensure all charts have finished rendering.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!schema) return;
    const tableWidget = schema.widgets.find(w => w.type === 'table');
    if (!tableWidget || !tableWidget.config?.data || tableWidget.config.data.length === 0) {
      alert('This dashboard consists of summarized charts and metrics without an underlying tabular register. To view and export raw records, you can request: "Show detailed data table" or analyze a tabular dataset.');
      return;
    }
    const cleanTitle = (schema.title || 'dataset').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadCSV({
      fileName: `${cleanTitle}_records`,
      title: tableWidget.title || schema.title,
      columns: tableWidget.config.columns || [],
      data: tableWidget.config.data,
      sourceAttribution: schema.sources?.[0]?.attribution || schema.sources?.[0]?.provider
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#374151] dark:text-slate-100 flex flex-col font-sans selection:bg-lime-500/25 selection:text-lime-800 dark:selection:text-lime-200 relative transition-colors duration-200">
      
      {/* GLOBAL FIXED 3D TECHNOLOGY ECOSYSTEM BACKGROUND (PERSISTS ACROSS ENTIRE PAGE SCROLL) */}
      <AnimatedEcosystem3D />

      {/* Top Application Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#080a0f]/90 backdrop-blur-md border-b border-[#cbd5e1] dark:border-[#1e2533] px-6 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded bg-[#f1f5f9] dark:bg-[#141824] border border-[#cbd5e1] dark:border-lime-500/40 flex items-center justify-center font-bold text-[#4d7c0f] dark:text-lime-400 text-xs tracking-wider shadow-sm">
                GU
              </div>
              <span className="font-bold text-base tracking-tight text-[#111827] dark:text-white">
                GenUI
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#f1f5f9] dark:bg-[#141824] text-[#4b5563] dark:text-slate-300 border border-[#cbd5e1] dark:border-[#1e2533]">
                Analytics Engine
              </span>
            </div>

            {/* In-page navigation links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-[#4b5563] dark:text-slate-400">
              <a href="#workbench" className="hover:text-[#111827] dark:hover:text-slate-100 transition-colors">Query Workbench</a>
              <a href="#industry-hub" className="hover:text-[#111827] dark:hover:text-slate-100 transition-colors flex items-center space-x-1.5 font-semibold text-lime-700 dark:text-lime-400">
                <Database className="w-3.5 h-3.5" />
                <span>Industry Data Hub</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-lime-500/10 border border-lime-500/20">36</span>
              </a>
              <a href="#connectors" className="hover:text-[#111827] dark:hover:text-slate-100 transition-colors">Data Connectors</a>
              <a href="#architecture" className="hover:text-[#111827] dark:hover:text-slate-100 transition-colors">Architecture</a>
              <a href="#governance" className="hover:text-[#111827] dark:hover:text-slate-100 transition-colors">Data Integrity</a>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Switcher */}
            <ThemeSwitcher />

            {sessionHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] hover:border-[#84cc16] dark:hover:border-slate-600 text-[#374151] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-[#4d7c0f] dark:text-lime-400" />
                <span>History ({sessionHistory.length})</span>
              </button>
            )}

            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] text-[#374151] dark:text-slate-300 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] dark:bg-lime-400" />
              <span className="hidden sm:inline">Registry Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION & PROMPT WORKBENCH */}
      <section id="workbench" className="relative z-10 pt-12 pb-16 px-6 sm:px-8 border-b border-[#cbd5e1]/80 dark:border-[#1e2533]/60 bg-transparent overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded text-[11px] font-mono text-[#374151] dark:text-slate-300 bg-white dark:bg-[#0d1017]/92 border border-[#cbd5e1] dark:border-[#1e2533] mb-5 shadow-sm">
            <span className="text-[#4d7c0f] dark:text-lime-400 font-semibold">Strict Provenance</span>
            <span className="text-[#64748b]">•</span>
            <span>Zero Mock Fallback</span>
            <span className="text-[#64748b]">•</span>
            <span>RFC 4180 CSV & Multi-page PDF</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111827] dark:text-white max-w-3xl leading-tight font-sans drop-shadow-[0_2px_10px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Transform Questions Into Verified Dashboards.
          </h1>

          <p className="text-[#374151] dark:text-slate-300 text-xs sm:text-sm font-medium max-w-2xl mt-3.5 leading-relaxed">
            GenUI analyzes natural-language prompts, retrieves real data from approved registries and live APIs, and compiles interactive dashboards with mathematical precision.
          </p>

          {/* Central Analytical Command Console */}
          <div className="w-full mt-8 bg-white dark:bg-[#0d1017]/95 backdrop-blur-md border border-[#cbd5e1] dark:border-[#1e2533] rounded-lg p-4 sm:p-5 shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/60 text-left relative z-20 transition-colors">
            
            {/* Header row inside prompt box */}
            <div className="flex items-center justify-between pb-3 border-b border-[#cbd5e1] dark:border-[#1e2533] mb-3">
              <div className="flex items-center space-x-2">
                <Command className="w-3.5 h-3.5 text-[#4d7c0f] dark:text-lime-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#172033] dark:text-slate-300 font-mono">
                  Natural Language Query Composer
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#64748b] dark:text-slate-500">
                {prompt.length} / 2,500 chars
              </span>
            </div>

            {/* Uploaded File Pill Indicator if file is loaded */}
            {uploadedFile && (
              <div className="mb-3 flex items-center justify-between px-3 py-1.5 rounded bg-lime-500/10 border border-lime-500/30 text-[#4d7c0f] dark:text-lime-300 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#4d7c0f] dark:text-lime-400" />
                  <span className="font-semibold">{uploadedFile.name}</span>
                  <span className="text-[11px] text-lime-700/80 dark:text-lime-400/80">({uploadedFile.sizeKb} KB in-memory)</span>
                </div>
                <button 
                  type="button"
                  onClick={removeUploadedFile}
                  className="hover:text-[#111827] dark:hover:text-white p-0.5 rounded cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Multiline Textarea Input */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              maxLength={2500}
              placeholder="Enter your analytical request (e.g., 'Analyze India GDP growth and macroeconomic trajectory', 'Compare current weather between Mumbai and Delhi', or 'Break down electric vehicle market share in India')..."
              className="w-full bg-[#f1f5f9] dark:bg-[#080a0f]/95 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-3 text-sm text-[#111827] dark:text-slate-100 placeholder-[#64748b] dark:placeholder-slate-500 outline-none resize-none leading-relaxed focus:border-[#84cc16] transition-colors"
            />

            {/* Controls Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3.5 border-t border-[#cbd5e1] dark:border-[#1e2533] mt-3">
              <div className="flex items-center space-x-2.5">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv,.json" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#f8fafc] hover:bg-[#f1f5f9] dark:bg-[#141824] dark:hover:bg-[#1a2030] text-[#374151] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white border border-[#cbd5e1] dark:border-[#1e2533] transition-colors cursor-pointer shadow-xs"
                  title="Upload CSV or JSON dataset for ephemeral in-memory processing"
                >
                  <Upload className="w-3.5 h-3.5 text-[#4d7c0f] dark:text-lime-400" />
                  <span>Attach Dataset (.csv, .json)</span>
                </button>

                <span className="text-[11px] text-[#64748b] font-mono hidden sm:inline">
                  Press ↵ to generate • Shift+↵ for newline
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleGenerate(prompt)}
                disabled={isLoading || (!prompt.trim() && !uploadedFile)}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-md font-bold text-xs sm:text-sm bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-lime-500/25 hover:shadow-lime-500/35"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-[#0f172a]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing Query...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Validation Alert */}
          {errorMessage && (
            <div className="w-full mt-3 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between text-left">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button 
                type="button"
                onClick={() => setErrorMessage(null)}
                className="hover:text-[#111827] dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Structured Workflow Templates Grid */}
          <div className="w-full mt-6 text-left relative z-20">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] dark:text-slate-400 block mb-2.5">
              Verified Analytical Templates:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {SUGGESTED_PROMPTS.slice(0, 4).map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(item.text);
                      handleGenerate(item.text);
                    }}
                    className="flex flex-col justify-between p-3.5 rounded-md bg-white dark:bg-[#0d1017]/92 hover:bg-[#f8fafc] dark:hover:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533] hover:border-[#84cc16] text-left transition-colors cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#111827] dark:text-slate-200 group-hover:text-[#111827] dark:group-hover:text-white">{item.label}</span>
                      <Icon className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#4d7c0f] dark:group-hover:text-lime-400 transition-colors" />
                    </div>
                    <span className="text-[10px] font-mono text-[#64748b]">{item.domain}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* DASHBOARD WORKSPACE AREA */}
      <main ref={dashboardRef} className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 relative z-10 bg-transparent">
        
        {/* Dynamic Controls Bar when dashboard is active */}
        {schema && !isLoading && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#cbd5e1] dark:border-[#1e2533] mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[#64748b] dark:text-slate-400">Workspace Query:</span>
              <span className="text-xs font-semibold text-[#111827] dark:text-white px-2.5 py-0.5 rounded bg-[#f8fafc] dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533]">
                "{activePrompt}"
              </span>
              {debugInfo?.provider && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  schema?.sources?.[0]?.sourceType === 'curated_dataset'
                    ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : schema?.sources?.[0]?.sourceType === 'user_upload'
                    ? 'text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                    : 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {schema?.sources?.[0]?.sourceType === 'curated_dataset'
                    ? 'Curated Benchmark: '
                    : schema?.sources?.[0]?.sourceType === 'user_upload'
                    ? 'In-Memory File: '
                    : 'Live Feed: '}
                  {debugInfo.provider}
                </span>
              )}
              {schema?.generationMode && (
                <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded border border-[#cbd5e1] dark:border-[#1e2533] bg-[#f8fafc] dark:bg-[#0d1017] text-[#4b5563] dark:text-slate-400">
                  {schema.generationMode === 'ai_synthesized' ? 'Claude 3.5 AI' : 'Deterministic Engine'}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleGenerate(activePrompt)}
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] hover:bg-[#f8fafc] dark:hover:bg-[#141824] hover:border-[#84cc16] dark:hover:border-[#2c3548] text-[#374151] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCSV}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] hover:bg-[#f8fafc] dark:hover:bg-[#141824] hover:border-[#84cc16] dark:hover:border-[#2c3548] text-[#374151] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer shadow-xs"
                title="Export tabular data to RFC 4180 CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] transition-colors shadow-md shadow-lime-500/25 cursor-pointer disabled:opacity-50"
              >
                {isExportingPDF ? (
                  <span>Exporting PDF...</span>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE WITH MULTI-STEP PROGRESSION */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 rounded border border-lime-500/40 bg-lime-500/10 flex items-center justify-center animate-pulse">
              <Database className="w-5 h-5 text-[#4d7c0f] dark:text-lime-400" />
            </div>
            
            <div className="text-center space-y-1 max-w-md">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-white">Synthesizing Verified Dashboard</h3>
              <p className="text-xs text-[#64748b] dark:text-slate-400 font-mono">
                {loadingStep}
              </p>
            </div>

            {/* Skeleton visual placeholder */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 opacity-40">
              <div className="h-28 rounded-lg bg-[#f8fafc] dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] animate-pulse" />
              <div className="h-28 rounded-lg bg-[#f8fafc] dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] animate-pulse" />
              <div className="h-28 rounded-lg bg-[#f8fafc] dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] animate-pulse" />
              <div className="h-56 col-span-1 md:col-span-2 rounded-lg bg-[#f8fafc] dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] animate-pulse" />
              <div className="h-56 rounded-lg bg-[#f8fafc] dark:bg-[#0d1017] border border-[#cbd5e1] dark:border-[#1e2533] animate-pulse" />
            </div>
          </div>
        )}

        {/* ACTIVE DASHBOARD RENDERER */}
        {!isLoading && schema && (
          <div className="animate-fade-in">
            <DynamicRenderer schema={schema} prompt={activePrompt} />
          </div>
        )}

        {/* STRUCTURED ANALYTICAL GUIDANCE & RESOLUTION PANEL */}
        {!isLoading && !schema && guidance && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#cbd5e1] dark:border-[#1e2533] gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] dark:text-slate-400 font-semibold">
                  Analytical Resolution
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  guidance.state === 'DATASET_REQUIRED'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    : guidance.state === 'UNSUPPORTED_DOMAIN'
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                    : guidance.state === 'CLARIFICATION_REQUIRED'
                    ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
                    : guidance.state === 'NO_DATA_FOUND'
                    ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                }`}>
                  {guidance.state.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGuidance(null)}
                className="text-xs text-[#64748b] hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer self-start sm:self-auto font-mono"
              >
                Reset to Preview
              </button>
            </div>

            {/* Resolution Card */}
            <div className="bg-white dark:bg-[#0d1017]/95 backdrop-blur-md border border-[#cbd5e1] dark:border-[#1e2533] rounded-lg p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/60 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  guidance.state === 'DATASET_REQUIRED'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : guidance.state === 'UNSUPPORTED_DOMAIN'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : guidance.state === 'CLARIFICATION_REQUIRED'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {guidance.state === 'DATASET_REQUIRED' ? (
                    <Upload className="w-6 h-6" />
                  ) : guidance.state === 'UNSUPPORTED_DOMAIN' ? (
                    <Layers className="w-6 h-6" />
                  ) : guidance.state === 'CLARIFICATION_REQUIRED' ? (
                    <HelpCircle className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141824] text-[#475569] dark:text-slate-300 border border-[#cbd5e1] dark:border-[#1e2533]">
                      Domain: {guidance.info.domain}
                    </span>
                    {guidance.info.subdomain && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141824] text-[#475569] dark:text-slate-300 border border-[#cbd5e1] dark:border-[#1e2533]">
                        {guidance.info.subdomain}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
                    {guidance.state === 'DATASET_REQUIRED'
                      ? 'Upload Dataset to Generate Dashboard'
                      : guidance.state === 'UNSUPPORTED_DOMAIN'
                      ? 'Data Source Currently Not Connected'
                      : guidance.state === 'CLARIFICATION_REQUIRED'
                      ? 'More Specific Query Required'
                      : 'Data Records Unavailable'}
                  </h2>

                  <p className="text-sm text-[#374151] dark:text-slate-300 leading-relaxed max-w-3xl">
                    {guidance.info.message}
                  </p>
                </div>
              </div>

              {/* Action Section */}
              <div className="pt-4 border-t border-[#cbd5e1] dark:border-[#1e2533] space-y-4">
                {guidance.info.actionRequired === 'UPLOAD_DATASET' && (
                  <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-[#080a0f] border border-[#cbd5e1] dark:border-[#1e2533] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[#111827] dark:text-white flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>Ready to analyze your files</span>
                      </div>
                      <p className="text-xs text-[#64748b] dark:text-slate-400">
                        Attach a CSV or JSON file (up to 5MB). Processed strictly in-memory with zero permanent cloud storage.
                      </p>
                      {guidance.info.missingParameters && guidance.info.missingParameters.length > 0 && (
                        <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 pt-1">
                          Recommended columns: {guidance.info.missingParameters.join(', ')}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-md bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] text-xs font-bold transition-all shadow-md shadow-lime-500/20 flex items-center space-x-2 cursor-pointer flex-shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Attach CSV Dataset</span>
                    </button>
                  </div>
                )}

                {/* Instant Industry Dataset Match from Catalog */}
                {guidance.info.matchedCatalogDatasetId && (
                  <div className="p-4 rounded-lg bg-lime-500/10 border border-lime-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[#111827] dark:text-white flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                        <span>Verified Industry Benchmark Available</span>
                      </div>
                      <p className="text-xs text-[#374151] dark:text-slate-300">
                        A verified synthetic benchmark dataset matching this query is ready in our Industry Data Hub: <span className="font-mono font-semibold text-lime-700 dark:text-lime-300">{guidance.info.matchedCatalogDatasetId}</span>.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleGenerate(prompt, guidance.info.matchedCatalogDatasetId)}
                        className="px-4 py-2 rounded-md bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] text-xs font-bold transition-all shadow-md shadow-lime-500/20 flex items-center space-x-1.5 cursor-pointer flex-shrink-0"
                      >
                        <span>Generate with Sample Data</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Supported Prompts */}
                {guidance.info.suggestedPrompts && guidance.info.suggestedPrompts.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#64748b] dark:text-slate-400 font-semibold flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-lime-500" />
                      <span>Or Try an Approved Live Query:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {guidance.info.suggestedPrompts.map((sugPrompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPrompt(sugPrompt);
                            handleGenerate(sugPrompt);
                          }}
                          className="text-left text-xs px-3 py-1.5 rounded-md bg-[#f8fafc] dark:bg-[#141824] hover:bg-slate-200 dark:hover:bg-[#1e2533] text-[#374151] dark:text-slate-200 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-[#84cc16] dark:hover:border-lime-500/40 transition-colors cursor-pointer"
                        >
                          "{sugPrompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Data Sources List */}
                {guidance.info.supportedConnectors && guidance.info.supportedConnectors.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-[#64748b] dark:text-slate-400">
                      Approved Connected Sources: {guidance.info.supportedConnectors.join(' • ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT PREVIEW (When no live query is active and no guidance) */}
        {!isLoading && !schema && !guidance && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#cbd5e1] dark:border-[#1e2533] gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] dark:text-slate-400 font-semibold">
                  Platform Output Preview
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Illustrative VAHAN Benchmark
                </span>
              </div>
              <span className="text-xs text-[#64748b] font-mono">
                Illustrative analytical workspace • Live dynamic dashboard compiles on query submission
              </span>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="bg-white dark:bg-[#0d1017]/95 backdrop-blur-md border border-[#cbd5e1] dark:border-[#1e2533] rounded-lg p-6 sm:p-7 space-y-6 shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/60 transition-colors">
              
              {/* Preview Header with Objective */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d7c0f] dark:text-lime-400 font-semibold px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
                    Indian Clean Mobility
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Consolidated 2020–2025 Series
                  </span>
                  <span className="text-[10px] font-mono text-[#4b5563] dark:text-slate-400 px-2 py-0.5 rounded bg-[#f8fafc] dark:bg-[#080a0f] border border-[#cbd5e1] dark:border-[#1e2533]">
                    Audited Public Register
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
                  Indian Electric Vehicle Market Landscape & Infrastructure Penetration
                </h2>
                <p className="text-xs text-[#4b5563] dark:text-slate-400">
                  Curated benchmark from consolidated MoRTH/BEE state filings • 24.80 Lakh Annual Registrations
                </p>

                <div className="flex items-start space-x-2.5 p-3.5 bg-[#f8fafc] dark:bg-[#080a0f]/90 rounded-md border border-[#cbd5e1] dark:border-[#1e2533] text-xs">
                  <Target className="w-4 h-4 text-[#4d7c0f] dark:text-lime-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#172033] dark:text-slate-300 mr-1.5 uppercase text-[10px] font-mono tracking-wider">Analytical Objective:</span>
                    <span className="text-[#374151] dark:text-slate-400">Granular assessment of statutory state adoption volume, charging infrastructure density, and vehicle category distribution (2020–2025).</span>
                  </div>
                </div>
              </div>

              {/* 4 Balanced KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#080a0f]/92 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-4 flex flex-col justify-between h-full min-h-[140px] hover:border-[#84cc16] dark:hover:border-[#2c3548] transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] dark:text-slate-400 font-semibold">Annual Registrations</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f8fafc] dark:bg-[#141824] text-[#4b5563] dark:text-slate-400 border border-[#cbd5e1] dark:border-[#1e2533]">VAHAN</span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tabular-nums">24.80 Lakh</span>
                      <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+26.1% YoY</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#cbd5e1] dark:border-[#1e2533] mt-3">
                    <p className="text-[11px] text-[#4b5563]">Across 2W, 3W, 4W and commercial categories</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#080a0f]/92 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-4 flex flex-col justify-between h-full min-h-[140px] hover:border-[#84cc16] dark:hover:border-[#2c3548] transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] dark:text-slate-400 font-semibold">E2W Dominance</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f8fafc] dark:bg-[#141824] text-[#4b5563] dark:text-slate-400 border border-[#cbd5e1] dark:border-[#1e2533]">MoRTH</span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tabular-nums">59.9 %</span>
                      <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Rank #1</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#cbd5e1] dark:border-[#1e2533] mt-3">
                    <p className="text-[11px] text-[#4b5563]">14.8 Lakh commuter units nationwide</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#080a0f]/92 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-4 flex flex-col justify-between h-full min-h-[140px] hover:border-[#84cc16] dark:hover:border-[#2c3548] transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] dark:text-slate-400 font-semibold">Leading State Volume</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f8fafc] dark:bg-[#141824] text-[#4b5563] dark:text-slate-400 border border-[#cbd5e1] dark:border-[#1e2533]">Leaderboard</span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white truncate">Uttar Pradesh</span>
                      <span className="text-[11px] font-mono text-[#4d7c0f] dark:text-lime-400 bg-lime-500/10 px-1.5 py-0.5 rounded border border-lime-500/20">19.5%</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#cbd5e1] dark:border-[#1e2533] mt-3">
                    <p className="text-[11px] text-[#4b5563]">Followed by Maharashtra (13.8%) and Karnataka</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#080a0f]/92 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-4 flex flex-col justify-between h-full min-h-[140px] hover:border-[#84cc16] dark:hover:border-[#2c3548] transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] dark:text-slate-400 font-semibold">Public Fast Chargers</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f8fafc] dark:bg-[#141824] text-[#4b5563] dark:text-slate-400 border border-[#cbd5e1] dark:border-[#1e2533]">BEE Grid</span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tabular-nums">18,660</span>
                      <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+64.2% YoY</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#cbd5e1] dark:border-[#1e2533] mt-3">
                    <p className="text-[11px] text-[#4b5563]">Sanctioned highway corridors and municipal stations</p>
                  </div>
                </div>
              </div>

              {/* Visualizations Grid: 1 Prominent Chart (8-cols) + 1 Supporting Chart (4-cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Prominent Chart: 6-Year EV Adoption Trajectory */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-[#080a0f]/92 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-5 flex flex-col justify-between shadow-sm dark:shadow-lg dark:shadow-black/40 hover:border-[#84cc16] dark:hover:border-[#2c3548] transition-colors">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Annual Electric Vehicle Registration Trajectory</h3>
                      <span className="text-[10px] font-mono text-[#4b5563] dark:text-slate-400 px-2 py-0.5 rounded bg-[#f8fafc] dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533]">2020–2025</span>
                    </div>
                    <p className="text-xs text-[#4b5563] dark:text-slate-400 mt-0.5">Annual statutory unit volume (Lakhs) & verified charging stations (Thousands)</p>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={[
                          { year: '2020', registrations: 1.25, chargers: 1.8 },
                          { year: '2021', registrations: 3.30, chargers: 3.1 },
                          { year: '2022', registrations: 10.25, chargers: 5.6 },
                          { year: '2023', registrations: 15.30, chargers: 9.8 },
                          { year: '2024', registrations: 19.65, chargers: 14.2 },
                          { year: '2025', registrations: 24.80, chargers: 18.6 }
                        ]} 
                        margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid stroke={chartTheme.gridStroke} strokeDasharray="3 3" opacity={chartTheme.isDark ? 0.7 : 0.9} />
                        <XAxis dataKey="year" stroke={chartTheme.axisStroke} fontSize={11} tickLine={false} axisLine={{ stroke: chartTheme.gridStroke }} dy={6} />
                        <YAxis stroke={chartTheme.axisStroke} fontSize={11} tickLine={false} axisLine={{ stroke: chartTheme.gridStroke }} tickFormatter={(val) => `${val}L`} dx={-4} />
                        <Tooltip 
                          contentStyle={chartTheme.tooltipStyle}
                          itemStyle={chartTheme.itemStyle}
                          labelStyle={chartTheme.labelStyle}
                          formatter={(value: any, name: any) => [
                            name === 'registrations' ? `${value} Lakh Units` : `${value}k Chargers`,
                            name === 'registrations' ? 'EV Registrations' : 'Public Fast Chargers'
                          ]}
                        />
                        <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: chartTheme.legendColor }} />
                        <Line type="monotone" dataKey="registrations" name="EV Registrations" stroke={chartTheme.colors[0]} strokeWidth={2.5} dot={{ r: 3, fill: chartTheme.colors[0] }} />
                        <Line type="monotone" dataKey="chargers" name="Public Chargers" stroke={chartTheme.colors[1]} strokeWidth={2.5} dot={{ r: 3, fill: chartTheme.colors[1] }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Supporting Chart: Vehicle Category Share */}
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-[#080a0f]/92 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-5 flex flex-col justify-between shadow-sm dark:shadow-lg dark:shadow-black/40 hover:border-[#84cc16] dark:hover:border-[#2c3548] transition-colors">

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Segment Market Distribution</h3>
                    <p className="text-xs text-[#4b5563] dark:text-slate-400 mt-0.5">Penetration share across commercial and passenger segments</p>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { segment: '2-Wheeler', share: 59.9 },
                          { segment: '3-Wheeler', share: 33.1 },
                          { segment: '4-Wheeler', share: 6.5 },
                          { segment: 'Commercial', share: 0.5 }
                        ]} 
                        margin={{ top: 16, right: 16, left: -10, bottom: 8 }}
                      >
                        <CartesianGrid stroke={chartTheme.gridStroke} strokeDasharray="3 3" opacity={chartTheme.isDark ? 0.7 : 0.9} />
                        <XAxis dataKey="segment" stroke={chartTheme.axisStroke} fontSize={10} tickLine={false} axisLine={{ stroke: chartTheme.gridStroke }} dy={6} />
                        <YAxis stroke={chartTheme.axisStroke} fontSize={11} tickLine={false} axisLine={{ stroke: chartTheme.gridStroke }} tickFormatter={(val) => `${val}%`} dx={-4} />
                        <Tooltip 
                          contentStyle={chartTheme.tooltipStyle}
                          itemStyle={chartTheme.itemStyle}
                          labelStyle={chartTheme.labelStyle}
                          formatter={(value: any) => [`${value}% Share`, 'Market Share']}
                        />
                        <Bar dataKey="share" fill={chartTheme.colors[0]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Sample Compact Table Preview */}
              <div className="bg-white dark:bg-[#080a0f]/92 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-5 space-y-3 shadow-sm dark:shadow-lg dark:shadow-black/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#cbd5e1] dark:border-[#1e2533] gap-2">
                  <div>
                    <h3 className="text-xs font-semibold text-[#111827] dark:text-slate-200 uppercase tracking-wider font-mono">
                      State-by-State EV Adoption & Charging Infrastructure Matrix
                    </h3>
                    <p className="text-[11px] text-[#4b5563] mt-0.5">Official state leaderboard derived from consolidated statutory returns</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#4b5563] dark:text-slate-400 px-2 py-0.5 rounded bg-[#f8fafc] dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533] self-start sm:self-auto">
                    Top 5 Jurisdictions
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[#64748b] dark:text-slate-400 border-b border-[#cbd5e1] dark:border-[#1e2533] bg-[#f8fafc] dark:bg-transparent text-[10px] uppercase font-mono">
                        <th className="pb-2.5 pt-2 px-3">State / Union Territory</th>
                        <th className="pb-2.5 pt-2 px-3 text-right">Cumulative Registrations</th>
                        <th className="pb-2.5 pt-2 px-3 text-right">National Volume Share</th>
                        <th className="pb-2.5 pt-2 px-3 text-right">Public Charging Points</th>
                        <th className="pb-2.5 pt-2 px-3 text-right">EV-to-Charger Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cbd5e1] dark:divide-[#1e2533] text-[#374151] dark:text-slate-300">
                      <tr className="hover:bg-[#f8fafc] dark:hover:bg-[#141824]/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#111827] dark:text-slate-200">Uttar Pradesh</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200 font-semibold">4,85,200</td>
                        <td className="py-2.5 px-3 font-mono text-right text-emerald-700 dark:text-emerald-400 font-bold">19.5%</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200">1,420</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#4b5563] dark:text-slate-400">341:1</td>
                      </tr>
                      <tr className="hover:bg-[#f8fafc] dark:hover:bg-[#141824]/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#111827] dark:text-slate-200">Maharashtra</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200 font-semibold">3,42,100</td>
                        <td className="py-2.5 px-3 font-mono text-right text-emerald-700 dark:text-emerald-400 font-bold">13.8%</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200">3,820</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#4b5563] dark:text-slate-400">89:1</td>
                      </tr>
                      <tr className="hover:bg-[#f8fafc] dark:hover:bg-[#141824]/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#111827] dark:text-slate-200">Karnataka</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200 font-semibold">2,68,400</td>
                        <td className="py-2.5 px-3 font-mono text-right text-emerald-700 dark:text-emerald-400 font-bold">10.8%</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200">4,120</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#4b5563] dark:text-slate-400">65:1</td>
                      </tr>
                      <tr className="hover:bg-[#f8fafc] dark:hover:bg-[#141824]/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#111827] dark:text-slate-200">Tamil Nadu</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200 font-semibold">2,15,600</td>
                        <td className="py-2.5 px-3 font-mono text-right text-emerald-700 dark:text-emerald-400 font-bold">8.7%</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200">2,280</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#4b5563] dark:text-slate-400">94:1</td>
                      </tr>
                      <tr className="hover:bg-[#f8fafc] dark:hover:bg-[#141824]/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#111827] dark:text-slate-200">Gujarat</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200 font-semibold">1,82,400</td>
                        <td className="py-2.5 px-3 font-mono text-right text-emerald-700 dark:text-emerald-400 font-bold">7.3%</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#111827] dark:text-slate-200">1,940</td>
                        <td className="py-2.5 px-3 font-mono text-right text-[#4b5563] dark:text-slate-400">94:1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Source Transparency Block in Preview */}
              <div className="bg-[#f8fafc] dark:bg-[#080a0f]/92 border border-[#cbd5e1] dark:border-[#1e2533] rounded-md p-4 space-y-3 text-xs shadow-sm dark:shadow-lg dark:shadow-black/40">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#cbd5e1] dark:border-[#1e2533] gap-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span className="font-mono uppercase text-[10px] tracking-wider text-[#172033] dark:text-slate-300 font-semibold">Provenance & Verification Specifications</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Curated Statutory Benchmark
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-[#64748b] uppercase text-[10px] font-mono block">Data Provider</span>
                    <span className="text-[#111827] dark:text-slate-200 font-medium">Ministry of Road Transport & Highways (VAHAN) / BEE</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] uppercase text-[10px] font-mono block">Observation Scope</span>
                    <span className="text-[#111827] dark:text-slate-200 font-medium">2020–2025 Calendar Years (34 States/UTs)</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] uppercase text-[10px] font-mono block">Ingestion Pipeline</span>
                    <span className="text-[#111827] dark:text-slate-200 font-medium">Statutory Register Normalization</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] uppercase text-[10px] font-mono block">Operational Status</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Synchronized & Schema Validated</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* INDUSTRY DATA HUB SECTION */}
      <div className="border-t border-[#cbd5e1] dark:border-[#1e2533] bg-white/70 dark:bg-[#07090e]/85 backdrop-blur-md relative z-10 transition-colors">
        <IndustryDataHub 
          onSelectDataset={(datasetId, samplePrompt) => {
            handleGenerate(samplePrompt, datasetId);
            setTimeout(() => {
              dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          isGenerating={isLoading}
        />
      </div>

      {/* DETAILED SPECIFICATION SECTIONS */}
      <section id="connectors" className="border-t border-[#cbd5e1] dark:border-[#1e2533] bg-[#f8fafc]/95 dark:bg-[#090c12]/92 backdrop-blur-md py-16 px-6 sm:px-8 relative z-10 transition-colors">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d7c0f] dark:text-lime-400 font-semibold">
              Registry Specifications
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
              Approved Public Data Connectors
            </h2>
            <p className="text-xs text-[#374151] dark:text-slate-400">
              GenUI strictly connects to pre-verified public endpoints and statutory registries. No arbitrary external URL scraping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Open-Meteo Meteorology",
                type: "Live HTTPS Feed",
                badgeClass: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                icon: CloudSun,
                coverage: "Global Grid & Indian Cities",
                metrics: "Temperature, precipitation, humidity, 7-day model projections",
                freshness: "Hourly Real-Time"
              },
              {
                name: "World Bank Data Group",
                type: "Live REST API",
                badgeClass: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                icon: Landmark,
                coverage: "200+ Sovereign Nations",
                metrics: "Annual GDP growth, population demographics, renewable power share",
                freshness: "Annual Reconciled"
              },
              {
                name: "VAHAN & BEE Clean Mobility",
                type: "Curated Statutory Benchmark",
                badgeClass: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
                icon: Zap,
                coverage: "Indian States & UTs",
                metrics: "Segment split (2W, 3W, 4W), state leaderboards, charging stations",
                freshness: "2020–2025 Calendar Years"
              },
              {
                name: "SEC EDGAR Disclosures",
                type: "Audited Financial Benchmark",
                badgeClass: "text-lime-700 dark:text-lime-400 bg-lime-500/10 border-lime-500/20",
                icon: TrendingUp,
                coverage: "Public Technology Giants",
                metrics: "TTM GAAP revenue, operating margins, market cap, P/E ratio",
                freshness: "Trailing Twelve Months"
              }
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="bg-white dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-[#84cc16] dark:hover:border-lime-500/30 transition-colors rounded-lg p-5 space-y-3 flex flex-col justify-between h-full shadow-sm dark:shadow-xl dark:shadow-black/40">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded bg-[#f1f5f9] dark:bg-[#141824] border border-[#cbd5e1] dark:border-[#1e2533] flex items-center justify-center text-[#4d7c0f] dark:text-lime-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${c.badgeClass}`}>
                        {c.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white">{c.name}</h3>
                    <p className="text-xs text-[#374151] dark:text-slate-400 mt-1.5 leading-relaxed">{c.metrics}</p>
                  </div>
                  <div className="pt-3 border-t border-[#cbd5e1] dark:border-[#1e2533] flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                    <span className="truncate max-w-[120px]">{c.coverage}</span>
                    <span className="text-[#4b5563] dark:text-slate-400">{c.freshness}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ARCHITECTURE SECTION: CONNECTED PROCESSING FLOW */}
      <section id="architecture" className="border-t border-[#cbd5e1] dark:border-[#1e2533] bg-white/95 dark:bg-[#080a0f]/94 backdrop-blur-md py-16 px-6 sm:px-8 relative z-10 transition-colors">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d7c0f] dark:text-lime-400 font-semibold">
              System Pipeline
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
              End-to-End Processing Architecture
            </h2>
            <p className="text-xs text-[#374151] dark:text-slate-400">
              How natural language is translated into typed, validated visual components with mathematical integrity.
            </p>
          </div>

          {/* Connected Step Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative">
            {[
              {
                step: "01",
                phase: "Input Analysis",
                title: "Intent & Scope Extraction",
                desc: "Evaluates analytical objective, geographic boundaries, observation windows, and metric requirements via rule-based and semantic classification."
              },
              {
                step: "02",
                phase: "Data Acquisition",
                title: "Live Connector Routing",
                desc: "Queries approved endpoints through secure HTTPS with SSRF protection, strict timeouts, and automated status handling."
              },
              {
                step: "03",
                phase: "Computation",
                title: "Mathematical Normalization",
                desc: "Computes decimal deltas, historical averages, percentage shares, and unit formats deterministically without rounding errors."
              },
              {
                step: "04",
                phase: "Type Enforcement",
                title: "Zod Schema Compilation",
                desc: "Generates strict typed JSON UI schemas adhering to the UISchema specification, rejecting invalid structural outputs."
              },
              {
                step: "05",
                phase: "Interface Rendering",
                title: "Dynamic React Rendering",
                desc: "Renders validated components into isolated Error Boundaries, Recharts vector charts, and searchable data registers."
              },
              {
                step: "06",
                phase: "Persistence & Artifacts",
                title: "Dual Report Export",
                desc: "Exports raw tabular records as sanitized RFC 4180 CSVs and executive multi-page PDFs with intact provenance disclosures."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#f8fafc] dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] rounded-lg p-5 space-y-2 relative flex flex-col justify-between hover:border-[#84cc16] dark:hover:border-lime-500/30 transition-colors shadow-sm dark:shadow-xl dark:shadow-black/40">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#4d7c0f] dark:text-lime-400 px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
                      STAGE {item.step}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">
                      {item.phase}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#111827] dark:text-white mt-2">{item.title}</h3>
                  <p className="text-xs text-[#374151] dark:text-slate-400 leading-relaxed mt-1.5">{item.desc}</p>
                </div>
                <div className="pt-3 border-t border-[#cbd5e1] dark:border-[#1e2533] flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                  <span>Step {idx + 1} of 6</span>
                  {idx < 5 ? (
                    <span className="text-[#4d7c0f] dark:text-lime-400 flex items-center space-x-1 font-semibold">
                      <span>Next</span>
                      <ArrowRight className="w-3 h-3 inline" />
                    </span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3 inline" />
                      <span>Ready</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* DATA GOVERNANCE & INTEGRITY SECTION */}
      <section id="governance" className="border-t border-[#cbd5e1] dark:border-[#1e2533] bg-[#f8fafc]/95 dark:bg-[#090c12]/92 backdrop-blur-md py-14 px-6 sm:px-8 relative z-10 transition-colors">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d7c0f] dark:text-lime-400 font-semibold">
              Security & Integrity
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
              Data Integrity Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-[#84cc16] rounded-md space-y-1.5 shadow-sm dark:shadow-md dark:shadow-black/30 transition-colors">
              <span className="font-semibold text-[#111827] dark:text-slate-200 block">CWE-1236 Defense</span>
              <p className="text-[#374151] dark:text-slate-400 text-[11px] leading-relaxed">
                CSV export neutralizes spreadsheet formula injection by prefixing formula characters (=, +, -, @) with single quotes.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-[#84cc16] rounded-md space-y-1.5 shadow-sm dark:shadow-md dark:shadow-black/30 transition-colors">
              <span className="font-semibold text-[#111827] dark:text-slate-200 block">SSRF Protection</span>
              <p className="text-[#374151] dark:text-slate-400 text-[11px] leading-relaxed">
                Connectors prohibit private IP ranges (10.x, 192.168.x), localhost, and cloud metadata destinations.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-[#84cc16] rounded-md space-y-1.5 shadow-sm dark:shadow-md dark:shadow-black/30 transition-colors">
              <span className="font-semibold text-[#111827] dark:text-slate-200 block">Ephemeral In-Memory RAM</span>
              <p className="text-[#374151] dark:text-slate-400 text-[11px] leading-relaxed">
                User-uploaded CSV and JSON datasets are ingested strictly in ephemeral memory and discarded immediately after compilation.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#0d1017]/95 border border-[#cbd5e1] dark:border-[#1e2533] hover:border-[#84cc16] rounded-md space-y-1.5 shadow-sm dark:shadow-md dark:shadow-black/30 transition-colors">
              <span className="font-semibold text-[#111827] dark:text-slate-200 block">Zero Fabrication Policy</span>
              <p className="text-[#374151] dark:text-slate-400 text-[11px] leading-relaxed">
                Curated datasets are never labeled as live feeds. Uncovered subjects honestly flag limitations and follow-ups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="border-t border-[#cbd5e1] dark:border-[#1e2533] bg-white dark:bg-[#080a0f]/96 backdrop-blur-md py-8 px-6 text-xs text-[#4b5563] relative z-10 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#111827] dark:text-slate-300">GenUI Platform</span>
            <span>—</span>
            <span>Deterministic & Generative UI Architecture for Enterprise Data</span>
          </div>
          <div className="flex items-center space-x-4 text-[#64748b] dark:text-slate-400 font-mono text-[11px]">
            <span>Next.js 16</span>
            <span>•</span>
            <span>Zod Validated</span>
            <span>•</span>
            <span>RFC 4180 CSV</span>
            <span>•</span>
            <span>PDF Engine</span>
          </div>
        </div>
      </footer>

      {/* Session History Modal / Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            onClick={() => setHistoryOpen(false)}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs cursor-pointer"
          />
          <div className="relative w-full sm:w-[400px] bg-white dark:bg-[#0d1017]/98 border-l border-[#cbd5e1] dark:border-[#1e2533] z-10 p-5 flex flex-col h-full text-[#374151] dark:text-slate-100 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#cbd5e1] dark:border-[#1e2533]">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#4d7c0f] dark:text-lime-400" />
                <h3 className="font-semibold text-sm text-[#111827] dark:text-white">Active Session History</h3>
              </div>
              <button 
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded hover:bg-[#f1f5f9] dark:hover:bg-[#141824] text-[#64748b] dark:text-slate-400 hover:text-[#111827] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#cbd5e1] dark:divide-[#1e2533] mt-3">
              {sessionHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSchema(item.schema);
                    setActivePrompt(item.prompt);
                    setHistoryOpen(false);
                    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="py-3 px-2 rounded hover:bg-[#f8fafc] dark:hover:bg-[#141824] cursor-pointer transition-colors space-y-1 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#111827] dark:text-slate-200 line-clamp-1">{item.schema.title}</span>
                    <span className="text-[10px] text-[#64748b] font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#4b5563] dark:text-slate-400 line-clamp-1">"{item.prompt}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
