(() => {
  "use strict";


  const STORAGE_KEY = "drag_race_simulator_state_v1";
  const CUSTOM_CONTESTANTS_KEY = "drag_race_custom_contestants_v1";

  const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#171b2d" />
          <stop offset="100%" stop-color="#2c3250" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="42" fill="url(#g)" />
      <circle cx="160" cy="124" r="56" fill="#9199bb" opacity="0.72"/>
      <rect x="74" y="194" width="172" height="72" rx="36" fill="#9199bb" opacity="0.64"/>
    </svg>
  `);

  const skillKeys = [
    ["acting", "Acting"],
    ["comedy", "Comedy"],
    ["dance", "Dance"],
    ["design", "Design"],
    ["improv", "Improv"],
    ["runway", "Runway"],
    ["lipsync", "Lip Sync"]
  ];

  const modeDescriptions = {
    viewer: "Viewer mode simulates the season automatically and reveals the story section by section."
  };

  const eliminationFormatDescriptions = {
    regular: "Regular Drag Race eliminations with a bottom lip sync.",
    legacy: "Lip Sync For Your Legacy: top two lip sync, both pick lipsticks, and the winner eliminates one bottom contestant.",
    assassin: "Lip Sync Assassin: the winner lip syncs against an assassin; if the assassin wins, the group vote decides who leaves.",
    golden_beaver: "Golden Beaver: the challenge winner saves one contestant from the bottom three, and the remaining bottom two lip sync for their lives.",
    all_winners: "All Winners: nobody is eliminated, weekly top two queens earn Legendary Legend Stars, and the finale is decided by a Lip Sync Smackdown.",
    tournament: "Tournament: contestants compete in bracket episodes for MVQ points, then merge before a mandatory Lip Sync for The Crown finale.",
    teams: "Teams: contestants are paired for the season, judged and eliminated together until the finale."
  };

  const premiereDescriptions = {
    regular: "A standard premiere with one contestant being eliminated.",
    slayers: "Non-elimination premiere with only tops and a lip sync for the win.",
    non_elim_top2: "Regular judging but instead of the bottom two, the top two lip syncs for the win.",
    late_entry: "One of the contestants gets to skip the premiere episode and join the competition later.",
    uk3: "One top-two lip sync and one bottom-two lip sync in the premiere.",
    split_s6: "Two split-premiere episodes. Each half eliminates one contestant, then the groups merge.",
    split_s12: "Two split-premiere episodes with top-two lip syncs and no eliminations.",
    rate_a_queen_s16: "Two talent-show split premieres where the queens Rate-A-Queen, followed by a merged Rate-A-Queen episode.",
    rate_a_queen_s17: "Two talent-show split premieres where the opposite group rates the competing queens, with the two bottom queens lip syncing in Episode 2.",
    porkchop: "Three-part premiere: queens open with Porkchop lip sync battles, then the winners and porkchop groups each compete in non-elimination episodes.",
    split_s14: "Two split-premiere episodes with eliminations, but the eliminated contestants return at Episode 3."
  };

  const finaleDescriptions = {
    regular_finale: "Finalists perform final lip syncs, and the winner is chosen.",
    top2_finale: "Finalists are cut down to a top two in the finale before the final lip sync.",
    lsftc: "Four finalists compete in a Lip Sync for the Crown tournament.",
    jury_finale: "Eliminated contestants vote for two finalists.",
    lsftf: "At top four, a penultimate lalaparuza eliminates one queen before the finale.",
    cunt_test: "At the Top 5, three maxi challenges each send one contestant to the finale. The remaining two lip sync for the final Top 4 spot, then the finale plays as a Top 2 Finale."
  };

  const comebackDescriptions = {
    none: "No eliminated contestants return.",
    random_return: "One eliminated contestant is randomly brought back.",
    choose_return: "You choose one eliminated contestant to return.",
    other_queens_choose: "The remaining contestants vote for one eliminated contestant to return.",
    reading_is_fundamental: "The eliminated contestants compete in a Reading challenge; the funniest queen returns.",
    conjoined_twins: "Remaining queens are paired with eliminated queens for a makeover-style comeback challenge.",
    reinas_de_la_comedia: "Remaining queens pair with eliminated queens for a comedy comeback challenge.",
    attention_girl_groups: "The best eliminated girl-group performer lip syncs against the weakest remaining queen for a spot back in the competition.",
    kitty_girl_groups: "Remaining queens and eliminated queens battle as rival girl groups, then the winning side takes power.",
    revenge_of_the_queens: "Eliminated queens partner with remaining queens, then the top eliminated queens lip sync to return.",
    lalaparuza_comeback: "Eliminated queens lip sync against remaining queens in a comeback LaLaPaRuZa.",
    game_within_a_game: "Eliminated queens battle through a late-season lip sync tournament to re-enter the competition."
  };

  const trackLegend = [
    ["WIN", "Challenge winner."],
    ["TOP2", "Top two lip sync participant."],
    ["TOP4", "Final four rumix performance."],
    ["TOP3", "Advanced from Lip Sync for The Finale."],
    ["HIGH", "One of the strongest performers."],
    ["SAFE", "Safe / middle placement."],
    ["LALA_R1", "Safe after winning Round 1 of LaLaPaRuZa."],
    ["LALA_R2", "Safe after winning Round 2 of LaLaPaRuZa."],
    ["LALA_R3", "Safe after winning the final LaLaPaRuZa lip sync."],
    ["SLAYOFF_LOW", "Saved from the bottom lip sync in Slay-Offs."],
    ["FAME_GAMES", "Won the Fame Games."],
    ["LOW", "Negative critique but did not lip sync."],
    ["LOW + GOLD", "Saved from the bottom three by the Golden Beaver."],
    ["LC BORDER", "Saved by the Lucky Cow vote."],
    ["DUNK BORDER", "Saved by the Badonka Dunk Tank."],
    ["BLK", "Blocked from earning a Legendary Legend Star."],
    ["HIGH+BLK", "High placement while blocked from earning a Legendary Legend Star."],
    ["BTM", "Up for elimination."],
    ["BTM1", "Lowest-ranked queen in a Rate-A-Queen part."],
    ["ELIM", "Eliminated."],
    ["QUIT", "Withdrew from the competition."],
    ["BTM2_QUIT", "Quit after being placed in the bottom two."],
    ["WIN_QUIT", "Won the episode, then withdrew from the competition."],
    ["DEPT", "Left the competition on medical advice."],
    ["DISQ", "Disqualified for breaking the rules of the competition."],
    ["ELIM (PARTNER)", "Eliminated because their partner lost the team lip sync."],
    ["BTM2 (PARTNER)", "In the bottom pair, but their partner lip synced and survived."],
    ["SDADHH", "Queen of She Done Already Done Had Herses."],
    ["LOST", "Lost in the Queen of She Done Already Done Had Herses smackdown."],
    ["CHOC", "Saved by the golden chocolate bar."],
    ["IMM", "Immune from elimination."],
    ["RTRN", "Returned to the competition."],
    ["RTRN + PLACEMENT", "Returned and received a competitive placement in the same episode."],
    ["OUT", "Competed or appeared for a comeback but did not return."],
    ["IN", "Won a comeback tournament and re-entered the competition."],
    ["DWIN", "Won as part of a comeback pair or team."],
    ["PWIN", "Won a Porkchop Premiere lip sync."],
    ["PLOSS", "Lost a Porkchop Premiere lip sync."],
    ["PCHOP", "Received the Porkchop Loading Dock chop."],
    ["RUN", "The contestant appeared and did not compete, but was still in the running."],
    ["RU", "Runner-up."],
    ["GUEST", "Finale guest."],
    ["MX. CON", "Mx. Congeniality."],
    ["GB", "Golden Boot."],
    ["WINNER", "Season winner."]
  ];

  const STORYLINE_ARCHETYPES = [
    { title: "The Undeniable Winner", signals: ["undeniableWinner", "dominance"], family: "competition", gate: "undeniableWinner", minGate: 58 },
    { title: "The Professional", signals: ["professional", "consistency"], family: "competition", gate: "professional", minGate: 52 },
    { title: "The Late Bloomer", signals: ["lateSurge", "growth"], family: "arc", gate: "lateSurge", minGate: 55 },
    { title: "The Redemption Arc", signals: ["redemptionRole", "growth"], family: "arc", gate: "redemptionRole", minGate: 52 },
    { title: "The Prodigy", signals: ["prodigy", "dominance"], family: "competition", gate: "prodigy", minGate: 62 },
    { title: "The Chosen One", signals: ["chosenOne", "productionFavorite"], family: "edit", gate: "chosenOne", minGate: 52 },

    { title: "The Relatable Underdog", signals: ["relatableUnderdog", "fanDefense"], family: "arc", gate: "relatableUnderdog", minGate: 50 },
    { title: "The Misunderstood Weirdo", signals: ["misunderstoodWeirdo", "cultFavorite"], family: "edit", gate: "misunderstoodWeirdo", minGate: 54 },
    { title: "The Heart of the Season", signals: ["heartOfSeason", "positiveUntucked"], family: "social", gate: "heartOfSeason", minGate: 52 },
    { title: "The Growth Arc", signals: ["growthArc", "growth"], family: "arc", gate: "growthArc", minGate: 52 },
    { title: "The Robbed Queen", signals: ["robbedQueen", "popularity"], family: "competition", gate: "robbedQueen", minGate: 54 },
    { title: "The Lip Sync Assassin", signals: ["lipSyncAssassin", "lipSyncWins"], family: "lipsync", gate: "lipSyncAssassin", minGate: 48 },

    { title: "The Delusional Queen", signals: ["delusionalQueen", "polarizing"], family: "social", gate: "delusionalQueen", minGate: 52 },
    { title: "The Bitter Veteran", signals: ["bitterVeteran", "negativeUntucked"], family: "social", gate: "bitterVeteran", minGate: 58 },
    { title: "The Look Queen with No Personality", signals: ["lookNoPersonality", "runwayCarry"], family: "fashion", gate: "lookNoPersonality", minGate: 54 },
    { title: "The Instigator", signals: ["instigator", "drama"], family: "social", gate: "instigator", minGate: 48 },
    { title: "The Cutthroat Competitor", signals: ["cutthroatCompetitor", "strategy"], family: "competition", gate: "cutthroatCompetitor", minGate: 53 },
    { title: "The Villain by Editing", signals: ["villainByEditing", "negativeUntucked"], family: "edit", gate: "villainByEditing", minGate: 52 },
    { title: "The Loud Mouth", signals: ["loudMouth", "visibility"], family: "social", gate: "loudMouth", minGate: 55 },
    { title: "The Passive-Aggressive Shade-Thrower", signals: ["passiveAggressive", "drama"], family: "social", gate: "passiveAggressive", minGate: 52 },

    { title: "The Porkchop", signals: ["porkchopRole", "cultFavorite"], family: "arc", gate: "porkchopRole", minGate: 75 },
    { title: "The Early Flop", signals: ["earlyFlop", "earlyOut"], family: "arc", gate: "earlyFlop", minGate: 58 },
    { title: "The Coasting Queen", signals: ["coastingQueen", "safeStreak"], family: "edit", gate: "coastingQueen", minGate: 55 },
    { title: "The Sacrificial Lamb", signals: ["sacrificialLamb", "lipSyncLosses"], family: "lipsync", gate: "sacrificialLamb", minGate: 60 },
    { title: "The Shock Elimination", signals: ["shockElimination", "dominance"], family: "competition", gate: "shockElimination", minGate: 58 },
    { title: "The Right Before the Finale Cut", signals: ["rightBeforeFinale", "lateOut"], family: "competition", gate: "rightBeforeFinale", minGate: 70 },

    { title: "The Inner Saboteur", signals: ["innerSaboteur", "messy"], family: "arc", gate: "innerSaboteur", minGate: 52 },
    { title: "The Frozen Overthinker", signals: ["frozenOverthinker", "decline"], family: "arc", gate: "frozenOverthinker", minGate: 52 },
    { title: "The Defeated", signals: ["defeatedRole", "decline"], family: "arc", gate: "defeatedRole", minGate: 58 },
    { title: "The Imposter Syndrome", signals: ["imposterSyndrome", "underdog"], family: "arc", gate: "imposterSyndrome", minGate: 50 },
    { title: "The Validation Seeker", signals: ["validationSeeker", "emotional"], family: "arc", gate: "validationSeeker", minGate: 50 },

    { title: "The Look-Alike Rivals", signals: ["lookAlikeRivals", "rivalry"], family: "relationship", gate: "lookAlikeRivals", minGate: 55 },
    { title: "The Showmance", signals: ["showmance", "social"], family: "relationship", gate: "showmance", minGate: 58 },
    { title: "The Drag Mother vs. Daughter", signals: ["dragFamilyRivalry", "rivalry"], family: "relationship", gate: "dragFamilyRivalry", minGate: 70 },
    { title: "The Bitter Exes", signals: ["bitterExes", "rivalry"], family: "relationship", gate: "bitterExes", minGate: 65 },
    { title: "The Unlikely Duo", signals: ["unlikelyDuo", "social"], family: "relationship", gate: "unlikelyDuo", minGate: 55 },

    { title: "The Commentary Queen", signals: ["commentaryQueen", "narrator"], family: "edit", gate: "commentaryQueen", minGate: 50 },
    { title: "The Meme Queen", signals: ["memeQueen", "popularityRise"], family: "edit", gate: "memeQueen", minGate: 50 },
    { title: "The Catchphrase Machine", signals: ["catchphraseMachine", "visibility"], family: "edit", gate: "catchphraseMachine", minGate: 55 },
    { title: "The One-Note Joke", signals: ["oneNoteJoke", "ottRole"], family: "edit", gate: "oneNoteJoke", minGate: 55 },

    { title: "The Royalty Returnee", signals: ["royaltyReturnee", "threat"], family: "competition", gate: "royaltyReturnee", minGate: 65 },
    { title: "The Local Celebrity", signals: ["localCelebrity", "polarizing"], family: "arc", gate: "localCelebrity", minGate: 58 },
    { title: "The Fashion Girl Who Can Joke", signals: ["fashionCanJoke", "comedy"], family: "fashion", gate: "fashionCanJoke", minGate: 55 },
    { title: "The Over-Prepared Pageant", signals: ["overPreparedPageant", "professional"], family: "edit", gate: "overPreparedPageant", minGate: 56 },
    { title: "The Heartbreaking Medical Exit", signals: ["medicalExit", "positiveUntucked"], family: "arc", gate: "medicalExit", minGate: 90 },
    { title: "The Silent Threat", signals: ["silentThreat", "quietThreat"], family: "competition", gate: "silentThreat", minGate: 52 },
    { title: "The Out of Her Depth", signals: ["outOfDepth", "challengeLow"], family: "arc", gate: "outOfDepth", minGate: 53 },
    { title: "The System Player", signals: ["systemPlayer", "strategy"], family: "competition", gate: "systemPlayer", minGate: 55 },
    { title: "The Social Media Sensation", signals: ["socialMediaSensation", "popularity"], family: "edit", gate: "socialMediaSensation", minGate: 62 },
    { title: "The Untouchable Icon", signals: ["untouchableIcon", "cultFavorite"], family: "edit", gate: "untouchableIcon", minGate: 58 }
  ];

  const fallbackChallenges = [
    {
      id: "entrance_runway_extravaganza",
      name: "Entrance Runway Extravaganza",
      type: "runway",
      repeatable: true,
      premiereEligible: true,
      teamMode: "solo",
      requiredSkills: { runway: 0.55, design: 0.25, comedy: 0.10, acting: 0.10 }
    },
    {
      id: "design_on_a_dime",
      name: "Design On A Dime",
      type: "design",
      repeatable: true,
      premiereEligible: true,
      teamMode: "solo",
      requiredSkills: { design: 0.55, runway: 0.25, comedy: 0.10, improv: 0.10 }
    },
    {
      id: "talent_showcase",
      name: "Talent Show Showcase",
      type: "talent_show",
      repeatable: false,
      premiereEligible: true,
      teamMode: "solo",
      requiredSkills: { comedy: 0.20, dance: 0.20, acting: 0.20, improv: 0.20, lipsync: 0.20 }
    },
    {
      id: "premiere_rumix",
      name: "Premiere Verse Rumix",
      type: "rumix",
      repeatable: false,
      premiereEligible: true,
      penultimateEligible: true,
      teamMode: "solo",
      requiredSkills: { dance: 0.30, comedy: 0.20, acting: 0.15, improv: 0.15, lipsync: 0.20 }
    },
    {
      id: "acting_soap_opera",
      name: "Campy Soap Opera Acting Challenge",
      type: "acting",
      repeatable: true,
      teamMode: "solo",
      requiredSkills: { acting: 0.45, comedy: 0.25, improv: 0.20, runway: 0.10 }
    },
    {
      id: "improv_panel",
      name: "Unscripted Talk Show Improv",
      type: "improv",
      repeatable: true,
      teamMode: "solo",
      requiredSkills: { improv: 0.45, comedy: 0.25, acting: 0.20, runway: 0.10 }
    },
    {
      id: "snatch_game",
      name: "Snatch Game",
      type: "snatch_game",
      repeatable: false,
      teamMode: "solo",
      requiredSkills: { comedy: 0.40, improv: 0.35, acting: 0.15, runway: 0.10 }
    },
    {
      id: "stand_up_roast",
      name: "Stand-Up Roast",
      type: "roast",
      repeatable: false,
      teamMode: "solo",
      requiredSkills: { comedy: 0.45, improv: 0.25, acting: 0.15, runway: 0.15 }
    },
    {
      id: "rusical_divas",
      name: "Divas: The Unauthorized Rusical",
      type: "rusical",
      repeatable: false,
      teamMode: "solo",
      requiredSkills: { acting: 0.30, dance: 0.25, comedy: 0.20, lipsync: 0.15, runway: 0.10 }
    },
    {
      id: "girl_groups_pop",
      name: "Pop Anthem Girl Groups",
      type: "girlgroups",
      repeatable: false,
      teamMode: "groups",
      allowedGroupSizes: [3, 4, 5],
      requiredSkills: { dance: 0.30, comedy: 0.20, acting: 0.15, improv: 0.15, lipsync: 0.20 }
    },
    {
      id: "ball_of_many_looks",
      name: "The Three-Look Ball",
      type: "ball",
      repeatable: false,
      penultimateEligible: true,
      teamMode: "solo",
      requiredSkills: { design: 0.40, runway: 0.40, comedy: 0.10, acting: 0.10 }
    },
    {
      id: "makeover_family",
      name: "Family Resemblance Makeover",
      type: "makeover",
      repeatable: false,
      penultimateEligible: true,
      teamMode: "pairs",
      requiredSkills: { design: 0.35, runway: 0.30, acting: 0.15, comedy: 0.10, improv: 0.10 }
    },
    {
      id: "dance_battle",
      name: "Choreography Dance Battle",
      type: "dance",
      repeatable: true,
      teamMode: "groups",
      allowedGroupSizes: [2, 3, 4],
      requiredSkills: { dance: 0.50, lipsync: 0.20, acting: 0.15, runway: 0.15 }
    },
    {
      id: "commercial_pairs",
      name: "Brand Commercial Pairs",
      type: "acting",
      repeatable: true,
      teamMode: "pairs",
      requiredSkills: { acting: 0.35, comedy: 0.25, improv: 0.20, runway: 0.20 }
    },
    {
      id: "political_debate",
      name: "Drag Debate Improv Challenge",
      type: "improv",
      repeatable: true,
      teamMode: "solo",
      requiredSkills: { improv: 0.40, comedy: 0.25, acting: 0.20, runway: 0.15 }
    },
    {
      id: "finale_rumix",
      name: "Finale Rumix Performance",
      type: "rumix",
      repeatable: false,
      penultimateEligible: true,
      teamMode: "solo",
      requiredSkills: { dance: 0.30, lipsync: 0.25, acting: 0.20, comedy: 0.15, runway: 0.10 }
    }
  ];

  const fallbackRunways = [
    { id: "hometown_glamour", name: "Hometown Glamour" },
    { id: "night_of_1000_pop_icons", name: "Night of 1000 Pop Icons" },
    { id: "ugly_chic", name: "Ugly Chic" },
    { id: "royal_reveal", name: "Royal Reveal" },
    { id: "death_becomes_her", name: "Death Becomes Her" },
    { id: "drag_on_a_dime", name: "Drag on a Dime" },
    { id: "futuristic_fantasy", name: "Futuristic Fantasy" },
    { id: "red_for_filth", name: "Red for Filth" },
    { id: "black_and_white", name: "Black & White Drama" },
    { id: "best_drag", name: "Best Drag" },
    { id: "rudemption", name: "Rudemption Runway" },
    { id: "finale_eleganza", name: "Finale Eleganza" }
  ];

  const fallbackLipSyncs = [
    {
      id: "supermodel",
      title: "Supermodel",
      artist: "RuPaul",
      energy: "dance",
      comments: {
        slayed: ["{queen} owns every beat and turns the stage into a solo concert."],
        good: ["{queen} sells the song with confidence, attitude, and clean timing."],
        bad: ["{queen} misses key moments and struggles to connect to the track."]
      }
    },
    {
      id: "call_me_mother",
      title: "Call Me Mother",
      artist: "RuPaul",
      energy: "dance",
      comments: {
        slayed: ["{queen} attacks the choreography and makes every lyric count."],
        good: ["{queen} gives strong energy and enough personality to stay in the fight."],
        bad: ["{queen} gets swallowed by the song and never fully recovers."]
      }
    },
    {
      id: "stronger",
      title: "Stronger",
      artist: "Britney Spears",
      energy: "pop",
      comments: {
        slayed: ["{queen} builds a full pop-diva fantasy and lands the emotional beats."],
        good: ["{queen} gives a focused, polished performance with a few memorable moments."],
        bad: ["{queen} cannot find the song's momentum and looks disconnected."]
      }
    },
    {
      id: "vogue",
      title: "Vogue",
      artist: "Madonna",
      energy: "pose",
      comments: {
        slayed: ["{queen} serves face, hands, drama, and precision from start to finish."],
        good: ["{queen} finds the groove and gives enough elegance to impress the panel."],
        bad: ["{queen} never finds the clean lines the song demands."]
      }
    },
    {
      id: "survivor",
      title: "Survivor",
      artist: "Destiny's Child",
      energy: "power",
      comments: {
        slayed: ["{queen} fights for the crown with fire, focus, and a killer final chorus."],
        good: ["{queen} gives determination and a few smart reveals."],
        bad: ["{queen} fades when the song needs power."]
      }
    }
  ];

  const fallbackUntuckedEvents = [
    { type: "bonding", participants: 2, text: "{A} comforts {B} after a rough critique.", relationship: 2, popularity: 1, edgic: "MOR" },
    { type: "bonding", participants: 2, text: "{A} and {B} laugh about the chaos of the main stage and grow closer.", relationship: 2, popularity: 1, edgic: "MOR" },
    { type: "drama", participants: 2, text: "{A} calls out {B} for throwing shade during critiques.", relationship: -3, popularity: 1, edgic: "CPN" },
    { type: "drama", participants: 2, text: "{A} and {B} get into a tense argument in Untucked.", relationship: -3, popularity: 1, edgic: "OTTN" },
    { type: "storyline", participants: 1, text: "{A} opens up about how much this competition means to them.", relationship: 0, popularity: 2, edgic: "CPP" },
    { type: "storyline", participants: 1, text: "{A} becomes the narrator of the episode with a string of sharp confessionals.", relationship: 0, popularity: 2, edgic: "CP" },
    { type: "rivalry", participants: 2, text: "{A} admits they see {B} as their biggest competition.", relationship: -1, popularity: 1, edgic: "CP" },
    { type: "meltdown", participants: 1, text: "{A} spirals after the critiques and needs a moment to breathe.", relationship: 0, popularity: -1, edgic: "OTTN" }
  ];

  const relationshipScale = [
    { value: 10, label: "Best Judy", emoji: "💚", className: "rel-pos-10" },
    { value: 9, label: "Best Squirrelfriend", emoji: "🐿️", className: "rel-pos-9" },
    { value: 8, label: "Chosen Family", emoji: "🏠", className: "rel-pos-8" },
    { value: 7, label: "Werkroom Ride-or-Die", emoji: "👯", className: "rel-pos-7" },
    { value: 6, label: "Untucked Ally", emoji: "🥂", className: "rel-pos-6" },
    { value: 5, label: "RuGirl Bond", emoji: "💖", className: "rel-pos-5" },
    { value: 4, label: "Good Judy", emoji: "✨", className: "rel-pos-4" },
    { value: 3, label: "Kiki Partner", emoji: "🪩", className: "rel-pos-3" },
    { value: 2, label: "Friendly Queen", emoji: "🙂", className: "rel-pos-2" },
    { value: 1, label: "Warm Acquaintance", emoji: "🌤️", className: "rel-pos-1" },
    { value: 0, label: "No Tea No Shade", emoji: "⚪", className: "rel-zero" },
    { value: -1, label: "Frenemy", emoji: "👀", className: "rel-neg-1" },
    { value: -2, label: "Side-Eye Sister", emoji: "😒", className: "rel-neg-2" },
    { value: -3, label: "Reading Room Target", emoji: "📖", className: "rel-neg-3" },
    { value: -4, label: "Untucked Tension", emoji: "🍸", className: "rel-neg-4" },
    { value: -5, label: "Werkroom Rival", emoji: "⚔️", className: "rel-neg-5" },
    { value: -6, label: "Shade Assassin", emoji: "🕶️", className: "rel-neg-6" },
    { value: -7, label: "Lipstick Target", emoji: "💄", className: "rel-neg-7" },
    { value: -8, label: "Untucked Enemy", emoji: "🥃", className: "rel-neg-8" },
    { value: -9, label: "Arch Nemesis", emoji: "🧨", className: "rel-neg-9" },
    { value: -10, label: "Mortal Ru-Enemy", emoji: "💀", className: "rel-neg-10" }
  ];

  function relationshipOption(value) {
    const n = clamp(Number(value), -10, 10);
    return relationshipScale.find((item) => item.value === n) || relationshipScale.find((item) => item.value === 0);
  }

  const fallbackGuestJudges = [
    { name: "A Pop Superstar", types: ["rumix", "girlgroups", "dance", "talent_show"] },
    { name: "A Legendary Fashion Designer", types: ["design", "ball", "runway", "makeover"] },
    { name: "A Comedy Icon", types: ["roast", "improv", "snatch_game", "acting"] },
    { name: "A Broadway Choreographer", types: ["rusical", "dance", "rumix"] },
    { name: "An Award-Winning Actor", types: ["acting", "improv", "rusical"] }
  ];

  const miniChallenges = [
    "Reading is Fundamental",
    "Quick Drag Photoshoot",
    "Puppet Challenge",
    "Pit Crew Styling Sprint",
    "Drag Name Improv",
    "Library Roast",
    "Dance-Off Warmup",
    "Fashion Trivia"
  ];

  const state = {
    defaults: {
      seasonName: "Fantasy Drag Race",
      mode: "viewer",
      eliminationFormat: "regular",
      castSize: 14,
      finalistSize: 4,
      finaleType: "regular_finale",
      premiereType: "regular",
      comebackFormat: "none",
      twistImmunity: false,
      twistChocolateRandom: false,
      twistChocolateChoosable: false,
      twistLuckyCow: false,
      twistBadonkaDunkTank: false,
      disableChallengeRiggory: false,
      disableLipSyncRiggory: false,
      disableDoubleShantaysSashays: false,
      disableNonElimination: false,
      forceSlayersEpisode: false,
      forceDoubleShantay: false,
      specialLalaparuzaSmackdown: false,
      specialSlayOffs: false,
      specialReunionLalaparuza: false,
      specialMidSeasonRateAQueen: false,
      specialFameGames: false,
      tournamentBracketCount: 2,
      tournamentAdvancers: 2,
      tournamentBracketEpisodes: 3,
      tournamentMergeEpisodes: 2,
      tournamentPreMergeWildcard: false,
      tournamentPreFinaleWildcard: false
    },
    config: {},
    roster: [],
    filteredRoster: [],
    customContestants: [],
    selected: [],
    currentStep: "status",
    currentEpisodeIndex: 0,
    season: null
  };
  state.config = { ...state.defaults };

  const els = {
    seasonName: document.getElementById("seasonName"),
    modeSelect: document.getElementById("modeSelect"),
    eliminationFormatSelect: document.getElementById("eliminationFormatSelect"),
    premiereTypeSelect: document.getElementById("premiereTypeSelect"),
    finaleTypeSelect: document.getElementById("finaleTypeSelect"),
    comebackFormatSelect: document.getElementById("comebackFormatSelect"),
    castSize: document.getElementById("castSize"),
    finalistSize: document.getElementById("finalistSize"),
    tournamentSettingsCard: document.getElementById("tournamentSettingsCard"),
    tournamentBracketCount: document.getElementById("tournamentBracketCount"),
    tournamentAdvancers: document.getElementById("tournamentAdvancers"),
    tournamentBracketEpisodes: document.getElementById("tournamentBracketEpisodes"),
    tournamentMergeEpisodes: document.getElementById("tournamentMergeEpisodes"),
    tournamentPreMergeWildcard: document.getElementById("tournamentPreMergeWildcard"),
    tournamentPreFinaleWildcard: document.getElementById("tournamentPreFinaleWildcard"),
    castSizeValue: document.getElementById("castSizeValue"),
    finalistSizeValue: document.getElementById("finalistSizeValue"),
    tournamentBracketCountValue: document.getElementById("tournamentBracketCountValue"),
    tournamentAdvancersValue: document.getElementById("tournamentAdvancersValue"),
    tournamentBracketEpisodesValue: document.getElementById("tournamentBracketEpisodesValue"),
    tournamentMergeEpisodesValue: document.getElementById("tournamentMergeEpisodesValue"),
    modeHelp: document.getElementById("modeHelp"),
    eliminationFormatHelp: document.getElementById("eliminationFormatHelp"),
    premiereHelp: document.getElementById("premiereHelp"),
    finaleHelp: document.getElementById("finaleHelp"),
    comebackHelp: document.getElementById("comebackHelp"),
    twistImmunity: document.getElementById("twistImmunity"),
    twistChocolateRandom: document.getElementById("twistChocolateRandom"),
    twistChocolateChoosable: document.getElementById("twistChocolateChoosable"),
    twistLuckyCow: document.getElementById("twistLuckyCow"),
    twistBadonkaDunkTank: document.getElementById("twistBadonkaDunkTank"),
    luckyCowStack: document.getElementById("luckyCowStack"),
    badonkaDunkTankStack: document.getElementById("badonkaDunkTankStack"),
    disableChallengeRiggory: document.getElementById("disableChallengeRiggory"),
    disableLipSyncRiggory: document.getElementById("disableLipSyncRiggory"),
    disableDoubleShantaysSashays: document.getElementById("disableDoubleShantaysSashays"),
    disableNonElimination: document.getElementById("disableNonElimination"),
    forceSlayersEpisode: document.getElementById("forceSlayersEpisode"),
    forceDoubleShantay: document.getElementById("forceDoubleShantay"),
    specialTop8None: document.getElementById("specialTop8None"),
    specialLalaparuzaSmackdown: document.getElementById("specialLalaparuzaSmackdown"),
    specialSlayOffs: document.getElementById("specialSlayOffs"),
    specialReunionLalaparuza: document.getElementById("specialReunionLalaparuza"),
    specialMidSeasonRateAQueen: document.getElementById("specialMidSeasonRateAQueen"),
    specialFameGames: document.getElementById("specialFameGames"),
    specialLalaparuzaHelp: document.getElementById("specialLalaparuzaHelp"),

    showFilter: document.getElementById("showFilter"),
    seasonFilter: document.getElementById("seasonFilter"),
    genderFilter: document.getElementById("genderFilter"),
    searchFilter: document.getElementById("searchFilter"),
    rosterGrid: document.getElementById("rosterGrid"),
    selectedGrid: document.getElementById("selectedGrid"),
    availableCount: document.getElementById("availableCount"),
    selectedCount: document.getElementById("selectedCount"),
    slotCount: document.getElementById("slotCount"),
    teamLegend: document.getElementById("teamLegend"),

    episodeTitle: document.getElementById("episodeTitle"),
    episodeSubline: document.getElementById("episodeSubline"),
    episodeSelect: document.getElementById("episodeSelect"),
    episodeNotice: document.getElementById("episodeNotice"),
    remainingStrip: document.getElementById("remainingStrip"),
    eliminatedStrip: document.getElementById("eliminatedStrip"),
    eliminatedTitle: document.getElementById("eliminatedTitle"),
    guestJudgeStack: document.getElementById("guestJudgeStack"),
    miniChallengeStack: document.getElementById("miniChallengeStack"),
    comebackStack: document.getElementById("comebackStack"),
    teamPickingStack: document.getElementById("teamPickingStack"),
    fameGamesFinaleStack: document.getElementById("fameGamesFinaleStack"),
    rumocracyStack: document.getElementById("rumocracyStack"),
    goldenBeaverStack: document.getElementById("goldenBeaverStack"),
    challengeSummary: document.getElementById("challengeSummary"),
    challengeGrid: document.getElementById("challengeGrid"),
    runwaySummary: document.getElementById("runwaySummary"),
    runwayGrid: document.getElementById("runwayGrid"),
    judgingStack: document.getElementById("judgingStack"),
    rateQueenStack: document.getElementById("rateQueenStack"),
    placementsGrid: document.getElementById("placementsGrid"),
    s17LsfylBoard: document.getElementById("s17LsfylBoard"),
    s17LsfylResultsBoard: document.getElementById("s17LsfylResultsBoard"),
    s17LsfylCrowningMessage: document.getElementById("s17LsfylCrowningMessage"),
    revealS17LsfylResultsBtn: document.getElementById("revealS17LsfylResultsBtn"),
    bottomTwoBox: document.getElementById("bottomTwoBox"),
    lipSyncBoard: document.getElementById("lipSyncBoard"),
    qosdadhhBoard: document.getElementById("qosdadhhBoard"),
    lsftcBoard: document.getElementById("lsftcBoard"),
    winnerBoard: document.getElementById("winnerBoard"),
    winnerCrowningMessage: document.getElementById("winnerCrowningMessage"),
    revealCrownWinnerBtn: document.getElementById("revealCrownWinnerBtn"),
    allWinnersFinalStatsBtn: document.getElementById("allWinnersFinalStatsBtn"),
    revealBoard: document.getElementById("revealBoard"),
    resultsSectionTitle: document.getElementById("resultsSectionTitle"),
    crowningMessage: document.getElementById("crowningMessage"),
    revealResultsBtn: document.getElementById("revealResultsBtn"),
    nextEpisodeBtn: document.getElementById("nextEpisodeBtn"),
    finishEpisodeBtn: document.getElementById("finishEpisodeBtn"),
    untuckedStack: document.getElementById("untuckedStack"),
    pointCeremonyStack: document.getElementById("pointCeremonyStack"),
    wildcardStack: document.getElementById("wildcardStack"),
    cuntTestPart1Stack: document.getElementById("cuntTestPart1Stack"),
    cuntTestPart2Stack: document.getElementById("cuntTestPart2Stack"),
    cuntTestPart3Stack: document.getElementById("cuntTestPart3Stack"),

    trackWrap: document.getElementById("trackWrap"),
    episodeTrackWrap: document.getElementById("episodeTrackWrap"),
    trackLegend: document.getElementById("trackLegend"),
    downloadTrackRecordBtn: document.getElementById("downloadTrackRecordBtn"),
    lipSyncStatsWrap: document.getElementById("lipSyncStatsWrap"),
    runwayStatsWrap: document.getElementById("runwayStatsWrap"),
    challengeStatsWrap: document.getElementById("challengeStatsWrap"),
    popularityWrap: document.getElementById("popularityWrap"),
    edgicWrap: document.getElementById("edgicWrap"),
    storylinesWrap: document.getElementById("storylinesWrap"),
    highlightsWrap: document.getElementById("highlightsWrap"),
    votingStatsWrap: document.getElementById("votingStatsWrap"),
    starCountWrap: document.getElementById("starCountWrap"),
    pointSummaryWrap: document.getElementById("pointSummaryWrap"),
    pointBracketWrap: document.getElementById("pointBracketWrap"),

    presetCastModal: document.getElementById("presetCastModal"),
    presetCastForm: document.getElementById("presetCastForm"),
    presetShowSelect: document.getElementById("presetShowSelect"),
    presetSeasonSelect: document.getElementById("presetSeasonSelect"),
    closePresetCastModal: document.getElementById("closePresetCastModal"),
    cancelPresetCastBtn: document.getElementById("cancelPresetCastBtn"),

    customContestantModal: document.getElementById("customContestantModal"),
    customContestantForm: document.getElementById("customContestantForm"),
    customContestantId: document.getElementById("customContestantId"),
    customFullName: document.getElementById("customFullName"),
    customNickname: document.getElementById("customNickname"),
    customImageUrl: document.getElementById("customImageUrl"),
    customImagePreview: document.getElementById("customImagePreview"),
    customSkillsStack: document.getElementById("customSkillsStack"),
    randomizeCustomSkillsBtn: document.getElementById("randomizeCustomSkillsBtn"),
    closeCustomContestantModal: document.getElementById("closeCustomContestantModal"),
    cancelCustomContestantBtn: document.getElementById("cancelCustomContestantBtn"),
    deleteCustomContestantBtn: document.getElementById("deleteCustomContestantBtn"),

    skillModal: document.getElementById("skillModal"),
    skillForm: document.getElementById("skillForm"),
    closeSkillModal: document.getElementById("closeSkillModal"),
    modalContestantName: document.getElementById("modalContestantName"),
    modalProfile: document.getElementById("modalProfile"),
    skillsStack: document.getElementById("skillsStack")
  };

  function $(selector, root = document) { return root.querySelector(selector); }
  function $all(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function clamp(n, min, max) {
    const value = Number(n);
    const safe = Number.isFinite(value) ? value : min;
    return Math.max(min, Math.min(max, safe));
  }
  function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }
  function normalizeString(str) { return String(str || "").toLowerCase().trim(); }
  function titleize(str) { return String(str || "").replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()); }
  function escapeHtml(text) { return String(text ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch])); }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function fullDisplayName(item) { return item?.fullName || item?.name || item?.nickname || item?.id || "Contestant"; }
  function nickDisplayName(item) { return item?.nickname || item?.name || item?.fullName || item?.id || "Contestant"; }
  function displayName(item) { return fullDisplayName(item); }
  function pairKey(a, b) { return [a, b].sort().join("::"); }
  function formatList(ids, season = state.season) { return (ids || []).map((id) => escapeHtml(fullDisplayName(season.contestants[id]))).join(", "); }
  function formatNickList(ids, season = state.season) { return (ids || []).map((id) => escapeHtml(nickDisplayName(season.contestants[id]))).join(", "); }
  function sentenceList(ids, season = state.season, useNick = false) {
    const names = (ids || []).map((id) => useNick ? nickDisplayName(season.contestants[id]) : fullDisplayName(season.contestants[id]));
    if (!names.length) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
  }
  function ampersandList(ids, season = state.season, useNick = false) {
    const names = (ids || []).map((id) => useNick ? nickDisplayName(season.contestants[id]) : fullDisplayName(season.contestants[id]));
    if (!names.length) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
  }
  function episodeLabel(ep) { return ep?.label || `Episode ${ep?.number || ""}`; }

  const DRAG_RACE_DATA_BASE_URL = (() => {
    const script = Array.from(document.scripts).find((tag) => /(?:^|\/)drag_race_data\.js(?:[?#].*)?$/.test(tag.getAttribute("src") || ""));
    if (!script || !script.src) return "";
    try { return new URL(".", script.src).href; } catch (err) { return ""; }
  })();

  function resolveAssetPath(path) {
    const value = String(path || "").trim();
    if (!value) return PLACEHOLDER;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|data:|blob:)/i.test(value) || value.startsWith("/")) return value;
    if (!DRAG_RACE_DATA_BASE_URL) return value;
    try { return new URL(value, DRAG_RACE_DATA_BASE_URL).href; } catch (err) { return value; }
  }

  function normalizeChallengeFormat(challenge) {
    const format = String(challenge.format || challenge.teamMode || "solo").toLowerCase();
    const out = { teamMode: "solo", allowedGroupSizes: [], teamCount: 0 };
    if (format.includes("pair")) out.teamMode = "pairs";
    else if (format.includes("team") || format.includes("group")) out.teamMode = "groups";
    if (/2[_ -]?teams?/.test(format)) out.teamCount = 2;
    if (/3[_ -]?teams?/.test(format)) out.teamCount = 3;
    if (/4[_ -]?teams?/.test(format)) out.teamCount = 4;
    if (Array.isArray(challenge.allowedGroupSizes)) out.allowedGroupSizes = challenge.allowedGroupSizes.map(Number).filter(Boolean);
    return out;
  }

  const ONE_TIME_CHALLENGE_TYPES = new Set([
    "ball",
    "makeover",
    "runway",
    "rumix",
    "girlgroups",
    "rusical",
    "snatch_game",
    "talent_show",
    "roast"
  ]);

  const NO_SEPARATE_RUNWAY_TYPES = new Set(["design", "ball", "runway", "makeover"]);

  const FINALE_PERFORMANCE_STYLES = [
    "about their drag family",
    "about being a legend in the local community",
    "about wanting to snatch that crown",
    "with a 90s influence",
    "with an 80s influence",
    "in a western country style",
    "with a pop-star influence",
    "with very fast rap",
    "about finding their chosen family",
    "about surviving the competition",
    "with disco diva energy",
    "with club-kid chaos",
    "with Broadway drama",
    "with ballroom-house influence",
    "with punk-rock attitude",
    "with soft emotional vocals",
    "with a camp comedy hook",
    "with a dramatic spoken-word bridge",
    "with a high-fashion runway break",
    "with a fierce dance break",
    "about turning pain into power",
    "about being underestimated",
    "about small-town drag dreams",
    "about becoming an icon",
    "with a Latin pop influence",
    "with a hyperpop influence",
    "with a gospel-house influence",
    "with a futuristic cyber-pop sound",
    "with a classic diva ballad opening",
    "with a glittery bubblegum-pop chorus",
    "with a villainous theater-kid fantasy",
    "with an old-Hollywood burlesque mood",
    "with a house-party chant",
    "with a fashion-editorial concept",
    "with a dancehall influence",
    "with an electroclash influence",
    "about becoming mother",
    "about ruling the main stage",
    "with a pageant-queen fantasy",
    "with a chaotic camp finale"
  ];

  function challengeTypeKey(type) {
    const raw = normalizeString(type).replace(/[\s-]+/g, "_");
    if (!raw) return "acting";
    if (["ggs", "girl_group", "girl_groups", "girlgroup", "girlgroups"].includes(raw)) return "girlgroups";
    if (["snatchgame", "snatch_game"].includes(raw)) return "snatch_game";
    if (["talent", "talent_show", "talentshow"].includes(raw)) return "talent_show";
    return raw;
  }

  function challengeTypeLabel(type) {
    const key = challengeTypeKey(type);
    if (key === "girlgroups") return "Girl Groups";
    if (key === "snatch_game") return "Snatch Game";
    if (key === "talent_show") return "Talent Show";
    if (key === "lalaparuza") return "Lip Sync";
    return titleize(key);
  }

  const CHALLENGE_FAMILIES = {
    fashion: new Set(["runway", "ball", "design", "makeover"]),
    comedy: new Set(["snatch_game", "acting", "improv", "ads"]),
    performance: new Set(["rumix", "girlgroups", "rusical", "talent_show", "dance"])
  };

  function challengeFamily(type) {
    const key = challengeTypeKey(type);
    return Object.entries(CHALLENGE_FAMILIES).find(([, set]) => set.has(key))?.[0] || key;
  }

  const LOOK_BASED_CHALLENGE_TYPES = new Set(["design", "ball", "makeover", "runway"]);
  const ABSOLUTE_MAX_LOOK_BASED_CHALLENGES = 4;

  function seasonChallengeEpisodes(season) {
    return (season?.episodes || []).filter((episode) => episode?.challenge?.type);
  }

  function projectedSeasonEpisodeCount(season) {
    const config = season?.config || state.config || {};
    const cast = Number(config.castSize || season?.castOrder?.length || 14);
    const finalists = Number(config.finalistSize || 4);
    if (config.eliminationFormat === "all_winners") return allWinnersEpisodeCountForCast(cast);
    if (config.eliminationFormat === "tournament") {
      return Number(config.tournamentBracketCount || 2) * Number(config.tournamentBracketEpisodes || 3)
        + Number(config.tournamentMergeEpisodes || 2) + 1;
    }
    let total = Math.max(1, cast - finalists + 1);
    const premiere = config.premiereType || "regular";
    if (["slayers", "non_elim_top2", "late_entry"].includes(premiere)) total += 1;
    if (premiere === "split_s12") total += 2;
    if (premiere === "split_s14") total += 2;
    if (premiere === "rate_a_queen_s16") total += 2;
    if (premiere === "rate_a_queen_s17") total += 1;
    if (premiere === "porkchop") total += 3;
    if ((config.comebackFormat || "none") !== "none") total += 1;
    if (config.specialMidSeasonRateAQueen) total += 1;
    if (config.specialFameGames) total += 1;
    if (config.specialReunionLalaparuza) total += 1;
    if (config.finaleType === "lsftf") total += 1;
    return total;
  }

  function maxLookBasedChallengesForSeason(season) {
    const projected = projectedSeasonEpisodeCount(season);
    if (projected > 15) return ABSOLUTE_MAX_LOOK_BASED_CHALLENGES;
    if (projected >= 12) return 3;
    return 2;
  }

  function lookBasedChallengeCount(season) {
    const countedSplitPremieres = new Set();
    return seasonChallengeEpisodes(season).reduce((count, episode) => {
      const type = challengeTypeKey(episode.challenge.type);
      if (!LOOK_BASED_CHALLENGE_TYPES.has(type)) return count;
      if (episode.premiere && episode.splitGroup) {
        const splitKey = `split-premiere:${type}`;
        if (countedSplitPremieres.has(splitKey)) return count;
        countedSplitPremieres.add(splitKey);
      }
      return count + 1;
    }, 0);
  }

  function challengeTypeCount(season, targetType) {
    const key = challengeTypeKey(targetType);
    const countedSplitPremieres = new Set();
    return seasonChallengeEpisodes(season).reduce((count, episode) => {
      const type = challengeTypeKey(episode.challenge.type);
      if (type !== key) return count;
      if (episode.premiere && episode.splitGroup) {
        const splitKey = `split-premiere:${type}`;
        if (countedSplitPremieres.has(splitKey)) return count;
        countedSplitPremieres.add(splitKey);
      }
      return count + 1;
    }, 0);
  }

  function makeoverWindowActive(season, challenge = null, episode = null) {
    if (episode?.comeback?.format === "conjoined_twins") return true;
    const count = Number(season?.activeIds?.length || 0);
    if (count >= 3 && count <= 6) return true;
    if (count !== 8) return false;
    if (isTeamsFormat(season)) return true;
    if (!challenge) return true;
    return ["pairs", "groups"].includes(String(challenge.teamMode || "solo"));
  }

  function makeoverReservedForConjoinedTwins(season) {
    return String(season?.config?.comebackFormat || "none") === "conjoined_twins";
  }

  function hasChallengeTypeInSeason(season, type, predicate = null) {
    const key = challengeTypeKey(type);
    return seasonChallengeEpisodes(season).some((episode) => challengeTypeKey(episode.challenge.type) === key && (!predicate || predicate(episode)));
  }

  function hasNonPremiereRunway(season) {
    return hasChallengeTypeInSeason(season, "runway", (episode) => !episode.premiere);
  }

  function isFormatRequiredTalentShow(episode) {
    return challengeTypeKey(episode?.forcedChallengeType) === "talent_show" || !!episode?.fameGamesEpisode || !!episode?.midSeasonRateAQueen;
  }

  function isChallengeFamilySpaced(season, type) {
    const family = challengeFamily(type);
    const recentFamilies = (season.usedChallengeTypes || []).slice(-2).map(challengeFamily);
    return !recentFamilies.includes(family);
  }

  function getChallengeData() {
    const raw = window.MAXI_CHALLENGES || window.DRAG_RACE_CHALLENGES || window.DRAG_CHALLENGES || fallbackChallenges;
    return (Array.isArray(raw) && raw.length ? raw : fallbackChallenges).map((challenge, index) => {
      const format = normalizeChallengeFormat(challenge);
      return {
        id: String(challenge.id || `challenge_${index + 1}`),
        name: String(challenge.name || `Challenge ${index + 1}`),
        description: String(challenge.description || ""),
        type: String(challenge.type || "acting").toLowerCase(),
        repeatable: challenge.repeatable !== false,
        premiereEligible: !!challenge.premiereEligible,
        penultimateEligible: !!challenge.penultimateEligible,
        teamMode: challenge.teamMode || format.teamMode,
        teamCount: Number(challenge.teamCount || format.teamCount || 0),
        allowedGroupSizes: format.allowedGroupSizes,
        requiredSkills: challenge.requiredSkills || { acting: 0.25, comedy: 0.25, improv: 0.25, runway: 0.25 }
      };
    });
  }

  function getRunwayData() {
    const raw = window.RUNWAYS || window.DRAG_RACE_RUNWAYS || window.DRAG_RUNWAYS || fallbackRunways;
    return (Array.isArray(raw) && raw.length ? raw : fallbackRunways).map((runway, index) => ({
      id: String(runway.id || `runway_${index + 1}`),
      name: String(runway.name || runway.theme || `Runway ${index + 1}`)
    }));
  }

  function getLipSyncData() {
    const raw = window.LIPSYNC_SONGS || window.DRAG_RACE_LIPSYNCS || window.DRAG_LIPSYNCS || fallbackLipSyncs;
    return (Array.isArray(raw) && raw.length ? raw : fallbackLipSyncs).map((song, index) => {
      const rawGenres = [];
      if (Array.isArray(song.genres)) rawGenres.push(...song.genres);
      else if (song.genres) rawGenres.push(song.genres);
      if (Array.isArray(song.genre)) rawGenres.push(...song.genre);
      else if (song.genre) rawGenres.push(song.genre);
      if (!rawGenres.length && song.energy) rawGenres.push(song.energy);

      return {
        id: String(song.id || `song_${index + 1}`),
        title: String(song.title || song.song || song.name || `Lip Sync Song ${index + 1}`),
        artist: String(song.artist || "Unknown Artist"),
        energy: song.energy || rawGenres[0] || "performance",
        genres: rawGenres.map((genre) => String(genre || "").trim()).filter(Boolean),
        comments: song.comments || fallbackLipSyncs[0].comments
      };
    });
  }

  function getUntuckedEvents() {
    const raw = window.UNTUCKED_EVENTS || window.DRAG_RACE_UNTUCKED_EVENTS || window.DRAG_UNTUCKED_EVENTS || window.HOUSE_EVENTS || fallbackUntuckedEvents;
    const src = Array.isArray(raw) && raw.length ? raw : fallbackUntuckedEvents;
    return src.map((event, index) => ({
      ...event,
      id: String(event.id || `untucked_event_${index + 1}`),
      type: String(event.type || "storyline"),
      participants: clamp(Number(event.participants || 1), 1, 4),
      text: String(event.text || "{A} has a quiet moment in Untucked."),
      popularityByRole: event.popularityByRole && typeof event.popularityByRole === "object" ? event.popularityByRole : null,
      edgicByRole: event.edgicByRole && typeof event.edgicByRole === "object" ? event.edgicByRole : null,
      relationshipByPair: event.relationshipByPair && typeof event.relationshipByPair === "object" ? event.relationshipByPair : null
    }));
  }

  function getGuestJudges() {
    const raw = window.GUEST_JUDGES || window.DRAG_RACE_GUEST_JUDGES || window.DRAG_GUEST_JUDGES || fallbackGuestJudges;
    const src = Array.isArray(raw) && raw.length ? raw : fallbackGuestJudges;
    return src.map((judge, index) => ({
      id: String(judge.id || `judge_${index + 1}`),
      name: String(judge.name || `Guest Judge ${index + 1}`),
      image: judge.image || judge.img || judge.photo || "",
      types: judge.types || judge.tags || ["any"]
    }));
  }

  function getMiniChallengeData() {
    const raw = window.MINI_CHALLENGES || miniChallenges;
    return (Array.isArray(raw) && raw.length ? raw : miniChallenges).map((challenge, index) => {
      if (typeof challenge === "string") return { id: `mini_${index + 1}`, description: challenge, winners: 1 };
      return {
        id: String(challenge.id || `mini_${index + 1}`),
        description: String(challenge.description || challenge.name || `Mini Challenge ${index + 1}`),
        winners: Number.isFinite(Number(challenge.winners)) ? Number(challenge.winners) : 1
      };
    });
  }

  function getTalentShowData() {
    const raw = window.TALENT_SHOW_ACTS || [];
    return (Array.isArray(raw) && raw.length ? raw : []).map((act, index) => ({
      id: String(act.id || `talent_${index + 1}`),
      name: String(act.name || act.description || `Talent ${index + 1}`)
    }));
  }

  function getSnatchGameData() {
    const raw = window.SNATCH_GAME_CHARACTERS || [];
    return (Array.isArray(raw) && raw.length ? raw : []).map((character, index) => ({
      id: String(character.id || `snatch_${index + 1}`),
      name: String(character.name || `Character ${index + 1}`)
    }));
  }

  function pickCastSource() {
    return window.DRAG_RACE_QUEENS || window.QUEENS || window.DRAG_QUEENS || [];
  }

  function allShowsOf(item) {
    if (Array.isArray(item.shows) && item.shows.length) return item.shows.map(String);
    if (item.show) return Array.isArray(item.show) ? item.show.map(String) : [String(item.show)];
    return ["RuPaul's Drag Race"];
  }

  function allSeasonsOf(item, show) {
    const byShow = item.seasonsByShow || item.seasonByShow || {};
    if (byShow && byShow[show]) return byShow[show].map(String);
    if (Array.isArray(item.cycles)) return item.cycles.map(String);
    if (Array.isArray(item.season)) return item.season.map(String);
    if (item.season != null) return [String(item.season)];
    return [];
  }

  function normalizeGenderValue(raw) {
    const direct = normalizeString(raw.gender || raw.sex || raw.genderIdentity || raw.identity || "");
    const pronouns = normalizeString(raw.pronouns || "");
    const value = direct || pronouns;
    if (!value) return "";
    if (value.includes("non") || value.includes("nb") || value.includes("they")) return "non-binary";
    if (value.includes("female") || value.includes("woman") || value.includes("women") || value.includes("she")) return "female";
    if (value.includes("male") || value.includes("man") || value.includes("men") || value.includes("he")) return "male";
    return "";
  }

  function normalizeSkills(rawSkills = {}) {
    const skills = {};
    skillKeys.forEach(([key]) => { skills[key] = clamp(rawSkills[key] ?? 8, 1, 15); });
    return skills;
  }

  function toProfile(raw, index) {
    const shows = allShowsOf(raw);
    const primaryShow = shows[0] || "RuPaul's Drag Race";
    const seasonsByShow = {};
    shows.forEach((show) => { seasonsByShow[show] = allSeasonsOf(raw, show); });
    return {
      id: String(raw.id || `queen_${index + 1}`),
      name: raw.name || raw.fullName || raw.nickname || displayName(raw),
      fullName: raw.fullName || raw.name || raw.nickname || displayName(raw),
      nickname: raw.nickname || raw.name || raw.fullName || displayName(raw),
      image: resolveAssetPath(raw.image || raw.imageUrl || raw.img || raw.photo),
      exportImage: normalizeCustomImageUrl(raw.exportImage || raw.image || raw.imageUrl || raw.img || raw.photo || ""),
      shows,
      seasonsByShow,
      primaryShow,
      seasons: seasonsByShow[primaryShow] || [],
      gender: normalizeGenderValue(raw),
      age: Number.isFinite(Number(raw.age)) ? Number(raw.age) : null,
      yearsPerforming: Number.isFinite(Number(raw.yearsPerforming ?? raw.experienceYears)) ? Number(raw.yearsPerforming ?? raw.experienceYears) : null,
      followerLevel: clamp(Number(raw.followerLevel ?? raw.socialFollowing ?? raw.followersScore ?? 0), 0, 10),
      localReputation: clamp(Number(raw.localReputation ?? raw.localCelebrity ?? 0), 0, 10),
      isReturningQueen: !!(raw.isReturningQueen || raw.returningQueen || raw.returnee),
      previousReputation: String(raw.previousReputation || raw.previousEdit || ""),
      styleTags: Array.isArray(raw.styleTags || raw.styles) ? [...(raw.styleTags || raw.styles)].map(String) : [],
      dragFamilyIds: Array.isArray(raw.dragFamilyIds) ? raw.dragFamilyIds.map(String) : [],
      preSeasonRelationships: Array.isArray(raw.preSeasonRelationships) ? clone(raw.preSeasonRelationships) : [],
      isCustom: !!raw.isCustom,
      skills: normalizeSkills(raw.skills || raw.baseSkills || {})
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.config) state.config = { ...state.defaults, ...parsed.config };
      state.config.mode = "viewer";
      if (state.config.seasonName === "Drag Race Reimagined") state.config.seasonName = state.defaults.seasonName;
      if (parsed.season?.config) parsed.season.config.mode = "viewer";
      if (Array.isArray(parsed.selected)) state.selected = parsed.selected;
      if (parsed.season) state.season = parsed.season;
      if (Number.isInteger(parsed.currentEpisodeIndex)) state.currentEpisodeIndex = parsed.currentEpisodeIndex;
      if (parsed.currentStep) state.currentStep = parsed.currentStep;
    } catch (err) {
      console.warn("Failed to load simulator state", err);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        config: state.config,
        selected: state.selected,
        season: state.season,
        currentEpisodeIndex: state.currentEpisodeIndex,
        currentStep: state.currentStep
      }));
    } catch (err) {
      console.warn("Failed to save simulator state", err);
    }
  }

  function clearSavedState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function normalizeCustomImageUrl(value) {
    const src = String(value || "").trim();
    if (!src || /^javascript:/i.test(src)) return PLACEHOLDER;
    return src;
  }

  async function createExportSafeImage(src) {
    const value = normalizeCustomImageUrl(src);
    if (!value || value === PLACEHOLDER || value.startsWith("data:")) return value;
    try {
      const response = await fetch(value, { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error("Image request failed");
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      const maxSize = 420;
      const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const context = canvas.getContext("2d");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close?.();
      return canvas.toDataURL("image/webp", 0.86);
    } catch (error) {
      return value;
    }
  }

  function makeCustomContestant(raw = {}, index = 0) {
    const fullName = String(raw.fullName || raw.name || raw.nickname || `Custom Contestant ${index + 1}`).trim();
    const nickname = String(raw.nickname || fullName).trim();
    const image = normalizeCustomImageUrl(raw.image || raw.imageUrl || raw.photo || "");
    return {
      id: String(raw.id || `custom_${Date.now()}_${index}`),
      name: fullName,
      fullName,
      nickname,
      image,
      imageUrl: image,
      exportImage: normalizeCustomImageUrl(raw.exportImage || image),
      primaryShow: "Custom",
      shows: ["Custom"],
      seasons: ["Custom"],
      seasonsByShow: { "Custom": ["Custom"] },
      gender: "custom",
      age: Number.isFinite(Number(raw.age)) ? Number(raw.age) : null,
      yearsPerforming: Number.isFinite(Number(raw.yearsPerforming)) ? Number(raw.yearsPerforming) : null,
      followerLevel: clamp(Number(raw.followerLevel || 0), 0, 10),
      localReputation: clamp(Number(raw.localReputation || 0), 0, 10),
      isReturningQueen: !!raw.isReturningQueen,
      previousReputation: String(raw.previousReputation || ""),
      styleTags: Array.isArray(raw.styleTags) ? raw.styleTags.map(String) : [],
      dragFamilyIds: Array.isArray(raw.dragFamilyIds) ? raw.dragFamilyIds.map(String) : [],
      preSeasonRelationships: Array.isArray(raw.preSeasonRelationships) ? clone(raw.preSeasonRelationships) : [],
      isCustom: true,
      skills: normalizeSkills(raw.skills || {})
    };
  }

  function loadCustomContestants() {
    try {
      const raw = localStorage.getItem(CUSTOM_CONTESTANTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      state.customContestants = Array.isArray(parsed) ? parsed.map(makeCustomContestant) : [];
    } catch (err) {
      console.warn("Failed to load custom contestants", err);
      state.customContestants = [];
    }
  }

  function saveCustomContestants() {
    try {
      localStorage.setItem(CUSTOM_CONTESTANTS_KEY, JSON.stringify(state.customContestants.map(makeCustomContestant)));
    } catch (err) {
      console.warn("Failed to save custom contestants", err);
      alert("Could not save custom contestants in this browser.");
    }
  }

  function hydrateRoster() {
    const src = pickCastSource();
    const baseRoster = Array.isArray(src) ? src.map(toProfile) : [];
    const customRoster = (state.customContestants || []).map(makeCustomContestant).map(toProfile);
    state.roster = [...baseRoster, ...customRoster].sort((a, b) => fullDisplayName(a).localeCompare(fullDisplayName(b)));
    if (!state.roster.length) state.roster = createDemoQueens();
    reconcileSelectedWithRoster();
    buildFilters();
    applyGlobalFilters();
  }

  function createDemoQueens() {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `demo_queen_${i + 1}`,
      name: `Queen ${i + 1}`,
      nickname: `Queen ${i + 1}`,
      fullName: `Queen ${i + 1}`,
      image: PLACEHOLDER,
      shows: ["Demo Drag Race"],
      seasonsByShow: { "Demo Drag Race": [String(Math.floor(i / 10) + 1)] },
      primaryShow: "Demo Drag Race",
      seasons: [String(Math.floor(i / 10) + 1)],
      gender: "",
      skills: {
        acting: randInt(4, 13), comedy: randInt(4, 13), dance: randInt(4, 13), design: randInt(4, 13),
        improv: randInt(4, 13), runway: randInt(4, 13), lipsync: randInt(4, 13)
      }
    }));
  }

  function reconcileSelectedWithRoster() {
    const map = new Map(state.roster.map((item) => [item.id, item]));
    state.selected = (state.selected || []).map((saved) => {
      const live = map.get(saved?.id);
      if (!live) return saved;
      return {
        ...clone(live),
        skills: live.isCustom ? { ...live.skills } : { ...live.skills, ...(saved.skills || {}) }
      };
    }).filter(Boolean);
    if (state.season?.contestants) {
      Object.keys(state.season.contestants).forEach((id) => {
        const live = map.get(id);
        if (!live) return;
        state.season.contestants[id] = {
          ...state.season.contestants[id],
          ...clone(live),
          skills: { ...live.skills, ...(state.season.contestants[id].skills || {}) }
        };
      });
    }
  }

  function showSort(a, b) {
    if (a === "Custom") return -1;
    if (b === "Custom") return 1;
    if (a === "RuPaul's Drag Race") return -1;
    if (b === "RuPaul's Drag Race") return 1;
    return String(a).localeCompare(String(b));
  }

  function seasonSort(a, b) {
    return Number(a.season) - Number(b.season) || String(a.season).localeCompare(String(b.season)) || String(a.show).localeCompare(String(b.show));
  }

  function selectedCheckboxValues(container) {
    if (!container) return [];
    return $all('input[type="checkbox"]:checked', container).map((input) => input.value);
  }

  function buildChecklist(container, items, onChange) {
    if (!container) return;
    const placeholder = container.dataset.placeholder || "All";
    container.innerHTML = `
      <button class="secondary-btn dropdown-summary" type="button">${escapeHtml(placeholder)}</button>
      <div class="dropdown-options"></div>
    `;
    const summary = $(".dropdown-summary", container);
    const options = $(".dropdown-options", container);
    options.innerHTML = items.map((item) => `
      <label class="toggle-row compact-toggle">
        <input type="checkbox" value="${escapeHtml(item.value)}">
        <span>${escapeHtml(item.label)}</span>
      </label>
    `).join("");

    function syncChecklistOverlayState() {
      const anyOpen = $all(".dropdown-checklist.is-open").length > 0;
      document.body.classList.toggle("checklist-dropdown-open", anyOpen);
    }

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const wasOpen = container.classList.contains("is-open");
      $all(".dropdown-checklist.is-open").forEach((dropdown) => {
        if (dropdown !== container) dropdown.classList.remove("is-open");
      });
      container.classList.toggle("is-open", !wasOpen);
      syncChecklistOverlayState();
    });

    ["click", "pointerdown", "mousedown", "mouseup"].forEach((eventName) => {
      options.addEventListener(eventName, (event) => event.stopPropagation());
    });
    options.addEventListener("change", (event) => {
      event.stopPropagation();
      const checked = selectedCheckboxValues(container);
      summary.textContent = checked.length ? `${checked.length} selected` : placeholder;
      onChange?.();
      syncChecklistOverlayState();
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest(".dropdown-checklist")) return;
    const openDropdowns = $all(".dropdown-checklist.is-open");
    if (!openDropdowns.length) return;
    openDropdowns.forEach((dropdown) => dropdown.classList.remove("is-open"));
    document.body.classList.remove("checklist-dropdown-open");
  });

  function buildFilters() {
    const shows = [...new Set(state.roster.flatMap((item) => item.shows || []))].sort(showSort);
    buildChecklist(els.showFilter, shows.map((show) => ({ value: show, label: show })), () => {
      rebuildSeasonFilter();
      applyGlobalFilters();
    });
    rebuildSeasonFilter();
  }

  function rebuildSeasonFilter() {
    const selectedShows = selectedCheckboxValues(els.showFilter);
    if (!selectedShows.length) {
      buildChecklist(els.seasonFilter, [], applyGlobalFilters);
      els.seasonFilter?.classList.add("is-disabled");
      const summary = els.seasonFilter ? $(".dropdown-summary", els.seasonFilter) : null;
      if (summary) {
        summary.textContent = "Choose a show first";
        summary.disabled = true;
      }
      applyGlobalFilters();
      return;
    }
    els.seasonFilter?.classList.remove("is-disabled");
    const pairs = [];
    state.roster.forEach((item) => {
      (item.shows || []).forEach((show) => {
        if (!selectedShows.includes(show)) return;
        (item.seasonsByShow?.[show] || []).forEach((season) => pairs.push({ show, season: String(season) }));
      });
    });
    const unique = [...new Map(pairs.map((pair) => [`${pair.show}::${pair.season}`, pair])).values()].sort(seasonSort);
    buildChecklist(els.seasonFilter, unique.map((pair) => ({ value: `${pair.show}::${pair.season}`, label: `${pair.show} ${pair.season}` })), applyGlobalFilters);
    const summary = els.seasonFilter ? $(".dropdown-summary", els.seasonFilter) : null;
    if (summary) summary.disabled = false;
  }

  function readConfigFromInputs() {
    const selectedEliminationFormat = els.eliminationFormatSelect?.value || "regular";
    const selectedMode = "viewer";
    state.config = {
      ...state.config,
      seasonName: els.seasonName?.value?.trim() || state.defaults.seasonName,
      mode: selectedMode,
      eliminationFormat: selectedEliminationFormat,
      premiereType: els.premiereTypeSelect?.value || "regular",
      finaleType: els.finaleTypeSelect?.value || "regular_finale",
      comebackFormat: els.comebackFormatSelect?.value || "none",
      castSize: clamp(els.castSize?.value, 6, 24),
      finalistSize: clamp(els.finalistSize?.value, 2, 5),
      twistImmunity: !!els.twistImmunity?.checked,
      twistChocolateRandom: !!els.twistChocolateRandom?.checked,
      twistChocolateChoosable: !!els.twistChocolateChoosable?.checked,
      twistLuckyCow: !!els.twistLuckyCow?.checked,
      twistBadonkaDunkTank: !!els.twistBadonkaDunkTank?.checked,
      disableChallengeRiggory: !!els.disableChallengeRiggory?.checked,
      disableLipSyncRiggory: !!els.disableLipSyncRiggory?.checked,
      disableDoubleShantaysSashays: !!els.disableDoubleShantaysSashays?.checked,
      disableNonElimination: !!els.disableNonElimination?.checked,
      forceSlayersEpisode: !!els.forceSlayersEpisode?.checked,
      forceDoubleShantay: !!els.forceDoubleShantay?.checked,
      specialLalaparuzaSmackdown: !!els.specialLalaparuzaSmackdown?.checked,
      specialSlayOffs: !!els.specialSlayOffs?.checked,
      specialReunionLalaparuza: !!els.specialReunionLalaparuza?.checked,
      specialMidSeasonRateAQueen: !!els.specialMidSeasonRateAQueen?.checked,
      specialFameGames: !!els.specialFameGames?.checked,
      tournamentBracketCount: clamp(els.tournamentBracketCount?.value || state.config.tournamentBracketCount || 2, 2, 4),
      tournamentAdvancers: clamp(els.tournamentAdvancers?.value || state.config.tournamentAdvancers || 2, 2, 4),
      tournamentBracketEpisodes: clamp(els.tournamentBracketEpisodes?.value || state.config.tournamentBracketEpisodes || 3, 2, 5),
      tournamentMergeEpisodes: clamp(els.tournamentMergeEpisodes?.value || state.config.tournamentMergeEpisodes || 2, 2, 6),
      tournamentPreMergeWildcard: !!els.tournamentPreMergeWildcard?.checked,
      tournamentPreFinaleWildcard: !!els.tournamentPreFinaleWildcard?.checked
    };
    state.config.mode = "viewer";

    if (state.config.disableDoubleShantaysSashays && state.config.forceDoubleShantay) {
      state.config.forceDoubleShantay = false;
      if (els.forceDoubleShantay) els.forceDoubleShantay.checked = false;
    }
    if (state.config.disableNonElimination && state.config.forceSlayersEpisode) {
      state.config.forceSlayersEpisode = false;
      if (els.forceSlayersEpisode) els.forceSlayersEpisode.checked = false;
    }

    if (state.config.finaleType === "cunt_test") {
      state.config.finalistSize = 4;
      if (els.finalistSize) els.finalistSize.value = 4;
    }

    if (state.config.eliminationFormat === "teams") {
      state.config.mode = "viewer";
      state.config.premiereType = "regular";
      state.config.finaleType = "top2_finale";
      state.config.finalistSize = 3;
      state.config.twistImmunity = false;
      state.config.twistChocolateRandom = false;
      state.config.twistChocolateChoosable = false;
      state.config.twistLuckyCow = false;
      state.config.twistBadonkaDunkTank = false;
      state.config.specialLalaparuzaSmackdown = false;
      state.config.specialSlayOffs = false;
      state.config.specialReunionLalaparuza = false;
      state.config.specialMidSeasonRateAQueen = false;
      state.config.specialFameGames = false;
      state.config.comebackFormat = "none";
      if (state.config.castSize % 2 !== 0) state.config.castSize = Math.max(6, Math.min(24, state.config.castSize + 1));
      if (els.castSize) els.castSize.value = state.config.castSize;
      if (els.finalistSize) els.finalistSize.value = 3;
      if (els.premiereTypeSelect) els.premiereTypeSelect.value = "regular";
      if (els.finaleTypeSelect) els.finaleTypeSelect.value = "top2_finale";
      state.config.comebackFormat = "none";
      if (els.comebackFormatSelect) els.comebackFormatSelect.value = "none";
      if (els.twistImmunity) els.twistImmunity.checked = false;
      if (els.twistChocolateRandom) els.twistChocolateRandom.checked = false;
      if (els.twistChocolateChoosable) els.twistChocolateChoosable.checked = false;
      if (els.twistLuckyCow) els.twistLuckyCow.checked = false;
      if (els.twistBadonkaDunkTank) els.twistBadonkaDunkTank.checked = false;
      if (els.specialLalaparuzaSmackdown) els.specialLalaparuzaSmackdown.checked = false;
      if (els.specialSlayOffs) els.specialSlayOffs.checked = false;
      if (els.specialReunionLalaparuza) els.specialReunionLalaparuza.checked = false;
      if (els.specialMidSeasonRateAQueen) els.specialMidSeasonRateAQueen.checked = false;
      if (els.specialFameGames) els.specialFameGames.checked = false;
      if (els.comebackFormatSelect) els.comebackFormatSelect.value = "none";
    }

    if (state.config.eliminationFormat === "golden_beaver" && state.config.finalistSize < 4) {
      state.config.finalistSize = 4;
      if (els.finalistSize) els.finalistSize.value = 4;
    }

    if (state.config.eliminationFormat === "tournament") {
      state.config.premiereType = "regular";
      state.config.finaleType = "lsftc";
      state.config.twistImmunity = false;
      state.config.twistChocolateRandom = false;
      state.config.twistChocolateChoosable = false;
      state.config.twistLuckyCow = false;
      state.config.specialLalaparuzaSmackdown = false;
      state.config.specialSlayOffs = false;
      state.config.specialReunionLalaparuza = false;
      state.config.specialMidSeasonRateAQueen = false;
      state.config.specialFameGames = false;
      state.config.comebackFormat = "none";
      if (els.premiereTypeSelect) els.premiereTypeSelect.value = "regular";
      if (els.finaleTypeSelect) els.finaleTypeSelect.value = "lsftc";
      if (els.twistImmunity) els.twistImmunity.checked = false;
      if (els.twistChocolateRandom) els.twistChocolateRandom.checked = false;
      if (els.twistChocolateChoosable) els.twistChocolateChoosable.checked = false;
      if (els.twistLuckyCow) els.twistLuckyCow.checked = false;
      if (els.specialLalaparuzaSmackdown) els.specialLalaparuzaSmackdown.checked = false;
      if (els.specialSlayOffs) els.specialSlayOffs.checked = false;
      if (els.specialReunionLalaparuza) els.specialReunionLalaparuza.checked = false;
      if (els.specialMidSeasonRateAQueen) els.specialMidSeasonRateAQueen.checked = false;
      if (els.specialFameGames) els.specialFameGames.checked = false;
      if (els.comebackFormatSelect) els.comebackFormatSelect.value = "none";
    }

    if (state.config.twistChocolateRandom && state.config.twistChocolateChoosable) {
      state.config.twistChocolateRandom = false;
      if (els.twistChocolateRandom) els.twistChocolateRandom.checked = false;
    }

    if (state.config.eliminationFormat === "all_winners") {
      state.config.premiereType = "regular";
      state.config.finaleType = "lsftc";
      state.config.twistImmunity = false;
      state.config.twistChocolateRandom = false;
      state.config.twistChocolateChoosable = false;
      state.config.twistLuckyCow = false;
      state.config.specialLalaparuzaSmackdown = false;
      state.config.specialSlayOffs = false;
      state.config.specialReunionLalaparuza = false;
      state.config.specialMidSeasonRateAQueen = false;
      state.config.specialFameGames = false;
      state.config.comebackFormat = "none";
      if (els.premiereTypeSelect) els.premiereTypeSelect.value = "regular";
      if (els.finaleTypeSelect) els.finaleTypeSelect.value = "lsftc";
      if (els.twistImmunity) els.twistImmunity.checked = false;
      if (els.twistChocolateRandom) els.twistChocolateRandom.checked = false;
      if (els.twistChocolateChoosable) els.twistChocolateChoosable.checked = false;
      if (els.twistLuckyCow) els.twistLuckyCow.checked = false;
      if (els.specialLalaparuzaSmackdown) els.specialLalaparuzaSmackdown.checked = false;
      if (els.specialSlayOffs) els.specialSlayOffs.checked = false;
      if (els.specialReunionLalaparuza) els.specialReunionLalaparuza.checked = false;
      if (els.specialMidSeasonRateAQueen) els.specialMidSeasonRateAQueen.checked = false;
      if (els.specialFameGames) els.specialFameGames.checked = false;
      if (els.comebackFormatSelect) els.comebackFormatSelect.value = "none";
    }

    updateSetupUI();
    saveState();
  }

  function writeConfigToInputs() {
    const c = state.config;
    if (els.seasonName) els.seasonName.value = c.seasonName;
    c.mode = "viewer";
    if (els.modeSelect) els.modeSelect.value = "viewer";
    if (els.eliminationFormatSelect) els.eliminationFormatSelect.value = c.eliminationFormat || "regular";
    if (els.premiereTypeSelect) els.premiereTypeSelect.value = c.premiereType;
    if (els.finaleTypeSelect) els.finaleTypeSelect.value = c.finaleType;
    if (els.comebackFormatSelect) els.comebackFormatSelect.value = c.comebackFormat || "none";
    if (els.castSize) els.castSize.value = c.castSize;
    if (els.finalistSize) els.finalistSize.value = c.finalistSize;
    if (els.twistImmunity) els.twistImmunity.checked = !!c.twistImmunity;
    if (els.twistChocolateRandom) els.twistChocolateRandom.checked = !!c.twistChocolateRandom;
    if (els.twistChocolateChoosable) els.twistChocolateChoosable.checked = !!c.twistChocolateChoosable;
    if (els.twistLuckyCow) els.twistLuckyCow.checked = !!c.twistLuckyCow;
    if (els.twistBadonkaDunkTank) els.twistBadonkaDunkTank.checked = !!c.twistBadonkaDunkTank;
    if (els.disableChallengeRiggory) els.disableChallengeRiggory.checked = !!c.disableChallengeRiggory;
    if (els.disableLipSyncRiggory) els.disableLipSyncRiggory.checked = !!c.disableLipSyncRiggory;
    if (els.disableDoubleShantaysSashays) els.disableDoubleShantaysSashays.checked = !!c.disableDoubleShantaysSashays;
    if (els.disableNonElimination) els.disableNonElimination.checked = !!c.disableNonElimination;
    if (els.forceSlayersEpisode) els.forceSlayersEpisode.checked = !!c.forceSlayersEpisode;
    if (els.forceDoubleShantay) els.forceDoubleShantay.checked = !!c.forceDoubleShantay;
    if (els.specialLalaparuzaSmackdown) els.specialLalaparuzaSmackdown.checked = !!c.specialLalaparuzaSmackdown;
    if (els.specialSlayOffs) els.specialSlayOffs.checked = !!c.specialSlayOffs;
    if (els.specialReunionLalaparuza) els.specialReunionLalaparuza.checked = !!c.specialReunionLalaparuza;
    if (els.specialMidSeasonRateAQueen) els.specialMidSeasonRateAQueen.checked = !!c.specialMidSeasonRateAQueen;
    if (els.specialFameGames) els.specialFameGames.checked = !!c.specialFameGames;
    if (els.tournamentBracketCount) els.tournamentBracketCount.value = c.tournamentBracketCount || 2;
    if (els.tournamentAdvancers) els.tournamentAdvancers.value = c.tournamentAdvancers || 2;
    if (els.tournamentBracketEpisodes) els.tournamentBracketEpisodes.value = c.tournamentBracketEpisodes || 3;
    if (els.tournamentMergeEpisodes) els.tournamentMergeEpisodes.value = c.tournamentMergeEpisodes || 2;
    if (els.tournamentPreMergeWildcard) els.tournamentPreMergeWildcard.checked = !!c.tournamentPreMergeWildcard;
    if (els.tournamentPreFinaleWildcard) els.tournamentPreFinaleWildcard.checked = !!c.tournamentPreFinaleWildcard;
    updateSetupUI();
  }

  function updateSetupUI() {
    if (els.castSizeValue) els.castSizeValue.textContent = state.config.castSize;
    if (els.finalistSizeValue) els.finalistSizeValue.textContent = state.config.finalistSize;
    const allStarsFormat = (state.config.eliminationFormat || "regular") !== "regular";
    const allWinners = (state.config.eliminationFormat || "regular") === "all_winners";
    const tournament = (state.config.eliminationFormat || "regular") === "tournament";
    const teams = (state.config.eliminationFormat || "regular") === "teams";
    state.config.mode = "viewer";
    if (els.modeSelect) {
      els.modeSelect.disabled = true;
      els.modeSelect.value = "viewer";
    }
    if (els.modeHelp) els.modeHelp.textContent = modeDescriptions.viewer || "";
    if (state.config.finaleType === "cunt_test") {
      state.config.finalistSize = 4;
      if (els.finalistSize) els.finalistSize.value = 4;
      if (els.finalistSizeValue) els.finalistSizeValue.textContent = 4;
    }
    [els.premiereTypeSelect, els.finaleTypeSelect, els.comebackFormatSelect, els.twistImmunity, els.twistChocolateRandom, els.twistChocolateChoosable, els.twistLuckyCow, els.twistBadonkaDunkTank, els.specialLalaparuzaSmackdown, els.specialSlayOffs, els.specialReunionLalaparuza, els.specialMidSeasonRateAQueen, els.specialFameGames].forEach((el) => {
      if (el) el.disabled = allWinners || tournament || teams;
    });
    if (allWinners || tournament) {
      if (els.premiereTypeSelect) els.premiereTypeSelect.value = "regular";
      if (els.finaleTypeSelect) els.finaleTypeSelect.value = "lsftc";
      if (els.comebackFormatSelect) els.comebackFormatSelect.value = "none";
    }
    if (teams) {
      state.config.premiereType = "regular";
      state.config.finaleType = "top2_finale";
      state.config.finalistSize = 3;
      state.config.twistImmunity = false;
      state.config.twistChocolateRandom = false;
      state.config.twistChocolateChoosable = false;
      state.config.twistLuckyCow = false;
      state.config.twistBadonkaDunkTank = false;
      if (state.config.castSize % 2 !== 0) state.config.castSize = Math.max(6, Math.min(24, state.config.castSize + 1));
      if (els.castSize) els.castSize.value = state.config.castSize;
      if (els.finalistSize) els.finalistSize.value = 3;
      if (els.premiereTypeSelect) els.premiereTypeSelect.value = "regular";
      if (els.finaleTypeSelect) els.finaleTypeSelect.value = "top2_finale";
      if (els.twistImmunity) els.twistImmunity.checked = false;
      if (els.twistChocolateRandom) els.twistChocolateRandom.checked = false;
      if (els.twistChocolateChoosable) els.twistChocolateChoosable.checked = false;
      if (els.twistLuckyCow) els.twistLuckyCow.checked = false;
      if (els.twistBadonkaDunkTank) els.twistBadonkaDunkTank.checked = false;
    }
    if (state.config.eliminationFormat !== "regular") {
      state.config.twistLuckyCow = false;
      if (els.twistLuckyCow) els.twistLuckyCow.checked = false;
    }
    enforceExclusiveSetupControls();
    if (state.config.disableDoubleShantaysSashays && state.config.forceDoubleShantay) {
      state.config.forceDoubleShantay = false;
      if (els.forceDoubleShantay) els.forceDoubleShantay.checked = false;
    }
    if (state.config.disableNonElimination && state.config.forceSlayersEpisode) {
      state.config.forceSlayersEpisode = false;
      if (els.forceSlayersEpisode) els.forceSlayersEpisode.checked = false;
    }
    if (els.forceDoubleShantay) els.forceDoubleShantay.disabled = !!state.config.disableDoubleShantaysSashays;
    if (els.disableDoubleShantaysSashays) els.disableDoubleShantaysSashays.disabled = !!state.config.forceDoubleShantay;
    if (els.forceSlayersEpisode) els.forceSlayersEpisode.disabled = !!state.config.disableNonElimination;
    if (els.disableNonElimination) els.disableNonElimination.disabled = !!state.config.forceSlayersEpisode;

    if (els.tournamentSettingsCard) els.tournamentSettingsCard.hidden = !tournament;
    const perBracket = Math.floor(Number(state.config.castSize || 0) / Math.max(1, Number(state.config.tournamentBracketCount || 2)));
    const maxAdvancers = clamp(perBracket, 2, 4);
    if (state.config.tournamentAdvancers > maxAdvancers) {
      state.config.tournamentAdvancers = maxAdvancers;
      if (els.tournamentAdvancers) els.tournamentAdvancers.value = maxAdvancers;
    }
    if (els.tournamentAdvancers) els.tournamentAdvancers.max = String(maxAdvancers);
    if (els.tournamentBracketCountValue) els.tournamentBracketCountValue.textContent = state.config.tournamentBracketCount || 2;
    if (els.tournamentAdvancersValue) els.tournamentAdvancersValue.textContent = state.config.tournamentAdvancers || 2;
    if (els.tournamentBracketEpisodesValue) els.tournamentBracketEpisodesValue.textContent = state.config.tournamentBracketEpisodes || 3;
    if (els.tournamentMergeEpisodesValue) els.tournamentMergeEpisodesValue.textContent = state.config.tournamentMergeEpisodes || 2;
    if (els.eliminationFormatHelp) els.eliminationFormatHelp.textContent = eliminationFormatDescriptions[state.config.eliminationFormat || "regular"] || "";
    if (els.premiereHelp) els.premiereHelp.textContent = teams ? "Teams always uses a regular premiere." : tournament ? "Premiere twists are disabled for Tournament." : allWinners ? "Premiere twists are disabled for All Winners." : (premiereDescriptions[state.config.premiereType] || "");
    if (els.finaleHelp) els.finaleHelp.textContent = teams ? "Teams uses an individual Top 2 finale after pairs dissolve." : tournament ? "Tournament always ends with a Lip Sync for The Crown." : allWinners ? "All Winners uses its own QoSDADHH and Lip Sync for The Crown finale." : (finaleDescriptions[state.config.finaleType] || "");
    if (els.comebackHelp) els.comebackHelp.textContent = (allWinners || tournament || teams) ? "Comeback challenges are disabled for All Winners, Tournament, and Teams." : (comebackDescriptions[state.config.comebackFormat || "none"] || "");
    const specialAllowed = !allWinners && !tournament && !teams;
    const top8Allowed = Number(state.config.castSize || 0) >= 9 && specialAllowed;
    [els.specialLalaparuzaSmackdown, els.specialSlayOffs].forEach((el) => { if (el) el.disabled = !top8Allowed; });
    const midSeasonRAQAllowed = specialAllowed
      && Number(state.config.castSize || 0) >= 12
      && !["rate_a_queen_s16", "rate_a_queen_s17", "split_s14"].includes(state.config.premiereType || "regular");
    [els.specialReunionLalaparuza, els.specialFameGames].forEach((el) => { if (el) el.disabled = !specialAllowed; });
    if (els.specialMidSeasonRateAQueen) els.specialMidSeasonRateAQueen.disabled = !midSeasonRAQAllowed;
    if (!top8Allowed) {
      state.config.specialLalaparuzaSmackdown = false;
      state.config.specialSlayOffs = false;
      if (els.specialLalaparuzaSmackdown) els.specialLalaparuzaSmackdown.checked = false;
      if (els.specialSlayOffs) els.specialSlayOffs.checked = false;
    }
    if (!specialAllowed) {
      state.config.specialReunionLalaparuza = false;
      state.config.specialMidSeasonRateAQueen = false;
      state.config.specialFameGames = false;
      state.config.comebackFormat = "none";
      if (els.comebackFormatSelect) els.comebackFormatSelect.value = "none";
      if (els.specialReunionLalaparuza) els.specialReunionLalaparuza.checked = false;
      if (els.specialMidSeasonRateAQueen) els.specialMidSeasonRateAQueen.checked = false;
      if (els.specialFameGames) els.specialFameGames.checked = false;
    }
    if (!midSeasonRAQAllowed) {
      state.config.specialMidSeasonRateAQueen = false;
      if (els.specialMidSeasonRateAQueen) els.specialMidSeasonRateAQueen.checked = false;
    }
    if (state.config.specialLalaparuzaSmackdown && state.config.specialSlayOffs) {
      state.config.specialSlayOffs = false;
      if (els.specialSlayOffs) els.specialSlayOffs.checked = false;
    }
    if (els.slotCount) els.slotCount.textContent = state.config.castSize;
    if (els.selectedCount) els.selectedCount.textContent = state.selected.length;
  }

  function validateComebackConfig(config) {
    const format = config.comebackFormat || "none";
    if (!format || format === "none") return "";
    if (["all_winners", "tournament", "teams"].includes(config.eliminationFormat)) return "Comeback challenges are disabled for All Winners, Tournament, and Teams.";
    const cast = Number(config.castSize || 0);
    if (["conjoined_twins", "reinas_de_la_comedia"].includes(format)) {
      if (cast < 8 || cast % 2 !== 0) return "Conjoined Twins and Reinas de la Comedia require an even cast of at least 8 contestants.";
    }
    if (["attention_girl_groups"].includes(format) && cast < 10) return "Attention Girl Groups requires at least 10 contestants.";
    if (["kitty_girl_groups", "lalaparuza_comeback", "game_within_a_game"].includes(format) && cast < 8) return "This comeback format requires at least 8 contestants.";
    if (format === "revenge_of_the_queens") {
      if (cast < 9) return "Revenge of The Queens requires at least 9 contestants.";
      if (!["regular", "golden_beaver", "legacy"].includes(config.eliminationFormat)) return "Revenge of The Queens only works with Regular, Golden Beaver, or Lip Sync For Your Legacy.";
    }
    if (format === "lalaparuza_comeback" && (config.specialLalaparuzaSmackdown || config.specialSlayOffs || config.specialReunionLalaparuza)) return "LaLaPaRuZa Comeback cannot be combined with LaLaPaRuZa Smackdown, Slay-Offs, or Reunion LaLaPaRuZa.";
    return "";
  }

  function validateSetupConfig(config) {
    if (config.eliminationFormat === "teams") {
      if (Number(config.castSize || 0) % 2 !== 0) return "Teams format requires an even number of contestants.";
      return "";
    }
    if ((config.specialLalaparuzaSmackdown || config.specialSlayOffs) && Number(config.castSize || 0) < 9) return "Top 8 special challenges require at least 9 contestants.";
    if (config.specialMidSeasonRateAQueen && Number(config.castSize || 0) < 12) return "Mid-Season Rate-A-Queen requires at least 12 contestants.";
    if (config.specialMidSeasonRateAQueen && ["rate_a_queen_s16", "rate_a_queen_s17", "split_s14"].includes(config.premiereType || "regular")) return "Mid-Season Rate-A-Queen cannot be combined with Rate-A-Queen premieres or the S14 split premiere.";
    if (config.specialLalaparuzaSmackdown && config.specialSlayOffs) return "Choose either LaLaPaRuZa Smackdown or Slay-Offs, not both.";
    if (config.eliminationFormat === "all_winners") return "";
    if (config.eliminationFormat === "tournament") {
      const brackets = Number(config.tournamentBracketCount || 2);
      const cast = Number(config.castSize || 0);
      if (cast % brackets !== 0) return `Tournament cast size must be divisible by ${brackets} bracket${brackets === 1 ? "" : "s"}.`;
      const perBracket = cast / brackets;
      if (Number(config.tournamentAdvancers || 2) > perBracket) return "Tournament advancers cannot exceed the number of contestants in each bracket.";
      return "";
    }
    if (config.finaleType === "lsftc" && config.finalistSize !== 4) return "Lip Sync for The Crown only works with 4 finalists.";
    if (config.finaleType === "lsftf" && config.finalistSize !== 4) return "Lip Sync for The Finale only works with 4 finalists.";
    if (config.finaleType === "cunt_test" && config.finalistSize !== 4) return "The C.U.N.T.-test only works with 4 finalists.";
    if (config.eliminationFormat === "golden_beaver" && ![4, 5].includes(Number(config.finalistSize))) return "Golden Beaver only works with 4 or 5 finalists.";
    if (config.premiereType === "late_entry" && config.castSize < 7) return "Late Entry needs at least 7 contestants.";
    if (config.premiereType === "porkchop" && Number(config.castSize || 0) <= 9) return "Porkchop Premiere requires more than 9 contestants.";
    if (["split_s6", "split_s12", "split_s14", "rate_a_queen_s16", "rate_a_queen_s17"].includes(config.premiereType) && config.castSize < 8) return "Split premieres work best with at least 8 contestants.";
    const comebackValidation = validateComebackConfig(config);
    if (comebackValidation) return comebackValidation;
    return "";
  }

  function applyGlobalFilters() {
    const selectedShows = selectedCheckboxValues(els.showFilter);
    const selectedSeasons = selectedCheckboxValues(els.seasonFilter);
    const query = normalizeString(els.searchFilter?.value || "");
    const selectedIds = new Set(state.selected.map((q) => q.id));

    state.filteredRoster = state.roster.filter((item) => {
      if (selectedIds.has(item.id)) return false;
      if (selectedShows.length && !(item.shows || []).some((show) => selectedShows.includes(show))) return false;
      if (selectedSeasons.length) {
        const hasPair = (item.shows || []).some((show) => (item.seasonsByShow?.[show] || []).some((season) => selectedSeasons.includes(`${show}::${season}`)));
        if (!hasPair) return false;
      }
      if (query && !normalizeString(`${item.fullName} ${item.nickname} ${item.shows?.join(" ")}`).includes(query)) return false;
      return true;
    });

    renderRoster();
    renderSelected();
  }


  function rosterMatchingCurrentFilters({ includeSelected = false } = {}) {
    const selectedShows = selectedCheckboxValues(els.showFilter);
    const selectedSeasons = selectedCheckboxValues(els.seasonFilter);
    const query = normalizeString(els.searchFilter?.value || "");
    const selectedIds = new Set(state.selected.map((q) => q.id));
    return state.roster.filter((item) => {
      if (!includeSelected && selectedIds.has(item.id)) return false;
      if (selectedShows.length && !(item.shows || []).some((show) => selectedShows.includes(show))) return false;
      if (selectedSeasons.length) {
        const hasPair = (item.shows || []).some((show) => (item.seasonsByShow?.[show] || []).some((season) => selectedSeasons.includes(`${show}::${season}`)));
        if (!hasPair) return false;
      }
      if (query && !normalizeString(`${item.fullName} ${item.nickname} ${item.shows?.join(" ")}`).includes(query)) return false;
      return true;
    });
  }

  function renderRoster() {
    if (!els.rosterGrid) return;
    if (els.availableCount) els.availableCount.textContent = state.filteredRoster.length;
    els.rosterGrid.innerHTML = state.filteredRoster.map((item) => {
      if (item.isCustom) {
        return `
          <article class="roster-card roster-list-card custom-roster-card" data-id="${escapeHtml(item.id)}">
            <button class="custom-roster-main" type="button" data-id="${escapeHtml(item.id)}" title="Add ${escapeHtml(fullDisplayName(item))}">
              <strong class="roster-name">${escapeHtml(fullDisplayName(item))}</strong>
            </button>
            <button class="secondary-btn custom-edit-btn" type="button" data-id="${escapeHtml(item.id)}">Edit</button>
          </article>
        `;
      }
      return `
        <button class="roster-card roster-list-card" type="button" data-id="${escapeHtml(item.id)}">
          <strong class="roster-name">${escapeHtml(fullDisplayName(item))}</strong>
        </button>
      `;
    }).join("") || `<div class="empty-state">No contestants match these filters.</div>`;
    $all(".roster-card[data-id]:not(.custom-roster-card)", els.rosterGrid).forEach((card) => card.addEventListener("click", () => addContestant(card.dataset.id)));
    $all(".custom-roster-main", els.rosterGrid).forEach((btn) => btn.addEventListener("click", (event) => {
      event.stopPropagation();
      addContestant(btn.dataset.id);
    }));
    $all(".custom-edit-btn", els.rosterGrid).forEach((btn) => btn.addEventListener("click", (event) => {
      event.stopPropagation();
      openCustomContestantModal(btn.dataset.id);
    }));
  }

  function renderSelected() {
    if (els.selectedCount) els.selectedCount.textContent = state.selected.length;
    if (els.slotCount) els.slotCount.textContent = state.config.castSize;
    if (els.teamLegend) {
      const remaining = Math.max(0, state.config.castSize - state.selected.length);
      els.teamLegend.innerHTML = `<span class="meta-chip">${remaining ? `${remaining} slot${remaining === 1 ? "" : "s"} left` : "Cast full"}</span>`;
    }
    if (!els.selectedGrid) return;
    els.selectedGrid.innerHTML = state.selected.map((item) => `
      <article class="selected-card" data-id="${escapeHtml(item.id)}">
        <div class="roster-image-wrap"><img class="avatar sqr" src="${escapeHtml(item.image)}" alt="${escapeHtml(fullDisplayName(item))}"></div>
        <div class="roster-copy">
          <strong class="roster-name">${escapeHtml(fullDisplayName(item))}</strong>
          <span class="roster-meta">${escapeHtml(item.primaryShow || "Drag Race")}</span>
        </div>
        <div class="screen-action-row compact-actions selected-card-actions">
          ${item.isCustom ? `<button class="secondary-btn custom-selected-edit-btn" type="button" data-id="${escapeHtml(item.id)}">Edit</button>` : ""}
          <button class="secondary-btn danger-lite remove-btn" type="button" data-id="${escapeHtml(item.id)}">Remove</button>
        </div>
      </article>
    `).join("") || `<div class="empty-state">Select contestants from the roster.</div>`;
    $all(".custom-selected-edit-btn", els.selectedGrid).forEach((btn) => btn.addEventListener("click", (event) => {
      event.stopPropagation();
      openCustomContestantModal(btn.dataset.id);
    }));
    $all(".remove-btn", els.selectedGrid).forEach((btn) => btn.addEventListener("click", (event) => {
      event.stopPropagation();
      removeContestant(btn.dataset.id);
    }));
  }

  function addContestant(id) {
    readConfigFromInputs();
    if (state.selected.length >= state.config.castSize) return;
    const item = state.roster.find((q) => q.id === id);
    if (!item || state.selected.some((q) => q.id === id)) return;
    state.selected.push(clone(item));
    saveState();
    applyGlobalFilters();
  }

  function removeContestant(id) {
    state.selected = state.selected.filter((q) => q.id !== id);
    state.season = null;
    saveState();
    applyGlobalFilters();
  }

  function randomizeCast() {
    readConfigFromInputs();
    const pool = rosterMatchingCurrentFilters({ includeSelected: true });
    if (pool.length < state.config.castSize) {
      alert(`Only ${pool.length} contestants match the current filters. Adjust the show/season filters or lower the cast size.`);
      return;
    }
    state.selected = shuffle(pool).slice(0, state.config.castSize).map(clone);
    state.season = null;
    saveState();
    applyGlobalFilters();
  }

  function addRandomContestant() {
    readConfigFromInputs();
    if (state.selected.length >= state.config.castSize) return;
    const pool = rosterMatchingCurrentFilters({ includeSelected: false });
    if (!pool.length) return;
    addContestant(randomItem(pool).id);
  }

  function resetCast() {
    state.selected = [];
    state.season = null;
    saveState();
    applyGlobalFilters();
  }

  function openSkillModal(id) {
    const item = state.selected.find((q) => q.id === id) || state.roster.find((q) => q.id === id);
    if (!item || !els.skillModal) return;
    if (els.modalContestantName) els.modalContestantName.textContent = `${fullDisplayName(item)}'s Skills`;
    if (els.modalProfile) {
      els.modalProfile.innerHTML = `
        <img class="avatar sqr" src="${escapeHtml(item.image)}" alt="${escapeHtml(fullDisplayName(item))}">
        <div><strong>${escapeHtml(fullDisplayName(item))}</strong><br><span>${escapeHtml(item.primaryShow)} ${escapeHtml((item.seasons || []).join(", "))}</span></div>
      `;
    }
    if (els.skillsStack) {
      els.skillsStack.innerHTML = skillKeys.map(([key, label]) => `
        <label class="field compact">
          <span>${escapeHtml(label)} <strong class="range-pill">${escapeHtml(item.skills[key] || 0)}</strong></span>
          <input type="range" min="1" max="15" value="${escapeHtml(item.skills[key] || 0)}" disabled>
        </label>
      `).join("");
    }
    els.skillModal.showModal?.();
  }

  function renderCustomImagePreview(src) {
    if (!els.customImagePreview) return;
    const image = normalizeCustomImageUrl(src);
    els.customImagePreview.dataset.image = image;
    els.customImagePreview.innerHTML = `
      <img class="avatar sqr custom-preview-img" src="${escapeHtml(image)}" alt="Custom contestant photo preview" onerror="this.src='${PLACEHOLDER}'">
      <span>${image === PLACEHOLDER ? "No image URL set" : "Image preview"}</span>
    `;
  }

  function renderCustomSkillInputs(skills = {}) {
    if (!els.customSkillsStack) return;
    els.customSkillsStack.innerHTML = skillKeys.map(([key, label]) => {
      const value = clamp(skills[key] ?? 8, 1, 15);
      return `
        <label class="custom-skill-row">
          <span class="custom-skill-label">
            <span>${escapeHtml(label)}</span>
            <strong class="range-pill custom-skill-pill" data-custom-skill-pill="${escapeHtml(key)}">${value}</strong>
          </span>
          <input class="custom-skill-slider" type="range" min="1" max="15" value="${value}" data-custom-skill="${escapeHtml(key)}">
        </label>
      `;
    }).join("");
    $all("[data-custom-skill]", els.customSkillsStack).forEach((input) => {
      input.addEventListener("input", () => {
        const pill = $(`[data-custom-skill-pill="${input.dataset.customSkill}"]`, els.customSkillsStack);
        if (pill) pill.textContent = input.value;
      });
    });
  }

  function randomizeCustomSkillInputs() {
    if (!els.customSkillsStack) return;
    $all("[data-custom-skill]", els.customSkillsStack).forEach((input) => {
      input.value = String(randInt(1, 15));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  function openCustomContestantModal(id = "") {
    const existing = (state.customContestants || []).map(makeCustomContestant).find((item) => item.id === id);
    if (!els.customContestantModal) return;
    if (els.customContestantId) els.customContestantId.value = existing?.id || "";
    if (els.customFullName) els.customFullName.value = existing?.fullName || "";
    if (els.customNickname) els.customNickname.value = existing?.nickname || "";
    if (els.customImageUrl) els.customImageUrl.value = existing?.image || "";
    if (els.deleteCustomContestantBtn) els.deleteCustomContestantBtn.hidden = !existing;
    renderCustomImagePreview(existing?.image || "");
    renderCustomSkillInputs(existing?.skills || {});
    els.customContestantModal.showModal?.();
  }

  function closeCustomContestantModal() {
    els.customContestantModal?.close?.();
    els.customContestantForm?.reset?.();
    if (els.customContestantId) els.customContestantId.value = "";
    renderCustomImagePreview("");
  }

  async function saveCustomContestantFromForm() {
    const id = els.customContestantId?.value || `custom_${Date.now()}`;
    const fullName = String(els.customFullName?.value || "").trim();
    const nickname = String(els.customNickname?.value || "").trim() || fullName;
    const image = normalizeCustomImageUrl(els.customImageUrl?.value || "");
    if (!fullName) {
      alert("Please enter a contestant name.");
      return false;
    }
    const skills = {};
    $all("[data-custom-skill]", els.customSkillsStack).forEach((input) => {
      skills[input.dataset.customSkill] = clamp(Number(input.value), 1, 15);
    });
    const exportImage = await createExportSafeImage(image);
    const contestant = makeCustomContestant({ id, fullName, name: fullName, nickname, image, imageUrl: image, exportImage, skills, isCustom: true });
    const index = state.customContestants.findIndex((item) => item.id === id);
    if (index >= 0) state.customContestants[index] = contestant;
    else state.customContestants.push(contestant);
    saveCustomContestants();
    state.season = null;
    hydrateRoster();
    saveState();
    return true;
  }

  function deleteCustomContestant(id) {
    if (!id) return;
    const item = state.customContestants.find((contestant) => contestant.id === id);
    const name = item ? fullDisplayName(item) : "this custom contestant";
    if (!confirm(`Delete ${name}? This will also remove them from the selected cast.`)) return;
    state.customContestants = state.customContestants.filter((contestant) => contestant.id !== id);
    state.selected = state.selected.filter((contestant) => contestant.id !== id);
    state.season = null;
    saveCustomContestants();
    hydrateRoster();
    saveState();
    closeCustomContestantModal();
  }

  function populatePresetModal() {
    if (!els.presetShowSelect || !els.presetSeasonSelect) return;
    const shows = [...new Set(state.roster.flatMap((item) => item.shows || []))].sort(showSort);
    els.presetShowSelect.innerHTML = shows.map((show) => `<option value="${escapeHtml(show)}">${escapeHtml(show)}</option>`).join("");
    updatePresetSeasons();
  }

  function updatePresetSeasons() {
    if (!els.presetShowSelect || !els.presetSeasonSelect) return;
    const show = els.presetShowSelect.value;
    const seasons = [...new Set(state.roster.flatMap((item) => item.seasonsByShow?.[show] || []))]
      .sort((a, b) => Number(a) - Number(b) || String(a).localeCompare(String(b)));
    els.presetSeasonSelect.innerHTML = seasons.map((season) => `<option value="${escapeHtml(season)}">${escapeHtml(season)}</option>`).join("");
  }

  function loadPresetCast() {
    readConfigFromInputs();
    const show = els.presetShowSelect?.value;
    const season = els.presetSeasonSelect?.value;
    if (!show || !season) return;
    const cast = state.roster.filter((item) => (item.seasonsByShow?.[show] || []).map(String).includes(String(season)));
    state.selected = cast.slice(0, state.config.castSize).map(clone);
    state.season = null;
    saveState();
    applyGlobalFilters();
  }

  function showScreen(id) {
    $all(".screen").forEach((screen) => screen.classList.toggle("is-active", screen.id === id));
  }

  const EPISODE_STEPS = ["wildcard", "status", "comeback", "guest", "mini", "teams", "famegames", "maxi", "cuntpart1", "cuntpart2", "cuntpart3", "runway", "judging", "ratequeen", "placements", "luckycow", "goldenbeaver", "rumocracy", "lipsync", "qosdadhh", "lsftc", "winner", "results", "badonkadunktank", "s17lsfyl", "s17lsfylresults", "untucked", "pointceremony", "trackrecord"];

  function scrollToEpisodeSection(step) {
    const panel = $(`.episode-panel[data-panel="${step}"]`);
    if (!panel || panel.hidden) return;
    window.requestAnimationFrame(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    });
  }

  function setEpisodeStep(step, options = {}) {
    if (step === "__nextEpisode") {
      goToNextEpisode();
      return;
    }
    const panel = $(`.episode-panel[data-panel="${step}"]`);
    if (panel?.hidden) step = nextVisibleStep(step, 1) || nextVisibleStep(step, -1) || "status";
    state.currentStep = step;
    $all(".section-toggle").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.step === step));
    $all(".episode-panel").forEach((panelEl) => panelEl.classList.toggle("is-active", panelEl.dataset.panel === step));
    saveState();
    if (options.scroll !== false) scrollToEpisodeSection(step);
  }

  function contestantCard(id, extra = "", options = {}) {
    const season = state.season;
    const item = season?.contestants?.[id] || state.roster.find((q) => q.id === id) || {};
    const name = options.nick ? nickDisplayName(item) : fullDisplayName(item);
    return `
      <article class="mini-contestant-card ${escapeHtml(options.className || "")}">
        <img class="avatar sqr" src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(item))}">
        <strong>${escapeHtml(name)}</strong>
        ${extra ? `<span>${escapeHtml(extra)}</span>` : ""}
      </article>
    `;
  }

  function pill(label, ids = [], token = "safe") {
    return `
      <article class="placement-card token-${escapeHtml(token.toLowerCase())}">
        <strong>${escapeHtml(label)}</strong>
        <div class="contestant-strip small-strip">${ids.length ? ids.map((id) => contestantCard(id)).join("") : `<span class="empty-state">—</span>`}</div>
      </article>
    `;
  }

  function groupBlock(title, ids, season = state.season, options = {}) {
    const className = options.className || "";
    const subtitle = options.subtitle || "";
    return `
      <article class="challenge-card ${escapeHtml(className)}">
        ${title ? `<h4>${escapeHtml(title)}</h4>` : ""}
        <div class="contestant-strip small-strip">${(ids || []).map((id) => contestantCard(id, "", { nick: !!options.nick })).join("") || `<span class="empty-state">None</span>`}</div>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
      </article>
    `;
  }

  function textEvent(text, type = "storyline", ids = []) {
    return `<article class="event-card token-${escapeHtml(type)}">${ids.length ? `<div class="contestant-strip event-people">${ids.map((id) => contestantCard(id, "", { nick: true })).join("")}</div>` : ""}<p>${escapeHtml(text)}</p></article>`;
  }

  const DIRECT_COMEBACK_FORMATS = new Set(["random_return", "choose_return", "other_queens_choose", "reading_is_fundamental"]);
  const SPECIAL_COMEBACK_FORMATS = new Set(["conjoined_twins", "reinas_de_la_comedia", "attention_girl_groups", "kitty_girl_groups", "revenge_of_the_queens", "lalaparuza_comeback", "game_within_a_game"]);
  const PRE_MINI_COMEBACK_FORMATS = new Set(["random_return", "choose_return", "other_queens_choose", "kitty_girl_groups"]);
  const POST_MINI_COMEBACK_FORMATS = new Set(["conjoined_twins", "reinas_de_la_comedia", "attention_girl_groups"]);
  const NO_MINI_COMEBACK_FORMATS = new Set(["revenge_of_the_queens"]);
  const STANDALONE_COMEBACK_FORMATS = new Set(["lalaparuza_comeback", "game_within_a_game"]);

  function comebackPosition(format) {
    if (POST_MINI_COMEBACK_FORMATS.has(format)) return "postMini";
    if (STANDALONE_COMEBACK_FORMATS.has(format)) return "standalone";
    if (NO_MINI_COMEBACK_FORMATS.has(format)) return "preMaxi";
    return "preMini";
  }

  function episodeStepOrder(ep = currentEpisode()) {
    const base = ["wildcard", "status", "comeback", "guest", "mini", "teams", "famegames", "maxi", "cuntpart1", "cuntpart2", "cuntpart3", "runway", "judging", "ratequeen", "placements", "luckycow", "goldenbeaver", "rumocracy", "lipsync", "qosdadhh", "lsftc", "winner", "results", "badonkadunktank", "s17lsfyl", "s17lsfylresults", "untucked", "pointceremony", "trackrecord"];
    const format = ep?.comeback?.format || "none";
    const position = ep?.comeback?.position || comebackPosition(format);
    if (ep?.type === "cunt_test") return ["status", "maxi", "cuntpart1", "cuntpart2", "cuntpart3", "lipsync", "results", "trackrecord"];
    if (ep?.type === "porkchop_premiere") return ["status", "maxi", "trackrecord"];
    if (format === "lalaparuza_comeback" || format === "game_within_a_game") return ["wildcard", "status", "comeback", "lipsync", "trackrecord"];
    if (position === "postMini") return ["wildcard", "status", "guest", "mini", "comeback", "teams", "famegames", "maxi", "runway", "judging", "ratequeen", "placements", "luckycow", "goldenbeaver", "rumocracy", "lipsync", "qosdadhh", "lsftc", "winner", "results", "badonkadunktank", "s17lsfyl", "s17lsfylresults", "untucked", "pointceremony", "trackrecord"];
    if (position === "preMaxi") return ["wildcard", "status", "comeback", "teams", "famegames", "maxi", "runway", "judging", "ratequeen", "placements", "luckycow", "goldenbeaver", "rumocracy", "lipsync", "qosdadhh", "lsftc", "winner", "results", "badonkadunktank", "s17lsfyl", "s17lsfylresults", "untucked", "pointceremony", "trackrecord"];
    if (position === "standalone") return ["wildcard", "status", "comeback", "maxi", "placements", "lipsync", "results", "trackrecord"];
    return base;
  }

  function applyDynamicEpisodeStepOrder(ep = currentEpisode()) {
    const order = episodeStepOrder(ep);
    order.forEach((step, index) => {
      $all(`.section-toggle[data-step="${step}"]`).forEach((btn) => { btn.style.order = String(index); });
      $all(`.episode-panel[data-panel="${step}"]`).forEach((panel) => { panel.style.order = String(index); });
    });
  }

  function initializeComebackState(season) {
    const format = season?.config?.comebackFormat || "none";
    if (!format || format === "none" || isAllWinnersFormat(season) || isTournamentFormat(season) || isTeamsFormat(season)) {
      season.comeback = { format: "none", used: true, triggerActiveCount: 0 };
      season.comebackUsed = true;
      return;
    }
    const initial = season.castOrder.length;
    let triggerActiveCount = Math.max(Number(season.config.finalistSize || 4) + 1, 3);
    if (format === "random_return") triggerActiveCount = Number(season.config.finalistSize || 4) >= 5 ? 6 : 5;
    if (["conjoined_twins", "reinas_de_la_comedia", "kitty_girl_groups", "lalaparuza_comeback"].includes(format)) triggerActiveCount = Math.ceil(initial / 2);
    if (["attention_girl_groups", "revenge_of_the_queens"].includes(format)) triggerActiveCount = initial === 17 ? 8 : (initial % 2 === 0 ? initial / 2 : Math.floor(initial / 2) + 1);
    if (format === "game_within_a_game") triggerActiveCount = Number(season.config.finalistSize || 4) >= 5 ? 5 : 4;
    if (format === "other_queens_choose") triggerActiveCount = clamp(randInt(6, 10), Math.max(Number(season.config.finalistSize || 4) + 1, 4), Math.max(4, initial - 3));
    if (format === "reading_is_fundamental") {
      const minReadingElims = 3;
      const maxReadingElims = Math.min(8, initial - 3);
      if (maxReadingElims < minReadingElims) {
        season.comeback = { format: "none", used: true, triggerActiveCount: 0 };
        season.comebackUsed = true;
        return;
      }
      const targetElims = randInt(minReadingElims, maxReadingElims);
      triggerActiveCount = Math.max(1, initial - targetElims);
    }
    season.comeback = { format, used: false, triggerActiveCount };
    season.comebackUsed = false;
  }

  function comebackFormat(season = state.season) {
    return season?.comeback?.format || season?.config?.comebackFormat || "none";
  }

  function comebackEligibleEliminated(season) {
    return (season.eliminatedIds || []).filter((id) => season.contestants[id] && !season.activeIds.includes(id) && !season.contestants[id].isAssassin && !isIneligibleUnplannedExit(season, id));
  }

  function reviveContestant(season, id) {
    if (!id || !season.contestants[id]) return null;
    season.eliminatedIds = (season.eliminatedIds || []).filter((elimId) => elimId !== id);
    if (!season.activeIds.includes(id)) season.activeIds.push(id);
    return id;
  }

  function markComebackUsed(season) {
    if (season.comeback) season.comeback.used = true;
    season.comebackUsed = true;
  }

  function createChooseReturnPendingEpisode(season) {
    const eligible = comebackEligibleEliminated(season);
    if (!eligible.length) return null;
    const comeback = {
      format: "choose_return",
      position: "preMini",
      title: "Come Back",
      quote: "The judges and I think we let one of our contestants go home... too soon. So, I want to re-introduce to the race...",
      candidates: eligible.slice(),
      eligible: eligible.slice(),
      returnedId: null,
      visualMode: "choose_return",
      choiceConfirmed: false,
      pending: true,
      text: ""
    };
    const episode = createEpisodeShell(season, {
      type: "choose_return_pending",
      title: `Episode ${season.episodeCounter}`,
      label: `Episode ${season.episodeCounter}`,
      comeback,
      comebackParticipantIds: []
    });
    episode.comebackPending = true;
    episode.resultText = "";
    season.episodes.push(episode);
    season.simulationPausedForChooseReturn = true;
    season.pendingChooseReturnEpisodeNumber = season.episodeCounter;
    return episode;
  }

  async function continueSeasonAfterChooseReturnFromEpisode(episode, chosenId) {
    const season = state.season;
    if (!season || !episode || !chosenId) return;
    const eligible = (episode.comeback?.eligible || []).slice();
    if (eligible.length && !eligible.includes(chosenId)) return;
    const foundIndex = season.episodes.indexOf(episode);
    const index = foundIndex >= 0 ? foundIndex : Math.max(0, Number(state.currentEpisodeIndex || 0));
    if (foundIndex >= 0) season.episodes.splice(foundIndex, 1);
    season.simulationPausedForChooseReturn = false;
    season.pendingChooseReturnEpisodeNumber = null;
    const comebackOptions = directComebackOptions(season, { forcedReturnId: chosenId });
    simulateRegularEpisode(season, comebackOptions);
    await simulateSeasonFromCurrentState(season);
    state.currentEpisodeIndex = Math.min(index, Math.max(0, (season.episodes || []).length - 1));
    state.currentStep = "comeback";
    saveState();
    renderEpisodeSelect();
    renderEpisode();
  }

  function shouldRunDirectComeback(season) {
    const format = comebackFormat(season);
    if (!DIRECT_COMEBACK_FORMATS.has(format)) return false;
    if (season.comeback?.used || season.comebackUsed) return false;
    if (season.activeIds.length !== Number(season.comeback?.triggerActiveCount || 0)) return false;
    return comebackEligibleEliminated(season).length > 0;
  }

  function shouldRunSpecialComeback(season) {
    const format = comebackFormat(season);
    if (!SPECIAL_COMEBACK_FORMATS.has(format)) return false;
    if (season.comeback?.used || season.comebackUsed) return false;
    if (season.activeIds.length !== Number(season.comeback?.triggerActiveCount || 0)) return false;
    return comebackEligibleEliminated(season).length > 0;
  }

  function comebackChallenge(format) {
    const map = {
      reading_is_fundamental: { id: "comeback_reading_is_fundamental", name: "Reading Is Fundamental", type: "roast", teamMode: "solo", description: "The eliminated contestants open the library and read each other for one last chance to return.", requiredSkills: { comedy: 0.45, improv: 0.30, acting: 0.15, runway: 0.10 } },
      conjoined_twins: { id: "conjoined_comeback", name: "Conjoined Twins", type: "makeover", teamMode: "pairs", description: "Each remaining queen is paired with an eliminated queen and must transform them into a twisted drag twin.", requiredSkills: { design: 0.38, runway: 0.32, acting: 0.15, comedy: 0.15 } },
      reinas_de_la_comedia: { id: "espana_comeback", name: "Reinas de la Comedia", type: "roast", teamMode: "pairs", description: "Remaining and eliminated queens pair up for a comedy comeback showcase.", requiredSkills: { comedy: 0.45, improv: 0.26, acting: 0.18, runway: 0.11 } },
      attention_girl_groups: { id: "france2_comeback", name: "Attention Girl Groups", type: "girlgroups", teamMode: "groups", description: "The eliminated queens return to compete against the remaining queens for one lip sync shot back into the race.", requiredSkills: { dance: 0.30, lipsync: 0.25, comedy: 0.18, acting: 0.15, runway: 0.12 } },
      kitty_girl_groups: { id: "comeback_kitty_girl_groups", name: "Kitty Girl Groups", type: "girlgroups", teamMode: "groups", description: "The remaining queens and eliminated queens perform in rival girl groups, and the winning side controls the comeback.", requiredSkills: { dance: 0.30, lipsync: 0.25, comedy: 0.20, acting: 0.15, runway: 0.10 } },
      revenge_of_the_queens: { id: "maxi_comeback_revenge_of_the_queens", name: "Revenge of The Queens", type: "girlgroups", teamMode: "pairs", description: "The eliminated queens pair with the remaining queens for a revenge performance. The top two eliminated queens lip sync for the chance to return.", requiredSkills: { dance: 0.25, lipsync: 0.25, comedy: 0.20, acting: 0.15, runway: 0.15 } },
      lalaparuza_comeback: { id: "comeback_lalaparuza", name: "LaLaPaRuZa Comeback", type: "lalaparuza", teamMode: "solo", description: "Eliminated queens lip sync against the remaining queens. Win your battle and you return; lose and you stay out.", requiredSkills: { lipsync: 1 } },
      game_within_a_game: { id: "comeback_game_within_a_game", name: "Game Within a Game", type: "lalaparuza", teamMode: "solo", description: "The eliminated queens battle through a lip sync gauntlet for one final spot back in the race.", requiredSkills: { lipsync: 1 } }
    };
    return clone(map[format] || { id: `comeback_${format}`, name: titleize(format), type: "acting", teamMode: "solo", description: comebackDescriptions[format] || "A comeback challenge.", requiredSkills: { acting: 0.25, comedy: 0.25, dance: 0.20, runway: 0.15, lipsync: 0.15 } });
  }

  function contestantScoreForComeback(season, id, challenge, episode = null) {
    const base = scoreChallengePerformance(season.contestants[id], challenge, season.config);
    const track = trackRecordPower(season, id);
    const pop = Number(season.stats[id]?.popularity || 50);
    const episodeScore = episode ? scoreForEpisodeId(episode, id, "total") : 0;
    return base + track * 0.06 + pop * 0.025 + episodeScore * 0.12 + randInt(-5, 5);
  }

  function directComebackOptions(season, options = {}) {
    if (!shouldRunDirectComeback(season)) return {};
    const format = comebackFormat(season);
    const eliminated = comebackEligibleEliminated(season);
    const comeback = {
      format,
      position: format === "reading_is_fundamental" ? "miniEmbedded" : comebackPosition(format),
      title: "Come Back",
      quote: "The judges and I think we let one of our contestants go home... too soon. So, I want to re-introduce to the race...",
      candidates: eliminated.slice(),
      eligible: eliminated.slice(),
      returnedId: null,
      votes: [],
      scores: [],
      text: "",
      visualMode: format
    };
    let returnedId = null;
    if (format === "random_return") {
      returnedId = randomItem(eliminated);
      comeback.title = "Come Back";
      comeback.candidates = [returnedId].filter(Boolean);
      comeback.text = "";
      comeback.visualMode = "simple_return";
    } else if (format === "choose_return") {
      returnedId = options.forcedReturnId && eliminated.includes(options.forcedReturnId) ? options.forcedReturnId : eliminated.slice().sort((a, b) => trackRecordPower(season, b) - trackRecordPower(season, a) || Number(season.stats[b]?.popularity || 0) - Number(season.stats[a]?.popularity || 0))[0];
      comeback.title = "Come Back";
      comeback.text = "";
      comeback.visualMode = "choose_return";
      comeback.choiceConfirmed = true;
    } else if (format === "other_queens_choose") {
      const votes = season.activeIds.map((voterId) => {
        const ranked = eliminated.map((id) => ({
          id,
          score: (season.relationships[pairKey(voterId, id)] || 0) * 6 + trackRecordPower(season, id) * 0.20 + Number(season.stats[id]?.popularity || 0) * 0.08 + randInt(-5, 5)
        })).sort((a, b) => b.score - a.score);
        return { voterId, votedForId: ranked[0]?.id || randomItem(eliminated) };
      });
      returnedId = groupVoteWinner(votes) || randomItem(eliminated);
      comeback.votes = votes;
      comeback.title = "Come Back";
      comeback.text = "Remaining contestants, the power is in your hands. One of the eliminated queens will return based on your votes.";
      comeback.visualMode = "other_queens_choose";
    } else if (format === "reading_is_fundamental") {
      const challenge = comebackChallenge(format);
      const scores = eliminated.map((id) => ({ id, score: contestantScoreForComeback(season, id, challenge) })).sort((a, b) => b.score - a.score);
      returnedId = scores[0]?.id || randomItem(eliminated);
      comeback.challenge = challenge;
      comeback.scores = scores;
      comeback.title = "Reading Is Fundamental";
      comeback.preStatus = season.activeIds.slice();
      comeback.text = "The eliminated contestants are back! Today the library is officially open. And the winning eliminated contestant will re-enter the competition!";
      comeback.visualMode = "reading_is_fundamental";
    }
    if (format !== "reading_is_fundamental") reviveContestant(season, returnedId);
    comeback.returnedId = returnedId;
    const placements = {};
    if (format === "other_queens_choose" || format === "reading_is_fundamental") {
      eliminated.filter((id) => id !== returnedId).forEach((id) => { placements[id] = "OUT"; });
    }
    markComebackUsed(season);
    if (format === "reading_is_fundamental") {
      return {
        returnedIds: [],
        readingComeback: comeback,
        comebackParticipantIds: eliminated.slice(),
        comebackPlacements: placements
      };
    }
    return {
      returnedIds: [returnedId].filter(Boolean),
      comebackParticipantIds: format === "other_queens_choose" ? eliminated.slice() : [returnedId].filter(Boolean),
      comebackPlacements: placements,
      comeback
    };
  }

  function createSeasonState() {
    const contestants = Object.fromEntries(state.selected.filter(Boolean).map((queen) => [queen.id, clone(queen)]));
    const castOrder = state.selected.map((q) => q.id);
    const season = {
      config: { ...state.config },
      contestants,
      castOrder,
      activeIds: castOrder.slice(),
      eliminatedIds: [],
      returningIds: [],
      episodes: [],
      usedChallengeTypes: [],
      usedChallengeIds: [],
      usedRunwayIds: [],
      usedLipSyncIds: [],
      usedTalentActIds: [],
      usedSnatchCharacterIds: [],
      relationships: {},
      trackColumnLabels: [],
      extraTrackColumns: [],
      stats: createStats(castOrder),
      narrative: createNarrativeState(contestants, castOrder),
      doubleShantaysUsed: 0,
      doubleSashaysUsed: 0,
      lastDoubleShantayEpisode: -99,
      doubleChallengeWinsUsed: 0,
      lastDoubleChallengeWinEpisode: -99,
      teamJudgedEpisodes: 0,
      pairJudgedEpisodes: 0,
      nonElimTop2Used: false,
      everyoneBadUsed: false,
      legacyMassLipSyncUsed: false,
      legacyEveryoneSlayedUsed: false,
      legacyEveryoneFloppedUsed: false,
      legacyCatastropheUsed: false,
      unplannedExitUsed: false,
      unplannedExitIds: [],
      lalaparuzaTwistUsed: false,
      lalaparuzaQueued: null,
      specialLalaparuzaUsed: false,
      specialSlayOffsUsed: false,
      specialReunionLalaparuzaUsed: false,
      specialMidSeasonRateAQueenUsed: false,
      fameGamesEpisodeUsed: false,
      fameGames: null,
      forceSlayersUsed: false,
      forceDoubleShantayUsed: false,
      rateAQueenMergeDone: false,
      rateAQueenS17FirstBottomId: null,
      immunity: {},
      chocolate: null,
      luckyCow: { active: !!state.config.twistLuckyCow, used: false },
      badonkaDunkTank: null,
      lateEntryId: null,
      episodeCounter: 1,
      seasonComplete: false,
      winnerId: null,
      runnerUpIds: [],
      juryVotes: null,
      votingStats: [],
      allWinnersTotalEpisodes: 0,
      allWinnersCompetitiveEpisodes: 0,
      allWinnersMidseasonEpisode: 0,
      allWinnersTalentEpisode: 0,
      allWinnersBlockCutoffEpisode: 0,
      allWinnersStarCounts: {},
      allWinnersStarHistory: [],
      allWinnersBlockCounts: {},
      allWinnersPendingBlockedId: null,
      allWinnersPendingGiveaways: [],
      allWinnersFinalistIds: [],
      allWinnersQueenOfHersesId: null,
      tournamentBrackets: [],
      tournamentPoints: {},
      tournamentPointHistory: [],
      tournamentWildcardReturns: [],
      tournamentReturnedPendingIds: [],
      teamPairs: [],
      teamPairById: {},
      teamShemergencyUsedPairs: [],
      teamsFinalistOverride: 0,
      comeback: null,
      comebackUsed: false,
      premiereChallengeType: "",
      premiereChallengeIds: []
    };
    initializePreseasonReception(season);
    initializeComebackState(season);
    return season;
  }

  function createStats(ids) {
    return Object.fromEntries(ids.map((id) => [id, {
      wins: 0,
      highs: 0,
      safes: 0,
      lows: 0,
      bottoms: 0,
      lipSyncs: 0,
      lipSyncWins: 0,
      lipSyncLosses: 0,
      miniWins: 0,
      runwayWins: 0,
      favoritism: 0,
      unfavoritism: 0,
      ppe: 0,
      ppeEpisodes: 0,
      popularity: 50,
      startingPopularity: 50,
      buzz: 50,
      buzzHistory: [],
      fanVolatility: 1,
      popularityHistory: [],
      popularityReactions: [],
      edgic: [],
      overallEdgic: null,
      track: [],
      challengeScores: [],
      runwayScores: [],
      legendaryStars: 0,
      legendaryStarHistory: []
    }]));
  }


  function narrativeHashUnit(key) {
    return (stableStoryHash(String(key || "narrative")) % 10000) / 9999;
  }

  function narrativeRange(key, min, max) {
    return min + narrativeHashUnit(key) * (max - min);
  }

  function createNarrativeTraits(item, id) {
    const skills = skillKeys.map(([key]) => Number(item?.skills?.[key] || 8));
    const skillAverage = average(skills) / 15 * 100;
    const comedy = Number(item?.skills?.comedy || 8) / 15 * 100;
    const improv = Number(item?.skills?.improv || 8) / 15 * 100;
    const runway = Number(item?.skills?.runway || 8) / 15 * 100;
    const design = Number(item?.skills?.design || 8) / 15 * 100;
    const dance = Number(item?.skills?.dance || 8) / 15 * 100;
    const acting = Number(item?.skills?.acting || 8) / 15 * 100;
    const age = Number(item?.age || 0);
    return {
      confidence: clamp(skillAverage * 0.55 + narrativeRange(`${id}:confidence`, 20, 55), 8, 96),
      selfAwareness: clamp(narrativeRange(`${id}:awareness`, 22, 92), 0, 100),
      professionalism: clamp(skillAverage * 0.58 + narrativeRange(`${id}:professional`, 15, 45), 0, 100),
      emotionality: clamp(narrativeRange(`${id}:emotion`, 18, 92), 0, 100),
      vulnerability: clamp(narrativeRange(`${id}:vulnerability`, 12, 88), 0, 100),
      sociability: clamp(narrativeRange(`${id}:social`, 18, 94), 0, 100),
      competitiveness: clamp(skillAverage * 0.35 + narrativeRange(`${id}:competitive`, 28, 68), 0, 100),
      adaptability: clamp(skillAverage * 0.45 + narrativeRange(`${id}:adapt`, 15, 52), 0, 100),
      delusion: clamp(100 - narrativeRange(`${id}:awareness`, 22, 92) + narrativeRange(`${id}:delusion`, -12, 22), 0, 100),
      messiness: clamp(narrativeRange(`${id}:mess`, 8, 92), 0, 100),
      narration: clamp((comedy + improv) * 0.27 + narrativeRange(`${id}:narration`, 15, 55), 0, 100),
      humor: clamp((comedy + improv) * 0.43 + narrativeRange(`${id}:humor`, 2, 28), 0, 100),
      eccentricity: clamp(narrativeRange(`${id}:eccentric`, 5, 95) + Math.max(0, design - 65) * 0.18, 0, 100),
      authenticity: clamp(narrativeRange(`${id}:authentic`, 25, 94), 0, 100),
      resilience: clamp(skillAverage * 0.30 + narrativeRange(`${id}:resilience`, 28, 65), 0, 100),
      perfectionism: clamp((runway + design + dance + acting) * 0.12 + narrativeRange(`${id}:perfect`, 15, 62), 0, 100),
      loudness: clamp(narrativeRange(`${id}:loud`, 8, 94), 0, 100),
      shade: clamp((comedy + improv) * 0.20 + narrativeRange(`${id}:shade`, 10, 72), 0, 100),
      ageSignal: age ? clamp((age - 18) * 3.2, 0, 100) : narrativeRange(`${id}:age-signal`, 28, 72),
      prodigyPotential: age && age <= 23 ? clamp(78 + skillAverage * 0.22, 0, 100) : 0
    };
  }

  function createNarrativeState(contestants, ids) {
    return {
      contestants: Object.fromEntries((ids || []).map((id) => [id, {
        traits: createNarrativeTraits(contestants?.[id] || {}, id),
        state: {
          confidence: 50,
          stress: 18,
          momentum: 0,
          emotionalFatigue: 0,
          producerInterest: 35,
          audienceMomentum: 0,
          unfairUnderplacements: 0,
          unfairOverplacements: 0
        },
        arcEvidence: {},
        eventHistory: [],
        spvHistory: [],
        editHistory: [],
        activeArcs: []
      }])),
      pairArcs: {},
      episodeEvents: []
    };
  }


  function initializePreseasonReception(season) {
    if (!season?.castOrder?.length) return;
    const ranked = season.castOrder.map((id) => {
      const item = season.contestants?.[id] || {};
      const narrative = season.narrative?.contestants?.[id] || {};
      const traits = narrative.traits || {};
      const followerLevel = clamp(Number(item.followerLevel || item.followersLevel || 0), 0, 10);
      const localReputation = clamp(Number(item.localReputation || 0), 0, 10);
      const returnee = item.isReturningQueen || item.returningQueen || item.previousSeason ? 1 : 0;
      const promoAppeal = Number(traits.humor || 50) * 0.16
        + Number(traits.authenticity || 50) * 0.13
        + Number(traits.eccentricity || 50) * 0.10
        + Number(traits.sociability || 50) * 0.07;
      const raw = followerLevel * 5.5 + localReputation * 3.2 + returnee * 18 + promoAppeal + randInt(-24, 24);
      return { id, raw };
    }).sort((a, b) => b.raw - a.raw || String(a.id).localeCompare(String(b.id)));

    const count = ranked.length;
    ranked.forEach((entry, index) => {
      const quantile = (index + 0.5) / count;
      let start;
      if (quantile <= 0.10) start = randInt(80, 90);
      else if (quantile <= 0.35) start = randInt(62, 78);
      else if (quantile <= 0.70) start = randInt(42, 61);
      else if (quantile <= 0.92) start = randInt(25, 41);
      else start = randInt(12, 24);

      const stats = season.stats?.[entry.id];
      const narrative = season.narrative?.contestants?.[entry.id];
      const traits = narrative?.traits || {};
      if (!stats) return;
      const volatility = clamp(
        0.76
          + Number(traits.messiness || 50) * 0.0022
          + Number(traits.eccentricity || 50) * 0.0020
          + Number(traits.loudness || 50) * 0.0017
          + Number(traits.emotionality || 50) * 0.0015,
        0.72,
        1.55
      );
      const buzz = clamp(
        Math.round(start * 0.68
          + Number(traits.loudness || 50) * 0.16
          + Number(traits.eccentricity || 50) * 0.13
          + randInt(-10, 10)),
        5,
        96
      );
      stats.popularity = start;
      stats.startingPopularity = start;
      stats.buzz = buzz;
      stats.fanVolatility = Number(volatility.toFixed(2));
      stats.popularityHistory = [];
      stats.popularityReactions = [];
      stats.buzzHistory = [];
      if (narrative) {
        narrative.state.preseasonPopularity = start;
        narrative.state.preseasonBuzz = buzz;
        narrative.state.audienceMomentum = 0;
      }
    });
  }

  function ensureNarrativeState(season) {
    if (!season) return null;
    if (!season.narrative || typeof season.narrative !== "object") season.narrative = createNarrativeState(season.contestants || {}, season.castOrder || []);
    season.narrative.contestants = season.narrative.contestants || {};
    season.narrative.pairArcs = season.narrative.pairArcs || {};
    season.narrative.episodeEvents = season.narrative.episodeEvents || [];
    (season.castOrder || []).forEach((id) => {
      if (!season.narrative.contestants[id]) season.narrative.contestants[id] = createNarrativeState(season.contestants || {}, [id]).contestants[id];
      const entry = season.narrative.contestants[id];
      entry.traits = { ...createNarrativeTraits(season.contestants?.[id] || {}, id), ...(entry.traits || {}) };
      entry.state = {
        confidence: 50, stress: 18, momentum: 0, emotionalFatigue: 0, producerInterest: 35,
        audienceMomentum: 0, unfairUnderplacements: 0, unfairOverplacements: 0,
        ...(entry.state || {})
      };
      entry.arcEvidence = entry.arcEvidence || {};
      entry.eventHistory = entry.eventHistory || [];
      entry.spvHistory = entry.spvHistory || [];
      entry.editHistory = entry.editHistory || [];
      entry.activeArcs = entry.activeArcs || [];
      const stats = season.stats?.[id];
      if (stats) {
        stats.popularity = clamp(Number(stats.popularity ?? 50), 0, 100);
        stats.startingPopularity = clamp(Number(stats.startingPopularity ?? 50), 0, 100);
        stats.buzz = clamp(Number(stats.buzz ?? stats.popularity ?? 50), 0, 100);
        stats.buzzHistory = stats.buzzHistory || [];
        stats.fanVolatility = clamp(Number(stats.fanVolatility || 1), 0.72, 1.55);
        stats.popularityReactions = stats.popularityReactions || [];
        stats.edgic = stats.edgic || [];
      }
    });
    return season.narrative;
  }

  function narrativeContestant(season, id) {
    ensureNarrativeState(season);
    return season?.narrative?.contestants?.[id] || null;
  }

  function addArcEvidence(season, id, tag, amount = 1, source = "", episodeLabel = "") {
    const entry = narrativeContestant(season, id);
    if (!entry || !tag) return;
    entry.arcEvidence[tag] = Number(entry.arcEvidence[tag] || 0) + Number(amount || 0);
    if (source) entry.eventHistory.push({ label: episodeLabel, type: source, tag, amount: Number(amount || 0) });
  }

  function addPairArcEvidence(season, idA, idB, tag, amount = 1, episodeLabel = "") {
    if (!idA || !idB || idA === idB) return;
    ensureNarrativeState(season);
    const key = pairKey(idA, idB);
    const entry = season.narrative.pairArcs[key] || { ids: [idA, idB], evidence: {}, history: [] };
    entry.evidence[tag] = Number(entry.evidence[tag] || 0) + Number(amount || 0);
    entry.history.push({ label: episodeLabel, tag, amount: Number(amount || 0) });
    season.narrative.pairArcs[key] = entry;
  }

  function narrativeParticipants(episode) {
    return [...new Set([
      ...(episode?.activeStartIds || []),
      ...(episode?.returnedIds || []),
      ...(episode?.comebackParticipantIds || [])
    ])];
  }

  function performanceBandFor(episode, id, groupName = "maxiGroups") {
    const groups = episode?.[groupName] || {};
    return ["slayed", "great", "good", "bad", "flopped"].find((band) => (groups[band] || []).includes(id)) || "";
  }

  function placementValueForPopularity(token) {
    const value = String(token || "").toUpperCase();
    if (["WIN", "DWIN", "WIN_QUIT"].includes(value)) return 5;
    if (value === "TOP2") return 4.5;
    if (["HIGH", "HIGH_BLK", "TOP3", "TOP4"].includes(value)) return 4;
    if (["SAFE", "RUN", "BLK", "IMM", "IN", "RTRN"].includes(value) || /^LALA_R/.test(value)) return 3;
    if (value === "LOW") return 2;
    if (/^BTM/.test(value) || ["CHOC", "ELIM", "OUT", "PLOSS", "PCHOP", "QUIT", "DEPT", "DISQ"].includes(value)) return 1;
    return 3;
  }

  function objectivePlacementContext(episode, id) {
    const scores = (episode?.scores || []).filter((score) => score?.id);
    if (!scores.length) return { rank: 0, count: 0, tier: "", value: 3, officialValue: placementValueForPopularity(placementTokenFor(episode, id)), gap: 0 };
    const sorted = scores.slice().sort((a, b) => {
      const av = Number.isFinite(Number(a.legacyBottomScore)) ? Number(a.legacyBottomScore) : -Number(a.challengeScore || a.total || 0);
      const bv = Number.isFinite(Number(b.legacyBottomScore)) ? Number(b.legacyBottomScore) : -Number(b.challengeScore || b.total || 0);
      return av - bv;
    });
    const rank = sorted.findIndex((score) => score.id === id) + 1;
    const count = sorted.length;
    if (!rank) return { rank: 0, count, tier: "", value: 3, officialValue: placementValueForPopularity(placementTokenFor(episode, id)), gap: 0 };
    const topCut = count >= 11 ? 3 : count >= 6 ? 2 : 1;
    const bottomCut = count >= 8 ? 3 : 2;
    let value = 3;
    let tier = "SAFE";
    if (rank === 1) { value = 5; tier = "WIN"; }
    else if (rank <= topCut) { value = 4; tier = "HIGH"; }
    else if (rank > count - Math.max(1, bottomCut - 1)) { value = 1; tier = "BTM"; }
    else if (rank > count - bottomCut) { value = 2; tier = "LOW"; }
    const officialValue = placementValueForPopularity(placementTokenFor(episode, id));
    return { rank, count, tier, value, officialValue, gap: value - officialValue };
  }

  function weightedNarrativeChoice(entries) {
    const viable = (entries || []).filter((entry) => Number(entry.weight || 0) > 0);
    if (!viable.length) return null;
    const total = viable.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);
    let roll = Math.random() * total;
    for (const entry of viable) {
      roll -= Number(entry.weight || 0);
      if (roll <= 0) return entry;
    }
    return viable.at(-1) || null;
  }

  function hiddenNarrativeEvent(type, id, episode, season) {
    const entry = narrativeContestant(season, id);
    const traits = entry?.traits || {};
    const token = placementTokenFor(episode, id);
    const name = nickDisplayName(season.contestants[id]);
    const base = {
      type, ids: [id], primaryId: id, visible: false, label: episode.label,
      centrality: 8, insight: 0, dimensionality: 0, positive: 0, negative: 0,
      popularity: 0, arcTags: [], spv: [], renderedText: ""
    };
    const event = { ...base };
    if (type === "insightful_confessional") Object.assign(event, { centrality: 13, insight: 30, dimensionality: 14, positive: 3, popularity: 1, arcTags: ["commentary_queen"], renderedText: `${name} gives a perceptive confessional that clearly explains the episode's dynamics.` });
    if (type === "emotional_vulnerability") Object.assign(event, { centrality: 18, insight: 22, dimensionality: 25, positive: 18, negative: 4, popularity: 3, arcTags: ["heart_of_season", "imposter_syndrome"], renderedText: `${name} quietly opens up about the pressure they have been carrying.` });
    if (type === "rejects_critique") Object.assign(event, { centrality: 22, insight: -12, dimensionality: -9, negative: 26, popularity: -4, arcTags: ["delusional_queen", "validation_seeker"], renderedText: `${name} rejects the judges' criticism and insists the performance was misunderstood.` });
    if (type === "anxiety_spiral") Object.assign(event, { centrality: 17, insight: 13, dimensionality: 13, positive: 5, negative: 13, popularity: 1, arcTags: ["inner_saboteur", "imposter_syndrome"], renderedText: `${name} overthinks the challenge and privately doubts whether they belong in the competition.` });
    if (type === "frozen_overthinker") Object.assign(event, { centrality: 15, insight: 9, dimensionality: 8, negative: 15, popularity: -1, arcTags: ["frozen_overthinker", "inner_saboteur"], renderedText: `${name} changes direction at the last moment and loses confidence in a concept that had been working.` });
    if (type === "supportive_moment") Object.assign(event, { centrality: 11, insight: 8, dimensionality: 17, positive: 24, popularity: 3, arcTags: ["heart_of_season", "unlikely_duo"], renderedText: `${name} helps another contestant regroup without asking for attention in return.` });
    if (type === "commentary_confessional") Object.assign(event, { centrality: 18, insight: 13, dimensionality: 8, positive: 7, popularity: 3, arcTags: ["commentary_queen", "meme_queen"], renderedText: `${name} becomes the episode's funniest and most reliable confessional narrator.` });
    if (type === "stirs_pot") Object.assign(event, { centrality: 20, insight: 9, dimensionality: 5, negative: 14, popularity: traits.humor >= 68 ? 1 : -2, arcTags: ["instigator", "passive_aggressive"], renderedText: `${name} asks one perfectly timed messy question and lets the rest of the room unravel.` });
    if (type === "delusional_boast") Object.assign(event, { centrality: 19, insight: -10, dimensionality: -10, negative: 20, popularity: traits.humor >= 72 ? 1 : -3, arcTags: ["delusional_queen", "loud_mouth"], renderedText: `${name} confidently predicts a win despite the room seeing obvious problems.` });
    if (type === "professional_wall") Object.assign(event, { centrality: 10, insight: 12, dimensionality: 9, positive: 5, negative: 3, popularity: 0, arcTags: ["professional", "over_prepared_pageant"], renderedText: `${name} handles every task efficiently, but the edit emphasizes how guarded and rehearsed they seem.` });
    if (type === "viral_moment") Object.assign(event, { centrality: 24, insight: 5, dimensionality: 8, positive: 13, popularity: 6, arcTags: ["meme_queen", "catchphrase_machine", "untouchable_icon"], renderedText: `${name} delivers an absurd throwaway moment that instantly feels destined to become a meme.` });
    if (type === "cast_calls_threat") Object.assign(event, { centrality: 12, insight: 7, dimensionality: 5, positive: 12, negative: 4, popularity: 2, arcTags: ["silent_threat", "cutthroat_competitor"], renderedText: `Several contestants privately identify ${name} as a much bigger threat than the edit has admitted so far.`, spv: [{ targetId: id, tone: "positive", strength: 5, credibility: 0.92, subject: "threat" }] });
    if (type === "iconic_flop") Object.assign(event, { centrality: 21, insight: 3, dimensionality: 10, positive: 12, negative: 5, popularity: 5, arcTags: ["meme_queen", "out_of_depth"], renderedText: `${name}'s challenge failure is so strange or funny that viewers enjoy it rather than simply dismissing it.` });
    if (type === "iconic_fashion_disaster") Object.assign(event, { centrality: 19, insight: 2, dimensionality: 9, positive: 10, negative: 5, popularity: 4, arcTags: ["meme_queen"], renderedText: `${name}'s disastrous runway becomes an affectionate visual meme.` });
    if (type === "defeated_energy") Object.assign(event, { centrality: 18, insight: 12, dimensionality: 8, negative: 24, popularity: -5, arcTags: ["defeated", "out_of_depth"], renderedText: `${name} appears mentally checked out and stops fighting for the episode.` });
    if (type === "validation_spiral") Object.assign(event, { centrality: 16, insight: 13, dimensionality: 12, positive: 3, negative: 17, popularity: -2, arcTags: ["validation_seeker", "inner_saboteur"], renderedText: `${name} needs repeated reassurance after failing to receive explicit praise.` });
    if (type === "fashion_surprise") Object.assign(event, { centrality: 18, insight: 8, dimensionality: 12, positive: 19, popularity: 5, arcTags: ["fashion_can_joke"], renderedText: `${name}, expected to rely on looks, surprises the room with sharp comedy and timing.` });
    if (type === "social_media_pressure") Object.assign(event, { centrality: 14, insight: 13, dimensionality: 11, positive: 4, negative: 10, popularity: token === "WIN" || token === "HIGH" ? 3 : -2, arcTags: ["social_media_sensation", "imposter_syndrome"], renderedText: `${name}'s online reputation becomes part of the pressure surrounding their real-world performance.` });
    if (type === "local_celebrity_humbled") Object.assign(event, { centrality: 17, insight: 12, dimensionality: 12, positive: 3, negative: 15, popularity: -2, arcTags: ["local_celebrity", "growth_arc"], renderedText: `${name} realizes that hometown status does not automatically translate to control of this competition.` });
    if (type === "episode_narrator") Object.assign(event, { centrality: 25, insight: 30, dimensionality: 16, positive: traits.humor >= 65 ? 8 : 3, negative: 0, popularity: traits.humor >= 65 ? 3 : 1, arcTags: ["commentary_queen"], renderedText: `${name} becomes the episode's point-of-view narrator, connecting the challenge, judging, and cast reactions through clear confessionals.` });
    if (type === "challenge_journey") {
      const positivePlacement = ["WIN", "DWIN", "TOP2", "HIGH", "HIGH_BLK"].includes(token);
      const negativePlacement = token === "LOW" || token === "ELIM" || /^BTM/.test(token);
      Object.assign(event, {
        centrality: 24,
        insight: 20,
        dimensionality: 18,
        positive: positivePlacement ? 10 : negativePlacement ? 3 : 5,
        negative: negativePlacement ? 11 : 0,
        popularity: positivePlacement ? 2 : negativePlacement ? -1 : 0,
        arcTags: positivePlacement ? ["professional"] : negativePlacement ? ["inner_saboteur"] : [],
        renderedText: positivePlacement
          ? `${name}'s preparation and decision-making are followed through the full challenge, giving the success a clear narrative journey.`
          : negativePlacement
            ? `${name}'s challenge process receives sustained focus, showing exactly where confidence or execution began to unravel.`
            : `${name}'s challenge process receives enough focus to explain the choices behind an otherwise middle-of-the-pack result.`
      });
    }
    if (type === "conflict_point_of_view") Object.assign(event, { centrality: 25, insight: 23, dimensionality: 18, positive: traits.selfAwareness >= 60 ? 5 : 0, negative: 10, popularity: traits.humor >= 70 ? 2 : -2, arcTags: ["instigator"], renderedText: `${name} is given enough confessional context to explain their side of the episode's tension rather than appearing only as a reaction shot.` });
    if (type === "emotional_checkpoint") Object.assign(event, { centrality: 21, insight: 25, dimensionality: 25, positive: 11, negative: 8, popularity: 2, arcTags: ["imposter_syndrome", "validation_seeker"], renderedText: `${name} pauses to reflect on how the competition is changing their confidence, giving the episode a personal emotional thread.` });
    if (type === "reaction_character") Object.assign(event, { centrality: 24, insight: 8, dimensionality: 9, positive: traits.humor >= 68 ? 10 : 2, negative: traits.humor >= 68 ? 3 : 10, popularity: traits.humor >= 68 ? 4 : -2, arcTags: traits.humor >= 68 ? ["meme_queen", "loud_mouth"] : ["loud_mouth"], renderedText: `${name}'s outsized reactions become a recurring visual punchline, making them one of the episode's most noticeable characters.` });
    if (type === "quiet_observer") Object.assign(event, { centrality: 17, insight: 27, dimensionality: 14, positive: 4, negative: 0, popularity: 1, arcTags: ["silent_threat", "commentary_queen"], renderedText: `${name} receives a quiet but perceptive confessional that identifies the episode's real stakes without placing them at the center of the conflict.` });
    return event;
  }

  function applyNarrativeEventToMetrics(season, episode, event) {
    (event.ids || []).forEach((id) => {
      const metrics = episode.editMetrics?.[id];
      if (!metrics) return;
      metrics.centrality += Number(event.centrality || 0);
      metrics.insight += Number(event.insight || 0);
      metrics.dimensionality += Number(event.dimensionality || 0);
      metrics.positiveTone += Number(event.positive || 0);
      metrics.negativeTone += Number(event.negative || 0);
      metrics.visibilityDemand += Math.max(0, Number(event.centrality || 0) * 0.75 + Math.abs(Number(event.popularity || 0)) * 1.5);
      if (["emotional_vulnerability", "rejects_critique", "viral_moment", "defeated_energy"].includes(event.type)) metrics.extremeToneEligible = true;
      (event.arcTags || []).forEach((tag) => addArcEvidence(season, id, tag, 1, event.type, episode.label));
      const narrative = narrativeContestant(season, id);
      if (narrative) narrative.eventHistory.push({ label: episode.label, type: event.type, text: event.renderedText, popularity: Number(event.popularity || 0) });
    });
    (event.spv || []).forEach((spv) => {
      const targetId = spv.targetId;
      const metrics = episode.editMetrics?.[targetId];
      if (!metrics) return;
      const weight = Number(spv.strength || 1) * clamp(Number(spv.credibility ?? 1), 0.2, 1.2);
      if (spv.tone === "positive") metrics.positiveTone += weight * 3;
      if (spv.tone === "negative") metrics.negativeTone += weight * 3;
      metrics.centrality += weight * 1.2;
      episode.spv.push({ ...spv, label: episode.label });
      const narrative = narrativeContestant(season, targetId);
      if (narrative) narrative.spvHistory.push({ ...spv, label: episode.label });
    });
  }

  function generateHiddenNarrativeEvents(season, episode) {
    ensureNarrativeState(season);
    const ids = narrativeParticipants(episode).filter((id) => season.contestants?.[id] && season.stats?.[id]);
    episode.hiddenNarrativeEvents = [];
    episode.editMetrics = {};
    episode.spv = [];
    episode.placementFairness = {};

    ids.forEach((id) => {
      const token = placementTokenFor(episode, id);
      const traits = narrativeContestant(season, id)?.traits || {};
      const visibleEvents = (episode.untuckedEvents || []).filter((event) => (event.ids || []).includes(id));
      const lipSyncing = [episode.lipSync, ...(episode.extraLipSyncs || [])].filter(Boolean).some((lipSync) => (lipSync.ids || []).includes(id));
      const fairness = objectivePlacementContext(episode, id);
      episode.placementFairness[id] = fairness;
      let centrality = 6 + randInt(0, 10);
      if (["WIN", "DWIN", "TOP2"].includes(token)) centrality += 18;
      else if (["HIGH", "HIGH_BLK", "LOW"].includes(token)) centrality += 10;
      else if (/^BTM/.test(token) || ["ELIM", "CHOC", "QUIT", "DEPT", "DISQ"].includes(token)) centrality += 20;
      if (lipSyncing) centrality += 14;
      if ((episode.miniWinnerIds || []).includes(id)) centrality += 4;
      centrality += visibleEvents.length * 8;

      let insight = 3 + randInt(0, 10) + Number(traits.selfAwareness || 50) * 0.05 + Number(traits.narration || 50) * 0.05;
      let dimensionality = 4 + randInt(0, 10) + Number(traits.authenticity || 50) * 0.05 + Number(traits.vulnerability || 50) * 0.05;
      let positiveTone = 0;
      let negativeTone = 0;
      let extremeToneEligible = false;
      const maxiBand = performanceBandFor(episode, id, "maxiGroups");
      const runwayBand = performanceBandFor(episode, id, "runwayGroups");
      if (maxiBand === "slayed") positiveTone += 5;
      else if (maxiBand === "great") positiveTone += 2;
      else if (maxiBand === "bad") negativeTone += 2;
      else if (maxiBand === "flopped") negativeTone += 5;
      if (runwayBand === "slayed") positiveTone += 3;
      else if (runwayBand === "great") positiveTone += 1;
      else if (runwayBand === "flopped") negativeTone += 3;
      if (["WIN", "DWIN", "TOP2"].includes(token)) positiveTone += 2;
      if (/^BTM/.test(token) || token === "ELIM") negativeTone += 2;

      visibleEvents.forEach((event) => {
        const type = String(event.type || "").toLowerCase();
        const role = event.roleById?.[id];
        const hint = String(event.edgicByRole?.[role] || event.edgic || "").toUpperCase();
        if (["storyline", "bonding", "resolution", "flirt", "comedy"].includes(type)) {
          insight += type === "storyline" ? 20 : 8;
          dimensionality += type === "storyline" ? 17 : 10;
          positiveTone += type === "storyline" ? 15 : 10;
          if (type === "storyline" || type === "resolution") extremeToneEligible = true;
        }
        if (["drama", "fight", "shade", "rivalry", "argument", "meltdown"].includes(type)) {
          centrality += 17;
          negativeTone += type === "fight" || type === "meltdown" ? 22 : 15;
          if (/^CP/.test(hint)) { insight += 11; dimensionality += 10; }
          if (/^OTT/.test(hint)) dimensionality -= 9;
          if (["fight", "meltdown"].includes(type)) extremeToneEligible = true;
        }
        if (/P+$/.test(hint)) positiveTone += /PP$/.test(hint) ? 20 : 10;
        if (/N+$/.test(hint)) negativeTone += /NN$/.test(hint) ? 20 : 10;
        if (/M$/.test(hint)) { positiveTone += 8; negativeTone += 8; }
      });

      episode.editMetrics[id] = {
        centrality,
        insight,
        dimensionality,
        positiveTone,
        negativeTone,
        visibilityDemand: centrality + visibleEvents.length * 11 + (lipSyncing ? 15 : 0),
        judged: ["WIN", "DWIN", "TOP2", "HIGH", "HIGH_BLK", "LOW", "ELIM", "CHOC"].includes(token) || /^BTM/.test(token),
        lipSyncing,
        winner: ["WIN", "DWIN", "TOP2"].includes(token),
        eliminated: ["ELIM", "QUIT", "DEPT", "DISQ"].includes(token),
        extremeToneEligible,
        token,
        fairness
      };
    });

    const desiredEvents = Math.min(ids.length, ids.length >= 10 ? randInt(3, 5) : ids.length >= 6 ? randInt(2, 4) : randInt(1, 2));
    const used = new Set();
    for (let index = 0; index < desiredEvents; index += 1) {
      const candidates = [];
      ids.forEach((id) => {
        if (used.has(id)) return;
        const entry = narrativeContestant(season, id);
        const traits = entry?.traits || {};
        const stateNow = entry?.state || {};
        const token = placementTokenFor(episode, id);
        const negativePlacement = token === "LOW" || token === "ELIM" || /^BTM/.test(token);
        const positivePlacement = ["WIN", "DWIN", "TOP2", "HIGH", "HIGH_BLK"].includes(token);
        const maxiBand = performanceBandFor(episode, id, "maxiGroups");
        const runwayBand = performanceBandFor(episode, id, "runwayGroups");
        const challengeType = challengeTypeKey(episode.challenge?.type || "");
        const followerLevel = Number(season.contestants[id]?.followerLevel || 0);
        const localReputation = Number(season.contestants[id]?.localReputation || 0);
        const options = [
          ["insightful_confessional", traits.narration * 0.50 + traits.selfAwareness * 0.35],
          ["emotional_vulnerability", traits.vulnerability * 0.45 + traits.emotionality * 0.35 + Number(stateNow.stress || 0) * 0.30],
          ["supportive_moment", traits.sociability * 0.42 + traits.authenticity * 0.35],
          ["commentary_confessional", traits.humor * 0.50 + traits.narration * 0.42],
          ["stirs_pot", traits.messiness * 0.40 + traits.shade * 0.35 + traits.competitiveness * 0.18],
          ["professional_wall", traits.professionalism * 0.48 + (100 - traits.vulnerability) * 0.25],
          ["viral_moment", traits.humor * 0.35 + traits.eccentricity * 0.48],
          ["cast_calls_threat", positivePlacement ? traits.competitiveness * 0.55 + 35 : 0],
          ["rejects_critique", negativePlacement ? traits.delusion * 0.70 + traits.confidence * 0.20 : 0],
          ["anxiety_spiral", negativePlacement ? (100 - traits.confidence) * 0.50 + traits.emotionality * 0.30 + Number(stateNow.stress || 0) * 0.35 : 0],
          ["frozen_overthinker", negativePlacement ? traits.perfectionism * 0.58 + Number(stateNow.stress || 0) * 0.28 : 0],
          ["delusional_boast", !positivePlacement ? traits.delusion * 0.65 + traits.loudness * 0.22 : traits.delusion * 0.25],
          ["defeated_energy", negativePlacement && Number(stateNow.stress || 0) >= 55 ? Number(stateNow.stress || 0) + (100 - traits.resilience) * 0.5 : 0],
          ["validation_spiral", negativePlacement ? traits.emotionality * 0.36 + (100 - traits.selfAwareness) * 0.34 : 0],
          ["iconic_flop", maxiBand === "flopped" ? traits.humor * 0.45 + traits.eccentricity * 0.45 : 0],
          ["iconic_fashion_disaster", runwayBand === "flopped" ? traits.humor * 0.35 + traits.eccentricity * 0.52 : 0],
          ["fashion_surprise", positivePlacement && ["acting", "comedy", "improv", "snatch_game", "roast"].includes(challengeType) ? Number(season.contestants[id]?.skills?.runway || 0) * 5 + Number(season.contestants[id]?.skills?.design || 0) * 4 : 0],
          ["social_media_pressure", followerLevel >= 6 ? followerLevel * 11 : 0],
          ["local_celebrity_humbled", localReputation >= 6 && negativePlacement ? localReputation * 12 : 0]
        ].map(([type, weight]) => ({ type, id, weight: Math.max(0, Number(weight || 0) - 34) }));
        candidates.push(...options);
      });
      const picked = weightedNarrativeChoice(candidates);
      if (!picked) break;
      used.add(picked.id);
      const event = hiddenNarrativeEvent(picked.type, picked.id, episode, season);
      episode.hiddenNarrativeEvents.push(event);
      applyNarrativeEventToMetrics(season, episode, event);
    }

    const focusCount = ids.length >= 10 ? 3 : ids.length >= 6 ? 2 : 1;
    const focusRanked = ids.map((id) => {
      const metrics = episode.editMetrics[id] || {};
      const traits = narrativeContestant(season, id)?.traits || {};
      return {
        id,
        score: Number(metrics.visibilityDemand || 0)
          + Number(traits.narration || 0) * 0.20
          + Number(traits.emotionality || 0) * 0.07
          + randInt(-4, 4)
      };
    }).sort((a, b) => b.score - a.score).map((entry) => entry.id);
    const focusIds = focusRanked.slice(0, focusCount);
    const narratorCandidate = ids
      .filter((id) => !episode.editMetrics[id]?.judged)
      .map((id) => {
        const traits = narrativeContestant(season, id)?.traits || {};
        return { id, score: Number(traits.narration || 0) + Number(traits.humor || 0) * 0.45 + Number(traits.selfAwareness || 0) * 0.25 };
      })
      .sort((a, b) => b.score - a.score)[0];
    if (ids.length >= 8 && narratorCandidate?.score >= 105 && !focusIds.includes(narratorCandidate.id)) {
      focusIds[focusIds.length - 1] = narratorCandidate.id;
    }

    [...new Set(focusIds)].forEach((id) => {
      const metrics = episode.editMetrics[id] || {};
      const traits = narrativeContestant(season, id)?.traits || {};
      const token = placementTokenFor(episode, id);
      const visibleTypes = (episode.untuckedEvents || [])
        .filter((event) => (event.ids || []).includes(id))
        .map((event) => String(event.type || "").toLowerCase());
      const hasDrama = visibleTypes.some((type) => ["drama", "fight", "shade", "rivalry", "argument", "meltdown"].includes(type));
      const stateNow = narrativeContestant(season, id)?.state || {};
      let type = "quiet_observer";
      if (hasDrama) type = "conflict_point_of_view";
      else if (metrics.judged) type = "challenge_journey";
      else if (Number(stateNow.stress || 0) >= 52 || Number(traits.vulnerability || 0) >= 72) type = "emotional_checkpoint";
      else if (Number(traits.narration || 0) + Number(traits.selfAwareness || 0) >= 112) type = "episode_narrator";
      else if (Number(traits.loudness || 0) >= 70 || Number(traits.eccentricity || 0) >= 76) type = "reaction_character";
      const event = hiddenNarrativeEvent(type, id, episode, season);
      event.focusEvent = true;
      episode.hiddenNarrativeEvents.push(event);
      applyNarrativeEventToMetrics(season, episode, event);
      if (["WIN", "DWIN", "TOP2", "HIGH", "HIGH_BLK"].includes(token) && type === "challenge_journey") {
        addArcEvidence(season, id, "professional", 0.5, type, episode.label);
      }
    });

    const pairCandidates = [];
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const idA = ids[i];
        const idB = ids[j];
        const relationship = Number(season.relationships?.[pairKey(idA, idB)] || 0);
        const skillsA = season.contestants[idA]?.skills || {};
        const skillsB = season.contestants[idB]?.skills || {};
        const aestheticSimilarity = 100 - Math.min(100, Math.abs(Number(skillsA.runway || 0) - Number(skillsB.runway || 0)) * 9 + Math.abs(Number(skillsA.design || 0) - Number(skillsB.design || 0)) * 9);
        if (relationship >= 4) pairCandidates.push({ idA, idB, type: "unlikely_duo", weight: relationship * 5 + 10 });
        if (relationship <= -3) pairCandidates.push({ idA, idB, type: "bitter_rivals", weight: Math.abs(relationship) * 6 + 8 });
        if (aestheticSimilarity >= 82) pairCandidates.push({ idA, idB, type: "look_alike_rivals", weight: aestheticSimilarity * 0.20 });
        if (relationship >= 2 && relationship <= 6) pairCandidates.push({ idA, idB, type: "showmance", weight: 4 + relationship * 2 });
      }
    }
    if (pairCandidates.length && Math.random() < 0.32) {
      const pairEvent = weightedNarrativeChoice(pairCandidates);
      if (pairEvent) {
        const { idA, idB, type } = pairEvent;
        let tag = type;
        let positive = type === "unlikely_duo" || type === "showmance";
        let text = positive
          ? `${nickDisplayName(season.contestants[idA])} and ${nickDisplayName(season.contestants[idB])} share a quiet connection that the edit begins returning to.`
          : `${nickDisplayName(season.contestants[idA])} and ${nickDisplayName(season.contestants[idB])} are repeatedly compared, sharpening an existing tension.`;
        const event = {
          type, ids: [idA, idB], visible: false, label: episode.label, renderedText: text,
          centrality: 8, insight: 5, dimensionality: 8,
          positive: positive ? 11 : 0, negative: positive ? 0 : 12,
          popularity: positive ? 1 : 0, arcTags: [tag], spv: []
        };
        episode.hiddenNarrativeEvents.push(event);
        applyNarrativeEventToMetrics(season, episode, event);
        addPairArcEvidence(season, idA, idB, tag, 1, episode.label);
        addArcEvidence(season, idA, tag, 1, type, episode.label);
        addArcEvidence(season, idB, tag, 1, type, episode.label);
      }
    }

    assignEpisodeNarrativeRoles(season, episode, ids);
    generateEpisodeAudienceShocks(season, episode, ids);

    ids.forEach((id) => {
      const metrics = episode.editMetrics[id];
      metrics.centrality = clamp(metrics.centrality, 0, 100);
      metrics.insight = clamp(metrics.insight, 0, 100);
      metrics.dimensionality = clamp(metrics.dimensionality, 0, 100);
      metrics.positiveTone = clamp(metrics.positiveTone, 0, 100);
      metrics.negativeTone = clamp(metrics.negativeTone, 0, 100);
      metrics.visibilityDemand = clamp(metrics.visibilityDemand + metrics.insight * 0.22 + metrics.dimensionality * 0.18, 0, 140);

      const entry = narrativeContestant(season, id);
      const token = placementTokenFor(episode, id);
      if (entry) {
        const positivePlacement = ["WIN", "DWIN", "TOP2", "HIGH", "HIGH_BLK"].includes(token);
        const negativePlacement = token === "LOW" || token === "ELIM" || /^BTM/.test(token);
        entry.state.confidence = clamp(Number(entry.state.confidence || 50) + (positivePlacement ? 7 : negativePlacement ? -7 : 0), 0, 100);
        entry.state.stress = clamp(Number(entry.state.stress || 18) + (negativePlacement ? 10 : positivePlacement ? -5 : 1), 0, 100);
        entry.state.momentum = clamp(Number(entry.state.momentum || 0) + (positivePlacement ? 1 : negativePlacement ? -1 : 0), -6, 6);
        entry.editHistory.push({ label: episode.label, ...metrics });
      }
    });
    season.narrative.episodeEvents.push({ label: episode.label, events: clone(episode.hiddenNarrativeEvents) });
  }


  function episodeRoleEntry(episode, id) {
    return episode?.narrativeRoles?.[id] || { focusRole: "supporting", storyRole: "supporting", reason: "supporting ensemble" };
  }

  function narrativeRoleEvent(season, episode, id, storyRole) {
    const contestant = season.contestants?.[id];
    const name = nickDisplayName(contestant);
    const traits = narrativeContestant(season, id)?.traits || {};
    const definitions = {
      hero: {
        type: "hero_edit",
        centrality: 17,
        insight: 16,
        dimensionality: 20,
        positive: 32,
        negative: 2,
        popularity: 5,
        arcTags: ["heart_of_season", "relatable_underdog"],
        renderedText: `${name} is framed as the emotional or competitive hero of the episode, with other contestants validating their effort and sincerity.`
      },
      villain: {
        type: "villain_edit",
        centrality: 21,
        insight: Number(traits.selfAwareness || 0) >= 62 ? 18 : 4,
        dimensionality: Number(traits.selfAwareness || 0) >= 62 ? 16 : 5,
        positive: 2,
        negative: 36,
        popularity: Number(traits.humor || 0) + Number(traits.selfAwareness || 0) >= 132 ? 1 : -6,
        arcTags: ["villain_by_editing", "instigator"],
        renderedText: `${name}'s sharpest comments and least flattering reactions are used to frame them as the episode's antagonist.`
      },
      drama_starter: {
        type: "drama_starter_edit",
        centrality: 20,
        insight: Number(traits.selfAwareness || 0) >= 58 ? 17 : 7,
        dimensionality: Number(traits.selfAwareness || 0) >= 58 ? 15 : 8,
        positive: Number(traits.humor || 0) >= 70 ? 10 : 2,
        negative: 30,
        popularity: Number(traits.humor || 0) >= 70 ? 2 : -4,
        arcTags: ["instigator", "passive_aggressive"],
        renderedText: `${name} repeatedly redirects the room toward its messiest unresolved tension, becoming the episode's main drama-starter.`
      },
      emotional: {
        type: "emotional_edit",
        centrality: 17,
        insight: 24,
        dimensionality: 27,
        positive: 24,
        negative: 21,
        popularity: 4,
        arcTags: ["heart_of_season", "inner_saboteur"],
        renderedText: `${name}'s emotional high and low become a complete personal story, showing both vulnerability and resilience.`
      },
      narrator: {
        type: "narrator_edit",
        centrality: 18,
        insight: 30,
        dimensionality: 17,
        positive: Number(traits.humor || 0) >= 68 ? 12 : 4,
        negative: 1,
        popularity: Number(traits.humor || 0) >= 68 ? 5 : 2,
        arcTags: ["commentary_queen"],
        renderedText: `${name}'s confessionals become the episode's connective tissue, explaining both the competition and the cast dynamics.`
      },
      wildcard: {
        type: "wildcard_edit",
        centrality: 22,
        insight: 5,
        dimensionality: 8,
        positive: Number(traits.humor || 0) >= 65 ? 20 : 5,
        negative: Number(traits.delusion || 0) >= 62 ? 20 : 6,
        popularity: Number(traits.humor || 0) >= 65 ? 4 : -2,
        arcTags: ["meme_queen", "loud_mouth"],
        renderedText: `${name} becomes the episode's unpredictable wildcard, with outsized reactions and a memorable one-note television moment.`
      },
      underdog: {
        type: "underdog_edit",
        centrality: 17,
        insight: 22,
        dimensionality: 23,
        positive: 26,
        negative: 10,
        popularity: 6,
        arcTags: ["relatable_underdog", "growth_arc"],
        renderedText: `${name}'s doubts and disadvantages are foregrounded, encouraging the audience to root for them through the episode.`
      },
      professional: {
        type: "professional_edit",
        centrality: 12,
        insight: 14,
        dimensionality: 12,
        positive: 13,
        negative: 2,
        popularity: 1,
        arcTags: ["professional"],
        renderedText: `${name} is shown calmly solving problems and delivering polished work while remaining emotionally guarded.`
      }
    };
    const definition = definitions[storyRole];
    if (!definition) return null;
    return {
      ...definition,
      ids: [id],
      visible: false,
      label: episode.label,
      focusEvent: true,
      roleEvent: true,
      spv: []
    };
  }

  function assignEpisodeNarrativeRoles(season, episode, ids) {
    episode.narrativeRoles = {};
    const rows = ids.map((id) => {
      const metrics = episode.editMetrics?.[id] || {};
      const traits = narrativeContestant(season, id)?.traits || {};
      const hidden = (episode.hiddenNarrativeEvents || []).filter((event) => (event.ids || []).includes(id));
      const visible = (episode.untuckedEvents || []).filter((event) => (event.ids || []).includes(id));
      const eventTypes = [...hidden, ...visible].map((event) => String(event.type || "").toLowerCase());
      const fairness = metrics.fairness || episode.placementFairness?.[id] || {};
      const token = String(metrics.token || placementTokenFor(episode, id) || "").toUpperCase();
      const recentEdgic = season.stats?.[id]?.edgic || [];
      const recentExposure = Number(recentEdgic.at(-1)?.visibility || 0) * 0.65 + Number(recentEdgic.at(-2)?.visibility || 0) * 0.25;
      const drama = eventTypes.some((type) => ["drama", "fight", "shade", "rivalry", "argument", "meltdown", "stirs_pot", "conflict_point_of_view", "rejects_critique", "delusional_boast"].includes(type));
      const supportive = eventTypes.some((type) => ["supportive_moment", "emotional_vulnerability", "emotional_checkpoint", "bonding", "resolution"].includes(type));
      const viral = eventTypes.some((type) => ["viral_moment", "iconic_flop", "iconic_fashion_disaster", "reaction_character"].includes(type));
      const baseDemand = Number(metrics.visibilityDemand || metrics.centrality || 0);
      return {
        id,
        metrics,
        traits,
        token,
        drama,
        supportive,
        viral,
        fairness,
        recentExposure,
        demand: baseDemand - Math.max(0, recentExposure - 3) * 6 + randInt(-4, 4),
        heroScore: Number(metrics.positiveTone || 0) * 0.8 + (supportive ? 28 : 0) + Math.max(0, Number(fairness.value || 0)) * 14 + Number(traits.authenticity || 0) * 0.18 + Number(traits.vulnerability || 0) * 0.12,
        villainScore: Number(metrics.negativeTone || 0) * 0.9 + (drama ? 26 : 0) + Number(traits.delusion || 0) * 0.25 + Number(traits.messiness || 0) * 0.2 + Number(traits.loudness || 0) * 0.14,
        dramaStarterScore: Number(traits.messiness || 0) * 0.42 + Number(traits.shade || 0) * 0.34 + Number(traits.loudness || 0) * 0.18 + (drama ? 30 : 0),
        emotionalScore: Number(traits.emotionality || 0) * 0.42 + Number(traits.vulnerability || 0) * 0.38 + Math.min(28, Number(narrativeContestant(season, id)?.state?.stress || 0) * 0.28) + Number(metrics.dimensionality || 0) * 0.18,
        narratorScore: Number(traits.narration || 0) * 0.65 + Number(traits.humor || 0) * 0.28 + Number(traits.selfAwareness || 0) * 0.26 + Number(metrics.insight || 0) * 0.25,
        wildcardScore: Number(traits.eccentricity || 0) * 0.5 + Number(traits.loudness || 0) * 0.25 + Number(traits.humor || 0) * 0.24 + (viral ? 30 : 0),
        underdogScore: Math.max(0, 45 - Number(season.stats?.[id]?.popularity || 50)) * 1.1 + Math.max(0, Number(fairness.value || 0)) * 16 + Number(traits.vulnerability || 0) * 0.25 + (["LOW", "ELIM"].includes(token) || /^BTM/.test(token) ? 18 : 0),
        professionalScore: Number(traits.professionalism || 0) * 0.6 + Number(traits.consistency || 0) * 0.12 + (["WIN", "DWIN", "TOP2", "HIGH", "HIGH_BLK"].includes(token) ? 18 : 0)
      };
    });

    const assigned = new Set();
    const roleById = {};
    const choose = (storyRole, scoreKey, predicate = () => true, minimum = -Infinity) => {
      const candidate = rows
        .filter((row) => !assigned.has(row.id) && predicate(row))
        .sort((a, b) => Number(b[scoreKey] || 0) - Number(a[scoreKey] || 0))[0];
      if (!candidate || Number(candidate[scoreKey] || 0) < minimum) return null;
      assigned.add(candidate.id);
      roleById[candidate.id] = storyRole;
      return candidate;
    };

    const lead = rows.slice().sort((a, b) => b.demand - a.demand)[0];
    if (lead) {
      assigned.add(lead.id);
      roleById[lead.id] = "lead";
    }

    const villain = ids.length >= 6 && Math.random() < 0.82
      ? choose("villain", "villainScore", (row) => row.drama || Number(row.metrics.negativeTone || 0) >= 18 || Number(row.traits.delusion || 0) >= 62, 46)
      : null;
    const hero = ids.length >= 5 && Math.random() < 0.88
      ? choose("hero", "heroScore", (row) => row.supportive || Number(row.fairness.value || 0) > 0 || ["WIN", "DWIN", "TOP2", "HIGH", "HIGH_BLK"].includes(row.token), 38)
      : null;
    const dramaStarter = ids.length >= 8 && Math.random() < 0.68
      ? choose("drama_starter", "dramaStarterScore", (row) => !row.metrics.eliminated && row.storyRole !== "villain", 47)
      : null;
    const emotional = ids.length >= 7 && Math.random() < 0.58
      ? choose("emotional", "emotionalScore", (row) => !row.metrics.eliminated, 48)
      : null;
    const narrator = ids.length >= 7
      ? choose("narrator", "narratorScore", (row) => !row.metrics.eliminated, 78)
      : null;
    const wildcard = ids.length >= 8 && Math.random() < 0.68
      ? choose("wildcard", "wildcardScore", (row) => !row.metrics.eliminated, 50)
      : null;
    const underdog = ids.length >= 7 && Math.random() < 0.62
      ? choose("underdog", "underdogScore", (row) => !["WIN", "DWIN"].includes(row.token), 35)
      : null;
    const professional = ids.length >= 6 && Math.random() < 0.45
      ? choose("professional", "professionalScore", (row) => !row.drama, 54)
      : null;

    const invisibleTarget = ids.length >= 16 ? 2 : ids.length >= 8 ? 1 : 0;
    const invisibleRows = rows
      .filter((row) => !assigned.has(row.id) && !row.metrics.judged && !row.metrics.lipSyncing && !row.metrics.winner)
      .sort((a, b) => a.demand - b.demand)
      .slice(0, invisibleTarget);
    invisibleRows.forEach((row) => {
      assigned.add(row.id);
      roleById[row.id] = "invisible";
    });

    const remaining = rows.filter((row) => !assigned.has(row.id)).sort((a, b) => b.demand - a.demand);
    const secondaryTarget = Math.max(1, Math.round(ids.length * 0.22));
    const backgroundTarget = Math.max(1, Math.round(ids.length * 0.14));
    remaining.forEach((row, index) => {
      if (index < secondaryTarget) roleById[row.id] = "secondary";
      else if (index >= remaining.length - backgroundTarget) roleById[row.id] = "background";
      else roleById[row.id] = "supporting";
    });

    rows.forEach((row) => {
      const storyRole = roleById[row.id] || "supporting";
      const focusRole = storyRole === "lead" ? "primary"
        : ["hero", "villain"].includes(storyRole) ? (row.demand >= 60 ? "primary" : "secondary")
          : ["drama_starter", "emotional", "narrator", "wildcard", "underdog", "professional", "secondary"].includes(storyRole) ? "secondary"
            : storyRole === "invisible" ? "background"
              : storyRole === "background" ? "background" : "supporting";
      episode.narrativeRoles[row.id] = {
        focusRole,
        storyRole,
        reason: storyRole.replace(/_/g, " ")
      };
      row.metrics.narrativeRole = storyRole;
      row.metrics.focusRole = focusRole;
      if (storyRole === "invisible") {
        row.metrics.centrality = Math.min(Number(row.metrics.centrality || 0), 15);
        row.metrics.insight = Math.min(Number(row.metrics.insight || 0), 16);
        row.metrics.dimensionality = Math.min(Number(row.metrics.dimensionality || 0), 18);
        row.metrics.visibilityDemand = Math.min(Number(row.metrics.visibilityDemand || 0), 18);
      }
    });

    [hero, villain, dramaStarter, emotional, narrator, wildcard, underdog, professional].filter(Boolean).forEach((row) => {
      const storyRole = roleById[row.id];
      const alreadySupported = (episode.hiddenNarrativeEvents || []).some((event) => (event.ids || []).includes(row.id) && event.roleEvent);
      if (alreadySupported) return;
      const event = narrativeRoleEvent(season, episode, row.id, storyRole);
      if (!event) return;
      episode.hiddenNarrativeEvents.push(event);
      applyNarrativeEventToMetrics(season, episode, event);
      addArcEvidence(season, row.id, event.arcTags?.[0] || storyRole, 0.8, event.type, episode.label);
    });
  }

  function generateEpisodeAudienceShocks(season, episode, ids) {
    episode.audienceShocks = {};
    const candidates = [];
    ids.forEach((id) => {
      const role = episodeRoleEntry(episode, id);
      const metrics = episode.editMetrics?.[id] || {};
      const stats = season.stats?.[id] || {};
      const traits = narrativeContestant(season, id)?.traits || {};
      const hidden = (episode.hiddenNarrativeEvents || []).filter((event) => (event.ids || []).includes(id));
      const types = new Set(hidden.map((event) => String(event.type || "").toLowerCase()));
      const fairness = metrics.fairness || episode.placementFairness?.[id] || {};
      const recent = recentPopularityPattern(stats);
      const strong = ["slayed", "great"].includes(performanceBandFor(episode, id, "maxiGroups"))
        || ["slayed", "great"].includes(performanceBandFor(episode, id, "runwayGroups"));
      const weak = ["bad", "flopped"].includes(performanceBandFor(episode, id, "maxiGroups"))
        || ["bad", "flopped"].includes(performanceBandFor(episode, id, "runwayGroups"));
      const add = (delta, label, weight) => candidates.push({ id, delta, label, weight: Math.max(1, weight) });

      if (Number(fairness.value || 0) >= 3) add(randInt(16, 30), "robbery outrage", 40 + Number(fairness.value || 0) * 8);
      if (Number(fairness.gap || 0) <= -2) add(-randInt(15, 28), "production-favorite backlash", 38 + Math.abs(Number(fairness.gap || 0)) * 9);
      if (types.has("viral_moment") || types.has("iconic_flop") || types.has("iconic_fashion_disaster")) add(randInt(16, 29), "viral breakout", 58);
      if (types.has("rejects_critique") || types.has("delusional_boast") || types.has("defeated_energy")) add(-randInt(15, 27), "major viewer backlash", 55);
      if (role.storyRole === "hero") add(randInt(12, 24), "hero episode surge", 42);
      if (role.storyRole === "underdog") add(randInt(11, 23), "underdog sympathy wave", 38);
      if (role.storyRole === "villain") {
        const entertaining = Number(traits.humor || 0) + Number(traits.selfAwareness || 0) >= 130;
        if (entertaining && Math.random() < 0.38) add(randInt(10, 20), "villain became great television", 30);
        else add(-randInt(14, 27), "villain backlash", 46);
      }
      if (role.storyRole === "drama_starter") add((Number(traits.humor || 0) >= 70 && Math.random() < 0.42 ? 1 : -1) * randInt(12, 24), "drama-starter discourse", 39);
      if (role.storyRole === "emotional") add(randInt(10, 22), "emotional audience connection", 33);
      if (role.storyRole === "wildcard") add((Math.random() < 0.58 ? 1 : -1) * randInt(12, 23), "polarizing wildcard discourse", 34);
      if (role.storyRole === "lead" && strong) add(randInt(10, 21), "breakout episode", 31);
      if (role.storyRole === "lead" && weak) add(-randInt(11, 23), "high-profile collapse", 34);
      if (recent.streak >= 3 && recent.sign > 0 && (weak || Number(metrics.negativeTone || 0) >= 22 || role.storyRole === "villain")) add(-randInt(16, 29), "sharp backlash reversal", 70);
      if (recent.streak >= 3 && recent.sign < 0 && (strong || Number(metrics.positiveTone || 0) >= 22 || ["hero", "underdog"].includes(role.storyRole))) add(randInt(16, 29), "major redemption reversal", 70);
    });

    if (!candidates.length) return;
    const count = ids.length >= 10
      ? (Math.random() < 0.28 ? 2 : Math.random() < 0.82 ? 1 : 0)
      : ids.length >= 6 ? (Math.random() < 0.72 ? 1 : 0)
        : (Math.random() < 0.45 ? 1 : 0);
    const pool = candidates.slice();
    const selectedIds = new Set();
    for (let index = 0; index < count; index += 1) {
      const available = pool.filter((item) => !selectedIds.has(item.id));
      if (!available.length) break;
      const picked = weightedNarrativeChoice(available);
      if (!picked) break;
      selectedIds.add(picked.id);
      episode.audienceShocks[picked.id] = {
        delta: clamp(Math.round(Number(picked.delta || 0)), -32, 34),
        label: picked.label
      };
    }
  }

  function createChocolateState(season) {
    if (!season.config.twistChocolateRandom && !season.config.twistChocolateChoosable) return null;
    const castIds = season.castOrder?.length ? season.castOrder.slice() : season.activeIds.slice();
    let goldenId = null;
    if (season.config.twistChocolateChoosable) {
      goldenId = season.chosenChocolateGoldenId || randomItem(castIds);
    } else {
      goldenId = randomItem(castIds);
    }
    return { active: true, used: false, goldenId };
  }


  function createBadonkaState(season) {
    if (!season.config.twistBadonkaDunkTank) return null;
    const count = season.castOrder.length >= 14 ? 10 : season.castOrder.length >= 12 ? 8 : 4;
    const saveNumbers = new Set(shuffle(Array.from({ length: count }, (_, index) => index + 1)).slice(0, 2));
    return {
      active: true,
      boxCount: count,
      savesUsed: 0,
      boxes: Array.from({ length: count }, (_, index) => ({ number: index + 1, save: saveNumbers.has(index + 1), opened: false, openedById: null, episodeLabel: null }))
    };
  }

  function isLuckyCowEligible(season, episode) {
    if (!(season?.config?.twistLuckyCow && isRegularFormat(season) && season.luckyCow?.active && !season.luckyCow?.used)) return false;
    if (!(episode?.type === "competitive" && (episode.bottomIds || []).length === 2)) return false;
    if (season.config?.premiereType === "split_s14" && episode?.premiere) return false;
    if ((episode.top2Ids || []).length && episode.specialPremiere !== "uk3") return false;
    return true;
  }

  function buildLuckyCowVoting(season, episode) {
    if (!isLuckyCowEligible(season, episode)) return;
    const bottomIds = (episode.bottomIds || []).slice(0, 2);
    const voters = (episode.activeStartIds || season.activeIds || []).filter((id) => !bottomIds.includes(id));
    const scoreById = Object.fromEntries((episode.scores || []).map((score) => [score.id, Number(score.total || 0)]));
    const votes = voters.map((voterId) => {
      const criterion = Math.random() < 0.5 ? "relationship" : "challenge";
      let votedForId;
      if (criterion === "relationship") {
        votedForId = bottomIds.slice().sort((a, b) => (season.relationships[pairKey(voterId, b)] || 0) - (season.relationships[pairKey(voterId, a)] || 0) || randInt(-1, 1))[0];
      } else {
        votedForId = bottomIds.slice().sort((a, b) => (scoreById[a] || 0) - (scoreById[b] || 0) || randInt(-1, 1))[0];
      }
      return { voterId, votedForId, criterion };
    });
    const totals = Object.fromEntries(bottomIds.map((id) => [id, 0]));
    votes.forEach((vote) => { totals[vote.votedForId] = Number(totals[vote.votedForId] || 0) + 1; });
    const topVotes = Math.max(...bottomIds.map((id) => totals[id] || 0));
    const tied = bottomIds.filter((id) => (totals[id] || 0) === topVotes);
    const targetId = tied.length === 1 ? tied[0] : tied.slice().sort((a, b) => (scoreById[a] || 0) - (scoreById[b] || 0))[0];
    episode.luckyCow = { active: true, votes, totals, targetId, revealed: false, saved: false, savedId: null, eliminatedId: null };
  }

  function applyLuckyCowSave(season, episode, eliminatedId, lipSync) {
    if (!episode?.luckyCow?.active || !eliminatedId || episode.luckyCow.targetId !== eliminatedId) return false;
    episode.luckyCow.saved = true;
    episode.luckyCow.savedId = eliminatedId;
    episode.luckyCow.eliminatedId = eliminatedId;
    season.luckyCow.used = true;
    season.luckyCow.active = false;
    episode.eliminatedIds = (episode.eliminatedIds || []).filter((id) => id !== eliminatedId);
    if (!episode.savedIds.includes(eliminatedId)) episode.savedIds.push(eliminatedId);
    if (lipSync) lipSync.resultType = "lucky_cow_save";
    return true;
  }

  function markLuckyCowFailure(season, episode, eliminatedId) {
    if (!episode?.luckyCow?.active || !eliminatedId) return;
    episode.luckyCow.saved = false;
    episode.luckyCow.savedId = null;
    episode.luckyCow.eliminatedId = eliminatedId;
  }

  function isBadonkaEligible(season, episode) {
    if (!(season?.config?.twistBadonkaDunkTank && season.badonkaDunkTank?.active && isRegularFormat(season))) return false;
    if (!(episode?.type === "competitive" && (episode.bottomIds || []).length >= 2)) return false;
    if (season.config?.premiereType === "split_s14" && episode?.premiere) return false;
    if ((episode.top2Ids || []).length && episode.specialPremiere !== "uk3") return false;
    return true;
  }

  function maybeCreateBadonkaPull(season, episode, eliminatedId, lipSync) {
    if (!isBadonkaEligible(season, episode) || !eliminatedId || !(episode.eliminatedIds || []).includes(eliminatedId)) return false;
    const tank = season.badonkaDunkTank;
    const unopened = (tank.boxes || []).filter((box) => !box.opened && !box.reserved);
    if (!unopened.length) { tank.active = false; return false; }
    const box = randomItem(unopened);
    box.reserved = true;
    box.openedById = eliminatedId;
    box.episodeLabel = episode.label;
    box.episodeNumber = episode.number;
    const saved = !!box.save;
    episode.badonkaDunkTank = { active: true, contestantId: eliminatedId, boxNumber: box.number, saved, revealed: false, boxCount: tank.boxCount };
    if (saved) {
      tank.savesUsed = Number(tank.savesUsed || 0) + 1;
      episode.eliminatedIds = (episode.eliminatedIds || []).filter((id) => id !== eliminatedId);
      if (!episode.savedIds.includes(eliminatedId)) episode.savedIds.push(eliminatedId);
      if (lipSync) lipSync.resultType = "badonka_save";
      if (tank.savesUsed >= 2) tank.active = false;
    }
    if (!(tank.boxes || []).some((candidate) => !candidate.opened && !candidate.reserved)) tank.active = false;
    return saved;
  }

  function chooseContestantByPrompt(ids, message) {
    return chooseFromIdsByPrompt(ids, message);
  }

  function chooseFromIdsByPrompt(ids, message) {
    if (state.config.mode !== "rupaul") return null;
    const cleanIds = (ids || []).filter(Boolean);
    if (!cleanIds.length) return null;
    const names = cleanIds.map((id) => fullDisplayName(state.season?.contestants?.[id] || state.selected.find((s) => s.id === id) || { id })).join(", ");
    const answer = window.prompt?.(`${message}
Options: ${names}`, "") || "";
    if (!answer.trim()) return null;
    const q = normalizeString(answer);
    return cleanIds.find((id) => {
      const item = state.season?.contestants?.[id] || state.selected.find((s) => s.id === id);
      return normalizeString(`${item?.nickname} ${item?.fullName} ${item?.name}`).includes(q);
    }) || null;
  }

  function chooseContestantByDropdown(ids, title, subtitle = "Choose the contestant who will enter the competition later.", label = "Late-entry contestant") {
    const cleanIds = (ids || []).filter(Boolean);
    if (!cleanIds.length) return Promise.resolve(null);
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "choice-modal-backdrop";
      overlay.innerHTML = `
        <div class="choice-modal-card" role="dialog" aria-modal="true">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(subtitle)}</p>
          <label class="field">
            <span>${escapeHtml(label)}</span>
            <select class="choice-modal-select">
              ${cleanIds.map((id) => {
                const item = state.season?.contestants?.[id] || state.selected.find((s) => s.id === id) || { id };
                return `<option value="${escapeHtml(id)}">${escapeHtml(fullDisplayName(item))}</option>`;
              }).join("")}
            </select>
          </label>
          <div class="modal-actions">
            <button class="primary-btn choice-modal-confirm" type="button">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      const select = overlay.querySelector(".choice-modal-select");
      const done = () => {
        const value = select?.value || cleanIds[0];
        overlay.remove();
        resolve(value);
      };
      overlay.querySelector(".choice-modal-confirm")?.addEventListener("click", done);
      select?.focus?.();
    });
  }

  function chooseChocolateBarByDropdown(ids, title = "Choose the Golden Chocolate Bar") {
    const cleanIds = (ids || []).filter(Boolean);
    if (!cleanIds.length) return Promise.resolve(null);
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "choice-modal-backdrop chocolate-choice-backdrop";
      overlay.innerHTML = `
        <div class="choice-modal-card" role="dialog" aria-modal="true">
          <h3>${escapeHtml(title)}</h3>
          <p>Choose which contestant secretly receives the golden chocolate bar.</p>
          <label class="field">
            <span>Golden Chocolate Bar</span>
            <select class="choice-modal-select">
              ${cleanIds.map((id) => {
                const item = state.season?.contestants?.[id] || state.selected.find((s) => s.id === id) || { id };
                return `<option value="${escapeHtml(id)}">${escapeHtml(fullDisplayName(item))}</option>`;
              }).join("")}
            </select>
          </label>
          <div class="modal-actions">
            <button class="primary-btn choice-modal-confirm" type="button">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      const select = overlay.querySelector(".choice-modal-select");
      const done = () => {
        const value = select?.value || cleanIds[0];
        overlay.remove();
        resolve(value);
      };
      overlay.querySelector(".choice-modal-confirm")?.addEventListener("click", done);
      select?.focus?.();
    });
  }


  const PREMIERE_CHALLENGE_TYPE_OPTIONS = [
    { type: "ball", label: "Ball", description: "A multi-look fashion challenge." },
    { type: "design", label: "Design", description: "Create a runway look from provided materials." },
    { type: "girlgroups", label: "Girl Groups", description: "Perform in competing drag music groups." },
    { type: "rumix", label: "RuMix", description: "Write and perform verses to a RuPaul remix." },
    { type: "runway", label: "Runway", description: "A full look-focused runway challenge." },
    { type: "talent_show", label: "Talent Show", description: "Showcase each contestant's signature talent." }
  ];

  function shouldChoosePremiereChallengeType(season) {
    if (!season) return false;
    if (isAllWinnersFormat(season) || isTournamentFormat(season)) return false;
    return !["rate_a_queen_s16", "rate_a_queen_s17", "porkchop"].includes(season.config?.premiereType || "regular");
  }

  function availablePremiereChallengeTypes(season) {
    const blockTalent = !!season?.config?.specialMidSeasonRateAQueen;
    return PREMIERE_CHALLENGE_TYPE_OPTIONS.filter((option) => {
      if (option.type === "talent_show" && blockTalent) return false;
      return getChallengeData().some((challenge) => challengeTypeKey(challenge.type) === option.type);
    });
  }

  function choosePremiereChallengeType(season) {
    const options = availablePremiereChallengeTypes(season);
    if (!options.length) return Promise.resolve("rumix");
    return new Promise((resolve) => {
      let selectedType = "";
      const overlay = document.createElement("div");
      overlay.className = "choice-modal-backdrop premiere-challenge-backdrop";

      const render = () => {
        overlay.innerHTML = `
          <div class="choice-modal-card premiere-challenge-card" role="dialog" aria-modal="true" aria-labelledby="premiereChallengeTitle">
            <p class="eyebrow">Premiere Challenge</p>
            <h3 id="premiereChallengeTitle">Choose the Premiere Challenge Type</h3>
            <p>Every premiere episode will use this challenge type. Split premieres use two different challenges of the same type.</p>
            <div class="premiere-challenge-grid">
              ${options.map((option) => `
                <button class="premiere-challenge-option ${selectedType === option.type ? "is-selected" : ""}" type="button" data-type="${escapeHtml(option.type)}">
                  <strong>${escapeHtml(option.label)}</strong>
                  <span>${escapeHtml(option.description)}</span>
                </button>
              `).join("")}
            </div>
            ${season?.config?.specialMidSeasonRateAQueen ? '<p class="premiere-challenge-note">Talent Show is unavailable because Mid-Season Rate-A-Queen is enabled.</p>' : ""}
            <div class="modal-actions">
              <button class="primary-btn premiere-challenge-confirm" type="button" ${selectedType ? "" : "disabled"}>Confirm Challenge</button>
            </div>
          </div>
        `;
        overlay.querySelectorAll(".premiere-challenge-option").forEach((button) => {
          button.addEventListener("click", () => {
            selectedType = button.dataset.type || "";
            render();
          });
        });
        overlay.querySelector(".premiere-challenge-confirm")?.addEventListener("click", () => {
          if (!selectedType) return;
          overlay.remove();
          resolve(selectedType);
        });
      };

      document.body.appendChild(overlay);
      render();
    });
  }


  function chooseWinnerFromCandidates(season, episode, candidates) {
    const ids = (candidates || []).filter((id) => season.activeIds.includes(id));
    return ids[0] || null;
  }

  function applyRupaulLipSyncChoice(season, lipSync) {
    return lipSync;
  }

  async function startSeason() {
    readConfigFromInputs();
    const validation = validateSetupConfig(state.config);
    if (validation) { alert(validation); return; }
    if (state.selected.length !== state.config.castSize) {
      alert(`Please select exactly ${state.config.castSize} contestants.`);
      return;
    }
    state.season = createSeasonState();
    if (shouldChoosePremiereChallengeType(state.season)) {
      const chosenPremiereType = await choosePremiereChallengeType(state.season);
      state.season.premiereChallengeType = chosenPremiereType;
      state.season.config.premiereChallengeType = chosenPremiereType;
    }
    if (state.season.config.twistChocolateChoosable) {
      state.season.chosenChocolateGoldenId = await chooseChocolateBarByDropdown(state.season.castOrder, "Choose the Golden Chocolate Bar");
    }
    state.season.chocolate = createChocolateState(state.season);
    state.season.badonkaDunkTank = createBadonkaState(state.season);
    await setupPremierePreChoices(state.season);
    if (state.season.config.eliminationFormat === "tournament") await chooseTournamentBrackets(state.season);
    if (state.season.config.eliminationFormat === "teams") await chooseTeamPairs(state.season);
    await chooseInitialRelationships(state.season);
    await simulateFullSeason(state.season);
    const pendingChooseReturnIndex = (state.season.episodes || []).findIndex((ep) => ep?.comebackPending && ep?.comeback?.format === "choose_return");
    state.currentEpisodeIndex = pendingChooseReturnIndex >= 0 ? pendingChooseReturnIndex : 0;
    state.currentStep = pendingChooseReturnIndex >= 0 ? "comeback" : "status";
    saveState();
    renderEpisodeSelect();
    renderEpisode();
    showScreen("episode-screen");
    scrollToEpisodeSection(state.currentStep || "status");
  }

  async function setupPremierePreChoices(season) {
    if (season.config.premiereType === "late_entry") {
      const chosen = await chooseContestantByDropdown(season.activeIds, "Choose the Late-Entry Contestant");
      season.lateEntryId = chosen || season.activeIds[0];
      season.activeIds = season.activeIds.filter((id) => id !== season.lateEntryId);
    }
    if (isSplitPremiereType(season.config.premiereType)) {
      const chosenGroup = await chooseSplitPremiereGroup(season.activeIds, "Choose the First Premiere Group");
      season.splitPremiereFirstGroupIds = chosenGroup.length ? chosenGroup : shuffle(season.activeIds).slice(0, splitPremiereFirstGroupSize(season.activeIds.length));
    }
  }

  function isSplitPremiereType(type) {
    return ["split_s6", "split_s12", "split_s14", "rate_a_queen_s16", "rate_a_queen_s17"].includes(type);
  }

  function splitPremiereFirstGroupSize(count) {
    return Math.ceil(Number(count || 0) / 2);
  }

  function chooseSplitPremiereGroup(ids, title) {
    const cleanIds = (ids || []).filter(Boolean);
    const target = splitPremiereFirstGroupSize(cleanIds.length);
    if (!cleanIds.length || !target) return Promise.resolve([]);
    return new Promise((resolve) => {
      const selected = new Set(cleanIds.slice(0, target));
      const overlay = document.createElement("div");
      overlay.className = "choice-modal-backdrop split-premiere-backdrop";

      const renderCards = () => {
        const count = selected.size;
        overlay.innerHTML = `
          <div class="choice-modal-card split-premiere-card" role="dialog" aria-modal="true">
            <h3>${escapeHtml(title)}</h3>
            <p>Pick exactly ${target} contestant${target === 1 ? "" : "s"} for Episode 1. Everyone else will compete in Episode 2.</p>
            <div class="split-premiere-count"><strong>${count}</strong>/${target} selected</div>
            <div class="split-premiere-grid">
              ${cleanIds.map((id) => {
                const item = state.season?.contestants?.[id] || state.selected.find((s) => s.id === id) || { id };
                const isSelected = selected.has(id);
                return `
                  <button class="split-premiere-option ${isSelected ? "is-selected" : ""}" type="button" data-id="${escapeHtml(id)}">
                    <img class="avatar sqr" src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(item))}">
                    <strong>${escapeHtml(fullDisplayName(item))}</strong>
                  </button>
                `;
              }).join("")}
            </div>
            <div class="modal-actions split-premiere-actions">
              <button class="secondary-btn split-premiere-random" type="button">Randomize</button>
              <button class="secondary-btn split-premiere-reset" type="button">Reset</button>
              <button class="primary-btn split-premiere-confirm" type="button" ${count === target ? "" : "disabled"}>Confirm</button>
            </div>
          </div>
        `;
        overlay.querySelectorAll(".split-premiere-option").forEach((button) => {
          button.addEventListener("click", () => {
            const id = button.dataset.id;
            if (!id) return;
            if (selected.has(id)) selected.delete(id);
            else if (selected.size < target) selected.add(id);
            renderCards();
          });
        });
        overlay.querySelector(".split-premiere-random")?.addEventListener("click", () => {
          selected.clear();
          shuffle(cleanIds).slice(0, target).forEach((id) => selected.add(id));
          renderCards();
        });
        overlay.querySelector(".split-premiere-reset")?.addEventListener("click", () => {
          selected.clear();
          renderCards();
        });
        overlay.querySelector(".split-premiere-confirm")?.addEventListener("click", () => {
          if (selected.size !== target) return;
          const result = cleanIds.filter((id) => selected.has(id));
          overlay.remove();
          resolve(result);
        });
      };

      document.body.appendChild(overlay);
      renderCards();
    });
  }

  async function chooseTournamentBrackets(season) {
    const ids = (season.castOrder || []).slice();
    const count = Number(season.config.tournamentBracketCount || 2);
    const perBracket = ids.length / count;
    const defaultColors = ["#F749E4", "#FB8212", "#B039CE", "#FFE500", "#A1EA0E"];
    const emptySlots = () => Array.from({ length: count }, () => Array.from({ length: perBracket }, () => ""));
    let slots = emptySlots();
    const allSelected = () => slots.flat().filter(Boolean);
    const isValid = () => {
      const flat = allSelected();
      return flat.length === ids.length && new Set(flat).size === ids.length && slots.every((group) => group.length === perBracket && group.every(Boolean));
    };
    const optionList = (currentId) => ids.map((id) => {
      const contestant = season.contestants[id] || { id };
      const usedElsewhere = id !== currentId && allSelected().includes(id);
      return `<option value="${escapeHtml(id)}" ${id === currentId ? "selected" : ""} ${usedElsewhere ? "disabled" : ""}>${escapeHtml(fullDisplayName(contestant))}</option>`;
    }).join("");
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "choice-modal-backdrop tournament-bracket-backdrop";
      const render = () => {
        overlay.innerHTML = `
          <div class="choice-modal-card tournament-bracket-card tournament-bracket-card-compact" role="dialog" aria-modal="true">
            <div class="tournament-bracket-titlebar">
              <div>
                <p class="eyebrow">Tournament</p>
                <h3>Set Tournament Brackets</h3>
              </div>
              <div class="tournament-bracket-toolbar">
                <button class="secondary-btn tournament-random" type="button">Randomize</button>
                <button class="secondary-btn tournament-reset" type="button">Reset</button>
              </div>
            </div>
            <p class="tournament-bracket-instructions">Choose a color and ${perBracket} contestant${perBracket === 1 ? "" : "s"} for each bracket. Every contestant can only be assigned once.</p>
            <div class="tournament-column-grid" style="--tournament-bracket-count: ${count};">
              ${Array.from({ length: count }, (_, bracketIndex) => `
                <section class="tournament-column" style="--bracket-color: ${escapeHtml(defaultColors[bracketIndex])};">
                  <div class="tournament-column-head">
                    <div class="tournament-column-title">
                      <span class="tournament-color-dot" style="background: ${escapeHtml(defaultColors[bracketIndex])};"></span>
                      <strong>Bracket ${bracketIndex + 1}</strong>
                    </div>
                    <label class="tournament-mini-color" aria-label="Bracket ${bracketIndex + 1} color">
                      <input type="color" class="tournament-color-input" data-bracket="${bracketIndex}" value="${escapeHtml(defaultColors[bracketIndex])}">
                    </label>
                  </div>
                  <div class="tournament-slot-stack">
                    ${Array.from({ length: perBracket }, (_, slotIndex) => {
                      const currentId = slots[bracketIndex]?.[slotIndex] || "";
                      const contestant = season.contestants[currentId] || null;
                      return `
                        <label class="tournament-slot-card">
                          <span class="tournament-slot-number">${slotIndex + 1}</span>
                          <img class="tournament-slot-photo" src="${escapeHtml(contestant?.image || PLACEHOLDER)}" alt="${escapeHtml(contestant ? fullDisplayName(contestant) : "Contestant")}">
                          <select class="tournament-bracket-select" data-bracket="${bracketIndex}" data-slot="${slotIndex}">
                            <option value="">Choose contestant...</option>
                            ${optionList(currentId)}
                          </select>
                        </label>
                      `;
                    }).join("")}
                  </div>
                </section>
              `).join("")}
            </div>
            <div class="modal-actions tournament-bracket-actions">
              <button class="primary-btn tournament-confirm" type="button" ${isValid() ? "" : "disabled"}>Confirm Brackets</button>
            </div>
          </div>
        `;
        overlay.querySelectorAll(".tournament-bracket-select").forEach((select) => select.addEventListener("change", () => {
          const bracketIndex = Number(select.dataset.bracket);
          const slotIndex = Number(select.dataset.slot);
          slots[bracketIndex][slotIndex] = select.value;
          render();
        }));
        overlay.querySelectorAll(".tournament-color-input").forEach((input) => {
          const updateBracketColor = () => {
            const bracketIndex = Number(input.dataset.bracket);
            const color = input.value || defaultColors[bracketIndex];
            defaultColors[bracketIndex] = color;
            const column = input.closest(".tournament-column");
            if (column) column.style.setProperty("--bracket-color", color);
            const dot = column?.querySelector(".tournament-color-dot");
            if (dot) dot.style.background = color;
          };
          input.addEventListener("input", updateBracketColor);
          input.addEventListener("change", updateBracketColor);
        });
        overlay.querySelector(".tournament-random")?.addEventListener("click", () => {
          const shuffled = shuffle(ids);
          slots = Array.from({ length: count }, (_, i) => shuffled.slice(i * perBracket, (i + 1) * perBracket));
          render();
        });
        overlay.querySelector(".tournament-reset")?.addEventListener("click", () => {
          slots = emptySlots();
          render();
        });
        overlay.querySelector(".tournament-confirm")?.addEventListener("click", () => {
          if (!isValid()) return;
          const finalGroups = slots.map((group) => group.slice());
          season.tournamentBrackets = finalGroups.map((groupIds, index) => ({ id: `bracket_${index + 1}`, name: `Bracket ${index + 1}`, color: defaultColors[index], ids: groupIds.slice(), episodeLabels: [] }));
          season.tournamentPoints = Object.fromEntries(ids.map((id) => [id, 0]));
          overlay.remove();
          resolve();
        });
      };
      document.body.appendChild(overlay);
      render();
    });
  }

  function chooseInitialRelationships(season) {
    const ids = (season.castOrder || []).filter((id) => season.contestants?.[id]);
    if (ids.length < 2) return Promise.resolve();
    ids.forEach((a, i) => ids.slice(i + 1).forEach((b) => {
      const key = pairKey(a, b);
      if (!Number.isFinite(Number(season.relationships[key]))) season.relationships[key] = 0;
    }));

    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "choice-modal-backdrop relationship-backdrop";

      const setPair = (a, b, value) => {
        const key = pairKey(a, b);
        season.relationships[key] = clamp(Number(value), -10, 10);
      };
      const getPair = (a, b) => relationshipOption(Number(season.relationships[pairKey(a, b)] ?? 0));
      const randomRelationshipValue = () => {
        const roll = Math.random();
        if (roll < 0.12) return randInt(-7, -2);
        if (roll < 0.30) return randInt(2, 7);
        if (roll < 0.35) return Math.random() < 0.5 ? randInt(-10, -8) : randInt(8, 10);
        return randInt(-1, 1);
      };
      const avatarCell = (id) => {
        const item = season.contestants[id] || { id };
        return `<img class="relationship-avatar" src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(item))}" title="${escapeHtml(fullDisplayName(item))}">`;
      };

      const render = () => {
        overlay.innerHTML = `
          <div class="choice-modal-card relationship-card compact-relationship-card" role="dialog" aria-modal="true">
            <div class="relationship-head compact-relationship-head">
              <div class="relationship-title-block">
                <p class="eyebrow">Werkroom Dynamics</p>
                <h3>Set Contestant Relationships</h3>
                <div class="relationship-actions-top">
                  <button class="secondary-btn relationship-random" type="button">Randomize</button>
                  <button class="secondary-btn relationship-reset" type="button">Reset</button>
                </div>
              </div>
            </div>
            <div class="relationship-grid-wrap compact-relationship-grid-wrap">
              <table class="relationship-grid-table compact-relationship-grid-table">
                <thead>
                  <tr>
                    <th class="relationship-corner"></th>
                    ${ids.map((id) => `<th>${avatarCell(id)}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${ids.map((rowId) => `
                    <tr>
                      <th>${avatarCell(rowId)}</th>
                      ${ids.map((colId) => {
                        if (rowId === colId) return `<td class="relationship-self compact-relationship-self"></td>`;
                        const option = getPair(rowId, colId);
                        const numberLabel = option.value > 0 ? `+${option.value}` : String(option.value);
                        return `
                          <td>
                            <label class="relationship-cell-wrap compact-relationship-cell-wrap" title="${escapeHtml(fullDisplayName(season.contestants[rowId]))} / ${escapeHtml(fullDisplayName(season.contestants[colId]))}: ${escapeHtml(numberLabel)} ${escapeHtml(option.label)}">
                              <span class="relationship-cell compact-relationship-cell ${escapeHtml(option.className)}"><strong>${numberLabel}</strong></span>
                              <select class="relationship-cell-select" data-a="${escapeHtml(rowId)}" data-b="${escapeHtml(colId)}" aria-label="Relationship for ${escapeHtml(fullDisplayName(season.contestants[rowId]))} and ${escapeHtml(fullDisplayName(season.contestants[colId]))}">
                                ${relationshipScale.map((item) => `<option value="${item.value}" ${item.value === option.value ? "selected" : ""}>${item.value > 0 ? "+" : ""}${item.value} ${escapeHtml(item.label)}</option>`).join("")}
                              </select>
                            </label>
                          </td>`;
                      }).join("")}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            <div class="modal-actions relationship-actions-bottom">
              <button class="primary-btn relationship-confirm" type="button">Start Season</button>
            </div>
          </div>
        `;

        overlay.querySelectorAll(".relationship-cell-select").forEach((select) => {
          select.addEventListener("change", () => {
            const a = select.dataset.a;
            const b = select.dataset.b;
            if (!a || !b) return;
            setPair(a, b, Number(select.value));
            render();
          });
        });
        overlay.querySelector(".relationship-random")?.addEventListener("click", () => {
          ids.forEach((a, i) => ids.slice(i + 1).forEach((b) => setPair(a, b, randomRelationshipValue())));
          render();
        });
        overlay.querySelector(".relationship-reset")?.addEventListener("click", () => {
          ids.forEach((a, i) => ids.slice(i + 1).forEach((b) => setPair(a, b, 0)));
          render();
        });
        overlay.querySelector(".relationship-confirm")?.addEventListener("click", () => {
          overlay.remove();
          resolve();
        });
      };

      document.body.appendChild(overlay);
      render();
    });
  }

  async function simulateFullSeason(season) {
    if (isAllWinnersFormat(season)) {
      simulateAllWinnersSeason(season);
      return;
    }
    if (isTournamentFormat(season)) {
      simulateTournamentSeason(season);
      return;
    }
    simulatePremiere(season);
    await simulateSeasonFromCurrentState(season);
  }

  async function simulateSeasonFromCurrentState(season) {
    while (!season.seasonComplete && (season.activeIds.length > (isTeamsFormat(season) ? (season.teamsFinalistOverride || 3) : season.config.finalistSize) || shouldRunSpecialComeback(season))) {
      if (season.lalaparuzaQueued) simulateLalaparuzaEpisode(season);
      else if (shouldRunSpecialLalaparuza(season)) simulateSpecialLalaparuzaSmackdown(season);
      else if (shouldRunSpecialSlayOffs(season)) simulateSpecialSlayOffs(season);
      else if (shouldRunMidSeasonRateAQueen(season)) simulateMidSeasonRateAQueen(season);
      else if (shouldRunSpecialComeback(season)) simulateComebackSpecialEpisode(season);
      else if (season.config.premiereType === "rate_a_queen_s16" && !season.rateAQueenMergeDone && season.episodeCounter === 3) {
        simulateRegularEpisode(season, { specialPremiere: "rate_a_queen_merge", label: "Episode 3" });
        season.rateAQueenMergeDone = true;
      }
      else if (season.config.finaleType === "cunt_test" && season.activeIds.length === 5) {
        simulateCuntTestEpisode(season);
      }
      else {
        let comebackOptions = {};
        if (shouldRunDirectComeback(season)) {
          if (comebackFormat(season) === "choose_return") {
            createChooseReturnPendingEpisode(season);
            return;
          } else {
            comebackOptions = directComebackOptions(season);
          }
        }
        simulateRegularEpisode(season, comebackOptions);
      }
      if (season.episodes.length > 40) break;
    }
    if (!season.seasonComplete && season.config.finaleType === "lsftf" && season.activeIds.length === 4) {
      simulateLipSyncForTheFinalePenultimate(season);
    }
    if (!season.seasonComplete && season.config.specialFameGames) simulateFameGamesEpisode(season);
    if (!season.seasonComplete && season.config.specialReunionLalaparuza) simulateReunionLalaparuzaEpisode(season);
    if (!season.seasonComplete) {
      const hasAlternativeTopFourEpisode = season.config.finaleType === "cunt_test"
        || !!season.config.specialFameGames
        || !!season.config.specialReunionLalaparuza;
      if (season.config.finaleType !== "lsftf" && !hasAlternativeTopFourEpisode) addTopFourRumixTrackColumn(season);
      simulateFinale(season);
    }
  }


  function allWinnersEpisodeCountForCast(count) {
    const n = Number(count || 0);
    if (n <= 10) return 12;
    if (n <= 14) return 14;
    return 16;
  }

  function setupAllWinnersState(season) {
    const total = allWinnersEpisodeCountForCast(season.castOrder.length);
    season.allWinnersTotalEpisodes = total;
    season.allWinnersCompetitiveEpisodes = total - 1;
    season.allWinnersMidseasonEpisode = total === 12 ? 5 : total === 14 ? 6 : 7;
    season.allWinnersTalentEpisode = total - 1;
    season.allWinnersBlockCutoffEpisode = Math.max(1, season.allWinnersTalentEpisode - 2);
    season.allWinnersStarCounts = Object.fromEntries(season.castOrder.map((id) => [id, 0]));
    season.allWinnersBlockCounts = Object.fromEntries(season.castOrder.map((id) => [id, 0]));
    season.allWinnersPendingBlockedId = null;
    season.allWinnersPendingGiveaways = [];
    season.allWinnersFinalistIds = [];
  }

  function allWinnersForcedChallengeType(season, number) {
    if (number === 1) return "rumix";
    if (number === 2) return "snatch_game";
    if (number === 3) return "ball";
    if (number === season.allWinnersTalentEpisode) return "talent_show";
    return "";
  }

  function simulateAllWinnersSeason(season) {
    setupAllWinnersState(season);
    const competitiveEpisodes = season.allWinnersCompetitiveEpisodes;
    while (season.episodeCounter <= competitiveEpisodes) {
      simulateAllWinnersEpisode(season);
      if (season.episodes.length > 40) break;
    }
    simulateAllWinnersFinale(season);
  }

  function simulateAllWinnersEpisode(season) {
    const number = season.episodeCounter;
    const forcedChallengeType = allWinnersForcedChallengeType(season, number);
    const episode = createEpisodeShell(season, {
      type: "competitive",
      title: `Episode ${number}`,
      label: `Episode ${number}`,
      forcedChallengeType,
      allWinnersEpisode: true
    });
    episode.challenge = pickChallenge(season, episode);
    episode.guestJudge = pickGuestJudge(episode.challenge.type);
    episode.allWinnersBlockedId = number === season.allWinnersTalentEpisode ? null : season.allWinnersPendingBlockedId;
    season.allWinnersPendingBlockedId = null;
    if ((season.allWinnersPendingGiveaways || []).length) {
      episode.allWinnersStarGiveawaysAtStart = season.allWinnersPendingGiveaways.slice();
      season.allWinnersPendingGiveaways = [];
      episode.miniChallenge = null;
      episode.miniWinnerIds = [];
      episode.allWinnersStarGiveawaysAtStart.forEach((gift) => {
        addAllWinnersStarAward(season, episode, gift.receiverId, 1, "gift", gift.giverId);
      });
    } else {
      runMiniChallenge(season, episode);
    }
    maybeCreateTeams(season, episode);
    runChallengeAndRunway(season, episode);
    assignAllWinnersSeasonPlacements(season, episode);
    clearAllWinnersBlockIfTopTwo(season, episode);
    resolveAllWinnersLipSyncAndStars(season, episode);
    runUntucked(season, episode);
    if (number === season.allWinnersTalentEpisode) chooseAllWinnersFinalists(season, episode);
    finalizeEpisode(season, episode);
  }

  function assignAllWinnersSeasonPlacements(season, episode) {
    const ranked = rankedIds(episode);
    episode.top2Ids = ranked.slice(0, Math.min(2, ranked.length));
    episode.winnerIds = [];
    episode.highIds = ranked.filter((id) => !episode.top2Ids.includes(id)).slice(0, Math.min(2, Math.max(0, ranked.length - episode.top2Ids.length)));
    episode.lowIds = [];
    episode.bottomIds = [];
    episode.eliminatedIds = [];
    episode.savedIds = [];
    setSafeIds(season, episode);
    if (episode.allWinnersBlockedId && !episode.top2Ids.includes(episode.allWinnersBlockedId) && !episode.highIds.includes(episode.allWinnersBlockedId) && !episode.safeIds.includes(episode.allWinnersBlockedId)) {
      episode.safeIds.push(episode.allWinnersBlockedId);
    }
  }

  function clearAllWinnersBlockIfTopTwo(season, episode) {
    const blockedId = episode.allWinnersBlockedId;
    if (!blockedId || !(episode.top2Ids || []).includes(blockedId)) return;
    episode.notes = episode.notes || [];
    episode.notes.push(`${fullDisplayName(season.contestants[blockedId])} made the Top Two, but the block prevents them from earning Legendary Legend Stars this week.`);
  }

  function addAllWinnersStarAward(season, episode, id, amount, reason, giverId = null) {
    if (!id || !season.stats[id]) return;
    const value = Number(amount || 0);
    episode.allWinnersStarAwards = episode.allWinnersStarAwards || [];
    episode.allWinnersStarAwards.push({ id, amount: value, reason, giverId });
    if (value > 0) {
      season.allWinnersStarCounts[id] = Number(season.allWinnersStarCounts[id] || 0) + value;
      season.stats[id].legendaryStars = Number(season.stats[id].legendaryStars || 0) + value;
    }
    season.stats[id].legendaryStarHistory = season.stats[id].legendaryStarHistory || [];
    season.stats[id].legendaryStarHistory.push({ label: episode.label, amount: value, reason, giverId, total: season.allWinnersStarCounts[id] || 0 });
  }

  function chooseStarGiftRecipient(season, giverId, episode) {
    const pool = season.castOrder.filter((id) => id !== giverId && season.activeIds.includes(id));
    if (!pool.length) return null;
    const minStars = Math.min(...pool.map((id) => Number(season.allWinnersStarCounts[id] || 0)));
    return pool.map((id) => {
      const relationship = season.relationships[pairKey(giverId, id)] || 0;
      const underdog = (minStars - Number(season.allWinnersStarCounts[id] || 0)) * 1.4;
      const recentBond = episode.untuckedEvents?.some?.((event) => (event.ids || []).includes(giverId) && (event.ids || []).includes(id)) ? 3 : 0;
      return { id, score: relationship * 5.8 + underdog + recentBond + randInt(-2, 2) };
    }).sort((a, b) => b.score - a.score)[0]?.id || pool[0];
  }

  function chooseAllWinnersBlockTarget(season, blockerId, episode) {
    const topTwo = new Set(episode.top2Ids || []);
    const pool = season.castOrder.filter((id) => id !== blockerId && !topTwo.has(id) && season.activeIds.includes(id));
    if (!pool.length) return null;
    const maxBlocks = Math.max(0, ...pool.map((id) => Number(season.allWinnersBlockCounts[id] || 0)));
    return pool.map((id) => {
      const relationship = season.relationships[pairKey(blockerId, id)] || 0;
      const stars = Number(season.allWinnersStarCounts[id] || 0);
      const competitor = stars * 9 + trackRecordPower(season, id) * 0.34;
      const freshTarget = (maxBlocks - Number(season.allWinnersBlockCounts[id] || 0)) * 4.8;
      const relationshipFactor = (-relationship) * 6.4;
      return { id, score: relationshipFactor + competitor + freshTarget + randInt(-3, 3) };
    }).sort((a, b) => b.score - a.score)[0]?.id || pool[0];
  }

  function resolveAllWinnersLipSyncAndStars(season, episode) {
    const top2 = (episode.top2Ids || []).slice(0, 2);
    if (top2.length < 2) return;
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, top2, "Lip Sync For Your Legacy"));
    lipSync.resultType = "all_winners_legacy";
    lipSync.loserId = top2.find((id) => id !== lipSync.winnerId) || lipSync.loserId;
    episode.lipSync = lipSync;
    episode.winnerIds = [lipSync.winnerId].filter(Boolean);
    const starAmount = episode.number === season.allWinnersTalentEpisode ? 3 : 1;
    const isGiftWeek = episode.number === season.allWinnersMidseasonEpisode;
    top2.forEach((id) => {
      const blocked = episode.allWinnersBlockedId === id;
      addAllWinnersStarAward(season, episode, id, blocked ? 0 : starAmount, blocked ? "blocked_top2" : (starAmount === 3 ? "talent_top2" : "top2"));
      if (isGiftWeek) {
        const receiverId = chooseStarGiftRecipient(season, id, episode);
        if (receiverId) episode.allWinnersStarGiveaways.push({ giverId: id, receiverId });
      }
      updateLipSyncStats(season, id, id === lipSync.winnerId);
    });
    if (episode.allWinnersStarGiveaways.length) season.allWinnersPendingGiveaways = episode.allWinnersStarGiveaways.slice();
    episode.allWinnersBlockAllowed = episode.number <= season.allWinnersBlockCutoffEpisode;
    if (episode.allWinnersBlockAllowed && lipSync.winnerId) {
      const targetId = chooseAllWinnersBlockTarget(season, lipSync.winnerId, episode);
      episode.allWinnersBlockTargetId = targetId;
      episode.allWinnersTrackBlockedId = targetId;
      if (targetId) {
        season.allWinnersBlockCounts[targetId] = Number(season.allWinnersBlockCounts[targetId] || 0) + 1;
        season.allWinnersPendingBlockedId = targetId;
      }
    }
    episode.allWinnersStarCountsSnapshot = { ...season.allWinnersStarCounts };
    episode.resultText = `${displayName(season.contestants[lipSync.winnerId])}, you're a winner, baby!`;
  }

  function allWinnersRankByStars(season) {
    return season.castOrder.slice().sort((a, b) => {
      const starDiff = Number(season.allWinnersStarCounts[b] || 0) - Number(season.allWinnersStarCounts[a] || 0);
      if (starDiff) return starDiff;
      return trackRecordPower(season, b) - trackRecordPower(season, a) || (season.stats[b].popularity || 0) - (season.stats[a].popularity || 0);
    });
  }

  function chooseAllWinnersFinalists(season, episode) {
    const ranked = allWinnersRankByStars(season);
    const groups = [];
    ranked.forEach((id) => {
      const stars = Number(season.allWinnersStarCounts[id] || 0);
      let group = groups.find((entry) => entry.stars === stars);
      if (!group) {
        group = { stars, ids: [] };
        groups.push(group);
      }
      group.ids.push(id);
    });

    const finalists = [];
    let tieText = "";
    for (const group of groups) {
      if (finalists.length >= 4) break;
      const remaining = 4 - finalists.length;
      if (group.ids.length <= remaining) {
        finalists.push(...group.ids);
        continue;
      }

      const chooser = finalists[0] || group.ids[0];
      const chosen = [];
      let slotsToFill = remaining;
      if (!finalists.includes(chooser) && group.ids.includes(chooser) && slotsToFill > 0) {
        chosen.push(chooser);
        slotsToFill -= 1;
      }
      const relationshipChoices = group.ids
        .filter((id) => !chosen.includes(id))
        .map((id) => ({
          id,
          score: (season.relationships[pairKey(chooser, id)] || 0) * 6 + trackRecordPower(season, id) * 0.18 + (season.stats[id].popularity || 0) * 0.05 + randInt(-2, 2)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, slotsToFill)
        .map((entry) => entry.id);
      chosen.push(...relationshipChoices);
      finalists.push(...chosen.slice(0, remaining));

      const chosenNames = sentenceList(chosen.slice(0, remaining), season, false);
      const tiedNames = sentenceList(group.ids, season, false);
      tieText = finalists.includes(chooser) && group.ids.includes(chooser) && chosen.includes(chooser)
        ? `${fullDisplayName(season.contestants[chooser])} had the strongest tie-break claim, then chose ${sentenceList(chosen.filter((id) => id !== chooser), season, false)} from the tied contestants for the finale.`
        : `${fullDisplayName(season.contestants[chooser])} had the most Legendary Legend Stars and broke the tie by choosing ${chosenNames} from the tied contestants (${tiedNames}).`;
      break;
    }

    season.allWinnersFinalistIds = finalists.slice(0, 4);
    episode.allWinnersFinalistIds = season.allWinnersFinalistIds.slice();
    episode.allWinnersFinalistTieText = tieText;
  }


  function crownSmackdownGroups(ids) {
    const list = (ids || []).slice();
    if (list.length <= 3) return list.length ? [list] : [];
    const groups = [];
    let index = 0;
    while (index < list.length) {
      const remaining = list.length - index;
      if (remaining === 3) {
        groups.push(list.slice(index, index + 3));
        index += 3;
      } else if (remaining === 1 && groups.length) {
        groups[groups.length - 1].push(list[index]);
        index += 1;
      } else {
        groups.push(list.slice(index, index + 2));
        index += 2;
      }
    }
    return groups;
  }

  function createLipSyncSmackdown(season, ids, label) {
    const pool = shuffle(ids || []);
    const rounds = [];
    if (pool.length <= 1) return { lipSyncs: [], winnerId: pool[0] || null, finalLipSync: null };
    let current = pool.slice();
    let round = 1;
    while (current.length > 1 && round <= 8) {
      const next = [];
      const groups = crownSmackdownGroups(current);
      groups.forEach((group, index) => {
        if (group.length <= 1) { next.push(...group); return; }
        const isFinalRound = groups.length === 1;
        const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, group, `${label} ${isFinalRound ? "Final" : `Round ${round}`}`));
        lipSync.resultType = isFinalRound ? "all_winners_final_round" : "all_winners_smackdown_round";
        lipSync.roundNumber = round;
        lipSync.roundPosition = index + 1;
        lipSync.isFinalRound = isFinalRound;
        rounds.push(lipSync);
        next.push(lipSync.winnerId);
        group.forEach((id) => updateLipSyncStats(season, id, id === lipSync.winnerId));
      });
      current = next;
      round += 1;
    }
    return { lipSyncs: rounds, winnerId: current[0] || null, finalLipSync: rounds.at(-1) || null };
  }

  function createQoSDADHHLalaparuza(season, ids) {
    const pool = shuffle(ids || []);
    const rounds = [];
    if (pool.length <= 1) return { lipSyncs: [], winnerId: pool[0] || null, finalLipSync: null };
    let current = pool.slice();
    let round = 1;
    while (current.length > 1 && round <= 8) {
      const next = [];
      makeLalaparuzaGroups(current).forEach((group, index) => {
        if (group.length <= 1) { next.push(...group); return; }
        const isFinalRound = current.length === group.length;
        const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, group, `Queen of She Done Already Done Had Herses ${isFinalRound ? "Final Lip Sync" : `Round ${round}, Lip Sync ${index + 1}`}`));
        lipSync.resultType = isFinalRound ? "qosdadhh_final" : "qosdadhh_round";
        lipSync.roundNumber = round;
        lipSync.roundPosition = index + 1;
        lipSync.isFinalRound = isFinalRound;
        rounds.push(lipSync);
        next.push(lipSync.winnerId);
        group.forEach((id) => updateLipSyncStats(season, id, id === lipSync.winnerId));
      });
      current = next;
      round += 1;
    }
    return { lipSyncs: rounds, winnerId: current[0] || null, finalLipSync: rounds.at(-1) || null };
  }


  function allWinnersFinaleOutcomeInfo(finale, finalists, winnerIds) {
    const crown = finale?.allWinnersCrownSmackdown || {};
    const finalLipSync = crown.finalLipSync || finale?.lipSync || (crown.lipSyncs || []).at?.(-1) || null;
    const finalLipSyncIds = (finalLipSync?.ids || []).filter(Boolean);
    const winnerSet = new Set(winnerIds || []);
    const runnerUpIds = finalLipSyncIds.filter((id) => !winnerSet.has(id));
    const finalElimIds = (finalists || []).filter((id) => !winnerSet.has(id) && !runnerUpIds.includes(id));
    return { finalLipSync, finalLipSyncIds, runnerUpIds, finalElimIds };
  }

  function allWinnersHersesInfo(herses, id) {
    const lipSyncs = herses?.lipSyncs || [];
    if (!id || !lipSyncs.some((ls) => (ls.ids || []).includes(id)) && herses?.winnerId !== id) return null;
    if (herses?.winnerId === id) return { token: "SDADHH", display: "SDADHH", extraClasses: ["qosdadhh-winner-track"], orderRank: 1000 };
    const loss = lipSyncs.find((ls) => (ls.ids || []).includes(id) && ls.winnerId !== id);
    if (!loss) return { token: "LOST", display: "LOST", extraClasses: ["qosdadhh-lost-round1"], orderRank: 1 };
    const nonFinalRounds = lipSyncs.filter((ls) => !ls.isFinalRound).map((ls) => Number(ls.roundNumber || 1));
    const maxNonFinalRound = Math.max(1, ...nonFinalRounds);
    let className = "qosdadhh-lost-round1";
    let orderRank = Number(loss.roundNumber || 1);
    if (loss.isFinalRound) {
      className = "qosdadhh-lost-final";
      orderRank = 900;
    } else if (Number(loss.roundNumber || 1) >= Math.max(2, maxNonFinalRound)) {
      className = "qosdadhh-lost-round2";
      orderRank = 500 + Number(loss.roundNumber || 1);
    }
    return { token: "LOST", display: "LOST", extraClasses: [className], orderRank };
  }

  function allWinnersHersesPlacementOrder(season, finale) {
    const herses = finale?.allWinnersHersesSmackdown || null;
    if (!herses) return [];
    const ids = [];
    (herses.lipSyncs || []).forEach((ls) => (ls.ids || []).forEach((id) => { if (!ids.includes(id)) ids.push(id); }));
    if (herses.winnerId && !ids.includes(herses.winnerId)) ids.push(herses.winnerId);
    return ids
      .map((id) => ({ id, info: allWinnersHersesInfo(herses, id) }))
      .filter((entry) => entry.info)
      .sort((a, b) => (b.info.orderRank || 0) - (a.info.orderRank || 0) || fullDisplayName(season.contestants[a.id]).localeCompare(fullDisplayName(season.contestants[b.id])))
      .map((entry) => entry.id);
  }


  function simulateAllWinnersFinale(season) {
    const finalists = (season.allWinnersFinalistIds && season.allWinnersFinalistIds.length === 4) ? season.allWinnersFinalistIds.slice() : allWinnersRankByStars(season).slice(0, 4);
    season.allWinnersFinalistIds = finalists.slice();
    season.activeIds = finalists.slice();
    const finale = createEpisodeShell(season, { type: "finale", title: "Grand Finale", label: "Finale" });
    finale.allWinnersFinale = true;
    finale.activeStartIds = finalists.slice();
    finale.challenge = null;
    finale.runway = null;
    finale.finalePerformances = [];
    const missCon = calculateMissCongeniality(season);
    finale.missCongenialityIds = missCon.winners || [];
    finale.missCongenialityVotes = missCon.votes || {};
    finale.missCongenialityVoteDetails = missCon.details || [];
    finale.goldenBoot = calculateGoldenBoot(season);
    const nonFinalists = season.castOrder.filter((id) => !finalists.includes(id));
    const herses = createQoSDADHHLalaparuza(season, nonFinalists);
    const crown = createLipSyncSmackdown(season, finalists, "Lip Sync for the Crown");
    finale.allWinnersHersesSmackdown = herses;
    finale.allWinnersCrownSmackdown = crown;
    finale.extraLipSyncs = [];
    finale.lipSync = crown.finalLipSync || null;
    finale.winnerIds = [crown.winnerId].filter(Boolean);
    finale.top2Ids = crown.finalLipSync?.ids || finalists.slice(0, 2);
    const finaleOutcome = allWinnersFinaleOutcomeInfo(finale, finalists, finale.winnerIds);
    finale.eliminatedIds = finaleOutcome.finalElimIds.slice();
    finale.allWinnersQueenOfHersesId = herses.winnerId;
    season.allWinnersQueenOfHersesId = herses.winnerId;
    finale.resultText = `${sentenceList(finale.winnerIds, season, false)} wins the All Winners crown${herses.winnerId ? `, and ${fullDisplayName(season.contestants[herses.winnerId])} is Queen of She Done Already Done Had Herses` : ""}.`;
    season.seasonComplete = true;
    season.winnerId = finale.winnerIds[0];
    season.winnerIds = finale.winnerIds.slice();
    season.runnerUpIds = finaleOutcome.runnerUpIds.slice();
    season.castOrder.forEach((id) => {
      const isFinalist = finalists.includes(id);
      const isWinner = finale.winnerIds.includes(id);
      const isRunnerUp = finaleOutcome.runnerUpIds.includes(id);
      const isFinalElim = finaleOutcome.finalElimIds.includes(id);
      const hersesInfo = allWinnersHersesInfo(herses, id);
      let token = "GUEST";
      let display = "GUEST";
      const extraClasses = [];
      if (isWinner) {
        token = "WINNER";
        display = "WINNER";
      } else if (isRunnerUp) {
        token = "RU";
        display = "RU";
      } else if (isFinalElim) {
        token = "ELIM";
        display = "ELIM";
        extraClasses.push("finale-elim");
      } else if (hersesInfo) {
        token = hersesInfo.token;
        display = hersesInfo.display;
        extraClasses.push(...(hersesInfo.extraClasses || []));
      }
      season.stats[id].track.push({ label: "Finale", token, display, extraClasses });
      if (isWinner || isFinalist || hersesInfo?.token === "SDADHH") season.stats[id].popularity = clamp(Number(season.stats[id].popularity || 50) + (isWinner ? 12 : 5), 0, 100);
    });
    season.trackColumnLabels = season.trackColumnLabels || [];
    if (!season.trackColumnLabels.some((col) => col.label === "Finale")) season.trackColumnLabels.push({ label: "Finale", title: "Grand Finale", challengeType: "Finale" });
    season.episodes.push(finale);
  }


  function seasonWillUseTopFourRumixTrackColumn(season) {
    if (!isRegularFormat(season)) return false;
    if (Number(season.config?.finalistSize || 0) !== 4) return false;
    if (season.config?.finaleType === "lsftf" || season.config?.finaleType === "cunt_test") return false;
    if (season.config?.specialFameGames || season.config?.specialReunionLalaparuza) return false;
    return true;
  }


  function addTopFourRumixTrackColumn(season) {
    if (!seasonWillUseTopFourRumixTrackColumn(season)) return;
    if (season.topFourRumixColumnAdded) return;
    if (season.activeIds.length !== 4) return;
    const label = `Episode ${season.episodeCounter}`;
    season.activeIds.forEach((id) => {
      season.stats[id]?.track?.push({ label, token: "TOP4", display: "TOP4" });
      season.stats[id].popularity = clamp((season.stats[id].popularity || 0) + 2, 0, 100);
    });
    season.extraTrackColumns = season.extraTrackColumns || [];
    season.extraTrackColumns.push({ label, title: "Final Rumix Performance (Rumix)" });
    season.trackColumnLabels = season.trackColumnLabels || [];
    if (!season.trackColumnLabels.some((col) => col.label === label)) season.trackColumnLabels.push({ label, title: "Final Rumix Performance (Rumix)" });
    season.topFourRumixColumnAdded = true;
  }

  function tournamentEligibleChallengeTypes() {
    return ["ball", "acting", "rusical", "rumix", "design", "improv", "girlgroups", "dance", "roast"];
  }

  function tournamentPickChallengeTypes(season, count) {
    const available = tournamentEligibleChallengeTypes().filter((type) => getChallengeData().some((challenge) => challengeTypeKey(challenge.type) === type));
    return shuffle(available).slice(0, count);
  }

  function simulateTournamentSeason(season) {
    if (!season.tournamentBrackets?.length) {
      const count = Number(season.config.tournamentBracketCount || 2);
      const per = season.castOrder.length / count;
      season.tournamentBrackets = Array.from({ length: count }, (_, i) => ({ id: `bracket_${i + 1}`, name: `Bracket ${i + 1}`, color: ["#F749E4", "#FB8212", "#B039CE", "#FFE500", "#A1EA0E"][i] || "#F749E4", ids: season.castOrder.slice(i * per, (i + 1) * per), episodeLabels: [] }));
      season.tournamentPoints = Object.fromEntries(season.castOrder.map((id) => [id, 0]));
    }
    const merged = [];
    const eliminatedBeforeMerge = [];
    const bracketEpisodeCount = clamp(Number(season.config.tournamentBracketEpisodes || 3), 2, 5);
    season.tournamentBrackets.forEach((bracket) => {
      const types = tournamentPickChallengeTypes(season, bracketEpisodeCount);
      season.activeIds = bracket.ids.slice();
      bracket.episodeLabels = [];
      for (let i = 0; i < bracketEpisodeCount; i += 1) {
        simulateTournamentBracketEpisode(season, bracket, i + 1, types[i] || "acting");
        bracket.episodeLabels.push(season.episodes.at(-1)?.label);
      }
      const ranked = bracket.ids.slice().sort((a, b) => Number(season.tournamentPoints[b] || 0) - Number(season.tournamentPoints[a] || 0) || Math.random() - 0.5);
      const advancers = ranked.slice(0, Number(season.config.tournamentAdvancers || 2));
      const outs = bracket.ids.filter((id) => !advancers.includes(id));
      const finalEpisode = season.episodes.at(-1);
      finalEpisode.tournamentAdvancingIds = advancers.slice();
      finalEpisode.tournamentEliminatedIds = outs.slice();
      finalEpisode.pointCeremonyFinal = true;
      outs.forEach((id) => { if (!season.eliminatedIds.includes(id)) season.eliminatedIds.push(id); });
      merged.push(...advancers);
      eliminatedBeforeMerge.push(...outs);
      advancers.forEach((id) => addTournamentAdvancementToTrack(season, id, finalEpisode.label));
      outs.forEach((id) => addTournamentEliminationToTrack(season, id, finalEpisode.label));
    });
    season.activeIds = merged.slice();
    const preMergeWildcard = season.config.tournamentPreMergeWildcard ? runTournamentWildcard(season, "pre_merge", eliminatedBeforeMerge) : null;
    const mergeEpisodes = Number(season.config.tournamentMergeEpisodes || 2);
    for (let i = 0; i < mergeEpisodes && season.activeIds.length > 4; i += 1) {
      const forcedChallengeType = i === 0 ? "snatch_game" : (i === mergeEpisodes - 1 ? "talent_show" : "");
      simulateRegularEpisode(season, { forcedChallengeType });
      if (i === 0 && preMergeWildcard && season.episodes.at(-1)) season.episodes.at(-1).tournamentWildcard = preMergeWildcard;
      if (season.episodes.length > 60) break;
    }
    const preFinaleWildcard = season.config.tournamentPreFinaleWildcard ? runTournamentWildcard(season, "pre_finale", season.eliminatedIds.slice()) : null;
    simulateTournamentFinale(season);
    if (preFinaleWildcard && season.episodes.at(-1)) season.episodes.at(-1).tournamentWildcard = preFinaleWildcard;
  }

  function addTournamentAdvancementToTrack(season, id, label) {
    const track = season.stats[id]?.track || [];
    const entry = [...track].reverse().find((x) => x.label === label);
    if (entry) entry.display = `${entry.display || entry.token}<br/>+ADV`;
  }

  function addTournamentEliminationToTrack(season, id, label) {
    const track = season.stats[id]?.track || [];
    const entry = [...track].reverse().find((x) => x.label === label);
    if (!entry) return;
    const priorToken = String(entry.token || "");
    const combinedDisplay = (priorToken === "WIN" || priorToken === "TOP2") ? `${priorToken}+<br/>ELIM` : "ELIM";
    entry.token = "ELIM";
    entry.display = combinedDisplay;
    entry.extraClasses = (entry.extraClasses || []).filter((className) => !["double-elim", "tournament-elim-suffix"].includes(className));
    entry.eliminated = true;
  }

  function simulateTournamentBracketEpisode(season, bracket, bracketEpisodeNumber, forcedChallengeType) {
    season.activeIds = bracket.ids.slice();
    const episode = createEpisodeShell(season, { title: `${bracket.name} Episode ${bracketEpisodeNumber}`, label: `Episode ${season.episodeCounter}`, forcedChallengeType });
    episode.tournamentBracketId = bracket.id;
    episode.tournamentBracketName = bracket.name;
    episode.tournamentBracketColor = bracket.color;
    episode.challenge = pickChallenge(season, episode);
    episode.guestJudge = pickGuestJudge(episode.challenge.type);
    runMiniChallenge(season, episode);
    maybeCreateTeams(season, episode);
    runChallengeAndRunway(season, episode);
    assignTournamentBracketPlacements(season, episode);
    resolveTournamentTopTwoLipSync(season, episode);
    runUntucked(season, episode);
    runTournamentPointCeremony(season, episode, bracket.ids);
    finalizeTournamentBracketEpisode(season, episode);
  }

  function assignTournamentBracketPlacements(season, episode) {
    const ranked = rankedIds(episode);
    episode.top2Ids = ranked.slice(0, 2);
    episode.winnerIds = [];
    episode.highIds = [];
    episode.lowIds = [];
    episode.bottomIds = ranked.slice(2);
    episode.safeIds = [];
    episode.notes.push(`${episode.tournamentBracketName} competes for MVQ points. The Top 2 lip sync for the legacy, and everyone else votes in the Point Ceremony.`);
  }

  function resolveTournamentTopTwoLipSync(season, episode) {
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, episode.top2Ids, "Lip Sync For Your Legacy"));
    const winner = lipSync.winnerId;
    episode.lipSync = lipSync;
    episode.winnerIds = [winner];
    episode.top2Ids.forEach((id) => {
      addTournamentPoints(season, id, 2, episode, "Top 2 MVQ");
      updateLipSyncStats(season, id, id === winner);
    });
    if (winner) addTournamentPoints(season, winner, 1, episode, "Lip Sync Win Bonus");
    episode.resultText = `${displayName(season.contestants[winner])}, you're a winner, baby!`;
  }

  function addTournamentPoints(season, id, amount, episode, reason, voterId = null) {
    season.tournamentPoints[id] = Number(season.tournamentPoints[id] || 0) + Number(amount || 0);
    season.tournamentPointHistory.push({ label: episode.label, id, amount, reason, voterId, total: season.tournamentPoints[id] });
  }

  function tournamentPointVoteChoice(season, episode, voterId, eligibleIds) {
    const scoresById = new Map((episode.scores || []).map((score) => [score.id, score]));
    const topSet = new Set(episode.top2Ids || []);
    const lowestPoints = Math.min(...eligibleIds.map((id) => Number(season.tournamentPoints[id] || 0)));
    const criteria = Math.random();
    let pool = eligibleIds.slice();
    if (criteria < 0.50) pool = pool.filter((id) => !topSet.has(id));
    else if (criteria < 0.70) pool = pool.filter((id) => !topSet.has(id));
    else if (criteria >= 0.75) pool = pool.filter((id) => Number(season.tournamentPoints[id] || 0) === lowestPoints);
    if (!pool.length) pool = eligibleIds.slice();
    return pool.map((id) => {
      const rel = Number(season.relationships[pairKey(voterId, id)] || 0);
      const perf = Number(scoresById.get(id)?.total || 0);
      const lowBonus = Number(season.tournamentPoints[id] || 0) === lowestPoints ? 25 : 0;
      let score = randInt(-4, 4);
      if (criteria < 0.60) score += rel * 10;
      if (criteria >= 0.60 && criteria < 0.75) score += perf;
      if (criteria >= 0.75) score += lowBonus + randInt(0, 6);
      return { id, score };
    }).sort((a, b) => b.score - a.score)[0]?.id || eligibleIds[0];
  }

  function runTournamentPointCeremony(season, episode, bracketIds) {
    const voters = (episode.bottomIds || []).slice();
    const eligible = bracketIds.slice();
    const votes = voters.map((voterId) => {
      const choices = eligible.filter((id) => id !== voterId);
      const receiverId = tournamentPointVoteChoice(season, episode, voterId, choices);
      addTournamentPoints(season, receiverId, 1, episode, "Point Ceremony", voterId);
      return { voterId, receiverId };
    });
    episode.pointCeremony = { votes, totals: Object.fromEntries(bracketIds.map((id) => [id, Number(season.tournamentPoints[id] || 0)])) };
  }

  function finalizeTournamentBracketEpisode(season, episode) {
    if (episode.challenge?.id) season.usedChallengeIds.push(episode.challenge.id);
    if (episode.challenge?.type) season.usedChallengeTypes.push(challengeTypeKey(episode.challenge.type));
    if (episode.runway?.id && !episode.runway.challengeRunway) season.usedRunwayIds.push(episode.runway.id);
    generateHiddenNarrativeEvents(season, episode);
    updateEpisodeStats(season, episode);
    assignEpisodeEdgic(season, episode);
    season.episodes.push(episode);
    if (!season.trackColumnLabels.some((col) => col.label === episode.label)) {
      const challengeType = episode.challenge ? challengeTypeLabel(episode.challenge.type) : "";
      season.trackColumnLabels.push({
        label: episode.label,
        title: episode.challenge ? `${episode.challenge.name} (${challengeType})` : episode.label,
        challengeType
      });
    }
    season.episodeCounter += 1;
  }

  function runTournamentWildcard(season, stage, poolIds) {
    const pool = [...new Set(poolIds || [])].filter((id) => season.eliminatedIds.includes(id));
    if (pool.length < 3) return null;
    const candidates = shuffle(pool.slice().sort((a, b) => Number(season.tournamentPoints[b] || 0) - Number(season.tournamentPoints[a] || 0))).slice(0, 3);
    const returnedId = randomItem(candidates);
    season.eliminatedIds = season.eliminatedIds.filter((id) => id !== returnedId);
    if (!season.activeIds.includes(returnedId)) season.activeIds.push(returnedId);
    const entry = { stage, candidates, returnedId, revealed: false };
    season.tournamentWildcardReturns.push(entry);
    if (stage === "pre_merge") season.tournamentReturnedPendingIds = [...new Set([...(season.tournamentReturnedPendingIds || []), returnedId])];
    if (stage === "pre_finale") season.stats[returnedId].track.push({ label: "Finale", token: "RTRN", display: "RTRN" });
    return entry;
  }

  function simulateTournamentFinale(season) {
    const finale = createEpisodeShell(season, { type: "finale", title: "Grand Finale", label: "Finale" });
    const finalists = season.activeIds.slice();
    finale.activeStartIds = finalists.slice();
    finale.challenge = null;
    finale.runway = null;
    finale.finalePerformances = [];
    finale.missCongenialityIds = [];
    finale.goldenBoot = null;
    finale.lsftcFinale = true;
    const crown = createLipSyncSmackdown(season, finalists, "Lip Sync for the Crown");
    finale.allWinnersCrownSmackdown = crown;
    finale.extraLipSyncs = crown.lipSyncs || [];
    finale.lipSync = crown.finalLipSync || null;
    finale.winnerIds = [crown.winnerId].filter(Boolean);
    finale.top2Ids = crown.finalLipSync?.ids || finalists.slice(0, 2);
    finale.eliminatedIds = finalists.filter((id) => !finale.winnerIds.includes(id) && !(finale.top2Ids || []).includes(id));
    season.seasonComplete = true;
    season.winnerId = finale.winnerIds[0];
    season.winnerIds = finale.winnerIds.slice();
    season.runnerUpIds = (finale.top2Ids || []).filter((id) => !finale.winnerIds.includes(id));
    season.castOrder.forEach((id) => {
      const isFinalist = finalists.includes(id);
      const wasReturned = (season.tournamentWildcardReturns || []).some((entry) => entry.stage === "pre_finale" && entry.returnedId === id);
      let token = "GUEST";
      let display = "GUEST";
      const extraClasses = [];
      if (isFinalist) {
        if ((finale.winnerIds || []).includes(id)) { token = "WINNER"; display = "WINNER"; }
        else if ((season.runnerUpIds || []).includes(id)) { token = "RU"; display = "RU"; }
        else { token = "ELIM"; display = "ELIM"; extraClasses.push("finale-elim"); }
      }
      if (wasReturned && isFinalist) display = `RTRN+<br/>${display}`;
      season.stats[id].track.push({ label: "Finale", token, display, extraClasses });
    });
    finale.resultText = `The Next Drag Superstar is... ${sentenceList(finale.winnerIds, season, false)}!`;
    if (!season.trackColumnLabels.some((col) => col.label === "Finale")) season.trackColumnLabels.push({ label: "Finale", title: "Grand Finale", challengeType: "Finale" });
    season.episodes.push(finale);
  }


  function porkchopBattleResultLine(season, lipSync) {
    const winnerName = fullDisplayName(season.contestants[lipSync.winnerId] || {});
    const loserIds = (lipSync.ids || []).filter((id) => id !== lipSync.winnerId);
    const loserLines = loserIds.map((id) => `${fullDisplayName(season.contestants[id] || {})}, I'm sorry, my dear, but you're getting the porkchop. Now, sashay away...`);
    return [`${winnerName}, shantay you stay.`, ...loserLines].join(" ");
  }

  function createPorkchopLoadingDock(season, episode, loserIds) {
    const eligible = (loserIds || []).filter(Boolean);
    if (eligible.length < 2) return null;
    const lipScore = {};
    (episode.extraLipSyncs || []).forEach((ls) => {
      (ls.performances || []).forEach((perf) => { lipScore[perf.id] = Number(perf.score || 0); });
    });
    const votes = eligible.map((voterId) => {
      const candidates = eligible.filter((id) => id !== voterId);
      const ranked = candidates.map((id) => {
        const relationship = Number(season.relationships[pairKey(voterId, id)] || 0);
        const score = Number(lipScore[id] || 0) + relationship * 2 + randInt(-3, 3);
        return { id, score, lipScore: Number(lipScore[id] || 0), lipsyncSkill: Number(season.contestants[id]?.skills?.lipsync || 0) };
      }).sort((a, b) => a.score - b.score || a.lipScore - b.lipScore || a.lipsyncSkill - b.lipsyncSkill || String(a.id).localeCompare(String(b.id)));
      return { voterId, votedForId: ranked[0]?.id || candidates[0] || null };
    }).filter((vote) => vote.votedForId);
    const totals = Object.fromEntries(eligible.map((id) => [id, 0]));
    votes.forEach((vote) => { totals[vote.votedForId] = Number(totals[vote.votedForId] || 0) + 1; });
    const maxVotes = Math.max(...eligible.map((id) => Number(totals[id] || 0)));
    const tied = eligible.filter((id) => Number(totals[id] || 0) === maxVotes);
    const choppedId = tied.slice().sort((a, b) =>
      Number(lipScore[a] || 0) - Number(lipScore[b] || 0) ||
      Number(season.contestants[a]?.skills?.lipsync || 0) - Number(season.contestants[b]?.skills?.lipsync || 0) ||
      String(a).localeCompare(String(b))
    )[0] || tied[0] || eligible[0];
    return { votes, totals, choppedId };
  }

  function simulatePorkchopPremiere(season) {
    const originalActive = season.activeIds.slice();
    const episode = createEpisodeShell(season, {
      type: "porkchop_premiere",
      premiere: true,
      label: "Episode 1",
      noMiniChallenge: true,
      noGuestJudge: true
    });
    episode.title = "Episode 1";
    episode.challenge = {
      id: "porkchop_premiere_lip_syncs",
      name: "Porkchop Lip Syncs",
      type: "lip_sync",
      repeatable: false,
      teamMode: "solo",
      requiredSkills: { lipsync: 1 }
    };
    episode.noImmunityAward = true;

    const shuffledIds = shuffle(originalActive);
    const battles = [];
    const winnerIds = [];
    const loserIds = [];
    let round = 1;
    while (shuffledIds.length) {
      let ids;
      if (shuffledIds.length === 3) ids = shuffledIds.splice(0, 3);
      else ids = shuffledIds.splice(0, Math.min(2, shuffledIds.length));
      if (ids.length < 2) {
        if (ids[0]) winnerIds.push(ids[0]);
        continue;
      }
      const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, ids, `Porkchop Lip Sync #${round}`));
      lipSync.resultType = "porkchop_battle";
      lipSync.roundNumber = round;
      lipSync.roundPosition = round;
      lipSync.roundResultText = porkchopBattleResultLine(season, lipSync);
      lipSync.resultTextLine = lipSync.roundResultText;
      battles.push(lipSync);
      winnerIds.push(lipSync.winnerId);
      (lipSync.ids || []).filter((id) => id !== lipSync.winnerId).forEach((id) => loserIds.push(id));
      (lipSync.ids || []).forEach((id) => updateLipSyncStats(season, id, id === lipSync.winnerId));
      round += 1;
    }

    episode.extraLipSyncs = battles;
    const loadingDock = (originalActive.length % 2 === 1) ? createPorkchopLoadingDock(season, episode, loserIds) : null;
    const choppedId = loadingDock?.choppedId || null;
    const winnersGroup = [...winnerIds, ...(choppedId ? [choppedId] : [])].filter(Boolean);
    const losersGroup = loserIds.filter((id) => id !== choppedId);

    episode.porkchopPremiere = {
      winnerIds: winnerIds.slice(),
      loserIds: loserIds.slice(),
      choppedId,
      winnersGroup,
      losersGroup,
      loadingDock
    };
    episode.winnerIds = winnerIds.slice();
    episode.safeIds = loserIds.slice();
    episode.resultText = choppedId ? `${fullDisplayName(season.contestants[choppedId] || {})} receives the chop in the Porkchop Loading Dock.` : "The Porkchop lip sync battles are complete.";
    finalizeEpisode(season, episode);

    season.activeIds = winnersGroup.slice();
    simulateRegularEpisode(season, {
      premiere: true,
      splitGroup: "Porkchop Winners",
      forcedChallengeType: "rumix",
      specialPremiere: "porkchop_top2",
      label: "Episode 2"
    });

    season.activeIds = losersGroup.slice();
    simulateRegularEpisode(season, {
      premiere: true,
      splitGroup: "Porkchop Group",
      forcedChallengeType: "rumix",
      specialPremiere: "porkchop_top2",
      label: "Episode 3"
    });

    season.activeIds = originalActive.slice();
    season.episodeCounter = Math.max(season.episodeCounter, 4);
  }


  function simulatePremiere(season) {
    const selectedPremiereChallengeType = season.premiereChallengeType || season.config?.premiereChallengeType || "";
    switch (season.config.premiereType) {
      case "slayers":
        simulateRegularEpisode(season, { premiere: true, forcedChallengeType: selectedPremiereChallengeType, specialPremiere: "slayers", label: "Episode 1" });
        break;
      case "non_elim_top2":
        simulateRegularEpisode(season, { premiere: true, forcedChallengeType: selectedPremiereChallengeType, specialPremiere: "non_elim_top2", label: "Episode 1" });
        break;
      case "late_entry":
        simulateRegularEpisode(season, { premiere: true, forcedChallengeType: selectedPremiereChallengeType, specialPremiere: "late_entry", label: "Episode 1" });
        if (season.lateEntryId && !season.activeIds.includes(season.lateEntryId)) {
          season.activeIds.push(season.lateEntryId);
          addReturnEpisodeNote(season, season.lateEntryId, "Late Entry");
        }
        break;
      case "uk3":
        simulateRegularEpisode(season, { premiere: true, forcedChallengeType: selectedPremiereChallengeType, specialPremiere: "uk3", label: "Episode 1" });
        break;
      case "split_s6":
        simulateSplitPremiere(season, "s6");
        break;
      case "split_s12":
        simulateSplitPremiere(season, "s12");
        break;
      case "rate_a_queen_s16":
        simulateSplitPremiere(season, "s16");
        break;
      case "rate_a_queen_s17":
        simulateSplitPremiere(season, "s17");
        break;
      case "split_s14":
        simulateSplitPremiere(season, "s14");
        break;
      case "porkchop":
        simulatePorkchopPremiere(season);
        break;
      case "regular":
      default:
        simulateRegularEpisode(season, { premiere: true, forcedChallengeType: selectedPremiereChallengeType, label: "Episode 1" });
        break;
    }
  }

  function addReturnEpisodeNote(season, id, reason) {
    season.stats[id].track.push({ label: "Entry", token: "RTRN" });
    season.stats[id].popularity = clamp(Number(season.stats[id].popularity || 50) + 3, 0, 100);
    season.notes = season.notes || [];
    season.notes.push(`${displayName(season.contestants[id])} enters the competition as a ${reason}.`);
  }

  function simulateSplitPremiere(season, style) {
    const originalActive = season.activeIds.slice();
    const firstGroup = (season.splitPremiereFirstGroupIds || []).filter((id) => originalActive.includes(id));
    const half = splitPremiereFirstGroupSize(originalActive.length);
    const groupA = firstGroup.length === half ? firstGroup.slice() : shuffle(originalActive).slice(0, half);
    const firstSet = new Set(groupA);
    const groupB = originalActive.filter((id) => !firstSet.has(id));
    if (style === "s17") {
      simulateRateAQueenS17Premiere(season, originalActive, groupA, groupB);
      return;
    }
    const sharedType = style === "s16"
      ? "talent_show"
      : (season.premiereChallengeType || season.config?.premiereChallengeType || pickSplitPremiereType(season, groupA, groupB));
    const specialPremiere = style === "s16" ? "rate_a_queen_split" : (style === "s12" ? "split_top2" : "split_elim");

    season.activeIds = groupA;
    simulateRegularEpisode(season, { premiere: true, splitGroup: "Group One", forcedChallengeType: sharedType, specialPremiere, label: "Episode 1" });
    const outA = season.episodes.at(-1)?.eliminatedIds || [];

    season.activeIds = groupB;
    simulateRegularEpisode(season, { premiere: true, splitGroup: "Group Two", forcedChallengeType: sharedType, specialPremiere, label: "Episode 2" });
    const outB = season.episodes.at(-1)?.eliminatedIds || [];

    const eliminatedNow = new Set([...outA, ...outB]);
    if (style === "s14") {
      season.returningIds = [...eliminatedNow];
      season.activeIds = originalActive.filter((id) => !eliminatedNow.has(id));
    } else if (style === "s12" || style === "s16") {
      season.activeIds = originalActive.slice();
    } else {
      season.activeIds = originalActive.filter((id) => !eliminatedNow.has(id));
    }
    season.episodeCounter = 3;
  }

  function simulateRateAQueenS17Premiere(season, originalActive, groupA, groupB) {
    season.activeIds = originalActive.slice();
    simulateRegularEpisode(season, {
      premiere: true,
      splitGroup: "Group One",
      forcedChallengeType: "talent_show",
      specialPremiere: "rate_a_queen_s17_split",
      label: "Episode 1",
      competingIds: groupA.slice(),
      runwayParticipantIds: originalActive.slice(),
      rateAQueenTargetIds: groupA.slice(),
      rateAQueenVoterIds: groupB.slice(),
      runOnlyIds: groupB.slice(),
      rateAQueenS17FinalPremiere: false
    });
    season.rateAQueenS17FirstBottomId = season.episodes.at(-1)?.bottomIds?.[0] || null;

    season.activeIds = originalActive.slice();
    simulateRegularEpisode(season, {
      premiere: true,
      splitGroup: "Group Two",
      forcedChallengeType: "talent_show",
      specialPremiere: "rate_a_queen_s17_split",
      label: "Episode 2",
      competingIds: groupB.slice(),
      runwayParticipantIds: originalActive.slice(),
      rateAQueenTargetIds: groupB.slice(),
      rateAQueenVoterIds: groupA.slice(),
      runOnlyIds: groupA.slice(),
      rateAQueenS17FinalPremiere: true
    });

    const eliminatedNow = new Set(season.episodes.at(-1)?.eliminatedIds || []);
    season.activeIds = originalActive.filter((id) => !eliminatedNow.has(id));
    season.episodeCounter = 3;
  }

  function pickSplitPremiereType(season, groupA, groupB) {
    const premiereTypes = ["runway", "design", "talent_show", "rumix"];
    const validFor = (group) => new Set(getChallengeData().filter((challenge) => {
      const type = challengeTypeKey(challenge.type);
      return premiereTypes.includes(type) && canUseTeamChallenge(challenge, group.length);
    }).map((challenge) => challengeTypeKey(challenge.type)));
    const a = validFor(groupA);
    const b = validFor(groupB);
    const common = premiereTypes.filter((type) => a.has(type) && b.has(type));
    return common.length ? randomItem(common) : randomItem(premiereTypes);
  }

  function maybeReturnS14Queens(season) {
    if (season.config.premiereType !== "split_s14" || !season.returningIds.length) return [];
    if (season.episodeCounter !== 3) return [];
    const ids = season.returningIds.slice();
    season.activeIds.push(...ids);
    season.eliminatedIds = season.eliminatedIds.filter((id) => !ids.includes(id));
    season.returningIds = [];
    ids.forEach((id) => season.stats[id].track.push({ label: `Episode ${season.episodeCounter}`, token: "RTRN" }));
    return ids;
  }

  function consumeTournamentPendingReturns(season) {
    const ids = (season.tournamentReturnedPendingIds || []).filter((id) => season.activeIds.includes(id));
    season.tournamentReturnedPendingIds = [];
    return ids;
  }

  function createEpisodeShell(season, options = {}) {
    const label = options.label || `Episode ${season.episodeCounter}`;
    return {
      number: season.episodeCounter,
      label,
      title: options.title || label,
      type: options.type || "competitive",
      premiere: !!options.premiere,
      splitGroup: options.splitGroup || "",
      specialPremiere: options.specialPremiere || "",
      forcedChallengeType: options.forcedChallengeType || "",
      competingIds: Array.isArray(options.competingIds) ? options.competingIds.slice() : [],
      runwayParticipantIds: Array.isArray(options.runwayParticipantIds) ? options.runwayParticipantIds.slice() : [],
      rateAQueenTargetIds: Array.isArray(options.rateAQueenTargetIds) ? options.rateAQueenTargetIds.slice() : [],
      rateAQueenVoterIds: Array.isArray(options.rateAQueenVoterIds) ? options.rateAQueenVoterIds.slice() : [],
      runOnlyIds: Array.isArray(options.runOnlyIds) ? options.runOnlyIds.slice() : [],
      rateAQueenS17FinalPremiere: !!options.rateAQueenS17FinalPremiere,
      midSeasonRateAQueen: options.midSeasonRateAQueen ? clone(options.midSeasonRateAQueen) : null,
      hideJudging: !!options.hideJudging,
      noMiniChallenge: !!options.noMiniChallenge,
      noGuestJudge: !!options.noGuestJudge,
      activeStartIds: season.activeIds.slice(),
      eliminatedStartIds: season.eliminatedIds.slice(),
      returnedIds: [...maybeReturnS14Queens(season), ...consumeTournamentPendingReturns(season), ...(Array.isArray(options.returnedIds) ? options.returnedIds : [])].filter(Boolean),
      comeback: options.comeback || null,
      readingComeback: options.readingComeback || null,
      comebackParticipantIds: Array.isArray(options.comebackParticipantIds) ? options.comebackParticipantIds.slice() : [],
      comebackPlacements: options.comebackPlacements || {},
      guestJudge: null,
      miniChallenge: null,
      miniWinnerIds: [],
      teams: null,
      challenge: null,
      runway: null,
      scores: [],
      maxiGroups: {},
      runwayGroups: {},
      specialPerformanceChoices: [],
      legacyLipsticks: [],
      rumocracyVotes: [],
      rateAQueenBallots: [],
      rateAQueenResults: [],
      goldenBeaverBottomIds: [],
      goldenBeaverSavedId: null,
      goldenBeaverSaveReason: "",
      goldenBeaverSaveRevealed: false,
      allWinnersEpisode: !!options.allWinnersEpisode,
      allWinnersBlockedId: null,
      allWinnersTrackBlockedId: null,
      allWinnersBlockTargetId: null,
      allWinnersBlockRevealed: false,
      allWinnersBlockAllowed: false,
      allWinnersStarAwards: [],
      allWinnersStarGiveaways: [],
      allWinnersStarGiveawaysAtStart: [],
      allWinnersStarCountsSnapshot: {},
      allWinnersFinalistIds: [],
      allWinnersFinalistTieText: "",
      allWinnersQueenOfHersesId: null,
      legacyEliminationChoiceId: null,
      assassinEliminationChoiceId: null,
      assassinWinnerChoiceId: null,
      assassinGroupChoiceId: null,
      assassinGroupTieBrokenByTop: false,
      assassinTopLostId: null,
      rupaulManual: {},
      safeIds: [],
      highIds: [],
      lowIds: [],
      bottomIds: [],
      winnerIds: [],
      top2Ids: [],
      eliminatedIds: [],
      savedIds: [],
      lipSync: null,
      extraLipSyncs: [],
      resultText: "",
      resultsRevealed: false,
      eliminationRevealed: false,
      judgingText: [],
      notes: [],
      untuckedEvents: [],
      hiddenNarrativeEvents: [],
      editMetrics: {},
      spv: [],
      placementFairness: {},
      popularityReactions: {},
      placements: {},
      immunityAwardedId: null,
      immunityProtectedIds: [],
      edgic: {},
      pointCeremony: null,
      tournamentAdvancingIds: [],
      tournamentEliminatedIds: [],
      pointCeremonyFinal: false,
      legacyThreeWayLipSync: false,
      legacyMassLipSync: false,
      unplannedExit: null,
      departureIds: []
    };
  }

  function simulateRegularEpisode(season, options = {}) {
    const episode = createEpisodeShell(season, options);
    maybeApplyPreChallengeUnplannedExit(season, episode);
    episode.challenge = pickChallenge(season, episode);
    if (episode.premiere && episode.challenge?.id && season.premiereChallengeType) {
      season.premiereChallengeIds = season.premiereChallengeIds || [];
      if (!season.premiereChallengeIds.includes(episode.challenge.id)) season.premiereChallengeIds.push(episode.challenge.id);
    }
    episode.guestJudge = episode.noGuestJudge ? null : pickGuestJudge(episode.challenge.type);
    if (episode.readingComeback) runReadingComebackMiniChallenge(season, episode);
    else if (!episode.noMiniChallenge) runMiniChallenge(season, episode);
    maybeCreateTeams(season, episode);
    runChallengeAndRunway(season, episode);
    assignPlacements(season, episode);
    enforceImmunitySafety(season, episode);
    resolveGoldenBeaverSave(season, episode);
    buildLuckyCowVoting(season, episode);
    resolveLipSyncsAndEliminations(season, episode);
    runUntucked(season, episode);
    addFameGamesRunwayToUntucked(season, episode);
    finalizeEpisode(season, episode);
  }

  function pickChallenge(season, episode) {
    const all = getChallengeData();
    let baseValid = all.filter((challenge) => isChallengeValid(season, episode, challenge));
    if (episode.tournamentBracketId) baseValid = baseValid.filter((challenge) => tournamentEligibleChallengeTypes().includes(challengeTypeKey(challenge.type)));
    if (episode.forcedChallengeType) {
      const forced = baseValid.filter((challenge) => challengeTypeKey(challenge.type) === episode.forcedChallengeType);
      if (forced.length) {
        const unusedForced = episode.premiere && episode.splitGroup
          ? forced.filter((challenge) => !(season.premiereChallengeIds || []).includes(challenge.id))
          : forced;
        if (unusedForced.length) baseValid = unusedForced;
        else if (episode.premiere && episode.splitGroup) {
          baseValid = forced.map((challenge, index) => ({
            ...challenge,
            id: `${challenge.id}_split_${episode.number}_${index + 1}`,
            name: `${challenge.name} — ${episode.splitGroup}`
          }));
        } else baseValid = forced;
      }
    }
    const snatchUsed = season.usedChallengeTypes.includes("snatch_game");
    const snatchCandidates = baseValid.filter((challenge) => challengeTypeKey(challenge.type) === "snatch_game");
    if (!snatchUsed && snatchCandidates.length && !episode.premiere && episode.number > 2) {
      const count = season.activeIds.length;
      if (count <= 10 && count >= 6) return clone(randomItem(snatchCandidates));
    }

    const makeoverUsed = hasChallengeTypeInSeason(season, "makeover");
    const makeoverCandidates = baseValid.filter((challenge) => challengeTypeKey(challenge.type) === "makeover");
    if (!makeoverUsed && makeoverCandidates.length && !episode.premiere && makeoverWindowActive(season)) {
      const count = season.activeIds.length;
      const chance = count >= 8 ? 0.38
        : count === 7 ? 0.52
          : count === 6 ? 0.72
            : count === 5 ? 0.88
              : 1;
      if (Math.random() < chance) return clone(randomItem(makeoverCandidates));
    }

    const spaced = baseValid.filter((challenge) => isChallengeFamilySpaced(season, challenge.type));
    const valid = spaced.length ? spaced : baseValid;
    const emergency = all.filter((challenge) => {
      const type = challengeTypeKey(challenge.type);
      return !LOOK_BASED_CHALLENGE_TYPES.has(type)
        && type !== "talent_show"
        && type !== season.usedChallengeTypes.at(-1)
        && canUseTeamChallenge(challenge, season.activeIds.length);
    });
    const pool = valid.length ? valid : (baseValid.length ? baseValid : emergency);
    return clone(weightedChallengePick(season, episode, pool.length ? pool : all));
  }

  function weightedChallengePick(season, episode, pool) {
    const recentTypes = (season.usedChallengeTypes || []).slice(-4).map(challengeTypeKey);
    const recentFamilies = recentTypes.map(challengeFamily);
    const recentFashionCount = recentFamilies.filter((family) => family === "fashion").length;
    const totalLookCount = lookBasedChallengeCount(season);
    const hasRecentTeam = (season.episodes || []).slice(-3).some((ep) => ["groups", "pairs"].includes(ep?.teams?.mode));
    const weighted = (pool || []).map((challenge) => {
      const type = challengeTypeKey(challenge.type);
      const family = challengeFamily(type);
      let weight = 1;
      if (recentTypes.includes(type)) weight *= 0.13;
      if (recentTypes.at(-1) === type) weight *= 0.04;
      if (recentFamilies.includes(family)) weight *= family === "fashion" ? 0.14 : 0.38;
      if (family === "fashion") weight *= 0.46;
      if (family === "fashion" && recentFashionCount >= 1) weight *= 0.16;
      if (family === "fashion" && recentFashionCount >= 2) weight *= 0.035;
      if (family === "fashion" && totalLookCount >= 2) weight *= 0.16;
      if (type === "design") weight *= 0.46;
      if (type === "ball") weight *= 0.58;
      if (type === "makeover") weight *= makeoverWindowActive(season, challenge, episode) && !hasChallengeTypeInSeason(season, "makeover") ? 8.5 : 0.78;
      if (type === "runway" && !episode.premiere) weight *= 0.035;
      if (["acting", "improv", "snatch_game", "roast", "rusical", "girlgroups", "dance"].includes(type)) weight *= 1.35;
      if (type === "talent_show" && !episode.premiere && !isFormatRequiredTalentShow(episode)) weight *= 0.025;
      if (["groups", "pairs"].includes(challenge.teamMode) && canUseTeamChallenge(challenge, season.activeIds.length)) {
        weight *= hasRecentTeam ? 0.75 : 1.65;
        if (challenge.teamMode === "pairs") weight *= 1.15;
      }
      if (episode.premiere && ["runway", "design", "talent_show", "rumix"].includes(type)) weight *= 1.1;
      if (season.activeIds.length === season.config.finalistSize + 1 && ["ball", "makeover"].includes(type)) weight *= 0.72;
      return { challenge, weight: Math.max(0.0025, weight) };
    });
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) return item.challenge;
    }
    return weighted[0]?.challenge || pool[0];
  }

  function isChallengeValid(season, episode, challenge) {
    const activeCount = season.activeIds.length;
    const type = challengeTypeKey(challenge.type);
    const isPremiere = episode.premiere;
    const isPreFinale = activeCount === season.config.finalistSize + 1;
    const isEpisodeBeforeTopFourColumn = isPreFinale && seasonWillUseTopFourRumixTrackColumn(season);
    const forcedType = challengeTypeKey(episode.forcedChallengeType);

    const forcedSplitRepeat = !!(episode.forcedChallengeType && episode.premiere && type === forcedType);
    const forcedAllWinners = !!(isAllWinnersFormat(season) && episode.forcedChallengeType && type === forcedType);
    if (forcedAllWinners) return canUseTeamChallenge(challenge, activeCount);
    if (type === "makeover" && makeoverReservedForConjoinedTwins(season) && episode?.comeback?.format !== "conjoined_twins") return false;
    if (!forcedSplitRepeat && (!challenge.repeatable || ONE_TIME_CHALLENGE_TYPES.has(type)) && season.usedChallengeTypes.includes(type)) return false;
    if (!forcedSplitRepeat && season.usedChallengeTypes.at(-1) === type) return false;
    if (!forcedSplitRepeat && season.usedChallengeIds.includes(challenge.id)) return false;
    if (!canUseTeamChallenge(challenge, activeCount)) return false;

    const lookCount = lookBasedChallengeCount(season);
    const lookLimit = maxLookBasedChallengesForSeason(season);
    const forcedPremiereType = !!(episode.premiere && forcedType === type);
    if (!forcedPremiereType && LOOK_BASED_CHALLENGE_TYPES.has(type) && lookCount >= lookLimit) return false;
    if (!forcedPremiereType && type === "design" && challengeTypeCount(season, "design") >= 2) return false;
    const makeoverUsed = hasChallengeTypeInSeason(season, "makeover");
    if (!forcedPremiereType && LOOK_BASED_CHALLENGE_TYPES.has(type) && type !== "makeover" && !makeoverUsed && lookCount >= Math.max(0, lookLimit - 1)) return false;
    if (isEpisodeBeforeTopFourColumn && ["rumix", "girlgroups"].includes(type)) return false;

    if (episode.forcedChallengeType === type || forcedType === type) return canUseTeamChallenge(challenge, activeCount);
    if (isPremiere) {
      if (type === "talent_show") return false;
      return ["runway", "design", "rumix"].includes(type) || challenge.premiereEligible;
    }

    if (type === "talent_show") {
      if (season.config.specialFameGames && !episode.fameGamesEpisode) return false;
      if (isFormatRequiredTalentShow(episode)) return true;
      const nearEnd = episode.number >= 4 && activeCount <= Math.max(6, Number(season.config.finalistSize || 4) + 3);
      if (!nearEnd) return false;
    }

    if (type === "runway") {
      if (hasChallengeTypeInSeason(season, "ball")) return false;
      if (hasNonPremiereRunway(season)) return false;
      const ballSlotWindow = episode.number > 2 && activeCount <= 8 && activeCount >= Number(season.config.finalistSize || 4) + 1;
      if (!ballSlotWindow) return false;
    }

    if (type === "ball" && hasNonPremiereRunway(season)) return false;
    if (type === "snatch_game") return episode.number > 2 && activeCount <= 10 && activeCount >= 6;
    if (isPreFinale) return type !== "runway" || challenge.penultimateEligible;
    if (type === "makeover") return makeoverWindowActive(season, challenge, episode);
    return true;
  }

  function canUseTeamChallenge(challenge, activeCount) {
    if (challenge.teamMode === "solo") return true;
    if (challenge.teamMode === "pairs") return activeCount % 2 === 0;
    if (challenge.teamMode === "groups") return activeCount >= 4;
    return true;
  }


  function eliminationFormat(season = state.season) {
    return season?.config?.eliminationFormat || state.config.eliminationFormat || "regular";
  }

  function isLegacyFormat(season = state.season) {
    return eliminationFormat(season) === "legacy";
  }

  function isAssassinFormat(season = state.season) {
    return eliminationFormat(season) === "assassin";
  }

  function isRegularFormat(season = state.season) {
    return eliminationFormat(season) === "regular";
  }

  function isGoldenBeaverFormat(season = state.season) {
    return eliminationFormat(season) === "golden_beaver";
  }

  function isAllWinnersFormat(season = state.season) {
    return eliminationFormat(season) === "all_winners";
  }

  function isTournamentFormat(season = state.season) {
    return eliminationFormat(season) === "tournament";
  }

  function isTeamsFormat(season = state.season) {
    return eliminationFormat(season) === "teams";
  }

  function setTeamPairs(season, pairSlots) {
    const pairs = (pairSlots || []).filter((ids) => ids.length === 2 && ids.every(Boolean)).map((ids, index) => ({
      id: `team_pair_${index + 1}`,
      name: `Pair ${index + 1}`,
      ids: ids.slice()
    }));
    season.teamPairs = pairs;
    season.teamPairById = {};
    pairs.forEach((pair) => pair.ids.forEach((id) => { season.teamPairById[id] = pair.id; }));
    season.teamShemergencyUsedPairs = [];
  }

  function initializeTeamPairs(season) {
    const shuffled = shuffle(season.castOrder || season.activeIds || []);
    setTeamPairs(season, chunk(shuffled, 2));
  }

  async function chooseTeamPairs(season) {
    const ids = (season.castOrder || []).slice();
    const pairCount = Math.floor(ids.length / 2);
    const emptySlots = () => Array.from({ length: pairCount }, () => ["", ""]);
    let slots = emptySlots();
    const allSelected = () => slots.flat().filter(Boolean);
    const isValid = () => {
      const flat = allSelected();
      return flat.length === ids.length && new Set(flat).size === ids.length && slots.every((pair) => pair.length === 2 && pair.every(Boolean));
    };
    const optionList = (currentId) => ids.map((id) => {
      const contestant = season.contestants[id] || { id };
      const usedElsewhere = id !== currentId && allSelected().includes(id);
      return `<option value="${escapeHtml(id)}" ${id === currentId ? "selected" : ""} ${usedElsewhere ? "disabled" : ""}>${escapeHtml(fullDisplayName(contestant))}</option>`;
    }).join("");
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "choice-modal-backdrop tournament-bracket-backdrop team-pair-backdrop";
      const render = () => {
        overlay.innerHTML = `
          <div class="choice-modal-card tournament-bracket-card tournament-bracket-card-compact team-pair-card" role="dialog" aria-modal="true">
            <div class="tournament-bracket-titlebar">
              <div>
                <p class="eyebrow">Teams</p>
                <h3>Set Season Pairs</h3>
              </div>
              <div class="tournament-bracket-toolbar">
                <button class="secondary-btn team-pair-random" type="button">Randomize</button>
                <button class="secondary-btn team-pair-reset" type="button">Reset</button>
              </div>
            </div>
            <p class="tournament-bracket-instructions">Choose two contestants for each pair. These pairs stay together until the Top 4 episode or finale.</p>
            <div class="tournament-column-grid team-pair-column-grid" style="--tournament-bracket-count: ${Math.min(pairCount, 4)};">
              ${Array.from({ length: pairCount }, (_, pairIndex) => `
                <section class="tournament-column team-pair-column">
                  <div class="tournament-column-head">
                    <div class="tournament-column-title">
                      <span class="tournament-color-dot"></span>
                      <strong>Pair ${pairIndex + 1}</strong>
                    </div>
                  </div>
                  <div class="tournament-slot-stack">
                    ${[0, 1].map((slotIndex) => {
                      const currentId = slots[pairIndex]?.[slotIndex] || "";
                      const contestant = season.contestants[currentId] || null;
                      return `
                        <label class="tournament-slot-card">
                          <span class="tournament-slot-number">${slotIndex + 1}</span>
                          <img class="tournament-slot-photo" src="${escapeHtml(contestant?.image || PLACEHOLDER)}" alt="${escapeHtml(contestant ? fullDisplayName(contestant) : "Contestant")}">
                          <select class="team-pair-select tournament-bracket-select" data-pair="${pairIndex}" data-slot="${slotIndex}">
                            <option value="">Choose contestant...</option>
                            ${optionList(currentId)}
                          </select>
                        </label>
                      `;
                    }).join("")}
                  </div>
                </section>
              `).join("")}
            </div>
            <div class="modal-actions tournament-bracket-actions">
              <button class="primary-btn team-pair-confirm" type="button" ${isValid() ? "" : "disabled"}>Confirm Pairs</button>
            </div>
          </div>
        `;
        overlay.querySelectorAll(".team-pair-select").forEach((select) => select.addEventListener("change", () => {
          const pairIndex = Number(select.dataset.pair);
          const slotIndex = Number(select.dataset.slot);
          slots[pairIndex][slotIndex] = select.value;
          render();
        }));
        overlay.querySelector(".team-pair-random")?.addEventListener("click", () => {
          const shuffled = shuffle(ids);
          slots = Array.from({ length: pairCount }, (_, i) => shuffled.slice(i * 2, i * 2 + 2));
          render();
        });
        overlay.querySelector(".team-pair-reset")?.addEventListener("click", () => {
          slots = emptySlots();
          render();
        });
        overlay.querySelector(".team-pair-confirm")?.addEventListener("click", () => {
          if (!isValid()) return;
          setTeamPairs(season, slots.map((pair) => pair.slice()));
          overlay.remove();
          resolve();
        });
      };
      document.body.appendChild(overlay);
      render();
    });
  }

  function teamPairForId(season, id) {
    const pairId = season?.teamPairById?.[id];
    return (season?.teamPairs || []).find((pair) => pair.id === pairId) || null;
  }

  function activeTeamPairs(season) {
    return (season?.teamPairs || [])
      .map((pair) => ({ ...pair, ids: pair.ids.filter((id) => season.activeIds.includes(id)) }))
      .filter((pair) => pair.ids.length > 0);
  }

  function teamPairScore(episode, pair) {
    return average((pair?.ids || []).map((id) => scoreForEpisodeId(episode, id, "total")));
  }

  function regularPremiereUsesSeasonFormat(season, episode) {
    return !!(episode?.premiere && !episode?.specialPremiere && (season?.config?.premiereType || "regular") === "regular");
  }

  function seasonEliminationFormatApplies(season, episode) {
    return !episode?.premiere || regularPremiereUsesSeasonFormat(season, episode);
  }

  function shouldUseAllStarsFormat(season, episode) {
    return episode.type === "competitive" && seasonEliminationFormatApplies(season, episode) && (isLegacyFormat(season) || isAssassinFormat(season));
  }

  function scoreForEpisodeId(episode, id, field = "total") {
    return Number((episode.scores || []).find((x) => x.id === id)?.[field] || 0);
  }

  function chooseEliminationVote(season, voterId, bottomIds, episode, mode = "legacy") {
    const choices = (bottomIds || []).filter((id) => id && (bottomIds.length <= 1 || id !== voterId));
    const pool = choices.length ? choices : (bottomIds || []);
    if (!pool.length) return null;
    const strategyRoll = Math.random();
    const ranked = pool.map((id) => {
      const relationship = season.relationships[pairKey(voterId, id)] || 0;
      const perf = scoreForEpisodeId(episode, id, "total");
      const track = trackRecordPower(season, id);
      let score;
      if (mode === "legacy") {
        if (strategyRoll < 0.84) score = (100 - track) * 1.12 + (100 - perf) * 0.10 + (-relationship) * 1.1 + randInt(-2, 2);
        else if (strategyRoll < 0.96) score = (-relationship) * 8.2 + (100 - track) * 0.26 + randInt(-3, 3);
        else score = track * 0.62 + (-relationship) * 1.2 + randInt(-2, 2);
      } else {
        if (strategyRoll < 0.72) score = (100 - track) * 0.92 + (100 - perf) * 0.14 + (-relationship) * 1.8 + randInt(-3, 3);
        else if (strategyRoll < 0.93) score = (-relationship) * 7.2 + (100 - track) * 0.24 + randInt(-4, 4);
        else score = track * 0.48 + randInt(-3, 3);
      }
      return { id, score };
    }).sort((a, b) => b.score - a.score);
    return ranked[0]?.id || pool[0] || null;
  }

  function groupVoteWinner(votes, tieBreakerId = null) {
    const details = groupVoteDetails(votes, tieBreakerId);
    return details.choiceId;
  }

  function groupVoteDetails(votes, tieBreakerId = null) {
    const counts = {};
    (votes || []).forEach((vote) => { if (vote.votedForId) counts[vote.votedForId] = (counts[vote.votedForId] || 0) + 1; });
    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!ranked.length) return { choiceId: null, tiedIds: [], tieBrokenByTop: false, counts };
    const topScore = ranked[0][1];
    const tiedIds = ranked.filter((entry) => entry[1] === topScore).map(([id]) => id);
    const tieBrokenByTop = tiedIds.length > 1 && !!tieBreakerId && tiedIds.includes(tieBreakerId);
    return { choiceId: tieBrokenByTop ? tieBreakerId : tiedIds[0], tiedIds, tieBrokenByTop, counts };
  }

  function pickLipSyncAssassin(season) {
    const inSeason = new Set(season.castOrder || []);
    const outsideSeason = (state.roster || []).filter((q) => !inSeason.has(q.id));
    const candidates = outsideSeason.filter((q) => Number(q.skills?.lipsync || 0) > 9);
    const fallback = outsideSeason.slice().sort((a, b) => Number(b.skills?.lipsync || 0) - Number(a.skills?.lipsync || 0));
    const picked = clone(randomItem(candidates.length ? candidates : fallback));
    if (!picked) return null;
    const id = `assassin_${picked.id}`;
    const profile = { ...picked, id, fullName: picked.fullName || picked.name || picked.nickname || "Lip Sync Assassin", nickname: picked.nickname || picked.name || "Lip Sync Assassin", isAssassin: true };
    season.contestants[id] = profile;
    return id;
  }

  function pickGuestJudge(type) {
    if (Math.random() > 0.70) return null;
    const judges = getGuestJudges();
    const normalizedType = String(type || "any").toLowerCase();
    const aliases = new Set([normalizedType, normalizedType.replace(/_/g, ""), normalizedType === "girlgroups" ? "ggs" : normalizedType]);
    const matches = judges.filter((judge) => {
      const tags = (judge.types || judge.tags || []).map((tag) => String(tag).toLowerCase());
      return tags.includes("any") || tags.some((tag) => aliases.has(tag));
    });
    return clone(randomItem(matches.length ? matches : judges));
  }

  function runMiniChallenge(season, episode) {
    const active = season.activeIds.slice();
    const challenge = clone(randomItem(getMiniChallengeData()));
    const teamish = ["groups", "pairs"].includes(episode.challenge?.teamMode);
    const declared = Math.max(0, Math.min(active.length, Number(challenge.winners || 0)));
    const fallbackCount = teamish && Math.random() < 0.45 ? Math.min(active.length, randInt(2, Math.min(4, active.length))) : 1;
    const winnerCount = declared || fallbackCount;
    episode.miniChallenge = challenge;
    episode.miniWinnerIds = winnerCount > 0 ? shuffle(active).slice(0, winnerCount) : [];
    episode.miniWinnerIds.forEach((id) => {
      season.stats[id].miniWins += 1;
    });
  }


  function runReadingComebackMiniChallenge(season, episode) {
    const comeback = episode.readingComeback || {};
    const challenge = comeback.challenge || comebackChallenge("reading_is_fundamental");
    const eligible = (comeback.eligible || comeback.candidates || []).slice();
    const returnedId = comeback.returnedId || null;
    episode.readingComebackRevealed = false;
    episode.miniChallenge = {
      ...challenge,
      readingComeback: true,
      readingComebackIntro: true,
      eligible,
      winners: [returnedId].filter(Boolean),
      suppressTrackMiniWin: true,
      suppressGroupingUse: true,
      description: comeback.description || challenge.description || ""
    };
    episode.miniWinnerIds = [returnedId].filter(Boolean);
    episode.comebackParticipantIds = [...new Set([...(episode.comebackParticipantIds || []), ...eligible])];
    episode.comebackPlacements = episode.comebackPlacements || {};
    eligible.filter((id) => id !== returnedId).forEach((id) => { episode.comebackPlacements[id] = "OUT"; });
    if (returnedId) {
      reviveContestant(season, returnedId);
      episode.readingComeback.returnedId = returnedId;
      if (!episode.returnedIds.includes(returnedId)) episode.returnedIds.push(returnedId);
    }
  }

  function maybeCreateTeams(season, episode) {
    const challenge = episode.challenge;
    if (isTeamsFormat(season) && season.activeIds.length > 3) {
      episode.teams = { mode: "teams", groups: activeTeamPairs(season).map((pair) => ({ name: pair.name, ids: pair.ids.slice(), pairId: pair.id })) };
      return;
    }
    const ids = shuffle(season.activeIds);
    if (!challenge || challenge.teamMode === "solo") {
      episode.teams = { mode: "solo", groups: [] };
      return;
    }
    if (challenge.teamMode === "pairs") {
      episode.teams = { mode: "pairs", groups: chunk(ids, 2).map((members, i) => ({ name: `Pair ${i + 1}`, ids: members })) };
      return;
    }
    if (challenge.teamCount && challenge.teamCount > 1) {
      episode.teams = { mode: "groups", groups: distributeGroups(ids, challenge.teamCount).map((members, i) => ({ name: `Team ${i + 1}`, ids: members })) };
      return;
    }
    const sizes = challenge.allowedGroupSizes?.length ? challenge.allowedGroupSizes : [3, 4, 5];
    const groupSize = sizes.find((size) => ids.length % size === 0) || Math.max(2, Math.ceil(ids.length / 3));
    episode.teams = { mode: "groups", groups: chunk(ids, groupSize).map((members, i) => ({ name: `Team ${i + 1}`, ids: members })) };
  }

  function distributeGroups(ids, count) {
    const groups = Array.from({ length: Math.max(1, count) }, () => []);
    ids.forEach((id, index) => groups[index % groups.length].push(id));
    return groups.filter((group) => group.length);
  }

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function runChallengeAndRunway(season, episode) {
    const type = challengeTypeKey(episode.challenge?.type);
    const isRunwayMainChallenge = NO_SEPARATE_RUNWAY_TYPES.has(type);
    const hasSeparateRunway = !isRunwayMainChallenge;
    const runway = hasSeparateRunway ? pickRunway(season) : {
      id: `challenge_runway_${episode.challenge?.id || type}_${episode.number}`,
      name: episode.challenge?.name || challengeTypeLabel(type),
      challengeRunway: true
    };
    episode.runway = runway;
    episode.runwayUsesChallengeScore = isRunwayMainChallenge;

    const challengeIds = (episode.competingIds?.length ? episode.competingIds : season.activeIds)
      .filter((id) => season.activeIds.includes(id));
    const runwayIds = (episode.runwayParticipantIds?.length ? episode.runwayParticipantIds : season.activeIds)
      .filter((id) => season.activeIds.includes(id));

    const originalActiveIds = season.activeIds.slice();
    season.activeIds = challengeIds.slice();
    assignSpecialChallengeChoices(season, episode, type);
    season.activeIds = originalActiveIds;

    const legacyPerformanceMap = new Map();
    const legacyRunwayMap = new Map();
    const challengeScoreMap = new Map();
    const runwayScoreMap = new Map();

    challengeIds.forEach((id) => {
      const queen = season.contestants[id];
      const legacyPerformanceScore = scoreLegacyPerformance(queen, episode.challenge);
      legacyPerformanceMap.set(id, legacyPerformanceScore);
      challengeScoreMap.set(id, clamp(100 - legacyPerformanceScore * 2, 0, 140));
    });

    runwayIds.forEach((id) => {
      const queen = season.contestants[id];
      const legacyRunwayRaw = hasSeparateRunway
        ? scoreLegacyRunway(queen)
        : (legacyPerformanceMap.get(id) ?? scoreLegacyPerformance(queen, episode.challenge));
      legacyRunwayMap.set(id, legacyRunwayRaw);
      runwayScoreMap.set(id, hasSeparateRunway
        ? clamp(100 - legacyRunwayRaw * 2, 0, 130)
        : (challengeScoreMap.get(id) || clamp(100 - legacyRunwayRaw * 2, 0, 140)));
    });

    const scores = challengeIds.map((id) => {
      const challengeScore = challengeScoreMap.get(id) || 0;
      const runwayScore = runwayScoreMap.has(id)
        ? runwayScoreMap.get(id)
        : challengeScore;
      const legacyPerformanceScore = Number(legacyPerformanceMap.get(id) ?? 999);
      const legacyRunwayRaw = Number(legacyRunwayMap.get(id) ?? legacyPerformanceScore);
      const legacyRunwayMod = hasSeparateRunway ? legacyRunwayModifier(legacyRunwayRaw) : 0;
      const stats = season.stats[id] || {};
      const favoritismPenalty = season.config.disableChallengeRiggory
        ? 0
        : Number(stats.favoritism || 0);
      const legacyTopScore = legacyPerformanceScore - legacyRunwayMod + favoritismPenalty;
      const legacyBottomScore = legacyPerformanceScore - legacyRunwayMod;

      return {
        id,
        challengeScore,
        runwayScore,
        balanceAdjustment: -favoritismPenalty,
        legacyPerformanceScore,
        legacyRunwayRaw,
        legacyRunwayMod,
        legacyTopScore,
        legacyBottomScore,
        legacyBottomTotal: 100 - legacyBottomScore,
        total: 100 - legacyTopScore
      };
    }).sort((a, b) => b.total - a.total);

    const runwayScores = runwayIds.map((id) => {
      const challengeScore = challengeScoreMap.get(id) || 0;
      const runwayScore = runwayScoreMap.get(id) || 0;
      const relatedScore = scores.find((score) => score.id === id);
      if (relatedScore) return relatedScore;
      const legacyPerformanceScore = Number(legacyPerformanceMap.get(id) ?? 999);
      const legacyRunwayRaw = Number(legacyRunwayMap.get(id) ?? legacyPerformanceScore);
      return {
        id,
        challengeScore,
        runwayScore,
        balanceAdjustment: 0,
        legacyPerformanceScore,
        legacyRunwayRaw,
        legacyRunwayMod: hasSeparateRunway ? legacyRunwayModifier(legacyRunwayRaw) : 0,
        legacyTopScore: legacyPerformanceScore,
        legacyBottomScore: legacyPerformanceScore,
        legacyBottomTotal: 100 - legacyPerformanceScore,
        total: runwayScore
      };
    }).sort((a, b) => b.runwayScore - a.runwayScore);

    if (isTeamsFormat(season) && season.activeIds.length > 3) {
      const pairGroups = activeTeamPairs(season)
        .filter((pair) => pair.ids.every((id) => challengeIds.includes(id)));
      pairGroups.forEach((pair) => {
        const pairScores = scores.filter((score) => pair.ids.includes(score.id));
        const avgChallenge = average(pairScores.map((score) => score.challengeScore));
        const avgRunway = average(pairScores.map((score) => score.runwayScore));
        const avgLegacyPerformance = average(pairScores.map((score) => score.legacyPerformanceScore));
        const avgLegacyRunwayRaw = average(pairScores.map((score) => score.legacyRunwayRaw));
        const avgLegacyRunwayMod = average(pairScores.map((score) => score.legacyRunwayMod));
        const avgLegacyTop = average(pairScores.map((score) => score.legacyTopScore));
        const avgLegacyBottom = average(pairScores.map((score) => score.legacyBottomScore));
        pairScores.forEach((score) => {
          score.individualChallengeScore = score.challengeScore;
          score.individualRunwayScore = score.runwayScore;
          score.individualTotal = score.total;
          score.individualLegacyPerformanceScore = score.legacyPerformanceScore;
          score.individualLegacyRunwayRaw = score.legacyRunwayRaw;
          score.individualLegacyTopScore = score.legacyTopScore;
          score.individualLegacyBottomScore = score.legacyBottomScore;
          score.challengeScore = avgChallenge;
          score.runwayScore = avgRunway;
          score.legacyPerformanceScore = avgLegacyPerformance;
          score.legacyRunwayRaw = avgLegacyRunwayRaw;
          score.legacyRunwayMod = avgLegacyRunwayMod;
          score.legacyTopScore = avgLegacyTop;
          score.legacyBottomScore = avgLegacyBottom;
          score.legacyBottomTotal = 100 - avgLegacyBottom;
          score.total = 100 - avgLegacyTop;
          score.teamPairId = pair.id;
        });
      });
      scores.sort((a, b) => b.total - a.total || String(a.teamPairId || "").localeCompare(String(b.teamPairId || "")));
      runwayScores.sort((a, b) => b.runwayScore - a.runwayScore);
      episode.teamScoresAveraged = true;
      episode.notes.push("Contestants compete in their season-long pairs. Judging uses each pair's averaged legacy score, while runway statistics remain individual.");
    }

    episode.scores = scores;
    episode.maxiGroups = bandScores(scores, "legacyPerformanceScore");
    episode.runwayGroups = hasSeparateRunway
      ? bandScores(runwayScores, "legacyRunwayRaw")
      : bandScores(scores, "legacyPerformanceScore");

    scores.forEach((score) => {
      season.stats[score.id].challengeScores.push({
        label: episode.label,
        value: Math.round(score.challengeScore),
        challenge: episode.challenge.name
      });
    });

    if (runway) {
      const runwayStatValue = (score) => Number.isFinite(Number(score.individualRunwayScore))
        ? Number(score.individualRunwayScore)
        : Number(score.runwayScore || 0);
      runwayScores.forEach((score) => {
        season.stats[score.id].runwayScores.push({
          label: episode.label,
          value: Math.round(runwayStatValue(score)),
          runway: runway.name
        });
      });
      const runwayWinner = runwayScores.slice().sort((a, b) => runwayStatValue(b) - runwayStatValue(a))[0];
      if (runwayWinner) season.stats[runwayWinner.id].runwayWins += 1;
    }
  }

  function assignSpecialChallengeChoices(season, episode, type) {
    if (type === "talent_show") {
      const acts = getTalentShowData();
      if (!acts.length) return;
      const repeatable = acts.filter((act) => Number(act.id) <= 14);
      const oneTime = acts.filter((act) => Number(act.id) > 14);
      episode.specialPerformanceChoices = season.activeIds.map((id) => {
        const unused = oneTime.filter((act) => !(season.usedTalentActIds || []).includes(act.id));
        const pool = Math.random() < 0.42 && repeatable.length ? repeatable : (unused.length ? unused : repeatable.length ? repeatable : acts);
        const act = clone(randomItem(pool));
        if (Number(act.id) > 14) season.usedTalentActIds.push(act.id);
        return { id, kind: "talent_show", choice: act.name };
      });
      return;
    }
    if (type === "snatch_game") {
      const characters = getSnatchGameData();
      if (!characters.length) return;
      episode.specialPerformanceChoices = season.activeIds.map((id) => {
        const unused = characters.filter((character) => !(season.usedSnatchCharacterIds || []).includes(character.id));
        const character = clone(randomItem(unused.length ? unused : characters));
        season.usedSnatchCharacterIds.push(character.id);
        return { id, kind: "snatch_game", choice: character.name };
      });
    }
  }

  function pickRunway(season) {
    const all = getRunwayData();
    const unused = all.filter((runway) => !season.usedRunwayIds.includes(runway.id));
    if (unused.length) return clone(randomItem(unused));
    const fallback = clone(randomItem(all));
    fallback.id = `${fallback.id || "runway"}_encore_${season.episodeCounter}_${season.usedRunwayIds.length}`;
    fallback.name = `${fallback.name || "Runway"} Remix`;
    return fallback;
  }

  const LEGACY_COMBINED_CHALLENGE_TYPES = new Set([
    "ads",
    "advert",
    "advertisement",
    "marketing",
    "snatch_game",
    "rusical",
    "ball",
    "rumix",
    "girlgroups"
  ]);

  function legacyWeightedSkill(queen, challenge) {
    return Object.entries(challenge?.requiredSkills || {}).reduce((sum, [skill, weight]) => {
      return sum + Number(queen?.skills?.[skill] || 0) * Number(weight || 0);
    }, 0);
  }

  function legacyJudgingDraw(min, max) {
    return Math.round((randInt(min, max) * 3 + randInt(min, max)) / 4);
  }

  function scoreLegacyPerformance(queen, challenge) {
    const type = challengeTypeKey(challenge?.type);
    const weightedSkill = legacyWeightedSkill(queen, challenge);
    if (type === "talent_show") return legacyJudgingDraw(15, 35) - legacyJudgingDraw(1, 35);
    if (LEGACY_COMBINED_CHALLENGE_TYPES.has(type)) return legacyJudgingDraw(25, 45) - weightedSkill * 2;
    return legacyJudgingDraw(15, 35) - weightedSkill;
  }

  function isQuitOrDisqTrackToken(token) {
    const value = String(token || "").toUpperCase();
    return value.includes("QUIT") || value.includes("DISQ");
  }

  function isUnplannedExitToken(token) {
    const value = String(token || "").toUpperCase();
    return isQuitOrDisqTrackToken(value) || value === "DEPT";
  }

  function isTrackExitToken(token) {
    const value = String(token || "").toUpperCase();
    return value === "ELIM" || isUnplannedExitToken(value);
  }

  function isIneligibleUnplannedExit(season, id) {
    return (season?.unplannedExitIds || []).includes(id);
  }

  function unplannedExitCandidateIds(season, episode, useBottomOnly = false) {
    const source = useBottomOnly
      ? (episode?.bottomIds || [])
      : ((episode?.competingIds || []).length ? episode.competingIds : season.activeIds);
    return [...new Set((source || []).filter((id) => {
      return id
        && season.activeIds.includes(id)
        && season.contestants[id]
        && !season.contestants[id].isAssassin;
    }))];
  }

  function canUseUnplannedExitSystem(season, episode) {
    if (!season || !episode || season.unplannedExitUsed) return false;
    if (isAllWinnersFormat(season) || isTournamentFormat(season) || isTeamsFormat(season)) return false;
    if (episode.type === "finale" || episode.type === "lsftf" || episode.type === "cunt_test") return false;
    if ((episode.type || "").startsWith("comeback_") || episode.comeback) return false;
    if (["special_lalaparuza", "special_slayoffs", "reunion_lalaparuza", "fame_games"].includes(episode.type)) return false;
    return true;
  }

  function removeIdFromEpisodePlacements(episode, id) {
    ["winnerIds", "top2Ids", "highIds", "safeIds", "lowIds", "bottomIds", "savedIds", "eliminatedIds"].forEach((key) => {
      episode[key] = (episode[key] || []).filter((value) => value !== id);
    });
  }

  function registerUnplannedExit(season, episode, id, token, stage, text, baseToken = "") {
    if (!id || !season.activeIds.includes(id)) return null;
    season.unplannedExitUsed = true;
    season.unplannedExitIds = [...new Set([...(season.unplannedExitIds || []), id])];
    episode.departureIds = [...new Set([...(episode.departureIds || []), id])];
    episode.unplannedExit = {
      id,
      token,
      stage,
      text,
      baseToken,
      type: token === "DISQ" ? "disqualification" : token === "DEPT" ? "medical" : "quit"
    };
    episode.notes = episode.notes || [];
    episode.notes.push(text);
    season.activeIds = season.activeIds.filter((activeId) => activeId !== id);
    episode.competingIds = (episode.competingIds || []).filter((contestantId) => contestantId !== id);
    episode.runwayParticipantIds = (episode.runwayParticipantIds || []).filter((contestantId) => contestantId !== id);
    if (season.returningIds) season.returningIds = season.returningIds.filter((contestantId) => contestantId !== id);
    return episode.unplannedExit;
  }

  function maybeApplyPreChallengeUnplannedExit(season, episode) {
    if (!canUseUnplannedExitSystem(season, episode)) return false;
    const candidates = unplannedExitCandidateIds(season, episode, false);
    if (candidates.length <= 6 || randInt(0, 1000) < 999) return false;
    const id = randomItem(candidates);
    const contestant = fullDisplayName(season.contestants[id]);
    const medical = randInt(0, 10) >= 5;
    if (medical) {
      registerUnplannedExit(
        season,
        episode,
        id,
        "DEPT",
        "pre_challenge",
        `Based on medical advice, the amazing and talented ${contestant} will not continue in the competition.`
      );
    } else {
      registerUnplannedExit(
        season,
        episode,
        id,
        "QUIT",
        "pre_challenge",
        `${contestant} has decided that their mental health is not in a good place to continue in the competition.`
      );
    }
    return true;
  }

  function maybeResolveBottomUnplannedExit(season, episode, ids, lipSync) {
    if (!canUseUnplannedExitSystem(season, episode) || ids.length !== 2) return false;

    let eventType = "";
    if (randInt(0, 1000) >= 999) eventType = "DISQ";
    else if (randInt(0, 1000) >= 999) eventType = "BTM2_QUIT";
    else if (randInt(0, 1000) >= 999) eventType = "DEPT";
    if (!eventType) return false;

    let id;
    if (eventType === "BTM2_QUIT") id = randomItem(ids);
    else id = randomItem(unplannedExitCandidateIds(season, episode, false));
    if (!id) return false;

    const contestant = fullDisplayName(season.contestants[id]);
    const wasBottom = ids.includes(id);
    const survivors = ids.filter((bottomId) => bottomId !== id);
    const token = eventType;
    const text = eventType === "DISQ"
      ? `${contestant}, it has come to RuPaul's attention that you have broken the rules of this competition. You have been disqualified and must sashay away.`
      : eventType === "DEPT"
        ? `${contestant}, the doctors have advised that you need time to heal. You cannot continue in the competition.`
        : `${contestant} is grateful for the opportunity, but has chosen to leave the competition and take care of themself.`;

    removeIdFromEpisodePlacements(episode, id);
    registerUnplannedExit(season, episode, id, token, "lip_sync", text, wasBottom ? "BTM2" : "");
    episode.eliminatedIds = [];
    episode.savedIds = [...new Set([...(episode.savedIds || []), ...survivors, ...(wasBottom ? [] : ids)])];
    lipSync.resultType = eventType === "DISQ" ? "disqualification" : eventType === "DEPT" ? "medical_departure" : "bottom_quit";
    lipSync.unplannedExitId = id;
    lipSync.loserId = wasBottom ? id : null;
    if (wasBottom && survivors.length) lipSync.winnerId = survivors[0];
    episode.resultText = wasBottom
      ? `${sentenceList(survivors, season, false)}, shantay you stay. ${text}`
      : `${sentenceList(ids, season, false)}, you are both safe. ${text}`;
    ids.forEach((bottomId) => updateLipSyncStats(season, bottomId, bottomId !== id));
    return true;
  }

  function maybeResolveLegacyWinnerQuit(season, episode, lipSync, top2) {
    if (!canUseUnplannedExitSystem(season, episode) || season.activeIds.length <= 6) return false;
    if (randInt(0, 1000) < 995) return false;
    const quitterId = lipSync.winnerId;
    const otherId = top2.find((id) => id !== quitterId) || lipSync.loserId;
    if (!quitterId || !otherId) return false;
    const contestant = fullDisplayName(season.contestants[quitterId]);
    registerUnplannedExit(
      season,
      episode,
      quitterId,
      "WIN_QUIT",
      "legacy_win",
      `${contestant} wins the lip sync, then shocks the judges by announcing that they are going home.`,
      "WIN"
    );
    episode.winnerIds = [quitterId, otherId];
    episode.top2Ids = top2.slice();
    episode.highIds = (episode.highIds || []).filter((id) => !top2.includes(id));
    episode.eliminatedIds = [];
    episode.savedIds = [...new Set([...(episode.savedIds || []), otherId, ...(episode.bottomIds || [])])];
    episode.legacyEliminationChoiceId = null;
    episode.legacyLipSyncLoserId = null;
    lipSync.resultType = "legacy_winner_quit";
    lipSync.unplannedExitId = quitterId;
    lipSync.winnerIds = [quitterId, otherId];
    lipSync.resultTextLine = `${contestant} wins the lip sync, but leaves the competition. ${fullDisplayName(season.contestants[otherId])} is also declared a winner this week.`;
    episode.resultText = `${contestant}, you're a winner, baby! ${contestant} has chosen to leave the competition. ${fullDisplayName(season.contestants[otherId])}, you are also a winner this week. No bottom contestant is eliminated.`;
    top2.forEach((id) => updateLipSyncStats(season, id, id === quitterId));
    return true;
  }

  function scoreLegacyRunway(queen) {
    return randInt(12, 35) - Number(queen?.skills?.runway || 0);
  }

  function legacyRunwayModifier(rawRunwayScore) {
    if (rawRunwayScore < 6) return 7;
    if (rawRunwayScore < 16) return 3;
    if (rawRunwayScore < 26) return 0;
    return -3;
  }

  function legacyChance(successfulValuesOutOf101) {
    return Math.random() < Number(successfulValuesOutOf101 || 0) / 101;
  }

  function scoreChallengePerformance(queen, challenge, config) {
    const raw = Object.entries(challenge.requiredSkills || {}).reduce((sum, [skill, weight]) => sum + ((queen.skills?.[skill] || 0) * Number(weight || 0)), 0);
    const luck = config.disableChallengeRiggory ? randInt(-2, 2) : randInt(-7, 7);
    const spark = config.disableChallengeRiggory ? (Math.random() < 0.018 ? randInt(1, 3) : 0) : (Math.random() < 0.075 ? randInt(2, 7) : 0);
    const stumble = config.disableChallengeRiggory ? (Math.random() < 0.018 ? randInt(-3, -1) : 0) : (Math.random() < 0.065 ? randInt(-7, -2) : 0);
    const chaos = config.disableChallengeRiggory ? 0 : (Math.random() < 0.012 ? randInt(-8, 8) : 0);
    return 50 + raw * 3.95 + luck + spark + stumble + chaos;
  }

  function scoreRunway(queen, config) {
    const luck = config.disableChallengeRiggory ? randInt(-1, 1) : randInt(-5, 5);
    const spark = config.disableChallengeRiggory ? (Math.random() < 0.018 ? randInt(1, 2) : 0) : (Math.random() < 0.06 ? randInt(2, 6) : 0);
    const stumble = config.disableChallengeRiggory ? (Math.random() < 0.018 ? randInt(-2, -1) : 0) : (Math.random() < 0.055 ? randInt(-6, -2) : 0);
    return 51 + (queen.skills?.runway || 0) * 3.8 + luck + spark + stumble;
  }

  function competitiveBalanceAdjustment(season, id) {
    if (season.config.disableChallengeRiggory) return 0;
    return -Number(season.stats?.[id]?.favoritism || 0);
  }

  function bandScores(scores, field) {
    const groups = { slayed: [], great: [], good: [], bad: [], flopped: [] };
    if (field === "legacyPerformanceScore" || field === "legacyRunwayRaw") {
      scores.forEach((score) => {
        const value = Number(score[field]);
        if (value < 6) groups.slayed.push(score.id);
        else if (value < 16) groups.great.push(score.id);
        else if (value < 26) groups.good.push(score.id);
        else if (value < 31) groups.bad.push(score.id);
        else groups.flopped.push(score.id);
      });
      return groups;
    }

    const values = scores.map((s) => s[field]).sort((a, b) => a - b);
    const q = (p) => values[Math.max(0, Math.min(values.length - 1, Math.floor(values.length * p)))];
    const q20 = q(0.20), q40 = q(0.40), q70 = q(0.70), q90 = q(0.90);
    scores.forEach((score) => {
      if (score[field] >= q90) groups.slayed.push(score.id);
      else if (score[field] >= q70) groups.great.push(score.id);
      else if (score[field] >= q40) groups.good.push(score.id);
      else if (score[field] >= q20) groups.bad.push(score.id);
      else groups.flopped.push(score.id);
    });
    return groups;
  }

  function assignPlacements(season, episode) {
    const special = episode.specialPremiere;
    if (special === "slayers") return assignSlayersPremiere(season, episode);
    if (special === "non_elim_top2" || special === "split_top2" || special === "porkchop_top2") return assignNonElimTop2(season, episode);
    if (special === "late_entry") return assignLateEntryPremiere(season, episode);
    if (special === "uk3") return assignUK3Premiere(season, episode);
    if (special === "split_elim") return assignRegularPlacements(season, episode);
    if (special === "rate_a_queen_split") return assignRateAQueenSplitPremiere(season, episode);
    if (special === "rate_a_queen_s17_split") return assignRateAQueenS17SplitPremiere(season, episode);
    if (special === "mid_season_rate_a_queen") return assignMidSeasonRateAQueenPlacements(season, episode);
    if (special === "rate_a_queen_merge") return assignRateAQueenMergePlacements(season, episode);

    if (isGoldenBeaverFormat(season) && seasonEliminationFormatApplies(season, episode)) return assignGoldenBeaverPlacements(season, episode);
    if (shouldUseAllStarsFormat(season, episode)) return assignAllStarsPlacements(season, episode);
    if (isTeamsFormat(season) && season.activeIds.length > 3) return assignTeamsPlacements(season, episode);

    const specialOutcome = maybeSpecialEpisodeOutcome(season, episode);
    if (specialOutcome === "everyone_top") return assignEveryoneTop(season, episode);
    if (specialOutcome === "everyone_bad") return assignEveryoneBad(season, episode);
    if (specialOutcome === "mass_lipsync") return assignLegacyMassLipSync(season, episode);
    if (specialOutcome === "winner_safe_lalaparuza_next") return assignWinnerSafeLalaparuzaNext(season, episode);
    if (specialOutcome === "team_lipsync") return assignTeamLipSync(season, episode);
    if (specialOutcome === "whole_team_win") return assignWholeTeamWin(season, episode);
    if (shouldJudgeInTeams(season, episode)) return assignTeamJudgedPlacements(season, episode);
    if (shouldJudgeInPairs(season, episode)) return assignPairJudgedPlacements(season, episode);
    assignRegularPlacements(season, episode);
  }

  function rankedIds(episode) { return episode.scores.map((s) => s.id); }
  function bottomRankedIds(episode) {
    return episode.scores.slice().sort((a, b) => {
      if (Number.isFinite(Number(a.legacyBottomScore)) && Number.isFinite(Number(b.legacyBottomScore))) {
        return Number(b.legacyBottomScore) - Number(a.legacyBottomScore);
      }
      return Number(a.total || 0) - Number(b.total || 0);
    }).map((s) => s.id);
  }

  function isProtectedByImmunity(season, episode, id) {
    const imm = season.immunity?.[id];
    return !!(imm && imm.usableEpisodeNumber === episode.number && immunityStillActive(season));
  }

  function filterImmunityProtected(season, episode, ids) {
    return (ids || []).filter((id) => !isProtectedByImmunity(season, episode, id));
  }

  function chooseLowFromBottomDanger(season, ids) {
    return null;
  }

  function protectedIdsForEpisode(season, episode) {
    return season.activeIds.filter((id) => isProtectedByImmunity(season, episode, id));
  }

  function enforceImmunitySafety(season, episode) {
    const protectedIds = protectedIdsForEpisode(season, episode);
    if (!protectedIds.length) return;
    const protectedSet = new Set(protectedIds);
    let moved = false;
    const removeProtected = (ids = []) => ids.filter((id) => {
      const keep = !protectedSet.has(id);
      if (!keep) moved = true;
      return keep;
    });
    episode.lowIds = removeProtected(episode.lowIds || []);
    episode.bottomIds = removeProtected(episode.bottomIds || []);
    episode.eliminatedIds = removeProtected(episode.eliminatedIds || []);
    if (moved) {
      const assigned = new Set([...(episode.winnerIds || []), ...(episode.top2Ids || []), ...(episode.highIds || []), ...(episode.lowIds || []), ...(episode.bottomIds || [])]);
      protectedIds.forEach((id) => {
        episode.immunityProtectedIds = [...new Set([...(episode.immunityProtectedIds || []), id])];
        if (!assigned.has(id) && !episode.safeIds.includes(id)) episode.safeIds.push(id);
      });
      setSafeIds(season, episode);
      protectedIds.forEach((id) => { if (!episode.safeIds.includes(id) && !episode.highIds.includes(id) && !episode.winnerIds.includes(id)) episode.safeIds.push(id); });
    }
  }

  function assignAllStarsPlacements(season, episode) {
    const ranked = rankedIds(episode);
    const activeCount = ranked.length;
    const legacy = isLegacyFormat(season);

    if (isAssassinFormat(season) && episode.teams?.mode === "groups" && (episode.teams.groups || []).length === 3) {
      const teamOrder = (episode.teams.groups || [])
        .map((team) => ({ ...team, total: average((team.ids || []).map((id) => scoreForEpisodeId(episode, id, "total"))) }))
        .sort((a, b) => b.total - a.total);
      const winningTeam = teamOrder[0];
      const bottomTeam = teamOrder.at(-1);
      const winningTeamIds = winningTeam?.ids || [];
      const bottomTeamIds = filterImmunityProtected(season, episode, bottomTeam?.ids || []);
      const bestWinningId = winningTeamIds.slice().sort((a, b) => scoreForEpisodeId(episode, b, "total") - scoreForEpisodeId(episode, a, "total"))[0];
      episode.winningTeamIds = winningTeamIds.slice();
      episode.teamWinMode = "solo";
      episode.assassinThreeTeamBottom = true;
      episode.winnerIds = [bestWinningId || ranked[0]].filter(Boolean);
      episode.highIds = winningTeamIds.filter((id) => !episode.winnerIds.includes(id));
      episode.lowIds = [];
      episode.bottomIds = bottomTeamIds.length
        ? legacyBottomOrder(episode, bottomTeamIds)
        : bottomRankedIds(episode).filter((id) => !episode.winnerIds.includes(id)).slice(0, Math.min(3, Math.max(0, activeCount - episode.winnerIds.length)));
      episode.notes.push(`${bottomTeam?.name || "The lowest-ranked team"} is the bottom team, so the entire team is up for elimination.`);
      setSafeIds(season, episode);
      return;
    }

    const pools = buildLegacyJudgingPools(season, episode);
    const top = legacyTopOrder(episode, pools.top);
    let bottom = legacyBottomOrder(episode, pools.bottom);

    episode.winnerIds = [];
    episode.top2Ids = [];
    episode.highIds = [];
    episode.lowIds = [];
    episode.bottomIds = [];

    if (legacy) {
      if (activeCount === 3) {
        episode.top2Ids = ranked.slice(0, 2);
        bottom = ranked.slice(2);
      } else {
        const topPool = top.length >= 2 ? top : ranked.filter((id) => !bottom.includes(id));
        episode.top2Ids = topPool.slice(0, 2);
        episode.highIds = topPool.slice(2);
      }
    } else {
      if (activeCount <= 4) {
        episode.winnerIds = ranked.slice(0, 1);
        bottom = filterImmunityProtected(season, episode, ranked.slice(1));
      } else {
        episode.winnerIds = (top.length ? top : ranked).slice(0, 1);
        episode.highIds = top.filter((id) => !episode.winnerIds.includes(id));
      }
    }

    const protectedTop = new Set([...(episode.winnerIds || []), ...(episode.top2Ids || []), ...(episode.highIds || [])]);
    bottom = bottom.filter((id) => !protectedTop.has(id));
    if (bottom.length > 2 && legacyScoreForId(episode, bottom[0], "legacyBottomScore") < 25) {
      episode.lowIds = [bottom.shift()];
    }
    episode.bottomIds = bottom;
    setSafeIds(season, episode);
  }

  function assignGoldenBeaverPlacements(season, episode) {
    const ranked = rankedIds(episode);
    const pools = buildLegacyJudgingPools(season, episode);
    const top = legacyTopOrder(episode, pools.top);
    const winner = (top.length ? top : ranked)[0];
    episode.winnerIds = [winner].filter(Boolean);
    episode.top2Ids = [];
    episode.highIds = top.filter((id) => id !== winner);
    episode.lowIds = [];

    const targetBottomCount = Math.min(3, Math.max(0, ranked.length - episode.winnerIds.length));
    const bottom = legacyBottomOrder(episode, pools.bottom)
      .filter((id) => !episode.winnerIds.includes(id) && !episode.highIds.includes(id));
    bottomRankedIds(episode).forEach((id) => {
      if (bottom.length >= targetBottomCount) return;
      if (episode.winnerIds.includes(id) || episode.highIds.includes(id) || bottom.includes(id) || isProtectedByImmunity(season, episode, id)) return;
      bottom.push(id);
    });

    episode.goldenBeaverBottomIds = bottom.slice(0, targetBottomCount);
    episode.bottomIds = episode.goldenBeaverBottomIds.slice();
    setSafeIds(season, episode);
  }

  function chooseGoldenBeaverSave(season, winnerId, bottomIds, episode) {
    const pool = (bottomIds || []).filter(Boolean);
    if (!winnerId || !pool.length) return null;
    const ranked = pool.map((id) => {
      const relationship = season.relationships[pairKey(winnerId, id)] || 0;
      const track = trackRecordPower(season, id);
      const weakness = 100 - scoreForEpisodeId(episode, id, "total");
      const score = relationship * 6.2 + track * 0.24 + weakness * 0.08 + randInt(-2, 2);
      return { id, score, relationship, track, weakness };
    }).sort((a, b) => b.score - a.score);
    const picked = ranked[0];
    if (!picked) return null;
    if (picked.relationship >= 4) episode.goldenBeaverSaveReason = "relationship";
    else if (picked.track >= 68) episode.goldenBeaverSaveReason = "track record";
    else episode.goldenBeaverSaveReason = "strategy";
    return picked.id;
  }

  function resolveGoldenBeaverSave(season, episode) {
    if (!isGoldenBeaverFormat(season) || !seasonEliminationFormatApplies(season, episode) || episode.type !== "competitive") return;
    const winnerId = (episode.winnerIds || [])[0];
    const bottomThree = (episode.goldenBeaverBottomIds || episode.bottomIds || []).slice(0, 3);
    if (!winnerId || bottomThree.length < 3) return;
    const savedId = chooseGoldenBeaverSave(season, winnerId, bottomThree, episode) || bottomThree[0];
    episode.goldenBeaverSavedId = savedId;
    episode.lowIds = [savedId];
    episode.bottomIds = bottomThree.filter((id) => id !== savedId).slice(0, 2);
    episode.savedIds = [...new Set([...(episode.savedIds || []), savedId])];
    setSafeIds(season, episode);
  }

  function legacyScoreForId(episode, id, field) {
    const value = (episode.scores || []).find((score) => score.id === id)?.[field];
    return Number.isFinite(Number(value)) ? Number(value) : 999;
  }

  function legacyPerformanceOrder(episode) {
    return (episode.scores || []).slice().sort((a, b) => {
      const av = Number.isFinite(Number(a.legacyPerformanceScore)) ? Number(a.legacyPerformanceScore) : -Number(a.total || 0);
      const bv = Number.isFinite(Number(b.legacyPerformanceScore)) ? Number(b.legacyPerformanceScore) : -Number(b.total || 0);
      return av - bv;
    }).map((score) => score.id);
  }

  function legacyTopOrder(episode, ids) {
    return (ids || []).slice().sort((a, b) => legacyScoreForId(episode, a, "legacyTopScore") - legacyScoreForId(episode, b, "legacyTopScore"));
  }

  function legacyBottomOrder(episode, ids) {
    return (ids || []).slice().sort((a, b) => legacyScoreForId(episode, a, "legacyBottomScore") - legacyScoreForId(episode, b, "legacyBottomScore"));
  }

  function buildLegacyJudgingPools(season, episode) {
    const ranked = legacyPerformanceOrder(episode);
    const count = ranked.length;
    let top = [];
    let bottom = [];

    if (count > 13) {
      top = ranked.slice(0, 4);
      bottom = ranked.slice(-4);
      if (legacyScoreForId(episode, ranked[3], "legacyPerformanceScore") > 17) top = top.filter((id) => id !== ranked[3]);
      else if (legacyScoreForId(episode, ranked[4], "legacyPerformanceScore") < 10) top.push(ranked[4]);
      if (legacyScoreForId(episode, ranked[count - 4], "legacyPerformanceScore") < 16) bottom = bottom.filter((id) => id !== ranked[count - 4]);
    } else if (count > 6) {
      top = ranked.slice(0, 3);
      bottom = ranked.slice(-3);
      if (legacyScoreForId(episode, ranked[2], "legacyPerformanceScore") > 17) top = top.filter((id) => id !== ranked[2]);
      else if (legacyScoreForId(episode, ranked[3], "legacyPerformanceScore") < 10) top.push(ranked[3]);
      if (legacyScoreForId(episode, ranked[count - 3], "legacyPerformanceScore") < 16) bottom = bottom.filter((id) => id !== ranked[count - 3]);
    } else if (count === 6) {
      top = ranked.slice(0, 3);
      bottom = ranked.slice(-3);
      const middle = ranked[3];
      const middleScore = legacyScoreForId(episode, middle, "legacyPerformanceScore");
      if (middleScore < 10) {
        top.push(middle);
        bottom = bottom.filter((id) => id !== middle);
      } else if (middleScore < 16) {
        bottom = bottom.filter((id) => id !== middle);
      }
    } else if (count === 5) {
      top = ranked.slice(0, 2);
      bottom = ranked.slice(3);
      const middle = ranked[2];
      if (legacyScoreForId(episode, middle, "legacyPerformanceScore") < 16) top.push(middle);
      else bottom.unshift(middle);
    } else if (count === 4) {
      top = ranked.slice(0, 2);
      bottom = ranked.slice(2);
    } else if (count === 3) {
      top = ranked.slice(0, 1);
      bottom = ranked.slice(1);
    }

    const desiredBottomCount = bottom.length;
    bottom = filterImmunityProtected(season, episode, bottom);
    if (bottom.length < desiredBottomCount) {
      bottomRankedIds(episode).forEach((id) => {
        if (bottom.length >= desiredBottomCount) return;
        if (top.includes(id) || bottom.includes(id) || isProtectedByImmunity(season, episode, id)) return;
        bottom.push(id);
      });
    }

    return {
      top: [...new Set(top)],
      bottom: [...new Set(bottom)]
    };
  }

  function assignRegularPlacements(season, episode) {
    const pools = buildLegacyJudgingPools(season, episode);
    const top = legacyTopOrder(episode, pools.top);
    const bottom = legacyBottomOrder(episode, pools.bottom);

    episode.winnerIds = [];
    episode.top2Ids = [];
    episode.highIds = [];
    episode.lowIds = [];
    episode.bottomIds = [];
    episode.legacyThreeWayLipSync = false;

    if (top.length) {
      const firstScore = legacyScoreForId(episode, top[0], "legacyTopScore");
      const secondScore = top[1] ? legacyScoreForId(episode, top[1], "legacyTopScore") : null;
      const tiedForWin = top.length > 1 && Math.abs(firstScore - secondScore) < 0.000001;
      const doubleWin = tiedForWin && legacyChance(60);
      episode.winnerIds = doubleWin ? top.slice(0, 2) : top.slice(0, 1);
      episode.highIds = top.filter((id) => !episode.winnerIds.includes(id));
    }

    if (bottom.length >= 5) {
      episode.lowIds = bottom.slice(0, bottom.length - 2);
      episode.bottomIds = bottom.slice(-2);
    } else if (bottom.length === 4) {
      episode.lowIds = bottom.slice(0, 2);
      episode.bottomIds = bottom.slice(2);
    } else if (bottom.length === 3) {
      const bestBottomScore = legacyScoreForId(episode, bottom[0], "legacyBottomScore");
      if (bestBottomScore >= 30 && season.activeIds.length > 5) {
        episode.bottomIds = bottom.slice();
        episode.legacyThreeWayLipSync = true;
      } else {
        episode.lowIds = bottom.slice(0, 1);
        episode.bottomIds = bottom.slice(1);
      }
    } else {
      episode.bottomIds = bottom.slice();
    }

    setSafeIds(season, episode);
  }


  function assignTeamsPlacements(season, episode) {
    const pairs = activeTeamPairs(season)
      .filter((pair) => pair.ids.length === 2)
      .map((pair) => ({ ...pair, score: teamPairScore(episode, pair) }))
      .sort((a, b) => b.score - a.score);
    if (pairs.length < 2) { assignRegularPlacements(season, episode); return; }

    episode.judgedInTeams = true;
    episode.teamFormatEpisode = true;
    episode.teamPairScoreOrder = pairs.map((pair) => ({ pairId: pair.id, ids: pair.ids.slice(), score: pair.score }));
    episode.top2Ids = [];
    episode.highIds = [];
    episode.lowIds = [];
    episode.safeIds = [];

    const topPair = pairs[0];
    episode.winnerIds = topPair.ids.slice();

    if (pairs.length === 2) {
      const bottomPair = pairs[1];
      episode.teamTopFourLipSync = true;
      episode.bottomIds = bottomPair.ids.slice();
      episode.notes.push("Only two pairs remain. The winning pair is safe, and the bottom pair must lip sync against each other.");
      return;
    }

    const bottomPairs = pairs.slice(-2);
    episode.bottomIds = bottomPairs.flatMap((pair) => pair.ids);

    const middlePairs = pairs.slice(1, -2);
    const activeCount = season.activeIds.length;
    const desiredHighContestants = activeCount >= 15 ? 4 : 3;
    const desiredHighPairs = Math.max(0, Math.min(middlePairs.length, Math.ceil((desiredHighContestants - 2) / 2)));
    const desiredLowPairs = middlePairs.length - desiredHighPairs >= 2 || pairs.length >= 5 ? 1 : 0;

    const highPairs = middlePairs.slice(0, desiredHighPairs);
    const lowPairs = desiredLowPairs ? middlePairs.slice(-desiredLowPairs) : [];
    episode.highIds = highPairs.flatMap((pair) => pair.ids);
    episode.lowIds = lowPairs.flatMap((pair) => pair.ids);

    const assigned = new Set([...episode.winnerIds, ...episode.highIds, ...episode.lowIds, ...episode.bottomIds]);
    episode.safeIds = season.activeIds.filter((id) => !assigned.has(id));
    episode.notes.push("This episode follows regular judging structure, but each season-long pair is judged by the pair's averaged score. The two lowest pairs are in the bottom.");
  }

  function maybeApplyCloseDoubleWin(season, episode, excluded = new Set()) {
    if (season.config.disableChallengeRiggory) return;
    if (episode.premiere || episode.top2Ids?.length) return;
    if (episode.teams?.mode && episode.teams.mode !== "solo") return;
    if ((episode.winnerIds || []).length !== 1) return;
    if (Number(season.doubleChallengeWinsUsed || 0) >= 2) return;
    if (Number.isFinite(season.lastDoubleChallengeWinEpisode) && episode.number - season.lastDoubleChallengeWinEpisode < 5) return;
    const winner = episode.winnerIds[0];
    const ranked = rankedIds(episode).filter((id) => !excluded.has(id));
    const runnerUp = ranked.find((id) => id !== winner && !(episode.bottomIds || []).includes(id) && !(episode.lowIds || []).includes(id));
    if (!runnerUp) return;
    const gap = Math.abs(scoreForEpisodeId(episode, winner, "total") - scoreForEpisodeId(episode, runnerUp, "total"));
    if (gap > 4.75) return;
    const chance = gap <= 1.25 ? 0.105 : gap <= 3 ? 0.068 : 0.035;
    if (Math.random() >= chance) return;
    episode.winnerIds = [winner, runnerUp];
    episode.highIds = (episode.highIds || []).filter((id) => id !== runnerUp);
    season.doubleChallengeWinsUsed = Number(season.doubleChallengeWinsUsed || 0) + 1;
    season.lastDoubleChallengeWinEpisode = episode.number;
    episode.notes = episode.notes || [];
    episode.notes.push(`${fullDisplayName(season.contestants[winner])} and ${fullDisplayName(season.contestants[runnerUp])} are so close that RuPaul awards a double win.`);
  }

  function assignSlayersPremiere(season, episode) {
    const ranked = rankedIds(episode);
    const topCount = Math.ceil(ranked.length / 2);
    episode.top2Ids = ranked.slice(0, 2);
    episode.winnerIds = [];
    episode.highIds = ranked.slice(2, topCount);
    episode.safeIds = ranked.slice(topCount);
    episode.lowIds = [];
    episode.bottomIds = [];
    episode.notes.push("Slayers premiere: no bottoms, only the top half of the cast receives critiques.");
  }

  function assignNonElimTop2(season, episode) {
    const ranked = rankedIds(episode);
    const bottomRanked = bottomRankedIds(episode);
    episode.top2Ids = ranked.slice(0, 2);
    episode.highIds = ranked.slice(2, Math.min(4, ranked.length));
    episode.lowIds = filterImmunityProtected(season, episode, bottomRanked).slice(0, Math.min(3, bottomRanked.length)).filter((id) => !episode.top2Ids.includes(id));
    episode.bottomIds = [];
    setSafeIds(season, episode);
    episode.notes.push("Non-elimination premiere: the weakest contestants are LOW, but nobody lip syncs for their life.");
  }

  function assignLateEntryPremiere(season, episode) {
    const ranked = rankedIds(episode);
    episode.winnerIds = [chooseWinnerFromCandidates(season, episode, ranked.slice(0, 3)) || ranked[0]].filter(Boolean);
    episode.highIds = ranked.slice(1, 3);
    episode.safeIds = ranked.slice(3);
    episode.lowIds = [];
    episode.bottomIds = [];
    episode.lateEntryRevealId = season.lateEntryId || null;
    episode.resultText = season.lateEntryId ? `I have someone else I want to add to the competition... Welcome a new contestant... ${fullDisplayName(season.contestants[season.lateEntryId])}!` : "Tonight, nobody's going home!";
  }

  function assignUK3Premiere(season, episode) {
    const ranked = rankedIds(episode);
    const bottomRanked = bottomRankedIds(episode);
    episode.top2Ids = ranked.slice(0, 2);
    episode.highIds = ranked.slice(2, 4);
    episode.bottomIds = chooseBottomsRespectingImmunity(season, episode, bottomRanked, 2);
    episode.lowIds = [];
    setSafeIds(season, episode);
    episode.notes.push("UK3 premiere: the top two lip sync for the win, and the bottom two lip sync for survival.");
  }



  function isRateAQueenEpisode(ep) {
    return ["rate_a_queen_split", "rate_a_queen_s17_split", "rate_a_queen_merge", "mid_season_rate_a_queen"].includes(ep?.specialPremiere);
  }

  function midSeasonRateAQueenBottomLipSyncs(ep) {
    if (ep?.type !== "mid_season_rate_a_queen") return [];
    return (ep.extraLipSyncs || []).filter((ls) => ls?.resultType === "mid_season_rate_a_queen_bottom1");
  }

  function hasMidSeasonRateAQueenBottomLipSync(ep) {
    return midSeasonRateAQueenBottomLipSyncs(ep).length > 0;
  }

  function buildRateAQueenBallots(season, episode) {
    const targetIds = (episode.rateAQueenTargetIds?.length ? episode.rateAQueenTargetIds : (episode.activeStartIds || season.activeIds || [])).filter(Boolean);
    const voterIds = (episode.rateAQueenVoterIds?.length ? episode.rateAQueenVoterIds : targetIds).filter(Boolean);
    const scoresById = new Map((episode.scores || []).map((score) => [score.id, score]));
    const totals = targetIds.map((id) => Number(scoresById.get(id)?.total || 0));
    const minTotal = Math.min(...totals);
    const maxTotal = Math.max(...totals);
    const span = Math.max(1, maxTotal - minTotal);
    const points = Object.fromEntries(targetIds.map((id) => [id, 0]));
    const rankTotals = Object.fromEntries(targetIds.map((id) => [id, 0]));
    const received = Object.fromEntries(targetIds.map((id) => [id, 0]));

    const ballots = voterIds.map((voterId) => {
      const choices = targetIds.filter((id) => id !== voterId).map((id) => {
        const perf = (Number(scoresById.get(id)?.total || 0) - minTotal) / span;
        const relationship = ((season.relationships[pairKey(voterId, id)] || 0) + 10) / 20;
        const noise = (Math.random() - 0.5) * 0.08;
        const score = perf * 0.50 + relationship * 0.50 + noise;
        return { id, score };
      }).sort((a, b) => b.score - a.score || fullDisplayName(season.contestants[a.id]).localeCompare(fullDisplayName(season.contestants[b.id])));

      const rankings = choices.map((choice, index) => {
        const rank = index + 1;
        const rankPoints = choices.length - index;
        points[choice.id] += rankPoints;
        rankTotals[choice.id] += rank;
        received[choice.id] += 1;
        return { id: choice.id, rank, rankPoints };
      });
      return { voterId, rankings };
    });

    const results = targetIds.map((id) => ({
      id,
      averageRank: received[id] ? rankTotals[id] / received[id] : targetIds.length,
      points: points[id] || 0,
      originalTotal: Number(scoresById.get(id)?.total || 0)
    })).sort((a, b) => a.averageRank - b.averageRank || b.points - a.points || b.originalTotal - a.originalTotal);

    episode.rateAQueenBallots = ballots;
    episode.rateAQueenResults = results;
    episode.scores = results.map((result, index) => {
      const old = scoresById.get(result.id) || { id: result.id, challengeScore: 0, runwayScore: 0, total: 0 };
      return {
        ...old,
        rateAQueenAverageRank: result.averageRank,
        rateAQueenPoints: result.points,
        rateAQueenOrder: index + 1,
        total: 1000 - result.averageRank * 25 + result.points * 0.01
      };
    });
    episode.notes.push("Rate-A-Queen: the ballots used 50% performance and 50% relationship influence.");
    return results;
  }

  function assignRateAQueenSplitPremiere(season, episode) {
    const results = buildRateAQueenBallots(season, episode);
    const ranked = results.map((item) => item.id);
    episode.top2Ids = ranked.slice(0, 2);
    episode.winnerIds = [];
    episode.highIds = [];
    episode.lowIds = [];
    episode.bottomIds = [];
    episode.safeIds = ranked.slice(2);
    episode.skipLipSyncThisEpisode = false;
    episode.notes.push("Rate-A-Queen premiere: only the Top 2 are announced, and nobody is up for elimination.");
  }

  function assignRateAQueenS17SplitPremiere(season, episode) {
    const results = buildRateAQueenBallots(season, episode);
    const ranked = results.map((item) => item.id);
    episode.top2Ids = ranked.slice(0, 2);
    episode.winnerIds = [];
    episode.highIds = [];
    episode.lowIds = [];
    episode.bottomIds = ranked.length ? [ranked.at(-1)] : [];
    episode.safeIds = ranked.slice(2, -1);
    episode.skipLipSyncThisEpisode = false;
    episode.notes.push("Rate-A-Queen S17 premiere: the opposite premiere group ranked the competing queens. The Top 2 lip sync, and the lowest-ranked queen is placed in the bottom.");
  }

  function assignMidSeasonRateAQueenPlacements(season, episode) {
    const results = buildRateAQueenBallots(season, episode);
    const ranked = results.map((item) => item.id);
    episode.top2Ids = ranked.slice(0, 2);
    episode.winnerIds = [];
    episode.highIds = [];
    episode.lowIds = [];
    episode.bottomIds = ranked.length ? [ranked.at(-1)] : [];
    episode.safeIds = ranked.slice(2, -1);
    episode.skipLipSyncThisEpisode = false;
    episode.noImmunityAward = true;
    episode.notes.push("Mid-Season Rate-A-Queen: the non-competing group ranked the Talent Show performers. The Top 2 lip sync for the win, and the lowest-ranked queen is placed in the bottom one.");
  }

  function assignRateAQueenMergePlacements(season, episode) {
    buildRateAQueenBallots(season, episode);
    assignRegularPlacements(season, episode);
    episode.notes.push("Merged Rate-A-Queen: placements are based solely on the average peer rankings.");
  }

  function maybeSpecialEpisodeOutcome(season, episode) {
    if (episode.premiere) return "regular";
    const count = season.activeIds.length;

    if (isRegularFormat(season)) {
      const groups = episode.maxiGroups || {};
      const slay = (groups.slayed || []).length;
      const great = (groups.great || []).length;
      const good = (groups.good || []).length;
      const bad = (groups.bad || []).length;
      const flop = (groups.flopped || []).length;
      const weakCount = bad + flop;

      if (!season.config.disableNonElimination && season.config.forceSlayersEpisode && !season.forceSlayersUsed && count <= 8 && count >= 4) {
        season.forceSlayersUsed = true;
        season.legacyEveryoneSlayedUsed = true;
        return "everyone_top";
      }

      if (!season.legacyMassLipSyncUsed && count >= 10 && weakCount >= 5 && weakCount < 7 && legacyChance(31)) {
        season.legacyMassLipSyncUsed = true;
        return "mass_lipsync";
      }

      if (!season.legacyEveryoneFloppedUsed && count >= 8 && slay === 0 && great === 0 && legacyChance(21)) {
        season.legacyEveryoneFloppedUsed = true;
        return "everyone_bad";
      }

      if (!season.config.disableNonElimination && !season.legacyEveryoneSlayedUsed && count >= 4 && (slay === count || (slay + great === count && legacyChance(21)))) {
        season.legacyEveryoneSlayedUsed = true;
        return "everyone_top";
      }

      if (!season.legacyCatastropheUsed && count > 7 && count < 10 && weakCount >= 7 && slay + great + good > 0 && legacyChance(71)) {
        season.legacyCatastropheUsed = true;
        return "winner_safe_lalaparuza_next";
      }
    }

    if (episode.teams?.mode === "groups" && season.teamJudgedEpisodes < 2 && Math.random() < 0.012) return "team_lipsync";
    if (episode.teams?.mode === "groups" && season.teamJudgedEpisodes < 2 && Math.random() < 0.008) return "whole_team_win";
    return "regular";
  }

  function assignLegacyMassLipSync(season, episode) {
    const ranked = legacyPerformanceOrder(episode);
    const weakCount = Math.min(6, ranked.length);
    const topPool = ranked.slice(0, Math.min(3, Math.max(1, ranked.length - weakCount)));
    const orderedTop = legacyTopOrder(episode, topPool);
    const firstScore = orderedTop[0] ? legacyScoreForId(episode, orderedTop[0], "legacyTopScore") : null;
    const secondScore = orderedTop[1] ? legacyScoreForId(episode, orderedTop[1], "legacyTopScore") : null;
    const doubleWin = orderedTop.length > 1 && Math.abs(firstScore - secondScore) < 0.000001 && legacyChance(60);

    episode.winnerIds = doubleWin ? orderedTop.slice(0, 2) : orderedTop.slice(0, 1);
    episode.highIds = orderedTop.filter((id) => !episode.winnerIds.includes(id));
    episode.lowIds = [];
    episode.bottomIds = bottomRankedIds(episode).slice(0, weakCount);
    episode.legacyMassLipSync = true;
    episode.notes.push(`For the first time in Drag Race herstory, the Bottom ${weakCount} will all lip sync for their lives.`);
    setSafeIds(season, episode);
  }

  function assignEveryoneTop(season, episode) {
    const ranked = rankedIds(episode);
    season.nonElimTop2Used = true;
    episode.top2Ids = ranked.slice(0, 2);
    episode.highIds = ranked.slice(2);
    episode.safeIds = [];
    episode.lowIds = [];
    episode.bottomIds = [];
    episode.notes.push("Everyone does well, so the episode becomes a non-elimination top two lip sync.");
  }

  function assignEveryoneBad(season, episode) {
    const bottomRanked = filterImmunityProtected(season, episode, bottomRankedIds(episode));
    season.everyoneBadUsed = true;
    episode.winnerIds = [];
    episode.highIds = [];
    const bottomDanger = bottomRanked.slice(0, 3);
    const lowChoice = state.config.mode === "rupaul" ? (chooseLowFromBottomDanger(season, bottomDanger) || bottomDanger[2]) : bottomDanger[2];
    episode.lowIds = lowChoice ? [lowChoice] : [];
    episode.bottomIds = bottomDanger.filter((id) => id !== lowChoice).slice(0, 2);
    setSafeIds(season, episode);
  }

  function assignWinnerSafeLalaparuzaNext(season, episode) {
    const ranked = rankedIds(episode);
    const chosenWinner = chooseWinnerFromCandidates(season, episode, ranked.slice(0, 3)) || ranked[0];
    episode.winnerIds = [chosenWinner].filter(Boolean);
    episode.lowIds = [];
    episode.highIds = [];
    episode.bottomIds = ranked.filter((id) => id !== chosenWinner && !isProtectedByImmunity(season, episode, id));
    episode.safeIds = ranked.filter((id) => id !== chosenWinner && isProtectedByImmunity(season, episode, id));
    episode.skipLipSyncThisEpisode = true;
    episode.lalaparuzaWarningText = "I'm sorry my dears, but you're up for elimination. None of you have impressed us this week. Next week we'll be having a LaLaPaRuZa smackdown, where one of you will be going home.";
    season.lalaparuzaTwistUsed = true;
    season.lalaparuzaQueued = { safeId: episode.winnerIds[0], competitorIds: episode.bottomIds.slice() };
  }

  function assignTeamLipSync(season, episode) {
    const groups = episode.teams?.groups || [];
    const rankedTeams = groups.map((team) => ({ ...team, total: average(team.ids.map((id) => episode.scores.find((s) => s.id === id)?.total || 0)) })).sort((a, b) => b.total - a.total);
    const winning = rankedTeams[0];
    const losing = rankedTeams.at(-1);
    const winningIds = winning?.ids || [];
    const weakWinningIds = new Set([...(episode.maxiGroups?.bad || []), ...(episode.maxiGroups?.flopped || [])].filter((id) => winningIds.includes(id)));
    const bestWinningId = winningIds.slice().sort((a, b) => (episode.scores.find((s) => s.id === b)?.total || 0) - (episode.scores.find((s) => s.id === a)?.total || 0))[0];
    episode.judgedInTeams = true;
    season.teamJudgedEpisodes += 1;
    episode.winningTeamIds = winningIds.slice();
    episode.teamWinMode = "solo";
    episode.winnerIds = bestWinningId ? [bestWinningId] : rankedIds(episode).slice(0, 1);
    episode.highIds = winningIds.filter((id) => !episode.winnerIds.includes(id));
    episode.lowIds = [];
    episode.bottomIds = filterImmunityProtected(season, episode, losing?.ids || bottomRankedIds(episode).filter((id) => !(episode.winningTeamIds || []).includes(id)).slice(0, 2));
    setSafeIds(season, episode);
  }

  function assignWholeTeamWin(season, episode) {
    const groups = episode.teams?.groups || [];
    const rankedTeams = groups.map((team) => ({ ...team, total: average(team.ids.map((id) => episode.scores.find((s) => s.id === id)?.total || 0)) })).sort((a, b) => b.total - a.total);
    const winning = rankedTeams[0];
    const winningIds = winning?.ids || [];
    const weakWinningIds = new Set([...(episode.maxiGroups?.bad || []), ...(episode.maxiGroups?.flopped || [])].filter((id) => winningIds.includes(id)));
    const bestWinningId = winningIds.slice().sort((a, b) => (episode.scores.find((s) => s.id === b)?.total || 0) - (episode.scores.find((s) => s.id === a)?.total || 0))[0];
    episode.judgedInTeams = true;
    season.teamJudgedEpisodes += 1;
    episode.winningTeamIds = winningIds.slice();
    if (weakWinningIds.size && winningIds.length > 3) {
      episode.winnerIds = bestWinningId ? [bestWinningId] : rankedIds(episode).slice(0, 1);
      episode.teamWinMode = "solo";
      episode.highIds = winningIds.filter((id) => !episode.winnerIds.includes(id));
      episode.notes.push(`${winning?.name || "The winning team"} wins the team challenge, but only one contestant is awarded the win.`);
    } else {
      episode.winnerIds = winningIds.length ? winningIds.slice() : rankedIds(episode).slice(0, 1);
      episode.teamWinMode = "team";
      episode.notes.push(`${winning?.name || "The winning team"} is so strong that every member wins the challenge.`);
    }
    const winningSet = new Set(winningIds);
    const bottomPoolRanked = bottomRankedIds(episode).filter((id) => !winningSet.has(id));
    if (episode.teamWinMode !== "solo") episode.highIds = [];
    episode.bottomIds = chooseBottomsRespectingImmunity(season, episode, bottomPoolRanked, 2);
    episode.lowIds = filterImmunityProtected(season, episode, bottomPoolRanked).filter((id) => !episode.bottomIds.includes(id)).slice(0, 1);
    setSafeIds(season, episode);
  }

  function shouldJudgeInTeams(season, episode) {
    if (isGoldenBeaverFormat(season)) return false;
    const chance = isAssassinFormat(season) ? 0.22 : 0.14;
    return episode.teams?.mode === "groups" && season.teamJudgedEpisodes < 3 && Math.random() < chance;
  }

  function shouldJudgeInPairs(season, episode) {
    if (isGoldenBeaverFormat(season)) return false;
    return episode.teams?.mode === "pairs" && season.pairJudgedEpisodes < 3 && Math.random() < 0.38;
  }

  function assignTeamJudgedPlacements(season, episode) {
    season.teamJudgedEpisodes += 1;
    const groups = episode.teams.groups.map((team) => ({ ...team, total: average(team.ids.map((id) => episode.scores.find((s) => s.id === id)?.total || 0)) })).sort((a, b) => b.total - a.total);
    const winning = groups[0];
    const winningIds = winning?.ids || [];
    episode.judgedInTeams = true;
    episode.winningTeamIds = winningIds.slice();
    const weakWinningIds = new Set([...(episode.maxiGroups?.bad || []), ...(episode.maxiGroups?.flopped || [])].filter((id) => winningIds.includes(id)));
    const bestWinningId = winningIds.slice().sort((a, b) => (episode.scores.find((s) => s.id === b)?.total || 0) - (episode.scores.find((s) => s.id === a)?.total || 0))[0];
    const secondTotal = groups[1]?.total ?? winning?.total ?? 0;
    const dominantSmallTeamWin = winningIds.length <= 3 && !weakWinningIds.size && ((Number(winning?.total || 0) - Number(secondTotal || 0)) >= 8 || Math.random() < 0.28);
    if (dominantSmallTeamWin) {
      episode.teamWinMode = "team";
      episode.winnerIds = winningIds.slice();
      episode.highIds = [];
    } else {
      episode.teamWinMode = "solo";
      episode.winnerIds = [bestWinningId].filter(Boolean);
      episode.highIds = winningIds.filter((id) => !episode.winnerIds.includes(id));
    }
    if (isAssassinFormat(season) && groups.length === 3) {
      const bottomTeam = groups.at(-1);
      episode.assassinThreeTeamBottom = true;
      episode.bottomIds = filterImmunityProtected(season, episode, bottomTeam?.ids || []);
      if (!episode.bottomIds.length) episode.bottomIds = bottomRankedIds(episode).filter((id) => !winningIds.includes(id)).slice(0, Math.min(3, Math.max(0, season.activeIds.length - winningIds.length)));
      episode.lowIds = [];
      episode.notes.push(`${bottomTeam?.name || "The lowest-ranked team"} is the bottom team, so the entire team is up for elimination.`);
      setSafeIds(season, episode);
      return;
    }
    const bottomPool = groups.length === 2 ? groups.at(-1).ids : groups.slice(1).flatMap((team) => team.ids);
    const bottomPoolRanked = bottomPool.slice().filter((id) => !winningIds.includes(id)).sort((a, b) => (episode.scores.find((s) => s.id === a)?.total || 0) - (episode.scores.find((s) => s.id === b)?.total || 0));
    episode.bottomIds = chooseBottomsRespectingImmunity(season, episode, bottomPoolRanked, 2);
    episode.lowIds = filterImmunityProtected(season, episode, bottomPoolRanked).filter((id) => !episode.bottomIds.includes(id)).slice(0, groups.length === 2 ? 1 : 2);
    setSafeIds(season, episode);
  }

  function assignPairJudgedPlacements(season, episode) {
    season.pairJudgedEpisodes += 1;
    const pairs = episode.teams.groups.map((team) => ({ ...team, total: average(team.ids.map((id) => episode.scores.find((s) => s.id === id)?.total || 0)) })).sort((a, b) => b.total - a.total);
    episode.winnerIds = pairs[0]?.ids || [];
    if (pairs.length <= 2) {
      episode.highIds = [];
      episode.lowIds = [];
      episode.bottomIds = chooseBottomsRespectingImmunity(season, episode, pairs.at(-1)?.ids || bottomRankedIds(episode), 2);
    } else if (pairs.length === 3) {
      episode.highIds = pairs[1]?.ids || [];
      episode.lowIds = [];
      episode.bottomIds = chooseBottomsRespectingImmunity(season, episode, pairs[2]?.ids || bottomRankedIds(episode), 2);
    } else {
      episode.highIds = pairs[1]?.ids || [];
      episode.lowIds = filterImmunityProtected(season, episode, pairs.at(-2)?.ids || []);
      episode.bottomIds = chooseBottomsRespectingImmunity(season, episode, pairs.at(-1)?.ids || bottomRankedIds(episode), 2);
    }
    const winnerSet = new Set(episode.winnerIds || []);
    episode.lowIds = (episode.lowIds || []).filter((id) => !winnerSet.has(id));
    episode.bottomIds = (episode.bottomIds || []).filter((id) => !winnerSet.has(id));
    setSafeIds(season, episode);
    episode.notes.push("This pair challenge is judged in pairs.");
  }

  function chooseBottomsRespectingImmunity(season, episode, candidates, count) {
    const result = [];
    const skipped = [];
    candidates.forEach((id) => {
      if (result.length >= count) return;
      if (isProtectedByImmunity(season, episode, id)) {
        skipped.push(id);
        episode.immunityProtectedIds = [...new Set([...(episode.immunityProtectedIds || []), id])];
        if (!episode.notes.some((note) => note.includes(fullDisplayName(season.contestants[id])) || note.includes(displayName(season.contestants[id])))) {
          episode.notes.push(`${displayName(season.contestants[id])} is protected by immunity and cannot be placed in the bottom.`);
        }
      } else {
        result.push(id);
      }
    });
    if (result.length < count) {
      candidates.forEach((id) => { if (!result.includes(id) && !skipped.includes(id) && result.length < count) result.push(id); });
    }
    return result;
  }

  function setSafeIds(season, episode) {
    const assigned = new Set([...episode.winnerIds, ...episode.top2Ids, ...episode.highIds, ...episode.lowIds, ...episode.bottomIds, ...episode.savedIds]);
    episode.safeIds = season.activeIds.filter((id) => !assigned.has(id));
  }

  function average(nums) { return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; }

  function resolveLipSyncsAndEliminations(season, episode) {
    enforceImmunitySafety(season, episode);
    if (episode.skipLipSyncThisEpisode) {
      episode.eliminatedIds = [];
      return;
    }
    if (shouldUseAllStarsFormat(season, episode) && isLegacyFormat(season)) {
      resolveLegacyLipSync(season, episode);
      return;
    }
    if (shouldUseAllStarsFormat(season, episode) && isAssassinFormat(season)) {
      resolveAssassinLipSync(season, episode);
      return;
    }
    if (isTeamsFormat(season) && episode.teamFormatEpisode) {
      resolveTeamsLipSync(season, episode);
      return;
    }
    if (episode.top2Ids.length) {
      const topLipSyncContext = ["uk3", "mid_season_rate_a_queen"].includes(episode.specialPremiere) ? "Lip Sync For The Win" : "Top Two Lip Sync";
      const topLipSync = applyRupaulLipSyncChoice(season, createLipSync(season, episode.top2Ids, topLipSyncContext));
      const winner = topLipSync.winnerId;
      const winnerLine = `${displayName(season.contestants[winner])}, you're a winner, baby!`;
      topLipSync.resultTextLine = winnerLine;
      const loser = episode.top2Ids.find((id) => id !== winner);
      if (loser) topLipSync.loserId = loser;
      episode.winnerIds = [winner];
      if (!["rate_a_queen_split", "rate_a_queen_s17_split", "mid_season_rate_a_queen"].includes(episode.specialPremiere)) episode.highIds = [...new Set([...episode.highIds, ...episode.top2Ids.filter((id) => id !== winner)])];
      episode.lipSync = topLipSync;
      episode.resultText = winnerLine;
      episode.topLipSyncResultText = winnerLine;
      episode.top2Ids.forEach((id) => updateLipSyncStats(season, id, id === winner));
    }

    if (episode.specialPremiere === "mid_season_rate_a_queen") {
      episode.eliminatedIds = [];
      return;
    }

    if (episode.specialPremiere === "rate_a_queen_s17_split") {
      if (episode.rateAQueenS17FinalPremiere && season.rateAQueenS17FirstBottomId && episode.bottomIds?.length) {
        resolveRateAQueenS17BottomLipSync(season, episode, [season.rateAQueenS17FirstBottomId, episode.bottomIds[0]]);
      } else {
        episode.eliminatedIds = [];
      }
      return;
    }

    if (episode.specialPremiere === "uk3" && episode.bottomIds.length >= 2) {
      const survival = resolveBottomLipSync(season, episode, episode.bottomIds.slice(0, 2), true);
      episode.extraLipSyncs.push(survival.lipSync);
      return;
    }

    if (episode.bottomIds.length === 0) {
      episode.eliminatedIds = [];
      return;
    }

    if (episode.legacyMassLipSync && episode.bottomIds.length > 2) {
      resolveLegacyMassLipSync(season, episode, episode.bottomIds);
      return;
    }

    if (episode.legacyThreeWayLipSync && episode.bottomIds.length === 3) {
      resolveLegacyThreeWayLipSync(season, episode, episode.bottomIds);
      return;
    }

    if (episode.bottomIds.length > 2) {
      resolveMultiPersonLipSync(season, episode, episode.bottomIds);
      return;
    }

    resolveBottomLipSync(season, episode, episode.bottomIds.slice(0, 2), false);
  }


  function chooseTeamLipSyncer(season, pair, song) {
    const ranked = (pair.ids || []).map((id) => ({
      id,
      score: calculateLegacyLipSyncPerformance(season, id, false).mechanicalScore
    })).sort((a, b) => b.score - a.score);
    return Math.random() < 0.68 ? ranked[0]?.id : randomItem(pair.ids);
  }

  function resolveTeamsLipSync(season, episode) {
    const bottomPairs = activeTeamPairs(season).filter((pair) => pair.ids.some((id) => (episode.bottomIds || []).includes(id)) && pair.ids.length === 2);
    if (episode.teamTopFourLipSync) {
      const pair = bottomPairs[0] || teamPairForId(season, (episode.bottomIds || [])[0]);
      if (!pair || pair.ids.length < 2) { episode.eliminatedIds = []; return; }
      const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, pair.ids.slice(), "Team Lip Sync For Your Life"));
      const doubleShantay = state.config.mode === "rupaul" ? false : maybeDoubleShantay(season, episode, pair.ids, lipSync.performances);
      episode.teamLipSyncParticipantIds = pair.ids.slice();
      if (doubleShantay) {
        lipSync.resultType = "double_shantay";
        season.doubleShantaysUsed += 1;
        season.lastDoubleShantayEpisode = episode.number;
        season.teamsFinalistOverride = 4;
        episode.savedIds.push(...pair.ids);
        episode.eliminatedIds = [];
        episode.resultText = `${formatList(pair.ids, season)}, shantay you both stay. The pairs are dissolved for the finale.`;
      } else {
        lipSync.resultType = "team_top_four_elimination";
        const eliminatedId = lipSync.loserId;
        const savedId = pair.ids.find((id) => id !== eliminatedId) || lipSync.winnerId;
        episode.savedIds.push(savedId);
        episode.eliminatedIds = [eliminatedId];
        episode.resultText = `${displayName(season.contestants[savedId])}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, sashay away. The pairs are dissolved for the finale.`;
      }
      episode.lipSync = lipSync;
      pair.ids.forEach((id) => updateLipSyncStats(season, id, !episode.eliminatedIds.includes(id)));
      return;
    }

    if (bottomPairs.length < 2) { resolveBottomLipSync(season, episode, (episode.bottomIds || []).slice(0, 2), false); return; }
    const song = pickSong(season);
    const pairResults = bottomPairs.slice(0, 2).map((pair) => {
      const initialId = chooseTeamLipSyncer(season, pair, song);
      const standbyId = pair.ids.find((id) => id !== initialId);
      const pairUsed = (season.teamShemergencyUsedPairs || []).includes(pair.id);
      const shemergency = !!(standbyId && !pairUsed && Math.random() < 0.08);
      const initialPerformance = calculateLegacyLipSyncPerformance(season, initialId, false);
      let score = initialPerformance.mechanicalScore;
      let stepInPerformance = null;
      if (shemergency) {
        stepInPerformance = calculateLegacyLipSyncPerformance(season, standbyId, false);
        score = (initialPerformance.mechanicalScore + stepInPerformance.mechanicalScore) / 2;
        season.teamShemergencyUsedPairs.push(pair.id);
      }
      return {
        pairId: pair.id,
        ids: pair.ids.slice(),
        initialId,
        standbyId,
        shemergency,
        stepInId: shemergency ? standbyId : null,
        initialScore: initialPerformance.displayScore,
        initialRawScore: initialPerformance.rawScore,
        initialMechanicalScore: initialPerformance.mechanicalScore,
        stepInScore: stepInPerformance?.displayScore ?? null,
        stepInRawScore: stepInPerformance?.rawScore ?? null,
        stepInMechanicalScore: stepInPerformance?.mechanicalScore ?? null,
        score
      };
    }).sort((a, b) => b.score - a.score);
    const winningPair = pairResults[0];
    const losingPair = pairResults.at(-1);
    const performances = [];
    pairResults.forEach((result) => {
      performances.push({
        id: result.initialId,
        score: result.initialScore,
        rawScore: result.initialRawScore,
        mechanicalScore: result.initialMechanicalScore,
        pairScore: result.score,
        band: legacyLipSyncBand(result.initialRawScore),
        comment: lipSyncComment(song, result.initialId, result.initialScore)
      });
      if (result.shemergency && result.stepInId) {
        performances.push({
          id: result.stepInId,
          score: result.stepInScore,
          rawScore: result.stepInRawScore,
          mechanicalScore: result.stepInMechanicalScore,
          pairScore: result.score,
          band: legacyLipSyncBand(result.stepInRawScore),
          comment: `${nickDisplayName(season.contestants[result.stepInId])} hits the She-Mergency button and takes over for their pair.`
        });
      }
    });
    const lipSync = {
      context: "Team Lip Sync For Your Life",
      song,
      ids: pairResults.flatMap((result) => [result.initialId, result.stepInId].filter(Boolean)),
      performances: performances.sort((a, b) => (b.pairScore ?? b.score) - (a.pairScore ?? a.score)),
      winnerId: winningPair.initialId,
      loserId: losingPair.initialId,
      resultType: "team_pair_elimination",
      teamPairResults: pairResults,
      shemergencyText: pairResults.filter((result) => result.shemergency).map((result) => `${fullDisplayName(season.contestants[result.stepInId])} has hit the She-Mergency button!`)
    };
    const eliminatedIds = losingPair.ids.slice();
    const savedIds = winningPair.ids.slice();
    episode.lipSync = lipSync;
    episode.teamLipSyncPairResults = pairResults;
    episode.teamLipSyncParticipantIds = pairResults.flatMap((result) => [result.initialId, result.stepInId].filter(Boolean));
    episode.teamLipSyncInitialIds = pairResults.map((result) => result.initialId);
    episode.teamShemergencyParticipantIds = pairResults.map((result) => result.stepInId).filter(Boolean);
    episode.teamPartnerSafeIds = savedIds.filter((id) => !episode.teamLipSyncParticipantIds.includes(id));
    episode.teamPartnerElimIds = eliminatedIds.filter((id) => !episode.teamLipSyncParticipantIds.includes(id));
    episode.savedIds.push(...savedIds);
    episode.eliminatedIds.push(...eliminatedIds);
    episode.resultText = `${savedIds.map((id) => displayName(season.contestants[id])).join(" & ")}, shantay you stay. ${displayName(season.contestants[losingPair.initialId])}, sashay away...`;
    pairResults.forEach((result) => {
      [result.initialId, result.stepInId].filter(Boolean).forEach((id) => updateLipSyncStats(season, id, result.pairId === winningPair.pairId));
    });
  }

  function resolveRateAQueenS17BottomLipSync(season, episode, ids) {
    const cleanIds = ids.filter((id, index, arr) => id && arr.indexOf(id) === index && season.activeIds.includes(id));
    if (cleanIds.length < 2) return;
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, cleanIds, "Lip Sync For Your Life"));
    const savedId = lipSync.winnerId;
    const eliminatedId = cleanIds.find((id) => id !== savedId) || lipSync.loserId;
    lipSync.resultType = "elimination";
    lipSync.roundResultText = `${displayName(season.contestants[savedId])}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, sashay away.`;
    episode.savedIds.push(savedId);
    episode.eliminatedIds.push(eliminatedId);
    episode.extraLipSyncs.push(lipSync);
    episode.s17SurvivalResultText = lipSync.roundResultText;
    cleanIds.forEach((id) => updateLipSyncStats(season, id, id === savedId));
  }

  function pickSong(season) {
    const songs = getLipSyncData();
    const unused = songs.filter((song) => !season.usedLipSyncIds.includes(song.id));
    const song = clone(randomItem(unused.length ? unused : songs));
    if (!unused.length) {
      song.id = `${song.id || "song"}_encore_${season.episodeCounter}_${season.usedLipSyncIds.length}`;
      song.title = `${song.title || song.name || "Lip Sync Song"} (Encore ${season.usedLipSyncIds.length + 1})`;
    }
    season.usedLipSyncIds.push(song.id);
    return song;
  }

  function createLipSync(season, ids, context = "Lip Sync") {
    const song = pickSong(season);
    const performances = ids.map((id) => {
      const performance = calculateLegacyLipSyncPerformance(season, id, false);
      return {
        id,
        score: performance.displayScore,
        rawScore: performance.rawScore,
        mechanicalScore: performance.mechanicalScore,
        band: legacyLipSyncBand(performance.rawScore),
        comment: lipSyncComment(song, id, performance.displayScore)
      };
    }).sort((a, b) => b.mechanicalScore - a.mechanicalScore);
    return {
      context,
      song,
      ids,
      performances,
      winnerId: performances[0]?.id || ids[0],
      loserId: performances.at(-1)?.id || ids.at(-1),
      resultType: "standard"
    };
  }

  function createLipSyncLipOnly(season, ids, context = "Lip Sync") {
    const song = pickSong(season);
    const performances = ids.map((id) => {
      const performance = calculateLegacyLipSyncPerformance(season, id, true);
      return {
        id,
        score: performance.displayScore,
        rawScore: performance.rawScore,
        mechanicalScore: performance.mechanicalScore,
        band: legacyLipSyncBand(performance.rawScore),
        comment: lipSyncComment(song, id, performance.displayScore)
      };
    }).sort((a, b) => b.mechanicalScore - a.mechanicalScore);
    return {
      context,
      song,
      ids,
      performances,
      winnerId: performances[0]?.id || ids[0],
      loserId: performances.at(-1)?.id || ids.at(-1),
      resultType: "standard"
    };
  }

  function createLipSyncFromSong(season, ids, song, context = "Lip Sync") {
    const performances = ids.map((id) => {
      const performance = calculateLegacyLipSyncPerformance(season, id, false);
      return {
        id,
        score: performance.displayScore,
        rawScore: performance.rawScore,
        mechanicalScore: performance.mechanicalScore,
        band: legacyLipSyncBand(performance.rawScore),
        comment: lipSyncComment(song, id, performance.displayScore)
      };
    }).sort((a, b) => b.mechanicalScore - a.mechanicalScore);
    return {
      context,
      song,
      ids,
      performances,
      winnerId: performances[0]?.id || ids[0],
      loserId: performances.at(-1)?.id || ids.at(-1),
      resultType: "standard"
    };
  }

  function normalizeLipSyncGenre(value) {
    return String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  }

  function getLipSyncPerformanceComments() {
    const raw = window.LIPSYNC_PERFORMANCE_COMMENTS
      || window.DRAG_RACE_LIPSYNC_PERFORMANCE_COMMENTS
      || window.DRAG_LIPSYNC_PERFORMANCE_COMMENTS
      || {};
    return raw && typeof raw === "object" ? raw : {};
  }

  function lipSyncSongGenres(song) {
    const genres = [];
    if (Array.isArray(song?.genres)) genres.push(...song.genres);
    else if (song?.genres) genres.push(song.genres);
    if (Array.isArray(song?.genre)) genres.push(...song.genre);
    else if (song?.genre) genres.push(song.genre);
    if (song?.energy) genres.push(song.energy);
    return genres.map((genre) => String(genre || "").trim()).filter(Boolean);
  }

  function pickLipSyncCommentGenre(song, commentsMap) {
    const available = Object.keys(commentsMap || {}).filter((genre) => commentsMap[genre] && typeof commentsMap[genre] === "object");
    if (!available.length) return "";
    const lookup = {};
    available.forEach((genre) => { lookup[normalizeLipSyncGenre(genre)] = genre; });

    const matchingGenres = lipSyncSongGenres(song)
      .map((genre) => lookup[normalizeLipSyncGenre(genre)])
      .filter(Boolean);

    return matchingGenres.length ? randomItem(matchingGenres) : randomItem(available);
  }

  function pickLipSyncCommentList(song, score) {
    const band = score >= 85 ? "slayed" : score >= 62 ? "good" : "bad";
    const simpleBand = score >= 62 ? "good" : "bad";
    const commentsMap = getLipSyncPerformanceComments();
    const genre = pickLipSyncCommentGenre(song, commentsMap);
    const genreComments = genre ? commentsMap[genre] : null;

    if (genreComments && Array.isArray(genreComments[band]) && genreComments[band].length) return genreComments[band];
    if (genreComments && Array.isArray(genreComments[simpleBand]) && genreComments[simpleBand].length) return genreComments[simpleBand];

    if (Array.isArray(song?.comments?.[band]) && song.comments[band].length) return song.comments[band];
    if (Array.isArray(song?.comments?.[simpleBand]) && song.comments[simpleBand].length) return song.comments[simpleBand];

    return fallbackLipSyncs[0].comments[band] || fallbackLipSyncs[0].comments[simpleBand] || [];
  }

  function lipSyncComment(song, id, score) {
    const queenName = nickDisplayName(state.season.contestants[id]);
    const list = pickLipSyncCommentList(song, score);
    const template = randomItem(list) || "{Name} gives the lip sync everything they have.";
    return String(template)
      .replace(/\{queen\}/gi, queenName)
      .replace(/\{name\}/gi, queenName)
      .replace(/\{contestant\}/gi, queenName);
  }

  function legacyLipSyncBand(rawScore) {
    if (rawScore > 11) return "slayed";
    if (rawScore >= 8) return "great";
    if (rawScore >= 4) return "good";
    if (rawScore >= 2) return "bad";
    return "flopped";
  }

  function legacyLipSyncDisplayScore(rawScore) {
    return clamp(Math.round((Number(rawScore || 0) / 15) * 100), 0, 100);
  }

  function calculateLegacyLipSyncPerformance(season, id, forcePure = false) {
    const queen = season.contestants[id] || {};
    const stats = season.stats[id] || {};
    const rawScore = randInt(0, Math.max(0, Number(queen.skills?.lipsync || 0)));
    const pure = forcePure
      || season.config.disableLipSyncRiggory
      || isLegacyFormat(season)
      || isAssassinFormat(season)
      || isAllWinnersFormat(season);
    const mechanicalScore = pure
      ? rawScore
      : rawScore + Number(stats.favoritism || 0) - Number(stats.unfavoritism || 0);
    return {
      rawScore,
      mechanicalScore,
      displayScore: legacyLipSyncDisplayScore(rawScore)
    };
  }

  function calculateLipSyncScore(season, id, song) {
    return calculateLegacyLipSyncPerformance(season, id, false).mechanicalScore;
  }

  function trackRecordPower(season, id) {
    const stats = season.stats[id];
    if (!stats) return 50;
    const score = 50 + stats.wins * 14 + stats.highs * 5 + stats.lows * -4 + stats.bottoms * -8 + stats.lipSyncWins * 3 + stats.popularity * 0.15;
    return clamp(score, 0, 100);
  }

  function resolveLegacyLipSync(season, episode) {
    const top2 = (episode.top2Ids || []).slice(0, 2);
    const bottoms = (episode.bottomIds || []).slice();
    if (top2.length < 2 || !bottoms.length) {
      episode.eliminatedIds = [];
      return;
    }
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, top2, "Lip Sync For Your Legacy"));
    episode.legacyLipsticks = top2.map((id) => ({ voterId: id, lipstickId: chooseEliminationVote(season, id, bottoms, episode, "legacy") }));
    const winnerChoice = episode.legacyLipsticks.find((vote) => vote.voterId === lipSync.winnerId)?.lipstickId || episode.legacyLipsticks[0]?.lipstickId || bottoms[0];
    lipSync.resultType = "legacy_elimination";
    lipSync.loserId = top2.find((id) => id !== lipSync.winnerId) || lipSync.loserId;
    episode.lipSync = lipSync;
    if (maybeResolveLegacyWinnerQuit(season, episode, lipSync, top2)) return;
    episode.legacyLipSyncLoserId = lipSync.loserId;
    episode.legacyEliminationChoiceId = winnerChoice || null;
    episode.winnerIds = [lipSync.winnerId];
    episode.highIds = [...new Set([...(episode.highIds || []), ...top2.filter((id) => id !== lipSync.winnerId)])];
    const chocolateSaved = winnerChoice ? applyChocolateBar(season, episode, winnerChoice) : false;
    if (winnerChoice && !chocolateSaved) episode.eliminatedIds = [winnerChoice];
    episode.resultText = chocolateSaved ? nonEliminationSaveResultText(season, winnerChoice, "Golden Bar") : (winnerChoice ? `${displayName(season.contestants[winnerChoice])}, as it is written, so it shall be done... Sashay Away.` : "The episode ends with no elimination.");
    if (chocolateSaved) lipSync.resultType = "chocolate_save";
    top2.forEach((id) => updateLipSyncStats(season, id, id === lipSync.winnerId));
  }

  function buildRumocracyVotes(season, episode) {
    const bottomIds = (episode.bottomIds || []).slice();
    const voters = season.activeIds.slice();
    return voters.map((voterId) => ({
      voterId,
      votedForId: chooseEliminationVote(season, voterId, bottomIds, episode, "assassin")
    })).filter((vote) => vote.votedForId);
  }

  function resolveAssassinEliminationDecision(season, episode, lipSync) {
    const winnerId = (episode.winnerIds || [])[0];
    const bottomIds = (episode.bottomIds || []).slice();
    if (!bottomIds.length || !winnerId) return null;
    episode.rumocracyVotes = episode.rumocracyVotes?.length ? episode.rumocracyVotes : buildRumocracyVotes(season, episode);
    const topVote = episode.rumocracyVotes.find((vote) => vote.voterId === winnerId)?.votedForId || chooseEliminationVote(season, winnerId, bottomIds, episode, "assassin");
    episode.assassinWinnerChoiceId = topVote;
    const groupVotes = episode.rumocracyVotes.filter((vote) => vote.voterId !== winnerId);
    const groupDetails = groupVoteDetails(groupVotes, null);
    const groupChoice = groupDetails.choiceId || topVote || bottomIds[0];
    episode.assassinGroupChoiceId = groupChoice;
    episode.assassinGroupTieBrokenByTop = false;
    const assassinWon = lipSync?.winnerId && state.season.contestants[lipSync.winnerId]?.isAssassin;
    episode.assassinEliminationChoiceId = assassinWon ? groupChoice : topVote;
    return episode.assassinEliminationChoiceId;
  }

  function resolveAssassinLipSync(season, episode) {
    const winnerId = (episode.winnerIds || [])[0];
    const bottomIds = (episode.bottomIds || []).slice();
    if (!winnerId || !bottomIds.length) { episode.eliminatedIds = []; return; }
    episode.rumocracyVotes = buildRumocracyVotes(season, episode);
    const assassinId = pickLipSyncAssassin(season);
    if (!assassinId) { resolveBottomLipSync(season, episode, bottomIds.slice(0, 2), false); return; }
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, [winnerId, assassinId], "Lip Sync For Your Legacy"));
    lipSync.assassinId = assassinId;
    lipSync.isAssassinLipSync = true;
    const assassinWon = !!state.season.contestants[lipSync.winnerId]?.isAssassin;
    if (assassinWon) episode.assassinTopLostId = winnerId;
    lipSync.resultType = assassinWon ? "assassin_group_vote" : "assassin_sole_vote";
    episode.lipSync = lipSync;
    const eliminatedId = resolveAssassinEliminationDecision(season, episode, lipSync);
    const chocolateSaved = eliminatedId ? applyChocolateBar(season, episode, eliminatedId) : false;
    if (eliminatedId && !chocolateSaved) episode.eliminatedIds = [eliminatedId];
    episode.resultText = chocolateSaved ? nonEliminationSaveResultText(season, eliminatedId, "Golden Bar") : (eliminatedId ? `${displayName(season.contestants[eliminatedId])}, as it is written, so it shall be done... Sashay Away.` : "The episode ends with no elimination.");
    if (chocolateSaved) lipSync.resultType = "chocolate_save";
    updateLipSyncStats(season, winnerId, lipSync.winnerId === winnerId);
    season.votingStats = season.votingStats || [];
    season.votingStats.push({
      label: episode.label,
      votes: episode.rumocracyVotes,
      winnerId,
      assassinId,
      lipSyncWinnerId: lipSync.winnerId,
      assassinWon: !!state.season.contestants[lipSync.winnerId]?.isAssassin,
      soleChoiceId: episode.assassinWinnerChoiceId,
      groupChoiceId: episode.assassinGroupChoiceId,
      groupTieBrokenByTop: !!episode.assassinGroupTieBrokenByTop,
      eliminatedId,
      bottomIds: bottomIds.slice(),
      activeStartIds: episode.activeStartIds.slice()
    });
  }

  function resolveBottomLipSync(season, episode, ids, isExtra) {
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, ids, "Lip Sync For Your Life"));
    if (maybeResolveBottomUnplannedExit(season, episode, ids, lipSync)) {
      if (!isExtra) episode.lipSync = lipSync;
      return { lipSync };
    }
    const best = lipSync.performances.find((perf) => perf.id === lipSync.winnerId) || lipSync.performances[0];
    const worst = lipSync.performances.find((perf) => perf.id === lipSync.loserId) || lipSync.performances.at(-1);
    const doubleShantay = state.config.mode === "rupaul" ? false : maybeDoubleShantay(season, episode, ids, lipSync.performances);
    const doubleSashay = !doubleShantay && (state.config.mode === "rupaul" ? false : maybeDoubleSashay(season, ids, lipSync.performances));

    if (doubleShantay) {
      lipSync.resultType = "double_shantay";
      season.doubleShantaysUsed += 1;
      season.lastDoubleShantayEpisode = episode.number;
      episode.savedIds.push(...ids);
      episode.eliminatedIds = [];
      if (legacyChance(6)) {
        lipSync.kandyFakeout = true;
        episode.resultText = `${displayName(season.contestants[lipSync.loserId])}, sashay away... Wait! I am not ready to see you go. Shantay, you both stay!`;
      } else {
        episode.resultText = "Shantay you both stay!";
      }
    } else if (doubleSashay) {
      lipSync.resultType = "double_sashay";
      season.doubleSashaysUsed += 1;
      const goldenSaved = ids.find((id) => applyChocolateBar(season, episode, id));
      episode.eliminatedIds.push(...ids.filter((id) => id !== goldenSaved));
      if (goldenSaved) lipSync.resultType = "double_sashay_chocolate_save";
      episode.resultText = goldenSaved ? `${displayName(season.contestants[goldenSaved])}, your chocolate bar is golden. You are safe. ${formatList(ids.filter((id) => id !== goldenSaved), season)}, sashay away.` : "Neither one of you survived the lip sync. Now... I must ask both of you to sashay away.";
    } else {
      const eliminatedId = worst.id;
      const savedId = best.id;
      lipSync.resultType = "elimination";
      episode.savedIds.push(savedId);
      const chocolateSaved = applyChocolateBar(season, episode, eliminatedId);
      if (chocolateSaved) {
        lipSync.resultType = "chocolate_save";
        episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Golden Bar");
      } else {
        episode.eliminatedIds.push(eliminatedId);
        if (applyLuckyCowSave(season, episode, eliminatedId, lipSync)) {
          episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Lucky Cow");
        } else {
          markLuckyCowFailure(season, episode, eliminatedId);
          const badonkaSaved = maybeCreateBadonkaPull(season, episode, eliminatedId, lipSync);
          if (badonkaSaved) episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Badonka Dunk Tank");
        }
      }
      episode.resultText ||= `${displayName(season.contestants[savedId])}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, sashay away.`;
    }

    ids.forEach((id) => updateLipSyncStats(season, id, !episode.eliminatedIds.includes(id)));
    if (!isExtra) episode.lipSync = lipSync;
    return { lipSync };
  }

  function resolveLegacyThreeWayLipSync(season, episode, ids) {
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, ids, "Three-Way Lip Sync For Your Life"));
    const [first, second, third] = lipSync.performances;
    const oneElimination = Number(first?.rawScore || 0) > 3 && Number(second?.rawScore || 0) > 3 && legacyChance(91);
    episode.lipSync = lipSync;

    if (oneElimination) {
      const eliminatedId = third.id;
      const survivorIds = [first.id, second.id];
      episode.savedIds.push(...survivorIds);
      const chocolateSaved = applyChocolateBar(season, episode, eliminatedId);
      if (chocolateSaved) {
        lipSync.resultType = "chocolate_save";
        episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Golden Bar");
      } else {
        episode.eliminatedIds.push(eliminatedId);
        const badonkaSaved = maybeCreateBadonkaPull(season, episode, eliminatedId, lipSync);
        if (badonkaSaved) episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Badonka Dunk Tank");
      }
      episode.resultText ||= `${formatList(survivorIds, season)}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, sashay away.`;
      lipSync.resultType ||= "three_way_elimination";
    } else {
      lipSync.resultType = "three_way_double_elimination";
      const safeId = first.id;
      const endangered = [second.id, third.id];
      episode.savedIds.push(safeId);
      const goldenSaved = endangered.find((id) => applyChocolateBar(season, episode, id));
      episode.eliminatedIds.push(...endangered.filter((id) => id !== goldenSaved));
      if (goldenSaved) lipSync.resultType = "three_way_double_elimination_chocolate_save";
      season.doubleSashaysUsed += 1;
      episode.resultText = goldenSaved
        ? `${displayName(season.contestants[safeId])}, shantay you stay. ${displayName(season.contestants[goldenSaved])}, your chocolate bar is golden. ${formatList(endangered.filter((id) => id !== goldenSaved), season)}, sashay away.`
        : `${displayName(season.contestants[safeId])}, shantay you stay. ${formatList(endangered, season)}, sashay away.`;
    }

    ids.forEach((id) => updateLipSyncStats(season, id, !episode.eliminatedIds.includes(id)));
  }

  function resolveLegacyMassLipSync(season, episode, ids) {
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, ids, `Bottom ${ids.length} Lip Sync For Your Life`));
    const performances = lipSync.performances;
    const automaticSafe = performances.slice(0, Math.max(0, performances.length - 2)).map((performance) => performance.id);
    const finalTwo = performances.slice(-2);
    episode.savedIds.push(...automaticSafe);
    episode.lipSync = lipSync;

    const doubleSashay = finalTwo.length === 2 && maybeDoubleSashay(season, finalTwo.map((performance) => performance.id), finalTwo);
    if (doubleSashay) {
      lipSync.resultType = "mass_lipsync_double_sashay";
      season.doubleSashaysUsed += 1;
      const endangered = finalTwo.map((performance) => performance.id);
      const goldenSaved = endangered.find((id) => applyChocolateBar(season, episode, id));
      episode.eliminatedIds.push(...endangered.filter((id) => id !== goldenSaved));
      if (goldenSaved) lipSync.resultType = "mass_lipsync_double_sashay_chocolate_save";
      episode.resultText = goldenSaved
        ? `${formatList([...automaticSafe, goldenSaved], season)}, shantay you stay. ${formatList(endangered.filter((id) => id !== goldenSaved), season)}, sashay away.`
        : `${formatList(automaticSafe, season)}, shantay you stay. ${formatList(endangered, season)}, sashay away.`;
    } else {
      const savedId = finalTwo[0]?.id;
      const eliminatedId = finalTwo[1]?.id;
      if (savedId) episode.savedIds.push(savedId);
      if (eliminatedId) {
        const chocolateSaved = applyChocolateBar(season, episode, eliminatedId);
        if (chocolateSaved) {
          lipSync.resultType = "chocolate_save";
          episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Golden Bar");
        } else {
          episode.eliminatedIds.push(eliminatedId);
          if (applyLuckyCowSave(season, episode, eliminatedId, lipSync)) {
            episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Lucky Cow");
          } else {
            markLuckyCowFailure(season, episode, eliminatedId);
            const badonkaSaved = maybeCreateBadonkaPull(season, episode, eliminatedId, lipSync);
            if (badonkaSaved) episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Badonka Dunk Tank");
          }
        }
        episode.resultText ||= `${formatList([...automaticSafe, savedId].filter(Boolean), season)}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, sashay away.`;
      }
      lipSync.resultType ||= "mass_lipsync_elimination";
    }

    ids.forEach((id) => updateLipSyncStats(season, id, !episode.eliminatedIds.includes(id)));
  }

  function resolveMultiPersonLipSync(season, episode, ids) {
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, ids, "Team Lip Sync For Your Life"));
    const eliminatedId = lipSync.performances.at(-1).id;
    lipSync.resultType = "team_elimination";
    episode.savedIds.push(...ids.filter((id) => id !== eliminatedId));
    const chocolateSaved = applyChocolateBar(season, episode, eliminatedId);
    if (chocolateSaved) {
      lipSync.resultType = "chocolate_save";
      episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Golden Bar");
    } else {
      episode.eliminatedIds.push(eliminatedId);
      const badonkaSaved = maybeCreateBadonkaPull(season, episode, eliminatedId, lipSync);
      if (badonkaSaved) episode.resultText = nonEliminationSaveResultText(season, eliminatedId, "Badonka Dunk Tank");
    }
    episode.lipSync = lipSync;
    episode.resultText ||= `${formatList(ids.filter((id) => id !== eliminatedId), season)} survive the lip sync. ${displayName(season.contestants[eliminatedId])}, sashay away.`;
    ids.forEach((id) => updateLipSyncStats(season, id, id !== eliminatedId));
  }

  function maybeDoubleShantay(season, episode, ids, performances) {
    if (season.config.disableDoubleShantaysSashays || season.doubleShantaysUsed >= 1 || ids.length !== 2) return false;
    const raw = (performances || []).map((performance) => Number(performance.rawScore ?? 0));
    const organic = raw.length === 2 && raw[0] > 7 && raw[1] > 7 && legacyChance(51);
    const count = season.activeIds.length;
    if (organic) {
      if (season.config.forceDoubleShantay && count <= 9 && count >= 5) season.forceDoubleShantayUsed = true;
      return true;
    }
    if (season.config.forceDoubleShantay && !season.forceDoubleShantayUsed && count <= 9 && count >= 5) {
      season.forceDoubleShantayUsed = true;
      return true;
    }
    return false;
  }

  function maybeDoubleSashay(season, ids, performances) {
    if (season.config.disableDoubleShantaysSashays || season.doubleSashaysUsed >= 1 || ids.length !== 2 || season.activeIds.length <= 6) return false;
    const raw = (performances || []).map((performance) => Number(performance.rawScore ?? 0));
    return raw.length === 2 && raw[0] < 2 && raw[1] < 2 && legacyChance(9);
  }

  function applyChocolateBar(season, episode, eliminatedId) {
    if (!season.chocolate?.active || season.chocolate.used || !eliminatedId) return false;
    if (season.config?.premiereType === "split_s14" && episode?.specialPremiere === "split_elim") return false;
    episode.chocolateOpenedById = eliminatedId;
    episode.chocolateRevealed = false;
    if (season.chocolate.goldenId === eliminatedId) {
      season.chocolate.used = true;
      episode.chocolateSave = true;
      episode.savedIds.push(eliminatedId);
      return true;
    }
    episode.chocolateSave = false;
    return false;
  }

  function nonEliminationSaveResultText(season, id, label) {
    return `${displayName(season.contestants[id])} was saved by the ${label}. This is a non-elimination.`;
  }

  function updateLipSyncStats(season, id, survived) {
    const stats = season.stats[id];
    stats.lipSyncs += 1;
    if (survived) stats.lipSyncWins += 1;
    else stats.lipSyncLosses += 1;
  }

  function runUntucked(season, episode) {
    const pools = getUntuckedEvents().filter((event) => Number(event.participants || 1) <= season.activeIds.length);
    const sourceEvents = pools.length ? pools : fallbackUntuckedEvents;
    const count = clamp(randInt(2, 4), 1, season.activeIds.length);
    const active = season.activeIds.slice();
    const usedEventIds = new Set();
    const roleTokens = ["A", "B", "C", "D"];
    episode.untuckedEvents = [];

    for (let i = 0; i < count; i += 1) {
      const unusedPool = sourceEvents.filter((candidate) => !usedEventIds.has(candidate.id) && Number(candidate.participants || 1) <= active.length);
      const event = clone(randomItem(unusedPool.length ? unusedPool : sourceEvents));
      usedEventIds.add(event.id);
      event.participants = clamp(Number(event.participants || 1), 1, Math.min(4, active.length));

      const ids = shuffle(active).slice(0, event.participants);
      const roleById = {};
      const idByRole = {};
      ids.forEach((id, index) => {
        const role = roleTokens[index];
        roleById[id] = role;
        idByRole[role] = id;
      });

      const names = ids.map((id) => nickDisplayName(season.contestants[id]));
      let text = String(event.text || "{A} has a quiet moment in Untucked.");
      roleTokens.forEach((token, index) => {
        text = text.replaceAll(`{${token}}`, names[index] || names[0] || "Someone");
      });

      event.ids = ids;
      event.roleById = roleById;
      event.idByRole = idByRole;
      event.renderedText = text;
      event.impacts = applyEventImpact(season, event);
      episode.untuckedEvents.push(event);
    }
  }

  function applyEventImpact(season, event) {
    const ids = event.ids || [];
    const roleById = event.roleById || {};
    const idByRole = event.idByRole || {};
    const impacts = { popularity: {}, relationship: {}, edgic: {} };

    ids.forEach((id) => {
      if (!season.stats[id]) return;
      const role = roleById[id];
      const rawPopularity = event.popularityByRole && role && Object.prototype.hasOwnProperty.call(event.popularityByRole, role)
        ? event.popularityByRole[role]
        : event.popularity;
      const popDelta = eventPopularityDelta(rawPopularity);
      if (popDelta) impacts.popularity[id] = popDelta;

      const roleEdgic = event.edgicByRole && role && event.edgicByRole[role]
        ? String(event.edgicByRole[role]).toUpperCase()
        : (event.edgic ? String(event.edgic).toUpperCase() : "");
      if (roleEdgic) impacts.edgic[id] = roleEdgic;
    });

    const pairDeltas = event.relationshipByPair && Object.keys(event.relationshipByPair).length
      ? event.relationshipByPair
      : null;

    if (pairDeltas) {
      Object.entries(pairDeltas).forEach(([rolePair, rawDelta]) => {
        const [roleA, roleB] = String(rolePair).split("-").map((part) => part.trim());
        const idA = idByRole[roleA];
        const idB = idByRole[roleB];
        if (!idA || !idB || idA === idB) return;
        const delta = Number(rawDelta || 0);
        if (!delta) return;
        const key = pairKey(idA, idB);
        season.relationships[key] = clamp((season.relationships[key] || 0) + delta, -10, 10);
        impacts.relationship[key] = delta;
      });
    } else if (ids.length >= 2) {
      const delta = Number(event.relationship || 0);
      if (delta) {
        for (let i = 0; i < ids.length; i += 1) {
          for (let j = i + 1; j < ids.length; j += 1) {
            const key = pairKey(ids[i], ids[j]);
            season.relationships[key] = clamp((season.relationships[key] || 0) + delta, -10, 10);
            impacts.relationship[key] = delta;
          }
        }
      }
    }

    return impacts;
  }

  function finalizeEpisode(season, episode) {
    if (episode.challenge?.id) season.usedChallengeIds.push(episode.challenge.id);
    if (episode.challenge?.type) season.usedChallengeTypes.push(challengeTypeKey(episode.challenge.type));
    if (episode.runway?.id && !episode.runway.challengeRunway) season.usedRunwayIds.push(episode.runway.id);
    applyEliminations(season, episode);
    awardNextEpisodeImmunity(season, episode);
    generateHiddenNarrativeEvents(season, episode);
    updateEpisodeStats(season, episode);
    assignEpisodeEdgic(season, episode);
    season.episodes.push(episode);
    if (season.trackColumnLabels && !season.trackColumnLabels.some((col) => col.label === episode.label)) {
      season.trackColumnLabels.push({ label: episode.label, title: episode.challenge ? `${episode.challenge.name} (${challengeTypeLabel(episode.challenge.type)})` : episode.title || episode.label, challengeType: episode.challenge ? challengeTypeLabel(episode.challenge.type) : "" });
    }
    season.episodeCounter += 1;
  }

  function applyEliminations(season, episode) {
    const eliminated = [...new Set([...(episode.eliminatedIds || []), ...(episode.departureIds || [])])];
    eliminated.forEach((id) => {
      season.activeIds = season.activeIds.filter((activeId) => activeId !== id);
      if (!season.eliminatedIds.includes(id)) season.eliminatedIds.push(id);
    });
  }

  function awardNextEpisodeImmunity(season, episode) {
    if (episode?.noImmunityAward) return;
    if (!season.config.twistImmunity) return;
    if (!immunityStillActive(season)) return;
    if (episode.winnerIds.length !== 1) return;
    if (episode.teams?.mode !== "solo" && episode.highIds.length > 1) return;
    const winnerId = episode.winnerIds[0];
    season.immunity[winnerId] = { usableEpisodeNumber: episode.number + 1, used: false };
    episode.immunityAwardedId = winnerId;
    episode.notes.push(`${displayName(season.contestants[winnerId])} earns immunity for the following episode.`);
  }

  function immunityStillActive(season) {
    const initial = season.castOrder.length;
    const midpoint = Math.ceil(initial / 2);
    return season.activeIds.length > midpoint;
  }

  function placementTokenFor(episode, id) {
    if (episode.unplannedExit?.id === id) return episode.unplannedExit.token;
    if (episode.comebackPlacements && Object.prototype.hasOwnProperty.call(episode.comebackPlacements, id)) return episode.comebackPlacements[id];
    if (episode.type === "porkchop_premiere") {
      const pork = episode.porkchopPremiere || {};
      if (pork.choppedId === id) return "PCHOP";
      if ((pork.winnerIds || []).includes(id)) return "PWIN";
      if ((pork.loserIds || []).includes(id)) return "PLOSS";
    }
    if (episode.type === "special_lalaparuza") {
      if ((episode.eliminatedIds || []).includes(id)) return "ELIM";
      const round = Number(episode.lalaparuzaRoundWinners?.[id] || 0);
      if (round >= 1) return `LALA_R${Math.min(5, round)}`;
    }
    if (episode.type === "special_slayoffs") {
      if ((episode.eliminatedIds || []).includes(id)) return "ELIM";
      if ((episode.winnerIds || []).includes(id)) return "WIN";
      if ((episode.top2Ids || []).includes(id)) return "TOP2";
      if ((episode.highIds || []).includes(id)) return "HIGH";
      if ((episode.lowIds || []).includes(id)) return "LOW";
      if ((episode.bottomIds || []).includes(id)) return "BTM3";
    }
    if (episode.type === "reunion_lalaparuza") {
      if ((episode.reunionWinnerId || "") === id) return "REUNION_WIN";
      if ((episode.activeStartIds || []).includes(id) && (episode.safeIds || []).includes(id)) return "RUN";
      const round = Number(episode.reunionLostRound?.[id] || 0);
      if (round >= 1) return `REUNION_LOST_R${Math.min(4, round)}`;
    }
    if (episode.type === "fame_games") {
      if ((state.season?.activeIds || []).includes(id)) return "RUN";
      if ((episode.winnerIds || []).includes(id)) return "WIN";
      if ((episode.top2Ids || []).includes(id)) return "TOP2";
      if ((episode.safeIds || []).includes(id)) return "SAFE";
    }
    if (episode.type === "mid_season_rate_a_queen") {
      const raq = episode.midSeasonRateAQueen || {};
      if ((episode.eliminatedIds || []).includes(id) || (raq.bottomLipSyncLoserId === id && (episode.bottomIds || []).includes(id))) return "ELIM";
      if (raq.bottomLipSyncWinnerId === id && (episode.bottomIds || []).includes(id)) return "BTM2";
      if ((episode.winnerIds || []).includes(id)) return "WIN";
      if ((episode.top2Ids || []).includes(id)) return "TOP2";
      if ((episode.safeIds || []).includes(id)) return "SAFE";
      if ((episode.bottomIds || []).includes(id)) return "BTM1";
      if ((episode.runOnlyIds || []).includes(id)) return "RUN";
    }
    if (episode.type === "cunt_test") {
      if ((episode.eliminatedIds || []).includes(id)) return "ELIM";
      if ((episode.winnerIds || []).includes(id)) return "WIN";
      if ((episode.bottomIds || []).includes(id)) return "BTM2";
      if ((episode.safeIds || []).includes(id)) return "SAFE";
    }
    if (episode.type === "lsftf") {
      if ((episode.eliminatedIds || []).includes(id)) return "ELIM";
      if ((episode.lsftfSurvivorIds || episode.safeIds || []).includes(id)) return "TOP3";
    }
    if (isAllWinnersFormat(state.season) && episode.allWinnersEpisode) {
      const blocked = (episode.allWinnersTrackBlockedId || episode.allWinnersBlockTargetId) === id;
      if ((episode.winnerIds || []).includes(id)) return "WIN";
      if ((episode.top2Ids || []).includes(id)) return "TOP2";
      if (blocked && (episode.highIds || []).includes(id)) return "HIGH_BLK";
      if (blocked && (episode.safeIds || []).includes(id)) return "BLK";
    }
    if (isTeamsFormat(state.season) && episode.teamFormatEpisode) {
      if ((episode.winnerIds || []).includes(id)) return "WIN";
      if ((episode.eliminatedIds || []).includes(id)) return "ELIM";
      if ((episode.bottomIds || []).includes(id)) return "BTM2";
    }
    if (episode.winnerIds.includes(id)) return "WIN";
    if (isLegacyFormat(state.season) && seasonEliminationFormatApplies(state.season, episode) && (episode.bottomIds || []).length && episode.top2Ids.includes(id)) return "WIN";
    if (episode.top2Ids.includes(id)) return "TOP2";
    if (episode.eliminatedIds.includes(id)) return "ELIM";
    if ((episode.runOnlyIds || []).includes(id)) return "RUN";
    if (episode.highIds.includes(id)) return "HIGH";
    if (episode.safeIds.includes(id)) return "SAFE";
    if (episode.lowIds.includes(id)) return "LOW";
    if (episode.bottomIds.includes(id)) {
      if (episode.chocolateSave && episode.chocolateOpenedById === id) return "CHOC";
      if (episode.skipLipSyncThisEpisode || episode.specialPremiere === "rate_a_queen_s17_split") return "BTM";
      const count = (episode.bottomIds || []).length;
      if (count === 1) return "BTM1";
      if (count >= 3) return `BTM${count}`;
      return "BTM2";
    }
    if (episode.savedIds.includes(id)) return "IMM";
    if (episode.returnedIds?.includes(id)) return "RTRN";
    return "";
  }


  function hasEpisodeId(list, id) {
    return Array.isArray(list) && list.includes(id);
  }

  function eventPopularityDelta(rawDelta) {
    const base = Number(rawDelta || 0);
    if (!base) return 0;
    return clamp(Math.round(base * 1.6 + randInt(-1, 1)), -8, 8);
  }

  function placementPopularityDeltaFor(token) {
    const value = String(token || "").toUpperCase();
    if (["WIN", "DWIN", "TOP2"].includes(value)) return value === "WIN" || value === "DWIN" ? 2 : 1;
    if (["HIGH", "HIGH_BLK", "IN", "RTRN", "REUNION_WIN", "FAME_GAMES"].includes(value)) return 1;
    if (["DEPT", "CHOC"].includes(value)) return 2;
    if (["DISQ"].includes(value)) return -8;
    if (["QUIT", "BTM2_QUIT"].includes(value)) return -3;
    if (["PCHOP", "PLOSS"].includes(value)) return 0;
    return 0;
  }

  function performancePopularityComponent(episode, id) {
    const band = performanceBandFor(episode, id, "maxiGroups");
    const iconic = (episode.hiddenNarrativeEvents || []).some((event) => event.primaryId === id && event.type === "iconic_flop");
    if (band === "slayed") return randInt(6, 10);
    if (band === "great") return randInt(3, 7);
    if (band === "good") return randInt(-1, 3);
    if (band === "bad") return iconic ? randInt(3, 7) : randInt(-5, -2);
    if (band === "flopped") return iconic ? randInt(5, 10) : randInt(-11, -6);
    return 0;
  }

  function runwayPopularityComponent(episode, id) {
    const band = performanceBandFor(episode, id, "runwayGroups");
    const iconic = (episode.hiddenNarrativeEvents || []).some((event) => event.primaryId === id && event.type === "iconic_fashion_disaster");
    if (band === "slayed") return randInt(4, 8);
    if (band === "great") return randInt(2, 5);
    if (band === "good") return randInt(0, 2);
    if (band === "bad") return iconic ? randInt(2, 5) : randInt(-4, -1);
    if (band === "flopped") return iconic ? randInt(4, 8) : randInt(-9, -4);
    return 0;
  }

  function fairnessPopularityComponent(season, episode, id, token) {
    const fairness = episode.placementFairness?.[id] || objectivePlacementContext(episode, id);
    if (!fairness.count || !fairness.rank) return 0;
    let delta = 0;
    if (fairness.rank === 1 && !["WIN", "DWIN"].includes(token)) {
      delta += token === "HIGH" || token === "TOP2" ? randInt(4, 7) : token === "SAFE" ? randInt(8, 13) : randInt(12, 18);
      addArcEvidence(season, id, "robbed_queen", 2, "deserved_win", episode.label);
    } else if (fairness.gap >= 2) {
      delta += randInt(8, 14);
      addArcEvidence(season, id, "robbed_queen", 1.5, "underplacement", episode.label);
    } else if (fairness.gap >= 1) {
      delta += randInt(3, 7);
      addArcEvidence(season, id, "robbed_queen", 0.7, "underplacement", episode.label);
    }

    if (["WIN", "DWIN"].includes(token) && fairness.rank > 1) {
      const strongOverplacement = fairness.rank > Math.max(2, Math.ceil(fairness.count * 0.35));
      delta -= strongOverplacement ? randInt(9, 15) : randInt(5, 9);
      addArcEvidence(season, id, "chosen_one", strongOverplacement ? 2 : 1, "unearned_win", episode.label);
    } else if (fairness.gap <= -2) {
      delta -= randInt(7, 12);
      addArcEvidence(season, id, "chosen_one", 1.5, "overplacement", episode.label);
    } else if (fairness.gap <= -1) {
      delta -= randInt(3, 6);
      addArcEvidence(season, id, "chosen_one", 0.6, "overplacement", episode.label);
    }

    if (token === "ELIM" && fairness.value >= 3) {
      delta += fairness.value >= 4 ? randInt(14, 22) : randInt(8, 14);
      addArcEvidence(season, id, fairness.value >= 4 ? "shock_elimination" : "robbed_queen", 2, "unfair_elimination", episode.label);
    }

    const narrative = narrativeContestant(season, id);
    if (narrative) {
      if (fairness.gap > 0) narrative.state.unfairUnderplacements += fairness.gap;
      if (fairness.gap < 0) narrative.state.unfairOverplacements += Math.abs(fairness.gap);
    }
    return clamp(delta, -20, 26);
  }

  function lipSyncPopularityDelta(episode, id, token, season = state.season) {
    const lipSyncs = [episode?.lipSync, ...((episode?.extraLipSyncs) || [])].filter((lipSync) => lipSync && (lipSync.ids || []).includes(id));
    if (!lipSyncs.length) return 0;
    let best = null;
    lipSyncs.forEach((lipSync) => {
      const performance = (lipSync.performances || []).find((entry) => entry.id === id);
      if (!performance) return;
      if (!best || Number(performance.rawScore || performance.score || 0) > Number(best.performance.rawScore || best.performance.score || 0)) best = { lipSync, performance };
    });
    if (!best) return 0;
    const band = String(best.performance.band || legacyLipSyncBand(Number(best.performance.rawScore || 0)));
    let delta = band === "slayed" ? randInt(11, 18)
      : band === "great" ? randInt(6, 12)
      : band === "good" ? randInt(2, 5)
      : band === "bad" ? randInt(-5, -1)
      : randInt(-10, -4);
    const rawWinner = (best.lipSync.performances || []).slice().sort((a, b) => Number(b.rawScore || b.score || 0) - Number(a.rawScore || a.score || 0))[0]?.id;
    const officialWinner = best.lipSync.winnerId || best.lipSync.winnerIds?.[0];
    if (token === "ELIM" && rawWinner === id) {
      delta += randInt(10, 18);
      addArcEvidence(season, id, "robbed_queen", 1.5, "lip_sync_robbery", episode.label);
    }
    if (officialWinner === id && rawWinner && rawWinner !== id) {
      delta -= randInt(6, 12);
      addArcEvidence(season, id, "chosen_one", 1, "lip_sync_save", episode.label);
    }
    if (["slayed", "great"].includes(band)) {
      addArcEvidence(season, id, "lip_sync_assassin", band === "slayed" ? 1.4 : 0.8, "lip_sync", episode.label);
    }
    if (token === "ELIM") {
      const opponentBestBand = (best.lipSync.performances || []).filter((entry) => entry.id !== id).map((entry) => String(entry.band || legacyLipSyncBand(Number(entry.rawScore || 0))));
      if (["bad", "flopped"].includes(band) && opponentBestBand.some((value) => value === "slayed" || value === "great")) {
        addArcEvidence(season, id, "sacrificial_lamb", 2, "lip_sync_mismatch", episode.label);
      } else if (band === "flopped") addArcEvidence(season, id, "sacrificial_lamb", 0.7, "lip_sync_loss", episode.label);
    }
    return clamp(delta, -16, 30);
  }

  function visibleEventPopularityComponent(episode, id) {
    return clamp((episode?.untuckedEvents || []).reduce((sum, event) => sum + Number(event.impacts?.popularity?.[id] || 0), 0), -15, 15);
  }

  function hiddenEventPopularityComponent(episode, id) {
    return clamp((episode?.hiddenNarrativeEvents || []).filter((event) => (event.ids || []).includes(id)).reduce((sum, event) => sum + Number(event.popularity || 0), 0), -15, 18);
  }

  function recentPopularityPattern(stats) {
    const changes = (stats?.popularityReactions || [])
      .slice(-4)
      .map((entry) => Number(entry.applied ?? entry.total ?? 0))
      .filter((value) => Number.isFinite(value) && value !== 0);
    if (!changes.length) return { sign: 0, streak: 0, sum: 0 };
    const sign = Math.sign(changes.at(-1));
    let streak = 0;
    for (let index = changes.length - 1; index >= 0; index -= 1) {
      if (Math.sign(changes[index]) !== sign) break;
      streak += 1;
    }
    return { sign, streak, sum: changes.reduce((sum, value) => sum + value, 0) };
  }

  function audienceDiscoursePopularityComponent(season, episode, id, token) {
    const stats = season.stats?.[id] || {};
    const narrative = narrativeContestant(season, id);
    const traits = narrative?.traits || {};
    const metrics = episode?.editMetrics?.[id] || {};
    const hidden = (episode?.hiddenNarrativeEvents || []).filter((event) => (event.ids || []).includes(id));
    const visible = (episode?.untuckedEvents || []).filter((event) => (event.ids || []).includes(id));
    const hiddenTypes = new Set(hidden.map((event) => String(event.type || "").toLowerCase()));
    const visibleTypes = new Set(visible.map((event) => String(event.type || "").toLowerCase()));
    const recent = recentPopularityPattern(stats);
    const current = Number(stats.popularity || 50);
    const maxiBand = performanceBandFor(episode, id, "maxiGroups");
    const runwayBand = performanceBandFor(episode, id, "runwayGroups");
    const strongPerformance = ["slayed", "great"].includes(maxiBand) || ["slayed", "great"].includes(runwayBand);
    const weakPerformance = ["bad", "flopped"].includes(maxiBand) || ["bad", "flopped"].includes(runwayBand);
    const positiveScene = hidden.some((event) => Number(event.popularity || 0) >= 2 || Number(event.positive || 0) >= 14)
      || visible.some((event) => Number(event.impacts?.popularity?.[id] || 0) >= 3)
      || Number(metrics.positiveTone || 0) >= 30;
    const negativeScene = hidden.some((event) => Number(event.popularity || 0) <= -2 || Number(event.negative || 0) >= 16)
      || visible.some((event) => Number(event.impacts?.popularity?.[id] || 0) <= -3)
      || Number(metrics.negativeTone || 0) >= 30;
    const dramaScene = [...visibleTypes, ...hiddenTypes].some((type) => ["drama", "fight", "shade", "rivalry", "argument", "meltdown", "stirs_pot", "conflict_point_of_view"].includes(type));

    let delta = 0;
    let label = "";

    if (hiddenTypes.has("viral_moment") || hiddenTypes.has("iconic_flop") || hiddenTypes.has("iconic_fashion_disaster")) {
      delta += randInt(5, 12);
      label = "viral fan moment";
    } else if (hiddenTypes.has("supportive_moment") || hiddenTypes.has("emotional_vulnerability") || hiddenTypes.has("emotional_checkpoint")) {
      delta += randInt(3, 8);
      label = "emotional connection";
    } else if (hiddenTypes.has("rejects_critique") || hiddenTypes.has("delusional_boast") || hiddenTypes.has("defeated_energy")) {
      delta -= randInt(5, 11);
      label = "viewer backlash";
    } else if (hiddenTypes.has("episode_narrator") || hiddenTypes.has("quiet_observer")) {
      delta += randInt(1, 5);
      label = "confessional response";
    }

    if (dramaScene) {
      const entertaining = Number(traits.humor || 0) + Number(traits.selfAwareness || 0) * 0.45 >= 92;
      const dramaDelta = entertaining ? randInt(-2, 7) : randInt(-8, 3);
      delta += dramaDelta;
      label = dramaDelta >= 2 ? "fans enjoyed the drama" : dramaDelta <= -3 ? "drama backlash" : (label || "divided fan response");
    }

    if (recent.streak >= 2 && recent.sign > 0) {
      if (negativeScene || weakPerformance) {
        delta -= randInt(6, 12);
        label = "backlash after a positive streak";
      } else if ((current >= 64 || Number(stats.buzz || 0) >= 72) && Number(metrics.visibilityDemand || 0) >= 50 && Math.random() < 0.58) {
        delta -= randInt(4, 9);
        label = "fan fatigue and overexposure";
      }
    } else if (recent.streak >= 2 && recent.sign < 0) {
      if (positiveScene || strongPerformance) {
        delta += randInt(7, 14);
        label = "redemption episode";
      } else if (current <= 38 && !negativeScene && Math.random() < 0.55) {
        delta += randInt(4, 9);
        label = "sympathy rebound";
      }
    }

    if (!label && current >= 78 && ["WIN", "DWIN", "TOP2", "HIGH", "HIGH_BLK"].includes(String(token || "").toUpperCase()) && Math.random() < 0.24) {
      delta -= randInt(3, 7);
      label = "frontrunner fatigue";
    }
    if (!label && current <= 28 && (token === "LOW" || /^BTM/.test(String(token || "").toUpperCase())) && Math.random() < 0.34) {
      delta += randInt(3, 8);
      label = "underdog sympathy";
    }
    if (!label && Math.random() < 0.16) {
      const discourse = randInt(-5, 5);
      delta += discourse;
      label = discourse >= 2 ? "positive weekly discourse" : discourse <= -2 ? "negative weekly discourse" : "mixed weekly discourse";
    }

    return { delta: clamp(delta, -18, 20), label };
  }

  function storylineMomentumPopularityComponent(season, id) {
    const narrative = narrativeContestant(season, id);
    const momentum = Number(narrative?.state?.audienceMomentum || 0);
    return clamp(Math.round(momentum * 0.28), -2, 2);
  }

  function calculatePopularityReaction(season, episode, id, token) {
    const metrics = episode?.editMetrics?.[id] || {};
    const visibleCount = (episode?.untuckedEvents || []).filter((event) => (event.ids || []).includes(id)).length;
    const hiddenCount = (episode?.hiddenNarrativeEvents || []).filter((event) => (event.ids || []).includes(id)).length;
    let invisibility = 0;
    if (["SAFE", "RUN", "BLK", "IMM"].includes(String(token || "").toUpperCase())) {
      if (Number(metrics.centrality || 0) < 19 && !visibleCount && !hiddenCount) invisibility = randInt(-6, -3);
      else if (Number(metrics.centrality || 0) < 29 && !visibleCount) invisibility = randInt(-3, -1);
    }

    const discourse = audienceDiscoursePopularityComponent(season, episode, id, token);
    const reaction = {
      placement: placementPopularityDeltaFor(token),
      challenge: performancePopularityComponent(episode, id),
      runway: runwayPopularityComponent(episode, id),
      fairness: fairnessPopularityComponent(season, episode, id, token),
      lipSync: lipSyncPopularityDelta(episode, id, token, season),
      visibleEvents: visibleEventPopularityComponent(episode, id),
      hiddenEvents: hiddenEventPopularityComponent(episode, id),
      audienceDiscourse: discourse.delta,
      audienceDiscourseLabel: discourse.label,
      audienceShock: Number(episode?.audienceShocks?.[id]?.delta || 0),
      audienceShockLabel: episode?.audienceShocks?.[id]?.label || "",
      invisibility,
      momentum: storylineMomentumPopularityComponent(season, id),
      noise: randInt(-2, 2)
    };
    if (Math.random() < 0.06) reaction.noise += randInt(-4, 4);

    const baseTotal = Object.values(reaction).filter(Number.isFinite).reduce((sum, value) => sum + Number(value || 0), 0);
    const stats = season.stats?.[id] || {};
    const narrative = narrativeContestant(season, id);
    const audienceMomentum = Number(narrative?.state?.audienceMomentum || 0);
    const recent = recentPopularityPattern(stats);
    const aligned = Math.sign(baseTotal) !== 0 && Math.sign(baseTotal) === Math.sign(audienceMomentum);
    const opposed = Math.sign(baseTotal) !== 0 && Math.sign(audienceMomentum) !== 0 && Math.sign(baseTotal) !== Math.sign(audienceMomentum);
    const momentumMultiplier = aligned && recent.streak < 2
      ? 1 + Math.min(0.14, Math.abs(audienceMomentum) * 0.025)
      : opposed
        ? 1 + Math.min(0.24, Math.abs(audienceMomentum) * 0.04)
        : 1;
    const volatility = clamp(Number(stats.fanVolatility || 1), 0.72, 1.55);
    reaction.volatility = Number(volatility.toFixed(2));
    reaction.momentumMultiplier = Number(momentumMultiplier.toFixed(2));
    reaction.total = clamp(Math.round(baseTotal * volatility * momentumMultiplier), -35, 40);
    return reaction;
  }

  function applyPopularityDelta(season, id, rawDelta) {
    const stats = season.stats?.[id];
    if (!stats) return 0;
    let delta = Math.round(Number(rawDelta || 0));
    if (!delta) return 0;
    const current = Number(stats.popularity || 0);
    if (delta > 0 && current >= 96) delta = Math.max(1, Math.round(delta * 0.68));
    else if (delta > 0 && current >= 91) delta = Math.max(1, Math.round(delta * 0.84));
    if (delta < 0 && current <= 4) delta = Math.min(-1, Math.round(delta * 0.68));
    else if (delta < 0 && current <= 9) delta = Math.min(-1, Math.round(delta * 0.84));
    const next = clamp(current + delta, 0, 100);
    stats.popularity = next;
    const narrative = narrativeContestant(season, id);
    if (narrative) {
      const previousMomentum = Number(narrative.state.audienceMomentum || 0);
      const applied = next - current;
      const reversed = Math.sign(previousMomentum) !== 0 && Math.sign(applied) !== 0 && Math.sign(previousMomentum) !== Math.sign(applied);
      narrative.state.audienceMomentum = clamp(
        reversed
          ? previousMomentum * 0.18 + applied / 4.5
          : previousMomentum * 0.42 + applied / 7,
        -6,
        6
      );
    }
    return Math.round(next - current);
  }



  function popularityMedian(values) {
    const clean = (values || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!clean.length) return 0;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  }

  function remainingPopularityTarget(rank, count, season) {
    if (count <= 1) return 72;
    const initialCount = Math.max(count, Number(season?.castOrder?.length || count));
    const progress = clamp((initialCount - count) / Math.max(1, initialCount - 1), 0, 1);
    const center = 52 + progress * 8;
    const spread = 34 + progress * 4;
    const position = 1 - (rank / Math.max(1, count - 1)) * 2;
    const curved = Math.sign(position) * Math.pow(Math.abs(position), 0.82);
    return clamp(Math.round(center + curved * spread), 6, 98);
  }

  function popularityReactionIsMajor(reaction) {
    return Math.abs(Number(reaction?.fairness || 0)) >= 8
      || Math.abs(Number(reaction?.lipSync || 0)) >= 10
      || Math.abs(Number(reaction?.hiddenEvents || 0)) >= 7
      || Math.abs(Number(reaction?.visibleEvents || 0)) >= 8
      || Math.abs(Number(reaction?.audienceDiscourse || 0)) >= 8
      || Math.abs(Number(reaction?.audienceShock || 0)) >= 12
      || Math.abs(Number(reaction?.invisibility || 0)) >= 5;
  }

  function applyRemainingCastPopularityComparison(season, episode, popularityQueue) {
    const remainingSet = new Set(season?.activeIds || []);
    const remainingRows = (popularityQueue || []).filter((row) => remainingSet.has(row.id));
    episode.popularityRanking = {};

    (popularityQueue || []).forEach((row) => {
      row.reaction.rawTotal = Math.round(Number(row.reaction.total || 0));
      row.reaction.relativeAdjustment = 0;
      row.reaction.comparison = 0;
      row.reaction.relativeRank = null;
      row.reaction.remainingCount = remainingRows.length;
    });

    if (remainingRows.length <= 1) {
      remainingRows.forEach((row, index) => {
        row.reaction.relativeRank = index + 1;
        row.reaction.relativeTarget = remainingPopularityTarget(index, remainingRows.length, season);
        episode.popularityRanking[row.id] = { rank: index + 1, count: remainingRows.length, target: row.reaction.relativeTarget };
      });
      return;
    }

    const rawMedian = popularityMedian(remainingRows.map((row) => row.reaction.rawTotal));
    const initialCount = Math.max(remainingRows.length, Number(season?.castOrder?.length || remainingRows.length));
    const progress = clamp((initialCount - remainingRows.length) / Math.max(1, initialCount - 1), 0, 1);

    const ranked = remainingRows.map((row) => {
      const current = Number(row.stats?.popularity ?? 50);
      const buzz = Number(row.stats?.buzz ?? current);
      const centrality = Number(episode?.editMetrics?.[row.id]?.centrality || 0);
      const raw = Number(row.reaction.rawTotal || 0);
      const weeklyStanding = current * 0.52 + buzz * 0.14 + raw * 1.18 + centrality * 0.07;
      return { ...row, current, raw, weeklyStanding };
    }).sort((a, b) => b.weeklyStanding - a.weeklyStanding || b.raw - a.raw || b.current - a.current || String(a.id).localeCompare(String(b.id)));

    const preliminary = ranked.map((row, rank) => {
      const target = remainingPopularityTarget(rank, ranked.length, season);
      const centeredRaw = row.raw - rawMedian;
      const major = popularityReactionIsMajor(row.reaction);
      const rankBlend = major ? 0.32 : Math.abs(centeredRaw) >= 12 ? 0.27 : 0.22;
      const rankPressure = (target - row.current) * rankBlend;
      const shockCarry = Math.sign(row.raw) * Math.max(0, Math.abs(row.raw) - 14) * 0.34;
      const quartileContrast = rank < ranked.length * 0.28
        ? 2.4
        : rank >= ranked.length * 0.72
          ? -2.4
          : 0;
      return {
        ...row,
        rank,
        target,
        centeredRaw,
        major,
        relativeDelta: centeredRaw * 0.74 + rankPressure + shockCarry + quartileContrast
      };
    });

    const desiredAverageDelta = 0.35 + progress * 0.40;
    const firstAverage = average(preliminary.map((row) => row.relativeDelta));
    preliminary.forEach((row) => { row.relativeDelta -= firstAverage - desiredAverageDelta; });

    if (preliminary.length >= 4) {
      const directionCount = Math.max(1, Math.floor(preliminary.length * 0.28));
      preliminary.slice(0, directionCount).forEach((row, index) => {
        row.relativeDelta += 1.8 + (directionCount - index) * 0.45;
      });
      preliminary.slice(-directionCount).forEach((row, index) => {
        row.relativeDelta -= 1.8 + (index + 1) * 0.45;
      });
      const adjustedAverage = average(preliminary.map((row) => row.relativeDelta));
      preliminary.forEach((row) => { row.relativeDelta -= adjustedAverage - desiredAverageDelta; });
    }

    preliminary.forEach((row) => {
      const limitLow = row.major ? -42 : -28;
      const limitHigh = row.major ? 45 : 30;
      const finalDelta = clamp(Math.round(row.relativeDelta), limitLow, limitHigh);
      row.reaction.relativeRank = row.rank + 1;
      row.reaction.remainingCount = ranked.length;
      row.reaction.relativeTarget = row.target;
      row.reaction.relativeMedianReaction = Number(rawMedian.toFixed(1));
      row.reaction.relativeAdjustment = Math.round(finalDelta - row.raw);
      row.reaction.comparison = row.reaction.relativeAdjustment;
      row.reaction.total = finalDelta;
      episode.popularityRanking[row.id] = {
        rank: row.rank + 1,
        count: ranked.length,
        target: row.target,
        rawReaction: row.raw,
        relativeDelta: finalDelta
      };
    });
  }

  function applyLegacyPlacementMomentum(season, episode, id, token) {
    const stats = season.stats?.[id];
    if (!stats) return;
    stats.favoritism = Number(stats.favoritism || 0);
    stats.unfavoritism = Number(stats.unfavoritism || 0);
    stats.ppe = Number(stats.ppe || 0);
    stats.ppeEpisodes = Number(stats.ppeEpisodes || 0) + 1;

    if (token === "WIN_QUIT") {
      stats.favoritism += 5;
      stats.ppe += 5;
      return;
    }
    if (token === "BTM2_QUIT") {
      stats.unfavoritism += 5;
      return;
    }
    if (token === "QUIT" || token === "DEPT" || token === "DISQ") {
      stats.unfavoritism += 5;
      return;
    }
    if (token === "WIN" || token === "DWIN") {
      const legacyLoser = isLegacyFormat(season) && episode.legacyLipSyncLoserId === id;
      stats.favoritism += legacyLoser ? 4 : 5;
      stats.ppe += legacyLoser ? 4.5 : 5;
      return;
    }
    if (token === "TOP2") {
      stats.favoritism += 2;
      stats.ppe += 4.5;
      return;
    }
    if (token === "HIGH" || token === "HIGH_BLK") {
      stats.favoritism += 1;
      stats.ppe += 4;
      return;
    }
    if (token === "SAFE" || token === "BLK" || token === "RUN" || token === "IN" || token === "RTRN") {
      stats.ppe += 3;
      return;
    }
    if (token === "LOW") {
      stats.unfavoritism += 1;
      stats.ppe += 2;
      return;
    }
    if (/^BTM\d+$/.test(token) || token === "BTM" || token === "BTM2" || token === "CHOC") {
      stats.unfavoritism += 3;
      stats.ppe += 1;
      return;
    }
    if (token === "ELIM") stats.unfavoritism += 5;
  }

  function updateEpisodeStats(season, episode) {
    const popularityQueue = [];
    season.castOrder.forEach((id) => {
      const activeOrInEpisode = episode.activeStartIds.includes(id) || episode.returnedIds?.includes(id) || episode.comebackParticipantIds?.includes(id);
      if (!activeOrInEpisode) return;
      const token = placementTokenFor(episode, id);
      if (!token) return;
      const stats = season.stats[id];
      const extraClasses = [];
      if (token === "TOP2" && isAllWinnersFormat(season) && episode.allWinnersEpisode) extraClasses.push("all-winners-win");
      if (token === "WIN" && isAllWinnersFormat(season) && episode.allWinnersEpisode) extraClasses.push("all-winners-lip-sync-win");
      if ((token === "TOP2" || token === "WIN") && isAllWinnersFormat(season) && (episode.allWinnersTrackBlockedId || episode.allWinnersBlockTargetId) === id) extraClasses.push("all-winners-blocked-win");
      if (token === "WIN" && (episode.winnerIds || []).length > 1 && !(isTeamsFormat(season) && episode.teamFormatEpisode)) extraClasses.push("multi-win");
      if (token === "WIN" && episode.legacyLipSyncLoserId === id) extraClasses.push("legacy-loser-win");
      if (token === "WIN" && episode.assassinTopLostId === id) extraClasses.push("assassin-loser-win");
      if (token === "HIGH" && (episode.winningTeamIds || []).includes(id)) extraClasses.push("winning-team-high");
      if (token === "LOW" && (episode.goldenBeaverSavedId === id || episode.slayOffsSavedId === id)) extraClasses.push("golden-beaver-save");
      if (isUnplannedExitToken(token)) extraClasses.push("token-elim", "unplanned-exit");
      if (token === "ELIM" && (episode.eliminatedIds || []).length > 1 && !(isTeamsFormat(season) && episode.teamFormatEpisode)) extraClasses.push("double-elim");
      if (isTeamsFormat(season) && (episode.teamPartnerElimIds || []).includes(id)) extraClasses.push("team-partner-elim");
      if (isTeamsFormat(season) && (episode.teamPartnerSafeIds || []).includes(id) && (/^BTM\d+$/.test(token) || token === "BTM")) extraClasses.push("team-partner-btm");
      if (token === "ELIM" && (episode.type === "finale" || episode.type === "lsftf")) extraClasses.push("finale-elim");
      if ((/^BTM\d+$/.test(token) || token === "BTM") && [episode.lipSync, ...((episode.extraLipSyncs) || [])].some((ls) => ["double_shantay", "lucky_cow_save", "badonka_save"].includes(ls?.resultType) && (ls.ids || []).includes(id))) extraClasses.push("double-shantay");
      if (episode.luckyCow?.savedId === id) extraClasses.push("lucky-cow-save");
      if (episode.badonkaDunkTank?.saved && episode.badonkaDunkTank?.contestantId === id) extraClasses.push("badonka-save");
      if (isProtectedByImmunity(season, episode, id)) extraClasses.push("immunity-protected");
      let display = /^LALA_R\d+$/.test(token) ? `SAFE<br/>(R${String(token).replace(/\D/g, "") || "1"})` : /^REUNION_LOST_R/.test(token) ? `LOST<br/>(R${String(token).replace(/\D/g, "") || "1"})` : token === "REUNION_WIN" ? "WIN" : token === "FAME_GAMES" ? "FAME<br/>GAMES" : token === "HIGH_BLK" ? "HIGH+<br/>BLK" : token === "TOP3" ? "TOP 3" : token === "DWIN" ? "WIN" : token === "PWIN" ? "WIN" : token === "WIN_QUIT" ? "WIN<br/>+<br/>QUIT" : token === "BTM2_QUIT" ? "BTM2<br/>+<br/>QUIT" : (token === "PLOSS" || token === "PCHOP") ? "LOSS" : (token === "TOP2" && isAllWinnersFormat(season) && episode.allWinnersEpisode ? "WIN" : token);
      display = String(display).replace(/\bBTM\s+(\d+)\b/g, "BTM$1");
      const comebackFormatForTrack = episode.comeback?.format || episode.readingComeback?.format || "";
      const suppressReturnPrefix = (comebackFormatForTrack === "reinas_de_la_comedia" && token === "DWIN") || (comebackFormatForTrack === "kitty_girl_groups" && token === "WIN");
      if ((episode.kittyGreenOutIds || []).includes(id)) extraClasses.push("kitty-green-out");
      if ((episode.revengeGreenOutIds || []).includes(id)) extraClasses.push("revenge-green-out");
      if ((episode.revengeActiveWinnerIds || []).includes(id) && token === "WIN") extraClasses.push("revenge-active-win");
      if (!suppressReturnPrefix && (episode.returnedIds || []).includes(id) && !["RTRN", "IN", "OUT", "RUN"].includes(token) && (token !== "ELIM" || ["random_return", "choose_return", "other_queens_choose", "reading_is_fundamental"].includes(comebackFormatForTrack))) display = `RTRN+<br/>${display}`;
      stats.track.push({ label: episode.label, token, display, extraClasses, eliminated: isUnplannedExitToken(token) });

      if (token === "WIN_QUIT") stats.wins += 1;
      else if (token === "WIN" || token === "DWIN") stats.wins += 1;
      else if (token === "IN" || token === "RTRN") stats.safes += 1;
      else if (token === "TOP2") stats.highs += 1;
      else if (token === "HIGH" || token === "HIGH_BLK") stats.highs += 1;
      else if (token === "SAFE" || token === "BLK" || /^LALA_R[1-5]$/.test(token) || /^REUNION_LOST_R/.test(token) || token === "RUN") stats.safes += 1;
      else if (token === "LOW") stats.lows += 1;
      else if (token === "BTM2_QUIT") stats.bottoms += 1;
      else if (/^BTM\d+$/.test(token) || token === "BTM" || token === "BTM2") stats.bottoms += 1;
      else if (token === "ELIM") stats.bottoms += 1;
      else if (token === "CHOC") stats.bottoms += 1;

      applyLegacyPlacementMomentum(season, episode, id, token);

      const popularityReaction = calculatePopularityReaction(season, episode, id, token);
      popularityQueue.push({ id, token, stats, reaction: popularityReaction });
    });

    applyRemainingCastPopularityComparison(season, episode, popularityQueue);

    popularityQueue.forEach(({ id, stats, reaction }) => {
      const majorCause = popularityReactionIsMajor(reaction);
      reaction.total = clamp(Number(reaction.total || 0), majorCause ? -42 : -28, majorCause ? 45 : 30);
      const appliedPopularity = applyPopularityDelta(season, id, reaction.total);
      reaction.applied = appliedPopularity;
      reaction.before = Math.round(Number(stats.popularity || 0) - appliedPopularity);
      reaction.after = Math.round(Number(stats.popularity || 0));

      const attention = Math.abs(appliedPopularity) * 0.42
        + Math.max(0, Number(reaction.lipSync || 0)) * 0.18
        + Math.max(0, Number(reaction.visibleEvents || 0)) * 0.22
        + Math.max(0, Number(reaction.hiddenEvents || 0)) * 0.16
        + Math.abs(Number(reaction.audienceDiscourse || 0)) * 0.20
        + Math.abs(Number(reaction.audienceShock || 0)) * 0.38
        + Number(episode.editMetrics?.[id]?.centrality || 0) / 30;
      const buzzDelta = Number(reaction.invisibility || 0) < 0
        ? Math.min(-1, Math.round(Number(reaction.invisibility || 0) * 0.65))
        : Math.round(attention - 2.2);
      stats.buzz = clamp(Number(stats.buzz ?? stats.popularity ?? 50) + clamp(buzzDelta, -8, 12), 0, 100);
      stats.buzzHistory = stats.buzzHistory || [];
      stats.buzzHistory.push({ label: episode.label, value: Math.round(stats.buzz) });

      episode.popularityReactions[id] = clone(reaction);
      stats.popularityReactions.push({ label: episode.label, ...clone(reaction) });
      stats.popularityHistory.push({ label: episode.label, value: Math.round(stats.popularity) });
    });
  }

  function edgicToneForMetrics(metrics, role = null) {
    const positive = Number(metrics?.positiveTone || 0);
    const negative = Number(metrics?.negativeTone || 0);
    const extreme = !!metrics?.extremeToneEligible;
    const storyRole = role?.storyRole || metrics?.narrativeRole || "";
    if ((extreme || storyRole === "hero") && positive >= 68 && negative <= 16) return "PP";
    if ((extreme || storyRole === "villain") && negative >= 68 && positive <= 16) return "NN";
    if (positive >= 18 && negative >= 18 && Math.abs(positive - negative) <= 14) return "M";
    if (positive >= 16 && positive - negative >= 10) return "P";
    if (negative >= 16 && negative - positive >= 10) return "N";
    return "";
  }

  function edgicBaseForMetrics(metrics) {
    const centrality = Number(metrics?.centrality || 0);
    const insight = Number(metrics?.insight || 0);
    const dimensionality = Number(metrics?.dimensionality || 0);
    const integral = centrality >= 52;
    const insightful = insight >= 40;
    const dimensional = dimensionality >= 38;
    if (integral && (insightful || dimensionality >= 52)) return "CP";
    if (!integral && insight >= 68 && dimensionality >= 60) return "CP";
    if (integral && insight < 30 && dimensionality < 32) return "OTT";
    if (integral || insight >= 29 || centrality >= 29 || dimensional) return "MOR";
    return "UTR";
  }

  function edgicVisibilitySlots(count, lateEpisode = false) {
    if (count <= 0) return [];
    if (lateEpisode) {
      const fives = Math.max(1, Math.round(count * 0.28));
      const fours = Math.max(1, Math.round(count * 0.38));
      const threes = Math.max(0, count - fives - fours);
      return [
        ...Array(fives).fill(5),
        ...Array(fours).fill(4),
        ...Array(threes).fill(3)
      ].slice(0, count);
    }
    if (count === 1) return [4];
    if (count === 2) return [4, 2];
    if (count === 3) return [4, 3, 2];
    const ones = count >= 7 ? Math.max(1, Math.round(count * 0.12)) : 0;
    const twos = Math.max(1, Math.round(count * 0.23));
    const fives = Math.max(1, Math.round(count * 0.08));
    const fours = Math.max(1, Math.round(count * 0.22));
    let threes = count - ones - twos - fives - fours;
    while (threes < 1) {
      if (fours > 1) { threes += 1; break; }
      if (twos > 1) { threes += 1; break; }
      break;
    }
    const slots = [
      ...Array(fives).fill(5),
      ...Array(fours).fill(4),
      ...Array(Math.max(0, threes)).fill(3),
      ...Array(twos).fill(2),
      ...Array(ones).fill(1)
    ];
    while (slots.length < count) slots.splice(Math.max(1, slots.length - ones), 0, 3);
    return slots.slice(0, count);
  }

  function overallEdgicFor(season, id) {
    const entries = season?.stats?.[id]?.edgic || [];
    if (!entries.length) return null;
    const baseWeight = { CP: 0, MOR: 0, UTR: 0, OTT: 0 };
    let positiveWeight = 0;
    let negativeWeight = 0;
    let mixedWeight = 0;
    let totalWeight = 0;
    const roleCounts = {};
    entries.forEach((entry, index) => {
      const lateWeight = 1 + (index / Math.max(1, entries.length - 1)) * 0.22;
      const visibilityWeight = 0.65 + Number(entry.visibility || 1) * 0.35;
      const weight = lateWeight * visibilityWeight;
      const value = String(entry.value || "MOR").toUpperCase();
      const base = value.startsWith("CP") ? "CP" : value.startsWith("OTT") ? "OTT" : value.startsWith("UTR") ? "UTR" : "MOR";
      baseWeight[base] += weight;
      totalWeight += weight;
      const tone = value.slice(base.length);
      if (tone === "PP") positiveWeight += weight * 2;
      else if (tone === "P") positiveWeight += weight;
      else if (tone === "NN") negativeWeight += weight * 2;
      else if (tone === "N") negativeWeight += weight;
      else if (tone === "M") mixedWeight += weight;
      const role = String(entry.narrativeRole || entry.editRole || "supporting");
      roleCounts[role] = (roleCounts[role] || 0) + weight;
    });

    const shares = Object.fromEntries(Object.entries(baseWeight).map(([key, value]) => [key, value / Math.max(1, totalWeight)]));
    const avgVisibility = average(entries.map((entry) => Number(entry.visibility || 1)));
    let base = "MOR";
    if (shares.UTR >= 0.50 && avgVisibility <= 2.45) base = "UTR";
    else if (shares.OTT >= 0.25 && baseWeight.OTT >= baseWeight.CP * 0.82) base = "OTT";
    else if (shares.CP >= 0.25 || (baseWeight.CP > baseWeight.MOR * 0.72 && shares.CP >= 0.20)) base = "CP";
    else if ((roleCounts.villain || 0) + (roleCounts.hero || 0) + (roleCounts.narrator || 0) >= totalWeight * 0.32 && shares.CP >= 0.18) base = "CP";

    if ((season.winnerId === id || (season.winnerIds || []).includes(id)) && base === "OTT") base = shares.CP >= 0.18 ? "CP" : "MOR";

    const tonedWeight = positiveWeight + negativeWeight + mixedWeight;
    let tone = "";
    if (tonedWeight >= totalWeight * 0.22) {
      if (mixedWeight >= totalWeight * 0.18 || (positiveWeight >= totalWeight * 0.18 && negativeWeight >= totalWeight * 0.18)) tone = "M";
      else if (positiveWeight >= totalWeight * 0.24 && positiveWeight >= negativeWeight * 1.28) tone = "P";
      else if (negativeWeight >= totalWeight * 0.24 && negativeWeight >= positiveWeight * 1.28) tone = "N";
    }

    const weighted = (field, fallback = 0) => {
      let numerator = 0;
      let denominator = 0;
      entries.forEach((entry, index) => {
        const weight = (0.65 + Number(entry.visibility || 1) * 0.35) * (1 + (index / Math.max(1, entries.length - 1)) * 0.22);
        const value = Number(entry?.[field]);
        if (!Number.isFinite(value)) return;
        numerator += value * weight;
        denominator += weight;
      });
      return denominator ? numerator / denominator : fallback;
    };
    return {
      value: `${base}${tone}`,
      visibility: clamp(Math.round(avgVisibility), 1, 5),
      centrality: weighted("centrality", avgVisibility * 17),
      insight: weighted("insight", 32),
      dimensionality: weighted("dimensionality", 32),
      positiveTone: weighted("positiveTone", 0),
      negativeTone: weighted("negativeTone", 0),
      extremeToneEligible: entries.some((entry) => entry.extremeToneEligible),
      baseShares: shares
    };
  }

  function applyEdgicFocusPackage(season, episode, row) {
    const metrics = row.metrics;
    const traits = narrativeContestant(season, row.id)?.traits || {};
    const role = row.role || episodeRoleEntry(episode, row.id);
    const storyRole = role.storyRole || "supporting";
    const hidden = (episode.hiddenNarrativeEvents || []).filter((event) => (event.ids || []).includes(row.id));
    const visible = (episode.untuckedEvents || []).filter((event) => (event.ids || []).includes(row.id));
    const hasInsightEvent = hidden.some((event) => Number(event.insight || 0) >= 22)
      || visible.some((event) => /^CP/.test(String(event.edgic || "").toUpperCase()) || String(event.type || "").toLowerCase() === "storyline");
    const hasDrama = visible.some((event) => ["drama", "fight", "shade", "rivalry", "argument", "meltdown"].includes(String(event.type || "").toLowerCase()))
      || hidden.some((event) => ["stirs_pot", "conflict_point_of_view", "rejects_critique", "delusional_boast", "villain_edit"].includes(String(event.type || "").toLowerCase()));

    if (storyRole === "invisible") {
      metrics.centrality = Math.min(Number(metrics.centrality || 0), 14);
      metrics.insight = Math.min(Number(metrics.insight || 0), 15);
      metrics.dimensionality = Math.min(Number(metrics.dimensionality || 0), 17);
    } else if (storyRole === "background") {
      metrics.centrality = clamp(Number(metrics.centrality || 0), 16, 29);
      metrics.insight = clamp(Number(metrics.insight || 0), 17, 32);
      metrics.dimensionality = clamp(Number(metrics.dimensionality || 0), 16, 31);
    } else if (storyRole === "supporting") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 25 + randInt(0, 9));
      metrics.insight = Math.max(Number(metrics.insight || 0), 20 + randInt(0, 10));
      metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 20 + randInt(0, 10));
    } else if (storyRole === "secondary") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 38 + randInt(0, 10));
      metrics.insight = Math.max(Number(metrics.insight || 0), 27 + randInt(0, 12));
      metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 27 + randInt(0, 12));
    } else if (storyRole === "lead") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 70 + randInt(0, 12));
      if (hasInsightEvent || Number(traits.narration || 0) + Number(traits.selfAwareness || 0) >= 118) {
        metrics.insight = Math.max(Number(metrics.insight || 0), 46 + randInt(0, 14));
        metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 42 + randInt(0, 14));
      } else if (hasDrama || Number(traits.loudness || 0) >= 68 || Number(traits.delusion || 0) >= 66) {
        metrics.insight = Math.min(Number(metrics.insight || 0), 25 + randInt(0, 5));
        metrics.dimensionality = Math.min(Number(metrics.dimensionality || 0), 24 + randInt(0, 6));
      } else {
        metrics.insight = Math.max(Number(metrics.insight || 0), 34 + randInt(0, 10));
        metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 34 + randInt(0, 10));
      }
    } else if (storyRole === "hero") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 58 + randInt(0, 10));
      metrics.insight = Math.max(Number(metrics.insight || 0), 42 + randInt(0, 13));
      metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 43 + randInt(0, 14));
      metrics.positiveTone = Math.max(Number(metrics.positiveTone || 0), 42 + randInt(0, 20));
    } else if (storyRole === "villain") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 62 + randInt(0, 12));
      metrics.negativeTone = Math.max(Number(metrics.negativeTone || 0), 46 + randInt(0, 22));
      if (Number(traits.selfAwareness || 0) + Number(traits.narration || 0) >= 118) {
        metrics.insight = Math.max(Number(metrics.insight || 0), 42 + randInt(0, 12));
        metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 38 + randInt(0, 12));
      } else {
        metrics.insight = Math.min(Number(metrics.insight || 0), 24 + randInt(0, 6));
        metrics.dimensionality = Math.min(Number(metrics.dimensionality || 0), 23 + randInt(0, 7));
      }
      metrics.extremeToneEligible = metrics.extremeToneEligible || Number(metrics.negativeTone || 0) >= 70;
    } else if (storyRole === "drama_starter") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 57 + randInt(0, 11));
      metrics.negativeTone = Math.max(Number(metrics.negativeTone || 0), 35 + randInt(0, 20));
      if (Number(traits.selfAwareness || 0) >= 58) {
        metrics.insight = Math.max(Number(metrics.insight || 0), 38 + randInt(0, 12));
        metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 35 + randInt(0, 12));
      } else {
        metrics.insight = Math.min(Number(metrics.insight || 0), 27 + randInt(0, 6));
        metrics.dimensionality = Math.min(Number(metrics.dimensionality || 0), 27 + randInt(0, 7));
      }
    } else if (storyRole === "emotional") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 52 + randInt(0, 10));
      metrics.insight = Math.max(Number(metrics.insight || 0), 44 + randInt(0, 12));
      metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 48 + randInt(0, 12));
      metrics.positiveTone = Math.max(Number(metrics.positiveTone || 0), 29 + randInt(0, 17));
      metrics.negativeTone = Math.max(Number(metrics.negativeTone || 0), 25 + randInt(0, 16));
    } else if (storyRole === "narrator") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 50 + randInt(0, 10));
      metrics.insight = Math.max(Number(metrics.insight || 0), 52 + randInt(0, 14));
      metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 39 + randInt(0, 13));
    } else if (storyRole === "wildcard") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 55 + randInt(0, 12));
      metrics.insight = Math.min(Number(metrics.insight || 0), 24 + randInt(0, 9));
      metrics.dimensionality = Math.min(Number(metrics.dimensionality || 0), 25 + randInt(0, 9));
      if (Number(traits.humor || 0) >= 68) metrics.positiveTone = Math.max(Number(metrics.positiveTone || 0), 25 + randInt(0, 20));
      if (Number(traits.delusion || 0) >= 62 || Number(traits.messiness || 0) >= 68) metrics.negativeTone = Math.max(Number(metrics.negativeTone || 0), 25 + randInt(0, 20));
    } else if (storyRole === "underdog") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 49 + randInt(0, 10));
      metrics.insight = Math.max(Number(metrics.insight || 0), 42 + randInt(0, 12));
      metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 45 + randInt(0, 13));
      metrics.positiveTone = Math.max(Number(metrics.positiveTone || 0), 34 + randInt(0, 18));
      metrics.negativeTone = Math.max(Number(metrics.negativeTone || 0), 12 + randInt(0, 12));
    } else if (storyRole === "professional") {
      metrics.centrality = Math.max(Number(metrics.centrality || 0), 42 + randInt(0, 10));
      metrics.insight = Math.max(Number(metrics.insight || 0), 31 + randInt(0, 10));
      metrics.dimensionality = Math.max(Number(metrics.dimensionality || 0), 28 + randInt(0, 10));
      metrics.positiveTone = Math.max(Number(metrics.positiveTone || 0), 18 + randInt(0, 10));
    }

    metrics.centrality = clamp(metrics.centrality, 0, 100);
    metrics.insight = clamp(metrics.insight, 0, 100);
    metrics.dimensionality = clamp(metrics.dimensionality, 0, 100);
    metrics.positiveTone = clamp(metrics.positiveTone, 0, 100);
    metrics.negativeTone = clamp(metrics.negativeTone, 0, 100);
  }

  function edgicBaseForNarrativeRole(metrics, role) {
    const storyRole = role?.storyRole || metrics?.narrativeRole || "supporting";
    if (storyRole === "invisible") return "UTR";
    if (storyRole === "background") return Number(metrics.insight || 0) >= 25 || Number(metrics.centrality || 0) >= 27 ? "MOR" : "UTR";
    if (storyRole === "villain") return Number(metrics.insight || 0) >= 38 && Number(metrics.dimensionality || 0) >= 35 ? "CP" : "OTT";
    if (storyRole === "hero") return Number(metrics.insight || 0) >= 40 ? "CP" : "MOR";
    if (storyRole === "drama_starter") return Number(metrics.insight || 0) >= 36 && Number(metrics.dimensionality || 0) >= 34 ? "CP" : "OTT";
    if (storyRole === "emotional") return Number(metrics.centrality || 0) >= 55 ? "CP" : "MOR";
    if (storyRole === "narrator") return Number(metrics.centrality || 0) >= 55 && Number(metrics.insight || 0) >= 48 ? "CP" : "MOR";
    if (storyRole === "wildcard") return Number(metrics.centrality || 0) >= 50 && Number(metrics.insight || 0) < 35 ? "OTT" : "MOR";
    if (storyRole === "underdog") return Number(metrics.centrality || 0) >= 55 ? "CP" : "MOR";
    if (storyRole === "professional") return Number(metrics.insight || 0) >= 42 && Number(metrics.centrality || 0) >= 50 ? "CP" : "MOR";
    return edgicBaseForMetrics(metrics);
  }

  function assignEpisodeEdgic(season, episode) {
    ensureNarrativeState(season);
    const ids = narrativeParticipants(episode).filter((id) => season.stats?.[id]);
    if (!episode.editMetrics || !Object.keys(episode.editMetrics).length) generateHiddenNarrativeEvents(season, episode);
    if (!episode.narrativeRoles || !Object.keys(episode.narrativeRoles).length) assignEpisodeNarrativeRoles(season, episode, ids);

    const rows = ids.map((id) => {
      const metrics = episode.editMetrics[id] || { centrality: 10, insight: 10, dimensionality: 10, positiveTone: 0, negativeTone: 0 };
      const role = episodeRoleEntry(episode, id);
      const storyRole = role.storyRole || "supporting";
      let visibility = storyRole === "lead" ? 5
        : ["hero", "villain"].includes(storyRole) ? (Math.random() < 0.32 ? 5 : 4)
          : storyRole === "narrator" ? (Math.random() < 0.30 ? 4 : 3)
            : ["drama_starter", "emotional", "wildcard", "underdog"].includes(storyRole) ? (Math.random() < 0.42 ? 4 : 3)
              : storyRole === "professional" || storyRole === "secondary" ? (Math.random() < 0.38 ? 3 : 2)
                : storyRole === "supporting" ? (Math.random() < 0.42 ? 3 : 2)
                  : storyRole === "background" ? 2 : 1;
      if (metrics.lipSyncing || metrics.eliminated) visibility = Math.max(3, visibility);
      if (metrics.winner) visibility = Math.max(3, visibility);
      const row = { id, metrics, role, visibility, editRole: role.focusRole || "supporting", base: "", tone: "", value: "" };
      applyEdgicFocusPackage(season, episode, row);
      row.base = edgicBaseForNarrativeRole(metrics, role);
      row.tone = edgicToneForMetrics(metrics, role);
      if (storyRole === "hero" && !row.tone) row.tone = "P";
      if (storyRole === "villain" && !row.tone) row.tone = "N";
      if (storyRole === "drama_starter" && !row.tone) row.tone = Number(metrics.positiveTone || 0) >= 22 ? "M" : "N";
      if (storyRole === "emotional" && !row.tone) row.tone = "M";
      if (storyRole === "underdog" && !row.tone && Number(metrics.positiveTone || 0) >= 30) row.tone = "P";
      if (storyRole === "wildcard" && !row.tone) {
        if (Number(metrics.positiveTone || 0) >= 25 && Number(metrics.negativeTone || 0) >= 25) row.tone = "M";
        else if (Number(metrics.positiveTone || 0) >= 25) row.tone = "P";
        else if (Number(metrics.negativeTone || 0) >= 25) row.tone = "N";
      }
      if (row.base === "CP") row.visibility = Math.max(3, row.visibility);
      if (row.base === "UTR") row.visibility = Math.min(3, row.visibility);
      if (["MOR", "OTT"].includes(row.base)) row.visibility = clamp(row.visibility, 2, 4);
      if (storyRole === "invisible") row.visibility = 1;
      row.value = `${row.base}${row.tone}`;
      return row;
    });

    if (rows.length >= 5 && !rows.some((row) => ["CP", "OTT"].includes(row.base))) {
      const lead = rows.find((row) => row.role.storyRole === "lead") || rows.slice().sort((a, b) => b.visibility - a.visibility)[0];
      lead.metrics.centrality = Math.max(lead.metrics.centrality, 68);
      if (Number(lead.metrics.insight || 0) >= 34) {
        lead.metrics.insight = Math.max(lead.metrics.insight, 45);
        lead.metrics.dimensionality = Math.max(lead.metrics.dimensionality, 40);
        lead.base = "CP";
      } else {
        lead.metrics.insight = Math.min(lead.metrics.insight, 27);
        lead.metrics.dimensionality = Math.min(lead.metrics.dimensionality, 28);
        lead.base = "OTT";
      }
      lead.visibility = Math.max(4, lead.visibility);
      lead.value = `${lead.base}${lead.tone}`;
    }

    if (rows.length >= 8 && !rows.some((row) => row.base === "UTR" && row.visibility === 1)) {
      const background = rows
        .filter((row) => !row.metrics.lipSyncing && !row.metrics.eliminated && !row.metrics.winner)
        .sort((a, b) => Number(a.metrics.centrality || 0) - Number(b.metrics.centrality || 0))[0];
      if (background) {
        background.role = { focusRole: "background", storyRole: "invisible", reason: "invisible edit" };
        background.editRole = "background";
        background.metrics.narrativeRole = "invisible";
        background.metrics.centrality = Math.min(background.metrics.centrality, 14);
        background.metrics.insight = Math.min(background.metrics.insight, 15);
        background.metrics.dimensionality = Math.min(background.metrics.dimensionality, 17);
        background.base = "UTR";
        background.tone = "";
        background.visibility = 1;
        background.value = "UTR";
      }
    }

    episode.editPlan = {
      primaryCharacters: rows.filter((row) => row.editRole === "primary").map((row) => row.id),
      secondaryCharacters: rows.filter((row) => row.editRole === "secondary").map((row) => row.id),
      supportingCharacters: rows.filter((row) => row.editRole === "supporting").map((row) => row.id),
      backgroundCharacters: rows.filter((row) => row.editRole === "background").map((row) => row.id),
      narrativeRoles: Object.fromEntries(rows.map((row) => [row.id, row.role.storyRole]))
    };

    rows.forEach((row) => {
      const entry = {
        value: row.value,
        visibility: row.visibility,
        editRole: row.editRole,
        narrativeRole: row.role.storyRole,
        centrality: Math.round(row.metrics.centrality),
        insight: Math.round(row.metrics.insight),
        dimensionality: Math.round(row.metrics.dimensionality),
        positiveTone: Math.round(row.metrics.positiveTone),
        negativeTone: Math.round(row.metrics.negativeTone),
        extremeToneEligible: !!row.metrics.extremeToneEligible
      };
      episode.edgic[row.id] = entry;
      season.stats[row.id].edgic.push({ label: episode.label, ...entry });
      const narrative = narrativeContestant(season, row.id);
      if (narrative) narrative.editHistory[narrative.editHistory.length - 1] = { ...(narrative.editHistory.at(-1) || {}), ...entry, label: episode.label };
    });

    (season.castOrder || []).forEach((id) => {
      if (!season.stats?.[id]) return;
      season.stats[id].overallEdgic = overallEdgicFor(season, id);
    });
  }


  function makeLalaparuzaGroups(ids) {
    const pool = shuffle(ids);
    const groups = [];
    if (pool.length % 2 === 1 && pool.length > 2) groups.push(pool.splice(0, 3));
    while (pool.length) groups.push(pool.splice(0, Math.min(2, pool.length)));
    return groups;
  }

  function shouldRunMidSeasonRateAQueen(season) {
    const premiere = season?.config?.premiereType || "regular";
    const disabledPremiere = ["rate_a_queen_s16", "rate_a_queen_s17", "split_s14"].includes(premiere);
    if (!season?.config?.specialMidSeasonRateAQueen) return false;
    if (season.specialMidSeasonRateAQueenUsed) return false;
    if (disabledPremiere) return false;
    if (season.castOrder.length < 12) return false;
    if (season.episodeCounter <= 3) return false;
    if (season.activeIds.length < 10 || season.activeIds.length > 13) return false;
    if (isAllWinnersFormat(season) || isTournamentFormat(season) || isTeamsFormat(season)) return false;
    if (shouldRunDirectComeback(season) || shouldRunSpecialComeback(season)) return false;
    return true;
  }

  function midSeasonRateAQueenChallenge(part) {
    const base = clone(getChallengeData().find((challenge) => challengeTypeKey(challenge.type) === "talent_show") || fallbackChallenges.find((challenge) => challengeTypeKey(challenge.type) === "talent_show"));
    return {
      ...(base || {}),
      id: `mid_season_rate_a_queen_talent_show_part_${part}`,
      name: "Mid-Season Rate-A-Queen Talent Show",
      type: "talent_show",
      repeatable: true,
      teamMode: "solo",
      description: "The queens perform in a two-part Talent Show, then the opposite group ranks them from first to last.",
      requiredSkills: (base && base.requiredSkills) || { comedy: 0.20, dance: 0.20, acting: 0.20, improv: 0.20, lipsync: 0.20 }
    };
  }

  function createMidSeasonRateAQueenPart(season, competingIds, raterIds, part, firstBatch, secondBatch, allIds) {
    const episode = createEpisodeShell(season, {
      type: "mid_season_rate_a_queen",
      title: `Episode ${season.episodeCounter}`,
      label: `Episode ${season.episodeCounter}`,
      specialPremiere: "mid_season_rate_a_queen",
      forcedChallengeType: "talent_show",
      competingIds: competingIds.slice(),
      runwayParticipantIds: allIds.slice(),
      rateAQueenTargetIds: competingIds.slice(),
      rateAQueenVoterIds: raterIds.slice(),
      runOnlyIds: raterIds.slice(),
      hideJudging: true,
      noMiniChallenge: true,
      noGuestJudge: true,
      midSeasonRateAQueen: {
        id: "mid_season_rate_a_queen",
        name: "Mid-Season Rate-A-Queen",
        part,
        firstBatch: firstBatch.slice(),
        secondBatch: secondBatch.slice(),
        competingIds: competingIds.slice(),
        raterIds: raterIds.slice()
      }
    });
    episode.challenge = midSeasonRateAQueenChallenge(part);
    episode.guestJudge = null;
    episode.miniChallenge = null;
    episode.noImmunityAward = true;
    episode.teams = { mode: "solo", groups: [] };
    runChallengeAndRunway(season, episode);
    assignMidSeasonRateAQueenPlacements(season, episode);
    resolveLipSyncsAndEliminations(season, episode);
    return episode;
  }

  function resolveMidSeasonRateAQueenBottomLipSync(season, episodeA, episodeB) {
    const q1 = (episodeA.bottomIds || [])[0] || null;
    const q2 = (episodeB.bottomIds || [])[0] || null;
    if (!q1 || !q2 || q1 === q2) return;
    const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, [q1, q2], "Bottom Ones Lip Sync For Your Life"));
    lipSync.resultType = "mid_season_rate_a_queen_bottom1";
    const winnerId = lipSync.winnerId || (lipSync.performances || [])[0]?.id || q1;
    const loserId = lipSync.loserId || (lipSync.performances || []).find((perf) => perf.id !== winnerId)?.id || q2;
    lipSync.loserId = loserId;
    lipSync.eliminatedId = loserId;
    lipSync.roundResultText = `${fullDisplayName(season.contestants[winnerId])}, shantay you stay. ${fullDisplayName(season.contestants[loserId])}, sashay away.`;

    episodeA.midSeasonRateAQueen = episodeA.midSeasonRateAQueen || {};
    episodeB.midSeasonRateAQueen = episodeB.midSeasonRateAQueen || {};
    [episodeA, episodeB].forEach((ep) => {
      ep.midSeasonRateAQueen.bottomLipSyncIds = [q1, q2];
      ep.midSeasonRateAQueen.bottomLipSyncWinnerId = winnerId;
      ep.midSeasonRateAQueen.bottomLipSyncLoserId = loserId;
    });

    if (loserId === q1) {
      episodeA.eliminatedIds = [q1];
    } else {
      episodeB.eliminatedIds = [q2];
    }
    episodeB.extraLipSyncs.push(lipSync);
    episodeB.s17SurvivalResultText = lipSync.roundResultText;
    episodeB.midSeasonRateAQueen.bottomLipSyncResultText = lipSync.roundResultText;
    [q1, q2].forEach((id) => updateLipSyncStats(season, id, id === winnerId));
  }

  function simulateMidSeasonRateAQueen(season) {
    const allIds = season.activeIds.slice();
    if (allIds.length < 2) return;
    season.specialMidSeasonRateAQueenUsed = true;
    const shuffled = shuffle(allIds);
    const firstSize = Math.ceil(shuffled.length / 2);
    const firstBatch = shuffled.slice(0, firstSize);
    let secondBatch = shuffled.slice(firstSize);
    if (!secondBatch.length) secondBatch = firstBatch.splice(Math.max(0, firstBatch.length - 1), 1);

    const episodeA = createMidSeasonRateAQueenPart(season, firstBatch, secondBatch, 1, firstBatch, secondBatch, allIds);
    season.episodeCounter += 1;
    const episodeB = createMidSeasonRateAQueenPart(season, secondBatch, firstBatch, 2, firstBatch, secondBatch, allIds);
    season.episodeCounter -= 1;

    resolveMidSeasonRateAQueenBottomLipSync(season, episodeA, episodeB);
    finalizeEpisode(season, episodeA);
    finalizeEpisode(season, episodeB);
  }

  function shouldRunSpecialLalaparuza(season) {
    return !!(season.config.specialLalaparuzaSmackdown && !season.specialLalaparuzaUsed && season.castOrder.length >= 9 && season.activeIds.length === 8 && !isAllWinnersFormat(season) && !isTournamentFormat(season) && !isTeamsFormat(season));
  }


  function shouldRunSpecialSlayOffs(season) {
    return !!(season.config.specialSlayOffs && !season.specialSlayOffsUsed && season.castOrder.length >= 9 && season.activeIds.length === 8 && !isAllWinnersFormat(season) && !isTournamentFormat(season) && !isTeamsFormat(season));
  }

  function simulateComebackSpecialEpisode(season) {
    const format = comebackFormat(season);
    if (format === "lalaparuza_comeback") return simulateLalaparuzaComebackEpisode(season);
    if (format === "game_within_a_game") return simulateGameWithinAGameEpisode(season);
    if (format === "attention_girl_groups") return simulateAttentionGirlGroupsComeback(season);
    if (format === "kitty_girl_groups") return simulateKittyGirlGroupsComeback(season);
    if (format === "revenge_of_the_queens") return simulateRevengeOfTheQueensComeback(season);
    return simulatePairedComebackChallenge(season, format);
  }

  function createComebackEpisode(season, format, titleSuffix = "Comeback") {
    const challenge = comebackChallenge(format);
    const episode = createEpisodeShell(season, { type: `comeback_${format}`, title: `Episode ${season.episodeCounter}`, label: `Episode ${season.episodeCounter}` });
    episode.challenge = challenge;
    episode.guestJudge = null;
    episode.miniChallenge = null;
    episode.comeback = {
      format,
      position: comebackPosition(format),
      title: challenge.name,
      quote: STANDALONE_COMEBACK_FORMATS.has(format) || format === "revenge_of_the_queens" ? "I have someone I want to re-introduce!" : "I have someone I want to re-introduce to the competition...",
      text: challenge.description,
      candidates: comebackEligibleEliminated(season),
      eligible: comebackEligibleEliminated(season),
      returnedId: null,
      scores: [],
      votes: [],
      pairs: [],
      teams: [],
      visualMode: format
    };
    episode.comebackParticipantIds = [...new Set([...(episode.comeback.candidates || []), ...season.activeIds])];
    episode.comebackPlacements = {};
    episode.noImmunityAward = true;
    episode.notes.push("Comeback Challenge: eliminated contestants are eligible to return this episode.");
    return episode;
  }

  function runComebackChallengeScores(season, episode, participantIds) {
    const originalActive = season.activeIds.slice();
    season.activeIds = participantIds.slice();
    runChallengeAndRunway(season, episode);
    season.activeIds = originalActive;
    episode.comeback.scores = (episode.scores || []).map((s) => ({ id: s.id, score: Math.round(s.total) }));
  }

  function simulatePairedComebackChallenge(season, format) {
    const eliminated = comebackEligibleEliminated(season);
    const active = season.activeIds.slice();
    if (!eliminated.length) { markComebackUsed(season); return; }

    if (["conjoined_twins", "reinas_de_la_comedia"].includes(format) && eliminated.length !== active.length) {
      markComebackUsed(season);
      return;
    }

    const episode = createComebackEpisode(season, format, comebackChallenge(format).name);
    episode.guestJudge = pickGuestJudge(episode.challenge.type);
    if (POST_MINI_COMEBACK_FORMATS.has(format)) runMiniChallenge(season, episode);

    const shuffledEliminated = shuffle(eliminated);
    const pairs = active.map((activeId, index) => ({
      name: `Pair ${index + 1}`,
      ids: [activeId, shuffledEliminated[index]].filter(Boolean)
    })).filter((pair) => pair.ids.length >= 2 || format !== "conjoined_twins");

    episode.teams = { mode: "pairs", groups: pairs };
    episode.comeback.pairs = pairs;
    episode.comeback.text = "The eliminated contestants are back! And this week, you'll be working in pairs. The winning pair's eliminated contestant will re-enter the competition.";
    const participants = [...new Set(pairs.flatMap((pair) => pair.ids))];
    runComebackChallengeScores(season, episode, participants);

    if (format === "conjoined_twins") {
      episode.runway = null;
      episode.runwayUsesChallengeScore = false;
      episode.runwayGroups = {};

      const eliminatedSet = new Set(eliminated);
      const activeSet = new Set(active);
      const pairRanks = pairs.map((pair) => {
        const ids = (pair.ids || []).slice();
        const activeId = ids.find((id) => activeSet.has(id)) || null;
        const elimId = ids.find((id) => eliminatedSet.has(id)) || null;
        const values = ids.map((id) => scoreForEpisodeId(episode, id, "total") || contestantScoreForComeback(season, id, episode.challenge, episode));
        return { pair, activeId, elimId, score: average(values) };
      }).filter((row) => row.activeId && row.elimId).sort((a, b) => b.score - a.score);

      if (!pairRanks.length) { markComebackUsed(season); finalizeEpisode(season, episode); return; }

      const winningPair = pairRanks[0];
      const returneeId = winningPair.elimId;
      const partnerId = winningPair.activeId;
      reviveContestant(season, returneeId);
      episode.returnedIds = [returneeId].filter(Boolean);
      episode.comeback.returnedId = returneeId;
      episode.comeback.winPair = [partnerId, returneeId].filter(Boolean);

      eliminated.forEach((id) => { episode.comebackPlacements[id] = id === returneeId ? "WIN" : "OUT"; });
      if (partnerId) episode.comebackPlacements[partnerId] = "WIN";

      const aliveAt = (index) => pairRanks[index]?.activeId || null;
      const pairCount = pairRanks.length;
      const winnerIds = [partnerId, returneeId].filter(Boolean);
      let highIds = [];
      let lowIds = [];
      let bottomIds = [];

      if (pairCount >= 4) {
        bottomIds = [aliveAt(pairCount - 2), aliveAt(pairCount - 1)].filter(Boolean);
      } else if (pairCount === 3) {
        bottomIds = [aliveAt(1), aliveAt(2)].filter(Boolean);
      } else if (pairCount === 2) {
        bottomIds = [aliveAt(1)].filter(Boolean);
      }

      if (pairCount >= 4) {
        const highsWanted = pairCount >= 6 ? 2 : 1;
        for (let i = 0; i < highsWanted; i += 1) {
          const id = aliveAt(1 + i);
          if (id && !winnerIds.includes(id) && !bottomIds.includes(id) && !highIds.includes(id)) highIds.push(id);
        }
        if (pairCount >= 5) {
          const id = aliveAt(pairCount - 3);
          if (id && !winnerIds.includes(id) && !highIds.includes(id) && !bottomIds.includes(id)) lowIds = [id];
        }
      }

      const used = new Set([...winnerIds, ...highIds, ...lowIds, ...bottomIds]);
      const safeIds = active.filter((id) => !used.has(id));

      episode.winnerIds = winnerIds;
      episode.highIds = highIds;
      episode.lowIds = lowIds;
      episode.bottomIds = bottomIds;
      episode.safeIds = safeIds;

      if (episode.bottomIds.length >= 2) {
        const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, episode.bottomIds, "Conjoined Twins Lip Sync For Your Life"));
        lipSync.resultType = "conjoined_comeback_elimination";
        episode.lipSync = lipSync;
        const lipRank = (lipSync.performances || []).slice().sort((a, b) => a.score - b.score).map((p) => p.id);
        episode.eliminatedIds = [lipSync.loserId || lipRank[0]].filter(Boolean);
        episode.savedIds = episode.bottomIds.filter((id) => !episode.eliminatedIds.includes(id));
        episode.bottomIds.forEach((id) => updateLipSyncStats(season, id, !episode.eliminatedIds.includes(id)));
        const pairedOutIds = (episode.comeback?.pairs || []).flatMap((pair) => {
          const hasEliminatedActive = (pair.ids || []).some((id) => episode.eliminatedIds.includes(id));
          return hasEliminatedActive ? (pair.ids || []).filter((id) => eliminatedSet.has(id) && id !== returneeId) : [];
        });
        const sashayIds = [...new Set([...episode.eliminatedIds, ...pairedOutIds])];
        lipSync.roundResultText = `${ampersandList(episode.savedIds, season, false)}, shantay you stay. ${ampersandList(sashayIds, season, false)}, sashay away...`;
      }

      episode.resultText = `${displayName(season.contestants[returneeId])} has won their way back into the competition!`;
      markComebackUsed(season);
      finalizeEpisode(season, episode);
      return;
    }

    if (format === "reinas_de_la_comedia") {
      episode.runway = null;
      episode.runwayUsesChallengeScore = false;
      episode.runwayGroups = {};

      const eliminatedSet = new Set(eliminated);
      const activeSet = new Set(active);
      const pairRanks = pairs.map((pair) => {
        const ids = (pair.ids || []).slice();
        const activeId = ids.find((id) => activeSet.has(id)) || null;
        const elimId = ids.find((id) => eliminatedSet.has(id)) || null;
        const values = ids.map((id) => scoreForEpisodeId(episode, id, "total") || contestantScoreForComeback(season, id, episode.challenge, episode));
        return { pair, activeId, elimId, score: average(values) };
      }).filter((row) => row.activeId && row.elimId).sort((a, b) => b.score - a.score);

      if (!pairRanks.length) { markComebackUsed(season); finalizeEpisode(season, episode); return; }

      const winningPair = pairRanks[0];
      const returneeId = winningPair.elimId;
      const partnerId = winningPair.activeId;
      reviveContestant(season, returneeId);
      episode.returnedIds = [returneeId].filter(Boolean);
      episode.comeback.returnedId = returneeId;
      episode.comeback.winPair = [partnerId, returneeId].filter(Boolean);

      eliminated.forEach((id) => { episode.comebackPlacements[id] = id === returneeId ? "DWIN" : "OUT"; });
      if (partnerId) episode.comebackPlacements[partnerId] = "DWIN";

      const aliveAt = (index) => pairRanks[index]?.activeId || null;
      const pairCount = pairRanks.length;
      const winnerIds = [partnerId, returneeId].filter(Boolean);
      let highIds = [];
      let lowIds = [];
      let bottomIds = [];

      if (pairCount >= 4) {
        bottomIds = [aliveAt(pairCount - 3), aliveAt(pairCount - 2), aliveAt(pairCount - 1)].filter(Boolean);
      } else if (pairCount === 3) {
        bottomIds = [aliveAt(1), aliveAt(2)].filter(Boolean);
      } else if (pairCount === 2) {
        bottomIds = [aliveAt(1)].filter(Boolean);
      }

      if (pairCount >= 5) {
        const highsWanted = pairCount >= 6 ? 2 : 1;
        for (let i = 0; i < highsWanted; i += 1) {
          const id = aliveAt(1 + i);
          if (id && !winnerIds.includes(id) && !bottomIds.includes(id) && !highIds.includes(id)) highIds.push(id);
        }
      }
      if (pairCount >= 7) {
        const id = aliveAt(pairCount - 4);
        if (id && !winnerIds.includes(id) && !highIds.includes(id) && !bottomIds.includes(id)) lowIds = [id];
      }

      const used = new Set([...winnerIds, ...highIds, ...lowIds, ...bottomIds]);
      const safeIds = active.filter((id) => !used.has(id));

      episode.winnerIds = winnerIds;
      episode.highIds = highIds;
      episode.lowIds = lowIds;
      episode.bottomIds = bottomIds;
      episode.safeIds = safeIds;

      if (episode.bottomIds.length >= 2) {
        const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, episode.bottomIds, "Reinas de la Comedia Bottom Lip Sync"));
        lipSync.resultType = "reinas_comeback_elimination";
        episode.lipSync = lipSync;
        const lipRank = (lipSync.performances || []).slice().sort((a, b) => a.score - b.score).map((p) => p.id);
        const eliminatedNow = episode.bottomIds.length >= 3 ? lipRank.slice(0, 2) : [lipSync.loserId || lipRank[0]].filter(Boolean);
        episode.eliminatedIds = eliminatedNow.filter(Boolean);
        episode.savedIds = episode.bottomIds.filter((id) => !episode.eliminatedIds.includes(id));
        episode.bottomIds.forEach((id) => updateLipSyncStats(season, id, !episode.eliminatedIds.includes(id)));
        lipSync.roundResultText = `${ampersandList(episode.savedIds, season, false)}, shantay you stay. ${ampersandList(episode.eliminatedIds, season, false)}, sashay away...`;
      }

      episode.resultText = `${displayName(season.contestants[returneeId])} has won their way back into the competition!`;
      markComebackUsed(season);
      finalizeEpisode(season, episode);
      return;
    }

    const pairRanks = pairs.map((pair) => ({ pair, score: average(pair.ids.map((id) => scoreForEpisodeId(episode, id, "total") || contestantScoreForComeback(season, id, episode.challenge, episode))) })).sort((a, b) => b.score - a.score);
    const winningPair = pairRanks[0]?.pair || pairs[0];
    const returneeId = (winningPair?.ids || []).find((id) => eliminated.includes(id)) || eliminated.slice().sort((a, b) => scoreForEpisodeId(episode, b, "total") - scoreForEpisodeId(episode, a, "total"))[0];
    const activePartnerIds = (winningPair?.ids || []).filter((id) => active.includes(id));
    reviveContestant(season, returneeId);
    episode.returnedIds = [returneeId].filter(Boolean);
    episode.comeback.returnedId = returneeId;
    eliminated.forEach((id) => { episode.comebackPlacements[id] = id === returneeId ? (format === "conjoined_twins" ? "RTRN" : "WIN") : "OUT"; });
    activePartnerIds.forEach((id) => { episode.comebackPlacements[id] = "DWIN"; });
    const rankedActive = active.slice().sort((a, b) => scoreForEpisodeId(episode, b, "total") - scoreForEpisodeId(episode, a, "total"));
    episode.winnerIds = activePartnerIds.slice();
    episode.highIds = rankedActive.filter((id) => !episode.winnerIds.includes(id)).slice(0, 2);
    if (format === "reinas_de_la_comedia") {
      episode.bottomIds = rankedActive.filter((id) => !episode.winnerIds.includes(id)).slice(-3);
      episode.lowIds = rankedActive.filter((id) => !episode.winnerIds.includes(id) && !episode.bottomIds.includes(id)).slice(-1);
    } else {
      episode.bottomIds = rankedActive.filter((id) => !episode.winnerIds.includes(id)).slice(-2);
      episode.lowIds = rankedActive.filter((id) => !episode.winnerIds.includes(id) && !episode.bottomIds.includes(id)).slice(-1);
    }
    episode.safeIds = rankedActive.filter((id) => !episode.winnerIds.includes(id) && !episode.highIds.includes(id) && !episode.lowIds.includes(id) && !episode.bottomIds.includes(id));
    if (episode.bottomIds.length >= 2) {
      const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, episode.bottomIds, format === "reinas_de_la_comedia" ? "Reinas de la Comedia Bottom Lip Sync" : "Conjoined Twins Lip Sync For Your Life"));
      lipSync.resultType = format === "reinas_de_la_comedia" ? "reinas_comeback_elimination" : "conjoined_comeback_elimination";
      episode.lipSync = lipSync;
      const lipRank = (lipSync.performances || []).slice().sort((a, b) => a.score - b.score).map((p) => p.id);
      const eliminatedNow = format === "reinas_de_la_comedia" ? lipRank.slice(0, 2) : [lipSync.loserId || lipRank[0]].filter(Boolean);
      episode.eliminatedIds = eliminatedNow.filter(Boolean);
      episode.savedIds = episode.bottomIds.filter((id) => !episode.eliminatedIds.includes(id));
      episode.bottomIds.forEach((id) => updateLipSyncStats(season, id, !episode.eliminatedIds.includes(id)));
      lipSync.roundResultText = `${sentenceList(episode.savedIds, season, false)}, shantay you stay. ${sentenceList(episode.eliminatedIds, season, false)}, sashay away.`;
    }
    episode.resultText = `${displayName(season.contestants[returneeId])} has won their way back into the competition!`;
    markComebackUsed(season);
    finalizeEpisode(season, episode);
  }

  function simulateAttentionGirlGroupsComeback(season) {
    const eliminated = comebackEligibleEliminated(season);
    const active = season.activeIds.slice();
    if (eliminated.length < 1 || active.length < 2) { markComebackUsed(season); return; }
    const episode = createComebackEpisode(season, "attention_girl_groups", "Attention Girl Groups");
    episode.guestJudge = pickGuestJudge(episode.challenge.type);
    runMiniChallenge(season, episode);
    episode.noDoubleLS = true;
    episode.comeback.text = "The eliminated contestants are back! And this week, you'll be working against each other. The eliminated contestants are competing for a chance to return to the competition! But more on that later...";
    episode.teams = { mode: "groups", groups: [{ name: "Remaining Contestants", ids: active.slice() }, { name: "Eliminated Contestants", ids: eliminated.slice() }] };
    episode.comeback.teams = episode.teams.groups;

    runComebackChallengeScores(season, episode, [...active, ...eliminated]);

    const rankedActive = active.slice().sort((a, b) => scoreForEpisodeId(episode, b, "total") - scoreForEpisodeId(episode, a, "total"));
    const rankedEliminated = eliminated.slice().sort((a, b) => scoreForEpisodeId(episode, b, "total") - scoreForEpisodeId(episode, a, "total"));
    const challengeWinner = rankedActive[0] || null;
    const bottomId = rankedActive.at(-1) || null;
    const challengerId = rankedEliminated[0] || null;

    episode.comeback.challengerId = challengerId;
    episode.comeback.bottomId = bottomId;

    episode.winnerIds = [challengeWinner].filter(Boolean);
    episode.bottomIds = [bottomId].filter(Boolean);

    const middleActive = rankedActive.slice(1, Math.max(1, rankedActive.length - 1));
    if (rankedActive.length >= 6) {
      episode.highIds = middleActive.slice(0, 2);
      episode.lowIds = middleActive.length >= 3 ? [middleActive.at(-1)].filter(Boolean) : [];
      episode.safeIds = middleActive.slice(2, Math.max(2, middleActive.length - episode.lowIds.length));
    } else if (rankedActive.length === 5) {
      episode.highIds = middleActive.slice(0, 1);
      episode.lowIds = middleActive.length >= 2 ? [middleActive.at(-1)].filter(Boolean) : [];
      episode.safeIds = middleActive.slice(1, Math.max(1, middleActive.length - episode.lowIds.length));
    } else {
      episode.highIds = [];
      episode.lowIds = [];
      episode.safeIds = middleActive.slice();
    }

    eliminated.forEach((id) => { episode.comebackPlacements[id] = "OUT"; });

    if (challengerId && bottomId) {
      const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, [challengerId, bottomId], "Comeback Lip Sync For Your Life"));
      lipSync.resultType = "attention_comeback";
      episode.lipSync = lipSync;
      updateLipSyncStats(season, challengerId, lipSync.winnerId === challengerId);
      updateLipSyncStats(season, bottomId, lipSync.winnerId === bottomId);

      if (lipSync.winnerId === challengerId) {
        reviveContestant(season, challengerId);
        episode.returnedIds = [challengerId];
        episode.eliminatedIds = [bottomId].filter(Boolean);
        episode.savedIds = [];
        episode.comebackPlacements[challengerId] = "RTRN";
        episode.resultText = `${displayName(season.contestants[challengerId])} has earned their spot back in the competition. ${displayName(season.contestants[bottomId])}, sashay away.`;
        lipSync.resultTextLine = `${displayName(season.contestants[challengerId])}, Shantay you stay! You've earned your chance to return! ${displayName(season.contestants[bottomId])}, sashay away.`;
      } else {
        episode.returnedIds = [];
        episode.eliminatedIds = [];
        episode.savedIds = [bottomId].filter(Boolean);
        episode.resultText = `${displayName(season.contestants[bottomId])} has defended their spot in the competition. ${displayName(season.contestants[challengerId])}, your comeback ends here.`;
        lipSync.resultTextLine = `${displayName(season.contestants[bottomId])}, Shantay you stay! You've defended your spot in the competition. ${displayName(season.contestants[challengerId])}, unfortunately, you did not earn your spot back. Sashay Away.`;
      }
    } else {
      episode.resultText = "No comeback lip sync could be staged.";
    }

    episode.comeback.returnedId = episode.returnedIds[0] || null;
    markComebackUsed(season);
    finalizeEpisode(season, episode);
  }

  function simulateKittyGirlGroupsComeback(season) {
    const eliminated = comebackEligibleEliminated(season);
    const active = season.activeIds.slice();
    if (eliminated.length < 1 || active.length < 2) { markComebackUsed(season); return; }

    const episode = createComebackEpisode(season, "kitty_girl_groups", "Kitty Girl Groups");

    const girlGroupPool = getChallengeData().filter((challenge) => {
      const type = challengeTypeKey(challenge.type);
      return type === "girlgroups" && !season.usedChallengeIds.includes(challenge.id);
    });
    if (girlGroupPool.length) {
      episode.challenge = clone(randomItem(girlGroupPool));
      episode.comeback.title = episode.challenge.name || "Kitty Girl Groups";
    }
    episode.noRunway = true;
    episode.noDoubleLS = true;
    episode.hideJudging = true;

    runMiniChallenge(season, episode);
    episode.comeback.text = "The eliminated contestants are back! This week, the remaining contestants will compete against the eliminated contestants in Rival Girl Groups. The winning group will have all the power!";
    episode.teams = {
      mode: "groups",
      groups: [
        { name: "Remaining Contestants", ids: active.slice() },
        { name: "Eliminated Contestants", ids: eliminated.slice() }
      ],
      locked: true,
      fixed: true
    };
    episode.comeback.teams = episode.teams.groups;
    episode.judgedInTeams = true;
    episode.teamWinMode = "solo";

    runComebackChallengeScores(season, episode, [...active, ...eliminated]);

    const scoreDesc = (ids) => ids.slice().sort((a, b) => scoreForEpisodeId(episode, b, "total") - scoreForEpisodeId(episode, a, "total"));
    const scoreAsc = (ids) => ids.slice().sort((a, b) => scoreForEpisodeId(episode, a, "total") - scoreForEpisodeId(episode, b, "total"));
    const activeRanked = scoreDesc(active);
    const elimRanked = scoreDesc(eliminated);
    const activeAvg = average(active.map((id) => scoreForEpisodeId(episode, id, "total")));
    const elimAvg = average(eliminated.map((id) => scoreForEpisodeId(episode, id, "total")));
    const winSide = activeAvg > elimAvg ? "remaining" : elimAvg > activeAvg ? "eliminated" : (Math.random() < 0.5 ? "remaining" : "eliminated");
    const activeSideWins = winSide === "remaining";
    const winningTeam = activeSideWins ? active.slice() : eliminated.slice();
    const top2 = (activeSideWins ? activeRanked : elimRanked).slice(0, 2);

    episode.kitty = {
      winSide,
      remainingTeam: active.slice(),
      eliminatedTeam: eliminated.slice(),
      top2: top2.slice(),
      bottomPool: [],
      bottomGroup: [],
      returnedId: null,
      eliminatedId: null
    };
    episode.winningTeamIds = winningTeam.slice();

    eliminated.forEach((id) => { episode.comebackPlacements[id] = "OUT"; });
    top2.forEach((id) => { episode.comebackPlacements[id] = "TOP2"; });

    if (top2.length < 2) {
      const fallbackReturnee = elimRanked[0] || eliminated[0] || null;
      if (fallbackReturnee) {
        reviveContestant(season, fallbackReturnee);
        episode.returnedIds = [fallbackReturnee];
        episode.comebackPlacements[fallbackReturnee] = "RTRN";
        episode.comeback.returnedId = fallbackReturnee;
        episode.kitty.returnedId = fallbackReturnee;
      }
      episode.safeIds = active.slice();
      episode.resultText = fallbackReturnee ? `${displayName(season.contestants[fallbackReturnee])} returns to the competition.` : "No comeback lip sync could be staged.";
      markComebackUsed(season);
      finalizeEpisode(season, episode);
      return;
    }

    const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, top2, "Kitty Girl Lip Sync For The Win"));
    lipSync.resultType = "kitty_girl_groups";
    episode.lipSync = lipSync;
    top2.forEach((id) => updateLipSyncStats(season, id, id === lipSync.winnerId));

    const winnerK = lipSync.winnerId || top2[0];
    const loserK = top2.find((id) => id !== winnerK) || lipSync.loserId || top2[1];
    episode.comebackPlacements[winnerK] = "WIN";
    if (loserK) episode.comebackPlacements[loserK] = activeSideWins ? "TOP2" : "OUT";

    const pickBestRelationship = (voterId, pool) => {
      const ids = (pool || []).filter(Boolean);
      if (!ids.length) return null;
      return ids.slice().sort((a, b) => Number(season.relationships[pairKey(voterId, b)] || 0) - Number(season.relationships[pairKey(voterId, a)] || 0) || randInt(-1, 1))[0];
    };
    const pickWorstRelationship = (voterId, pool) => {
      const ids = (pool || []).filter(Boolean);
      if (!ids.length) return null;
      return ids.slice().sort((a, b) => Number(season.relationships[pairKey(voterId, a)] || 0) - Number(season.relationships[pairKey(voterId, b)] || 0) || randInt(-1, 1))[0];
    };
    const pickBestTrack = (pool) => {
      const ids = (pool || []).filter(Boolean);
      if (!ids.length) return null;
      return ids.slice().sort((a, b) => trackRecordPower(season, b) - trackRecordPower(season, a) || randInt(-1, 1))[0];
    };
    const pickWorstTrack = (pool) => {
      const ids = (pool || []).filter(Boolean);
      if (!ids.length) return null;
      return ids.slice().sort((a, b) => trackRecordPower(season, a) - trackRecordPower(season, b) || randInt(-1, 1))[0];
    };
    const pickBestWeekly = (pool) => {
      const ids = (pool || []).filter(Boolean);
      if (!ids.length) return null;
      return ids.slice().sort((a, b) => scoreForEpisodeId(episode, b, "total") - scoreForEpisodeId(episode, a, "total") || randInt(-1, 1))[0];
    };

    let returneeId = null;
    let eliminatedActiveId = null;

    if (activeSideWins) {
      const roll = Math.random();
      if (roll < 0.30) returneeId = pickBestRelationship(winnerK, eliminated);
      else if (roll < 0.90) returneeId = pickBestTrack(eliminated);
      else returneeId = pickBestWeekly(eliminated);
      returneeId = returneeId || elimRanked[0] || eliminated[0] || null;

      const bottomPool = scoreAsc(active.filter((id) => !top2.includes(id)));
      episode.kitty.bottomPool = bottomPool.slice();
      episode.bottomIds = episode.kitty.bottomPool.slice();
      episode.bottomIds.forEach((id) => { episode.comebackPlacements[id] = "BTM"; });

      eliminatedActiveId = chooseEliminationVote(season, winnerK, episode.bottomIds, episode, "legacy") || episode.bottomIds[0] || null;
      if (eliminatedActiveId) episode.comebackPlacements[eliminatedActiveId] = "ELIM";

      episode.winnerIds = [winnerK].filter(Boolean);
      episode.top2Ids = loserK ? [loserK] : [];
      episode.safeIds = [];
    } else {
      returneeId = winnerK;
      episode.kitty.bottomGroup = active.slice();
      episode.bottomIds = active.slice();
      episode.bottomIds.forEach((id) => { episode.comebackPlacements[id] = "BTM"; });

      const bottomGroup = episode.kitty.bottomGroup.slice();
      const roll = Math.random();
      if (roll < 0.10) eliminatedActiveId = pickWorstRelationship(winnerK, bottomGroup);
      else if (roll < 0.90) eliminatedActiveId = pickWorstTrack(bottomGroup);
      else eliminatedActiveId = pickBestTrack(bottomGroup);
      eliminatedActiveId = eliminatedActiveId || activeRanked.at(-1) || active[0] || null;
      if (eliminatedActiveId) episode.comebackPlacements[eliminatedActiveId] = "ELIM";

      episode.winnerIds = [winnerK].filter(Boolean);
      episode.top2Ids = loserK ? [loserK] : [];
      episode.safeIds = [];
      episode.kittyGreenOutIds = loserK ? [loserK] : [];
    }

    if (returneeId) {
      reviveContestant(season, returneeId);
      episode.returnedIds = [returneeId];
      episode.comeback.returnedId = returneeId;
      episode.kitty.returnedId = returneeId;
      if (activeSideWins) episode.comebackPlacements[returneeId] = "RTRN";
      else episode.comebackPlacements[returneeId] = "WIN";
    }

    episode.eliminatedIds = [eliminatedActiveId].filter(Boolean);
    episode.kitty.eliminatedId = eliminatedActiveId || null;
    episode.savedIds = [];
    episode.kittyReturnRevealed = false;
    episode.kittyEliminationRevealed = false;
    episode.hideJudging = true;

    if (activeSideWins) {
      lipSync.resultTextLine = `${displayName(season.contestants[winnerK])}, you're a winner, baby!`;
    } else {
      lipSync.resultTextLine = `${displayName(season.contestants[winnerK])}, you're a winner, baby! You have earned your spot back in the competition.${loserK ? ` ${displayName(season.contestants[loserK])}, your comeback ends here.` : ""}`;
    }
    episode.resultText = "The Kitty Girl Groups decisions are revealed in Results.";

    markComebackUsed(season);
    finalizeEpisode(season, episode);
  }

  function pickRevengeComedyChallenge(season, episode) {
    const revengeComedyTypes = new Set(["comedy", "roast", "stand_up", "standup", "improv", "snatch_game"]);
    const all = getChallengeData();
    const isRevengeComedyChallenge = (challenge) => {
      const type = challengeTypeKey(challenge.type);
      const haystack = `${challenge.name || ""} ${challenge.description || ""} ${challenge.type || ""}`.toLowerCase();
      if (["acting", "ads"].includes(type)) return false;
      if (/acting|commercial|advert|branding/.test(haystack)) return false;
      return revengeComedyTypes.has(type) || /comedy|roast|stand[\s_-]*up|improv|snatch/.test(haystack);
    };
    const notRecentlyUsed = (challenge) => {
      const type = challengeTypeKey(challenge.type);
      if ((season.usedChallengeIds || []).includes(challenge.id)) return false;
      if ((season.usedChallengeTypes || []).at(-1) === type) return false;
      return true;
    };
    const comedyPool = all.filter((challenge) => isRevengeComedyChallenge(challenge));
    const freshComedyPool = comedyPool.filter(notRecentlyUsed);
    const spacedComedyPool = freshComedyPool.filter((challenge) => isChallengeFamilySpaced(season, challenge.type));
    const pool = spacedComedyPool.length ? spacedComedyPool : freshComedyPool.length ? freshComedyPool : comedyPool.length ? comedyPool : all;
    const picked = clone(weightedChallengePick(season, episode, pool));
    picked.originalType = picked.type;
    picked.type = "comedy";
    return picked;
  }

  function simulateRevengeOfTheQueensComeback(season) {
    const eliminated = comebackEligibleEliminated(season);
    const active = season.activeIds.slice();
    if (eliminated.length < 2 || active.length < 3) { markComebackUsed(season); return; }

    const episode = createComebackEpisode(season, "revenge_of_the_queens", "Revenge of The Queens");
    episode.challenge = pickRevengeComedyChallenge(season, episode);
    episode.comeback.title = episode.challenge.name;
    episode.guestJudge = pickGuestJudge(episode.challenge.type);
    episode.miniChallenge = null;
    episode.runway = null;
    episode.runwayUsesChallengeScore = false;
    episode.runwayGroups = {};
    episode.hideJudging = false;
    episode.comeback.text = "Welcome back, the eliminated contestants! However, they are not fully back just yet. This week, the eliminated contestants will work with the remaining contestants and the winner will get to rejoin the competition!";

    const shuffledEliminated = shuffle(eliminated);
    const pairs = active.map((activeId, index) => ({
      name: shuffledEliminated[index] ? `Pair ${index + 1}` : `${fullDisplayName(season.contestants[activeId])} will be performing solo.`,
      ids: [activeId, shuffledEliminated[index]].filter(Boolean)
    }));
    episode.teams = { mode: "pairs", groups: pairs };
    episode.comeback.pairs = pairs;
    episode.comeback.soloIds = pairs.filter((pair) => (pair.ids || []).length === 1).flatMap((pair) => pair.ids || []);

    const participants = [...new Set(pairs.flatMap((pair) => pair.ids || []))];
    runComebackChallengeScores(season, episode, participants);
    episode.runway = null;
    episode.runwayUsesChallengeScore = false;
    episode.runwayGroups = {};

    const eliminatedSet = new Set(eliminated);
    const activeSet = new Set(active);
    const pairRanks = pairs.map((pair) => {
      const ids = (pair.ids || []).slice();
      const activeId = ids.find((id) => activeSet.has(id)) || null;
      const elimId = ids.find((id) => eliminatedSet.has(id)) || null;
      const values = ids.map((id) => scoreForEpisodeId(episode, id, "total") || contestantScoreForComeback(season, id, episode.challenge, episode));
      return { pair, activeId, elimId, score: average(values) };
    }).filter((row) => row.activeId).sort((a, b) => b.score - a.score);

    const comebackPairRanks = pairRanks.filter((row) => row.elimId);
    const topPairs = comebackPairRanks.slice(0, 2);
    const topEliminatedIds = topPairs.map((row) => row.elimId).filter(Boolean);
    const activeWinnerIds = topPairs.map((row) => row.activeId).filter(Boolean);
    if (topEliminatedIds.length < 2) { markComebackUsed(season); finalizeEpisode(season, episode); return; }

    const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, topEliminatedIds, "Revenge Lip Sync To Return"));
    lipSync.resultType = "revenge_comeback";
    episode.lipSync = lipSync;
    topEliminatedIds.forEach((id) => updateLipSyncStats(season, id, id === lipSync.winnerId));

    const returneeId = lipSync.winnerId;
    const loserReturnId = topEliminatedIds.find((id) => id !== returneeId) || lipSync.loserId || null;
    const activeOrder = pairRanks.map((row) => row.activeId).filter(Boolean).filter((id, index, arr) => arr.indexOf(id) === index);
    const remainingActiveOrder = activeOrder.filter((id) => !activeWinnerIds.includes(id));
    let bottomIds = remainingActiveOrder.slice(-2);
    if (bottomIds.length < 2) bottomIds = activeOrder.filter((id) => !activeWinnerIds.includes(id)).slice(-2);
    if (bottomIds.length < 2) bottomIds = active.filter((id) => !activeWinnerIds.includes(id)).slice(-2);

    const nonBottomActive = remainingActiveOrder.filter((id) => !bottomIds.includes(id));
    const highCount = nonBottomActive.length >= 4 ? 2 : nonBottomActive.length >= 2 ? 1 : 0;
    const highIds = nonBottomActive.slice(0, highCount);
    const afterHigh = nonBottomActive.filter((id) => !highIds.includes(id));
    const lowIds = afterHigh.length ? afterHigh.slice(-1) : [];
    const safeIds = afterHigh.filter((id) => !lowIds.includes(id));

    if (returneeId) reviveContestant(season, returneeId);
    const eliminatedActiveId = chooseEliminationVote(season, returneeId || activeWinnerIds[0] || null, bottomIds, episode, "legacy") || bottomIds.slice().sort((a, b) => scoreForEpisodeId(episode, a, "total") - scoreForEpisodeId(episode, b, "total"))[0] || null;

    episode.returnedIds = [returneeId].filter(Boolean);
    episode.eliminatedIds = [eliminatedActiveId].filter(Boolean);
    episode.bottomIds = bottomIds.slice();
    episode.highIds = highIds.slice();
    episode.safeIds = safeIds.slice();
    episode.lowIds = lowIds.slice();
    episode.top2Ids = topEliminatedIds.slice();
    episode.winnerIds = [...new Set(activeWinnerIds.filter(Boolean))];
    episode.revengeActiveWinnerIds = activeWinnerIds.slice();
    episode.revengeTopEliminatedIds = topEliminatedIds.slice();
    episode.revengeGreenOutIds = [loserReturnId].filter(Boolean);
    episode.revengeChopRevealed = false;
    episode.comeback.returnedId = returneeId;
    episode.comeback.topEliminatedIds = topEliminatedIds.slice();
    episode.comeback.activeWinnerIds = activeWinnerIds.slice();
    episode.comeback.eliminatedActiveId = eliminatedActiveId;
    episode.comeback.bottomChoiceIds = bottomIds.slice();

    eliminated.forEach((id) => { episode.comebackPlacements[id] = "OUT"; });
    topEliminatedIds.forEach((id) => { episode.comebackPlacements[id] = "TOP2"; });
    if (loserReturnId) episode.comebackPlacements[loserReturnId] = "OUT";
    if (returneeId) episode.comebackPlacements[returneeId] = "WIN";

    const returnName = returneeId ? fullDisplayName(season.contestants[returneeId]) : "";
    const loserName = loserReturnId ? fullDisplayName(season.contestants[loserReturnId]) : "";
    lipSync.roundResultText = `${returnName}, shantay you stay. ${loserName}, sashay away... ${returnName}, you're back in the race, baby!`;
    episode.resultText = returnName ? `${returnName} wins the revenge lip sync and returns to the competition.` : "The revenge lip sync is complete.";

    markComebackUsed(season);
    finalizeEpisode(season, episode);
  }

  function simulateLalaparuzaComebackEpisode(season) {
    const eliminated = comebackEligibleEliminated(season);
    const originalActive = season.activeIds.slice();
    if (!eliminated.length || !originalActive.length) { markComebackUsed(season); return; }

    const episode = createComebackEpisode(season, "lalaparuza_comeback", "LaLaPaRuZa Comeback");
    episode.runway = null;
    episode.scores = [];
    episode.winnerIds = [];
    episode.highIds = [];
    episode.lowIds = [];
    episode.bottomIds = [];
    episode.safeIds = [];
    episode.savedIds = [];
    episode.runOnlyIds = [];
    episode.lalaparuzaComeback = true;

    const previousWinnerId = (() => {
      if (season.castOrder.length % 2 === 0) return null;
      const previousEpisode = (season.episodes || []).slice().reverse().find((ep) => (ep.winnerIds || []).some((id) => originalActive.includes(id)));
      return (previousEpisode?.winnerIds || []).find((id) => originalActive.includes(id)) || null;
    })();

    const battleActive = shuffle(originalActive.filter((id) => id !== previousWinnerId));
    const pairs = [];
    const lipSyncs = [];
    const tieIds = [];

    eliminated.forEach((elimId, index) => {
      const activeId = battleActive[index];
      if (!activeId) {
        episode.comebackPlacements[elimId] = "OUT";
        return;
      }

      pairs.push({ name: `Lip Sync #${index + 1}`, ids: [elimId, activeId] });
      const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, [elimId, activeId], `Lip Sync #${index + 1}`));
      lipSync.resultType = "lalaparuza_comeback";

      const elimPerf = (lipSync.performances || []).find((perf) => perf.id === elimId);
      const activePerf = (lipSync.performances || []).find((perf) => perf.id === activeId);
      const diff = Math.abs(Number(elimPerf?.score || 0) - Number(activePerf?.score || 0));
      const isTie = diff <= 3;
      const elimWins = lipSync.winnerId === elimId;
      const elimName = displayName(season.contestants[elimId]);
      const activeName = displayName(season.contestants[activeId]);

      lipSync.comebackBattle = { eliminatedId: elimId, activeId, isTie, returned: false, activeEliminated: false };

      if (isTie) {
        reviveContestant(season, elimId);
        episode.returnedIds.push(elimId);
        episode.safeIds.push(activeId);
        episode.comebackPlacements[elimId] = "RTRN";
        lipSync.comebackBattle.returned = true;
        lipSync.tieIds = [elimId, activeId];
        tieIds.push(elimId, activeId);
        lipSync.roundResultText = `It's a tie! ${elimName} & ${activeName}, shantay you both stay.`;
      } else if (elimWins) {
        reviveContestant(season, elimId);
        episode.returnedIds.push(elimId);
        episode.eliminatedIds.push(activeId);
        episode.comebackPlacements[elimId] = "RTRN";
        lipSync.comebackBattle.returned = true;
        lipSync.comebackBattle.activeEliminated = true;
        lipSync.roundResultText = `${elimName}, shantay you stay. ${activeName}, sashay away.`;
      } else {
        episode.savedIds.push(activeId);
        episode.comebackPlacements[elimId] = "OUT";
        lipSync.roundResultText = `${activeName}, shantay you stay. ${elimName}, sashay away.`;
      }

      [elimId, activeId].forEach((id) => updateLipSyncStats(season, id, isTie || id === lipSync.winnerId));
      lipSyncs.push(lipSync);
    });

    const battledActiveIds = pairs.flatMap((pair) => pair.ids || []).filter((id) => originalActive.includes(id));
    episode.runOnlyIds = originalActive.filter((id) => !battledActiveIds.includes(id));
    if (previousWinnerId && episode.runOnlyIds.includes(previousWinnerId)) episode.lalaparuzaImmuneId = previousWinnerId;

    episode.comeback.pairs = pairs;
    episode.comeback.immuneId = episode.lalaparuzaImmuneId || null;
    episode.extraLipSyncs = lipSyncs;
    episode.lipSync = null;

    episode.runOnlyIds.forEach((id) => { episode.comebackPlacements[id] = "RUN"; });
    episode.savedIds.forEach((id) => { episode.comebackPlacements[id] = "SAFE"; });
    episode.safeIds.forEach((id) => { episode.comebackPlacements[id] = "SAFE"; });
    episode.eliminatedIds.forEach((id) => { episode.comebackPlacements[id] = "ELIM"; });

    episode.comeback.returnedId = episode.returnedIds[0] || null;
    episode.lalaparuzaTieIds = [...new Set(tieIds)];
    episode.resultText = episode.returnedIds.length ? `${sentenceList(episode.returnedIds, season, false)} ${episode.returnedIds.length === 1 ? "has" : "have"} returned to the competition.` : "No eliminated queen won her way back into the competition.";
    markComebackUsed(season);
    finalizeEpisode(season, episode);
  }

  function simulateGameWithinAGameEpisode(season) {
    const eliminated = comebackEligibleEliminated(season);
    const originalActive = season.activeIds.slice();
    if (eliminated.length < 2) { markComebackUsed(season); return; }
    const episode = createComebackEpisode(season, "game_within_a_game", "Game Within a Game");
    episode.runway = null;
    episode.scores = [];
    episode.winnerIds = [];
    episode.highIds = [];
    episode.safeIds = [];
    episode.lowIds = [];
    episode.bottomIds = [];

    const lipSyncs = [];
    const lostIds = [];
    let currentChampionId = eliminated[0];

    eliminated.slice(1).forEach((challengerId, index, challengers) => {
      const battleNumber = index + 1;
      const ids = [currentChampionId, challengerId].filter(Boolean);
      if (ids.length < 2) return;

      const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, ids, `Game Within a Game Lip Sync #${battleNumber}`));
      const winnerId = lipSync.winnerId || ids[0];
      const loserIds = ids.filter((id) => id !== winnerId);
      const winnerName = fullDisplayName(season.contestants[winnerId] || {});
      const loserText = sentenceList(loserIds, season, false);
      const isFinalBattle = index === challengers.length - 1;

      lipSync.context = `Game Within a Game Lip Sync #${battleNumber}`;
      lipSync.resultType = "game_within_a_game";
      lipSync.gameWithinAGame = true;
      lipSync.gameWithinAGameFinal = isFinalBattle;
      lipSync.roundNumber = battleNumber;
      lipSync.roundPosition = 1;
      lipSync.roundResultText = isFinalBattle
        ? `${winnerName}, shantay you stay! You have earned your spot back in the competition.`
        : `${winnerName}, shantay you stay. ${loserText}, thank you for an unforgettable season. Now, sashay away...`;

      ids.forEach((id) => updateLipSyncStats(season, id, id === winnerId));
      lostIds.push(...loserIds);
      currentChampionId = winnerId;
      lipSyncs.push(lipSync);
    });

    const winnerId = currentChampionId;
    reviveContestant(season, winnerId);
    episode.returnedIds = [winnerId].filter(Boolean);
    episode.runOnlyIds = originalActive.slice();
    episode.runOnlyIds.forEach((id) => { episode.comebackPlacements[id] = "RUN"; });
    episode.extraLipSyncs = lipSyncs;
    episode.lipSync = null;
    eliminated.forEach((id) => { episode.comebackPlacements[id] = id === winnerId ? "IN" : "OUT"; });
    lostIds.forEach((id) => { if (id !== winnerId) episode.comebackPlacements[id] = "OUT"; });
    episode.comeback.returnedId = winnerId;
    episode.comeback.gauntletOrder = eliminated.slice();
    episode.resultText = `${displayName(season.contestants[winnerId])}, shantay you stay! You have earned your spot back in the competition.`;
    markComebackUsed(season);
    finalizeEpisode(season, episode);
  }

  function lipSyncTournamentRound(season, ids, contextPrefix, winnersAdvance = true) {
    const rounds = [];
    let current = ids.slice();
    let round = 1;
    while (current.length > 1) {
      const groups = makeLalaparuzaGroups(current);
      const winners = [];
      const losers = [];
      groups.forEach((group, index) => {
        if (group.length <= 1) { winners.push(...group); return; }
        const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, group, `${contextPrefix} Round ${round}`));
        const winnerId = lipSync.winnerId;
        const roundLosers = group.filter((id) => id !== winnerId);
        lipSync.roundNumber = round;
        lipSync.roundPosition = index + 1;
        lipSync.resultType = winnersAdvance ? `slayoffs_round_${round}` : `reunion_lalaparuza_round_${round}`;
        lipSync.roundResultText = winnersAdvance
          ? `${displayName(season.contestants[winnerId])}, shantay you stay and advance. ${formatList(roundLosers, season)} ${roundLosers.length === 1 ? "is" : "are"} out of the winners' bracket.`
          : `${displayName(season.contestants[winnerId])}, shantay you stay. ${formatList(roundLosers, season)} ${roundLosers.length === 1 ? "has" : "have"} lost this round.`;
        rounds.push(lipSync);
        winners.push(winnerId);
        losers.push(...roundLosers);
        group.forEach((id) => updateLipSyncStats(season, id, id === winnerId));
      });
      current = winnersAdvance ? winners : winners;
      round += 1;
      if (round > 8) break;
    }
    return { lipSyncs: rounds, winnerId: current[0] || null };
  }

  function simulateSpecialSlayOffs(season) {
    const episode = createEpisodeShell(season, { type: "special_slayoffs", title: `Episode ${season.episodeCounter}`, label: `Episode ${season.episodeCounter}` });
    episode.challenge = {
      id: "special_slayoffs",
      name: "Slay-Offs",
      type: "lalaparuza",
      teamMode: "solo",
      description: "The Top 8 battle in a winners-advance lip sync tournament. After one queen wins the bracket, they save one eliminated competitor from the final bottom lip sync. The remaining three lip sync for survival, and two contestants go home.",
      requiredSkills: { lipsync: 1 }
    };
    episode.runway = null;
    episode.guestJudge = null;
    episode.miniChallenge = null;
    episode.slayOffsSpecial = true;
    const ids = shuffle(season.activeIds.slice());
    const rounds = [];
    const roundLost = {};
    let current = ids.slice();
    for (let round = 1; current.length > 1 && round <= 3; round += 1) {
      const winners = [];
      makeLalaparuzaGroups(current).forEach((group, index) => {
        if (group.length <= 1) { winners.push(...group); return; }
        const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, group, `Slay-Offs Round ${round}`));
        const winnerId = lipSync.winnerId;
        const losers = group.filter((id) => id !== winnerId);
        lipSync.resultType = `slayoffs_round_${round}`;
        lipSync.roundNumber = round;
        lipSync.roundPosition = index + 1;
        lipSync.roundResultText = `${displayName(season.contestants[winnerId])}, shantay you stay and advance. ${formatList(losers, season)} ${losers.length === 1 ? "is" : "are"} out of the bracket.`;
        rounds.push(lipSync);
        winners.push(winnerId);
        losers.forEach((id) => { if (!roundLost[id]) roundLost[id] = round; });
        group.forEach((id) => updateLipSyncStats(season, id, id === winnerId));
      });
      current = winners;
    }
    const bracketWinner = current[0] || rounds.at(-1)?.winnerId || ids[0];
    const top2Loser = (rounds.filter((ls) => ls.roundNumber === 3).at(-1)?.ids || []).find((id) => id !== bracketWinner) || null;
    const round2Losers = Object.entries(roundLost).filter(([, r]) => Number(r) === 2).map(([id]) => id);
    const round1Losers = Object.entries(roundLost).filter(([, r]) => Number(r) === 1).map(([id]) => id);
    const loserPool = [...new Set(round1Losers.filter(Boolean))];
    const savePool = loserPool.slice();
    const savedId = savePool.length ? savePool.map((id) => ({ id, score: 55 + trackRecordPower(season, id) * 0.25 + randInt(-8, 8) })).sort((a, b) => b.score - a.score)[0].id : null;
    const bottomThree = loserPool.filter((id) => id !== savedId).slice(0, 3);
    while (bottomThree.length < 3) {
      const fill = round1Losers.find((id) => id !== savedId && !bottomThree.includes(id));
      if (!fill) break;
      bottomThree.push(fill);
    }
    const bottomLipSync = applyRupaulLipSyncChoice(season, createLipSync(season, bottomThree, "Slay-Offs Bottom Lip Sync"));
    const survivedId = bottomLipSync.winnerId;
    const eliminatedIds = bottomThree.filter((id) => id !== survivedId).slice(0, 2);
    bottomLipSync.resultType = "slayoffs_bottom";
    bottomLipSync.roundResultText = `${displayName(season.contestants[survivedId])}, shantay you stay. ${formatList(eliminatedIds, season)}, sashay away.`;
    bottomThree.forEach((id) => updateLipSyncStats(season, id, id === survivedId));
    episode.extraLipSyncs = rounds;
    episode.lipSync = bottomLipSync;
    episode.winnerIds = [bracketWinner].filter(Boolean);
    episode.top2Ids = top2Loser ? [top2Loser] : [];
    episode.highIds = round2Losers.filter((id) => id !== top2Loser);
    episode.lowIds = savedId ? [savedId] : [];
    episode.bottomIds = bottomThree.slice();
    episode.savedIds = [survivedId].filter(Boolean);
    episode.eliminatedIds = eliminatedIds.slice();
    episode.slayOffsSavedId = savedId;
    episode.slayOffsBottomSurvivorId = survivedId;
    episode.resultText = `${displayName(season.contestants[survivedId])}, shantay you stay. ${formatList(eliminatedIds, season)}, sashay away.`;
    episode.notes.push("Special Challenge: the Slay-Offs use a winners-advance lip sync tournament, a Saving Ceremony, and a final bottom-three lip sync.");
    season.specialSlayOffsUsed = true;
    finalizeEpisode(season, episode);
  }

  function simulateReunionLalaparuzaEpisode(season) {
    const eliminated = season.eliminatedIds.slice().filter((id) => season.contestants[id] && !season.activeIds.includes(id) && !isIneligibleUnplannedExit(season, id));
    if (season.specialReunionLalaparuzaUsed || eliminated.length < 2) return;
    const episode = createEpisodeShell(season, { type: "reunion_lalaparuza", title: `Episode ${season.episodeCounter}`, label: `Episode ${season.episodeCounter}` });
    episode.activeStartIds = season.castOrder.slice();
    episode.challenge = { id: "reunion_lalaparuza", name: "Reunion LaLaPaRuZa", type: "lalaparuza", teamMode: "solo", description: "The eliminated contestants return for a reunion lip sync smackdown to crown the Queen of She Done Already Done Had Herses.", requiredSkills: { lipsync: 1 } };
    episode.runway = null;
    episode.guestJudge = null;
    episode.miniChallenge = null;
    const rounds = [];
    const lostRound = {};
    let current = shuffle(eliminated);
    for (let round = 1; current.length > 1 && round <= 4; round += 1) {
      const winners = [];
      makeLalaparuzaGroups(current).forEach((group, index) => {
        if (group.length <= 1) { winners.push(...group); return; }
        const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, group, `Reunion LaLaPaRuZa Round ${round}`));
        const winnerId = lipSync.winnerId;
        const losers = group.filter((id) => id !== winnerId);
        lipSync.resultType = `reunion_lalaparuza_round_${round}`;
        lipSync.roundNumber = round;
        lipSync.roundPosition = index + 1;
        lipSync.roundResultText = `${displayName(season.contestants[winnerId])}, shantay you stay. ${formatList(losers, season)} ${losers.length === 1 ? "has" : "have"} been knocked out.`;
        rounds.push(lipSync);
        winners.push(winnerId);
        losers.forEach((id) => { lostRound[id] = round; });
        group.forEach((id) => updateLipSyncStats(season, id, id === winnerId));
      });
      current = winners;
    }
    const winnerId = current[0] || rounds.at(-1)?.winnerId || eliminated[0];
    episode.extraLipSyncs = rounds;
    episode.reunionWinnerId = winnerId;
    episode.reunionLostRound = lostRound;
    episode.safeIds = season.activeIds.slice();
    episode.winnerIds = [winnerId].filter(Boolean);
    episode.resultText = `${displayName(season.contestants[winnerId])} is Queen of She Done Already Done Had Herses!`;
    season.specialReunionLalaparuzaUsed = true;
    finalizeEpisode(season, episode);
  }

  function fameGamesEligibleEliminated(season) {
    return season.eliminatedIds.slice().filter((id) => season.contestants[id] && !season.activeIds.includes(id) && !isIneligibleUnplannedExit(season, id));
  }

  function addFameGamesRunwayToUntucked(season, episode) {
    if (!season.config.specialFameGames || episode.type !== "competitive" || episode.premiere || !episode.runway) return;
    const type = challengeTypeKey(episode.challenge?.type);
    if (type === "makeover") return;
    const eliminated = fameGamesEligibleEliminated(season);
    if (!eliminated.length) return;
    const subject = ["design", "ball", "runway"].includes(type) ? (episode.challenge?.name || "challenge") : (episode.runway?.name || "runway");
    const scores = eliminated.map((id) => {
      const value = ["design", "ball", "runway"].includes(type)
        ? scoreChallengePerformance(season.contestants[id], episode.challenge, season.config)
        : scoreRunway(season.contestants[id], season.config);
      season.stats[id].fameGamesRunwayScore = (season.stats[id].fameGamesRunwayScore || 0) + value;
      season.stats[id].fameGamesRunwayCount = (season.stats[id].fameGamesRunwayCount || 0) + 1;
      return { id, value };
    }).sort((a, b) => b.value - a.value);
    episode.fameGamesUntucked = { subject, scores };
  }

  function simulateFameGamesEpisode(season) {
    const eliminated = fameGamesEligibleEliminated(season);
    if (season.fameGamesEpisodeUsed || eliminated.length < 2) return;
    const episode = createEpisodeShell(season, { type: "fame_games", title: `Episode ${season.episodeCounter}`, label: `Episode ${season.episodeCounter}` });
    episode.activeStartIds = season.castOrder.slice();
    episode.fameGamesEpisode = true;
    const talentPool = getChallengeData().filter((challenge) => challengeTypeKey(challenge.type) === "talent_show" && !season.usedChallengeIds.includes(challenge.id));
    const fallbackTalentPool = getChallengeData().filter((challenge) => challengeTypeKey(challenge.type) === "talent_show");
    episode.challenge = clone(randomItem(talentPool.length ? talentPool : fallbackTalentPool)) || { id: "fame_games_talent_show", name: "Fame Games Talent Show", type: "talent_show", teamMode: "solo", description: "The eliminated contestants return for a talent show. The top two lip sync for a vote multiplier before the Fame Games winner is revealed at the finale.", requiredSkills: { comedy: 0.20, dance: 0.20, acting: 0.20, improv: 0.20, lipsync: 0.20 } };
    episode.challenge.name = episode.challenge.name || "Fame Games Talent Show";
    episode.challenge.description = episode.challenge.description || "The eliminated contestants return for a talent show. The top two lip sync for a vote multiplier before the Fame Games winner is revealed at the finale.";
    episode.runway = null;
    const originalActive = season.activeIds.slice();
    season.activeIds = eliminated.slice();
    runChallengeAndRunway(season, episode);
    episode.runway = null;
    episode.runwayGroups = {};
    season.activeIds = originalActive;
    const ranked = rankedIds(episode);
    episode.top2Ids = ranked.slice(0, 2);
    episode.winnerIds = [];
    episode.safeIds = eliminated.filter((id) => !episode.top2Ids.includes(id));
    const lipSync = applyRupaulLipSyncChoice(season, createLipSyncLipOnly(season, episode.top2Ids, "Fame Games Lip Sync For The Win"));
    lipSync.resultType = "fame_games_multiplier";
    episode.lipSync = lipSync;
    episode.winnerIds = [lipSync.winnerId].filter(Boolean);
    episode.top2Ids = episode.top2Ids.filter((id) => id !== lipSync.winnerId);
    episode.safeIds = eliminated.filter((id) => !episode.winnerIds.includes(id) && !episode.top2Ids.includes(id));
    const multipliers = [2, 3, 4];
    const multiplier = randomItem(multipliers);
    episode.fameGamesMultiplier = multiplier;
    episode.fameGamesMultiplierId = lipSync.winnerId;
    episode.fameGamesWheelSpun = false;
    episode.resultText = `${displayName(season.contestants[lipSync.winnerId])}, condragulations, you win the Fame Games lip sync.`;
    episode.fameGamesAdvantageText = `${displayName(season.contestants[lipSync.winnerId])}, you'll receive an advantage for the Fame Games in the form of your votes being multiplied by ${multiplier}.`;
    episode.notes.push("The finalists do not compete in the Fame Games talent show.");
    (lipSync.ids || []).forEach((id) => updateLipSyncStats(season, id, id === lipSync.winnerId));
    season.fameGames = { multiplierId: lipSync.winnerId, multiplier, winnerId: null };
    season.fameGamesEpisodeUsed = true;
    finalizeEpisode(season, episode);
  }

  function simulateSpecialLalaparuzaSmackdown(season) {
    const episode = createEpisodeShell(season, { type: "special_lalaparuza", title: `Episode ${season.episodeCounter}`, label: `Episode ${season.episodeCounter}` });
    episode.challenge = {
      id: "special_lalaparuza_smackdown",
      name: "LaLaPaRuZa Smackdown",
      type: "lalaparuza",
      teamMode: "solo",
      description: "The Top 8 must lip sync for survival. Winners of each round are declared safe, while each losing queen must lip sync again until the final duel sends one contestant home.",
      requiredSkills: { lipsync: 1 }
    };
    episode.runway = null;
    episode.guestJudge = null;
    episode.miniChallenge = null;
    episode.lalaparuzaSpecial = true;
    episode.lalaparuzaRoundWinners = {};
    const ids = shuffle(season.activeIds.slice());
    let remaining = ids.slice();
    const firstTwoRounds = [];
    for (let round = 1; round <= 2 && remaining.length > 1; round += 1) {
      const losers = [];
      makeLalaparuzaGroups(remaining).forEach((group, index) => {
        if (group.length <= 1) { losers.push(...group); return; }
        const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, group, `LaLaPaRuZa Round ${round}`));
        const winnerId = lipSync.winnerId;
        const roundLosers = group.filter((id) => id !== winnerId);
        lipSync.resultType = `lalaparuza_round_${round}`;
        lipSync.roundNumber = round;
        lipSync.roundPosition = index + 1;
        lipSync.roundResultText = `${displayName(season.contestants[winnerId])}, shantay you stay. ${formatList(roundLosers, season)} must lip sync again.`;
        firstTwoRounds.push(lipSync);
        episode.lalaparuzaRoundWinners[winnerId] = round;
        losers.push(...roundLosers);
        group.forEach((id) => updateLipSyncStats(season, id, id === winnerId));
      });
      remaining = losers;
    }
    episode.extraLipSyncs = firstTwoRounds;
    const finalIds = remaining.slice(0, 2);
    if (finalIds.length === 2) {
      const finalLipSync = applyRupaulLipSyncChoice(season, createLipSync(season, finalIds, "Final LaLaPaRuZa Lip Sync"));
      const winnerId = finalLipSync.winnerId;
      const eliminatedId = finalIds.find((id) => id !== winnerId) || finalLipSync.loserId;
      finalLipSync.resultType = "lalaparuza_final";
      finalLipSync.roundNumber = 3;
      finalLipSync.loserId = eliminatedId;
      finalLipSync.roundResultText = `${displayName(season.contestants[winnerId])}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, sashay away.`;
      episode.lipSync = finalLipSync;
      episode.lalaparuzaRoundWinners[winnerId] = 3;
      episode.eliminatedIds = [eliminatedId];
      episode.resultText = `${displayName(season.contestants[winnerId])}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, sashay away.`;
      finalIds.forEach((id) => updateLipSyncStats(season, id, id === winnerId));
    } else if (finalIds.length === 1) {
      episode.lalaparuzaRoundWinners[finalIds[0]] = 3;
      episode.resultText = `${displayName(season.contestants[finalIds[0]])} survives the LaLaPaRuZa.`;
    }
    episode.safeIds = season.activeIds.filter((id) => !(episode.eliminatedIds || []).includes(id));
    episode.highIds = [];
    episode.lowIds = [];
    episode.bottomIds = [];
    episode.winnerIds = [];
    episode.notes.push("Special Challenge: no guest judge, mini challenge, runway, judging, or placements are used for this episode.");
    season.specialLalaparuzaUsed = true;
    finalizeEpisode(season, episode);
  }

  function simulateLalaparuzaEpisode(season) {
    const safeId = season.lalaparuzaQueued.safeId;
    const episode = createEpisodeShell(season, { type: "lalaparuza", title: `Episode ${season.episodeCounter}`, label: `Episode ${season.episodeCounter}` });
    episode.challenge = null;
    episode.runway = null;
    const competitors = (season.lalaparuzaQueued.competitorIds || season.activeIds.filter((id) => id !== safeId)).filter((id) => season.activeIds.includes(id) && id !== safeId);
    const allLipSyncs = [];
    const safeRoundWinners = [safeId].filter(Boolean);
    let remainingLosers = competitors.slice();
    let round = 1;

    while (remainingLosers.length > 1) {
      const roundLosers = [];
      makeLalaparuzaGroups(remainingLosers).forEach((group) => {
        if (group.length <= 1) { roundLosers.push(...group); return; }
        const lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, group, `Lalaparuza Round ${round}`));
        const winnerId = lipSync.winnerId;
        const losers = group.filter((id) => id !== winnerId);
        lipSync.resultType = "lalaparuza_round";
        lipSync.roundResultText = `${displayName(season.contestants[winnerId])}, shantay you stay. ${formatList(losers, season)} must lip sync again.`;
        allLipSyncs.push(lipSync);
        safeRoundWinners.push(winnerId);
        roundLosers.push(...losers);
        group.forEach((id) => updateLipSyncStats(season, id, id === winnerId));
      });
      remainingLosers = roundLosers;
      round += 1;
      if (round > 8) break;
    }

    const eliminatedId = remainingLosers[0];
    if (allLipSyncs.length) {
      const last = allLipSyncs.at(-1);
      if (last && eliminatedId && last.ids.includes(eliminatedId)) {
        last.resultType = "elimination";
        last.loserId = eliminatedId;
        last.roundResultText = `${formatList(last.ids.filter((id) => id !== eliminatedId), season)}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, sashay away.`;
      }
    }
    episode.safeIds = [...new Set(safeRoundWinners.filter((id) => id && id !== eliminatedId))];
    episode.bottomIds = [];
    episode.lowIds = [];
    episode.highIds = [];
    episode.winnerIds = [];
    episode.extraLipSyncs = allLipSyncs;
    episode.eliminatedIds = eliminatedId ? [eliminatedId] : [];
    episode.resultText = eliminatedId ? `${displayName(season.contestants[eliminatedId])} loses the final lalaparuza round and sashays away.` : "The lalaparuza ends with no elimination.";
    runUntucked(season, episode);
    season.lalaparuzaQueued = null;
    finalizeEpisode(season, episode);
  }


  function pickCuntTestChallenge(season, pickedIds, predicate) {
    const all = getChallengeData();
    const usable = all.filter((challenge) => challenge.teamMode === "solo" && !season.usedChallengeIds.includes(challenge.id) && !pickedIds.includes(challenge.id));
    const preferred = usable.filter((challenge) => !predicate || predicate(challenge));
    const backup = all.filter((challenge) => challenge.teamMode === "solo" && !pickedIds.includes(challenge.id) && !season.usedChallengeIds.includes(challenge.id));
    const encore = all.filter((challenge) => challenge.teamMode === "solo" && !pickedIds.includes(challenge.id));
    const pool = preferred.length ? preferred : backup.length ? backup : encore.length ? encore : all;
    const picked = clone(randomItem(pool));
    if (!picked.id) picked.id = `cunt_test_challenge_${pickedIds.length + 1}`;
    return picked;
  }

  function scoreCuntTestRound(season, episode, challenge, ids, roundIndex) {
    const scores = ids.map((id) => {
      const challengeScore = scoreChallengePerformance(season.contestants[id], challenge, season.config);
      const balanceAdjustment = competitiveBalanceAdjustment(season, id);
      const volatility = season.config.disableChallengeRiggory ? 0 : randInt(-4, 4);
      const total = challengeScore + balanceAdjustment + volatility;
      return { id, challengeScore, runwayScore: challengeScore, balanceAdjustment, total };
    }).sort((a, b) => b.total - a.total);
    const winnerId = scores[0]?.id || ids[0];
    scores.forEach((score) => {
      season.stats[score.id]?.challengeScores?.push({ label: `${episode.label} · C.U.N.T. ${roundIndex + 1}`, value: Math.round(score.challengeScore), challenge: challenge.name });
    });
    return {
      round: roundIndex + 1,
      challenge,
      ids: ids.slice(),
      scores,
      groups: bandScores(scores, "challengeScore"),
      winnerId,
      winnerRevealed: false
    };
  }

  function simulateCuntTestEpisode(season) {
    const ids = season.activeIds.slice();
    if (ids.length !== 5) return;
    const episode = createEpisodeShell(season, {
      type: "cunt_test",
      title: `Episode ${season.episodeCounter}`,
      label: `Episode ${season.episodeCounter}`,
      noMiniChallenge: true,
      noGuestJudge: true,
      competingIds: ids.slice(),
      runwayParticipantIds: []
    });
    episode.challenge = {
      id: `the_cunt_test_${season.episodeCounter}`,
      name: "The C.U.N.T.-test",
      type: "multiple",
      teamMode: "solo",
      requiredSkills: { dance: 0.25, lipsync: 0.20, design: 0.20, acting: 0.20, runway: 0.15 }
    };
    episode.runway = null;
    episode.hideJudging = true;
    episode.noImmunityAward = true;

    const pickedIds = [];
    const challenge1 = pickCuntTestChallenge(season, pickedIds, (challenge) => challengeTypeKey(challenge.type) === "rumix" || /rumix/i.test(`${challenge.name || ""} ${challenge.description || ""}`));
    pickedIds.push(challenge1.id);
    const challenge2 = pickCuntTestChallenge(season, pickedIds, (challenge) => challengeTypeKey(challenge.type) === "design");
    pickedIds.push(challenge2.id);
    const challenge3 = pickCuntTestChallenge(season, pickedIds, (challenge) => challengeTypeKey(challenge.type) === "acting");
    pickedIds.push(challenge3.id);

    const remaining = ids.slice();
    const rounds = [challenge1, challenge2, challenge3].map((challenge, index) => {
      const round = scoreCuntTestRound(season, episode, challenge, remaining.slice(), index);
      const pos = remaining.indexOf(round.winnerId);
      if (pos >= 0) remaining.splice(pos, 1);
      return round;
    });

    const winnerIds = rounds.map((round) => round.winnerId).filter(Boolean);
    const bottomIds = remaining.slice(0, 2);
    while (bottomIds.length < 2) {
      const fallbackId = ids.find((id) => !bottomIds.includes(id) && !winnerIds.includes(id));
      if (!fallbackId) break;
      bottomIds.push(fallbackId);
    }

    const lipSync = createLipSync(season, bottomIds, "Lip Sync for the Final Spot");
    lipSync.resultType = "cunt_test_final_spot";
    const survivorId = lipSync.winnerId;
    const eliminatedId = bottomIds.find((id) => id !== survivorId) || lipSync.loserId;
    lipSync.loserId = eliminatedId;
    lipSync.eliminatedId = eliminatedId;
    lipSync.roundResultText = `${fullDisplayName(season.contestants[survivorId] || {})}, shantay you stay. You have earned the final spot in the finale. ${fullDisplayName(season.contestants[eliminatedId] || {})}, sashay away.`;

    episode.cuntTest = {
      rounds,
      winnerIds,
      bottomIds: bottomIds.slice(),
      survivorId,
      eliminatedId,
      lipSync
    };
    episode.scores = ids.map((id) => {
      const entries = rounds.flatMap((round) => (round.scores || []).filter((score) => score.id === id));
      const total = entries.length ? average(entries.map((score) => score.total)) : 0;
      const challengeScore = entries.length ? average(entries.map((score) => score.challengeScore)) : total;
      return { id, challengeScore, runwayScore: challengeScore, balanceAdjustment: 0, total };
    }).sort((a, b) => b.total - a.total);
    episode.maxiGroups = bandScores(episode.scores, "challengeScore");
    episode.winnerIds = winnerIds.slice();
    episode.bottomIds = bottomIds.slice();
    episode.savedIds = [survivorId].filter(Boolean);
    episode.eliminatedIds = [eliminatedId].filter(Boolean);
    episode.lipSync = lipSync;
    episode.resultText = `${sentenceList(winnerIds, season, false)} earned their finale spots through the maxi challenges. ${fullDisplayName(season.contestants[survivorId] || {})} survives the final lip sync and completes the Top 4.`;
    episode.notes.push("The C.U.N.T.-test replaces the Top 5 competitive episode. Three maxi winners advance, and the remaining two lip sync for the final Top 4 spot.");

    rounds.forEach((round) => {
      if (round.challenge?.id && !season.usedChallengeIds.includes(round.challenge.id)) season.usedChallengeIds.push(round.challenge.id);
      if (round.challenge?.type) season.usedChallengeTypes.push(challengeTypeKey(round.challenge.type));
    });
    updateLipSyncStats(season, survivorId, true);
    updateLipSyncStats(season, eliminatedId, false);
    finalizeEpisode(season, episode);
  }

  function renderCuntTestIntro(ep) {
    const contestantStrip = `<div class="contestant-strip small-strip cunt-test-starting-grid">${(ep.activeStartIds || []).map((id) => contestantCard(id)).join("")}</div>`;
    return episodeThemeCopy(
      "The C.U.N.T.-test",
      [
        "The Top 5 will compete in three separate maxi challenges. Each challenge winner immediately advances to the Grand Finale.",
        "The two contestants who do not win a part will face a final Lip Sync for Your Life. The winner earns the last spot in the Top 4, and the loser is eliminated."
      ],
      contestantStrip,
      "cunt-test-intro-copy"
    );
  }

  function renderCuntTestPart(ep, roundIndex) {
    const round = ep?.cuntTest?.rounds?.[roundIndex];
    if (!round) return `<article class="event-card"><p>Part #${roundIndex + 1} is not available.</p></article>`;
    const revealed = !!round.winnerRevealed;
    const winner = state.season.contestants[round.winnerId] || {};
    const isFinalPart = roundIndex === 2;
    const bottomIds = ep?.cuntTest?.bottomIds || ep?.bottomIds || [];
    const bottomAnnouncement = revealed && isFinalPart && bottomIds.length ? `
      <article class="challenge-card cunt-test-bottom-two-card placement-group token-btm2">
        <h4>Bottom Two</h4>
        <div class="contestant-strip small-strip">${bottomIds.map((id) => contestantCard(id)).join("")}</div>
        <p>${escapeHtml(`${sentenceList(bottomIds, state.season, false)}, I'm sorry my dears, but you're up for elimination.`)}</p>
      </article>
    ` : "";
    return `
      <div class="cunt-test-part-block">
        <article class="challenge-card cunt-test-round-summary">
          <h3>${escapeHtml(round.challenge?.name || `Part #${round.round}`)}</h3>
          <p>${escapeHtml(round.challenge?.description || `${challengeTypeLabel(round.challenge?.type || "challenge")} challenge.`)}</p>
        </article>
        <hr class="cunt-test-part-divider" aria-hidden="true">
        <div class="cunt-test-performance-grid">
          ${performanceBandBlock(round.groups?.slayed || [], "slayed", "challenge")}
          ${performanceBandBlock(round.groups?.great || [], "great", "challenge")}
          ${performanceBandBlock(round.groups?.good || [], "good", "challenge")}
          ${performanceBandBlock(round.groups?.bad || [], "bad", "challenge")}
          ${performanceBandBlock(round.groups?.flopped || [], "flopped", "challenge")}
        </div>
        ${revealed ? `
          <article class="challenge-card cunt-test-winner-card placement-group token-win">
            <h4>Winner of Part #${round.round}</h4>
            <div class="contestant-strip small-strip award-strip">${contestantCard(round.winnerId, "Finalist")}</div>
            <p>${escapeHtml(`${fullDisplayName(winner)}, condragulations, you're the winner of this challenge and you're advancing to the Grand Finale.`)}</p>
          </article>
          ${bottomAnnouncement}
        ` : `
          <div class="center-actions"><button class="primary-btn reveal-cunt-test-winner-btn" type="button" data-round="${roundIndex}">Reveal Winner</button></div>
        `}
      </div>
    `;
  }

  function renderCuntTestPartPanels(ep) {
    const stacks = [els.cuntTestPart1Stack, els.cuntTestPart2Stack, els.cuntTestPart3Stack];
    stacks.forEach((stack, index) => {
      if (!stack) return;
      stack.innerHTML = ep?.type === "cunt_test" ? renderCuntTestPart(ep, index) : "";
    });
    $all(".reveal-cunt-test-winner-btn").forEach((btn) => btn.addEventListener("click", () => {
      const roundIndex = Number(btn.dataset.round || 0);
      const round = ep?.cuntTest?.rounds?.[roundIndex];
      if (!round) return;
      round.winnerRevealed = true;
      saveState();
      renderCuntTestPartPanels(ep);
    }));
  }

  function renderCuntTestPlacements(ep) {
    const data = ep.cuntTest || {};
    const rounds = data.rounds || [];
    return `
      <div class="cunt-test-placement-stack">
        ${rounds.map((round) => groupBlock(`Maxi Challenge #${round.round} Winner`, [round.winnerId], state.season, { className: "placement-group token-win cunt-test-placement-card", subtitle: `${fullDisplayName(state.season.contestants[round.winnerId] || {})} wins ${round.challenge?.name || "the maxi challenge"} and advances to the finale.` })).join("")}
        ${groupBlock("Lip Sync for the Final Spot", data.bottomIds || [], state.season, { className: "placement-group token-btm2 cunt-test-placement-card", subtitle: `${sentenceList(data.bottomIds || [], state.season, false)}, you did not win a maxi challenge. You must lip sync for the final spot in the finale.` })}
      </div>
    `;
  }

  function simulateLipSyncForTheFinalePenultimate(season) {
    const episode = createEpisodeShell(season, { type: "lsftf", title: `Episode ${season.episodeCounter}`, label: `Episode ${season.episodeCounter}` });
    episode.challenge = { id: "lsftf", name: "Lip Sync for The Finale", type: "lalaparuza", teamMode: "solo", requiredSkills: { lipsync: 1 } };
    episode.runway = null;
    const ids = season.activeIds.slice();
    const bracket = shuffle(ids);
    const semi1 = applyRupaulLipSyncChoice(season, createLipSync(season, bracket.slice(0, 2), "Lip Sync for The Finale Round 1"));
    const semi2 = applyRupaulLipSyncChoice(season, createLipSync(season, bracket.slice(2, 4), "Lip Sync for The Finale Round 1"));
    semi1.resultType = "lsftf_round";
    semi2.resultType = "lsftf_round";
    semi1.roundNumber = 1;
    semi2.roundNumber = 1;
    semi1.roundPosition = 1;
    semi2.roundPosition = 2;
    [semi1, semi2].forEach((ls) => {
      if (ls.winnerId) ls.roundResultText = `${displayName(season.contestants[ls.winnerId])}, shantay you stay.`;
    });
    const losers = [semi1, semi2].flatMap((ls) => (ls.ids || []).filter((id) => id !== ls.winnerId));
    const finalLipSync = applyRupaulLipSyncChoice(season, createLipSync(season, losers, "Lip Sync for The Finale Elimination Lip Sync"));
    finalLipSync.resultType = "lsftf_final";
    finalLipSync.roundNumber = 2;
    finalLipSync.roundPosition = 1;
    finalLipSync.isFinalRound = true;
    const eliminatedId = (finalLipSync.ids || []).find((id) => id !== finalLipSync.winnerId) || losers[0];
    finalLipSync.loserId = eliminatedId;
    finalLipSync.roundResultText = `${displayName(season.contestants[finalLipSync.winnerId])}, shantay you stay. ${displayName(season.contestants[eliminatedId])}, unfortunately, you've just missed out on the final three. Now.. sashay away.`;
    episode.extraLipSyncs = [semi1, semi2, finalLipSync];
    episode.winnerIds = [];
    episode.safeIds = ids.filter((id) => id !== eliminatedId);
    episode.bottomIds = [eliminatedId];
    episode.lowIds = [];
    episode.highIds = [];
    episode.eliminatedIds = [eliminatedId];
    episode.lsftfSurvivorIds = episode.safeIds.slice();
    episode.resultText = `${formatList(episode.safeIds, season)} survive the Lip Sync for The Finale and become the Top 3. ${displayName(season.contestants[eliminatedId])} is eliminated before the finale.`;
    episode.extraLipSyncs.forEach((ls) => (ls.ids || []).forEach((id) => updateLipSyncStats(season, id, id === ls.winnerId)));
    runUntucked(season, episode);
    finalizeEpisode(season, episode);
  }

  function calculateMissCongeniality(season) {
    const votes = Object.fromEntries(season.castOrder.map((id) => [id, 0]));
    const details = [];
    season.castOrder.forEach((voterId) => {
      const choices = season.castOrder.filter((id) => id !== voterId);
      const ranked = choices.map((id) => ({
        id,
        score: (season.relationships[pairKey(voterId, id)] || 0) + randInt(-2, 2)
      })).sort((a, b) => b.score - a.score);
      if (ranked[0]) {
        votes[ranked[0].id] += 1;
        details.push({ voterId, votedForId: ranked[0].id });
      }
    });
    const rankedVotes = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    const winners = (rankedVotes.length > 1 && rankedVotes[0][1] === rankedVotes[1][1] && Math.random() < 0.28) ? [rankedVotes[0][0], rankedVotes[1][0]] : (rankedVotes[0] ? [rankedVotes[0][0]] : []);
    return { winners, votes, details };
  }

  function calculateGoldenBoot(season) {
    const all = season.castOrder.flatMap((id) => (season.stats[id]?.runwayScores || []).map((score) => ({ id, value: Number(score.value), runway: score.runway }))).filter((x) => Number.isFinite(x.value));
    if (!all.length) return null;
    return all.sort((a, b) => a.value - b.value)[0];
  }

  function createFinalePerformances(season) {
    return season.activeIds.map((id) => ({ id, style: randomItem(FINALE_PERFORMANCE_STYLES) }));
  }


  function resolveFameGamesWinner(season, finale) {
    const eliminated = fameGamesEligibleEliminated(season);
    if (!eliminated.length) return;
    const ranked = eliminated.map((id) => {
      const stats = season.stats[id] || {};
      const avg = Number(stats.fameGamesRunwayCount || 0) ? Number(stats.fameGamesRunwayScore || 0) / Number(stats.fameGamesRunwayCount || 1) : 0;
      const multiplier = season.fameGames?.multiplierId === id ? Number(season.fameGames?.multiplier || 1) : 1;
      return { id, runwayScore: avg, finalScore: avg * multiplier };
    }).sort((a, b) => b.finalScore - a.finalScore || b.runwayScore - a.runwayScore);
    const winnerId = ranked[0]?.id || season.fameGames?.multiplierId || eliminated[0];
    season.fameGames = { ...(season.fameGames || {}), winnerId };
    finale.fameGamesWinnerId = winnerId;
  }

  function simulateFinale(season) {
    const finale = createEpisodeShell(season, { type: "finale", title: "Grand Finale", label: "Finale" });
    finale.challenge = null;
    finale.runway = null;
    finale.safeIds = [];
    finale.highIds = [];
    finale.lowIds = [];
    finale.bottomIds = [];
    finale.finalePerformances = ["lsftc", "lsftf"].includes(season.config.finaleType) ? [] : createFinalePerformances(season);
    const missCon = calculateMissCongeniality(season);
    finale.missCongenialityIds = missCon.winners || [];
    finale.missCongenialityVotes = missCon.votes || {};
    finale.missCongenialityVoteDetails = missCon.details || [];
    finale.goldenBoot = calculateGoldenBoot(season);
    if (season.config.specialFameGames) resolveFameGamesWinner(season, finale);
    finale.untuckedEvents = [];

    if (season.config.finaleType === "lsftc" && season.activeIds.length >= 2) simulateLSFTC(season, finale);
    else if (season.config.finaleType === "jury_finale") simulateJuryFinale(season, finale);
    else if (season.config.finaleType === "top2_finale" || season.config.finaleType === "cunt_test") simulateTop2Finale(season, finale);
    else simulateRegularFinale(season, finale);

    season.seasonComplete = true;
    season.winnerId = finale.winnerIds[0];
    season.winnerIds = finale.winnerIds.slice();
    season.runnerUpIds = (finale.top2Ids?.length ? finale.top2Ids : (finale.activeStartIds || season.activeIds)).filter((id) => !finale.winnerIds.includes(id) && !(finale.eliminatedIds || []).includes(id));
    season.castOrder.forEach((id) => {
      const isFinalist = (finale.activeStartIds || season.activeIds).includes(id);
      const isWinner = finale.winnerIds.includes(id);
      const isRunnerUp = season.runnerUpIds.includes(id);
      const isFinalElim = (finale.eliminatedIds || []).includes(id);
      const isMx = (finale.missCongenialityIds || []).includes(id);
      const isGb = finale.goldenBoot?.id === id;
      const isFameGamesWinner = finale.fameGamesWinnerId === id;
      let token = isWinner ? "WINNER" : isRunnerUp ? "RU" : isFinalElim ? "ELIM" : isFameGamesWinner ? "FAME_GAMES" : "GUEST";
      let display = token;
      const extraClasses = [];
      if (isFinalElim) extraClasses.push("finale-elim");
      if (isWinner && isMx) { display = "WINNER+<br/>MX. CON"; extraClasses.push("winner-mx-con"); }
      else if (isWinner && isGb) { display = "WINNER+<br/>GB"; extraClasses.push("winner-gb"); }
      else if (isRunnerUp && isMx) { display = "RU+<br/>MX. CON"; extraClasses.push("ru-mx-con"); }
      else if (isRunnerUp && isGb) { display = "RU+<br/>GB"; extraClasses.push("ru-gb"); }
      else if (isFinalElim && isMx) { display = "ELIM+<br/>MX. CON"; extraClasses.push("elim-mx-con"); }
      else if (isFinalElim && isGb) { display = "ELIM+<br/>GB"; extraClasses.push("elim-gb"); }
      else if (isFameGamesWinner && !isFinalist) { token = "FAME_GAMES"; display = "FAME<br/>GAMES"; }
      else if (isMx && !isFinalist) { token = "MX. CON"; display = "MX. CON"; }
      else if (isGb && !isFinalist) { token = "GB"; display = "GB"; }
      season.stats[id].track.push({ label: "Finale", token, display, extraClasses });
      if (isFinalist || isGb || isMx) {
        season.stats[id].popularity = clamp(Number(season.stats[id].popularity || 50) + (isWinner ? 12 : 4), 0, 100);
      }
    });
    finale.resultText ||= `The Next Drag Superstar is... ${sentenceList(finale.winnerIds, season, false)}!`;
    season.trackColumnLabels = season.trackColumnLabels || [];
    if (!season.trackColumnLabels.some((col) => col.label === "Finale")) season.trackColumnLabels.push({ label: "Finale", title: "Grand Finale", challengeType: "Finale" });
    season.episodes.push(finale);
  }

  function finaleScore(season, id, multiplier = 1) {
    const queen = season.contestants[id];
    const performance = ((queen.skills.lipsync || 0) * 0.35 + (queen.skills.runway || 0) * 0.30 + (queen.skills.comedy || 0) * 0.18 + (queen.skills.acting || 0) * 0.17) * 7;
    return trackRecordPower(season, id) * 0.82 + performance * 0.10 + season.stats[id].popularity * 0.06 + randInt(-2, 2) * multiplier;
  }

  function lipSyncPerformanceScore(lipSync, id) {
    return Number(lipSync?.performances?.find((x) => x.id === id)?.score || 0);
  }

  function crownDecisionScore(season, id, lipSync) {
    return trackRecordPower(season, id) * 0.90 + season.stats[id].popularity * 0.07 + lipSyncPerformanceScore(lipSync, id) * 0.03 + randInt(-1, 1);
  }

  function chooseCrownWinner(season, ids, lipSync) {
    return ids.map((id) => ({ id, score: crownDecisionScore(season, id, lipSync) })).sort((a, b) => b.score - a.score)[0]?.id || ids[0];
  }

  function simulateRegularFinale(season, finale) {
    const ranked = season.activeIds.map((id) => ({ id, score: finaleScore(season, id) })).sort((a, b) => b.score - a.score);
    const doubleCrowning = ranked.length >= 2 && Math.abs(ranked[0].score - ranked[1].score) <= 2.5 && Math.random() < 0.03;
    finale.lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, season.activeIds.slice(), "Final Lip Sync for the Crown"));
    finale.lipSync.resultType = "crown_final";
    finale.lipSync.roundNumber = 1;
    finale.lipSync.roundPosition = 1;
    finale.lipSync.isFinalRound = true;
    finale.winnerIds = doubleCrowning ? [ranked[0].id, ranked[1].id] : [ranked[0].id];
    finale.resultText = doubleCrowning
      ? `The Next Drag Superstar is... ${formatList(finale.winnerIds, season)}!`
      : `The Next Drag Superstar is... ${displayName(season.contestants[ranked[0].id])}!`;
  }

  function simulateTop2Finale(season, finale) {
    const ranked = season.activeIds.map((id) => ({ id, score: finaleScore(season, id) })).sort((a, b) => b.score - a.score);
    const top2 = ranked.slice(0, 2).map((x) => x.id);
    finale.top2Ids = top2;
    finale.eliminatedIds = ranked.slice(2).map((x) => x.id);
    finale.lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, top2, "Final Lip Sync for the Crown"));
    finale.lipSync.resultType = "crown_final";
    finale.lipSync.roundNumber = 1;
    finale.lipSync.roundPosition = 1;
    finale.lipSync.isFinalRound = true;
    const crownWinner = chooseCrownWinner(season, top2, finale.lipSync);
    finale.lipSync.performanceWinnerId = finale.lipSync.winnerId;
    finale.lipSync.winnerId = crownWinner;
    finale.winnerIds = [crownWinner];
    finale.resultText = `${formatList(top2, season)} make the final lip sync. After weighing the full season, ${displayName(season.contestants[crownWinner])} wins the crown.`;
  }

  function simulateLSFTC(season, finale) {
    const finalists = season.activeIds.slice();
    const crown = createLipSyncSmackdown(season, finalists, "Lip Sync for the Crown");
    const lipSyncs = crown.lipSyncs || [];
    const finalLipSync = crown.finalLipSync || lipSyncs.at(-1) || null;
    const crownWinner = crown.winnerId || finalLipSync?.winnerId || finalists[0] || null;
    if (finalLipSync && crownWinner) {
      finalLipSync.performanceWinnerId = finalLipSync.performanceWinnerId || finalLipSync.winnerId;
      finalLipSync.winnerId = crownWinner;
      finalLipSync.resultType = "all_winners_final_round";
      finalLipSync.isFinalRound = true;
    }
    finale.lsftcFinale = true;
    finale.extraLipSyncs = lipSyncs.slice();
    finale.lipSync = finalLipSync;
    finale.allWinnersCrownSmackdown = { lipSyncs: finale.extraLipSyncs, winnerId: crownWinner, finalLipSync };
    finale.top2Ids = finalLipSync?.ids || finalists.slice(0, Math.min(2, finalists.length));
    finale.eliminatedIds = finalists.filter((id) => id !== crownWinner && !(finale.top2Ids || []).includes(id));
    const finalLoserId = (finale.top2Ids || []).find((id) => id !== crownWinner);
    if (finalLoserId) finale.runnerUpIds = [finalLoserId];
    finale.winnerIds = [crownWinner].filter(Boolean);
    const openingWinners = lipSyncs.filter((ls) => !ls.isFinalRound).map((ls) => ls.winnerId).filter(Boolean);
    finale.resultText = openingWinners.length
      ? `${sentenceList(openingWinners, season, false)} advance to the final lip sync. After the final lip sync and the full-season record are considered, ${displayName(season.contestants[crownWinner])} wins the crown.`
      : `${displayName(season.contestants[crownWinner])} wins the crown.`;
  }

  function simulateJuryFinale(season, finale) {
    const finalists = season.activeIds.slice();
    const jurors = season.eliminatedIds.slice();
    const votes = Object.fromEntries(finalists.map((id) => [id, 0]));
    const ballots = [];
    jurors.forEach((jurorId) => {
      const ranked = finalists.map((id) => {
        const relation = season.relationships[pairKey(jurorId, id)] || 0;
        const bestInCompetition = trackRecordPower(season, id);
        const social = (season.stats[id].popularity || 0) * 0.08;
        return {
          id,
          score: relation * 4.35 + bestInCompetition * 0.34 + social + randInt(-3, 3),
          relation,
          bestInCompetition
        };
      }).sort((a, b) => b.score - a.score || b.bestInCompetition - a.bestInCompetition);
      const first = ranked[0]?.id || null;
      const second = ranked.find((entry) => entry.id !== first)?.id || null;
      if (first) votes[first] += 2;
      if (second) votes[second] += 1;
      ballots.push({ jurorId, firstId: first, secondId: second });
    });
    const top2 = Object.entries(votes).sort((a, b) => b[1] - a[1] || finaleScore(season, b[0]) - finaleScore(season, a[0])).slice(0, 2).map(([id]) => id);
    const finalElimIds = finalists.filter((id) => !top2.includes(id));
    finale.juryVotes = votes;
    finale.juryBallots = ballots;
    season.juryVotes = votes;
    finale.top2Ids = top2;
    finale.eliminatedIds = finalElimIds;
    finale.lipSync = applyRupaulLipSyncChoice(season, createLipSync(season, top2, "Final Lip Sync for the Crown"));
    const crownWinner = chooseCrownWinner(season, top2, finale.lipSync);
    finale.lipSync.performanceWinnerId = finale.lipSync.winnerId;
    finale.lipSync.winnerId = crownWinner;
    finale.winnerIds = [crownWinner];
    finale.resultText = `${sentenceList(top2, season, false)}, condragulations, you are the top two of the season.`;
  }

  function renderEpisodeSelect() {
    if (!els.episodeSelect || !state.season) return;
    els.episodeSelect.innerHTML = state.season.episodes.map((ep, index) => `<option value="${index}">${escapeHtml(ep.label || `Episode ${ep.number || index + 1}`)}</option>`).join("");
    els.episodeSelect.value = String(state.currentEpisodeIndex);
  }

  function currentEpisode() {
    return state.season?.episodes?.[state.currentEpisodeIndex] || null;
  }

  function updateEpisodeStepLabels(ep) {
    const labels = ep?.type === "porkchop_premiere" ? {
      maxi: "Porkchop Lip Syncs"
    } : (ep?.type === "finale" && ((isAllWinnersFormat(state.season) && ep?.allWinnersFinale) || ep?.lsftcFinale)) ? {
      mini: "Mx. Congeniality",
      teams: "Golden Boot",
      famegames: "Fame Games",
      qosdadhh: "QoSDADHH",
      lsftc: "Lip Sync for The Crown",
      winner: "Winner"
    } : ep?.type === "lsftf" ? {
      lipsync: "Lip Sync for The Finale",
      results: "Results"
    } : ep?.type === "cunt_test" ? {
      maxi: "Maxi Challenge",
      cuntpart1: "Part #1",
      cuntpart2: "Part #2",
      cuntpart3: "Part #3",
      lipsync: "Lip Sync",
      results: "Results",
      trackrecord: "Track Record"
    } : ep?.type === "finale" ? {
      mini: "Mx. Congeniality",
      teams: "Golden Boot",
      famegames: "Fame Games",
      maxi: "Finale Performances",
      placements: state.season?.config?.finaleType === "jury_finale" ? "Jury Voting" : "Elimination",
      lipsync: "Final Lip Sync",
      results: "Winner",
      trackrecord: "Track Record"
    } : {
      comeback: ep?.comeback?.title || "Comeback",
      mini: ep?.allWinnersStarGiveawaysAtStart?.length ? "Star Giveaway" : "Mini Challenge",
      teams: "Teams",
      maxi: "Maxi Challenge",
      rumocracy: "RuMocracy",
      goldenbeaver: "Golden Beaver",
      luckycow: "Lucky Cow",
      ratequeen: "Rate-A-Queen",
      placements: "Placements",
      lipsync: "Lip Sync",
      qosdadhh: "QoSDADHH",
      lsftc: "Lip Sync for The Crown",
      winner: "Winner",
      results: ep?.allWinnersFinalistIds?.length ? "Finalists" : "Results",
      badonkadunktank: "Badonka Dunk Tank",
      s17lsfyl: "Lip Sync for Your Life",
      s17lsfylresults: "Lip Sync for Your Life Results",
      pointceremony: "Point Ceremony",
      trackrecord: "Track Record",
      wildcard: "Wildcard Lottery"
    };
    Object.entries(labels).forEach(([step, label]) => {
      $all(`.section-toggle[data-step="${step}"]`).forEach((btn) => { btn.textContent = label; });
      const panel = $(`.episode-panel[data-panel="${step}"] .section-title`);
      if (panel && step !== "lipsync") panel.textContent = label;
    });
  }

  function unplannedExitCardHtml(ep, compact = false) {
    const event = ep?.unplannedExit;
    if (!event?.id) return "";
    const label = event.token === "DISQ" ? "Disqualified"
      : event.token === "DEPT" ? "Medical Departure"
        : event.token === "WIN_QUIT" ? "Winner Withdraws"
          : "Withdrawal";
    return `
      <article class="challenge-card unplanned-exit-card token-elim ${compact ? "is-compact" : ""}">
        <p class="announcement-line">${escapeHtml(label)}</p>
        <div class="contestant-strip small-strip">${contestantCard(event.id, label, { className: "is-eliminated" })}</div>
        <p>${escapeHtml(event.text || "A contestant has left the competition.")}</p>
      </article>
    `;
  }

  function renderUnplannedExitPrelude(ep) {
    if (!els.miniChallengeStack || ep?.unplannedExit?.stage !== "pre_challenge") return;
    els.miniChallengeStack.insertAdjacentHTML("afterbegin", unplannedExitCardHtml(ep));
  }

  function renderUnplannedExitResult(ep) {
    if (!els.revealBoard || !ep?.resultsRevealed || !ep?.unplannedExit || ep.unplannedExit.stage === "pre_challenge") return;
    els.revealBoard.insertAdjacentHTML("afterbegin", unplannedExitCardHtml(ep, true));
  }

  function renderEpisode() {
    if (!state.season) return;
    const ep = currentEpisode();
    if (!ep) return;
    if (els.episodeTitle) els.episodeTitle.textContent = ep.label || ep.title;
    if (els.episodeSubline) els.episodeSubline.textContent = state.config.seasonName;
    updateEpisodeStepLabels(ep);
    if (els.episodeNotice) {
      els.episodeNotice.textContent = "";
      els.episodeNotice.classList.add("is-empty");
    }
    renderWildcardPanel(ep);
    renderStatusPanel(ep);
    renderComebackPanel(ep);
    renderGuestPanel(ep);
    renderMiniPanel(ep);
    renderUnplannedExitPrelude(ep);
    renderTeamsPanel(ep);
    renderFameGamesFinalePanel(ep);
    renderMaxiPanel(ep);
    renderCuntTestPartPanels(ep);
    renderRunwayPanel(ep);
    renderJudgingPanel(ep);
    renderRateQueenPanel(ep);
    renderGoldenBeaverPanel(ep);
    renderPlacementsPanel(ep);
    renderLuckyCowPanel(ep);
    renderRumocracyPanel(ep);
    renderLipSyncPanel(ep);
    renderS17LsfylPanel(ep);
    renderAllWinnersFinalePanels(ep);
    renderResultsPanel(ep);
    renderBadonkaDunkTankPanel(ep);
    renderS17LsfylResultsPanel(ep);
    renderUntuckedPanel(ep);
    renderPointCeremonyPanel(ep);
    renderEpisodeTrackRecordPanel(ep);
    updateVisibleEpisodeSections(ep);
    setEpisodeStep(state.currentStep || "status", { scroll: false });
    if (els.episodeSelect) els.episodeSelect.value = String(state.currentEpisodeIndex);
  }


  function renderWildcardPanel(ep) {
    if (!els.wildcardStack) return;
    const wildcard = ep?.tournamentWildcard || null;
    if (!wildcard) { els.wildcardStack.innerHTML = ""; return; }
    const revealed = !!wildcard.revealed;
    els.wildcardStack.innerHTML = `
      <article class="challenge-card wildcard-lottery-intro">
        <p>All is not lost! The judges have chosen three contestants that they believe deserve another shot at the crown.</p>
      </article>
      <div class="contestant-strip small-strip wildcard-candidate-strip">
        ${(wildcard.candidates || []).map((id) => contestantCard(id)).join("")}
      </div>
      <article class="challenge-card wildcard-reveal-card">
        <p>And the winner of the Wildcard Lottery is...</p>
        <div class="center-actions">${revealed ? "" : `<button class="primary-btn reveal-wildcard-btn" type="button">Reveal Wildcard</button>`}</div>
        ${revealed ? `<div class="contestant-strip small-strip award-strip wildcard-returnee-strip">${contestantCard(wildcard.returnedId, "Returns")}</div>` : ""}
      </article>
    `;
    $all(".reveal-wildcard-btn").forEach((btn) => btn.addEventListener("click", () => {
      wildcard.revealed = true;
      saveState();
      renderWildcardPanel(ep);
    }));
  }

  function renderStatusPanel(ep) {
    const readingPreStatus = Array.isArray(ep?.readingComeback?.preStatus) ? ep.readingComeback.preStatus.slice() : null;
    const remainingAtStart = readingPreStatus || (ep.type === "finale" ? (ep.activeStartIds || state.season.activeIds) : (ep.activeStartIds || []));
    const remainingSet = new Set(remainingAtStart);
    const eliminatedAtStart = (ep.eliminatedStartIds || []).filter((id) => !remainingSet.has(id));
    if (els.remainingStrip) els.remainingStrip.innerHTML = remainingAtStart.map((id) => contestantCard(id)).join("") || `<span class="empty-state">No contestants remaining.</span>`;
    if (els.eliminatedStrip) {
      els.eliminatedStrip.innerHTML = eliminatedAtStart.map((id) => contestantCard(id, "", { className: "is-eliminated status-eliminated-card" })).join("");
      els.eliminatedStrip.hidden = !eliminatedAtStart.length;
    }
    if (els.eliminatedTitle) {
      els.eliminatedTitle.textContent = eliminatedAtStart.length ? "Eliminated Contestants" : "";
      els.eliminatedTitle.hidden = !eliminatedAtStart.length;
    }
  }

  function comebackSmallGrid(ids, label = "Comeback") {
    return `<div class="contestant-strip small-strip comeback-candidates comeback-small-grid">${(ids || []).map((id) => contestantCard(id, label, { className: "is-eliminated" })).join("")}</div>`;
  }

  function comebackReturneeReveal(ids, label = "Returned") {
    return `<div class="contestant-strip small-strip award-strip comeback-returnee-reveal">${(ids || []).map((id) => contestantCard(id, label, { className: "is-comeback-returnee comeback-big-returnee" })).join("")}</div>`;
  }

  function randomReturneeReveal(ids) {
    return `<div class="random-return-reveal">${(ids || []).map((id) => {
      const item = state.season?.contestants?.[id] || state.roster.find((q) => q.id === id) || {};
      return `<div class="random-return-person">
        <img class="random-return-avatar" src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(item))}">
        <div class="random-return-name">${escapeHtml(fullDisplayName(item))}</div>
      </div>`;
    }).join("")}</div>`;
  }

  function renderComebackPanel(ep) {
    if (!els.comebackStack) return;
    const comeback = ep?.comeback;
    if (!comeback) { els.comebackStack.innerHTML = ""; return; }
    const format = comeback.format || "none";
    const candidateIds = comeback.candidates || [];
    const eligibleIds = comeback.eligible || candidateIds;
    const returnedIds = ep.returnedIds || (comeback.returnedId ? [comeback.returnedId] : []);
    const outIds = candidateIds.filter((id) => !returnedIds.includes(id));
    const quote = comeback.quote || (format === "revenge_of_the_queens" || STANDALONE_COMEBACK_FORMATS.has(format) ? "I have someone I want to re-introduce!" : "I have someone I want to re-introduce to the competition...");

    if (format === "random_return" || comeback.visualMode === "simple_return") {
      els.comebackStack.innerHTML = `
        <p class="muted comeback-simple-quote">${escapeHtml(quote)}</p>
        ${randomReturneeReveal(returnedIds)}
      `;
      return;
    }

    let html = `<article class="challenge-card comeback-intro-card comeback-quote-card"><p>${escapeHtml(quote)}</p></article>`;

    if (format === "choose_return") {
      if (!comeback.returnedId || ep.comebackPending) {
        els.comebackStack.innerHTML = `
          <p class="muted comeback-simple-quote">${escapeHtml(quote)}</p>
          <article class="challenge-card comeback-choice-card first-sim-comeback-choice-card">
            <label class="field comeback-choice-field">
              <span>Choose a Contestant to Return</span>
              <select class="comeback-choice-select">
                <option value="">Select a queen…</option>
                ${eligibleIds.map((id) => `<option value="${escapeHtml(id)}">${escapeHtml(fullDisplayName(state.season.contestants[id]))}</option>`).join("")}
              </select>
            </label>
            <div class="center-actions"><button class="primary-btn confirm-comeback-choice-btn" type="button">Confirm</button></div>
          </article>
        `;
        $all(".confirm-comeback-choice-btn").forEach((btn) => btn.addEventListener("click", async () => {
          const select = els.comebackStack.querySelector(".comeback-choice-select");
          const chosenId = select?.value || "";
          if (!chosenId) {
            alert("Please select a queen to return.");
            return;
          }
          btn.disabled = true;
          await continueSeasonAfterChooseReturnFromEpisode(ep, chosenId);
        }));
        return;
      }

      els.comebackStack.innerHTML = `
        <p class="muted comeback-simple-quote">${escapeHtml(quote)}</p>
        ${randomReturneeReveal(returnedIds)}
      `;
      return;
    }

    if (format === "other_queens_choose") {
      const revealed = !!comeback.votesRevealed;
      html += comebackSmallGrid(eligibleIds, "Eligible");
      html += `<article class="challenge-card comeback-intro-card"><p>${escapeHtml(comeback.text || "Remaining contestants, the power is in your hands. One of the eliminated queens will return based on your votes.")}</p></article>`;
      html += revealed ? `<div class="mx-vote-grid comeback-vote-grid">${(comeback.votes || []).map((vote) => `<article class="mx-vote-card comeback-vote-card">${contestantCard(vote.voterId)}<span class="vote-arrow">voted for</span>${contestantCard(vote.votedForId)}</article>`).join("")}</div><article class="challenge-card comeback-return-card token-rtrn other-queens-return-card"><p>${escapeHtml(`${sentenceList(returnedIds, state.season, false)} ${returnedIds.length === 1 ? "is" : "are"} re-entering the competition.`)}</p>${comebackReturneeReveal(returnedIds, "Returned")}</article>` : `<div class="center-actions"><button class="primary-btn show-comeback-votes-btn" type="button">Show Votes</button></div>`;
      els.comebackStack.innerHTML = html;
      $all(".show-comeback-votes-btn").forEach((btn) => btn.addEventListener("click", () => {
        comeback.votesRevealed = true;
        saveState();
        renderComebackPanel(ep);
      }));
      return;
    }

    if (format === "conjoined_twins") {
      els.comebackStack.innerHTML = `
        <p class="muted comeback-simple-quote">${escapeHtml(quote)}</p>
        ${comebackSmallGrid(eligibleIds, "")}
        <div class="desc first-sim-pair-comeback-desc">The eliminated contestants are back! And this week, you'll be working in pairs. The winning pair's eliminated contestant will re-enter the competition.</div>
      `;
      return;
    }

    if (format === "reinas_de_la_comedia") {
      els.comebackStack.innerHTML = `
        <p class="muted comeback-simple-quote">${escapeHtml(quote)}</p>
        ${comebackSmallGrid(eligibleIds, "")}
        <div class="desc first-sim-pair-comeback-desc">The eliminated contestants are back! And this week, you'll be working in pairs. The winning pair's eliminated contestant will re-enter the competition.</div>
      `;
      return;
    }

    if (format === "attention_girl_groups") {
      els.comebackStack.innerHTML = `
        <p class="muted comeback-simple-quote">${escapeHtml(quote)}</p>
        ${comebackSmallGrid(eligibleIds, "")}
        <div class="desc first-sim-attention-comeback-desc">The eliminated contestants are back! And this week, you'll be working against each other. The eliminated contestants are competing for a chance to return to the competition! But more on that later...</div>
      `;
      return;
    }

    if (format === "kitty_girl_groups") {
      els.comebackStack.innerHTML = `
        <p class="muted comeback-simple-quote">${escapeHtml(quote)}</p>
        ${comebackSmallGrid(eligibleIds, "")}
        <div class="desc first-sim-kitty-comeback-desc">The eliminated contestants are back! This week you'll be competing in Rival Girl Groups. The winning group will have all the power!</div>
      `;
      return;
    }

    if (format === "revenge_of_the_queens") {
      const soloIds = comeback.soloIds || (comeback.pairs || []).filter((pair) => (pair.ids || []).length === 1).flatMap((pair) => pair.ids || []);
      html += comebackSmallGrid(eligibleIds, "");
      html += `<article class="challenge-card comeback-intro-card first-sim-revenge-comeback-card"><p>Welcome back, the eliminated contestants! However, they are not fully back just yet. This week, the eliminated contestants will work with the remaining contestants and the winner will get to rejoin the competition!</p>${soloIds.length ? `<p>${escapeHtml(sentenceList(soloIds, state.season, false))} ${soloIds.length === 1 ? "will be" : "will be"} performing solo.</p>` : ""}</article>`;
      els.comebackStack.innerHTML = html;
      return;
    }

    if (format === "lalaparuza_comeback") {
      html += comebackSmallGrid(eligibleIds, "");
      const immuneId = comeback.immuneId || ep.lalaparuzaImmuneId || null;
      html += `<article class="challenge-card lalaparuza-rules-card first-sim-lalaparuza-comeback-card"><p>The eliminated contestants are back! Tonight, they'll lip sync for their lives against the remaining contestants. The winner returns to the competition, kicking the remaining contestant out of the race.</p>${immuneId ? `<p>${escapeHtml(`${fullDisplayName(state.season.contestants[immuneId])}, since you've won the maxi-challenge last week, you earn immunity from lip syncing tonight.`)}</p>` : ""}</article>`;
      els.comebackStack.innerHTML = html;
      return;
    }

    if (format === "game_within_a_game") {
      html += comebackSmallGrid(eligibleIds, "");
      html += `<article class="challenge-card lalaparuza-rules-card first-sim-gwag-comeback-card"><h3>Game Within a Game</h3><p>The first eliminated queen will face the second eliminated queen. The winner will face the third eliminated queen, then the next, until one queen wins the gauntlet and earns their spot back in the competition.</p></article>`;
      els.comebackStack.innerHTML = html;
      return;
    }

    const candidates = candidateIds.length ? comebackSmallGrid(candidateIds, "Comeback") : "";
    const returnee = returnedIds.length ? `<article class="challenge-card comeback-return-card token-rtrn"><p>${escapeHtml(`${sentenceList(returnedIds, state.season, false)} ${returnedIds.length === 1 ? "is" : "are"} back in the competition!`)}</p>${comebackReturneeReveal(returnedIds, "Returned")}</article>` : `<article class="challenge-card comeback-return-card"><p>No eliminated contestant returned this episode.</p></article>`;
    const outBlock = outIds.length && (ep.type || "").startsWith("comeback_") ? `<article class="challenge-card comeback-out-card"><h4>Still Out</h4><div class="contestant-strip small-strip">${outIds.map((id) => contestantCard(id, "OUT", { className: "is-eliminated" })).join("")}</div></article>` : "";
    els.comebackStack.innerHTML = [html, candidates, returnee, outBlock].filter(Boolean).join("");
  }

  function renderGuestPanel(ep) {
    if (!els.guestJudgeStack) return;
    if (!ep.guestJudge) { els.guestJudgeStack.innerHTML = ""; return; }
    els.guestJudgeStack.innerHTML = `
      <p class="guest-judge-intro">With our extra special guest judge...</p>
      <article class="guest-judge-profile">
        ${ep.guestJudge.image ? `<img class="guest-judge-img" src="${escapeHtml(ep.guestJudge.image)}" alt="${escapeHtml(ep.guestJudge.name)}">` : ""}
        <strong>${escapeHtml(ep.guestJudge.name)}</strong>
      </article>
    `;
  }

  function renderMiniPanel(ep) {
    if (!els.miniChallengeStack) return;
    const splitS14ReturnIds = state.season?.config?.premiereType === "split_s14"
      ? [...new Set((ep.returnedIds || []).filter(Boolean))]
      : [];
    const splitS14ReturnHtml = splitS14ReturnIds.length ? `
      <article class="challenge-card mini-challenge-card split-s14-return-card">
        <p class="announcement-line">But wait... the eliminated contestants are returning to the competition!</p>
        <div class="contestant-strip small-strip split-s14-return-strip">${splitS14ReturnIds.map((id) => contestantCard(id, "Returned", { className: "is-comeback-returnee" })).join("")}</div>
      </article>
    ` : "";
    if (ep.type === "finale") {
      const ids = ep.missCongenialityIds || [];
      const voteRows = (ep.missCongenialityVoteDetails || []).map((vote) => `
        <article class="mx-vote-card">
          ${contestantCard(vote.voterId)}
          <span class="vote-arrow">voted for</span>
          ${contestantCard(vote.votedForId)}
        </article>
      `).join("");
      els.miniChallengeStack.innerHTML = `
        <article class="challenge-card mini-challenge-card"><p>The contestants vote for the queen who brought the most warmth, kindness, and sisterhood to the season.</p></article>
        <div class="mx-vote-grid">${voteRows}</div>
        <p class="announcement-line">And the ${ids.length > 1 ? "winners are" : "winner is"}...</p>
        <div class="contestant-strip small-strip award-strip">${ids.map((id) => contestantCard(id)).join("") || `<span class="empty-state">No Mx. Congeniality was awarded.</span>`}</div>
      `;
      return;
    }
    if (ep.allWinnersStarGiveawaysAtStart?.length) {
      els.miniChallengeStack.innerHTML = `
        <article class="challenge-card star-giveaway-card"><h3>Star Giveaway</h3><p>The extra Legendary Legend Stars from last week's top two are being awarded.</p></article>
        <div class="mx-vote-grid star-giveaway-grid">
          ${ep.allWinnersStarGiveawaysAtStart.map((gift) => `<article class="mx-vote-card star-giveaway-vote">${contestantCard(gift.giverId)}<span class="vote-arrow">gave a star to</span>${contestantCard(gift.receiverId)}</article>`).join("")}
        </div>
      `;
      return;
    }
    if (!ep.miniChallenge) { els.miniChallengeStack.innerHTML = splitS14ReturnHtml; return; }
    if (ep.miniChallenge?.readingComeback || ep.readingComeback) {
      const comeback = ep.readingComeback || {};
      const eligible = comeback.eligible || comeback.candidates || ep.miniChallenge.eligible || [];
      const winners = ep.miniWinnerIds || ep.miniChallenge.winners || [];
      const winnerIds = winners.filter(Boolean);
      const loserIds = eligible.filter((id) => !winnerIds.includes(id));
      const revealed = ep.readingComebackRevealed !== false;
      const comebackLine = comeback.text || "The eliminated contestants are back! Today the library is officially open. And the winning eliminated contestant will re-enter the competition!";
      const miniDescription = ep.miniChallenge.description || "";
      els.miniChallengeStack.innerHTML = `
        <article class="challenge-card mini-challenge-card reading-comeback-card first-sim-reading-card">
          <p class="muted reading-comeback-preline">I have someone I want to re-introduce to the competition...</p>
          <div class="contestant-strip small-strip comeback-candidates reading-comeback-candidates">${eligible.map((id) => contestantCard(id, "", { className: "is-eliminated" })).join("")}</div>
          <p class="reading-comeback-rule">${escapeHtml(comebackLine)}</p>
        </article>
        ${revealed ? `
          <article class="challenge-card mini-challenge-card reading-comeback-results-card">
            ${miniDescription ? `<p>${escapeHtml(miniDescription)}</p>` : ""}
            <p class="announcement-line">Winner</p>
            <div class="contestant-strip small-strip award-strip reading-winner-strip">${winnerIds.map((id) => contestantCard(id, "", { className: "is-comeback-returnee" })).join("")}</div>
            ${loserIds.length ? `<div class="contestant-strip small-strip comeback-candidates reading-comeback-candidates reading-loser-strip">${loserIds.map((id) => contestantCard(id, "", { className: "is-eliminated" })).join("")}</div><article class="challenge-card reading-loser-note"><p>Unfortunately, you've not won your way back into the competition. Sashay away...</p></article>` : ""}
          </article>
        ` : `<div class="center-actions"><button class="primary-btn reveal-reading-comeback-btn" type="button">Proceed</button></div>`}
      `;
      $all(".reveal-reading-comeback-btn").forEach((btn) => btn.addEventListener("click", () => {
        ep.readingComebackRevealed = true;
        saveState();
        renderMiniPanel(ep);
      }));
      return;
    }
    const description = typeof ep.miniChallenge === "string" ? ep.miniChallenge : ep.miniChallenge.description;
    const winners = ep.miniWinnerIds || [];
    els.miniChallengeStack.innerHTML = `
      ${splitS14ReturnHtml}
      <article class="challenge-card mini-challenge-card"><p>${escapeHtml(description || "Mini Challenge")}</p></article>
      <p class="announcement-line">And the ${winners.length === 1 ? "winner is" : "winners are"}...</p>
      <div class="contestant-strip small-strip award-strip">${winners.length ? winners.map((id) => contestantCard(id)).join("") : `<span class="empty-state">No mini challenge winner was declared.</span>`}</div>
    `;
  }

  function renderTeamsPanel(ep) {
    if (!els.teamPickingStack) return;
    if (ep.type === "finale") {
      const boot = ep.goldenBoot;
      els.teamPickingStack.innerHTML = boot?.id ? `
        <article class="challenge-card award-card"><p>This award goes to the Golden Boot of the season. And the winner is...</p></article>
        <div class="contestant-strip small-strip award-strip">${contestantCard(boot.id)}</div>
        <p class="announcement-line golden-boot-caption">${escapeHtml(fullDisplayName(state.season.contestants[boot.id]))} for their ${escapeHtml(boot.runway || "runway")} runway!</p>
      ` : `<span class="empty-state">No Golden Boot was awarded.</span>`;
      return;
    }
    if (isTeamsFormat(state.season)) { els.teamPickingStack.innerHTML = ""; return; }
    if (!ep.teams || ep.teams.mode === "solo") { els.teamPickingStack.innerHTML = ""; return; }
    if (["conjoined_twins", "reinas_de_la_comedia", "revenge_of_the_queens"].includes(ep.comeback?.format) && ep.teams.mode === "pairs") {
      els.teamPickingStack.innerHTML = `<div class="conjoined-pairs-row first-sim-pair-row">${ep.teams.groups.map((team) => groupBlock("", team.ids, state.season, { className: "conjoined-pair-card first-sim-pair-card", subtitle: team.name })).join("")}</div>`;
      return;
    }
    if (["attention_girl_groups", "kitty_girl_groups"].includes(ep.comeback?.format) && ep.teams.mode === "groups") {
      const isKitty = ep.comeback?.format === "kitty_girl_groups";
      const rowClass = isKitty ? "kitty-girl-groups-row first-sim-kitty-row" : "attention-girl-groups-row first-sim-attention-row";
      const cardClass = isKitty ? "kitty-group-card first-sim-kitty-card" : "attention-group-card first-sim-attention-card";
      els.teamPickingStack.innerHTML = `<div class="${rowClass}">${ep.teams.groups.map((team) => groupBlock(team.name, team.ids, state.season, { className: cardClass })).join("")}</div>`;
      return;
    }
    els.teamPickingStack.innerHTML = ep.teams.groups.map((team) => groupBlock("", team.ids, state.season, { subtitle: team.name })).join("");
  }

  function performanceSentence(ids, label, subject = "challenge") {
    const names = sentenceList(ids, state.season, true);
    return `${names} ${label} the ${subject}.`;
  }

  function performanceBandBlock(ids, band, subject) {
    if (!ids?.length) return "";
    const label = band === "slayed" ? "SLAYED" : band === "flopped" ? "FLOPPED in" : band === "great" ? "did great in" : band === "good" ? "did well in" : "struggled in";
    const sentence = performanceSentence(ids, label, subject);
    return groupBlock("", ids, state.season, { className: `performance-band band-${band}`, subtitle: sentence, nick: true });
  }

  function episodeThemeCopy(title, paragraphs = [], extraHtml = "", className = "") {
    const lines = (Array.isArray(paragraphs) ? paragraphs : [paragraphs]).filter(Boolean);
    return `
      <div class="episode-theme-copy ${escapeHtml(className)}">
        <h3>${escapeHtml(title || "")}</h3>
        ${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        ${extraHtml || ""}
      </div>
    `;
  }

  function specialPerformanceChoiceBlock(ep) {
    const choices = ep.specialPerformanceChoices || [];
    if (!choices.length) return "";
    const isTalent = choices[0]?.kind === "talent_show";
    const title = isTalent ? "Talent Show Choices" : "Snatch Game Characters";
    return `
      <article class="challenge-card special-performance-card">
        <h4>${escapeHtml(title)}</h4>
        <div class="contestant-strip special-performance-grid">
          ${choices.map((choice) => {
            const item = state.season.contestants[choice.id] || {};
            const line = isTalent
              ? `${fullDisplayName(item)} is doing a ${choice.choice} performance.`
              : `${fullDisplayName(item)} is playing ${choice.choice}.`;
            return `
              <article class="mini-contestant-card special-choice-card">
                <img class="avatar sqr" src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(item))}">
                <strong>${escapeHtml(fullDisplayName(item))}</strong>
                <span>${escapeHtml(line)}</span>
              </article>
            `;
          }).join("")}
        </div>
      </article>
    `;
  }

  function renderMaxiPanel(ep) {
    if (ep.type === "porkchop_premiere") {
      const pork = ep.porkchopPremiere || {};
      const loading = pork.loadingDock || null;
      const battles = (ep.extraLipSyncs || []).filter(Boolean);
      if (els.challengeSummary) {
        els.challengeSummary.innerHTML = episodeThemeCopy(
          "Porkchop Lip Syncs",
          "The queens enter the competition and are immediately thrown into lip sync battles. The winner of each battle joins the winners group, while the losers get the porkchop.",
          "",
          "porkchop-premiere-intro-copy"
        );
      }
      if (els.challengeGrid) {
        const battleHtml = battles.map((ls, index) => `
          <article class="challenge-card porkchop-battle-heading">
            <h4>Lip Sync #${index + 1}</h4>
            <p>${escapeHtml(sentenceList(ls.ids || [], state.season, false))} will compete in a lip sync battle.</p>
          </article>
          ${renderLipSyncCardWithOutcome(ls, ep, true, { forceOutcome: true, className: "porkchop-lip-sync-battle" })}
        `).join("");
        const groupHtml = `
          <div class="porkchop-group-grid">
            ${groupBlock("Porkchop Winners", pork.winnersGroup || pork.winnerIds || [], state.season, { className: "porkchop-group-card porkchop-winners-card", subtitle: "These contestants won their opening lip sync and will compete together next episode." })}
            ${groupBlock("Porkchop Group", pork.losersGroup || [], state.season, { className: "porkchop-group-card porkchop-losers-card", subtitle: "These contestants received the porkchop and will compete together in the third premiere episode." })}
          </div>
        `;
        const loadingHtml = loading ? `
          <article class="challenge-card porkchop-loading-dock-card">
            <h3>Porkchop Loading Dock</h3>
            <p>You have one last chance to return to the competition. But before that... you must give one of your fellow contestants the CHOP!</p>
            <div class="contestant-strip small-strip">${(pork.loserIds || []).map((id) => contestantCard(id)).join("")}</div>
          </article>
          <div class="mx-vote-grid porkchop-vote-grid">
            ${(loading.votes || []).map((vote) => `<article class="mx-vote-card porkchop-vote-card">${contestantCard(vote.voterId)}<span class="vote-arrow">gave the chop to</span>${contestantCard(vote.votedForId)}</article>`).join("")}
          </div>
          <article class="challenge-card porkchop-chop-reveal">
            <p>The contestant with the most votes is...</p>
            <div class="contestant-strip small-strip lip-sync-result-row">${resultContestantCard(loading.choppedId, false, true, false, true)}</div>
            <p class="lip-sync-outcome-line">${escapeHtml(`${fullDisplayName(state.season.contestants[loading.choppedId] || {})}, I'm sorry, my dear, but you're getting the porkchop. Now, sashay away...`)}</p>
          </article>
        ` : "";
        els.challengeGrid.innerHTML = `<div class="lalaparuza-round-list porkchop-battle-list">${battleHtml}</div>${loadingHtml}${groupHtml}`;
      }
      return;
    }
    if (ep.type === "cunt_test") {
      if (els.challengeSummary) els.challengeSummary.innerHTML = renderCuntTestIntro(ep);
      if (els.challengeGrid) els.challengeGrid.innerHTML = "";
      return;
    }
    if ((ep.type || "") === "comeback_lalaparuza_comeback") {
      if (els.challengeSummary) els.challengeSummary.innerHTML = episodeThemeCopy("LaLaPaRuZa Comeback", "Eliminated contestants lip sync for their lives against the remaining contestants. The winner returns to the competition and the loser sashays away.", "", "first-sim-lalaparuza-comeback-copy");
      if (els.challengeGrid) els.challengeGrid.innerHTML = `<div class="lalaparuza-round-list first-sim-lalaparuza-round-list">${(ep.extraLipSyncs || []).map((ls, index) => `<article class="challenge-card comeback-battle-heading"><h4>Lip Sync #${index + 1}</h4></article>${renderLipSyncCardWithOutcome(ls, ep, true, { forceOutcome: true, className: "lalaparuza-opening-round first-sim-lalaparuza-battle" })}`).join("")}</div>`;
      return;
    }
    if ((ep.type || "") === "comeback_game_within_a_game") {
      if (els.challengeSummary) els.challengeSummary.innerHTML = "";
      if (els.challengeGrid) els.challengeGrid.innerHTML = "";
      return;
    }
    if (ep.type === "mid_season_rate_a_queen") {
      const raq = ep.midSeasonRateAQueen || {};
      const part = Number(raq.part || 1);
      const firstBatch = Array.isArray(raq.firstBatch) ? raq.firstBatch : [];
      const secondBatch = Array.isArray(raq.secondBatch) ? raq.secondBatch : [];
      const intro = part === 1 ? `
        ${episodeThemeCopy(
          "Mid-Season Rate-A-Queen",
          "You'll be competing in two separate episodes in the Talent Show, where you'll be rating each other. The bottom contestants from each episode will lip sync for their life, and one of you will go home.",
          "",
          "midseason-raq-intro-copy"
        )}
        <div class="midseason-raq-batch-grid">
          ${groupBlock("First Talent Show Group", firstBatch, state.season, { className: "midseason-raq-batch-card", subtitle: `${sentenceList(firstBatch, state.season, false)} will compete in the first part of the Talent Show.` })}
          ${groupBlock("Second Talent Show Group", secondBatch, state.season, { className: "midseason-raq-batch-card", subtitle: `${sentenceList(secondBatch, state.season, false)} will compete in the second part of the Talent Show.` })}
        </div>
      ` : "";
      if (els.challengeSummary) {
        const partCopy = episodeThemeCopy(
          ep.challenge?.name || "Talent Show",
          part === 1 ? "Part 1 of the Talent Show begins. The other group watches and prepares to rank these performances." : "Part 2 of the Talent Show begins. The first group now ranks these performances.",
          "",
          "midseason-raq-summary-copy"
        );
        els.challengeSummary.innerHTML = `${intro}${partCopy}`;
      }
      if (els.challengeGrid) {
        els.challengeGrid.innerHTML = [
          specialPerformanceChoiceBlock(ep),
          performanceBandBlock(ep.maxiGroups?.slayed || [], "slayed", "talent show"),
          performanceBandBlock(ep.maxiGroups?.great || [], "great", "talent show"),
          performanceBandBlock(ep.maxiGroups?.good || [], "good", "talent show"),
          performanceBandBlock(ep.maxiGroups?.bad || [], "bad", "talent show"),
          performanceBandBlock(ep.maxiGroups?.flopped || [], "flopped", "talent show")
        ].join("");
      }
      return;
    }

    if (ep.type === "special_slayoffs") {
      if (els.challengeSummary) {
        els.challengeSummary.innerHTML = episodeThemeCopy("Slay-Offs", "The Top 8 lip sync in a winners-advance tournament. The bracket winner saves one queen, then the remaining bottom three lip sync and two contestants go home.", "", "slayoffs-intro-copy");
      }
      if (els.challengeGrid) {
        const saving = ep.slayOffsSavedId ? `<article class="challenge-card saving-ceremony-card"><h3>Saving Ceremony</h3><p>${escapeHtml(fullDisplayName(state.season.contestants[ep.winnerIds?.[0]] || {}))} has won the Slay-Offs and saves ${escapeHtml(fullDisplayName(state.season.contestants[ep.slayOffsSavedId] || {}))} from the bottom lip sync.</p><div class="contestant-strip small-strip">${contestantCard(ep.slayOffsSavedId, "Saved")}</div></article>` : "";
        els.challengeGrid.innerHTML = `<div class="lalaparuza-round-list">${(ep.extraLipSyncs || []).map((ls) => renderLipSyncCardWithOutcome(ls, ep, true, { forceOutcome: true, className: "lalaparuza-opening-round" })).join("")}</div>${saving}`;
      }
      return;
    }
    if (ep.type === "reunion_lalaparuza") {
      if (els.challengeSummary) els.challengeSummary.innerHTML = episodeThemeCopy("Reunion LaLaPaRuZa", "The eliminated contestants return for a reunion lip sync smackdown to crown the Queen of She Done Already Done Had Herses.", "", "reunion-lalaparuza-intro-copy");
      if (els.challengeGrid) els.challengeGrid.innerHTML = `<div class="lalaparuza-round-list">${(ep.extraLipSyncs || []).map((ls) => renderLipSyncCardWithOutcome(ls, ep, true, { forceOutcome: true, className: "lalaparuza-opening-round" })).join("")}</div>`;
      return;
    }
    if (ep.type === "fame_games") {
      if (els.challengeSummary) els.challengeSummary.innerHTML = episodeThemeCopy("Fame Games Talent Show", "The eliminated contestants return for a talent show. The top two lip sync for a vote multiplier.", "", "fame-games-intro-copy");
      if (els.challengeGrid) els.challengeGrid.innerHTML = [
        specialPerformanceChoiceBlock(ep),
        performanceBandBlock(ep.maxiGroups?.slayed || [], "slayed", "talent show"),
        performanceBandBlock(ep.maxiGroups?.great || [], "great", "talent show"),
        performanceBandBlock(ep.maxiGroups?.good || [], "good", "talent show"),
        performanceBandBlock(ep.maxiGroups?.bad || [], "bad", "talent show"),
        performanceBandBlock(ep.maxiGroups?.flopped || [], "flopped", "talent show")
      ].join("");
      return;
    }
    if (ep.type === "special_lalaparuza") {
      if (els.challengeSummary) {
        els.challengeSummary.innerHTML = episodeThemeCopy("LaLaPaRuZa Smackdown", "The Top 8 lip sync in random 1v1 battles. Win Round 1 and you are safe. Lose Round 1 and you lip sync in Round 2. Lose Round 2 and you enter the final lip sync for your life.", "", "lalaparuza-smackdown-intro-copy");
      }
      if (els.challengeGrid) {
        els.challengeGrid.innerHTML = `<div class="lalaparuza-round-list">${(ep.extraLipSyncs || []).map((ls) => renderLipSyncCardWithOutcome(ls, ep, true, { forceOutcome: true, className: "lalaparuza-opening-round" })).join("")}</div>`;
      }
      return;
    }
    if (ep.type === "lsftf") {
      if (els.challengeSummary) {
        els.challengeSummary.innerHTML = episodeThemeCopy("Lip Sync for The Finale", "The Top Four will battle it out in three sickening lip syncs. The winners will join the top three, while one of the contestants will miss out on the spot.", "", "lsftf-intro-copy");
      }
      if (els.challengeGrid) els.challengeGrid.innerHTML = "";
      return;
    }
    if (ep.type === "finale") {
      if ((isAllWinnersFormat(state.season) && ep.allWinnersFinale) || ep.lsftcFinale) {
        if (els.challengeSummary) {
          const description = ep.lsftcFinale && !isAllWinnersFormat(state.season)
            ? "This finale is a Lip Sync for the Crown bracket with no finale performance round."
            : "This All Winners finale is a Lip Sync for the Crown. The Queen of She Done Already Done Had Herses smackdown happens before the crown bracket.";
          els.challengeSummary.innerHTML = episodeThemeCopy("No Finale Performances", description, "", "no-finale-performance-copy");
        }
        if (els.challengeGrid) els.challengeGrid.innerHTML = "";
        return;
      }
      if (els.challengeSummary) {
        els.challengeSummary.innerHTML = `<div class="episode-theme-copy"><h3>Finale Performances</h3><p>The finalists have prepared lip sync numbers to their original songs.</p></div>`;
      }
      if (els.challengeGrid) {
        els.challengeGrid.innerHTML = (ep.finalePerformances || []).map((perf) => groupBlock("", [perf.id], state.season, { className: "performance-band finale-performance-card", subtitle: `${fullDisplayName(state.season.contestants[perf.id])} performs a song ${perf.style}.` })).join("");
      }
      return;
    }
    if (els.challengeSummary) {
      els.challengeSummary.innerHTML = ep.challenge ? `
        <div class="episode-theme-copy">
          <h3>${escapeHtml(ep.challenge.name || "Maxi Challenge")}</h3>
          ${ep.challenge.description ? `<p>${escapeHtml(ep.challenge.description)}</p>` : `<p>${escapeHtml(titleize(ep.challenge.type || "challenge"))} challenge.</p>`}
        </div>
      ` : "";
    }
    if (els.challengeGrid) {
      els.challengeGrid.innerHTML = ep.challenge ? [
        specialPerformanceChoiceBlock(ep),
        performanceBandBlock(ep.maxiGroups?.slayed || [], "slayed", "challenge"),
        performanceBandBlock(ep.maxiGroups?.great || [], "great", "challenge"),
        performanceBandBlock(ep.maxiGroups?.good || [], "good", "challenge"),
        performanceBandBlock(ep.maxiGroups?.bad || [], "bad", "challenge"),
        performanceBandBlock(ep.maxiGroups?.flopped || [], "flopped", "challenge")
      ].join("") : "";
    }
  }

  function renderRunwayPanel(ep) {
    if (els.runwaySummary) {
      els.runwaySummary.innerHTML = ep.runway ? `
        <div class="episode-theme-copy">
          <h3>${escapeHtml(ep.runway.name || "Runway")}</h3>
          <p>${ep.runwayUsesChallengeScore ? "This runway-style challenge is scored here using the main challenge performance." : `The category is ${escapeHtml(ep.runway.name || "Runway")}.`}</p>
        </div>
      ` : "";
    }
    if (els.runwayGrid) {
      els.runwayGrid.innerHTML = ep.runway ? [
        performanceBandBlock(ep.runwayGroups?.slayed || [], "slayed", "runway"),
        performanceBandBlock(ep.runwayGroups?.great || [], "great", "runway"),
        performanceBandBlock(ep.runwayGroups?.good || [], "good", "runway"),
        performanceBandBlock(ep.runwayGroups?.bad || [], "bad", "runway"),
        performanceBandBlock(ep.runwayGroups?.flopped || [], "flopped", "runway")
      ].join("") : "";
    }
  }

  function rupaulSelectControl(kind, label, ids, value) {
    if (state.config.mode !== "rupaul" || !ids?.length) return "";
    return `
      <article class="challenge-card rupaul-control-card">
        <label class="field compact">
          <span>${escapeHtml(label)}</span>
          <select class="rupaul-control" data-kind="${escapeHtml(kind)}">
            ${ids.map((id) => `<option value="${escapeHtml(id)}" ${id === value ? "selected" : ""}>${escapeHtml(fullDisplayName(state.season.contestants[id]))}</option>`).join("")}
          </select>
        </label>
      </article>
    `;
  }

  function attachRupaulControls(ep) {
    if (state.config.mode !== "rupaul") return;
    $all(".rupaul-control").forEach((select) => {
      select.addEventListener("change", () => {
        applyRupaulManualChoice(ep, select.dataset.kind, select.value);
        saveState();
        renderEpisode();
      });
    });
  }

  function applyRupaulManualChoice(ep, kind, value) {
    if (!ep || !value) return;
    ep.rupaulManual = ep.rupaulManual || {};
    ep.rupaulManual[kind] = value;
    if (kind === "winner") {
      const oldWinners = new Set(ep.winnerIds || []);
      const pool = [...new Set([...(ep.winnerIds || []), ...(ep.highIds || []), ...(ep.top2Ids || [])])];
      ep.winnerIds = [value];
      ep.highIds = pool.filter((id) => id !== value);
      if (isAssassinFormat(state.season) && ep.lipSync?.isAssassinLipSync) {
        const assassinId = ep.lipSync.assassinId || (ep.lipSync.ids || []).find((id) => state.season.contestants[id]?.isAssassin) || pickLipSyncAssassin(state.season);
        const oldSong = ep.lipSync.song || pickSong(state.season);
        ep.lipSync = createLipSyncFromSong(state.season, [value, assassinId], oldSong, "Lip Sync For Your Legacy");
        ep.lipSync.assassinId = assassinId;
        ep.lipSync.isAssassinLipSync = true;
        ep.lipSync.resultType = state.season.contestants[ep.lipSync.winnerId]?.isAssassin ? "assassin_group_vote" : "assassin_sole_vote";
        const eliminated = resolveAssassinEliminationDecision(state.season, ep, ep.lipSync);
        ep.eliminatedIds = eliminated ? [eliminated] : [];
        ep.resultText = eliminated ? `${displayName(state.season.contestants[eliminated])}, as it is written, so it shall be done... Sashay Away.` : ep.resultText;
      }
      return;
    }
    if (kind === "save") {
      const danger = [...new Set([...(ep.lowIds || []), ...(ep.bottomIds || [])])];
      ep.lowIds = [value];
      ep.bottomIds = danger.filter((id) => id !== value).slice(0, 2);
      setSafeIds(state.season, ep);
      if (ep.bottomIds.length === 2) {
        const oldSong = ep.lipSync?.song || pickSong(state.season);
        ep.lipSync = createLipSyncFromSong(state.season, ep.bottomIds.slice(), oldSong, "Lip Sync For Your Life");
        const savedId = ep.lipSync.winnerId;
        const eliminatedId = ep.lipSync.loserId;
        ep.savedIds = [savedId];
        ep.eliminatedIds = [eliminatedId];
        ep.resultText = `${displayName(state.season.contestants[savedId])}, shantay you stay. ${displayName(state.season.contestants[eliminatedId])}, sashay away.`;
      }
      return;
    }
    if (kind === "lipSyncWinner") {
      const lipSync = ep.lipSync || (ep.extraLipSyncs || [])[0];
      if (!lipSync || !(lipSync.ids || []).includes(value)) return;
      const loser = (lipSync.ids || []).find((id) => id !== value) || lipSync.loserId;
      lipSync.winnerId = value;
      lipSync.loserId = loser;
      lipSync.performances = (lipSync.performances || []).sort((a, b) => a.id === value ? -1 : b.id === value ? 1 : b.score - a.score);
      if (isLegacyFormat(state.season) && lipSync.context === "Lip Sync For Your Legacy") {
        ep.legacyLipSyncLoserId = loser;
        const chosen = (ep.legacyLipsticks || []).find((vote) => vote.voterId === value)?.lipstickId || (ep.bottomIds || [])[0];
        ep.winnerIds = [value];
        ep.eliminatedIds = chosen ? [chosen] : [];
        ep.legacyEliminationChoiceId = chosen || null;
        ep.resultText = chosen ? `${displayName(state.season.contestants[chosen])}, as it is written, so it shall be done... Sashay Away.` : ep.resultText;
        return;
      }
      if (isAssassinFormat(state.season) && lipSync.isAssassinLipSync) {
        const eliminated = resolveAssassinEliminationDecision(state.season, ep, lipSync);
        ep.eliminatedIds = eliminated ? [eliminated] : [];
        ep.resultText = eliminated ? `${displayName(state.season.contestants[eliminated])}, as it is written, so it shall be done... Sashay Away.` : ep.resultText;
        return;
      }
      ep.savedIds = [value];
      ep.eliminatedIds = loser ? [loser] : [];
      ep.resultText = loser ? `${displayName(state.season.contestants[value])}, shantay you stay. ${displayName(state.season.contestants[loser])}, sashay away.` : ep.resultText;
    }
  }

  function renderJudgingPanel(ep) {
    if (!els.judgingStack) return;
    const parts = [];
    if (isRateAQueenEpisode(ep)) {
      parts.push(textEvent("This week, your fate is in the hands of your queer peers. You will Rate-A-Queen! Rate your fellow competitors based on who you think deserves to stay in this competition.", "storyline"));
    }
    if (!isRateAQueenEpisode(ep) && ep.judgedInTeams && ep.winningTeamIds?.length) {
      parts.push(textEvent("This week you'll be judged in teams.", "storyline"));
      parts.push(groupBlock("Winning Team", ep.winningTeamIds, state.season, { className: "placement-group token-high" }));
      if (ep.teamWinMode === "solo" && ep.winnerIds?.length) {
        parts.push(textEvent("But one of you has snatched our attention...", "storyline"));
        parts.push(groupBlock("Challenge Winner", ep.winnerIds, state.season, { className: "placement-group token-win", subtitle: `${sentenceList(ep.winnerIds, state.season, false)}, condragulations, you're the winner of this week's maxi-challenge.` }));
      } else if (ep.teamWinMode === "team" && ep.winnerIds?.length) {
        parts.push(groupBlock("Winning Team", ep.winnerIds, state.season, { className: "placement-group token-win", subtitle: `${sentenceList(ep.winnerIds, state.season, false)}, condragulations, you're all the winners of this week's maxi-challenge.` }));
      }
    } else if (!isRateAQueenEpisode(ep) && ep.safeIds?.length) {
      const names = sentenceList(ep.safeIds, state.season, false);
      const text = `${names}, you're safe. You may leave the stage.`;
      parts.push(groupBlock("", ep.safeIds, state.season, { subtitle: text }));
    }
    if (state.config.mode === "rupaul" && ep.winnerIds?.length) {
      const winnerPool = [...new Set([...(ep.winnerIds || []), ...(ep.highIds || []), ...(ep.top2Ids || [])])];
      parts.push(rupaulSelectControl("winner", "RuPaul mode: choose the challenge winner", winnerPool, ep.winnerIds[0]));
    }
    els.judgingStack.innerHTML = parts.join("");
    if (parts.length) attachRupaulControls(ep);
  }

  function placementGroupLine(ids, type) {
    const names = sentenceList(ids, state.season, false);
    if (type === "win") {
      const ep = currentEpisode();
      const immunityText = ep?.immunityAwardedId && ids.includes(ep.immunityAwardedId) ? " You have also earned immunity for the next episode." : "";
      return (ids.length === 1 ? `${names}, condragulations, you're the winner of this challenge.` : `${names}, condragulations, you're all the winners of this week's maxi-challenge.`) + immunityText;
    }
    if (type === "high") return ids.length === 1 ? `${names}, good job this week, you're safe.` : `${names}, good job this week, you're safe.`;
    if (type === "low") return `${names}, you're safe.`;
    if (type === "bottom") {
      const ep = currentEpisode();
      if (isGoldenBeaverFormat(state.season) && ep?.goldenBeaverBottomIds?.length) return `${names}, I'm sorry my dears, but you are the bottom three of the week.`;
      return ep?.lalaparuzaWarningText || `${names}, I'm sorry my dears, but you're up for elimination.`;
    }
    if (type === "top2") {
      const ep = currentEpisode();
      if (isAllWinnersFormat(state.season) && ep?.allWinnersEpisode) return `${names}, you are the top two All Stars of the week.`;
      return `${names}, you are the top two of the week.`;
    }
    if (type === "final") return `${names}, I'm sorry my dears, but you will not be moving on to the final lip sync.`;
    if (type === "safe") return `${names}, you're safe.`;
    return `${names}, you're safe.`;
  }

  function placementGroup(title, ids, type) {
    if (!ids?.length) return "";
    return groupBlock(title, ids, state.season, { className: `placement-group token-${type}`, subtitle: placementGroupLine(ids, type) });
  }

  function renderGoldenBeaverPanel(ep) {
    if (!els.goldenBeaverStack) return;
    if (!isGoldenBeaverFormat(state.season) || ep.type === "finale" || !seasonEliminationFormatApplies(state.season, ep) || !ep.goldenBeaverBottomIds?.length) {
      els.goldenBeaverStack.innerHTML = "";
      return;
    }
    const winnerId = (ep.winnerIds || [])[0];
    const winner = state.season.contestants[winnerId] || {};
    const revealed = !!ep.goldenBeaverSaveRevealed;
    const savedId = ep.goldenBeaverSavedId;
    els.goldenBeaverStack.innerHTML = `
      <article class="challenge-card golden-beaver-card">
        <p class="announcement-line">${escapeHtml(`${fullDisplayName(winner)}, with great power comes great responsibility... Who have you chosen to save with the power of the Golden Beaver?`)}</p>
        <div class="contestant-strip small-strip award-strip golden-beaver-winner">${contestantCard(winnerId)}</div>
      </article>
      <div class="contestant-strip small-strip golden-beaver-bottom-row">
        ${(ep.goldenBeaverBottomIds || []).map((id) => contestantCard(id, id === savedId && revealed ? "Saved" : "", { className: id === savedId && revealed ? "is-golden-beaver-saved" : "" })).join("")}
      </div>
      <div class="center-actions">
        ${revealed ? `<p class="announcement-line golden-beaver-save-line">${escapeHtml(`${fullDisplayName(state.season.contestants[savedId])} has been saved by the Golden Beaver.`)}</p>` : `<button class="primary-btn reveal-golden-beaver-btn" type="button">Reveal Save</button>`}
      </div>
    `;
    els.goldenBeaverStack.querySelector(".reveal-golden-beaver-btn")?.addEventListener("click", () => {
      ep.goldenBeaverSaveRevealed = true;
      saveState();
      renderGoldenBeaverPanel(ep);
    });
  }


  function renderLuckyCowPanel(ep) {
    if (!els.luckyCowStack) return;
    const cow = ep?.luckyCow;
    if (!cow?.active || !(cow.votes || []).length) { els.luckyCowStack.innerHTML = ""; return; }
    const bottomIds = ep.bottomIds || [];
    const totals = cow.totals || {};
    const voteRows = (cow.votes || []).map((vote) => `
      <article class="mx-vote-card lucky-cow-vote-card">
        ${contestantCard(vote.voterId)}
        <span class="vote-arrow">voted for</span>
        ${contestantCard(vote.votedForId)}
      </article>
    `).join("");
    els.luckyCowStack.innerHTML = `
      <article class="challenge-card lucky-cow-intro-card">
        <div class="lucky-cow-title-row"><span class="lucky-cow-icon">🐄</span><h3>Lucky Cow</h3><span class="lucky-cow-icon">✨</span></div>
        <p>The safe contestants secretly vote to save one queen from the bottom before the lip sync begins.</p>
      </article>
      <div class="contestant-strip small-strip lucky-cow-bottoms">${bottomIds.map((id) => contestantCard(id, `${Number(totals[id] || 0)} vote${Number(totals[id] || 0) === 1 ? "" : "s"}`, { className: cow.targetId === id ? "is-lucky-cow-target" : "" })).join("")}</div>
      <div class="mx-vote-grid lucky-cow-vote-grid">${voteRows}</div>
    `;
  }

  function renderLuckyCowReveal(ep, revealed) {
    const cow = ep?.luckyCow;
    if (!revealed || !cow?.active || !cow.eliminatedId) return "";
    const opened = !!cow.revealed;
    const saved = !!cow.saved;
    const message = saved
      ? "Condragulations, my dear! You're one Lucky Cow and you're safe to slay another day!"
      : "I'm sorry my dear, but your fellow competitors did not vote you to be the lucky cow. Now, sashay away...";
    return `
      <article class="lucky-cow-reveal-panel ${opened ? (saved ? "is-saved" : "is-not-saved") : ""}">
        <h3>Lucky Cow</h3>
        <div class="contestant-strip small-strip">${contestantCard(cow.eliminatedId)}</div>
        ${opened ? `<p>${escapeHtml(message)}</p>` : `<button class="primary-btn reveal-lucky-cow-btn" type="button">Reveal Lucky Cow</button>`}
      </article>
    `;
  }

  function renderBadonkaDunkTankPanel(ep) {
    if (!els.badonkaDunkTankStack) return;
    const dunk = ep?.badonkaDunkTank;
    if (!dunk?.active) { els.badonkaDunkTankStack.innerHTML = ""; return; }
    const tank = state.season?.badonkaDunkTank || {};
    const contestantId = dunk.contestantId;
    const opened = !!dunk.revealed;
    const boxes = (tank.boxes || []).map((box) => {
      const isCurrent = Number(box.number) === Number(dunk.boxNumber);
      const isOpen = !!box.opened || (isCurrent && opened);
      const icon = !isOpen ? "" : (box.save ? "✓" : "✕");
      const cls = ["badonka-box", isOpen ? "is-open" : "", isOpen && box.save ? "is-save" : "", isOpen && !box.save ? "is-bust" : "", isCurrent ? "is-current" : ""].filter(Boolean).join(" ");
      return `<div class="${cls}"><strong>${box.number}</strong>${isOpen ? `<span>${icon}</span>` : ""}</div>`;
    }).join("");
    const result = dunk.saved
      ? `${fullDisplayName(state.season.contestants[contestantId])}, condragulations, the luck is on your side! Shantay you stay!`
      : "I'm sorry my dear, but this is not your time. Now, sashay away.";
    els.badonkaDunkTankStack.innerHTML = `
      <article class="challenge-card badonka-intro-card">
        <h3>Badonka Dunk Tank</h3>
        <p>${escapeHtml(`${fullDisplayName(state.season.contestants[contestantId])}, now your fate lies in the hands of the Drag Gods. Pull the lever, and if you're lucky enough, you'll be safe and continue in the competition.`)}</p>
      </article>
      <div class="contestant-strip small-strip badonka-contestant-strip">${contestantCard(contestantId)}</div>
      <div class="badonka-box-grid box-count-${Number(dunk.boxCount || tank.boxCount || 4)}">${boxes}</div>
      <div class="center-actions">${opened ? `<p class="badonka-result-line ${dunk.saved ? "is-save" : "is-bust"}">${dunk.saved ? "✓" : "✕"} ${escapeHtml(result)}</p>` : `<button class="primary-btn pull-badonka-lever-btn" type="button">Pull Lever</button>`}</div>
    `;
    els.badonkaDunkTankStack.querySelector(".pull-badonka-lever-btn")?.addEventListener("click", () => {
      dunk.revealed = true;
      const openedBox = (state.season?.badonkaDunkTank?.boxes || []).find((box) => Number(box.number) === Number(dunk.boxNumber));
      if (openedBox) {
        openedBox.opened = true;
        openedBox.reserved = false;
        openedBox.openedById = dunk.contestantId;
        openedBox.episodeLabel = ep.label;
        openedBox.episodeNumber = ep.number;
      }
      saveState();
      renderBadonkaDunkTankPanel(ep);
    });
  }

  function renderJuryVotingPanel(ep) {
    const finalists = ep.activeStartIds || state.season.activeIds || [];
    const top2 = ep.top2Ids || [];
    const ballotRows = (ep.juryBallots || []).map((ballot) => `
      <article class="mx-vote-card jury-mx-vote-card">
        <div class="jury-voter-row">${contestantCard(ballot.jurorId)}</div>
        <div class="jury-pick-row">
          <div class="jury-point-pick">
            ${ballot.firstId ? contestantCard(ballot.firstId) : `<span class="empty-state">—</span>`}
            <span class="vote-arrow">2 POINTS</span>
          </div>
          <div class="jury-point-pick">
            ${ballot.secondId ? contestantCard(ballot.secondId) : `<span class="empty-state">—</span>`}
            <span class="vote-arrow">1 POINT</span>
          </div>
        </div>
      </article>
    `).join("");
    const totals = finalists.slice().sort((a, b) => Number(ep.juryVotes?.[b] || 0) - Number(ep.juryVotes?.[a] || 0) || finaleScore(state.season, b) - finaleScore(state.season, a));
    const scoreRows = totals.map((id) => {
      const points = Number(ep.juryVotes?.[id] || 0);
      return `
        <article class="mx-vote-card jury-score-mx-card ${top2.includes(id) ? "is-top-two" : ""}">
          ${contestantCard(id)}
          <strong>${points}</strong>
          <span class="vote-arrow">VOTES</span>
        </article>
      `;
    }).join("");
    return `
      <div class="mx-vote-grid jury-vote-grid">${ballotRows || `<article class="mx-vote-card"><span class="empty-state">No jurors voted.</span></article>`}</div>
      <div class="mx-vote-grid jury-total-grid">${scoreRows}</div>
      <p class="announcement-line">${escapeHtml(sentenceList(top2, state.season, false))}, condragulations, you are the top two of the season.</p>
    `;
  }



  function renderRateQueenPanel(ep) {
    if (!els.rateQueenStack) return;
    const ballots = ep.rateAQueenBallots || [];
    if (!ballots.length) { els.rateQueenStack.innerHTML = ""; return; }
    const ballotRows = ballots.map((ballot) => `
      <article class="rate-queen-ballot-card">
        <div class="rate-queen-voter-banner">
          <span class="rate-queen-voter-label">Ballot by</span>
          ${contestantCard(ballot.voterId)}
        </div>
        <ol class="rate-queen-ranking-list">
          ${(ballot.rankings || []).map((rank) => `<li><span class="rate-queen-rank-number">${rank.rank}</span>${contestantCard(rank.id, "", { nick: true })}</li>`).join("")}
        </ol>
      </article>
    `).join("");
    const intro = ep.specialPremiere === "mid_season_rate_a_queen"
      ? "This week, the contestants will be ranking each other. The non-competing group ranks this Talent Show group from first to last, balancing performance and relationships equally."
      : ep.specialPremiere === "rate_a_queen_s17_split"
        ? "The queens from the opposite premiere group rank this week's competing queens from first to last, balancing the performances and their relationships equally."
        : "Each contestant ranks their queer peers from first to last, balancing this week's performance and their relationships equally.";
    els.rateQueenStack.innerHTML = `
      <article class="challenge-card rate-queen-intro-card">
        <h3>Rate-A-Queen</h3>
        <p>${escapeHtml(intro)}</p>
      </article>
      <div class="rate-queen-ballots-grid">${ballotRows}</div>
    `;
  }

  function renderConjoinedTwinsPlacements(ep) {
    const returneeId = (ep.returnedIds || [])[0] || ep.comeback?.returnedId || null;
    const winIds = [...new Set((ep.comeback?.winPair || ep.winnerIds || []).filter(Boolean))];
    const cards = [];
    if (winIds.length) {
      const names = sentenceList(winIds, state.season, false);
      const returnName = returneeId ? fullDisplayName(state.season.contestants[returneeId]) : "";
      cards.push(`
        <article class="challenge-card placement-group token-win conjoined-winner-group conjoined-placement-card">
          <h4>Winner</h4>
          <div class="contestant-strip small-strip">${winIds.map((id) => contestantCard(id)).join("")}</div>
          <p>${escapeHtml(names)}, condragulations, you're all the winners of this week's maxi-challenge.</p>
          ${returnName ? `<p class="conjoined-return-line">${escapeHtml(returnName)}, you're back in the race, baby!</p>` : ""}
        </article>
      `);
    }
    if ((ep.highIds || []).length) cards.push(groupBlock("High", ep.highIds || [], state.season, { className: "placement-group token-high conjoined-placement-card", subtitle: `${sentenceList(ep.highIds || [], state.season, false)}, good job this week, you're safe.` }));
    if ((ep.lowIds || []).length) cards.push(groupBlock("Low", ep.lowIds || [], state.season, { className: "placement-group token-low conjoined-placement-card", subtitle: `${sentenceList(ep.lowIds || [], state.season, false)}, you're safe.` }));
    if ((ep.bottomIds || []).length) cards.push(groupBlock("Bottom", ep.bottomIds || [], state.season, { className: "placement-group token-btm2 conjoined-placement-card", subtitle: `${sentenceList(ep.bottomIds || [], state.season, false)} will lip sync for their lives.` }));
    return cards.filter(Boolean).join("") || `<span class="empty-state">No comeback placements to display.</span>`;
  }

  function renderAttentionGirlGroupsPlacements(ep) {
    const eligible = ep.comeback?.eligible || ep.comeback?.candidates || [];
    const challengerId = ep.comeback?.challengerId || null;
    const outIds = eligible.filter((id) => id && id !== challengerId);
    const cards = [];
    if ((ep.winnerIds || []).length) cards.push(placementGroup("Winner", ep.winnerIds || [], "win"));
    if ((ep.highIds || []).length) cards.push(placementGroup("High", ep.highIds || [], "high"));
    if ((ep.safeIds || []).length) cards.push(placementGroup("Safe", ep.safeIds || [], "safe"));
    if ((ep.lowIds || []).length) cards.push(placementGroup("Low", ep.lowIds || [], "low"));
    if ((ep.bottomIds || []).length) cards.push(groupBlock("Bottom", ep.bottomIds || [], state.season, {
      className: "placement-group token-btm1 attention-placement-card",
      subtitle: `${sentenceList(ep.bottomIds || [], state.season, false)}, I'm sorry my dear, but you are the worst of the week.`
    }));
    if (challengerId) cards.push(groupBlock("Best Eliminated Contestant", [challengerId], state.season, {
      className: "placement-group token-rtrn attention-placement-card attention-challenger-card",
      subtitle: `${fullDisplayName(state.season.contestants[challengerId])}, condragulations, you're the best eliminated contestant of the week. You'll have a chance to return to the competition, BUT! Only if you win the lip sync against the bottom contestant...`
    }));
    if (outIds.length) cards.push(groupBlock("Still Out", outIds, state.season, {
      className: "placement-group token-out attention-placement-card attention-out-card",
      subtitle: "I'm sorry my dears, but this ends your time in the competition. Sashay away..."
    }));
    return cards.filter(Boolean).join("") || `<span class="empty-state">No comeback placements to display.</span>`;
  }

  function renderKittyGirlGroupsPlacements(ep) {
    const kitty = ep.kitty || {};
    const winSide = kitty.winSide || "remaining";
    const winningIds = winSide === "remaining" ? (kitty.remainingTeam || []) : (kitty.eliminatedTeam || []);
    const top2 = (kitty.top2 || []).slice(0, 2).filter(Boolean);
    const bottomDisplay = winSide === "remaining"
      ? (kitty.bottomPool || (kitty.remainingTeam || []).filter((id) => !top2.includes(id))).filter(Boolean)
      : (kitty.bottomGroup || kitty.remainingTeam || ep.bottomIds || []).filter(Boolean);
    const cards = [];

    if (winningIds.length) {
      cards.push(groupBlock("Winning Group", winningIds, state.season, {
        className: "placement-group token-high kitty-placement-card kitty-winning-group",
        subtitle: "Condragulations, you're the winning group! However..."
      }));
    }

    if (top2.length) {
      cards.push(groupBlock("Top Two", top2, state.season, {
        className: "placement-group token-top2 kitty-placement-card kitty-top2-card",
        subtitle: `${ampersandList(top2, state.season, false)}, you're the top two of the week!`
      }));
    }

    if (bottomDisplay.length) {
      cards.push(groupBlock(winSide === "remaining" ? "Bottom" : "Bottom Group", [...new Set(bottomDisplay)], state.season, {
        className: "placement-group token-btm2 kitty-placement-card kitty-bottom-card",
        subtitle: winSide === "remaining"
          ? `${sentenceList(bottomDisplay, state.season, false)}, I'm sorry my dears, but you are up for elimination.`
          : "I'm sorry my dears, but you are ALL in the bottom."
      }));
    }

    return cards.filter(Boolean).join("") || `<span class="empty-state">No comeback placements to display.</span>`;
  }

  function renderRevengeOfTheQueensPlacements(ep) {
    const cards = [];
    const activeWinners = ep.comeback?.activeWinnerIds || ep.revengeActiveWinnerIds || [];
    const topEliminated = ep.comeback?.topEliminatedIds || ep.revengeTopEliminatedIds || ep.top2Ids || [];
    const outIds = (ep.comeback?.eligible || ep.comeback?.candidates || []).filter((id) => id && !topEliminated.includes(id));

    if (activeWinners.length) {
      cards.push(groupBlock("Winner", activeWinners, state.season, {
        className: "placement-group token-win revenge-placement-card revenge-active-winners-card",
        subtitle: `${sentenceList(activeWinners, state.season, false)}, condragulations, you're the winners of this week's maxi-challenge.`
      }));
    }
    if ((ep.highIds || []).length) {
      cards.push(groupBlock("High", ep.highIds || [], state.season, {
        className: "placement-group token-high revenge-placement-card",
        subtitle: `${sentenceList(ep.highIds || [], state.season, false)}, good job this week, you're safe.`
      }));
    }
    if ((ep.safeIds || []).length) {
      cards.push(groupBlock("Safe", ep.safeIds || [], state.season, {
        className: "placement-group token-safe revenge-placement-card",
        subtitle: `${sentenceList(ep.safeIds || [], state.season, false)}, you're safe.`
      }));
    }
    if ((ep.lowIds || []).length) {
      cards.push(groupBlock("Low", ep.lowIds || [], state.season, {
        className: "placement-group token-low revenge-placement-card",
        subtitle: `${sentenceList(ep.lowIds || [], state.season, false)}, you're safe.`
      }));
    }
    if ((ep.bottomIds || []).length) {
      cards.push(groupBlock("Bottom Two", ep.bottomIds || [], state.season, {
        className: "placement-group token-btm2 revenge-placement-card revenge-bottom-card",
        subtitle: `${sentenceList(ep.bottomIds || [], state.season, false)}, I'm sorry my dears, but you are up for elimination.`
      }));
    }
    if (topEliminated.length) {
      cards.push(groupBlock("Top Two Eliminated Queens", topEliminated, state.season, {
        className: "placement-group token-top2 revenge-placement-card revenge-top-eliminated-card",
        subtitle: `${sentenceList(topEliminated, state.season, false)}, you are the top two eliminated queens. You will lip sync for your chance to return to the competition.`
      }));
    }
    if (outIds.length) {
      cards.push(groupBlock("Dismissed Eliminated Queens", outIds, state.season, {
        className: "placement-group token-out revenge-placement-card revenge-out-card",
        subtitle: "I'm sorry my dears, but this ends your chance to return. Sashay away..."
      }));
    }
    return cards.filter(Boolean).join("") || `<span class="empty-state">No comeback placements to display.</span>`;
  }

  function renderRevengeOfTheQueensResults(ep, revealed) {
    const lipSync = ep.lipSync || null;
    const returneeId = (ep.returnedIds || [])[0] || ep.comeback?.returnedId || null;
    const eliminatedId = ep.comeback?.eliminatedActiveId || (ep.eliminatedIds || [])[0] || null;
    const bottomChoices = (ep.comeback?.bottomChoiceIds || ep.bottomIds || []).filter(Boolean);
    const chopRevealed = !!ep.revengeChopRevealed;
    const pieces = [];
    pieces.push(lipSync ? renderLipSyncResultBlock(lipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The revenge lip sync is complete.")}</p></article>`);
    if (!revealed) return pieces.join("");
    if (returneeId) {
      pieces.push(`
        <article class="challenge-card revenge-result-card revenge-return-card token-rtrn">
          <h4>Returned</h4>
          <div class="contestant-strip small-strip award-strip">${resultContestantCard(returneeId, true, false, false, false)}</div>
          <p class="lip-sync-outcome-line">${escapeHtml(`${fullDisplayName(state.season.contestants[returneeId])}, you're back in the race, baby!`)}</p>
        </article>
      `);
    }
    if (eliminatedId) {
      pieces.push(`
        <article class="challenge-card revenge-result-card revenge-chop-card token-elim">
          <p class="announcement-line">${escapeHtml("Who have you chosen to get the chop?")}</p>
          <div class="contestant-strip small-strip revenge-bottom-choice-row">${bottomChoices.map((id) => resultContestantCard(id, false, chopRevealed && id !== eliminatedId, false, chopRevealed && id === eliminatedId)).join("")}</div>
          <div class="center-actions">${chopRevealed ? "" : `<button class="primary-btn revenge-reveal-chop-btn" type="button">Reveal Eliminated Queen</button>`}</div>
          ${chopRevealed ? `<p class="all-stars-sashay-line">${escapeHtml(`${fullDisplayName(state.season.contestants[eliminatedId])}, sashay away.`)}</p>` : ""}
        </article>
      `);
    }
    return pieces.join("");
  }


  function renderLalaparuzaComebackResults(ep, revealed) {
    const lipSyncs = ep.extraLipSyncs || [];
    if (!lipSyncs.length) return `<article class="event-card"><p>${escapeHtml(ep.resultText || "The LaLaPaRuZa comeback is complete.")}</p></article>`;
    const resultBlocks = lipSyncs.map((ls, index) => `
      <article class="challenge-card comeback-battle-heading first-sim-lalaparuza-result-heading"><h4>Lip Sync #${index + 1}</h4></article>
      ${renderLipSyncResultBlock(ls, ep, revealed)}
    `).join("");
    const returnedIds = ep.returnedIds || [];
    const returnedBlock = revealed && returnedIds.length ? `
      <article class="challenge-card lalaparuza-return-summary token-rtrn">
        <h4>Returned</h4>
        <div class="contestant-strip small-strip award-strip">${returnedIds.map((id) => resultContestantCard(id, true, false, false, false)).join("")}</div>
      </article>
    ` : "";
    return `<div class="lalaparuza-round-list first-sim-lalaparuza-results">${resultBlocks}${returnedBlock}</div>`;
  }

  function renderComebackPlacements(ep) {
    if (["conjoined_twins", "reinas_de_la_comedia"].includes(ep?.comeback?.format)) return renderConjoinedTwinsPlacements(ep);
    if (ep?.comeback?.format === "attention_girl_groups") return renderAttentionGirlGroupsPlacements(ep);
    if (ep?.comeback?.format === "kitty_girl_groups") return renderKittyGirlGroupsPlacements(ep);
    if (ep?.comeback?.format === "revenge_of_the_queens") return renderRevengeOfTheQueensPlacements(ep);
    const placements = ep.comebackPlacements || {};
    const idsBy = (token) => Object.keys(placements).filter((id) => placements[id] === token);
    const currentIdsBy = (token) => (ep.activeStartIds || []).filter((id) => placementTokenFor(ep, id) === token && !idsBy(token).includes(id));
    const cards = [];
    const rtrn = idsBy("RTRN");
    const inn = idsBy("IN");
    const dwin = idsBy("DWIN");
    const out = idsBy("OUT");
    const wins = [...new Set([...idsBy("WIN"), ...(ep.winnerIds || []).filter((id) => !dwin.includes(id))])].filter((id) => !out.includes(id));
    const top2 = [...new Set([...idsBy("TOP2"), ...(ep.top2Ids || [])])].filter((id) => !wins.includes(id) && !out.includes(id));
    const high = [...new Set([...(ep.highIds || []), ...currentIdsBy("HIGH")])].filter((id) => !wins.includes(id) && !dwin.includes(id) && !out.includes(id));
    const safe = [...new Set([...(ep.safeIds || []), ...(ep.savedIds || []), ...currentIdsBy("SAFE")])].filter((id) => !wins.includes(id) && !dwin.includes(id) && !top2.includes(id) && !high.includes(id));
    const low = [...new Set([...(ep.lowIds || []), ...currentIdsBy("LOW")])].filter((id) => !safe.includes(id));
    const bottom = [...new Set([...(ep.bottomIds || []), ...Object.keys(placements).filter((id) => /^BTM/.test(placements[id]))])];
    const elim = [...new Set([...(ep.eliminatedIds || []), ...idsBy("ELIM")])];
    const run = [...new Set([...(ep.runOnlyIds || []), ...idsBy("RUN")])];
    if (inn.length) cards.push(groupBlock("In", inn, state.season, { className: "placement-group token-in", subtitle: `${sentenceList(inn, state.season, false)} won the comeback tournament and is back in.` }));
    if (dwin.length) cards.push(groupBlock("Pair Winner", dwin, state.season, { className: "placement-group token-dwin", subtitle: `${sentenceList(dwin, state.season, false)} won the comeback challenge with their partner.` }));
    if (rtrn.length) cards.push(groupBlock("Returned", rtrn, state.season, { className: "placement-group token-rtrn", subtitle: `${sentenceList(rtrn, state.season, false)} returned to the competition.` }));
    if (wins.length) cards.push(groupBlock("Winner", wins, state.season, { className: "placement-group token-win", subtitle: `${sentenceList(wins, state.season, false)} won the comeback challenge.` }));
    if (top2.length) cards.push(groupBlock("Top Two", top2, state.season, { className: "placement-group token-top2", subtitle: `${sentenceList(top2, state.season, false)} made the top two of the comeback.` }));
    if (high.length) cards.push(groupBlock("High", high, state.season, { className: "placement-group token-high", subtitle: `${sentenceList(high, state.season, false)} stood out this week.` }));
    if (safe.length) cards.push(groupBlock("Safe", safe, state.season, { className: "placement-group token-safe", subtitle: `${sentenceList(safe, state.season, false)} survived the comeback episode.` }));
    if (run.length) cards.push(groupBlock("Run", run, state.season, { className: "placement-group token-run", subtitle: `${sentenceList(run, state.season, false)} appeared but did not compete in the comeback battle.` }));
    if (low.length) cards.push(groupBlock("Low", low, state.season, { className: "placement-group token-low", subtitle: `${sentenceList(low, state.season, false)} received negative critiques.` }));
    if (bottom.length) cards.push(groupBlock("Bottom", bottom, state.season, { className: "placement-group token-btm2", subtitle: `${sentenceList(bottom, state.season, false)} will lip sync for their lives.` }));
    if (out.length) cards.push(groupBlock("Out", out, state.season, { className: "placement-group token-out", subtitle: `${sentenceList(out, state.season, false)} did not win their way back.` }));
    if (elim.length) cards.push(groupBlock("Eliminated", elim, state.season, { className: "placement-group token-elim", subtitle: `${sentenceList(elim, state.season, false)}, sashay away.` }));
    return cards.filter(Boolean).join("") || `<span class="empty-state">No comeback placements to display.</span>`;
  }

  function renderPlacementsPanel(ep) {
    if (!els.placementsGrid) return;
    if (ep.type === "finale") {
      if (state.season?.config?.finaleType === "jury_finale" && ep.juryVotes) {
        els.placementsGrid.innerHTML = renderJuryVotingPanel(ep);
      } else {
        const ids = ep.eliminatedIds || [];
        els.placementsGrid.innerHTML = ids.length
          ? placementGroup("Eliminated Finalist", ids, "final")
          : `<span class="empty-state">No finalist was cut before the final lip sync.</span>`;
      }
      if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
      return;
    }
    if (ep.type === "cunt_test") {
      els.placementsGrid.innerHTML = renderCuntTestPlacements(ep);
      if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
      return;
    }
    if ((ep.type || "").startsWith("comeback_")) {
      els.placementsGrid.innerHTML = renderComebackPlacements(ep);
      if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
      return;
    }
    if (ep.specialPremiere === "late_entry") {
      els.placementsGrid.innerHTML = [
        placementGroup("Winner", ep.winnerIds || [], "win"),
        placementGroup("High", ep.highIds || [], "high"),
        `<article class="challenge-card placement-group token-safe"><p>Tonight, nobody's going home!</p></article>`
      ].filter(Boolean).join("");
      if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
      return;
    }
    const cards = [];
    if (isAllWinnersFormat(state.season) && ep.allWinnersEpisode) {
      const starNote = ep.number === state.season.allWinnersMidseasonEpisode ? "This week, each Top All Star earns one Legendary Legend Star to keep and one to give away next week." : ep.number === state.season.allWinnersTalentEpisode ? "This week, each Top All Star earns three Legendary Legend Stars." : "Each Top All Star is eligible to earn one Legendary Legend Star.";
      cards.push(groupBlock("Top Two All Stars", ep.top2Ids || [], state.season, { className: "placement-group token-top2 all-winners-top2", subtitle: starNote }));
      cards.push(placementGroup("High", ep.highIds || [], "high"));
      cards.push(placementGroup("Safe", ep.safeIds || [], "safe"));
      const blockedId = ep.allWinnersBlockedId;
      if (blockedId) cards.push(groupBlock("Blocked", [blockedId], state.season, { className: "placement-group token-blk", subtitle: `${fullDisplayName(state.season.contestants[blockedId])} is blocked from receiving a Legendary Legend Star this week.` }));
      if (ep.allWinnersStarGiveaways?.length) {
        cards.push(`<article class="challenge-card placement-group star-giveaway-pending"><h4>Star Giveaway Pending</h4><p>${ep.allWinnersStarGiveaways.map((gift) => `${escapeHtml(fullDisplayName(state.season.contestants[gift.giverId]))} will give a Legendary Legend Star next episode.`).join(" ")}</p></article>`);
      }
      els.placementsGrid.innerHTML = cards.filter(Boolean).join("") || `<span class="empty-state">No placements to display.</span>`;
      if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
      return;
    }
    if (isRateAQueenEpisode(ep)) {
      const topLine = ep.specialPremiere === "rate_a_queen_split" || ep.specialPremiere === "rate_a_queen_s17_split"
        ? "Based on the votes in the Rate-A-Queen, the Top 2 of the premiere are..."
        : "Based on the votes in the Rate-A-Queen, here are this week's placements...";
      cards.push(`<article class="challenge-card placement-group rate-queen-placement-note"><p>${escapeHtml(topLine)}</p></article>`);
      if (ep.specialPremiere === "mid_season_rate_a_queen") {
        cards.push(groupBlock("Top Two", ep.top2Ids || [], state.season, { className: "placement-group token-top2", subtitle: `${sentenceList(ep.top2Ids || [], state.season, false)}, you are the top two queens of this Talent Show part.` }));
        cards.push(groupBlock("Safe", ep.safeIds || [], state.season, { className: "placement-group token-safe", subtitle: `${sentenceList(ep.safeIds || [], state.season, false)}, you are safe.` }));
        cards.push(groupBlock("Bottom 1", ep.bottomIds || [], state.season, { className: "placement-group token-btm1", subtitle: `${sentenceList(ep.bottomIds || [], state.season, false)}, you received the lowest Rate-A-Queen ranking and are in the bottom one.` }));
        els.placementsGrid.innerHTML = cards.filter(Boolean).join("") || `<span class="empty-state">No placements to display.</span>`;
        if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
        return;
      }
      if (ep.specialPremiere === "rate_a_queen_s17_split") {
        cards.push(groupBlock("Top Two", ep.top2Ids || [], state.season, { className: "placement-group token-top2", subtitle: `${sentenceList(ep.top2Ids || [], state.season, false)}, you are the top two queens of the premiere.` }));
        cards.push(groupBlock("Bottom 1", ep.bottomIds || [], state.season, { className: "placement-group token-btm", subtitle: `${sentenceList(ep.bottomIds || [], state.season, false)}, you received the lowest Rate-A-Queen ranking and are in the bottom.` }));
        els.placementsGrid.innerHTML = cards.filter(Boolean).join("") || `<span class="empty-state">No placements to display.</span>`;
        if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
        return;
      }
    }
    if (ep.tournamentBracketId) {
      cards.push(groupBlock("Top Two", ep.top2Ids || [], state.season, { className: "placement-group token-top2", subtitle: `${sentenceList(ep.top2Ids || [], state.season, false)}, you are the top two of the bracket.` }));
      cards.push(groupBlock("Bottom", ep.bottomIds || [], state.season, { className: "placement-group token-bottom", subtitle: `${sentenceList(ep.bottomIds || [], state.season, false)}, I'm sorry my dears, but you're in the bottom.` }));
      els.placementsGrid.innerHTML = cards.filter(Boolean).join("") || `<span class="empty-state">No placements to display.</span>`;
      if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
      return;
    }
    if (isTeamsFormat(state.season) && ep.teamFormatEpisode) {
      cards.push(groupBlock("Winning Pair", ep.winnerIds || [], state.season, { className: "placement-group token-win", subtitle: `${sentenceList(ep.winnerIds || [], state.season, false)}, you are the winning pair of the week.` }));
      if ((ep.highIds || []).length) cards.push(groupBlock("High Pair", ep.highIds || [], state.season, { className: "placement-group token-high" }));
      if ((ep.safeIds || []).length) cards.push(groupBlock("Safe", ep.safeIds || [], state.season, { className: "placement-group token-safe" }));
      if ((ep.lowIds || []).length) cards.push(groupBlock("Low Pair", ep.lowIds || [], state.season, { className: "placement-group token-low" }));
      cards.push(groupBlock(ep.teamTopFourLipSync ? "Bottom Pair" : "Bottom Two Pairs", ep.bottomIds || [], state.season, { className: "placement-group token-bottom", subtitle: ep.teamTopFourLipSync ? `${sentenceList(ep.bottomIds || [], state.season, false)}, you must lip sync against each other.` : `${sentenceList(ep.bottomIds || [], state.season, false)}, your pairs are in the bottom.` }));
      els.placementsGrid.innerHTML = cards.filter(Boolean).join("") || `<span class="empty-state">No placements to display.</span>`;
      if (els.bottomTwoBox) {
        const lipSyncers = ep.teamTopFourLipSync ? (ep.bottomIds || []) : (ep.teamLipSyncInitialIds || []);
        els.bottomTwoBox.innerHTML = lipSyncers.length ? `<p class="team-lipsync-announcement">${escapeHtml(sentenceList(lipSyncers, state.season, false))} will Lip Sync for Their Lives.</p>` : "";
      }
      return;
    }
    const legacyTopTwo = isLegacyFormat(state.season) && ep.top2Ids?.length && ep.bottomIds?.length && !ep.judgedInTeams;
    const topTwoForWin = !ep.bottomIds?.length && ep.top2Ids?.length && !ep.judgedInTeams;
    if (legacyTopTwo || topTwoForWin) {
      cards.push(placementGroup("Top Two", ep.top2Ids || [], "top2"));
      cards.push(placementGroup("High", (ep.highIds || []).filter((id) => !(ep.top2Ids || []).includes(id)), "high"));
    } else {
      if (!ep.judgedInTeams) cards.push(placementGroup("Winner", ep.winnerIds || [], "win"));
      if (!ep.judgedInTeams) cards.push(placementGroup("Top Two", (ep.top2Ids || []).filter((id) => !(ep.winnerIds || []).includes(id)), "top2"));
      if (!ep.judgedInTeams) cards.push(placementGroup("High", ep.highIds || [], "high"));
    }
    if (isGoldenBeaverFormat(state.season) && seasonEliminationFormatApplies(state.season, ep) && ep.goldenBeaverBottomIds?.length) {
      cards.push(groupBlock("Bottom Three", ep.goldenBeaverBottomIds || [], state.season, {
        className: "placement-group token-btm3",
        subtitle: `${sentenceList(ep.goldenBeaverBottomIds || [], state.season, false)}, I'm sorry my dears, but you are the bottom three of the week.`
      }));
    } else {
      cards.push(placementGroup("Low", ep.lowIds || [], "low"));
      cards.push(placementGroup(ep.assassinThreeTeamBottom ? "Bottom Team" : "Bottom", ep.bottomIds || [], "bottom"));
    }
    if (state.config.mode === "rupaul" && ep.winnerIds?.length) {
      const winnerPool = [...new Set([...(ep.winnerIds || []), ...(ep.highIds || []), ...(ep.top2Ids || [])])];
      cards.push(rupaulSelectControl("winner", "RuPaul mode: choose the challenge winner", winnerPool, ep.winnerIds[0]));
    }
    const dangerPool = [...new Set([...(ep.lowIds || []), ...(ep.bottomIds || [])])];
    if (state.config.mode === "rupaul" && dangerPool.length >= 3) cards.push(rupaulSelectControl("save", "RuPaul mode: choose who is saved from the bottom group", dangerPool, (ep.lowIds || [])[0]));
    els.placementsGrid.innerHTML = cards.filter(Boolean).join("") || `<span class="empty-state">No placements to display.</span>`;
    attachRupaulControls(ep);
    if (els.bottomTwoBox) els.bottomTwoBox.innerHTML = "";
  }

  function renderRumocracyPanel(ep) {
    if (!els.rumocracyStack) return;
    if (!isAssassinFormat(state.season) || !ep.rumocracyVotes?.length) {
      els.rumocracyStack.innerHTML = "";
      return;
    }
    els.rumocracyStack.innerHTML = `
      <article class="challenge-card rumocracy-card"><h3>RuMocracy</h3><p>The queens cast their votes for who they want to eliminate from the bottom group.</p></article>
      <div class="mx-vote-grid rumocracy-vote-grid">
        ${ep.rumocracyVotes.map((vote) => `<article class="mx-vote-card ${vote.voterId === (ep.winnerIds || [])[0] ? "is-top-vote" : ""}">${contestantCard(vote.voterId)}<span class="vote-arrow">voted for</span>${contestantCard(vote.votedForId)}</article>`).join("")}
      </div>
    `;
  }

  function renderS17LsfylPanel(ep) {
    if (!els.s17LsfylBoard) return;
    const isMidSeasonRateAQueen = ep?.type === "mid_season_rate_a_queen";
    const survivalLipSyncs = isMidSeasonRateAQueen ? midSeasonRateAQueenBottomLipSyncs(ep) : (["rate_a_queen_s17_split", "uk3"].includes(ep.specialPremiere) ? (ep.extraLipSyncs || []) : []);
    if (!survivalLipSyncs.length) { els.s17LsfylBoard.innerHTML = ""; return; }
    const headingText = isMidSeasonRateAQueen
      ? "The two bottom-one queens from both Talent Show parts now lip sync for their lives."
      : (ep.specialPremiere === "uk3" ? "The bottom two now lip sync for their lives." : "The two lowest-ranked queens from the split premieres now battle to stay.");
    els.s17LsfylBoard.innerHTML = `
      <article class="challenge-card lip-sync-for-life-heading"><h3>Lip Sync for Your Life</h3><p>${escapeHtml(headingText)}</p></article>
      ${survivalLipSyncs.map(renderLipSyncCard).join("")}
    `;
  }

  function renderS17LsfylResultsPanel(ep) {
    if (!els.s17LsfylResultsBoard) return;
    const isMidSeasonRateAQueen = ep?.type === "mid_season_rate_a_queen";
    const survivalLipSyncs = isMidSeasonRateAQueen ? midSeasonRateAQueenBottomLipSyncs(ep) : (["rate_a_queen_s17_split", "uk3"].includes(ep.specialPremiere) ? (ep.extraLipSyncs || []) : []);
    if (!survivalLipSyncs.length) {
      els.s17LsfylResultsBoard.innerHTML = "";
      if (els.s17LsfylCrowningMessage) els.s17LsfylCrowningMessage.innerHTML = "";
      if (els.revealS17LsfylResultsBtn) els.revealS17LsfylResultsBtn.style.display = "none";
      return;
    }
    const revealed = !!ep.s17SurvivalRevealed;
    els.s17LsfylResultsBoard.innerHTML = survivalLipSyncs.map((ls) => renderLipSyncResultBlock(ls, ep, revealed)).join("");
    const resultLine = isMidSeasonRateAQueen ? (ep.midSeasonRateAQueen?.bottomLipSyncResultText || ep.s17SurvivalResultText || "The bottom-one lip sync is complete.") : (ep.s17SurvivalResultText || ep.resultText || "The lip sync is complete.");
    if (els.s17LsfylCrowningMessage) els.s17LsfylCrowningMessage.innerHTML = revealed ? `${escapeHtml(resultLine)}${renderChocolatePanel(ep, revealed)}` : "";
    if (els.revealS17LsfylResultsBtn) els.revealS17LsfylResultsBtn.style.display = revealed ? "none" : "inline-flex";
  }

  function renderLipSyncPanel(ep) {
    if (!els.lipSyncBoard) return;
    if (ep.type === "cunt_test") {
      els.lipSyncBoard.innerHTML = ep.lipSync ? `<article class="challenge-card cunt-test-lip-sync-intro"><h3>Lip Sync For Your Life</h3><p>${escapeHtml(`${sentenceList(ep.lipSync.ids || [], state.season, false)}, this is your last chance to impress me and save yourself from elimination.`)}</p></article>${renderLipSyncCard({ ...ep.lipSync, roundResultText: "", resultTextLine: "" })}` : "";
      return;
    }
    if (ep.type === "special_lalaparuza") {
      els.lipSyncBoard.innerHTML = ep.lipSync ? `<article class="challenge-card"><h3>Final LaLaPaRuZa Lip Sync</h3><p>${escapeHtml(sentenceList(ep.lipSync.ids || [], state.season, false))} face one final lip sync for their lives. The result will be revealed in Results.</p></article>${renderLipSyncCard({ ...ep.lipSync, roundResultText: "" })}` : "";
      return;
    }
    if (["special_slayoffs", "fame_games"].includes(ep.type)) {
      els.lipSyncBoard.innerHTML = ep.lipSync ? renderLipSyncCard(ep.lipSync) : "";
      return;
    }
    if (ep.type === "mid_season_rate_a_queen") {
      els.lipSyncBoard.innerHTML = ep.lipSync ? renderLipSyncCard(ep.lipSync) : "";
      return;
    }
    if (ep.type === "reunion_lalaparuza") {
      els.lipSyncBoard.innerHTML = `<article class="challenge-card"><h3>Reunion Smackdown Complete</h3><p>The Reunion LaLaPaRuZa results are revealed in Results.</p></article>`;
      return;
    }
    if (ep.type === "lsftf") {
      const openingRounds = (ep.extraLipSyncs || []).filter((ls) => ls?.resultType === "lsftf_round");
      els.lipSyncBoard.innerHTML = openingRounds.map((ls) => renderLipSyncCardWithOutcome(ls, ep, true, { forceOutcome: true, className: "lsftf-round-lip-sync" })).join("");
      return;
    }
    if (isAllWinnersFormat(state.season) && ep.allWinnersFinale) {
      els.lipSyncBoard.innerHTML = `<article class="challenge-card"><h3>Finale Smackdowns</h3><p>Proceed to Results for the Queen of She Done Already Done Had Herses lalaparuza, then the Lip Sync for the Crown.</p></article>`;
      return;
    }
    if (ep.comeback?.format === "lalaparuza_comeback") {
      const battles = (ep.extraLipSyncs || []).filter(Boolean);
      els.lipSyncBoard.innerHTML = battles.length
        ? `<div class="lalaparuza-round-list first-sim-lalaparuza-round-list lip-sync-only-lalaparuza-list">${battles.map((ls, index) => `<article class="challenge-card comeback-battle-heading"><h4>Lip Sync #${index + 1}</h4></article>${renderLipSyncCard(ls)}`).join("")}</div>`
        : "";
      return;
    }
    if (ep.comeback?.format === "game_within_a_game") {
      const battles = (ep.extraLipSyncs || []).filter(Boolean);
      els.lipSyncBoard.innerHTML = battles.length
        ? `<div class="lalaparuza-round-list first-sim-gwag-round-list">${battles.map((ls, index) => `<article class="challenge-card comeback-battle-heading gwag-battle-heading"><h4>Lip Sync #${index + 1}</h4><p>${escapeHtml(sentenceList(ls.ids || [], state.season, false))} will compete in a lip sync battle.</p></article>${renderLipSyncCardWithOutcome(ls, ep, true, { forceOutcome: true, className: "gwag-lip-sync-battle" })}`).join("")}</div>`
        : "";
      return;
    }
    const lipSyncs = [ep.lipSync, ...(ep.extraLipSyncs || [])].filter(Boolean);
    if (!lipSyncs.length) { els.lipSyncBoard.innerHTML = ""; return; }
    const assassinLipSync = lipSyncs.find((ls) => ls?.isAssassinLipSync);
    const assassinIntro = assassinLipSync?.assassinId ? `
      <article class="challenge-card assassin-ruveal-card">
        <h3>It's time to ruveal this week's Lip Sync Assassin!</h3>
        <div class="contestant-strip small-strip award-strip">${contestantCard(assassinLipSync.assassinId)}</div>
      </article>
    ` : "";
    if (["rate_a_queen_s17_split", "uk3"].includes(ep.specialPremiere) && ep.extraLipSyncs?.length) {
      els.lipSyncBoard.innerHTML = assassinIntro + (ep.lipSync ? renderLipSyncCard(ep.lipSync) : "");
      return;
    }
    els.lipSyncBoard.innerHTML = assassinIntro + lipSyncs.map(renderLipSyncCard).join("");
  }

  function renderLipSyncCard(lipSync) {
    const song = lipSync.song;
    return `
      <article class="challenge-card lip-sync-card">
        <h4>${escapeHtml(lipSync.context)}</h4>
        <p><strong>${escapeHtml(song.title)}</strong> by ${escapeHtml(song.artist)}</p>
        ${lipSync.shemergencyText?.length ? `<div class="shemergency-alert">${lipSync.shemergencyText.map((text) => escapeHtml(text)).join("<br>")}</div>` : ""}
        <div class="contestant-strip lip-sync-performers lip-sync-row">
          ${lipSync.performances.map((perf) => `
            <article class="mini-contestant-card lip-sync-comment-card token-${escapeHtml(perf.band)}">
              <img class="avatar sqr" src="${escapeHtml(state.season.contestants[perf.id]?.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(state.season.contestants[perf.id]))}">
              <strong>${escapeHtml(fullDisplayName(state.season.contestants[perf.id]))}</strong>
              <span>${escapeHtml(perf.comment)}</span>
            </article>
          `).join("")}
        </div>
        ${lipSync.roundResultText ? `<p class="lip-sync-round-result">${escapeHtml(lipSync.roundResultText)}</p>` : ""}
        ${(lipSync.resultType !== "lalaparuza_final" && ((lipSync.resultType && String(lipSync.resultType).includes("lalaparuza")) || lipSync.context?.toLowerCase?.().includes("lalaparuza"))) ? renderInlineLipSyncOutcome(lipSync) : ""}
      </article>
    `;
  }

  function renderInlineLipSyncOutcome(lipSync) {
    const winners = new Set(lipSyncWinningIds(lipSync, currentEpisode()));
    const eliminated = new Set();
    const losers = new Set();
    if (lipSync.comebackBattle?.activeEliminated && lipSync.comebackBattle?.activeId) eliminated.add(lipSync.comebackBattle.activeId);
    (lipSync.ids || []).forEach((id) => {
      if (id === lipSync.loserId && lipSync.resultType === "elimination") { eliminated.add(id); losers.add(id); }
      else if (eliminated.has(id)) losers.add(id);
      else if (!winners.has(id)) losers.add(id);
    });
    return `<div class="lalaparuza-inline-results contestant-strip small-strip">${(lipSync.ids || []).map((id) => resultContestantCard(id, winners.has(id), losers.has(id), false, eliminated.has(id))).join("")}</div>`;
  }

  function lipSyncTwistSaveLabel(ep, id) {
    if (ep?.chocolateSave && ep?.chocolateOpenedById === id) return "Golden Bar";
    if (ep?.luckyCow?.saved && ep?.luckyCow?.savedId === id) return "Lucky Cow";
    if (ep?.badonkaDunkTank?.saved && ep?.badonkaDunkTank?.contestantId === id) return "Badonka Dunk Tank";
    return "";
  }

  function lipSyncWasSavedByTwist(ep, id) {
    return !!lipSyncTwistSaveLabel(ep, id);
  }

  function lipSyncWinningIds(lipSync, ep = currentEpisode()) {
    if (!lipSync) return [];
    const ids = (lipSync.ids || []).filter(Boolean);
    const explicit = [
      ...(lipSync.tieIds || []),
      ...(lipSync.winnerIds || [])
    ].filter((id) => ids.includes(id));
    if (explicit.length) return [...new Set(explicit)];
    if (lipSync.resultType === "double_shantay") return ids.slice();
    if (lipSync.resultType === "team_pair_elimination") {
      const saved = (ep?.savedIds || []).filter((id) => ids.includes(id));
      if (saved.length) return [...new Set(saved)];
    }
    if (ids.length > 2) {
      const saved = (ep?.savedIds || []).filter((id) => ids.includes(id));
      if (saved.length) return [...new Set(saved)];
    }
    return lipSync.winnerId ? [lipSync.winnerId] : [];
  }

  function lipSyncTwistSavedIds(ep, lipSync) {
    return (lipSync?.ids || []).filter((id) => lipSyncWasSavedByTwist(ep, id));
  }

  function isLipSyncContestantEliminated(ep, lipSync, id) {
    if (!id || lipSyncWasSavedByTwist(ep, id)) return false;
    if ((ep?.eliminatedIds || []).includes(id)) return true;
    return lipSync?.eliminatedId === id;
  }

  function lipSyncNonEliminationText(ep, lipSync) {
    const savedIds = lipSyncTwistSavedIds(ep, lipSync);
    if (!savedIds.length) return "";
    const actualEliminated = (lipSync?.ids || []).filter((id) => isLipSyncContestantEliminated(ep, lipSync, id));
    if (actualEliminated.length) return "";
    const id = savedIds[0];
    const label = lipSyncTwistSaveLabel(ep, id);
    const name = fullDisplayName(state.season.contestants[id] || {});
    return `${name} was saved by the ${label}. This is a non-elimination.`;
  }

  function renderLipSyncResultBlock(lipSync, ep, revealed) {
    const winners = new Set(lipSyncWinningIds(lipSync, ep));
    const losers = new Set();
    if (lipSync.resultType === "double_sashay") (lipSync.ids || []).forEach((id) => { if (!lipSyncWasSavedByTwist(ep, id)) losers.add(id); });
    else {
      if (lipSync.resultType === "kitty_girl_groups" && ep?.kitty?.winSide === "eliminated" && lipSync.loserId && !lipSyncWasSavedByTwist(ep, lipSync.loserId)) losers.add(lipSync.loserId);
      if (lipSync.resultType === "team_pair_elimination") {
        (ep.savedIds || []).forEach((id) => winners.add(id));
        (ep.eliminatedIds || []).forEach((id) => losers.add(id));
      } else {
        (lipSync.ids || []).forEach((id) => { if (isLipSyncContestantEliminated(ep, lipSync, id)) losers.add(id); });
        if (lipSync.loserId && !winners.has(lipSync.loserId) && !isForTheWinLipSync(lipSync, ep) && !lipSyncWasSavedByTwist(ep, lipSync.loserId)) losers.add(lipSync.loserId);
      }
    }
    const nonEliminationText = lipSyncNonEliminationText(ep, lipSync);
    return `
      <div class="contestant-strip small-strip lip-sync-result-row">
        ${(lipSync.ids || []).map((id) => resultContestantCard(id, revealed && winners.has(id), revealed && losers.has(id), false, revealed && isLipSyncContestantEliminated(ep, lipSync, id))).join("")}
      </div>
      ${revealed && nonEliminationText ? `<p class="lip-sync-outcome-line">${escapeHtml(nonEliminationText)}</p>` : ""}
    `;
  }

  function allStarsEliminationChoiceId(ep) {
    return ep.legacyEliminationChoiceId || ep.assassinEliminationChoiceId || ep.chocolateOpenedById || (ep.eliminatedIds || [])[0] || null;
  }

  function renderAllStarsEliminationReveal(ep, lipSync, revealed) {
    if (ep?.unplannedExit?.token === "WIN_QUIT") {
      return `<article class="all-stars-elimination-reveal challenge-card"><p class="announcement-line">No lipstick is used this week. The lip sync winner has withdrawn, so every bottom contestant remains in the competition.</p></article>`;
    }
    const choiceId = allStarsEliminationChoiceId(ep);
    const winnerId = lipSync?.winnerId || (ep.winnerIds || [])[0];
    const winner = state.season.contestants[winnerId] || {};
    const assassinWon = !!state.season.contestants[winnerId]?.isAssassin;
    const prompt = lipSync?.isAssassinLipSync && assassinWon
      ? "Who has the group chosen to get the chop?"
      : `${fullDisplayName(winner)}, you're a winner baby! With great power comes great responsibility... Who have you chosen to get the chop?`;
    const bottomIds = (ep.bottomIds || []).slice();
    const bottomCards = bottomIds.map((id) => resultContestantCard(id, false, revealed && id !== choiceId, false, revealed && id === choiceId)).join("");
    const revealButton = !revealed ? `<button class="primary-btn show-eliminated-btn" type="button">Show Eliminated</button>` : "";
    const finalText = revealed && choiceId ? `<p class="all-stars-sashay-line">${escapeHtml(`${fullDisplayName(state.season.contestants[choiceId])}, as it is written, so it shall be done... Sashay Away.`)}</p>` : "";
    return `
      <article class="all-stars-elimination-reveal challenge-card">
        <p class="announcement-line">${escapeHtml(prompt)}</p>
        <div class="contestant-strip small-strip all-stars-bottoms">${bottomCards || `<span class="empty-state">No bottom contestants.</span>`}</div>
        <div class="center-actions">${revealButton}</div>
        ${finalText}
      </article>
    `;
  }


  function renderAllWinnersBlockReveal(ep, revealed) {
    if (!isAllWinnersFormat(state.season) || !ep.allWinnersBlockAllowed || !ep.allWinnersBlockTargetId || !ep.lipSync?.winnerId) return "";
    const winnerId = ep.lipSync.winnerId;
    const targetId = ep.allWinnersBlockTargetId;
    const blockRevealed = !!ep.allWinnersBlockRevealed;
    return `
      <article class="all-winners-block-reveal challenge-card">
        <p class="announcement-line">${escapeHtml(`${fullDisplayName(state.season.contestants[winnerId])}, heavy is the hand that holds the plunger. Who have you chosen to block from getting a Legendary Legend Star next week?`)}</p>
        <div class="contestant-strip small-strip award-strip">${contestantCard(winnerId)}</div>
        <div class="center-actions">${blockRevealed ? "" : `<button class="primary-btn reveal-block-btn" type="button">Reveal Block</button>`}</div>
        ${blockRevealed ? `<div class="contestant-strip small-strip all-winners-block-target">${contestantCard(targetId, "Blocked", { className: "is-blocked" })}</div><p class="announcement-line block-line">${escapeHtml(`${fullDisplayName(state.season.contestants[targetId])} has been blocked.`)}</p>` : ""}
      </article>
    `;
  }

  function renderAllWinnersFinalistsReveal(ep, revealed) {
    if (!isAllWinnersFormat(state.season) || !ep.allWinnersFinalistIds?.length || !revealed) return "";
    const counts = ep.allWinnersStarCountsSnapshot || state.season.allWinnersStarCounts || {};
    const rows = state.season.castOrder.slice().sort((a, b) => Number(counts[b] || 0) - Number(counts[a] || 0)).map((id) => `
      <tr class="${ep.allWinnersFinalistIds.includes(id) ? "is-finalist" : ""}"><td>${statContestantInline(id)}</td><td>${escapeHtml(Number(counts[id] || 0))}</td></tr>
    `).join("");
    return `
      <article class="challenge-card all-winners-finalists-card">
        <h3>Finalists</h3>
        <p>The four contestants with the most Legendary Legend Stars advance to the finale.</p>
        ${ep.allWinnersFinalistTieText ? `<p>${escapeHtml(ep.allWinnersFinalistTieText)}</p>` : ""}
        <div class="contestant-strip small-strip award-strip finalist-strip">${ep.allWinnersFinalistIds.map((id) => contestantCard(id, `${Number(counts[id] || 0)} Stars`)).join("")}</div>
        <div class="stat-table-shell compact-star-table"><table class="stats-table modern-stat-table star-count-summary"><thead><tr><th>Contestant</th><th>Stars</th></tr></thead><tbody>${rows}</tbody></table></div>
      </article>
    `;
  }

  function renderLipSyncCardWithOutcome(lipSync, ep, revealed, options = {}) {
    if (!lipSync) return "";
    const showOutcome = options.forceOutcome || revealed;
    const winners = new Set(showOutcome ? lipSyncWinningIds(lipSync, ep) : []);
    const losers = new Set();
    if (showOutcome) (lipSync.ids || []).forEach((id) => { if (!winners.has(id)) losers.add(id); });
    return `
      <article class="challenge-card lip-sync-card ${options.className || ""}">
        <h4>${escapeHtml(lipSync.context)}</h4>
        <p><strong>${escapeHtml(lipSync.song.title)}</strong> by ${escapeHtml(lipSync.song.artist)}</p>
        <div class="contestant-strip lip-sync-performers lip-sync-row">
          ${lipSync.performances.map((perf) => `
            <article class="mini-contestant-card lip-sync-comment-card token-${escapeHtml(perf.band)}">
              <img class="avatar sqr" src="${escapeHtml(state.season.contestants[perf.id]?.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(state.season.contestants[perf.id]))}">
              <strong>${escapeHtml(fullDisplayName(state.season.contestants[perf.id]))}</strong>
              <span>${escapeHtml(perf.comment)}</span>
            </article>
          `).join("")}
        </div>
        <div class="lalaparuza-inline-results contestant-strip small-strip">
          ${(lipSync.ids || []).map((id) => resultContestantCard(id, winners.has(id), losers.has(id), !!options.finalCrowning && winners.has(id))).join("")}
        </div>
        ${showOutcome && lipSync.roundResultText ? `<p class="lip-sync-outcome-line">${escapeHtml(lipSync.roundResultText)}</p>` : ""}
      </article>
    `;
  }

  function renderQoSDADHHSection(ep) {
    const smackdown = ep.allWinnersHersesSmackdown || { lipSyncs: [], winnerId: ep.allWinnersQueenOfHersesId };
    const lipSyncs = smackdown.lipSyncs || [];
    const winnerId = smackdown.winnerId || ep.allWinnersQueenOfHersesId;
    const revealed = !!ep.allWinnersHersesRevealed;
    const finalLipSync = smackdown.finalLipSync || lipSyncs.at(-1) || null;
    if (!lipSyncs.length) {
      return `
        <section class="all-winners-finale-section qosdadhh-section">
          <article class="challenge-card"><h3>Queen of She Done Already Done Had Herses</h3><p>No parallel lalaparuza was needed.</p></article>
        </section>
      `;
    }
    const cards = lipSyncs.map((ls) => {
      if (ls === finalLipSync) {
        return `
          ${renderLipSyncCardWithOutcome(ls, ep, revealed, { finalCrowning: true, className: "qosdadhh-final-lip-sync" })}
          <div class="center-actions qosdadhh-reveal-actions">
            ${revealed ? "" : `<button class="primary-btn reveal-herses-winner-btn" type="button">Reveal Winner</button>`}
          </div>
          ${revealed && winnerId ? `<p class="crowning-message qosdadhh-winner-line">${escapeHtml(`${fullDisplayName(state.season.contestants[winnerId])}, condragulations! You've done already done had yourses!`)}</p>` : ""}
        `;
      }
      return renderLipSyncCardWithOutcome(ls, ep, true, { className: "qosdadhh-round-lip-sync" });
    }).join("");
    return `
      <section class="all-winners-finale-section qosdadhh-section">
        <article class="challenge-card finale-section-intro">
          <h3>Queen of She Done Already Done Had Herses</h3>
          <p>The non-finalists compete in a parallel lip sync lalaparuza before the crown bracket.</p>
        </article>
        ${cards}
      </section>
    `;
  }

  function allWinnersCrownParts(ep) {
    const crown = ep.allWinnersCrownSmackdown || { lipSyncs: [ep.lipSync].filter(Boolean), winnerId: ep.winnerIds?.[0] };
    const lipSyncs = crown.lipSyncs || [];
    const finalLipSync = crown.finalLipSync || ep.lipSync || lipSyncs.at(-1) || null;
    const openingRounds = lipSyncs.filter((ls) => ls && ls !== finalLipSync);
    return { crown, lipSyncs, finalLipSync, openingRounds };
  }

  function renderAllWinnersCrownOpeningSection(ep) {
    const { openingRounds } = allWinnersCrownParts(ep);
    const openingCards = openingRounds.length
      ? openingRounds.map((ls) => renderLipSyncCardWithOutcome(ls, ep, true, { className: "lsftc-round-lip-sync" })).join("")
      : `<article class="event-card"><p>The finalists advance directly to the final lip sync.</p></article>`;
    return `
      <section class="all-winners-finale-section lsftc-section">
        <article class="challenge-card finale-section-intro">
          <h3>Lip Sync for The Crown</h3>
          <p>The first two lip syncs determine who advances to the final lip sync.</p>
        </article>
        ${openingCards}
      </section>
    `;
  }

  function renderAllWinnersWinnerSection(ep, revealed) {
    const { finalLipSync } = allWinnersCrownParts(ep);
    const finalCard = finalLipSync
      ? renderLipSyncCardWithOutcome(finalLipSync, ep, revealed, { finalCrowning: true, className: "lsftc-final-lip-sync" })
      : `<article class="event-card"><p>No final lip sync was needed.</p></article>`;
    return `
      <section class="all-winners-finale-section crown-section">
        <article class="challenge-card finale-section-intro">
          <h3>Winner</h3>
          <p>The final lip sync decides the All Winners champion.</p>
        </article>
        ${finalCard}
      </section>
    `;
  }

  function renderAllWinnersCrownSection(ep, revealed) {
    return [renderAllWinnersCrownOpeningSection(ep), renderAllWinnersWinnerSection(ep, revealed)].join("");
  }

  function renderAllWinnersFinaleResults(ep, revealed) {
    return [
      renderQoSDADHHSection(ep),
      renderAllWinnersCrownOpeningSection(ep),
      renderAllWinnersWinnerSection(ep, revealed)
    ].join("");
  }

  function renderAllWinnersFinalePanels(ep) {
    const useCrownPanels = (isAllWinnersFormat(state.season) && ep?.allWinnersFinale) || ep?.lsftcFinale;
    if (!useCrownPanels) {
      if (els.qosdadhhBoard) els.qosdadhhBoard.innerHTML = "";
      if (els.lsftcBoard) els.lsftcBoard.innerHTML = "";
      if (els.winnerBoard) els.winnerBoard.innerHTML = "";
      if (els.winnerCrowningMessage) els.winnerCrowningMessage.innerHTML = "";
      if (els.revealCrownWinnerBtn) els.revealCrownWinnerBtn.style.display = "none";
      return;
    }
    const revealed = !!ep.resultsRevealed;
    if (els.qosdadhhBoard) els.qosdadhhBoard.innerHTML = (isAllWinnersFormat(state.season) && ep?.allWinnersFinale) ? renderQoSDADHHSection(ep) : "";
    if (els.lsftcBoard) els.lsftcBoard.innerHTML = renderAllWinnersCrownOpeningSection(ep);
    if (els.winnerBoard) els.winnerBoard.innerHTML = renderAllWinnersWinnerSection(ep, revealed);
    if (els.winnerCrowningMessage) {
      const winners = sentenceList(ep.winnerIds || [], state.season, false);
      const crownText = isAllWinnersFormat(state.season) ? `The All Winners champion is... ${winners}!` : `The Next Drag Superstar is... ${winners}!`;
      els.winnerCrowningMessage.innerHTML = revealed ? escapeHtml(crownText) : "";
    }
    if (els.revealCrownWinnerBtn) els.revealCrownWinnerBtn.style.display = revealed ? "none" : "inline-flex";
    $all(".reveal-herses-winner-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.allWinnersHersesRevealed = true;
      saveState();
      renderAllWinnersFinalePanels(ep);
    }));
  }

  function renderJuryFinaleResults(ep, revealed) {
    const finalists = ep.activeStartIds || state.season.activeIds || [];
    const top2 = ep.top2Ids || [];
    const voteRows = (ep.juryBallots || []).map((ballot) => {
      const juror = state.season.contestants[ballot.jurorId] || { id: ballot.jurorId };
      return `
        <article class="event-card jury-ballot-card">
          <div class="jury-voter">${contestantCard(ballot.jurorId, "", { nick: true })}</div>
          <div class="jury-vote-picks">
            <span><strong>2</strong> ${ballot.firstId ? contestantCard(ballot.firstId, "", { nick: true }) : "—"}</span>
            <span><strong>1</strong> ${ballot.secondId ? contestantCard(ballot.secondId, "", { nick: true }) : "—"}</span>
          </div>
        </article>`;
    }).join("");
    const totals = finalists.slice().sort((a, b) => Number(ep.juryVotes?.[b] || 0) - Number(ep.juryVotes?.[a] || 0) || finaleScore(state.season, b) - finaleScore(state.season, a));
    return `
      <section class="jury-finale-results">
        <article class="challenge-card finale-section-intro"><h3>Jury Vote</h3></article>
        <div class="jury-ballot-grid">${voteRows || `<article class="event-card"><p>No jurors voted.</p></article>`}</div>
        <div class="jury-score-grid">
          ${totals.map((id) => `<article class="placement-card jury-score-card ${top2.includes(id) ? "is-winner" : ""}">${contestantCard(id, "", { nick: true })}<strong>${Number(ep.juryVotes?.[id] || 0)} point${Number(ep.juryVotes?.[id] || 0) === 1 ? "" : "s"}</strong></article>`).join("")}
        </div>
        <article class="event-card jury-top-two-announcement"><p>${escapeHtml(sentenceList(top2, state.season, false))}, condragulations, you are the top two of the season.</p></article>
        ${revealed ? `<div class="contestant-strip small-strip lip-sync-result-row finale-result-row">${top2.map((id) => resultContestantCard(id, ep.winnerIds?.includes(id), !ep.winnerIds?.includes(id), true)).join("")}</div>` : ""}
      </section>
    `;
  }

  function renderKittyGirlGroupsResults(ep, revealed) {
    const kitty = ep.kitty || {};
    const lipSync = ep.lipSync || null;
    const activeSideWins = kitty.winSide === "remaining";
    const winnerId = lipSync?.winnerId || (ep.winnerIds || [])[0] || null;
    const returneeId = kitty.returnedId || ep.comeback?.returnedId || (ep.returnedIds || [])[0] || null;
    const eliminatedId = kitty.eliminatedId || (ep.eliminatedIds || [])[0] || null;
    const returnRevealed = !!ep.kittyReturnRevealed;
    const chopRevealed = !!ep.kittyEliminationRevealed;
    const pieces = [];

    pieces.push(lipSync ? renderLipSyncResultBlock(lipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The Kitty Girl Groups lip sync is complete.")}</p></article>`);
    if (!revealed) return pieces.join("");

    if (activeSideWins) {
      pieces.push(`
        <article class="challenge-card kitty-choice-reveal-card kitty-return-choice-card">
          <p class="announcement-line">${escapeHtml("Who have you chosen to return to the competition?")}</p>
          ${winnerId ? `<div class="contestant-strip small-strip award-strip kitty-choice-winner">${contestantCard(winnerId)}</div>` : ""}
          <div class="center-actions">${returnRevealed ? "" : `<button class="primary-btn kitty-reveal-return-btn" type="button">Reveal Returning Queen</button>`}</div>
          ${returnRevealed && returneeId ? `<div class="contestant-strip small-strip award-strip kitty-returnee-strip">${resultContestantCard(returneeId, true, false, false, false)}</div><p class="lip-sync-outcome-line">${escapeHtml(`${fullDisplayName(state.season.contestants[returneeId])}, you're back in the race, baby!`)}</p>` : ""}
        </article>
      `);
      if (returnRevealed) {
        pieces.push(`
          <article class="challenge-card kitty-choice-reveal-card kitty-chop-choice-card">
            <p class="announcement-line">${escapeHtml("Who have you chosen to get the chop?")}</p>
            <div class="contestant-strip small-strip kitty-bottom-choice-row">${(kitty.bottomPool || ep.bottomIds || []).map((id) => resultContestantCard(id, false, chopRevealed && id !== eliminatedId, false, chopRevealed && id === eliminatedId)).join("")}</div>
            <div class="center-actions">${chopRevealed ? "" : `<button class="primary-btn kitty-reveal-chop-btn" type="button">Reveal Eliminated Queen</button>`}</div>
            ${chopRevealed && eliminatedId ? `<p class="all-stars-sashay-line">${escapeHtml(`${fullDisplayName(state.season.contestants[eliminatedId])}, sashay away.`)}</p>` : ""}
          </article>
        `);
      }
    } else {
      pieces.push(`
        <article class="challenge-card kitty-choice-reveal-card kitty-return-choice-card">
          <p class="announcement-line">${escapeHtml("The eliminated contestants have won the challenge.")}</p>
          ${returneeId ? `<div class="contestant-strip small-strip award-strip kitty-returnee-strip">${resultContestantCard(returneeId, true, false, false, false)}</div><p class="lip-sync-outcome-line">${escapeHtml(`${fullDisplayName(state.season.contestants[returneeId])}, you're back in the race, baby!`)}</p>` : ""}
        </article>
        <article class="challenge-card kitty-choice-reveal-card kitty-chop-choice-card">
          <p class="announcement-line">${escapeHtml("Who have you chosen to get the chop?")}</p>
          <div class="contestant-strip small-strip kitty-bottom-choice-row">${(kitty.bottomGroup || ep.bottomIds || []).map((id) => resultContestantCard(id, false, chopRevealed && id !== eliminatedId, false, chopRevealed && id === eliminatedId)).join("")}</div>
          <div class="center-actions">${chopRevealed ? "" : `<button class="primary-btn kitty-reveal-chop-btn" type="button">Reveal Eliminated Queen</button>`}</div>
          ${chopRevealed && eliminatedId ? `<p class="all-stars-sashay-line">${escapeHtml(`${fullDisplayName(state.season.contestants[eliminatedId])}, sashay away.`)}</p>` : ""}
        </article>
      `);
    }

    return pieces.join("");
  }

  function renderResultsPanel(ep) {
    const revealed = !!ep.resultsRevealed;
    const eliminatedRevealed = !!ep.eliminationRevealed;
    const primaryLipSync = ep.lipSync || null;
    const isAllStarsElimination = !!(primaryLipSync && (primaryLipSync.isAssassinLipSync || ep.legacyLipsticks?.length));
    if (els.resultsSectionTitle) els.resultsSectionTitle.textContent = ep.type === "finale" ? (((isAllWinnersFormat(state.season) && ep.allWinnersFinale) || ep.lsftcFinale) ? "Lip Sync for The Crown" : "Winner Announcement") : ep.type === "cunt_test" ? "Results" : ep.type === "lsftf" ? "Final Lip Sync" : ep.allWinnersFinalistIds?.length ? "Finalists" : ep.allWinnersEpisode ? "Lip Sync For Your Legacy Results" : ep.specialPremiere === "late_entry" ? "A New Contestant" : ep.specialPremiere === "uk3" ? "Lip Sync Results" : primaryLipSync?.isAssassinLipSync ? "Lip Sync Assassin Results" : ep.legacyLipsticks?.length ? "Lip Sync For Your Legacy Results" : ep.type === "mid_season_rate_a_queen" ? "Lip Sync for The Win Results" : "Lip Sync Results";
    if (els.revealBoard) {
      const lipSyncs = [ep.lipSync, ...(ep.extraLipSyncs || [])].filter(Boolean);
      if (ep.type === "finale") {
        if ((isAllWinnersFormat(state.season) && ep.allWinnersFinale) || ep.lsftcFinale) {
          const finalLipSync = allWinnersCrownParts(ep).finalLipSync || ep.lipSync || null;
          els.revealBoard.innerHTML = finalLipSync
            ? renderLipSyncResultBlock(finalLipSync, ep, revealed)
            : `<div class="contestant-strip small-strip lip-sync-result-row finale-result-row">${(ep.activeStartIds || []).map((id) => resultContestantCard(id, revealed && ep.winnerIds?.includes(id), revealed && !ep.winnerIds?.includes(id), true)).join("")}</div>`;
        } else {
          const finalDisplayIds = (ep.top2Ids && ep.top2Ids.length === 2) ? ep.top2Ids : ((ep.activeStartIds || state.season.activeIds || []).length ? (ep.activeStartIds || state.season.activeIds) : state.season.activeIds);
          els.revealBoard.innerHTML = `<div class="contestant-strip small-strip lip-sync-result-row finale-result-row">${finalDisplayIds.map((id) => resultContestantCard(id, revealed && ep.winnerIds?.includes(id), revealed && !ep.winnerIds?.includes(id), true)).join("")}</div>`;
        }
      } else if (ep.specialPremiere === "late_entry" && ep.lateEntryRevealId) {
        els.revealBoard.innerHTML = `
          <article class="event-card late-entry-results"><p>I have someone else I want to add to the competition... Welcome a new contestant...</p></article>
          <div class="contestant-strip small-strip award-strip">${contestantCard(ep.lateEntryRevealId)}</div>
        `;
      } else if (ep.type === "special_lalaparuza") {
        els.revealBoard.innerHTML = ep.lipSync ? renderLipSyncResultBlock(ep.lipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The LaLaPaRuZa is complete.")}</p></article>`;
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The LaLaPaRuZa is complete.") : "";
      } else if (ep.type === "special_slayoffs") {
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The Slay-Offs are complete.") : "";
      } else if (ep.type === "reunion_lalaparuza") {
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The Reunion LaLaPaRuZa is complete.") : "";
      } else if (ep.type === "fame_games") {
        els.crowningMessage.innerHTML = revealed ? `${escapeHtml(ep.resultText || "The Fame Games lip sync is complete.")}${renderFameGamesWheel(ep)}` : "";
      } else if (ep.type === "mid_season_rate_a_queen") {
        els.revealBoard.innerHTML = ep.lipSync ? renderLipSyncResultBlock(ep.lipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.topLipSyncResultText || "The Lip Sync for The Win is complete.")}</p></article>`;
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.topLipSyncResultText || ep.lipSync?.resultTextLine || "The Lip Sync for The Win is complete.") : "";
      } else if (ep.type === "cunt_test") {
        els.revealBoard.innerHTML = ep.lipSync ? renderLipSyncResultBlock(ep.lipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The C.U.N.T.-test is complete.")}</p></article>`;
      } else if (ep.type === "lsftf") {
        const finalLipSync = (ep.extraLipSyncs || []).find((ls) => ls?.resultType === "lsftf_final") || (ep.extraLipSyncs || []).at(-1);
        els.revealBoard.innerHTML = finalLipSync ? renderLipSyncResultBlock(finalLipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The lip sync for the finale is complete.")}</p></article>`;
      } else if (ep.specialPremiere === "uk3" && ep.extraLipSyncs?.length) {
        els.revealBoard.innerHTML = primaryLipSync ? renderLipSyncResultBlock(primaryLipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The top lip sync is complete.")}</p></article>`;
      } else if (ep.specialPremiere === "uk3" && lipSyncs.length) {
        els.revealBoard.innerHTML = lipSyncs.map((ls) => renderLipSyncResultBlock(ls, ep, revealed)).join("");
      } else if (ep.specialPremiere === "rate_a_queen_s17_split" && ep.extraLipSyncs?.length) {
        els.revealBoard.innerHTML = primaryLipSync ? renderLipSyncResultBlock(primaryLipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The Top 2 lip sync is complete.")}</p></article>`;
      } else if (isAllWinnersFormat(state.season) && ep.allWinnersEpisode) {
        els.revealBoard.innerHTML = [
          lipSyncs.length ? lipSyncs.map((ls) => renderLipSyncResultBlock(ls, ep, revealed)).join("") : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The episode ends with no elimination.")}</p></article>`,
          revealed ? renderAllWinnersBlockReveal(ep, revealed) : "",
          renderAllWinnersFinalistsReveal(ep, revealed)
        ].join("");
      } else if (isAllStarsElimination) {
        els.revealBoard.innerHTML = [
          renderLipSyncResultBlock(primaryLipSync, ep, revealed),
          revealed ? renderAllStarsEliminationReveal(ep, primaryLipSync, eliminatedRevealed) : ""
        ].join("");
      } else if (ep.comeback?.format === "lalaparuza_comeback" && (ep.extraLipSyncs || []).length) {
        els.revealBoard.innerHTML = renderLalaparuzaComebackResults(ep, revealed);
      } else if (ep.comeback?.format === "game_within_a_game") {
        els.revealBoard.innerHTML = "";
        if (els.crowningMessage) els.crowningMessage.innerHTML = "";
      } else if (ep.comeback?.format === "attention_girl_groups" && primaryLipSync) {
        els.revealBoard.innerHTML = renderLipSyncResultBlock(primaryLipSync, ep, revealed);
      } else if (ep.comeback?.format === "kitty_girl_groups" && primaryLipSync) {
        els.revealBoard.innerHTML = renderKittyGirlGroupsResults(ep, revealed);
      } else if (ep.comeback?.format === "revenge_of_the_queens" && primaryLipSync) {
        els.revealBoard.innerHTML = renderRevengeOfTheQueensResults(ep, revealed);
      } else if (lipSyncs.length) {
        const ids = [...new Set(lipSyncs.flatMap((ls) => ls.ids || []))];
        const winners = new Set();
        const losers = new Set();
        const nonEliminationLines = [];
        lipSyncs.forEach((ls) => {
          if (ls.resultType === "double_sashay") { (ls.ids || []).forEach((id) => { if (!lipSyncWasSavedByTwist(ep, id)) losers.add(id); }); return; }
          if (ls.resultType === "double_shantay") { (ls.ids || []).forEach((id) => winners.add(id)); return; }
          if (ls.resultType === "team_pair_elimination") {
            (ep.savedIds || []).forEach((id) => winners.add(id));
            (ep.eliminatedIds || []).forEach((id) => losers.add(id));
            return;
          }
          lipSyncWinningIds(ls, ep).forEach((id) => winners.add(id));
          (ls.ids || []).forEach((id) => { if (isLipSyncContestantEliminated(ep, ls, id)) losers.add(id); });
          if (ls.loserId && !winners.has(ls.loserId) && !(ep.eliminatedIds || []).length && !lipSyncWasSavedByTwist(ep, ls.loserId)) losers.add(ls.loserId);
          const saveLine = lipSyncNonEliminationText(ep, ls);
          if (saveLine) nonEliminationLines.push(saveLine);
        });
        const nonEliminationHtml = revealed && nonEliminationLines.length ? `<p class="lip-sync-outcome-line">${escapeHtml(nonEliminationLines.join(" "))}</p>` : "";
        els.revealBoard.innerHTML = `<div class="contestant-strip small-strip lip-sync-result-row">${ids.map((id) => resultContestantCard(id, revealed && winners.has(id), revealed && losers.has(id), false, revealed && lipSyncs.some((ls) => isLipSyncContestantEliminated(ep, ls, id)))).join("")}</div>${nonEliminationHtml}`;
      } else {
        els.revealBoard.innerHTML = `<article class="event-card"><p>${escapeHtml(ep.resultText || "The episode ends with no elimination.")}</p></article>`;
      }
    }
    if (els.crowningMessage) {
      if (ep.type === "finale") {
        const winners = sentenceList(ep.winnerIds || [], state.season, false);
        if ((isAllWinnersFormat(state.season) && ep.allWinnersFinale) || ep.lsftcFinale) {
          const crownText = isAllWinnersFormat(state.season) ? `The All Winners champion is... ${winners}!` : `The Next Drag Superstar is... ${winners}!`;
          els.crowningMessage.innerHTML = revealed ? `${escapeHtml(crownText)}` : "";
        } else {
          els.crowningMessage.innerHTML = revealed ? `${escapeHtml(`The Next Drag Superstar is... ${winners}!`)}` : "";
        }
      } else if (ep.type === "special_lalaparuza") {
        els.revealBoard.innerHTML = ep.lipSync ? renderLipSyncResultBlock(ep.lipSync, ep, revealed) : `<article class="event-card"><p>${escapeHtml(ep.resultText || "The LaLaPaRuZa is complete.")}</p></article>`;
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The LaLaPaRuZa is complete.") : "";
      } else if (ep.type === "special_slayoffs") {
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The Slay-Offs are complete.") : "";
      } else if (ep.type === "reunion_lalaparuza") {
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The Reunion LaLaPaRuZa is complete.") : "";
      } else if (ep.type === "fame_games") {
        els.crowningMessage.innerHTML = revealed ? `${escapeHtml(ep.resultText || "The Fame Games lip sync is complete.")}${renderFameGamesWheel(ep)}` : "";
      } else if (ep.type === "mid_season_rate_a_queen") {
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.topLipSyncResultText || ep.lipSync?.resultTextLine || "The Lip Sync for The Win is complete.") : "";
      } else if (ep.type === "cunt_test") {
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The C.U.N.T.-test is complete.") : "";
      } else if (ep.type === "lsftf") {
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The lip sync for the finale is complete.") : "";
      } else if (isAllWinnersFormat(state.season) && ep.allWinnersEpisode) {
        els.crowningMessage.innerHTML = revealed ? escapeHtml(ep.resultText || "The episode ends with no elimination.") : "";
      } else if (["attention_girl_groups", "kitty_girl_groups", "revenge_of_the_queens", "lalaparuza_comeback"].includes(ep.comeback?.format)) {
        els.crowningMessage.innerHTML = "";
      } else if (isAllStarsElimination) {
        els.crowningMessage.innerHTML = eliminatedRevealed ? renderChocolatePanel(ep, eliminatedRevealed) : "";
      } else {
        els.crowningMessage.innerHTML = revealed ? `${escapeHtml(ep.resultText || "The episode ends with no elimination.")}${(["rate_a_queen_s17_split", "uk3"].includes(ep.specialPremiere) && ep.extraLipSyncs?.length) ? "" : renderChocolatePanel(ep, revealed)}${renderLuckyCowReveal(ep, revealed)}` : "";
      }
    }
    renderUnplannedExitResult(ep);
    if (state.config.mode === "rupaul" && ep.lipSync?.ids?.length && els.revealBoard) {
      els.revealBoard.insertAdjacentHTML("beforeend", rupaulSelectControl("lipSyncWinner", "RuPaul mode: choose the lip sync winner", ep.lipSync.ids, ep.lipSync.winnerId));
      attachRupaulControls(ep);
    }
    if (els.revealResultsBtn) els.revealResultsBtn.style.display = revealed ? "none" : "inline-flex";
    $all(".show-eliminated-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.eliminationRevealed = true;
      saveState();
      renderResultsPanel(ep);
    }));
    $all(".kitty-reveal-return-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.kittyReturnRevealed = true;
      saveState();
      renderResultsPanel(ep);
    }));
    $all(".kitty-reveal-chop-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.kittyEliminationRevealed = true;
      saveState();
      renderResultsPanel(ep);
    }));
    $all(".revenge-reveal-chop-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.revengeChopRevealed = true;
      saveState();
      renderResultsPanel(ep);
    }));
    $all(".open-chocolate-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.chocolateRevealed = true;
      saveState();
      renderResultsPanel(ep);
    }));
    $all(".reveal-lucky-cow-btn").forEach((btn) => btn.addEventListener("click", () => {
      if (ep.luckyCow) ep.luckyCow.revealed = true;
      saveState();
      renderResultsPanel(ep);
    }));
    $all(".spin-fame-wheel-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.fameGamesWheelSpun = true;
      saveState();
      renderResultsPanel(ep);
    }));
    $all(".reveal-block-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.allWinnersBlockRevealed = true;
      saveState();
      renderResultsPanel(ep);
    }));
    $all(".reveal-herses-winner-btn").forEach((btn) => btn.addEventListener("click", () => {
      ep.allWinnersHersesRevealed = true;
      saveState();
      renderResultsPanel(ep);
    }));
  }

  function renderChocolatePanel(ep, revealed) {
    if (!revealed || !ep.chocolateOpenedById) return "";
    const id = ep.chocolateOpenedById;
    const item = state.season.contestants[id] || {};
    const opened = !!ep.chocolateRevealed;
    return `
      <article class="chocolate-panel ${opened ? (ep.chocolateSave ? "is-golden" : "is-plain") : ""}">
        <div class="contestant-strip small-strip">
          <article class="mini-contestant-card chocolate-card ${opened ? (ep.chocolateSave ? "is-golden" : "is-plain") : ""}">
            <img class="avatar sqr" src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(item))}">
            <strong>${escapeHtml(fullDisplayName(item))}</strong>
          </article>
        </div>
        <p>${escapeHtml(fullDisplayName(item))}, now your fate lies in the hands of Drag Gods. If your chocolate bar is golden, you'll re-enter the competition.</p>
        ${opened ? `<strong>${ep.chocolateSave ? "It's chocolate... and it's GOLD!" : "It's chocolate."}</strong>` : `<button class="primary-btn open-chocolate-btn" type="button">Open Chocolate Bar</button>`}
      </article>
    `;
  }

  function resultContestantCard(id, isWinner, isLoser, isFinale = false, isEliminated = false) {
    const item = state.season.contestants[id] || {};
    return `
      <article class="reveal-card result-card ${isWinner ? "is-winner" : ""} ${isLoser ? "is-loser" : ""} ${isEliminated ? "is-eliminated" : ""} ${isFinale && isWinner ? "is-crowned" : ""}">
        <img class="avatar sqr" src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(item))}">
        <strong>${escapeHtml(fullDisplayName(item))}</strong>
      </article>
    `;
  }


  function renderFameGamesWheel(ep) {
    if (ep?.type !== "fame_games" || !ep.fameGamesMultiplierId) return "";
    const multiplier = Number(ep.fameGamesMultiplier || 1);
    const spun = !!ep.fameGamesWheelSpun;
    return `<article class="fame-games-wheel-panel ${spun ? "is-spun" : ""}"><h3>The Fame Games Wheel</h3><div class="fame-wheel" style="--fame-spin: ${multiplier === 2 ? 720 : multiplier === 3 ? 840 : 960}deg"><span>x2</span><span>x3</span><span>x4</span></div>${spun ? `<article class="event-card fame-games-advantage-box"><p>${escapeHtml(ep.fameGamesAdvantageText || `${fullDisplayName(state.season.contestants[ep.fameGamesMultiplierId] || {})}, you'll receive an advantage for the Fame Games in the form of your votes being multiplied by ${multiplier}.`)}</p></article>` : `<button class="primary-btn spin-fame-wheel-btn" type="button">Spin the Wheel</button>`}</article>`;
  }

  function renderFinaleFameGamesReveal(ep) {
    if (ep?.type !== "finale" || !state.season?.fameGames?.winnerId) return "";
    const id = state.season.fameGames.winnerId;
    return `<article class="challenge-card award-card fame-games-finale-panel"><p>The winner of the Fame Games is...</p></article><div class="contestant-strip small-strip award-strip">${contestantCard(id, "Fame Games Winner")}</div>`;
  }

  function renderFameGamesFinalePanel(ep) {
    if (!els.fameGamesFinaleStack) return;
    if (ep?.type !== "finale") { els.fameGamesFinaleStack.innerHTML = ""; return; }
    els.fameGamesFinaleStack.innerHTML = renderFinaleFameGamesReveal(ep) || `<span class="empty-state">No Fame Games winner was awarded.</span>`;
  }

  function renderPointCeremonyPanel(ep) {
    if (!els.pointCeremonyStack) return;
    const ceremony = ep.pointCeremony;
    if (!ceremony) { els.pointCeremonyStack.innerHTML = ""; return; }
    const votes = ceremony.votes || [];
    const totals = ceremony.totals || {};
    const advancing = ep.tournamentAdvancingIds || [];
    const eliminated = ep.tournamentEliminatedIds || [];
    els.pointCeremonyStack.innerHTML = `
      <article class="challenge-card point-ceremony-intro"><h3>Point Ceremony</h3><p>The bottom contestants award one MVQ point each.</p></article>
      <div class="mx-vote-grid point-ceremony-vote-grid">
        ${votes.map((vote) => `<article class="mx-vote-card point-ceremony-vote">${contestantCard(vote.voterId)}<span class="vote-arrow">gave 1 point to</span>${contestantCard(vote.receiverId)}</article>`).join("")}
      </div>
      <div class="callout-grid point-total-grid">
        ${Object.entries(totals).sort((a, b) => Number(b[1]) - Number(a[1])).map(([id, total]) => `<article class="placement-card point-total-card ${advancing.includes(id) ? "is-winner" : eliminated.includes(id) ? "is-eliminated" : ""}">${contestantCard(id)}<strong>${Number(total)} point${Number(total) === 1 ? "" : "s"}</strong>${advancing.includes(id) ? `<span class="placement-tag">ADVANCED</span>` : eliminated.includes(id) ? `<span class="placement-tag">ELIMINATED</span>` : ""}</article>`).join("")}
      </div>
      ${ep.pointCeremonyFinal && advancing.length ? `<article class="challenge-card point-ceremony-advance-line"><p>${escapeHtml(`${sentenceList(advancing, state.season, false)}, condragulations! You are advancing to the semi-finals.`)}</p></article>` : ""}
    `;
  }

  function renderUntuckedPanel(ep) {
    if (!els.untuckedStack) return;
    if (ep.type === "finale") {
      els.untuckedStack.innerHTML = "";
      return;
    }

    function relationshipInfluenceMeta(event) {
      const values = Object.values(event.impacts?.relationship || {}).map((value) => Number(value || 0)).filter(Boolean);
      if (!values.length) {
        const fallback = Number(event.relationship || 0);
        if (fallback) values.push(fallback);
      }
      if (!values.length) return { className: "", badge: "" };
      const net = values.reduce((sum, value) => sum + value, 0);
      const tone = net < 0 ? "negative" : "positive";
      return {
        className: ` relationship-${tone}`,
        badge: `<div class="untucked-impact-row"><small class="relationship-influence ${tone}">RELATIONSHIP INFLUENCED</small></div>`
      };
    }

    const eventHtml = (ep.untuckedEvents || []).map((event) => {
      const influence = relationshipInfluenceMeta(event);
      return `<article class="event-card untucked-event token-${escapeHtml(event.type)}${influence.className}">
        <div class="contestant-strip event-people untucked-people">${(event.ids || []).map((id) => contestantCard(id, "", { nick: true })).join("")}</div>
        <p>${escapeHtml(event.renderedText)}</p>
        ${influence.badge}
      </article>`;
    }).join("") || textEvent("Untucked is quiet this week.", "safe");
    const fame = ep.fameGamesUntucked;
    const fameHtml = fame ? `<div class="fame-games-untucked"><hr><h3>The Fame Games</h3><p>Eliminated contestants present their ${escapeHtml(fame.subject)} looks for this episode.</p><div class="contestant-strip small-strip fame-games-runway-strip">${(fame.scores || []).map((score) => contestantCard(score.id, `${Math.round(score.value)} pts`)).join("")}</div></div>` : "";
    els.untuckedStack.innerHTML = eventHtml + fameHtml;
  }

  function updateVisibleEpisodeSections(ep) {
    const isFinale = ep.type === "finale";
    const visible = (isFinale && ((isAllWinnersFormat(state.season) && ep.allWinnersFinale) || ep.lsftcFinale)) ? {
      wildcard: !!ep.tournamentWildcard,
      status: true,
      comeback: !!ep?.comeback,
      guest: false,
      mini: false,
      teams: false,
      famegames: false,
      maxi: false,
      runway: false,
      judging: false,
      goldenbeaver: false,
      placements: false,
      luckycow: false,
      rumocracy: false,
      lipsync: false,
      qosdadhh: true,
      lsftc: true,
      winner: true,
      results: false,
      badonkadunktank: false,
      s17lsfyl: false,
      s17lsfylresults: false,
      untucked: false,
      pointceremony: false,
      trackrecord: true
    } : isFinale ? {
      wildcard: !!ep.tournamentWildcard,
      status: true,
      comeback: !!ep?.comeback,
      guest: false,
      mini: !!(ep.missCongenialityIds || []).length,
      teams: !!ep.goldenBoot,
      famegames: !!state.season?.fameGames?.winnerId,
      maxi: true,
      runway: false,
      judging: false,
      goldenbeaver: false,
      placements: state.season?.config?.finaleType === "jury_finale" ? !!ep.juryVotes : !!(ep.eliminatedIds || []).length,
      luckycow: false,
      rumocracy: false,
      lipsync: [ep.lipSync, ...(ep.extraLipSyncs || [])].filter(Boolean).length > 0,
      qosdadhh: false,
      lsftc: false,
      winner: false,
      results: true,
      badonkadunktank: false,
      s17lsfyl: false,
      s17lsfylresults: false,
      untucked: false,
      pointceremony: false,
      trackrecord: true
    } : {
      wildcard: !!ep.tournamentWildcard,
      status: true,
      comeback: !!ep?.comeback,
      guest: !!ep.guestJudge,
      mini: !!ep.miniChallenge || ep.unplannedExit?.stage === "pre_challenge",
      teams: !!(!isTeamsFormat(state.season) && ep.teams && ep.teams.mode !== "solo" && ep.teams.groups?.length),
      famegames: false,
      maxi: !!ep.challenge,
      runway: !!ep.runway && !ep.runwayUsesChallengeScore && !["design", "runway", "ball", "makeover"].includes(normalizeString(ep.challenge?.type)),
      judging: !!ep.challenge && !ep.hideJudging && !!(ep.safeIds || []).length,
      ratequeen: !!(ep.rateAQueenBallots || []).length,
      goldenbeaver: !!(isGoldenBeaverFormat(state.season) && seasonEliminationFormatApplies(state.season, ep) && ep.goldenBeaverBottomIds?.length),
      placements: !!ep.challenge,
      luckycow: !!(ep.luckyCow?.active && (ep.luckyCow.votes || []).length),
      rumocracy: !!(isAssassinFormat(state.season) && ep.rumocracyVotes?.length),
      lipsync: [ep.lipSync, ...(ep.extraLipSyncs || [])].filter(Boolean).length > 0,
      qosdadhh: false,
      lsftc: false,
      winner: false,
      results: true,
      badonkadunktank: !!ep.badonkaDunkTank?.active,
      s17lsfyl: !!(((["rate_a_queen_s17_split", "uk3"].includes(ep.specialPremiere)) && ep.extraLipSyncs?.length) || hasMidSeasonRateAQueenBottomLipSync(ep)),
      s17lsfylresults: !!(((["rate_a_queen_s17_split", "uk3"].includes(ep.specialPremiere)) && ep.extraLipSyncs?.length) || hasMidSeasonRateAQueenBottomLipSync(ep)),
      untucked: !!(ep.untuckedEvents || []).length,
      pointceremony: !!ep.pointCeremony,
      trackrecord: true
    };
    if (ep?.comebackPending && ep?.comeback?.format === "choose_return") {
      Object.assign(visible, {
        wildcard: false,
        status: true,
        comeback: true,
        guest: false,
        mini: false,
        teams: false,
        famegames: false,
        maxi: false,
        runway: false,
        judging: false,
        ratequeen: false,
        goldenbeaver: false,
        placements: false,
        luckycow: false,
        rumocracy: false,
        lipsync: false,
        qosdadhh: false,
        lsftc: false,
        winner: false,
        results: false,
        badonkadunktank: false,
        s17lsfyl: false,
        s17lsfylresults: false,
        untucked: false,
        pointceremony: false
      });
    }
    if (ep?.type === "cunt_test") {
      Object.assign(visible, {
        wildcard: false, status: true, comeback: false, guest: false, mini: false, teams: false, famegames: false, maxi: true, cuntpart1: true, cuntpart2: true, cuntpart3: true, runway: false, judging: false, ratequeen: false, goldenbeaver: false, placements: false, luckycow: false, rumocracy: false, lipsync: !!ep.lipSync, qosdadhh: false, lsftc: false, winner: false, results: true, badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    if (ep?.type === "porkchop_premiere") {
      Object.assign(visible, {
        wildcard: false, status: true, comeback: false, guest: false, mini: false, teams: false, famegames: false, maxi: true, runway: false, judging: false, ratequeen: false, goldenbeaver: false, placements: false, luckycow: false, rumocracy: false, lipsync: false, qosdadhh: false, lsftc: false, winner: false, results: false, badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    if (["special_lalaparuza", "special_slayoffs", "reunion_lalaparuza", "fame_games"].includes(ep?.type)) {
      const isFameGames = ep?.type === "fame_games";
      Object.assign(visible, {
        wildcard: false, status: true, comeback: !!ep?.comeback, guest: false, mini: false, teams: false, famegames: false, maxi: true, runway: false, judging: false, ratequeen: false, goldenbeaver: false, placements: isFameGames, luckycow: false, rumocracy: false, lipsync: !!ep.lipSync || ep.type === "reunion_lalaparuza", qosdadhh: false, lsftc: false, winner: false, results: true, badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    if (ep?.type === "lsftf") {
      Object.assign(visible, {
        wildcard: false, status: true, comeback: !!ep?.comeback, guest: false, mini: false, teams: false, famegames: false, maxi: true, runway: false, judging: false, goldenbeaver: false, placements: false, luckycow: false, rumocracy: false, lipsync: true, qosdadhh: false, lsftc: false, winner: false, results: true, badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    if (ep?.type === "cunt_test") {
      Object.assign(visible, {
        wildcard: false, status: true, comeback: false, guest: false, mini: false, teams: false, famegames: false, maxi: true, cuntpart1: true, cuntpart2: true, cuntpart3: true, runway: false, judging: false, ratequeen: false, goldenbeaver: false, placements: false, luckycow: false, rumocracy: false, lipsync: !!ep.lipSync, qosdadhh: false, lsftc: false, winner: false, results: true, badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    if (isFinale && ep?.lsftcFinale && !isAllWinnersFormat(state.season)) {
      visible.qosdadhh = false;
      visible.mini = !!(ep.missCongenialityIds || []).length;
      visible.teams = !!ep.goldenBoot;
      visible.famegames = !!state.season?.fameGames?.winnerId;
    }
    if (!isFinale && isAllWinnersFormat(state.season) && ep?.allWinnersEpisode) {
      visible.judging = false;
      visible.ratequeen = false;
      visible.goldenbeaver = false;
      visible.luckycow = false;
      visible.badonkadunktank = false;
      visible.rumocracy = false;
      visible.mini = !!(ep.miniChallenge || ep.allWinnersStarGiveawaysAtStart?.length || ep.unplannedExit?.stage === "pre_challenge");
      visible.placements = true;
      visible.lipsync = [ep.lipSync, ...((ep.extraLipSyncs) || [])].filter(Boolean).length > 0;
    }

    if ((ep?.type || "").startsWith("comeback_")) {
      const standalone = STANDALONE_COMEBACK_FORMATS.has(ep?.comeback?.format);
      Object.assign(visible, {
        wildcard: false, status: true, comeback: !!ep?.comeback, guest: !!(!standalone && ep?.guestJudge), mini: !!(!standalone && ep?.miniChallenge), teams: !!(!standalone && ep?.teams && ep?.teams.mode !== "solo" && ep?.teams.groups?.length), famegames: false, maxi: ep?.comeback?.format !== "lalaparuza_comeback", runway: false, judging: !!(!standalone && ep?.challenge && !ep?.hideJudging && ep?.comeback?.format !== "kitty_girl_groups" && ep?.comeback?.format !== "lalaparuza_comeback"), ratequeen: false, goldenbeaver: false, placements: ep?.comeback?.format !== "lalaparuza_comeback", luckycow: false, rumocracy: false, lipsync: [ep?.lipSync, ...((ep?.extraLipSyncs) || [])].filter(Boolean).length > 0, qosdadhh: false, lsftc: false, winner: false, results: ep?.comeback?.format !== "lalaparuza_comeback", badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    applyDynamicEpisodeStepOrder(ep);
    $all(".section-toggle").forEach((btn) => { btn.hidden = true; });
    $all(".episode-panel").forEach((panel) => { panel.hidden = true; });
    episodeStepOrder(ep).forEach((step) => {
      const show = !!visible[step];
      $all(`.section-toggle[data-step="${step}"]`).forEach((btn) => btn.hidden = !show);
      $all(`.episode-panel[data-panel="${step}"]`).forEach((panel) => panel.hidden = !show);
    });
    const current = visible.wildcard && state.currentStep === "status" && !ep.tournamentWildcard?.revealed ? "wildcard" : (visible[state.currentStep] ? state.currentStep : nextVisibleStep("wildcard", 1, visible) || "status");
    state.currentStep = current;
    updateProceedTargets(visible);
    if (els.allWinnersFinalStatsBtn) {
      const fromWinner = nextVisibleStep("winner", 1, visible);
      els.allWinnersFinalStatsBtn.textContent = fromWinner === "trackrecord" ? "Proceed" : "Statistics";
    }
  }

  function nextVisibleStep(step, direction = 1, visibleMap = null) {
    const ep = currentEpisode();
    if (!visibleMap && ep?.type === "cunt_test") {
      const order = episodeStepOrder(ep);
      const visible = { status: true, maxi: true, cuntpart1: true, cuntpart2: true, cuntpart3: true, lipsync: !!ep.lipSync, results: true, trackrecord: true };
      let idx = order.indexOf(step);
      if (idx < 0) idx = direction > 0 ? -1 : order.length;
      for (let i = idx + direction; i >= 0 && i < order.length; i += direction) {
        if (visible[order[i]]) return order[i];
      }
      return null;
    }
    if (!visibleMap && ep?.type === "porkchop_premiere") {
      const order = episodeStepOrder(ep);
      const visible = { status: true, maxi: true, trackrecord: true };
      let idx = order.indexOf(step);
      if (idx < 0) idx = direction > 0 ? -1 : order.length;
      for (let i = idx + direction; i >= 0 && i < order.length; i += direction) {
        if (visible[order[i]]) return order[i];
      }
      return null;
    }
    const visible = visibleMap || ((ep?.type === "finale" && ((isAllWinnersFormat(state.season) && ep?.allWinnersFinale) || ep?.lsftcFinale)) ? {
      wildcard: !!ep?.tournamentWildcard,
      status: true,
      comeback: !!ep?.comeback,
      guest: false,
      mini: false,
      teams: false,
      famegames: false,
      maxi: false,
      runway: false,
      judging: false,
      goldenbeaver: false,
      placements: false,
      luckycow: false,
      rumocracy: false,
      lipsync: false,
      qosdadhh: true,
      lsftc: true,
      winner: true,
      results: false,
      badonkadunktank: false,
      s17lsfyl: false,
      s17lsfylresults: false,
      untucked: false,
      pointceremony: false,
      trackrecord: true
    } : {
      wildcard: !!ep?.tournamentWildcard,
      status: true,
      comeback: !!ep?.comeback,
      guest: !!ep?.guestJudge,
      mini: !!ep?.miniChallenge,
      teams: !!(ep?.teams && ep?.teams.mode !== "solo" && ep?.teams.groups?.length),
      famegames: false,
      maxi: !!ep?.challenge,
      runway: !!ep?.runway,
      judging: !!ep?.challenge,
      ratequeen: !!(ep?.rateAQueenBallots || []).length,
      goldenbeaver: !!(isGoldenBeaverFormat(state.season) && seasonEliminationFormatApplies(state.season, ep) && ep?.goldenBeaverBottomIds?.length),
      placements: !!ep?.challenge,
      luckycow: !!(ep?.luckyCow?.active && (ep?.luckyCow?.votes || []).length),
      rumocracy: !!(isAssassinFormat(state.season) && ep?.rumocracyVotes?.length),
      lipsync: [ep?.lipSync, ...((ep?.extraLipSyncs) || [])].filter(Boolean).length > 0,
      qosdadhh: false,
      lsftc: false,
      winner: false,
      results: true,
      badonkadunktank: !!ep?.badonkaDunkTank?.active,
      s17lsfyl: !!(((["rate_a_queen_s17_split", "uk3"].includes(ep?.specialPremiere)) && ep?.extraLipSyncs?.length) || hasMidSeasonRateAQueenBottomLipSync(ep)),
      s17lsfylresults: !!(((["rate_a_queen_s17_split", "uk3"].includes(ep?.specialPremiere)) && ep?.extraLipSyncs?.length) || hasMidSeasonRateAQueenBottomLipSync(ep)),
      untucked: ep?.type !== "finale" && !!(ep?.untuckedEvents || []).length,
      pointceremony: !!ep?.pointCeremony,
      trackrecord: true
    });
    if (["special_lalaparuza", "special_slayoffs", "reunion_lalaparuza", "fame_games"].includes(ep?.type)) {
      const isFameGames = ep?.type === "fame_games";
      Object.assign(visible, {
        wildcard: false, status: true, comeback: !!ep?.comeback, guest: false, mini: false, teams: false, famegames: false, maxi: true, runway: false, judging: false, ratequeen: false, goldenbeaver: false, placements: isFameGames, luckycow: false, rumocracy: false, lipsync: !!ep.lipSync || ep.type === "reunion_lalaparuza", qosdadhh: false, lsftc: false, winner: false, results: true, badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    if (ep?.type === "lsftf") {
      Object.assign(visible, {
        wildcard: false, status: true, comeback: !!ep?.comeback, guest: false, mini: false, teams: false, famegames: false, maxi: true, runway: false, judging: false, goldenbeaver: false, placements: false, luckycow: false, rumocracy: false, lipsync: true, qosdadhh: false, lsftc: false, winner: false, results: true, badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    if (ep?.type === "cunt_test") {
      Object.assign(visible, {
        wildcard: false, status: true, comeback: false, guest: false, mini: false, teams: false, famegames: false, maxi: true, cuntpart1: true, cuntpart2: true, cuntpart3: true, runway: false, judging: false, ratequeen: false, goldenbeaver: false, placements: false, luckycow: false, rumocracy: false, lipsync: !!ep.lipSync, qosdadhh: false, lsftc: false, winner: false, results: true, badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    if (ep?.type === "finale" && ep?.lsftcFinale && !isAllWinnersFormat(state.season)) {
      visible.qosdadhh = false;
    }
    if (ep && ep.type !== "finale" && isAllWinnersFormat(state.season) && ep.allWinnersEpisode) {
      visible.judging = false;
      visible.ratequeen = false;
      visible.goldenbeaver = false;
      visible.luckycow = false;
      visible.badonkadunktank = false;
      visible.rumocracy = false;
      visible.mini = !!(ep.miniChallenge || ep.allWinnersStarGiveawaysAtStart?.length || ep.unplannedExit?.stage === "pre_challenge");
      visible.placements = true;
      visible.lipsync = [ep?.lipSync, ...((ep?.extraLipSyncs) || [])].filter(Boolean).length > 0;
    }

    if ((ep?.type || "").startsWith("comeback_")) {
      const standalone = STANDALONE_COMEBACK_FORMATS.has(ep?.comeback?.format);
      Object.assign(visible, {
        wildcard: false, status: true, comeback: !!ep?.comeback, guest: !!(!standalone && ep?.guestJudge), mini: !!(!standalone && ep?.miniChallenge), teams: !!(!standalone && ep?.teams && ep?.teams.mode !== "solo" && ep?.teams.groups?.length), famegames: false, maxi: ep?.comeback?.format !== "lalaparuza_comeback", runway: false, judging: !!(!standalone && ep?.challenge && !ep?.hideJudging && ep?.comeback?.format !== "kitty_girl_groups" && ep?.comeback?.format !== "lalaparuza_comeback"), ratequeen: false, goldenbeaver: false, placements: ep?.comeback?.format !== "lalaparuza_comeback", luckycow: false, rumocracy: false, lipsync: [ep?.lipSync, ...((ep?.extraLipSyncs) || [])].filter(Boolean).length > 0, qosdadhh: false, lsftc: false, winner: false, results: ep?.comeback?.format !== "lalaparuza_comeback", badonkadunktank: false, s17lsfyl: false, s17lsfylresults: false, untucked: false, pointceremony: false, trackrecord: true
      });
    }
    const order = episodeStepOrder(ep);
    let idx = order.indexOf(step);
    if (idx < 0) idx = 0;
    for (let i = idx + direction; i >= 0 && i < order.length; i += direction) {
      if (visible[order[i]]) return order[i];
    }
    return null;
  }

  function updateProceedTargets(visible) {
    $all(".episode-panel").forEach((panel) => {
      const step = panel.dataset.panel;
      const next = nextVisibleStep(step, 1, visible);
      const prev = nextVisibleStep(step, -1, visible);
      const primary = $(".proceed-row .primary-btn.proceed-btn", panel);
      const secondary = $(".proceed-row .secondary-btn.proceed-btn", panel);
      if (primary) {
        primary.dataset.next = next || "__nextEpisode";
        primary.textContent = next ? "Proceed" : "Next Episode";
      }
      if (secondary && prev) secondary.dataset.next = prev;
    });
  }

  function goToNextEpisode() {
    if (!state.season) return;
    if (state.currentEpisodeIndex < state.season.episodes.length - 1) {
      state.currentEpisodeIndex += 1;
      state.currentStep = "status";
      saveState();
      renderEpisode();
      scrollToEpisodeSection(state.currentStep || "status");
    } else {
      openStatsScreen();
    }
  }

  function updateVotingStatsVisibility() {
    const showVoting = isAssassinFormat(state.season);
    const votingTab = $('.stats-tab[data-tab="voting"]');
    const votingPanel = $('.stats-panel[data-tab-panel="voting"]');
    if (votingTab) votingTab.hidden = !showVoting;
    if (votingPanel) votingPanel.hidden = !showVoting;
    if (!showVoting && votingTab?.classList.contains("is-active")) {
      votingTab.classList.remove("is-active");
      votingPanel?.classList.remove("is-active");
      $('.stats-tab[data-tab="track"]')?.classList.add("is-active");
      $('.stats-panel[data-tab-panel="track"]')?.classList.add("is-active");
    }
  }


  function updatePointStatsVisibility() {
    const showPoints = isTournamentFormat(state.season);
    ["points", "pointbracket"].forEach((tabName) => {
      const pointTab = $(`.stats-tab[data-tab="${tabName}"]`);
      const pointPanel = $(`.stats-panel[data-tab-panel="${tabName}"]`);
      if (pointTab) pointTab.hidden = !showPoints;
      if (pointPanel) pointPanel.hidden = !showPoints;
      if (!showPoints && pointTab?.classList.contains("is-active")) {
        pointTab.classList.remove("is-active");
        pointPanel?.classList.remove("is-active");
        $('.stats-tab[data-tab="track"]')?.classList.add("is-active");
        $('.stats-panel[data-tab-panel="track"]')?.classList.add("is-active");
      }
    });
  }

  function updateStarStatsVisibility() {
    const showStars = isAllWinnersFormat(state.season);
    const starTab = $('.stats-tab[data-tab="stars"]');
    const starPanel = $('.stats-panel[data-tab-panel="stars"]');
    if (starTab) starTab.hidden = !showStars;
    if (starPanel) starPanel.hidden = !showStars;
    if (!showStars && starTab?.classList.contains("is-active")) {
      starTab.classList.remove("is-active");
      starPanel?.classList.remove("is-active");
      $('.stats-tab[data-tab="track"]')?.classList.add("is-active");
      $('.stats-panel[data-tab-panel="track"]')?.classList.add("is-active");
    }
  }

  function starAwardSummaryFor(ep, id) {
    const awards = (ep.allWinnersStarAwards || []).filter((award) => award.id === id);
    if (!awards.length) return { text: "–", className: "star-none", title: "" };
    const amount = awards.reduce((sum, award) => sum + Number(award.amount || 0), 0);
    const reasons = awards.map((award) => award.reason);
    let className = "star-top2";
    if (reasons.includes("blocked_top2")) className = "star-blocked";
    else if (reasons.includes("talent_top2")) className = "star-talent";
    else if (reasons.includes("gift")) className = "star-gift";
    const title = awards.map((award) => {
      if (award.reason === "gift") return `Received a Legendary Legend Star from ${fullDisplayName(state.season.contestants[award.giverId])}`;
      if (award.reason === "blocked_top2") return "Top Two, but blocked from earning a Legendary Legend Star";
      if (award.reason === "talent_top2") return "Talent show Top Two: three Legendary Legend Stars";
      return "Top Two: one Legendary Legend Star";
    }).join("; ");
    return { text: amount > 0 ? `+${amount}` : "+0", className, title };
  }

  function renderPointSummaryStats() {
    if (!els.pointSummaryWrap) return;
    if (!isTournamentFormat(state.season)) { els.pointSummaryWrap.innerHTML = ""; return; }
    const bracketEpisodes = state.season.episodes.filter((ep) => ep.tournamentBracketId);
    if (!bracketEpisodes.length) {
      els.pointSummaryWrap.innerHTML = `<div class="stat-table-shell point-summary-shell"><table class="stats-table modern-stat-table point-summary-table"><tbody><tr><td>No tournament points recorded.</td></tr></tbody></table></div>`;
      return;
    }
    const labels = bracketEpisodes.map((ep) => ep.label);
    const histories = state.season.tournamentPointHistory || [];
    const totalsByLabel = new Map();
    state.season.castOrder.forEach((id) => {
      let total = 0;
      totalsByLabel.set(id, {});
      labels.forEach((label) => {
        histories.filter((entry) => entry.id === id && entry.label === label).forEach((entry) => { total += Number(entry.amount || 0); });
        totalsByLabel.get(id)[label] = total;
      });
    });
    const cellClassFor = (ep, id) => {
      if ((ep.tournamentEliminatedIds || []).includes(id)) return "point-eliminated token-elim";
      if ((ep.top2Ids || []).includes(id)) return ep.lipSync?.winnerId === id ? "point-top-win token-win" : "point-top-loss token-top2";
      if ((ep.bottomIds || []).includes(id)) return "point-bottom token-btm";
      return "point-neutral";
    };
    const rows = state.season.castOrder.map((id) => {
      const cells = labels.map((label) => {
        const ep = bracketEpisodes.find((item) => item.label === label);
        const active = (ep?.activeStartIds || []).includes(id);
        if (!active) return `<td class="point-summary-cell point-inactive point-cell-absent" aria-label="Not competing"></td>`;
        const value = Number(totalsByLabel.get(id)?.[label] || 0);
        return `<td class="point-summary-cell ${escapeHtml(cellClassFor(ep, id))}">${escapeHtml(value)}</td>`;
      }).join("");
      const nameAttrs = tournamentTrackNameCellAttrs(state.season, id);
      return `<tr><th${nameAttrs}>${tournamentContestantNameHtml(state.season, id, statContestantInline(id))}</th>${cells}</tr>`;
    }).join("");
    els.pointSummaryWrap.innerHTML = `<div class="point-summary-key"><span><b class="point-key-box point-top-win"></b>Won Lip Sync (+3)</span><span><b class="point-key-box point-top-loss"></b>Top 2 (+2)</span><span><b class="point-key-box point-bottom"></b>Bottom</span><span><b class="point-key-box point-eliminated"></b>Eliminated</span></div><div class="stat-table-shell point-summary-shell"><table class="stats-table modern-stat-table point-summary-table"><caption>Summary of points</caption><thead><tr><th>Contestant</th>${labels.map((label) => `<th>${escapeHtml(statEpisodeLabel(label))}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderPointBracketStats() {
    if (!els.pointBracketWrap) return;
    if (!isTournamentFormat(state.season)) { els.pointBracketWrap.innerHTML = ""; return; }
    const season = state.season;
    const brackets = season.tournamentBrackets || [];
    const bracketEpisodes = season.episodes.filter((ep) => ep.tournamentBracketId);
    if (!brackets.length || !bracketEpisodes.length) {
      els.pointBracketWrap.innerHTML = `<div class="stat-table-shell point-bracket-shell"><table class="stats-table modern-stat-table point-bracket-table"><tbody><tr><td>No bracket points recorded.</td></tr></tbody></table></div>`;
      return;
    }
    const histories = season.tournamentPointHistory || [];
    const key = `<div class="point-summary-key point-bracket-key"><span><b class="point-key-box point-top-win"></b>Won Lip Sync for Your Legacy</span><span><b class="point-key-box point-top-loss"></b>Lost Lip Sync for Your Legacy</span><span><b class="point-key-box point-bottom"></b>Bottom</span><span><b class="point-key-box point-advanced"></b>Advanced</span><span><b class="point-key-box point-eliminated"></b>Eliminated</span></div>`;
    const tables = brackets.map((bracket, bracketIndex) => {
      const episodes = bracketEpisodes.filter((ep) => ep.tournamentBracketId === bracket.id);
      if (!episodes.length) return "";
      const finalEp = episodes.at(-1) || null;
      const orderedBracketIds = (bracket.ids || []).slice().sort((a, b) => {
        const pointDifference = Number(season.tournamentPoints?.[b] || 0) - Number(season.tournamentPoints?.[a] || 0);
        return pointDifference || fullDisplayName(season.contestants[a]).localeCompare(fullDisplayName(season.contestants[b]));
      });
      const rows = orderedBracketIds.map((id) => {
        const cells = episodes.map((ep) => {
          const active = (ep.activeStartIds || []).includes(id);
          if (!active) return `<td class="point-bracket-cell point-inactive point-cell-absent" aria-label="Not competing"></td>`;
          const entries = histories.filter((entry) => entry.id === id && entry.label === ep.label);
          const amount = entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
          const voters = entries.map((entry) => entry.voterId).filter(Boolean);
          const voterNicknames = [...new Set(voters.map((voterId) => nickDisplayName(season.contestants[voterId] || { id: voterId })).filter(Boolean))];
          let cls = "point-neutral";
          let placementTag = "";
          if ((ep.top2Ids || []).includes(id)) {
            if (ep.lipSync?.winnerId === id) { cls = "point-top-win token-win"; placementTag = "WIN"; }
            else { cls = "point-top-loss token-top2"; placementTag = "TOP2"; }
          } else if ((ep.bottomIds || []).includes(id)) {
            cls = "point-bottom token-btm";
          }
          const amountText = amount ? `+${Number.isInteger(amount) ? amount : amount.toFixed(1).replace(/\.0$/, "")}` : "0";
          const detailParts = [placementTag, ...voterNicknames].filter(Boolean);
          const detail = detailParts.length ? `<div class="point-bracket-detail">(${escapeHtml(detailParts.join(", "))})</div>` : "";
          return `<td class="point-bracket-cell ${escapeHtml(cls)}"><div>${escapeHtml(amountText)}</div>${detail}</td>`;
        }).join("");
        const total = Number(season.tournamentPoints?.[id] || 0);
        const advanced = (finalEp?.tournamentAdvancingIds || []).includes(id);
        const eliminated = (finalEp?.tournamentEliminatedIds || []).includes(id);
        const resultClass = advanced ? "point-advanced token-rtrn" : eliminated ? "point-eliminated token-elim" : "point-neutral";
        const resultText = advanced ? "ADV" : eliminated ? "ELIM" : "—";
        const nameAttrs = tournamentTrackNameCellAttrs(season, id);
        return `<tr><th${nameAttrs}>${tournamentContestantNameHtml(season, id, statContestantInline(id))}</th>${cells}<td class="point-bracket-final"><strong>${escapeHtml(Number.isInteger(total) ? total : total.toFixed(1).replace(/\.0$/, ""))}</strong></td><td class="point-bracket-result ${escapeHtml(resultClass)}">${escapeHtml(resultText)}</td></tr>`;
      }).join("");
      const episodeHeaders = episodes.map((ep) => `<th>${escapeHtml(statEpisodeLabel(ep.label))}</th>`).join("");
      const color = bracket.color || ["#3b82f6", "#facc15", "#ef4444", "#22c55e"][bracketIndex % 4];
      return `<div class="point-bracket-block"><table class="stats-table modern-stat-table point-bracket-table"><thead><tr><th class="point-bracket-caption" colspan="${episodes.length + 3}" style="--bracket-color:${escapeHtml(color)}">${escapeHtml(bracket.name || `Bracket ${bracketIndex + 1}`)}</th></tr><tr><th rowspan="2">Contestant</th><th colspan="${episodes.length}">Episode</th><th rowspan="2">Final points</th><th rowspan="2">Result</th></tr><tr>${episodeHeaders}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }).join("");
    els.pointBracketWrap.innerHTML = `${key}<div class="point-bracket-shell">${tables}</div>`;
  }

  function renderStarCountStats() {
    if (!els.starCountWrap) return;
    if (!isAllWinnersFormat(state.season)) { els.starCountWrap.innerHTML = ""; return; }
    const episodes = state.season.episodes.filter((ep) => ep.allWinnersEpisode);
    const rows = seasonPlacementOrder().map((id) => {
      const cells = episodes.map((ep) => {
        const summary = starAwardSummaryFor(ep, id);
        return `<td class="legendary-star-cell ${escapeHtml(summary.className)}" title="${escapeHtml(summary.title)}">${escapeHtml(summary.text)}</td>`;
      }).join("");
      const total = Number(state.season.allWinnersStarCounts?.[id] || state.season.stats[id]?.legendaryStars || 0);
      return `<tr><th>${statContestantInline(id)}</th>${cells}<td class="legendary-star-total"><strong>${escapeHtml(total)}</strong></td></tr>`;
    }).join("");
    const legend = `
      <div class="star-count-legend">
        <span><i class="legend-swatch star-talent"></i>Talent-show Top Two: +3 stars.</span>
        <span><i class="legend-swatch star-top2"></i>Top Two: +1 star.</span>
        <span><i class="legend-swatch star-gift"></i>Gifted Legendary Legend Star.</span>
        <span><i class="legend-swatch star-blocked"></i>Top Two but blocked: +0 stars.</span>
      </div>
    `;
    els.starCountWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table star-count-table"><thead><tr><th>Contestant</th>${episodes.map((ep) => `<th>${escapeHtml(statEpisodeLabel(ep.label))}</th>`).join("")}<th>Total Stars</th></tr></thead><tbody>${rows}</tbody></table></div>${legend}`;
  }

  function statsRenderFallback(container, label, error) {
    console.error(`Failed to render Statistics section: ${label}`, error);
    if (!container) return;
    container.innerHTML = `<div class="empty-state stats-render-error"><strong>${escapeHtml(label)} could not be displayed.</strong><span>The rest of Statistics is still available.</span></div>`;
  }

  function safelyRenderStatsSection(label, renderer, container = null) {
    try {
      renderer();
      return true;
    } catch (error) {
      statsRenderFallback(container, label, error);
      return false;
    }
  }

  function renderStats() {
    if (!state.season) return false;
    const visibilityTasks = [
      ["Voting visibility", updateVotingStatsVisibility],
      ["Star visibility", updateStarStatsVisibility],
      ["Tournament-point visibility", updatePointStatsVisibility]
    ];
    visibilityTasks.forEach(([label, renderer]) => safelyRenderStatsSection(label, renderer));

    const sections = [
      ["Track Record", renderTrackRecord, els.trackWrap],
      ["Lip Syncs", renderLipSyncStats, els.lipSyncStatsWrap],
      ["Legendary Legend Stars", renderStarCountStats, els.starCountWrap],
      ["Summary of Points", renderPointSummaryStats, els.pointSummaryWrap],
      ["Points Per Bracket", renderPointBracketStats, els.pointBracketWrap],
      ["Runways", renderRunwayStats, els.runwayStatsWrap],
      ["Challenges", renderChallengeStats, els.challengeStatsWrap],
      ["Popularity", renderPopularityStats, els.popularityWrap],
      ["Edgic", renderEdgicStats, els.edgicWrap],
      ["Voting", renderVotingStats, els.votingStatsWrap],
      ["Storylines", renderStorylines, els.storylinesWrap],
      ["Highlights", renderHighlights, els.highlightsWrap]
    ];
    return sections.reduce((renderedAny, [label, renderer, container]) => safelyRenderStatsSection(label, renderer, container) || renderedAny, false);
  }

  function openStatsScreen() {
    if (!state.season) return;
    showScreen("stats-screen");
    renderStats();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function seasonPlacementOrder() {
    const season = state.season;
    const validIds = new Set((season.castOrder || []).filter((id) => season.contestants?.[id] && season.stats?.[id]));
    const ordered = [];
    const add = (id) => {
      if (validIds.has(id) && !ordered.includes(id)) ordered.push(id);
    };
    const finale = season.episodes.find((ep) => ep.type === "finale");

    if (isAllWinnersFormat(season) && finale?.allWinnersFinale) {
      const finalists = (finale.allWinnersFinalistIds?.length ? finale.allWinnersFinalistIds : season.allWinnersFinalistIds || finale.activeStartIds || []).filter((id) => validIds.has(id));
      const winners = (season.winnerIds?.length ? season.winnerIds : (season.winnerId ? [season.winnerId] : [])).filter((id) => validIds.has(id));
      const outcome = allWinnersFinaleOutcomeInfo(finale, finalists, winners);
      winners.forEach(add);
      outcome.runnerUpIds.forEach(add);
      outcome.finalElimIds.forEach(add);
      allWinnersHersesPlacementOrder(season, finale).forEach(add);
      (season.castOrder || []).forEach(add);
      return ordered;
    }

    const winners = (season.winnerIds?.length ? season.winnerIds : (season.winnerId ? [season.winnerId] : [])).filter((id) => validIds.has(id));
    const finalElims = (finale?.eliminatedIds || []).filter((id) => validIds.has(id) && !winners.includes(id));
    const runners = (finale?.activeStartIds || season.activeIds || []).filter((id) => validIds.has(id) && !winners.includes(id) && !finalElims.includes(id));
    const remainingElims = (season.eliminatedIds || []).slice().reverse().filter((id) => validIds.has(id) && !winners.includes(id) && !runners.includes(id) && !finalElims.includes(id));
    [...winners, ...runners, ...finalElims, ...remainingElims].forEach(add);
    (season.castOrder || []).forEach(add);
    return ordered;
  }

  function tokenClass(token) { return `token-${String(token || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; }

  function statEpisodeLabel(label) {
    const value = String(label || "").trim();
    const episodeMatch = value.match(/^Episode\s+(.+)$/i);
    if (episodeMatch) return episodeMatch[1];
    return value.replace(/^EP\.?\s*/i, "");
  }

  function trackEpisodeLabel(label) {
    return String(label || "").replace(/^Episode\s+/i, "EP. ");
  }

  function trackHeaderHtml(col) {
    return `<span class="track-head-cell"><span class="track-head-episode">${escapeHtml(trackEpisodeLabel(col?.label || ""))}</span></span>`;
  }

  function trackChallengeHeaderHtml(col) {
    const type = String(col?.challengeType || "").trim();
    if (!type) return `<span class="track-head-cell"><span class="track-head-episode">&nbsp;</span></span>`;
    const formatted = type
      .replace(/\bGirl\s+Groups\b/i, "Girl<br/>Groups")
      .replace(/\bSnatch\s+Game\b/i, "Snatch<br/>Game")
      .replace(/\bTalent\s+Show\b/i, "Talent<br/>Show")
      .replace(/\bLip\s+Sync\b/i, "Lip<br/>Sync")
      .replace(/\bStand[ -]?Up\b/i, "Stand<br/>Up")
      .replace(/\bPolitical\s+Debate\b/i, "Political<br/>Debate")
      .replace(/\bMakeover\b/i, "Make<br/>Over")
      .replace(/\bFinale\s+Rumix\b/i, "Finale<br/>Rumix");
    const safe = formatted.split(/<br\s*\/?\s*>/i).map((part) => escapeHtml(part)).join("<br/>");
    return `<span class="track-head-cell"><span class="track-head-episode">${safe}</span></span>`;
  }

  function statContestantInline(id) {
    const item = state.season.contestants[id] || {};
    return `<span class="stat-contestant"><img src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(fullDisplayName(item))}"><span>${escapeHtml(fullDisplayName(item))}</span></span>`;
  }

  function statContestantInlineWithNote(id, note = "") {
    const base = statContestantInline(id);
    return note ? `<span class="stat-contestant-note">${base}<small>(${escapeHtml(note)})</small></span>` : base;
  }

  function statContestantList(ids, separator = " vs. ") {
    return (ids || []).map((id) => statContestantInline(id)).join(`<span class="stat-separator">${escapeHtml(separator)}</span>`);
  }

  function lipSyncEliminatesContestant(ls, ep = null) {
    if (!ls || !ep) return false;
    const ids = new Set(ls.ids || []);
    return (ep.eliminatedIds || []).some((id) => ids.has(id) && !state.season.contestants[id]?.isAssassin);
  }

  function isForTheWinLipSync(ls, ep = null) {
    const context = String(ls?.context || "").toLowerCase();
    const resultType = String(ls?.resultType || "").toLowerCase();
    const eliminationTypes = new Set([
      "elimination",
      "double_sashay",
      "team_elimination",
      "team_pair_elimination",
      "team_top_four_elimination",
      "slayoffs_bottom",
      "lalaparuza_final",
      "lsftf_final",
      "mid_season_rate_a_queen_bottom1"
    ]);
    if (eliminationTypes.has(resultType) || /(?:^|_)elimination(?:_|$)/.test(resultType)) return false;
    if (/^(?:lalaparuza_round|reunion_lalaparuza_round|slayoffs_round|lsftf_round)/.test(resultType)) return true;
    if (["lalaparuza_comeback", "game_within_a_game", "fame_games_multiplier", "porkchop_battle"].includes(resultType)) return true;
    if (resultType === "all_winners_final_round" || resultType === "qosdadhh_final") return true;
    if (lipSyncEliminatesContestant(ls, ep) && !["double_shantay", "lucky_cow_save", "badonka_save"].includes(resultType)) return false;
    return context.includes("top two") || context.includes("crown") || context.includes("for the win") || context.includes("legacy") || context.includes("lsftc") || (context.includes("finale") && !context.includes("elimination"));
  }

  function lipSyncOutcomeClass(count) {
    if (count <= 1) return "ls-elim-1";
    if (count === 2) return "ls-elim-2";
    if (count === 3) return "ls-elim-3";
    if (count === 4) return "ls-elim-4";
    return "ls-elim-5";
  }

  function trackDisplayHtml(entry) {
    const display = String(entry?.display || entry?.token || "").replace(/\bBTM\s+(\d+)\b/g, "BTM$1");
    return display.split(/<br\s*\/?\s*>/i).map((part) => escapeHtml(part).replace(/\bBTM\s+(\d+)\b/g, "BTM$1")).join("<br>");
  }

  function trackEntryPpeValue(entry) {
    const token = String(entry?.token || "");
    const extra = Array.isArray(entry?.extraClasses) ? entry.extraClasses : [];
    if (isQuitOrDisqTrackToken(token)) return 0;
    if (token === "WIN" && extra.includes("legacy-loser-win")) return 4.5;
    const points = { WIN: 5, DWIN: 5, TOP2: 4.5, HIGH: 4, HIGH_BLK: 4, SAFE: 3, RTRN: 3, IN: 3, BLK: 3, LALA_R1: 3, LALA_R2: 3, LALA_R3: 3, LALA_R4: 3, LALA_R5: 3, LOW: 2, BTM: 1, CHOC: 1, DEPT: 0, OUT: 0, ELIM: 0 };
    return /^BTM\d+$/.test(token) ? 1 : points[token];
  }

  function trackPpeFor(id) {
    const entries = (state.season.stats[id]?.track || []).filter((entry) => entry.label !== "Finale" && trackEntryPpeValue(entry) != null);
    if (!entries.length) return "—";
    const total = entries.reduce((sum, entry) => sum + trackEntryPpeValue(entry), 0);
    return (total / entries.length).toFixed(2);
  }

  function trackColumnChallengeTypeFromTitle(title) {
    const match = String(title || "").match(/\(([^()]+)\)\s*$/);
    return match ? match[1] : "";
  }

  function trackColumnDefinitions(season) {
    const episodeByLabel = new Map((season.episodes || []).map((ep) => [ep.label, ep]));
    const normalizeCol = (col) => {
      const ep = episodeByLabel.get(col.label);
      const typeFromEpisode = ep?.challenge ? challengeTypeLabel(ep.challenge.type) : "";
      return {
        label: col.label,
        title: col.title || col.label,
        challengeType: col.challengeType || typeFromEpisode || trackColumnChallengeTypeFromTitle(col.title || col.label)
      };
    };
    if (Array.isArray(season.trackColumnLabels) && season.trackColumnLabels.length) return season.trackColumnLabels.map(normalizeCol);
    const cols = [];
    const add = (label, title = label, challengeType = "") => {
      if (label && !cols.some((col) => col.label === label)) cols.push({ label, title, challengeType: challengeType || trackColumnChallengeTypeFromTitle(title) });
    };
    season.episodes.forEach((ep) => add(
      ep.label,
      ep.challenge ? `${ep.challenge.name} (${challengeTypeLabel(ep.challenge.type)})` : ep.title || ep.label,
      ep.challenge ? challengeTypeLabel(ep.challenge.type) : (ep.type === "finale" ? "Finale" : "")
    ));
    season.castOrder.forEach((id) => (season.stats[id]?.track || []).forEach((entry) => {
      if (entry.label !== "Entry") add(entry.label, entry.challengeTitle || (entry.label === "Top 4" ? "Final Rumix Performance (Rumix)" : entry.label));
    }));
    return cols;
  }

  function hexToRgbParts(color) {
    let value = String(color || "").trim();
    if (!value) return null;
    if (/^#[0-9a-f]{3}$/i.test(value)) {
      value = `#${value.slice(1).split("").map((ch) => ch + ch).join("")}`;
    }
    if (!/^#[0-9a-f]{6}$/i.test(value)) return null;
    return {
      r: parseInt(value.slice(1, 3), 16),
      g: parseInt(value.slice(3, 5), 16),
      b: parseInt(value.slice(5, 7), 16)
    };
  }

  function readableTextColorForBackground(color) {
    const rgb = hexToRgbParts(color);
    if (!rgb) return "#ffffff";
    const brightness = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return brightness >= 150 ? "#1c0828" : "#ffffff";
  }

  function tournamentBracketForContestant(season, id) {
    if (!isTournamentFormat(season)) return null;
    return (season.tournamentBrackets || []).find((bracket) => (bracket.ids || []).includes(id)) || null;
  }

  function tournamentBracketNumberForContestant(season, id) {
    if (!isTournamentFormat(season)) return 0;
    const index = (season.tournamentBrackets || []).findIndex((bracket) => (bracket.ids || []).includes(id));
    return index >= 0 ? index + 1 : 0;
  }

  function tournamentTrackNameCellAttrs(season, id) {
    const bracket = tournamentBracketForContestant(season, id);
    if (!bracket?.color) return "";
    const bg = bracket.color;
    const fg = readableTextColorForBackground(bg);
    return ` class="tournament-name-cell" style="--tournament-name-bg:${escapeHtml(bg)};--tournament-name-fg:${escapeHtml(fg)};background-color:${escapeHtml(bg)} !important;background-image:none !important;color:${escapeHtml(fg)} !important;"`;
  }

  function tournamentContestantNameHtml(season, id, innerHtml = "") {
    const bracketNumber = tournamentBracketNumberForContestant(season, id);
    const content = innerHtml || escapeHtml(fullDisplayName(season.contestants[id] || { id }));
    if (!bracketNumber) return content;
    return `<span class="tournament-name-main">${content}</span><small class="tournament-name-bracket">(Bracket ${bracketNumber})</small>`;
  }

  function cssColorWithFallback(value, fallback = "#ffffff") {
    const color = String(value || "").trim();
    if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") return fallback;
    return color;
  }

  function downloadCanvasPng(canvas, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function splitTextToFit(ctx, text, maxWidth, maxLines = 3) {
    const parts = String(text || "").replace(/\r/g, "").split(/\n+/).flatMap((line) => line.trim().split(/\s+/).filter(Boolean));
    if (!parts.length) return [""];
    const lines = [];
    let line = "";
    parts.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth || !line) line = next;
      else {
        lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      const clipped = lines.slice(0, maxLines);
      while (clipped[maxLines - 1] && ctx.measureText(`${clipped[maxLines - 1]}…`).width > maxWidth) clipped[maxLines - 1] = clipped[maxLines - 1].slice(0, -1);
      clipped[maxLines - 1] = `${clipped[maxLines - 1]}…`;
      return clipped;
    }
    return lines;
  }

  function loadImageForCanvas(src) {
    return new Promise((resolve) => {
      const value = String(src || "").trim();
      if (!value) { resolve(null); return; }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = value;
    });
  }

  async function trackExportImageData(image) {
    const src = image?.dataset?.exportSrc || image?.currentSrc || image?.src || "";
    if (!src) return PLACEHOLDER;
    if (src.startsWith("data:")) return src;
    try {
      const response = await fetch(src, { mode: "cors", credentials: "omit", cache: "force-cache" });
      if (!response.ok) throw new Error("Image request failed");
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || PLACEHOLDER));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, image.naturalWidth || image.width || 1);
        canvas.height = Math.max(1, image.naturalHeight || image.height || 1);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/png");
      } catch (canvasError) {
        return PLACEHOLDER;
      }
    }
  }

  function loadTrackExportImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function trackExportBorderSpacing(table) {
    const raw = String(getComputedStyle(table).borderSpacing || "0").trim().split(/\s+/);
    const horizontal = Math.max(0, parseFloat(raw[0]) || 0);
    const vertical = Math.max(0, parseFloat(raw[1] ?? raw[0]) || 0);
    return { horizontal, vertical };
  }

  function trackExportCellLayout(table) {
    const occupied = [];
    const positions = new Map();
    let maxColumns = 0;
    Array.from(table.rows || []).forEach((row, rowIndex) => {
      occupied[rowIndex] ||= [];
      let columnIndex = 0;
      Array.from(row.cells || []).forEach((cell) => {
        while (occupied[rowIndex][columnIndex]) columnIndex += 1;
        const rowSpan = Math.max(1, Number(cell.rowSpan || 1));
        const colSpan = Math.max(1, Number(cell.colSpan || 1));
        positions.set(cell, { rowIndex, columnIndex, rowSpan, colSpan });
        for (let r = rowIndex; r < rowIndex + rowSpan; r += 1) {
          occupied[r] ||= [];
          for (let c = columnIndex; c < columnIndex + colSpan; c += 1) occupied[r][c] = true;
        }
        columnIndex += colSpan;
        maxColumns = Math.max(maxColumns, columnIndex);
      });
    });
    return { positions, maxColumns, rowCount: Array.from(table.rows || []).length };
  }

  async function downloadTrackRecordCanvasFallback(source, filename) {
    const table = source.querySelector?.(".track-table") || source;
    const tableRect = table.getBoundingClientRect();
    const spacing = trackExportBorderSpacing(table);
    const layout = trackExportCellLayout(table);
    const width = Math.max(1, Math.ceil(tableRect.width - spacing.horizontal * (layout.maxColumns + 1)));
    const tableHeight = Math.max(1, Math.ceil(tableRect.height - spacing.vertical * (layout.rowCount + 1)));
    const titleHeight = 48;
    const height = tableHeight + titleHeight;
    const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    context.scale(scale, scale);
    const tableStyle = getComputedStyle(table);
    context.fillStyle = cssColorWithFallback(tableStyle.backgroundColor, "#101114");
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.font = `700 20px ${getComputedStyle(document.body).fontFamily || "Arial, sans-serif"}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(state.config.seasonName || "Drag Race Season"), width / 2, titleHeight / 2, Math.max(1, width - 24));

    const cells = Array.from(table.querySelectorAll("th, td"));
    for (const cell of cells) {
      const rect = cell.getBoundingClientRect();
      const grid = layout.positions.get(cell) || { rowIndex: 0, columnIndex: 0, rowSpan: 1, colSpan: 1 };
      const x = rect.left - tableRect.left - spacing.horizontal * (grid.columnIndex + 1);
      const y = rect.top - tableRect.top - spacing.vertical * (grid.rowIndex + 1) + titleHeight;
      const cellWidth = Math.max(1, rect.width - spacing.horizontal * (grid.colSpan - 1));
      const cellHeight = Math.max(1, rect.height - spacing.vertical * (grid.rowSpan - 1));
      const style = getComputedStyle(cell);
      const isBlankTrackCell = cell.classList.contains("no-cell");
      const background = isBlankTrackCell ? "#a9a9a9" : cssColorWithFallback(style.backgroundColor, "#1b1c20");
      context.fillStyle = background;
      context.fillRect(x, y, cellWidth, cellHeight);
      if (!isBlankTrackCell) {
        const borderWidth = 0.5;
        context.strokeStyle = "#a9a9a9";
        context.lineWidth = borderWidth;
        context.strokeRect(x + borderWidth / 2, y + borderWidth / 2, Math.max(0, cellWidth - borderWidth), Math.max(0, cellHeight - borderWidth));
      }

      const photo = cell.querySelector("img.track-contestant-photo");
      if (photo) {
        try {
          const dataUrl = await trackExportImageData(photo);
          const loaded = await loadTrackExportImage(dataUrl);
          const inset = 0;
          const targetX = x + inset;
          const targetY = y + inset;
          const targetW = Math.max(1, cellWidth - inset * 2);
          const targetH = Math.max(1, cellHeight - inset * 2);
          const sourceRatio = loaded.naturalWidth / Math.max(1, loaded.naturalHeight);
          const targetRatio = targetW / Math.max(1, targetH);
          let sx = 0;
          let sy = 0;
          let sw = loaded.naturalWidth;
          let sh = loaded.naturalHeight;
          if (sourceRatio > targetRatio) {
            sw = loaded.naturalHeight * targetRatio;
            sx = (loaded.naturalWidth - sw) / 2;
          } else {
            sh = loaded.naturalWidth / targetRatio;
            sy = (loaded.naturalHeight - sh) / 2;
          }
          context.save();
          context.beginPath();
          context.rect(targetX, targetY, targetW, targetH);
          context.clip();
          context.drawImage(loaded, sx, sy, sw, sh, targetX, targetY, targetW, targetH);
          context.restore();
        } catch (error) {
        }
        continue;
      }

      const text = String(cell.innerText || "").trim();
      if (!text) continue;
      const isName = cell.classList.contains("track-name-cell");
      const fontSize = Math.max(7, (parseFloat(style.fontSize) || 10) + (isName ? 2 : 0));
      const fontWeight = style.fontWeight || "600";
      const fontFamily = style.fontFamily || "Arial, sans-serif";
      const lineHeight = Math.max(fontSize * 1.05, parseFloat(style.lineHeight) || fontSize * 1.1);
      const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      context.fillStyle = cssColorWithFallback(style.color, "#ffffff");
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      context.textBaseline = "middle";
      context.textAlign = "center";
      const textX = x + cellWidth / 2;
      const totalTextHeight = lineHeight * lines.length;
      const firstY = y + (cellHeight - totalTextHeight) / 2 + lineHeight / 2;
      lines.forEach((line, index) => context.fillText(line, textX, firstY + index * lineHeight, Math.max(1, cellWidth - 10)));
    }
    downloadCanvasPng(canvas, filename);
  }

  async function downloadTrackRecordPng() {
    if (!state.season) return;
    if (!els.trackWrap?.querySelector(".track-table")) renderTrackRecord();
    const source = els.trackWrap?.querySelector(".track-table");
    if (!source) return;
    const button = els.downloadTrackRecordBtn;
    const previousText = button?.textContent || "Download Track Record";
    if (button) {
      button.disabled = true;
      button.textContent = "Preparing…";
    }
    const safeName = String(state.config.seasonName || "drag-race-simulator").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "drag-race-simulator";
    const filename = `${safeName}-track-record.png`;

    try {
      await document.fonts?.ready?.catch?.(() => {});
      const sourceRect = source.getBoundingClientRect();
      const spacing = trackExportBorderSpacing(source);
      const layout = trackExportCellLayout(source);
      const width = Math.ceil(Math.max(1, Math.max(source.scrollWidth, sourceRect.width) - spacing.horizontal * (layout.maxColumns + 1)));
      const tableHeight = Math.ceil(Math.max(1, Math.max(source.scrollHeight, sourceRect.height) - spacing.vertical * (layout.rowCount + 1)));
      const titleHeight = 48;
      const height = tableHeight + titleHeight;
      const clone = source.cloneNode(true);
      const originalNodes = [source, ...source.querySelectorAll("*")];
      const clonedNodes = [clone, ...clone.querySelectorAll("*")];
      originalNodes.forEach((original, index) => {
        const copied = clonedNodes[index];
        if (!copied || !(copied instanceof Element)) return;
        const computed = getComputedStyle(original);
        for (let propertyIndex = 0; propertyIndex < computed.length; propertyIndex += 1) {
          const property = computed[propertyIndex];
          copied.style.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property));
        }
        const rect = original.getBoundingClientRect();
        if (["TABLE", "TH", "TD", "IMG"].includes(original.tagName)) {
          const grid = original.tagName === "TH" || original.tagName === "TD" ? layout.positions.get(original) : null;
          const adjustedWidth = original.tagName === "TABLE"
            ? width
            : Math.max(1, rect.width - (grid ? spacing.horizontal * (grid.colSpan - 1) : 0));
          const adjustedHeight = original.tagName === "TABLE"
            ? tableHeight
            : Math.max(1, rect.height - (grid ? spacing.vertical * (grid.rowSpan - 1) : 0));
          copied.style.width = `${adjustedWidth}px`;
          copied.style.height = `${adjustedHeight}px`;
          copied.style.minWidth = `${adjustedWidth}px`;
          copied.style.maxWidth = `${adjustedWidth}px`;
        }
      });
      clone.style.margin = "0";
      clone.style.transform = "none";
      clone.style.width = `${width}px`;
      clone.style.height = `${tableHeight}px`;
      clone.style.borderCollapse = "collapse";
      clone.style.borderSpacing = "0";
      clone.style.maxWidth = "none";
      clone.style.overflow = "visible";
      clone.querySelectorAll("th, td").forEach((cell) => {
        cell.style.border = "0.5px solid #a9a9a9";
        cell.style.borderColor = "#a9a9a9";
      });
      clone.querySelectorAll("th.track-name-cell").forEach((cell) => {
        cell.style.textAlign = "center";
        cell.style.fontSize = "12px";
      });
      clone.querySelectorAll("td.track-photo-cell").forEach((cell) => {
        cell.style.borderRadius = "0";
        cell.style.overflow = "hidden";
      });
      clone.querySelectorAll("img.track-contestant-photo, td.track-photo-cell img").forEach((image) => {
        image.style.borderRadius = "0";
      });
      clone.querySelectorAll("td.no-cell").forEach((cell) => {
        cell.style.background = "#a9a9a9";
        cell.style.backgroundImage = "none";
        cell.style.border = "0";
        cell.style.borderColor = "transparent";
        cell.style.boxShadow = "none";
      });

      const originalImages = Array.from(source.querySelectorAll("img"));
      const clonedImages = Array.from(clone.querySelectorAll("img"));
      await Promise.all(originalImages.map(async (image, index) => {
        const copied = clonedImages[index];
        if (!copied) return;
        copied.removeAttribute("srcset");
        copied.removeAttribute("sizes");
        copied.src = await trackExportImageData(image);
      }));

      const wrapper = document.createElement("div");
      wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;
      wrapper.style.margin = "0";
      wrapper.style.padding = "0";
      wrapper.style.overflow = "hidden";
      wrapper.style.background = "#101114";
      wrapper.style.fontFamily = getComputedStyle(document.body).fontFamily;
      const title = document.createElement("div");
      title.textContent = String(state.config.seasonName || "Drag Race Season");
      title.style.height = `${titleHeight}px`;
      title.style.display = "flex";
      title.style.alignItems = "center";
      title.style.justifyContent = "center";
      title.style.color = "#ffffff";
      title.style.fontSize = "20px";
      title.style.fontWeight = "700";
      title.style.textAlign = "center";
      wrapper.appendChild(title);
      wrapper.appendChild(clone);
      const serialized = new XMLSerializer().serializeToString(wrapper);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%">${serialized}</foreignObject></svg>`;
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(svgBlob);
      try {
        const output = await loadTrackExportImage(objectUrl);
        const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const context = canvas.getContext("2d");
        context.scale(scale, scale);
        context.drawImage(output, 0, 0, width, height);
        downloadCanvasPng(canvas, filename);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.warn("Styled Track Record export failed; using the measured table fallback.", error);
      await downloadTrackRecordCanvasFallback(source, filename);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = previousText;
      }
    }
  }


  function trackLabelsThroughEpisode(season, episodeIndex) {
    const labels = new Set();
    (season.episodes || []).slice(0, Number(episodeIndex || 0) + 1).forEach((ep) => {
      if (ep?.label) labels.add(ep.label);
    });
    return labels;
  }

  function trackPpeForLabels(id, allowedLabels) {
    const entries = (state.season.stats[id]?.track || []).filter((entry) => entry.label !== "Finale" && allowedLabels.has(entry.label) && trackEntryPpeValue(entry) != null);
    if (!entries.length) return "—";
    const total = entries.reduce((sum, entry) => sum + trackEntryPpeValue(entry), 0);
    return (total / entries.length).toFixed(2);
  }

  function episodePlacementRankForEntry(entry) {
    const token = String(entry?.token || "");
    const display = String(entry?.display || "").toUpperCase();
    if (token === "WINNER") return 0;
    if (token === "RU" || display.includes("RUNNER")) return 1;
    if (token === "RUN") return 2;
    if (token === "TOP4") return 3;
    if (isQuitOrDisqTrackToken(token)) return 14;
    if (token === "WIN" || token === "DWIN" || token === "PWIN" || token === "REUNION_WIN" || token === "FAME_GAMES") {
      const extra = Array.isArray(entry?.extraClasses) ? entry.extraClasses : [];
      return extra.includes("legacy-loser-win") ? 4.5 : 4;
    }
    if (token === "TOP2") return 5;
    if (token === "HIGH" || token === "HIGH_BLK") return 6;
    if (["SAFE", "BLK", "IMM", "RTRN", "IN"].includes(token)) return 7;
    if (token === "LALA_R1") return 8;
    if (token === "LALA_R2") return 9;
    if (token === "LALA_R3") return 10;
    if (token === "LALA_R4") return 11;
    if (token === "LALA_R5") return 11.5;
    if (token === "LOW") return 12;
    if (token === "CHOC" || token === "BTM" || token === "BTM1" || token === "BTM2" || /^BTM\d+$/.test(token)) return 13;
    if (token === "ELIM" || token === "QUIT" || token === "BTM2_QUIT" || token === "DEPT" || token === "DISQ" || token === "OUT" || token === "PLOSS" || token === "PCHOP") return 14;
    return 99;
  }

  function episodeTrackRecordOrder(season, ep, labels) {
    const currentLabel = ep?.label || "";
    const allowedLabels = labels instanceof Set ? labels : new Set(labels || []);
    const labelOrder = new Map(trackColumnDefinitions(season).map((col, index) => [col.label, index]));
    const scoreRank = new Map((ep?.scores || []).map((score, index) => [score.id, index]));
    const fallbackOrder = seasonPlacementOrder();
    const activeSet = new Set(ep?.activeStartIds || []);
    const isTournamentBracketEpisode = !!ep?.tournamentBracketId;

    const entryForLabel = (id, label) => [...(season.stats[id]?.track || [])].reverse().find((entry) => entry.label === label) || null;
    const lastVisibleEntry = (id) => [...(season.stats[id]?.track || [])].reverse().find((entry) => allowedLabels.has(entry.label) && entry.token) || null;
    const fallbackPosition = (id) => {
      const index = fallbackOrder.indexOf(id);
      return index < 0 ? 9999 : index;
    };

    return (season.castOrder || []).filter((id) => season.contestants?.[id] && season.stats?.[id]).slice().sort((a, b) => {
      const aEntry = entryForLabel(a, currentLabel);
      const bEntry = entryForLabel(b, currentLabel);
      const aCurrent = !!aEntry;
      const bCurrent = !!bEntry;

      if (aCurrent || bCurrent) {
        if (aCurrent && bCurrent) {
          const ar = episodePlacementRankForEntry(aEntry);
          const br = episodePlacementRankForEntry(bEntry);
          if (ar !== br) return ar - br;
          if (String(aEntry?.token || "") === "SAFE" && String(bEntry?.token || "") === "SAFE") {
            const alpha = fullDisplayName(season.contestants[a]).localeCompare(fullDisplayName(season.contestants[b]));
            if (alpha) return alpha;
          }
          const as = scoreRank.has(a) ? scoreRank.get(a) : 999;
          const bs = scoreRank.has(b) ? scoreRank.get(b) : 999;
          if (as !== bs) return as - bs;
        } else if (isTournamentBracketEpisode) {
          const aActive = activeSet.has(a);
          const bActive = activeSet.has(b);
          if (aActive !== bActive) return aActive ? -1 : 1;
        } else {
          return aCurrent ? -1 : 1;
        }
      }

      const aLast = lastVisibleEntry(a);
      const bLast = lastVisibleEntry(b);
      const aHasHistory = !!aLast;
      const bHasHistory = !!bLast;
      if (isTournamentBracketEpisode && aHasHistory !== bHasHistory) return aHasHistory ? -1 : 1;
      if (aLast || bLast) {
        const aLabelIndex = aLast ? (labelOrder.get(aLast.label) ?? -1) : -1;
        const bLabelIndex = bLast ? (labelOrder.get(bLast.label) ?? -1) : -1;
        if (aLabelIndex !== bLabelIndex) return bLabelIndex - aLabelIndex;
        const ar = episodePlacementRankForEntry(aLast);
        const br = episodePlacementRankForEntry(bLast);
        if (ar !== br) return ar - br;
      }

      return (fallbackPosition(a) - fallbackPosition(b)) || fullDisplayName(season.contestants[a]).localeCompare(fullDisplayName(season.contestants[b]));
    });
  }


  function renderTrackRecordTableHtml(options = {}) {
    const season = state.season;
    const episodeIndex = options.episodeIndex == null ? null : Number(options.episodeIndex);
    const limited = Number.isFinite(episodeIndex);
    const labelsThroughEpisode = limited ? trackLabelsThroughEpisode(season, episodeIndex) : null;
    const columns = trackColumnDefinitions(season).filter((col) => !limited || labelsThroughEpisode.has(col.label));
    const labels = columns.map((col) => col.label);
    const titleByLabel = new Map(columns.map((col) => [col.label, col.title || col.label]));
    const rowIds = limited ? episodeTrackRecordOrder(season, season.episodes[episodeIndex], labelsThroughEpisode) : seasonPlacementOrder();
    const rows = rowIds.map((id) => {
      const stats = season.stats[id];
      const byLabel = new Map(stats.track.filter((entry) => !limited || labelsThroughEpisode.has(entry.label)).map((x) => [x.label, x]));
      let out = false;
      const cells = labels.map((label) => {
        const entry = byLabel.get(label) || null;
        const token = entry?.token || "";
        if (token === "RTRN") out = false;
        const blank = !token;
        const afterElim = out && blank;
        const extra = (entry?.extraClasses || []).join(" ");
        const finalClass = String(label).toLowerCase() === "finale" ? " finale-col" : "";
        const classes = blank || afterElim ? "no-cell" : `${escapeHtml(tokenClass(token))} ${escapeHtml(extra)}`;
        const cellTitle = titleByLabel.get(label) || label;
        const cell = `<td class="track-cell${finalClass} ${classes}" title="${escapeHtml(cellTitle)}">${blank || afterElim ? "" : trackDisplayHtml(entry)}</td>`;
        if (isTrackExitToken(token) || entry?.eliminated) out = true;
        return cell;
      }).join("");
      const nameAttrs = tournamentTrackNameCellAttrs(season, id);
      const trackNameAttrs = nameAttrs ? nameAttrs.replace(' class="', ' class="track-name-cell ') : ' class="track-name-cell"';
      const contestant = season.contestants[id] || {};
      const contestantName = fullDisplayName(contestant);
      const contestantImage = contestant.image || PLACEHOLDER;
      const ppe = limited ? trackPpeForLabels(id, labelsThroughEpisode) : trackPpeFor(id);
      const contestantExportImage = contestant.exportImage || contestantImage;
      return `<tr><th${trackNameAttrs}>${tournamentContestantNameHtml(season, id, escapeHtml(contestantName))}</th><td class="track-photo-cell"><img class="track-contestant-photo" src="${escapeHtml(contestantImage)}" data-export-src="${escapeHtml(contestantExportImage)}" alt="${escapeHtml(contestantName)}"></td>${cells}<td class="track-cell ppe-cell">${escapeHtml(ppe)}</td></tr>`;
    }).join("");
    const episodeHeadRow = `<tr class="track-episode-row"><th class="track-contestant-head" colspan="2" rowspan="2">Contestant</th>${columns.map((col) => {
      const isFinale = String(col.label).toLowerCase() === "finale";
      return `<th class="${isFinale ? "finale-col" : ""}"${isFinale ? ' rowspan="2"' : ""} title="${escapeHtml(col.title || col.label)}">${trackHeaderHtml(col)}</th>`;
    }).join("")}<th class="ppe-col" rowspan="2">PPE</th></tr>`;
    const challengeHeadRow = `<tr class="track-challenge-row">${columns.filter((col) => String(col.label).toLowerCase() !== "finale").map((col) => `<th class="track-challenge-type-head" title="${escapeHtml(col.title || col.label)}">${trackChallengeHeaderHtml(col)}</th>`).join("")}</tr>`;
    const colgroup = `<colgroup><col class="track-name-col"><col class="track-photo-col">${columns.map((col) => `<col class="${String(col.label).toLowerCase() === "finale" ? "track-finale-col" : "track-episode-col"}">`).join("")}<col class="track-ppe-col"></colgroup>`;
    return `<div class="stat-table-shell"><table class="stats-table modern-stat-table track-table${limited ? " episode-track-table" : ""}">${colgroup}<thead>${episodeHeadRow}${challengeHeadRow}</thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderEpisodeTrackRecordPanel(ep) {
    if (!els.episodeTrackWrap || !state.season || !ep) return;
    const index = state.season.episodes.indexOf(ep);
    els.episodeTrackWrap.innerHTML = renderTrackRecordTableHtml({ episodeIndex: Math.max(0, index) });
  }

  function renderTrackRecord() {
    if (!state.season || !els.trackWrap) return;
    const season = state.season;
    els.trackWrap.innerHTML = renderTrackRecordTableHtml();
    const presentLegendTokens = new Set();
    season.castOrder.forEach((id) => (season.stats[id]?.track || []).forEach((entry) => {
      if (!entry?.token) return;
      presentLegendTokens.add(entry.token);
      if (entry.eliminated) presentLegendTokens.add("ELIM");
      if ((entry.extraClasses || []).includes("golden-beaver-save")) presentLegendTokens.add("LOW + GOLD");
      if ((entry.extraClasses || []).includes("lucky-cow-save")) presentLegendTokens.add("LC BORDER");
      if ((entry.extraClasses || []).includes("badonka-save")) presentLegendTokens.add("DUNK BORDER");
    }));
    const legendTokenPresent = (token) => {
      if (presentLegendTokens.has(token)) return true;
      if (token === "BTM" && Array.from(presentLegendTokens).some((value) => /^BTM\d+$/.test(value))) return true;
      if (token === "LOST" && Array.from(presentLegendTokens).some((value) => /^REUNION_LOST_R/.test(value))) return true;
      if (token === "WIN" && presentLegendTokens.has("REUNION_WIN")) return true;
      if (token === "HIGH+BLK" && presentLegendTokens.has("HIGH_BLK")) return true;
      if (token === "LOW + GOLD" && presentLegendTokens.has("LOW + GOLD")) return true;
      if (["LC BORDER", "DUNK BORDER"].includes(token) && presentLegendTokens.has(token)) return true;
      return false;
    };
    els.trackLegend.innerHTML = trackLegend
      .filter(([token]) => legendTokenPresent(token))
      .map(([token, desc]) => {
        const displayToken = token === "WIN_QUIT" ? "WIN + QUIT" : token === "BTM2_QUIT" ? "BTM2 + QUIT" : token;
        return `<span class="legend-key track-legend-card ${escapeHtml(tokenClass(token))}"><strong>${escapeHtml(displayToken)}</strong><span>${escapeHtml(desc)}</span></span>`;
      }).join("");
  }

  function statLipSyncSongHtml(ls) {
    const song = ls?.song || {};
    return `<strong>${escapeHtml(song.title || song.song || song.name || "Unknown Song")}</strong><br><span>${escapeHtml(song.artist || song.media || "")}</span>`;
  }

  function lipSyncStatsIdentity(ls) {
    if (!ls) return "";
    const song = ls.song || {};
    const songKey = song.id || song.title || song.song || song.name || "";
    const idsKey = (ls.ids || []).slice().sort().join("|");
    return [
      String(ls.context || ""),
      idsKey,
      String(songKey || ""),
      String(ls.roundNumber || ""),
      String(ls.roundPosition || ""),
      String(ls.resultType || ""),
      String(ls.winnerId || ""),
      String(ls.loserId || ls.eliminatedId || "")
    ].join("::");
  }

  function crownLipSyncsForStats(ep) {
    if (!ep) return [];
    if (ep.allWinnersCrownSmackdown?.lipSyncs?.length) {
      return ep.allWinnersCrownSmackdown.lipSyncs.filter((ls) => ls && (ls.ids || []).length);
    }
    const direct = [ep.lipSync].filter((ls) => ls && (ls.ids || []).length);
    if (ep.lsftcFinale && direct.length) return direct;
    return direct.length ? direct : (ep.extraLipSyncs || []).filter((ls) => ls && (ls.ids || []).length && /(?:crown|lsftc|all_winners)/i.test(`${ls.context || ""} ${ls.resultType || ""}`));
  }

  function collectLipSyncsForStats(ep) {
    const rows = [];
    const seen = new Set();
    const seenObjects = typeof WeakSet !== "undefined" ? new WeakSet() : null;
    let sequence = 0;

    const add = (ls) => {
      if (!ls || !(ls.ids || []).length) return;
      if (seenObjects && typeof ls === "object") {
        if (seenObjects.has(ls)) return;
        seenObjects.add(ls);
      }
      const key = lipSyncStatsIdentity(ls);
      if (seen.has(key)) return;
      seen.add(key);
      ls.__statSequence = sequence++;
      rows.push(ls);
    };

    const addMany = (items) => (items || []).filter(Boolean).forEach(add);
    if (!ep) return rows;

    if (isAllWinnersFormat(state.season) && ep.type === "finale" && ep.allWinnersFinale) {
      addMany(ep.allWinnersHersesSmackdown?.lipSyncs || []);
      addMany(crownLipSyncsForStats(ep));
      return rows;
    }

    if (ep.type === "finale") {
      if (ep.lsftcFinale || ep.allWinnersCrownSmackdown?.lipSyncs?.length) {
        addMany(crownLipSyncsForStats(ep));
      } else {
        add(ep.lipSync);
      }
      return rows;
    }

    if (["special_lalaparuza", "special_slayoffs", "lsftf"].includes(ep.type)) {
      addMany(ep.extraLipSyncs || []);
      if (ep.type !== "lsftf") add(ep.lipSync);
      return rows;
    }

    if (ep.type === "reunion_lalaparuza") {
      addMany(ep.extraLipSyncs || []);
      add(ep.lipSync);
      return rows;
    }

    if (ep.comeback?.format === "lalaparuza_comeback" || ep.comeback?.format === "game_within_a_game") {
      addMany(ep.extraLipSyncs || []);
      add(ep.lipSync);
      return rows;
    }

    add(ep.lipSync);
    addMany(ep.extraLipSyncs || []);
    return rows;
  }

  function isCrownLipSync(ls, ep = null) {
    if (!ls || !ep || ep.type !== "finale") return false;
    const resultType = String(ls.resultType || "").toLowerCase();
    const context = String(ls.context || "").toLowerCase();
    const crownParts = (ep.lsftcFinale || ep.allWinnersCrownSmackdown) ? allWinnersCrownParts(ep) : null;
    if (crownParts?.finalLipSync && ls === crownParts.finalLipSync) return true;
    if (resultType === "all_winners_final_round" || resultType === "crown_final" || resultType === "lsftc_final") return true;
    if (resultType === "qosdadhh_final") return false;
    if (ls.isFinalRound && (ep.winnerIds || []).includes(ls.winnerId)) return true;
    if (ls === ep.lipSync && (ep.winnerIds || []).some((id) => (ls.ids || []).includes(id))) return true;
    return (context.includes("final") && context.includes("crown")) || context.includes("final lip sync for the crown");
  }

  function isForTheWinLipSync(ls, ep = null) {
    if (!ls) return false;
    if (isCrownLipSync(ls, ep)) return true;
    const context = String(ls.context || "").toLowerCase();
    const resultType = String(ls.resultType || "").toLowerCase();
    const eliminationTypes = new Set([
      "elimination",
      "double_sashay",
      "team_elimination",
      "team_pair_elimination",
      "team_top_four_elimination",
      "slayoffs_bottom",
      "lalaparuza_final",
      "lsftf_final",
      "mid_season_rate_a_queen_bottom1",
      "cunt_test_final_spot"
    ]);
    if (eliminationTypes.has(resultType) || /(?:^|_)elimination(?:_|$)/.test(resultType)) return false;
    if (/^(?:lalaparuza_round|reunion_lalaparuza_round|slayoffs_round|lsftf_round|all_winners_smackdown_round|qosdadhh_round)/.test(resultType)) return true;
    if (["qosdadhh_final", "lalaparuza_comeback", "game_within_a_game", "fame_games_multiplier", "porkchop_battle"].includes(resultType)) return true;
    if (lipSyncEliminatesContestant(ls, ep) && !["double_shantay", "lucky_cow_save", "badonka_save"].includes(resultType)) return false;
    return context.includes("top two") || context.includes("for the win") || context.includes("legacy") || context.includes("lsftc") || context.includes("lip sync for the crown");
  }

  function smackdownRoundClass(ls, ep = null) {
    if (!ls) return "";
    if (isCrownLipSync(ls, ep)) return "ls-lalaparuza-final";
    const resultType = String(ls.resultType || "").toLowerCase();
    const context = String(ls.context || "").toLowerCase();
    const isSmackdown = /(?:lalaparuza|slayoffs_round|reunion_lalaparuza|lsftf_round|all_winners_smackdown_round|qosdadhh_round|qosdadhh_final|game_within_a_game|porkchop_battle)/.test(resultType)
      || context.includes("lalaparuza")
      || context.includes("lsftc")
      || context.includes("lip sync for the crown")
      || context.includes("lip sync for the finale")
      || context.includes("she done already done had herses");
    if (!isSmackdown || !isForTheWinLipSync(ls, ep)) return "";
    const round = clamp(Number(ls.roundNumber || 1), 1, 5);
    return `ls-lalaparuza-r${round}`;
  }

  function lipSyncWinnerOutcomeClass(ls, ep = null) {
    const smackdownClass = smackdownRoundClass(ls, ep);
    if (smackdownClass) return smackdownClass;
    if (isCrownLipSync(ls, ep)) return "ls-lalaparuza-final";
    return "ls-win-top";
  }

  function lipSyncPurposeForStats(ep, ls) {
    if (isCrownLipSync(ls, ep)) return { key: "crown", label: "For The Crown", className: "ls-purpose-crown" };
    if (isForTheWinLipSync(ls, ep)) return { key: "winner", label: "For The Win", className: "ls-purpose-win" };
    return { key: "eliminated", label: "Eliminated", className: "ls-purpose-elim" };
  }

  function lipSyncHeaderForStats(ep, ls) {
    return lipSyncPurposeForStats(ep, ls);
  }

  function lipSyncStatOutcome(ep, ls, bottomLipSyncCounts = {}) {
    const eliminated = (ep.eliminatedIds || []).filter((id) => !(state.season.contestants[id]?.isAssassin));
    const lsEliminated = eliminated.filter((id) => (ls.ids || []).includes(id) && !lipSyncWasSavedByTwist(ep, id));
    const nonEliminationText = lipSyncNonEliminationText(ep, ls);
    const isBottomLipSync = !isForTheWinLipSync(ls, ep) && !ls.isAssassinLipSync && !(ep.legacyLipsticks || []).length;
    let outcomeText = nonEliminationText ? "Non-Elimination" : "None";
    let outcomeClass = "ls-none";

    if (String(ls?.resultType || "").toLowerCase() === "double_shantay") {
      outcomeText = "None";
      outcomeClass = "ls-none";
    } else if (isCrownLipSync(ls, ep)) {
      const winnerIds = (ep.winnerIds || []).filter((id) => (ls.ids || []).includes(id));
      outcomeText = statContestantList(winnerIds.length ? winnerIds : [ls.winnerId].filter(Boolean), " / ") || "—";
      outcomeClass = lipSyncWinnerOutcomeClass(ls, ep);
    } else if ((ep.legacyLipsticks || []).length && lsEliminated.length) {
      outcomeText = statContestantList(lsEliminated, " / ");
      outcomeClass = lipSyncOutcomeClass(Math.max(...lsEliminated.map((id) => bottomLipSyncCounts[id] || 1)));
    } else if (ls.isAssassinLipSync && lsEliminated.length) {
      outcomeText = statContestantList(lsEliminated, " / ");
      outcomeClass = lipSyncOutcomeClass(Math.max(...lsEliminated.map((id) => bottomLipSyncCounts[id] || 1)));
    } else if (nonEliminationText) {
      outcomeText = "Non-Elimination";
      outcomeClass = "ls-none";
    } else if (isForTheWinLipSync(ls, ep)) {
      outcomeText = statContestantInline(ls.winnerId);
      outcomeClass = lipSyncWinnerOutcomeClass(ls, ep);
    } else if (isBottomLipSync && lsEliminated.length) {
      outcomeText = statContestantList(lsEliminated, " / ");
      outcomeClass = lipSyncOutcomeClass(Math.max(...lsEliminated.map((id) => bottomLipSyncCounts[id] || 1)));
    } else if (ls.winnerId && !lsEliminated.length) {
      outcomeText = statContestantInline(ls.winnerId);
      outcomeClass = lipSyncWinnerOutcomeClass(ls, ep);
    }

    return { outcomeText, outcomeClass };
  }

  function lipSyncStatsChoppedIds(ep) {
    return (ep?.eliminatedIds || []).filter((id) => id && !state.season.contestants[id]?.isAssassin);
  }

  function trackBottomCountThroughEpisode(id, ep) {
    if (!state.season?.stats?.[id] || !ep) return 1;
    const columns = trackColumnDefinitions(state.season);
    const order = new Map(columns.map((col, index) => [col.label, index]));
    const epIndex = order.get(ep.label);
    const isBottomToken = (entry) => {
      const token = String(entry?.token || "");
      const display = String(entry?.display || "");
      if (/^BTM\d*$/.test(token) || token === "BTM" || token === "CHOC") return true;
      if (token === "ELIM" || isUnplannedExitToken(token) || entry?.eliminated) return true;
      if (/\bELIM\b/.test(display) && !["WINNER", "RU", "RUN"].includes(token)) return true;
      return false;
    };
    const count = (state.season.stats[id].track || []).filter((entry) => {
      if (!entry || entry.label === "Entry") return false;
      const index = order.get(entry.label);
      if (Number.isFinite(epIndex) && Number.isFinite(index) && index > epIndex) return false;
      return isBottomToken(entry);
    }).length;
    return Math.max(1, count);
  }

  function lipSyncStatsWinnerHtml(ls, ep) {
    const winnerIds = isCrownLipSync(ls, ep)
      ? ((ep?.winnerIds || []).filter((id) => (ls.ids || []).includes(id)))
      : [];
    const ids = winnerIds.length ? winnerIds : [ls?.winnerId].filter(Boolean);
    return statContestantList(ids, " / ") || "—";
  }

  function renderAllWinnersLipSyncStats() {
    const rows = [];
    const blockCountsSeen = {};
    state.season.episodes.forEach((ep) => {
      const blockedIdForEpisode = ep.allWinnersBlockTargetId || ep.allWinnersTrackBlockedId || null;
      let blockedClass = "";
      let blockedHtml = "—";
      if (ep.allWinnersEpisode) {
        if (blockedIdForEpisode) {
          blockCountsSeen[blockedIdForEpisode] = Number(blockCountsSeen[blockedIdForEpisode] || 0) + 1;
          blockedClass = blockCountsSeen[blockedIdForEpisode] <= 1 ? "aw-blocked-first" : "aw-blocked-second";
          blockedHtml = statContestantInline(blockedIdForEpisode);
        } else {
          blockedHtml = "None";
        }
      }

      collectLipSyncsForStats(ep).forEach((ls) => {
        const contestantsHtml = (ls.ids || []).map((id) => statContestantInline(id)).join(`<span class="stat-separator"> vs. </span>`);
        const winnerClass = lipSyncWinnerOutcomeClass(ls, ep);
        rows.push(`<tr><td>${escapeHtml(statEpisodeLabel(ep.label))}</td><td class="lip-sync-contestants all-winners-stat-matchup">${contestantsHtml}</td><td>${statLipSyncSongHtml(ls)}</td><td class="lip-sync-result ${winnerClass}">${lipSyncStatsWinnerHtml(ls, ep)}</td><td class="lip-sync-blocked-cell ${blockedClass}">${blockedHtml}</td></tr>`);
      });
    });
    els.lipSyncStatsWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table lip-sync-stats-table all-winners-lip-sync-stats-table"><thead><tr><th>Episode</th><th>Contestants</th><th>Song</th><th>Winner</th><th>Blocked</th></tr></thead><tbody>${rows.join("") || `<tr><td colspan="5">No lip syncs recorded.</td></tr>`}</tbody></table></div>`;
  }

  function renderDualOutcomeLipSyncStats() {
    const rows = [];

    state.season.episodes.forEach((ep) => {
      collectLipSyncsForStats(ep).forEach((ls) => {
        const choppedIds = lipSyncStatsChoppedIds(ep);
        const lipstickByVoter = new Map((ep.legacyLipsticks || []).map((vote) => [vote.voterId, fullDisplayName(state.season.contestants[vote.lipstickId] || { id: vote.lipstickId })]));
        if (ls.isAssassinLipSync) {
          if (ep.assassinWinnerChoiceId) lipstickByVoter.set(ep.winnerIds?.[0], `Top: ${fullDisplayName(state.season.contestants[ep.assassinWinnerChoiceId] || { id: ep.assassinWinnerChoiceId })}`);
          if (ls.assassinId && ep.assassinGroupChoiceId) lipstickByVoter.set(ls.assassinId, `Group: ${fullDisplayName(state.season.contestants[ep.assassinGroupChoiceId] || { id: ep.assassinGroupChoiceId })}`);
        }
        const contestantsHtml = (ls.ids || []).map((id) => statContestantInlineWithNote(id, lipstickByVoter.get(id) || "")).join(`<span class="stat-separator"> vs. </span>`);
        const maxBottomCount = choppedIds.length ? Math.max(...choppedIds.map((id) => trackBottomCountThroughEpisode(id, ep))) : 0;
        const choppedClass = choppedIds.length ? lipSyncOutcomeClass(maxBottomCount) : "ls-none";
        rows.push(`<tr><td>${escapeHtml(statEpisodeLabel(ep.label))}</td><td class="lip-sync-contestants">${contestantsHtml}</td><td>${statLipSyncSongHtml(ls)}</td><td class="lip-sync-result ${lipSyncWinnerOutcomeClass(ls, ep)}">${lipSyncStatsWinnerHtml(ls, ep)}</td><td class="lip-sync-result ${choppedClass}">${choppedIds.length ? statContestantList(choppedIds, " / ") : "None"}</td></tr>`);
      });
    });

    els.lipSyncStatsWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table lip-sync-stats-table"><thead><tr><th>Episode</th><th>Contestants</th><th>Song</th><th>Winner</th><th>Eliminated</th></tr></thead><tbody>${rows.join("") || `<tr><td colspan="5">No lip syncs recorded.</td></tr>`}</tbody></table></div>`;
  }

  function renderLipSyncStats() {
    if (isAllWinnersFormat(state.season)) {
      renderAllWinnersLipSyncStats();
      return;
    }
    if (isLegacyFormat(state.season) || isAssassinFormat(state.season)) {
      renderDualOutcomeLipSyncStats();
      return;
    }

    const rows = [];
    const bottomLipSyncCounts = {};
    let currentHeader = "";

    const pushHeaderIfNeeded = (label) => {
      if (currentHeader === label) return;
      currentHeader = label;
      rows.push(`<tr class="lip-sync-header-row"><th>Episode</th><th>Contestants</th><th>Song</th><th>${escapeHtml(label)}</th></tr>`);
    };

    state.season.episodes.forEach((ep) => {
      const lipSyncs = collectLipSyncsForStats(ep);
      lipSyncs.forEach((ls) => {
        const bottomCountingLipSync = !isForTheWinLipSync(ls, ep) && !ls.isAssassinLipSync && !(ep.legacyLipsticks || []).length;
        if (bottomCountingLipSync) (ls.ids || []).forEach((id) => { if (state.season.stats[id]) bottomLipSyncCounts[id] = (bottomLipSyncCounts[id] || 0) + 1; });
      });

      lipSyncs.forEach((ls) => {
        const forWin = isForTheWinLipSync(ls, ep) || isCrownLipSync(ls, ep);
        const headerLabel = forWin ? "Winner" : (lipSyncNonEliminationText(ep, ls) ? "Result" : "Eliminated");
        pushHeaderIfNeeded(headerLabel);
        const contestantsHtml = (ls.ids || []).map((id) => statContestantInline(id)).join(`<span class="stat-separator"> vs. </span>`);
        const { outcomeText, outcomeClass } = lipSyncStatOutcome(ep, ls, bottomLipSyncCounts);
        rows.push(`<tr><td>${escapeHtml(statEpisodeLabel(ep.label))}</td><td class="lip-sync-contestants">${contestantsHtml}</td><td>${statLipSyncSongHtml(ls)}</td><td class="lip-sync-result ${outcomeClass}">${outcomeText}</td></tr>`);
      });
    });
    els.lipSyncStatsWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table lip-sync-stats-table variable-lip-sync-stats-table"><tbody>${rows.join("") || `<tr><td colspan="4">No lip syncs recorded.</td></tr>`}</tbody></table></div>`;
  }


  function runwayOutcomeFor(score, sortedScores) {
    const values = (sortedScores || []).slice().sort((a, b) => b - a);
    if (!values.length || !Number.isFinite(score)) return "";
    const index = values.findIndex((value) => value === score);
    const rank = index < 0 ? values.length - 1 : index;
    const percentile = values.length <= 1 ? 0.5 : 1 - (rank / (values.length - 1));
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const scorePosition = maximum === minimum ? 0.5 : clamp((score - minimum) / (maximum - minimum), 0, 1);
    const absoluteScore = clamp((score - 30) / 65, 0, 1);
    const runwayStrength = clamp(percentile * 0.48 + scorePosition * 0.30 + absoluteScore * 0.22, 0, 1);
    const runwayOutcomeSeed = (score + 31) * 19.919 + (rank + 3) * 61.631 + values.length * 13.137;
    const pseudo = Math.abs(Math.sin(runwayOutcomeSeed) * 43758.5453123) % 1;

    const shootPeak = Math.max(0, (runwayStrength - 0.84) / 0.16);
    const scootPeak = Math.max(0, (0.16 - runwayStrength) / 0.16);
    const shootChance = clamp(0.0015 + Math.pow(shootPeak, 2.4) * 0.017, 0.0015, 0.0185);
    const scootChance = clamp(0.001 + Math.pow(scootPeak, 2.6) * 0.011, 0.001, 0.012);

    if (pseudo < shootChance) return "SHOOT";
    if (pseudo > 1 - scootChance) return "SCOOT";

    const tootChance = clamp(0.28 + runwayStrength * 0.69, 0.28, 0.97);
    return pseudo < tootChance ? "TOOT" : "BOOT";
  }

  function runwayOutcomeClass(token) {
    return `runway-${String(token || "blank").toLowerCase()}`;
  }

  function runwayStatTitle(ep) {
    const name = ep.runway?.name || "Runway";
    return ep.runwayUsesChallengeScore ? `${name} — based on challenge performance` : name;
  }

  function renderRunwayStats() {
    const runwayEpisodes = state.season.episodes.filter((ep) => ep.runway && (ep.scores || []).some((score) => Number.isFinite(Number(score.runwayScore))));
    if (!runwayEpisodes.length) {
      els.runwayStatsWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table runway-stats-table runway-rank-table"><tbody><tr><td>No runways recorded.</td></tr></tbody></table></div>`;
      return;
    }
    const rows = seasonPlacementOrder().map((id) => {
      const cells = runwayEpisodes.map((ep) => {
        const score = (ep.scores || []).find((x) => x.id === id);
        if (!score) return `<td class="runway-rank-cell runway-blank"></td>`;
        const values = (ep.scores || []).map((x) => Number(x.runwayScore)).filter(Number.isFinite);
        const token = runwayOutcomeFor(Number(score.runwayScore), values);
        return `<td class="runway-rank-cell ${runwayOutcomeClass(token)}" title="${escapeHtml(runwayStatTitle(ep))}">${escapeHtml(token)}</td>`;
      }).join("");
      return `<tr><th>${statContestantInline(id)}</th>${cells}</tr>`;
    }).join("");
    els.runwayStatsWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table runway-stats-table runway-rank-table"><thead><tr><th>Contestant</th>${runwayEpisodes.map((ep) => `<th title="${escapeHtml(runwayStatTitle(ep))}">${escapeHtml(statEpisodeLabel(ep.label))}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td>No runways recorded.</td></tr>`}</tbody></table></div>`;
  }

  function renderChallengeStats() {
    const rows = state.season.episodes.filter((ep) => ep.challenge).map((ep) => {
      const winnerIds = ((isLegacyFormat(state.season) || isAllWinnersFormat(state.season)) && ep.top2Ids?.length) ? ep.top2Ids : (ep.winnerIds || []);
      return `<tr><td>${escapeHtml(statEpisodeLabel(ep.label))}</td><td>${escapeHtml(ep.challenge.name)}</td><td>${escapeHtml(challengeTypeLabel(ep.challenge.type))}</td><td>${winnerIds.length ? statContestantList(winnerIds, " / ") : "—"}</td></tr>`;
    }).join("");
    els.challengeStatsWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table challenge-stats-table"><thead><tr><th>Episode</th><th>Challenge</th><th>Type</th><th>Winner</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function popularitySeriesColor(index, total) {
    const hue = (18 + index * 137.508 + (total % 5) * 9) % 360;
    const lightness = index % 3 === 0 ? 62 : index % 3 === 1 ? 70 : 56;
    return `hsl(${hue.toFixed(1)} 78% ${lightness}%)`;
  }

  function popularityEpisodeText(label) {
    const match = String(label || "").match(/(\d+)/);
    return match ? `Episode ${match[1]}` : String(label || "Episode");
  }

  function renderPopularityStats() {
    if (!els.popularityWrap || !state.season) return;
    const season = state.season;
    const ids = seasonPlacementOrder().filter((id) => season.contestants?.[id] && season.stats?.[id]);
    const episodeLabels = (season.episodes || []).filter((episode) => episode.type !== "finale").map((episode) => episode.label);
    const labels = ["Preseason", ...episodeLabels];

    ids.forEach((id) => {
      const stats = season.stats[id];
      stats.popularity = clamp(Number(stats.popularity ?? 50), 0, 100);
      stats.popularityHistory = (stats.popularityHistory || []).map((entry) => ({
        ...entry,
        value: clamp(Number(entry.value ?? 50), 0, 100)
      }));
    });

    if (!ids.length || !labels.length) {
      els.popularityWrap.innerHTML = `<div class="empty-state">No popularity history is available yet.</div>`;
      return;
    }

    const chartWidth = Math.max(780, 130 + labels.length * 82);
    const chartHeight = 390;
    const left = 58;
    const right = 26;
    const top = 24;
    const bottom = 58;
    const plotWidth = chartWidth - left - right;
    const plotHeight = chartHeight - top - bottom;
    const xFor = (index) => left + (labels.length <= 1 ? plotWidth / 2 : (index / (labels.length - 1)) * plotWidth);
    const yFor = (value) => top + ((100 - clamp(Number(value), 0, 100)) / 100) * plotHeight;
    const yTicks = [0, 25, 50, 75, 100];

    const grid = yTicks.map((tick) => {
      const y = yFor(tick);
      return `<g class="popularity-grid-line"><line x1="${left}" y1="${y}" x2="${chartWidth - right}" y2="${y}"></line><text x="${left - 10}" y="${y + 4}" text-anchor="end">${tick}</text></g>`;
    }).join("");

    const xLabels = labels.map((label, index) => {
      const display = popularityEpisodeText(label).replace("Episode ", "Ep ");
      return `<text class="popularity-x-label" x="${xFor(index)}" y="${chartHeight - 22}" text-anchor="middle">${escapeHtml(display)}</text>`;
    }).join("");

    const series = ids.map((id, seriesIndex) => {
      const item = season.contestants[id] || {};
      const stats = season.stats[id] || {};
      const byLabel = new Map([["Preseason", clamp(Number(stats.startingPopularity ?? 50), 0, 100)], ...(stats.popularityHistory || []).map((entry) => [entry.label, clamp(Number(entry.value ?? 50), 0, 100)])]);
      const reactionsByLabel = new Map((stats.popularityReactions || []).map((entry) => [entry.label, entry]));
      const points = labels.map((label, index) => {
        if (!byLabel.has(label)) return null;
        const value = byLabel.get(label);
        return { index, value, reaction: reactionsByLabel.get(label) || null, x: xFor(index), y: yFor(value) };
      }).filter(Boolean);
      const color = popularitySeriesColor(seriesIndex, ids.length);
      const polyline = points.length > 1
        ? `<polyline class="popularity-series-line" points="${points.map((point) => `${point.x},${point.y}`).join(" ")}" style="--series-color:${color}"></polyline>`
        : "";
      const circles = points.map((point) => {
        const reaction = point.reaction || {};
        const applied = Number(reaction.applied || 0);
        const discourseText = reaction.audienceDiscourseLabel ? `, ${reaction.audienceDiscourseLabel} ${Number(reaction.audienceDiscourse || 0)}` : "";
        const shockText = reaction.audienceShockLabel ? `, ${reaction.audienceShockLabel} ${Number(reaction.audienceShock || 0)}` : "";
        const relativeText = Number.isFinite(Number(reaction.relativeRank))
          ? `, remaining rank ${Number(reaction.relativeRank)}/${Number(reaction.remainingCount || 0)}, relative adjustment ${Number(reaction.relativeAdjustment || 0) >= 0 ? "+" : ""}${Number(reaction.relativeAdjustment || 0)}`
          : "";
        const details = point.reaction ? ` | ${applied >= 0 ? "+" : ""}${applied}: challenge ${Number(reaction.challenge || 0)}, runway ${Number(reaction.runway || 0)}, fairness ${Number(reaction.fairness || 0)}, lip sync ${Number(reaction.lipSync || 0)}, story ${Number(reaction.visibleEvents || 0) + Number(reaction.hiddenEvents || 0)}${discourseText}${shockText}${relativeText}` : "";
        return `<circle class="popularity-series-point" cx="${point.x}" cy="${point.y}" r="4.5" style="--series-color:${color}"><title>${escapeHtml(storyDisplayName(item, true))}: ${point.value} — ${escapeHtml(popularityEpisodeText(labels[point.index]))}${escapeHtml(details)}</title></circle>`;
      }).join("");
      return `<g class="popularity-series" data-series-id="${escapeHtml(id)}" style="--series-color:${color}">${polyline}${circles}</g>`;
    }).join("");

    const legend = ids.map((id, index) => {
      const item = season.contestants[id] || {};
      const color = popularitySeriesColor(index, ids.length);
      return `<button class="popularity-legend-item" type="button" data-series-id="${escapeHtml(id)}" style="--series-color:${color}" aria-pressed="false" title="Focus ${escapeHtml(storyDisplayName(item, true))}">
        <img src="${escapeHtml(item.image || PLACEHOLDER)}" alt="${escapeHtml(storyDisplayName(item, true))}">
        <span>${escapeHtml(storyDisplayName(item, true))}</span>
      </button>`;
    }).join("");

    els.popularityWrap.innerHTML = `<div class="popularity-chart-shell"><div class="popularity-chart-scroll"><svg class="popularity-line-chart" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Contestant popularity over the season">${grid}${xLabels}${series}</svg></div><div class="popularity-chart-legend">${legend}</div></div>`;

    const seriesNodes = Array.from(els.popularityWrap.querySelectorAll(".popularity-series"));
    const legendNodes = Array.from(els.popularityWrap.querySelectorAll(".popularity-legend-item"));
    let pinnedId = "";

    const applyFocus = (id = "") => {
      const activeId = String(id || "");
      seriesNodes.forEach((node) => {
        const isActive = !activeId || node.dataset.seriesId === activeId;
        node.classList.toggle("is-muted", !!activeId && !isActive);
        node.classList.toggle("is-active", !!activeId && isActive);
      });
      legendNodes.forEach((node) => {
        const isActive = !activeId || node.dataset.seriesId === activeId;
        node.classList.toggle("is-muted", !!activeId && !isActive);
        node.classList.toggle("is-active", !!activeId && isActive);
        node.setAttribute("aria-pressed", String(!!activeId && isActive));
      });
    };

    legendNodes.forEach((node) => {
      const id = node.dataset.seriesId || "";
      node.addEventListener("mouseenter", () => {
        if (!pinnedId) applyFocus(id);
      });
      node.addEventListener("mouseleave", () => {
        if (!pinnedId) applyFocus("");
      });
      node.addEventListener("focus", () => {
        if (!pinnedId) applyFocus(id);
      });
      node.addEventListener("blur", () => {
        if (!pinnedId) applyFocus("");
      });
      node.addEventListener("click", () => {
        pinnedId = pinnedId === id ? "" : id;
        applyFocus(pinnedId);
      });
    });
  }

  function edgicClass(value) { return `edgic-${String(value || "blank").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; }

  function renderEdgicStats() {
    const labels = state.season.episodes.filter((ep) => ep.type !== "finale").map((ep) => ep.label);
    const rows = seasonPlacementOrder().map((id) => {
      const byLabel = new Map(state.season.stats[id].edgic.map((x) => [x.label, x]));
      const overall = state.season.stats[id].overallEdgic || overallEdgicFor(state.season, id);
      const overallValue = overall?.value || "";
      const overallVisibility = overall?.visibility || "";
      return `<tr><th>${statContestantInline(id)}</th>${labels.map((label) => {
        const entry = byLabel.get(label) || null;
        const value = typeof entry === "string" ? entry : (entry?.value || "");
        const visibility = typeof entry === "object" && entry?.visibility ? entry.visibility : "";
        return `<td class="edgic-cell ${edgicClass(value)}" title="${entry && typeof entry === "object" ? `Centrality ${Math.round(entry.centrality || 0)}, insight ${Math.round(entry.insight || 0)}, dimensionality ${Math.round(entry.dimensionality || 0)}` : ""}">${escapeHtml(value ? `${value}${visibility || ""}` : "")}</td>`;
      }).join("")}<td class="edgic-cell edgic-overall ${edgicClass(overallValue)}">${escapeHtml(overallValue ? `${overallValue}${overallVisibility}` : "")}</td></tr>`;
    }).join("");
    els.edgicWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table edgic-table"><thead><tr><th>Contestant</th>${labels.map((label) => `<th>${escapeHtml(statEpisodeLabel(label))}</th>`).join("")}<th>Overall</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderVotingStats() {
    if (!els.votingStatsWrap) return;
    const entries = state.season.votingStats || [];
    if (!isAssassinFormat(state.season)) {
      els.votingStatsWrap.innerHTML = "";
      return;
    }
    if (!entries.length) {
      els.votingStatsWrap.innerHTML = `<div class="stat-table-shell"><table class="stats-table modern-stat-table voting-stats-table"><tbody><tr><td>No RuMocracy votes recorded.</td></tr></tbody></table></div>`;
      return;
    }
    const voters = seasonPlacementOrder().filter((id) => state.season.castOrder.includes(id));
    const decisionCell = (entry) => entry.assassinWon ? "Group" : (entry.winnerId ? nickDisplayName(state.season.contestants[entry.winnerId]) : "Top All Star");
    const voteClass = (entry, voterId) => {
      const classes = [];
      if ((entry.bottomIds || []).includes(voterId)) classes.push("vote-bottom");
      if (entry.eliminatedId === voterId) classes.push("vote-eliminated-voter");
      if (entry.winnerId === voterId) classes.push("vote-top-vote");
      if (!entry.assassinWon && voterId !== entry.winnerId) classes.push("vote-crossed");
      if (entry.assassinWon && voterId === entry.winnerId) classes.push("vote-crossed");
      return classes.join(" ");
    };
    const rows = voters.map((voterId) => {
      const cells = entries.map((entry) => {
        const activeInEpisode = (entry.activeStartIds || state.season.castOrder || []).includes(voterId);
        if (!activeInEpisode) return `<td class="vote-after-elim"></td>`;
        const vote = (entry.votes || []).find((item) => item.voterId === voterId);
        const name = vote?.votedForId ? nickDisplayName(state.season.contestants[vote.votedForId]) : "";
        return `<td class="${escapeHtml(voteClass(entry, voterId))}">${escapeHtml(name)}</td>`;
      }).join("");
      return `<tr><th>${statContestantInline(voterId)}</th>${cells}</tr>`;
    }).join("");
    const eliminatedRow = entries.map((entry) => {
      const cls = entry.assassinWon ? "vote-result-group" : "vote-result-top";
      return `<td class="${cls}">${entry.eliminatedId ? escapeHtml(nickDisplayName(state.season.contestants[entry.eliminatedId])) : "—"}</td>`;
    }).join("");
    const legend = `
      <div class="voting-legend">
        <span><i class="legend-swatch vote-top-vote"></i>Top All Star's personal vote.</span>
        <span><i class="legend-swatch vote-crossed"></i>Vote shown but not counted for the decision.</span>
        <span><i class="legend-swatch vote-bottom"></i>Contestant was up for elimination.</span>
        <span><i class="legend-swatch vote-eliminated-voter"></i>Contestant was eliminated that episode.</span>
      </div>
    `;
    els.votingStatsWrap.innerHTML = `${legend}<div class="stat-table-shell voting-table-shell"><table class="stats-table modern-stat-table voting-stats-table weekly-voting-table"><caption>Summary of weekly voting and results</caption><thead><tr><th>Episode</th>${entries.map((entry) => `<th>${escapeHtml(statEpisodeLabel(entry.label))}</th>`).join("")}</tr></thead><tbody><tr><th>Deciding vote</th>${entries.map((entry) => `<td>${escapeHtml(decisionCell(entry))}</td>`).join("")}</tr>${rows}<tr class="eliminated-summary-row"><th>Eliminated</th>${eliminatedRow}</tr></tbody></table></div>`;
  }

  function stableStoryHash(value) {
    let hash = 2166136261;
    String(value || "").split("").forEach((char) => {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    });
    return Math.abs(hash >>> 0);
  }

  function averageNumber(values) {
    const clean = (values || []).map(Number).filter(Number.isFinite);
    return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
  }

  function standardDeviation(values) {
    const clean = (values || []).map(Number).filter(Number.isFinite);
    if (clean.length < 2) return 0;
    const avg = averageNumber(clean);
    return Math.sqrt(averageNumber(clean.map((value) => (value - avg) ** 2)));
  }

  function normalizedSkill(item, key) {
    return clamp(Number(item?.skills?.[key] || 0) * 10, 0, 100);
  }

  function formatNaturalList(values) {
    const clean = (values || []).filter(Boolean);
    if (!clean.length) return "";
    if (clean.length === 1) return clean[0];
    if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
    return `${clean.slice(0, -1).join(", ")}, and ${clean.at(-1)}`;
  }

  function storyDisplayName(item, preferNickname = false) {
    const raw = String(preferNickname ? nickDisplayName(item) : fullDisplayName(item)).trim() || "Contestant";
    if (/[A-ZÀ-ÖØ-Þ]/.test(raw)) return raw;
    return raw.replace(/(^|[\s\-’'./])([a-zà-öø-ÿ])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
  }

  function storyTextWithDisplayNames(text, season) {
    let output = String(text || "").trim();
    const replacements = Object.values(season?.contestants || {}).flatMap((item) => {
      const canonical = storyDisplayName(item, false);
      return [item?.fullName, item?.name, item?.nickname].filter(Boolean).map((raw) => [String(raw), canonical]);
    }).sort((a, b) => b[0].length - a[0].length);
    replacements.forEach(([raw, canonical]) => {
      if (raw.length < 2) return;
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      output = output.replace(new RegExp(`(^|[^\\p{L}\\p{N}_])(${escaped})(?=$|[^\\p{L}\\p{N}_])`, "giu"), (match, prefix) => `${prefix}${canonical}`);
    });
    return output;
  }

  function stableStoryChoice(profile, key, options) {
    if (!options?.length) return "";
    return options[stableStoryHash(`${profile.id}:${key}`) % options.length];
  }

  function maxConsecutiveTrackToken(track, matcher) {
    let longest = 0;
    let current = 0;
    (track || []).forEach((entry) => {
      const token = String(entry.token || entry.display || "").toUpperCase();
      if (matcher(token)) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    });
    return longest;
  }

  function storylineProfiles(season) {
    ensureNarrativeState(season);
    const placementOrder = seasonPlacementOrder();
    const ids = placementOrder.filter((id) => season.contestants?.[id] && season.stats?.[id]);
    const maxWins = Math.max(1, ...ids.map((id) => Number(season.stats[id]?.wins || 0)));
    const maxHighs = Math.max(1, ...ids.map((id) => Number(season.stats[id]?.highs || 0)));
    const maxBottoms = Math.max(1, ...ids.map((id) => Number(season.stats[id]?.bottoms || 0)));
    const maxLipSyncWins = Math.max(1, ...ids.map((id) => Number(season.stats[id]?.lipSyncWins || 0)));
    const maxMiniWins = Math.max(1, ...ids.map((id) => Number(season.stats[id]?.miniWins || 0)));
    const maxRunwayWins = Math.max(1, ...ids.map((id) => Number(season.stats[id]?.runwayWins || 0)));
    const competitiveEpisodes = Math.max(1, (season.episodes || []).filter((episode) => !["finale", "reunion"].includes(episode.type)).length);
    const finale = (season.episodes || []).find((episode) => episode.type === "finale");
    const finalistIds = new Set(finale?.activeStartIds || season.activeIds || []);
    const winnerIds = new Set(season.winnerIds?.length ? season.winnerIds : (season.winnerId ? [season.winnerId] : []));
    const runnerUpIds = new Set((finale?.activeStartIds || []).filter((id) => !winnerIds.has(id)));
    const allEvents = (season.episodes || []).flatMap((episode) => (episode.untuckedEvents || []).map((event) => ({ episode, event })));
    const allHiddenEvents = (season.episodes || []).flatMap((episode) => (episode.hiddenNarrativeEvents || []).map((event) => ({ episode, event })));

    return ids.map((id) => {
      const item = season.contestants[id] || {};
      const stats = season.stats[id] || {};
      const challengeEntries = (stats.challengeScores || []).filter((entry) => Number.isFinite(Number(entry.value)));
      const runwayEntries = (stats.runwayScores || []).filter((entry) => Number.isFinite(Number(entry.value)));
      const challengeScores = challengeEntries.map((entry) => Number(entry.value));
      const runwayScores = runwayEntries.map((entry) => Number(entry.value));
      const startPopularity = clamp(Number(stats.startingPopularity ?? 50), 0, 100);
      const popularityEntries = [{ label: "Preseason", value: startPopularity }, ...(stats.popularityHistory || []).map((entry) => ({ ...entry, value: clamp(Number(entry.value ?? 50), 0, 100) }))];
      const popularityHistory = popularityEntries.map((entry) => Number(entry.value)).filter(Number.isFinite);
      const endPopularity = clamp(Number(stats.popularity ?? popularityHistory.at(-1) ?? 50), 0, 100);
      const peakPopularityEntry = popularityEntries.slice().sort((a, b) => Number(b.value) - Number(a.value))[0] || { label: "Start", value: 50 };
      const lowPopularityEntry = popularityEntries.slice().sort((a, b) => Number(a.value) - Number(b.value))[0] || { label: "Start", value: 50 };
      const firstChallenge = challengeScores.slice(0, Math.ceil(challengeScores.length / 2));
      const lastChallenge = challengeScores.slice(Math.floor(challengeScores.length / 2));
      const firstRunways = runwayScores.slice(0, Math.ceil(runwayScores.length / 2));
      const lastRunways = runwayScores.slice(Math.floor(runwayScores.length / 2));
      const events = allEvents.filter(({ event }) => (event.ids || []).includes(id));
      const hiddenEvents = allHiddenEvents.filter(({ event }) => (event.ids || []).includes(id));
      const narrative = narrativeContestant(season, id) || { traits: {}, state: {}, arcEvidence: {} };
      const traits = narrative.traits || {};
      const arcEvidence = narrative.arcEvidence || {};
      const pairArcs = Object.values(season.narrative?.pairArcs || {}).filter((entry) => (entry.ids || []).includes(id));
      const eventTypeCounts = events.reduce((counts, { event }) => {
        const type = String(event.type || "storyline").toLowerCase();
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      }, {});
      const dramaEvents = events.filter(({ event }) => ["drama", "fight", "rivalry", "shade", "meltdown", "argument"].includes(String(event.type || "").toLowerCase()));
      const positiveUntucked = events.reduce((sum, { event }) => sum + Math.max(0, Number(event.impacts?.popularity?.[id] || 0)), 0);
      const negativeUntucked = events.reduce((sum, { event }) => sum + Math.abs(Math.min(0, Number(event.impacts?.popularity?.[id] || 0))), 0);
      const edgic = stats.edgic || [];
      const edgicValues = edgic.map((entry) => String(typeof entry === "string" ? entry : (entry?.value || "")).toUpperCase());
      const visibilities = edgic.map((entry) => Number(typeof entry === "object" ? entry?.visibility : 0)).filter(Number.isFinite);
      const visibility = averageNumber(visibilities);
      const narratorCount = edgicValues.filter((value) => /^(CP|OTT)/.test(value)).length;
      const cpCount = edgicValues.filter((value) => /^CP/.test(value)).length;
      const ottCount = edgicValues.filter((value) => /^OTT/.test(value)).length;
      const morCount = edgicValues.filter((value) => /^MOR/.test(value)).length;
      const utrCount = edgicValues.filter((value) => /^UTR/.test(value)).length;
      const positiveEdgic = edgicValues.filter((value) => /P$/.test(value)).length;
      const negativeEdgic = edgicValues.filter((value) => /N$/.test(value)).length;
      const highVisibilityCount = visibilities.filter((value) => value >= 4).length;
      const relationEntries = ids.filter((otherId) => otherId !== id).map((otherId) => ({
        id: otherId,
        value: Number(season.relationships?.[pairKey(id, otherId)] || 0),
        item: season.contestants[otherId] || {}
      }));
      const relationships = relationEntries.map((entry) => entry.value);
      const positiveRelationships = relationEntries.filter((entry) => entry.value > 0);
      const negativeRelationships = relationEntries.filter((entry) => entry.value < 0);
      const closestAlly = positiveRelationships.slice().sort((a, b) => b.value - a.value)[0] || null;
      const strongestRival = negativeRelationships.slice().sort((a, b) => a.value - b.value)[0] || null;
      const track = stats.track || [];
      const returned = track.some((entry) => /RTRN|^IN$/.test(String(entry.token || "")));
      const blocked = track.filter((entry) => /BLK/.test(String(entry.token || entry.display || ""))).length;
      const rankIndex = placementOrder.indexOf(id);
      const placementStrength = ids.length <= 1 ? 1 : 1 - rankIndex / (ids.length - 1);
      const meaningfulTrack = track.filter((entry) => {
        const token = String(entry.token || entry.display || "").trim();
        return token && !/^(RUN|OUT|GUEST|MX\. CON|GB)$/i.test(token);
      });
      const episodesCompeted = Math.max(1, challengeScores.length, runwayScores.length, meaningfulTrack.length);
      const episodeShare = clamp(episodesCompeted / competitiveEpisodes, 0, 1);
      const finalTrackEntry = meaningfulTrack.at(-1) || null;
      const challengeAvg = averageNumber(challengeScores);
      const runwayAvg = averageNumber(runwayScores);
      const challengeTrend = averageNumber(lastChallenge) - averageNumber(firstChallenge);
      const runwayTrend = averageNumber(lastRunways) - averageNumber(firstRunways);
      const popularityDelta = endPopularity - startPopularity;
      const popularityVolatility = standardDeviation(popularityHistory);
      const highRate = (Number(stats.wins || 0) + Number(stats.highs || 0)) / episodesCompeted;
      const bottomRate = Number(stats.bottoms || 0) / episodesCompeted;
      const safeRate = Number(stats.safes || 0) / episodesCompeted;
      const safeStreakLength = maxConsecutiveTrackToken(track, (token) => token === "SAFE" || token === "RUN");
      const episodeByLabel = new Map((season.episodes || []).map((episode) => [episode.label, episode]));
      const edgicByLabel = new Map(edgic.map((entry) => [entry?.label, entry]));
      const popularityByLabel = new Map(popularityEntries.slice(1).map((entry) => [entry.label, Number(entry.value)]));
      let previousBeatPopularity = startPopularity;
      const episodeBeats = meaningfulTrack.map((entry) => {
        const label = entry.label;
        const token = String(entry.token || entry.display || "").toUpperCase();
        const edgicEntry = edgicByLabel.get(label) || {};
        const popValue = popularityByLabel.has(label) ? Number(popularityByLabel.get(label)) : previousBeatPopularity;
        const popDelta = popValue - previousBeatPopularity;
        previousBeatPopularity = popValue;
        const episode = episodeByLabel.get(label) || {};
        return {
          label,
          token,
          display: String(entry.display || entry.token || ""),
          challenge: episode.challenge?.name || "",
          runway: episode.runway?.name || "",
          edgic: String(edgicEntry?.value || "").toUpperCase(),
          visibility: Number(edgicEntry?.visibility || 0),
          popValue,
          popDelta
        };
      });
      const firstWinBeat = episodeBeats.find((beat) => /(^|\b)(WIN|DWIN|TOP2)(\b|$)/.test(beat.token)) || null;
      const firstDangerBeat = episodeBeats.find((beat) => /BTM|LOW|ELIM|LOST/.test(beat.token)) || null;
      const biggestRiseBeat = episodeBeats.slice().sort((a, b) => b.popDelta - a.popDelta)[0] || null;
      const biggestFallBeat = episodeBeats.slice().sort((a, b) => a.popDelta - b.popDelta)[0] || null;
      const mostVisibleBeat = episodeBeats.slice().sort((a, b) => b.visibility - a.visibility || Math.abs(b.popDelta) - Math.abs(a.popDelta))[0] || null;
      const reboundBeat = (() => {
        const dangerIndex = episodeBeats.findIndex((beat) => /BTM|LOW|ELIM|LOST/.test(beat.token));
        if (dangerIndex < 0) return null;
        return episodeBeats.slice(dangerIndex + 1).find((beat) => /WIN|TOP2|HIGH/.test(beat.token)) || null;
      })();
      const finalist = finalistIds.has(id);
      const winner = winnerIds.has(id);
      const runnerUp = runnerUpIds.has(id);
      const earlyOut = !finalist && (episodesCompeted <= 2 || episodeShare <= 0.28 || rankIndex >= Math.ceil(ids.length * 0.68));
      const midOut = !finalist && !earlyOut && placementStrength < 0.58;
      const lateOut = !finalist && placementStrength >= 0.58;
      const challengeNormalized = clamp((challengeAvg - 35) * 1.55, 0, 100);
      const runwayNormalized = clamp((runwayAvg - 35) * 1.55, 0, 100);
      const relationshipAvg = averageNumber(relationships);
      const skillComedy = normalizedSkill(item, "comedy");
      const skillActing = normalizedSkill(item, "acting");
      const skillImprov = normalizedSkill(item, "improv");
      const skillDesign = normalizedSkill(item, "design");
      const skillDance = normalizedSkill(item, "dance");
      const skillRunway = normalizedSkill(item, "runway");
      const skillLipSync = normalizedSkill(item, "lipsync");
      const volatility = clamp(standardDeviation(challengeScores) * 4 + standardDeviation(runwayScores) * 2, 0, 100);
      const dominance = clamp((Number(stats.wins || 0) / maxWins) * 44 + (Number(stats.highs || 0) / maxHighs) * 22 + challengeNormalized * 0.20 + placementStrength * 18 + (finalist ? 8 : 0), 0, 100);
      const resilience = clamp((Number(stats.bottoms || 0) / maxBottoms) * 31 + (Number(stats.lipSyncWins || 0) / maxLipSyncWins) * 40 + Math.max(0, challengeTrend) * 1.2 + (returned ? 20 : 0), 0, 100);
      const drama = clamp(dramaEvents.length * 17 + negativeRelationships.length * 5 + negativeUntucked * 5 + ottCount * 4, 0, 100);
      const social = clamp(50 + relationshipAvg * 5 + positiveRelationships.length * 4 + positiveUntucked * 4 - negativeRelationships.length * 2, 0, 100);
      const popularity = clamp(Number(stats.popularity ?? endPopularity), 0, 100);
      const growth = clamp(50 + challengeTrend * 3 + runwayTrend * 2 + popularityDelta * 1.4, 0, 100);
      const decline = clamp(50 - challengeTrend * 3 - runwayTrend * 2 - popularityDelta * 1.4, 0, 100);
      const threat = clamp(dominance * 0.60 + blocked * 18 + Math.max(0, -relationshipAvg) * 3, 0, 100);
      const strategy = clamp(45 + Math.abs(relationshipAvg) * 2 + blocked * 12 + negativeRelationships.length * 3 + positiveRelationships.length * 2, 0, 100);
      const profile = {
        id, item, stats, rankIndex, placementStrength, episodeShare, finalTrackEntry,
        episodesCompeted, challengeEntries, runwayEntries, challengeScores, runwayScores,
        challengeAvg, runwayAvg, challengeTrend, runwayTrend, popularityDelta,
        startPopularity, endPopularity, peakPopularityEntry, lowPopularityEntry, popularityVolatility,
        events, hiddenEvents, narrative, traits, arcEvidence, pairArcs, eventTypeCounts, dramaEvents, positiveUntucked, negativeUntucked,
        edgicValues, overallEdgic: stats.overallEdgic || overallEdgicFor(season, id), visibility, highVisibilityCount, narratorCount, cpCount, ottCount, morCount, utrCount,
        positiveEdgic, negativeEdgic, relationshipAvg, positiveRelationships, negativeRelationships,
        closestAlly, strongestRival, safeStreakLength, episodeBeats, firstWinBeat, firstDangerBeat,
        biggestRiseBeat, biggestFallBeat, mostVisibleBeat, reboundBeat, finalist, winner, runnerUp,
        earlyOut, midOut, lateOut, returned, signals: {}
      };
      profile.signals = {
        winner: winner ? 100 : 0,
        runnerUp: runnerUp ? 100 : 0,
        finalist: finalist ? 100 : (lateOut ? 60 : 10),
        earlyOut: earlyOut ? 100 : 0,
        lateOut: lateOut ? 78 : 12,
        wins: clamp((Number(stats.wins || 0) / maxWins) * 100, 0, 100),
        highs: clamp((Number(stats.highs || 0) / maxHighs) * 100, 0, 100),
        bottoms: clamp((Number(stats.bottoms || 0) / maxBottoms) * 100, 0, 100),
        lipSyncWins: clamp((Number(stats.lipSyncWins || 0) / maxLipSyncWins) * 100, 0, 100),
        lipSyncLosses: clamp(Number(stats.lipSyncLosses || 0) * 38, 0, 100),
        mini: clamp((Number(stats.miniWins || 0) / maxMiniWins) * 100, 0, 100),
        runway: clamp(runwayNormalized * 0.72 + (Number(stats.runwayWins || 0) / maxRunwayWins) * 28, 0, 100),
        challenge: challengeNormalized,
        consistency: clamp(100 - standardDeviation(challengeScores) * 5 - standardDeviation(runwayScores) * 2.5 + highRate * 25 + safeStreakLength * 4, 0, 100),
        safeStreak: clamp(safeRate * 120 + safeStreakLength * 12, 0, 100),
        underdog: clamp(resilience * 0.52 + bottomRate * 68 + Math.max(0, popularityDelta) * 1.2 - dominance * 0.16 + (placementStrength > 0.55 ? 8 : 0), 0, 100),
        dominance,
        resilience,
        growth,
        decline,
        volatility,
        lateSurge: clamp(46 + challengeTrend * 4 + runwayTrend * 2 + placementStrength * 18 + (finalist ? 14 : 0), 0, 100),
        earlyPeak: clamp(48 - challengeTrend * 4 - runwayTrend * 2 + highRate * 25 + (earlyOut ? 10 : 0), 0, 100),
        redemption: clamp(resilience * 0.43 + growth * 0.43 + (returned ? 28 : 0), 0, 100),
        comeback: returned ? 100 : 0,
        robbed: clamp(popularity * 0.38 + dominance * 0.32 + placementStrength * 18 + ((earlyOut || midOut) ? 18 : 0) - (winner ? 80 : 0), 0, 100),
        shockExit: clamp(popularity * 0.42 + dominance * 0.28 + (earlyOut ? 25 : midOut ? 15 : 5) - (finalist ? 60 : 0), 0, 100),
        popularity,
        popularityRise: clamp(45 + popularityDelta * 4 + (peakPopularityEntry.value - 50) * 0.8, 0, 100),
        popularityFall: clamp(45 - popularityDelta * 4 + (50 - lowPopularityEntry.value) * 0.8, 0, 100),
        polarizing: clamp(drama * 0.48 + volatility * 0.18 + popularityVolatility * 4 + Math.abs(positiveEdgic - negativeEdgic) * 3, 0, 100),
        drama,
        villain: clamp(drama * 0.55 + negativeUntucked * 14 + negativeRelationships.length * 4 + negativeEdgic * 8, 0, 100),
        lowDrama: clamp(100 - drama + morCount * 5, 0, 100),
        positiveUntucked: clamp(positiveUntucked * 18 + social * 0.35 + positiveEdgic * 7, 0, 100),
        negativeUntucked: clamp(negativeUntucked * 20 + drama * 0.42 + negativeEdgic * 8, 0, 100),
        narrator: clamp(narratorCount * 14 + visibility * 10 + cpCount * 8 + highVisibilityCount * 6, 0, 100),
        visibility: clamp(visibility * 18 + highVisibilityCount * 6, 0, 100),
        invisible: clamp(utrCount * 20 + (100 - visibility * 18) + safeRate * 18, 0, 100),
        social,
        isolated: clamp(55 - relationshipAvg * 6 + negativeRelationships.length * 4 - positiveRelationships.length * 2 + utrCount * 3, 0, 100),
        rivalry: clamp(negativeRelationships.length * 13 + drama * 0.42 + (strongestRival ? Math.abs(strongestRival.value) * 5 : 0), 0, 100),
        strategy,
        target: clamp(threat * 0.62 + negativeRelationships.length * 7 + placementStrength * 10, 0, 100),
        blocked: clamp(blocked * 42, 0, 100),
        threat,
        judgesFavorite: clamp(highRate * 95 + Number(stats.wins || 0) * 8 + placementStrength * 10, 0, 100),
        judgesPuzzle: clamp(volatility * 0.60 + bottomRate * 42 + highRate * 32, 0, 100),
        polished: clamp((challengeNormalized + runwayNormalized + (100 - volatility)) / 3, 0, 100),
        messy: clamp(volatility * 0.50 + drama * 0.32 + bottomRate * 35 + ottCount * 4, 0, 100),
        chaos: clamp(volatility * 0.43 + drama * 0.43 + popularityVolatility * 3, 0, 100),
        emotional: clamp(positiveUntucked * 14 + (eventTypeCounts.storyline || 0) * 16 + (eventTypeCounts.bonding || 0) * 12 + (eventTypeCounts.meltdown || 0) * 10 + positiveEdgic * 5, 0, 100),
        camp: clamp((skillComedy + skillImprov) / 2 + ottCount * 3, 0, 100),
        comedy: skillComedy,
        acting: skillActing,
        improv: skillImprov,
        design: skillDesign,
        dance: skillDance,
        runwaySkill: skillRunway,
        lipSyncSkill: skillLipSync,
        challengeGrowth: clamp(50 + challengeTrend * 5, 0, 100),
        challengeLow: clamp(100 - challengeNormalized, 0, 100),
        runwayGrowth: clamp(50 + runwayTrend * 5, 0, 100),
        runwayLow: clamp(100 - runwayNormalized, 0, 100),
        noWinHigh: Number(stats.wins || 0) === 0 ? clamp((Number(stats.highs || 0) / maxHighs) * 100, 0, 100) : 0,
        oneHit: Number(stats.wins || 0) === 1 ? clamp(68 + decline * 0.30, 0, 100) : 0,
        lowDominance: clamp(100 - dominance, 0, 100),
        professional: clamp((skillActing + skillDance + skillRunway + (100 - volatility)) / 4, 0, 100),
        fashion: clamp((skillDesign + skillRunway + runwayNormalized) / 3, 0, 100),
        productionFavorite: clamp(highRate * 72 + visibility * 9 + positiveEdgic * 8 + placementStrength * 18 - Math.max(0, popularityDelta * -1) * 0.4, 0, 100),
        underrated: clamp((challengeNormalized + runwayNormalized) * 0.34 + utrCount * 9 + Math.max(0, popularityDelta) * 1.6 - highRate * 28, 0, 100),
        cultFavorite: clamp(popularity * 0.52 + Math.max(0, popularityDelta) * 1.8 + (earlyOut || midOut ? 18 : 0) + utrCount * 4, 0, 100),
        overstayed: clamp(episodeShare * 52 + bottomRate * 45 + Math.max(0, 45 - popularity) * 1.1 + Math.max(0, 48 - challengeNormalized) - dominance * 0.24, 0, 100),
        episodeThief: clamp((mostVisibleBeat?.visibility || 0) * 14 + Math.max(0, biggestRiseBeat?.popDelta || 0) * 5 + narratorCount * 6, 0, 100),
        protectedEdit: clamp(visibility * 10 + positiveEdgic * 9 + highRate * 32 + Math.max(0, 50 - challengeNormalized) * 0.7 + Math.max(0, 50 - runwayNormalized) * 0.4, 0, 100),
        foreshadowedFall: clamp((firstWinBeat ? 18 : 0) + decline * 0.50 + negativeEdgic * 9 + Math.max(0, -(biggestFallBeat?.popDelta || 0)) * 4, 0, 100),
        editMismatch: clamp(Math.abs((visibility * 20) - ((challengeNormalized + runwayNormalized + dominance) / 3)) * 1.35, 0, 100),
        fanDefense: clamp((resilience * 0.52 + bottomRate * 68 + Math.max(0, popularityDelta) * 1.2 - dominance * 0.16 + (placementStrength > 0.55 ? 8 : 0)) * 0.45 + popularity * 0.28 + positiveUntucked * 8 + Math.max(0, popularityDelta) * 1.5, 0, 100),
        fanBacklash: clamp(drama * 0.42 + negativeUntucked * 15 + negativeRelationships.length * 3 + popularityVolatility * 2.4 + Math.max(0, -popularityDelta) * 2.1, 0, 100),
        untuckedMainCharacter: clamp(events.length * 9 + dramaEvents.length * 18 + narratorCount * 5 + (positiveUntucked + negativeUntucked) * 7, 0, 100),
        prematureExit: clamp((earlyOut ? 52 : midOut ? 22 : 0) + dominance * 0.42 + popularity * 0.34 + placementStrength * 12 - (finalist ? 80 : 0), 0, 100),
        quietThreat: clamp(threat * 0.52 + utrCount * 10 + Math.max(0, 70 - visibility * 12) + (100 - standardDeviation(challengeScores) * 5 - standardDeviation(runwayScores) * 2.5 + highRate * 25 + safeStreakLength * 4) * 0.18, 0, 100),
        rattledFrontRunner: clamp((48 - challengeTrend * 4 - runwayTrend * 2 + highRate * 25 + (earlyOut ? 10 : 0)) * 0.45 + decline * 0.38 + Number(stats.bottoms || 0) * 12 + negativeUntucked * 8, 0, 100),
        socialGameSurvivor: clamp(social * 0.48 + resilience * 0.32 + positiveRelationships.length * 5 + episodeShare * 12, 0, 100),
        runwayCarry: clamp(runwayNormalized * 0.55 + Math.max(0, runwayNormalized - challengeNormalized) * 1.1 + (Number(stats.runwayWins || 0) / maxRunwayWins) * 22, 0, 100),
        challengeSpecialist: clamp(challengeNormalized * 0.58 + Math.max(0, challengeNormalized - runwayNormalized) * 1.05 + highRate * 30, 0, 100),
        fanEditSplit: clamp(Math.abs(popularity - (visibility * 20)) * 1.25 + Math.abs(popularityDelta) * 1.2 + (drama * 0.48 + volatility * 0.18 + popularityVolatility * 4 + Math.abs(positiveEdgic - negativeEdgic) * 3) * 0.24, 0, 100)
      };

      const evidence = (tag, multiplier = 13) => clamp(Number(arcEvidence[tag] || 0) * multiplier, 0, 100);
      const finalToken = String(finalTrackEntry?.token || finalTrackEntry?.display || "").toUpperCase();
      const firstOut = !finalist && rankIndex === ids.length - 1 && /ELIM|PCHOP|PLOSS/.test(finalToken);
      const medicalExit = /DEPT/.test(finalToken) || meaningfulTrack.some((entry) => String(entry.token || "").toUpperCase() === "DEPT");
      const age = Number(item.age || 0);
      const overallSkill = averageNumber(skillKeys.map(([key]) => normalizedSkill(item, key)));
      const lateCut = !finalist && lateOut && rankIndex <= Math.min(ids.length - 1, (finale?.activeStartIds || []).length + 1);
      const votingFormat = ["legacy", "assassin", "golden_beaver", "all_winners"].includes(String(season.config?.eliminationFormat || ""));
      const positivePairEvidence = pairArcs.reduce((sum, entry) => sum + Number(entry.evidence?.unlikely_duo || 0) + Number(entry.evidence?.showmance || 0), 0);
      const rivalPairEvidence = pairArcs.reduce((sum, entry) => sum + Number(entry.evidence?.look_alike_rivals || 0) + Number(entry.evidence?.bitter_rivals || 0), 0);
      const editNegativeWithoutAction = clamp(negativeEdgic * 15 + evidence("villain_by_editing") - dramaEvents.length * 5, 0, 100);

      Object.assign(profile.signals, {
        undeniableWinner: clamp(dominance * 0.54 + profile.signals.consistency * 0.23 + (winner ? 34 : 0) - bottomRate * 38, 0, 100),
        prodigy: age && age <= 23 ? clamp(overallSkill * 0.55 + dominance * 0.30 + 22, 0, 100) : Math.max(evidence("prodigy"), Number(traits.prodigyPotential || 0)),
        chosenOne: clamp(evidence("chosen_one") * 0.72 + Number(narrative.state?.unfairOverplacements || 0) * 18 + profile.signals.productionFavorite * 0.32, 0, 100),
        relatableUnderdog: clamp(profile.signals.underdog * 0.60 + evidence("heart_of_season") * 0.18 + (100 - Number(traits.confidence || 50)) * 0.20 + Math.max(0, popularityDelta) * 1.1, 0, 100),
        misunderstoodWeirdo: clamp(Number(traits.eccentricity || 0) * 0.56 + evidence("untouchable_icon") * 0.22 + profile.signals.cultFavorite * 0.30, 0, 100),
        heartOfSeason: clamp(evidence("heart_of_season") * 0.70 + social * 0.25 + profile.signals.positiveUntucked * 0.27, 0, 100),
        growthArc: clamp(growth * 0.62 + evidence("growth_arc") * 0.52 + Math.max(0, challengeTrend) * 2.2, 0, 100),
        redemptionRole: clamp(profile.signals.redemption * 0.60 + evidence("redemption_arc") * 0.55 + (item.isReturningQueen ? 25 : 0), 0, 100),
        robbedQueen: clamp(profile.signals.robbed * 0.35 + evidence("robbed_queen") * 0.78 + Number(narrative.state?.unfairUnderplacements || 0) * 15, 0, 100),
        lipSyncAssassin: clamp(profile.signals.lipSyncWins * 0.52 + evidence("lip_sync_assassin") * 0.72 + resilience * 0.24, 0, 100),
        delusionalQueen: clamp(Number(traits.delusion || 0) * 0.52 + evidence("delusional_queen") * 0.72 + profile.signals.negativeUntucked * 0.18, 0, 100),
        bitterVeteran: clamp((age >= 35 || Number(item.yearsPerforming || 0) >= 12 ? 38 : 0) + evidence("bitter_veteran") * 0.72 + profile.signals.negativeUntucked * 0.22, 0, 100),
        lookNoPersonality: clamp(profile.signals.runwayCarry * 0.52 + Math.max(0, 70 - profile.signals.comedy) * 0.35 + Math.max(0, 65 - profile.signals.narrator) * 0.30, 0, 100),
        instigator: clamp(evidence("instigator") * 0.78 + Number(traits.messiness || 0) * 0.28 + profile.signals.drama * 0.24, 0, 100),
        cutthroatCompetitor: clamp(evidence("cutthroat_competitor") * 0.62 + Number(traits.competitiveness || 0) * 0.43 + strategy * 0.34 + (votingFormat ? 12 : 0), 0, 100),
        villainByEditing: clamp(editNegativeWithoutAction * 0.66 + evidence("villain_by_editing") * 0.65 + profile.signals.fanEditSplit * 0.24, 0, 100),
        loudMouth: clamp(Number(traits.loudness || 0) * 0.46 + evidence("loud_mouth") * 0.62 + ottCount * 11 + profile.signals.visibility * 0.16, 0, 100),
        passiveAggressive: clamp(Number(traits.shade || 0) * 0.43 + evidence("passive_aggressive") * 0.70 + drama * 0.22 - Number(traits.loudness || 0) * 0.15, 0, 100),
        porkchopRole: firstOut ? 100 : 0,
        earlyFlop: clamp((earlyOut ? 45 : 0) + Math.max(0, overallSkill - challengeNormalized) * 0.48 + Math.max(0, Number(item.followerLevel || 0) - 4) * 5, 0, 100),
        coastingQueen: clamp(profile.signals.safeStreak * 0.65 + profile.signals.invisible * 0.45 - dominance * 0.25, 0, 100),
        sacrificialLamb: clamp(evidence("sacrificial_lamb") * 0.80 + (Number(stats.lipSyncLosses || 0) ? 25 : 0) + (earlyOut ? 15 : 0), 0, 100),
        shockElimination: clamp(evidence("shock_elimination") * 0.72 + profile.signals.shockExit * 0.60 + (Number(stats.bottoms || 0) <= 1 && !finalist ? dominance * 0.24 : 0), 0, 100),
        rightBeforeFinale: lateCut ? 100 : 0,
        innerSaboteur: clamp(evidence("inner_saboteur") * 0.74 + Number(traits.perfectionism || 0) * 0.24 + Math.max(0, overallSkill - challengeNormalized) * 0.40, 0, 100),
        frozenOverthinker: clamp(evidence("frozen_overthinker") * 0.80 + Number(traits.perfectionism || 0) * 0.35 + profile.signals.decline * 0.20, 0, 100),
        defeatedRole: clamp(evidence("defeated") * 0.84 + profile.signals.decline * 0.34 + Number(narrative.state?.stress || 0) * 0.25, 0, 100),
        imposterSyndrome: clamp(evidence("imposter_syndrome") * 0.76 + (100 - Number(traits.confidence || 50)) * 0.36 + overallSkill * 0.22, 0, 100),
        validationSeeker: clamp(evidence("validation_seeker") * 0.78 + Number(traits.emotionality || 0) * 0.28 + (100 - Number(traits.selfAwareness || 50)) * 0.25, 0, 100),
        lookAlikeRivals: clamp(evidence("look_alike_rivals") * 0.72 + rivalPairEvidence * 22 + profile.signals.rivalry * 0.22, 0, 100),
        showmance: clamp(evidence("showmance") * 0.72 + positivePairEvidence * 21 + profile.signals.social * 0.18, 0, 100),
        dragFamilyRivalry: clamp(evidence("drag_family_rivalry") * 0.85 + (Array.isArray(item.dragFamilyIds) && item.dragFamilyIds.length ? 35 : 0), 0, 100),
        bitterExes: clamp(evidence("bitter_exes") * 0.84 + rivalPairEvidence * 18, 0, 100),
        unlikelyDuo: clamp(evidence("unlikely_duo") * 0.72 + positivePairEvidence * 22 + social * 0.20, 0, 100),
        commentaryQueen: clamp(evidence("commentary_queen") * 0.67 + Number(traits.narration || 0) * 0.43 + narratorCount * 8, 0, 100),
        memeQueen: clamp(evidence("meme_queen") * 0.80 + Number(traits.humor || 0) * 0.22 + profile.signals.episodeThief * 0.22, 0, 100),
        catchphraseMachine: clamp(evidence("catchphrase_machine") * 0.86 + Number(traits.narration || 0) * 0.20, 0, 100),
        oneNoteJoke: clamp(evidence("one_note_joke") * 0.76 + ottCount * 13 + Math.max(0, Number(traits.humor || 0) - Number(traits.dimensionality || 50)) * 0.25, 0, 100),
        ottRole: clamp(ottCount * 22 + profile.signals.visibility * 0.24, 0, 100),
        royaltyReturnee: (item.isReturningQueen || returned) ? clamp(70 + threat * 0.25, 0, 100) : 0,
        localCelebrity: clamp(Number(item.localReputation || 0) * 10 + evidence("local_celebrity") * 0.66, 0, 100),
        fashionCanJoke: clamp(evidence("fashion_can_joke") * 0.72 + profile.signals.fashion * 0.42 + Math.max(profile.signals.comedy, profile.signals.acting, profile.signals.improv) * 0.33, 0, 100),
        overPreparedPageant: clamp(evidence("over_prepared_pageant") * 0.72 + Number(traits.professionalism || 0) * 0.42 + (100 - Number(traits.authenticity || 50)) * 0.27, 0, 100),
        medicalExit: medicalExit ? 100 : 0,
        silentThreat: clamp(evidence("silent_threat") * 0.70 + profile.signals.quietThreat * 0.60 + profile.signals.lateSurge * 0.26, 0, 100),
        outOfDepth: clamp(evidence("out_of_depth") * 0.75 + profile.signals.challengeLow * 0.44 + (100 - Number(traits.adaptability || 50)) * 0.28 + Number(narrative.state?.stress || 0) * 0.20, 0, 100),
        systemPlayer: votingFormat ? clamp(evidence("system_player") * 0.66 + strategy * 0.58 + profile.signals.social * 0.20, 0, 100) : 0,
        socialMediaSensation: clamp(Number(item.followerLevel || 0) * 10 + evidence("social_media_sensation") * 0.64, 0, 100),
        untouchableIcon: clamp(evidence("untouchable_icon") * 0.70 + Number(traits.eccentricity || 0) * 0.48 + profile.signals.cultFavorite * 0.30, 0, 100)
      });
      return profile;
    });
  }

  function storylineArchetypeFamily(archetype) {
    if (archetype?.family) return archetype.family;
    const signals = new Set(archetype?.signals || []);
    if (["winner", "runnerUp", "finalist", "dominance", "wins", "highs", "judgesFavorite", "threat", "productionFavorite", "underrated", "overstayed", "prematureExit", "quietThreat", "rattledFrontRunner", "challengeSpecialist", "socialGameSurvivor"].some((signal) => signals.has(signal))) return "competition";
    if (["runway", "runwaySkill", "design", "fashion", "polished", "runwayCarry"].some((signal) => signals.has(signal))) return "fashion";
    if (["lipSyncWins", "lipSyncLosses", "lipSyncSkill", "resilience"].some((signal) => signals.has(signal))) return "lipsync";
    if (["drama", "villain", "rivalry", "social", "positiveUntucked", "negativeUntucked", "isolated", "fanDefense", "fanBacklash", "untuckedMainCharacter"].some((signal) => signals.has(signal))) return "social";
    if (["narrator", "visibility", "invisible", "popularity", "popularityRise", "popularityFall", "polarizing", "cultFavorite", "episodeThief", "protectedEdit", "foreshadowedFall", "editMismatch", "fanEditSplit"].some((signal) => signals.has(signal))) return "edit";
    return "arc";
  }

  function storylineArchetypesFor(profile) {
    const ranked = STORYLINE_ARCHETYPES.map((archetype) => {
      const values = archetype.signals.map((signal) => Number(profile.signals[signal] || 0));
      const gateValue = archetype.gate ? Number(profile.signals[archetype.gate] || 0) : 100;
      const eligible = gateValue >= Number(archetype.minGate || 45);
      let context = eligible ? 0 : -300;
      const family = storylineArchetypeFamily(archetype);
      if (family === "competition") context += profile.placementStrength * 7;
      if (family === "edit") context += Math.min(10, profile.highVisibilityCount * 2 + profile.narratorCount);
      if (family === "social" || family === "relationship") context += Math.min(10, (profile.events.length + profile.hiddenEvents.length) * 1.2);
      if (profile.earlyOut && ["competition", "arc"].includes(family) && !/Premiere|Early|Shock|One-Hit/.test(archetype.title)) context -= 10;
      return {
        ...archetype,
        family,
        score: averageNumber(values) + context + (stableStoryHash(`${profile.id}:${archetype.title}`) % 1000) / 10000
      };
    }).sort((a, b) => b.score - a.score);

    const eligibleRanked = ranked.filter((entry) => entry.score > -200);
    const fallbackRanked = ranked.map((entry) => ({
      ...entry,
      score: averageNumber((entry.signals || []).map((signal) => Number(profile.signals[signal] || 0)))
        + (stableStoryHash(`${profile.id}:${entry.title}:fallback`) % 1000) / 10000
    })).sort((a, b) => b.score - a.score);
    const pool = eligibleRanked.length ? eligibleRanked : fallbackRanked;
    const first = pool[0];
    if (!first) return [];
    if (profile.episodesCompeted <= 2 && !profile.returned) return [first];

    const second = pool.find((entry, index) => index > 0 && entry.family !== first.family && entry.score >= 47 && entry.score >= first.score - 22);
    const hasRoomForSecond = profile.episodesCompeted >= 4 || profile.finalist || profile.returned || profile.events.length >= 3 || profile.highVisibilityCount >= 2;
    return hasRoomForSecond && second ? [first, second] : [first];
  }

  function storylineTrackToken(profile, label) {
    const entry = (profile.stats.track || []).find((trackEntry) => trackEntry.label === label);
    return String(entry?.token || entry?.display || "").trim();
  }

  function storylinePlacementPhrase(token) {
    const value = String(token || "").toUpperCase();
    if (/WINNER|^WIN$/.test(value)) return "won the week";
    if (/TOP2|TOP3|TOP4/.test(value)) return "landed among the episode's strongest contestants";
    if (/HIGH/.test(value)) return "earned one of the strongest critiques";
    if (/SAFE/.test(value)) return "stayed safely in the middle";
    if (/LOW/.test(value)) return "received a warning from the judges";
    if (/BTM|ELIM|LOST/.test(value)) return "fell into serious danger";
    return "made their clearest competitive impression";
  }

  function strongestStorylineMoment(profile, key = "challengeScores", direction = "best") {
    const entries = (profile.stats[key] || []).filter((entry) => Number.isFinite(Number(entry.value)));
    if (!entries.length) return null;
    return entries.slice().sort((a, b) => direction === "best" ? Number(b.value) - Number(a.value) : Number(a.value) - Number(b.value))[0];
  }

  function strongestUntuckedMoment(profile) {
    return (profile.events || []).map(({ episode, event }) => {
      const pop = Number(event.impacts?.popularity?.[profile.id] || 0);
      const type = String(event.type || "").toLowerCase();
      const drama = ["fight", "drama", "rivalry", "shade", "argument", "meltdown"].includes(type) ? 8 : 0;
      return { episode, event, pop, type, score: Math.abs(pop) * 4 + drama + (event.ids || []).length };
    }).sort((a, b) => b.score - a.score)[0] || null;
  }

  function storylineEditSentence(profile) {
    if (!profile.edgicValues.length) return "The edit stayed neutral and did not force a larger television persona onto the run.";
    if (profile.cpCount >= Math.max(profile.ottCount, profile.morCount, profile.utrCount) && profile.cpCount >= 2) {
      return stableStoryChoice(profile, "edit-cp", [
        "The edit treated them as a strategic, fully explained character, regularly giving their choices and reactions room to breathe.",
        "Their confessionals and decision-making gave the run a clear point of view, so even quieter episodes still felt connected to a larger arc.",
        "Production framed them as someone whose perspective mattered, with enough context to make both their successes and mistakes feel intentional."
      ]);
    }
    if (profile.ottCount >= Math.max(profile.cpCount, profile.morCount, profile.utrCount) && profile.ottCount >= 2) {
      return stableStoryChoice(profile, "edit-ott", [
        "The edit emphasized their biggest reactions and broadest character beats, making personality more important than subtlety.",
        "They were presented in bold strokes: memorable, highly visible, and often defined by the room's reaction to them.",
        "Production leaned into spectacle whenever they appeared, turning even small moments into part of a larger television persona."
      ]);
    }
    if (profile.utrCount >= Math.max(profile.cpCount, profile.ottCount, profile.morCount)) {
      return stableStoryChoice(profile, "edit-utr", [
        "A quiet edit limited the amount of interior story the audience received, leaving several parts of the run to be inferred from placements alone.",
        "They often disappeared into the ensemble between judging moments, which made the run feel less developed than the raw results suggested.",
        "The season rarely centered their perspective, so their story was defined more by isolated moments than a continuous edit."
      ]);
    }
    return stableStoryChoice(profile, "edit-mor", [
      "The edit kept them present without making them the season's narrator, giving the run a grounded supporting-character quality.",
      "They received a balanced, middle-of-the-road edit that highlighted relevant moments without overstating their role in the season.",
      "Production used them as a steady ensemble presence, visible enough to register but rarely allowed to dominate the episode's point of view."
    ]);
  }

  function storylinePopularitySentence(profile) {
    const peakEpisode = profile.peakPopularityEntry?.label === "Start" ? "the beginning" : popularityEpisodeText(profile.peakPopularityEntry?.label);
    const lowEpisode = profile.lowPopularityEntry?.label === "Start" ? "the beginning" : popularityEpisodeText(profile.lowPopularityEntry?.label);
    if (profile.popularityDelta >= 18) {
      return `Viewer response grew substantially, peaking around ${peakEpisode}; by the end, the audience saw more in the run than they had at the start.`;
    }
    if (profile.popularityDelta <= -18) {
      return `Audience goodwill eroded as the season continued, with the lowest point arriving around ${lowEpisode}; the edit increasingly invited a more critical reading of them.`;
    }
    if (profile.popularityVolatility >= 18) {
      return "Audience response swung sharply from episode to episode, suggesting a polarizing contestant whose appeal depended heavily on the latest challenge or Untucked scene.";
    }
    if (profile.endPopularity >= 72) return "They finished with strong audience support, even when the competition itself did not always give them the cleanest path.";
    if (profile.endPopularity <= 28) return "They never fully won the audience over, and the cooler reception reinforced the harsher parts of their edit.";
    return "Viewer response stayed relatively stable, so their reputation was shaped more by the overall edit than by one dramatic fan turnaround.";
  }

  function storylineSocialSentence(profile, untuckedMoment) {
    if (untuckedMoment) {
      const rawText = untuckedMoment.event.renderedText || untuckedMoment.event.text || "";
      const eventText = storyTextWithDisplayNames(rawText, state.season).replace(/[.!?]+$/, "");
      if (eventText) {
        if (untuckedMoment.pop > 0) return `Untucked strengthened their story when ${eventText}; it was the kind of character beat that made the audience understand or root for them more.`;
        if (untuckedMoment.pop < 0) return `Untucked complicated their reputation when ${eventText}; the moment exposed a less flattering side and changed the tone of their edit.`;
        return `Untucked added useful texture when ${eventText}, giving the season a clearer sense of how they behaved away from the judges.`;
      }
    }
    if (profile.closestAlly && profile.strongestRival) {
      return `Socially, they balanced a clear bond with ${storyDisplayName(profile.closestAlly.item, true)} against visible tension with ${storyDisplayName(profile.strongestRival.item, true)}, which kept their place in the cast dynamic.`;
    }
    if (profile.closestAlly) return `Their strongest social thread was a genuine connection with ${storyDisplayName(profile.closestAlly.item, true)}, giving the run warmth even when the competitive edit was thin.`;
    if (profile.strongestRival) return `Their clearest interpersonal story came through friction with ${storyDisplayName(profile.strongestRival.item, true)}, making conflict a larger part of the run than alliance-building.`;
    return "Most of their story remained inside the competition, with relatively little Untucked material strong enough to redefine how the audience saw them.";
  }


  function storylineHiddenSentence(profile) {
    const moments = (profile.hiddenEvents || []).map(({ episode, event }) => ({
      episode,
      event,
      score: Math.abs(Number(event.popularity || 0)) * 4 + Number(event.centrality || 0) + Number(event.insight || 0) * 0.35
    })).sort((a, b) => b.score - a.score);
    const moment = moments[0];
    if (!moment?.event?.renderedText) return "";
    const text = storyTextWithDisplayNames(moment.event.renderedText, state.season).replace(/[.!?]+$/, "");
    return `Quieter workroom and confessional material reinforced the arc through a specific hidden beat: ${text}.`;
  }

  function storylineEpisodeSentence(profile) {
    const name = storyDisplayName(profile.item, true);
    const beatLabel = (beat) => beat?.label ? popularityEpisodeText(beat.label) : "one episode";
    if (profile.reboundBeat && profile.firstDangerBeat) {
      return stableStoryChoice(profile, "episode-rebound", [
        `${beatLabel(profile.firstDangerBeat)} first put ${name}'s season in real jeopardy, but ${beatLabel(profile.reboundBeat)} supplied the rebound that kept the arc from becoming a simple downward slide.`,
        `The season found its clearest turning point between ${beatLabel(profile.firstDangerBeat)} and ${beatLabel(profile.reboundBeat)}: one episode exposed the weakness, and the next convincing high point restored credibility.`,
        `Editors could build a clean recovery beat around ${beatLabel(profile.reboundBeat)}, especially because the danger shown in ${beatLabel(profile.firstDangerBeat)} had made the comeback feel earned.`
      ]);
    }
    if (profile.firstWinBeat) {
      return stableStoryChoice(profile, "episode-win", [
        `${beatLabel(profile.firstWinBeat)} became the episode the edit repeatedly pointed back to, because it established the strongest version of ${name} as a competitor.`,
        `The win or top placement in ${beatLabel(profile.firstWinBeat)} functioned as the season's proof-of-concept for ${name}; later episodes were judged against that benchmark.`,
        `Once ${beatLabel(profile.firstWinBeat)} gave ${name} a genuine breakout, the rest of the run became a question of whether that standard could be repeated.`
      ]);
    }
    if (profile.biggestRiseBeat && profile.biggestRiseBeat.popDelta >= 7) {
      return stableStoryChoice(profile, "episode-rise", [
        `${beatLabel(profile.biggestRiseBeat)} was the episode that changed the conversation, producing the sharpest fan-response jump of the run.`,
        `A noticeable audience turn arrived in ${beatLabel(profile.biggestRiseBeat)}, when one performance or Untucked beat made viewers reassess ${name}.`,
        `The fan narrative did not truly click until ${beatLabel(profile.biggestRiseBeat)}, which became the clearest example of the edit and audience reaction moving in the same direction.`
      ]);
    }
    if (profile.mostVisibleBeat?.visibility >= 4) {
      return stableStoryChoice(profile, "episode-visible", [
        `${beatLabel(profile.mostVisibleBeat)} was their most heavily edited episode, concentrating confessionals, reactions, and storyline material into one clear showcase.`,
        `Production gave ${name} their strongest narrative push in ${beatLabel(profile.mostVisibleBeat)}, even if the competitive result itself was not the season's most dramatic.`,
        `The episode edit peaked in ${beatLabel(profile.mostVisibleBeat)}, when ${name} briefly felt less like an ensemble player and more like the point-of-view character.`
      ]);
    }
    return stableStoryChoice(profile, "episode-neutral", [
      "No single episode completely redefined the run; the storyline accumulated through repeated smaller beats instead.",
      "The season never produced one obvious turning-point episode, so the audience had to build its impression from the overall pattern.",
      "Rather than hinging on one breakout week, the run was shaped by the gradual repetition of similar competitive and social beats."
    ]);
  }

  function storylineEditResultsSentence(profile) {
    const competitiveStrength = (profile.signals.challenge + profile.signals.runway + profile.signals.dominance) / 3;
    const editStrength = profile.visibility * 20;
    if (competitiveStrength >= 67 && editStrength <= 48) {
      return stableStoryChoice(profile, "edit-under", [
        "The track record often looked stronger than the edit felt, which encouraged an online narrative that the season was underexplaining one of its better competitors.",
        "Fans who followed the placements closely had more reason to believe in the run than viewers relying on confessionals alone, creating a subtle 'underedited threat' discourse.",
        "There was a disconnect between results and storytelling: the judges kept validating the work, while the episodes rarely built equivalent narrative investment."
      ]);
    }
    if (competitiveStrength <= 45 && editStrength >= 68) {
      return stableStoryChoice(profile, "edit-over", [
        "The television presence was larger than the competitive résumé, so viewers could reasonably read the season as valuing character over results.",
        "Production continued to find story for them even when the placements were not demanding it, creating a familiar debate over whether personality was carrying the run.",
        "Their screen time sometimes outpaced their performance record, which made the edit feel protective to critics and entertainingly character-driven to supporters."
      ]);
    }
    if (profile.positiveEdgic >= 2 && profile.negativeEdgic >= 2) {
      return stableStoryChoice(profile, "edit-mixed-tone", [
        "The tone of the edit kept changing: sympathetic in some episodes, sharply critical in others, and realistic enough that neither hero nor villain label ever fully settled.",
        "Production allowed both flattering and unflattering material to survive the cut, leaving viewers with a genuinely mixed rather than carefully sanitized portrait.",
        "The season resisted a single moral reading of them; episode by episode, the edit alternated between invitation, skepticism, and outright contradiction."
      ]);
    }
    return stableStoryChoice(profile, "edit-aligned", [
      "For the most part, the edit and the track record told the same story, so audience expectations rarely felt disconnected from the judging.",
      "Their narrative emphasis broadly matched their competitive relevance, giving the run a coherent shape even when individual episodes varied.",
      "Production neither dramatically inflated nor buried the run; the amount of story generally tracked with how much they were affecting the competition."
    ]);
  }

  function storylineFanDiscourseSentence(profile) {
    if (profile.signals.cultFavorite >= 72 && !profile.finalist) {
      return stableStoryChoice(profile, "fans-cult", [
        "By the time they left, the fan response had already shifted into cult-favorite territory: less about believing they would win and more about wanting the season to keep their specific energy.",
        "Their supporters framed the elimination as the loss of a character rather than simply the loss of a competitor, which is usually the clearest sign of a cult run.",
        "Online affection outgrew the actual placement, with fans remembering the personality, aesthetic, or one defining episode more vividly than the formal résumé."
      ]);
    }
    if (profile.signals.productionFavorite >= 72 && profile.popularityDelta < 4) {
      return stableStoryChoice(profile, "fans-prod-fav", [
        "A portion of the audience read the generous visibility and judging as a production-favorite push, even when the edit itself was trying to make the support feel earned.",
        "The season's investment in them became part of the discourse: admirers saw a complete protagonist, while skeptics saw a contestant being continuously positioned for importance.",
        "Because the show kept returning to their perspective, fan debate expanded beyond performance into the familiar question of how much the edit wanted viewers to root for them."
      ]);
    }
    if (profile.signals.underrated >= 72) {
      return stableStoryChoice(profile, "fans-underrated", [
        "The strongest fan argument was that the season underestimated them: solid work, limited narrative emphasis, and not quite enough judging reward to match the package.",
        "Viewers inclined to rewatch the season would likely come away more impressed than the original weekly edit suggested, giving the run an underrated-after-the-fact quality.",
        "Their fanbase was built partly through comparison—pointing to weeks where the work held up better than the critiques or screen time implied."
      ]);
    }
    if (profile.signals.overstayed >= 74) {
      return stableStoryChoice(profile, "fans-overstay", [
        "As the run continued, fan patience became part of the story; each escape from danger intensified the sense that the contestant had outlasted the strongest version of their arc.",
        "Supporters praised the survival instinct, but critics increasingly treated every additional episode as evidence that the season had delayed an inevitable exit.",
        "The fan conversation gradually moved from 'can they recover?' to 'how long can this continue?', which is a very different kind of visibility."
      ]);
    }
    if (profile.signals.fanBacklash >= 70) {
      return stableStoryChoice(profile, "fans-backlash", [
        "The audience response hardened into backlash, with later episodes being interpreted through the least flattering version of moments that might earlier have been dismissed.",
        "Once viewers turned, even neutral scenes were read more critically; the fan narrative became cumulative rather than tied to one isolated mistake.",
        "The edit gave enough negative material for online opinion to snowball, making reputation management almost as important as challenge performance."
      ]);
    }
    if (profile.signals.fanDefense >= 72) {
      return stableStoryChoice(profile, "fans-defense", [
        "Fans increasingly defended them against the judging, the edit, or the other contestants, transforming ordinary survival into an underdog cause.",
        "The audience began doing narrative work on their behalf—explaining mistakes, celebrating small rebounds, and treating criticism as fuel for a larger underdog reading.",
        "Their support was active rather than passive: viewers did not merely like them, they argued for them."
      ]);
    }
    if (profile.signals.polarizing >= 70) {
      return stableStoryChoice(profile, "fans-polarizing", [
        "They became one of those contestants whose every episode confirmed somebody's existing opinion, producing strong defenders and equally committed detractors.",
        "Fan reaction split along interpretation rather than fact: the same confidence read as star quality to one group and delusion to another.",
        "The contestant's value became inseparable from debate, which often gives a run more afterlife than a universally agreeable edit."
      ]);
    }
    return stableStoryChoice(profile, "fans-neutral", [
      "Fan perception largely followed the weekly material without developing a separate mythology around the contestant.",
      "The audience response remained recognizable but not extreme, leaving the edit—not online discourse—as the main author of the storyline.",
      "Viewers had opinions, but the run never became one of the season's defining fan wars."
    ]);
  }

  function storylineArcDescription(profile) {
    if (profile.winner && profile.signals.dominance >= 70) return "a commanding winner's run";
    if (profile.winner) return "a less obvious but steadily convincing winner's journey";
    if (profile.runnerUp && profile.signals.dominance >= 65) return "a near-winning campaign that remained credible until the end";
    if (profile.finalist && profile.challengeTrend >= 5) return "a late-season surge that made the finale feel earned";
    if (profile.returned) return "a comeback story that gave the season a genuine second act";
    if (profile.challengeTrend >= 8) return "a clear growth arc, with the contestant becoming more assured as the season went on";
    if (profile.challengeTrend <= -8) return "a promising start that gradually lost momentum";
    if (profile.dramaEvents.length >= 2) return "a character-driven run in which off-stage tension became as important as the competition";
    if (profile.stats.lipSyncWins >= 2) return "a survival story built through repeated pressure on the main stage";
    if (profile.signals.consistency >= 72) return "a composed, dependable run that rarely became chaotic";
    if (profile.earlyOut) return "a brief introduction rather than a completed season arc";
    return "a mixed but recognizable presence in the season's larger ensemble";
  }

  function storylineCharacterRead(profile) {
    const name = storyDisplayName(profile.item, true);
    const competitive = profile.signals.dominance >= 72
      ? "a contestant who expected to be taken seriously every week"
      : profile.signals.resilience >= 70
        ? "a contestant whose identity came from surviving pressure rather than controlling the season"
        : profile.signals.consistency >= 72
          ? "a steady technician who rarely looked completely lost"
          : profile.signals.volatility >= 70
            ? "an unpredictable competitor whose ceiling and floor were both visible"
            : profile.signals.safeStreak >= 68
              ? "a capable but understated competitor who spent long stretches outside the central judging story"
              : "a competitor whose strengths were specific rather than universally reliable";
    const character = profile.dramaEvents.length >= 2
      ? "As a character, they were defined by friction, reactions, and the way other contestants responded to them."
      : profile.cpCount >= 2 || profile.narratorCount >= 3
        ? "As a character, they had a clear point of view and were often used to explain what the episode wanted the audience to notice."
        : profile.positiveUntucked > profile.negativeUntucked + 2
          ? "As a character, they read as warm and emotionally accessible, with Untucked doing much of the work of humanizing them."
          : profile.negativeUntucked > profile.positiveUntucked + 2
            ? "As a character, they were harder-edged than their challenge package, and the edit repeatedly let tension complicate the audience's view of them."
            : profile.utrCount >= Math.max(2, profile.cpCount + profile.ottCount)
              ? "As a character, they were comparatively quiet, so viewers had to infer personality from reactions, relationships, and isolated moments rather than a constant confessional presence."
              : "As a character, they occupied the ensemble naturally without being reduced to one exaggerated television role.";
    return `${name} came across as ${competitive}. ${character}`;
  }

  function storylineArchetypeReason(profile, archetype, index = 0) {
    if (!archetype) return "";
    const name = storyDisplayName(profile.item, true);
    const title = archetype.title;
    const wins = Number(profile.stats.wins || 0);
    const highs = Number(profile.stats.highs || 0);
    const bottoms = Number(profile.stats.bottoms || 0);
    const lipWins = Number(profile.stats.lipSyncWins || 0);
    const best = strongestStorylineMoment(profile, "challengeScores", "best");
    const firstWin = profile.firstWinBeat?.label ? popularityEpisodeText(profile.firstWinBeat.label) : "";
    const ally = profile.closestAlly ? storyDisplayName(profile.closestAlly.item, true) : "";
    const rival = profile.strongestRival ? storyDisplayName(profile.strongestRival.item, true) : "";
    const quotedTitle = String(title || "").replace(/^The\s+/i, "");
    const prefix = index === 0 ? `The “${quotedTitle}” label fits because` : `The secondary “${quotedTitle}” reading comes from the fact that`;
    const evidenceCount = (tag) => Number(profile.arcEvidence?.[tag] || 0);
    const hiddenFor = (...tags) => (profile.hiddenEvents || []).find(({ event }) => (event.arcTags || []).some((tag) => tags.includes(tag)) && event.renderedText)?.event;
    const hiddenText = (...tags) => {
      const event = hiddenFor(...tags);
      if (!event?.renderedText) return "";
      return storyTextWithDisplayNames(event.renderedText, state.season).replace(/[.!?]+$/, "");
    };

    if (title === "The Silent Threat") {
      const threatMoment = hiddenText("silent_threat");
      return `${prefix} ${name} spent ${profile.utrCount} episode${profile.utrCount === 1 ? "" : "s"} outside the loudest story while quietly building competitive credibility${profile.challengeTrend > 3 ? " and improving late in the season" : ""}. ${threatMoment ? `The edit finally made that subtext explicit in a hidden beat: ${threatMoment}.` : "Other contestants increasingly treated them as a threat before the edit fully centered them."}`;
    }
    if (title === "The Misunderstood Weirdo") {
      const weirdMoment = hiddenText("untouchable_icon", "meme_queen");
      return `${prefix} ${name}'s unusually eccentric approach repeatedly separated them from the rest of the cast, but the audience response suggested fascination rather than simple confusion. ${weirdMoment ? `That identity crystallized in a hidden beat: ${weirdMoment}.` : "The contrast between cast confusion and growing cult support gave the oddness a coherent purpose."}`;
    }
    if (title === "The Relatable Underdog") {
      return `${prefix} early uncertainty and periods of danger were balanced by visible effort, vulnerability, and a fan response that became more protective over time. Popularity moved from ${Math.round(profile.startPopularity)} to ${Math.round(profile.endPopularity)}, making the emotional investment as important as the formal results.`;
    }
    if (title === "The Heart of the Season") {
      const heartMoment = hiddenText("heart_of_season", "unlikely_duo");
      return `${prefix} social and emotional scenes repeatedly positioned ${name} as someone other contestants could lean on${profile.closestAlly ? `, especially in the bond with ${storyDisplayName(profile.closestAlly.item, true)}` : ""}. ${heartMoment ? `A representative hidden moment made that role concrete: ${heartMoment}.` : "The warmth came from accumulated small acts rather than one strategic achievement."}`;
    }
    if (title === "The Growth Arc") {
      return `${prefix} the later challenge average improved relative to the opening stretch, and the edit supplied enough self-reflection to make that improvement feel learned rather than accidental. Weaknesses introduced early became the setup for later competence.`;
    }
    if (title === "The Robbed Queen") {
      return `${prefix} objective performance and official judging repeatedly diverged${Number(profile.narrative?.state?.unfairUnderplacements || 0) ? `, accumulating ${Math.round(profile.narrative.state.unfairUnderplacements)} points of underplacement evidence` : ""}. Fan reaction rose most sharply when viewers believed the result failed to reward the work they had just seen.`;
    }
    if (title === "The Prodigy") {
      return `${prefix} ${profile.item.age ? `at only ${profile.item.age}, ` : ""}${name} combined unusually strong baseline skills with the confidence to compete against more established contestants. The surprise came from how little the package read as inexperienced.`;
    }
    if (title === "The Delusional Queen") {
      const moment = hiddenText("delusional_queen", "validation_seeker");
      return `${prefix} self-assessment repeatedly ran ahead of the actual critiques, turning confidence into a recurring source of tension. ${moment ? `A hidden beat made the pattern especially clear: ${moment}.` : "The edit emphasized resistance to criticism rather than growth from it."}`;
    }
    if (title === "The Bitter Veteran") {
      return `${prefix} experience became part of the conflict: ${name} was framed as measuring newer contestants against older standards of professionalism, preparation, or dues paid. The resulting criticism made generational resentment part of the character rather than incidental shade.`;
    }
    if (title === "The Cutthroat Competitor") {
      return `${prefix} the edit repeatedly emphasized threat assessment, strategic self-interest, and a willingness to prioritize the crown over group harmony${profile.strongestRival ? `, most visibly around ${storyDisplayName(profile.strongestRival.item, true)}` : ""}.`;
    }
    if (title === "The Loud Mouth") {
      const moment = hiddenText("loud_mouth", "meme_queen");
      return `${prefix} reaction shots, interruptions, and outsized commentary made ${name} difficult for the episode to ignore. ${moment ? `A hidden beat reinforced that television persona: ${moment}.` : "Visibility came from taking up social space even when the challenge result was ordinary."}`;
    }
    if (title === "The Passive-Aggressive Shade-Thrower") {
      return `${prefix} conflict usually arrived through controlled comments and carefully timed questions rather than open screaming. The contrast between a calm delivery and cutting content gave the shade a consistent character logic.`;
    }
    if (title === "The Commentary Queen") {
      const moment = hiddenText("commentary_queen");
      return `${prefix} confessionals repeatedly gave ${name} the job of explaining the room, summarizing conflicts, or landing the episode's funniest observations. ${moment ? `A hidden beat made that narrator role especially clear: ${moment}.` : "Their point of view remained valuable even in weeks when the placement was only SAFE."}`;
    }
    if (title === "The Meme Queen" || title === "The Catchphrase Machine") {
      const moment = hiddenText("meme_queen", "catchphrase_machine");
      return `${prefix} a recurring joke, reaction, or strange piece of phrasing generated attention beyond the competition itself. ${moment ? `The clearest hidden example was: ${moment}.` : "The social-media afterlife of those moments became part of the season's memory."}`;
    }
    if (title === "The Local Celebrity") {
      const moment = hiddenText("local_celebrity", "growth_arc");
      return `${prefix} pre-season reputation created expectations that the national competition did not automatically validate. ${moment ? `A hidden beat made the adjustment visible: ${moment}.` : "The storyline came from watching a hometown star recalibrate inside a stronger field."}`;
    }
    if (title === "The Over-Prepared Pageant") {
      const moment = hiddenText("over_prepared_pageant", "professional");
      return `${prefix} polish and preparedness sometimes appeared so controlled that emotional beats felt rehearsed. ${moment ? `A hidden beat exposed that tension: ${moment}.` : "The judges' recurring question was not whether they were ready, but whether the audience could see beyond the preparation."}`;
    }
    if (title === "The Out of Her Depth") {
      return `${prefix} repeated difficulty adapting to the show's pace made the problem feel broader than one weak skill. Stress rose while challenge results stayed below the apparent potential, creating sympathy without convincing viewers that a breakthrough was imminent.`;
    }
    if (title === "The Social Media Sensation") {
      return `${prefix} pre-season visibility made every result a referendum on whether online appeal could translate into live performance. The edit repeatedly compared existing buzz with what the judges were actually seeing in the room.`;
    }
    if (title === "The Untouchable Icon") {
      const moment = hiddenText("untouchable_icon", "meme_queen");
      return `${prefix} eccentricity was presented as its own form of authority: the stranger ${name} became, the more the season treated the unpredictability as charm rather than failure. ${moment ? `A hidden beat showed that freedom most clearly: ${moment}.` : "The character seemed exempt from the normal demand to explain every choice."}`;
    }

    if (/Powerhouse|Front-Runner|Dominant Champion|Multi-Win|Judges' Favorite|Almost-Winner|Challenge Specialist/.test(title)) {
      const result = wins ? `${wins} win${wins === 1 ? "" : "s"}` : `${highs} high placement${highs === 1 ? "" : "s"}`;
      return `${prefix} ${name} repeatedly converted strong work into visible judging support, finishing with ${result}${firstWin ? ` and establishing that threat in ${firstWin}` : ""}. Fans were given concrete competitive evidence rather than being asked to accept the status through narration alone.`;
    }
    if (/Underdog|Survival|Critique Survivor|Fan-Defended|Bottom-to-Top|Resilient/.test(title)) {
      return `${prefix} the season repeatedly placed ${name} in danger${bottoms ? ` (${bottoms} bottom appearance${bottoms === 1 ? "" : "s"})` : ""}, but the edit kept finding reasons to preserve hope through rebounds, lip-sync survival, or sympathetic fan response. The perception was less “unstoppable” than “difficult to count out.”`;
    }
    if (/Dark Horse|Late Bloomer|Momentum|Sleeper|Midseason Breakout|Finale Surge|Almost Invisible/.test(title)) {
      return `${prefix} the strongest part of ${name}'s run arrived after the audience had already formed an earlier, quieter impression. Later results and increased visibility forced viewers to revise the assumption that they were merely background support.`;
    }
    if (/Fallen Front-Runner|Downward Spiral|Top-to-Bottom|Foreshadowed Fall|Rattled/.test(title)) {
      return `${prefix} early confidence or success was followed by weaker results, harsher critiques, or a more anxious edit. Fans therefore read later mistakes as part of an accumulating collapse rather than unrelated bad weeks.`;
    }
    if (/Runway Queen|Fashion|Design Darling|Pageant|Experimental Artist|Runway-Carried/.test(title)) {
      return `${prefix} the visual package was one of the clearest recurring strengths: an average runway score of ${Math.round(profile.runwayAvg || 0)}${Number(profile.stats.runwayWins || 0) ? ` and ${profile.stats.runwayWins} runway win${profile.stats.runwayWins === 1 ? "" : "s"}` : ""}. Even when the challenge story was mixed, fans had a reliable aesthetic reason to anticipate ${name}'s next appearance.`;
    }
    if (/Lip Sync Assassin|Lip Sync Redemption|Survival Specialist|Lip Sync Heartbreak/.test(title)) {
      return `${prefix} lip syncs materially changed the way the audience understood the run${lipWins ? `, with ${lipWins} recorded win${lipWins === 1 ? "" : "s"}` : ""}. Those performances made ${name} feel more dangerous—or more emotionally vulnerable—than the challenge record alone suggested.`;
    }
    if (/Villain|Drama|Firecracker|Rivalry|Chaos Agent|Instigator|Backlash|Polarizing/.test(title)) {
      return `${prefix} conflict was not incidental to the edit: ${profile.dramaEvents.length} notable Untucked or rivalry beat${profile.dramaEvents.length === 1 ? "" : "s"}${rival ? `, especially around ${rival}` : ""}, gave viewers a recurring interpersonal lens. Supporters saw candor and television value; detractors saw escalation, ego, or unnecessary mess.`;
    }
    if (/Fan Favorite|Cult Favorite|Sweetheart|Emotional Heart|Vulnerable|Popularity Comeback|Fanbase Surge/.test(title)) {
      return `${prefix} audience affection grew beyond the formal track record, with popularity moving from ${Math.round(profile.startPopularity)} to ${Math.round(profile.endPopularity)} and peaking at ${Math.round(profile.peakPopularityEntry.value)}. The emotional or social material made fans feel they knew ${name}, not just how they placed.`;
    }
    if (/Invisible Edit|Quietly Consistent|Safe Streak|Quiet Threat|Underrated|Edit-Track|Fan Narrative vs. Edit/.test(title)) {
      return `${prefix} the competitive record and the amount of narrative attention did not fully match. ${name} had ${profile.safeStreakLength || 0} consecutive quiet/safe episode${profile.safeStreakLength === 1 ? "" : "s"} and ${profile.utrCount} UTR edit${profile.utrCount === 1 ? "" : "s"}, encouraging fans to debate whether they were genuinely low-impact or simply underexplained.`;
    }
    if (/Production Favorite|Protected Edit|Confessional Shield|Main Character|Episode Thief|Winner's Edit/.test(title)) {
      return `${prefix} production repeatedly returned to ${name}'s perspective, with ${profile.highVisibilityCount} highly visible episode${profile.highVisibilityCount === 1 ? "" : "s"} and ${profile.narratorCount} CP/OTT-style edit${profile.narratorCount === 1 ? "" : "s"}. Admirers saw a complete protagonist; skeptics could read the same emphasis as protection or narrative preference.`;
    }
    if (/Social Butterfly|Alliance Builder|Protective Big Sister|Peacekeeper|Social Game Survivor/.test(title)) {
      return `${prefix} relationships materially supported the run${ally ? `, especially the bond with ${ally}` : ""}. The season presented ${name} as someone other contestants trusted or kept close, making social position part of the explanation for their longevity and audience warmth.`;
    }
    if (/Lone Wolf|Vote Magnet|Target on Their Back|Blocked Threat|Competitive Rival/.test(title)) {
      return `${prefix} ${name}'s place in the cast was defined by pressure from other contestants${rival ? `, most clearly through the tension with ${rival}` : ""}. The edit encouraged viewers to see them as isolated, targeted, or threatening rather than socially secure.`;
    }
    if (/Redemption|Comeback|Legendary Return/.test(title)) {
      return `${prefix} the season gave ${name} a clear before-and-after structure: an early failure, exit, or loss of momentum was followed by a later opportunity to reframe the same contestant. Fans could measure the second chapter against the first instead of treating it as a completely new story.`;
    }
    if (/One-Hit Wonder|Premiere Curse|Premature Exit|Shock Elimination/.test(title)) {
      return `${prefix} the run ended before a broad résumé could form, leaving ${best?.challenge ? best.challenge : "one early impression"} to carry disproportionate weight. The audience perception was therefore built around potential, timing, and the abruptness of the exit more than a complete body of work.`;
    }
    if (/Undeniable Winner/.test(title)) {
      return `${prefix} objective performance, official results, and the season's edit kept pointing in the same direction. ${name} rarely needed rescue, and each strong week made the crown feel less hypothetical.`;
    }
    if (/The Professional/.test(title)) {
      return `${prefix} preparation and consistency were rarely in doubt; the recurring tension came from whether ${name} would loosen control, reveal vulnerability, and become more than an impeccably executed package.`;
    }
    if (/Chosen One/.test(title)) {
      return `${prefix} the official placements were kinder than the underlying performance order often suggested. That gap created a visible production-favorite narrative and made praise feel like part of the story rather than neutral judging.`;
    }
    if (/Inner Saboteur|Frozen Overthinker|Imposter Syndrome|Validation Seeker|Defeated/.test(title)) {
      return `${prefix} the hidden emotional pattern repeatedly affected how viewers interpreted the results: stress, self-doubt, perfectionism, or the need for reassurance made otherwise avoidable mistakes feel like one continuing internal conflict.`;
    }
    if (/Commentary Queen|Meme Queen|Catchphrase|One-Note/.test(title)) {
      return `${prefix} confessionals and small reaction shots carried disproportionate weight. The audience remembered how ${name} described the season—or the absurd moments they created—even when the formal track record was not dominant.`;
    }
    if (/Showmance|Unlikely Duo|Look-Alike Rivals|Bitter Exes|Mother vs/.test(title)) {
      return `${prefix} the most persistent material was relational rather than purely competitive. Repeated pair-focused beats taught viewers to understand ${name} through a bond, comparison, flirtation, or unresolved tension with another contestant.`;
    }
    if (/Coasting Queen|Early Flop|Porkchop|Sacrificial Lamb|Right Before/.test(title)) {
      return `${prefix} timing defined the role: the edit either withheld development through repeated safety, ended the run before expectations could be met, or used the elimination as punctuation for somebody else's larger story.`;
    }
    const strongestHidden = (profile.hiddenEvents || [])
      .map(({ event }) => event)
      .filter((event) => event?.renderedText)
      .sort((a, b) => (Number(b.centrality || 0) + Math.abs(Number(b.popularity || 0)) * 3) - (Number(a.centrality || 0) + Math.abs(Number(a.popularity || 0)) * 3))[0];
    const supportingMoment = strongestHidden?.renderedText
      ? storyTextWithDisplayNames(strongestHidden.renderedText, state.season).replace(/[.!?]+$/, "")
      : "the pattern repeated across their challenge results, visibility, relationships, and audience response";
    return `${prefix} the clearest recurring material was this: ${supportingMoment}. That evidence gave the label a visible story basis instead of treating it as a statistical nickname.`;
  }

  function localStorylineParagraph(profile, archetypes) {
    const name = storyDisplayName(profile.item, true);
    const bestChallenge = strongestStorylineMoment(profile, "challengeScores", "best");
    const worstChallenge = strongestStorylineMoment(profile, "challengeScores", "worst");
    const untuckedMoment = strongestUntuckedMoment(profile);
    const mainLabel = archetypes[0]?.title || "Competitor";
    const secondaryLabel = archetypes[1]?.title || "";
    const labelPhrase = secondaryLabel ? `${mainLabel} with a secondary ${secondaryLabel} thread` : mainLabel;

    if (profile.episodesCompeted <= 2 && !profile.returned) {
      const openings = [
        `${name} never stayed long enough for the season to build a complete arc, so the edit reads mostly as an initial impression.`,
        `${name}'s run ended before a full storyline could develop, leaving the audience with only a few clues about what their season might have become.`,
        `Because ${name} exited so early, their story is better understood as a short character sketch than a season-long narrative.`,
        `${name} was introduced, tested, and removed before production could turn the available material into anything more than a first chapter.`,
        `The season only had time to establish the outline of ${name}: a few competitive signals, a handful of reactions, and an exit before any larger theme could mature.`
      ];
      const challengeSentence = bestChallenge
        ? stableStoryChoice(profile, "early-challenge", [
            `The clearest competitive note came in ${bestChallenge.challenge || "the maxi challenge"}, where they ${storylinePlacementPhrase(storylineTrackToken(profile, bestChallenge.label))}.`,
            `${bestChallenge.challenge || "The opening challenge"} supplied the only substantial evidence of what their competitive package could have looked like over a longer run.`,
            `What little competitive identity the season established came through ${bestChallenge.challenge || "their strongest challenge"}, rather than a sustained pattern.`
          ])
        : "The competition never produced one defining performance strong enough to anchor the edit.";
      const editSentence = profile.utrCount > 0
        ? "A quiet edit made the short run feel even more abbreviated, with little opportunity to establish a strong point of view."
        : storylineEditSentence(profile);
      const audienceSentence = Math.abs(profile.popularityDelta) >= 8 ? storylinePopularitySentence(profile) : stableStoryChoice(profile, "early-audience", [
        "Audience opinion barely had time to settle before the elimination.",
        "The exit arrived before viewers could decide whether the initial impression was promise, mismatch, or simply bad timing.",
        "Any fan narrative remained speculative because the season ended the experiment too quickly."
      ]);
      const archetypeReason = storylineArchetypeReason(profile, archetypes[0], 0);
      return `${stableStoryChoice(profile, "early-opening", openings)} ${storylineCharacterRead(profile)} ${archetypeReason} ${challengeSentence} ${editSentence} ${audienceSentence}`;
    }

    const openings = profile.finalist
      ? [
          `${name} developed into one of the season's central competitive stories, with an edit best described as ${labelPhrase}.`,
          `${name}'s long run allowed the season to build a layered ${labelPhrase} narrative rather than defining them through a single week.`,
          `Across the season, ${name} emerged as ${labelPhrase}, with enough screen time for both the strengths and contradictions of the run to register.`,
          `${name} became a recurring reference point for the season: part competitor, part television character, and ultimately a ${labelPhrase}.`,
          `The length of ${name}'s run gave production room to revise the audience's understanding several times before settling on a ${labelPhrase} conclusion.`
        ]
      : [
          `${name}'s season settled into a ${labelPhrase} narrative, though the edit never treated every episode as equally important to that story.`,
          `${name} occupied a distinctive place in the cast as ${labelPhrase}, with the arc shaped by momentum, visibility, and audience reaction as much as placements.`,
          `The season framed ${name} as ${labelPhrase}, but the most revealing parts of the run often happened between the headline results.`,
          `${name}'s run is easiest to read as ${labelPhrase}, although that label only captures part of how the edit and fan response evolved.`,
          `Rather than receiving one clean storyline, ${name} accumulated a ${labelPhrase} reputation through a mixture of judging, episode construction, and cast dynamics.`
        ];

    let competitive = "No single challenge became the unquestioned centerpiece of the run.";
    if (bestChallenge) {
      const bestToken = storylineTrackToken(profile, bestChallenge.label);
      competitive = stableStoryChoice(profile, "main-competitive", [
        `The competitive high point came in ${bestChallenge.challenge || "a maxi challenge"}, where they ${storylinePlacementPhrase(bestToken)}.`,
        `${bestChallenge.challenge || "Their strongest maxi challenge"} became the clearest evidence that the package could work at a high level.`,
        `The judges saw the best version of ${name} in ${bestChallenge.challenge || "their strongest challenge"}, and the edit used that week as the run's competitive benchmark.`,
        `Their résumé made the most convincing case in ${bestChallenge.challenge || "one standout challenge"}, when preparation, skill, and timing finally aligned.`
      ]);
      if (worstChallenge && worstChallenge.label !== bestChallenge.label) {
        competitive += ` ${stableStoryChoice(profile, "main-worst", [
          `${worstChallenge.challenge || "A later challenge"} exposed the opposite side of their package and prevented the run from feeling completely effortless.`,
          `${worstChallenge.challenge || "Their weakest challenge"} then supplied the counterargument, showing why the season never treated the contestant as invulnerable.`,
          `The contrast with ${worstChallenge.challenge || "their roughest week"} kept the storyline unstable enough to remain believable.`
        ])}`;
      }
    }
    if (profile.challengeTrend >= 7) competitive += ` ${stableStoryChoice(profile, "trend-up", [
      "Their results improved as the season progressed, giving the edit a genuine sense of momentum.",
      "The back half was stronger than the opening stretch, allowing production to frame development rather than simple consistency.",
      "Each later success made the early uncertainty look more like setup than limitation."
    ])}`;
    else if (profile.challengeTrend <= -7) competitive += ` ${stableStoryChoice(profile, "trend-down", [
      "The trajectory moved in the other direction, with early promise becoming harder to sustain.",
      "Later episodes gradually reframed the opening confidence as a peak rather than a foundation.",
      "The season began to edit every new struggle as continuation, not coincidence."
    ])}`;
    else if (profile.safeStreakLength >= 3) competitive += ` ${stableStoryChoice(profile, "safe-run", [
      "A long stretch in the middle made consistency part of the story, but also limited the number of breakout moments.",
      "Repeated safety protected the run while simultaneously starving it of obvious episode-ending punctuation.",
      "The contestant stayed credible without becoming urgent, a pattern that fans often interpret as either quiet consistency or stalled momentum."
    ])}`;

    const editSentence = storylineEditSentence(profile);
    const editResultsSentence = storylineEditResultsSentence(profile);
    const episodeSentence = storylineEpisodeSentence(profile);
    const socialSentence = storylineSocialSentence(profile, untuckedMoment);
    const popularitySentence = storylinePopularitySentence(profile);
    const fanSentence = storylineFanDiscourseSentence(profile);
    const hiddenSentence = storylineHiddenSentence(profile);
    const characterRead = storylineCharacterRead(profile);
    const mainArchetypeReason = storylineArchetypeReason(profile, archetypes[0], 0);
    const secondaryArchetypeReason = archetypes[1]
      ? storylineArchetypeReason(profile, archetypes[1], 1)
      : "";
    const archetypeReasons = [mainArchetypeReason, secondaryArchetypeReason].filter(Boolean).join(" ");
    const conclusion = `Taken as a whole, the run plays as ${storylineArcDescription(profile)}.`;

    const blocks = [
      editSentence,
      editResultsSentence,
      episodeSentence,
      socialSentence,
      hiddenSentence,
      popularitySentence,
      fanSentence
    ].filter(Boolean);
    const start = stableStoryHash(`${profile.id}:story-block-start`) % blocks.length;
    const rotated = blocks.slice(start).concat(blocks.slice(0, start));
    const desired = profile.finalist || profile.episodesCompeted >= 8 ? 2 : 1;
    const selected = rotated.slice(0, desired);
    return `${stableStoryChoice(profile, "main-opening", openings)} ${characterRead} ${archetypeReasons} ${competitive} ${selected.join(" ")} ${conclusion}`;
  }

  function renderStorylines() {
    if (!els.storylinesWrap || !state.season) return;
    const profiles = storylineProfiles(state.season);
    if (!profiles.length) {
      els.storylinesWrap.innerHTML = `<div class="empty-state">No contestant storylines are available yet.</div>`;
      return;
    }
    els.storylinesWrap.innerHTML = profiles.map((profile) => {
      const archetypes = storylineArchetypesFor(profile);
      const paragraph = localStorylineParagraph(profile, archetypes);
      return `<article class="storyline-card" data-contestant-id="${escapeHtml(profile.id)}">
        <img class="storyline-photo" src="${escapeHtml(profile.item.image || PLACEHOLDER)}" alt="${escapeHtml(storyDisplayName(profile.item, false))}">
        <div class="storyline-copy">
          <div class="storyline-title-row"><h4>${escapeHtml(storyDisplayName(profile.item, false))}</h4></div>
          <div class="storyline-tags">${archetypes.map((entry) => `<span>${escapeHtml(entry.title)}</span>`).join("")}</div>
          <p>${escapeHtml(paragraph)}</p>
        </div>
      </article>`;
    }).join("");

    const externalGenerator = window.DRAG_RACE_STORYLINE_GENERATOR;
    if (typeof externalGenerator === "function") {
      profiles.forEach(async (profile) => {
        try {
          const archetypes = storylineArchetypesFor(profile);
          const generated = await externalGenerator({
            contestant: clone(profile.item),
            profile: {
              id: profile.id,
              episodesCompeted: profile.episodesCompeted,
              placementStrength: profile.placementStrength,
              challengeAvg: profile.challengeAvg,
              runwayAvg: profile.runwayAvg,
              challengeTrend: profile.challengeTrend,
              runwayTrend: profile.runwayTrend,
              popularityDelta: profile.popularityDelta,
              peakPopularity: profile.peakPopularityEntry,
              lowPopularity: profile.lowPopularityEntry,
              edgic: profile.edgicValues,
              untuckedEventTypes: profile.eventTypeCounts,
              finalist: profile.finalist,
              winner: profile.winner,
              runnerUp: profile.runnerUp,
              signals: clone(profile.signals)
            },
            archetypes: archetypes.map((entry) => entry.title),
            season: { name: state.config.seasonName, episodeCount: state.season.episodes?.length || 0 }
          });
          if (!generated) return;
          const selectorId = window.CSS?.escape ? CSS.escape(profile.id) : String(profile.id).replace(/["\\]/g, "\\$&");
          const paragraph = els.storylinesWrap.querySelector(`[data-contestant-id="${selectorId}"] .storyline-copy p`);
          if (paragraph) paragraph.textContent = storyTextWithDisplayNames(String(generated), state.season);
        } catch (error) {
          console.warn("External storyline generator failed; keeping the local storyline.", error);
        }
      });
    }
  }

  function challengeHighlightEntries(season) {
    return (season.castOrder || []).flatMap((id) => {
      const item = season.contestants[id] || {};
      return (season.stats[id]?.challengeScores || []).map((entry) => ({
        id,
        item,
        image: item.image || PLACEHOLDER,
        name: storyDisplayName(item, false),
        label: entry.label,
        subject: entry.challenge || "Maxi Challenge",
        value: Number(entry.value)
      }));
    }).filter((entry) => Number.isFinite(entry.value));
  }

  function runwayHighlightEntries(season) {
    return (season.castOrder || []).flatMap((id) => {
      const item = season.contestants[id] || {};
      return (season.stats[id]?.runwayScores || []).map((entry) => ({
        id,
        item,
        image: item.image || PLACEHOLDER,
        name: storyDisplayName(item, false),
        label: entry.label,
        subject: entry.runway || "Runway",
        value: Number(entry.value)
      }));
    }).filter((entry) => Number.isFinite(entry.value));
  }

  function lipSyncHighlightEntries(season) {
    return (season.episodes || []).flatMap((episode) =>
      collectLipSyncsForStats(episode).map((lipSync, index) => {
        const performances = (lipSync.performances || []).filter((entry) => Number.isFinite(Number(entry.score)));
        const scores = performances.map((entry) => Number(entry.score));
        const averageScore = averageNumber(scores);
        const ids = (lipSync.ids || []).filter((id) => season.contestants[id]);
        return {
          episode,
          lipSync,
          index,
          ids,
          images: ids.map((id) => season.contestants[id]?.image || PLACEHOLDER),
          averageScore,
          quality: averageScore,
          participants: ids.map((id) => storyDisplayName(season.contestants[id], false)).filter(Boolean),
          song: lipSync.song?.title || lipSync.song?.name || "Unknown Song",
          artist: lipSync.song?.artist || "",
          winner: lipSync.winnerId ? storyDisplayName(season.contestants[lipSync.winnerId], false) : ""
        };
      })
    ).filter((entry) => entry.participants.length);
  }

  function untuckedHighlightEntries(season) {
    return (season.episodes || []).flatMap((episode) =>
      (episode.untuckedEvents || []).map((event, index) => {
        const popularity = Object.values(event.impacts?.popularity || {}).map(Number).filter(Number.isFinite);
        const positive = popularity.reduce((sum, value) => sum + Math.max(0, value), 0);
        const negative = popularity.reduce((sum, value) => sum + Math.abs(Math.min(0, value)), 0);
        const relationship = Object.values(event.impacts?.relationship || {}).flatMap((value) => {
          if (typeof value === "number") return [value];
          if (value && typeof value === "object") return Object.values(value).map(Number);
          return [];
        }).filter(Number.isFinite);
        const relationshipHeat = relationship.reduce((sum, value) => sum + Math.abs(value), 0);
        const type = String(event.type || "").toLowerCase();
        const dramaWeight = ["fight", "drama", "rivalry", "shade", "argument", "meltdown"].includes(type) ? 35 : 0;
        const ids = (event.ids || []).filter((id) => season.contestants[id]);
        return {
          episode,
          event,
          index,
          ids,
          images: ids.map((id) => season.contestants[id]?.image || PLACEHOLDER),
          participants: ids.map((id) => storyDisplayName(season.contestants[id], false)).filter(Boolean),
          positive,
          negative,
          isDrama: dramaWeight > 0,
          dramaScore: dramaWeight + relationshipHeat * 4 + negative * 5 + ids.length * 2,
          text: event.renderedText || event.text || "An Untucked moment unfolded."
        };
      })
    );
  }

  function highlightPhotoMarkup(images, alt, className = "") {
    const clean = (images || []).filter(Boolean).slice(0, 4);
    if (!clean.length) clean.push(PLACEHOLDER);
    const countClass = `photo-count-${clean.length}`;
    return `<div class="visual-highlight-media ${className} ${countClass}" style="--photo-count:${clean.length}">${clean.map((image, index) => `<img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" style="--photo-index:${index}">`).join("")}</div>`;
  }

  function highlightEpisodeLine(label, subject = "") {
    const episode = popularityEpisodeText(label);
    return subject ? `${episode} - ${subject}` : episode;
  }

  function soloVisualHighlight(entry, label, tone) {
    if (!entry) return `<article class="visual-highlight-card empty"><div class="visual-highlight-copy"><small>${escapeHtml(label)}</small><p>No qualifying moment was recorded.</p></div></article>`;
    return `<article class="visual-highlight-card ${tone}">
      ${highlightPhotoMarkup([entry.image], entry.name, "solo-photo")}
      <div class="visual-highlight-copy">
        <small>${escapeHtml(label)}</small>
        <h5>${escapeHtml(entry.name)}</h5>
        <p>${escapeHtml(highlightEpisodeLine(entry.label, entry.subject))}</p>
      </div>
    </article>`;
  }

  function lipSyncVisualHighlight(entry, label, tone) {
    if (!entry) return `<article class="visual-highlight-card empty"><div class="visual-highlight-copy"><small>${escapeHtml(label)}</small><p>No qualifying lip sync was recorded.</p></div></article>`;
    const versusLine = entry.participants.join(" vs. ");
    const songLine = entry.artist ? `${entry.song} — ${entry.artist}` : entry.song;
    const challenge = entry.episode?.challenge?.name || entry.episode?.title || "Lip Sync";
    return `<article class="visual-highlight-card ${tone}">
      ${highlightPhotoMarkup(entry.images, versusLine, "multi-photo")}
      <div class="visual-highlight-copy">
        <small>${escapeHtml(label)}</small>
        <h5>${escapeHtml(versusLine)}</h5>
        <p>${escapeHtml(songLine)}</p>
        <span>${escapeHtml(highlightEpisodeLine(entry.episode.label, challenge))}</span>
      </div>
    </article>`;
  }

  function untuckedVisualHighlight(entry, label, tone) {
    if (!entry) return `<article class="visual-highlight-card empty"><div class="visual-highlight-copy"><small>${escapeHtml(label)}</small><p>No qualifying Untucked moment was recorded.</p></div></article>`;
    const names = entry.participants.length ? formatNaturalList(entry.participants) : "Untucked";
    return `<article class="visual-highlight-card ${tone}">
      ${highlightPhotoMarkup(entry.images, names, entry.images.length > 1 ? "multi-photo" : "solo-photo")}
      <div class="visual-highlight-copy">
        <small>${escapeHtml(label)}</small>
        <h5>${escapeHtml(names)}</h5>
        <p>${escapeHtml(storyTextWithDisplayNames(entry.text, state.season))}</p>
        <span>${escapeHtml(popularityEpisodeText(entry.episode.label))}</span>
      </div>
    </article>`;
  }

  function renderHighlights() {
    if (!els.highlightsWrap || !state.season) return;
    const season = state.season;
    const performances = challengeHighlightEntries(season);
    const runways = runwayHighlightEntries(season);
    const lipSyncs = lipSyncHighlightEntries(season);
    const untucked = untuckedHighlightEntries(season);

    const bestPerformance = performances.slice().sort((a, b) => b.value - a.value)[0] || null;
    const worstPerformance = performances.slice().sort((a, b) => a.value - b.value)[0] || null;
    const bestRunway = runways.slice().sort((a, b) => b.value - a.value)[0] || null;
    const worstRunway = runways.slice().sort((a, b) => a.value - b.value)[0] || null;
    const bestLipSync = lipSyncs.slice().sort((a, b) => b.averageScore - a.averageScore || b.quality - a.quality)[0] || null;
    const worstLipSync = lipSyncs.slice().sort((a, b) => a.averageScore - b.averageScore)[0] || null;
    const lovedUntucked = untucked.filter((entry) => entry.positive > 0).sort((a, b) => b.positive - a.positive)[0] || null;
    const hatedUntucked = untucked.filter((entry) => entry.negative > 0).sort((a, b) => b.negative - a.negative)[0] || null;
    const biggestDrama = untucked.filter((entry) => entry.isDrama).sort((a, b) => b.dramaScore - a.dramaScore)[0] || null;

    els.highlightsWrap.innerHTML = `
      <section class="highlight-category">
        <div class="highlight-category-head"><h4>Performance Highlights</h4></div>
        <div class="highlight-visual-grid">${soloVisualHighlight(bestPerformance, "Best performance", "best")}${soloVisualHighlight(worstPerformance, "Weakest performance", "worst")}</div>
      </section>
      <section class="highlight-category">
        <div class="highlight-category-head"><h4>Runway Highlights</h4></div>
        <div class="highlight-visual-grid">${soloVisualHighlight(bestRunway, "Best runway", "best")}${soloVisualHighlight(worstRunway, "Weakest runway", "worst")}</div>
      </section>
      <section class="highlight-category">
        <div class="highlight-category-head"><h4>Lip Sync Highlights</h4></div>
        <div class="highlight-visual-grid">${lipSyncVisualHighlight(bestLipSync, "Best lip sync", "best")}${lipSyncVisualHighlight(worstLipSync, "Weakest lip sync", "worst")}</div>
      </section>
      <section class="highlight-category">
        <div class="highlight-category-head"><h4>Untucked Highlights</h4></div>
        <div class="highlight-visual-grid untucked-visual-grid">${untuckedVisualHighlight(lovedUntucked, "The fans loved", "loved")}${untuckedVisualHighlight(hatedUntucked, "The fans hated", "hated")}${untuckedVisualHighlight(biggestDrama, "Biggest drama", "drama")}</div>
      </section>`;
  }

  function bestBy(fn) {
    return state.season.castOrder.slice().sort((a, b) => fn(b) - fn(a))[0];
  }


  function resetSetupConfigToDefaults() {
    state.config = { ...state.defaults };
    writeConfigToInputs();
    saveState();
    renderSelected();
  }

  function enforceExclusiveSetupControls(changedEl = null) {
    const preferForceDouble = changedEl === els.forceDoubleShantay;
    const preferDisableDouble = changedEl === els.disableDoubleShantaysSashays;
    if (els.forceDoubleShantay?.checked && els.disableDoubleShantaysSashays?.checked) {
      if (preferForceDouble) els.disableDoubleShantaysSashays.checked = false;
      else if (preferDisableDouble) els.forceDoubleShantay.checked = false;
      else els.forceDoubleShantay.checked = false;
    }

    const preferForceSlayers = changedEl === els.forceSlayersEpisode;
    const preferDisableNonElim = changedEl === els.disableNonElimination;
    if (els.forceSlayersEpisode?.checked && els.disableNonElimination?.checked) {
      if (preferForceSlayers) els.disableNonElimination.checked = false;
      else if (preferDisableNonElim) els.forceSlayersEpisode.checked = false;
      else els.forceSlayersEpisode.checked = false;
    }
  }

  function resetSeasonOnly() {
    state.config = { ...state.defaults };
    state.season = null;
    state.selected = [];
    state.currentEpisodeIndex = 0;
    state.currentStep = "status";
    clearSavedState();
    writeConfigToInputs();
    saveState();
    applyGlobalFilters();
    showScreen("setup-screen");
  }


  function installSourceDeterrents() {
    if (window.__simuverseSourceDeterrentsInstalled) return;
    window.__simuverseSourceDeterrentsInstalled = true;
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    }, { capture: true });
    document.addEventListener("keydown", (event) => {
      const key = String(event.key || "").toLowerCase();
      const ctrlOrMeta = event.ctrlKey || event.metaKey;
      const devShortcut = key === "f12" ||
        (ctrlOrMeta && event.shiftKey && ["i", "j", "c", "k"].includes(key)) ||
        (event.metaKey && event.altKey && ["i", "j", "c"].includes(key)) ||
        (ctrlOrMeta && key === "u");
      if (!devShortcut) return;
      event.preventDefault();
      event.stopPropagation();
    }, { capture: true });
  }

  function lockAdvancedSettingsOpen() {
    document.querySelectorAll("details.advanced-settings").forEach((details) => {
      details.open = true;
      details.addEventListener("toggle", () => {
        if (!details.open) details.open = true;
      });
    });
  }

  function bindEvents() {
    [els.seasonName, els.eliminationFormatSelect, els.premiereTypeSelect, els.finaleTypeSelect, els.comebackFormatSelect, els.castSize, els.finalistSize, els.tournamentBracketCount, els.tournamentAdvancers, els.tournamentBracketEpisodes, els.tournamentMergeEpisodes, els.tournamentPreMergeWildcard, els.tournamentPreFinaleWildcard, els.twistImmunity, els.twistChocolateRandom, els.twistChocolateChoosable, els.twistLuckyCow, els.twistBadonkaDunkTank, els.specialLalaparuzaSmackdown, els.specialSlayOffs, els.specialReunionLalaparuza, els.specialMidSeasonRateAQueen, els.specialFameGames, els.forceSlayersEpisode, els.forceDoubleShantay, els.disableChallengeRiggory, els.disableLipSyncRiggory, els.disableDoubleShantaysSashays, els.disableNonElimination].forEach((el) => el?.addEventListener("input", (event) => { enforceExclusiveSetupControls(event.target); readConfigFromInputs(); renderSelected(); }));
    els.searchFilter?.addEventListener("input", applyGlobalFilters);
    els.genderFilter?.addEventListener("change", applyGlobalFilters);

    document.getElementById("resetSetupBtn")?.addEventListener("click", resetSetupConfigToDefaults);
    document.getElementById("toCastBtn")?.addEventListener("click", () => {
      readConfigFromInputs();
      const validation = validateSetupConfig(state.config);
      if (validation) { alert(validation); return; }
      state.season = null;
      state.currentEpisodeIndex = 0;
      state.currentStep = "status";
      saveState();
      showScreen("cast-screen");
    });
    document.getElementById("backToSetupBtn")?.addEventListener("click", () => {
      state.season = null;
      state.currentEpisodeIndex = 0;
      state.currentStep = "status";
      resetSetupConfigToDefaults();
      showScreen("setup-screen");
    });
    document.getElementById("toEpisodeBtn")?.addEventListener("click", startSeason);
    document.getElementById("backToCastBtnEpisode")?.addEventListener("click", () => {
      state.season = null;
      state.currentEpisodeIndex = 0;
      state.currentStep = "status";
      saveState();
      showScreen("cast-screen");
    });
    document.getElementById("toStatsBtn")?.addEventListener("click", openStatsScreen);
    document.getElementById("backToEpisodeBtn")?.addEventListener("click", () => { renderEpisode(); showScreen("episode-screen"); });
    document.getElementById("backToCastBtnStats")?.addEventListener("click", () => showScreen("cast-screen"));
    ["resetSeasonBtnCast", "resetSeasonBtnEpisode", "resetSeasonBtnStats"].forEach((id) => document.getElementById(id)?.addEventListener("click", resetSeasonOnly));

    document.getElementById("randomizeCastBtn")?.addEventListener("click", randomizeCast);
    document.getElementById("randomContestantBtn")?.addEventListener("click", addRandomContestant);
    document.getElementById("resetCastBtn")?.addEventListener("click", resetCast);
    document.getElementById("viewAllSkillsBtn")?.addEventListener("click", () => {
      alert(skillKeys.map(([key, label]) => `${label}: ${key}`).join("\n"));
    });

    document.getElementById("customContestantBtn")?.addEventListener("click", () => openCustomContestantModal());
    els.randomizeCustomSkillsBtn?.addEventListener("click", randomizeCustomSkillInputs);
    els.customImageUrl?.addEventListener("input", () => renderCustomImagePreview(els.customImageUrl.value));
    els.customContestantForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (await saveCustomContestantFromForm()) closeCustomContestantModal();
    });
    els.closeCustomContestantModal?.addEventListener("click", closeCustomContestantModal);
    els.cancelCustomContestantBtn?.addEventListener("click", closeCustomContestantModal);
    els.deleteCustomContestantBtn?.addEventListener("click", () => deleteCustomContestant(els.customContestantId?.value));

    document.getElementById("presetCastBtn")?.addEventListener("click", () => { populatePresetModal(); els.presetCastModal?.showModal?.(); });
    els.presetShowSelect?.addEventListener("change", updatePresetSeasons);
    els.presetCastForm?.addEventListener("submit", (event) => { event.preventDefault(); loadPresetCast(); els.presetCastModal?.close?.(); });
    els.closePresetCastModal?.addEventListener("click", () => els.presetCastModal?.close?.());
    els.cancelPresetCastBtn?.addEventListener("click", () => els.presetCastModal?.close?.());
    els.closeSkillModal?.addEventListener("click", () => els.skillModal?.close?.());

    $all(".section-toggle").forEach((btn) => btn.addEventListener("click", () => setEpisodeStep(btn.dataset.step)));
    $all(".proceed-btn").forEach((btn) => btn.addEventListener("click", () => setEpisodeStep(btn.dataset.next)));
    els.episodeSelect?.addEventListener("change", () => { state.currentEpisodeIndex = Number(els.episodeSelect.value) || 0; state.currentStep = "status"; saveState(); renderEpisode(); scrollToEpisodeSection(state.currentStep || "status"); });
    els.nextEpisodeBtn?.addEventListener("click", () => {
      const next = nextVisibleStep(state.currentStep || "results", 1);
      if (next) setEpisodeStep(next);
      else goToNextEpisode();
    });
    els.finishEpisodeBtn?.addEventListener("click", () => {
      const ep = currentEpisode();
      if (ep?.pointCeremony && state.currentStep === "untucked") setEpisodeStep("pointceremony");
      else if (nextVisibleStep(state.currentStep || "untucked", 1) === "trackrecord") setEpisodeStep("trackrecord");
      else goToNextEpisode();
    });
    document.getElementById("finishPointCeremonyBtn")?.addEventListener("click", () => {
      if (nextVisibleStep(state.currentStep || "pointceremony", 1) === "trackrecord") setEpisodeStep("trackrecord");
      else goToNextEpisode();
    });
    els.revealResultsBtn?.addEventListener("click", () => { const ep = currentEpisode(); if (ep) { ep.resultsRevealed = true; saveState(); renderResultsPanel(ep); } });
    els.revealS17LsfylResultsBtn?.addEventListener("click", () => { const ep = currentEpisode(); if (ep) { ep.s17SurvivalRevealed = true; saveState(); renderS17LsfylResultsPanel(ep); } });
    els.revealCrownWinnerBtn?.addEventListener("click", () => { const ep = currentEpisode(); if (ep) { ep.resultsRevealed = true; saveState(); renderAllWinnersFinalePanels(ep); } });
    els.allWinnersFinalStatsBtn?.addEventListener("click", () => {
      const next = nextVisibleStep(state.currentStep || "winner", 1);
      if (next === "trackrecord") setEpisodeStep("trackrecord");
      else openStatsScreen();
    });
    els.downloadTrackRecordBtn?.addEventListener("click", downloadTrackRecordPng);

    $all(".stats-tab").forEach((tab) => tab.addEventListener("click", () => {
      if (tab.hidden) return;
      $all(".stats-tab").forEach((btn) => btn.classList.toggle("is-active", btn === tab));
      $all(".stats-panel").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.tabPanel === tab.dataset.tab));
    }));
  }

  function init() {
    lockAdvancedSettingsOpen();
    installSourceDeterrents();
    loadState();
    loadCustomContestants();
    writeConfigToInputs();
    hydrateRoster();
    bindEvents();
    if (state.season?.episodes?.length) {
      renderEpisodeSelect();
      renderEpisode();
      showScreen("episode-screen");
    }
  }

  init();
})();
