import { AuditResult } from './types';

/**
 * Safely parses any value (number, string with currency/units/commas) into a clean number.
 */
export function parseNumber(val: unknown): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return 0;
    // Remove commas, match first valid number (optional negative, optional decimal)
    const cleaned = trimmed.replace(/,/g, '');
    const match = cleaned.match(/-?\d+(?:\.\d+)?/);
    if (match) {
      const parsed = parseFloat(match[0]);
      return isNaN(parsed) ? 0 : parsed;
    }
  }
  return 0;
}

/**
 * Tries to parse strings containing JSON, markdown code blocks, or embedded JSON arrays/objects.
 */
function parsePotentialJson(val: unknown): unknown {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  // 1. Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Markdown code block: ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Extract JSON array [...]
  const arrayMatch = trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {}
  }

  // 4. Extract JSON object {...}
  const objMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch {}
  }

  return null;
}

/**
 * Normalizes a single raw item or n8n node output into a strictly typed AuditResult.
 */
function normalizeSingleItem(item: unknown): AuditResult | null {
  if (!item || typeof item !== 'object') return null;

  const raw = item as Record<string, unknown>;

  // Handle standard n8n { json: { ... } } wrapper
  const src =
    raw.json && typeof raw.json === 'object'
      ? (raw.json as Record<string, unknown>)
      : raw;

  // ── Unpack Climatiq nested sub-objects ──────────────────────────────────
  // Climatiq returns: { co2e, co2e_unit, emission_factor: { category, region },
  //                     activity_data: { activity_value, activity_unit } }
  const activityData =
    src.activity_data && typeof src.activity_data === 'object'
      ? (src.activity_data as Record<string, unknown>)
      : null;

  const emissionFactor =
    src.emission_factor && typeof src.emission_factor === 'object'
      ? (src.emission_factor as Record<string, unknown>)
      : null;

  // Extract type — prefer explicit field, then Climatiq emission_factor.category
  const rawType =
    src.type ??
    src.utility_type ??
    src.utilityType ??
    src.category ??
    src.service ??
    src.fuel_type ??
    src.fuelType ??
    src.source ??
    src.bill_type ??
    src.billType ??
    emissionFactor?.category ??
    '';

  const typeStr = String(rawType).toLowerCase().trim();

  // Extract company name
  const companyName = String(
    src.company_name ??
      src.companyName ??
      src.company ??
      src.vendor ??
      src.provider ??
      src.organization ??
      src.supplier ??
      src.name ??
      src.fileName ??
      src.filename ??
      ''
  ).trim();

  // Extract consumption value — prefer explicit field, then Climatiq activity_data.activity_value
  const consumptionVal = parseNumber(
    src.consumption_value ??
      src.consumptionValue ??
      src.consumption ??
      src.value ??
      src.usage ??
      src.quantity ??
      src.original_value ??
      src.originalValue ??
      src.units_consumed ??
      activityData?.activity_value
  );

  // Extract consumption unit — prefer explicit field, then Climatiq activity_data.activity_unit
  const consumptionUnit = String(
    src.consumption_unit ??
      src.consumptionUnit ??
      src.unit ??
      src.uom ??
      src.metric_unit ??
      activityData?.activity_unit ??
      ''
  ).trim();

  // Extract cost amount
  const costVal = parseNumber(
    src.cost_amount ??
      src.costAmount ??
      src.cost ??
      src.amount ??
      src.total_cost ??
      src.totalCost ??
      src.price ??
      src.bill_amount ??
      src.total_amount
  );

  // Extract currency
  const currencyStr = String(
    src.currency ??
      src.currency_code ??
      src.currencyCode ??
      src.cost_currency ??
      src.curr ??
      'USD'
  ).trim();

  // Extract total CO2e
  const co2eVal = parseNumber(
    src.total_co2e ??
      src.totalCO2e ??
      src.total_co2 ??
      src.totalCO2 ??
      src.co2e ??
      src.co2e_kg ??
      src.co2_kg ??
      src.carbon_footprint ??
      src.emissions ??
      src.emission_kg ??
      src.co2
  );

  // Extract CO2e unit
  const co2eUnit = String(
    src.co2e_unit ??
      src.co2eUnit ??
      src.co2_unit ??
      src.unit_co2e ??
      'kg'
  ).trim();

  // Extract emission region — prefer explicit field, then Climatiq emission_factor.region
  const emissionRegion = String(
    src.emission_region ??
      src.emissionRegion ??
      src.region ??
      src.country ??
      src.location ??
      emissionFactor?.region ??
      '—'
  ).trim();

  // Infer type if empty — check unit, then Climatiq activity_id
  let finalType = typeStr;
  if (!finalType) {
    const unitLower = consumptionUnit.toLowerCase();
    const activityId = String(emissionFactor?.activity_id ?? '').toLowerCase();
    if (unitLower.includes('kwh') || unitLower.includes('mwh') || activityId.includes('electricity')) {
      finalType = 'electricity';
    } else if (unitLower.includes('m3') || unitLower.includes('gal') || activityId.includes('water')) {
      finalType = 'water';
    } else if (unitLower.includes('l') || unitLower.includes('kg') || unitLower.includes('ton') || activityId.includes('fuel')) {
      finalType = 'fuel';
    } else {
      finalType = 'utility';
    }
  }

  return {
    type: finalType,
    company_name: companyName || 'Unknown Provider',
    consumption_value: consumptionVal,
    consumption_unit: consumptionUnit,
    cost_amount: costVal,
    currency: currencyStr,
    total_co2e: co2eVal,
    co2e_unit: co2eUnit || 'kg',
    emission_region: emissionRegion,
  };
}

