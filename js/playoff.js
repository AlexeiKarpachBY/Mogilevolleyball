// Модуль для отображения сетки плей-офф

/**
 * Данные плей-офф матчей
 * playoff_id — уникальный идентификатор плей-офф матча
 * bracket — 'upper' (за чемпионство, 1-4 места) или 'lower' (5-8 места)
 * round — 'semi' (полуфинал), 'final' (финал), 'third' (за 3-е место)
 * seed1/seed2 — позиция в таблице регулярки
 * result — null если не сыгран, объект с результатом если сыгран
 */
var PLAYOFF_DATA = {
    matches: [
        // Верхняя сетка (за чемпионство)
        { playoff_id: 'upper_semi_1', bracket: 'upper', round: 'semi', seed1: 1, seed2: 4, result: null },
        { playoff_id: 'upper_semi_2', bracket: 'upper', round: 'semi', seed1: 2, seed2: 3, result: null },
        { playoff_id: 'upper_final', bracket: 'upper', round: 'final', seed1: null, seed2: null, result: null },
        { playoff_id: 'upper_third', bracket: 'upper', round: 'third', seed1: null, seed2: null, result: null },

        // Нижняя сетка (5-8 места)
        { playoff_id: 'lower_semi_1', bracket: 'lower', round: 'semi', seed1: 5, seed2: 8, result: null },
        { playoff_id: 'lower_semi_2', bracket: 'lower', round: 'semi', seed1: 6, seed2: 7, result: null },
        { playoff_id: 'lower_final', bracket: 'lower', round: 'final', seed1: null, seed2: null, result: null },
        { playoff_id: 'lower_third', bracket: 'lower', round: 'third', seed1: null, seed2: null, result: null }
    ]
};

/**
 * Получить команду по позиции в таблице
 * @param {Array} standings — отсортированная таблица
 * @param {number} seed — позиция (1-8)
 * @returns {object|null}
 */
function getTeamBySeed(standings, seed) {
    if (!seed || seed < 1 || seed > standings.length) return null;
    return standings[seed - 1];
}

/**
 * Получить результат плей-офф матча
 * @param {string} playoffId
 * @returns {object|null}
 */
function getPlayoffResult(playoffId) {
    var match = PLAYOFF_DATA.matches.find(function(m) { return m.playoff_id === playoffId; });
    return (match && match.result) ? match.result : null;
}

/**
 * Определить участников финала/матча за 3 место на основе полуфиналов
 * @param {Array} standings
 * @param {string} bracket — 'upper' или 'lower'
 * @returns {object} — { finalTeam1, finalTeam2, thirdTeam1, thirdTeam2 }
 */
function determineBracketFinalists(standings, bracket) {
    var semi1Id = bracket + '_semi_1';
    var semi2Id = bracket + '_semi_2';

    var semi1 = PLAYOFF_DATA.matches.find(function(m) { return m.playoff_id === semi1Id; });
    var semi2 = PLAYOFF_DATA.matches.find(function(m) { return m.playoff_id === semi2Id; });

    var semi1Result = semi1 ? semi1.result : null;
    var semi2Result = semi2 ? semi2.result : null;

    var team1Seed1 = semi1 ? semi1.seed1 : null;
    var team1Seed2 = semi1 ? semi1.seed2 : null;
    var team2Seed1 = semi2 ? semi2.seed1 : null;
    var team2Seed2 = semi2 ? semi2.seed2 : null;

    var team1 = getTeamBySeed(standings, team1Seed1);
    var team2 = getTeamBySeed(standings, team1Seed2);
    var team3 = getTeamBySeed(standings, team2Seed1);
    var team4 = getTeamBySeed(standings, team2Seed2);

    var finalTeam1 = null; // Победитель полуфинала 1
    var finalTeam2 = null; // Победитель полуфинала 2
    var thirdTeam1 = null; // Проигравший полуфинала 1
    var thirdTeam2 = null; // Проигравший полуфинала 2

    if (semi1Result) {
        if (semi1Result.sets.home > semi1Result.sets.away) {
            finalTeam1 = team1;
            thirdTeam1 = team2;
        } else {
            finalTeam1 = team2;
            thirdTeam1 = team1;
        }
    }

    if (semi2Result) {
        if (semi2Result.sets.home > semi2Result.sets.away) {
            finalTeam2 = team3;
            thirdTeam2 = team4;
        } else {
            finalTeam2 = team4;
            thirdTeam2 = team3;
        }
    }

    return {
        finalTeam1: finalTeam1,
        finalTeam2: finalTeam2,
        thirdTeam1: thirdTeam1,
        thirdTeam2: thirdTeam2
    };
}

/**
 * Генерация HTML одного матча плей-офф
 */
