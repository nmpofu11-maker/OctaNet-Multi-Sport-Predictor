import {
  AdaptedRuleSpec,
  ALL_SPORTS,
  RULE_KEYS,
  RuleKey,
  RuleScoreVector,
  SportId,
} from '../types/sports';

/**
 * Explicit high-volatility competitions watchlist (Rule 8):
 * Soccer: Japan, South Korea, China, Norway, Sweden, Belarus, Bulgaria, Romania, Ukraine, Russia
 * Plus multi-sport high-variance equivalents.
 */
export const VOLATILE_COMPETITION_KEYWORDS: string[] = [
  // Soccer explicit watchlist
  'j1 league',
  'japan',
  'k league',
  'south korea',
  'chinese super league',
  'china',
  'eliteserien',
  'norway',
  'allsvenskan',
  'sweden',
  'belarus',
  'vysheyshaya',
  'bulgaria',
  'parva liga',
  'romania',
  'superliga romania',
  'liga i',
  'ukraine',
  'premier liga',
  'russia',
  'russian premier',
  // Multi-sport high-volatility equivalents
  'atp 250',
  'wta 250',
  'challenger',
  'summer league',
  'preseason',
  'windy shootout',
  'alternate field',
  't10',
  'rain reduced',
  'rotated tour',
];

export function isVolatileCompetition(competition: string): boolean {
  const lower = competition.toLowerCase();
  return VOLATILE_COMPETITION_KEYWORDS.some((kw) => lower.includes(kw));
}

const UNIVERSAL_FORMULAS: Record<RuleKey, string> = {
  r1_motivation_stakes:
    'S1 = clamp(Stakes_fav - 0.30 * Stakes_opp, 0, 10); <4.5 triggers dead-rubber discount',
  r2_form_momentum:
    'S2 = 0.35*WinRate_L5 + 0.30*AttackThreat_L5 + 0.20*Ratio_GF_GA + 0.15*Control_L5',
  r3_h2h_standings_gap:
    'S3 = 0.45*H2H + 0.25*S2 + 3.0*min(1, NormRankGap / 8) [decays as gap narrows <8]',
  r4_tier_classification:
    'S4 = clamp(5.5 + 1.45*(Tier_opp - Tier_fav), 0, 10) across Tiers 1..4',
  r5_derby_rivalry:
    'S5 = 9.0 (Non-Rivalry) -> 2.5..4.5 (Active Derby); S5 < 5.0 damps statistical edge',
  r6_squad_value_vs_form:
    'S6_eff = min(RawValueRatio, (S1 + S2 + S3)/3 + 0.65) [cannot outweigh Rules 1-3]',
  r7_continental_fatigue:
    'S7 = 8.8 (Clean / Qualified / Big 1st-Leg Lead) -> 2.5..4.5 (Rotation Sandwich)',
  r8_coach_volatility:
    'S8 = CoachH2H * VolatilityFactor (0.68x caution in JP/KR/CN/NO/SE/BY/BG/RO/UA/RU)',
};

