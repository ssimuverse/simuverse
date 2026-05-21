(() => {
  "use strict";

  const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#050000"/><stop offset="55%" stop-color="#280006"/><stop offset="100%" stop-color="#69000d"/></linearGradient></defs>
      <rect width="320" height="320" rx="42" fill="url(#g)"/>
      <path d="M160 44c39 36 74 79 74 134 0 48-33 88-74 88s-74-40-74-88c0-55 35-98 74-134z" fill="#aa0f1a" opacity=".52"/>
      <circle cx="132" cy="136" r="18" fill="#f7e9e9" opacity=".72"/><circle cx="188" cy="136" r="18" fill="#f7e9e9" opacity=".72"/>
      <path d="M112 204c34 28 62 28 96 0" stroke="#f7e9e9" stroke-width="12" stroke-linecap="round" fill="none" opacity=".55"/>
    </svg>`);

  const CUSTOM_CONTESTANTS_KEY = "dragula_custom_contestants_v1";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const E = (id) => document.getElementById(id);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);
  const esc = (txt) => String(txt ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const pct = (n) => `${Math.round(n)}%`;

  const descriptions = {
    format: {
      regular: "Classic Dragula",
      titans: "Classic Dragula with more twists",
      resurrection: "A short version spin-off"
    },
    premiere: {
      regular: "Normal premiere",
      late_entry: "One contestant joins the competition later in the season",
      fakeout_elim: "The first exterminated monster returns to the competition later"
    }
  };

  const skillKeys = [
    ["glamour", "Glamour"], ["horror", "Horror"], ["filth", "Filth"],
    ["design", "Design"], ["performance", "Performance"], ["fear", "Fear"], ["floor", "Floor Show"]
  ];

  const relationshipScale = [
    { value: 10, label: "Closest Allies", className: "rel-pos-10" },
    { value: 9, label: "Trusted Allies", className: "rel-pos-9" },
    { value: 8, label: "Very Close", className: "rel-pos-8" },
    { value: 7, label: "Close", className: "rel-pos-7" },
    { value: 6, label: "Supportive", className: "rel-pos-6" },
    { value: 5, label: "Friendly", className: "rel-pos-5" },
    { value: 4, label: "Positive", className: "rel-pos-4" },
    { value: 3, label: "Warm", className: "rel-pos-3" },
    { value: 2, label: "Respectful", className: "rel-pos-2" },
    { value: 1, label: "Slightly Positive", className: "rel-pos-1" },
    { value: 0, label: "Neutral", className: "rel-zero" },
    { value: -1, label: "Slightly Tense", className: "rel-neg-1" },
    { value: -2, label: "Uncomfortable", className: "rel-neg-2" },
    { value: -3, label: "Tense", className: "rel-neg-3" },
    { value: -4, label: "Frustrated", className: "rel-neg-4" },
    { value: -5, label: "Rivals", className: "rel-neg-5" },
    { value: -6, label: "Hostile", className: "rel-neg-6" },
    { value: -7, label: "Very Hostile", className: "rel-neg-7" },
    { value: -8, label: "Enemies", className: "rel-neg-8" },
    { value: -9, label: "Bitter Enemies", className: "rel-neg-9" },
    { value: -10, label: "Total Enemies", className: "rel-neg-10" }
  ];

  const fallbackCauldronEvents = [
    { type: "bonding", participants: 2, relationship: 2, popularity: 1, text: "{A} checks on {B} after the floor show and the two monsters find common ground." },
    { type: "bonding", participants: 2, relationship: 2, popularity: 1, text: "{A} and {B} share a quiet moment in The Cauldron and agree the competition is getting brutal." },
    { type: "drama", participants: 2, relationship: -3, popularity: 1, text: "{A} calls out {B} for acting fake in front of the Boulets." },
    { type: "drama", participants: 2, relationship: -2, popularity: 1, text: "{A} and {B} clash over who deserved to be in the bottom." },
    { type: "rivalry", participants: 2, relationship: -1, popularity: 1, text: "{A} admits that {B} is becoming their biggest obstacle in the competition." },
    { type: "storyline", participants: 1, relationship: 0, popularity: 2, text: "{A} opens up about what becoming the World’s Next Drag Supermonster would mean to them." },
    { type: "meltdown", participants: 1, relationship: 0, popularity: -1, text: "{A} spirals after critiques and needs a moment away from the group." },
    { type: "strategy", participants: 2, relationship: -1, popularity: 1, text: "{A} quietly tells the others that {B} should be watched closely." }
  ];

  const lastSupperTopicTemplates = [
    "The monsters revisit their audition tapes and discuss what changed once filming began.",
    "The cast shares what advice they would give themselves before filming the season.",
    "The monsters talk about how it feels being directed by The Boulet Brothers.",
    "The cast discusses drag identities, personal identities, and what parts of themselves they brought to the competition.",
    "The monsters debate whether a fiery audition personality matched what appeared on-screen.",
    "The cast talks about quiet competitors, loud personalities, and conflicts that never fully resolved.",
    "The monsters discuss who became the center of the drama this season.",
    "The cast opens up about sobriety, pressure, and staying grounded in a chaotic competition.",
    "The monsters compare relationships on camera versus relationships off camera.",
    "The finalists explain what winning the crown would mean to them.",
    "The cast discusses a first elimination and whether the right monster went home first.",
    "The monsters revisit returnees, second chances, and what it means to come back into the competition.",
    "The cast discusses a monster with a big personality and how that energy affected the group.",
    "The monsters revisit the biggest argument of the season and what was left unsaid.",
    "The cast talks about a meltdown, what caused it, and how everyone reacted in the moment.",
    "The monsters revisit a music-band challenge and debate which group had the stronger performance.",
    "The cast discusses unshown footage, unseen tension, and what viewers missed.",
    "The monsters talk about mental health, pressure, and how vulnerable moments were handled.",
    "The cast reflects on the sisterhood of the season and whether it was real or complicated.",
    "The monsters discuss who rose the most throughout the season.",
    "The cast talks about the extermination challenges and which one was the most terrifying.",
    "Fan question: which monster would be interested in competing in another Resurrection?",
    "Fan question: what look detail became more iconic than anyone expected?",
    "Fan question: which friendship surprised the cast the most?",
    "Fan question: why did certain off-camera drama stay off-camera?",
    "Anonymous monster question: who should have gone home earlier?",
    "Anonymous monster question: who played the smartest game?",
    "Anonymous monster question: who played victim the most?",
    "Anonymous monster question: who does the cast think is the trade of the season?",
    "Anonymous monster question: any final words to the other contestants?",
    "The monsters revisit {winner}'s win in {challenge} and debate whether anyone else deserved it.",
    "The cast discusses the extermination that sent {eliminated} home after {challenge}.",
    "The Boulets bring up the tension between {a} and {b} that boiled over in The Cauldron.",
    "The monsters discuss whether {bottom} surviving extermination changed the course of the season.",
    "The cast looks back at {winner}'s strongest floorshow moment in {challenge}.",
    "The group talks about the curse or power plays that shifted the competition.",
    "The eliminated monsters give the finalists one final warning before the finale.",
    "The Boulets ask who surprised the cast the most this season.",
    "The monsters discuss who played the strongest social game.",
    "The cast shares final words before the last floorshow package."
  ];
  const fallbackFloorshows = [
    { name: "Horror Icons Reimagined", type: "look", weights: { horror:.35, design:.25, glamour:.15, performance:.15, filth:.10 } },
    { name: "Killer Dolls", type: "look", weights: { horror:.28, design:.25, glamour:.15, performance:.22, filth:.10 } },
    { name: "Monsters of Rock", type: "performance", weights: { performance:.40, horror:.20, glamour:.15, design:.15, filth:.10 }, team:true },
    { name: "Ghostship Glamour", type: "look", weights: { glamour:.30, horror:.25, design:.25, performance:.10, filth:.10 } },
    { name: "Trashcan Children", type: "filth", weights: { filth:.38, design:.22, horror:.18, performance:.12, glamour:.10 } },
    { name: "Holiday of Horrors", type: "filth", weights: { filth:.30, horror:.28, design:.20, performance:.12, glamour:.10 } },
    { name: "Nosferatu Beach Party", type: "performance", weights: { glamour:.25, horror:.25, performance:.25, design:.15, filth:.10 } },
    { name: "Frankenhooker", type: "acting", weights: { performance:.35, horror:.22, glamour:.18, filth:.15, design:.10 } },
    { name: "Dungeons and Drag Queens", type: "acting", weights: { performance:.30, horror:.24, design:.20, glamour:.14, filth:.12 } },
    { name: "Ultraviolet Umbras", type: "look", weights: { design:.32, glamour:.24, horror:.20, performance:.14, filth:.10 } },
    { name: "The Ghost Train", type: "performance", weights: { performance:.32, horror:.26, glamour:.16, design:.16, filth:.10 } },
    { name: "Monochrome Monster", type: "look", weights: { design:.32, glamour:.26, horror:.20, performance:.12, filth:.10 } }
  ];

  const fallbackFrightFeats = [
    { name: "Haunted House Scroll Hunt", text: "search a pitch-black haunted house for a sealed scroll", prize: "immunity scroll" },
    { name: "Garbage Smoothie Chug", text: "drink a rancid garbage smoothie before the others", prize: "curse power" },
    { name: "Needle Nerve Test", text: "endure hypodermic needle piercings without breaking character", prize: "curse power" },
    { name: "Leech Water Tank", text: "submerge their arms in leech-infested water", prize: "immunity" },
    { name: "Coffin Claustrophobia", text: "stay locked in a coffin while insects crawl over them", prize: "Key of Life & Death" },
    { name: "Blind Makeup Sprint", text: "paint a face in darkness", prize: "curse power" },
    { name: "Riddle for Blood", text: "solve horror riddles under a time limit", prize: "nomination power" }
  ];

  const curses = [
    { name: "Boulet Blindness Curse", text: "must prepare their floorshow makeup without sight", penalty: 12 },
    { name: "Curse of Baldness", text: "must present the floorshow without a wig", penalty: 8 },
    { name: "One-Armed Monster Curse", text: "has one arm restricted during preparation", penalty: 10 },
    { name: "Tiny Mirror Curse", text: "loses their mirror and must paint in a compact", penalty: 8 },
    { name: "Filth Bath Curse", text: "must incorporate a disgusting prop into the floorshow", penalty: 6 },
    { name: "Teletubby Toilet Bowl Curse", text: "must do makeup in a porta-potty", penalty: 11 }
  ];

  const fallbackExterminations = [
    "be buried alive until only one monster can keep calm",
    "submerge their arms in leech-infested water",
    "ride a mechanical bull in full drag",
    "endure shock therapy in electric chairs",
    "sit inside cockroach-infested chambers",
    "stay in vacuum-sealed latex as long as possible",
    "skydive from a plane and keep their nerve",
    "get a tattoo chosen by another bottom monster",
    "transfer maggots by mouth into a beaker",
    "walk through a haunted house and collect the final invitation",
    "fight head-to-head with pugil sticks",
    "stay inside a freezer chamber as long as possible",
    "survive a Dead by Daylight-style paintball hunt",
    "perform a horror lip sync for survival"
  ];

  const deathScenes = [
    "is dragged screaming through a blood-red doorway as the lights cut out.",
    "is swallowed by the floorboards while a funeral bell rings.",
    "is chased into the woods and vanishes beneath a burst of crows.",
    "is locked in a coffin as roses turn black around them.",
    "is pulled under a bath of crimson water by unseen hands.",
    "is crowned with thorns, laughs once, and collapses into ash.",
    "is buried beneath a wall of static and candle smoke.",
    "is taken by the exterminator while the Boulets toast to the next nightmare."
  ];


  function normalizeWeights(rawWeights) {
    const aliases = {
      glamour: "glamour", runway: "glamour", look: "glamour", fashion: "glamour",
      horror: "horror", fear: "fear",
      filth: "filth", comedy: "filth", gross: "filth",
      design: "design", construction: "design", makeup: "design",
      performance: "performance", acting: "performance", improv: "performance", dance: "performance", lipsync: "performance",
      floor: "floor"
    };
    const weights = {};
    Object.entries(rawWeights || {}).forEach(([key, value]) => {
      const mapped = aliases[String(key).toLowerCase()] || String(key).toLowerCase();
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return;
      weights[mapped] = (weights[mapped] || 0) + n;
    });
    if (!Object.keys(weights).length) return { glamour:.20, horror:.20, filth:.20, design:.20, performance:.20 };
    const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
    Object.keys(weights).forEach(key => weights[key] = weights[key] / total);
    return weights;
  }

  function normalizeFloorShow(item, i = 0) {
    const format = String(item?.format || (item?.team ? "2_teams" : "solo")).toLowerCase();
    return {
      ...item,
      id: item?.id || `floor_${i}`,
      name: item?.name || item?.title || `Floor Show ${i + 1}`,
      type: item?.type || "look",
      format,
      description: item?.description || item?.text || "The monsters present their floorshow.",
      weights: normalizeWeights(item?.weights || item?.requiredSkills || item?.skills),
      team: !!item?.team || !["solo", "individual"].includes(format),
      exterminationScene: item?.exterminationScene || null
    };
  }



  function floorShowTypeKey(floor) {
    const raw = `${floor?.type || ""} ${floor?.id || ""} ${floor?.name || ""}`.toLowerCase();
    if (/music[\s_-]*bands?|monsters\s+of\s+rock|rock\s+band|battle\s+of\s+the\s+bands/.test(raw)) return "music_bands";
    if (/\bmusical\b|\bmusical[_\s-]/.test(raw)) return "musical";
    return String(floor?.type || floor?.id || floor?.name || "look").toLowerCase().replace(/[\s-]+/g, "_");
  }

  function floorShowTypeLabel(type) {
    const raw = String(type || "").trim();
    if (!raw) return "—";
    return raw
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map(word => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "")
      .join(" ");
  }

  function wasFloorShowKindUsed(kind) {
    return !!state.season?.episodes?.some(e => e.type === "competitive" && floorShowTypeKey(e.floorshow) === kind);
  }

  function isFloorShowEligible(floor, activeCount) {
    const kind = floorShowTypeKey(floor);
    if (kind === "music_bands") return (activeCount === 8 || activeCount === 6) && !wasFloorShowKindUsed("music_bands");
    if (kind === "musical") return !wasFloorShowKindUsed("musical");
    return true;
  }

  function selectFloorShow(activeCount) {
    const unused = floorshows.filter(f => !state.season.usedFloorshows.includes(f.name));
    const basePool = unused.length ? unused : floorshows;
    const eligible = basePool.filter(f => isFloorShowEligible(f, activeCount));
    const musicBands = eligible.filter(f => floorShowTypeKey(f) === "music_bands");
    if (musicBands.length && activeCount === 8 && should(.70)) return pick(musicBands);
    if (musicBands.length && activeCount === 6 && should(.35)) return pick(musicBands);
    if (eligible.length) return pick(eligible);
    const fallbackNonSpecial = basePool.filter(f => !["music_bands", "musical"].includes(floorShowTypeKey(f)));
    return pick(fallbackNonSpecial.length ? fallbackNonSpecial : basePool);
  }
  function inferFrightPrize(item) {
    const explicit = String(item?.prize || item?.reward || item?.outcomeType || item?.outcome || "").toLowerCase();
    const haystack = `${explicit} ${item?.name || ""} ${item?.description || ""} ${item?.text || ""}`.toLowerCase();
    if (/key of life|life and death|\bkey\b/.test(haystack)) return "key";
    if (/curse|voodoo|hex|disadvantage|sabotage/.test(haystack)) return "curse";
    if (/nominate|nomination|bottom|extermination/.test(haystack)) return "nomination";
    if (/immunity|immune|scroll/.test(haystack)) return "immunity";
    if (/advantage|power/.test(haystack)) return "advantage";
    return explicit || "advantage";
  }

  function normalizeFrightFeat(item, i = 0) {
    const normalized = {
      ...item,
      id: item?.id || `fright_${i}`,
      type: item?.type || "any",
      name: item?.name || item?.title || `Fright Feat ${i + 1}`,
      text: item?.text || item?.description || "complete a terrifying Fright Feat",
      description: item?.description || item?.text || "Complete a terrifying Fright Feat."
    };
    normalized.prizeType = inferFrightPrize(normalized);
    normalized.prize = normalized.prize || normalized.prizeType;
    return normalized;
  }

  function normalizeExtermination(item, i = 0) {
    if (typeof item === "string") {
      return { id:`exterm_${i}`, name:item, description:`The monsters must ${item}.`, comments:{ strong:[], mixed:[], weak:[] } };
    }
    return {
      ...item,
      id: item?.id || `exterm_${i}`,
      name: item?.name || item?.title || `Extermination ${i + 1}`,
      description: item?.description || item?.text || "The monsters face the extermination challenge.",
      comments: item?.comments || { strong:[], mixed:[], weak:[] }
    };
  }

  function dataArray(name, fallback) {
    const value = window[name];
    return Array.isArray(value) && value.length ? value : fallback;
  }

  const floorshows = dataArray("FLOOR_SHOWS", fallbackFloorshows).map(normalizeFloorShow);
  const frightFeats = dataArray("FRIGHT_FEATS", fallbackFrightFeats).map(normalizeFrightFeat);
  const exterminations = dataArray("EXTERMINATIONS", fallbackExterminations).map(normalizeExtermination);

  function deathSceneText(ep) {
    if (!ep?.eliminated) return "The Boulets spare the monsters tonight. No one is exterminated, but the fear lingers.";
    const name = monster(ep.eliminated).name;
    const scene = ep.floorshow?.exterminationScene;
    if (scene?.story) return String(scene.story).replaceAll("{Contestant}", name).replaceAll("{contestant}", name).replaceAll("{name}", name);
    return `${name} ${pick(deathScenes)}`;
  }

  function deathSceneTitle(ep) {
    return ep?.floorshow?.exterminationScene?.title || "Death Scene";
  }

  function maskContestantName(text, name) {
    const escapedText = esc(text);
    const escapedName = esc(name);
    return escapedText.split(escapedName).join(`<span class="blurred-name">${escapedName}</span>`);
  }

  function exterminationComment(extermination, placement) {
    const pool = extermination?.comments?.[placement] || [];
    const comment = Array.isArray(pool) && pool.length ? pick(pool) : "";
    return comment;
  }

  const fallbackGuestJudges = [
    "Akela Cooper",
    "Jamie Clayton",
    "Don Mancini",
    "Jennifer Tilly",
    "Tananarive Due",
    "Tatiana Maslany",
    "Justin Simien",
    "Darren Stein",
    "Mike Flanagan",
    "David Dastmalchian",
    "Joe Bob Briggs",
    "Diana \"Darcy the Mail Girl\" Prince",
    "Matheiu Cote",
    "Felissa Rose",
    "Matthew Lillard",
    "Jazmin Bean",
    "Lauren LaVera",
    "Kevin Smith",
    "Harley Quinn Smith",
    "Vanessa Hudgens",
    "GG Magree",
    "Poppy",
    "Rachel True",
    "Kristian Nairn",
    "Phil Nobile Jr.",
    "Bonnie Aarons",
    "Peaches Christ",
    "Michael Varrati",
    "Harvey Guillen",
    "Phil Jimenez",
    "Amanda Lepore",
    "Henry Rollins"
  ];

  const fallbackRosterNames = [
    "Vander Von Odd", "Biqtch Puddin", "Landon Cider", "Dahli", "Niohuru X", "Asia Consent", "Victoria Elizabeth Black", "Priscilla Chambers", "Saint", "HoSo Terra Toma", "Sigourney Beaver", "Orkgotik", "Throb Zombie", "Grey Matter", "Auntie Heroine", "Koco Caine", "Cynthia Doll", "Yuri", "La Zavaleta", "Blackberri", "Fantasia Royale Gaga", "Abhora", "Disasterina", "Louisianna Purchase"
  ];

  const state = {
    config: {}, roster: [], filtered: [], selected: [], customContestants: [], relationshipSetup: {}, lateEntryId: null, season: null, currentEpisode: 0, currentStep: "status"
  };

  const els = new Proxy({}, { get: (_, id) => E(id) });

  const CAST_DATA_BASE_URL = (() => {
    const scripts = Array.from(document.scripts);
    const castScript = scripts.find((tag) => /(?:^|\/)(?:rpdr_cast_data|drag_race_data)\.js(?:[?#].*)?$/i.test(tag.getAttribute("src") || ""));
    if (!castScript || !castScript.src) return "";
    try { return new URL(".", castScript.src).href; } catch (err) { return ""; }
  })();

  function resolveAssetPath(path) {
    const value = String(path || "").trim();
    if (!value) return PLACEHOLDER;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|data:|blob:)/i.test(value) || value.startsWith("/")) return value;
    if (!CAST_DATA_BASE_URL) return value;
    try { return new URL(value, CAST_DATA_BASE_URL).href; } catch (err) { return value; }
  }

  function firstValue(...values) {
    for (const value of values) {
      if (Array.isArray(value) && value.length) return value[0];
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }
    return "";
  }
  function imageFor(raw) { return resolveAssetPath(firstValue(raw?.image, raw?.img, raw?.photo, raw?.imageUrl, raw?.photoUrl, raw?.picture, raw?.portrait)); }
  function nameFor(raw) { return firstValue(raw?.dragName, raw?.name, raw?.fullName, raw?.nickname, raw?.id) || "Unknown Monster"; }
  function seasonsOf(raw) {
    if (Array.isArray(raw?.season)) return raw.season.map(String);
    if (Array.isArray(raw?.cycles)) return raw.cycles.map(String);
    if (raw?.seasonsByShow && typeof raw.seasonsByShow === "object") return Object.values(raw.seasonsByShow).flat().map(String);
    if (raw?.seasonByShow && typeof raw.seasonByShow === "object") return Object.values(raw.seasonByShow).flat().map(String);
    return raw?.season != null ? [String(raw.season)] : [String(firstValue(raw?.originalSeason, raw?.seasonName, "Custom"))];
  }
  function showsOf(raw) {
    if (Array.isArray(raw?.shows) && raw.shows.length) return raw.shows.map(String);
    if (Array.isArray(raw?.show) && raw.show.length) return raw.show.map(String);
    if (raw?.show) return [String(raw.show)];
    if (raw?.franchise) return [String(raw.franchise)];
    if (raw?.series) return [String(raw.series)];
    return ["RuPaul's Drag Race"];
  }
  function normalizeStat(value, fallback = rnd(45, 95)) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return n <= 15 ? clamp(Math.round((n / 15) * 100), 1, 100) : clamp(n, 1, 100);
  }

  function pickCastSource() {
    const direct = window.DRAG_RACE_QUEENS || window.QUEENS || window.DRAG_QUEENS || window.RPDR_CAST_DATA || window.RPDR_CAST || window.DRAG_RACE_DATA || window.DRAG_RACE_CAST || window.DRAGULA_MONSTERS;
    if (Array.isArray(direct)) return direct;
    if (direct && typeof direct === "object") return direct.queens || direct.cast || direct.contestants || direct.data || [];
    for (const key of Object.keys(window)) {
      if (!/QUEEN|CAST|DRAG/i.test(key)) continue;
      const value = window[key];
      const arr = Array.isArray(value) ? value : (value && typeof value === "object" ? (value.queens || value.cast || value.contestants || value.data) : null);
      if (Array.isArray(arr) && arr.length && arr.some(item => item && typeof item === "object" && (item.name || item.dragName || item.fullName))) return arr;
    }
    return [];
  }



  function normalizeCustomImageUrl(value) {
    const src = String(value || "").trim();
    if (!src || /^javascript:/i.test(src)) return PLACEHOLDER;
    return src;
  }

  function customSkillDisplayValue(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 8;
    if (n <= 15) return clamp(Math.round(n), 1, 15);
    return clamp(Math.round((n / 100) * 15), 1, 15);
  }

  function makeCustomContestant(raw = {}, index = 0) {
    const fullName = String(raw.fullName || raw.name || raw.nickname || `Custom Monster ${index + 1}`).trim();
    const nickname = String(raw.nickname || fullName).trim();
    const image = normalizeCustomImageUrl(raw.image || raw.imageUrl || raw.photo || "");
    const rawSkills = raw.skills || {};
    const skills = {
      glamour: normalizeStat(rawSkills.glamour ?? 8),
      horror: normalizeStat(rawSkills.horror ?? 8),
      filth: normalizeStat(rawSkills.filth ?? 8),
      design: normalizeStat(rawSkills.design ?? 8),
      performance: normalizeStat(rawSkills.performance ?? 8),
      fear: normalizeStat(rawSkills.fear ?? 8),
      floor: normalizeStat(rawSkills.floor ?? 8)
    };
    if (!rawSkills.floor) {
      skills.floor = Math.round((skills.glamour + skills.horror + skills.filth + skills.design + skills.performance) / 5);
    }
    return {
      id: String(raw.id || `custom_${Date.now()}_${index}`),
      raw: {},
      name: fullName,
      fullName,
      nickname,
      image,
      imageUrl: image,
      show: "Custom",
      shows: ["Custom"],
      season: "Custom",
      seasons: ["Custom"],
      skills,
      relationships: {},
      isCustom: true
    };
  }

  function loadCustomContestants() {
    try {
      const raw = localStorage.getItem(CUSTOM_CONTESTANTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      state.customContestants = Array.isArray(parsed) ? parsed.map(makeCustomContestant) : [];
    } catch (err) {
      console.warn("Failed to load custom monsters", err);
      state.customContestants = [];
    }
  }

  function saveCustomContestants() {
    try {
      localStorage.setItem(CUSTOM_CONTESTANTS_KEY, JSON.stringify((state.customContestants || []).map(makeCustomContestant)));
    } catch (err) {
      console.warn("Failed to save custom monsters", err);
      alert("Could not save custom monsters in this browser.");
    }
  }

  function refreshRosterAfterCustomChange() {
    state.season = null;
    loadRoster();
    initFilters();
    renderRoster();
  }

  function loadRoster() {
    const raw = pickCastSource();
    const list = Array.isArray(raw) && raw.length ? raw : fallbackRosterNames.map((name, i) => ({ id:`monster_${i}`, name, season:"Dragula", show:"Dragula" }));
    const baseRoster = list.map((item, i) => {
      const baseSkills = item.skills || item.baseSkills || {};
      const glamourBase = baseSkills.glamour ?? baseSkills.runway ?? baseSkills.design;
      const generated = {
        glamour: normalizeStat(glamourBase),
        horror: normalizeStat(baseSkills.horror ?? baseSkills.acting),
        filth: normalizeStat(baseSkills.filth ?? baseSkills.comedy),
        design: normalizeStat(baseSkills.design ?? baseSkills.runway ?? glamourBase),
        performance: normalizeStat(baseSkills.performance ?? baseSkills.lipsync ?? baseSkills.dance),
        fear: normalizeStat(baseSkills.fear ?? baseSkills.improv),
        floor: 50
      };
      generated.floor = Math.round((generated.glamour + generated.horror + generated.filth + generated.design + generated.performance) / 5);
      const shows = showsOf(item);
      const seasons = seasonsOf(item);
      return {
        id: String(item.id || `m_${i}`), raw:item, name:nameFor(item), image:imageFor(item),
        show: shows[0] || "RuPaul's Drag Race", shows,
        season: seasons[0] || "Custom", seasons,
        skills: generated,
        relationships: {}
      };
    });
    const customRoster = (state.customContestants || []).map(makeCustomContestant);
    state.roster = [...baseRoster, ...customRoster].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    const validIds = new Set(state.roster.map(m => m.id));
    state.selected = (state.selected || []).filter(id => validIds.has(id));
    state.filtered = state.roster.slice();
  }

  function configureUiText() {
    if (els.eliminationFormatHelp && els.eliminationFormatSelect) {
      els.eliminationFormatHelp.textContent = descriptions.format[els.eliminationFormatSelect.value] || "";
    }
    if (els.premiereHelp && els.premiereTypeSelect) {
      els.premiereHelp.textContent = descriptions.premiere[els.premiereTypeSelect.value] || "";
    }
    if (els.castSizeValue && els.castSize) els.castSizeValue.textContent = els.castSize.value;
    if (els.finalistSize && els.finalistSizeValue) {
      const finalists = clamp(Number(els.finalistSize.value), 3, 4);
      els.finalistSize.value = finalists;
      els.finalistSizeValue.textContent = finalists;
    }
    if (els.eliminationFormatSelect?.value === "resurrection") {
      if (els.castSize) { els.castSize.min = 6; els.castSize.max = 10; els.castSize.value = clamp(Number(els.castSize.value || 8), 6, 10); }
      if (els.premiereTypeSelect) { els.premiereTypeSelect.value = "regular"; els.premiereTypeSelect.disabled = true; }
      [els.twistChocolateChoosable, els.twistChocolateRandom, els.twistSonicTransducer, els.twistHellboundShowdown].forEach(el => { if (el) { el.checked = false; el.disabled = true; } });
    } else {
      if (els.castSize) { els.castSize.min = 8; els.castSize.max = 16; els.castSize.value = clamp(Number(els.castSize.value || 12), 8, 16); }
      if (els.premiereTypeSelect) els.premiereTypeSelect.disabled = false;
      [els.twistChocolateChoosable, els.twistChocolateRandom, els.twistSonicTransducer, els.twistHellboundShowdown].forEach(el => { if (el) el.disabled = false; });
      if (els.twistHellboundShowdown?.checked && els.finalistSize) els.finalistSize.value = 4;
    }
    if (els.castSizeValue && els.castSize) els.castSizeValue.textContent = els.castSize.value;
    if (els.finalistSizeValue && els.finalistSize) els.finalistSizeValue.textContent = els.twistHellboundShowdown?.checked && els.eliminationFormatSelect?.value !== "resurrection" ? 4 : els.finalistSize.value;
    if (els.slotCount && els.castSize) els.slotCount.textContent = els.castSize.value;
  }

  function readConfig() {
    const format = els.eliminationFormatSelect?.value || "regular";
    const isResurrection = format === "resurrection";
    const hellboundEnabled = !isResurrection && !!els.twistHellboundShowdown?.checked;
    const premiere = isResurrection ? "regular" : (els.premiereTypeSelect?.value || "regular");
    const selectedFinalistSize = clamp(Number(els.finalistSize?.value || 3), 3, 4);
    const finalistSize = hellboundEnabled ? 3 : selectedFinalistSize;
    const finaleSize = hellboundEnabled ? 4 : selectedFinalistSize;
    const castMin = isResurrection ? 6 : 8;
    const castMax = isResurrection ? 10 : 16;
    const castSize = clamp(Number(els.castSize?.value || (isResurrection ? 8 : 12)), castMin, castMax);
    const riggoryDisabled = !!els.disableChallengeRiggory?.checked;
    return {
      name: "The World’s Next Drag Supermonster",
      mode: "viewer",
      format,
      premiere,
      finale: finaleSize === 4 ? "top4" : "top3",
      castSize,
      finalistSize,
      finaleSize,
      frightFeats: !isResurrection,
      keys: !isResurrection && !!els.twistChocolateRandom?.checked,
      curses: !isResurrection && !!els.twistChocolateChoosable?.checked,
      sonicTransducer: !isResurrection && !!els.twistSonicTransducer?.checked,
      hellboundShowdown: hellboundEnabled,
      winnerNomination: !isResurrection && !!els.twistSonicTransducer?.checked,
      allParticipate: !isResurrection && hellboundEnabled,
      noShowRiggory: riggoryDisabled,
      noExtermRiggory: riggoryDisabled,
      noSaves: isResurrection || !!els.disableNonElimination?.checked
    };
  }

  function showScreen(id) {
    $$(".screen").forEach(s => s.classList.toggle("is-active", s.id === id));
  }

  function scrollToEpisodeSection() {
    const episodeScreen = E("episode-screen");
    if (!episodeScreen?.classList.contains("is-active")) return;
    requestAnimationFrame(() => {
      const panel = $(".episode-panel.is-active");
      (panel || $(".episode-panel-shell") || episodeScreen).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function showPanel(step, scroll = false) {
    if (step === "__nextEpisode") {
      proceedEpisode();
      return;
    }
    const visible = getVisibleSteps();
    if (!visible.includes(step)) step = visible[0] || "status";
    state.currentStep = step;
    $$(".section-toggle").forEach(b => b.classList.toggle("is-active", b.dataset.step === step));
    $$(".episode-panel").forEach(p => p.classList.toggle("is-active", p.dataset.panel === step));
    const title = $(`.section-toggle[data-step="${step}"]`)?.textContent || step;
    if (els.episodeSubline) els.episodeSubline.textContent = title;
    if (scroll) scrollToEpisodeSection();
  }

  function getVisibleSteps() {
    const buttons = $$(".section-toggle").filter(btn => !btn.hidden && btn.style.display !== "none");
    return buttons.map(btn => btn.dataset.step);
  }

  function configureEpisodeSteps(ep, safeIds = []) {
    const isFinale = ep?.type === "finale";
    const isLastSupper = ep?.type === "last_supper";
    const isResurrectionCompetitive = !!ep?.resurrection;
    const isResurrectionFinale = !!ep?.resurrectionFinale;
    const hasReturnee = !!(ep?.returnedContestant || ep?.lateEntryContestant);
    const hasPower = !!(ep?.curse || ep?.keyPower || ep?.immunity || ep?.winnerNomination || ep?.frightAdvantage);
    const hasFright = !!ep?.hasFright;
    const hasHellbound = !!(ep?.hellbound || ep?.hellboundFinal);
    const hasJudging = isFinale || (!!ep?.titansVoting ? false : safeIds.length > 0);
    const visibility = isResurrectionFinale ? {
      returnee: false,
      status: false,
      guest: false,
      mini: false,
      teams: false,
      maxi: false,
      judging: false,
      placements: false,
      cauldron: false,
      lipsync: false,
      results: false,
      hellbound: false,
      winner: true,
      track: true
    } : isResurrectionCompetitive ? {
      returnee: hasReturnee,
      status: true,
      guest: true,
      mini: hasFright,
      teams: false,
      maxi: true,
      judging: safeIds.length > 0,
      placements: true,
      cauldron: true,
      lipsync: false,
      results: true,
      hellbound: false,
      winner: false,
      track: true
    } : isLastSupper ? {
      returnee: false,
      status: true,
      guest: false,
      mini: true,
      teams: false,
      maxi: false,
      judging: false,
      placements: false,
      cauldron: false,
      lipsync: false,
      results: false,
      hellbound: hasHellbound,
      winner: false,
      track: false
    } : {
      returnee: hasReturnee,
      status: true,
      guest: true,
      mini: hasFright,
      teams: hasPower,
      maxi: true,
      judging: hasJudging,
      placements: !isFinale,
      cauldron: !isFinale,
      lipsync: !isFinale && !ep?.ghostlyGallows,
      results: !isFinale,
      hellbound: hasHellbound,
      winner: isFinale,
      track: true
    };
    $$(".section-toggle").forEach(btn => {
      const show = !!visibility[btn.dataset.step];
      btn.hidden = !show;
      btn.style.display = show ? "" : "none";
    });
    $$(".episode-panel").forEach(panel => {
      const show = !!visibility[panel.dataset.panel];
      panel.hidden = !show;
    });
    const order = ["returnee", "status", "guest", "mini", "teams", "maxi", "judging", "placements", "cauldron", "lipsync", "results", "hellbound", "winner", "track"].filter(step => visibility[step]);
    $$(".episode-panel").forEach(panel => {
      const current = panel.dataset.panel;
      const i = order.indexOf(current);
      const prev = order[Math.max(0, i - 1)] || order[0];
      const next = i >= 0 && i === order.length - 1 ? "__nextEpisode" : (order[Math.min(order.length - 1, i + 1)] || order.at(-1));
      $$(".proceed-btn", panel).forEach(btn => {
        const text = btn.textContent.trim().toLowerCase();
        if (text === "back") btn.dataset.next = prev;
        else btn.dataset.next = next;
      });
    });
    return order;
  }

  function makeDropdown(root, values, selectedSet, onChange, options = {}) {
    if (!root) return;
    const label = options.placeholder || root.dataset.placeholder || "All";
    const disabled = !!options.disabled;
    root.classList.toggle("is-disabled", disabled);
    root.classList.remove("is-open");
    root.innerHTML = `<button type="button" class="dropdown-summary" ${disabled ? "disabled" : ""}>${label}</button><div class="dropdown-options"></div>`;
    const optionsBox = $(".dropdown-options", root);
    values.forEach(v => {
      const id = `${root.id}_${String(v).replace(/\W/g,"_")}`;
      const checked = selectedSet.has(String(v)) ? "checked" : "";
      optionsBox.insertAdjacentHTML("beforeend", `<label class="toggle-row"><input id="${id}" type="checkbox" value="${esc(v)}" ${checked}><span>${esc(v)}</span></label>`);
    });
    const updateSummary = () => {
      $(".dropdown-summary", root).textContent = selectedSet.size ? `${selectedSet.size} selected` : label;
    };
    updateSummary();
    $(".dropdown-summary", root).addEventListener("click", () => {
      if (root.classList.contains("is-disabled")) return;
      root.classList.toggle("is-open");
    });
    optionsBox.addEventListener("change", () => {
      selectedSet.clear();
      $$('input:checked', optionsBox).forEach(i => selectedSet.add(i.value));
      updateSummary();
      onChange();
    });
  }

  const filters = { shows:new Set(), seasons:new Set() };
  const showPriority = ["The Boulet Brothers' Dragula", "The Boulet Brothers' Dragula: Titans"];
  const showSort = (a, b) => {
    const ai = showPriority.indexOf(a), bi = showPriority.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return String(a).localeCompare(String(b));
  };
  const seasonSort = (a, b) => String(a).localeCompare(String(b), undefined, {numeric:true});

  function seasonValuesForSelectedShows() {
    if (!filters.shows.size) return [];
    return [...new Set(state.roster
      .filter(m => (m.shows || [m.show]).some(show => filters.shows.has(show)))
      .flatMap(m => m.seasons || [m.season]))].filter(Boolean).sort(seasonSort);
  }

  function rebuildSeasonDropdown() {
    const values = seasonValuesForSelectedShows();
    const allowed = new Set(values.map(String));
    [...filters.seasons].forEach(season => { if (!allowed.has(String(season))) filters.seasons.delete(season); });
    makeDropdown(els.seasonFilter, values, filters.seasons, renderRoster, {
      placeholder: filters.shows.size ? "All Seasons" : "Pick a show first",
      disabled: !filters.shows.size
    });
  }

  function initFilters() {
    makeDropdown(els.showFilter, [...new Set(state.roster.flatMap(x => x.shows || [x.show]))].filter(Boolean).sort(showSort), filters.shows, () => {
      filters.seasons.clear();
      rebuildSeasonDropdown();
      renderRoster();
    });
    rebuildSeasonDropdown();
  }

  function renderRoster() {
    const q = (els.searchFilter?.value || "").toLowerCase();
    state.filtered = state.roster.filter(m => {
      const showMatch = !filters.shows.size || (m.shows || [m.show]).some(show => filters.shows.has(show));
      const seasonMatch = !filters.shows.size || !filters.seasons.size || (m.seasons || [m.season]).some(season => filters.seasons.has(season));
      const queryMatch = !q || String(m.name || "").toLowerCase().includes(q) || String(m.nickname || "").toLowerCase().includes(q);
      return showMatch && seasonMatch && queryMatch;
    });
    if (els.availableCount) els.availableCount.textContent = state.filtered.length;
    if (els.rosterGrid) {
      els.rosterGrid.innerHTML = state.filtered.map(m => rosterCardHtml(m)).join("") || `<div class="empty-state">No monsters match these filters.</div>`;
      $$('[data-select-id]', els.rosterGrid).forEach(btn => btn.addEventListener('click', () => toggleSelect(btn.dataset.selectId)));
      $$('[data-custom-edit-id]', els.rosterGrid).forEach(btn => btn.addEventListener('click', (event) => {
        event.stopPropagation();
        openCustomContestantModal(btn.dataset.customEditId);
      }));
    }
    renderSelected();
  }

  function rosterCardHtml(m) {
    if (!m) return "";
    const selected = state.selected.includes(m.id);
    if (m.isCustom) {
      return `
        <article class="roster-card custom-roster-card ${selected ? 'is-selected selected-lineup-card' : ''}" data-id="${esc(m.id)}">
          <button class="custom-roster-main" type="button" data-select-id="${esc(m.id)}" title="${selected ? 'Remove' : 'Add'} ${esc(m.name)}">
            <div class="roster-image-wrap"><img class="avatar sqr" src="${esc(m.image)}" alt="${esc(m.name)}" onerror="this.src='${PLACEHOLDER}'"></div>
            <div class="roster-copy"><strong class="roster-name">${esc(m.name)}</strong></div>
          </button>
          <button class="secondary-btn custom-edit-btn" type="button" data-custom-edit-id="${esc(m.id)}">Edit</button>
        </article>`;
    }
    return `<button class="roster-card ${selected ? 'is-selected selected-lineup-card' : ''}" type="button" data-select-id="${esc(m.id)}"><div class="roster-image-wrap"><img class="avatar sqr" src="${esc(m.image)}" alt="${esc(m.name)}" onerror="this.src='${PLACEHOLDER}'"></div><div class="roster-copy"><strong class="roster-name">${esc(m.name)}</strong></div></button>`;
  }

  function selectedCardHtml(m) {
    if (!m) return "";
    return `
      <article class="selected-card selected-lineup-card ${m.isCustom ? 'custom-selected-card' : ''}" data-id="${esc(m.id)}">
        <div class="roster-image-wrap"><img class="avatar sqr" src="${esc(m.image)}" alt="${esc(m.name)}" onerror="this.src='${PLACEHOLDER}'"></div>
        <div class="roster-copy"><strong class="roster-name">${esc(m.name)}</strong><span class="roster-meta">${esc(m.show || 'Dragula')}</span></div>
        <div class="screen-action-row compact-actions selected-card-actions">
          ${m.isCustom ? `<button class="secondary-btn custom-selected-edit-btn" type="button" data-custom-edit-id="${esc(m.id)}">Edit</button>` : ""}
          <button class="secondary-btn danger-lite remove-btn" type="button" data-select-id="${esc(m.id)}">Remove</button>
        </div>
      </article>`;
  }

  function toggleSelect(id) {
    const max = Number(els.castSize.value);
    if (state.selected.includes(id)) state.selected = state.selected.filter(x => x !== id);
    else if (state.selected.length < max) state.selected.push(id);
    else alert(`You already selected ${max} monsters.`);
    clearRelationshipSetup();
    renderRoster();
  }

  function renderSelected() {
    if (els.selectedCount) els.selectedCount.textContent = state.selected.length;
    if (els.slotCount) els.slotCount.textContent = els.castSize.value;
    if (!els.selectedGrid) return;
    els.selectedGrid.innerHTML = state.selected.map(id => selectedCardHtml(state.roster.find(m => m.id === id))).join("") || `<div class="empty-card">Select monsters from the roster.</div>`;
    $$('[data-select-id]', els.selectedGrid).forEach(btn => btn.addEventListener('click', () => toggleSelect(btn.dataset.selectId)));
    $$('[data-custom-edit-id]', els.selectedGrid).forEach(btn => btn.addEventListener('click', (event) => {
      event.stopPropagation();
      openCustomContestantModal(btn.dataset.customEditId);
    }));
  }

  function clearRelationshipSetup() {
    state.relationshipSetup = {};
    state.lateEntryId = null;
  }

  function resetAllRelationships() {
    clearRelationshipSetup();
    if (state.season?.contestants) {
      Object.values(state.season.contestants).forEach(m => { if (m) m.relationships = {}; });
    }
  }

  function randomizeCast() {
    state.selected = shuffle(state.filtered).slice(0, Number(els.castSize.value)).map(m => m.id);
    clearRelationshipSetup();
    renderRoster();
  }

  function createSeason() {
    state.config = readConfig();
    if (state.selected.length !== state.config.castSize) { alert(`Select exactly ${state.config.castSize} monsters.`); return false; }
    if (state.config.premiere === "late_entry" && !state.lateEntryId) {
      alert("Choose a late-entry wildcard before setting relationships.");
      return false;
    }
    const contestants = Object.fromEntries(state.selected.map(id => {
      const m = structuredClone(state.roster.find(x => x.id === id));
      m.active = !(state.config.premiere === "late_entry" && id === state.lateEntryId);
      m.eliminated = false; m.track = []; m.relationships = {}; m.stats = { wins:0, high:0, bottom:0, exterminations:0, extermWins:0, curses:0, fright:0, popularity:50, resurrectionPoints:0, lostExterminations:0 };
      return [id, m];
    }));
    const competitiveWindow = Math.max(1, state.config.castSize - state.config.finalistSize);
    const curseGoal = state.config.curses ? 1 : 0;
    const keyGoal = state.config.keys ? (competitiveWindow >= 7 && should(.38) ? 2 : 1) : 0;
    state.season = { contestants, episodes:[], eliminated:[], usedFloorshows:[], returnedOnce:false, pendingReturn:null, lateEntryId: state.config.premiere === "late_entry" ? state.lateEntryId : null, lateEntryActivated:false, lateEntryAnnounced:false, sonicUsed:false, lastSupperAdded:false, completed:false, nonElims:[], doubleElims:[], curseGoal, cursesUsed:0, keyGoal, keysUsed:0, lastCurseEpisode:0, lastKeyEpisode:0, hellboundChampion:null, hellboundFinalWinner:null, hellboundLosses:[], resurrectionComplete:false, specials:{ bottomQuit:false, walkQuit:false, disq:false } };
    state.selected.forEach((a, i) => state.selected.slice(i + 1).forEach((b) => {
      const value = Number(state.relationshipSetup[pairKey(a, b)] ?? 0);
      contestants[a].relationships[b] = value;
      contestants[b].relationships[a] = value;
    }));
    state.currentEpisode = 0;
    fullySimulateSeason();
    renderEpisode(state.season.episodes[0]);
    return true;
  }

  function processEpisodeState(ep) {
    if (!ep || ep.type === "finale" || ep.processed) return;
    ep.processed = true;
    const outgoing = episodeOutgoingIds(ep);
    outgoing.forEach(id => {
      monster(id).active = false;
      monster(id).eliminated = true;
      if (!state.season.eliminated.includes(id)) state.season.eliminated.push(id);
    });
    if (ep.eliminated && episodeEliminatedIds(ep).length === 1 && (state.config.premiere === "fakeout_elim" || state.config.premiere === "returnee") && ep.number === 1 && !state.season.returnedOnce) {
      const candidate = ep.eliminated;
      ep.returnCandidate = candidate;
      monster(candidate).active = true;
      monster(candidate).eliminated = false;
      state.season.eliminated = state.season.eliminated.filter(id => id !== candidate);
      state.season.returnedOnce = true;
      state.season.pendingReturn = candidate;
    }
    if (state.config.premiere === "late_entry" && ep.number === 1 && state.season.lateEntryId && !state.season.lateEntryActivated) {
      const candidate = state.season.lateEntryId;
      monster(candidate).active = true;
      monster(candidate).eliminated = false;
      state.season.lateEntryActivated = true;
    }
  }

  function fullySimulateSeason() {
    let guard = 0;
    while (!state.season.completed && guard++ < 40) {
      const before = state.season.episodes.length;
      generateNextEpisode();
      const ep = state.season.episodes[before];
      if (!ep || ep.type === "finale") break;
      processEpisodeState(ep);
    }
    state.currentEpisode = 0;
  }

  function activeIds() { return Object.keys(state.season.contestants).filter(id => state.season.contestants[id].active); }
  function eliminatedIds() { return state.season.eliminated.slice(); }
  function monster(id) { return state.season.contestants[id]; }
  function names(ids) { return ids.map(id => monster(id).name).join(", "); }
  function sentence(ids) { const n = ids.map(id => monster(id).name); return n.length <= 1 ? (n[0] || "") : n.length === 2 ? `${n[0]} and ${n[1]}` : `${n.slice(0,-1).join(", ")}, and ${n.at(-1)}`; }
  function pairKey(a, b) { return [a, b].sort().join("::"); }
  function relationshipOption(value) {
    const n = clamp(Number(value), -10, 10);
    return relationshipScale.find(item => item.value === n) || relationshipScale.find(item => item.value === 0);
  }
  function randomRelationshipValue() {
    const roll = Math.random();
    if (roll < .08) return rnd(-10, -7);
    if (roll < .28) return rnd(-6, -2);
    if (roll < .54) return rnd(-1, 1);
    if (roll < .84) return rnd(2, 6);
    return rnd(7, 10);
  }
  function relationshipBetween(a, b) {
    if (!a || !b || a === b || !monster(a) || !monster(b)) return 0;
    const direct = monster(a).relationships?.[b];
    const reverse = monster(b).relationships?.[a];
    return Number.isFinite(Number(direct)) ? Number(direct) : (Number.isFinite(Number(reverse)) ? Number(reverse) : 0);
  }
  function setRelationship(a, b, value) {
    if (!a || !b || a === b || !monster(a) || !monster(b)) return;
    const n = clamp(Number(value), -10, 10);
    monster(a).relationships[b] = n;
    monster(b).relationships[a] = n;
  }
  function chooseRelationshipTarget(actor, pool, mode = "enemy") {
    const list = (pool || []).filter(id => id && id !== actor);
    if (!list.length) return null;
    return list.map(id => ({ id, rel: relationshipBetween(actor, id), random: Math.random() }))
      .sort((a, b) => mode === "ally" ? (b.rel - a.rel) || (a.random - b.random) : (a.rel - b.rel) || (a.random - b.random))[0].id;
  }

  function scoreMonster(id, weights, penalty = 0) {
    const m = monster(id), skills = m.skills;
    const weightedSkill = Object.entries(weights).reduce((sum, [k,w]) => sum + (skills[k] || 50) * w, 0);
    const wildcard = rnd(20, 100);
    const volatility = state.config.noShowRiggory ? rnd(-12, 12) : rnd(-30, 30);
    const score = (weightedSkill * 0.58) + (wildcard * 0.42) + volatility;
    return clamp(score - penalty, 1, 100);
  }
  function ppeValue(id) {
    const m = monster(id);
    const competitive = state.season.episodes.filter(e => e.activeAtStart?.includes(id) && !["finale", "last_supper"].includes(e.type) && !e.resurrection && !(e.hellbound?.contestants?.includes(id) && ["WIN", "LOSS"].includes(String(e.track?.[id] || "").toUpperCase()))).length || 1;
    const safeCount = Math.max(0, competitive - m.stats.wins - m.stats.high - m.stats.bottom);
    return (m.stats.wins * 5 + m.stats.high * 4 + safeCount * 3 + m.stats.bottom * 1) / competitive;
  }

  function extermScore(id, baseScore = 50) {
    let score = Number(baseScore || 50) + rnd(-18, 18);
    if (!state.config.noExtermRiggory) score += rnd(-8, 8);
    return score;
  }

  function chooseExterminatedFromBottoms(ep) {
    const bottoms = (ep.eligibleBottoms || []).filter(Boolean);
    if (!bottoms.length) return null;
    const sortedByPpe = bottoms
      .map(id => ({ id, ppe: ppeValue(id), exterminations: monster(id)?.stats?.exterminations || 0 }))
      .sort((a, b) => (b.ppe - a.ppe) || (a.exterminations - b.exterminations));
    const bestTrackRecordId = sortedByPpe[0]?.id || null;
    const protectBestTrackRecord = (rankedChoices) => {
      const ranked = (rankedChoices || []).filter(x => x && x.id);
      const first = ranked[0]?.id || null;
      if (!first || first !== bestTrackRecordId || ranked.length < 2) return first;
      const exCount = monster(first)?.stats?.exterminations || 0;
      const scoreGap = Math.abs(Number(ranked[1].score || 0) - Number(ranked[0].score || 0));
      if (exCount >= 3 || scoreGap >= 16) return first;
      if (should(.68)) {
        ep.bestTrackRecordSpared = first;
        return ranked[1].id;
      }
      return first;
    };
    const fourthTimers = bottoms.filter(id => (monster(id)?.stats?.exterminations || 0) >= 3);
    if (fourthTimers.length && should(.86)) {
      ep.exterminationDecision = "fourth_extermination_penalty";
      return fourthTimers
        .map(id => ({ id, score: extermScore(id, ep.scores[id]) - ((monster(id).stats.exterminations || 0) * 8) + (ppeValue(id) * 2.5) }))
        .sort((a, b) => a.score - b.score)[0].id;
    }
    const roll = Math.random();
    if (roll < .012) {
      ep.exterminationDecision = "rare_random";
      const randomPick = pick(bottoms);
      if (randomPick === bestTrackRecordId && bottoms.length > 1 && should(.72)) return pick(bottoms.filter(id => id !== bestTrackRecordId));
      return randomPick;
    }
    if (roll < .15) {
      ep.exterminationDecision = "ppe";
      return bottoms
        .map(id => ({ id, score: ppeValue(id) + (rnd(-8, 8) / 100) - ((monster(id).stats.exterminations || 0) * .10) }))
        .sort((a, b) => a.score - b.score)[0].id;
    }
    ep.exterminationDecision = "floor_show";
    const rankedChoices = bottoms
      .map(id => ({ id, score: extermScore(id, ep.scores[id]) + (ppeValue(id) * 5.2) - ((monster(id).stats.exterminations || 0) * 5.4) }))
      .sort((a, b) => a.score - b.score);
    return protectBestTrackRecord(rankedChoices);
  }

  function chooseSonicBanished(ep, ranked) {
    const winner = ep.winner;
    const pool = ep.activeAtStart.filter(id => id !== winner);
    if (!winner || !pool.length) return null;
    const roll = Math.random();
    if (roll < .60) {
      ep.banishCriterion = "worst_relationship";
      const scored = pool.map(id => {
        const direct = monster(winner).relationships?.[id];
        const reverse = monster(id).relationships?.[winner];
        const relationship = Number.isFinite(Number(direct)) ? Number(direct) : (Number.isFinite(Number(reverse)) ? Number(reverse) : rnd(-100, 100));
        return { id, relationship };
      });
      return scored.sort((a, b) => a.relationship - b.relationship)[0].id;
    }
    if (roll < .82) {
      ep.banishCriterion = "strongest_competitor";
      return pool.map(id => ({
        id,
        score: (ppeValue(id) * 15) + (monster(id).stats.wins * 8) + (monster(id).stats.high * 3) + (ep.scores[id] || 0)
      })).sort((a, b) => b.score - a.score)[0].id;
    }
    ep.banishCriterion = "weakest_competitor";
    return pool.map(id => ({
      id,
      score: (ppeValue(id) * 15) + (ep.scores[id] || 0) - (monster(id).stats.bottom * 3)
    })).sort((a, b) => a.score - b.score)[0].id;
  }

  function should(prob) { return Math.random() < prob; }

  function episodeEliminatedIds(ep) {
    return uniqueIds([...(ep?.eliminatedIds || []), ep?.eliminated].filter(Boolean));
  }

  function episodeOutgoingIds(ep) {
    return uniqueIds([...(ep?.eliminatedIds || []), ep?.eliminated, ep?.departed].filter(Boolean));
  }

  function canCurseThisEpisode(epNo, activeCount, cfg) {
    if (!cfg?.curses) return false;
    if (epNo <= 1) return false;
    if (isTitansPenultimateEpisode(activeCount, cfg)) return false;
    if (activeCount <= (cfg.finalistSize + 1)) return false;
    const last = Number(state.season?.lastCurseEpisode || 0);
    return !last || Math.abs(epNo - last) >= 2;
  }

  function canKeyThisEpisode(epNo, cfg) {
    if (!cfg?.keys) return false;
    if ((state.season?.keysUsed || 0) >= 2) return false;
    const last = Number(state.season?.lastKeyEpisode || 0);
    return !last || Math.abs(epNo - last) >= 4;
  }

  function buildFloorPerformanceGroups(ep, ranked) {
    const ids = (ranked || []).map(x => x.id).filter(Boolean);
    const count = ids.length;
    if (!count) return { good:[], decent:[], bad:[] };
    const maxSide = Math.max(1, Math.min(5, Math.floor((count - 1) / 2)));
    let goodCount = clamp(rnd(1, Math.min(4, maxSide + 1)), 1, Math.max(1, count - 2));
    let badCount = clamp(rnd(1, Math.min(4, maxSide + 1)), 1, Math.max(1, count - goodCount - 1));
    if (count >= 9 && should(.30)) goodCount = clamp(goodCount + 1, 1, 5);
    if (count >= 9 && should(.30)) badCount = clamp(badCount + 1, 1, 5);
    while (goodCount + badCount > count) {
      if (badCount >= goodCount && badCount > 1) badCount--;
      else if (goodCount > 1) goodCount--;
      else break;
    }
    const good = ids.slice(0, goodCount);
    const bad = ids.slice(-badCount).filter(id => !good.includes(id));
    const decent = ids.filter(id => !good.includes(id) && !bad.includes(id));
    return { good, decent, bad };
  }

  function maybeDoubleExtermination(ep, exRank, firstOut, noElim) {
    if (!ep || noElim || !firstOut || (ep.specialEvent && ep.specialEvent !== "titans_penultimate")) return [];
    const used = state.season.doubleElims || (state.season.doubleElims = []);
    const forceTitansPenultimate = !!ep.titansPenultimate;
    if (!forceTitansPenultimate && used.length >= 2) return [];
    if ((ep.eligibleBottoms || []).length < 3) return [];
    if (!forceTitansPenultimate && (ep.activeAtStart || []).length - 2 < state.config.finalistSize) return [];
    if (!forceTitansPenultimate && used.length === 1 && (ep.number - used[0]) < 6) return [];
    if (!forceTitansPenultimate) {
      if (state.config.format === "titans") return [];
      const chance = used.length ? .003 : (state.config.format === "chaos" ? .035 : .024);
      if (!should(chance)) return [];
    }
    const secondOut = (exRank || []).map(x => x.id).find(id => id && id !== firstOut);
    if (!secondOut) return [];
    if (!used.includes(ep.number)) used.push(ep.number);
    ep.specialEvent = forceTitansPenultimate ? "titans_penultimate" : "double_extermination";
    ep.doubleElimination = true;
    ep.deathSceneTitle = ep.ghostlyGallows ? "Ghostly Gallows" : "Double Extermination";
    ep.deathScene = ep.ghostlyGallows
      ? `${monster(firstOut).name} and ${monster(secondOut).name} are condemned by the Ghostly Gallows.`
      : `${monster(firstOut).name} and ${monster(secondOut).name} are both exterminated after the Boulets decide neither monster survived the challenge.`;
    return [firstOut, secondOut];
  }

  function isTitansFormat(cfg = state.config) {
    return cfg?.format === "titans";
  }

  function isTitansPenultimateEpisode(activeCount, cfg = state.config) {
    const finalistSize = clamp(Number(cfg?.finalistSize || cfg?.finaleSize || 3), 3, 4);
    return isTitansFormat(cfg) && activeCount === finalistSize + 2;
  }

  function basePlacementMap(ep) {
    const map = {};
    (ep.activeAtStart || []).forEach(id => map[id] = "SAFE");
    (ep.highs || []).forEach(id => map[id] = "HIGH");
    (ep.lows || []).forEach(id => map[id] = "LOW");
    (ep.winners || [ep.winner]).filter(Boolean).forEach(id => map[id] = "WIN");
    return map;
  }

  function titansCompositeBottomStatus(base, bottomLabel) {
    const status = String(base || "SAFE").toUpperCase();
    if (status === "WIN") return "WUE";
    if (status === "HIGH") return "HIGH+BTM";
    if (status === "LOW") return "LOW+BTM";
    if (status === "SAFE") return "SAFE+BTM";
    return bottomLabel;
  }

  function titansCompositeExtStatus(base) {
    const status = String(base || "SAFE").toUpperCase();
    if (status.includes("HIGH")) return "HIGH+EXT";
    if (status.includes("LOW")) return "LOW+EXT";
    if (status.includes("SAFE")) return "SAFE+EXT";
    if (status === "WIN" || status === "WUE") return "WUE";
    return "EXT";
  }

  function buildTitansVoting(ep, ranked) {
    const candidates = (ep.activeAtStart || []).filter(id => id !== ep.winner);
    const scoreRank = Object.fromEntries((ranked || []).map((item, index) => [item.id, index]));
    const bottomSize = Math.min(candidates.length, ((ep.activeAtStart || []).length >= 10 && should(.42)) ? 4 : 3);
    const votes = (ep.activeAtStart || []).map(voter => {
      const pool = candidates.filter(id => id !== voter);
      const usablePool = pool.length ? pool : candidates;
      const voteForCompetitor = should(.48);
      let target = null;
      let reason = "worst relationship";
      if (voteForCompetitor) {
        reason = "biggest competitor";
        target = usablePool
          .map(id => ({
            id,
            score: (ep.scores?.[id] || 0) + (ppeValue(id) * 8) + ((monster(id)?.stats?.wins || 0) * 7) + ((monster(id)?.stats?.high || 0) * 3) - (scoreRank[id] || 0)
          }))
          .sort((a, b) => b.score - a.score)[0]?.id || null;
      } else {
        target = chooseRelationshipTarget(voter, usablePool, "enemy") || null;
      }
      if (!target) target = pick(usablePool);
      return { voter, target, reason };
    }).filter(vote => vote.target);
    const tally = Object.fromEntries(candidates.map(id => [id, 0]));
    votes.forEach(vote => { tally[vote.target] = (tally[vote.target] || 0) + 1; });
    const bottoms = candidates
      .map(id => ({ id, votes: tally[id] || 0, score: ep.scores?.[id] || 0, random: Math.random() }))
      .sort((a, b) => (b.votes - a.votes) || (b.score - a.score) || (a.random - b.random))
      .slice(0, bottomSize)
      .map(x => x.id);
    return { votes, tally, bottoms, bottomSize };
  }

  function titansVotingHtml(ep) {
    if (!ep?.titansVoting) return "";
    const voteRows = (ep.titansVoting.votes || []).map(vote => `
      <article class="titans-vote-card">
        <div class="titans-vote-person">${stripCard(vote.voter)}</div>
        <span class="titans-vote-arrow">votes for</span>
        <div class="titans-vote-person">${stripCard(vote.target)}</div>
        <small>${esc(vote.reason === "biggest competitor" ? "biggest competitor" : "worst relationship")}</small>
      </article>`).join("");
    return `
      <article class="placement-group titans-voting-ceremony">
        <h3>The Power Is In Your Paws</h3>
        <p>This week, the power is in your paws. Who do you want to go straight into extermination tonight?</p>
        <div class="titans-vote-grid">${voteRows}</div>
      </article>`;
  }

  function gallowsCard(id, ep) {
    const outgoing = episodeOutgoingIds(ep);
    const revealed = !!ep.revealed;
    const isOut = revealed && outgoing.includes(id);
    const isStay = revealed && !isOut;
    const classes = ["placement-card", "gallows-card"];
    if (isOut) classes.push("is-exterminated");
    if (isStay) classes.push("is-staying");
    const label = !revealed ? "Awaiting fate" : isOut ? "Exterminated" : "Survives";
    return `<article class="${classes.join(" ")}"><img class="avatar mid-sq" src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(monster(id).name)}"><strong>${esc(monster(id).name)}</strong><span class="token token-${isOut ? "elim" : isStay ? "safe" : "btm"}">${esc(label)}</span></article>`;
  }

  function ghostlyGallowsResultText(ep) {
    const outs = episodeEliminatedIds(ep);
    if (!outs.length) return "Nobody is exterminated by the Ghostly Gallows.";
    return outs.length > 1 ? `${sentence(outs)} are exterminated by the Ghostly Gallows.` : `${sentence(outs)} is exterminated by the Ghostly Gallows.`;
  }

  function maskContestantNames(text, ids) {
    let output = esc(text);
    (ids || []).forEach(id => {
      if (!id || !monster(id)) return;
      const escapedName = esc(monster(id).name);
      output = output.split(escapedName).join(`<span class="blurred-name">${escapedName}</span>`);
    });
    return output;
  }

  function renderCauldronText(template, ids) {
    const [a, b] = ids || [];
    return String(template || "")
      .replaceAll("{A}", a ? monster(a).name : "A monster")
      .replaceAll("{B}", b ? monster(b).name : "another monster");
  }

  function getCauldronEventPool() {
    const externalEvents = Array.isArray(window.DRAGULA_CAULDRON_EVENTS) ? window.DRAGULA_CAULDRON_EVENTS : [];
    const pool = externalEvents.length ? externalEvents : fallbackCauldronEvents;
    return pool.filter(event => event && event.text && Number(event.participants || 1) >= 1);
  }

  function generateCauldronEvents(ep) {
    if (!ep || ep.type !== "competitive") return [];
    const ids = (ep.activeAtStart || []).filter(id => !ep.departed || id !== ep.departed);
    if (!ids.length) return [];
    const pool = getCauldronEventPool();
    if (!pool.length) return [];
    const count = clamp(rnd(2, 4), 1, Math.max(1, ids.length));
    const events = [];
    for (let i = 0; i < count; i++) {
      const template = pick(pool);
      const participants = shuffle(ids).slice(0, Math.min(template.participants || 2, ids.length));
      const change = Number(template.relationship || 0);
      if (participants.length >= 2 && change) {
        setRelationship(participants[0], participants[1], relationshipBetween(participants[0], participants[1]) + change);
      }
      participants.forEach(id => {
        if (monster(id)?.stats) monster(id).stats.popularity = clamp((monster(id).stats.popularity || 50) + Number(template.popularity || 0), 0, 100);
      });
      events.push({ ...template, ids: participants, renderedText: renderCauldronText(template.text, participants) });
    }
    return events;
  }


  function hellboundScore(id, weights) {
    return scoreMonster(id, weights || { glamour:.2, performance:.6, fear:.2 });
  }

  function isHellboundEligible(id) {
    if (!id || !state.season?.contestants?.[id]) return false;
    return !state.season.episodes.some(ep => {
      const status = String(ep.track?.[id] || "").toUpperCase();
      return status === "QUIT" || status === "DISQ" || ep.quitContestant === id || ep.disqualified === id;
    });
  }

  function maybeAttachHellbound(ep) {
    if (!state.config.hellboundShowdown || !ep || ep.type !== "competitive" || ep.specialEvent) return;
    const available = state.season.eliminated.filter(id =>
      id &&
      state.season.contestants[id] &&
      isHellboundEligible(id) &&
      !state.season.hellboundLosses.includes(id)
    );
    let contestants = [];
    if (!state.season.hellboundChampion) {
      contestants = available.slice(0, 2);
    } else {
      const challenger = available.find(id => id !== state.season.hellboundChampion);
      if (challenger) contestants = [state.season.hellboundChampion, challenger];
    }
    contestants = uniqueIds(contestants).filter(id => state.season.contestants[id]);
    if (contestants.length < 2) return;

    const weights = ep.floorshow?.weights || { glamour:.2, horror:.2, filth:.2, design:.2, performance:.2 };
    const ranked = contestants.map(id => ({ id, score: hellboundScore(id, weights) })).sort((a, b) => b.score - a.score);
    const winner = ranked[0].id;
    const loser = ranked[1].id;
    ep.hellbound = {
      title: "Hellbound Showdown",
      challenge: ep.floorshow?.name || "This week's challenge",
      challengeDescription: ep.floorshow?.description || "The monsters present their floorshow.",
      description: "The eliminated monsters battle in the shadows using this week's challenge as their test.",
      contestants,
      scores: Object.fromEntries(ranked.map(x => [x.id, x.score])),
      winner,
      loser,
      revealed: false
    };
    ep.track[winner] = "WIN";
    ep.track[loser] = "LOSS";
    state.season.hellboundChampion = winner;
    if (!state.season.hellboundLosses.includes(loser)) state.season.hellboundLosses.push(loser);
  }

  function attachFinalHellbound(ep, finalists) {
    if (!state.config.hellboundShowdown || !state.season.hellboundChampion) return;
    const eligibleEliminated = state.season.eliminated.filter(id =>
      id &&
      id !== state.season.hellboundChampion &&
      !state.season.hellboundLosses.includes(id) &&
      state.season.contestants[id] &&
      isHellboundEligible(id)
    );
    const challengers = uniqueIds([state.season.hellboundChampion, ...eligibleEliminated.slice(-2)]);
    if (challengers.length < 2) return;
    const weights = { glamour:.2, performance:.7, fear:.1 };
    const ranked = challengers.map(id => ({ id, score: hellboundScore(id, weights) })).sort((a, b) => b.score - a.score);
    const winner = ranked[0].id;
    ep.hellboundFinal = {
      title: "Hellbound Showdown",
      challenge: 'Time to Die',
      challengeDescription: 'Perform in a three-way lip sync battle to "Time to Die" by the Boulet Brothers.',
      description: 'The eliminated monsters battle in the shadows using this week\'s challenge as their test.',
      contestants: challengers,
      scores: Object.fromEntries(ranked.map(x => [x.id, x.score])),
      winner,
      losers: ranked.slice(1).map(x => x.id),
      revealed: false
    };
    ep.track[winner] = "RTRN";
    ep.hellboundFinal.losers.forEach(id => { if (ep.track[id] !== "RTRN") ep.track[id] = "LOSS"; });
    state.season.hellboundFinalWinner = winner;
    const m = monster(winner);
    if (m) {
      m.active = true;
      m.eliminated = false;
      state.season.eliminated = state.season.eliminated.filter(id => id !== winner);
    }
  }

  function resurrectionPlacementLabel(rank) {
    if (rank === 1) return "WIN";
    const suffix = rank === 2 ? "ND" : rank === 3 ? "RD" : "TH";
    return `${rank}${suffix}`;
  }

  function formatEpisodePoints(points) {
    const n = Number(points) || 0;
    if (n > 0) return `+${n}`;
    return String(n);
  }

  function chooseResurrectionFrightWinner(actives) {
    const ids = (actives || []).filter(Boolean);
    if (!ids.length) return null;
    const previousFrightWinners = (state.season?.episodes || []).filter(e => e.resurrection && e.frightWinner).map(e => e.frightWinner);
    const lastWinner = previousFrightWinners.at(-1);
    const counts = Object.fromEntries(ids.map(id => [id, previousFrightWinners.filter(winner => winner === id).length]));
    const lowestCount = Math.min(...ids.map(id => counts[id] || 0));
    let pool = ids.filter(id => (counts[id] || 0) === lowestCount);
    if (pool.length > 1 && lastWinner) pool = pool.filter(id => id !== lastWinner);
    return pick(pool.length ? pool : ids);
  }

  function chooseResurrectionStealTarget(ep) {
    const protectedIds = new Set([ep.winner, ...(ep.highs || [])].filter(Boolean));
    const pool = (ep.activeAtStart || []).filter(id => !protectedIds.has(id));
    if (!pool.length) return null;
    const episodeGain = (id) => {
      let points = 0;
      if (id === ep.frightWinner) points += 1;
      if ((ep.winners || [ep.winner]).includes(id)) points += 2;
      if ((ep.highs || []).includes(id)) points += 1;
      return points;
    };
    if (should(.5)) {
      ep.pointStealCriterion = "relationship";
      return chooseRelationshipTarget(ep.winner, pool, "enemy") || pick(pool);
    }
    ep.pointStealCriterion = "most_points";
    return pool.map(id => ({ id, points: (monster(id).stats?.resurrectionPoints || 0) + episodeGain(id), random: Math.random() }))
      .sort((a, b) => (b.points - a.points) || (a.random - b.random))[0].id;
  }

  function applyResurrectionPoints(ep) {
    ep.resurrectionPoints = {};
    ep.resurrectionPlacement = {};
    (ep.activeAtStart || []).forEach(id => {
      ep.resurrectionPoints[id] = 0;
      ep.resurrectionPlacement[id] = "SAFE";
    });
    if (ep.frightWinner) {
      ep.resurrectionPoints[ep.frightWinner] = (ep.resurrectionPoints[ep.frightWinner] || 0) + 1;
    }
    (ep.winners || [ep.winner]).filter(Boolean).forEach(id => {
      ep.resurrectionPoints[id] = (ep.resurrectionPoints[id] || 0) + 2;
      ep.resurrectionPlacement[id] = "WIN";
      if (monster(id)?.stats) monster(id).stats.wins++;
    });
    (ep.highs || []).forEach(id => {
      ep.resurrectionPoints[id] = (ep.resurrectionPoints[id] || 0) + 1;
      ep.resurrectionPlacement[id] = "HIGH";
      if (monster(id)?.stats) monster(id).stats.high++;
    });
    if (ep.pointSteal?.target) {
      ep.resurrectionPoints[ep.pointSteal.target] = (ep.resurrectionPoints[ep.pointSteal.target] || 0) - 1;
    }
    Object.entries(ep.resurrectionPoints).forEach(([id, points]) => {
      if (monster(id)?.stats) monster(id).stats.resurrectionPoints = (monster(id).stats.resurrectionPoints || 0) + points;
      ep.track[id] = formatEpisodePoints(points);
    });
  }

  function generateResurrectionEpisode(epNo, actives) {
    const ep = { number: epNo, label:`Episode ${epNo}`, type:"competitive", resurrection:true, activeAtStart:actives.slice(), track:{}, revealed:true };
    ep.floorshow = selectFloorShow(actives.length);
    state.season.usedFloorshows.push(ep.floorshow.name);
    ep.guestJudge = getGuestJudge(ep.floorshow.type);
    ep.hasFright = true;
    ep.frightFeat = pick(frightFeats);
    ep.frightWinner = chooseResurrectionFrightWinner(actives);
    if (ep.frightWinner && monster(ep.frightWinner)?.stats) monster(ep.frightWinner).stats.fright++;
    ep.curse = null;
    ep.keyPower = null;
    ep.immunity = null;
    ep.frightAdvantage = false;
    ep.nominatedByPower = [];
    ep.scores = Object.fromEntries(actives.map(id => [id, scoreMonster(id, ep.floorshow.weights, 0)]));
    const ranked = actives.map(id => ({ id, score: ep.scores[id] })).sort((a,b) => b.score - a.score);
    ep.winners = [ranked[0].id];
    ep.winner = ep.winners[0];
    const remaining = ranked.map(x => x.id).filter(id => id !== ep.winner);
    const highCount = remaining.length >= 2 && should(.58) ? 2 : Math.min(1, remaining.length);
    ep.highs = remaining.slice(0, highCount);
    ep.lows = [];
    ep.eligibleBottoms = [];
    ep.exterminationParticipants = [];
    ep.extermination = null;
    ep.exterminationLoser = null;
    ep.eliminated = null;
    ep.pointSteal = null;
    const stealTarget = chooseResurrectionStealTarget(ep);
    if (stealTarget) ep.pointSteal = { by: ep.winner, target: stealTarget, criterion: ep.pointStealCriterion || "most_points" };
    ep.floorPerformanceGroups = buildFloorPerformanceGroups(ep, ranked);
    ep.deathSceneTitle = "Resurrection Points";
    ep.deathScene = "The monsters keep fighting for their Resurrection totals. Nobody is exterminated tonight.";
    applyResurrectionPoints(ep);
    ep.cauldronEvents = generateCauldronEvents(ep);
    state.season.episodes.push(ep);
    renderEpisode(ep);
  }

  function generateResurrectionFinale(epNo, actives) {
    const points = Object.fromEntries(actives.map(id => [id, monster(id).stats.resurrectionPoints || 0]));
    const ranked = actives.map(id => ({ id, points: points[id], score: scoreMonster(id, { glamour:.25, horror:.25, filth:.25, performance:.25 }) }))
      .sort((a, b) => (b.points - a.points) || (b.score - a.score));
    const winner = ranked[0]?.id;
    const losers = ranked.slice(1).reverse().map(x => x.id);
    const ep = { number: epNo, label:`Episode ${epNo}`, type:"finale", resurrectionFinale:true, activeAtStart:actives.slice(), track:{}, revealed:false, points, ranked: ranked.map(x => x.id), winner, losers };
    ep.deathSceneTitle = "The Resurrection Finale";
    ep.deathScene = `From their hometowns, the monsters receive mysterious VHS tapes marked only with the Boulet sigil. The footage pulses with hypnotic static. ${losers.map(id => monster(id).name).join(", ")} fall one-by-one: noses bleed, ears ring, bodies collapse, and the tape keeps playing. When the static finally clears, only ${monster(winner).name} is left alive.`;
    ranked.forEach((item, i) => { ep.track[item.id] = resurrectionPlacementLabel(i + 1); });
    ep.track[winner] = "WIN";
    state.season.episodes.push(ep);
    state.season.completed = true;
    renderEpisode(ep);
  }

  function generateNextEpisode() {
    const epNo = state.season.episodes.length + 1;
    const actives = activeIds();
    if (state.config.format === "resurrection") {
      if (state.season.episodes.filter(e => e.type === "competitive").length >= 5) return generateResurrectionFinale(epNo, actives);
      return generateResurrectionEpisode(epNo, actives);
    }
    if (state.season.lastSupperAdded) return generateFinale(epNo, actives);
    if (actives.length <= state.config.finalistSize) return generateLastSupper(epNo, actives);

    const ep = { number: epNo, label:`Episode ${epNo}`, type:"competitive", activeAtStart:actives.slice(), track:{}, revealed:false };
    if (state.season.pendingReturn && epNo === 2) {
      ep.returnedContestant = state.season.pendingReturn;
      state.season.pendingReturn = null;
    }
    if (state.config.premiere === "late_entry" && state.season.lateEntryActivated && !state.season.lateEntryAnnounced && state.season.lateEntryId && actives.includes(state.season.lateEntryId)) {
      ep.lateEntryContestant = state.season.lateEntryId;
      state.season.lateEntryAnnounced = true;
    }
    const cfg = state.config;
    ep.floorshow = selectFloorShow(actives.length);
    state.season.usedFloorshows.push(ep.floorshow.name);
    ep.guestJudge = getGuestJudge(ep.floorshow.type);

    const frightRate = cfg.format === "fright_heavy" ? .88 : cfg.format === "chaos" ? .78 : .55;
    const remainingCompetitive = Math.max(0, actives.length - cfg.finalistSize);
    const cursesStillNeeded = Math.max(0, (state.season.curseGoal || 0) - (state.season.cursesUsed || 0));
    const keysStillNeeded = Math.max(0, (state.season.keyGoal || 0) - (state.season.keysUsed || 0));
    const curseAllowedNow = canCurseThisEpisode(epNo, actives.length, cfg);
    const keyAllowedNow = canKeyThisEpisode(epNo, cfg);
    let forcedPrizeType = null;
    if (cursesStillNeeded > 0 && curseAllowedNow && remainingCompetitive <= 2) forcedPrizeType = "curse";
    if (keysStillNeeded > 0 && keyAllowedNow && (!forcedPrizeType || (state.season.keysUsed || 0) === 0) && remainingCompetitive <= Math.max(2, keysStillNeeded + 1)) forcedPrizeType = forcedPrizeType === "curse" ? "both" : "key";
    if (!forcedPrizeType && cursesStillNeeded > 0 && curseAllowedNow && should(.26)) forcedPrizeType = "curse";
    if (!forcedPrizeType && keysStillNeeded > 0 && keyAllowedNow && should(.30)) forcedPrizeType = "key";
    const forceCurseThisEpisode = forcedPrizeType === "curse" || forcedPrizeType === "both";
    const forceKeyThisEpisode = forcedPrizeType === "key" || forcedPrizeType === "both";
    ep.hasFright = cfg.frightFeats && (forceCurseThisEpisode || forceKeyThisEpisode || (epNo === 1 && cfg.premiere === "instant_fright") || should(frightRate));
    if (ep.hasFright) {
      ep.frightFeat = pick(frightFeats);
      const ranked = shuffle(actives).map(id => ({ id, score: monster(id).skills.fear + rnd(-25, 35) })).sort((a,b) => b.score - a.score);
      ep.frightWinner = ranked[0].id;
      monster(ep.frightWinner).stats.fright++;
    }

    ep.curse = null; ep.keyPower = null; ep.frightAdvantage = false; ep.nominatedByPower = [];
    if (ep.hasFright) {
      const prizeType = ep.frightFeat.prizeType || inferFrightPrize(ep.frightFeat);
      const awardCurse = () => {
        if (!canCurseThisEpisode(epNo, actives.length, cfg)) return false;
        const targetPool = actives.filter(id => id !== ep.frightWinner);
        const target = chooseRelationshipTarget(ep.frightWinner, targetPool, "enemy") || pick(targetPool);
        if (!target) return false;
        ep.curse = { ...pick(curses), caster: ep.frightWinner, target };
        state.season.cursesUsed = (state.season.cursesUsed || 0) + 1;
        state.season.lastCurseEpisode = epNo;
        monster(target).stats.curses++;
        return true;
      };
      const awardKey = () => {
        if (!canKeyThisEpisode(epNo, cfg)) return false;
        const choosesImmunity = should(.5);
        if (choosesImmunity) {
          ep.immunity = ep.frightWinner;
          ep.keyPower = { holder: ep.frightWinner, choice: "immunity", grantsImmunity: true, text: `${monster(ep.frightWinner).name} wins the Key of Life & Death and chooses to grant themselves immunity from extermination.` };
        } else {
          let targetPool = actives.filter(id => id !== ep.frightWinner && id !== ep.curse?.target);
          if (!targetPool.length) targetPool = actives.filter(id => id !== ep.frightWinner);
          const target = chooseRelationshipTarget(ep.frightWinner, targetPool, "enemy") || pick(targetPool);
          if (!target) return false;
          ep.keyPower = { holder: ep.frightWinner, choice: "nomination", target, text: `${monster(ep.frightWinner).name} wins the Key of Life & Death and chooses to nominate ${monster(target).name} for extermination.` };
          ep.nominatedByPower.push(target);
        }
        state.season.keysUsed = (state.season.keysUsed || 0) + 1;
        state.season.lastKeyEpisode = epNo;
        return true;
      };
      const wantsCurse = cfg.curses && canCurseThisEpisode(epNo, actives.length, cfg) && (forceCurseThisEpisode || prizeType === "curse" || (state.season.cursesUsed > 0 && should(.18)));
      const wantsKey = cfg.keys && canKeyThisEpisode(epNo, cfg) && (forceKeyThisEpisode || prizeType === "key" || prizeType === "nomination");
      if (wantsCurse) awardCurse();
      if (wantsKey && (!ep.curse || forceKeyThisEpisode || prizeType === "key" || prizeType === "nomination")) awardKey();
      if (!ep.curse && !ep.keyPower) {
        if (prizeType === "immunity") ep.immunity = ep.frightWinner;
        else ep.frightAdvantage = true;
      }
    }

    if (ep.curse) ep.curse.appliedPenalty = Math.round((Number(ep.curse.penalty) || 8) * 2.2 + rnd(4, 10));
    ep.scores = Object.fromEntries(actives.map(id => [id, scoreMonster(id, ep.floorshow.weights, ep.curse?.target === id ? ep.curse.appliedPenalty : 0)]));
    const ranked = actives.map(id => ({ id, score: ep.scores[id] })).sort((a,b) => b.score - a.score);
    ep.floorPerformanceGroups = buildFloorPerformanceGroups(ep, ranked);
    const isTopFourCompetitive = actives.length === 4 && actives.length > cfg.finalistSize;
    const preTitansPenultimate = isTitansPenultimateEpisode(actives.length, cfg);
    const sonicWindow = cfg.sonicTransducer && !preTitansPenultimate && !state.season.sonicUsed && actives.length <= 7 && actives.length >= 5;
    const powerLocksEpisode = !!(ep.curse || ep.keyPower || ep.immunity || ep.frightAdvantage);
    const forceSonicBanishment = sonicWindow && !powerLocksEpisode && (actives.length === 5 || should(.38));
    const rareDoubleWin = cfg.format !== "titans" && !forceSonicBanishment && !isTopFourCompetitive && actives.length >= 8 && should(cfg.format === "chaos" ? .10 : .035);
    ep.winners = rareDoubleWin ? ranked.slice(0, 2).map(x => x.id) : [ranked[0].id];
    ep.winner = ep.winners[0];

    if (forceSonicBanishment) {
      state.season.sonicUsed = true;
      ep.sonicBanishment = true;
      ep.highs = [];
      ep.lows = [];
      ep.eligibleBottoms = [];
      ep.exterminationParticipants = [];
      ep.extermination = { name: "Banishment", description: "The Sonic Transducer gives the Floor Show winner the power to banish one fellow competitor from the competition." };
      ep.banished = chooseSonicBanished(ep, ranked);
      ep.eliminated = ep.banished;
      ep.deathSceneTitle = "Banishment";
      ep.deathScene = `${monster(ep.winner).name} holds the Sonic Transducer and chooses to banish ${monster(ep.banished).name} from the competition forever.`;
      assignTrack(ep);
      maybeAttachHellbound(ep);
      ep.cauldronEvents = generateCauldronEvents(ep);
      state.season.episodes.push(ep);
      renderEpisode(ep);
      return;
    }

    const isTitans = cfg.format === "titans";
    const titansPenultimate = isTitansPenultimateEpisode(actives.length, cfg);
    ep.titansPenultimate = titansPenultimate;
    ep.ghostlyGallows = isTitans && epNo > 1 && epNo % 2 === 0;

    let highCount = isTopFourCompetitive ? 0 : (actives.length >= 6 ? 2 : (actives.length === 5 ? 1 : Math.max(0, Math.min(1, actives.length - cfg.finalistSize - 2))));
    if (isTitans && !titansPenultimate) highCount = actives.length >= 7 ? 2 : 1;
    if (titansPenultimate) highCount = 0;
    ep.highs = ranked.map(x => x.id).filter(id => !ep.winners.includes(id)).slice(0, highCount);
    ep.lows = [];

    const hasFrightFeatPrize = !!(ep.curse || ep.keyPower || ep.immunity || ep.frightAdvantage);
    if (!isTitans && cfg.winnerNomination && !hasFrightFeatPrize && ep.winner && should(cfg.format === "chaos" ? .38 : .18)) {
      const pool = ranked.slice(Math.ceil(ranked.length / 2)).map(x => x.id).filter(id => !ep.winners.includes(id) && id !== ep.immunity);
      if (pool.length) {
        const target = chooseRelationshipTarget(ep.winner, pool, "enemy") || pick(pool);
        ep.winnerNomination = { by: ep.winner, target };
        ep.nominatedByPower.push(target);
      }
    }

    if (isTitans && epNo === 1) {
      const lowCount = actives.length >= 8 ? 2 : 1;
      const prelimOccupied = new Set([...ep.winners, ...ep.highs]);
      ep.lows = ranked.map(x => x.id).reverse().filter(id => !prelimOccupied.has(id) && id !== ep.immunity).slice(0, lowCount);
      ep.preBottomPlacement = basePlacementMap(ep);
      ep.titansVoting = buildTitansVoting(ep, ranked);
      ep.eligibleBottoms = (ep.titansVoting.bottoms || []).filter(id => id !== ep.immunity);
      ep.exterminationParticipants = ep.eligibleBottoms.slice();
    } else {
      let bottomSize;
      if (titansPenultimate) bottomSize = 4;
      else if (isTopFourCompetitive) bottomSize = 3;
      else if (isTitans) {
        if (actives.length >= 9) bottomSize = should(.16) ? 4 : (should(.62) ? 3 : 2);
        else if (actives.length >= 7) bottomSize = should(.44) ? 3 : 2;
        else bottomSize = 2;
      } else if (actives.length >= 8) bottomSize = should(.16) ? 3 : 2;
      else bottomSize = actives.length >= 6 ? 2 : Math.max(2, actives.length - cfg.finalistSize);
      if (!isTopFourCompetitive && !isTitans && cfg.format === "chaos" && should(.08)) bottomSize = Math.min(4, bottomSize + 1);
      const maxBottomSize = titansPenultimate
        ? Math.min(4, actives.length - 1)
        : isTopFourCompetitive
          ? Math.min(3, actives.length - 1)
          : Math.min(4, Math.max(2, actives.length - cfg.finalistSize + 1));
      bottomSize = clamp(bottomSize, 2, maxBottomSize);
      let bottoms = ranked.slice(-bottomSize).map(x => x.id).filter(id => id !== ep.immunity);
      ep.nominatedByPower.forEach(id => { if (!bottoms.includes(id) && id !== ep.immunity) bottoms.push(id); });

      ep.winnerUpForExtermination = false;
      if ((cfg.format === "chaos" || cfg.mode === "producer") && should(.05) && !bottoms.includes(ep.winner)) {
        bottoms.push(ep.winner);
        ep.winnerUpForExtermination = true;
      }

      ep.allParticipate = cfg.allParticipate && should(cfg.format === "fright_heavy" ? .32 : .16);
      ep.exterminationParticipants = ep.allParticipate ? actives.slice() : bottoms.slice();
      ep.eligibleBottoms = bottoms.slice();
      ep.preBottomPlacement = basePlacementMap(ep);

      const occupied = new Set([...ep.winners, ...ep.highs, ...ep.eligibleBottoms]);
      const lowPool = ranked.map(x => x.id).reverse().filter(id => !occupied.has(id) && id !== ep.immunity);
      const standardLowCount = isTopFourCompetitive || (isTitans && ep.eligibleBottoms.length > 2) ? 0 : (actives.length >= 6 ? 1 : (actives.length === 5 && ep.eligibleBottoms.length <= 2 ? 1 : 0));
      const lowCount = should(.12) && actives.length >= 9 && !(isTitans && ep.eligibleBottoms.length > 2) ? 2 : standardLowCount;
      ep.lows = ep.eligibleBottoms.length > 2 ? [] : lowPool.slice(0, lowCount);
      ep.preBottomPlacement = basePlacementMap(ep);
    }

    ep.extermination = ep.ghostlyGallows
      ? { name: "Ghostly Gallows", description: "The Boulets summon the bottom monsters to the Ghostly Gallows. There is no extermination challenge and no death scene tonight; only judgment." }
      : pick(exterminations);

    const canNonElim = () => {
      if (cfg.noSaves || ep.titansPenultimate) return false;
      const used = state.season.nonElims || [];
      if (used.length >= 1) return false;
      return used.every(n => Math.abs(n - epNo) >= 5);
    };
    let noElim = canNonElim() && ((epNo === 1 && cfg.premiere === "non_elim") || should(.025));
    const exterminatedChoice = chooseExterminatedFromBottoms(ep);
    const exRank = ep.eligibleBottoms.map(id => ({ id, score: extermScore(id, ep.scores[id]) })).sort((a,b) => a.score - b.score);

    ep.specialEvent = null;
    ep.departed = null;
    const specials = state.season.specials || (state.season.specials = { bottomQuit:false, walkQuit:false, disq:false });
    const remainingAfterDeparture = actives.length - 1;
    const allowDeparture = remainingAfterDeparture >= cfg.finalistSize && canNonElim();
    const bottomQuitId = exterminatedChoice || exRank[0]?.id || null;
    if (!ep.titansPenultimate && !noElim && bottomQuitId && !specials.bottomQuit && should(.025)) {
      specials.bottomQuit = true;
      ep.specialEvent = "bottom_quit";
      ep.quitContestant = bottomQuitId;
      ep.eliminated = bottomQuitId;
      ep.forceWeakExtermination = bottomQuitId;
      ep.deathSceneTitle = "Extermination Quit";
      ep.deathScene = `${monster(bottomQuitId).name} enters the extermination, but the fear finally breaks them. They choose to quit the extermination and leave the competition.`;
    } else if (!ep.titansPenultimate && allowDeparture && !specials.disq && should(.008)) {
      specials.disq = true;
      const id = pick(actives);
      ep.specialEvent = "disqualification";
      ep.disqualified = id;
      ep.departed = id;
      ep.eliminated = null;
      noElim = true;
      ep.deathSceneTitle = "Disqualification";
      ep.deathScene = `${monster(id).name} has broken the rules of the competition and is disqualified. No monster is exterminated tonight.`;
    } else if (!ep.titansPenultimate && allowDeparture && !specials.walkQuit && should(.012)) {
      specials.walkQuit = true;
      const id = pick(actives);
      ep.specialEvent = "walk_quit";
      ep.quitContestant = id;
      ep.departed = id;
      ep.eliminated = null;
      noElim = true;
      ep.deathSceneTitle = "Contestant Quit";
      ep.deathScene = `${monster(id).name} has chosen to leave the competition for personal reasons. No monster is exterminated tonight.`;
    } else {
      ep.eliminated = noElim ? null : bottomQuitId;
      if (!noElim && ep.eliminated) {
        const doubleOuts = maybeDoubleExtermination(ep, exRank, ep.eliminated, noElim);
        if (doubleOuts.length) {
          ep.eliminatedIds = doubleOuts;
          ep.eliminated = doubleOuts[0];
        }
      }
    }
    if (noElim && canNonElim() && !state.season.nonElims.includes(epNo)) state.season.nonElims.push(epNo);
    if (!ep.deathScene) ep.deathScene = deathSceneText(ep);
    if (!ep.deathSceneTitle) ep.deathSceneTitle = deathSceneTitle(ep);

    assignTrack(ep);
    maybeAttachHellbound(ep);
    ep.cauldronEvents = generateCauldronEvents(ep);
    state.season.episodes.push(ep);
    renderEpisode(ep);
  }

  function assignTrack(ep) {
    ep.activeAtStart.forEach(id => ep.track[id] = "SAFE");
    ep.highs.forEach(id => ep.track[id] = "HIGH");
    ep.lows.forEach(id => ep.track[id] = "LOW");
    (ep.winners || [ep.winner]).filter(Boolean).forEach(id => ep.track[id] = "WIN");

    if (ep.sonicBanishment) {
      ep.activeAtStart.forEach(id => {
        if (id !== ep.winner && id !== ep.banished) ep.track[id] = "SAFE";
      });
      if (ep.banished) ep.track[ep.banished] = "EXT";
      if (ep.returnedContestant && ep.track[ep.returnedContestant]) ep.track[ep.returnedContestant] = `RTRN<br/>${ep.track[ep.returnedContestant]}`;
      Object.entries(ep.track).forEach(([id, val]) => {
        const st = monster(id).stats;
        if (val.includes("WIN") || val === "WUE") st.wins++;
        if (val.includes("HIGH")) st.high++;
        if (val.includes("BTM") || val === "WUE" || val.includes("EXT") || val.includes("LOW") || val.includes("QUIT")) st.bottom++;
      });
      return;
    }

    const bottomLabel = `BTM${Math.max(2, ep.eligibleBottoms.length)}`;
    const preBottomPlacement = ep.preBottomPlacement || basePlacementMap(ep);
    ep.eligibleBottoms.forEach(id => {
      const base = preBottomPlacement[id] || ep.track[id] || "SAFE";
      if (ep.titansVoting) ep.track[id] = titansCompositeBottomStatus(base, bottomLabel);
      else if (id === ep.winner) ep.track[id] = "WUE";
      else if (base === "HIGH") ep.track[id] = "HIGH+BTM";
      else if (base === "LOW" && ep.titansPenultimate) ep.track[id] = "LOW+BTM";
      else if (base === "WIN") ep.track[id] = "WUE";
      else ep.track[id] = bottomLabel;
    });

    if (ep.immunity) {
      const immuneStatus = ep.track[ep.immunity] || "SAFE";
      if (/^(LOW|BTM\d*|BTM|HIGH\+BTM|WUE|EXT)$/i.test(immuneStatus)) ep.track[ep.immunity] = "SAFE";
      ep.eligibleBottoms = ep.eligibleBottoms.filter(id => id !== ep.immunity);
      ep.exterminationParticipants = ep.exterminationParticipants.filter(id => id !== ep.immunity);
    }

    if (ep.disqualified) ep.track[ep.disqualified] = "DISQ";
    if (ep.quitContestant && ep.specialEvent === "walk_quit") ep.track[ep.quitContestant] = "QUIT";
    const eliminatedSet = new Set(episodeEliminatedIds(ep));
    eliminatedSet.forEach(id => {
      if (ep.specialEvent === "bottom_quit") ep.track[id] = "QUIT";
      else if (ep.titansVoting) ep.track[id] = titansCompositeExtStatus(preBottomPlacement[id] || ep.track[id]);
      else ep.track[id] = "EXT";
    });
    if (ep.returnedContestant && ep.track[ep.returnedContestant]) ep.track[ep.returnedContestant] = `RTRN<br/>${ep.track[ep.returnedContestant]}`;

    Object.entries(ep.track).forEach(([id, val]) => {
      const st = monster(id).stats;
      if (val.includes("WIN") || val === "WUE") st.wins++;
      if (val.includes("HIGH")) st.high++;
      if (val.includes("BTM") || val === "WUE" || val.includes("EXT") || val.includes("LOW") || val.includes("QUIT")) st.bottom++;
      if (ep.exterminationParticipants.includes(id)) st.exterminations++;
      if (ep.eligibleBottoms.includes(id) && !eliminatedSet.has(id)) st.extermWins++;
    });
  }

  function uniqueIds(ids) {
    return Array.from(new Set((ids || []).filter(Boolean)));
  }

  function renderLastSupperTemplate(template, ep, pair, bottom, finalists, allIds) {
    return String(template)
      .replaceAll("{winner}", ep?.winner ? monster(ep.winner).name : "the finalists")
      .replaceAll("{challenge}", ep?.floorshow?.name || "the season")
      .replaceAll("{eliminated}", ep?.eliminated ? monster(ep.eliminated).name : "no one")
      .replaceAll("{bottom}", bottom ? monster(bottom).name : "a bottom monster")
      .replaceAll("{a}", pair?.a ? monster(pair.a).name : "one monster")
      .replaceAll("{b}", pair?.b ? monster(pair.b).name : "another monster");
  }

  function topicParticipants(template, ep, pair, bottom, finalists, allIds) {
    const t = String(template).toLowerCase();
    if (t.includes("{a}") || t.includes("{b}") || /argument|tension|friendship|relationship|drama|off-camera|off camera/.test(t)) return uniqueIds([pair?.a, pair?.b]).slice(0, 2);
    if (t.includes("{winner}") || /win|finalist|crown|strongest/.test(t)) return uniqueIds([ep?.winner, ...shuffle(finalists).slice(0, 1)]).slice(0, 2);
    if (t.includes("{eliminated}") || /first elimination|gone home|extermination|returnee|second chance/.test(t)) return uniqueIds([ep?.eliminated, ...shuffle(allIds).slice(0, 1)]).slice(0, 2);
    if (t.includes("{bottom}") || /surviving|bottom|meltdown|pressure|mental health|sobriety|identity/.test(t)) return uniqueIds([bottom, ...shuffle(allIds).slice(0, 1)]).slice(0, 2);
    return shuffle(allIds).slice(0, rnd(1, Math.min(3, allIds.length)));
  }

  function generateLastSupper(epNo, finalists) {
    const allIds = Object.keys(state.season.contestants);
    const competitiveEpisodes = state.season.episodes.filter(e => e.type === "competitive");
    const relationshipPairs = [];
    allIds.forEach((a, i) => allIds.slice(i + 1).forEach(b => relationshipPairs.push({ a, b, rel: relationshipBetween(a, b) })));
    relationshipPairs.sort((x, y) => Math.abs(y.rel) - Math.abs(x.rel));
    const selectedTemplates = shuffle(lastSupperTopicTemplates).slice(0, rnd(5, 10));
    const topics = selectedTemplates.map((template, i) => {
      const sourceEpisode = competitiveEpisodes[i % Math.max(1, competitiveEpisodes.length)] || {};
      const pair = relationshipPairs[i % Math.max(1, relationshipPairs.length)] || {};
      const bottom = (sourceEpisode.eligibleBottoms || [])[0] || finalists[0] || allIds[0];
      const text = renderLastSupperTemplate(template, sourceEpisode, pair, bottom, finalists, allIds);
      const ids = topicParticipants(template, sourceEpisode, pair, bottom, finalists, allIds);
      return { text, ids };
    });
    const ep = { number: epNo, label: `Episode ${epNo}: The Last Supper`, type: "last_supper", activeAtStart: finalists.slice(), allGuestIds: allIds.slice(), finalists: finalists.slice(), topics, track: {}, revealed: true };
    allIds.forEach(id => ep.track[id] = "GUEST");
    attachFinalHellbound(ep, finalists);
    state.season.lastSupperAdded = true;
    state.season.episodes.push(ep);
    renderEpisode(ep);
  }

  function generateFinale(epNo, finalists) {
    const ep = { number: epNo, label:`Episode ${epNo}: The Grand Finale`, type:"finale", activeAtStart:finalists.slice(), track:{}, revealed:false };
    ep.guestJudge = getGuestJudge("finale");
    const ppeRanking = finalists
      .map(id => ({ id, ppe: ppeValue(id), wins: monster(id).stats.wins, highs: monster(id).stats.high }))
      .sort((a, b) => (b.ppe - a.ppe) || (b.wins - a.wins) || (b.highs - a.highs));
    const rareRunnerUpUpset = ppeRanking.length > 1 && should(.07);
    ep.winner = rareRunnerUpUpset ? ppeRanking[1].id : ppeRanking[0].id;
    ep.winnerDecision = rareRunnerUpUpset ? "second_best_ppe_upset" : "highest_ppe";
    ep.finalScores = Object.fromEntries(finalists.map(id => {
      const glamour = scoreMonster(id, { glamour:.55, design:.30, performance:.15 });
      const filth = scoreMonster(id, { filth:.55, horror:.20, performance:.15, design:.10 });
      const horror = scoreMonster(id, { horror:.50, performance:.25, design:.15, filth:.10 });
      const ppe = ppeValue(id);
      const rankIndex = ppeRanking.findIndex(item => item.id === id);
      return [id, { glamour, filth, horror, ppe, ppeRank: rankIndex + 1, total: ppe }];
    }));
    finalists.forEach(id => ep.track[id] = id === ep.winner ? "WINNER" : "RU");
    state.season.episodes.push(ep);
    state.season.completed = true;
    renderEpisode(ep);
  }

  function getGuestJudge(type) {
    const raw = window.GUEST_JUDGES || window.DRAG_GUEST_JUDGES || [];
    const external = Array.isArray(raw) ? raw : [];
    const merged = [...external, ...fallbackGuestJudges];
    const seen = new Set();
    const unique = merged.filter(item => {
      const name = typeof item === "string" ? item : item?.name || item?.title || "";
      const key = String(name).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const item = pick(unique.length ? unique : fallbackGuestJudges);
    return typeof item === "string" ? item : item.name || item.title || "A Special Guest Judge";
  }

  function stripCard(id) {
    const m = monster(id);
    return `<article class="mini-contestant-card"><img class="avatar mid-sq" src="${esc(m.image)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(m.name)}"><strong>${esc(m.name)}</strong></article>`;
  }

  function dragRaceBox(id, status = "SAFE", note = "", showToken = true) {
    const m = monster(id);
    return `<article class="placement-card dragrace-placement token-${statusClass(status)}"><img class="avatar mid-sq" src="${esc(m.image)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(m.name)}"><strong>${esc(m.name)}</strong>${showToken ? `<span class="token token-${statusClass(status)}">${esc(status)}</span>` : ""}${note ? `<p>${note}</p>` : ""}</article>`;
  }
  function eventCard(title, body, cls="") {
    return `<article class="event-card ${cls}"><strong>${esc(title)}</strong><p>${body}</p></article>`;
  }
  function contestantScoreCard(id, score, note="", label="") {
    const metric = label === null ? "" : (label ? `<strong class="score-pill">${esc(label)}</strong>` : `<strong class="score-pill">${pct(score)}</strong>`);
    return `<article class="challenge-card dragrace-performance"><img class="avatar mid-sq" src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(monster(id).name)}"><h4>${esc(monster(id).name)}</h4>${metric}${note ? `<p>${note}</p>` : ""}</article>`;
  }

  function miniStrip(ids) {
    return `<div class="contestant-strip small-strip">${(ids || []).map(stripCard).join("")}</div>`;
  }

  function placementGroup(title, ids, status, body="") {
    if (!ids || !ids.length) return "";
    const cls = status === "BTM" ? "btm" : statusClass(status);
    return `<article class="placement-group token-${cls}"><h3>${esc(title)}</h3>${body ? `<p>${body}</p>` : ""}<div class="placement-box-grid">${ids.map(id => dragRaceBox(id, status)).join("")}</div></article>`;
  }

  function simpleContestantGroup(title, ids, cls="safe", body="") {
    if (!ids || !ids.length) return "";
    return `<article class="placement-group simple-contestant-group token-${statusClass(cls)}"><h3>${esc(title)}</h3>${body ? `<p>${body}</p>` : ""}<div class="placement-box-grid centered-box-grid">${ids.map(id => dragRaceBox(id, cls, "", false)).join("")}</div></article>`;
  }

  function judgingSafeGroup(ids) {
    if (!ids || !ids.length) return "";
    return `<article class="placement-group judging-safe-group simple-contestant-group token-safe"><h3>Safe</h3><div class="placement-box-grid centered-box-grid judging-safe-row">${ids.map(id => dragRaceBox(id, "SAFE", "", false)).join("")}</div><p>You are safe and may leave the stage.</p></article>`;
  }

  function idsByFinalStatus(ep, status) {
    return ep.activeAtStart.filter(id => (ep.track[id] || "") === status);
  }


  function eliminatedBeforeEpisode(ep) {
    if (!ep) return [];
    return uniqueIds(state.season.episodes
      .filter(e => e.type !== "finale" && e.number < ep.number)
      .flatMap(e => episodeEliminatedIds(e)));
  }

  function renderEpisode(ep) {
    els.episodeTitle.textContent = ep.label;
    els.episodeSelect.innerHTML = state.season.episodes.map((e, i) => `<option value="${i}" ${i === state.season.episodes.indexOf(ep) ? "selected" : ""}>${esc(e.label)}</option>`).join("");
    const returnNotice = "";
    const entryId = ep.lateEntryContestant || ep.returnedContestant || null;
    const isFakeoutReturn = !!(ep.returnedContestant && state.config?.premiere === "fakeout_elim");
    const entryTitle = ep.lateEntryContestant ? "Late Entry" : isFakeoutReturn ? "Fakeout Elimination" : "Wildcard Entry";
    const entryButton = $(`.section-toggle[data-step="returnee"]`);
    if (entryButton) entryButton.textContent = entryTitle;
    const entrySectionTitle = $(`[data-panel="returnee"] .section-title`);
    if (entrySectionTitle) entrySectionTitle.textContent = entryTitle;
    if (els.wildcardEntryStack) {
      const entryName = entryId ? esc(monster(entryId).name) : "";
      const entryClass = ep.lateEntryContestant ? "late-entry-episode-card" : isFakeoutReturn ? "fakeout-entry-episode-card" : "";
      const entryHeadline = ep.lateEntryContestant
        ? `${entryName} enters the competition!`
        : isFakeoutReturn
          ? `${entryName} has been resurrected!`
          : `${entryName} has entered the competition as a wildcard!`;
      const entryBody = ep.lateEntryContestant
        ? "A new monster arrives in the boudoir and joins the competition."
        : isFakeoutReturn
          ? "The monster previously exterminated returns before the next floorshow begins."
          : "The nightmare gets another chance.";
      els.wildcardEntryStack.innerHTML = entryId
        ? `<article class="event-card wildcard-entry-card ${entryClass}"><strong>${entryHeadline}</strong><div class="contestant-strip small-strip single-entry-strip">${stripCard(entryId)}</div><p>${entryBody}</p></article>`
        : "";
    }
    els.remainingStrip.innerHTML = returnNotice + ((ep.activeAtStart || activeIds()).map(stripCard).join("") || `<div class="empty-card">The crypt is empty.</div>`);
    const previouslyEliminated = eliminatedBeforeEpisode(ep);
    if (els.eliminatedTitle) els.eliminatedTitle.hidden = previouslyEliminated.length === 0;
    if (els.eliminatedStrip) {
      els.eliminatedStrip.hidden = previouslyEliminated.length === 0;
      els.eliminatedStrip.innerHTML = previouslyEliminated.map(stripCard).join("");
    }

    if (ep.type === "last_supper") return renderLastSupper(ep);
    if (ep.type === "finale") return renderFinale(ep);

    const miniBtnNormal = $(`.section-toggle[data-step="mini"]`);
    if (miniBtnNormal) miniBtnNormal.textContent = "Fright Feat";
    const miniTitleNormal = $(`[data-panel="mini"] .section-title`);
    if (miniTitleNormal) miniTitleNormal.textContent = "Fright Feat";
    const safeIds = ep.activeAtStart.filter(id => ![ep.winner, ...ep.highs, ...ep.lows, ...ep.eligibleBottoms, ep.banished].includes(id));
    configureEpisodeSteps(ep, safeIds);

    els.guestJudgeStack.innerHTML = eventCard("Guest Judge", `${esc(ep.guestJudge)} joins the Boulets at the judges’ table.`);

    els.miniChallengeStack.innerHTML = ep.hasFright
      ? `${eventCard(ep.frightFeat.name, `${esc(ep.frightFeat.description || ep.frightFeat.text)}`)}<div class="fright-winner-box"><h3>Fright Feat Winner${ep.resurrection ? " (+1 Point)" : ""}</h3><div class="fright-winner-row">${dragRaceBox(ep.frightWinner, "WIN", ep.resurrection ? "+1 Resurrection Point" : "Fright Feat Winner", true)}</div></div>`
      : "";

    let powerHtml = "";
    let powerTitle = "Curse / Power";
    if (ep.curse) {
      powerTitle = "Curse";
      powerHtml += eventCard(ep.curse.name, `The winner gets to place the curse on another contestant. ${esc(monster(ep.curse.target).name)} ${esc(ep.curse.text)} The curse heavily damages their Floor Show score this week.`);
      powerHtml += `<div class="curse-visual-row"><div class="curse-duo">${dragRaceBox(ep.curse.caster, "WIN", "Fright Feat Winner", false)}<span class="curse-arrow">→</span>${dragRaceBox(ep.curse.target, "CURSE", "Cursed Monster", false)}</div><p><strong>${esc(monster(ep.curse.caster).name)}</strong> puts the curse on <strong>${esc(monster(ep.curse.target).name)}</strong>.</p></div>`;
    }
    if (ep.keyPower) {
      powerTitle = ep.curse ? "Curse / Power" : "Feat Prize";
      if (ep.keyPower.choice === "immunity") {
        powerHtml += eventCard("Key of Life & Death", "The winner receives the power to choose life for themselves or death for another monster. They choose life and grant themselves immunity from extermination.");
        powerHtml += `<div class="fright-winner-row">${dragRaceBox(ep.keyPower.holder, "IMM", "Key Holder / Immune", false)}</div><p class="power-choice-line"><strong>${esc(monster(ep.keyPower.holder).name)}</strong> uses the Key of Life & Death to give themselves immunity.</p>`;
      } else {
        powerHtml += eventCard("Key of Life & Death", "The winner receives the power to choose life for themselves or death for another monster. They choose death and nominate another contestant for extermination.");
        powerHtml += `<div class="curse-visual-row"><div class="curse-duo">${dragRaceBox(ep.keyPower.holder, "WIN", "Key Holder", false)}<span class="curse-arrow">→</span>${dragRaceBox(ep.keyPower.target, "BTM", "Nominated", false)}</div><p><strong>${esc(monster(ep.keyPower.holder).name)}</strong> nominates <strong>${esc(monster(ep.keyPower.target).name)}</strong> for extermination.</p></div>`;
      }
    }
    if (ep.immunity && !ep.keyPower?.grantsImmunity) {
      powerTitle = ep.curse ? "Curse / Power" : "Feat Prize";
      powerHtml += eventCard("Immunity", "The winner gets immunity from extermination.");
      powerHtml += `<div class="fright-winner-row">${dragRaceBox(ep.immunity, "IMM", "Immune from extermination", false)}</div>`;
    }
    if (ep.winnerNomination) {
      powerTitle = "Feat Prize";
      powerHtml += eventCard("Winner’s Nomination", "The Floor Show winner receives the power to nominate another monster for extermination.");
      powerHtml += `<div class="curse-visual-row"><div class="curse-duo">${dragRaceBox(ep.winnerNomination.by, "WIN", "Floor Show Winner", false)}<span class="curse-arrow">→</span>${dragRaceBox(ep.winnerNomination.target, "BTM", "Nominated", false)}</div><p><strong>${esc(monster(ep.winnerNomination.by).name)}</strong> nominates <strong>${esc(monster(ep.winnerNomination.target).name)}</strong> for extermination.</p></div>`;
    }
    if (!powerHtml && ep.hasFright) {
      powerTitle = "Feat Prize";
      powerHtml += eventCard("Floor Show Advantage", "The winner gets an advantage for a Floor Show.");
      powerHtml += `<div class="fright-winner-row">${dragRaceBox(ep.frightWinner, "WIN", "Fright Feat Winner", false)}</div>`;
    }
    const powerButton = $(`.section-toggle[data-step="teams"]`);
    if (powerButton) powerButton.textContent = powerTitle;
    const powerSectionTitle = $(`[data-panel="teams"] .section-title`);
    if (powerSectionTitle) powerSectionTitle.textContent = powerTitle;
    els.teamPickingStack.innerHTML = powerHtml;

    const ranked = ep.activeAtStart.map(id => ({ id, score: ep.scores[id] })).sort((a,b) => b.score - a.score);
    const floorGroups = ep.floorPerformanceGroups || buildFloorPerformanceGroups(ep, ranked);
    const floorGood = floorGroups.good || [];
    const floorBad = floorGroups.bad || [];
    const floorDecent = floorGroups.decent || ep.activeAtStart.filter(id => !floorGood.includes(id) && !floorBad.includes(id));

    els.challengeSummary.innerHTML = `<h3>${esc(ep.floorshow.name)}</h3><p>${esc(ep.floorshow.description || "The monsters present their floorshow.")}</p>`;
    els.challengeGrid.innerHTML = [
      simpleContestantGroup("Did Good", floorGood, "HIGH"),
      simpleContestantGroup("Did Decent", floorDecent, "SAFE"),
      simpleContestantGroup("Did Bad", floorBad, "LOW")
    ].join("");

    els.judgingStack.innerHTML = safeIds.length ? judgingSafeGroup(safeIds) : "";

    const placementGroups = [];
    placementGroups.push(placementGroup("Winner", [ep.winner], "WIN", ep.resurrection ? "You win the challenge and gain +2 points." : "You're the winner of this week's Floor Show."));
    if (ep.resurrection) {
      if (ep.highs.length) placementGroups.push(placementGroup("High", ep.highs, "HIGH", "Strong work this week. You gain +1 point."));
      if (ep.pointSteal?.target) {
        placementGroups.push(eventCard("Point Steal", `${esc(monster(ep.pointSteal.target).name)} has 1 point stolen by ${esc(monster(ep.pointSteal.by).name)}.`));
        placementGroups.push(`<article class="placement-group resurrection-steal-group"><h3>Point Stolen</h3><div class="callout-grid"><div>${dragRaceBox(ep.pointSteal.by, "WIN", "Stole 1 point", true)}</div><div>${dragRaceBox(ep.pointSteal.target, "SAFE", "-1 point", true)}</div></div></article>`);
      }
    } else if (ep.sonicBanishment) {
      placementGroups.push(eventCard("Sonic Transducer", `${esc(monster(ep.winner).name)}, you hold the power this week. You must choose which of your fellow competitors... you want to banish from the competition.`));
    } else if (ep.titansVoting) {
      const prelim = ep.preBottomPlacement || basePlacementMap(ep);
      const prelimSafe = ep.activeAtStart.filter(id => prelim[id] === "SAFE");
      if (ep.highs.length) placementGroups.push(placementGroup("High", ep.highs, "HIGH", "Good job this week, monsters. You're safe for now."));
      if (prelimSafe.length) placementGroups.push(placementGroup("Safe", prelimSafe, "SAFE", "You are safe for now."));
      if (ep.lows.length) placementGroups.push(placementGroup("Low", ep.lows, "LOW", "You are safe for now, but the vote can still change everything."));
      placementGroups.push(titansVotingHtml(ep));
      if (ep.eligibleBottoms.length) placementGroups.push(placementGroup("Voted Into Extermination", ep.eligibleBottoms, "BTM", "The monsters with the most votes are sent straight into extermination."));
    } else {
      if (ep.highs.length) placementGroups.push(placementGroup("High", ep.highs, "HIGH", "Good job this week, monsters. You're safe."));
      if (ep.lows.length) placementGroups.push(placementGroup("Low", ep.lows, "LOW", "You are safe this week."));
      if (ep.eligibleBottoms.length) placementGroups.push(placementGroup("Bottoms", ep.eligibleBottoms, "BTM", ep.titansPenultimate ? "The penultimate challenge sends four monsters into extermination." : "You are up for extermination."));
    }
    els.placementsGrid.innerHTML = placementGroups.join("");
    els.bottomTwoBox.innerHTML = "";
    if (els.cauldronStack) {
      els.cauldronStack.innerHTML = (ep.cauldronEvents || []).map(event => {
        const change = Number(event.relationship || 0);
        const influence = change > 0 ? `Relationship influence: +${change}` : change < 0 ? `Relationship influence: ${change}` : "";
        return `<article class="event-card cauldron-event token-${esc(event.type)}"><div class="contestant-strip event-people">${(event.ids || []).map(stripCard).join("")}</div><p>${esc(event.renderedText)}</p>${influence ? `<small class="relationship-influence ${change > 0 ? "positive" : "negative"}">${esc(influence)}</small>` : ""}</article>`;
      }).join("") || eventCard("The Cauldron is quiet", "The monsters keep their thoughts to themselves tonight.");
    }

    renderHellbound(ep);
    $$(".results-to-hellbound-btn").forEach(btn => btn.hidden = !ep.hellbound);
    $$(".results-track-btn").forEach(btn => btn.hidden = !!ep.hellbound);

    if (ep.resurrection) {
      const resBtn = $(`.section-toggle[data-step="results"]`);
      if (resBtn) resBtn.textContent = "Episode Points";
      if (els.resultsSectionTitle) els.resultsSectionTitle.textContent = "Episode Points";
      const rows = (ep.activeAtStart || []).map(id => {
        const episodePoints = ep.resurrectionPoints?.[id] || 0;
        return `<article class="placement-card token-${statusClass(ep.resurrectionPlacement?.[id] || "SAFE")}"><img class="avatar" src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(monster(id).name)}"><h4>${esc(monster(id).name)}</h4><strong>${esc(formatEpisodePoints(episodePoints))}</strong><p>points this episode</p></article>`;
      }).join("");
      els.lipSyncBoard.innerHTML = "";
      els.revealBoard.innerHTML = `<div class="death-scene-wrap resurrection-points-wrap"><div class="result-card death-scene"><h3>Resurrection Points Locked</h3><p>Nobody is exterminated tonight. Only this episode's points are shown here.</p></div><div class="challenge-grid centered-box-grid resurrection-points-grid">${rows}</div></div>`;
      els.crowningMessage.textContent = "";
      els.revealResultsBtn.hidden = true;
      attachEpisodeTrackRecord(ep);
      showPanel((ep.lateEntryContestant || ep.returnedContestant) ? "returnee" : "status");
      return;
    }

    if (ep.sonicBanishment) {
      els.lipSyncBoard.innerHTML = `<div class="extermination-stack banishment-stack"><div class="challenge-summary extermination-summary"><h3>Banishment</h3><p>The Sonic Transducer replaces the extermination challenge this week.</p></div><div class="challenge-grid centered-box-grid extermination-performance-grid">${dragRaceBox(ep.winner, "WIN", "Sonic Transducer Holder", false)}</div><div class="challenge-summary extermination-summary"><p><strong>${esc(monster(ep.winner).name)}</strong>, who have you chosen to banish from the competition forever?</p></div></div>`;
      els.revealBoard.innerHTML = `<div class="death-scene-wrap"><div class="result-card locked death-lock"><h3>Banishment</h3><p>The choice is sealed. Reveal who ${esc(monster(ep.winner).name)} has chosen to banish.</p></div></div>`;
      els.crowningMessage.textContent = "";
      els.revealResultsBtn.hidden = false;
      els.revealResultsBtn.textContent = "Reveal Choice";
      const lipBtn = $(`.section-toggle[data-step="lipsync"]`);
      const resBtn = $(`.section-toggle[data-step="results"]`);
      if (lipBtn) lipBtn.textContent = "Banishment";
      if (resBtn) resBtn.textContent = "Banishment";
      if (els.resultsSectionTitle) els.resultsSectionTitle.textContent = "Banishment";
      attachEpisodeTrackRecord(ep);
      showPanel("status");
      return;
    }

    const lipBtn = $(`.section-toggle[data-step="lipsync"]`);
    const resBtn = $(`.section-toggle[data-step="results"]`);
    if (lipBtn) lipBtn.textContent = ep.ghostlyGallows ? "Ghostly Gallows" : "Extermination";
    if (resBtn) resBtn.textContent = ep.ghostlyGallows ? "Ghostly Gallows" : "Death Scene";
    if (els.resultsSectionTitle) els.resultsSectionTitle.textContent = ep.ghostlyGallows ? "Ghostly Gallows" : "Death Scene";

    if (ep.ghostlyGallows) {
      const gallowsIds = ep.eligibleBottoms || [];
      els.lipSyncBoard.innerHTML = "";
      const lockedHtml = `<div class="death-scene-wrap ghostly-gallows-result"><div class="challenge-summary extermination-summary"><h3>Ghostly Gallows</h3><p>There is no extermination challenge tonight. The bottom monsters face the Ghostly Gallows and await the Boulets' judgment.</p></div><div class="result-card ${ep.revealed ? "death-scene" : "locked death-lock"}"><h3>Ghostly Gallows</h3><p>${ep.revealed ? esc(ghostlyGallowsResultText(ep)) : "The Gallows are sealed. Reveal which monster or monsters are exterminated."}</p></div><div class="challenge-grid centered-box-grid ghostly-gallows-grid">${gallowsIds.map(id => gallowsCard(id, ep)).join("")}</div></div>`;
      els.revealBoard.innerHTML = lockedHtml;
      els.crowningMessage.textContent = "";
      els.revealResultsBtn.hidden = !!ep.revealed;
      els.revealResultsBtn.textContent = "Reveal Exterminated";
      attachEpisodeTrackRecord(ep);
      showPanel((ep.lateEntryContestant || ep.returnedContestant) ? "returnee" : "status");
      return;
    }

    const exScores = Object.fromEntries(ep.exterminationParticipants.map(id => [id, extermScore(id, ep.scores[id])]));
    const exRank = ep.exterminationParticipants.map(id => ({ id, score: exScores[id] })).sort((a,b) => b.score - a.score);
    const exNotes = Object.fromEntries(exRank.map((x, i) => {
      const band = x.id === ep.forceWeakExtermination ? "weak" : (i < Math.ceil(exRank.length / 3) ? "strong" : i >= Math.floor(exRank.length * 2 / 3) ? "weak" : "mixed");
      const fallbackQuit = x.id === ep.forceWeakExtermination ? `${monster(x.id).name} quits the extermination and is unable to continue.` : "";
      return [x.id, (exterminationComment(ep.extermination, band) || fallbackQuit).replaceAll("{Contestant}", monster(x.id).name)];
    }));
    els.lipSyncBoard.innerHTML = `<div class="extermination-stack"><div class="challenge-summary extermination-summary"><h3>${esc(ep.extermination.name)}</h3><p>${esc(ep.extermination.description)}</p></div><div class="challenge-grid centered-box-grid extermination-performance-grid">${exRank.map((x) => contestantScoreCard(x.id, x.score, esc(exNotes[x.id] || ""), null)).join("")}</div></div>`;

    const lockedStory = episodeEliminatedIds(ep).length ? maskContestantNames(ep.deathScene, episodeEliminatedIds(ep)) : esc(ep.deathScene);
    els.revealBoard.innerHTML = `<div class="death-scene-wrap"><div class="result-card locked death-lock"><h3>${esc(ep.deathSceneTitle || "Death Scene")}</h3><p>${lockedStory}</p></div></div>`;
    els.crowningMessage.textContent = "";
    els.revealResultsBtn.hidden = false;
    els.revealResultsBtn.textContent = "Reveal Death";
    attachEpisodeTrackRecord(ep);
    showPanel((ep.lateEntryContestant || ep.returnedContestant) ? "returnee" : "status");
  }

  function placementCard(id, status) {
    return `<article class="placement-card token-${statusClass(status)}"><img class="avatar" src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt=""><h4>${esc(monster(id).name)}</h4><strong>${esc(status)}</strong><p>${statusText(status)}</p></article>`;
  }
  function statusClass(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
  function statusText(s) {
    if (s === "WUE") return "Won the floorshow but is still up for extermination.";
    if (s === "HIGH+BTM") return "High critiques, but a power/twist places them in extermination.";
    if (s === "CURSE" || s.includes("CURSE")) return "Affected by a curse this episode.";
    if (/^BTM\d*$/.test(s) || s === "BTM") return "Up for extermination.";
    if (s === "EXT") return "Exterminated.";
    if (s === "WIN") return "You're the winner of this week's Floor Show.";
    if (s === "HIGH") return "Good job this week, monsters. You're safe.";
    if (s === "LOW") return "You are safe this week.";
    if (s === "IMM") return "Immune from extermination.";
    return "Safe.";
  }

  function trackClass(status) {
    const s = String(status || "").toUpperCase();
    if (!s) return "";
    if (s.startsWith("RTRN")) {
      const returnedPlacement = s.replace(/^RTRN(?:<BR\/?>)*\s*/i, "").trim();
      return trackClass(returnedPlacement || "SAFE");
    }
    if (s.startsWith("BTM")) return "btm";
    if (s.includes("EXT")) return "elim";
    if (s === "QUIT") return "quit";
    if (s === "DISQ") return "disq";
    if (s === "GUEST") return "guest";
    if (/^\d+(ND|RD|TH)$/.test(s)) return "guest";
    if (s === "LOSS") return "hellbound-loss";
    if (s === "RU") return "runner-up";
    if (s === "WINNER") return "winner";
    if (["HIGH+BTM", "LOW+BTM", "SAFE+BTM"].includes(s)) return s.toLowerCase().replace("+", "-");
    if (["HIGH+EXT", "LOW+EXT", "SAFE+EXT"].includes(s)) return s.toLowerCase().replace("+", "-");
    if (s.includes("CURSE")) return "curse";
    return statusClass(s);
  }

  function trackCellHtml(status, afterOut = false, ep = null, id = null) {
    const value = status || "";
    const classes = ["track-cell"];
    const upperValue = String(value).toUpperCase();
    const isHellboundReturn = !!(ep?.hellboundFinal?.winner === id && upperValue === "RTRN");
    if (ep?.resurrection && id && ep.resurrectionPlacement?.[id]) classes.push(`token-${trackClass(ep.resurrectionPlacement[id])}`);
    else if (value) classes.push(`token-${trackClass(value)}`);
    if (String(value).startsWith("RTRN<br/>") || /^(HIGH|LOW|SAFE)\+(BTM|EXT)$/.test(upperValue) || (upperValue === "RTRN" && !isHellboundReturn)) classes.push("return-cell");
    if (ep?.hellbound?.winner === id && upperValue === "WIN") classes.push("hellbound-win-cell");
    if ((ep?.hellbound?.loser === id || ep?.hellboundFinal?.losers?.includes(id)) && upperValue === "LOSS") classes.push("hellbound-loss-cell");
    if (isHellboundReturn) classes.push("hellbound-return-cell");
    if ((ep?.winners || []).length > 1 && (ep?.winners || []).includes(id) && upperValue === "WIN" && !ep?.hellbound?.contestants?.includes(id)) classes.push("multi-win");
    if (upperValue === "EXT" && episodeEliminatedIds(ep).includes(id)) classes.push(`exterm-outcome-${Math.min(5, Math.max(1, Number(monster(id)?.stats?.exterminations || 1)))}`);
    if (upperValue === "QUIT") classes.push("quit-outcome");
    if (upperValue === "DISQ") classes.push("disq-outcome");
    const isSavedBottom = !!(ep && !ep.eliminated && ep.eligibleBottoms?.includes(id) && /^(BTM\d*|BTM|HIGH\+BTM|LOW\+BTM|SAFE\+BTM|WUE)$/i.test(String(value).replace(/^RTRN<br\/>/i, "")));
    if (isSavedBottom) classes.push("non-exterm-bottom");
    if (ep?.curse?.target === id) classes.push("curse-marked");
    if (ep?.immunity === id) classes.push("immunity-marked");
    if (afterOut && !value) classes.push("after-elim");
    if (!value) classes.push("no-cell");
    const display = isHellboundReturn
      ? "RTRN"
      : String(value).startsWith("RTRN<br/>")
        ? `<span class="return-stack"><span class="return-label">RTRN</span><span class="return-placement">${esc(String(value).replace("RTRN<br/>", ""))}</span></span>`
        : upperValue === "RTRN"
          ? `<span class="return-stack"><span class="return-label">RTRN</span></span>`
          : /^(HIGH|LOW|SAFE)\+(BTM|EXT)$/.test(upperValue)
          ? `<span class="return-stack composite-stack"><span class="return-label">${esc(upperValue.split("+")[0])}</span><span class="return-placement">${esc(upperValue.split("+")[1])}</span></span>`
          : esc(value);
    return `<td class="${classes.join(" ")}">${display}</td>`;
  }


  function hellboundContestantCard(id, showdown) {
    const revealed = !!showdown.revealed;
    const isWinner = revealed && id === showdown.winner;
    const isLoser = revealed && (id === showdown.loser || (showdown.losers || []).includes(id));
    const status = !revealed ? "Awaiting result" : isWinner ? (showdown === state.season?.episodes?.[state.currentEpisode]?.hellboundFinal ? "Returns to the final" : "Wins the showdown") : "Loses the showdown";
    const classes = ["challenge-card", "hellbound-contestant-card"];
    if (isWinner) classes.push("hellbound-revealed-winner");
    if (isLoser) classes.push("hellbound-revealed-loser");
    return `<article class="${classes.join(" ")}"><img class="avatar xl-sq" src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt=""><h4>${esc(monster(id).name)}</h4><p>${esc(status)}</p></article>`;
  }

  function revealHellboundResults() {
    const ep = state.season?.episodes?.[state.currentEpisode];
    const showdown = ep?.hellboundFinal || ep?.hellbound;
    if (!showdown) return;
    showdown.revealed = true;
    renderHellbound(ep);
    attachEpisodeTrackRecord(ep);
  }

  function renderHellbound(ep) {
    if (!els.hellboundStack) return;
    const showdown = ep.hellboundFinal || ep.hellbound;
    const btn = $(`.section-toggle[data-step="hellbound"]`);
    if (btn) btn.textContent = "Hellbound Showdown";
    const revealBtn = els.revealHellboundBtn;
    const nextBtns = $$(`[data-panel="hellbound"] .hellbound-track-btn`);
    if (!showdown) {
      els.hellboundStack.innerHTML = "";
      if (revealBtn) revealBtn.hidden = true;
      nextBtns.forEach(button => button.hidden = false);
      return;
    }
    const ranked = (showdown.contestants || [])
      .map(id => ({ id, score: showdown.scores?.[id] || 0 }))
      .sort((a, b) => b.score - a.score);
    const finalNote = ep.hellboundFinal ? "The winner returns to the competition and competes in the final." : "The winner survives Hellbound and waits for the next exterminated monster.";
    const resultHtml = showdown.revealed
      ? `<article class="event-card hellbound-result-card"><strong>${esc(monster(showdown.winner).name)} wins the Hellbound Showdown.</strong><p>${esc(finalNote)}</p></article>`
      : `<article class="event-card hellbound-result-card locked"><strong>The result is sealed.</strong><p>Reveal which eliminated monster survives the shadows.</p></article>`;
    els.hellboundStack.innerHTML = `
      <article class="event-card hellbound-showdown-card">
        <strong>${esc(showdown.challenge || showdown.title || "Hellbound Showdown")}</strong>
        <p>${esc(showdown.challengeDescription || "The eliminated monsters face a hidden showdown.")}</p>
        <p>${esc(showdown.description || "The eliminated monsters battle in the shadows using this week's challenge as their test.")}</p>
      </article>
      <div class="challenge-grid centered-box-grid hellbound-grid">${ranked.map(x => hellboundContestantCard(x.id, showdown)).join("")}</div>
      ${resultHtml}`;
    if (revealBtn) revealBtn.hidden = !!showdown.revealed;
    nextBtns.forEach(button => button.hidden = !showdown.revealed);
  }

  function renderLastSupper(ep) {
    configureEpisodeSteps(ep, []);
    const miniBtn = $(`.section-toggle[data-step="mini"]`);
    if (miniBtn) miniBtn.textContent = "The Last Supper";
    const miniTitle = $(`[data-panel="mini"] .section-title`);
    if (miniTitle) miniTitle.textContent = "The Last Supper";
    els.miniChallengeStack.innerHTML = `<article class="event-card last-supper-intro"><strong>The Last Supper</strong><p>The exterminated monsters return for one final reunion before the finale.</p></article><div class="last-supper-topic-list">${(ep.topics || []).map((topic, i) => { const item = typeof topic === "string" ? { text: topic, ids: [] } : topic; return `<article class="event-card cauldron-event last-supper-topic"><strong>Topic ${i + 1}</strong><div class="contestant-strip event-people">${(item.ids || []).map(stripCard).join("")}</div><p>${esc(item.text || item)}</p></article>`; }).join("")}</div>`;
    renderHellbound(ep);
    if (els.episodeTrackRecord) els.episodeTrackRecord.innerHTML = "";
    showPanel("status");
  }

  function renderFinale(ep) {
    if (ep.resurrectionFinale) {
      configureEpisodeSteps(ep, []);
      els.episodeTitle.textContent = ep.label;
      els.guestJudgeStack.innerHTML = "";
      els.miniChallengeStack.innerHTML = "";
      els.teamPickingStack.innerHTML = "";
      els.challengeSummary.innerHTML = "";
      els.challengeGrid.innerHTML = "";
      els.judgingStack.innerHTML = "";
      els.placementsGrid.innerHTML = "";
      els.bottomTwoBox.innerHTML = "";
      els.lipSyncBoard.innerHTML = "";
      els.revealBoard.innerHTML = "";
      if (els.hellboundStack) els.hellboundStack.innerHTML = "";
      const introHtml = ep.revealed
        ? `<article class="event-card resurrection-death-scene"><strong>${esc(ep.deathSceneTitle)}</strong><p>${esc(ep.deathScene)}</p></article>`
        : `<article class="event-card resurrection-death-scene locked"><strong>The final tape is sealed.</strong><p>Reveal the last monster left alive.</p></article>`;
      const revealOrder = ep.revealed ? ep.ranked.slice().reverse() : [];
      els.winnerBoard.innerHTML = introHtml + revealOrder.map((id, i) => {
        const isWinner = id === ep.winner;
        return `<article class="challenge-card finale-contender resurrection-reveal-card ${isWinner ? "is-crowned-winner" : ""}" style="--reveal-delay:${i * 420}ms" data-finale-id="${esc(id)}"><img class="avatar mid-sq" src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(monster(id).name)}"><h4>${esc(monster(id).name)}</h4><span class="token token-${isWinner ? "win" : "guest"}">${esc(ep.track[id])}</span><p>${esc(ep.points[id] || 0)} points</p></article>`;
      }).join("");
      els.winnerCrowningMessage.textContent = ep.revealed ? `${monster(ep.winner).name} survives the Resurrection and wins.` : "";
      els.revealCrownWinnerBtn.hidden = ep.revealed;
      els.allWinnersFinalStatsBtn.hidden = !ep.revealed;
      attachEpisodeTrackRecord(ep);
      showPanel("winner");
      return;
    }
    configureEpisodeSteps(ep, []);
    els.guestJudgeStack.innerHTML = eventCard("Finale Guest Judge", `${esc(ep.guestJudge)} joins the finale panel.`);
    els.miniChallengeStack.innerHTML = eventCard("No Fright Feat", "The finalists prepare their final floorshow package.");
    els.teamPickingStack.innerHTML = eventCard("No Curse", "No curses are used in the Grand Finale.");
    els.challengeSummary.innerHTML = `<h3>Glamour, Filth, and Horror</h3><p>The finalists present three final floorshows representing the core principles of Dragula.</p>`;
    els.challengeGrid.innerHTML = ep.activeAtStart.map(id => {
      const s = ep.finalScores[id];
      return contestantScoreCard(id, s.total / 3, "", null);
    }).join("");
    els.judgingStack.innerHTML = eventCard("Final Deliberation", "The Boulets consider the finale package, season arc, track record, and monster identity.");
    els.placementsGrid.innerHTML = "";
    els.bottomTwoBox.innerHTML = "";
    els.lipSyncBoard.innerHTML = "";
    els.revealBoard.innerHTML = "";
    if (els.hellboundStack) els.hellboundStack.innerHTML = "";
    els.winnerBoard.innerHTML = ep.activeAtStart.map(id => `<article class="challenge-card finale-contender" data-finale-id="${esc(id)}"><img class="avatar mid-sq" src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(monster(id).name)}"><h4>${esc(monster(id).name)}</h4></article>`).join("");
    els.winnerCrowningMessage.textContent = "";
    attachEpisodeTrackRecord(ep);
    showPanel("winner");
  }

  function revealDeath() {
    const ep = state.season.episodes[state.currentEpisode];
    if (!ep || ep.type === "finale") return;
    ep.revealed = true;
    if (ep.sonicBanishment) {
      els.revealBoard.innerHTML = `<div class="death-scene-wrap"><div class="result-card death-scene"><h3>Banishment</h3><p>${esc(monster(ep.winner).name)} chooses to banish <strong>${esc(monster(ep.banished).name)}</strong> from the competition forever.</p></div><div class="death-reveal-card">${stripCard(ep.banished)}</div></div>`;
      els.crowningMessage.innerHTML = "";
      els.revealResultsBtn.hidden = true;
      attachEpisodeTrackRecord(ep);
      return;
    }
    if (ep.ghostlyGallows) {
      const gallowsIds = ep.eligibleBottoms || [];
      els.revealBoard.innerHTML = `<div class="death-scene-wrap ghostly-gallows-result"><div class="challenge-summary extermination-summary"><h3>Ghostly Gallows</h3><p>The Gallows have spoken.</p></div><div class="result-card death-scene"><h3>Ghostly Gallows</h3><p>${esc(ghostlyGallowsResultText(ep))}</p></div><div class="challenge-grid centered-box-grid ghostly-gallows-grid">${gallowsIds.map(id => gallowsCard(id, ep)).join("")}</div></div>`;
      els.lipSyncBoard.innerHTML = "";
      els.crowningMessage.innerHTML = "";
      els.revealResultsBtn.hidden = true;
      attachEpisodeTrackRecord(ep);
      return;
    }
    const revealIds = episodeOutgoingIds(ep);
    if (revealIds.length) {
      els.revealBoard.innerHTML = `<div class="death-scene-wrap"><div class="result-card death-scene"><h3>${esc(ep.deathSceneTitle || "Death Scene")}</h3><p>${esc(ep.deathScene)}</p></div><div class="death-reveal-grid">${revealIds.map(id => `<div class="death-reveal-card">${stripCard(id)}</div>`).join("")}</div></div>`;
      els.crowningMessage.innerHTML = "";
    } else {
      els.revealBoard.innerHTML = `<div class="death-scene-wrap"><div class="result-card death-scene"><h3>${esc(ep.deathSceneTitle || "Death Scene")}</h3><p>${esc(ep.deathScene)}</p></div></div>`;
      els.crowningMessage.innerHTML = "";
    }
    els.revealResultsBtn.hidden = true;
    attachEpisodeTrackRecord(ep);
  }

  function proceedEpisode() {
    const ep = state.season.episodes[state.currentEpisode];
    if (!ep) return;
    if (ep.type === "finale") { renderStats(); showScreen("stats-screen"); return; }
    if (!ep.revealed) revealDeath();
    if (ep.processed) {
      state.currentEpisode = Math.min(state.season.episodes.length - 1, state.currentEpisode + 1);
      renderEpisode(state.season.episodes[state.currentEpisode]);
      scrollToEpisodeSection();
      return;
    }
    ep.processed = true;
    const outgoing = episodeOutgoingIds(ep);
    outgoing.forEach(id => {
      monster(id).active = false;
      monster(id).eliminated = true;
      if (!state.season.eliminated.includes(id)) state.season.eliminated.push(id);
    });
    if (ep.eliminated && episodeEliminatedIds(ep).length === 1 && (state.config.premiere === "fakeout_elim" || state.config.premiere === "returnee") && ep.number === 1 && !state.season.returnedOnce) {
      const candidate = ep.eliminated;
      ep.returnCandidate = candidate;
      monster(candidate).active = true;
      monster(candidate).eliminated = false;
      state.season.eliminated = state.season.eliminated.filter(id => id !== candidate);
      state.season.returnedOnce = true;
      state.season.pendingReturn = candidate;
    }
    if (state.config.premiere === "late_entry" && ep.number === 1 && state.season.lateEntryId && !state.season.lateEntryActivated) {
      const candidate = state.season.lateEntryId;
      monster(candidate).active = true;
      monster(candidate).eliminated = false;
      state.season.lateEntryActivated = true;
    }
    state.currentEpisode = state.season.episodes.length;
    generateNextEpisode();
    scrollToEpisodeSection();
  }

  function revealWinner() {
    const ep = state.season.episodes[state.currentEpisode];
    if (!ep || ep.type !== "finale") return;
    ep.revealed = true;
    if (ep.resurrectionFinale) { renderFinale(ep); return; }
    $$('[data-finale-id]', els.winnerBoard).forEach(card => card.classList.toggle('is-crowned-winner', card.dataset.finaleId === ep.winner));
    els.winnerCrowningMessage.innerHTML = `<strong>${esc(monster(ep.winner).name)}</strong>, you are The World’s Next Drag Supermonster.`;
    els.revealCrownWinnerBtn.hidden = true;
    els.allWinnersFinalStatsBtn.hidden = false;
    attachEpisodeTrackRecord(ep);
  }

  function contestantRankOrder(ids, eps) {
    const finale = eps.find(e => e.type === "finale");
    const eliminatedOrder = state.season.eliminated.slice();
    return ids.slice().sort((a, b) => {
      const aFinal = finale?.activeAtStart?.includes(a), bFinal = finale?.activeAtStart?.includes(b);
      if (a === finale?.winner) return -1;
      if (b === finale?.winner) return 1;
      if (finale?.resurrectionFinale && finale.ranked) return finale.ranked.indexOf(a) - finale.ranked.indexOf(b);
      if (aFinal && bFinal) return (finale.finalScores?.[b]?.total || 0) - (finale.finalScores?.[a]?.total || 0);
      if (aFinal) return -1;
      if (bFinal) return 1;
      const ai = eliminatedOrder.indexOf(a), bi = eliminatedOrder.indexOf(b);
      if (ai !== bi) return bi - ai;
      return monster(a).name.localeCompare(monster(b).name);
    });
  }

  function statNameCell(id, extra = "") {
    if (!id || !monster(id)) return `<span class="stat-contestant-name empty">—</span>`;
    return `<span class="stat-contestant-name ${extra}"><img src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt=""><strong>${esc(monster(id).name)}</strong></span>`;
  }

  function dragulaStatEpisodeLabel(ep) {
    if (!ep) return "";
    if (ep.type === "finale") return "Finale";
    return `EP. ${ep.number || ""}`.trim();
  }

  function dragulaTrackColumnDefinitions(eps) {
    return (eps || []).map((ep) => {
      const isFinale = ep.type === "finale";
      const label = dragulaStatEpisodeLabel(ep);
      const challengeType = isFinale
        ? "Finale"
        : ep.type === "last_supper"
          ? "Last Supper"
          : ep.floorshow
            ? floorShowTypeLabel(floorShowTypeKey(ep.floorshow))
            : ep.type ? String(ep.type).replace(/[_-]+/g, " ").replace(/\b\w/g, ch => ch.toUpperCase()) : "";
      const title = isFinale
        ? "Finale"
        : ep.type === "last_supper"
          ? "Last Supper"
          : ep.floorshow?.name
            ? `${ep.floorshow.name} (${challengeType})`
            : label;
      return { episode: ep, label, title, challengeType, isFinale, isLastSupper: ep.type === "last_supper" };
    });
  }

  function dragulaTrackColumnClass(col) {
    return [
      col?.isFinale ? "finale-col" : "",
      col?.isLastSupper ? "last-supper-col" : ""
    ].filter(Boolean).join(" ");
  }

  function dragulaTrackHeaderHtml(col) {
    return `<span class="track-head-cell"><span class="track-head-episode">${esc(col?.label || "")}</span></span>`;
  }

  function dragulaTrackChallengeHeaderHtml(col) {
    const type = String(col?.challengeType || "").trim();
    return type ? `<span class="track-head-challenge">${esc(type)}</span>` : "";
  }

  function dragulaTrackContestantInline(id) {
    const m = monster(id);
    if (!m) return `<span class="stat-contestant"><span>—</span></span>`;
    return `<span class="stat-contestant"><img src="${esc(m.image || PLACEHOLDER)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(m.name)}"><span>${esc(m.name)}</span></span>`;
  }

  function dragulaTrackTokenParts(status) {
    const raw = String(status || "").replace(/<br\s*\/?\s*>/gi, "+").toUpperCase().trim();
    if (!raw) return [];
    const parts = new Set();
    if (raw.startsWith("RTRN")) parts.add("RTRN");
    if (raw.includes("WINNER")) parts.add("WINNER");
    if (raw === "RU" || raw.includes("RUNNER")) parts.add("RU");
    if (raw.includes("EXT")) parts.add("EXT");
    if (raw.includes("QUIT")) parts.add("QUIT");
    if (raw.includes("DISQ")) parts.add("DISQ");
    const compositeTokens = ["HIGH+BTM", "LOW+BTM", "SAFE+BTM", "HIGH+EXT", "LOW+EXT", "SAFE+EXT"];
    let specialRemoved = raw.replace(/WUE/g, "");
    compositeTokens.forEach(token => {
      if (raw.includes(token)) parts.add(token);
      specialRemoved = specialRemoved.replaceAll(token, "");
    });
    if (raw.includes("WUE")) parts.add("WUE");
    if (raw.includes("LOSS")) parts.add("LOSS");
    if (raw.includes("GUEST") || /^\d+(ND|RD|TH)$/.test(raw)) parts.add("GUEST");
    if (/BTM\d*|\bBTM\b/.test(specialRemoved)) parts.add(specialRemoved.match(/BTM\d+/)?.[0] || "BTM");
    ["WIN", "HIGH", "SAFE", "LOW", "IMM"].forEach((token) => {
      if (new RegExp(`(^|[^A-Z])${token}([^A-Z]|$)`).test(specialRemoved)) parts.add(token);
    });
    return Array.from(parts);
  }

  function dragulaPresentTrackLegendTokens(eps, ids) {
    const present = new Set();
    (eps || []).forEach((ep) => {
      (ids || []).forEach((id) => dragulaTrackTokenParts(ep.track?.[id] || "").forEach((token) => present.add(token)));
      if (ep.curse?.target) present.add("CURSE");
      if (ep.immunity) present.add("IMM");
    });
    return present;
  }

  function episodeSliceThrough(ep) {
    const idx = state.season?.episodes?.indexOf(ep) ?? -1;
    const end = idx >= 0 ? idx + 1 : Math.max(1, (state.currentEpisode || 0) + 1);
    return (state.season?.episodes || []).slice(0, end);
  }

  function cumulativeEliminatedThrough(ep) {
    const order = [];
    episodeSliceThrough(ep).forEach(e => {
      [e.returnedContestant, e.hellboundFinal?.winner].filter(Boolean).forEach(id => {
        const idx = order.indexOf(id);
        if (idx >= 0) order.splice(idx, 1);
      });
      episodeOutgoingIds(e).forEach(id => {
        const idx = order.indexOf(id);
        if (idx >= 0) order.splice(idx, 1);
        order.push(id);
      });
    });
    return order.filter(id => state.season?.contestants?.[id]);
  }

  function isHellboundOnlyTrack(ep, id) {
    const value = String(ep?.track?.[id] || "").toUpperCase();
    const inShowdown = ep?.hellbound?.contestants?.includes(id) || ep?.hellboundFinal?.contestants?.includes(id);
    return !!(inShowdown && ["WIN", "LOSS"].includes(value));
  }

  function episodeTrackStatusOrder(ep, id) {
    if (isHellboundOnlyTrack(ep, id)) return 9;
    const raw = String(ep?.track?.[id] || "").replace(/<br\s*\/?\s*>/gi, "+").toUpperCase().trim();
    if (raw.includes("WINNER")) return 0;
    if (raw === "RU" || raw.includes("RUNNER")) return 1;
    if (raw.includes("EXT") || raw === "QUIT" || raw === "DISQ") return 5;
    if (raw.includes("BTM")) return 4;
    if (raw === "WUE" || raw.includes("WIN")) return 0;
    if (raw.includes("HIGH")) return 1;
    if (raw.includes("LOW")) return 3;
    if (raw.includes("SAFE") || raw.includes("IMM") || raw.startsWith("RTRN") || raw.includes("GUEST")) return 2;
    return 2;
  }

  function episodeTrackRowOrder(ep) {
    const through = episodeSliceThrough(ep);
    const appeared = new Set();
    through.forEach(e => {
      (e.activeAtStart || []).forEach(id => appeared.add(id));
      Object.entries(e.track || {}).forEach(([id, value]) => { if (value) appeared.add(id); });
      if (e.lateEntryContestant) appeared.add(e.lateEntryContestant);
      if (e.returnedContestant) appeared.add(e.returnedContestant);
    });
    const currentIds = uniqueIds(ep?.activeAtStart || []).filter(id => appeared.has(id));
    const currentSorted = currentIds.slice().sort((a, b) => {
      const groupDiff = episodeTrackStatusOrder(ep, a) - episodeTrackStatusOrder(ep, b);
      if (groupDiff) return groupDiff;
      return monster(a).name.localeCompare(monster(b).name);
    });
    const currentSet = new Set(currentSorted);
    const eliminated = cumulativeEliminatedThrough(ep).filter(id => appeared.has(id) && !currentSet.has(id));
    const remaining = Array.from(appeared).filter(id => !currentSet.has(id) && !eliminated.includes(id));
    remaining.sort((a, b) => monster(a).name.localeCompare(monster(b).name));
    return uniqueIds([...currentSorted, ...remaining, ...eliminated]);
  }

  function episodeTrackUnlocked(ep) {
    if (!ep || ep.type === "last_supper") return false;
    if (ep.type === "finale") return !!ep.revealed;
    const showdown = ep.hellboundFinal || ep.hellbound;
    if (showdown) return !!showdown.revealed;
    if (ep.resurrection) return true;
    return !!ep.revealed;
  }

  function trackPpeForEpisodes(id, eps) {
    if (state.config?.format === "resurrection") {
      return (eps || []).reduce((sum, ep) => sum + Number(ep.resurrectionPoints?.[id] || 0), 0);
    }
    const competitive = (eps || []).filter(e =>
      e.activeAtStart?.includes(id) &&
      !["finale", "last_supper"].includes(e.type) &&
      !e.resurrection &&
      !(e.hellbound?.contestants?.includes(id) && ["WIN", "LOSS"].includes(String(e.track?.[id] || "").toUpperCase()))
    ).length || 1;
    let wins = 0;
    let highs = 0;
    let bottoms = 0;
    (eps || []).forEach(e => {
      const val = String(e.track?.[id] || "").toUpperCase();
      if (!val || ["finale", "last_supper"].includes(e.type)) return;
      if (val.includes("WIN") || val === "WUE") wins++;
      if (val.includes("HIGH")) highs++;
      if (val.includes("BTM") || val === "WUE" || val.includes("EXT") || val.includes("LOW") || val.includes("QUIT")) bottoms++;
    });
    return ((wins * 5 + highs * 4 + Math.max(0, competitive - wins - highs - bottoms) * 3 + bottoms * 1) / competitive).toFixed(2);
  }

  function dragulaTrackTableHtml(eps, ids, options = {}) {
    const includePpe = options.includePpe !== false;
    const isResurrection = state.config?.format === "resurrection";
    const columns = dragulaTrackColumnDefinitions(eps);
    const ppeHeader = includePpe ? `<th class="ppe-col">${isResurrection ? "Points" : "PPE"}</th>` : "";
    const ppeSpacer = includePpe ? `<th class="track-head-spacer ppe-col"></th>` : "";
    const episodeHeadRow = `<tr class="track-episode-row"><th class="track-contestant-head" rowspan="2">Contestant</th>${columns.map(col => `<th class="${dragulaTrackColumnClass(col)}" title="${esc(col.title)}">${dragulaTrackHeaderHtml(col)}</th>`).join("")}${ppeHeader}</tr>`;
    const challengeHeadRow = `<tr class="track-challenge-row">${columns.map(col => `<th class="track-challenge-type-head ${dragulaTrackColumnClass(col)}" title="${esc(col.title)}">${dragulaTrackChallengeHeaderHtml(col)}</th>`).join("")}${ppeSpacer}</tr>`;
    const rows = (ids || []).map(id => {
      let out = false;
      const cells = columns.map(col => {
        const e = col.episode;
        const status = e.track?.[id] || "";
        let html = trackCellHtml(status, out, e, id);
        const colClass = dragulaTrackColumnClass(col);
        if (colClass) html = html.replace('class="', `class="${colClass} `);
        if (String(status).includes("EXT") || ["QUIT", "DISQ"].includes(String(status).toUpperCase())) out = true;
        if (e.hellbound?.contestants?.includes(id) && ["WIN", "LOSS"].includes(String(status).toUpperCase())) out = true;
        if (String(status).startsWith("RTRN") || e.returnedContestant === id || e.hellboundFinal?.winner === id) out = false;
        return html.replace("<td ", `<td title="${esc(col.title)}" `);
      }).join("");
      const ppeCell = includePpe ? `<td class="track-cell ppe-cell">${trackPpeForEpisodes(id, eps)}</td>` : "";
      return `<tr><th class="track-contestant">${dragulaTrackContestantInline(id)}</th>${cells}${ppeCell}</tr>`;
    }).join("");
    return `<div class="stat-table-shell"><table class="stats-table modern-stat-table track-table dragula-track"><thead>${episodeHeadRow}${challengeHeadRow}</thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderEpisodeTrackRecord(ep) {
    if (!ep || ep.type === "last_supper") return "";
    if (!episodeTrackUnlocked(ep)) {
      return `<div class="episode-track-card locked"><p>Reveal the final result of this episode to unlock the track record up to this point.</p></div>`;
    }
    const eps = episodeSliceThrough(ep);
    const ids = episodeTrackRowOrder(ep);
    return dragulaTrackTableHtml(eps, ids, { includePpe: true });
  }

  function attachEpisodeTrackRecord(ep) {
    if (!els.episodeTrackRecord) return;
    els.episodeTrackRecord.innerHTML = renderEpisodeTrackRecord(ep);
  }


  function renderStats() {
    if (!state.season) return;
    const eps = state.season.episodes;
    const isResurrection = state.config?.format === "resurrection";
    const hiddenStatTabs = isResurrection ? new Set(["lipsyncs", "records"]) : new Set();
    $$(".stats-tab").forEach(btn => {
      btn.hidden = hiddenStatTabs.has(btn.dataset.tab);
      if (btn.hidden) btn.classList.remove("is-active");
    });
    $$(".stats-panel").forEach(panel => {
      panel.hidden = hiddenStatTabs.has(panel.dataset.tabPanel);
      if (panel.hidden) panel.classList.remove("is-active");
    });
    const activeVisibleTab = $(".stats-tab.is-active:not([hidden])");
    if (!activeVisibleTab) {
      const trackTab = $('.stats-tab[data-tab="track"]');
      const trackPanel = $('.stats-panel[data-tab-panel="track"]');
      trackTab?.classList.add("is-active");
      trackPanel?.classList.add("is-active");
    }
    const ids = contestantRankOrder(Object.keys(state.season.contestants), eps);
    els.trackWrap.innerHTML = dragulaTrackTableHtml(eps, ids, { includePpe: true });
    const legend = [
      ["WIN", "Floorshow winner"], ["HIGH", "Strong critiques"], ["SAFE", "Safe"], ["LOW", "Negative critiques"], ["CURSE", "Cursed"], ["IMM", "Immune"], ["BTM", "Up for extermination"], ["HIGH+BTM", "High but sent to extermination"], ["LOW+BTM", "Low and sent to extermination"], ["SAFE+BTM", "Safe but sent to extermination"], ["HIGH+EXT", "High but exterminated"], ["LOW+EXT", "Low and exterminated"], ["SAFE+EXT", "Safe but exterminated"], ["WUE", "Winner up for extermination"], ["EXT", "Exterminated"], ["QUIT", "Quit"], ["DISQ", "Disqualified"], ["RTRN", "Returned"], ["LOSS", "Hellbound Showdown loss"], ["GUEST", "Last Supper guest"], ["RU", "Runner-up"], ["WINNER", "Season winner"]
    ];
    const presentLegendTokens = dragulaPresentTrackLegendTokens(eps, ids);
    const legendTokenPresent = (token) => {
      if (presentLegendTokens.has(token)) return true;
      if (token === "BTM" && Array.from(presentLegendTokens).some((value) => /^BTM\d+$/.test(value))) return true;
      return false;
    };
    els.trackLegend.innerHTML = legend
      .filter(([token]) => legendTokenPresent(token))
      .map(([token, desc]) => `<span class="legend-key token-${trackClass(token)}"><strong>${esc(token)}</strong> ${esc(desc)}</span>`).join("");

    const bottomCounts = {};
    const exRows = eps.filter(e => e.type === "competitive").map(e => {
      (e.eligibleBottoms || []).forEach(id => bottomCounts[id] = (bottomCounts[id] || 0) + 1);
      const eliminatedIdsThisEpisode = episodeEliminatedIds(e);
      const departed = e.departed && !eliminatedIdsThisEpisode.length ? e.departed : null;
      const wasQuit = e.specialEvent === "bottom_quit" || e.specialEvent === "walk_quit";
      const wasDisq = e.specialEvent === "disqualification";
      const outcomeIds = eliminatedIdsThisEpisode.length ? eliminatedIdsThisEpisode : (departed ? [departed] : []);
      let cls = "exterm-count-none";
      if (outcomeIds.length && wasDisq) cls = "exterm-disq";
      else if (outcomeIds.length && wasQuit) cls = "exterm-quit";
      else if (outcomeIds.length > 1) cls = "exterm-double";
      else if (outcomeIds.length) cls = `exterm-count-${Math.min(5, bottomCounts[outcomeIds[0]] || 1)}`;
      const bottomCells = (e.eligibleBottoms || []).map(id => statNameCell(id, "compact")).join(`<span class="versus-chip">vs.</span>`);
      const extermName = e.extermination?.name || e.extermination || "None";
      const result = outcomeIds.length ? outcomeIds.map(id => statNameCell(id, "compact")).join(`<span class="versus-chip">and</span>`) : `<span class="no-extermination-result">None</span>`;
      return `<tr><td class="episode-num">${esc(e.number)}</td><td>${esc(extermName)}</td><td class="bottom-titans-cell">${bottomCells || "—"}</td><td class="exterminated-cell ${cls}">${result}</td></tr>`;
    }).join("");
    els.lipSyncStatsWrap.innerHTML = `<table class="floor-show-table themed-extermination-table extermination-stats-table"><thead><tr><th>Episode</th><th>Extermination</th><th>Bottom Monsters</th><th>Exterminated</th></tr></thead><tbody>${exRows}</tbody></table>`;

    if (els.floorShowsStatsWrap) {
      const floorRows = eps.filter(e => e.type === "competitive").map(e => `<tr><td class="episode-num">${esc(e.number)}</td><td>${esc(e.floorshow?.name || "—")}</td><td>${esc(floorShowTypeLabel(floorShowTypeKey(e.floorshow)))}</td><td>${(e.winners || [e.winner]).filter(Boolean).map(id => statNameCell(id, "compact")).join("") || "—"}</td></tr>`).join("");
      els.floorShowsStatsWrap.innerHTML = `<table class="floor-show-table themed-extermination-table"><thead><tr><th>Episode</th><th>Floor Show</th><th>Type</th><th>Winner(s)</th></tr></thead><tbody>${floorRows}</tbody></table>`;
    }

    const mostFloorWins = ids.slice().sort((a,b)=>monster(b).stats.wins-monster(a).stats.wins)[0];
    const topScore = (id) => monster(id).stats.wins + monster(id).stats.high;
    const bottomScore = (id) => monster(id).stats.bottom;
    const mostTop = ids.slice().sort((a,b)=>topScore(b)-topScore(a))[0];
    const mostBottom = ids.slice().sort((a,b)=>bottomScore(b)-bottomScore(a))[0];
    const mostExtermWins = ids.slice().sort((a,b)=>(monster(b).stats.extermWins||0)-(monster(a).stats.extermWins||0))[0];
    const recordCard = (label, id, detail) => `<article class="record-card stat-record-card">${id ? `<img src="${esc(monster(id).image)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(monster(id).name)}">` : ""}<div><small>${esc(label)}</small><strong>${id ? esc(monster(id).name) : "—"}</strong>${detail ? `<p>${esc(detail)}</p>` : ""}</div></article>`;
    els.recordsGrid.innerHTML = [
      recordCard("Most Floor Show Wins", mostFloorWins, `${mostFloorWins ? monster(mostFloorWins).stats.wins : 0} wins`),
      recordCard("Most Times in The Top", mostTop, `${mostTop ? topScore(mostTop) : 0} total top placements`),
      recordCard("Most Times in The Bottom", mostBottom, `${mostBottom ? bottomScore(mostBottom) : 0} low/bottom placements`),
      recordCard("Most Extermination Wins", mostExtermWins, `${mostExtermWins ? (monster(mostExtermWins).stats.extermWins || 0) : 0} extermination wins`)
    ].join("");
  }

  function cssColorToHex(value) {
    const probe = document.createElement("span");
    probe.style.color = value;
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color;
    probe.remove();
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return "#2b0a44";
    return `#${[1,2,3].map(i => Number(match[i]).toString(16).padStart(2, "0")).join("")}`;
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

  async function downloadTrackRecordPng() {
    if (!state.season) return;
    if (!els.trackWrap?.querySelector(".track-table")) renderStats();
    const table = els.trackWrap?.querySelector(".track-table");
    if (!table) return;

    const rows = Array.from(table.rows);
    const headerRowCount = table.tHead?.rows?.length || 1;
    const grid = [];
    rows.forEach((row, rowIndex) => {
      grid[rowIndex] = grid[rowIndex] || [];
      let colIndex = 0;
      Array.from(row.cells).forEach((cell) => {
        while (grid[rowIndex][colIndex]) colIndex += 1;
        const rowSpan = Math.max(1, Number(cell.rowSpan || 1));
        const colSpan = Math.max(1, Number(cell.colSpan || 1));
        const origin = { cell, rowSpan, colSpan, originRow: rowIndex, originCol: colIndex, covered: false };
        for (let r = 0; r < rowSpan; r += 1) {
          grid[rowIndex + r] = grid[rowIndex + r] || [];
          for (let c = 0; c < colSpan; c += 1) {
            grid[rowIndex + r][colIndex + c] = r === 0 && c === 0
              ? origin
              : { cell, rowSpan, colSpan, originRow: rowIndex, originCol: colIndex, covered: true };
          }
        }
        colIndex += colSpan;
      });
    });
    const colCount = Math.max(...grid.map((row) => row.length));
    const widths = Array.from({ length: colCount }, (_, index) => {
      const measured = Math.max(...grid.map((row) => {
        const item = row[index];
        if (!item || item.covered || item.originCol !== index) return 0;
        return (item.cell.getBoundingClientRect().width || 0) / Math.max(1, item.colSpan || 1);
      }));
      const isFirst = index === 0;
      const isPpe = index === colCount - 1;
      const isFinale = grid.some((row) => row[index]?.cell?.classList?.contains("finale-col"));
      const isLastSupper = grid.some((row) => row[index]?.cell?.classList?.contains("last-supper-col"));
      if (isFirst) return Math.max(220, Math.ceil(measured));
      if (isFinale) return Math.max(78, Math.ceil(measured));
      if (isLastSupper) return Math.max(64, Math.ceil(measured));
      if (isPpe) return Math.max(58, Math.ceil(measured));
      return Math.max(54, Math.ceil(measured));
    });
    const heights = rows.map((row, index) => {
      const measured = Math.ceil(row.getBoundingClientRect().height || 0);
      if (index === 0) return Math.max(36, measured);
      if (index < headerRowCount) return Math.max(28, measured);
      return Math.max(38, measured);
    });
    const padding = 24;
    const titleHeight = 52;
    const width = widths.reduce((sum, value) => sum + value, 0) + padding * 2;
    const height = heights.reduce((sum, value) => sum + value, 0) + padding * 2 + titleHeight;
    const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.fillStyle = "#fff7fd";
    ctx.fillRect(0, 0, width, height);

    const rowImages = await Promise.all(grid.map((row, rowIndex) => {
      if (rowIndex < headerRowCount) return Promise.resolve(null);
      const img = row[0]?.cell?.querySelector("img");
      return loadImageForCanvas(img?.src || "");
    }));

    ctx.fillStyle = "#250231";
    ctx.font = "900 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${state.config?.seasonName || "Dragula"} Track Record`, width / 2, padding + 16);

    let y = padding + titleHeight;
    grid.forEach((visualRow, rowIndex) => {
      let x = padding;
      visualRow.forEach((item, colIndex) => {
        const w = widths.slice(colIndex, colIndex + Math.max(1, item?.colSpan || 1)).reduce((sum, value) => sum + value, 0) || 54;
        if (!item) {
          x += widths[colIndex] || 54;
          return;
        }
        if (item.covered) {
          if (item.originRow < rowIndex) x += widths[colIndex] || 54;
          return;
        }
        const cell = item.cell;
        const h = heights.slice(rowIndex, rowIndex + Math.max(1, item.rowSpan || 1)).reduce((sum, value) => sum + value, 0) || 38;
        const style = getComputedStyle(cell);
        const isHeaderRow = rowIndex < headerRowCount;
        const isFirstColumn = colIndex === 0;
        const isPpeColumn = colIndex === colCount - 1;
        const isNoCell = cell.classList.contains("no-cell") || cell.classList.contains("after-elim");
        const className = String(cell.className || "");
        let bg = cssColorWithFallback(style.backgroundColor, "#ffffff");
        if (isHeaderRow) bg = rowIndex === 0 ? "#160003" : "#3a0008";
        if (!isHeaderRow && isFirstColumn) bg = "#ffffff";
        if (!isHeaderRow && !isFirstColumn && !isPpeColumn && isNoCell) bg = "#949495";
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = (!isHeaderRow && !isFirstColumn && !isPpeColumn && isNoCell) ? "#949495" : "rgba(18, 18, 22, 0.42)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

        if (!isHeaderRow && !isFirstColumn && !isPpeColumn && !isNoCell) {
          const drawInset = (color, size = 4) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.strokeRect(x + size / 2 + 1, y + size / 2 + 1, w - size - 2, h - size - 2);
            ctx.restore();
          };
          if (/\bcurse-marked\b/.test(className)) drawInset("#ff4fd8", 4);
          if (/\bimmunity-marked\b/.test(className)) drawInset("#8ff6a5", 3);
          if (/\bnon-exterm-bottom\b/.test(className)) drawInset("#ff69b4", 3);
        }

        const rawText = (cell.innerText || cell.textContent || "").replace(/\s+\n/g, "\n").trim();
        const text = rawText || "";
        const image = isFirstColumn && !isHeaderRow ? rowImages[rowIndex] : null;
        const imageSize = Math.min(28, Math.max(22, h - 10));
        let textX = isFirstColumn ? x + 10 : x + w / 2;
        let textMaxWidth = w - (isFirstColumn ? 18 : 8);
        if (image) {
          const imgX = x + 9;
          const imgY = y + (h - imageSize) / 2;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imageSize, imageSize, 7);
          ctx.clip();
          const ratio = Math.max(imageSize / image.width, imageSize / image.height);
          const drawW = image.width * ratio;
          const drawH = image.height * ratio;
          ctx.drawImage(image, imgX + (imageSize - drawW) / 2, imgY + (imageSize - drawH) / 2, drawW, drawH);
          ctx.restore();
          textX = x + imageSize + 18;
          textMaxWidth = w - imageSize - 28;
        }

        const fontSize = isFirstColumn ? 12 : isHeaderRow ? (rowIndex === 0 ? 9 : 8) : 11;
        ctx.font = `${isHeaderRow || isFirstColumn ? 900 : 800} ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = isHeaderRow ? "#fff4f6" : ((!isHeaderRow && isFirstColumn) ? "#111111" : cssColorWithFallback(style.color, "#111111"));
        ctx.textAlign = isFirstColumn ? "left" : "center";
        ctx.textBaseline = "middle";
        const lines = splitTextToFit(ctx, text, textMaxWidth, isFirstColumn ? 2 : (isHeaderRow ? 3 : 3));
        const lineHeight = fontSize + 3;
        const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, i) => ctx.fillText(line, isFirstColumn ? textX : x + w / 2, startY + i * lineHeight));
        x += w;
      });
      y += heights[rowIndex] || 38;
    });

    const safeName = String(state.config?.seasonName || "dragula-simulator").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "dragula-simulator";
    downloadCanvasPng(canvas, `${safeName}-track-record.png`);
  }



  function renderCustomImagePreview(src) {
    if (!els.customImagePreview) return;
    const image = normalizeCustomImageUrl(src);
    els.customImagePreview.dataset.image = image;
    els.customImagePreview.innerHTML = `
      <img class="avatar sqr custom-preview-img" src="${esc(image)}" alt="Custom monster photo preview" onerror="this.src='${PLACEHOLDER}'">
      <span>${image === PLACEHOLDER ? "No image URL set" : "Image preview"}</span>
    `;
  }

  function renderCustomSkillInputs(skills = {}) {
    if (!els.customSkillsStack) return;
    els.customSkillsStack.innerHTML = skillKeys.map(([key, label]) => {
      const value = customSkillDisplayValue(skills[key] ?? 8);
      return `
        <label class="custom-skill-row">
          <span class="custom-skill-label">
            <span>${esc(label)}</span>
            <strong class="range-pill custom-skill-pill" data-custom-skill-pill="${esc(key)}">${value}</strong>
          </span>
          <input class="custom-skill-slider" type="range" min="1" max="15" value="${value}" data-custom-skill="${esc(key)}">
        </label>
      `;
    }).join("");
    $$('[data-custom-skill]', els.customSkillsStack).forEach((input) => {
      input.addEventListener("input", () => {
        const pill = $(`[data-custom-skill-pill="${input.dataset.customSkill}"]`, els.customSkillsStack);
        if (pill) pill.textContent = input.value;
      });
    });
  }

  function randomizeCustomSkillInputs() {
    if (!els.customSkillsStack) return;
    $$('[data-custom-skill]', els.customSkillsStack).forEach((input) => {
      input.value = String(rnd(1, 15));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  function openCustomContestantModal(id = "") {
    const existing = (state.customContestants || []).map(makeCustomContestant).find(item => item.id === id);
    if (!els.customContestantModal) return;
    if (els.customContestantId) els.customContestantId.value = existing?.id || "";
    if (els.customFullName) els.customFullName.value = existing?.fullName || existing?.name || "";
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

  function saveCustomContestantFromForm() {
    const id = els.customContestantId?.value || `custom_${Date.now()}`;
    const fullName = String(els.customFullName?.value || "").trim();
    const nickname = String(els.customNickname?.value || "").trim() || fullName;
    const image = normalizeCustomImageUrl(els.customImageUrl?.value || "");
    if (!fullName) {
      alert("Please enter a monster name.");
      return false;
    }
    const skills = {};
    $$('[data-custom-skill]', els.customSkillsStack).forEach((input) => {
      skills[input.dataset.customSkill] = clamp(Number(input.value), 1, 15);
    });
    const monster = makeCustomContestant({ id, fullName, name: fullName, nickname, image, imageUrl: image, skills, isCustom: true });
    const index = state.customContestants.findIndex(item => item.id === id);
    if (index >= 0) state.customContestants[index] = monster;
    else state.customContestants.push(monster);
    saveCustomContestants();
    refreshRosterAfterCustomChange();
    return true;
  }

  function deleteCustomContestant(id) {
    if (!id) return;
    const item = state.customContestants.find(monster => monster.id === id);
    const name = item ? item.name : "this custom monster";
    if (!confirm(`Delete ${name}? This will also remove them from the selected cast.`)) return;
    state.customContestants = state.customContestants.filter(monster => monster.id !== id);
    state.selected = state.selected.filter(selectedId => selectedId !== id);
    saveCustomContestants();
    closeCustomContestantModal();
    refreshRosterAfterCustomChange();
  }


  function rawSeasonsForShow(raw, show) {
    const target = String(show || "");
    const sources = [raw?.seasonsByShow, raw?.seasonByShow];
    for (const source of sources) {
      if (!source || typeof source !== "object") continue;
      if (source[target] != null) return Array.isArray(source[target]) ? source[target].map(String) : [String(source[target])];
      const matchedKey = Object.keys(source).find(key => String(key) === target);
      if (matchedKey) {
        const value = source[matchedKey];
        return Array.isArray(value) ? value.map(String) : [String(value)];
      }
    }
    const rawShows = showsOf(raw || {});
    if (rawShows.map(String).includes(target)) return seasonsOf(raw || {}).map(String);
    return [];
  }

  function seasonsForShow(item, show) {
    const raw = item?.raw || {};
    const paired = rawSeasonsForShow(raw, show);
    if (paired.length) return paired;
    const itemShows = (item?.shows || [item?.show]).filter(Boolean).map(String);
    if (itemShows.includes(String(show))) return (item?.seasons || [item?.season]).filter(Boolean).map(String);
    return [];
  }

  function contestantMatchesPreset(item, show, season) {
    if (!item || item.isCustom) return false;
    return seasonsForShow(item, show).map(String).includes(String(season));
  }

  function populatePresetModal() {
    if (!els.presetShowSelect || !els.presetSeasonSelect) return;
    const shows = [...new Set(state.roster
      .filter(item => !item.isCustom)
      .flatMap(item => item.shows || [item.show])
      .filter(Boolean)
      .map(String))].sort(showSort);
    els.presetShowSelect.innerHTML = shows.map(show => `<option value="${esc(show)}">${esc(show)}</option>`).join("");
    updatePresetSeasons();
  }

  function updatePresetSeasons() {
    if (!els.presetShowSelect || !els.presetSeasonSelect) return;
    const show = els.presetShowSelect.value;
    const seasons = [...new Set(state.roster
      .filter(item => !item.isCustom)
      .flatMap(item => seasonsForShow(item, show))
      .filter(Boolean)
      .map(String))].sort(seasonSort);
    els.presetSeasonSelect.innerHTML = seasons.map(season => `<option value="${esc(season)}">${esc(season)}</option>`).join("");
  }

  function loadPresetCast() {
    state.config = readConfig();
    const show = els.presetShowSelect?.value;
    const season = els.presetSeasonSelect?.value;
    if (!show || !season) return;
    const cast = state.roster.filter(item => contestantMatchesPreset(item, show, season));
    if (!cast.length) {
      alert("No monsters were found for that pre-set cast.");
      return;
    }
    state.selected = cast.slice(0, state.config.castSize).map(item => item.id);
    clearRelationshipSetup();
    state.season = null;
    filters.shows.clear();
    filters.shows.add(String(show));
    filters.seasons.clear();
    filters.seasons.add(String(season));
    rebuildSeasonDropdown();
    renderRoster();
  }

  function initStatsTabs() {
    $$(".stats-tab").forEach(btn => btn.addEventListener("click", () => {
      $$(".stats-tab").forEach(b => b.classList.toggle("is-active", b === btn));
      $$(".stats-panel").forEach(p => p.classList.toggle("is-active", p.dataset.tabPanel === btn.dataset.tab));
    }));
  }

  function resetAll() { resetAllRelationships(); location.reload(); }

  function initEvents() {
    [els.eliminationFormatSelect, els.premiereTypeSelect, els.castSize, els.finalistSize, els.twistChocolateChoosable, els.twistChocolateRandom, els.twistSonicTransducer, els.twistHellboundShowdown, els.disableChallengeRiggory, els.disableNonElimination].forEach(el => el?.addEventListener("input", () => { if (el === els.castSize) clearRelationshipSetup(); configureUiText(); renderSelected(); }));
    els.searchFilter?.addEventListener("input", renderRoster);
    els.toCastBtn?.addEventListener("click", () => { state.config = readConfig(); showScreen("cast-screen"); renderRoster(); });
    els.backToSetupBtn?.addEventListener("click", () => showScreen("setup-screen"));
    els.toEpisodeBtn?.addEventListener("click", () => {
      state.config = readConfig();
      if (state.config.premiere === "late_entry") showLateEntrySetup();
      else showRelationshipSetup();
    });
    els.backToCastBtnEpisode?.addEventListener("click", () => { resetAllRelationships(); showScreen("cast-screen"); });
    els.backToCastBtnStats?.addEventListener("click", () => { resetAllRelationships(); showScreen("cast-screen"); });
    els.backToEpisodeBtn?.addEventListener("click", () => showScreen("episode-screen"));
    els.toStatsBtn?.addEventListener("click", () => { renderStats(); showScreen("stats-screen"); });
    els.downloadTrackBtn?.addEventListener("click", downloadTrackRecordPng);
    els.randomizeCastBtn?.addEventListener("click", randomizeCast);
    els.randomContestantBtn?.addEventListener("click", () => { const pool = state.filtered.filter(m => !state.selected.includes(m.id)); if (pool.length) toggleSelect(pick(pool).id); });
    els.resetCastBtn?.addEventListener("click", () => { state.selected = []; clearRelationshipSetup(); renderRoster(); });
    els.customContestantBtn?.addEventListener("click", () => openCustomContestantModal());
    els.randomizeCustomSkillsBtn?.addEventListener("click", randomizeCustomSkillInputs);
    els.customImageUrl?.addEventListener("input", () => renderCustomImagePreview(els.customImageUrl.value));
    els.customContestantForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (saveCustomContestantFromForm()) closeCustomContestantModal();
    });
    els.closeCustomContestantModal?.addEventListener("click", closeCustomContestantModal);
    els.cancelCustomContestantBtn?.addEventListener("click", closeCustomContestantModal);
    els.deleteCustomContestantBtn?.addEventListener("click", () => deleteCustomContestant(els.customContestantId?.value));
    [els.resetSetupBtn, els.resetSeasonBtnCast, els.resetSeasonBtnEpisode, els.resetSeasonBtnStats].forEach(btn => btn?.addEventListener("click", resetAll));
    $$(".section-toggle").forEach(btn => btn.addEventListener("click", () => showPanel(btn.dataset.step, true)));
    $$(".proceed-btn").forEach(btn => btn.addEventListener("click", () => showPanel(btn.dataset.next, true)));
    els.revealResultsBtn?.addEventListener("click", revealDeath);
    els.revealHellboundBtn?.addEventListener("click", revealHellboundResults);
    els.nextEpisodeBtn?.addEventListener("click", proceedEpisode);
    $$(".next-episode-btn").forEach(btn => btn.addEventListener("click", proceedEpisode));
    els.revealCrownWinnerBtn?.addEventListener("click", revealWinner);
    els.allWinnersFinalStatsBtn?.addEventListener("click", () => { renderStats(); showScreen("stats-screen"); });
    els.episodeSelect?.addEventListener("change", () => { state.currentEpisode = Number(els.episodeSelect.value); renderEpisode(state.season.episodes[state.currentEpisode]); scrollToEpisodeSection(); });
    els.viewAllSkillsBtn?.addEventListener("click", showSkillKey);
    els.viewRelationshipKeyBtn?.addEventListener("click", () => {
      if (state.selected.length >= 2) showRelationshipSetup(false);
      else showRelationshipKey();
    });
    els.closeSkillModal?.addEventListener("click", () => els.skillModal.close());
    els.closeRelationshipModal?.addEventListener("click", () => els.relationshipModal.close());
    els.presetCastBtn?.addEventListener("click", () => { populatePresetModal(); els.presetCastModal?.showModal?.(); });
    els.presetShowSelect?.addEventListener("change", updatePresetSeasons);
    els.presetCastForm?.addEventListener("submit", (event) => { event.preventDefault(); loadPresetCast(); els.presetCastModal?.close?.(); });
    els.closePresetCastModal?.addEventListener("click", () => els.presetCastModal?.close?.());
    els.cancelPresetCastBtn?.addEventListener("click", () => els.presetCastModal?.close?.());
  }

  function showSkillKey() {
    els.modalContestantName.textContent = "Monster Skill Key";
    els.modalProfile.innerHTML = "These stats drive floorshow scoring, Fright Feats, curses, and extermination survival.";
    els.skillsStack.innerHTML = skillKeys.map(([k, label]) => `<div class="skill-row"><span>${esc(label)}</span><strong>${esc(k)}</strong></div>`).join("");
    els.skillModal.showModal();
  }


  function showLateEntrySetup() {
    state.config = readConfig();
    if (state.selected.length !== state.config.castSize) { alert(`Select exactly ${state.config.castSize} monsters.`); return; }
    const ids = state.selected.slice();
    const overlay = document.createElement("div");
    overlay.className = "relationship-setup-overlay late-entry-setup-overlay";
    const optionHtml = ids.map(id => {
      const item = state.roster.find(m => m.id === id);
      return `<option value="${esc(id)}" ${state.lateEntryId === id ? "selected" : ""}>${esc(item?.name || id)}</option>`;
    }).join("");
    overlay.innerHTML = `
      <div class="relationship-card late-entry-card">
        <div class="modal-head compact-relationship-head">
          <div><p class="eyebrow">Late Entry</p><h3>Choose the Wildcard Monster</h3></div>
          <button class="icon-close late-entry-close" type="button">×</button>
        </div>
        <label class="field late-entry-field">
          <span>Wildcard contestant</span>
          <select id="lateEntrySelect">${optionHtml}</select>
          
        </label>
        <div class="modal-actions relationship-actions-bottom">
          <button class="secondary-btn late-entry-cancel" type="button">Back</button>
          <button class="primary-btn late-entry-confirm" type="button">Continue</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector(".late-entry-close")?.addEventListener("click", close);
    overlay.querySelector(".late-entry-cancel")?.addEventListener("click", close);
    overlay.querySelector(".late-entry-confirm")?.addEventListener("click", () => {
      state.lateEntryId = overlay.querySelector("#lateEntrySelect")?.value || ids[0];
      close();
      showRelationshipSetup(true);
    });
  }

  function showRelationshipSetup(startAfterConfirm = true) {
    state.config = readConfig();
    if (state.selected.length !== state.config.castSize) { alert(`Select exactly ${state.config.castSize} monsters.`); return; }
    const ids = state.selected.slice();
    const avatarCell = (id) => {
      const item = state.roster.find(m => m.id === id);
      return `<span class="relationship-avatar-cell" title="${esc(item?.name || id)}"><img src="${esc(item?.image || PLACEHOLDER)}" onerror="this.src='${PLACEHOLDER}'" alt="${esc(item?.name || id)}"></span>`;
    };
    const getPair = (a, b) => relationshipOption(state.relationshipSetup[pairKey(a, b)] ?? 0);
    const setPair = (a, b, value) => { state.relationshipSetup[pairKey(a, b)] = clamp(Number(value), -10, 10); };
    const overlay = document.createElement("div");
    overlay.className = "relationship-setup-overlay";
    document.body.appendChild(overlay);
    const render = () => {
      overlay.innerHTML = `
        <div class="relationship-card compact-relationship-card">
          <div class="modal-head compact-relationship-head">
            <div><p class="eyebrow">Relationships</p><h3>Set Monster Relationships</h3></div>
            <button class="icon-close relationship-close" type="button">×</button>
          </div>
          <div class="modal-actions relationship-actions-top">
            <button class="secondary-btn relationship-random" type="button">Randomize All</button>
            <button class="secondary-btn relationship-reset" type="button">Reset All</button>
          </div>
          <div class="relationship-grid-wrap compact-relationship-grid-wrap">
            <table class="relationship-grid-table compact-relationship-grid-table">
              <thead><tr><th class="relationship-corner"></th>${ids.map(id => `<th>${avatarCell(id)}</th>`).join("")}</tr></thead>
              <tbody>${ids.map(rowId => `<tr><th>${avatarCell(rowId)}</th>${ids.map(colId => {
                if (rowId === colId) return `<td class="relationship-self compact-relationship-self"></td>`;
                const option = getPair(rowId, colId);
                const numberLabel = option.value > 0 ? `+${option.value}` : String(option.value);
                return `<td><label class="relationship-cell-wrap compact-relationship-cell-wrap" title="${esc((state.roster.find(m => m.id === rowId)?.name || rowId) + " / " + (state.roster.find(m => m.id === colId)?.name || colId) + ": " + numberLabel + " " + option.label)}"><span class="relationship-cell compact-relationship-cell ${esc(option.className)}"><strong>${numberLabel}</strong></span><select class="relationship-cell-select" data-a="${esc(rowId)}" data-b="${esc(colId)}">${relationshipScale.map(item => `<option value="${item.value}" ${item.value === option.value ? "selected" : ""}>${item.value > 0 ? "+" : ""}${item.value} ${esc(item.label)}</option>`).join("")}</select></label></td>`;
              }).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>
          <div class="modal-actions relationship-actions-bottom">
            <button class="secondary-btn relationship-cancel" type="button">${startAfterConfirm ? "Back" : "Close"}</button>
            <button class="primary-btn relationship-confirm" type="button">${startAfterConfirm ? "Start Season" : "Save Relationships"}</button>
          </div>
        </div>`;
      overlay.querySelectorAll(".relationship-cell-select").forEach(select => {
        select.addEventListener("change", () => { setPair(select.dataset.a, select.dataset.b, select.value); render(); });
      });
      overlay.querySelector(".relationship-random")?.addEventListener("click", () => { ids.forEach((a, i) => ids.slice(i + 1).forEach(b => setPair(a, b, randomRelationshipValue()))); render(); });
      overlay.querySelector(".relationship-reset")?.addEventListener("click", () => { ids.forEach((a, i) => ids.slice(i + 1).forEach(b => setPair(a, b, 0))); render(); });
      overlay.querySelector(".relationship-close")?.addEventListener("click", () => overlay.remove());
      overlay.querySelector(".relationship-cancel")?.addEventListener("click", () => overlay.remove());
      overlay.querySelector(".relationship-confirm")?.addEventListener("click", () => {
        overlay.remove();
        if (startAfterConfirm) { if (createSeason()) { showScreen("episode-screen"); showPanel("status"); } }
      });
    };
    render();
  }

  function showRelationshipKey() {
    if (!els.relationshipModal || !els.relationshipsStack) return;
    els.relationshipsStack.innerHTML = relationshipScale.map(item => `<div class="relationship-row"><strong>${item.value > 0 ? "+" : ""}${item.value} ${esc(item.label)}</strong><span>${item.value > 0 ? "Positive relationship" : item.value < 0 ? "Negative relationship" : "Neutral relationship"}</span></div>`).join("");
    els.relationshipModal.showModal();
  }

  function installSourceAccessDeterrents() {
    const blockKey = (event) => {
      const key = String(event.key || "").toLowerCase();
      const blocked = event.key === "F12" || (event.ctrlKey && event.shiftKey && ["i", "j", "c", "k"].includes(key)) || (event.metaKey && event.altKey && ["i", "j", "c", "k"].includes(key)) || ((event.ctrlKey || event.metaKey) && ["u", "s"].includes(key));
      if (!blocked) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    };
    document.addEventListener("keydown", blockKey, true);
    document.addEventListener("contextmenu", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }, true);
  }

  function boot() {
    installSourceAccessDeterrents(); loadCustomContestants(); loadRoster(); initFilters(); configureUiText(); renderRoster(); initEvents(); initStatsTabs();
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
