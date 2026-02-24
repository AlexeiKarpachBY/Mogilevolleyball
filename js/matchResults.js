// Данные результатов матчей волейбольной лиги
const MATCH_RESULTS = {
    "tournament": "Волейбольный турнир 2026",
    "scoring_system": {
        "description": "Система подсчета очков",
        "rules": {
            "win_3_0": { "winner": 3, "loser": 0, "description": "Победа 3-0 → 3 очка" },
            "win_2_1": { "winner": 2, "loser": 1, "description": "Победа 2-1 → 2 очка" },
            "loss_1_2": { "winner": 2, "loser": 1, "description": "Поражение 1-2 → 1 очко" },
            "loss_0_3": { "winner": 3, "loser": 0, "description": "Поражение 0-3 → 0 очков" }
        }
    },
    "match_format": {
        "total_sets": 3,
        "points_per_set": 25,
        "min_advantage": 2,
        "description": "Всегда играется 3 партии"
    },
    "results": [
        // Тур 1
        {"match_id": 1, "gameweek": 1, "home": "Макиато", "away": "Dream team", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 2, "gameweek": 1, "home": "Серволюкс", "away": "Сетка 37", "played": true, "sets": {"home": 2, "away": 1}, "set_scores": [{ "home": 25, "away": 16 },{ "home": 13, "away": 25 },{ "home": 25, "away": 23 }], "points": {"home": 2, "away": 1}},
        {"match_id": 3, "gameweek": 1, "home": "Могилевгражданпроект", "away": "Отцы и дети", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 4, "gameweek": 1, "home": "Могилевгипрозем", "away": "33", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 2
        {"match_id": 5, "gameweek": 2, "home": "Dream team", "away": "Серволюкс", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 6, "gameweek": 2, "home": "Сетка 37", "away": "Могилевгражданпроект", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 7, "gameweek": 2, "home": "Отцы и дети", "away": "Могилевгипрозем", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 8, "gameweek": 2, "home": "33", "away": "Макиато", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 3
        {"match_id": 9, "gameweek": 3, "home": "Макиато", "away": "Сетка 37", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 10, "gameweek": 3, "home": "Серволюкс", "away": "Отцы и дети", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 11, "gameweek": 3, "home": "Могилевгражданпроект", "away": "33", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 12, "gameweek": 3, "home": "Могилевгипрозем", "away": "Dream team", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 4
        {"match_id": 13, "gameweek": 4, "home": "Dream team", "away": "Могилевгражданпроект", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 14, "gameweek": 4, "home": "Сетка 37", "away": "Могилевгипрозем", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 15, "gameweek": 4, "home": "Отцы и дети", "away": "Макиато", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 16, "gameweek": 4, "home": "33", "away": "Серволюкс", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 5
        {"match_id": 17, "gameweek": 5, "home": "Макиато", "away": "Могилевгражданпроект", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 18, "gameweek": 5, "home": "Серволюкс", "away": "Могилевгипрозем", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 19, "gameweek": 5, "home": "Dream team", "away": "33", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 20, "gameweek": 5, "home": "Сетка 37", "away": "Отцы и дети", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 6
        {"match_id": 21, "gameweek": 6, "home": "Могилевгражданпроект", "away": "Серволюкс", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 22, "gameweek": 6, "home": "Могилевгипрозем", "away": "Макиато", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 23, "gameweek": 6, "home": "33", "away": "Сетка 37", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 24, "gameweek": 6, "home": "Отцы и дети", "away": "Dream team", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 7
        {"match_id": 25, "gameweek": 7, "home": "Макиато", "away": "Серволюкс", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 26, "gameweek": 7, "home": "Dream team", "away": "Сетка 37", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 27, "gameweek": 7, "home": "33", "away": "Отцы и дети", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 28, "gameweek": 7, "home": "Могилевгипрозем", "away": "Могилевгражданпроект", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 8
        {"match_id": 29, "gameweek": 8, "home": "Dream team", "away": "Макиато", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 30, "gameweek": 8, "home": "Сетка 37", "away": "Серволюкс", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 31, "gameweek": 8, "home": "Отцы и дети", "away": "Могилевгражданпроект", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 32, "gameweek": 8, "home": "33", "away": "Могилевгипрозем", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 9
        {"match_id": 33, "gameweek": 9, "home": "Серволюкс", "away": "Dream team", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 34, "gameweek": 9, "home": "Могилевгражданпроект", "away": "Сетка 37", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 35, "gameweek": 9, "home": "Могилевгипрозем", "away": "Отцы и дети", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 36, "gameweek": 9, "home": "Макиато", "away": "33", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 10
        {"match_id": 37, "gameweek": 10, "home": "Сетка 37", "away": "Макиато", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 38, "gameweek": 10, "home": "Отцы и дети", "away": "Серволюкс", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 39, "gameweek": 10, "home": "33", "away": "Могилевгражданпроект", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 40, "gameweek": 10, "home": "Dream team", "away": "Могилевгипрозем", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 11
        {"match_id": 41, "gameweek": 11, "home": "Могилевгражданпроект", "away": "Макиато", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 42, "gameweek": 11, "home": "Могилевгипрозем", "away": "Серволюкс", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 43, "gameweek": 11, "home": "33", "away": "Dream team", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 44, "gameweek": 11, "home": "Отцы и дети", "away": "Сетка 37", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 12
        {"match_id": 45, "gameweek": 12, "home": "Серволюкс", "away": "Могилевгражданпроект", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 46, "gameweek": 12, "home": "Макиато", "away": "Могилевгипрозем", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 47, "gameweek": 12, "home": "Сетка 37", "away": "33", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 48, "gameweek": 12, "home": "Dream team", "away": "Отцы и дети", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 13
        {"match_id": 49, "gameweek": 13, "home": "Серволюкс", "away": "Макиато", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 50, "gameweek": 13, "home": "Сетка 37", "away": "Dream team", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 51, "gameweek": 13, "home": "Отцы и дети", "away": "33", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 52, "gameweek": 13, "home": "Могилевгражданпроект", "away": "Могилевгипрозем", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},

        // Тур 14
        {"match_id": 53, "gameweek": 14, "home": "Макиато", "away": "Отцы и дети", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 54, "gameweek": 14, "home": "Могилевгипрозем", "away": "Сетка 37", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 55, "gameweek": 14, "home": "Серволюкс", "away": "33", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}},
        {"match_id": 56, "gameweek": 14, "home": "Могилевгражданпроект", "away": "Dream team", "played": false, "sets": {"home": null, "away": null}, "set_scores": [], "points": {"home": null, "away": null}}
    ]
};

// Функция для расчета очков на основе счета по партиям
function calculateMatchPoints(homeSets, awaySets) {
    // Победа 3-0
    if (homeSets === 3 && awaySets === 0) {
        return { home: 3, away: 0 };
    }
    // Победа 2-1
    else if (homeSets === 2 && awaySets === 1) {
        return { home: 2, away: 1 };
    }
    // Поражение 1-2
    else if (homeSets === 1 && awaySets === 2) {
        return { home: 1, away: 2 };
    }
    // Поражение 0-3
    else if (homeSets === 0 && awaySets === 3) {
        return { home: 0, away: 3 };
    }
    return { home: 0, away: 0 };
}

// Функция для обновления результата матча
function updateMatchResult(matchId, homeSets, awaySets, setScores) {
    const match = MATCH_RESULTS.results.find(m => m.match_id === matchId);
    if (!match) return null;

    match.played = true;
    match.sets = { home: homeSets, away: awaySets };
    match.set_scores = setScores || [];
    match.points = calculateMatchPoints(homeSets, awaySets);

    return match;
}

