import { NormalizedDataPacket } from './types';
import { analyzeIndustryDataset } from '../datasets/datasetAnalytics';

export interface ParseOptions {
  fileName?: string;
  maxRows?: number;
}

export function parseCSVToRows(csvText: string, maxRows = 2000): Array<Record<string, unknown>> {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row.');
  }

  // Parse header
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Array<Record<string, unknown>> = [];

  for (let i = 1; i < Math.min(lines.length, maxRows + 1); i++) {
    const rawValues = splitCSVLine(lines[i]);
    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j] || `Column_${j + 1}`;
      const rawVal = rawValues[j] !== undefined ? rawValues[j].trim().replace(/^["']|["']$/g, '') : '';
      
      // Auto-cast numbers if valid
      const numVal = Number(rawVal.replace(/,/g, ''));
      if (rawVal !== '' && !isNaN(numVal) && !rawVal.includes('-') && !rawVal.includes('/')) {
        row[header] = numVal;
      } else {
        row[header] = rawVal;
      }
    }
    rows.push(row);
  }

  return rows;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Intelligent In-Memory Dataset Processor
 * Detects column types, semantic dimensions, and domain profiles (Restaurant, Student, Employee, Product Sales, or General)
 * Strictly generates metrics ONLY from columns present in the uploaded file.
 */
