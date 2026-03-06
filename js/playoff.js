// Модуль для отображения сетки плей-офф (bracket-стиль)

/**
 * Данные плей-офф матчей
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

function getTeamBySeed(standings, seed) {
    if (!seed || seed < 1 || seed > standings.length) return null;
    return standings[seed - 1];
}

function getPlayoffResult(playoffId) {
    var match = PLAYOFF_DATA.matches.find(function(m) { return m.playoff_id === playoffId; });
    return (match && match.result) ? match.result : null;
}

function determineBracketFinalists(standings, bracket) {
    var semi1Id = bracket + '_semi_1';
    var semi2Id = bracket + '_semi_2';

    var semi1 = PLAYOFF_DATA.matches.find(function(m) { return m.playoff_id === semi1Id; });
    var semi2 = PLAYOFF_DATA.matches.find(function(m) { return m.playoff_id === semi2Id; });

    var semi1Result = semi1 ? semi1.result : null;
    var semi2Result = semi2 ? semi2.result : null;

    var team1 = getTeamBySeed(standings, semi1 ? semi1.seed1 : null);
    var team2 = getTeamBySeed(standings, semi1 ? semi1.seed2 : null);
    var team3 = getTeamBySeed(standings, semi2 ? semi2.seed1 : null);
    var team4 = getTeamBySeed(standings, semi2 ? semi2.seed2 : null);

    var finalTeam1 = null, finalTeam2 = null;
    var thirdTeam1 = null, thirdTeam2 = null;

    if (semi1Result) {
        if (semi1Result.sets.home > semi1Result.sets.away) {
            finalTeam1 = team1; thirdTeam1 = team2;
        } else {
            finalTeam1 = team2; thirdTeam1 = team1;
        }
    }

    if (semi2Result) {
        if (semi2Result.sets.home > semi2Result.sets.away) {
            finalTeam2 = team3; thirdTeam2 = team4;
        } else {
            finalTeam2 = team4; thirdTeam2 = team3;
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

    var score1Html = isCompleted ? result.sets.home : '-';
    var score2Html = isCompleted ? result.sets.away : '-';

    var setScoresHtml = '';
    if (isCompleted && result.set_scores && result.set_scores.length > 0) {
        var setItems = result.set_scores.map(function(set) {
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


// ====================================================================
//  ВЕРХНЯЯ СЕТКА — ЗЕРКАЛЬНЫЙ BRACKET (трофей по центру)
//
//  Визуальная структура (7 колонок):
//  [ПФ1] [линии] [Финалист 1] [🏆 + Финал + За 3-е] [Финалист 2] [линии] [ПФ2]
// ====================================================================

/**
 * Создаёт карточку "Финалист" — одна команда (победитель полуфинала)
 */
function createFinalistCard(team, seed, label, side) {
    var teamName = team ? escapeHtml(team.team) : 'Ожидание...';
    var teamClass = 'finalist-card' + (team ? '' : ' tbd') + (' ' + side);
    var safeTeam = team ? escapeAttr(team.team) : '';
    var onclick = team ? ' onclick="showTeamCard(\'' + safeTeam + '\')"' : '';

    return '<div class="' + teamClass + '"' + onclick + '>' +
        '<div class="finalist-label">' + label + '</div>' +
        '<div class="finalist-team">' +
            '<span class="playoff-seed">' + (seed || '?') + '</span>' +
            '<span class="finalist-team-name">' + teamName + '</span>' +
        '</div>' +
        '</div>';
}

