import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PropertyLike {
  id: string;
  title: string;
  address: string;
  type: string;
  class?: string;
  price?: number;
  sqft?: number;
  status?: string;
  lat?: number;
  lng?: number;
  yearBuilt?: number;
  occupancy?: number;
  trustScore?: number;
  images?: string[];
  keyFeatures?: string[];
  risks?: string[];
  opportunities?: string[];
  description?: string;
}

export function buildRichPropertyDescription(property: PropertyLike): string {
  const parts: string[] = [];
  parts.push(`${property.title} at ${property.address} is a ${property.type}${property.class ? `, Class ${property.class}` : ''} asset.`);
  if (property.sqft) parts.push(`The property comprises approximately ${Number(property.sqft).toLocaleString()} square feet.`);
  if (property.yearBuilt) parts.push(`Originally delivered in ${property.yearBuilt}, it has been maintained to modern standards.`);
  if (typeof property.occupancy === 'number') parts.push(`Current reported occupancy is ${property.occupancy}%.`);
  if (property.price) parts.push(`Pricing guidance is around $${Number(property.price).toLocaleString()}.`);
  if (property.status) parts.push(`Current status: ${property.status.replace('-', ' ')}.`);
  if (property.keyFeatures?.length) parts.push(`Key features include ${property.keyFeatures.join(', ')}.`);
  if (property.opportunities?.length) parts.push(`Opportunities: ${property.opportunities.join(', ')}.`);
  if (property.risks?.length) parts.push(`Considerations/Risks: ${property.risks.join(', ')}.`);
  if (typeof property.trustScore === 'number') parts.push(`Trust score: ${property.trustScore} based on verified sources and data freshness.`);
  parts.push(`Location context, tenant appeal, and surrounding amenities support continued interest from target user groups.`);
  return parts.join(' ');
}

type StatusKey = 'off-market' | 'for-sale' | 'trending' | 'flagged';

export function redistributeStatuses<T extends PropertyLike>(
  items: T[],
  weights: Record<StatusKey, number>
): T[] {
  const total = items.length;
  const order: StatusKey[] = ['off-market', 'for-sale', 'trending', 'flagged'];
  // Normalize weights to sum to 1
  const weightSum = order.reduce((s, k) => s + (weights[k] ?? 0), 0) || 1;
  const normalized = Object.fromEntries(
    order.map(k => [k, (weights[k] ?? 0) / weightSum])
  ) as Record<StatusKey, number>;

  // Base counts by floor, then distribute remainder
  const baseCounts = {} as Record<StatusKey, number>;
  let assigned = 0;
  order.forEach(k => {
    const count = Math.floor(normalized[k] * total);
    baseCounts[k] = count;
    assigned += count;
  });
  let remainder = total - assigned;
  let idx = 0;
  while (remainder > 0) {
    baseCounts[order[idx % order.length]] += 1;
    remainder -= 1;
    idx += 1;
  }

  // Build target status list
  const targetStatuses: StatusKey[] = [];
  order.forEach(k => {
    for (let i = 0; i < baseCounts[k]; i++) targetStatuses.push(k);
  });

  // Deterministic assignment by sorted id to keep UI stable
  const sorted = [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const output = new Array<T>(items.length);
  for (let i = 0; i < sorted.length; i++) {
    const status = targetStatuses[i] ?? 'for-sale';
    output[i] = { ...sorted[i], status };
  }

  // Restore original order mapping by id
  const idToItem = new Map(output.map(it => [it.id, it]));
  return items.map(it => {
    const updated = idToItem.get(it.id);
    return updated ? updated : it;
  });
}