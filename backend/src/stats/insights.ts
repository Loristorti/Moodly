import { MoodTag } from '../generated/prisma/client.js';
import { round } from '../common/utils/round.js';

export const ALERT_TYPES = [
  'DECLINE',
  'CONCERN',
  'LOW_PARTICIPATION',
  'IMPROVEMENT',
] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export interface Alert {
  type: AlertType;
  /** Average change (DECLINE, IMPROVEMENT) or a rate from 0 to 1 (CONCERN, LOW_PARTICIPATION) */
  value: number;
  /** Only for CONCERN */
  tag?: MoodTag;
}

export interface AlertInput {
  /** Average of the period, null when hidden */
  average: number | null;
  /** Average of the previous period of the same length, null when hidden */
  previousAverage: number | null;
  participationRate: number;
  /** Tags of each low answer (score 1 or 2) of the period */
  lowAnswerTags: MoodTag[][];
  threshold: number;
}

/** Average change that is worth pointing out (on a 1 to 5 scale) */
export const TREND_STEP = 0.3;
/** A theme cited in at least this share of the low answers is a concern */
export const CONCERN_SHARE = 0.4;
/** Below this participation rate, the figures are not representative */
export const LOW_PARTICIPATION_RATE = 0.5;

const MAX_ALERTS = 3;

/**
 * Short facts that help the manager decide, most urgent first.
 * Built from aggregates only, like the rest of the stats.
 */
export function buildAlerts(input: AlertInput): Alert[] {
  const alerts: Alert[] = [];

  const change =
    input.average !== null && input.previousAverage !== null
      ? round(input.average - input.previousAverage, 1)
      : null;
  if (change !== null && change <= -TREND_STEP) {
    alerts.push({ type: 'DECLINE', value: change });
  }

  const concern = mainConcern(input.lowAnswerTags, input.threshold);
  if (concern) {
    alerts.push({ type: 'CONCERN', tag: concern.tag, value: concern.share });
  }

  if (input.participationRate < LOW_PARTICIPATION_RATE) {
    alerts.push({ type: 'LOW_PARTICIPATION', value: input.participationRate });
  }

  if (change !== null && change >= TREND_STEP) {
    alerts.push({ type: 'IMPROVEMENT', value: change });
  }

  return alerts.slice(0, MAX_ALERTS);
}

/**
 * The theme cited the most in low answers, if it is cited in at least
 * CONCERN_SHARE of them. Requires at least `threshold` low answers, so that
 * the alert never describes one or two people.
 */
function mainConcern(
  lowAnswerTags: MoodTag[][],
  threshold: number,
): { tag: MoodTag; share: number } | null {
  if (lowAnswerTags.length < threshold) {
    return null;
  }
  const counts = new Map<MoodTag, number>();
  for (const tag of lowAnswerTags.flat()) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const [top] = [...counts.entries()].sort(
    ([tagA, a], [tagB, b]) => b - a || tagA.localeCompare(tagB),
  );
  if (!top) {
    return null;
  }
  const share = round(top[1] / lowAnswerTags.length, 2);
  return share >= CONCERN_SHARE ? { tag: top[0], share } : null;
}