export const SPORT_ADAPTED_RULES: Record<SportId, AdaptedRuleSpec[]> = {
  [SportId.Soccer]: [
    {
      key: 'r1_motivation_stakes',
      index: 1,
      universalName: 'Motivation & Qualification Stakes',
      universalFormula: UNIVERSAL_FORMULAS.r1_motivation_stakes,
      sportTitle: 'Title Race, Continental Spot, or Relegation Survival',
      metricUnit: 'Table Urgency',
      dynamicSummary:
        'Requires the favoured club to need points for the league title, UCL/UEL qualification, or escaping relegation; penalizes safe mid-table dead rubbers.',
      csvColumnHint: 'r1_motivation (0-10)',
      defaultWeight: 0.18,
    },
    {
      key: 'r2_form_momentum',
      index: 2,
      universalName: 'Last-5 Form & Attacking Momentum',
      universalFormula: UNIVERSAL_FORMULAS.r2_form_momentum,
      sportTitle: 'Last-5 Attacking Momentum, SoT, GF:GA & Possession',
      metricUnit: 'L5 Momentum',
      dynamicSummary:
        'Evaluates last 5 matches combining attacking intent, shots on target, goals-for to goals-against ratio, and ball possession control.',
      csvColumnHint: 'r2_form_l5 (0-10)',
      defaultWeight: 0.18,
    },
    {
      key: 'r3_h2h_standings_gap',
      index: 3,
      universalName: 'H2H & 8-Place Standings Gap Decay',
      universalFormula: UNIVERSAL_FORMULAS.r3_h2h_standings_gap,
      sportTitle: 'H2H + Last-5 Form + 8-Spot Table Gap Curve',
      metricUnit: 'H2H + Gap/8',
      dynamicSummary:
        'Blends direct H2H dominance with Rule 2 form points; full table bonus requires >=8 places separation and decays smoothly as the gap narrows toward 0.',
      csvColumnHint: 'r3_h2h_gap8 (0-10)',
      defaultWeight: 0.16,
    },
    {
      key: 'r4_tier_classification',
      index: 4,
      universalName: 'Competitor Tier Classification',
      universalFormula: UNIVERSAL_FORMULAS.r4_tier_classification,
      sportTitle: 'Both Teams Structural League Tier (Tier 1–4)',
      metricUnit: 'Tier Delta',
      dynamicSummary:
        'Classifies both squads into Tier 1 (Title Giants), Tier 2 (European Contenders), Tier 3 (Mid-Table), or Tier 4 (Survival) to anchor matchup quality.',
      csvColumnHint: 'r4_tiers (0-10)',
      defaultWeight: 0.11,
    },
    {
      key: 'r5_derby_rivalry',
      index: 5,
      universalName: 'Derby & Rivalry Disruption Factor',
      universalFormula: UNIVERSAL_FORMULAS.r5_derby_rivalry,
      sportTitle: 'Local Derby & Historic Rivalry Volatility Guard',
      metricUnit: 'Derby Stability',
      dynamicSummary:
        'Flags emotionally charged local derbies and historic club rivalries where cards, intensity, and crowd pressure disrupt normal form patterns (low score = high derby risk).',
      csvColumnHint: 'r5_derby (0-10)',
      defaultWeight: 0.10,
    },
    {
      key: 'r6_squad_value_vs_form',
      index: 6,
      universalName: 'Squad Valuation vs Core Trio Cap',
      universalFormula: UNIVERSAL_FORMULAS.r6_squad_value_vs_form,
      sportTitle: 'Market Squad Value (Capped by Motivation, Form & H2H)',
      metricUnit: 'Capped Value',
      dynamicSummary:
        'Grants edge to higher squad market value, but mathematically caps its contribution so expensive underperforming squads never outweigh Rules 1, 2, and 3.',
      csvColumnHint: 'r6_value_vs_form (0-10)',
      defaultWeight: 0.08,
    },
    {
      key: 'r7_continental_fatigue',
      index: 7,
      universalName: 'Continental / Major Fixture Fatigue',
      universalFormula: UNIVERSAL_FORMULAS.r7_continental_fatigue,
      sportTitle: 'UCL/Cup Sandwich Rotation Risk (Unless Qualified / Big Lead)',
      metricUnit: 'Rotation Safety',
      dynamicSummary:
        'Penalizes clubs coming off or looking ahead to continental ties where starters are rested—exempting sides already safely qualified or holding a 3+ goal first-leg lead.',
      csvColumnHint: 'r7_continental_fatigue (0-10)',
      defaultWeight: 0.10,
    },
    {
      key: 'r8_coach_volatility',
      index: 8,
      universalName: 'Coach H2H & Volatile League Caution',
      universalFormula: UNIVERSAL_FORMULAS.r8_coach_volatility,
      sportTitle: 'Manager H2H & Watchlist League Damper (JP/KR/CN/NO/SE/EE)',
      metricUnit: 'Mgr H2H + Vol',
      dynamicSummary:
        'Factors manager-vs-manager H2H when available and applies strict caution damping to Japan, South Korea, China, Norway, Sweden, Belarus, Bulgaria, Romania, Ukraine, and Russia.',
      csvColumnHint: 'r8_coach_volatility (0-10)',
      defaultWeight: 0.09,
    },
  ],
  [SportId.Tennis]: [
    {
      key: 'r1_motivation_stakes',
      index: 1,
      universalName: 'Motivation & Qualification Stakes',
      universalFormula: UNIVERSAL_FORMULAS.r1_motivation_stakes,
      sportTitle: 'Race-to-Finals Cutline, Points Defense & Tier Stakes',
      metricUnit: 'Tour Urgency',
      dynamicSummary:
        'Verifies player urgency to defend ranking points, qualify for ATP/WTA Finals, or peak at Masters 1000 / Slams vs low-priority exhibition tune-ups.',
      csvColumnHint: 'r1_motivation (0-10)',
      defaultWeight: 0.15,
    },
    {
      key: 'r2_form_momentum',
      index: 2,
      universalName: 'Last-5 Form & Attacking Momentum',
      universalFormula: UNIVERSAL_FORMULAS.r2_form_momentum,
      sportTitle: 'Last-5 Matches Serve Hold %, Break % & Winner:UE Ratio',
      metricUnit: 'L5 Hold+Break',
      dynamicSummary:
        'Evaluates last 5 tour matches across aggressive return pressure, break-point creation, games won-to-lost ratio, and baseline rally control.',
      csvColumnHint: 'r2_form_l5 (0-10)',
      defaultWeight: 0.20,
    },
    {
      key: 'r3_h2h_standings_gap',
      index: 3,
      universalName: 'H2H & 8-Band Ranking Gap Decay',
      universalFormula: UNIVERSAL_FORMULAS.r3_h2h_standings_gap,
      sportTitle: 'Surface H2H + L5 Form + Normalized 8-Band Elo/Rank Gap',
      metricUnit: 'H2H + RankGap',
      dynamicSummary:
        'Combines direct matchup history (handedness/surface) with Rule 2 form; ranking edge scales across 8 normalized tour bands and shrinks in tight seed-vs-seed clashes.',
      csvColumnHint: 'r3_h2h_gap8 (0-10)',
      defaultWeight: 0.18,
    },
    {
      key: 'r4_tier_classification',
      index: 4,
      universalName: 'Competitor Tier Classification',
      universalFormula: UNIVERSAL_FORMULAS.r4_tier_classification,
      sportTitle: 'Player Tour Tier (Top-10 Elite vs Seeded vs Qualifier)',
      metricUnit: 'Seed Tier Delta',
      dynamicSummary:
        'Separates Tier 1 Grand Slam contenders, Tier 2 Top-30 seeds, Tier 3 Top-75 main-draw regulars, and Tier 4 Challenger/Wildcard entrants.',
      csvColumnHint: 'r4_tiers (0-10)',
      defaultWeight: 0.12,
    },
    {
      key: 'r5_derby_rivalry',
      index: 5,
      universalName: 'Derby & Rivalry Disruption Factor',
      universalFormula: UNIVERSAL_FORMULAS.r5_derby_rivalry,
      sportTitle: 'Compatriot Derby, Grudge Rivalry & Partisan Home Crowd',
      metricUnit: 'Matchup Calm',
      dynamicSummary:
        'Flags tense compatriot clashes (e.g., all-Italian/all-American ties), generational rivalries, and partisan home-tournament pressure that tighten sets.',
      csvColumnHint: 'r5_derby (0-10)',
      defaultWeight: 0.08,
    },
    {
      key: 'r6_squad_value_vs_form',
      index: 6,
      universalName: 'Talent Pedigree vs Core Trio Cap',
      universalFormula: UNIVERSAL_FORMULAS.r6_squad_value_vs_form,
      sportTitle: 'Career Prize / Peak Ranking Pedigree (Capped by Form & H2H)',
      metricUnit: 'Capped Pedigree',
      dynamicSummary:
        'Credits former Slam/Masters pedigree, but caps it below Rules 1–3 so big-name stars returning rusty from injury cannot override poor last-5 form.',
      csvColumnHint: 'r6_value_vs_form (0-10)',
      defaultWeight: 0.07,
    },
    {
      key: 'r7_continental_fatigue',
      index: 7,
      universalName: 'Continental / Major Fixture Fatigue',
      universalFormula: UNIVERSAL_FORMULAS.r7_continental_fatigue,
      sportTitle: 'Pre-Slam / Masters Lookahead & Prior-Week Deep-Run Fatigue',
      metricUnit: 'Schedule Freshness',
      dynamicSummary:
        'Penalizes top seeds playing small 250 events the week before a Major/Masters 1000 or flying across continents after a Sunday final.',
      csvColumnHint: 'r7_continental_fatigue (0-10)',
      defaultWeight: 0.11,
    },
    {
      key: 'r8_coach_volatility',
      index: 8,
      universalName: 'Coach H2H & Volatile Tour Caution',
      universalFormula: UNIVERSAL_FORMULAS.r8_coach_volatility,
      sportTitle: 'Coaching Box Tactical Edge & ATP/WTA 250 / Challenger Caution',
      metricUnit: 'Tactics + Vol',
      dynamicSummary:
        'Includes coaching camp tactical adjustments in repeat meetings and applies extra caution to high-upset ATP/WTA 250s, Challengers, and extreme altitude courts.',
      csvColumnHint: 'r8_coach_volatility (0-10)',
      defaultWeight: 0.09,
    },
  ],
  [SportId.Basketball]: [
    {
      key: 'r1_motivation_stakes',
      index: 1,
      universalName: 'Motivation & Qualification Stakes',
      universalFormula: UNIVERSAL_FORMULAS.r1_motivation_stakes,
      sportTitle: 'Playoff / Play-In Seeding Leverage vs Tanking / Clinched Rest',
      metricUnit: 'Seeding Urgency',
      dynamicSummary:
        'Requires active conference seeding, tiebreaker, or EuroLeague top-6 urgency; heavily discounts eliminated lottery teams or locked #1 seeds.',
      csvColumnHint: 'r1_motivation (0-10)',
      defaultWeight: 0.16,
    },
    {
      key: 'r2_form_momentum',
      index: 2,
      universalName: 'Last-5 Form & Attacking Momentum',
      universalFormula: UNIVERSAL_FORMULAS.r2_form_momentum,
      sportTitle: 'Last-5 Net Rating, eFG% Accuracy, Pts Ratio & Rebound %',
      metricUnit: 'L5 NetRtg + eFG',
      dynamicSummary:
        'Evaluates last 5 games across pace-adjusted offensive momentum, effective FG%, points scored-to-allowed ratio, and glass/possession control.',
      csvColumnHint: 'r2_form_l5 (0-10)',
      defaultWeight: 0.19,
    },
    {
      key: 'r3_h2h_standings_gap',
      index: 3,
      universalName: 'H2H & 8-Place Standings Gap Decay',
      universalFormula: UNIVERSAL_FORMULAS.r3_h2h_standings_gap,
      sportTitle: 'Season-Series H2H + L5 Form + 8-Seed Conference Gap',
      metricUnit: 'H2H + SeedGap/8',
      dynamicSummary:
        'Combines season-series matchup dominance with Rule 2 momentum, scaling standings bonus down as conference separation narrows below 8 spots.',
      csvColumnHint: 'r3_h2h_gap8 (0-10)',
      defaultWeight: 0.15,
    },
    {
      key: 'r4_tier_classification',
      index: 4,
      universalName: 'Competitor Tier Classification',
      universalFormula: UNIVERSAL_FORMULAS.r4_tier_classification,
      sportTitle: 'Franchise Contender Tier (Title Tier 1 vs Rebuild Tier 4)',
      metricUnit: 'Contender Tier',
      dynamicSummary:
        'Separates Tier 1 title favorites, Tier 2 playoff locks, Tier 3 play-in bubble rosters, and Tier 4 rebuilding franchises.',
      csvColumnHint: 'r4_tiers (0-10)',
      defaultWeight: 0.12,
    },
    {
      key: 'r5_derby_rivalry',
      index: 5,
      universalName: 'Derby & Rivalry Disruption Factor',
      universalFormula: UNIVERSAL_FORMULAS.r5_derby_rivalry,
      sportTitle: 'Divisional / City Rivalry & EuroLeague Derby Intensity',
      metricUnit: 'Rivalry Guard',
      dynamicSummary:
        'Accounts for heated divisional/city rivalries (e.g., Celtics–Knicks, Panathinaikos–Olympiacos) where physical whistle adjustments compress point spreads.',
      csvColumnHint: 'r5_derby (0-10)',
      defaultWeight: 0.09,
    },
    {
      key: 'r6_squad_value_vs_form',
      index: 6,
      universalName: 'Payroll / Star Value vs Core Trio Cap',
      universalFormula: UNIVERSAL_FORMULAS.r6_squad_value_vs_form,
      sportTitle: 'Luxury-Tax Roster Star Value (Capped by Form & Urgency)',
      metricUnit: 'Capped Payroll',
      dynamicSummary:
        'Credits All-NBA star payroll depth but caps it under Rules 1–3 so aging super-teams coasting in the regular season do not get overpriced.',
      csvColumnHint: 'r6_value_vs_form (0-10)',
      defaultWeight: 0.08,
    },
    {
      key: 'r7_continental_fatigue',
      index: 7,
      universalName: 'Continental / Major Fixture Fatigue',
      universalFormula: UNIVERSAL_FORMULAS.r7_continental_fatigue,
      sportTitle: 'Back-to-Back / EuroLeague Double-Week Rotation & Lookahead',
      metricUnit: 'Rest & Rotation',
      dynamicSummary:
        'Adjusts sharply downward for road back-to-backs, 3-in-4 nights, or domestic league games sandwiched between EuroLeague double-week trips.',
      csvColumnHint: 'r7_continental_fatigue (0-10)',
      defaultWeight: 0.13,
    },
    {
      key: 'r8_coach_volatility',
      index: 8,
      universalName: 'Coach H2H & Volatile League Caution',
      universalFormula: UNIVERSAL_FORMULAS.r8_coach_volatility,
      sportTitle: 'Head Coach Scheme H2H & High-3PT Variance / Domestic Caution',
      metricUnit: 'Coach H2H + Vol',
      dynamicSummary:
        'Weighs head-coach tactical matchup history (zone/drop adjustments) and damps high-variance run-and-gun or secondary international leagues.',
      csvColumnHint: 'r8_coach_volatility (0-10)',
      defaultWeight: 0.08,
    },
  ],
  [SportId.Golf]: [
    {
      key: 'r1_motivation_stakes',
      index: 1,
      universalName: 'Motivation & Qualification Stakes',
      universalFormula: UNIVERSAL_FORMULAS.r1_motivation_stakes,
      sportTitle: 'FedExCup / Race to Dubai Top-50/70 Cutline & Major Focus',
      metricUnit: 'Points Urgency',
      dynamicSummary:
        'Prioritizes golfers fighting for Signature Event / Tour Championship / Ryder Cup spots or defending a favorite course title.',
      csvColumnHint: 'r1_motivation (0-10)',
      defaultWeight: 0.14,
    },
    {
      key: 'r2_form_momentum',
      index: 2,
      universalName: 'Last-5 Form & Attacking Momentum',
      universalFormula: UNIVERSAL_FORMULAS.r2_form_momentum,
      sportTitle: 'Last-5 Events SG:Approach, GIR %, Birdie:Bogey & Fairway Ctrl',
      metricUnit: 'L5 SG Momentum',
      dynamicSummary:
        'Evaluates last 5 tournament starts across iron proximity (attacking pins), greens in regulation, birdie-to-bogey ratio, and tee-to-green control.',
      csvColumnHint: 'r2_form_l5 (0-10)',
      defaultWeight: 0.22,
    },
    {
      key: 'r3_h2h_standings_gap',
      index: 3,
      universalName: 'H2H & 8-Band Standings Gap Decay',
      universalFormula: UNIVERSAL_FORMULAS.r3_h2h_standings_gap,
      sportTitle: '72-Hole H2H Record + L5 Form + 8-Band DataGolf/OWGR Gap',
      metricUnit: 'H2H + SkillGap',
      dynamicSummary:
        'Blends direct tournament H2H record and course-fit edge with Rule 2 ball-striking form, decaying as skill ranking bands converge.',
      csvColumnHint: 'r3_h2h_gap8 (0-10)',
      defaultWeight: 0.18,
    },
    {
      key: 'r4_tier_classification',
      index: 4,
      universalName: 'Competitor Tier Classification',
      universalFormula: UNIVERSAL_FORMULAS.r4_tier_classification,
      sportTitle: 'Tour Player Tier (Elite Major Winner vs Tour Regular vs Rookie)',
      metricUnit: 'Field Tier Delta',
      dynamicSummary:
        'Classifies players into Tier 1 (+1.8 SG elites), Tier 2 (Tour winners), Tier 3 (Mid-pack cut-makers), and Tier 4 (Conditional/Sponsor invites).',
      csvColumnHint: 'r4_tiers (0-10)',
      defaultWeight: 0.13,
    },
    {
      key: 'r5_derby_rivalry',
      index: 5,
      universalName: 'Derby & Rivalry Disruption Factor',
      universalFormula: UNIVERSAL_FORMULAS.r5_derby_rivalry,
      sportTitle: 'Final-Pairing Duel Pressure & Ryder/Presidents Cup Grudge',
      metricUnit: 'Pairing Composure',
      dynamicSummary:
        'Flags high-tension head-to-head pairings or hometown gallery pressure where emotional over-aggression inflates double-bogey variance.',
      csvColumnHint: 'r5_derby (0-10)',
      defaultWeight: 0.07,
    },
    {
      key: 'r6_squad_value_vs_form',
      index: 6,
      universalName: 'Career Reputation vs Core Trio Cap',
      universalFormula: UNIVERSAL_FORMULAS.r6_squad_value_vs_form,
      sportTitle: 'Legacy OWGR / Brand Value (Capped by L5 Ball-Striking Form)',
      metricUnit: 'Capped Reputation',
      dynamicSummary:
        'Prevents household-name Major champions with cold iron play (low Rule 2) from overpowering in-form ball-strikers in H2H markets.',
      csvColumnHint: 'r6_value_vs_form (0-10)',
      defaultWeight: 0.07,
    },
    {
      key: 'r7_continental_fatigue',
      index: 7,
      universalName: 'Continental / Major Fixture Fatigue',
      universalFormula: UNIVERSAL_FORMULAS.r7_continental_fatigue,
      sportTitle: 'Pre-Major Tune-Up Lookahead & 4th-Week / Transoceanic Jet Lag',
      metricUnit: 'Travel & Prep',
      dynamicSummary:
        'Discounts stars treating the week before a Major purely as wedge/putter practice or playing a 4th straight week across time zones.',
      csvColumnHint: 'r7_continental_fatigue (0-10)',
      defaultWeight: 0.10,
    },
    {
      key: 'r8_coach_volatility',
      index: 8,
      universalName: 'Caddie Strategy & Course Volatility Caution',
      universalFormula: UNIVERSAL_FORMULAS.r8_coach_volatility,
      sportTitle: 'Veteran Caddie Course H2H & Coastal Wind / Shootout Caution',
      metricUnit: 'Caddie + Wind Vol',
      dynamicSummary:
        'Credits veteran caddie course management and damps confidence in 25+ mph coastal wind lotteries or -26 birdie-fest alternate events.',
      csvColumnHint: 'r8_coach_volatility (0-10)',
      defaultWeight: 0.09,
    },
  ],
  [SportId.Cricket]: [
    {
      key: 'r1_motivation_stakes',
      index: 1,
      universalName: 'Motivation & Qualification Stakes',
      universalFormula: UNIVERSAL_FORMULAS.r1_motivation_stakes,
      sportTitle: 'WTC Points, Playoff NRR Survival, or Unclinched Series Decider',
      metricUnit: 'Series Urgency',
      dynamicSummary:
        'Requires live World Test Championship points, franchise playoff NRR stakes, or an unclinched series; penalizes dead-rubber 3rd/5th matches.',
      csvColumnHint: 'r1_motivation (0-10)',
      defaultWeight: 0.16,
    },
    {
      key: 'r2_form_momentum',
      index: 2,
      universalName: 'Last-5 Form & Attacking Momentum',
      universalFormula: UNIVERSAL_FORMULAS.r2_form_momentum,
      sportTitle: 'Last-5 Powerplay Attack, Boundary %, Run-Rate Ratio & Control',
      metricUnit: 'L5 Phase RPI',
      dynamicSummary:
        'Evaluates last 5 matches in the same format across powerplay/death aggression, scoring-to-economy ratio, and dot-ball/session control.',
      csvColumnHint: 'r2_form_l5 (0-10)',
      defaultWeight: 0.18,
    },
    {
      key: 'r3_h2h_standings_gap',
      index: 3,
      universalName: 'H2H & 8-Place Standings Gap Decay',
      universalFormula: UNIVERSAL_FORMULAS.r3_h2h_standings_gap,
      sportTitle: 'Venue/Format H2H + L5 Form + 8-Spot ICC/Table Gap',
      metricUnit: 'H2H + TableGap',
      dynamicSummary:
        'Blends recent bilateral/franchise H2H in matching pitch conditions with Rule 2 momentum and normalized ICC/league table separation.',
      csvColumnHint: 'r3_h2h_gap8 (0-10)',
      defaultWeight: 0.16,
    },
    {
      key: 'r4_tier_classification',
      index: 4,
      universalName: 'Competitor Tier Classification',
      universalFormula: UNIVERSAL_FORMULAS.r4_tier_classification,
      sportTitle: 'ICC Full-Member / Franchise Squad Tier Classification',
      metricUnit: 'Squad Tier',
      dynamicSummary:
        'Factors structural depth gap between Tier 1 powerhouses (India, Australia, England, South Africa) and lower-tier or depleted domestic sides.',
      csvColumnHint: 'r4_tiers (0-10)',
      defaultWeight: 0.12,
    },
    {
      key: 'r5_derby_rivalry',
      index: 5,
      universalName: 'Derby & Rivalry Disruption Factor',
      universalFormula: UNIVERSAL_FORMULAS.r5_derby_rivalry,
      sportTitle: 'Marquee Bilateral Rivalry & Local Franchise Derby Pressure',
      metricUnit: 'Pressure Guard',
      dynamicSummary:
        'Accounts for high-pressure rivalries (e.g., Ashes, India–Pakistan, Sydney/Melbourne derbies) where scoreboard pressure triggers batting collapses.',
      csvColumnHint: 'r5_derby (0-10)',
      defaultWeight: 0.09,
    },
    {
      key: 'r6_squad_value_vs_form',
      index: 6,
      universalName: 'Auction / Star Value vs Core Trio Cap',
      universalFormula: UNIVERSAL_FORMULAS.r6_squad_value_vs_form,
      sportTitle: 'Auction Squad Valuation (Capped by Active Form & Pitch H2H)',
      metricUnit: 'Capped Star Value',
      dynamicSummary:
        'Grants credit to star-studded batting/pace rosters but prevents paper reputation from overriding poor last-5 form on spinning/seaming tracks.',
      csvColumnHint: 'r6_value_vs_form (0-10)',
      defaultWeight: 0.08,
    },
    {
      key: 'r7_continental_fatigue',
      index: 7,
      universalName: 'Continental / Major Fixture Fatigue',
      universalFormula: UNIVERSAL_FORMULAS.r7_continental_fatigue,
      sportTitle: 'ICC/Test Workload Rotation & Fast-Bowler Rest Management',
      metricUnit: 'Pace Rest Safety',
      dynamicSummary:
        'Penalizes teams resting frontline strike bowlers ahead of marquee Test/ICC tournaments unless qualification is already locked.',
      csvColumnHint: 'r7_continental_fatigue (0-10)',
      defaultWeight: 0.11,
    },
    {
      key: 'r8_coach_volatility',
      index: 8,
      universalName: 'Captain/Coach H2H & Volatility Caution',
      universalFormula: UNIVERSAL_FORMULAS.r8_coach_volatility,
      sportTitle: 'Captain-Coach Matchup & Toss-Dew / Rain-DLS Volatility Caution',
      metricUnit: 'Tactics + DLS Vol',
      dynamicSummary:
        'Weighs captaincy bowling-change matchups and applies caution damping to extreme dew-toss venues, T10/shortened games, and volatile domestic T20 leagues.',
      csvColumnHint: 'r8_coach_volatility (0-10)',
      defaultWeight: 0.10,
    },
  ],
  [SportId.Rugby]: [
    {
      key: 'r1_motivation_stakes',
      index: 1,
      universalName: 'Motivation & Qualification Stakes',
      universalFormula: UNIVERSAL_FORMULAS.r1_motivation_stakes,
      sportTitle: 'Top-4 Home Semi-Final, Champions Cup Spot, or Bonus-Point Need',
      metricUnit: 'Table Stakes',
      dynamicSummary:
        'Requires active playoff/top-8 qualification or championship points urgency; penalizes end-of-season dead rubbers.',
      csvColumnHint: 'r1_motivation (0-10)',
      defaultWeight: 0.16,
    },
    {
      key: 'r2_form_momentum',
      index: 2,
      universalName: 'Last-5 Form & Attacking Momentum',
      universalFormula: UNIVERSAL_FORMULAS.r2_form_momentum,
      sportTitle: 'Last-5 22m Entries, Line Breaks, Pts-For:Against & Territory %',
      metricUnit: 'L5 Pack + Attack',
      dynamicSummary:
        'Evaluates last 5 matches across gainline momentum, red-zone 22m conversion, points-for/against ratio, and kicking territory control.',
      csvColumnHint: 'r2_form_l5 (0-10)',
      defaultWeight: 0.18,
    },
    {
      key: 'r3_h2h_standings_gap',
      index: 3,
      universalName: 'H2H & 8-Place Standings Gap Decay',
      universalFormula: UNIVERSAL_FORMULAS.r3_h2h_standings_gap,
      sportTitle: 'Pack Set-Piece H2H + L5 Form + 8-Spot League Table Gap',
      metricUnit: 'H2H + TableGap/8',
      dynamicSummary:
        'Combines direct set-piece H2H superiority with Rule 2 momentum; full table bonus requires an 8-place gap and tapers as teams sit closer.',
      csvColumnHint: 'r3_h2h_gap8 (0-10)',
      defaultWeight: 0.16,
    },
    {
      key: 'r4_tier_classification',
      index: 4,
      universalName: 'Competitor Tier Classification',
      universalFormula: UNIVERSAL_FORMULAS.r4_tier_classification,
      sportTitle: 'Club / Test Nation Structural Tier (Tier 1 Giants vs Tier 2–3)',
      metricUnit: 'Pack Tier Delta',
      dynamicSummary:
        'Factors structural depth between Tier 1 Champions Cup heavyweights (e.g., Toulouse, Leinster) and mid/lower-tier domestic packs.',
      csvColumnHint: 'r4_tiers (0-10)',
      defaultWeight: 0.12,
    },
    {
      key: 'r5_derby_rivalry',
      index: 5,
      universalName: 'Derby & Rivalry Disruption Factor',
      universalFormula: UNIVERSAL_FORMULAS.r5_derby_rivalry,
      sportTitle: 'Interprovincial / Regional Pack Derby Attrition Guard',
      metricUnit: 'Derby Discipline',
      dynamicSummary:
        'Flags ferocious provincial and regional derbies (Irish interpros, SA derbies, Top 14 rivalries) where breakdown dogfights shrink handicap margins.',
      csvColumnHint: 'r5_derby (0-10)',
      defaultWeight: 0.10,
    },
    {
      key: 'r6_squad_value_vs_form',
      index: 6,
      universalName: 'Salary / Cap Pedigree vs Core Trio Cap',
      universalFormula: UNIVERSAL_FORMULAS.r6_squad_value_vs_form,
      sportTitle: 'Test-Cap Squad Valuation (Capped by Motivation, Form & H2H)',
      metricUnit: 'Capped Cap-Value',
      dynamicSummary:
        'Credits international-laden squads, but mathematically caps valuation under Rules 1–3 so cohesive in-form packs beat unfocused star XV lineups.',
      csvColumnHint: 'r6_value_vs_form (0-10)',
      defaultWeight: 0.08,
    },
    {
      key: 'r7_continental_fatigue',
      index: 7,
      universalName: 'Continental / Major Fixture Fatigue',
      universalFormula: UNIVERSAL_FORMULAS.r7_continental_fatigue,
      sportTitle: 'Champions Cup / Test Window Rotation & Cross-Hemisphere Travel',
      metricUnit: 'Squad Rotation',
      dynamicSummary:
        'Adjusts sharply downward when clubs send rotated "B" squads on South African / European trips ahead of Champions Cup knockouts unless top seed is secured.',
      csvColumnHint: 'r7_continental_fatigue (0-10)',
      defaultWeight: 0.11,
    },
    {
      key: 'r8_coach_volatility',
      index: 8,
      universalName: 'Coach H2H & Weather/League Caution',
      universalFormula: UNIVERSAL_FORMULAS.r8_coach_volatility,
      sportTitle: 'Director of Rugby H2H & Storm Weather / Rotated Tour Caution',
      metricUnit: 'Coach H2H + Vol',
      dynamicSummary:
        'Includes coaching box tactical H2H (rush defense vs kicking) and applies caution damping to heavy-rain lottery conditions and volatile rotated windows.',
      csvColumnHint: 'r8_coach_volatility (0-10)',
      defaultWeight: 0.09,
    },
  ],
};

