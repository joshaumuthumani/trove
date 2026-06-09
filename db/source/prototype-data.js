/* Trove — seed data + platform vocabulary.
   Plain JS (no JSX). Exposes window.TROVE_DATA. */
(function () {
  // ---- Platform vocabulary (from the brief) -------------------------------
  // Each platform carries a tiny brand-ish dot color so chips stay scannable
  // without going loud. Hues are muted on purpose.
  const PLATFORMS = {
    // Movies — digital lockers
    "Apple TV":          { kind: "digital", dot: "#9b9ba3" },
    "Movies Anywhere": { kind: "digital", dot: "#4f7df0" },
    "Amazon Video":    { kind: "digital", dot: "#3aa0c2" },
    "Fandango at Home":            { kind: "digital", dot: "#5b8def" },
    "YouTube":         { kind: "digital", dot: "#d65a5a" },
    // Movies — physical
    "Blu-Ray":         { kind: "physical", dot: "#6f7bf0" },
    "Ultra HD Blu-ray":{ kind: "physical", dot: "#4aa3d6" },
    "DVD":             { kind: "physical", dot: "#8a8a93" },
    // TV
    "Xbox Video":      { kind: "tv", dot: "#3aa07a" },
    // Games service
    "PlayStation":     { kind: "service", dot: "#4f7df0" },
    "Xbox":            { kind: "service", dot: "#3aa07a" },
    "Steam":           { kind: "service", dot: "#5a8fd6" },
    "Epic":            { kind: "service", dot: "#9aa0a6" },
  };

  const GAME_SERVICES = ["PlayStation", "Xbox", "Steam", "Epic"];

  const MOVIE_DIGITAL = ["Apple TV","Movies Anywhere","Amazon Video","Fandango at Home","YouTube"];
  const MOVIE_PHYSICAL = ["Ultra HD Blu-ray","Blu-Ray","DVD"];
  const TV_PLATFORMS = ["Apple TV","Amazon Video","Xbox Video"];

  // ---- Helpers to keep the data terse -------------------------------------
  let _mid = 100;
  const M = (title, year, digital, physical, opts) => Object.assign(
    { id: ++_mid, tmdb_id: 27000 + _mid, title, year,
      digital: digital || [], physical: physical || [], needs_review: 0 },
    opts || {}
  );

  // ---- MOVIES -------------------------------------------------------------
  const movies = [
    M("Blade Runner 2049", 2017, ["Apple TV","Movies Anywhere","Amazon Video"], ["Ultra HD Blu-ray","Blu-Ray"]),
    M("Dune", 2021, ["Movies Anywhere","Fandango at Home"], ["Ultra HD Blu-ray","Blu-Ray"]),
    M("Dune: Part Two", 2024, ["Apple TV","Movies Anywhere"], ["Ultra HD Blu-ray"]),
    M("The Batman", 2022, ["Movies Anywhere","Amazon Video"], ["Ultra HD Blu-ray","Blu-Ray","DVD"]),
    M("Everything Everywhere All at Once", 2022, ["Apple TV","Fandango at Home"], ["Blu-Ray"]),
    M("Oppenheimer", 2023, ["Movies Anywhere","Apple TV","Amazon Video"], ["Ultra HD Blu-ray","Blu-Ray"]),
    M("Parasite", 2019, ["Apple TV"], ["Blu-Ray"]),
    M("Mad Max: Fury Road", 2015, ["Movies Anywhere","Amazon Video","Fandango at Home"], ["Blu-Ray","DVD"]),
    M("Arrival", 2016, ["Apple TV","Movies Anywhere"], ["Blu-Ray"]),
    M("Interstellar", 2014, ["Movies Anywhere","Amazon Video"], ["Blu-Ray","DVD"]),
    M("Inception", 2010, ["Apple TV","Movies Anywhere"], ["Blu-Ray"]),
    M("The Grand Budapest Hotel", 2014, ["Apple TV","Amazon Video"], ["Blu-Ray"]),
    M("Whiplash", 2014, ["Fandango at Home"], ["Blu-Ray"]),
    M("La La Land", 2016, ["Apple TV","Movies Anywhere"], ["Blu-Ray","DVD"]),
    M("Get Out", 2017, ["Movies Anywhere"], ["Blu-Ray"]),
    M("Knives Out", 2019, ["Amazon Video","Fandango at Home"], ["Blu-Ray"]),
    M("Sicario", 2015, ["Apple TV"], ["Blu-Ray"]),
    M("Drive", 2011, ["YouTube","Amazon Video"], ["Blu-Ray","DVD"]),
    M("No Country for Old Men", 2007, ["Apple TV","Movies Anywhere"], ["DVD"]),
    M("There Will Be Blood", 2007, ["Amazon Video"], ["Blu-Ray"]),
    M("The Social Network", 2010, ["Movies Anywhere","Apple TV"], ["Blu-Ray"]),
    M("Gone Girl", 2014, ["Apple TV","Amazon Video"], ["Blu-Ray"]),
    M("Prisoners", 2013, ["Fandango at Home"], ["DVD"]),
    M("Nightcrawler", 2014, ["Amazon Video"], ["Blu-Ray"]),
    M("Ex Machina", 2014, ["Apple TV","Movies Anywhere"], ["Blu-Ray"]),
    M("Annihilation", 2018, ["Fandango at Home","Amazon Video"], []),
    M("The Lighthouse", 2019, ["Apple TV"], ["Blu-Ray"]),
    M("Hereditary", 2018, ["Amazon Video"], ["Blu-Ray"]),
    M("Midsommar", 2019, ["Fandango at Home"], ["Blu-Ray"]),
    M("Moonlight", 2016, ["Apple TV","Movies Anywhere"], ["Blu-Ray"]),
    M("Her", 2013, ["Amazon Video","Apple TV"], ["DVD"]),
    M("The Master", 2012, ["YouTube"], ["Blu-Ray"]),
    M("Phantom Thread", 2017, ["Apple TV"], ["Blu-Ray"]),
    M("Roma", 2018, [], [], { needs_review: 1 }),
    M("Spider-Man: Into the Spider-Verse", 2018, ["Movies Anywhere","Fandango at Home"], ["Blu-Ray","DVD"]),
    M("Spider-Man: Across the Spider-Verse", 2023, ["Movies Anywhere","Apple TV"], ["Blu-Ray"]),
    M("The Dark Knight", 2008, ["Movies Anywhere","Amazon Video","Apple TV"], ["Blu-Ray","DVD"]),
    M("Heat", 1995, ["Apple TV"], ["Blu-Ray"]),
    M("Casino Royale", 2006, ["Amazon Video"], ["Blu-Ray","DVD"]),
    M("Skyfall", 2012, ["Movies Anywhere","Fandango at Home"], ["Blu-Ray"]),
    M("John Wick", 2014, ["Apple TV","Fandango at Home"], ["Blu-Ray"]),
    M("John Wick: Chapter 4", 2023, ["Movies Anywhere","Amazon Video"], ["Ultra HD Blu-ray"]),
    M("Top Gun: Maverick", 2022, ["Movies Anywhere","Apple TV","Fandango at Home"], ["Ultra HD Blu-ray","Blu-Ray"]),
    M("1917", 2019, ["Amazon Video"], ["Blu-Ray","DVD"]),
    M("Tenet", 2020, ["Movies Anywhere","Apple TV"], ["Ultra HD Blu-ray","Blu-Ray"]),
    M("The Northman", 2022, ["Fandango at Home"], ["Ultra HD Blu-ray","Blu-Ray"]),
    M("Nope", 2022, ["Movies Anywhere"], ["Blu-Ray"]),
    M("Past Lives", 2023, [], [], { needs_review: 1 }),
    M("The Holdovers", 2023, ["Apple TV","Amazon Video"], []),
    M("Poor Things", 2023, ["Movies Anywhere"], ["Ultra HD Blu-ray","Blu-Ray"]),
    M("Anatomy of a Fall", 2023, [], [], { needs_review: 1 }),
    M("Aftersun", 2022, ["YouTube"], []),
    M("Children of Men", 2006, ["Apple TV","Amazon Video"], ["DVD"]),
    M("Memento", 2000, ["YouTube"], ["DVD"]),
    M("Zodiac", 2007, ["Movies Anywhere","Apple TV"], ["Blu-Ray"]),
    M("The Departed", 2006, ["Amazon Video"], ["Blu-Ray","DVD"]),
  ];

  // ---- TV -----------------------------------------------------------------
  let _tid = 200;
  // season builder: s(num, episodeCount, ownedOn?, episodes?)
  const S = (season, episode_count, owned_on, episodes) => ({
    season, episode_count, owned_on: owned_on || [], episodes: episodes || (owned_on ? "all" : "unowned"),
  });
  const T = (series, year, seasons, opts) => Object.assign(
    { id: ++_tid, tmdb_id: 60000 + _tid, series, year, seasons }, opts || {}
  );

  const tv = [
    T("Severance", 2022, [ S(1,9,["Apple TV","Amazon Video"]), S(2,10,["Apple TV"]) ]),
    T("The Bear", 2022, [ S(1,8,["Apple TV"]), S(2,10,["Apple TV","Amazon Video"]), S(3,10,["Amazon Video"]) ]),
    T("Succession", 2018, [ S(1,10,["Apple TV"]), S(2,10,["Apple TV"]), S(3,9,["Apple TV"]), S(4,10,["Amazon Video"]) ]),
    T("Breaking Bad", 2008, [ S(1,7,["Apple TV"]), S(2,13,["Apple TV"]), S(3,13,["Apple TV"]), S(4,13,["Apple TV"]), S(5,16,["Apple TV"]) ]),
    T("Better Call Saul", 2015, [ S(1,10,["Amazon Video"]), S(2,10,["Amazon Video"]), S(3,10,["Amazon Video"]), S(4,10), S(5,10), S(6,13) ], { note: "owned, source unspecified on later seasons" }),
    T("The Last of Us", 2023, [ S(1,9,["Apple TV"]) ]),
    T("Chernobyl", 2019, [ S(1,5,["Apple TV"]) ]),
    T("Fargo", 2014, [ S(1,10,["Amazon Video"]), S(2,10,["Amazon Video"]), S(3,10), S(4,11,["Amazon Video"], [1,2,3,4,5]) ]),
    T("True Detective", 2014, [ S(1,8,["Apple TV"]), S(2,8), S(3,8,["Amazon Video"]), S(4,6,["Xbox Video"]) ]),
    T("Mr. Robot", 2015, [ S(1,10,["Amazon Video"]), S(2,12,["Amazon Video"]), S(3,10), S(4,13,["Amazon Video"]) ]),
    T("Dark", 2017, [ S(1,10), S(2,8), S(3,8) ]),
    T("Andor", 2022, [ S(1,12,["Apple TV"]) ]),
    T("The Expanse", 2015, [ S(1,10,["Amazon Video"]), S(2,13,["Amazon Video"]), S(3,13,["Amazon Video"]), S(4,10,["Amazon Video"]), S(5,10,["Amazon Video"]), S(6,6,["Amazon Video"]) ]),
    T("Atlanta", 2016, [ S(1,10,["Apple TV"]), S(2,11,["Apple TV"]), S(3,10), S(4,10) ]),
    T("Barry", 2018, [ S(1,8,["Apple TV"]), S(2,8,["Apple TV"]), S(3,8), S(4,8) ]),
    T("Fleabag", 2016, [ S(1,6,["Amazon Video"]), S(2,6,["Amazon Video"]) ]),
    T("The Leftovers", 2014, [ S(1,10,["Apple TV"]), S(2,10,["Apple TV"]), S(3,8,["Apple TV"]) ]),
    T("Halt and Catch Fire", 2014, [ S(1,10), S(2,10), S(3,10,["Amazon Video"], [1,2,3,9,10]), S(4,10) ]),
    T("Twin Peaks", 1990, [ S(1,8,["Apple TV"]), S(2,22,["Apple TV"]) ]),
    T("Watchmen", 2019, [ S(1,9,["Apple TV"]) ]),
    T("Patriot", 2015, [ S(1,10,["Amazon Video"]), S(2,8,["Amazon Video"]) ]),
    T("Devs", 2020, [ S(1,8,["Xbox Video"]) ]),
    T("Shogun", 2024, [ S(1,10,["Apple TV"]) ]),
    T("Ripley", 2024, [ S(1,8) ], { note: "owned, source unspecified" }),
    T("Slow Horses", 2022, [ S(1,6,["Apple TV"]), S(2,6,["Apple TV","Amazon Video"]), S(3,6,["Apple TV"]), S(4,6) ]),
    T("The Wire", 2002, [ S(1,13,["Amazon Video"]), S(2,12,["Amazon Video"]), S(3,12,["Amazon Video"]), S(4,13,["Amazon Video"]), S(5,10,["Amazon Video"]) ]),
  ];

  // ---- GAMES --------------------------------------------------------------
  // A game can be owned on several platforms at once, each with its own format
  // (e.g. Digital on PlayStation + Disc on Xbox). Steam is digital-only.
  let _gid = 300;
  const G = (title, year, ...entries) => ({
    id: ++_gid, rawg_id: 3000 + _gid, title, year,
    platforms: entries.map(([service, format]) => ({ service, format: (service === "Steam" || service === "Epic") ? "Digital" : format })),
    needs_tagging: entries.length === 0 ? 1 : 0,
  });

  const games = [
    G("Elden Ring", 2022, ["PlayStation", "Disc"], ["Steam", "Digital"]),
    G("The Last of Us Part II", 2020, ["PlayStation", "Disc"]),
    G("God of War Ragnarök", 2022, ["PlayStation", "Digital"], ["Steam", "Digital"]),
    G("Bloodborne", 2015, ["PlayStation", "Disc"]),
    G("Returnal", 2021, ["PlayStation", "Digital"], ["Steam", "Digital"]),
    G("Horizon Forbidden West", 2022, ["PlayStation", "Disc"], ["Steam", "Digital"]),
    G("Ghost of Tsushima", 2020, ["PlayStation", "Digital"]),
    G("Demon's Souls", 2020, ["PlayStation", "Disc"]),
    G("Spider-Man 2", 2023, ["PlayStation", "Digital"]),
    G("Death Stranding", 2019, ["PlayStation", "Disc"], ["Steam", "Digital"]),
    G("Red Dead Redemption 2", 2018, ["PlayStation", "Digital"], ["Xbox", "Disc"], ["Steam", "Digital"]),
    G("Halo Infinite", 2021, ["Xbox", "Digital"], ["Steam", "Digital"]),
    G("Forza Horizon 5", 2021, ["Xbox", "Disc"]),
    G("Starfield", 2023, ["Xbox", "Digital"], ["Steam", "Digital"]),
    G("Gears 5", 2019, ["Xbox", "Disc"]),
    G("Sea of Thieves", 2018, ["Xbox", "Digital"], ["Steam", "Digital"]),
    G("Hellblade II: Senua's Saga", 2024, ["Xbox", "Digital"]),
    G("Hi-Fi Rush", 2023, ["Xbox", "Digital"], ["Steam", "Digital"]),
    G("Hades", 2020, ["Steam", "Digital"], ["PlayStation", "Digital"]),
    G("Hollow Knight", 2017, ["Steam", "Digital"], ["Xbox", "Digital"]),
    G("Alan Wake 2", 2023, ["Epic", "Digital"], ["PlayStation", "Digital"]),
    G("Rocket League", 2015, ["Epic", "Digital"], ["Steam", "Digital"]),
    G("Disco Elysium", 2019, ["Steam", "Digital"]),
    G("Baldur's Gate 3", 2023, ["PlayStation", "Disc"], ["Steam", "Digital"]),
    G("Cyberpunk 2077", 2020, ["Xbox", "Disc"], ["Steam", "Digital"], ["Epic", "Digital"]),
    G("The Witcher 3: Wild Hunt", 2015, ["Xbox", "Disc"], ["PlayStation", "Digital"], ["Steam", "Digital"]),
    // Untagged / needs-tagging seed items (39 in real data — a few here)
    G("Sekiro: Shadows Die Twice", 2019),
    G("Control", 2019, ["Epic", "Digital"], ["PlayStation", "Digital"]),
    G("Inside", 2016),
    G("Outer Wilds", 2019),
    G("Tunic", 2022),
    G("Stray", 2022),
  ];

  window.TROVE_DATA = {
    PLATFORMS, MOVIE_DIGITAL, MOVIE_PHYSICAL, TV_PLATFORMS, GAME_SERVICES,
    movies, tv, games,
  };
})();
