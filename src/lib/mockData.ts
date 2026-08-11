/* eslint-disable @typescript-eslint/no-explicit-any */
import { METRIC_LOOKUP, getFallbackMetric, KPIMetric } from './metricLookup';

export interface MockDataset {
  kpis: Record<string, KPIMetric>;
  charts: Record<string, Array<Record<string, any>>>;
  tables: Record<string, Array<Record<string, any>>>;
  lists?: Record<string, Array<{ title: string; subtitle?: string; value?: string; status?: string; name?: string; email?: string; ticket?: string }>>;
  boards?: Record<string, { columns: Array<{ title: string; cards: Array<{ id: string; title: string; subtitle?: string; value?: string }> }> }>;
  streaks?: Record<string, { count: number; label: string; text?: string }>;
  heatmaps?: Record<string, Array<{ date: string; value: number }>>;
}

// Indian Currency Formatter (Lakhs/Crores layout with ₹ symbol)
export function formatIndianCurrency(num: number): string {
  const isNeg = num < 0;
  const absNum = Math.abs(num);
  const x = Math.round(absNum).toString();
  let lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return (isNeg ? '-' : '') + '₹' + res;
}

// Factory helper to construct range-clamped context-bound KPI metrics
export function createKPIMetric(id: string, value: number): KPIMetric {
  const def = METRIC_LOOKUP[id] || getFallbackMetric(id);
  // Cap/clamp value to min/max
  const clampedValue = Math.max(def.min, Math.min(def.max, value));
  
  // Plausible trend magnitude is a small percentage (e.g. 3% to 8%)
  const trendPercent = 3 + (Math.round(clampedValue) % 6);
  let trendAmount = 0;
  
  if (def.unit === '₹') {
    // Round to clean lakh/thousand delta
    trendAmount = Math.round(clampedValue * 0.05 / 1000) * 1000;
  } else if (def.unit === '%') {
    trendAmount = Math.round(trendPercent);
  } else if (def.unit === 'months') {
    trendAmount = Math.round((trendPercent / 5) * 10) / 10;
  } else {
    trendAmount = Math.max(1, Math.round(clampedValue * (trendPercent / 100)));
  }

  // Direction: deterministic pick based on values
  const isUp = (Math.round(clampedValue) % 2 === 0);
  const direction = isUp ? "up" : "down";
  
  // Semantic goodness evaluation based on lookup table rule
  const isGood = isUp ? def.isTrendUpGood : !def.isTrendUpGood;

  return {
    id,
    label: def.label,
    value: clampedValue,
    unit: def.unit,
    trend: {
      direction,
      amount: trendAmount,
      isGood
    },
    context: def.context
  };
}

// Generate last 30 days of binary activity values for heatmap
const generateLast30DaysData = (): Array<{ date: string; value: number }> => {
  const list: Array<{ date: string; value: number }> = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const val = Math.random() > 0.25 ? 1 : 0;
    list.push({ date: dateStr, value: val });
  }
  return list;
};

// 1. Startup Finance (Rupees, Indian Comma Notation, Top expense categories)
const burnRateData: MockDataset = {
  kpis: {
    monthly_burn: createKPIMetric("monthly_burn", 350000),
    cash_runway: createKPIMetric("cash_runway", 17.5),
    mrr: createKPIMetric("mrr", 1240000),
    cash_balance: createKPIMetric("cash_balance", 60000000)
  },
  charts: {
    burn_history: [
      { name: "Jan", revenue: 1000000, expenses: 1350000, burn: 350000 },
      { name: "Feb", revenue: 1100000, expenses: 1450000, burn: 350000 },
      { name: "Mar", revenue: 1150000, expenses: 1530000, burn: 380000 },
      { name: "Apr", revenue: 1200000, expenses: 1520000, burn: 320000 },
      { name: "May", revenue: 1220000, expenses: 1620000, burn: 400000 },
      { name: "Jun", revenue: 1240000, expenses: 1590000, burn: 350000 }
    ]
  },
  tables: {
    recent_transactions: [
      { id: "tx-1", date: "2026-08-01", description: "AWS Mumbai Cloud Servers", category: "Hosting", amount: -180000 },
      { id: "tx-2", date: "2026-08-02", description: "Bengaluru Office Monthly Lease", category: "Facilities", amount: -250000 },
      { id: "tx-3", date: "2026-08-03", description: "Employee Payroll (June Salaries)", category: "Salaries", amount: -1240000 },
      { id: "tx-4", date: "2026-08-05", description: "Digital Marketing Ads (Google/FB)", category: "Marketing", amount: -320000 },
      { id: "tx-5", date: "2026-08-07", description: "Stripe Merchant Payout - SaaS", category: "Revenue", amount: 3500000 }
    ]
  },
  lists: [
    { title: "Review hosting tiers on AWS Mumbai", subtitle: "Target: reduce monthly spend by 15%", value: "High Priority", status: "Todo" },
    { title: "Approve July marketing budget", subtitle: "Allocated: ₹8,50,000 across Ad channels", value: "Pending", status: "In Progress" },
    { title: "GST Filings & Returns Submission", subtitle: "Due by August 20th", value: "Compliance", status: "Todo" }
  ] as any
};

