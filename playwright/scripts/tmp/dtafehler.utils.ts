import { DataTable } from '@cucumber/cucumber';
import apiClient from '../../generate/api/client';
import type { DtaFehler } from '../../generate/types/api-models';

interface DtaFehlerContext {
  ktan: string;
}

interface CreateDtaFehlerOptions {
  satzId?: string;
  satzsammlungId?: string;
}

/**
 * Helper function to create a single DtaFehler from DataTable rowsHash
 * @param context - The Cucumber context containing ktan
 * @param dataTable - The DataTable from the Cucumber step (using rowsHash)
 * @param options - Optional parameters for satzId and satzsammlungId
 * @returns Created DtaFehler object
 */
export async function createDtaFehlerFromRowsHash(
  context: DtaFehlerContext,
  dataTable: DataTable,
  options?: CreateDtaFehlerOptions
): Promise<DtaFehler> {
  const data = dataTable.rowsHash();

  const response = await apiClient.dtaFehler.createDtaFehler({
    ktan: context.ktan,
    fehlernachricht: data.fehlernachricht,
    fehlerTyp: data.fehlerTyp,
    automatischeKorrektur: data.automatischeKorrektur === 'true',
    ...(options?.satzId && { satz: options.satzId }),
    ...(options?.satzsammlungId && { satzsammlung: options.satzsammlungId })
  });

  return response.data as DtaFehler;
}

/**
 * Helper function to process DataTable and create DtaFehler entries
 * @param context - The Cucumber context containing ktan
 * @param dataTable - The DataTable from the Cucumber step
 * @param options - Optional parameters for satzId and satzsammlungId
 * @returns Array of created DtaFehler objects
 */
export async function createDtaFehlerFromTable(
  context: DtaFehlerContext,
  dataTable: DataTable,
  options?: CreateDtaFehlerOptions
): Promise<DtaFehler[]> {
  const entries = dataTable.hashes();
  const createdFehler: DtaFehler[] = [];

  for (const entry of entries) {
    const response = await apiClient.dtaFehler.createDtaFehler({
      ktan: context.ktan,
      fehlernachricht: entry.fehlernachricht,
      fehlerTyp: entry.fehlerTyp,
      automatischeKorrektur: entry.automatischeKorrektur === 'true',
      ...(options?.satzId && { satz: options.satzId }),
      ...(options?.satzsammlungId && { satzsammlung: options.satzsammlungId })
    });
    createdFehler.push(response.data as DtaFehler);
  }

  return createdFehler;
}
