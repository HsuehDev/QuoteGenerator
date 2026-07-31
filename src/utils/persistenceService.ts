import type { Quotation } from '@/types/quotation';
import type { QuotationConfig } from '@/types/config';

interface ServerQuotations {
  currentQuotation: Quotation | null;
  history: Quotation[];
}

export interface ServerData {
  quotations: ServerQuotations;
  config: QuotationConfig | null;
}

export async function loadFromServer(): Promise<ServerData | null> {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return null;
    return (await res.json()) as ServerData;
  } catch {
    return null;
  }
}

export async function saveQuotationsToServer(state: ServerQuotations): Promise<void> {
  try {
    await fetch('/api/data/quotations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch {
    // silent fail — localStorage still has the data
  }
}

export async function saveConfigToServer(config: QuotationConfig | null): Promise<void> {
  try {
    await fetch('/api/data/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  } catch {
    // silent fail — localStorage still has the data
  }
}
