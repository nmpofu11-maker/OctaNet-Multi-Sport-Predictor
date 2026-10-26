/** TEST ONLY: synthetic fixtures used to exercise engine behavior. Never use these as real match evidence. */
import {
  ALL_SPORTS,
  DailyFixture,
  HistoricalMatchRow,
  RuleScoreVector,
  SportId,
} from '../../types/sports';
import { isVolatileCompetition } from '../sportRules';

interface SportPoolConfig {
  competitions: string[];
  volatileCompetitions: string[];
  venues: string[];
  competitors: string[];
  volatileCompetitors: [string, string][];
  derbyPairs: [string, string][];
  markets: string[];
  statTemplates: (v: number, gapSpots: number, isDerby: boolean) => string;
}

const SPORT_POOLS: Record<SportId, SportPoolConfig> = {
  [SportId.Soccer]: {
    competitions: [
      'Premier League',
      'La Liga',
      'Serie A',
      'Bundesliga',
      'Ligue 1',
      'UEFA Champions League',
    ],
    volatileCompetitions: [
      'J1 League (Japan)',
      'K League 1 (South Korea)',
      'Eliteserien (Norway)',
      'Allsvenskan (Sweden)',
      'SuperLiga Romania',
    ],
    venues: [
      'Emirates Stadium',
      'Santiago Bernabeu',
      'San Siro',
      'Allianz Arena',
      'Anfield',
      'Signal Iduna Park',
      'Estadio Metropolitano',
      'Villa Park',
    ],
    competitors: [
      'Arsenal',
      'Liverpool',
      'Real Madrid',
      'Inter Milan',
      'Bayern Munich',
      'Barcelona',
      'Atletico Madrid',
      'Bayer Leverkusen',
      'Aston Villa',
      'Borussia Dortmund',
      'Napoli',
      'PSG',
      'Brighton',
      'Newcastle United',
      'Atalanta',
      'RB Leipzig',
      'Sporting CP',
      'Tottenham',
      'AC Milan',
      'Villarreal',
    ],
    volatileCompetitors: [
      ['Vissel Kobe', 'Yokohama F. Marinos'],
      ['Ulsan HD', 'FC Seoul'],
      ['Bodo/Glimt', 'Molde FK'],
      ['Malmo FF', 'Djurgardens IF'],
      ['FCSB', 'CFR Cluj'],
    ],
    derbyPairs: [
      ['Arsenal', 'Tottenham'],
      ['Real Madrid', 'Barcelona'],
      ['Real Madrid', 'Atletico Madrid'],
      ['Inter Milan', 'AC Milan'],
      ['Bayern Munich', 'Borussia Dortmund'],
    ],
    markets: [
      'Moneyline (1X2)',
      'Asian Handicap -0.75',
      'Asian Handicap -0.5',
      'Draw No Bet',
      'Over 2.5 & Team Win',
    ],
    statTemplates: (v, gapSpots, isDerby) =>
      `L5 SoT +${(1.8 + v * 3.6).toFixed(1)} · Gap ${gapSpots} spots${isDerby ? ' · Derby' : ''}`,
  },
  [SportId.Tennis]: {
    competitions: [
      'ATP Vienna Indoor 500',
      'ATP Basel Indoor 500',
      'WTA Tokyo Open 500',
      'ATP Paris Masters 1000',
    ],
    volatileCompetitions: [
      'ATP 250 Almaty',
      'WTA 250 Guangzhou',
      'ATP Challenger Brest',
    ],
    venues: [
      'Indoor Hard · CPI 39.4',
      'Indoor Hard · CPI 41.2',
      'Outdoor Hard · CPI 36.8',
      'Fast Indoor Plexipave',
      'DecoTurf Center Court',
    ],
    competitors: [
      'Jannik Sinner',
      'Carlos Alcaraz',
      'Aryna Sabalenka',
      'Iga Swiatek',
      'Alexander Zverev',
      'Daniil Medvedev',
      'Coco Gauff',
      'Taylor Fritz',
      'Alex de Minaur',
      'Elena Rybakina',
      'Jack Draper',
      'Tommy Paul',
      'Jessica Pegula',
      'Holger Rune',
      'Grigor Dimitrov',
      'Mirra Andreeva',
      'Lorenzo Musetti',
      'Ben Shelton',
      'Qinwen Zheng',
      'Hubert Hurkacz',
    ],
    volatileCompetitors: [
      ['Gabriel Diallo', 'Bu Yunchaokete'],
      ['Olga Danilovic', 'Viktorija Golubic'],
      ['Otto Virtanen', 'Benjamin Bonzi'],
    ],
    derbyPairs: [
      ['Jannik Sinner', 'Carlos Alcaraz'],
      ['Aryna Sabalenka', 'Iga Swiatek'],
      ['Taylor Fritz', 'Tommy Paul'],
    ],
    markets: [
      'Match Winner',
      'Set Handicap -1.5',
      'Game Spread -3.5',
      '1st Set & Match Winner',
      'Game Spread -2.5',
    ],
    statTemplates: (v, gapSpots, isDerby) =>
      `L5 Hold+Brk ${(103 + v * 12).toFixed(1)}% · Band Gap ${gapSpots}/8${isDerby ? ' · Rivalry' : ''}`,
  },
  [SportId.Basketball]: {
    competitions: [
      'NBA Regular Season',
      'EuroLeague Regular Season',
    ],
    volatileCompetitions: [
      'Chinese Basketball Assoc. (China)',
      'Preseason / High-Variance Cup',
    ],
    venues: [
      'TD Garden',
      'Paycom Center',
      'Ball Arena (5,280 ft)',
      'Madison Square Garden',
      'Footprint Center',
      'OAKA Arena Athens',
    ],
    competitors: [
      'Boston Celtics',
      'Oklahoma City Thunder',
      'Denver Nuggets',
      'New York Knicks',
      'Minnesota Timberwolves',
      'Dallas Mavericks',
      'Cleveland Cavaliers',
      'Phoenix Suns',
      'Indiana Pacers',
      'Golden State Warriors',
      'Panathinaikos BC',
      'Real Madrid Baloncesto',
      'Olympiacos Piraeus',
      'Memphis Grizzlies',
      'Orlando Magic',
      'Milwaukee Bucks',
      'Sacramento Kings',
      'Miami Heat',
      'Houston Rockets',
      'Fenerbahce Beko',
    ],
    volatileCompetitors: [
      ['Liaoning Flying Leopards', 'Zhejiang Lions'],
      ['Beijing Ducks', 'Guangdong Tigers'],
    ],
    derbyPairs: [
      ['Boston Celtics', 'New York Knicks'],
      ['Panathinaikos BC', 'Olympiacos Piraeus'],
      ['Dallas Mavericks', 'Houston Rockets'],
    ],
    markets: [
      'Point Spread -4.5',
      'Moneyline',
      'Point Spread -6.5',
      'Point Spread -3.5',
      '1st Half & Full Game',
    ],
    statTemplates: (v, gapSpots, isDerby) =>
      `L5 NetRtg +${(3.4 + v * 6.8).toFixed(1)} · Seed Gap ${gapSpots}${isDerby ? ' · Rivalry' : ''}`,
  },
  [SportId.Golf]: {
    competitions: [
      'PGA Zozo Championship',
      'DP World Tour Genesis Championship',
      'LPGA Maybank Championship',
    ],
    volatileCompetitions: [
      'PGA Alternate Field Shootout',
      'Windy Shootout Coastal Open',
    ],
    venues: [
      'Accordia Golf Narashino · Bentgrass',
      'Jack Nicklaus GC Korea · Bent',
      'Kuala Lumpur G&CC · Bermuda',
      'TPC Summerlin · Bentgrass',
    ],
    competitors: [
      'Scottie Scheffler',
      'Xander Schauffele',
      'Rory McIlroy',
      'Collin Morikawa',
      'Ludvig Aberg',
      'Hideki Matsuyama',
      'Viktor Hovland',
      'Tommy Fleetwood',
      'Sungjae Im',
      'Nelly Korda',
      'Shane Lowry',
      'Corey Conners',
      'Russell Henley',
      'Sahith Theegala',
      'Min Woo Lee',
      'Lydia Ko',
      'Aaron Rai',
      'Sepp Straka',
      'Tony Finau',
      'Robert MacIntyre',
    ],
    volatileCompetitors: [
      ['Patton Kizzire', 'Davis Thompson'],
      ['Jorge Campillo', 'Matteo Manassero'],
    ],
    derbyPairs: [
      ['Scottie Scheffler', 'Rory McIlroy'],
      ['Xander Schauffele', 'Collin Morikawa'],
    ],
    markets: [
      '72-Hole H2H Matchup',
      'Round Matchup (3-Ball)',
      'Top 10 Finish',
      'Top 20 Finish',
      'Tournament H2H -0.5 Strokes',
    ],
    statTemplates: (v, gapSpots) =>
      `L5 SG:APP +${(0.50 + v * 0.92).toFixed(2)} · Skill Band +${gapSpots}/8`,
  },
  [SportId.Cricket]: {
    competitions: [
      'ICC World Test Championship',
      'ICC ODI Bilateral Series',
      'Global T20 Championship',
      'WBBL Franchise T20',
    ],
    volatileCompetitions: [
      'Rain Reduced T10 League',
      'Domestic Dew-Heavy T20 Trophy',
    ],
    venues: [
      'MCA Stadium Pune · Black Soil Spin',
      'Rawalpindi Stadium · Dry Turn',
      'MCG Melbourne · Seam & Bounce',
      'Wanderers Johannesburg · Highveld Pace',
      'Kensington Oval · Balanced Pitch',
    ],
    competitors: [
      'India',
      'Australia',
      'South Africa',
      'England',
      'New Zealand',
      'Pakistan',
      'Sri Lanka',
      'West Indies',
      'Sydney Sixers',
      'Perth Scorchers',
      'Mumbai Indians',
      'Surrey CCC',
      'New South Wales',
      'Titans',
      'Brisbane Heat',
      'Tasmania',
      'Somerset',
      'Afghanistan',
      'Oval Invincibles',
      'Chennai Super Kings',
    ],
    volatileCompetitors: [
      ['Deccan Gladiators', 'Northern Warriors'],
      ['Sylhet Strikers', 'Durdanto Dhaka'],
    ],
    derbyPairs: [
      ['India', 'Pakistan'],
      ['Australia', 'England'],
      ['Sydney Sixers', 'Perth Scorchers'],
    ],
    markets: [
      'Match Winner',
      '1st Innings Lead',
      'Powerplay Top Score & Win',
      'Match Winner (DNB)',
      'Top Opening Partnership & Win',
    ],
    statTemplates: (v, gapSpots, isDerby) =>
      `L5 RPI +${(0.55 + v * 1.18).toFixed(2)} · Table Gap ${gapSpots}${isDerby ? ' · Rivalry' : ''}`,
  },
  [SportId.Rugby]: {
    competitions: [
      'United Rugby Championship',
      'Premiership Rugby',
      'Top 14 France',
      'Investec Champions Cup',
    ],
    volatileCompetitions: [
      'Rotated Tour Cross-Hemisphere Round',
      'Super Liga Romania Rugby',
    ],
    venues: [
      'Aviva Stadium Dublin',
      'Stade Ernest-Wallon Toulouse',
      'Loftus Versfeld (1,350m Altitude)',
      'Twickenham Stoop',
      'DHL Stadium Cape Town',
    ],
    competitors: [
      'Leinster',
      'Stade Toulousain',
      'Bulls',
      'Union Bordeaux-Begles',
      'Bath Rugby',
      'Glasgow Warriors',
      'Saracens',
      'Munster',
      'Northampton Saints',
      'La Rochelle',
      'Sharks',
      'Stormers',
      'Bristol Bears',
      'Harlequins',
      'Leicester Tigers',
      'Ulster',
      'Wellington Lions',
      'Bay of Plenty',
      'Clermont Auvergne',
      'Sale Sharks',
    ],
    volatileCompetitors: [
      ['Zebre Parma', 'Dragons RFC'],
      ['CSA Steaua', 'Dinamo Bucuresti'],
    ],
    derbyPairs: [
      ['Leinster', 'Munster'],
      ['Bulls', 'Stormers'],
      ['Stade Toulousain', 'La Rochelle'],
      ['Saracens', 'Harlequins'],
    ],
    markets: [
      'Handicap -5.5',
      'Match Winner (1-12 Margin)',
      'Handicap -3.5',
      'Moneyline (80 Mins)',
      'Double Result HT/FT',
    ],
    statTemplates: (v, gapSpots, isDerby) =>
      `L5 22m ${(3.0 + v * 0.95).toFixed(2)} pts · Table Gap ${gapSpots}${isDerby ? ' · Derby' : ''}`,
  },
};