// 2. Habit Tracker (Pill-style, Streak indicator, 2 Progress Targets, list checklist) - NO CHARTS/TABLES
const fitnessData: MockDataset = {
  kpis: {
    completion_rate: createKPIMetric("completion_rate", 84),
    habit_streak: createKPIMetric("habit_streak", 12),
    logged_activities: createKPIMetric("logged_activities", 48)
  },
  charts: {},
  tables: {},
  lists: [
    { title: "Morning Hydration (500ml)", subtitle: "Drink water right after waking up", value: "07:15 AM", status: "Completed" },
    { title: "15-Min Meditation", subtitle: "Mindful breathing in a quiet space", value: "07:30 AM", status: "Completed" },
    { title: "Read 10 Pages", subtitle: "Focus on non-fiction/tech books", value: "08:10 AM", status: "Completed" },
    { title: "Daily Gym Workout", subtitle: "Weight training or active cardio", value: "06:30 PM", status: "Completed" }
  ] as any,
  streaks: {
    habit_streak: { count: 12, label: "Consecutive Days Completed" }
  },
  heatmaps: {
    habit_history: generateLast30DaysData()
  }
};

// 3. Sales Pipeline (Kanban board, Stage deals bar chart, Opportunity KPIs)
const salesData: MockDataset = {
  kpis: {
    pipeline_value: createKPIMetric("pipeline_value", 2940000),
    win_rate: createKPIMetric("win_rate", 28),
    active_deals: createKPIMetric("active_deals", 15)
  },
  charts: {
    pipeline_stages: [
      { name: "Lead", value: 730000 },
      { name: "Contacted", value: 120000 },
      { name: "Proposal", value: 1240000 },
      { name: "Won", value: 850000 }
    ]
  },
  tables: {},
  lists: {},
  boards: {
    sales_board: {
      columns: [
        {
          title: "Lead",
          cards: [
            { id: "dl-1", title: "CRM Migration Services", subtitle: "Globex Inc", value: formatIndianCurrency(280000) },
            { id: "dl-2", title: "Cloud Integration Setup", subtitle: "Acme Corp", value: formatIndianCurrency(450000) }
          ]
        },
        {
          title: "Contacted",
          cards: [
            { id: "dl-3", title: "API Custom Development", subtitle: "Kirana Stores Retail", value: formatIndianCurrency(120000) }
          ]
        },
        {
          title: "Proposal",
          cards: [
            { id: "dl-4", title: "SaaS Subscription Deal", subtitle: "Mumbai Tech Ventures", value: formatIndianCurrency(1240000) }
          ]
        },
        {
          title: "Won",
          cards: [
            { id: "dl-5", title: "Mobile App Redevelopment", subtitle: "Delhi Logistics", value: formatIndianCurrency(850000) }
          ]
        }
      ]
    }
  }
};

