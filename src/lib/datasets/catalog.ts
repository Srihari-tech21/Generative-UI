import { IndustryDefinition, DatasetCatalogItem, IndustryId } from './datasetTypes';

export const INDUSTRIES_REGISTRY: IndustryDefinition[] = [
  {
    id: 'restaurants',
    name: 'Restaurants & Food Services',
    tagline: 'Point-of-Sale, Guest Orders & Kitchen Inventory',
    description: 'Order velocity, Average Order Value (AOV), menu item sales, table utilization, and pantry inventory tracking.',
    iconName: 'Utensils',
    color: '#f97316',
    benchmarkMetric: 'Average Order Value (AOV)'
  },
  {
    id: 'business',
    name: 'Business & Enterprise',
    tagline: 'Corporate Financials, Operating Ledgers & Staff KPI',
    description: 'Monthly business revenue, department expense variances, and workforce efficiency appraisal rosters.',
    iconName: 'Briefcase',
    color: '#3b82f6',
    benchmarkMetric: 'Operating Margin & Net Profit'
  },
  {
    id: 'theatres',
    name: 'Movie Theatres & Entertainment',
    tagline: 'Box Office, Screen Occupancy & Ticket Admissions',
    description: 'Show-wise seat occupancy %, genre box office gross, time-slot demand, and ticketing transactions.',
    iconName: 'Film',
    color: '#a855f7',
    benchmarkMetric: 'Seat Occupancy Rate %'
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Hospitals',
    tagline: 'Outpatient Care, Inpatient Beds & Medical Billing',
    description: 'Department patient volumes, bed occupancy rates, appointment status, and patient billing ledgers.',
    iconName: 'Activity',
    color: '#ef4444',
    benchmarkMetric: 'Bed Occupancy & Length of Stay'
  },
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    tagline: 'Omnichannel POS, Stock Levels & Customer CLV',
    description: 'In-store and web transactions, SKU inventory reorder alerts, and customer lifetime value cohorts.',
    iconName: 'ShoppingBag',
    color: '#10b981',
    benchmarkMetric: 'Inventory Turnover & CLV'
  },
  {
    id: 'education',
    name: 'Education & Institutions',
    tagline: 'Academic Scorecards, Cohort Attendance & Courses',
    description: 'Subject-wise marks distributions, student attendance percentages, and department course enrollments.',
    iconName: 'GraduationCap',
    color: '#06b6d4',
    benchmarkMetric: 'Cohort Pass Rate & Attendance %'
  },
  {
    id: 'hotels',
    name: 'Hotels & Hospitality',
    tagline: 'Room Bookings, RevPAR, ADR & Property Income',
    description: 'Nightly room occupancy %, Average Daily Rate (ADR), Revenue per Available Room (RevPAR), and NOI.',
    iconName: 'Hotel',
    color: '#eab308',
    benchmarkMetric: 'RevPAR & Nightly Occupancy'
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    tagline: 'Freight Shipments, On-Time Delivery & Route Costs',
    description: 'Carrier on-time reliability %, multi-modal shipment status, transit time deltas, and fuel/toll expenses.',
    iconName: 'Truck',
    color: '#6366f1',
    benchmarkMetric: 'On-Time Delivery Rate %'
  },
  {
    id: 'banking',
    name: 'Banking & Finance',
    tagline: 'Credit Risk, Transaction Ledgers & Deposit Yields',
    description: 'Loan portfolios, non-performing loans (NPL %), multi-channel payment flows, and term deposit maturities.',
    iconName: 'Landmark',
    color: '#14b8a6',
    benchmarkMetric: 'NPL % & Net Interest Margin'
  },
  {
    id: 'fitness',
    name: 'Fitness & Gyms',
    tagline: 'Gym Subscriptions, MRR, Churn & Facility Traffic',
    description: 'Monthly Recurring Revenue (MRR), subscriber churn %, member check-in hours, and plan tier breakdown.',
    iconName: 'Dumbbell',
    color: '#ec4899',
    benchmarkMetric: 'Monthly Recurring Revenue (MRR)'
  },
  {
    id: 'energy',
    name: 'Energy & Utilities',
    tagline: 'Grid Consumption, Generation Mix & Power Billing',
    description: 'Hourly kWh load profiles, solar/wind capacity factors, thermal emissions, and utility tariff billing.',
    iconName: 'Zap',
    color: '#84cc16',
    benchmarkMetric: 'Peak Demand (kW) & Capacity Factor'
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    tagline: 'Crop Yields, Mandi Market Prices & Rain Anomalies',
    description: 'State harvest tonnages, crop yield per hectare, APMC market commodity prices, and rainfall correlation.',
    iconName: 'Wheat',
    color: '#8b5cf6',
    benchmarkMetric: 'Crop Yield (kg/ha) & Modal Price'
  }
];

