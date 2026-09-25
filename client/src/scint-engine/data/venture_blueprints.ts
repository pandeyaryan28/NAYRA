import blueprintsJson from './all_venture_blueprints.json';
import type { VentureBlueprint } from '../types/index';

export const VENTURE_BLUEPRINTS: Record<string, VentureBlueprint> = blueprintsJson as unknown as Record<string, VentureBlueprint>;
export const ALL_BLUEPRINT_IDS = Object.keys(VENTURE_BLUEPRINTS);

export const DEFAULT_BLUEPRINT_ID = 'acid-grade-fluorspar';

export function getBlueprintById(id: string): VentureBlueprint | null {
  return VENTURE_BLUEPRINTS[id] || null;
}
