// Модуль для отображения детальной карточки команды

/**
 * Получить статистику команды
 */
function getTeamStats(teamName) {
    // Используем кэшированную таблицу или пересчитываем если нужно
    var standings = currentStandings || refreshStandings();
    var standing = null;
    for (var i = 0; i < standings.length; i++) {
        if (standings[i].team === teamName) {
            standing = standings[i];
            break;
        }
    }
    if (!standing) return null;

    var teamMatches = [];

    // Собираем все матчи команды
    MATCH_RESULTS.results.forEach(function(match) {
        if (match.home === teamName || match.away === teamName) {
            teamMatches.push({
                match_id: match.match_id,
                gameweek: match.gameweek,
                home: match.home,
                away: match.away,
                played: match.played,
                sets: match.sets,
                set_scores: match.set_scores,
                points: match.points,
                isHome: match.home === teamName,
                opponent: match.home === teamName ? match.away : match.home
            });
        }
    });

    // Разделяем на домашние и выездные
    var homeMatches = teamMatches.filter(function(m) { return m.isHome; });
    var awayMatches = teamMatches.filter(function(m) { return !m.isHome; });

    // Расчет побед/поражений
    var wins = teamMatches.filter(function(m) {
        return m.played && (
            (m.isHome && m.sets.home > m.sets.away) ||
            (!m.isHome && m.sets.away > m.sets.home)
        );
    }).length;

    var losses = teamMatches.filter(function(m) {
        return m.played && (
            (m.isHome && m.sets.home < m.sets.away) ||
            (!m.isHome && m.sets.away < m.sets.home)
        );
    }).length;

    var winRate = standing.played > 0 ? Math.round((wins / standing.played) * 100) : 0;

    // Статистика по рейтингам
    var playedHomeMatches = homeMatches.filter(function(m) { return m.played; });
    var avgPointsHome = playedHomeMatches.length > 0 ?
        (playedHomeMatches.reduce(function(sum, m) {
            return sum + m.set_scores.reduce(function(s, ss) { return s + ss.home; }, 0);
        }, 0) / playedHomeMatches.length).toFixed(1) : 0;

    var playedAwayMatches = awayMatches.filter(function(m) { return m.played; });
    var avgPointsAway = playedAwayMatches.length > 0 ?
        (playedAwayMatches.reduce(function(sum, m) {
            return sum + m.set_scores.reduce(function(s, ss) { return s + ss.away; }, 0);
        }, 0) / playedAwayMatches.length).toFixed(1) : 0;

    // Статистика дома vs в гостях
    var homeStats = {
        played: playedHomeMatches.length,
        won: playedHomeMatches.filter(function(m) { return m.sets.home > m.sets.away; }).length,
        lost: playedHomeMatches.filter(function(m) { return m.sets.home < m.sets.away; }).length,
        sets: {
            won: playedHomeMatches.reduce(function(sum, m) { return sum + m.sets.home; }, 0),
            lost: playedHomeMatches.reduce(function(sum, m) { return sum + m.sets.away; }, 0)
        },
        points: playedHomeMatches.reduce(function(sum, m) { return sum + m.points.home; }, 0)
    };

    var awayStats = {
        played: playedAwayMatches.length,
        won: playedAwayMatches.filter(function(m) { return m.sets.away > m.sets.home; }).length,
        lost: playedAwayMatches.filter(function(m) { return m.sets.away < m.sets.home; }).length,
        sets: {
            won: playedAwayMatches.reduce(function(sum, m) { return sum + m.sets.away; }, 0),
            lost: playedAwayMatches.reduce(function(sum, m) { return sum + m.sets.home; }, 0)
        },
        points: playedAwayMatches.reduce(function(sum, m) { return sum + m.points.away; }, 0)
    };

    // Топ противники
    var opponentStats = {};
    teamMatches.forEach(function(m) {
        if (!opponentStats[m.opponent]) {
            opponentStats[m.opponent] = { played: 0, won: 0, lost: 0, points: 0 };
        }
        opponentStats[m.opponent].played++;
        if (m.played) {
            var isWin = (m.isHome && m.sets.home > m.sets.away) ||
                        (!m.isHome && m.sets.away > m.sets.home);
            if (isWin) opponentStats[m.opponent].won++;
            else opponentStats[m.opponent].lost++;
            opponentStats[m.opponent].points += m.isHome ? m.points.home : m.points.away;
        }
    });

    return {
        standing: standing,
        teamMatches: teamMatches.sort(function(a, b) { return a.match_id - b.match_id; }),
        wins: wins,
        losses: losses,
        winRate: winRate,
        homeStats: homeStats,
        awayStats: awayStats,
        avgPointsHome: avgPointsHome,
        avgPointsAway: avgPointsAway,
        opponentStats: opponentStats
    };
}