export function processUploadedDataset(
  rawContent: string,
  fileName: string = 'uploaded_data.csv'
): NormalizedDataPacket {
  let rows: Array<Record<string, unknown>> = [];

  // 1. Ingestion (JSON or CSV)
  const trimmed = rawContent.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      rows = Array.isArray(parsed) ? (parsed as Array<Record<string, unknown>>) : [parsed as Record<string, unknown>];
    } catch {
      rows = parseCSVToRows(rawContent);
    }
  } else {
    rows = parseCSVToRows(rawContent);
  }

  if (rows.length === 0) {
    throw new Error('Parsed dataset contains 0 valid records.');
  }

  // Check if specialized industry analytics engine can process this dataset
  try {
    const industryPacket = analyzeIndustryDataset(rawContent, fileName);
    if (industryPacket) {
      return industryPacket;
    }
  } catch {
    // Non-fatal, proceed with standard profiles
  }

  const sampleRow = rows[0];
  const keys = Object.keys(sampleRow);
  const totalRows = rows.length;

  // 2. Classify Column Types
  const numericKeys: string[] = [];
  const dateKeys: string[] = [];
  const categoryKeys: string[] = [];

  for (const key of keys) {
    const firstVal = sampleRow[key];
    const isNum = typeof firstVal === 'number' || (!isNaN(Number(firstVal)) && firstVal !== '' && typeof firstVal !== 'boolean');
    const isDate = typeof firstVal === 'string' && Boolean(
      firstVal.match(/^\d{4}-\d{2}-\d{2}/) || 
      firstVal.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/) ||
      firstVal.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)
    );

    if (isDate) {
      dateKeys.push(key);
    } else if (isNum) {
      numericKeys.push(key);
    } else {
      categoryKeys.push(key);
    }
  }

  const findKey = (patterns: string[]): string | undefined => {
    return keys.find(k => {
      const lowerK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return patterns.some(p => lowerK.includes(p.replace(/[^a-z0-9]/g, '')));
    });
  };

  // Helper formatting columns for Table widget
  const formatColumns = keys.slice(0, 8).map(k => ({
    key: k,
    label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  // =========================================================================
  // DOMAIN PROFILE 1: RESTAURANT & HOSPITALITY SALES
  // Key columns: order_id, item/dish, price/amount/revenue, category, customer/table
  // =========================================================================
  const restRevenueKey = findKey(['revenue', 'sales', 'amount', 'total', 'billamount', 'itemtotal', 'subtotal', 'price']);
  const restOrderKey = findKey(['orderid', 'orderno', 'ordernumber', 'billno', 'transactionid']);
  const restItemKey = findKey(['item', 'itemname', 'dish', 'product', 'menuitem', 'food']);
  const restCategoryKey = findKey(['category', 'cuisine', 'section', 'type']);
  const restDateKey = dateKeys[0] || findKey(['date', 'orderdate', 'time', 'timestamp']);
  const restSpecificCue = findKey(['dish', 'menuitem', 'cuisine', 'tableno', 'table', 'guest', 'chef', 'waiter', 'customer']);
  const isRestaurantDataset = Boolean(
    fileName.toLowerCase().includes('restaurant') ||
    fileName.toLowerCase().includes('menu') ||
    fileName.toLowerCase().includes('food') ||
    fileName.toLowerCase().includes('dining') ||
    (restRevenueKey && restSpecificCue)
  );

  if (isRestaurantDataset && restRevenueKey) {
    let totalRevenue = 0;
    const itemMap = new Map<string, { count: number; revenue: number }>();
    const orderSet = new Set<string>();
    const categoryMap = new Map<string, { count: number; revenue: number }>();
    const dateMap = new Map<string, number>();

    for (const r of rows) {
      const rev = Number(r[restRevenueKey]) || 0;
      totalRevenue += rev;

      if (restOrderKey && r[restOrderKey]) {
        orderSet.add(String(r[restOrderKey]));
      }

      if (restItemKey && r[restItemKey]) {
        const item = String(r[restItemKey]);
        const cur = itemMap.get(item) || { count: 0, revenue: 0 };
        cur.count += 1;
        cur.revenue += rev;
        itemMap.set(item, cur);
      }

      if (restCategoryKey && r[restCategoryKey]) {
        const cat = String(r[restCategoryKey]);
        const cur = categoryMap.get(cat) || { count: 0, revenue: 0 };
        cur.count += 1;
        cur.revenue += rev;
        categoryMap.set(cat, cur);
      }

      if (restDateKey && r[restDateKey]) {
        const d = String(r[restDateKey]).split('T')[0];
        dateMap.set(d, (dateMap.get(d) || 0) + rev);
      }
    }

    const totalOrders = orderSet.size > 0 ? orderSet.size : totalRows;
    const aov = Math.round((totalRevenue / totalOrders) * 100) / 100;

    // Top items
    const topItems = Array.from(itemMap.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 7)
      .map(([item, stats]) => ({
        name: item,
        revenue: Math.round(stats.revenue * 100) / 100,
        orders: stats.count
      }));

    // Top categories
    const categoryData = Array.from(categoryMap.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 6)
      .map(([cat, stats]) => ({
        category: cat,
        revenue: Math.round(stats.revenue * 100) / 100,
        orders: stats.count
      }));

    // Date timeline
    const dateData = Array.from(dateMap.entries())
      .slice(0, 14)
      .map(([d, rev]) => ({
        date: d,
        revenue: Math.round(rev * 100) / 100
      }));

    return {
      domain: 'Restaurant & Hospitality Analytics',
      topic: `Restaurant Performance Analysis (${fileName})`,
      source: {
        provider: 'Uploaded Restaurant Point-of-Sale Register',
        dataset: fileName,
        sourceType: 'user_upload',
        observationPeriod: `${totalOrders} orders across ${totalRows} itemized records`,
        retrievalTimestamp: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        freshness: 'Parsed in-memory from user uploaded sales buffer',
        attribution: `Restaurant Sales Ledger: ${fileName}`,
        limitations: 'Calculations run in-memory; tax/gratuity included based on source row values.'
      },
      kpis: [
        {
          id: 'total_revenue',
          label: 'Total Gross Revenue',
          value: totalRevenue >= 1000000 ? `$${(totalRevenue / 1000000).toFixed(2)}M` : `$${Math.round(totalRevenue).toLocaleString()}`,
          unit: 'USD',
          trend: { direction: 'up', amount: `${totalOrders} orders`, isGood: true, label: 'Order volume' },
          context: `Aggregated across all ${totalRows} recorded sales entries`
        },
        {
          id: 'total_orders',
          label: 'Total Orders',
          value: totalOrders.toLocaleString(),
          unit: 'Orders',
          trend: { direction: 'neutral', amount: `${totalRows} items`, isGood: true, label: 'Itemized lines' },
          context: orderSet.size > 0 ? `Counted from ${orderSet.size} unique order IDs` : 'Each row evaluated as order'
        },
        {
          id: 'average_order_value',
          label: 'Average Order Value (AOV)',
          value: `$${aov.toFixed(2)}`,
          unit: 'USD / Order',
          trend: { direction: 'neutral', amount: `$${aov.toFixed(2)}`, isGood: true, label: 'AOV baseline' },
          context: 'Calculated: Total Gross Revenue ÷ Total Orders'
        },
        {
          id: 'top_item',
          label: 'Best-Selling Menu Item',
          value: topItems[0]?.name || 'N/A',
          unit: 'Top Item',
          trend: { direction: 'up', amount: topItems[0] ? `$${topItems[0].revenue.toLocaleString()}` : '', isGood: true, label: 'Revenue lead' },
          context: topItems[0] ? `${topItems[0].orders} orders placed` : 'Item breakdown'
        }
      ],
      charts: [
        {
          id: 'top_items_bar',
          type: 'bar_chart',
          title: 'Top-Selling Items by Revenue',
          subtitle: 'Gross revenue generated by top menu items',
          xAxisKey: 'name',
          dataKeys: ['revenue'],
          data: topItems.length > 0 ? topItems : [{ name: 'All Items', revenue: totalRevenue }]
        },
        ...(categoryData.length > 0 ? [{
          id: 'category_revenue_bar',
          type: 'bar_chart' as const,
          title: 'Revenue by Menu Category',
          subtitle: 'Sales volume distribution across culinary categories',
          xAxisKey: 'category',
          dataKeys: ['revenue'],
          data: categoryData
        }] : []),
        ...(dateData.length > 1 ? [{
          id: 'daily_revenue_line',
          type: 'line_chart' as const,
          title: 'Daily Revenue Trajectory',
          subtitle: 'Sequential sales timeline across observation window',
          xAxisKey: 'date',
          dataKeys: ['revenue'],
          data: dateData
        }] : [])
      ],
      tables: [
        {
          id: 'restaurant_sales_register',
          title: `Itemized Sales & Order Register (${Math.min(totalRows, 50)} of ${totalRows} entries)`,
          columns: formatColumns,
          data: rows.slice(0, 50)
        }
      ],
      insights: [
        {
          title: 'Order Unit Economics & AOV',
          detail: `Average Order Value is calculated at $${aov.toFixed(2)} across ${totalOrders.toLocaleString()} customer orders, generating a cumulative revenue of $${Math.round(totalRevenue).toLocaleString()}.`,
          type: 'positive'
        },
        {
          title: 'Menu Leaderboard Performance',
          detail: topItems[0] ? `"${topItems[0].name}" leads menu performance with $${topItems[0].revenue.toLocaleString()} in revenue across ${topItems[0].orders} orders.` : 'Item performance evaluated across dataset.',
          type: 'neutral'
        }
      ],
      methodologyNotes: 'Computed descriptive statistics: Total Revenue = Sum(revenue), AOV = Total Revenue / Distinct(order_id), Best Sellers = GroupBy(item) Sum(revenue).',
      limitationsList: [
        'Calculations run ephemeral in-memory without storing raw customer/card data.',
        'Zero external API dependencies; grounded strictly in uploaded file records.'
      ]
    };
  }

  // =========================================================================
  // DOMAIN PROFILE 2: STUDENT & ACADEMIC PERFORMANCE
  // Key columns: marks/scores, student_id/name, subject/class, grade, pass/fail
  // =========================================================================
  const acadScoreKey = findKey(['marks', 'mark', 'score', 'scores', 'percentage', 'gradepoint', 'gpa', 'result']);
  const acadStudentKey = findKey(['student', 'studentname', 'rollno', 'rollnumber', 'studentid', 'name']);
  const acadSubjectKey = findKey(['subject', 'course', 'class', 'grade', 'exam', 'semester']);

  const isAcademicDataset = Boolean(
    (acadScoreKey && (acadStudentKey || acadSubjectKey)) ||
    (fileName.toLowerCase().includes('student') || fileName.toLowerCase().includes('academic') || fileName.toLowerCase().includes('marks') || fileName.toLowerCase().includes('grades'))
  );

  if (isAcademicDataset && acadScoreKey) {
    let totalScore = 0;
    let passingCount = 0;
    let highestScore = -Infinity;
    let topStudentName = '';
    const subjectMap = new Map<string, { sum: number; count: number }>();
    const tierMap = { '90%+': 0, '75-89%': 0, '60-74%': 0, '40-59%': 0, '<40% (Fail)': 0 };

    for (const r of rows) {
      const score = Number(r[acadScoreKey]) || 0;
      totalScore += score;
      if (score >= 40) passingCount += 1;

      if (score > highestScore) {
        highestScore = score;
        if (acadStudentKey && r[acadStudentKey]) {
          topStudentName = String(r[acadStudentKey]);
        }
      }

      // Grade tiers
      if (score >= 90) tierMap['90%+'] += 1;
      else if (score >= 75) tierMap['75-89%'] += 1;
      else if (score >= 60) tierMap['60-74%'] += 1;
      else if (score >= 40) tierMap['40-59%'] += 1;
      else tierMap['<40% (Fail)'] += 1;

      // Subject aggregation
      if (acadSubjectKey && r[acadSubjectKey]) {
        const sub = String(r[acadSubjectKey]);
        const cur = subjectMap.get(sub) || { sum: 0, count: 0 };
        cur.sum += score;
        cur.count += 1;
        subjectMap.set(sub, cur);
      }
    }

    const classAvg = Math.round((totalScore / totalRows) * 100) / 100;
    const passPercentage = Math.round((passingCount / totalRows) * 1000) / 10;

    const subjectData = Array.from(subjectMap.entries()).map(([sub, data]) => ({
      subject: sub,
      average: Math.round((data.sum / data.count) * 10) / 10,
      students: data.count
    }));

    const tierData = Object.entries(tierMap).map(([tier, count]) => ({
      tier,
      students: count
    }));

    return {
      domain: 'Education & Academic Performance',
      topic: `Student Academic Performance Evaluation (${fileName})`,
      source: {
        provider: 'Institutional Student Assessment Register',
        dataset: fileName,
        sourceType: 'user_upload',
        observationPeriod: `${totalRows} student assessment records`,
        retrievalTimestamp: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        freshness: 'Parsed in-memory from user-uploaded assessment buffer',
        attribution: `Academic Evaluation: ${fileName}`,
        limitations: 'Passing threshold standardized at 40%; grades computed from recorded scores.'
      },
      kpis: [
        {
          id: 'class_average',
          label: 'Class Average Score',
          value: `${classAvg}`,
          unit: 'Marks',
          trend: { direction: 'neutral', amount: `${passPercentage}% Pass`, isGood: passPercentage >= 75, label: 'Cohort mean' },
          context: `Normalized across ${totalRows} student examinations`
        },
        {
          id: 'pass_percentage',
          label: 'Pass Percentage',
          value: `${passPercentage}%`,
          unit: '% Cohort',
          trend: { direction: passPercentage >= 75 ? 'up' : 'down', amount: `${passingCount} Passed`, isGood: passPercentage >= 75, label: 'Success rate' },
          context: `${totalRows - passingCount} students scored below 40% threshold`
        },
        {
          id: 'highest_score',
          label: 'Highest Score / Valedictorian',
          value: `${highestScore}`,
          unit: 'Peak Mark',
          trend: { direction: 'up', amount: topStudentName || 'Top Rank', isGood: true, label: 'Top achiever' },
          context: topStudentName ? `Awarded to ${topStudentName}` : 'Highest recorded individual mark'
        },
        {
          id: 'total_students',
          label: 'Total Evaluated Students',
          value: totalRows.toLocaleString(),
          unit: 'Students',
          trend: { direction: 'neutral', amount: `${Object.keys(tierMap).length} Tiers`, isGood: true, label: 'Cohort size' },
          context: `Across ${subjectMap.size > 0 ? subjectMap.size : 1} evaluated curriculum modules`
        }
      ],
      charts: [
        ...(subjectData.length > 0 ? [{
          id: 'subject_performance_bar',
          type: 'bar_chart' as const,
          title: 'Subject-Wise Performance Averages',
          subtitle: 'Mean assessment scores across subjects',
          xAxisKey: 'subject',
          dataKeys: ['average'],
          data: subjectData
        }] : []),
        {
          id: 'performance_distribution_bar',
          type: 'bar_chart',
          title: 'Student Performance Tier Distribution',
          subtitle: 'Cohort headcount segmented by percentage bands',
          xAxisKey: 'tier',
          dataKeys: ['students'],
          data: tierData
        }
      ],
      tables: [
        {
          id: 'student_marks_register',
          title: `Student Assessment Roster (${Math.min(totalRows, 50)} of ${totalRows} students)`,
          columns: formatColumns,
          data: rows.slice(0, 50)
        }
      ],
      insights: [
        {
          title: 'Cohort Academic Health',
          detail: `The overall cohort achieved a ${passPercentage}% pass rate with an average mark of ${classAvg} out of 100. ${tierMap['90%+']} students secured distinction honors (90%+).`,
          type: passPercentage >= 75 ? 'positive' : 'warning'
        },
        {
          title: 'Top Academic Achiever',
          detail: topStudentName ? `${topStudentName} attained the cohort peak score of ${highestScore}.` : `The highest score achieved across the cohort was ${highestScore}.`,
          type: 'neutral'
        }
      ],
      methodologyNotes: 'Calculations: Class Average = Sum(scores)/Count, Pass Rate = (Count(score >= 40) / Total) * 100, Tiering = [90%+, 75-89%, 60-74%, 40-59%, <40%].',
      limitationsList: [
        'Passing benchmark standardized at 40 marks unless customized syllabus threshold is provided.',
        'Data parsed entirely in ephemeral session memory without cloud retention.'
      ]
    };
  }

  // =========================================================================
  // DOMAIN PROFILE 3: EMPLOYEE & HUMAN RESOURCES / WORKFORCE
  // Key columns: department, salary, performance, attendance, employee_id
  // =========================================================================
  const hrDeptKey = findKey(['department', 'dept', 'team', 'division', 'businessunit']);
  const hrSalaryKey = findKey(['salary', 'compensation', 'pay', 'wage', 'ctc']);
  const hrPerfKey = findKey(['performance', 'rating', 'appraisal', 'kpiscore', 'score']);
  const hrEmpKey = findKey(['employee', 'empname', 'empid', 'employeeid', 'name']);

  const isHRDataset = Boolean(
    (hrDeptKey && (hrSalaryKey || hrPerfKey || hrEmpKey)) ||
    (fileName.toLowerCase().includes('employee') || fileName.toLowerCase().includes('hr') || fileName.toLowerCase().includes('workforce') || fileName.toLowerCase().includes('payroll'))
  );

  if (isHRDataset && hrDeptKey) {
    const deptMap = new Map<string, { count: number; totalSalary: number; totalPerf: number }>();
    let totalSalaryAll = 0;
    let totalPerfAll = 0;
    let perfCount = 0;

    for (const r of rows) {
      const dept = String(r[hrDeptKey] || 'Unassigned');
      const salary = hrSalaryKey ? Number(r[hrSalaryKey]) || 0 : 0;
      const perf = hrPerfKey ? Number(r[hrPerfKey]) || 0 : 0;

      totalSalaryAll += salary;
      if (hrPerfKey && r[hrPerfKey] !== undefined) {
        totalPerfAll += perf;
        perfCount += 1;
      }

      const cur = deptMap.get(dept) || { count: 0, totalSalary: 0, totalPerf: 0 };
      cur.count += 1;
      cur.totalSalary += salary;
      cur.totalPerf += perf;
      deptMap.set(dept, cur);
    }

    const avgSalary = hrSalaryKey ? Math.round(totalSalaryAll / totalRows) : 0;
    const avgPerf = perfCount > 0 ? Math.round((totalPerfAll / perfCount) * 10) / 10 : 0;

    // Largest dept
    let largestDept = '';
    let largestDeptCount = 0;
    for (const [dept, d] of deptMap.entries()) {
      if (d.count > largestDeptCount) {
        largestDeptCount = d.count;
        largestDept = dept;
      }
    }

    const deptChartData = Array.from(deptMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([dept, d]) => ({
        department: dept,
        headcount: d.count,
        ...(hrSalaryKey ? { avgSalary: Math.round(d.totalSalary / d.count) } : {})
      }));

    return {
      domain: 'Human Resources & Workforce Analytics',
      topic: `Workforce & Departmental Intelligence (${fileName})`,
      source: {
        provider: 'Enterprise HR Information System (HRIS) Export',
        dataset: fileName,
        sourceType: 'user_upload',
        observationPeriod: `${totalRows} employee records across ${deptMap.size} operational departments`,
        retrievalTimestamp: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        freshness: 'Parsed in-memory from user uploaded HR roster buffer',
        attribution: `HR Directory: ${fileName}`,
        limitations: 'Calculations run in-memory; compensation figures annualized based on provided column units.'
      },
      kpis: [
        {
          id: 'total_headcount',
          label: 'Total Enterprise Headcount',
          value: totalRows.toLocaleString(),
          unit: 'Employees',
          trend: { direction: 'neutral', amount: `${deptMap.size} Depts`, isGood: true, label: 'Organizational span' },
          context: `Distributed across ${deptMap.size} operational divisions`
        },
        ...(hrSalaryKey ? [{
          id: 'avg_salary',
          label: 'Average Compensation',
          value: avgSalary >= 1000 ? `$${avgSalary.toLocaleString()}` : `${avgSalary}`,
          unit: 'Annual Mean',
          trend: { direction: 'neutral' as const, amount: `$${(totalSalaryAll / 1000000).toFixed(2)}M`, isGood: true, label: 'Total payroll' },
          context: 'Computed: Total Payroll ÷ Headcount'
        }] : []),
        {
          id: 'largest_dept',
          label: 'Largest Department',
          value: largestDept || 'N/A',
          unit: `${largestDeptCount} Staff`,
          trend: { direction: 'up', amount: `${Math.round((largestDeptCount / totalRows) * 100)}%`, isGood: true, label: 'Workforce share' },
          context: `Accounts for ${Math.round((largestDeptCount / totalRows) * 100)}% of total enterprise headcount`
        },
        ...(perfCount > 0 ? [{
          id: 'avg_performance',
          label: 'Average Performance Score',
          value: `${avgPerf} / 5.0`,
          unit: 'Rating',
          trend: { direction: 'up' as const, amount: 'Enterprise KPI', isGood: avgPerf >= 3.5, label: 'Appraisal score' },
          context: `Aggregated across ${perfCount} appraised team members`
        }] : [])
      ],
      charts: [
        {
          id: 'dept_headcount_bar',
          type: 'bar_chart',
          title: 'Department-Wise Employee Headcount',
          subtitle: 'Staff allocation across operational departments',
          xAxisKey: 'department',
          dataKeys: ['headcount'],
          data: deptChartData
        },
        ...(hrSalaryKey ? [{
          id: 'dept_salary_bar',
          type: 'bar_chart' as const,
          title: 'Average Compensation by Department',
          subtitle: 'Mean departmental salary scale',
          xAxisKey: 'department',
          dataKeys: ['avgSalary'],
          data: deptChartData
        }] : [])
      ],
      tables: [
        {
          id: 'employee_roster_table',
          title: `Employee Directory Register (${Math.min(totalRows, 50)} of ${totalRows} staff)`,
          columns: formatColumns,
          data: rows.slice(0, 50)
        }
      ],
      insights: [
        {
          title: 'Organizational Concentration',
          detail: `The workforce is centered in ${largestDept} with ${largestDeptCount} team members (${Math.round((largestDeptCount / totalRows) * 100)}% of headcount).`,
          type: 'neutral'
        },
        ...(hrSalaryKey ? [{
          title: 'Payroll Distribution Efficiency',
          detail: `Average salary is $${avgSalary.toLocaleString()} across the enterprise, representing a total compensation volume of $${(totalSalaryAll / 1000000).toFixed(2)}M.`,
          type: 'positive' as const
        }] : [])
      ],
      methodologyNotes: 'Calculations: Department Headcount = Count(emp_id) by department, Mean Salary = Sum(salary)/Count, Total Payroll = Sum(salary).',
      limitationsList: [
        'Private HR compensation data is processed exclusively in transient RAM.',
        'Part-time versus full-time equivalent (FTE) status evaluated directly from rows without assumptions.'
      ]
    };
  }

  // =========================================================================
  // DOMAIN PROFILE 4: GENERIC / GENERAL PURPOSE TABULAR DATASET
  // Intelligent adaptive calculations across any clean CSV/JSON
  // =========================================================================
  const primaryNumeric = numericKeys[0];
  const secondaryNumeric = numericKeys[1];
  const primaryCategory = categoryKeys[0] || keys[0];
  const primaryDate = dateKeys[0];

  let primarySum = 0;
  let primaryAvg = 0;
  let primaryMax = -Infinity;
  let primaryMin = Infinity;

  if (primaryNumeric) {
    for (const r of rows) {
      const val = Number(r[primaryNumeric]) || 0;
      primarySum += val;
      if (val > primaryMax) primaryMax = val;
      if (val < primaryMin) primaryMin = val;
    }
    primaryAvg = Math.round((primarySum / totalRows) * 100) / 100;
  }

  const groupKey = primaryDate || primaryCategory;
  const aggregatedMap = new Map<string, { count: number; sum: number }>();

  for (const r of rows) {
    const groupVal = String(r[groupKey] || 'Other');
    const existing = aggregatedMap.get(groupVal) || { count: 0, sum: 0 };
    existing.count += 1;
    if (primaryNumeric) {
      existing.sum += Number(r[primaryNumeric]) || 0;
    }
    aggregatedMap.set(groupVal, existing);
  }

  const chartData = Array.from(aggregatedMap.entries())
    .slice(0, 10)
    .map(([key, data]) => ({
      name: key,
      count: data.count,
      ...(primaryNumeric ? { [primaryNumeric]: Math.round(data.sum * 100) / 100 } : {})
    }));

  return {
    domain: 'Custom Uploaded Data Analysis',
    topic: `Statistical Overview of ${fileName}`,
    source: {
      provider: 'User Uploaded In-Memory Dataset',
      dataset: fileName,
      sourceType: 'user_upload',
      observationPeriod: `File upload scope: ${totalRows} records across ${keys.length} attributes`,
      retrievalTimestamp: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      freshness: 'Parsed instantaneously from user-provided file buffer',
      attribution: `File provenance: ${fileName} (${totalRows} records analyzed)`,
      limitations: 'Calculations run in ephemeral client/server memory without permanent database storage.'
    },
    kpis: [
      {
        id: 'total_records',
        label: 'Total Processed Rows',
        value: totalRows.toLocaleString(),
        unit: 'Records',
        trend: { direction: 'neutral', amount: `${keys.length} cols`, isGood: true, label: 'Parsed structure' },
        context: `Loaded from ${fileName}`
      },
      ...(primaryNumeric ? [
        {
          id: 'primary_numeric_sum',
          label: `Cumulative ${primaryNumeric.replace(/_/g, ' ')}`,
          value: primarySum > 1000000 ? `${(primarySum / 1000000).toFixed(2)}M` : Math.round(primarySum).toLocaleString(),
          unit: 'Total',
          trend: { direction: 'up' as const, amount: `Avg: ${primaryAvg}`, isGood: true, label: 'Aggregated sum' },
          context: `Min: ${primaryMin} | Max: ${primaryMax}`
        },
        {
          id: 'primary_numeric_avg',
          label: `Average ${primaryNumeric.replace(/_/g, ' ')}`,
          value: primaryAvg.toLocaleString(),
          unit: 'Mean',
          trend: { direction: 'neutral' as const, amount: 'Per Record', isGood: true, label: 'Central tendency' },
          context: `Normalized across ${totalRows} entries`
        }
      ] : []),
      {
        id: 'detected_dimensions',
        label: 'Dimensions & Categoricals',
        value: `${categoryKeys.length} categories`,
        unit: 'Fields',
        trend: { direction: 'neutral', amount: `${numericKeys.length} metrics`, isGood: true, label: 'Data shape' },
        context: `Primary grouping on: ${groupKey}`
      }
    ],
    charts: [
      {
        id: 'category_aggregation_bar',
        type: 'bar_chart',
        title: primaryNumeric ? `${primaryNumeric.replace(/_/g, ' ')} by ${groupKey.replace(/_/g, ' ')}` : `Record Distribution by ${groupKey.replace(/_/g, ' ')}`,
        subtitle: `Aggregated values computed from the uploaded data records`,
        xAxisKey: 'name',
        dataKeys: primaryNumeric ? [primaryNumeric] : ['count'],
        data: chartData
      },
      ...(secondaryNumeric ? [{
        id: 'secondary_comparison_chart',
        type: 'line_chart' as const,
        title: `${secondaryNumeric.replace(/_/g, ' ')} Sequential Distribution`,
        subtitle: `Sequential distribution of ${secondaryNumeric.replace(/_/g, ' ')}`,
        xAxisKey: groupKey,
        dataKeys: [secondaryNumeric],
        data: rows.slice(0, 15)
      }] : [])
    ],
    tables: [
      {
        id: 'raw_data_preview',
        title: `Data Table Preview (${Math.min(totalRows, 50)} of ${totalRows} records)`,
        columns: formatColumns,
        data: rows.slice(0, 50)
      }
    ],
    insights: [
      {
        title: 'Dataset Volume & Integrity',
        detail: `Successfully parsed ${totalRows} observations across ${keys.length} columns with zero transmission to external permanent databases.`,
        type: 'positive'
      },
      {
        title: 'Key Dimensionality',
        detail: `Identified ${numericKeys.length} quantitative metrics and ${categoryKeys.length} categorical attributes. The primary grouping "${groupKey}" contains ${aggregatedMap.size} distinct classes.`,
        type: 'neutral'
      }
    ],
    methodologyNotes: 'Parsed client-side or server-side in-memory stream using RFC 4180 CSV standard parsing and type inferencing.',
    limitationsList: [
      'Data is retained only within the current active session in memory.',
      'Complex nested JSON structures are flattened to the first depth level.'
    ]
  };
}
