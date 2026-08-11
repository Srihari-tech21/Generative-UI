import { UISchema } from '../types/schema';

// 1. Startup Finance (KPIs, Trend Chart, Expense Table)
export const burnRateSchema: UISchema = {
  title: "Startup Burn Rate & Financials",
  layout: "grid",
  widgets: [
    {
      id: "burn-kpi-1",
      type: "kpi_card",
      title: "Cash Runway",
      config: { key: "cash_runway" }
    },
    {
      id: "burn-kpi-2",
      type: "kpi_card",
      title: "Monthly Recurring Revenue",
      config: { key: "mrr" }
    },
    {
      id: "burn-kpi-3",
      type: "kpi_card",
      title: "Monthly Burn Rate",
      config: { key: "monthly_burn" }
    },
    {
      id: "burn-chart-1",
      type: "line_chart",
      title: "Burn Rate Over Last 6 Months",
      config: {
        chartKey: "burn_history",
        xAxisKey: "name",
        dataKeys: ["burn", "revenue", "expenses"]
      }
    },
    {
      id: "burn-table-1",
      type: "table",
      title: "Recent Corporate Transactions",
      config: {
        tableKey: "recent_transactions",
        columns: [
          { key: "date", label: "Date" },
          { key: "description", label: "Description" },
          { key: "category", label: "Category" },
          { key: "amount", label: "Amount" }
        ]
      }
    },
    {
      id: "burn-kpi-4",
      type: "kpi_card",
      title: "Cash Reserves in Bank",
      config: { key: "cash_balance" }
    }
  ]
};

// 2. Habit Tracker (Streak Counter + 2 progress bars + checklist List) - NO CHARTS, NO TABLES, PILL-STYLE
export const habitTrackerSchema: UISchema = {
  title: "Daily Habit & Routine Consistency",
  layout: "grid",
  widgets: [
    {
      id: "hab-streak-1",
      type: "streak_counter",
      title: "Current Active Streak",
      config: { streakKey: "habit_streak" }
    },
    {
      id: "hab-progress-1",
      type: "progress_bar",
      title: "Water Intake Hydration Target",
      config: { value: 75, label: "1.5L out of 2L goal completed" }
    },
    {
      id: "hab-progress-2",
      type: "progress_bar",
      title: "Mindfulness Meditation Target",
      config: { value: 100, label: "15 min meditation session completed" }
    },
    {
      id: "hab-kpi-1",
      type: "kpi_card",
      title: "Daily Habit Completion Rate",
      config: { key: "completion_rate" }
    },
    {
      id: "hab-list-1",
      type: "list",
      title: "Today's Checklist Tracker",
      config: {
        listKey: "habit_logs",
        titleKey: "title",
        subtitleKey: "subtitle",
        valueKey: "value",
        statusKey: "status"
      }
    }
  ]
};

// 3. Sales Pipeline (Kanban Board + Stage Bar Chart + Win Rate & Pipeline Value KPIs)
export const salesPipelineSchema: UISchema = {
  title: "Enterprise Sales Pipeline Tracker",
  layout: "stack",
  widgets: [
    {
      id: "sales-board-1",
      type: "board",
      title: "Kanban Pipeline Deal Stages",
      config: { boardKey: "sales_board" }
    },
    {
      id: "sales-chart-1",
      type: "bar_chart",
      title: "Revenue Opportunity Distribution",
      config: {
        chartKey: "pipeline_stages",
        xAxisKey: "name",
        dataKeys: ["value"]
      }
    },
    {
      id: "sales-kpi-1",
      type: "kpi_card",
      title: "Total Pipeline Value",
      config: { key: "pipeline_value" }
    },
    {
      id: "sales-kpi-2",
      type: "kpi_card",
      title: "Win Rate Percentage",
      config: { key: "win_rate" }
    }
  ]
};

// 4. Event RSVP Tracker (Signup Form, Progress Bar, Guest Name List) - NO CHARTS AT ALL
export const eventRSVPSchema: UISchema = {
  title: "Tech Conference RSVP & Guest Registry",
  layout: "grid",
  widgets: [
    {
      id: "rsvp-progress-1",
      type: "progress_bar",
      title: "Venue Capacity Filled",
      config: { value: 71, label: "284 out of 400 RSVPs (71% filled)" }
    },
    {
      id: "rsvp-form-1",
      type: "form",
      title: "Register New Attendee",
      config: {
        submitText: "Register Attendee",
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Amit Sharma" },
          { name: "email", label: "Email Address", type: "email", required: true, placeholder: "amit@sharma.in" },
          { name: "guests", label: "Guest Count", type: "number", required: true, placeholder: "1" },
          { name: "diet", label: "Dietary Preference", type: "select", options: ["Veg", "Non-Veg", "Jain", "None"], required: false }
        ]
      }
    },
    {
      id: "rsvp-list-1",
      type: "list",
      title: "Recent Attendee Name Registrations",
      config: {
        listKey: "attendees",
        titleKey: "name",
        subtitleKey: "email",
        valueKey: "ticket",
        statusKey: "status"
      }
    }
  ]
};