/**
 * Recursively parses and extracts AuditResult items from any webhook response structure.
 */
export function normalizeAuditResults(input: unknown): AuditResult[] {
  if (!input) return [];

  // 1. If input is a string
  if (typeof input === 'string') {
    const parsed = parsePotentialJson(input);
    if (parsed) {
      return normalizeAuditResults(parsed);
    }
    return [];
  }

  // ── FAST PATH: Climatiq API array ─────────────────────────────────────
  // Climatiq responses are arrays of objects that always contain 'co2e'.
  // Detect this pattern and normalize ALL items directly — skip generic
  // wrapper detection that would otherwise only return the first item.
  if (
    Array.isArray(input) &&
    input.length > 0 &&
    input.every((el) => el && typeof el === 'object' && 'co2e' in (el as object))
  ) {
    const results: AuditResult[] = [];
    for (const item of input) {
      const normalized = normalizeSingleItem(item);
      if (normalized) results.push(normalized);
    }
    return results;
  }

  // 2. If input is an Array
  if (Array.isArray(input)) {
    const results: AuditResult[] = [];
    for (const item of input) {
      if (!item) continue;

      if (typeof item === 'string') {
        const parsed = parsePotentialJson(item);
        if (parsed) {
          results.push(...normalizeAuditResults(parsed));
        }
        continue;
      }

      if (Array.isArray(item)) {
        results.push(...normalizeAuditResults(item));
        continue;
      }

      if (typeof item === 'object') {
        const obj = item as Record<string, unknown>;

        if (obj.output) {
          results.push(...normalizeAuditResults(obj.output));
          continue;
        }
        if (obj.data && (Array.isArray(obj.data) || typeof obj.data === 'object' || typeof obj.data === 'string')) {
          results.push(...normalizeAuditResults(obj.data));
          continue;
        }
        if (obj.results && (Array.isArray(obj.results) || typeof obj.results === 'object' || typeof obj.results === 'string')) {
          results.push(...normalizeAuditResults(obj.results));
          continue;
        }
        if (obj.text) {
          results.push(...normalizeAuditResults(obj.text));
          continue;
        }
        if (obj.message && typeof obj.message === 'object') {
          const msg = obj.message as Record<string, unknown>;
          if (msg.content) {
            results.push(...normalizeAuditResults(msg.content));
            continue;
          }
        }

        const normalized = normalizeSingleItem(item);
        if (normalized) {
          results.push(normalized);
        }
      }
    }
    return results;
  }

  // 3. If input is an Object
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;

    if (obj.results) return normalizeAuditResults(obj.results);
    if (obj.data) return normalizeAuditResults(obj.data);
    if (obj.output) return normalizeAuditResults(obj.output);
    if (obj.items) return normalizeAuditResults(obj.items);
    if (obj.response) return normalizeAuditResults(obj.response);
    if (obj.result) return normalizeAuditResults(obj.result);
    if (obj.body) return normalizeAuditResults(obj.body);
    if (obj.message) return normalizeAuditResults(obj.message);
    if (obj.content) return normalizeAuditResults(obj.content);
    if (obj.text) return normalizeAuditResults(obj.text);
    if (obj.payload) return normalizeAuditResults(obj.payload);

    if (Array.isArray(obj.choices) && obj.choices.length > 0) {
      const firstChoice = obj.choices[0] as Record<string, unknown>;
      if (firstChoice.message) return normalizeAuditResults(firstChoice.message);
      if (firstChoice.text) return normalizeAuditResults(firstChoice.text);
    }

    const single = normalizeSingleItem(input);
    if (
      single &&
      (single.consumption_value > 0 ||
        single.total_co2e > 0 ||
        single.cost_amount > 0 ||
        single.company_name !== 'Unknown Provider' ||
        ['water', 'fuel', 'electricity'].includes(single.type))
    ) {
      return [single];
    }
  }

  return [];
}
