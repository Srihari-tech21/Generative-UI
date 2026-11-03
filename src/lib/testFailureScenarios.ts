/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { safeFetch } from './dataSources/security';
import { parseCSVToRows, processUploadedDataset } from './dataSources/csvParser';
import { generateCSVContent } from './csvExport';
import { compileSchemaFromDataPacket } from './schemaCompiler';
import { UISchemaSchema } from '../types/schema';

async function runFailureSuite() {
  console.log('\n=============================================================');
  console.log('FAILURE SCENARIOS & ADVERSARIAL STRESS TEST SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let total = 0;

  function assertFailure(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`[PASS] ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`[FAIL] ${name}:`, err.message);
          });
      }
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. SSRF Protection: Private Host Access
  await assertFailure('SSRF Guard: Prohibits private IP / AWS metadata requests', async () => {
    let blocked = false;
    try {
      await safeFetch('https://169.254.169.254/latest/meta-data/');
    } catch (e: any) {
      if (e.message.includes('SSRF Guard') || e.message.includes('Prohibited private host')) {
        blocked = true;
      }
    }
    if (!blocked) throw new Error('Failed to block private IP');
  });

  // 2. SSRF Protection: Non-approved External Domain
  await assertFailure('Domain Allowlist: Rejects non-whitelisted external URLs', async () => {
    let blocked = false;
    try {
      await safeFetch('https://malicious-external-exfiltration-site.com/api/data');
    } catch (e: any) {
      if (e.message.includes('Destination not in approved connector allowlist')) {
        blocked = true;
      }
    }
    if (!blocked) throw new Error('Failed to reject unapproved domain');
  });

  // 3. Protocol Security: HTTP vs HTTPS Enforcement
  await assertFailure('Protocol Guard: Enforces HTTPS only', async () => {
    let blocked = false;
    try {
      await safeFetch('http://api.open-meteo.com/v1/forecast');
    } catch (e: any) {
      if (e.message.includes('Only HTTPS destinations are allowed')) {
        blocked = true;
      }
    }
    if (!blocked) throw new Error('Allowed insecure HTTP connection');
  });

  // 4. Timeout Guard: Aborts when provider does not respond
  await assertFailure('Timeout Guard: Aborts request exceeding timeout threshold', async () => {
    let timedOut = false;
    try {
      // 1ms timeout will trigger abort immediately
      await safeFetch('https://api.open-meteo.com/v1/forecast?latitude=16.5&longitude=80.5&current=temperature_2m', {
        timeoutMs: 1
      });
    } catch (e: any) {
      if (e.message.includes('timed out') || e.name === 'AbortError') {
        timedOut = true;
      }
    }
    if (!timedOut) throw new Error('Did not abort on timeout');
  });

  // 5. Empty Dataset Parsing: 0-byte upload
  assertFailure('CSV Parser: Rejects completely empty file upload', () => {
    let caught = false;
    try {
      processUploadedDataset('', 'empty.csv');
    } catch (e: any) {
      if (e.message.includes('at least a header row and one data row')) {
        caught = true;
      }
    }
    if (!caught) throw new Error('Allowed empty CSV');
  });

  // 6. Header-only Dataset: No data rows
  assertFailure('CSV Parser: Rejects header-only CSV with zero records', () => {
    let caught = false;
    try {
      processUploadedDataset('Date,Product,Revenue\n', 'headers_only.csv');
    } catch (e: any) {
      if (e.message.includes('at least a header row and one data row')) {
        caught = true;
      }
    }
    if (!caught) throw new Error('Allowed header-only CSV');
  });

  // 7. Formula Injection Sanitization (CWE-1236)
  assertFailure('CSV Export: Neutralizes spreadsheet formula injection (=, +, -, @)', () => {
    const malicious = [
      { col: '=cmd|\' /C calc\'!A0' },
      { col: '+2+5' },
      { col: '-@SUM(1,2)' },
      { col: '\tTAB_ATTACK' }
    ];
    const output = generateCSVContent({
      columns: [{ key: 'col', label: 'Injected Column' }],
      data: malicious
    });

    if (output.includes('\n=cmd') || output.includes('\n+2+5') || output.includes('\n-@')) {
      throw new Error('Unsanitized formula injection detected in CSV output');
    }
    // Must be prefixed with single quote
    if (!output.includes("''=cmd") && !output.includes("'=cmd")) {
      throw new Error('Formula cell was not single-quote neutralized');
    }
  });

  // 8. Missing API Key Fallback: Deterministic Mode Integrity
  assertFailure('Missing Key Fallback: Operates in Deterministic Mode without hallucinating', () => {
    const mockPacket = {
      domain: 'Test Domain',
      topic: 'Test Topic',
      source: {
        provider: 'Test Provider',
        dataset: 'Test Set',
        url: 'https://test.com',
        sourceType: 'curated_dataset' as const,
        observationPeriod: '2025',
        timestamp: new Date().toISOString(),
        attribution: 'Test Attribution'
      },
      kpis: [{ id: 'k1', label: 'Metric', value: '100', unit: 'Units' }],
      charts: [],
      tables: [],
      insights: []
    };

    const schema = compileSchemaFromDataPacket(mockPacket, 'Test Query', {
      generationMode: 'deterministic_compiled',
      aiStatus: 'No ANTHROPIC_API_KEY configured (Operating in Deterministic Engine Mode)'
    });

    const parsed = UISchemaSchema.safeParse(schema);
    if (!parsed.success) throw new Error('Deterministic schema validation failed');
    if (schema.generationMode !== 'deterministic_compiled') throw new Error('Invalid generation mode');
    if (schema.widgets.length === 0) throw new Error('No widgets generated');
  });

  // 9. AI Failure Fallback: Preserves Real Data and Flags Fallback Mode
  assertFailure('AI Failure Fallback: Preserves real data packet and marks fallback_compiled', () => {
    const mockPacket = {
      domain: 'Live Telemetry',
      topic: 'Live Weather',
      source: {
        provider: 'Open-Meteo',
        dataset: 'Atmospheric Model',
        url: 'https://open-meteo.com',
        sourceType: 'live_api' as const,
        observationPeriod: 'Live',
        timestamp: new Date().toISOString(),
        attribution: 'Open-Meteo CC BY 4.0'
      },
      kpis: [{ id: 'temp', label: 'Temp', value: '28.4°C', unit: '°C' }],
      charts: [],
      tables: [],
      insights: []
    };

    const schema = compileSchemaFromDataPacket(mockPacket, 'Live Weather', {
      generationMode: 'fallback_compiled',
      aiStatus: 'AI invocation failed (500 Overloaded); fallen back to verified deterministic compiler'
    });

    if (schema.generationMode !== 'fallback_compiled') throw new Error('Did not set fallback_compiled mode');
    if (!schema.aiStatus?.includes('500 Overloaded')) throw new Error('Did not preserve AI error context');
    // Ensure data was NOT replaced with mock data
    if (schema.widgets[0].config.value !== '28.4°C') throw new Error('Live telemetry was corrupted');
  });

  console.log(`\nFailure Suite Summary: ${passed}/${total} test scenarios verified successfully.`);
  if (passed !== total) {
    process.exit(1);
  }
}

runFailureSuite().catch(err => {
  console.error('Fatal failure suite error:', err);
  process.exit(1);
});
