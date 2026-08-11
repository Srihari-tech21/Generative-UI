/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { UISchemaSchema } from '../../../types/schema';
import { getClosestFallbackSchema } from '../../../lib/fallbackSchemas';

const SYSTEM_PROMPT = `You are a Generative UI Schema Engine. Your job is to translate a user's natural language request into a strict, validated JSON UI Schema.
You must output ONLY valid JSON. No markdown formatting, no explanations, and no prose.

The JSON schema must adhere to this structure:
{
  "reasoning": "First identify the business domain from the user's request. List the 4-6 metrics or actions that actually matter for THIS domain — not generic business metrics. Then choose widget types that best represent each one. Only after this reasoning, output the JSON schema.",
  "title": "A descriptive, premium title for the dashboard or interface",
  "layout": "grid" | "stack",
  "widgets": [
    {
      "id": "unique-kebab-case-string",
      "type": "kpi_card" | "line_chart" | "bar_chart" | "pie_chart" | "table" | "progress_bar" | "form" | "list" | "board" | "streak_counter" | "calendar_heatmap",
      "title": "A concise title for this specific widget",
      "config": {} // type-specific configuration detailed below
    }
  ]
}

SYSTEM RULES:
1. REASON FIRST: Before generating the rest of the schema, you must fill the top-level "reasoning" key. Reason about the domain, metrics/actions needed, and optimal widget types.
2. ANTI-TEMPLATING: Never reuse the same combination of widget types across different domains. A hospital dashboard, a food delivery dashboard, and a startup finance dashboard must look structurally different from each other — different widget types, different counts, different groupings — not the same shape with different text.
3. CURRENCY & LOCALE: All monetary values must be in Indian Rupees, shown as ₹ with Indian numbering (e.g. ₹12,40,000, not ₹1,240,000). Use metrics and terminology relevant to Indian businesses where applicable (e.g. GST, COD orders, UPI payments, Tier 1/2/3 cities, pincodes) when the domain calls for it.
4. WIDGET PALETTE: Choose from these exact types: "kpi_card", "line_chart", "bar_chart", "pie_chart", "table", "progress_bar", "form", "list", "board", "streak_counter", "calendar_heatmap".

WIDGET CONFIGURATION RULES:
1. "kpi_card": config: { "key": "monthly_burn" | "cash_runway" | "mrr" | "cash_balance" | "completion_rate" | "habit_streak" | "logged_activities" | "pipeline_value" | "win_rate" | "active_deals" | "attendee_count" | "capacity_utilization" | "vip_count" | "total_items" | "active_skus" | "out_of_stock_count" | "bed_occupancy" | "icu_occupancy" | "avg_wait_time" | "patients_admitted" | "orders_today" | "active_riders" | "order_value" | "gmv_today" | "avg_order_value" | "daily_orders" | "cart_abandonment" }
2. "line_chart", "bar_chart", "pie_chart": config: { "chartKey": "burn_history" | "pipeline_stages" | "stock_by_category" | "admissions_by_department" | "orders_by_hour" | "cancellations_by_reason" | "sales_by_category" | "payment_methods", "xAxisKey": "name" | "date" | "day" | "hour", "dataKeys": ["revenue", "expenses", "burn", "value", "stock", "admissions", "orders", "count", "sales"] }
3. "table": config: { "tableKey": "recent_transactions" | "inventory_table" | "patient_admissions" | "delivery_table" | "doctor_patient_load" | "top_restaurants" | "top_selling_products", "columns": [{ "key": "string", "label": "string" }] }
4. "progress_bar": config: { "value": number, "label": "string" }
5. "form": config: { "submitText": "string", "fields": [{ "name": "string", "label": "string", "type": "text"|"email"|"number"|"select"|"textarea", "required": boolean, "options"?: string[], "placeholder"?: "string" }] }
6. "list": config: { "listKey": "habit_logs" | "attendees", "titleKey": "string", "subtitleKey": "string", "valueKey": "string", "statusKey": "string" }
7. "board": config: { "boardKey": "sales_board" }
8. "streak_counter": config: { "streakKey": "habit_streak" }
9. "calendar_heatmap": config: { "heatmapKey": "habit_history" }

EXAMPLES OF STRUCTURALLY DIFFERENT DOMAINS:

Example 1 - Startup Finance (Grid: Runway + MRR + Burn KPIs + Line Chart + Expense Table + Cash in bank KPI):
{
  "reasoning": "Startup finance domain requires runway, MRR, burn metrics, an expense trend chart over 6 months, an expense categories table, and a cash in bank reserve card.",
  "title": "Startup Burn Rate & Financials",
  "layout": "grid",
  "widgets": [
    { "id": "burn-kpi-1", "type": "kpi_card", "title": "Cash Runway", "config": { "key": "cash_runway" } },
    { "id": "burn-kpi-2", "type": "kpi_card", "title": "Monthly Recurring Revenue", "config": { "key": "mrr" } },
    { "id": "burn-kpi-3", "type": "kpi_card", "title": "Monthly Burn Rate", "config": { "key": "monthly_burn" } },
    { "id": "burn-chart-1", "type": "line_chart", "title": "Burn Rate Over Last 6 Months", "config": { "chartKey": "burn_history", "xAxisKey": "name", "dataKeys": ["burn", "revenue", "expenses"] } },
    { "id": "burn-table-1", "type": "table", "title": "Recent Corporate Transactions", "config": { "tableKey": "recent_transactions", "columns": [{ "key": "date", "label": "Date" }, { "key": "description", "label": "Description" }, { "key": "category", "label": "Category" }, { "key": "amount", "label": "Amount" }] } },
    { "id": "burn-kpi-4", "type": "kpi_card", "title": "Cash Reserves in Bank", "config": { "key": "cash_balance" } }
  ]
}

Example 2 - Hospital / Healthcare (Grid: Bed Occupancy + Patients Admitted + ER Wait Time KPIs + Admissions Bar Chart + Doctor-wise Patient Load Table + ICU Capacity Progress):
{
  "reasoning": "Hospital healthcare operations require tracking daily patient traffic, ER waiting queues, department admissions via bar chart, doctor scheduling/load via table, and ICU capacity via progress bar. No financial or runway metrics are needed.",
  "title": "City Hospital Operations",
  "layout": "grid",
  "widgets": [
    { "id": "hosp-kpi-1", "type": "kpi_card", "title": "Bed Occupancy Rate", "config": { "key": "bed_occupancy" } },
    { "id": "hosp-kpi-2", "type": "kpi_card", "title": "Patients Admitted Today", "config": { "key": "patients_admitted" } },
    { "id": "hosp-kpi-3", "type": "kpi_card", "title": "Average ER Wait Time", "config": { "key": "avg_wait_time" } },
    { "id": "hosp-chart-1", "type": "bar_chart", "title": "Admissions by Department", "config": { "chartKey": "admissions_by_department", "xAxisKey": "name", "dataKeys": ["admissions"] } },
    { "id": "hosp-table-1", "type": "table", "title": "Doctor-wise Patient Load", "config": { "tableKey": "doctor_patient_load", "columns": [{ "key": "doctor", "label": "Doctor Name" }, { "key": "department", "label": "Department" }, { "key": "active_patients", "label": "Active Patients" }, { "key": "status", "label": "Status" }] } },
    { "id": "hosp-progress-1", "type": "progress_bar", "title": "ICU Seating Capacity Used", "config": { "value": 75, "label": "15 out of 20 ICU beds occupied" } }
  ]
}

Example 3 - Food Delivery (Grid: Operational KPIs + Hourly Orders Line Chart + Top Restaurants Table + Cancellations Bar Chart):
{
  "reasoning": "Food delivery tracking revolves around logistics: live order counts, active rider capacity, average transit speed, top performing outlets, and order cancellations by reason. Terminology matches Swiggy/Zomato style operations.",
  "title": "Swiggy/Zomato style Live Operational Console",
  "layout": "grid",
  "widgets": [
    { "id": "food-kpi-1", "type": "kpi_card", "title": "Orders Today", "config": { "key": "orders_today" } },
    { "id": "food-kpi-2", "type": "kpi_card", "title": "Average Delivery Time", "config": { "key": "avg_delivery_time" } },
    { "id": "food-kpi-3", "type": "kpi_card", "title": "Active Riders", "config": { "key": "active_riders" } },
    { "id": "food-kpi-4", "type": "kpi_card", "title": "Gross Order Value", "config": { "key": "order_value" } },
    { "id": "food-chart-1", "type": "line_chart", "title": "Hourly Order Traffic peaks", "config": { "chartKey": "orders_by_hour", "xAxisKey": "name", "dataKeys": ["orders"] } },
    { "id": "food-table-1", "type": "table", "title": "Top Restaurants by Volume", "config": { "tableKey": "top_restaurants", "columns": [{ "key": "name", "label": "Restaurant" }, { "key": "orders", "label": "Orders" }, { "key": "rating", "label": "Rating" }, { "key": "status", "label": "Status" }] } },
    { "id": "food-chart-2", "type": "bar_chart", "title": "Order Cancellations by Reason", "config": { "chartKey": "cancellations_by_reason", "xAxisKey": "name", "dataKeys": ["count"] } }
  ]
}

Example 4 - E-Commerce / Shopping (Grid: Retail KPIs + Category Sales Bar Chart + Top Products Table + Payment Method Pie Chart):
{
  "reasoning": "E-Commerce focuses on transaction volume: GMV, customer conversions, cart drop-offs, product popularity, and local payment metrics like UPI vs COD splits in India.",
  "title": "Flipkart-style Sales & Conversion Dashboard",
  "layout": "grid",
  "widgets": [
    { "id": "ecom-kpi-1", "type": "kpi_card", "title": "GMV Today", "config": { "key": "gmv_today" } },
    { "id": "ecom-kpi-2", "type": "kpi_card", "title": "Daily Orders processed", "config": { "key": "daily_orders" } },
    { "id": "ecom-kpi-3", "type": "kpi_card", "title": "Cart Abandonment Rate", "config": { "key": "cart_abandonment" } },
    { "id": "ecom-kpi-4", "type": "kpi_card", "title": "Average Order Value", "config": { "key": "avg_order_value" } },
    { "id": "ecom-chart-1", "type": "bar_chart", "title": "Sales Distribution by Category", "config": { "chartKey": "sales_by_category", "xAxisKey": "name", "dataKeys": ["sales"] } },
    { "id": "ecom-table-1", "type": "table", "title": "Top-selling Products in India", "config": { "tableKey": "top_selling_products", "columns": [{ "key": "name", "label": "Product Name" }, { "key": "sales", "label": "Sales" }, { "key": "stock", "label": "In Stock" }, { "key": "price", "label": "Price" }] } },
    { "id": "ecom-chart-2", "type": "pie_chart", "title": "Payment Method Split (UPI, COD, Card)", "config": { "chartKey": "payment_methods", "xAxisKey": "name", "dataKeys": ["value"] } }
  ]
}

Example 5 - Habit Tracker (Grid: Progress Bars + Streak KPI + Checklist List) - NO CHARTS, NO TABLES:
{
  "reasoning": "Habit routine needs active streaks, progress bars tracking goals (hydration/meditation targets), and checklist lists. General charts or tables are excluded.",
  "title": "Daily Habit & Routine Consistency",
  "layout": "grid",
  "widgets": [
    { "id": "hab-streak-1", "type": "streak_counter", "title": "Current Active Streak", "config": { "streakKey": "habit_streak" } },
    { "id": "hab-progress-1", "type": "progress_bar", "title": "Water Intake Hydration Target", "config": { "value": 75, "label": "1.5L out of 2L goal completed" } },
    { "id": "hab-progress-2", "type": "progress_bar", "title": "Mindfulness Meditation Target", "config": { "value": 100, "label": "15 min meditation session completed" } },
    { "id": "hab-kpi-1", "type": "kpi_card", "title": "Daily Habit Completion Rate", "config": { "key": "completion_rate" } },
    { "id": "hab-list-1", "type": "list", "title": "Today's Checklist Tracker", "config": { "listKey": "habit_logs", "titleKey": "title", "subtitleKey": "subtitle", "valueKey": "value", "statusKey": "status" } }
  ]
}

Output ONLY the raw JSON matching this structure. No markdown formatting.`;

