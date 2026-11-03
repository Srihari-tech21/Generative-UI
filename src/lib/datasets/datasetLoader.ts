import * as fs from 'fs';
import * as path from 'path';
import { getDatasetById } from './catalog';
import { parseCSVToRows } from '../dataSources/csvParser';
import { DatasetCatalogItem, DatasetPreviewResult } from './datasetTypes';

/**
 * Loads the raw CSV/JSON content of a dataset by its ID or catalog item.
 * Supports server-side filesystem reading (Node/Next API) and fallback client fetch.
 */
export async function loadDatasetContent(datasetIdOrItem: string | DatasetCatalogItem): Promise<string> {
  const item = typeof datasetIdOrItem === 'string' ? getDatasetById(datasetIdOrItem) : datasetIdOrItem;
  if (!item) {
    throw new Error(`Dataset "${typeof datasetIdOrItem === 'string' ? datasetIdOrItem : 'unknown'}" not found in catalog.`);
  }

  // 1. Server-side filesystem read
  if (typeof window === 'undefined') {
    try {
      const cleanRelPath = item.filePath.startsWith('/') ? item.filePath.slice(1) : item.filePath;
      const fullPath = path.join(process.cwd(), 'public', cleanRelPath);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf-8');
      }
    } catch (fsErr) {
      console.warn(`[DatasetLoader] Filesystem read failed for ${item.id}:`, fsErr);
    }
  }

  // 2. Client-side fetch
  if (typeof fetch !== 'undefined') {
    try {
      const response = await fetch(item.filePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} when fetching ${item.filePath}`);
      }
      return await response.text();
    } catch (fetchErr) {
      throw new Error(`Unable to load dataset "${item.id}": ${(fetchErr as Error).message}`);
    }
  }

  throw new Error(`Environment cannot load dataset "${item.id}" (neither fs nor fetch is available).`);
}

/**
 * Loads a structured preview of the dataset (headers and top N rows)
 */
export async function loadDatasetPreview(datasetId: string, limit = 10): Promise<DatasetPreviewResult> {
  const item = getDatasetById(datasetId);
  if (!item) {
    throw new Error(`Dataset "${datasetId}" not found in catalog.`);
  }

  const rawContent = await loadDatasetContent(item);
  const rows = parseCSVToRows(rawContent, limit);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : item.columns;

  return {
    metadata: item,
    headers,
    rows,
    totalRows: item.recordCount
  };
}