// 4. Event RSVP Tracker (Signup Form, Capacity Progress Bar, Guest Name List) - NO CHARTS AT ALL
const rsvpData: MockDataset = {
  kpis: {
    attendee_count: createKPIMetric("attendee_count", 284),
    capacity_utilization: createKPIMetric("capacity_utilization", 71),
    vip_count: createKPIMetric("vip_count", 35)
  },
  charts: {},
  tables: {},
  lists: {
    attendees: [
      { name: "Amit Sharma", email: "amit@sharma.in", ticket: "VIP Pass", status: "Confirmed" },
      { name: "Priya Patel", email: "priya@patel.com", ticket: "General Admin", status: "Confirmed" },
      { name: "Rahul Iyer", email: "rahul@iyer.co.in", ticket: "General Admin", status: "Confirmed" },
      { name: "Siddharth Nair", email: "sid@nair.org", ticket: "VIP Pass", status: "Confirmed" }
    ]
  } as any
};

// 5. Inventory Tracker (SKU levels Table with red/green/yellow warning colors + Alert KPIs + Category Bar Chart)
const inventoryData: MockDataset = {
  kpis: {
    total_items: createKPIMetric("total_items", 2450),
    active_skus: createKPIMetric("active_skus", 184),
    out_of_stock_count: createKPIMetric("out_of_stock_count", 3)
  },
  charts: {
    stock_by_category: [
      { name: "Fashion", stock: 850 },
      { name: "Electronics", stock: 240 },
      { name: "Grocery", stock: 1200 },
      { name: "Home", stock: 380 }
    ]
  },
  tables: {
    inventory_table: [
      { id: "sku-1", sku: "FASH-KRT-01", item: "Premium Cotton Kurta", stock: 120, threshold: 20, status: "In Stock" },
      { id: "sku-2", sku: "ELEC-ERB-05", item: "Wireless Earbuds BassPro", stock: 45, threshold: 10, status: "In Stock" },
      { id: "sku-3", sku: "GROC-RCE-02", item: "Super Basmati Rice 5kg", stock: 3, threshold: 15, status: "Low Stock" },
      { id: "sku-4", sku: "GROC-SPC-09", item: "Organic Spice Mix Pack", stock: 0, threshold: 5, status: "Out of Stock" },
      { id: "sku-5", sku: "HOME-BTL-03", item: "Pure Copper Water Bottle", stock: 24, threshold: 8, status: "In Stock" }
    ]
  },
  lists: {}
};

// 6. Hospital Operations (Bed Occupancy, Admissions by department, Doctor load, ICU capacity used)
const hospitalData: MockDataset = {
  kpis: {
    bed_occupancy: createKPIMetric("bed_occupancy", 82),
    patients_admitted: createKPIMetric("patients_admitted", 145),
    avg_wait_time: createKPIMetric("avg_wait_time", 28),
    icu_occupancy: createKPIMetric("icu_occupancy", 75)
  },
  charts: {
    admissions_by_department: [
      { name: "Cardiology", admissions: 42 },
      { name: "Emergency Room", admissions: 110 },
      { name: "Outpatient Dept", admissions: 285 },
      { name: "Pediatrics", admissions: 68 },
      { name: "General Medicine", admissions: 154 }
    ]
  },
  tables: {
    doctor_patient_load: [
      { id: "dr-1", doctor: "Dr. Arvind Chidambaram", department: "Cardiology", active_patients: 14, status: "Busy" },
      { id: "dr-2", doctor: "Dr. Priya Nair", department: "Emergency Room", active_patients: 28, status: "On Duty" },
      { id: "dr-3", doctor: "Dr. Rohan Gupta", department: "Pediatrics", active_patients: 9, status: "Available" },
      { id: "dr-4", doctor: "Dr. Shalini Sen", department: "General Medicine", active_patients: 22, status: "Busy" }
    ]
  },
  lists: {}
};