// 5. Inventory Tracker (SKU levels Table + Low Stock KPIs + Category Bar Chart)
export const inventoryTrackerSchema: UISchema = {
  title: "Central Warehouse Inventory Dashboard",
  layout: "grid",
  widgets: [
    {
      id: "inv-table-1",
      type: "table",
      title: "Active Stock Level Alerts",
      config: {
        tableKey: "inventory_table",
        columns: [
          { key: "sku", label: "SKU Code" },
          { key: "item", label: "Item Name" },
          { key: "stock", label: "Stock Level" },
          { key: "threshold", label: "Threshold" },
          { key: "status", label: "Status" }
        ]
      }
    },
    {
      id: "inv-kpi-1",
      type: "kpi_card",
      title: "Items Low on Stock",
      config: { key: "out_of_stock_count" }
    },
    {
      id: "inv-kpi-2",
      type: "kpi_card",
      title: "Total SKU Count",
      config: { key: "active_skus" }
    },
    {
      id: "inv-chart-1",
      type: "bar_chart",
      title: "Stock Distribution by Category",
      config: {
        chartKey: "stock_by_category",
        xAxisKey: "name",
        dataKeys: ["stock"]
      }
    }
  ]
};

// 6. Hospital Operations (Patient Admissions table, bed & wait KPIs, ICU capacity progress)
export const hospitalSchema: UISchema = {
  title: "City Hospital Patient Operations",
  layout: "grid",
  widgets: [
    {
      id: "hosp-kpi-1",
      type: "kpi_card",
      title: "Bed Occupancy Rate",
      config: { key: "bed_occupancy" }
    },
    {
      id: "hosp-kpi-2",
      type: "kpi_card",
      title: "Patients Admitted Today",
      config: { key: "patients_admitted" }
    },
    {
      id: "hosp-kpi-3",
      type: "kpi_card",
      title: "Average ER Wait Time",
      config: { key: "avg_wait_time" }
    },
    {
      id: "hosp-chart-1",
      type: "bar_chart",
      title: "Admissions by Department",
      config: {
        chartKey: "admissions_by_department",
        xAxisKey: "name",
        dataKeys: ["admissions"]
      }
    },
    {
      id: "hosp-table-1",
      type: "table",
      title: "Doctor-wise Patient Load",
      config: {
        tableKey: "doctor_patient_load",
        columns: [
          { key: "doctor", label: "Doctor Name" },
          { key: "department", label: "Department" },
          { key: "active_patients", label: "Active Patients" },
          { key: "status", label: "Status" }
        ]
      }
    },
    {
      id: "hosp-progress-1",
      type: "progress_bar",
      title: "ICU Seating Capacity Used",
      config: { value: 75, label: "15 out of 20 ICU beds occupied" }
    }
  ]
};

// 7. Food Delivery Operations (couriers online, live orders, avg time KPIs, dispatches table)
export const foodDeliverySchema: UISchema = {
  title: "Swiggy/Zomato-style Food Delivery Operations",
  layout: "grid",
  widgets: [
    {
      id: "food-kpi-1",
      type: "kpi_card",
      title: "Orders Today",
      config: { key: "orders_today" }
    },
    {
      id: "food-kpi-2",
      type: "kpi_card",
      title: "Average Delivery Time",
      config: { key: "avg_delivery_time" }
    },
    {
      id: "food-kpi-3",
      type: "kpi_card",
      title: "Active Riders",
      config: { key: "active_riders" }
    },
    {
      id: "food-kpi-4",
      type: "kpi_card",
      title: "Gross Order Value",
      config: { key: "order_value" }
    },
    {
      id: "food-chart-1",
      type: "line_chart",
      title: "Hourly Order Traffic peaks",
      config: {
        chartKey: "orders_by_hour",
        xAxisKey: "name",
        dataKeys: ["orders"]
      }
    },
    {
      id: "food-table-1",
      type: "table",
      title: "Top Restaurants by Volume",
      config: {
        tableKey: "top_restaurants",
        columns: [
          { key: "name", label: "Restaurant" },
          { key: "orders", label: "Orders" },
          { key: "rating", label: "Rating" },
          { key: "status", label: "Status" }
        ]
      }
    },
    {
      id: "food-chart-2",
      type: "bar_chart",
      title: "Order Cancellations by Reason",
      config: {
        chartKey: "cancellations_by_reason",
        xAxisKey: "name",
        dataKeys: ["count"]
      }
    }
  ]
};