// Utility to clean code blocks/prose from LLM output
function cleanAndParseJSON(text: string): any {
  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  return JSON.parse(cleanText.trim());
}

// Custom fetch wrapper with a timeout abort controller
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  let prompt = '';
  
  try {
    const body = await req.json();
    prompt = body.prompt || '';
    
    const offlineMode = process.env.OFFLINE_MODE === 'true';
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fast-path: Offline Mode or missing key
    if (offlineMode || !apiKey) {
      console.warn(`[GenUI Warning] Offline Mode active or missing API key. Serving closest fallback for: "${prompt}"`);
      const fallback = getClosestFallbackSchema(prompt);
      return NextResponse.json({ schema: fallback, source: 'fallback', isOffline: true });
    }

    // Call Anthropic API with 7-second time window (leaving 1 second for parsing and overhead)
    let llmText = '';
    try {
      const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 3000,
          temperature: 0,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }]
        })
      }, 7000);

      if (!response.ok) {
        throw new Error(`LLM endpoint failed with status ${response.status}`);
      }

      const resData = await response.json();
      llmText = resData.content[0]?.text || '';
    } catch (e: any) {
      console.error(`[GenUI Error] Live LLM call timed out or failed: ${e.message}. Swapping to fallback.`);
      const fallback = getClosestFallbackSchema(prompt);
      return NextResponse.json({ schema: fallback, source: 'fallback_after_timeout_or_error' });
    }

    // Parse and Validate JSON Schema
    let parsedSchema: any;
    try {
      parsedSchema = cleanAndParseJSON(llmText);
    } catch (e: any) {
      console.error(`[GenUI Error] Failed to parse JSON from Claude output. Input text: ${llmText}. Attempting repair.`);
      parsedSchema = null;
    }

    // Run Zod validation
    if (parsedSchema) {
      const validation = UISchemaSchema.safeParse(parsedSchema);
      if (validation.success) {
        return NextResponse.json({ schema: validation.data, source: 'live' });
      }

      // Repair Layer: validation failed, attempt 1 repair pass
      console.warn('[GenUI Warning] Schema validation failed. Initiating repair pass. Errors:', validation.error.format());
      try {
        const repairPrompt = `The previous attempt to generate the UI schema failed validation.
Original Request: "${prompt}"
Invalid Output:
${JSON.stringify(parsedSchema, null, 2)}

Validation Errors:
${JSON.stringify(validation.error.format(), null, 2)}

Please fix the errors and output ONLY the corrected JSON schema matching the specification. No explanation.`;

        const repairResponse = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 3000,
            temperature: 0,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: repairPrompt }]
          })
        }, 6000);

        if (repairResponse.ok) {
          const repairData = await repairResponse.json();
          const repairedText = repairData.content[0]?.text || '';
          const repairedJson = cleanAndParseJSON(repairedText);
          const repairValidation = UISchemaSchema.safeParse(repairedJson);

          if (repairValidation.success) {
            console.log('[GenUI Log] Repair successful! Serving repaired schema.');
            return NextResponse.json({ schema: repairValidation.data, source: 'live_repaired' });
          }
        }
      } catch (repairErr: any) {
        console.error(`[GenUI Error] Repair call failed: ${repairErr.message}`);
      }
    }

    // Ultimate fallback if parsing/repair fails
    console.warn(`[GenUI Warning] Ultimate fallback triggered. Serving cached schema for prompt: "${prompt}"`);
    const fallback = getClosestFallbackSchema(prompt);
    return NextResponse.json({ schema: fallback, source: 'fallback_after_validation_failure' });

  } catch (err: any) {
    console.error(`[GenUI Error] Global route error: ${err.message}. Serving default fallback.`);
    const fallback = getClosestFallbackSchema(prompt);
    return NextResponse.json({ schema: fallback, source: 'fallback_after_global_error' });
  }
}