function createUpperBracketHtml(standings) {
    var bracket = 'upper';

    var semi1Seeds = [1, 4];
    var semi2Seeds = [2, 3];

    var team1 = getTeamBySeed(standings, semi1Seeds[0]);
    var team2 = getTeamBySeed(standings, semi1Seeds[1]);
    var team3 = getTeamBySeed(standings, semi2Seeds[0]);
    var team4 = getTeamBySeed(standings, semi2Seeds[1]);

    var semi1Result = getPlayoffResult('upper_semi_1');
    var semi2Result = getPlayoffResult('upper_semi_2');
    var finalResult = getPlayoffResult('upper_final');
    var thirdResult = getPlayoffResult('upper_third');

    var finalists = determineBracketFinalists(standings, bracket);

    var finalSeed1 = finalists.finalTeam1 ? (standings.indexOf(finalists.finalTeam1) + 1) : null;
    var finalSeed2 = finalists.finalTeam2 ? (standings.indexOf(finalists.finalTeam2) + 1) : null;
    var thirdSeed1 = finalists.thirdTeam1 ? (standings.indexOf(finalists.thirdTeam1) + 1) : null;
    var thirdSeed2 = finalists.thirdTeam2 ? (standings.indexOf(finalists.thirdTeam2) + 1) : null;

    var champion = null;
    if (finalResult) {
        champion = finalResult.sets.home > finalResult.sets.away
            ? finalists.finalTeam1 : finalists.finalTeam2;
    }

    var trophyClass = 'bracket-trophy' + (champion ? ' has-winner' : '');

    // === HTML ===
    var html = '<div class="playoff-bracket">' +
        '<div class="bracket-header upper">🥇 Верхняя сетка — Борьба за чемпионство (1–4 места)</div>' +
        '<div class="bracket-grid-mirror">';

    // --- Кол. 1: Полуфинал 1 (слева) ---
    html += '<div class="bracket-round bracket-col-semi-left">' +
        '<div class="round-title">Полуфинал 1</div>' +
        '<div class="round-matches">' +
        createPlayoffMatchHtml(team1, team2, semi1Seeds[0], semi1Seeds[1], semi1Result,
            semi1Seeds[0] + '-е vs ' + semi1Seeds[1] + '-е место', '') +
        '</div></div>';

    // --- Кол. 2: Соединитель ПФ1 → Финалист 1 ---
    html += '<div class="bracket-connectors" id="conn-upper-left"></div>';

    // --- Кол. 3: Финалист 1 (победитель ПФ1) ---
    html += '<div class="bracket-round bracket-col-finalist">' +
        '<div class="round-title">В финал</div>' +
        '<div class="round-matches">' +
        createFinalistCard(finalists.finalTeam1, finalSeed1, 'Победитель ПФ1', 'left') +
        '</div></div>';

    // --- Кол. 4: Соединитель Финалист 1 → Трофей ---
    html += '<div class="bracket-connectors" id="conn-upper-trophy-left"></div>';

    // --- Кол. 5: ЦЕНТР — Трофей + Финал + За 3-е ---
    html += '<div class="bracket-trophy-column">';

    // Трофей
    html += '<div class="' + trophyClass + '">🏆</div>';
    if (champion) {
        html += '<div class="trophy-champion-name">' + escapeHtml(champion.team) + '</div>';
    }

    // Финал
    html += '<div class="center-match-section">' +
        '<div class="round-title">Финал — за 1-е место</div>' +
        createPlayoffMatchHtml(finalists.finalTeam1, finalists.finalTeam2, finalSeed1, finalSeed2, finalResult,
            null, 'final-match') +
        '</div>';

    // За 3-е место
    html += '<div class="center-match-section third-place-section">' +
        '<div class="round-title">За 3-е место</div>' +
        createPlayoffMatchHtml(finalists.thirdTeam1, finalists.thirdTeam2, thirdSeed1, thirdSeed2, thirdResult,
            null, 'third-place-match') +
        '</div>';

    html += '</div>'; // bracket-trophy-column

    // --- Кол. 6: Соединитель Трофей → Финалист 2 ---
    html += '<div class="bracket-connectors conn-right" id="conn-upper-trophy-right"></div>';

    // --- Кол. 7: Финалист 2 (победитель ПФ2) ---
    html += '<div class="bracket-round bracket-col-finalist">' +
        '<div class="round-title">В финал</div>' +
        '<div class="round-matches">' +
        createFinalistCard(finalists.finalTeam2, finalSeed2, 'Победитель ПФ2', 'right') +
        '</div></div>';

    // --- Кол. 8: Соединитель Финалист 2 → ПФ2 ---
    html += '<div class="bracket-connectors conn-right" id="conn-upper-right"></div>';

    // --- Кол. 9: Полуфинал 2 (справа) ---
    html += '<div class="bracket-round bracket-col-semi-right">' +
        '<div class="round-title">Полуфинал 2</div>' +
        '<div class="round-matches">' +
        createPlayoffMatchHtml(team3, team4, semi2Seeds[0], semi2Seeds[1], semi2Result,
            semi2Seeds[0] + '-е vs ' + semi2Seeds[1] + '-е место', '') +
        '</div></div>';

    html += '</div>'; // bracket-grid-mirror

    // Призы
    var prizesHtml = '';
    if (finalResult && champion) {
        prizesHtml += '<div class="playoff-prize gold"><span>🥇 Чемпион</span> — <strong>' + escapeHtml(champion.team) + '</strong></div>';
    }
    if (thirdResult) {
        var thirdWinner = thirdResult.sets.home > thirdResult.sets.away ? finalists.thirdTeam1 : finalists.thirdTeam2;
        if (thirdWinner) {
            prizesHtml += '<div class="playoff-prize bronze"><span>🥉 3-е место</span> — <strong>' + escapeHtml(thirdWinner.team) + '</strong></div>';
        }
    }
    if (prizesHtml) {
        html += '<div class="playoff-prizes">' + prizesHtml + '</div>';
    }

    html += '</div>'; // playoff-bracket
    return html;
}