function createPlayoffMatchHtml(team1, team2, seed1, seed2, result, matchLabel, extraClass) {
    var isCompleted = !!result;
    var team1Won = isCompleted && result.sets.home > result.sets.away;
    var team2Won = isCompleted && result.sets.away > result.sets.home;

    var team1Name = team1 ? escapeHtml(team1.team) : 'Ожидание...';
    var team2Name = team2 ? escapeHtml(team2.team) : 'Ожидание...';

    var team1Class = 'playoff-team' + (team1 ? '' : ' tbd') + (team1Won ? ' winner' : '') + (isCompleted && !team1Won ? ' loser' : '');
    var team2Class = 'playoff-team' + (team2 ? '' : ' tbd') + (team2Won ? ' winner' : '') + (isCompleted && !team2Won ? ' loser' : '');

    var matchClass = 'playoff-match' + (isCompleted ? ' match-completed' : '') + (extraClass ? ' ' + extraClass : '');

    var safeTeam1 = team1 ? escapeAttr(team1.team) : '';
    var safeTeam2 = team2 ? escapeAttr(team2.team) : '';

    var team1Onclick = team1 ? ' onclick="showTeamCard(\'' + safeTeam1 + '\')"' : '';
    var team2Onclick = team2 ? ' onclick="showTeamCard(\'' + safeTeam2 + '\')"' : '';

    var labelHtml = matchLabel ? '<div class="playoff-match-label">' + matchLabel + '</div>' : '';

    // Счёт по сетам
    var score1Html = isCompleted ? result.sets.home : '-';
    var score2Html = isCompleted ? result.sets.away : '-';

    // Счёт по партиям
    var setScoresHtml = '';
    if (isCompleted && result.set_scores && result.set_scores.length > 0) {
        var setItems = result.set_scores.map(function(set, i) {
            var setHomeWon = set.home > set.away;
            var homeClass = setHomeWon ? 'pss-winner' : 'pss-loser';
            var awayClass = setHomeWon ? 'pss-loser' : 'pss-winner';
            return '<span class="playoff-set-score">' +
                '<span class="' + homeClass + '">' + set.home + '</span>' +
                ':' +
                '<span class="' + awayClass + '">' + set.away + '</span>' +
                '</span>';
        }).join('');
        setScoresHtml = '<div class="playoff-set-scores">' + setItems + '</div>';
    }

    return '<div class="' + matchClass + '">' +
        labelHtml +
        '<div class="' + team1Class + '"' + team1Onclick + '>' +
            '<div class="playoff-team-info">' +
                '<span class="playoff-seed">' + (seed1 || '?') + '</span>' +
                '<span class="playoff-team-name">' + team1Name + '</span>' +
            '</div>' +
            '<span class="playoff-team-score">' + score1Html + '</span>' +
        '</div>' +
        '<div class="' + team2Class + '"' + team2Onclick + '>' +
            '<div class="playoff-team-info">' +
                '<span class="playoff-seed">' + (seed2 || '?') + '</span>' +
                '<span class="playoff-team-name">' + team2Name + '</span>' +
            '</div>' +
            '<span class="playoff-team-score">' + score2Html + '</span>' +
        '</div>' +
        setScoresHtml +
        '</div>';
}

/**
 * Генерирует HTML для одной сетки (верхней или нижней)
 */
