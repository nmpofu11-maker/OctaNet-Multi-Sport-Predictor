import { SportId } from '../types/sports';

export interface FixtureDiscoveryCandidate {
  id: string;
  provider: 'TheSportsDB';
  providerEventId: string;
  sport: SportId;
  date: string;
  kickoffTime: string | null;
  competition: string | null;
  eventName: string;
  selection: string | null;
  opponent: string | null;
  venue: string | null;
  status: string | null;
  homeScore: number | null;
  awayScore: number | null;
  sourceUrl: string;
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asScore(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

/**
 * Normalizes provider-supplied event records only. This deliberately does not
 * invent odds, rule scores, team statistics, or prediction-ready fixtures.
 */
export function normalizeTheSportsDbEvents(
  rawEvents: unknown[],
  requestedSport: SportId,
  requestedDate: string
): FixtureDiscoveryCandidate[] {
  const normalized: FixtureDiscoveryCandidate[] = [];
  for (const value of rawEvents) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const event = value as Record<string, unknown>;
    const providerEventId = asText(event.idEvent) ?? (
      typeof event.idEvent === 'number' && Number.isFinite(event.idEvent)
        ? String(event.idEvent)
        : null
    );
    const providerSport = asText(event.strSport)?.toLowerCase();
    if (!providerEventId || providerSport !== requestedSport.toLowerCase()) continue;

    const eventDate = asText(event.dateEvent);
    if (eventDate !== requestedDate) continue;

    const home = asText(event.strHomeTeam);
    const away = asText(event.strAwayTeam);
    const eventName = asText(event.strEvent) ?? (home && away ? `${home} vs ${away}` : null);
    if (!eventName) continue;

    normalized.push({
      id: `thesportsdb-${providerEventId}`,
      provider: 'TheSportsDB',
      providerEventId,
      sport: requestedSport,
      date: eventDate,
      kickoffTime: asText(event.strTime),
      competition: asText(event.strLeague),
      eventName,
      selection: home,
      opponent: away,
      venue: asText(event.strVenue),
      status: asText(event.strStatus),
      homeScore: asScore(event.intHomeScore),
      awayScore: asScore(event.intAwayScore),
      sourceUrl: `https://www.thesportsdb.com/event/${encodeURIComponent(providerEventId)}`,
    });
  }
  return normalized;
}