const DOMESTIC_LEAGUE_MAP: Record<string, string> = {
  Arsenal: 'Premier League',
  Liverpool: 'Premier League',
  'Aston Villa': 'Premier League',
  Brighton: 'Premier League',
  'Newcastle United': 'Premier League',
  Tottenham: 'Premier League',
  'Real Madrid': 'La Liga',
  Barcelona: 'La Liga',
  'Atletico Madrid': 'La Liga',
  Villarreal: 'La Liga',
  'Inter Milan': 'Serie A',
  Napoli: 'Serie A',
  Atalanta: 'Serie A',
  'AC Milan': 'Serie A',
  'Bayern Munich': 'Bundesliga',
  'Bayer Leverkusen': 'Bundesliga',
  'Borussia Dortmund': 'Bundesliga',
  'RB Leipzig': 'Bundesliga',
  PSG: 'Ligue 1',
  'Sporting CP': 'UEFA Champions League',
  'Panathinaikos BC': 'EuroLeague',
  'Real Madrid Baloncesto': 'EuroLeague',
  'Olympiacos Piraeus': 'EuroLeague',
  'Fenerbahce Beko': 'EuroLeague',
  Leinster: 'United Rugby Championship',
  Bulls: 'United Rugby Championship',
  'Glasgow Warriors': 'United Rugby Championship',
  Munster: 'United Rugby Championship',
  Sharks: 'United Rugby Championship',
  Stormers: 'United Rugby Championship',
  Ulster: 'United Rugby Championship',
  'Bath Rugby': 'Premiership Rugby',
  Saracens: 'Premiership Rugby',
  'Northampton Saints': 'Premiership Rugby',
  'Bristol Bears': 'Premiership Rugby',
  Harlequins: 'Premiership Rugby',
  'Leicester Tigers': 'Premiership Rugby',
  'Sale Sharks': 'Premiership Rugby',
  'Stade Toulousain': 'Top 14 France',
  'Union Bordeaux-Begles': 'Top 14 France',
  'La Rochelle': 'Top 14 France',
  'Clermont Auvergne': 'Top 14 France',
  'Wellington Lions': 'NPC Finals Series',
  'Bay of Plenty': 'NPC Finals Series',
};

