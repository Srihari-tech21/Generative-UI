/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import { 
  getAllIndustries, 
  getAllDatasets, 
  getDatasetById, 
  getDatasetsByIndustry, 
  searchDatasets,
  findMatchingDatasetForPrompt
} from './datasets/catalog';
import { loadDatasetContent, loadDatasetPreview } from './datasets/datasetLoader';
import { processUploadedDataset } from './dataSources/csvParser';
import { orchestrateDataRetrieval } from './dataSources/orchestrator';
import { compileSchemaFromDataPacket } from './schemaCompiler';
import { UISchemaSchema } from '../types/schema';

async function runIndustryDataHubTests() {
  console.log('\n======================================================');
  console.log('--- GENUI INDUSTRY DATA HUB TEST SUITE ---');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  // --- SUITE 1: 12 Industries Registry Verification ---
  console.log('--- SUITE 1: 12 Industries Registry Verification ---');
  const industries = getAllIndustries();
  assert(industries.length === 12, `Total industries count must be 12 (Found: ${industries.length})`);
  
  const expectedIndustryIds = [
    'restaurants', 'business', 'theatres', 'healthcare',
    'retail', 'education', 'hotels', 'logistics',
    'banking', 'fitness', 'energy', 'agriculture'
  ];

  for (const expId of expectedIndustryIds) {
    const found = industries.find(i => i.id === expId);
    assert(Boolean(found), `Industry "${expId}" is properly registered with full metadata`);
  }

  // --- SUITE 2: 36 Datasets Catalog Verification ---
  console.log('\n--- SUITE 2: 36 Datasets Catalog Verification ---');
  const allDatasets = getAllDatasets();
  assert(allDatasets.length === 36, `Total catalog datasets count must be 36 (Found: ${allDatasets.length})`);

  for (const expId of expectedIndustryIds) {
    const industryDatasets = getDatasetsByIndustry(expId as any);
    assert(industryDatasets.length === 3, `Industry "${expId}" contains exactly 3 datasets (Found: ${industryDatasets.length})`);
  }

  // --- SUITE 3: Physical CSV File Existence & Schema Consistency ---
  console.log('\n--- SUITE 3: Physical CSV File Integrity & Header Reconciliation ---');
  for (const ds of allDatasets) {
    const fullPath = path.join(process.cwd(), 'public', ds.filePath.startsWith('/') ? ds.filePath.slice(1) : ds.filePath);
    const exists = fs.existsSync(fullPath);
    assert(exists, `CSV file exists on disk: ${ds.filePath}`);

    if (exists) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.trim().split('\n').filter(l => l.trim().length > 0);
      assert(lines.length >= 2, `${ds.id}: File contains headers and data rows`);
      
      const fileHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const missingInFile = ds.columns.filter(c => !fileHeaders.includes(c));
      assert(missingInFile.length === 0, `${ds.id}: All catalog columns exist in physical CSV headers`);
      
      const dataRowCount = lines.length - 1;
      assert(dataRowCount === ds.recordCount, `${ds.id}: Row count matches catalog recordCount (${dataRowCount} == ${ds.recordCount})`);
    }
  }

  // --- SUITE 4: Dataset Parsing & Mathematical Metrics Engine ---
  console.log('\n--- SUITE 4: Dataset Ingestion & Analytical Parsing Engine ---');
  for (const ds of allDatasets) {
    const rawContent = await loadDatasetContent(ds.id);
    const packet = processUploadedDataset(rawContent, `${ds.id}.csv`);

    assert(Boolean(packet), `${ds.id}: Successfully parsed into valid DataPacket`);
    assert(packet.kpis.length >= 2, `${ds.id}: Generated ${packet.kpis.length} relevant KPIs`);
    assert(packet.charts.length >= 1, `${ds.id}: Generated ${packet.charts.length} charts`);
    assert(packet.tables.length > 0 && packet.tables[0].data.length > 0, `${ds.id}: Generated searchable data table with ${packet.tables[0]?.data.length} rows`);
    assert(Boolean(packet.source), `${ds.id}: Source metadata verified`);
  }

  // --- SUITE 5: Natural Language Dataset Intent Matching ---
  console.log('\n--- SUITE 5: Natural Language Dataset Matching ---');
  const nlQueries = [
    { query: 'Show restaurant revenue and menu sales', expectedIndustry: 'restaurants' },
    { query: 'Analyze theatre occupancy and box office collections', expectedIndustry: 'theatres' },
    { query: 'Compare hospital departments and patient appointments', expectedIndustry: 'healthcare' },
    { query: 'Show student attendance trends and marks', expectedIndustry: 'education' },
    { query: 'Analyze hotel room bookings and RevPAR', expectedIndustry: 'hotels' },
    { query: 'Compare monthly retail transactions and store sales', expectedIndustry: 'retail' },
    { query: 'Analyze delivery performance and shipment routes', expectedIndustry: 'logistics' },
    { query: 'Evaluate loan portfolio risk and banking deposits', expectedIndustry: 'banking' },
    { query: 'Gym membership attendance and MRR subscription revenue', expectedIndustry: 'fitness' },
    { query: 'Electricity consumption and grid generation mix', expectedIndustry: 'energy' },
    { query: 'Analyze crop production, mandi prices and rainfall yield', expectedIndustry: 'agriculture' },
    { query: 'Review corporate business revenue and department expenses', expectedIndustry: 'business' }
  ];

  for (const test of nlQueries) {
    const matched = findMatchingDatasetForPrompt(test.query);
    assert(
      Boolean(matched && matched.industry === test.expectedIndustry),
      `Prompt "${test.query}" correctly matched to ${test.expectedIndustry} dataset (${matched?.id || 'none'})`
    );
  }

  // --- SUITE 6: End-to-End Orchestration & Schema Compilation ---
  console.log('\n--- SUITE 6: End-to-End Orchestration & Schema Compilation for 12 Industries ---');
  const testSampleDatasets = [
    'restaurant_sales',
    'business_revenue',
    'theatre_bookings',
    'hospital_appointments',
    'retail_transactions',
    'student_performance',
    'hotel_bookings',
    'delivery_performance',
    'loan_portfolio',
    'gym_memberships',
    'electricity_consumption',
    'crop_production'
  ];

  for (const dsId of testSampleDatasets) {
    const ds = getDatasetById(dsId)!;
    const retrieval = await orchestrateDataRetrieval({
      datasetId: dsId,
      prompt: ds.samplePrompts[0]
    });

    assert(retrieval.state === 'SUCCESS', `${dsId}: Orchestration succeeded with SUCCESS state`);
    assert(Boolean(retrieval.dataPacket), `${dsId}: Valid DataPacket returned`);

    if (retrieval.dataPacket) {
      const compiledSchema = compileSchemaFromDataPacket(
        retrieval.dataPacket,
        ds.samplePrompts[0],
        {
          reasoningNote: `Compiled for ${ds.name}`,
          generationMode: 'deterministic_compiled',
          aiStatus: 'verified'
        }
      );

      const parsed = UISchemaSchema.safeParse(compiledSchema);
      assert(parsed.success, `${dsId}: Compiled schema passed strict Zod validation`);
      assert(compiledSchema.widgets.length >= 4, `${dsId}: Dashboard contains ${compiledSchema.widgets.length} UI widgets`);
    }
  }

  // --- SUITE 7: Edge Cases & Error Handling ---
  console.log('\n--- SUITE 7: Edge Cases & Error Handling ---');
  
  // 1. Invalid dataset ID
  try {
    await loadDatasetContent('non_existent_id_123');
    assert(false, 'Expected error for non-existent dataset ID');
  } catch (err: any) {
    assert(err.message.includes('not found in catalog'), 'Correctly caught error for non-existent dataset ID');
  }

  // 2. Empty query search
  const allFound = searchDatasets('');
  assert(allFound.length === 36, 'Empty search query returns all 36 datasets');

  // 3. Keyword search
  const occupancyDatasets = searchDatasets('occupancy');
  assert(occupancyDatasets.length >= 2, `Search for "occupancy" returns relevant datasets (Found: ${occupancyDatasets.length})`);

  // 4. Preview Loader
  const preview = await loadDatasetPreview('restaurant_sales', 5);
  assert(preview.rows.length === 5, `Preview loader returns requested limit (5 rows)`);
  assert(preview.headers.length >= 5, `Preview loader returns correct headers`);

  console.log('\n======================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runIndustryDataHubTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