// ====================================================================
//  НИЖНЯЯ СЕТКА — ЛИНЕЙНЫЙ BRACKET (как было)
// ====================================================================

function createLowerBracketHtml(standings) {
    var bracket = 'lower';

    var semi1Seeds = [5, 8];
    var semi2Seeds = [6, 7];

    var team1 = getTeamBySeed(standings, semi1Seeds[0]);
    var team2 = getTeamBySeed(standings, semi1Seeds[1]);
    var team3 = getTeamBySeed(standings, semi2Seeds[0]);
    var team4 = getTeamBySeed(standings, semi2Seeds[1]);

    var semi1Result = getPlayoffResult('lower_semi_1');
    var semi2Result = getPlayoffResult('lower_semi_2');
    var finalResult = getPlayoffResult('lower_final');
    var thirdResult = getPlayoffResult('lower_third');

    var finalists = determineBracketFinalists(standings, bracket);

    var finalSeed1 = finalists.finalTeam1 ? (standings.indexOf(finalists.finalTeam1) + 1) : null;
    var finalSeed2 = finalists.finalTeam2 ? (standings.indexOf(finalists.finalTeam2) + 1) : null;
    var thirdSeed1 = finalists.thirdTeam1 ? (standings.indexOf(finalists.thirdTeam1) + 1) : null;
    var thirdSeed2 = finalists.thirdTeam2 ? (standings.indexOf(finalists.thirdTeam2) + 1) : null;

    var champion = null;
    if (finalResult) {
        champion = finalResult.sets.home > finalResult.sets.away
            ? finalists.finalTeam1 : finalists.finalTeam2;
    }

    var trophyClass = 'bracket-trophy lower-trophy' + (champion ? ' has-winner' : '');

    var html = '<div class="playoff-bracket">' +
        '<div class="bracket-header lower">🔹 Нижняя сетка — 5–8 места</div>' +
        '<div class="bracket-grid">';

    // Полуфиналы
    html += '<div class="bracket-round">' +
        '<div class="round-title">Полуфиналы</div>' +
        '<div class="round-matches">' +
        createPlayoffMatchHtml(team1, team2, semi1Seeds[0], semi1Seeds[1], semi1Result,
            semi1Seeds[0] + '-е vs ' + semi1Seeds[1] + '-е место', '') +
        createPlayoffMatchHtml(team3, team4, semi2Seeds[0], semi2Seeds[1], semi2Result,
            semi2Seeds[0] + '-е vs ' + semi2Seeds[1] + '-е место', '') +
        '</div></div>';

    // Соединители
    html += '<div class="bracket-connectors" id="conn1-lower"></div>';

    // Финалы
    html += '<div class="bracket-round">' +
        '<div class="round-title">Финалы</div>' +
        '<div class="round-matches">' +
        createPlayoffMatchHtml(finalists.finalTeam1, finalists.finalTeam2, finalSeed1, finalSeed2, finalResult,
            'Финал — за 5-е место', 'final-match') +
        createPlayoffMatchHtml(finalists.thirdTeam1, finalists.thirdTeam2, thirdSeed1, thirdSeed2, thirdResult,
            'Матч за 7-е место', 'third-place-match') +
        '</div></div>';

    // Соединитель
    html += '<div class="bracket-connectors" id="conn2-lower"></div>';

    // Трофей
    html += '<div class="bracket-round" style="justify-content: center; align-items: center;">' +
        '<div class="' + trophyClass + '">🏅</div>';

    if (champion) {
        html += '<div class="trophy-champion-name lower">' + escapeHtml(champion.team) + '</div>';
    }

    html += '</div>';
    html += '</div>'; // bracket-grid

    // Призы
    var prizesHtml = '';
    if (finalResult && champion) {
        prizesHtml += '<div class="playoff-prize silver"><span>5-е место</span> — <strong>' + escapeHtml(champion.team) + '</strong></div>';
    }
    if (thirdResult) {
        var thirdWinner = thirdResult.sets.home > thirdResult.sets.away ? finalists.thirdTeam1 : finalists.thirdTeam2;
        if (thirdWinner) {
            prizesHtml += '<div class="playoff-prize bronze"><span>7-е место</span> — <strong>' + escapeHtml(thirdWinner.team) + '</strong></div>';
        }
    }
    if (prizesHtml) {
        html += '<div class="playoff-prizes">' + prizesHtml + '</div>';
    }

    html += '</div>'; // playoff-bracket
    return html;
}