function resolveAuthenticCompetition(
  sport: SportId,
  teamA: string,
  teamB: string,
  fallback: string
): string {
  const leagueA = DOMESTIC_LEAGUE_MAP[teamA];
  const leagueB = DOMESTIC_LEAGUE_MAP[teamB];
  if (sport === SportId.Soccer) {
    if (leagueA && leagueB && leagueA === leagueB) return leagueA;
    return 'UEFA Champions League';
  }
  if (sport === SportId.Basketball) {
    if (leagueA === 'EuroLeague' || leagueB === 'EuroLeague') return 'EuroLeague Regular Season';
    return 'NBA Regular Season';
  }
  if (sport === SportId.Rugby) {
    if (leagueA && leagueB && leagueA === leagueB) return leagueA;
    return 'Investec Champions Cup';
  }
  if (sport === SportId.Cricket) {
    const internationals = new Set([
      'India',
      'Australia',
      'South Africa',
      'England',
      'New Zealand',
      'Pakistan',
      'Sri Lanka',
      'West Indies',
      'Afghanistan',
    ]);
    const aInt = internationals.has(teamA);
    const bInt = internationals.has(teamB);
    if (aInt && bInt) return fallback.includes('WBBL') ? 'ICC ODI Bilateral Series' : fallback;
    return 'Global T20 Championship';
  }
  return fallback;
}

