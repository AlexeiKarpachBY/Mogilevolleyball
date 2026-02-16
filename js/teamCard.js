// Модуль для отображения детальной карточки команды

/**
 * Получить статистику команды
 */
function getTeamStats(teamName) {
    const standing = calculateStandings().find(t => t.team === teamName);
    if (!standing) return null;

    const teamMatches = [];

    // Собираем все матчи команды
    MATCH_RESULTS.results.forEach(match => {
        if (match.home === teamName || match.away === teamName) {
            teamMatches.push({
                ...match,
                isHome: match.home === teamName,
                opponent: match.home === teamName ? match.away : match.home
            });
        }
    });

    // Разделяем на домашние и выездные
    const homeMatches = teamMatches.filter(m => m.isHome);
    const awayMatches = teamMatches.filter(m => !m.isHome);

    // Расчет побед/поражений
    const wins = teamMatches.filter(m => m.played && (
        (m.isHome && m.sets.home > m.sets.away) ||
        (!m.isHome && m.sets.away > m.sets.home)
    )).length;

    const losses = teamMatches.filter(m => m.played && (
        (m.isHome && m.sets.home < m.sets.away) ||
        (!m.isHome && m.sets.away < m.sets.home)
    )).length;

    const winRate = standing.played > 0 ? Math.round((wins / standing.played) * 100) : 0;

    // Статистика по рейтингам
    const avgPointsHome = homeMatches.filter(m => m.played).length > 0 ?
        (homeMatches.filter(m => m.played).reduce((sum, m) => {
            return sum + m.set_scores.reduce((s, ss) => s + ss.home, 0);
        }, 0) / homeMatches.filter(m => m.played).length).toFixed(1) : 0;

    const avgPointsAway = awayMatches.filter(m => m.played).length > 0 ?
        (awayMatches.filter(m => m.played).reduce((sum, m) => {
            return sum + m.set_scores.reduce((s, ss) => s + ss.away, 0);
        }, 0) / awayMatches.filter(m => m.played).length).toFixed(1) : 0;

    // Статистика дома vs в гостях
    const homeStats = {
        played: homeMatches.filter(m => m.played).length,
        won: homeMatches.filter(m => m.played && m.sets.home > m.sets.away).length,
        lost: homeMatches.filter(m => m.played && m.sets.home < m.sets.away).length,
        sets: {
            won: homeMatches.filter(m => m.played).reduce((sum, m) => sum + m.sets.home, 0),
            lost: homeMatches.filter(m => m.played).reduce((sum, m) => sum + m.sets.away, 0)
        },
        points: homeMatches.filter(m => m.played).reduce((sum, m) => sum + m.points.home, 0)
    };

    const awayStats = {
        played: awayMatches.filter(m => m.played).length,
        won: awayMatches.filter(m => m.played && m.sets.away > m.sets.home).length,
        lost: awayMatches.filter(m => m.played && m.sets.away < m.sets.home).length,
        sets: {
            won: awayMatches.filter(m => m.played).reduce((sum, m) => sum + m.sets.away, 0),
            lost: awayMatches.filter(m => m.played).reduce((sum, m) => sum + m.sets.home, 0)
        },
        points: awayMatches.filter(m => m.played).reduce((sum, m) => sum + m.points.away, 0)
    };

    // Топ противники
    const opponentStats = {};
    teamMatches.forEach(m => {
        if (!opponentStats[m.opponent]) {
            opponentStats[m.opponent] = { played: 0, won: 0, lost: 0, points: 0 };
        }
        opponentStats[m.opponent].played++;
        if (m.played) {
            const isWin = (m.isHome && m.sets.home > m.sets.away) ||
                         (!m.isHome && m.sets.away > m.sets.home);
            if (isWin) opponentStats[m.opponent].won++;
            else opponentStats[m.opponent].lost++;
            opponentStats[m.opponent].points += m.isHome ? m.points.home : m.points.away;
        }
    });

    return {
        standing,
        teamMatches: teamMatches.sort((a, b) => a.match_id - b.match_id),
        wins,
        losses,
        winRate,
        homeStats,
        awayStats,
        avgPointsHome,
        avgPointsAway,
        opponentStats
    };
}

/**
 * Создать карточку команды с полной статистикой
 */