// ====================================================================
//  SVG-СОЕДИНИТЕЛИ
// ====================================================================

function drawUpperBracketConnectors() {
    drawMirrorConnector('conn-upper-left', 'left');
    drawMirrorConnector('conn-upper-right', 'right');
    drawTrophyConnector('conn-upper-trophy-left', 'left');
    drawTrophyConnector('conn-upper-trophy-right', 'right');
}

/**
 * Соединитель: Полуфинал ↔ Финалист
 */
function drawMirrorConnector(containerId, side) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var grid = container.closest('.bracket-grid-mirror');
    if (!grid) return;

    // Находим соответствующие элементы
    var semiEl, finalistEl;
    if (side === 'left') {
        semiEl = grid.querySelector('.bracket-col-semi-left .playoff-match');
        finalistEl = grid.querySelector('.bracket-col-finalist:first-of-type .finalist-card');
        if (!finalistEl) {
            // fallback — ищем первый .bracket-col-finalist
            var finalistCols = grid.querySelectorAll('.bracket-col-finalist');
            finalistEl = finalistCols[0] ? finalistCols[0].querySelector('.finalist-card') : null;
        }
    } else {
        semiEl = grid.querySelector('.bracket-col-semi-right .playoff-match');
        var finalistCols = grid.querySelectorAll('.bracket-col-finalist');
        finalistEl = finalistCols[1] ? finalistCols[1].querySelector('.finalist-card') : null;
    }

    if (!semiEl || !finalistEl) return;

    var connRect = container.getBoundingClientRect();
    if (connRect.width === 0 || connRect.height === 0) return;

    var semiRect = semiEl.getBoundingClientRect();
    var finalistRect = finalistEl.getBoundingClientRect();

    var semiY = (semiRect.top + semiRect.height / 2) - connRect.top;
    var finalistY = (finalistRect.top + finalistRect.height / 2) - connRect.top;

    var w = connRect.width;
    var midX = w / 2;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + connRect.height + '" style="position:absolute;top:0;left:0;">';

    if (side === 'left') {
        svg += '<path d="M 0 ' + semiY + ' L ' + midX + ' ' + semiY + ' L ' + midX + ' ' + finalistY + ' L ' + w + ' ' + finalistY + '" ' +
            'stroke="rgba(0,212,255,0.3)" stroke-width="2" fill="none" />';
    } else {
        svg += '<path d="M ' + w + ' ' + semiY + ' L ' + midX + ' ' + semiY + ' L ' + midX + ' ' + finalistY + ' L 0 ' + finalistY + '" ' +
            'stroke="rgba(0,212,255,0.3)" stroke-width="2" fill="none" />';
    }

    svg += '</svg>';
    container.innerHTML = svg;
}

