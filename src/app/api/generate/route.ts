/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { UISchemaSchema } from '../../../types/schema';
import { orchestrateDataRetrieval } from '../../../lib/dataSources/orchestrator';
import { compileSchemaFromDataPacket } from '../../../lib/schemaCompiler';

const SYSTEM_PROMPT = `You are GenUI's AI Dashboard Architect. Your responsibility is to transform a user's natural language analytical request and REAL RETRIEVED DATA into a strict, validated JSON UI Schema.
You must output ONLY valid JSON. No markdown backticks, no markdown codeblocks, and no prose.

The JSON schema must adhere strictly to this format:
{
  "reasoning": "Explain analytical intent, why specific metrics matter, and how components are structured.",
  "title": "A descriptive, clear title for the dashboard",
  "subtitle": "Clear domain and provider context",
  "description": "Short executive summary of what this dashboard explains",
  "objective": "Primary analytical objective of this dashboard",
  "layout": "grid",
  "sources": [
    {
      "provider": "Name of provider",
      "dataset": "Name of dataset",
      "url": "https://...",
      "timestamp": "ISO Date string",
      "attribution": "Attribution statement",
      "limitations": "Known limitations or data boundaries"
    }
  ],
  "methodology": "Brief methodology explanation",
  "limitations": ["Limitation 1", "Limitation 2"],
  "insights": [
    {
      "title": "Insight headline",
      "detail": "Detailed finding backed by the data",
      "type": "positive" | "warning" | "neutral"
    }
  ],
  "widgets": [
    {
      "id": "kebab-case-id",
      "type": "kpi_card" | "line_chart" | "bar_chart" | "pie_chart" | "area_chart" | "table" | "source_transparency",
      "title": "Widget title",
      "description": "Optional widget subtitle",
      "width": "full" | "half" | "third" | "two-thirds",
      "config": {} // widget-specific data and layout parameters
    }
  ]
}

RULES:
1. ALWAYS GROUND IN REAL DATA: Use the real numbers, charts, and table rows provided in the input data packet. Do NOT invent unrelated numbers.
2. HONEST ATTRIBUTION: Preserve the source metadata, timestamp, and attribution from the data packet.
3. OUTPUT ONLY RAW JSON. No introductory words, no conversational text.`;

