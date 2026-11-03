import { orchestrateDataRetrieval } from './dataSources/orchestrator';
import { compileSchemaFromDataPacket } from './schemaCompiler';
import { UISchemaSchema } from '../types/schema';
import { generateCSVContent } from './csvExport';

async function runTests() {
  console.log('====================================================');
  console.log('GENUI PIPELINE & LIVE CONNECTOR VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function assertTest(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL] ${name}:`, msg);
    }
  }

  // TEST 1: Open-Meteo Weather Connector
  await assertTest('Weather connector fetches live conditions for Andhra Pradesh', async () => {
    const res = await orchestrateDataRetrieval({ prompt: 'Create a dashboard for weather conditions in Andhra Pradesh.' });
    if (!res.dataPacket) throw new Error('dataPacket is undefined');
    if (res.connectorId !== 'open_meteo') throw new Error(`Expected open_meteo connector, got ${res.connectorId}`);
    if (res.dataPacket.source.sourceType !== 'live_api') throw new Error(`Expected live_api sourceType, got ${res.dataPacket.source.sourceType}`);
    if (!res.dataPacket.source.observationPeriod) throw new Error('Missing observationPeriod');
    if (!res.dataPacket.source.retrievalTimestamp) throw new Error('Missing retrievalTimestamp');
    if (!res.dataPacket.kpis || res.dataPacket.kpis.length === 0) throw new Error('No weather KPIs returned');
    if (!res.dataPacket.charts || res.dataPacket.charts.length === 0) throw new Error('No weather charts returned');
    if (!res.dataPacket.source.provider.includes('Open-Meteo')) throw new Error('Invalid source provider');
    
    const schema = compileSchemaFromDataPacket(res.dataPacket, 'Andhra Pradesh Weather');
    const validated = UISchemaSchema.safeParse(schema);
    if (!validated.success) throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.format())}`);
  });

  // TEST 2: India GDP Growth (World Bank)
  await assertTest("World Bank connector retrieves India's GDP growth over time", async () => {
    const res = await orchestrateDataRetrieval({ prompt: "Analyze India's GDP growth and macro economic trajectory." });
    if (!res.dataPacket) throw new Error('dataPacket is undefined');
    if (res.connectorId !== 'world_bank') throw new Error(`Expected world_bank, got ${res.connectorId}`);
    if (res.dataPacket.source.sourceType !== 'live_api') throw new Error(`Expected live_api sourceType, got ${res.dataPacket.source.sourceType}`);
    if (!res.dataPacket.source.observationPeriod?.includes('Historical Reporting Span')) throw new Error('Invalid observationPeriod format');
    if (!res.dataPacket.kpis || res.dataPacket.kpis.length === 0) throw new Error('No GDP KPIs');
    if (!res.dataPacket.charts || res.dataPacket.charts.length === 0) throw new Error('No GDP charts');
    if (!res.dataPacket.source.provider.includes('World Bank')) throw new Error('Invalid source provider');
    
    const schema = compileSchemaFromDataPacket(res.dataPacket, "India GDP Growth");
    const validated = UISchemaSchema.safeParse(schema);
    if (!validated.success) throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.format())}`);
  });

  // TEST 3: Renewable Energy Trends (World Bank)
  await assertTest('World Bank connector retrieves renewable energy trends', async () => {
    const res = await orchestrateDataRetrieval({ prompt: 'Analyze energy consumption and renewable energy adoption in India.' });
    if (!res.dataPacket) throw new Error('dataPacket is undefined');
    if (res.connectorId !== 'world_bank') throw new Error(`Expected world_bank, got ${res.connectorId}`);
    if (res.dataPacket.source.sourceType !== 'live_api') throw new Error(`Expected live_api sourceType, got ${res.dataPacket.source.sourceType}`);
    if (!res.dataPacket.charts || res.dataPacket.charts.length === 0) throw new Error('No renewable charts');
    
    const schema = compileSchemaFromDataPacket(res.dataPacket, 'Renewable Energy Adoption');
    const validated = UISchemaSchema.safeParse(schema);
    if (!validated.success) throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.format())}`);
  });

  // TEST 4: Indian EV Market Intelligence
  await assertTest('Indian EV Market connector retrieves national & state adoption', async () => {
    const res = await orchestrateDataRetrieval({ prompt: 'Analyze the Indian electric vehicle market.' });
    if (!res.dataPacket) throw new Error('dataPacket is undefined');
    if (res.connectorId !== 'indian_ev_mobility') throw new Error(`Expected indian_ev_mobility, got ${res.connectorId}`);
    if (res.dataPacket.source.sourceType !== 'curated_dataset') throw new Error(`Expected curated_dataset sourceType, got ${res.dataPacket.source.sourceType}`);
    if (!res.dataPacket.tables || res.dataPacket.tables.length === 0) throw new Error('No state EV tables returned');
    
    const schema = compileSchemaFromDataPacket(res.dataPacket, 'Indian EV Market');
    const validated = UISchemaSchema.safeParse(schema);
    if (!validated.success) throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.format())}`);
  });

  // TEST 5: Tech Companies Financial Comparison
  await assertTest('Market connector produces comparative financial architecture', async () => {
    const res = await orchestrateDataRetrieval({ prompt: 'Compare the performance of technology companies.' });
    if (!res.dataPacket) throw new Error('dataPacket is undefined');
    if (res.connectorId !== 'market_intelligence') throw new Error(`Expected market_intelligence, got ${res.connectorId}`);
    if (res.dataPacket.source.sourceType !== 'curated_dataset') throw new Error(`Expected curated_dataset sourceType, got ${res.dataPacket.source.sourceType}`);
    
    const schema = compileSchemaFromDataPacket(res.dataPacket, 'Tech giants');
    const validated = UISchemaSchema.safeParse(schema);
    if (!validated.success) throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.format())}`);
  });

  // TEST 6: User In-Memory CSV Dataset
  await assertTest('User CSV dataset parses safely in memory with automated calculations', async () => {
    const mockCSV = `Date,Product_Category,Units_Sold,Revenue_INR,Region\n2025-01-01,Electronics,450,1575000,South\n2025-01-02,Apparel,820,984000,West\n2025-01-03,Groceries,1200,600000,North\n2025-01-04,Electronics,510,1785000,South`;
    const res = await orchestrateDataRetrieval({ prompt: '', fileContent: mockCSV, fileName: 'q1_retail_sales.csv' });
    if (!res.dataPacket) throw new Error('dataPacket is undefined');
    if (res.connectorId !== 'user_dataset') throw new Error(`Expected user_dataset, got ${res.connectorId}`);
    if (res.dataPacket.source.sourceType !== 'user_upload') throw new Error(`Expected user_upload sourceType, got ${res.dataPacket.source.sourceType}`);
    if (res.dataPacket.kpis[0].value !== '4') throw new Error(`Expected 4 records, got ${res.dataPacket.kpis[0].value}`);
    
    const schema = compileSchemaFromDataPacket(res.dataPacket, 'Uploaded CSV');
    const validated = UISchemaSchema.safeParse(schema);
    if (!validated.success) throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.format())}`);
  });

  // TEST 7: RFC 4180 CSV Export Generation & Formula Injection (CWE-1236) Defense
  await assertTest('CSV export correctly handles RFC 4180 escaping and sanitizes formula injection', async () => {
    const maliciousPayload = [
      { id: 1, name: 'Normal User', amount: 1500, notes: 'Paid in cash, all good' },
      { id: 2, name: '=cmd|\' /C calc\'!A0', amount: -250, notes: 'Quote test: "urgent delivery"' },
      { id: 3, name: '+@SUM(1,2)', amount: 500, notes: 'Line break\ntest' },
      { id: 4, name: 'Unicode: ₹ & €', amount: 999.95, notes: 'Tamil: வணக்கம்' }
    ];

    const csvOutput = generateCSVContent({
      fileName: 'security_test',
      title: 'Security Verification Table',
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Account Name' },
        { key: 'amount', label: 'Amount' },
        { key: 'notes', label: 'Notes' }
      ],
      data: maliciousPayload,
      sourceAttribution: 'GenUI Security Audit Suite'
    });

    // Check BOM presence
    if (!csvOutput.startsWith('\uFEFF')) {
      throw new Error('CSV output does not start with UTF-8 BOM');
    }

    // Check formula injection neutralization (prepended with single quote)
    if (!csvOutput.includes("''=cmd|' /C calc'!A0") && !csvOutput.includes("='=cmd|' /C calc'!A0") && !csvOutput.includes("'=cmd|")) {
      throw new Error('Formula injection cell beginning with = was not sanitized');
    }
    if (!csvOutput.includes("'+@SUM(1,2)") && !csvOutput.includes("'+@")) {
      throw new Error('Formula injection cell beginning with + was not sanitized');
    }

    // Check quoting of cell with comma
    if (!csvOutput.includes('"Paid in cash, all good"')) {
      throw new Error('Cell containing comma was not RFC 4180 quoted');
    }

    // Check escaping of double quotes
    if (!csvOutput.includes('"Quote test: ""urgent delivery"""')) {
      throw new Error('Cell containing double quotes was not RFC 4180 escaped');
    }

    // Check multi-line quoting
    if (!csvOutput.includes('"Line break\ntest"')) {
      throw new Error('Cell containing newline was not quoted correctly');
    }
  });

  console.log(`\nVerification Complete: ${passed}/${total} test suites PASSED.`);
  if (passed === total) {
    console.log('ALL LIVE DATA CONNECTORS & SCHEMA VALIDATIONS CONFIRMED WORKING!\n');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
