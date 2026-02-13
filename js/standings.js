// Функции для работы с турнирной таблицей

// Список команд
const TEAMS = [
    "Макиато",
    "Серволюкс",
    "Могилевгражданпроект",
    "Могилевгипрозем",
    "Отцы и дети",
    "33",
    "Сетка 37",
    "Dream team"
];

// Инициализация пустой таблицы команд
function initializeStandings() {
    return TEAMS.map(team => ({
        team: team,
        played: 0,          // Сыграно матчей
        won: 0,             // Победы
        lost: 0,            // Поражения
        sets_won: 0,        // Выиграно партий
        sets_lost: 0,       // Проиграно партий
        sets_diff: 0,       // Разница партий
        points_won: 0,      // Выиграно очков в партиях
        points_lost: 0,     // Проиграно очков в партиях
        points_diff: 0,     // Разница очков в партиях
        tournament_points: 0 // Турнирные очки
    }));
}

// Обновление таблицы на основе результатов
function calculateStandings() {
    const standings = initializeStandings();

    // Обработка всех сыгранных матчей
    MATCH_RESULTS.results.forEach(match => {
        if (!match.played) return;

        const homeTeam = standings.find(t => t.team === match.home);
        const awayTeam = standings.find(t => t.team === match.away);

        if (!homeTeam || !awayTeam) return;

        // Обновление количества сыгранных матчей
        homeTeam.played++;
        awayTeam.played++;

        // Обновление побед/поражений
        if (match.sets.home > match.sets.away) {
            homeTeam.won++;
            awayTeam.lost++;
        } else {
            homeTeam.lost++;
            awayTeam.won++;
        }

        // Обновление статистики по партиям
        homeTeam.sets_won += match.sets.home;
        homeTeam.sets_lost += match.sets.away;
        awayTeam.sets_won += match.sets.away;
        awayTeam.sets_lost += match.sets.home;

        // Обновление очков в партиях
        match.set_scores.forEach(set => {
            homeTeam.points_won += set.home;
            homeTeam.points_lost += set.away;
            awayTeam.points_won += set.away;
            awayTeam.points_lost += set.home;
        });

        // Обновление турнирных очков
        homeTeam.tournament_points += match.points.home;
        awayTeam.tournament_points += match.points.away;
    });

    // Расчет разницы
    standings.forEach(team => {
        team.sets_diff = team.sets_won - team.sets_lost;
        team.points_diff = team.points_won - team.points_lost;
    });

    // Сортировка таблицы
    return sortStandings(standings);
}

// Сортировка турнирной таблицы по правилам
function sortStandings(standings) {
    return standings.sort((a, b) => {
        // 1. По турнирным очкам (главный критерий)
        if (b.tournament_points !== a.tournament_points) {
            return b.tournament_points - a.tournament_points;
        }

        // 2. По количеству побед
        if (b.won !== a.won) {
            return b.won - a.won;
        }

        // 3. По разнице партий
        if (b.sets_diff !== a.sets_diff) {
            return b.sets_diff - a.sets_diff;
        }

        // 4. По количеству выигранных партий
        if (b.sets_won !== a.sets_won) {
            return b.sets_won - a.sets_won;
        }

        // 5. По разнице очков в партиях
        if (b.points_diff !== a.points_diff) {
            return b.points_diff - a.points_diff;
        }

        // 6. По количеству выигранных очков в партиях
        return b.points_won - a.points_won;
    });
}

// Глобальная переменная для хранения текущей таблицы
let currentStandings = null;

// Функция для обновления таблицы
function refreshStandings() {
    currentStandings = calculateStandings();
    return currentStandings;
}