function cleanAndParseJSON(text: string): any {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  return JSON.parse(cleanText.trim());
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 9000) {
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
  let fileContent: string | undefined;
  let fileName: string | undefined;

  try {
    const body = await req.json();
    prompt = (body.prompt || '').trim();
    fileContent = body.fileContent;
    fileName = body.fileName;

    // Validation: Require either prompt or file upload
    if (!prompt && (!fileContent || fileContent.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Please enter a description or upload a CSV/JSON dataset.' },
        { status: 400 }
      );
    }

    if (prompt.length > 2500) {
      return NextResponse.json(
        { error: 'Prompt exceeds maximum length of 2,500 characters. Please shorten your query.' },
        { status: 400 }
      );
    }

    // STEP 1: Online Data Retrieval via the Data Source Registry
    console.log(`[GenUI Pipeline] Initiating data retrieval for query: "${prompt || fileName}"`);
    let retrievalResult;
    try {
      retrievalResult = await orchestrateDataRetrieval({ prompt, fileContent, fileName });
    } catch (dataErr: any) {
      console.error('[GenUI Pipeline Error] External data source failed:', dataErr);
      return NextResponse.json(
        {
          error: `External data retrieval failed: ${dataErr.message || 'Unable to reach provider API.'}`,
          details: 'Data connector was unable to fetch or normalize verified information for this topic.'
        },
        { status: 502 }
      );
    }

    const { dataPacket, connectorId } = retrievalResult;
    console.log(`[GenUI Pipeline] Successfully retrieved data from connector "${connectorId}" (${dataPacket.source.provider})`);

    // STEP 2: Check for Anthropic API Key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const hasValidKey = apiKey && apiKey.startsWith('sk-ant-') && !apiKey.includes('replace_with');

    // If no valid Anthropic key is configured, compile directly from the live data packet
    if (!hasValidKey) {
      console.log(`[GenUI Pipeline] Server running in Direct Data Compilation mode (no Anthropic key set). Grounding dashboard with ${dataPacket.source.provider} data.`);
      const compiledSchema = compileSchemaFromDataPacket(
        dataPacket,
        prompt || fileName || 'Analysis',
        {
          reasoningNote: `Synthesized via GenUI Deterministic Engine from ${dataPacket.source.provider}.`,
          generationMode: 'deterministic_compiled',
          aiStatus: 'No ANTHROPIC_API_KEY configured (Operating in Deterministic Engine Mode)',
          generationNotes: 'Deterministic schema compiler parsed structured telemetry directly into Zod-validated UI schema.'
        }
      );

      const validation = UISchemaSchema.safeParse(compiledSchema);
      if (validation.success) {
        return NextResponse.json({
          schema: validation.data,
          source: 'deterministic_compiled',
          connector: connectorId,
          provider: dataPacket.source.provider,
          generationMode: 'deterministic_compiled',
          aiStatus: 'unconfigured'
        });
      } else {
        return NextResponse.json(
          { error: 'Schema compilation error', details: validation.error.format() },
          { status: 500 }
        );
      }
    }

    // STEP 3: Live Claude LLM Synthesis with the real retrieved data
    console.log(`[GenUI Pipeline] Calling Anthropic API (Claude 3.5 Sonnet) with verified dataset...`);
    const userMessageContent = `User Request: "${prompt}"

Retrieved Ground Truth Data Packet:
${JSON.stringify(dataPacket, null, 2)}

Instructions:
Synthesize an interactive dashboard for the user's request. Ground all KPI cards, chart data points, and tables in the above data packet. Include source attribution, methodology notes, and deep analytical insights.`;

    let llmText = '';
    try {
      const response = await fetchWithTimeout(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 3500,
            temperature: 0.1,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessageContent }]
          })
        },
        9000
      );

      if (!response.ok) {
        throw new Error(`Anthropic endpoint returned HTTP ${response.status}`);
      }

      const resData = await response.json();
      llmText = resData.content?.[0]?.text || '';
    } catch (aiErr: any) {
      console.warn(`[GenUI Pipeline Warning] Live AI call failed or timed out (${aiErr.message}). Falling back to deterministic compilation.`);
      // Graceful fallback to verified live data compiler (keeps real data intact!)
      const compiledSchema = compileSchemaFromDataPacket(
        dataPacket,
        prompt || fileName || 'Analysis',
        {
          reasoningNote: `Compiled via Deterministic Engine after AI service reached limit/timeout (${aiErr.message}).`,
          generationMode: 'fallback_compiled',
          aiStatus: `AI invocation failed (${aiErr.message || 'timeout'}); fallen back to verified deterministic compiler`,
          generationNotes: 'Data was preserved without hallucination or mock data substitution.'
        }
      );
      return NextResponse.json({
        schema: compiledSchema,
        source: 'fallback_compiled',
        connector: connectorId,
        provider: dataPacket.source.provider,
        generationMode: 'fallback_compiled',
        aiStatus: 'fallback'
      });
    }

    // STEP 4: Parse & Validate Claude Schema Output
    let parsedSchema: any;
    try {
      parsedSchema = cleanAndParseJSON(llmText);
      parsedSchema.generationMode = 'ai_synthesized';
      parsedSchema.aiStatus = 'Claude 3.5 Sonnet Active';
    } catch (parseErr) {
      console.warn('[GenUI Pipeline Warning] AI produced non-JSON text. Falling back to structured compilation.');
      parsedSchema = compileSchemaFromDataPacket(dataPacket, prompt, {
        generationMode: 'fallback_compiled',
        aiStatus: 'AI produced non-JSON format; compiled deterministically'
      });
    }

    // Validate with Zod
    const validation = UISchemaSchema.safeParse(parsedSchema);
    if (validation.success) {
      return NextResponse.json({
        schema: validation.data,
        source: 'ai_synthesized',
        connector: connectorId,
        provider: dataPacket.source.provider,
        generationMode: 'ai_synthesized',
        aiStatus: 'active'
      });
    }

    // If validation fails, compile the validated packet
    console.warn('[GenUI Pipeline Warning] AI schema validation had discrepancies. Serving compiled data.');
    const safeCompiled = compileSchemaFromDataPacket(dataPacket, prompt, {
      generationMode: 'fallback_compiled',
      aiStatus: 'AI schema failed strict Zod validation; repaired via deterministic compiler'
    });
    return NextResponse.json({
      schema: safeCompiled,
      source: 'fallback_compiled',
      connector: connectorId,
      provider: dataPacket.source.provider,
      generationMode: 'fallback_compiled',
      aiStatus: 'repaired'
    });

  } catch (globalErr: any) {
    console.error('[GenUI Pipeline Fatal Error]:', globalErr);
    return NextResponse.json(
      {
        error: 'An unexpected server error occurred during dashboard generation.',
        message: globalErr.message || 'Internal server error.'
      },
      { status: 500 }
    );
  }
}
