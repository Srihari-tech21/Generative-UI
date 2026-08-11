'use client';
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect, react/no-unescaped-entities */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useUser, useClerk, SignInButton, Show } from '@clerk/nextjs';
import { AuthErrorBoundary } from '../components/AuthErrorBoundary';
import { 
  Sparkles, 
  RotateCw, 
  Wifi, 
  WifiOff, 
  Layers, 
  Code,
  ArrowRight,
  TrendingUp,
  Layout,
  Play,
  Sun,
  Moon,
  LayoutGrid,
  ChevronDown,
  Trash,
  AlertCircle,
  X
} from 'lucide-react';
import { UISchema } from '../types/schema';
import { DynamicRenderer } from '../components/DynamicRenderer';
import { fallbackSchemas } from '../lib/fallbackSchemas';
import { motion, AnimatePresence } from 'framer-motion';

// Pre-defined clickable example prompts
// Pre-defined clickable example prompts
const EXAMPLE_PROMPTS = [
  { text: "Set up a dashboard to track my startup's burn rate", label: "Startup Finance" },
  { text: "Build a habit tracker for my morning routine", label: "Habit Tracker" },
  { text: "Create a sales pipeline view with deal stages", label: "Sales Pipeline" },
  { text: "Set up an RSVP tracker for my event", label: "Event RSVP" },
  { text: "Set up an inventory tracker for my store", label: "Inventory Tracker" },
  { text: "Track hospital ICU bed occupancy and ER wait times", label: "Hospital Ops" },
  { text: "Monitor food delivery driver dispatches and orders", label: "Food Delivery" },
  { text: "Create an e-commerce dashboard for conversion rate", label: "E-Commerce" }
];

interface DashboardMainProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  isLoaded: boolean;
  signOut: () => void;
  /** Set when Clerk error boundary catches an error — shown in place of sign-in UI */
  authError?: string;
}