// 8. E-Commerce Store (conversion rate, daily orders, cart abandonment KPIs, Category stock chart)
export const ecommerceSchema: UISchema = {
  title: "Flipkart-style E-Commerce Store Dashboard",
  layout: "grid",
  widgets: [
    {
      id: "ecom-kpi-1",
      type: "kpi_card",
      title: "GMV Today",
      config: { key: "gmv_today" }
    },
    {
      id: "ecom-kpi-2",
      type: "kpi_card",
      title: "Daily Orders processed",
      config: { key: "daily_orders" }
    },
    {
      id: "ecom-kpi-3",
      type: "kpi_card",
      title: "Cart Abandonment Rate",
      config: { key: "cart_abandonment" }
    },
    {
      id: "ecom-kpi-4",
      type: "kpi_card",
      title: "Average Order Value",
      config: { key: "avg_order_value" }
    },
    {
      id: "ecom-chart-1",
      type: "bar_chart",
      title: "Sales Distribution by Category",
      config: {
        chartKey: "sales_by_category",
        xAxisKey: "name",
        dataKeys: ["sales"]
      }
    },
    {
      id: "ecom-table-1",
      type: "table",
      title: "Top-selling Products in India",
      config: {
        tableKey: "top_selling_products",
        columns: [
          { key: "name", label: "Product Name" },
          { key: "sales", label: "Sales" },
          { key: "stock", label: "In Stock" },
          { key: "price", label: "Price" }
        ]
      }
    },
    {
      id: "ecom-chart-2",
      type: "pie_chart",
      title: "Payment Method Split (UPI, COD, Card)",
      config: {
        chartKey: "payment_methods",
        xAxisKey: "name",
        dataKeys: ["value"]
      }
    }
  ]
};

export const fallbackSchemas: Record<string, UISchema> = {
  burn_rate: burnRateSchema,
  habit_tracker: habitTrackerSchema,
  sales_pipeline: salesPipelineSchema,
  rsvp: eventRSVPSchema,
  inventory: inventoryTrackerSchema,
  hospital: hospitalSchema,
  food_delivery: foodDeliverySchema,
  ecommerce: ecommerceSchema
};

export function getClosestFallbackSchema(prompt: string): UISchema {
  const clean = prompt.toLowerCase();
  
  if (clean.includes("burn rate") || clean.includes("startup") || clean.includes("runway") || clean.includes("burn") || clean.includes("cost") || clean.includes("financial") || clean.includes("expens")) {
    return burnRateSchema;
  }
  if (clean.includes("hospital") || clean.includes("clinic") || clean.includes("patient") || clean.includes("medical") || clean.includes("bed") || clean.includes("icu") || clean.includes("doctor")) {
    return hospitalSchema;
  }
  if (clean.includes("food delivery") || clean.includes("restaurant") || clean.includes("orders") || clean.includes("food") || clean.includes("delivery") || clean.includes("swiggy") || clean.includes("zomato") || clean.includes("courier")) {
    return foodDeliverySchema;
  }
  if (clean.includes("shopping") || clean.includes("ecommerce") || clean.includes("store") || clean.includes("gmv") || clean.includes("e-commerce") || clean.includes("commerce") || clean.includes("shop") || clean.includes("cart") || clean.includes("buyer") || clean.includes("online")) {
    return ecommerceSchema;
  }
  if (clean.includes("habit") || clean.includes("routine") || clean.includes("streak") || clean.includes("fitness") || clean.includes("train") || clean.includes("workout") || clean.includes("step")) {
    return habitTrackerSchema;
  }
  if (clean.includes("sale") || clean.includes("pipeline") || clean.includes("deal") || clean.includes("lead") || clean.includes("opportun") || clean.includes("board")) {
    return salesPipelineSchema;
  }
  if (clean.includes("rsvp") || clean.includes("event") || clean.includes("attend") || clean.includes("regist") || clean.includes("ticket") || clean.includes("guest")) {
    return eventRSVPSchema;
  }
  if (clean.includes("inventory") || clean.includes("stock") || clean.includes("sku") || clean.includes("warehouse")) {
    return inventoryTrackerSchema;
  }

  // Default fallback
  return burnRateSchema;
}