/**
 * Соединитель: Финалист ↔ Центр (трофей / финал)
 */
function drawTrophyConnector(containerId, side) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var grid = container.closest('.bracket-grid-mirror');
    if (!grid) return;

    // Находим финалиста и финальный матч в центре
    var finalistEl;
    var finalistCols = grid.querySelectorAll('.bracket-col-finalist');
    if (side === 'left') {
        finalistEl = finalistCols[0] ? finalistCols[0].querySelector('.finalist-card') : null;
    } else {
        finalistEl = finalistCols[1] ? finalistCols[1].querySelector('.finalist-card') : null;
    }

    var centerMatch = grid.querySelector('.bracket-trophy-column .center-match-section .playoff-match');

    if (!finalistEl || !centerMatch) return;

    var connRect = container.getBoundingClientRect();
    if (connRect.width === 0 || connRect.height === 0) return;

    var finalistRect = finalistEl.getBoundingClientRect();
    var centerRect = centerMatch.getBoundingClientRect();

    var finalistY = (finalistRect.top + finalistRect.height / 2) - connRect.top;
    var centerY = (centerRect.top + centerRect.height / 2) - connRect.top;

    var w = connRect.width;
    var midX = w / 2;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + connRect.height + '" style="position:absolute;top:0;left:0;">';

    if (side === 'left') {
        svg += '<path d="M 0 ' + finalistY + ' L ' + midX + ' ' + finalistY + ' L ' + midX + ' ' + centerY + ' L ' + w + ' ' + centerY + '" ' +
            'stroke="rgba(0,212,255,0.3)" stroke-width="2" fill="none" />';
    } else {
        svg += '<path d="M ' + w + ' ' + finalistY + ' L ' + midX + ' ' + finalistY + ' L ' + midX + ' ' + centerY + ' L 0 ' + centerY + '" ' +
            'stroke="rgba(0,212,255,0.3)" stroke-width="2" fill="none" />';
    }

    svg += '</svg>';
    container.innerHTML = svg;
}

/**
 * Нижняя сетка — соединители
 */
function drawLowerBracketConnectors() {
    drawLowerConnectorSet1();
    drawLowerConnectorSet2();
}

function drawLowerConnectorSet1() {
    var container = document.getElementById('conn1-lower');
    if (!container) return;

    var grid = container.parentElement;
    if (!grid) return;

    var rounds = grid.querySelectorAll('.bracket-round');
    if (rounds.length < 3) return;

    var semiMatches = rounds[0].querySelectorAll('.playoff-match');
    var finalMatches = rounds[1].querySelectorAll('.playoff-match');

    if (semiMatches.length < 2 || finalMatches.length < 2) return;

    var connRect = container.getBoundingClientRect();
    if (connRect.width === 0 || connRect.height === 0) return;

    var semi1Y = (semiMatches[0].getBoundingClientRect().top + semiMatches[0].getBoundingClientRect().height / 2) - connRect.top;
    var semi2Y = (semiMatches[1].getBoundingClientRect().top + semiMatches[1].getBoundingClientRect().height / 2) - connRect.top;
    var final1Y = (finalMatches[0].getBoundingClientRect().top + finalMatches[0].getBoundingClientRect().height / 2) - connRect.top;
    var final2Y = (finalMatches[1].getBoundingClientRect().top + finalMatches[1].getBoundingClientRect().height / 2) - connRect.top;

    var w = connRect.width;
    var midX = w / 2;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + connRect.height + '" style="position:absolute;top:0;left:0;">';

    svg += '<path d="M 0 ' + semi1Y + ' L ' + midX + ' ' + semi1Y + ' L ' + midX + ' ' + final1Y + ' L ' + w + ' ' + final1Y + '" stroke="rgba(0,212,255,0.25)" stroke-width="2" fill="none" />';
    svg += '<path d="M 0 ' + semi2Y + ' L ' + midX + ' ' + semi2Y + ' L ' + midX + ' ' + final1Y + '" stroke="rgba(0,212,255,0.25)" stroke-width="2" fill="none" />';
    svg += '<path d="M ' + midX + ' ' + semi1Y + ' L ' + (midX + 5) + ' ' + semi1Y + ' L ' + (midX + 5) + ' ' + final2Y + ' L ' + w + ' ' + final2Y + '" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" fill="none" stroke-dasharray="4,4" />';
    svg += '<path d="M ' + midX + ' ' + semi2Y + ' L ' + (midX + 5) + ' ' + semi2Y + ' L ' + (midX + 5) + ' ' + final2Y + '" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" fill="none" stroke-dasharray="4,4" />';

    svg += '</svg>';
    container.innerHTML = svg;
}