/**
 * Создать карточку команды с полной статистикой
 */
function createTeamCardHTML(teamName) {
    var stats = getTeamStats(teamName);
    if (!stats) {
        return '<div class="no-matches">Команда не найдена</div>';
    }

    var standing = stats.standing;
    var teamMatches = stats.teamMatches;
    var wins = stats.wins;
    var losses = stats.losses;
    var winRate = stats.winRate;
    var homeStats = stats.homeStats;
    var awayStats = stats.awayStats;
    var opponentStats = stats.opponentStats;

    var playedMatches = teamMatches.filter(function(m) { return m.played; });
    var upcomingMatches = teamMatches.filter(function(m) { return !m.played; }).slice(0, 3);

    var safeTeamName = escapeHtml(teamName);

    var html = '<div class="team-card-container">' +
        '<!-- Заголовок команды -->' +
        '<div class="team-card-header">' +
            '<div class="team-card-title">' +
                '<span class="team-icon">🏐</span>' +
                '<h2>' + safeTeamName + '</h2>' +
            '</div>' +
            '<button class="close-card-btn" onclick="returnToCurrentMode()">✕</button>' +
        '</div>' +

        '<!-- Основная статистика -->' +
        '<div class="team-stats-main">' +
            '<div class="stat-box stat-large">' +
                '<div class="stat-value">' + standing.tournament_points + '</div>' +
                '<div class="stat-label">Турнирные очки</div>' +
            '</div>' +
            '<div class="stat-box">' +
                '<div class="stat-value">' + standing.played + '</div>' +
                '<div class="stat-label">Сыгр. матчей</div>' +
            '</div>' +
            '<div class="stat-box">' +
                '<div class="stat-value" style="color: #4ade80;">' + wins + '</div>' +
                '<div class="stat-label">Побед</div>' +
            '</div>' +
            '<div class="stat-box">' +
                '<div class="stat-value" style="color: #ef4444;">' + losses + '</div>' +
                '<div class="stat-label">Поражений</div>' +
            '</div>' +
            '<div class="stat-box">' +
                '<div class="stat-value">' + winRate + '%</div>' +
                '<div class="stat-label">% побед</div>' +
            '</div>' +
        '</div>' +

        '<!-- Статистика партий -->' +
        '<div class="team-card-section">' +
            '<h3>📊 Статистика партий</h3>' +
            '<div class="stats-grid">' +
                '<div class="stat-box">' +
                    '<div class="stat-value">' + standing.sets_won + '–' + standing.sets_lost + '</div>' +
                    '<div class="stat-label">Партии (выиг–проиг)</div>' +
                '</div>' +
                '<div class="stat-box">' +
                    '<div class="stat-value" style="color: #f59e0b;">' + (standing.sets_diff > 0 ? '+' : '') + standing.sets_diff + '</div>' +
                    '<div class="stat-label">Разница партий</div>' +
                '</div>' +
                '<div class="stat-box">' +
                    '<div class="stat-value">' + standing.points_won + '–' + standing.points_lost + '</div>' +
                    '<div class="stat-label">Очки в партиях</div>' +
                '</div>' +
                '<div class="stat-box">' +
                    '<div class="stat-value" style="color: #06b6d4;">' + (standing.points_diff > 0 ? '+' : '') + standing.points_diff + '</div>' +
                    '<div class="stat-label">Разница очков</div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<!-- Дома vs В гостях -->' +
        '<div class="team-card-section">' +
            '<h3>🏠 Дома vs В гостях</h3>' +
            '<div class="home-away-compare">' +
                '<div class="compare-box home">' +
                    '<div class="compare-label">ДОМА</div>' +
                    '<div class="compare-stat">' +
                        '<span class="compare-number">' + homeStats.played + '</span>' +
                        '<span class="compare-text">матчей</span>' +
                    '</div>' +
                    '<div class="compare-stat">' +
                        '<span class="compare-number" style="color: #4ade80;">' + homeStats.won + '</span>' +
                        '<span class="compare-text">побед</span>' +
                    '</div>' +
                    '<div class="compare-stat">' +
                        '<span class="compare-number">' + homeStats.sets.won + '–' + homeStats.sets.lost + '</span>' +
                        '<span class="compare-text">партии</span>' +
                    '</div>' +
                    '<div class="compare-stat">' +
                        '<span class="compare-number" style="color: #ff9900;">' + homeStats.points + '</span>' +
                        '<span class="compare-text">очков</span>' +
                    '</div>' +
                '</div>' +

                '<div class="compare-box away">' +
                    '<div class="compare-label">В ГОСТЯХ</div>' +
                    '<div class="compare-stat">' +
                        '<span class="compare-number">' + awayStats.played + '</span>' +
                        '<span class="compare-text">матчей</span>' +
                    '</div>' +
                    '<div class="compare-stat">' +
                        '<span class="compare-number" style="color: #4ade80;">' + awayStats.won + '</span>' +
                        '<span class="compare-text">побед</span>' +
                    '</div>' +
                    '<div class="compare-stat">' +
                        '<span class="compare-number">' + awayStats.sets.won + '–' + awayStats.sets.lost + '</span>' +
                        '<span class="compare-text">партии</span>' +
                    '</div>' +
                    '<div class="compare-stat">' +
                        '<span class="compare-number" style="color: #ff9900;">' + awayStats.points + '</span>' +
                        '<span class="compare-text">очков</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<!-- История матчей -->' +
        '<div class="team-card-section">' +
            '<h3>📅 История матчей</h3>' +
            '<div class="matches-history">';

    playedMatches.forEach(function(match) {
        var isWin = (match.isHome && match.sets.home > match.sets.away) ||
                    (!match.isHome && match.sets.away > match.sets.home);
        var resultColor = isWin ? '#4ade80' : '#ef4444';
        var teamScore = match.isHome ? match.sets.home : match.sets.away;
        var opponentScore = match.isHome ? match.sets.away : match.sets.home;
        var teamPoints = match.isHome ? match.points.home : match.points.away;

        html += '<div class="match-history-item">' +
            '<div class="match-history-opponent">' + escapeHtml(match.opponent) + '</div>' +
            '<div class="match-history-result" style="color: ' + resultColor + ';">' +
                '<span class="history-score">' + teamScore + '–' + opponentScore + '</span>' +
                '<span class="history-location">' + (match.isHome ? 'ДОМА' : 'ГОСТИ') + '</span>' +
            '</div>' +
            '<div class="match-history-points">' + teamPoints + ' очков</div>' +
            '</div>';
    });

    if (playedMatches.length === 0) {
        html += '<div class="no-matches">Матчей еще не сыграно</div>';
    }

    html += '</div></div>' +

        '<!-- Предстоящие матчи -->' +
        '<div class="team-card-section">' +
            '<h3>📆 Предстоящие матчи</h3>' +
            '<div class="upcoming-matches">';

    if (upcomingMatches.length > 0) {
        upcomingMatches.forEach(function(match) {
            var matchSchedule = null;
            for (var g = 0; g < SCHEDULE_DATA.schedule.length; g++) {
                var gw = SCHEDULE_DATA.schedule[g];
                for (var m = 0; m < gw.matches.length; m++) {
                    if (gw.matches[m].match_id === match.match_id) {
                        matchSchedule = gw.matches[m];
                        break;
                    }
                }
                if (matchSchedule) break;
            }

            html += '<div class="upcoming-match-item">' +
                '<div class="upcoming-opponent">' + escapeHtml(match.opponent) + '</div>' +
                '<div class="upcoming-location">' + (match.isHome ? 'ДОМА' : 'ГОСТИ') + '</div>' +
                '<div class="upcoming-date">' +
                    (matchSchedule ? escapeHtml(matchSchedule.day) + ', ' + escapeHtml(matchSchedule.date) : 'Дата не указана') +
                '</div>' +
                '<div class="upcoming-time">' +
                    (matchSchedule ? '⏰ ' + escapeHtml(matchSchedule.time) : '') +
                '</div>' +
                '</div>';
        });
    } else {
        html += '<div class="no-matches">Нет предстоящих матчей</div>';
    }

    html += '</div></div></div>';

    return html;
}

/**
 * Показать карточку команды с анимацией
 */
function showTeamCard(teamName) {
    var container = document.getElementById('scheduleContainer');

    // Анимированный переход
    if (typeof TRANSITION_CONFIG !== 'undefined' && TRANSITION_CONFIG.enabled) {
        container.classList.add('fade-out');

        setTimeout(function() {
            container.innerHTML = createTeamCardHTML(teamName);
            container.classList.remove('fade-out');
            container.classList.add('fade-in');

            setTimeout(function() {
                container.classList.remove('fade-in');
            }, 300);

            // Прокручиваем к карточке
            setTimeout(function() {
                var card = document.querySelector('.team-card-container');
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }, 300);
    } else {
        container.innerHTML = createTeamCardHTML(teamName);

        // Прокручиваем к карточке
        setTimeout(function() {
            var card = document.querySelector('.team-card-container');
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}