function createBracketHtml(standings, bracket) {
    var isUpper = bracket === 'upper';
    var headerText = isUpper
        ? '🥇 Верхняя сетка — Борьба за чемпионство (1–4 места)'
        : '🔹 Нижняя сетка — 5–8 места';
    var headerClass = isUpper ? 'upper' : 'lower';

    var semi1Id = bracket + '_semi_1';
    var semi2Id = bracket + '_semi_2';
    var finalId = bracket + '_final';
    var thirdId = bracket + '_third';

    var semi1Match = PLAYOFF_DATA.matches.find(function(m) { return m.playoff_id === semi1Id; });
    var semi2Match = PLAYOFF_DATA.matches.find(function(m) { return m.playoff_id === semi2Id; });

    var semi1Seeds = isUpper ? [1, 4] : [5, 8];
    var semi2Seeds = isUpper ? [2, 3] : [6, 7];

    var team1 = getTeamBySeed(standings, semi1Seeds[0]);
    var team2 = getTeamBySeed(standings, semi1Seeds[1]);
    var team3 = getTeamBySeed(standings, semi2Seeds[0]);
    var team4 = getTeamBySeed(standings, semi2Seeds[1]);

    var semi1Result = semi1Match ? semi1Match.result : null;
    var semi2Result = semi2Match ? semi2Match.result : null;

    var finalists = determineBracketFinalists(standings, bracket);
    var finalResult = getPlayoffResult(finalId);
    var thirdResult = getPlayoffResult(thirdId);

    // Определяем seed для финалистов
    var finalSeed1 = null;
    var finalSeed2 = null;
    var thirdSeed1 = null;
    var thirdSeed2 = null;

    if (finalists.finalTeam1) {
        finalSeed1 = standings.indexOf(finalists.finalTeam1) + 1;
    }
    if (finalists.finalTeam2) {
        finalSeed2 = standings.indexOf(finalists.finalTeam2) + 1;
    }
    if (finalists.thirdTeam1) {
        thirdSeed1 = standings.indexOf(finalists.thirdTeam1) + 1;
    }
    if (finalists.thirdTeam2) {
        thirdSeed2 = standings.indexOf(finalists.thirdTeam2) + 1;
    }

    var prizeLabels = isUpper
        ? { finalLabel: 'Финал — за 1-е место', thirdLabel: 'Матч за 3-е место', finalPrize: '🥇 Чемпион', thirdPrize: '🥉 3-е место' }
        : { finalLabel: 'Финал — за 5-е место', thirdLabel: 'Матч за 7-е место', finalPrize: '5-е место', thirdPrize: '7-е место' };

    var html = '<div class="playoff-bracket">' +
        '<div class="bracket-header ' + headerClass + '">' + headerText + '</div>' +
        '<div class="bracket-rounds">';

    // --- Раунд 1: Полуфиналы ---
    html += '<div class="bracket-round">' +
        '<div class="round-title">Полуфиналы</div>' +
        '<div class="round-matches">' +
        createPlayoffMatchHtml(team1, team2, semi1Seeds[0], semi1Seeds[1], semi1Result,
            semi1Seeds[0] + ' место vs ' + semi1Seeds[1] + ' место', '') +
        createPlayoffMatchHtml(team3, team4, semi2Seeds[0], semi2Seeds[1], semi2Result,
            semi2Seeds[0] + ' место vs ' + semi2Seeds[1] + ' место', '') +
        '</div></div>';

    // --- Соединитель ---
    html += '<div class="bracket-connector">➜</div>';

    // --- Раунд 2: Финал + за 3 место ---
    html += '<div class="bracket-round">' +
        '<div class="round-title">Финалы</div>' +
        '<div class="round-matches">' +
        createPlayoffMatchHtml(finalists.finalTeam1, finalists.finalTeam2, finalSeed1, finalSeed2, finalResult,
            prizeLabels.finalLabel, 'final-match') +
        createPlayoffMatchHtml(finalists.thirdTeam1, finalists.thirdTeam2, thirdSeed1, thirdSeed2, thirdResult,
            prizeLabels.thirdLabel, 'third-place-match') +
        '</div></div>';

    html += '</div>'; // bracket-rounds

    // --- Призовые блоки (если финалы сыграны) ---
    if (finalResult) {
        var champion = finalResult.sets.home > finalResult.sets.away
            ? finalists.finalTeam1 : finalists.finalTeam2;
        if (champion) {
            html += '<div class="playoff-prize gold">' +
                '<span>' + prizeLabels.finalPrize + '</span> — ' +
                '<strong>' + escapeHtml(champion.team) + '</strong>' +
                '</div>';
        }
    }

    if (thirdResult) {
        var thirdWinner = thirdResult.sets.home > thirdResult.sets.away
            ? finalists.thirdTeam1 : finalists.thirdTeam2;
        if (thirdWinner) {
            var prizeClass = isUpper ? 'bronze' : 'silver';
            html += '<div class="playoff-prize ' + prizeClass + '">' +
                '<span>' + prizeLabels.thirdPrize + '</span> — ' +
                '<strong>' + escapeHtml(thirdWinner.team) + '</strong>' +
                '</div>';
        }
    }

    html += '</div>'; // playoff-bracket

    return html;
}

/**
 * Главная функция отображения плей-офф
 */
function showPlayoff() {
    var standings = currentStandings || refreshStandings();

    var totalPlayedMatches = MATCH_RESULTS.results.filter(function(m) { return m.played; }).length;
    var totalMatches = MATCH_RESULTS.results.length;

    var html = '<div class="playoff-container">' +
        '<div class="playoff-title">⚔️ Плей-офф</div>';

    // Информация о статусе
    if (totalPlayedMatches < totalMatches) {
        html += '<div class="playoff-subtitle">' +
            'Сетка формируется по итогам регулярного сезона. Сыграно ' + totalPlayedMatches + ' из ' + totalMatches + ' матчей.' +
            '</div>';
    } else {
        html += '<div class="playoff-subtitle">' +
            'Регулярный сезон завершён. Пары определены по итоговой таблице.' +
            '</div>';
    }

    // Верхняя сетка (1-4)
    html += createBracketHtml(standings, 'upper');

    // Нижняя сетка (5-8)
    html += createBracketHtml(standings, 'lower');

    // Пояснение
    html += '<div class="playoff-info-box">' +
        '<p><strong>Верхняя сетка</strong> — команды с 1 по 4 место таблицы. Полуфинал: 1-е vs 4-е, 2-е vs 3-е. Победители играют за чемпионство.</p>' +
        '<p><strong>Нижняя сетка</strong> — команды с 5 по 8 место. Полуфинал: 5-е vs 8-е, 6-е vs 7-е.</p>' +
        '<p>Проигравшие полуфиналов играют за 3-е (7-е) место.</p>' +
        '</div>';

    html += '</div>';

    document.getElementById('scheduleContainer').innerHTML = html;
}