export const DATASETS_CATALOG: DatasetCatalogItem[] = [
  // 1. RESTAURANTS
  {
    id: 'restaurant_sales',
    name: 'Restaurant Menu Item Sales & Revenue',
    industry: 'restaurants',
    industryName: 'Restaurants & Food Services',
    description: 'Itemized dining sales register capturing dish quantities, unit pricing, gross revenue, and culinary categories.',
    filePath: '/datasets/restaurants/restaurant_sales.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['item_id', 'item_name', 'category', 'price', 'quantity', 'total_revenue', 'order_date'],
    supportedMetrics: ['Total Revenue', 'Order Volume', 'Top-Selling Items', 'Category Breakdown'],
    samplePrompts: [
      'Analyze restaurant revenue and best-selling menu items',
      'Show dish sales breakdown by culinary category',
      'Evaluate top food revenue generators'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Hospitality Benchmark (Validated Mathematical Model)',
    limitations: 'Synthesized point-of-sale dataset. Numerical quantities and prices reconciled mathematically.',
    freshness: 'Static benchmark ledger (February 2025 cycle)',
    observationPeriod: '15 itemized sales entries across 5 categories'
  },
  {
    id: 'restaurant_orders',
    name: 'Restaurant Guest Order Transactions',
    industry: 'restaurants',
    industryName: 'Restaurants & Food Services',
    description: 'Ticket-level order transactions covering dine-in table allocations, takeaway tickets, delivery fees, and payment channels.',
    filePath: '/datasets/restaurants/restaurant_orders.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['order_id', 'customer_name', 'order_type', 'table_number', 'items_count', 'subtotal', 'tax', 'total_amount', 'payment_mode', 'order_date'],
    supportedMetrics: ['Average Order Value (AOV)', 'Dine-In vs Delivery Split', 'Payment Mode Share', 'Gross Bill Volume'],
    samplePrompts: [
      'Calculate Average Order Value (AOV) and payment mode distribution',
      'Compare dine-in versus takeaway order totals',
      'Analyze restaurant guest order velocity'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Hospitality Benchmark',
    limitations: 'Calculations run in-memory; total bill verified as subtotal + tax.',
    freshness: 'Static benchmark ledger',
    observationPeriod: '15 customer orders across multiple tables and channels'
  },
  {
    id: 'restaurant_inventory',
    name: 'Kitchen Pantry & Ingredient Inventory',
    industry: 'restaurants',
    industryName: 'Restaurants & Food Services',
    description: 'Pantry inventory tracking current stock on hand, reorder thresholds, supplier contracts, and inventory balance values.',
    filePath: '/datasets/restaurants/restaurant_inventory.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['ingredient_id', 'ingredient_name', 'category', 'current_stock', 'unit', 'reorder_level', 'unit_cost', 'total_value', 'supplier'],
    supportedMetrics: ['Total Inventory Capital', 'Reorder Alerts', 'Category Stock Valuation', 'Supplier Allocation'],
    samplePrompts: [
      'Show restaurant pantry stock valuation and reorder levels',
      'Identify ingredients approaching safety stock threshold',
      'Analyze raw food supply costs by category'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Hospitality Benchmark',
    limitations: 'In-memory valuation equals current stock multiplied by unit purchase cost.',
    freshness: 'Static benchmark ledger',
    observationPeriod: '15 primary culinary ingredient records'
  },

  // 2. BUSINESS
  {
    id: 'business_revenue',
    name: 'Business Unit Revenue & Sales Performance',
    industry: 'business',
    industryName: 'Business & Enterprise',
    description: 'Multi-division enterprise revenue accounts tracking Cloud Infrastructure, Enterprise Software, and Cybersecurity product lines.',
    filePath: '/datasets/business/business_revenue.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['month', 'business_unit', 'product_line', 'gross_revenue', 'discounts', 'net_revenue', 'target_revenue'],
    supportedMetrics: ['Net Revenue Growth', 'Quota Attainment %', 'Discount Rate Impact', 'Division Performance'],
    samplePrompts: [
      'Analyze enterprise revenue trajectory across business units',
      'Compare software vs cloud infrastructure revenue growth',
      'Evaluate quarterly sales target achievement'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Enterprise Financials',
    limitations: 'Net revenue strictly reconciled as gross revenue minus discounts.',
    freshness: 'Monthly recurring series (Q1-Q2 2025)',
    observationPeriod: '15 monthly division product line records'
  },
  {
    id: 'business_expenses',
    name: 'Departmental Expense & Budget Variance',
    industry: 'business',
    industryName: 'Business & Enterprise',
    description: 'Departmental operational cost allocation tracking Engineering, Marketing, Sales, and Operations against statutory budgets.',
    filePath: '/datasets/business/business_expenses.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['expense_id', 'department', 'category', 'amount', 'budget_allocated', 'variance', 'month'],
    supportedMetrics: ['Budget Variance', 'Department Expense Run-Rate', 'Over-Budget Alerts', 'Cost Breakdown'],
    samplePrompts: [
      'Show corporate operating expenses and budget variance',
      'Identify departments exceeding assigned budget ceilings',
      'Analyze cloud hosting and marketing campaign expenditures'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Enterprise Financials',
    limitations: 'Variance computed as budget minus actual expense.',
    freshness: 'Quarterly financial ledger',
    observationPeriod: '15 departmental cost ledger entries'
  },
  {
    id: 'employee_performance',
    name: 'Workforce Performance & Efficiency Directory',
    industry: 'business',
    industryName: 'Business & Enterprise',
    description: 'Employee appraisal records covering projects completed, efficiency indexes, stakeholder satisfaction ratings, and salary tiers.',
    filePath: '/datasets/business/employee_performance.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['employee_id', 'full_name', 'department', 'role', 'projects_completed', 'efficiency_score', 'satisfaction_rating', 'annual_salary'],
    supportedMetrics: ['Average Efficiency Score', 'Headcount by Department', 'Salary Scale Distribution', 'Top Performers'],
    samplePrompts: [
      'Analyze employee performance by department',
      'Show salary distribution and project delivery scores',
      'Identify top-rated engineering and sales personnel'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic HR Benchmark',
    limitations: 'Appraisal metrics scored out of 5.0 scale.',
    freshness: 'Annual performance cycle',
    observationPeriod: '15 employee performance records'
  },

  // 3. MOVIE THEATRES
  {
    id: 'theatre_bookings',
    name: 'Cinema Ticket Bookings & Box Office',
    industry: 'theatres',
    industryName: 'Movie Theatres & Entertainment',
    description: 'Auditorium booking records tracking seat volume, ticket tiers, show timings, and gross collection amounts.',
    filePath: '/datasets/theatres/theatre_bookings.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['booking_id', 'movie_title', 'screen_number', 'show_time', 'tickets_booked', 'ticket_price', 'total_booking_amount', 'payment_status', 'booking_date'],
    supportedMetrics: ['Total Box Office Gross', 'Tickets Sold', 'Average Ticket Price', 'Screen Velocity'],
    samplePrompts: [
      'Analyze cinema box office bookings and ticket revenue',
      'Compare evening vs matinee show booking volumes',
      'Show ticket sales by movie title'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Entertainment Benchmark',
    limitations: 'Booking total calculated as tickets booked multiplied by ticket price.',
    freshness: 'Daily theatrical register',
    observationPeriod: '15 ticket booking transactions'
  },
  {
    id: 'movie_performance',
    name: 'Film Box Office & Critical Performance',
    industry: 'theatres',
    industryName: 'Movie Theatres & Entertainment',
    description: 'Aggregated movie catalog analytics evaluating total shows, total admissions, gross revenue, and occupancy percentages.',
    filePath: '/datasets/theatres/movie_performance.csv',
    format: 'csv',
    recordCount: 8,
    columns: ['movie_id', 'title', 'genre', 'total_shows', 'total_admissions', 'gross_box_office', 'average_occupancy_pct', 'critic_rating'],
    supportedMetrics: ['Box Office Leaderboard', 'Genre Revenue Share', 'Average Occupancy %', 'Attendance per Show'],
    samplePrompts: [
      'Analyze movie box office performance and occupancy rates',
      'Compare sci-fi and action genre earnings',
      'Rank top-grossing films across all screens'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Entertainment Benchmark',
    limitations: 'Gross box office represents cumulative show receipts.',
    freshness: 'Weekly theatrical release ledger',
    observationPeriod: '8 feature films across 4 genres'
  },
  {
    id: 'show_occupancy',
    name: 'Auditorium Screen Occupancy & Capacity Utilization',
    industry: 'theatres',
    industryName: 'Movie Theatres & Entertainment',
    description: 'Screen-level capacity records evaluating seating capacity, seats sold, occupancy rate %, and time-slot yields.',
    filePath: '/datasets/theatres/show_occupancy.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['show_id', 'movie_title', 'screen', 'show_date', 'time_slot', 'capacity', 'seats_sold', 'occupancy_rate_pct', 'ticket_revenue'],
    supportedMetrics: ['Average Occupancy Rate %', 'IMAX Screen Yield', 'Prime-Time Occupancy', 'Unsold Capacity'],
    samplePrompts: [
      'Analyze theatre occupancy rate across show times',
      'Compare IMAX screen utilization versus standard auditoriums',
      'Evaluate weekend night show seat demand'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Entertainment Benchmark',
    limitations: 'Occupancy rate mathematically bounded by auditorium physical seat capacity.',
    freshness: 'Multi-day show timetable',
    observationPeriod: '15 auditorium screening sessions'
  },

  // 4. HEALTHCARE & HOSPITALS
  {
    id: 'hospital_appointments',
    name: 'Outpatient Clinic Appointments & Patient Consultations',
    industry: 'healthcare',
    industryName: 'Healthcare & Hospitals',
    description: 'Doctor outpatient schedules tracking medical specialty, patient checkups, consultation fees, and appointment status.',
    filePath: '/datasets/healthcare/hospital_appointments.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['appointment_id', 'patient_id', 'department', 'doctor_name', 'appointment_date', 'appointment_type', 'status', 'consultation_fee'],
    supportedMetrics: ['Appointment Completion Rate', 'Cancellation & No-Show %', 'Consultation Fee Total', 'Department Volume'],
    samplePrompts: [
      'Analyze outpatient hospital appointments and consultation revenue',
      'Calculate appointment cancellation and no-show rate',
      'Compare patient visit volume by medical department'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Clinical Benchmark (HIPAA-Safe Synthetic Model)',
    limitations: 'Zero real patient health identifiers (PHI); fully synthetic clinical ledger.',
    freshness: 'Daily clinic schedule',
    observationPeriod: '15 outpatient appointment records'
  },
  {
    id: 'hospital_department_metrics',
    name: 'Hospital Inpatient Capacity & Bed Occupancy',
    industry: 'healthcare',
    industryName: 'Healthcare & Hospitals',
    description: 'Inpatient ward metrics detailing doctor staffing, available vs occupied beds, bed occupancy %, and average length of stay (ALOS).',
    filePath: '/datasets/healthcare/hospital_department_metrics.csv',
    format: 'csv',
    recordCount: 8,
    columns: ['department', 'doctors_count', 'beds_available', 'beds_occupied', 'occupancy_rate_pct', 'monthly_admissions', 'avg_length_of_stay_days'],
    supportedMetrics: ['Hospital Bed Occupancy Rate', 'Average Length of Stay (ALOS)', 'ICU & Oncology Pressure', 'Total Available Capacity'],
    samplePrompts: [
      'Compare hospital departments by bed occupancy rate',
      'Analyze ICU and cardiology patient admission volume',
      'Evaluate average length of stay across inpatient wards'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Clinical Benchmark',
    limitations: 'Occupancy rate computed strictly as beds occupied divided by total beds available.',
    freshness: 'Monthly hospital census',
    observationPeriod: '8 specialized clinical departments'
  },
  {
    id: 'hospital_billing',
    name: 'Patient Inpatient Billing & Insurance Claims',
    industry: 'healthcare',
    industryName: 'Healthcare & Hospitals',
    description: 'Hospital discharge financial records tracking medical treatments, pharmacy charges, room costs, insurance payouts, and co-pays.',
    filePath: '/datasets/healthcare/hospital_billing.csv',
    format: 'csv',
    recordCount: 10,
    columns: ['bill_id', 'patient_name', 'department', 'admission_date', 'discharge_date', 'treatment_charges', 'pharmacy_charges', 'room_charges', 'total_billed', 'insurance_covered', 'patient_payable'],
    supportedMetrics: ['Total Inpatient Billing', 'Insurance Reimbursement Ratio', 'Out-of-Pocket Share', 'Average Bill per Patient'],
    samplePrompts: [
      'Analyze hospital billing summaries and insurance coverage ratios',
      'Compare treatment charges across surgical and ICU admissions',
      'Show patient out-of-pocket payment distribution'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Clinical Benchmark',
    limitations: 'Total billed reconciled as treatment + pharmacy + room charges.',
    freshness: 'Monthly hospital billing accounts',
    observationPeriod: '10 inpatient admission discharge summaries'
  },

  // 5. RETAIL & E-COMMERCE
  {
    id: 'retail_transactions',
    name: 'Omnichannel Retail Transactions & Basket Analysis',
    industry: 'retail',
    industryName: 'Retail & E-commerce',
    description: 'Point-of-sale customer checkout logs comparing flagship physical stores, shopping mall outlets, and online web channels.',
    filePath: '/datasets/retail/retail_transactions.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['transaction_id', 'customer_id', 'store_location', 'channel', 'items_count', 'transaction_value', 'discount_applied', 'net_paid', 'payment_type', 'transaction_date'],
    supportedMetrics: ['Gross Transaction Value', 'Net Revenue Realized', 'Channel Sales Split', 'Discount Impact %'],
    samplePrompts: [
      'Compare omnichannel retail sales between in-store and e-commerce',
      'Analyze average basket value and payment methods',
      'Show store location revenue performance'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Retail Benchmark',
    limitations: 'Net paid mathematically reconciled as transaction value minus discount applied.',
    freshness: 'Daily transaction register',
    observationPeriod: '15 retail checkout transactions'
  },
  {
    id: 'product_inventory',
    name: 'Retail SKU Inventory & Stock Levels',
    industry: 'retail',
    industryName: 'Retail & E-commerce',
    description: 'Merchandise warehouse inventory tracking unit costs, retail prices, stock on hand, safety thresholds, and inventory capital.',
    filePath: '/datasets/retail/product_inventory.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['sku', 'product_name', 'category', 'stock_on_hand', 'safety_stock', 'unit_cost', 'retail_price', 'inventory_value', 'stock_status'],
    supportedMetrics: ['Inventory Capital Valuation', 'Low-Stock Reorder Alerts', 'Category Inventory Share', 'Gross Margin Potential'],
    samplePrompts: [
      'Show retail inventory valuation and safety stock status',
      'Identify products requiring immediate stock replenishment',
      'Analyze merchandise capital distribution across categories'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Retail Benchmark',
    limitations: 'Inventory value computed as stock on hand multiplied by unit acquisition cost.',
    freshness: 'Daily warehouse inventory ledger',
    observationPeriod: '15 merchandise SKUs across 5 retail categories'
  },
  {
    id: 'customer_purchases',
    name: 'Customer Lifetime Value & Purchasing Segments',
    industry: 'retail',
    industryName: 'Retail & E-commerce',
    description: 'Customer purchasing history records categorizing buyers into VIP High Value, Regular Consumers, and Bargain Seekers.',
    filePath: '/datasets/retail/customer_purchases.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['customer_id', 'segment', 'total_orders', 'lifetime_spend', 'avg_basket_value', 'last_purchase_days_ago', 'loyalty_tier'],
    supportedMetrics: ['Customer Lifetime Value (CLV)', 'Average Basket Size', 'Loyalty Tier Share', 'Recency Cohort Split'],
    samplePrompts: [
      'Analyze customer lifetime value and purchasing segments',
      'Compare VIP Platinum spend against regular retail buyers',
      'Show order frequency and basket value distribution'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Retail Benchmark',
    limitations: 'Average basket value calculated as lifetime spend divided by total order count.',
    freshness: 'Customer CRM snapshot',
    observationPeriod: '15 customer purchasing profiles'
  },

  // 6. EDUCATION & INSTITUTIONS
  {
    id: 'student_performance',
    name: 'Student Examination & Subject Performance',
    industry: 'education',
    industryName: 'Education & Institutions',
    description: 'Standardized assessment scorecard evaluating marks across Mathematics, Science, English, and History with pass classifications.',
    filePath: '/datasets/education/student_performance.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['student_id', 'student_name', 'grade_level', 'mathematics', 'science', 'english', 'history', 'average_score', 'pass_status'],
    supportedMetrics: ['Class Average Score', 'Cohort Pass Rate %', 'Subject-Wise Grade Distribution', 'Valedictorian Rank'],
    samplePrompts: [
      'Analyze student academic performance and subject scores',
      'Calculate class pass percentage and top student rankings',
      'Compare performance between mathematics and science'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Academic Benchmark',
    limitations: 'Pass threshold standardized at 40%; average score reconciled across all 4 core subjects.',
    freshness: 'Semester 1 assessment ledger',
    observationPeriod: '15 student academic scorecards'
  },
  {
    id: 'student_attendance',
    name: 'Student Classroom Attendance & Absenteeism',
    industry: 'education',
    industryName: 'Education & Institutions',
    description: 'Statutory school attendance logs tracking enrolled days, days present, unexcused absences, and attendance percentages.',
    filePath: '/datasets/education/student_attendance.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['student_id', 'student_name', 'grade', 'total_school_days', 'days_present', 'days_absent', 'attendance_percentage'],
    supportedMetrics: ['Cohort Attendance %', 'Chronic Absenteeism Rate', 'Days Present Summary', 'Attendance Distribution'],
    samplePrompts: [
      'Show student attendance trends and absenteeism rates',
      'Identify students falling below 85% attendance compliance',
      'Analyze classroom present days across term'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Academic Benchmark',
    limitations: 'Attendance percentage calculated strictly as days present divided by total days.',
    freshness: 'Term attendance census',
    observationPeriod: '15 student attendance records over 90 school days'
  },
  {
    id: 'course_enrollment',
    name: 'University Course Enrollment & Completion Rates',
    industry: 'education',
    industryName: 'Education & Institutions',
    description: 'Higher education department course register evaluating student enrollments, course capacity limits, and completion rates.',
    filePath: '/datasets/education/course_enrollment.csv',
    format: 'csv',
    recordCount: 8,
    columns: ['course_id', 'course_title', 'department', 'capacity', 'enrolled_students', 'completion_rate_pct', 'credits', 'instructor'],
    supportedMetrics: ['Total University Enrollments', 'Capacity Utilization %', 'Course Completion Rate', 'Department Popularity'],
    samplePrompts: [
      'Analyze university course enrollments and capacity limits',
      'Compare completion rates between computer science and economics',
      'Show student course distribution by academic department'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Academic Benchmark',
    limitations: 'Enrolled students cannot exceed maximum course capacity.',
    freshness: 'Academic semester timetable',
    observationPeriod: '8 university departmental courses'
  },

  // 7. HOTELS & HOSPITALITY
  {
    id: 'hotel_bookings',
    name: 'Hotel Guest Reservations & Folio Billings',
    industry: 'hotels',
    industryName: 'Hotels & Hospitality',
    description: 'Property reservation ledger tracking room categories, nightly rates, length of stay, service fees, and booking confirmations.',
    filePath: '/datasets/hotels/hotel_bookings.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['booking_ref', 'guest_name', 'room_type', 'nights', 'room_rate_per_night', 'total_room_charge', 'service_fee', 'grand_total', 'booking_status'],
    supportedMetrics: ['Total Reservation Revenue', 'Average Length of Stay', 'Room Type Share', 'Cancellation Rate'],
    samplePrompts: [
      'Analyze hotel bookings and reservation revenue',
      'Compare suite bookings versus standard room nights',
      'Calculate average room charge per guest stay'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Hospitality Benchmark',
    limitations: 'Grand total equals (nights * nightly rate) + service fee.',
    freshness: 'Daily front desk folio register',
    observationPeriod: '15 guest reservation folios'
  },
  {
    id: 'room_occupancy',
    name: 'Hotel Daily Room Occupancy, ADR & RevPAR',
    industry: 'hotels',
    industryName: 'Hotels & Hospitality',
    description: 'Hotel property operational indicators measuring occupied rooms, occupancy rate %, Average Daily Rate (ADR), and RevPAR yield.',
    filePath: '/datasets/hotels/room_occupancy.csv',
    format: 'csv',
    recordCount: 10,
    columns: ['date', 'total_rooms', 'rooms_occupied', 'rooms_maintenance', 'occupancy_rate_pct', 'adr', 'revpar'],
    supportedMetrics: ['Average Daily Rate (ADR)', 'Revenue per Available Room (RevPAR)', 'Occupancy Rate %', 'Weekend Yield Spike'],
    samplePrompts: [
      'Analyze hotel room occupancy trends and RevPAR performance',
      'Evaluate Average Daily Rate (ADR) during peak weekends',
      'Show room inventory utilization and maintenance counts'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Hospitality Benchmark',
    limitations: 'RevPAR mathematically verified as ADR multiplied by Occupancy Rate %.',
    freshness: 'Daily hotel night audit series',
    observationPeriod: '10 operational days across a 150-room boutique resort'
  },
  {
    id: 'hotel_revenue',
    name: 'Hotel Revenue Centers & Net Operating Income',
    industry: 'hotels',
    industryName: 'Hotels & Hospitality',
    description: 'Departmental hospitality income statement tracking room revenues, food & beverage (F&B), spa events, and net operating income.',
    filePath: '/datasets/hotels/hotel_revenue.csv',
    format: 'csv',
    recordCount: 6,
    columns: ['month', 'room_revenue', 'food_beverage_revenue', 'spa_events_revenue', 'total_gross_revenue', 'operating_expenses', 'net_operating_income'],
    supportedMetrics: ['Gross Hospitality Revenue', 'Net Operating Income (NOI)', 'F&B Revenue Share', 'Operating Expense Ratio'],
    samplePrompts: [
      'Show hotel revenue centers and net operating income',
      'Compare room revenue against food and beverage earnings',
      'Evaluate monthly operating profit margins'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Hospitality Benchmark',
    limitations: 'Net operating income reconciled as gross revenue minus operating expenses.',
    freshness: 'Monthly general manager profit ledger',
    observationPeriod: '6 consecutive financial months'
  },

  // 8. LOGISTICS & TRANSPORTATION
  {
    id: 'delivery_performance',
    name: 'Courier Delivery Performance & SLA Reliability',
    industry: 'logistics',
    industryName: 'Logistics & Transportation',
    description: 'Last-mile courier fulfillment tracking promised transit hours, actual delivery duration, SLA status, and delivery costs.',
    filePath: '/datasets/logistics/delivery_performance.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['delivery_id', 'order_id', 'destination_city', 'carrier', 'promised_hours', 'actual_hours', 'delivery_status', 'on_time_flag', 'delivery_cost'],
    supportedMetrics: ['On-Time Delivery Rate %', 'Average Transit Hours', 'Carrier SLA Ranking', 'Cost per Delivery'],
    samplePrompts: [
      'Analyze courier delivery performance and on-time SLA rates',
      'Compare transit reliability between ExpressCargo and BlueDart',
      'Evaluate delivery costs across destination cities'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Supply Chain Benchmark',
    limitations: 'On-time flag assigned Yes when actual hours <= promised hours.',
    freshness: 'Daily fulfillment dispatch log',
    observationPeriod: '15 courier package deliveries across 10 metro cities'
  },
  {
    id: 'shipment_tracking',
    name: 'Multi-Modal Freight Shipment Tracking',
    industry: 'logistics',
    industryName: 'Logistics & Transportation',
    description: 'Freight tracking records covering port-to-port rail cargo, interstate road line-hauls, and international air freight shipments.',
    filePath: '/datasets/logistics/shipment_tracking.csv',
    format: 'csv',
    recordCount: 10,
    columns: ['tracking_number', 'origin', 'destination', 'weight_kg', 'mode', 'dispatch_date', 'estimated_delivery', 'current_status', 'freight_charge'],
    supportedMetrics: ['Total Freight Tonnage', 'Mode of Transport Share', 'Freight Charges Realized', 'In-Transit Volume'],
    samplePrompts: [
      'Show freight shipment tracking and transport mode split',
      'Compare rail freight versus road linehaul freight costs',
      'Analyze air cargo tonnage and international customs clearance'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Supply Chain Benchmark',
    limitations: 'Weight recorded in metric kilograms.',
    freshness: 'Live shipment tracking register',
    observationPeriod: '10 multi-modal freight consignments'
  },
  {
    id: 'transportation_costs',
    name: 'Interstate Route Transportation & Fuel Cost Ledger',
    industry: 'logistics',
    industryName: 'Logistics & Transportation',
    description: 'Hub-to-hub fleet transit expense records measuring kilometer distances, diesel fuel charges, toll taxes, and driver compensation.',
    filePath: '/datasets/logistics/transportation_costs.csv',
    format: 'csv',
    recordCount: 8,
    columns: ['route_id', 'origin_hub', 'destination_hub', 'distance_km', 'fuel_cost', 'toll_charges', 'driver_wages', 'total_trip_cost', 'trips_count'],
    supportedMetrics: ['Cost per Kilometer', 'Fleet Fuel Share %', 'High-Density Route Tolls', 'Total Route Operating Expense'],
    samplePrompts: [
      'Analyze freight transportation costs and diesel fuel expenses',
      'Compare cost per kilometer across major transit corridors',
      'Evaluate driver wages and toll fee impact on trip cost'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Supply Chain Benchmark',
    limitations: 'Total trip cost reconciled as fuel + toll + driver wages.',
    freshness: 'Monthly fleet operations ledger',
    observationPeriod: '8 commercial transport corridors'
  },

  // 9. BANKING & FINANCE
  {
    id: 'loan_portfolio',
    name: 'Commercial & Retail Loan Portfolio Assets',
    industry: 'banking',
    industryName: 'Banking & Finance',
    description: 'Bank credit facility records tracking home mortgages, corporate debt, SME working capital, risk ratings, and non-performing loans (NPL).',
    filePath: '/datasets/banking/loan_portfolio.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['loan_id', 'borrower_type', 'loan_category', 'principal_amount', 'interest_rate_pct', 'term_months', 'outstanding_balance', 'risk_rating', 'status'],
    supportedMetrics: ['Total Loan Portfolio Balance', 'Weighted Average Interest Rate', 'Non-Performing Loan (NPL) %', 'Risk Rating Distribution'],
    samplePrompts: [
      'Analyze bank loan portfolio performance and credit risk ratings',
      'Calculate non-performing loan (NPL) ratio and default exposure',
      'Compare home mortgage yields versus corporate working capital'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Financial Benchmark',
    limitations: 'Risk classifications aligned with Basel credit exposure standards.',
    freshness: 'Quarterly credit portfolio review',
    observationPeriod: '15 commercial and retail credit facilities'
  },
  {
    id: 'banking_transactions',
    name: 'Digital Banking & ATM Payment Transactions',
    industry: 'banking',
    industryName: 'Banking & Finance',
    description: 'Transaction processing journal evaluating UPI instant transfers, wire clearances, RTGS payroll batches, and merchant card swipes.',
    filePath: '/datasets/banking/banking_transactions.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['transaction_id', 'account_type', 'transaction_type', 'amount', 'fee', 'channel', 'status', 'transaction_time'],
    supportedMetrics: ['Transaction Processing Volume', 'Digital vs Branch Channel Share', 'Fee Income Generated', 'Execution Success Rate'],
    samplePrompts: [
      'Show banking transaction volumes by payment channel',
      'Analyze UPI and wire transfer processing fee revenue',
      'Compare savings account transfers versus corporate RTGS batches'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Financial Benchmark',
    limitations: 'Fees recorded based on statutory clearing schedules.',
    freshness: 'Core banking transaction stream',
    observationPeriod: '15 retail and corporate account transactions'
  },
  {
    id: 'customer_deposits',
    name: 'Customer Deposit Accounts & Maturity Yields',
    industry: 'banking',
    industryName: 'Banking & Finance',
    description: 'Branch liability records detailing term deposits, certificates of deposit, high-yield wealth savings, and annual interest yields.',
    filePath: '/datasets/banking/customer_deposits.csv',
    format: 'csv',
    recordCount: 12,
    columns: ['deposit_id', 'branch', 'deposit_type', 'deposit_amount', 'annual_yield_pct', 'maturity_months', 'customer_segment'],
    supportedMetrics: ['Total Deposit Base', 'Weighted Average Yield %', 'Corporate vs Retail Deposit Split', 'Maturity Profile'],
    samplePrompts: [
      'Analyze customer deposit portfolio and annual interest yields',
      'Compare corporate term deposits against retail fixed deposits',
      'Show deposit liabilities distribution across bank branches'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Financial Benchmark',
    limitations: 'Interest yields reflect annualized statutory percentage rates.',
    freshness: 'Bank treasury deposit register',
    observationPeriod: '12 branch deposit accounts'
  },

  // 10. FITNESS & GYMS
  {
    id: 'gym_memberships',
    name: 'Gym Member Subscriptions & Tier Retention',
    industry: 'fitness',
    industryName: 'Fitness & Gyms',
    description: 'Health club member roster tracking tier plans (Gold Annual, Silver Monthly, Platinum All-Access), monthly dues, and visit frequency.',
    filePath: '/datasets/fitness/gym_memberships.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['member_id', 'member_name', 'plan_type', 'monthly_fee', 'joined_date', 'status', 'visits_this_month', 'trainer_assigned'],
    supportedMetrics: ['Active Membership Base', 'Monthly Subscription Dues', 'Personal Trainer Penetration', 'Member Utilization'],
    samplePrompts: [
      'Analyze gym membership tiers and active subscriber counts',
      'Calculate monthly membership dues and trainer attachment rate',
      'Show member workout visit frequency distribution'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Wellness Benchmark',
    limitations: 'Visits this month reflects calendar month access badge swipes.',
    freshness: 'Club management software snapshot',
    observationPeriod: '15 health club member profiles'
  },
  {
    id: 'gym_attendance',
    name: 'Fitness Facility Check-Ins & Zone Utilization',
    industry: 'fitness',
    industryName: 'Fitness & Gyms',
    description: 'Turnstile check-in logs recording workout duration, peak hours, day-of-week traffic, and equipment zone allocations.',
    filePath: '/datasets/fitness/gym_attendance.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['log_id', 'member_id', 'check_in_time', 'check_out_time', 'duration_minutes', 'facility_area', 'day_of_week'],
    supportedMetrics: ['Peak Facility Hours', 'Average Workout Duration', 'Equipment Zone Demand', 'Daily Check-In Velocity'],
    samplePrompts: [
      'Analyze gym attendance patterns and peak workout hours',
      'Compare weight training zone usage versus cardio area',
      'Show average member session duration by day of week'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Wellness Benchmark',
    limitations: 'Duration calculated from turnstile entry and exit timestamps.',
    freshness: 'Turnstile access control logs',
    observationPeriod: '15 member facility check-ins'
  },
  {
    id: 'subscription_revenue',
    name: 'Fitness MRR, New Signups & Subscriber Churn',
    industry: 'fitness',
    industryName: 'Fitness & Gyms',
    description: 'SaaS and subscription analytics measuring Monthly Recurring Revenue (MRR), net new additions, cancellations, and churn rates.',
    filePath: '/datasets/fitness/subscription_revenue.csv',
    format: 'csv',
    recordCount: 6,
    columns: ['month', 'active_subscribers', 'new_signups', 'cancellations', 'mrr_amount', 'churn_rate_pct', 'avg_revenue_per_member'],
    supportedMetrics: ['Monthly Recurring Revenue (MRR)', 'Subscriber Churn Rate %', 'Net New Member Growth', 'ARPU Trend'],
    samplePrompts: [
      'Analyze fitness club subscription revenue and monthly churn rate',
      'Track Monthly Recurring Revenue (MRR) expansion trajectory',
      'Evaluate new member signups versus cancellation rates'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Wellness Benchmark',
    limitations: 'Churn rate calculated strictly as cancellations divided by active subscribers.',
    freshness: 'Monthly subscription accounting ledger',
    observationPeriod: '6 consecutive calendar months'
  },

  // 11. ENERGY & UTILITIES
  {
    id: 'electricity_consumption',
    name: 'Grid Electricity Consumption & Peak Load Demand',
    industry: 'energy',
    industryName: 'Energy & Utilities',
    description: 'Substation telemetry detailing hourly load profiles, industrial vs commercial demand, grid frequency stability, and power factors.',
    filePath: '/datasets/energy/electricity_consumption.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['date', 'time_hour', 'customer_sector', 'consumption_kwh', 'peak_demand_kw', 'grid_frequency_hz', 'power_factor'],
    supportedMetrics: ['Total Energy Consumption (kWh)', 'Peak Demand Load (kW)', 'Industrial vs Residential Share', 'Grid Frequency Stability'],
    samplePrompts: [
      'Analyze grid electricity consumption and peak demand load',
      'Compare industrial versus residential hourly power usage',
      'Show grid frequency and power factor performance'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Utilities Benchmark',
    limitations: 'Frequency target standardized at 50.00 Hz statutory grid band.',
    freshness: 'Smart grid AMI meter telemetry',
    observationPeriod: '15 hourly substation load intervals'
  },
  {
    id: 'energy_production',
    name: 'Power Generation Mix & Clean Renewable Share',
    industry: 'energy',
    industryName: 'Energy & Utilities',
    description: 'Daily power generation dispatch logs comparing solar PV plants, wind farms, hydroelectric dams, and thermal generation units.',
    filePath: '/datasets/energy/energy_production.csv',
    format: 'csv',
    recordCount: 12,
    columns: ['date', 'source_type', 'plant_name', 'installed_capacity_mw', 'generated_mwh', 'capacity_factor_pct', 'co2_emissions_tons'],
    supportedMetrics: ['Renewable Energy Generation Share', 'Plant Capacity Factor %', 'Avoided Carbon Emissions', 'Total Megawatt-Hours (MWh)'],
    samplePrompts: [
      'Compare renewable solar and wind generation against thermal power',
      'Analyze plant capacity factors across utility generators',
      'Show daily carbon dioxide emissions from power generation'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Utilities Benchmark',
    limitations: 'Solar and wind emissions evaluated as 0.00 direct stack tons.',
    freshness: 'Daily grid dispatch ledger',
    observationPeriod: '12 power utility plant generation days'
  },
  {
    id: 'energy_billing',
    name: 'Utility Tariff Billing & Consumer Revenue',
    industry: 'energy',
    industryName: 'Energy & Utilities',
    description: 'Retail utility billing records detailing high-tension (HT) industrial tariffs, commercial accounts, domestic residential tiers, and energy taxes.',
    filePath: '/datasets/energy/energy_billing.csv',
    format: 'csv',
    recordCount: 10,
    columns: ['bill_id', 'account_number', 'tariff_category', 'units_consumed_kwh', 'energy_charges', 'fixed_charges', 'taxes', 'total_bill_amount'],
    supportedMetrics: ['Total Utility Billing Revenue', 'Average Cost per kWh', 'Industrial Tariff Contribution', 'Fixed vs Energy Charges'],
    samplePrompts: [
      'Analyze electric utility billing and consumer tariff revenues',
      'Compare industrial high-tension bills versus residential tariffs',
      'Show total units consumed and tax revenue generated'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Utilities Benchmark',
    limitations: 'Total bill amount equals energy charges + fixed charges + taxes.',
    freshness: 'Monthly consumer billing cycle',
    observationPeriod: '10 consumer electricity billing accounts'
  },

  // 12. AGRICULTURE
  {
    id: 'crop_production',
    name: 'State Agricultural Crop Production & Harvest Yields',
    industry: 'agriculture',
    industryName: 'Agriculture',
    description: 'State-wise agricultural statistics measuring cultivated land area in hectares, total production in metric tons, and yield kg/ha.',
    filePath: '/datasets/agriculture/crop_production.csv',
    format: 'csv',
    recordCount: 15,
    columns: ['record_id', 'state', 'crop_name', 'season', 'cultivated_area_hectares', 'total_production_tons', 'yield_kg_per_hectare'],
    supportedMetrics: ['Total Agricultural Output (Tons)', 'Crop Yield per Hectare (kg/ha)', 'State Harvest Leaderboard', 'Kharif vs Rabi Share'],
    samplePrompts: [
      'Analyze crop production and yield per hectare across Indian states',
      'Compare wheat yields in Punjab against rice yields in West Bengal',
      'Show total cultivated area and sugarcane production'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Agricultural Benchmark (Directorate of Economics & Statistics Model)',
    limitations: 'Yield per hectare mathematically verified as (production in tons * 1000) / hectares.',
    freshness: 'Consolidated agricultural season accounts',
    observationPeriod: '15 major state crop harvest reports'
  },
  {
    id: 'agricultural_prices',
    name: 'APMC Mandi Commodity Market Prices & Arrivals',
    industry: 'agriculture',
    industryName: 'Agriculture',
    description: 'Wholesale agricultural market records tracking daily arrivals in quintals, minimum prices, maximum prices, and modal prices.',
    filePath: '/datasets/agriculture/agricultural_prices.csv',
    format: 'csv',
    recordCount: 12,
    columns: ['market_id', 'state', 'commodity', 'variety', 'arrivals_quintals', 'min_price_rs_per_qtl', 'max_price_rs_per_qtl', 'modal_price_rs_per_qtl', 'date'],
    supportedMetrics: ['Modal Market Price (Rs/Qtl)', 'Mandi Arrival Volume (Quintals)', 'Commodity Price Spread', 'Market Price Comparison'],
    samplePrompts: [
      'Analyze agricultural commodity prices and mandi arrival volumes',
      'Compare basmati rice prices in Haryana with soybean in Maharashtra',
      'Evaluate price spreads between minimum and maximum commodity rates'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Agricultural Benchmark',
    limitations: 'Prices quoted in INR per quintal (100 kg).',
    freshness: 'Daily APMC market bulletin',
    observationPeriod: '12 wholesale commodity market entries'
  },
  {
    id: 'rainfall_yield',
    name: 'District Rainfall Deviation & Crop Yield Correlation',
    industry: 'agriculture',
    industryName: 'Agriculture',
    description: 'Meteorological and agricultural correlation records evaluating annual precipitation, normal rainfall baselines, and crop yields.',
    filePath: '/datasets/agriculture/rainfall_yield.csv',
    format: 'csv',
    recordCount: 10,
    columns: ['district', 'state', 'year', 'annual_rainfall_mm', 'normal_rainfall_mm', 'rainfall_deviation_pct', 'major_crop', 'crop_yield_tons_per_ha'],
    supportedMetrics: ['Rainfall Anomaly Deviation %', 'Yield vs Rainfall Correlation', 'Drought / Surplus Districts', 'Crop Productivity per Hectare'],
    samplePrompts: [
      'Analyze the correlation between annual rainfall and crop yields',
      'Identify districts experiencing positive monsoon rainfall deviation',
      'Compare agricultural productivity across rainfed districts'
    ],
    dataOrigin: 'SYNTHETIC_SAMPLE',
    license: 'Open Synthetic Research License (OSRL 1.0)',
    attribution: 'GenUI Synthetic Agricultural Benchmark',
    limitations: 'Rainfall deviation calculated as percentage delta from 30-year normal.',
    freshness: 'Annual agro-climatic assessment',
    observationPeriod: '10 representative agricultural districts'
  }
];

// Helper Query Functions
export function getAllIndustries(): IndustryDefinition[] {
  return INDUSTRIES_REGISTRY;
}

export function getIndustryById(id: IndustryId | string): IndustryDefinition | undefined {
  return INDUSTRIES_REGISTRY.find(ind => ind.id === id);
}

export function getAllDatasets(): DatasetCatalogItem[] {
  return DATASETS_CATALOG;
}

export function getDatasetById(id: string): DatasetCatalogItem | undefined {
  return DATASETS_CATALOG.find(ds => ds.id === id || ds.filePath.endsWith(id) || ds.id === id.replace('.csv', ''));
}

export function getDatasetsByIndustry(industry: IndustryId | string): DatasetCatalogItem[] {
  return DATASETS_CATALOG.filter(ds => ds.industry === industry);
}

export function searchDatasets(query: string): DatasetCatalogItem[] {
  const clean = query.toLowerCase().trim();
  if (!clean) return DATASETS_CATALOG;

  return DATASETS_CATALOG.filter(ds => {
    return (
      ds.name.toLowerCase().includes(clean) ||
      ds.description.toLowerCase().includes(clean) ||
      ds.industryName.toLowerCase().includes(clean) ||
      ds.industry.toLowerCase().includes(clean) ||
      ds.columns.some(col => col.toLowerCase().includes(clean)) ||
      ds.supportedMetrics.some(m => m.toLowerCase().includes(clean)) ||
      ds.samplePrompts.some(p => p.toLowerCase().includes(clean))
    );
  });
}

/**
 * Natural-Language Dataset Resolver
 * Checks if a user's prompt matches a specific catalog dataset
 */
export function findMatchingDatasetForPrompt(prompt: string): DatasetCatalogItem | undefined {
  const clean = prompt.toLowerCase().trim();
  if (!clean) return undefined;

  // Direct filename or ID match
  const direct = DATASETS_CATALOG.find(ds => 
    clean.includes(ds.id) || 
    clean.includes(ds.id.replace(/_/g, ' ')) ||
    clean.includes(ds.filePath.split('/').pop()?.replace('.csv', '') || '')
  );
  if (direct) return direct;

  // Exact sample prompt match
  const promptMatch = DATASETS_CATALOG.find(ds => 
    ds.samplePrompts.some(sp => clean.includes(sp.toLowerCase()) || sp.toLowerCase().includes(clean))
  );
  if (promptMatch) return promptMatch;

  // Strong keyword clustering
  if (clean.includes('theatre') || clean.includes('cinema') || clean.includes('box office') || clean.includes('screen occupancy')) {
    if (clean.includes('occupancy') || clean.includes('capacity')) return getDatasetById('show_occupancy');
    if (clean.includes('movie') || clean.includes('film')) return getDatasetById('movie_performance');
    return getDatasetById('theatre_bookings');
  }

  if (clean.includes('hospital') || clean.includes('patient') || clean.includes('clinic')) {
    if (clean.includes('department') || clean.includes('bed')) return getDatasetById('hospital_department_metrics');
    if (clean.includes('billing') || clean.includes('charge') || clean.includes('insurance')) return getDatasetById('hospital_billing');
    return getDatasetById('hospital_appointments');
  }

  if (clean.includes('hotel') || clean.includes('room') || clean.includes('hospitality')) {
    if (clean.includes('occupancy') || clean.includes('revpar') || clean.includes('adr')) return getDatasetById('room_occupancy');
    if (clean.includes('revenue') || clean.includes('profit') || clean.includes('income')) return getDatasetById('hotel_revenue');
    return getDatasetById('hotel_bookings');
  }

  if (clean.includes('delivery') || clean.includes('shipment') || clean.includes('logistics') || clean.includes('freight')) {
    if (clean.includes('tracking') || clean.includes('cargo')) return getDatasetById('shipment_tracking');
    if (clean.includes('cost') || clean.includes('fuel') || clean.includes('toll')) return getDatasetById('transportation_costs');
    return getDatasetById('delivery_performance');
  }

  if (clean.includes('banking') || clean.includes('loan') || clean.includes('borrower') || clean.includes('deposit')) {
    if (clean.includes('loan') || clean.includes('mortgage') || clean.includes('npl')) return getDatasetById('loan_portfolio');
    if (clean.includes('deposit') || clean.includes('yield')) return getDatasetById('customer_deposits');
    return getDatasetById('banking_transactions');
  }

  if (clean.includes('gym') || clean.includes('fitness') || clean.includes('membership') || clean.includes('workout')) {
    if (clean.includes('attendance') || clean.includes('check-in') || clean.includes('hours')) return getDatasetById('gym_attendance');
    if (clean.includes('mrr') || clean.includes('subscription') || clean.includes('churn')) return getDatasetById('subscription_revenue');
    return getDatasetById('gym_memberships');
  }

  if (clean.includes('energy') || clean.includes('electricity') || clean.includes('power') || clean.includes('kwh')) {
    if (clean.includes('production') || clean.includes('generation') || clean.includes('solar') || clean.includes('wind')) return getDatasetById('energy_production');
    if (clean.includes('bill') || clean.includes('tariff')) return getDatasetById('energy_billing');
    return getDatasetById('electricity_consumption');
  }

  if (clean.includes('crop') || clean.includes('agriculture') || clean.includes('farm') || clean.includes('mandi') || clean.includes('harvest')) {
    if (clean.includes('price') || clean.includes('mandi') || clean.includes('commodity')) return getDatasetById('agricultural_prices');
    if (clean.includes('rain') || clean.includes('monsoon')) return getDatasetById('rainfall_yield');
    return getDatasetById('crop_production');
  }

  if (clean.includes('restaurant') || clean.includes('food') || clean.includes('menu') || clean.includes('dining')) {
    if (clean.includes('order')) return getDatasetById('restaurant_orders');
    if (clean.includes('inventory') || clean.includes('pantry') || clean.includes('ingredient')) return getDatasetById('restaurant_inventory');
    return getDatasetById('restaurant_sales');
  }

  if (clean.includes('retail') || clean.includes('e-commerce') || clean.includes('store') || clean.includes('product sales')) {
    if (clean.includes('inventory') || clean.includes('sku') || clean.includes('stock')) return getDatasetById('product_inventory');
    if (clean.includes('customer') || clean.includes('clv') || clean.includes('loyalty')) return getDatasetById('customer_purchases');
    return getDatasetById('retail_transactions');
  }

  if (clean.includes('student') || clean.includes('school') || clean.includes('academic') || clean.includes('marks')) {
    if (clean.includes('attendance') || clean.includes('absent')) return getDatasetById('student_attendance');
    if (clean.includes('course') || clean.includes('university') || clean.includes('enrollment')) return getDatasetById('course_enrollment');
    return getDatasetById('student_performance');
  }

  if (clean.includes('business revenue') || clean.includes('expenses') || clean.includes('employee performance')) {
    if (clean.includes('expense') || clean.includes('budget')) return getDatasetById('business_expenses');
    if (clean.includes('employee') || clean.includes('salary') || clean.includes('staff')) return getDatasetById('employee_performance');
    return getDatasetById('business_revenue');
  }

  return undefined;
}
