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