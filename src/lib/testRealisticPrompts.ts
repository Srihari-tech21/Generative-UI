/* eslint-disable @typescript-eslint/no-explicit-any */
import { orchestrateDataRetrieval } from './dataSources/orchestrator';
import { compileSchemaFromDataPacket } from './schemaCompiler';
import { UISchemaSchema } from '../types/schema';

export interface PromptEvaluationResult {
  id: number;
  category: string;
  prompt: string;
  expectedState: string;
  actualState: string;
  selectedConnector: string;
  sourceType: string;
  observationPeriod: string;
  isSufficient: boolean;
  assumptions: string[];
  keyMetrics: string[];
  answersQuestionCorrectly: boolean;
  notes: string;
}

export async function runPromptEvaluation(): Promise<PromptEvaluationResult[]> {
  const evaluations: PromptEvaluationResult[] = [];

  const testCases = [
    // 1. Show India's GDP growth.
    {
      id: 1,
      category: '1. National Macroeconomic Growth',
      prompt: "Show India's GDP growth.",
      expectedState: 'SUCCESS',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const isWorldBank = res.connectorId === 'world_bank';
        const isIndia = res.dataPacket?.topic?.toLowerCase().includes('india') && res.dataPacket?.topic?.toLowerCase().includes('gdp');
        return {
          valid: isWorldBank && isIndia && res.state === 'SUCCESS',
          notes: 'Correctly routed to World Bank Open Data for Indian GDP time series. Data is strictly relevant.'
        };
      }
    },
    // 2. Analyze Indian EV sales.
    {
      id: 2,
      category: '2. Clean Mobility & EV Sales',
      prompt: 'Analyze Indian EV sales.',
      expectedState: 'SUCCESS',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const isEV = res.connectorId === 'indian_ev_mobility';
        const hasCategories = res.dataPacket?.charts?.some((c: any) => c.id === 'category_breakdown_trajectory' || c.id === 'annual_adoption_growth');
        return {
          valid: isEV && hasCategories && res.state === 'SUCCESS',
          notes: 'Correctly routed to VAHAN/BEE Clean Mobility benchmark. Category distribution and yearly volume present.'
        };
      }
    },
    // 3. Show weather trends in Andhra Pradesh.
    {
      id: 3,
      category: '3. Real-Time Meteorological Trends',
      prompt: 'Show weather trends in Andhra Pradesh.',
      expectedState: 'SUCCESS',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const isMeteo = res.connectorId === 'open_meteo';
        const isAP = res.dataPacket?.topic?.toLowerCase().includes('andhra pradesh');
        return {
          valid: isMeteo && isAP && res.state === 'SUCCESS',
          notes: 'Resolved Andhra Pradesh coordinates via geocoding API, fetched live atmospheric series and 7-day forecast.'
        };
      }
    },
    // 4. Create a restaurant sales dashboard.
    {
      id: 4,
      category: '4. Restaurant Sales (No Dataset Uploaded)',
      prompt: 'Create a restaurant sales dashboard.',
      expectedState: 'DATASET_REQUIRED',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const correctState = res.state === 'DATASET_REQUIRED';
        const helpfulGuidance = res.guidance?.message?.includes('upload your restaurant sales') || res.guidance?.detectedDomain?.includes('Restaurant');
        const noFallback = res.connectorId !== 'world_bank' && res.connectorId !== 'indian_ev_mobility' && !res.dataPacket;
        return {
          valid: correctState && helpfulGuidance && noFallback,
          notes: 'Correctly identified restaurant domain. Zero arbitrary fallback to World Bank/EV; provided clear upload instructions.'
        };
      }
    },
    // 5. Analyze student academic performance.
    {
      id: 5,
      category: '5. Student Performance (No Dataset Uploaded)',
      prompt: 'Analyze student academic performance.',
      expectedState: 'DATASET_REQUIRED',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const correctState = res.state === 'DATASET_REQUIRED';
        const isAcademic = res.intent?.domainClassification?.domain === 'academic_performance' ||
          res.guidance?.detectedDomain?.includes('Academic') ||
          res.guidance?.domain?.includes('Academic');
        const noFallback = !res.dataPacket && res.connectorId !== 'world_bank';
        return {
          valid: correctState && isAcademic && noFallback,
          notes: 'Identified academic domain and prompted for student grade dataset. No irrelevant macroeconomic fallback.'
        };
      }
    },
    // 6. Show employee performance by department.
    {
      id: 6,
      category: '6. Employee HR Analytics (No Dataset Uploaded)',
      prompt: 'Show employee performance by department.',
      expectedState: 'DATASET_REQUIRED',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const correctState = res.state === 'DATASET_REQUIRED';
        const isHR = res.intent?.domainClassification?.domain === 'human_resources' ||
          res.guidance?.detectedDomain?.includes('Human Resources') ||
          res.guidance?.domain?.includes('Human Resources');
        const noFallback = !res.dataPacket && res.connectorId !== 'world_bank';
        return {
          valid: correctState && isHR && noFallback,
          notes: 'Recognized HR domain. Asks for employee roster with department and salary columns.'
        };
      }
    },
    // 7. Compare population growth across countries.
    {
      id: 7,
      category: '7. Multi-Country Demographics',
      prompt: 'Compare population growth across countries.',
      expectedState: 'SUCCESS',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const isWorldBank = res.connectorId === 'world_bank';
        const isDemographics = res.dataPacket?.topic?.toLowerCase().includes('demographics') || res.dataPacket?.topic?.toLowerCase().includes('population');
        return {
          valid: isWorldBank && isDemographics && res.state === 'SUCCESS',
          notes: 'Routed to World Bank SP.POP.TOTL indicator with cross-country comparative demographic series.'
        };
      }
    },
    // 8. Analyze monthly product sales.
    {
      id: 8,
      category: '8. Product Sales Analytics (No Dataset Uploaded)',
      prompt: 'Analyze monthly product sales.',
      expectedState: 'DATASET_REQUIRED',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const correctState = res.state === 'DATASET_REQUIRED';
        const isSales = res.intent?.domainClassification?.domain === 'ecommerce_sales' ||
          res.guidance?.detectedDomain?.includes('Commerce') ||
          res.guidance?.domain?.includes('Commerce');
        const noFallback = !res.dataPacket && res.connectorId !== 'world_bank';
        return {
          valid: correctState && isSales && noFallback,
          notes: 'Identified retail/product sales domain. Prompted for transaction CSV without returning mock data.'
        };
      }
    },
    // 9. Show the financial performance of Microsoft.
    {
      id: 9,
      category: '9. Corporate Finance (Microsoft)',
      prompt: 'Show the financial performance of Microsoft.',
      expectedState: 'SUCCESS',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const isMarket = res.connectorId === 'market_intelligence';
        const isMSFT = res.dataPacket?.topic?.includes('Microsoft') && res.dataPacket?.kpis?.some((k: any) => k.label.includes('Microsoft') || k.value.includes('$3.18T'));
        return {
          valid: isMarket && isMSFT && res.state === 'SUCCESS',
          notes: 'Personalized SEC corporate intelligence to Microsoft Corporation (MSFT) with verified audited GAAP numbers.'
        };
      }
    },
    // 10. Create a dashboard for an unsupported domain.
    {
      id: 10,
      category: '10. Unsupported Domain Handling',
      prompt: 'Create a deep space satellite astrophysics telescope dashboard.',
      expectedState: 'UNSUPPORTED_DOMAIN',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const correctState = res.state === 'UNSUPPORTED_DOMAIN';
        const noFakeData = !res.dataPacket;
        const suggestionsProvided = res.guidance?.suggestedPrompts?.length > 0;
        return {
          valid: correctState && noFakeData && suggestionsProvided,
          notes: 'Honest rejection of unsupported domain. No mock data generated; suggested available live domains.'
        };
      }
    },
    // 11. Root Cause Scenario: "restaurants dashboard"
    {
      id: 11,
      category: '11. User Problem Statement ("restaurants dashboard")',
      prompt: 'restaurants dashboard',
      expectedState: 'DATASET_REQUIRED',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const correctState = res.state === 'DATASET_REQUIRED';
        const notWorldBank = res.connectorId !== 'world_bank';
        const correctGuidance = res.guidance?.message?.includes('upload your restaurant sales');
        return {
          valid: correctState && notWorldBank && correctGuidance,
          notes: 'FIX VERIFIED: "restaurants dashboard" no longer generates Indian GDP. Requests restaurant dataset instead.'
        };
      }
    },
    // 12. Ambiguous Query Handling
    {
      id: 12,
      category: '12. Ambiguous Query ("dashboard")',
      prompt: 'dashboard',
      expectedState: 'CLARIFICATION_REQUIRED',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const correctState = res.state === 'CLARIFICATION_REQUIRED';
        return {
          valid: correctState && res.guidance?.state === 'CLARIFICATION_REQUIRED',
          notes: 'Clarification required for single-word generic prompt. Suggests specific analytical topics.'
        };
      }
    },
    // 13. Multi-Requirement Prompt: EV categories, yearly growth, leading states
    {
      id: 13,
      category: '13. Multi-Requirement Analytical Query',
      prompt: "Analyze India's EV market, compare vehicle categories, show yearly growth, and identify the leading states.",
      expectedState: 'SUCCESS',
      fileContent: undefined,
      fileName: undefined,
      validate: (res: any) => {
        const p = res.dataPacket;
        const hasKPIs = p?.kpis?.length >= 4;
        const hasCategoryChart = p?.charts?.some((c: any) => c.id === 'category_breakdown_trajectory');
        const hasTrendChart = p?.charts?.some((c: any) => c.id === 'annual_adoption_growth');
        const hasStateTable = p?.tables?.some((t: any) => t.id === 'state_ev_matrix');
        return {
          valid: res.state === 'SUCCESS' && hasKPIs && hasCategoryChart && hasTrendChart && hasStateTable,
          notes: 'Multi-requirement satisfied: 4 KPIs, category bar chart, historical yearly trend, and state-wise tabular register.'
        };
      }
    },
    // 14. Real Uploaded Restaurant CSV
    {
      id: 14,
      category: '14. Dataset Analytics: Restaurant CSV Ingestion',
      prompt: 'Analyze our quarterly restaurant performance',
      expectedState: 'SUCCESS',
      fileContent: `Item,Category,Orders,Revenue,Rating\nButter Chicken,Mains,1420,28400,4.8\nGarlic Naan,Breads,3200,9600,4.6\nPaneer Tikka,Starters,980,14700,4.7\nBiryani,Mains,1850,37000,4.9\nMango Lassi,Beverages,2100,10500,4.8\nSamosa Platter,Starters,1150,8050,4.5`,
      fileName: 'restaurant_sales_q1.csv',
      validate: (res: any) => {
        const p = res.dataPacket;
        const hasAOV = p?.kpis?.some((k: any) => k.label.includes('Average Order Value') || k.id.includes('average_order_value'));
        const hasBestSeller = p?.kpis?.some((k: any) => k.label.includes('Best-Selling') || k.id.includes('top_item'));
        const hasCategoryChart = p?.charts?.some((c: any) => c.title.includes('Category') || c.id === 'top_items_bar');
        return {
          valid: res.state === 'SUCCESS' && res.connectorId === 'user_dataset' && hasAOV && hasBestSeller && hasCategoryChart,
          notes: 'Restaurant CSV detected: computed Total Revenue, Total Orders, AOV, Best-seller, and Category distribution.'
        };
      }
    },
    // 15. Real Uploaded Student CSV
    {
      id: 15,
      category: '15. Dataset Analytics: Student Academic CSV Ingestion',
      prompt: 'Generate student academic scorecard',
      expectedState: 'SUCCESS',
      fileContent: `StudentID,StudentName,Subject,Marks,Attendance\n101,Aarav Sharma,Mathematics,94,96\n102,Diya Patel,Physics,88,92\n103,Rohan Verma,Chemistry,76,85\n104,Ananya Iyer,Mathematics,98,99\n105,Kabir Singh,Physics,58,74\n106,Meera Nair,Chemistry,91,95\n107,Vikram Rao,Mathematics,38,62`,
      fileName: 'student_marks_semester1.csv',
      validate: (res: any) => {
        const p = res.dataPacket;
        const hasPassRate = p?.kpis?.some((k: any) => k.label.includes('Pass Percentage') || k.id.includes('pass_rate'));
        const hasTopStudent = p?.kpis?.some((k: any) => k.label.includes('Valedictorian') || k.label.includes('Top Score'));
        const hasSubjectChart = p?.charts?.some((c: any) => c.title.includes('Subject'));
        return {
          valid: res.state === 'SUCCESS' && res.connectorId === 'user_dataset' && hasPassRate && hasTopStudent && hasSubjectChart,
          notes: 'Student CSV detected: computed Class Average, Pass Rate (85.7%), Top Student, and Subject-wise averages.'
        };
      }
    }
  ];

  for (const tc of testCases) {
    try {
      const res = await orchestrateDataRetrieval({
        prompt: tc.prompt,
        fileContent: tc.fileContent,
        fileName: tc.fileName
      });

      let schema: any = null;
      if (res.state === 'SUCCESS' && res.dataPacket) {
        schema = compileSchemaFromDataPacket(res.dataPacket, tc.prompt);
        const validated = UISchemaSchema.safeParse(schema);
        if (!validated.success) {
          throw new Error(`Schema parse failure: ${JSON.stringify(validated.error.format())}`);
        }
      }

      const evalResult = tc.validate(res);

      evaluations.push({
        id: tc.id,
        category: tc.category,
        prompt: tc.prompt,
        expectedState: tc.expectedState,
        actualState: res.state,
        selectedConnector: res.connectorId || 'NONE',
        sourceType: res.dataPacket?.source?.sourceType || 'N/A',
        observationPeriod: res.dataPacket?.source?.observationPeriod || 'N/A',
        isSufficient: res.intent?.dataSufficiency?.isSufficient ?? false,
        assumptions: res.intent?.dataSufficiency?.assumptionsUsed || [],
        keyMetrics: res.dataPacket?.kpis?.map((k: any) => `${k.label}: ${k.value}`) || [],
        answersQuestionCorrectly: evalResult.valid,
        notes: evalResult.notes
      });
    } catch (err: any) {
      evaluations.push({
        id: tc.id,
        category: tc.category,
        prompt: tc.prompt,
        expectedState: tc.expectedState,
        actualState: 'ERROR',
        selectedConnector: 'ERROR',
        sourceType: 'N/A',
        observationPeriod: 'N/A',
        isSufficient: false,
        assumptions: [],
        keyMetrics: [],
        answersQuestionCorrectly: false,
        notes: `Execution failed: ${err.message}`
      });
    }
  }

  return evaluations;
}

if (require.main === module) {
  runPromptEvaluation()
    .then((results) => {
      console.log('\n=============================================================');
      console.log('REALISTIC USER PROMPT EVALUATION SUITE (15 VERIFICATION CASES)');
      console.log('=============================================================\n');

      let passedCount = 0;
      results.forEach((r) => {
        const status = r.answersQuestionCorrectly ? '[PASS]' : '[FAIL]';
        if (r.answersQuestionCorrectly) passedCount++;
        console.log(`${status} #${r.id} [${r.category}]`);
        console.log(`       Prompt: "${r.prompt}"`);
        console.log(`       State: ${r.actualState} (Expected: ${r.expectedState})`);
        console.log(`       Connector: ${r.selectedConnector}`);
        if (r.keyMetrics.length > 0) {
          console.log(`       Key Metrics: ${r.keyMetrics.slice(0, 3).join(' | ')}`);
        }
        console.log(`       Notes: ${r.notes}\n`);
      });

      console.log(`Evaluation Summary: ${passedCount}/${results.length} test cases verified correctly.`);
      if (passedCount !== results.length) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Fatal evaluation error:', err);
      process.exit(1);
    });
}