export type SportRuleWeights = Record<SportId, Record<RuleKey, number>>;

export function getDefaultSportWeights(): SportRuleWeights {
  const result = {} as SportRuleWeights;
  for (const sport of ALL_SPORTS) {
    const map = {} as Record<RuleKey, number>;
    for (const spec of SPORT_ADAPTED_RULES[sport]) {
      map[spec.key] = spec.defaultWeight;
    }
    result[sport] = map;
  }
  return result;
}

export function normalizeWeights(weights: Record<RuleKey, number>): Record<RuleKey, number> {
  let sum = 0;
  for (const k of RULE_KEYS) {
    sum += Math.max(0, weights[k] ?? 0);
  }
  if (sum <= 1e-9) {
    const equal = 1 / RULE_KEYS.length;
    return RULE_KEYS.reduce((acc, k) => ({ ...acc, [k]: equal }), {} as Record<RuleKey, number>);
  }
  const normalized = {} as Record<RuleKey, number>;
  for (const k of RULE_KEYS) {
    normalized[k] = Math.max(0, weights[k] ?? 0) / sum;
  }
  return normalized;
}

/**
 * Evaluates the Universal Multi-Sport 8-Rule Model derived from the original 8 rules:
 * 1. Motivation & Stakes (dead rubber penalty if < 4.5)
 * 2. Last-5 Form & Momentum
 * 3. H2H + 8-Place Standings Gap Decay (explicitly incorporates Rule 2 form points!)
 * 4. Tier Classification of both teams
 * 5. Derby & Rivalry Disruption Factor (damps confidence when < 5.0)
 * 6. Squad Value vs Form (strictly capped by Core Trio (R1 + R2 + R3)/3 so it NEVER outweighs them!)
 * 7. Continental Fixture Sandwich Fatigue (adjusts downwards when rotating before/after cup ties)
 * 8. Coach H2H & High-Volatility League Watchlist Caution (JP/KR/CN/NO/SE/BY/BG/RO/UA/RU + multi-sport equivalents)
 */
