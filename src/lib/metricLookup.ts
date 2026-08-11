export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend?: { direction: "up" | "down"; amount: number; isGood: boolean };
  context?: string;
}

export interface MetricDefinition {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  isTrendUpGood: boolean;
  context: string;
}

export const METRIC_LOOKUP: Record<string, MetricDefinition> = {
  // 1. Startup Finance
  cash_runway: {
    id: "cash_runway",
    label: "Cash Runway",
    unit: "months",
    min: 1,
    max: 24,
    isTrendUpGood: true,
    context: "based on current monthly burn"
  },
  monthly_burn: {
    id: "monthly_burn",
    label: "Monthly Burn Rate",
    unit: "₹",
    min: 100000,
    max: 2000000,
    isTrendUpGood: false,
    context: "average monthly operational expenses"
  },
  mrr: {
    id: "mrr",
    label: "Monthly Recurring Revenue",
    unit: "₹",
    min: 50000,
    max: 5000000,
    isTrendUpGood: true,
    context: "active subscription contracts"
  },
  cash_balance: {
    id: "cash_balance",
    label: "Cash Reserves",
    unit: "₹",
    min: 5000000,
    max: 100000000,
    isTrendUpGood: true,
    context: "cash in primary bank accounts"
  },

  // 2. Habit Tracker
  completion_rate: {
    id: "completion_rate",
    label: "Completion Rate",
    unit: "%",
    min: 50,
    max: 100,
    isTrendUpGood: true,
    context: "of daily habits completed"
  },
  habit_streak: {
    id: "habit_streak",
    label: "Active Habit Streak",
    unit: "days",
    min: 0,
    max: 120,
    isTrendUpGood: true,
    context: "longest streak for morning routine"
  },
  logged_activities: {
    id: "logged_activities",
    label: "Logged Activities",
    unit: "activities",
    min: 10,
    max: 300,
    isTrendUpGood: true,
    context: "activities logged this month"
  },

  // 3. Sales Pipeline
  pipeline_value: {
    id: "pipeline_value",
    label: "Pipeline Value",
    unit: "₹",
    min: 500000,
    max: 10000000,
    isTrendUpGood: true,
    context: "across all active deal stages"
  },
  win_rate: {
    id: "win_rate",
    label: "Sales Win Rate",
    unit: "%",
    min: 10,
    max: 40,
    isTrendUpGood: true,
    context: "deals won in past 90 days"
  },
  active_deals: {
    id: "active_deals",
    label: "Active Deals",
    unit: "deals",
    min: 5,
    max: 80,
    isTrendUpGood: true,
    context: "opportunities in progress"
  },

  // 4. Event RSVP
  attendee_count: {
    id: "attendee_count",
    label: "Total RSVPs",
    unit: "guests",
    min: 50,
    max: 500,
    isTrendUpGood: true,
    context: "registered attendee seats"
  },
  capacity_utilization: {
    id: "capacity_utilization",
    label: "Capacity Utilization",
    unit: "%",
    min: 40,
    max: 100,
    isTrendUpGood: true,
    context: "venue seating capacity"
  },
  vip_count: {
    id: "vip_count",
    label: "VIP Guests",
    unit: "guests",
    min: 5,
    max: 80,
    isTrendUpGood: true,
    context: "special pass holders"
  },

  // 5. Inventory Tracker
  total_items: {
    id: "total_items",
    label: "Total Stock Items",
    unit: "SKUs",
    min: 50,
    max: 10000,
    isTrendUpGood: true,
    context: "tracked across categories"
  },
  active_skus: {
    id: "active_skus",
    label: "Active SKUs",
    unit: "active SKUs",
    min: 30,
    max: 8000,
    isTrendUpGood: true,
    context: "currently available in catalog"
  },
  out_of_stock_count: {
    id: "out_of_stock_count",
    label: "Out of Stock Items",
    unit: "SKUs",
    min: 0,
    max: 50,
    isTrendUpGood: false,
    context: "requiring immediate restock"
  },

  // 6. Hospital Operations
  bed_occupancy: {
    id: "bed_occupancy",
    label: "Bed Occupancy Rate",
    unit: "%",
    min: 60,
    max: 95,
    isTrendUpGood: false,
    context: "occupied ward beds"
  },
  icu_occupancy: {
    id: "icu_occupancy",
    label: "ICU Bed Occupancy Rate",
    unit: "%",
    min: 40,
    max: 90,
    isTrendUpGood: false,
    context: "critical care occupancy"
  },
  avg_wait_time: {
    id: "avg_wait_time",
    label: "Average ER Wait Time",
    unit: "mins",
    min: 10,
    max: 120,
    isTrendUpGood: false,
    context: "triage to doctor contact"
  },
  patients_admitted: {
    id: "patients_admitted",
    label: "Patients Admitted Today",
    unit: "patients",
    min: 10,
    max: 500,
    isTrendUpGood: true,
    context: "patients admitted to ER or OPD today"
  },

  // 7. Food Delivery
  avg_delivery_time: {
    id: "avg_delivery_time",
    label: "Average Delivery Time",
    unit: "mins",
    min: 15,
    max: 45,
    isTrendUpGood: false,
    context: "from order placement to doorstep"
  },
  active_orders: {
    id: "active_orders",
    label: "Active Live Orders",
    unit: "orders",
    min: 50,
    max: 1500,
    isTrendUpGood: true,
    context: "currently in prep or transit"
  },
  couriers_online: {
    id: "couriers_online",
    label: "Active Delivery Partners",
    unit: "partners",
    min: 30,
    max: 800,
    isTrendUpGood: true,
    context: "online and available in region"
  },
  orders_today: {
    id: "orders_today",
    label: "Orders Today",
    unit: "orders",
    min: 50,
    max: 10000,
    isTrendUpGood: true,
    context: "food orders received today"
  },
  active_riders: {
    id: "active_riders",
    label: "Active Riders",
    unit: "riders",
    min: 20,
    max: 2000,
    isTrendUpGood: true,
    context: "delivery riders currently on duty"
  },
  order_value: {
    id: "order_value",
    label: "Order Value",
    unit: "₹",
    min: 10000,
    max: 10000000,
    isTrendUpGood: true,
    context: "gross value of orders processed today"
  },

  // 8. E-Commerce
  cart_abandonment: {
    id: "cart_abandonment",
    label: "Cart Abandonment Rate",
    unit: "%",
    min: 60,
    max: 80,
    isTrendUpGood: false,
    context: "carts created but not completed"
  },
  daily_orders: {
    id: "daily_orders",
    label: "Daily Orders",
    unit: "orders",
    min: 100,
    max: 5000,
    isTrendUpGood: true,
    context: "orders processed today"
  },
  conversion_rate: {
    id: "conversion_rate",
    label: "Conversion Rate",
    unit: "%",
    min: 1,
    max: 10,
    isTrendUpGood: true,
    context: "visitors converted to buyers"
  },
  gmv_today: {
    id: "gmv_today",
    label: "GMV Today",
    unit: "₹",
    min: 10000,
    max: 50000000,
    isTrendUpGood: true,
    context: "gross merchandise value sold today"
  },
  avg_order_value: {
    id: "avg_order_value",
    label: "Average Order Value",
    unit: "₹",
    min: 100,
    max: 10000,
    isTrendUpGood: true,
    context: "average basket size per transaction"
  }
};

export function getFallbackMetric(id: string): MetricDefinition {
  const cleanId = id.replace(/_kpi/g, "");
  if (METRIC_LOOKUP[cleanId]) return METRIC_LOOKUP[cleanId];
  
  return {
    id,
    label: id.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    unit: "units",
    min: 0,
    max: 1000,
    isTrendUpGood: true,
    context: "calculated operational metric"
  };
}