// 7. Food Delivery Operations (Zomato/Swiggy style operational metrics)
const foodDeliveryData: MockDataset = {
  kpis: {
    orders_today: createKPIMetric("orders_today", 3840),
    avg_delivery_time: createKPIMetric("avg_delivery_time", 24),
    active_riders: createKPIMetric("active_riders", 412),
    order_value: createKPIMetric("order_value", 1248000)
  },
  charts: {
    orders_by_hour: [
      { name: "09:00", orders: 120 },
      { name: "12:00", orders: 680 },
      { name: "15:00", orders: 210 },
      { name: "19:00", orders: 940 },
      { name: "22:00", orders: 320 }
    ],
    cancellations_by_reason: [
      { name: "Rider Delay", count: 28 },
      { name: "Customer No Show", count: 12 },
      { name: "Restaurant Issue", count: 8 },
      { name: "Wrong Address", count: 4 }
    ]
  },
  tables: {
    top_restaurants: [
      { id: "rest-1", name: "Bawarchi Biryani", orders: 280, rating: "4.5 ★", status: "Active" },
      { id: "rest-2", name: "MTR Restaurant", orders: 195, rating: "4.6 ★", status: "Active" },
      { id: "rest-3", name: "Chutneys", orders: 140, rating: "4.3 ★", status: "Active" },
      { id: "rest-4", name: "Leon Grill", orders: 115, rating: "4.2 ★", status: "Active" }
    ]
  },
  lists: {}
};

// 8. E-Commerce Store (Retail metrics with Indian payment mix)
const shoppingData: MockDataset = {
  kpis: {
    gmv_today: createKPIMetric("gmv_today", 1540000),
    daily_orders: createKPIMetric("daily_orders", 2150),
    cart_abandonment: createKPIMetric("cart_abandonment", 68),
    avg_order_value: createKPIMetric("avg_order_value", 716)
  },
  charts: {
    sales_by_category: [
      { name: "Fashion", sales: 850000 },
      { name: "Electronics", sales: 240000 },
      { name: "Grocery", sales: 1200000 },
      { name: "Home", sales: 380000 }
    ],
    payment_methods: [
      { name: "UPI", value: 65 },
      { name: "COD", value: 25 },
      { name: "Card", value: 10 }
    ]
  },
  tables: {
    top_selling_products: [
      { id: "prod-1", name: "Premium Cotton Kurta", sales: 420, stock: 120, price: 899 },
      { id: "prod-2", name: "Wireless Earbuds BassPro", sales: 280, stock: 45, price: 1299 },
      { id: "prod-3", name: "Super Basmati Rice 5kg", sales: 190, stock: 15, price: 450 }
    ]
  },
  lists: {}
};

// 9. Generic Fallback Dataset
const genericData: MockDataset = {
  kpis: {
    completion_rate: createKPIMetric("completion_rate", 92),
    habit_streak: createKPIMetric("habit_streak", 14)
  },
  charts: {
    trend_analysis: [
      { name: "Day 1", value: 120 },
      { name: "Day 2", value: 150 },
      { name: "Day 3", value: 110 }
    ]
  },
  tables: {
    record_table: [
      { id: "rec-1", name: "Kirana Item A", type: "Primary", status: "Active" },
      { id: "rec-2", name: "Kirana Item B", type: "Secondary", status: "Active" }
    ]
  },
  lists: [
    { title: "Initialize workflow", subtitle: "Verify details", value: "Complete", status: "Completed" }
  ] as any
};

// Helper: matches a prompt to a domain and returns the mock dataset
export function getMockDataForDomain(prompt: string): MockDataset {
  const clean = prompt.toLowerCase();
  
  if (clean.includes("burn rate") || clean.includes("startup") || clean.includes("runway") || clean.includes("burn")) {
    return burnRateData;
  }
  if (clean.includes("hospital") || clean.includes("clinic") || clean.includes("patient")) {
    return hospitalData;
  }
  if (clean.includes("food delivery") || clean.includes("restaurant") || clean.includes("orders")) {
    return foodDeliveryData;
  }
  if (clean.includes("shopping") || clean.includes("ecommerce") || clean.includes("store") || clean.includes("gmv")) {
    return shoppingData;
  }
  if (clean.includes("habit") || clean.includes("routine") || clean.includes("streak")) {
    return fitnessData;
  }

  // Fallbacks if keywords don't match standard domains
  if (clean.includes("sale") || clean.includes("pipeline") || clean.includes("deal") || clean.includes("lead") || clean.includes("opportun") || clean.includes("board")) {
    return salesData;
  }
  if (clean.includes("rsvp") || clean.includes("event") || clean.includes("attend") || clean.includes("regist") || clean.includes("ticket") || clean.includes("guest")) {
    return rsvpData;
  }
  if (clean.includes("inventory") || clean.includes("stock") || clean.includes("sku") || clean.includes("warehouse")) {
    return inventoryData;
  }

  return genericData;
}