export function evaluateEightPointModel(
  sport: SportId,
  rules: RuleScoreVector,
  weights: Record<RuleKey, number>,
  isHomeOrFavored: boolean,
  decimalOdds: number,
  homeMult = 1.0,
  formMult = 1.0,
  volatilityIndex = 0.24,
  fatigueMod = 1.0,
  competitionName = ''
): {
  eightPointScore100: number;
  eightPointScale8: number;
  ruleProbability: number;
  effectiveScores: Record<RuleKey, number>;
  weightedContributions: Record<RuleKey, number>;
  cautionFlags: string[];
} {
  const normWeights = normalizeWeights(weights);
  const cautionFlags: string[] = [];

  // R1: Motivation & Stakes (boost slightly at home when high stakes)
  const r1 = clamp(
    rules.r1_motivation_stakes * (isHomeOrFavored ? 0.94 + 0.06 * homeMult : 1.0),
    0,
    10
  );
  if (r1 < 4.5) {
    cautionFlags.push('Low Stakes / Dead-Rubber Risk');
  }

  // R2: Last-5 Form & Momentum (modulated by learned form_momentum_weight)
  const r2 = clamp(rules.r2_form_momentum * (0.86 + 0.14 * formMult), 0, 10);

  // R3: H2H & Standings Gap (explicitly incorporates 25% of Rule 2 form momentum!)
  const r3 = clamp(0.75 * rules.r3_h2h_standings_gap + 0.25 * r2, 0, 10);

  // R4: Tier Classification
  const r4 = clamp(rules.r4_tier_classification, 0, 10);

  // R5: Derby & Rivalry Factor (low score = fierce derby disruption)
  const r5 = clamp(rules.r5_derby_rivalry, 0, 10);
  if (r5 < 5.0) {
    cautionFlags.push('Derby / Historic Rivalry Volatility');
  }

  // R6: Squad Value vs Form — STRICT CAP: cannot outweigh Core Trio (Motivation + Form + H2H)
  const coreTrioMean = (r1 + r2 + r3) / 3;
  const r6 = clamp(Math.min(rules.r6_squad_value_vs_form, coreTrioMean + 0.65), 0, 10);

  // R7: Continental Fixture Fatigue — modulated by learned fatigue_penalty_modifier
  const restCentered = rules.r7_continental_fatigue - 5.5;
  const r7 = clamp(5.5 + restCentered * fatigueMod, 0, 10);
  if (r7 < 4.8) {
    cautionFlags.push('Continental / Schedule Rotation Fatigue');
  }

  // R8: Coach H2H & Volatile League Caution
  const onWatchlist = competitionName ? isVolatileCompetition(competitionName) : false;
  let r8 = clamp(rules.r8_coach_volatility, 0, 10);
  if (onWatchlist) {
    r8 = clamp(r8 * 0.72, 0, 10);
    cautionFlags.push('High-Volatility League Watchlist');
  } else if (r8 < 4.6) {
    cautionFlags.push('Elevated League / Tactical Volatility');
  }

  const effectiveScores: Record<RuleKey, number> = {
    r1_motivation_stakes: Number(r1.toFixed(2)),
    r2_form_momentum: Number(r2.toFixed(2)),
    r3_h2h_standings_gap: Number(r3.toFixed(2)),
    r4_tier_classification: Number(r4.toFixed(2)),
    r5_derby_rivalry: Number(r5.toFixed(2)),
    r6_squad_value_vs_form: Number(r6.toFixed(2)),
    r7_continental_fatigue: Number(r7.toFixed(2)),
    r8_coach_volatility: Number(r8.toFixed(2)),
  };

  // Enforce Squad Value weight ceiling even if user drags R6 slider high
  const coreWeightSum =
    normWeights.r1_motivation_stakes +
    normWeights.r2_form_momentum +
    normWeights.r3_h2h_standings_gap;
  const cappedWeights = { ...normWeights };
  if (cappedWeights.r6_squad_value_vs_form > coreWeightSum * 0.45) {
    cappedWeights.r6_squad_value_vs_form = coreWeightSum * 0.45;
  }
  const finalWeights = normalizeWeights(cappedWeights);

  let weightedTen = 0;
  const weightedContributions = {} as Record<RuleKey, number>;
  for (const key of RULE_KEYS) {
    const contrib = effectiveScores[key] * finalWeights[key];
    weightedContributions[key] = contrib;
    weightedTen += contrib;
  }

  // Apply multiplicative caution dampers for Dead-Rubber (R1), Derby (R5), Continental Fatigue (R7), and Volatile League (R8)
  let cautionDamper = 1.0;
  if (r1 < 4.5) cautionDamper *= 0.88;
  if (r5 < 5.0) cautionDamper *= 0.90;
  if (r7 < 4.8) cautionDamper *= 0.90;
  if (onWatchlist || r8 < 4.5) cautionDamper *= 0.84;
  // Also damp slightly for high competitor volatility_index
  cautionDamper *= clamp(1.04 - volatilityIndex * 0.18, 0.88, 1.02);

  const dampedTen = clamp(5.0 + (weightedTen - 5.0) * cautionDamper, 0, 10);

  const eightPointScore100 = clamp(dampedTen * 10, 0, 100);
  const eightPointScale8 = clamp((dampedTen / 10) * 8, 0, 8);

  const impliedProb = clamp(1 / Math.max(1.05, decimalOdds), 0.05, 0.95);
  const impliedLogit = Math.log(impliedProb / (1 - impliedProb));
  const ruleSignal = (dampedTen - 5.65) * 0.36;
  const combinedLogit = impliedLogit * 0.72 + ruleSignal + (dampedTen - 5.0) * 0.14;

  // In watchlist volatile leagues or fierce derbies, shrink extreme probabilities toward equilibrium
  const rawProb = clamp(1 / (1 + Math.exp(-combinedLogit)), 0.04, 0.95);
  const equilibrium = sport === SportId.Soccer ? 0.36 : 0.50;
  const shrink = onWatchlist ? 0.74 : r5 < 4.8 ? 0.86 : 1.0;
  const ruleProbability = clamp(
    equilibrium + (rawProb - equilibrium) * shrink,
    0.04,
    0.95
  );

  return {
    eightPointScore100,
    eightPointScale8,
    ruleProbability,
    effectiveScores,
    weightedContributions,
    cautionFlags,
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}