function createTeamCardHTML(teamName) {
    const stats = getTeamStats(teamName);
    if (!stats) {
        return '<div class="no-matches">Команда не найдена</div>';
    }

    const { standing, teamMatches, wins, losses, winRate, homeStats, awayStats, avgPointsHome, avgPointsAway, opponentStats } = stats;

    // Сортируем противников по количеству побед
    const topOpponents = Object.entries(opponentStats)
        .sort((a, b) => b[1].won - a[1].won)
        .slice(0, 3);

    const playedMatches = teamMatches.filter(m => m.played);
    const upcomingMatches = teamMatches.filter(m => !m.played).slice(0, 3);

    let html = `
        <div class="team-card-container">
            <!-- Заголовок команды -->
            <div class="team-card-header">
                <div class="team-card-title">
                    <span class="team-icon">🏐</span>
                    <h2>${teamName}</h2>
                </div>
                <button class="close-card-btn" onclick="showGameweek(document.getElementById('gameweekSelect').value)">✕</button>
            </div>

            <!-- Основная статистика -->
            <div class="team-stats-main">
                <div class="stat-box stat-large">
                    <div class="stat-value">${standing.tournament_points}</div>
                    <div class="stat-label">Турнирные очки</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${standing.played}</div>
                    <div class="stat-label">Сыгр. матчей</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" style="color: #4ade80;">${wins}</div>
                    <div class="stat-label">Побед</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" style="color: #ef4444;">${losses}</div>
                    <div class="stat-label">Поражений</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${winRate}%</div>
                    <div class="stat-label">% побед</div>
                </div>
            </div>

            <!-- Статистика партий -->
            <div class="team-card-section">
                <h3>📊 Статистика партий</h3>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-value">${standing.sets_won}–${standing.sets_lost}</div>
                        <div class="stat-label">Партии (выиг–проиг)</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" style="color: #f59e0b;">${standing.sets_diff > 0 ? '+' : ''}${standing.sets_diff}</div>
                        <div class="stat-label">Разница партий</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${standing.points_won}–${standing.points_lost}</div>
                        <div class="stat-label">Очки в партиях</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" style="color: #06b6d4;">${standing.points_diff > 0 ? '+' : ''}${standing.points_diff}</div>
                        <div class="stat-label">Разница очков</div>
                    </div>
                </div>
            </div>

            <!-- Дома vs В гостях -->
            <div class="team-card-section">
                <h3>🏠 Дома vs В гостях</h3>
                <div class="home-away-compare">
                    <div class="compare-box home">
                        <div class="compare-label">ДОМА</div>
                        <div class="compare-stat">
                            <span class="compare-number">${homeStats.played}</span>
                            <span class="compare-text">матчей</span>
                        </div>
                        <div class="compare-stat">
                            <span class="compare-number" style="color: #4ade80;">${homeStats.won}</span>
                            <span class="compare-text">побед</span>
                        </div>
                        <div class="compare-stat">
                            <span class="compare-number">${homeStats.sets.won}–${homeStats.sets.lost}</span>
                            <span class="compare-text">партии</span>
                        </div>
                        <div class="compare-stat">
                            <span class="compare-number" style="color: #ff9900;">${homeStats.points}</span>
                            <span class="compare-text">очков</span>
                        </div>
                    </div>

                    <div class="compare-box away">
                        <div class="compare-label">В ГОСТЯХ</div>
                        <div class="compare-stat">
                            <span class="compare-number">${awayStats.played}</span>
                            <span class="compare-text">матчей</span>
                        </div>
                        <div class="compare-stat">
                            <span class="compare-number" style="color: #4ade80;">${awayStats.won}</span>
                            <span class="compare-text">побед</span>
                        </div>
                        <div class="compare-stat">
                            <span class="compare-number">${awayStats.sets.won}–${awayStats.sets.lost}</span>
                            <span class="compare-text">партии</span>
                        </div>
                        <div class="compare-stat">
                            <span class="compare-number" style="color: #ff9900;">${awayStats.points}</span>
                            <span class="compare-text">очков</span>
                        </div>
                    </div>
                </div>
            </div>


            <!-- История матчей -->
            <div class="team-card-section">
                <h3>📅 История матчей</h3>
                <div class="matches-history">
    `;

    playedMatches.forEach(match => {
        const isWin = (match.isHome && match.sets.home > match.sets.away) ||
                      (!match.isHome && match.sets.away > match.sets.home);
        const resultText = isWin ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ';
        const resultColor = isWin ? '#4ade80' : '#ef4444';
        const teamScore = match.isHome ? match.sets.home : match.sets.away;
        const opponentScore = match.isHome ? match.sets.away : match.sets.home;
        const teamPoints = match.isHome ? match.points.home : match.points.away;

        html += `
            <div class="match-history-item">
                <div class="match-history-opponent">${match.opponent}</div>
                <div class="match-history-result" style="color: ${resultColor};">
                    <span class="history-score">${teamScore}–${opponentScore}</span>
                    <span class="history-location">${match.isHome ? 'ДОМА' : 'ГОСТИ'}</span>
                </div>
                <div class="match-history-points">${teamPoints} очков</div>
            </div>
        `;
    });

    if (playedMatches.length === 0) {
        html += '<div class="no-matches">Матчей еще не сыграно</div>';
    }

    html += `
                </div>
            </div>

            <!-- Предстоящие матчи -->
            <div class="team-card-section">
                <h3>📆 Предстоящие матчи</h3>
                <div class="upcoming-matches">
    `;

    if (upcomingMatches.length > 0) {
        upcomingMatches.forEach(match => {
            const matchSchedule = SCHEDULE_DATA.schedule.flatMap(gw => gw.matches)
                .find(m => m.match_id === match.match_id);

            html += `
                <div class="upcoming-match-item">
                    <div class="upcoming-opponent">${match.opponent}</div>
                    <div class="upcoming-location">${match.isHome ? 'ДОМА' : 'ГОСТИ'}</div>
                    <div class="upcoming-date">
                        ${matchSchedule ? `${matchSchedule.day}, ${matchSchedule.date}` : 'Дата не указана'}
                    </div>
                    <div class="upcoming-time">
                        ${matchSchedule ? `⏰ ${matchSchedule.time}` : ''}
                    </div>
                </div>
            `;
        });
    } else {
        html += '<div class="no-matches">Нет предстоящих матчей</div>';
    }

    html += `
                </div>
            </div>
        </div>
    `;

    return html;
}

/**
 * Показать карточку команды
 */
function showTeamCard(teamName) {
    document.getElementById('scheduleContainer').innerHTML = createTeamCardHTML(teamName);

    // Прокручиваем к карточке
    setTimeout(() => {
        document.querySelector('.team-card-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