function isDerbyPair(pool: SportPoolConfig, a: string, b: string): boolean {
  return pool.derbyPairs.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a)
  );
}

function hashSeed(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

class DeterministicRNG {
  private s: number;
  constructor(seedStr: string) {
    this.s = hashSeed(seedStr) || 123456789;
  }
  next(): number {
    this.s = (1664525 * this.s + 1013904223) >>> 0;
    return this.s / 4294967296;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/**
 * Generates 360 realistic historical multi-sport CSV rows (60 per sport) governed by the
 * Universal 8 Multi-Sport Rules (Motivation, Last-5 Form, H2H + 8-Spot Gap, Tiers, Derby Disruption,
 * Squad Value Subordinate to Motivation/Form/H2H, Continental Fatigue, and Coach H2H + Volatile Leagues)
 */
export function generateSyntheticTestHistoricalRows(rowsPerSport = 60): HistoricalMatchRow[] {
  const rng = new DeterministicRNG('octanet-universal-8rules-csv-v2');
  const rows: HistoricalMatchRow[] = [];

  for (const sport of ALL_SPORTS) {
    const pool = SPORT_POOLS[sport];
    for (let i = 0; i < rowsPerSport; i++) {
      const isVolatileSample = i % 9 === 8 && pool.volatileCompetitors.length > 0;
      let selection: string;
      let opponent: string;
      let competition: string;

      if (isVolatileSample) {
        const pair = pool.volatileCompetitors[i % pool.volatileCompetitors.length];
        selection = pair[0];
        opponent = pair[1];
        competition = pool.volatileCompetitions[i % pool.volatileCompetitions.length];
      } else {
        const idxA = (i * 3 + Math.floor(rng.next() * 5)) % pool.competitors.length;
        let idxB =
          (idxA + 1 + Math.floor(rng.next() * (pool.competitors.length - 2))) %
          pool.competitors.length;
        if (idxB === idxA) idxB = (idxA + 1) % pool.competitors.length;
        selection = pool.competitors[idxA];
        opponent = pool.competitors[idxB];
        const rawComp = pool.competitions[i % pool.competitions.length];
        competition = resolveAuthenticCompetition(sport, selection, opponent, rawComp);
      }

      const market = pool.markets[i % pool.markets.length];
      const isHome = rng.next() > 0.35;
      const isDerby = isDerbyPair(pool, selection, opponent) || i % 11 === 7;
      const gapSpots = Math.max(1, Math.min(12, Math.round(rng.range(1, 11))));
      const gapBonus = Math.min(1.0, gapSpots / 8) * 3.0; // decays smoothly when gap < 8!

      const baseSkill = clampVal(5.2 + rng.range(-1.8, 2.6), 2.5, 9.2);
      const r1Stakes = round1(clampVal(baseSkill + rng.range(-2.0, 2.0), 2.0, 9.6));
      const r2Form = round1(clampVal(baseSkill + rng.range(-1.8, 1.9), 2.0, 9.6));
      const rawH2H = clampVal(baseSkill + rng.range(-1.8, 1.8), 2.0, 9.5);
      const r3H2HGap = round1(clampVal(0.45 * rawH2H + 0.25 * r2Form + gapBonus, 2.0, 9.7));
      const r4Tiers = round1(clampVal(baseSkill + rng.range(-1.3, 1.5), 2.2, 9.5));
      const r5Derby = round1(isDerby ? rng.range(2.6, 4.6) : rng.range(6.8, 9.3));
      // Occasionally generate "expensive squad in poor form/stakes" trap to teach MLP Rule 6 subordination!
      const isPaperTiger = i % 7 === 4;
      const r6SquadVal = round1(
        isPaperTiger ? rng.range(8.2, 9.6) : clampVal(baseSkill + rng.range(-1.2, 1.6), 2.5, 9.5)
      );
      const hasContinentalFatigue = i % 6 === 5;
      const r7Fatigue = round1(hasContinentalFatigue ? rng.range(2.8, 4.5) : rng.range(6.5, 9.2));
      const r8CoachVol = round1(
        isVolatileSample ? rng.range(2.8, 4.6) : clampVal(5.8 + rng.range(-1.8, 2.6), 3.2, 9.2)
      );

      const rules: RuleScoreVector = {
        r1_motivation_stakes: r1Stakes,
        r2_form_momentum: r2Form,
        r3_h2h_standings_gap: r3H2HGap,
        r4_tier_classification: r4Tiers,
        r5_derby_rivalry: r5Derby,
        r6_squad_value_vs_form: r6SquadVal,
        r7_continental_fatigue: r7Fatigue,
        r8_coach_volatility: r8CoachVol,
      };

      // True data-generating latent outcome reflecting all 8 rules:
      const coreTrio = (r1Stakes + r2Form + r3H2HGap) / 3;
      const effectiveVal = Math.min(r6SquadVal, coreTrio + 0.65);

      let latentLogit =
        (r1Stakes - 5.5) * 0.34 +
        (r2Form - 5.5) * 0.38 +
        (r3H2HGap - 5.5) * 0.32 +
        (r4Tiers - 5.5) * 0.20 +
        (effectiveVal - 5.5) * 0.12 +
        (r8CoachVol - 5.5) * 0.16;

      if (isDerby) latentLogit *= 0.55; // Derbies disrupt statistical gaps
      if (hasContinentalFatigue) latentLogit -= 0.65; // Continental rotation penalty
      if (isVolatileSample || isVolatileCompetition(competition)) {
        latentLogit *= 0.45; // Volatile leagues revert toward coin-flip upsets
      }
      if (r1Stakes < 4.2) latentLogit -= 0.55; // Dead-rubber lack of urgency

      const trueProb = clampVal(1 / (1 + Math.exp(-latentLogit)), 0.12, 0.88);
      // Public bookmaker overprices high Squad Value ("Paper Tigers") & ignores Continental Rotation!
      const publicBias = (isPaperTiger ? 0.08 : 0) + (hasContinentalFatigue ? 0.05 : 0);
      const publicProb = clampVal(
        trueProb * 0.85 + 0.5 * 0.15 + publicBias + rng.range(-0.05, 0.05),
        0.20,
        0.85
      );
      const decimalOdds = Number(clampVal(0.965 / publicProb, 1.32, 3.85).toFixed(2));
      const outcomeWon: 0 | 1 = rng.next() < trueProb ? 1 : 0;

      const dayOffset = 90 - Math.floor((i / rowsPerSport) * 85);
      const d = new Date(Date.UTC(2026, 9, 24));
      d.setUTCDate(d.getUTCDate() - dayOffset);
      const dateStr = d.toISOString().slice(0, 10);

      rows.push({
        id: `hist-${sport}-${i + 1}`,
        date: dateStr,
        sport,
        competition,
        selection,
        opponent,
        market,
        decimalOdds,
        isHomeOrFavoredContext: isHome,
        rules,
        outcomeWon,
      });
    }
  }

  return rows;
}

/**
 * Generates 16 daily fixtures per sport (96 daily fixtures) for any YYYY-MM-DD date,
 * including high-conviction spots, narrow-gap contests, derbies, continental sandwich spots,
 * and watchlist volatile-league fixtures so the Universal 8-Rule + Neural Engine filters out
 * traps and surfaces the cleanest Top 10 Best Bets per sport!
 */
export function generateSyntheticTestFixtures(dateStr: string): DailyFixture[] {
  const fixtures: DailyFixture[] = [];
  const fixturesPerSport = 16;

  for (const sport of ALL_SPORTS) {
    const rng = new DeterministicRNG(`daily-universal8-${dateStr}-${sport}`);
    const pool = SPORT_POOLS[sport];

    const indices = Array.from({ length: pool.competitors.length }, (_, k) => k);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      const tmp = indices[i];
      indices[i] = indices[j];
      indices[j] = tmp;
    }

    for (let m = 0; m < fixturesPerSport; m++) {
      // Include 2 volatile watchlist fixtures per sport (ranks 14 & 15 in raw pool) so Rule 8 caution actively filters/damps them
      const isVolatileFixture = m >= 14 && pool.volatileCompetitors.length > 0;
      let selection: string;
      let opponent: string;
      let comp: string;

      if (isVolatileFixture) {
        const pair = pool.volatileCompetitors[(m - 14) % pool.volatileCompetitors.length];
        selection = pair[0];
        opponent = pair[1];
        comp = pool.volatileCompetitions[(m - 14) % pool.volatileCompetitions.length];
      } else {
        const teamIdx = indices[m % indices.length];
        const oppIdx = indices[(m + 7 + (m % 5)) % indices.length];
        selection = pool.competitors[teamIdx];
        opponent =
          selection === pool.competitors[oppIdx]
            ? pool.competitors[(oppIdx + 1) % pool.competitors.length]
            : pool.competitors[oppIdx];
        const rawComp = pool.competitions[m % pool.competitions.length];
        comp = resolveAuthenticCompetition(sport, selection, opponent, rawComp);
      }

      const venue = pool.venues[m % pool.venues.length];
      const market = pool.markets[m % pool.markets.length];
      const isHome = m % 3 !== 2;

      const hour = 11 + ((m * 2 + ALL_SPORTS.indexOf(sport)) % 11);
      const minute = m % 2 === 0 ? '00' : '30';
      const kickoffTime = `${String(hour).padStart(2, '0')}:${minute} UTC`;

      const isDerby = isDerbyPair(pool, selection, opponent);
      const gapSpots = isVolatileFixture
        ? Math.round(rng.range(2, 6))
        : Math.max(2, Math.min(11, Math.round(rng.range(3, 10))));
      const gapBonus = Math.min(1.0, gapSpots / 8) * 3.0;

      const qualitySeed = clampVal(5.8 + (1 - m / 22) * 1.9 + rng.range(-0.7, 0.8), 4.4, 8.9);

      const r1Stakes = round1(clampVal(qualitySeed + rng.range(-0.8, 1.1), 4.2, 9.4));
      const r2Form = round1(clampVal(qualitySeed + rng.range(-0.9, 1.1), 4.0, 9.3));
      const rawH2H = clampVal(qualitySeed + rng.range(-1.0, 1.0), 4.0, 9.2);
      const r3H2HGap = round1(clampVal(0.45 * rawH2H + 0.25 * r2Form + gapBonus, 4.0, 9.4));
      const r4Tiers = round1(clampVal(qualitySeed + rng.range(-0.8, 0.9), 4.2, 9.2));
      const r5Derby = round1(isDerby ? rng.range(3.4, 4.6) : rng.range(7.2, 9.2));
      const r6Val = round1(clampVal(qualitySeed + rng.range(-0.7, 1.2), 4.4, 9.3));
      const hasRotationRisk = m === 12 || m === 13;
      const r7Fatigue = round1(hasRotationRisk ? rng.range(3.6, 4.6) : rng.range(6.8, 9.2));
      const r8CoachVol = round1(
        isVolatileFixture ? rng.range(3.4, 4.5) : clampVal(6.4 + rng.range(-1.0, 1.8), 4.6, 9.1)
      );

      const rules: RuleScoreVector = {
        r1_motivation_stakes: r1Stakes,
        r2_form_momentum: r2Form,
        r3_h2h_standings_gap: r3H2HGap,
        r4_tier_classification: r4Tiers,
        r5_derby_rivalry: r5Derby,
        r6_squad_value_vs_form: r6Val,
        r7_continental_fatigue: r7Fatigue,
        r8_coach_volatility: r8CoachVol,
      };

      const avgRule =
        (r1Stakes + r2Form + r3H2HGap + r4Tiers + r5Derby + r6Val + r7Fatigue + r8CoachVol) / 8;

      const estModelLogit = (avgRule - 5.6) * 0.70;
      const estModelProb = clampVal(1 / (1 + Math.exp(-estModelLogit)), 0.34, 0.79);
      const bookieImplied = clampVal(estModelProb - rng.range(-0.015, 0.062), 0.31, 0.80);
      const decimalOdds = Number(clampVal(1 / bookieImplied, 1.38, 3.20).toFixed(2));
      const statNorm = clampVal((r2Form - 4.2) / 5.0, 0.1, 0.98);

      const matchupLabel =
        sport === SportId.Golf
          ? `${selection} vs ${opponent} (H2H)`
          : isHome
          ? `${selection} vs ${opponent}`
          : `${opponent} vs ${selection}`;

      fixtures.push({
        id: `${dateStr}-${sport}-${m + 1}`,
        date: dateStr,
        kickoffTime,
        sport,
        competition: comp,
        venueOrSurface: venue,
        selection,
        opponent,
        matchupLabel,
        market,
        decimalOdds,
        isHomeOrFavoredContext: isHome,
        rules,
        sportContextStat: pool.statTemplates(statNorm, gapSpots, isDerby),
      });
    }
  }

  return fixtures;
}

function clampVal(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