function DashboardMain({ user, isLoaded, signOut, authError }: DashboardMainProps) {
  const [prompt, setPrompt] = useState('');
  const [activePrompt, setActivePrompt] = useState("Set up a dashboard to track my startup's burn rate");
  const [schema, setSchema] = useState<UISchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analyzing workflow request...');
  const [offlineMode, setOfflineMode] = useState(true); // Default to True to guarantee instant fallback success
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Custom quick templates dropdown state
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState("Quick Templates");

  // Trigger button reference & position states for the portal
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (templateDropdownOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      
      const handleScroll = () => {
        setTemplateDropdownOpen(false);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [templateDropdownOpen]);
  
  // Debug states to show API source to judges/developers
  const [debugInfo, setDebugInfo] = useState<{ source: string; isOffline: boolean } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load initial schema on mount (default to burn rate dashboard)
    setSchema(fallbackSchemas.burn_rate);

    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme === 'dark' || (!savedTheme && systemPrefersDark) ? 'dark' : 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Clerk & Persistent History states
  interface GenerationRecord {
    id: string;
    userId: string;
    prompt: string;
    title: string;
    schemaJson: UISchema;
    usedFallback: boolean;
    createdAt: string;
  }

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historyList, setHistoryList] = useState<GenerationRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/generations');
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (error) {
      console.error('[Fetch History Error]:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistoryList([]);
    }
  }, [user, fetchHistory]);

  const saveGenerationToDb = async (promptText: string, titleText: string, schemaObj: UISchema, wasFallback: boolean) => {
    try {
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptText,
          title: titleText,
          schemaJson: schemaObj,
          usedFallback: wasFallback
        })
      });
      if (response.ok) {
        console.log('[History System] Successfully saved generation to Neon DB.');
        fetchHistory();
      } else {
        console.warn('[History System] Failed to save generation in backend API.');
      }
    } catch (e) {
      console.error('[History System] Silent error saving generation to database:', e);
    }
  };

  const loadHistoryItem = (record: GenerationRecord) => {
    setIsLoading(true);
    setLoadingStep("Retrieving saved dashboard layout...");
    setActivePrompt(record.prompt);
    setPrompt(record.prompt);
    setHistoryDrawerOpen(false);

    setTimeout(() => {
      setSchema(record.schemaJson);
      setDebugInfo({ source: 'database_history_load', isOffline: record.usedFallback });
      setIsLoading(false);
    }, 600);
  };

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/generations/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setHistoryList(prev => prev.filter(item => item.id !== id));
        console.log('[History System] Successfully deleted item.');
      } else {
        console.warn('[History System] Failed to delete history item.');
      }
    } catch (err) {
      console.error('[History System] Error deleting history item:', err);
    }
  };

  // Simulates step-by-step progress logging in the skeleton loader
  useEffect(() => {
    if (!isLoading) return;
    
    const steps = [
      { delay: 0, text: "Analyzing your request..." },
      { delay: 1500, text: "Choosing the right widgets..." },
      { delay: 3500, text: "Building your dashboard..." },
      { delay: 5500, text: "Binding data models and rendering canvas..." }
    ];

    const timers = steps.map(step => 
      setTimeout(() => {
        setLoadingStep(step.text);
      }, step.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  const handleGenerate = async (inputPrompt: string) => {
    if (!inputPrompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setActivePrompt(inputPrompt);
    setPrompt(inputPrompt);

    let finalSchema: UISchema | null = null;
    let fallbackUsed = false;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: inputPrompt, offline: offlineMode })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const resData = await response.json();
      finalSchema = resData.schema;
      fallbackUsed = !!resData.isOffline;
      setSchema(finalSchema);
      setDebugInfo({
        source: resData.source || 'Unknown',
        isOffline: fallbackUsed
      });
    } catch (error) {
      console.error("[GenUI Client Error] Generate request failed, swapping to fallback. Details:", error);
      // Fallback is also guaranteed to work client-side
      const clean = inputPrompt.toLowerCase();
      let selectedSchema = fallbackSchemas.burn_rate;
      if (clean.includes("habit") || clean.includes("routine") || clean.includes("fitness")) {
        selectedSchema = fallbackSchemas.habit_tracker;
      } else if (clean.includes("sale") || clean.includes("pipeline") || clean.includes("deal")) {
        selectedSchema = fallbackSchemas.sales_pipeline;
      } else if (clean.includes("rsvp") || clean.includes("event") || clean.includes("attend")) {
        selectedSchema = fallbackSchemas.rsvp;
      } else if (clean.includes("inventory") || clean.includes("store") || clean.includes("stock") || clean.includes("sku") || clean.includes("warehouse")) {
        selectedSchema = fallbackSchemas.inventory;
      } else if (clean.includes("hospital") || clean.includes("medical") || clean.includes("bed") || clean.includes("patient") || clean.includes("icu")) {
        selectedSchema = fallbackSchemas.hospital;
      } else if (clean.includes("food") || clean.includes("delivery") || clean.includes("swiggy") || clean.includes("zomato")) {
        selectedSchema = fallbackSchemas.food_delivery;
      } else if (clean.includes("ecommerce") || clean.includes("e-commerce") || clean.includes("commerce") || clean.includes("shop") || clean.includes("cart") || clean.includes("online")) {
        selectedSchema = fallbackSchemas.ecommerce;
      }
      finalSchema = selectedSchema;
      fallbackUsed = true;
      setSchema(selectedSchema);
      setDebugInfo({ source: 'client_fallback_after_api_error', isOffline: true });
    } finally {
      setIsLoading(false);
      if (user && finalSchema) {
        saveGenerationToDb(inputPrompt, finalSchema.title || 'Dynamic Dashboard', finalSchema, fallbackUsed);
      }
    }
  };

  const handleRegenerate = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 800);
    handleGenerate(activePrompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(prompt);
  };

  const heroContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const heroItemVariants = {
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

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* 1. Sleek Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-base sm:text-lg">GenUI</h1>
            <p className="text-[10px] text-slate-400 font-medium">Generative UI Workflow Engine</p>
          </div>
        </div>

        {/* Action Toggle Pill */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          <button 
            onClick={() => setOfflineMode(!offlineMode)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-300 cursor-pointer ${
              offlineMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {offlineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode (Demo Safe)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                <span>Online Mode (Live API)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer"
            title="View History"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
          </button>

          {/* User Profile / Auth State */}
          <div className="flex items-center">
            {authError ? (
              <span
                title={authError}
                className="text-[10px] font-semibold text-amber-500/80 border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 rounded-xl cursor-default"
              >
                Auth unavailable
              </span>
            ) : !isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
            ) : (
              <>
                <SafeSignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/15">
                      Sign In
                    </button>
                  </SignInButton>
                </SafeSignedOut>
                <SafeSignedIn>
                  {user && (
                    <div className="relative">
                      <button
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950/50 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <img 
                          src={user.imageUrl} 
                          alt={user.fullName || "User"} 
                          className="w-5 h-5 rounded-full border border-slate-700" 
                        />
                        <span className="hidden sm:inline text-slate-300">{user.firstName || "Account"}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {profileDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-40 bg-transparent" 
                              onClick={() => setProfileDropdownOpen(false)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 divide-y divide-slate-850 text-slate-300"
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setProfileDropdownOpen(false);
                                    setHistoryDrawerOpen(true);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:text-white hover:bg-indigo-600/20 transition-all flex items-center space-x-2 cursor-pointer"
                                >
                                  <Layers className="w-4 h-4 text-indigo-400" />
                                  <span>History</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setProfileDropdownOpen(false);
                                    signOut();
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:text-white hover:bg-rose-600/20 text-rose-400 transition-all flex items-center space-x-2 cursor-pointer"
                                >
                                  <Moon className="w-4 h-4 text-rose-400 animate-spin" style={{ animationDuration: '3s' }} />
                                  <span>Sign Out</span>
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </SafeSignedIn>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Search & Command Center (with animated gradient and staggered reveals) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 py-12 px-6 text-center text-white flex-shrink-0 animate-gradient-bg">
        {/* Subtle mesh background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <motion.div 
          className="max-w-3xl mx-auto space-y-6 relative z-10"
          variants={heroContainerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-2" variants={heroItemVariants}>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-white to-slate-300">
              Generative Workflows on Demand
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto font-medium">
              Describe your specific operational tracking dashboard, form, or process flow, and watch the layout generate instantly.
            </p>
          </motion.div>

          {/* Form Command Bar with integrated quick templates selection */}
          <motion.form 
            onSubmit={handleSubmit} 
            variants={heroItemVariants}
            className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-950/80 border border-slate-800/80 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/80 transition-all shadow-2xl space-y-2 sm:space-y-0"
          >
            {/* Custom Template Dropdown Select */}
            <div className="relative flex-shrink-0 z-20">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between space-x-1.5 px-4 py-2.5 bg-slate-900 border border-slate-800/85 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center space-x-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{selectedTemplateLabel}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${templateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Render Dropdown via React Portal directly in document.body to prevent layout cutoffs */}
              {isClient && templateDropdownOpen && typeof document !== 'undefined' && createPortal(
                <>
                  {/* Click-away backdrop */}
                  <div 
                    className="fixed inset-0 z-[9998] bg-transparent" 
                    onClick={() => setTemplateDropdownOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'fixed',
                      top: `${dropdownCoords.top + 8}px`,
                      left: `${dropdownCoords.left}px`,
                      width: `${Math.max(260, dropdownCoords.width)}px`,
                      zIndex: 9999
                    }}
                    className="bg-slate-900 border border-slate-805 rounded-xl shadow-2xl p-1.5 divide-y divide-slate-850"
                  >
                    <div className="py-1">
                      <span className="block px-3 py-1.5 text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Quick Templates</span>
                      {EXAMPLE_PROMPTS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateLabel(item.label);
                            setPrompt(item.text);
                            setTemplateDropdownOpen(false);
                            handleGenerate(item.text);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-indigo-600/20 transition-all flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          <Play className="w-2.5 h-2.5 fill-current text-slate-600 group-hover:text-indigo-400 animate-pulse" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>,
                document.body
              )}
            </div>

            <div className="flex-1 flex items-center pl-3">
              <Sparkles className="w-5 h-5 text-indigo-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your desired workflow interface (e.g. Set up a startup burn rate dashboard)..."
                className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder-slate-500 py-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-indigo-600/10"
            >
              <span>Generate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        </motion.div>
      </section>

      {/* 3. Render Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Dynamic Breadcrumbs / Active Prompt Pill */}
        {activePrompt && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-slate-400">Current View:</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-xl">
                "{activePrompt}"
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {debugInfo && (
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  [{debugInfo.source}]
                </span>
              )}
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        )}

        {/* Rendering Interface */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* SKELETON LOADER GRID WITH timed status loop animations */
            <motion.div 
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 p-6 border border-indigo-200/50 dark:border-indigo-950/50 bg-indigo-50/5 dark:bg-indigo-950/5 rounded-3xl animate-pulse"
            >
              {/* Skeleton Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <div className="h-6 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg shimmer" />
                  <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg shimmer" />
                </div>
              </div>
              
              {/* Skeleton Loader Message with Framer Motion fade-ins */}
              <div className="flex items-center justify-center py-6 text-sm font-semibold text-indigo-500 dark:text-indigo-400 space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm overflow-hidden h-14">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="relative overflow-hidden h-6 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={loadingStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      {loadingStep}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Skeleton Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl p-6 shimmer" />
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl p-6 shimmer" />
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl p-6 shimmer" />
                <div className="h-64 col-span-1 md:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-2xl p-6 shimmer" />
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl p-6 shimmer" />
              </div>
            </motion.div>
          ) : schema ? (
            /* CANVAS COMPONENT with cross-fade */
            <motion.div 
              key={`canvas-${activePrompt}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm"
            >
              <DynamicRenderer schema={schema} prompt={activePrompt} />
            </motion.div>
          ) : (
            /* EMPTY STATE */
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm"
            >
              <Layout className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No layout generated</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                Please choose a quick template or write a custom description in the command bar above.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Drawer Panel */}
      <AnimatePresence>
        {historyDrawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950 z-[1000]"
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 text-white z-[1001] flex flex-col shadow-2xl h-full"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base">Generation History</h3>
                </div>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  title="Close Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {authError ? (
                  /* Auth error boundary fallback — Clerk failed to init */
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                    <AlertCircle className="w-10 h-10 text-amber-500" />
                    <h4 className="font-semibold text-sm text-slate-300">Auth Unavailable</h4>
                    <p className="text-xs text-slate-500 max-w-[250px] leading-relaxed">
                      Authentication is temporarily unavailable. The dashboard generator still works fully — history requires a valid Clerk configuration.
                    </p>
                  </div>
                ) : !isLoaded ? (
                  <div className="h-full flex items-center justify-center">
                    <RotateCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : !user ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                    <AlertCircle className="w-10 h-10 text-slate-500 animate-pulse" />
                    <h4 className="font-semibold text-sm text-slate-300">Sign In to View History</h4>
                    <p className="text-xs text-slate-500 max-w-[250px] leading-relaxed">
                      Authenticate to view your generation prompts history, reload metric layouts, and manage saved schemas.
                    </p>
                    <SafeSignedOut>
                      <SignInButton mode="modal">
                        <button 
                          onClick={() => setHistoryDrawerOpen(false)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                        >
                          Sign In
                        </button>
                      </SignInButton>
                    </SafeSignedOut>
                  </div>
                ) : historyLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <RotateCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 px-4">
                    <Code className="w-8 h-8 text-slate-600" />
                    <h4 className="font-semibold text-sm text-slate-400">No History Records</h4>
                    <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                      Your generated dashboards will be saved to this history list automatically when signed in.
                    </p>
                  </div>
                ) : (
                  historyList.map((item) => {
                    const ageText = formatRelativeTime(item.createdAt);
                    
                    const getHistoryIcon = () => {
                      const title = item.title.toLowerCase();
                      if (title.includes('hospital')) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
                      if (title.includes('food')) return <Sparkles className="w-4 h-4 text-amber-400" />;
                      if (title.includes('habit')) return <Layers className="w-4 h-4 text-sky-400" />;
                      return <Layout className="w-4 h-4 text-indigo-400" />;
                    };

                    return (
                      <div
                        key={item.id}
                        onClick={() => loadHistoryItem(item)}
                        className="p-4 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950 rounded-xl transition-all duration-205 cursor-pointer relative group"
                      >
                        <div className="flex items-start justify-between space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                              {getHistoryIcon()}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">{ageText}</span>
                          </div>
                          
                          <button
                            onClick={(e) => deleteHistoryItem(e, item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg border border-slate-805 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 transition-all cursor-pointer z-10"
                            title="Delete history item"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic font-mono bg-slate-900/50 px-2 py-1 rounded">
                          &quot;{item.prompt}&quot;
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to compute human-readable relative time deltas
function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

/**
 * Returns true only when both Clerk keys look like real keys (correct prefix
 * and sufficient length). Empty strings, blank placeholders, and scaffold
 * fakes all return false — avoiding any Clerk SDK activation.
 */
function checkClerkConfigured(): boolean {
  const pub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const sec = process.env.CLERK_SECRET_KEY ?? "";
  const pubOk = (pub.startsWith("pk_test_") || pub.startsWith("pk_live_")) && pub.length > 40;
  const secOk = (sec.startsWith("sk_test_") || sec.startsWith("sk_live_")) && sec.length > 20;
  return pubOk && secOk;
}

function SafeSignedOut({ children }: { children: React.ReactNode }) {
  if (!checkClerkConfigured()) {
    return <>{children}</>;
  }
  return <Show when="signed-out">{children}</Show>;
}

function SafeSignedIn({ children }: { children: React.ReactNode }) {
  if (!checkClerkConfigured()) {
    return null;
  }
  return <Show when="signed-in">{children}</Show>;
}

export default function Home() {
  if (checkClerkConfigured()) {
    return (
      <AuthErrorBoundary
        fallback={
          <AnonymousHomeContent
            authError="Auth service unavailable — running in demo mode."
          />
        }
      >
        <ClerkHomeContent />
      </AuthErrorBoundary>
    );
  }
  return <AnonymousHomeContent />;
}

function ClerkHomeContent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  return <DashboardMain user={user} isLoaded={isLoaded} signOut={signOut} />;
}

function AnonymousHomeContent({ authError }: { authError?: string } = {}) {
  return <DashboardMain user={null} isLoaded={true} signOut={() => {}} authError={authError} />;
}