function drawLowerConnectorSet2() {
    var container = document.getElementById('conn2-lower');
    if (!container) return;

    var grid = container.parentElement;
    if (!grid) return;

    var rounds = grid.querySelectorAll('.bracket-round');
    if (rounds.length < 3) return;

    var finalMatches = rounds[1].querySelectorAll('.playoff-match');
    var trophy = rounds[2].querySelector('.bracket-trophy');

    if (!finalMatches.length || !trophy) return;

    var connRect = container.getBoundingClientRect();
    if (connRect.width === 0 || connRect.height === 0) return;

    var final1Y = (finalMatches[0].getBoundingClientRect().top + finalMatches[0].getBoundingClientRect().height / 2) - connRect.top;
    var trophyY = (trophy.getBoundingClientRect().top + trophy.getBoundingClientRect().height / 2) - connRect.top;

    var w = connRect.width;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + connRect.height + '" style="position:absolute;top:0;left:0;">';
    svg += '<path d="M 0 ' + final1Y + ' L ' + (w / 2) + ' ' + final1Y + ' L ' + (w / 2) + ' ' + trophyY + ' L ' + w + ' ' + trophyY + '" stroke="rgba(0,212,255,0.25)" stroke-width="2" fill="none" />';
    svg += '</svg>';
    container.innerHTML = svg;
}


// ====================================================================
//  ГЛАВНАЯ ФУНКЦИЯ
// ====================================================================

function showPlayoff() {
    var standings = currentStandings || refreshStandings();

    var totalPlayedMatches = MATCH_RESULTS.results.filter(function(m) { return m.played; }).length;
    var totalMatches = MATCH_RESULTS.results.length;

    var html = '<div class="playoff-container">' +
        '<div class="playoff-title">⚔️ Плей-офф</div>';

    if (totalPlayedMatches < totalMatches) {
        html += '<div class="playoff-subtitle">' +
            'Сетка формируется по итогам регулярного сезона. Сыграно ' + totalPlayedMatches + ' из ' + totalMatches + ' матчей.' +
            '</div>';
    } else {
        html += '<div class="playoff-subtitle">' +
            'Регулярный сезон завершён. Пары определены по итоговой таблице.' +
            '</div>';
    }

    // Верхняя сетка — зеркальная (трофей по центру)
    html += createUpperBracketHtml(standings);

    // Нижняя сетка — линейная
    html += createLowerBracketHtml(standings);

    // Пояснение
    html += '<div class="playoff-info-box">' +
        '<p><strong>Верхняя сетка</strong> — команды с 1 по 4 место таблицы. Полуфинал: 1-е vs 4-е, 2-е vs 3-е. Победители играют за чемпионство.</p>' +
        '<p><strong>Нижняя сетка</strong> — команды с 5 по 8 место. Полуфинал: 5-е vs 8-е, 6-е vs 7-е.</p>' +
        '<p>Проигравшие полуфиналов играют за 3-е (7-е) место.</p>' +
        '</div>';

    html += '</div>';

    document.getElementById('scheduleContainer').innerHTML = html;

    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            drawUpperBracketConnectors();
            drawLowerBracketConnectors();
        });
    });
}

// Перерисовка линий при ресайзе
var _playoffResizeTimer = null;
window.addEventListener('resize', function() {
    if (currentViewMode !== 'playoff') return;
    clearTimeout(_playoffResizeTimer);
    _playoffResizeTimer = setTimeout(function() {
        drawUpperBracketConnectors();
        drawLowerBracketConnectors();
    }, 150);
});
