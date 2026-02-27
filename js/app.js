// Глобальная переменная для хранения данных расписания
let scheduleData = null;

// Текущий активный режим просмотра
let currentViewMode = 'gameweek';

// Настройки анимаций переходов
const TRANSITION_CONFIG = {
    duration: 300, // мс
    enabled: true
};

// Инициализация приложения при загрузке страницы
window.addEventListener('load', function() {
    // Используем данные из scheduleData.js
    scheduleData = SCHEDULE_DATA;
    initializeApp();
});

function initializeApp() {
    try {
        populateGameweekSelect();
        populateAllTeamSelects();
        setupEventListeners();
        showGameweek(1);
    } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback: показываем первый тур из реальных данных
        showStaticGameweek();
    }
}

function populateGameweekSelect() {
    const select = document.getElementById('gameweekSelect');
    select.innerHTML = '';

    scheduleData.schedule.forEach(gw => {
        const option = document.createElement('option');
        option.value = gw.gameweek;
        option.textContent = 'Тур ' + gw.gameweek + ' (' + gw.round + ')';
        select.appendChild(option);
    });
}

/**
 * Заполняет select элемент списком команд
 * @param {HTMLSelectElement} selectElement
 * @param {string} placeholder - текст плейсхолдера
 */
function fillTeamOptions(selectElement, placeholder) {
    const teams = new Set();
    scheduleData.schedule.forEach(gw => {
        gw.matches.forEach(match => {
            teams.add(match.home);
            teams.add(match.away);
        });
    });

    selectElement.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = placeholder;
    selectElement.appendChild(defaultOption);

    Array.from(teams).sort().forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        selectElement.appendChild(option);
    });
}

function populateAllTeamSelects() {
    fillTeamOptions(document.getElementById('teamSelect'), 'Выберите команду...');
    fillTeamOptions(document.getElementById('teamCardSelect'), 'Выберите команду...');
}

function setupEventListeners() {
    // Обработчики для кнопок режимов просмотра
    const viewModeBtns = document.querySelectorAll('.view-mode-btn');
    viewModeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');

            // Не делаем ничего, если режим тот же
            if (mode === currentViewMode) return;

            // Убираем active класс со всех кнопок
            viewModeBtns.forEach(b => b.classList.remove('active'));
            // Добавляем active класс к текущей кнопке
            this.classList.add('active');

            // Обновляем текущий режим
            currentViewMode = mode;

            // Анимированное переключение контролов
            animateControlsTransition(mode);

            // Анимированное переключение контента
            animateContentTransition(function() {
                if (mode === 'gameweek') {
                    showGameweek(document.getElementById('gameweekSelect').value);
                } else if (mode === 'table') {
                    showStandingsTable();
                } else if (mode === 'playoff') {
                    showPlayoff();
                } else {
                    var team = document.getElementById('teamSelect').value;
                    if (team) {
                        showTeamSchedule(team);
                    } else {
                        document.getElementById('scheduleContainer').innerHTML =
                            '<div class="no-matches">Выберите команду для просмотра расписания</div>';
                    }
                }
            });
        });
    });

    document.getElementById('gameweekSelect').addEventListener('change', function() {
        var self = this;
        animateQuickTransition(function() {
            showGameweek(self.value);
        });
    });

    document.getElementById('teamSelect').addEventListener('change', function() {
        var self = this;
        if (self.value) {
            // Сбрасываем фильтр при выборе новой команды
            document.getElementById('homeAwaySelect').value = 'all';
            animateQuickTransition(function() {
                showTeamSchedule(self.value);
            });
        } else {
            document.getElementById('homeAwayFilter').style.display = 'none';
        }
    });

    document.getElementById('homeAwaySelect').addEventListener('change', function() {
        var team = document.getElementById('teamSelect').value;
        if (team) {
            animateQuickTransition(function() {
                showTeamSchedule(team);
            });
        }
    });

    // Обработчик для селектора карточки команды (перенесен из inline onchange)
    document.getElementById('teamCardSelect').addEventListener('change', function() {
        if (this.value) {
            showTeamCard(this.value);
            this.value = '';
        }
    });
}

/**
 * Экранирование строки для безопасной вставки в HTML-атрибуты
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Экранирование строки для вставки в JS-строку внутри onclick
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/'/g, '&#39;')
              .replace(/"/g, '&quot;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
}

function showGameweek(gameweekNum) {
    const gameweek = scheduleData.schedule.find(gw => gw.gameweek == gameweekNum);
    if (!gameweek) return;

    let html = '<div class="gameweek-title">' +
        '🏆 Тур ' + gameweek.gameweek + ' — ' + escapeHtml(gameweek.round) + ' (' + escapeHtml(gameweek.date) + ')' +
        '</div>' +
        '<div class="matches-grid gameweek-view">';

    var sortedMatches = gameweek.matches.slice().sort(function(a, b) {
        return new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-'));
    });

    sortedMatches.forEach(function(match) {
        html += createMatchCard(match);
    });

    html += '</div>';
    document.getElementById('scheduleContainer').innerHTML = html;
}

function showTeamSchedule(teamName) {
    const teamMatches = [];

    scheduleData.schedule.forEach(gw => {
        gw.matches.forEach(match => {
            if (match.home === teamName || match.away === teamName) {
                teamMatches.push({
                    match_id: match.match_id,
                    home: match.home,
                    away: match.away,
                    hall: match.hall,
                    address: match.address,
                    day: match.day,
                    time: match.time,
                    date: match.date,
                    gameweek: gw.gameweek,
                    round: gw.round,
                    tourStartDate: gw.date,
                    isHome: match.home === teamName
                });
            }
        });
    });

    teamMatches.sort(function(a, b) {
        return new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-'));
    });

    // Применяем фильтр дома/гости
    const filterValue = document.getElementById('homeAwaySelect').value;
    let filteredMatches = teamMatches;

    if (filterValue === 'home') {
        filteredMatches = teamMatches.filter(m => m.isHome);
    } else if (filterValue === 'away') {
        filteredMatches = teamMatches.filter(m => !m.isHome);
    }

    const homeGames = teamMatches.filter(m => m.isHome).length;
    const awayGames = teamMatches.filter(m => !m.isHome).length;

    // Формируем текст фильтра для заголовка
    let filterText = '';
    if (filterValue === 'home') {
        filterText = ' — Домашние игры';
    } else if (filterValue === 'away') {
        filterText = ' — Выездные игры';
    }

    let html = '<div class="team-header">' +
        '<div class="team-name">🏐 ' + escapeHtml(teamName) + escapeHtml(filterText) + '</div>' +
        '<div class="team-stats">' +
            'Показано: ' + filteredMatches.length + ' из ' + teamMatches.length + ' | ' +
            '<span style="color: #4ade80;">Дома: ' + homeGames + '</span> | ' +
            '<span style="color: #f472b6;">В гостях: ' + awayGames + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="matches-grid team-view">';

    if (filteredMatches.length === 0) {
        html += '<div class="no-matches">Нет матчей по выбранному фильтру</div>';
    } else {
        filteredMatches.forEach(function(match) {
            html += createMatchCard(match, teamName);
        });
    }

    html += '</div>';
    document.getElementById('scheduleContainer').innerHTML = html;
}

/**
 * Ищет результат матча по match_id в MATCH_RESULTS
 * @param {number} matchId
 * @returns {object|null}
 */
function findMatchResult(matchId) {
    if (!MATCH_RESULTS || !MATCH_RESULTS.results) return null;
    var result = MATCH_RESULTS.results.find(function(r) { return r.match_id === matchId; });
    return (result && result.played) ? result : null;
}

/**
 * Генерирует HTML блока результатов для сыгранного матча
 * @param {object} result - результат из MATCH_RESULTS
 * @returns {string}
 */
function createMatchResultHtml(result) {
    var homeWon = result.sets.home > result.sets.away;
    var homeSetsClass = homeWon ? 'result-sets result-winner' : 'result-sets result-loser';
    var awaySetsClass = homeWon ? 'result-sets result-loser' : 'result-sets result-winner';

    // Счёт по сетам
    var setsHtml = '<div class="result-score">' +
        '<span class="' + homeSetsClass + '">' + result.sets.home + '</span>' +
        '<span class="result-divider">:</span>' +
        '<span class="' + awaySetsClass + '">' + result.sets.away + '</span>' +
        '</div>';
    
    // Счёт по партиям
    var partiesHtml = '';
    if (result.set_scores && result.set_scores.length > 0) {
        var partiesItems = result.set_scores.map(function(set, i) {
            var setHomeWon = set.home > set.away;
            var homeScoreClass = setHomeWon ? 'set-score-winner' : 'set-score-loser';
            var awayScoreClass = setHomeWon ? 'set-score-loser' : 'set-score-winner';
            return '<span class="result-set-item">' +
                '<span class="set-label">П' + (i + 1) + '</span> ' +
                '<span class="' + homeScoreClass + '">' + set.home + '</span>' +
                '<span class="set-divider">:</span>' +
                '<span class="' + awayScoreClass + '">' + set.away + '</span>' +
                '</span>';
        }).join('');
        partiesHtml = '<div class="result-parties">' + partiesItems + '</div>';
    }
    
    return '<div class="match-result">' +
        setsHtml +
        partiesHtml +
        '</div>';
}

function createMatchCard(match, highlightTeam) {
    highlightTeam = highlightTeam || null;

    // Ищем результат матча
    var result = findMatchResult(match.match_id);
    var isPlayed = !!result;
    var homeWon = isPlayed && result.sets.home > result.sets.away;
    var awayWon = isPlayed && result.sets.away > result.sets.home;

    // Формируем классы для команд с учётом победителя
    var homeClass = 'team home';
    var awayClass = 'team away';
    if (highlightTeam === match.home) homeClass += ' highlight';
    if (highlightTeam === match.away) awayClass += ' highlight';
    if (homeWon) homeClass += ' winner';
    if (awayWon) awayClass += ' winner';
    if (isPlayed && !homeWon) homeClass += ' loser';
    if (isPlayed && !awayWon) awayClass += ' loser';

    var cardClass = 'match-card' + (isPlayed ? ' match-played' : '');

    let badges = '';
    // Показываем бейджи только в режиме просмотра по командам
    if (match.gameweek && match.isHome !== undefined) {
        const tourDateText = match.tourStartDate ? ' (' + escapeHtml(match.tourStartDate) + ')' : '';
        badges = '<span class="round-badge">Тур ' + match.gameweek + tourDateText + '</span>';
        badges += match.isHome ?
            ' <span class="home-badge">ДОМА</span>' :
            ' <span class="away-badge">ГОСТИ</span>';
    }

    // Бейджи в начале для режима по командам
    const badgesHtml = badges ? '<div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; margin-bottom: 5px;">' + badges + '</div>' : '';

    const safeHome = escapeAttr(match.home);
    const safeAway = escapeAttr(match.away);

    // Блок результата для сыгранных матчей
    var resultHtml = isPlayed ? createMatchResultHtml(result) : '';

    // Бейдж статуса
    var statusBadge = isPlayed
        ? '<div class="match-status-badge played">✅ Матч сыгран</div>'
        : '';

    return '<div class="' + cardClass + '" onclick="event.stopPropagation()">' +
        badgesHtml +
        statusBadge +
        '<div class="match-teams">' +
            '<div class="' + homeClass + '" onclick="showTeamCard(\'' + safeHome + '\')" style="cursor: pointer;">' + escapeHtml(match.home) + '</div>' +
            '<div class="vs">' + (isPlayed ? '' : 'VS') + '</div>' +
            '<div class="' + awayClass + '" onclick="showTeamCard(\'' + safeAway + '\')" style="cursor: pointer;">' + escapeHtml(match.away) + '</div>' +
        '</div>' +
        resultHtml +
        '<div class="match-info">' +
            '<span><span class="icon">📅</span> ' + escapeHtml(match.day) + ', ' + escapeHtml(match.date) + '</span>' +
            '<span><span class="icon">⏰</span> ' + escapeHtml(match.time) + '</span>' +
            '<span><span class="icon">🏟️</span> ' + escapeHtml(match.hall) + '</span>' +
            (match.address ? '<span><span class="icon">📍</span> ' + escapeHtml(match.address) + '</span>' : '') +
        '</div>' +
        '</div>';
}

function showStandingsTable() {
    // Получаем актуальную турнирную таблицу
    const standings = refreshStandings();

    // Подсчет сыгранных матчей
    const totalPlayedMatches = MATCH_RESULTS.results.filter(m => m.played).length;
    const totalMatches = MATCH_RESULTS.results.length;

    const progressPercent = totalMatches > 0 ? Math.round((totalPlayedMatches / totalMatches) * 100) : 0;
    const progressFull = progressPercent === 100 ? ' progress-full' : '';
    
    let html = '<div class="table-container">' +
        '<div class="gameweek-title">🏆 Турнирная таблица</div>' +
        '<div class="standings-info">' +
            'Сыграно матчей: ' + totalPlayedMatches + ' из ' + totalMatches +
        '</div>' +
        '<div class="progress-container">' +
            '<div class="progress-bar">' +
                '<div class="progress-fill' + progressFull + '" style="width: ' + progressPercent + '%"></div>' +
            '</div>' +
            '<span class="progress-percent">' + progressPercent + '%</span>' +
        '</div>' +
        '<table class="standings-table">' +
            '<thead><tr>' +
                '<th>#</th>' +
                '<th>Команда</th>' +
                '<th title="Сыгранные матчи">И</th>' +
                '<th title="Партии (выиграно-проиграно)">Партии</th>' +
                '<th title="Разница партий">+/-</th>' +
                '<th title="Турнирные очки">Очки</th>' +
            '</tr></thead>' +
            '<tbody>';

    standings.forEach(function(team, index) {
        const setsDiffSign = team.sets_diff > 0 ? '+' : '';
        const position = index + 1;
        const safeTeamName = escapeAttr(team.team);

        html += '<tr onclick="showTeamCard(\'' + safeTeamName + '\')">' +
            '<td>' + position + '</td>' +
            '<td class="standings-team-name">' + escapeHtml(team.team) + '</td>' +
            '<td>' + team.played + '</td>' +
            '<td>' + team.sets_won + '-' + team.sets_lost + '</td>' +
            '<td>' + setsDiffSign + team.sets_diff + '</td>' +
            '<td class="points">' + team.tournament_points + '</td>' +
            '</tr>';
    });

    html += '</tbody></table>' +
        '<div class="table-legend">' +
            '<div class="table-legend-item">' +
                '<div class="table-legend-box legend-gold"></div>' +
                '<span>1 место - Лидер</span>' +
            '</div>' +
            '<div class="table-legend-item">' +
                '<div class="table-legend-box legend-playoff"></div>' +
                '<span>1-4 места - Плей-офф</span>' +
            '</div>' +
        '</div>' +
        '<div style="text-align: center; margin-top: 30px; color: #aaa; font-size: 0.9em;">' +
            '<p><strong>И</strong> - Игры | <strong>Партии</strong> - Выиграно-Проиграно | <strong>+/-</strong> - Разница партий | <strong>Очки</strong> - Турнирные очки</p>' +
            '<p style="margin-top: 10px; color: #00d4ff; font-size: 0.95em; font-weight: 600;">' +
                '📊 Система начисления очков (всегда 3 партии в матче):' +
            '</p>' +
            '<p style="margin-top: 5px; color: #ccc; font-size: 0.85em;">' +
                'Победа 3-0 → <strong style="color: #5eff99;">3 очка</strong> | ' +
                'Победа 2-1 → <strong style="color: #4ade80;">2 очка</strong> | ' +
                'Поражение 1-2 → <strong style="color: #fbbf24;">1 очко</strong> | ' +
                'Поражение 0-3 → <strong style="color: #ef4444;">0 очков</strong>' +
            '</p>' +
            (totalPlayedMatches === 0 ? '<p style="margin-top: 15px; color: #888; font-size: 0.85em;">* Таблица обновится после проведения первых матчей</p>' : '') +
        '</div>' +
        '</div>';

    document.getElementById('scheduleContainer').innerHTML = html;
}

/**
 * Fallback: генерирует первый тур из реальных данных расписания
 */
function showStaticGameweek() {
    if (!SCHEDULE_DATA || !SCHEDULE_DATA.schedule || SCHEDULE_DATA.schedule.length === 0) {
        document.getElementById('scheduleContainer').innerHTML =
            '<div class="no-matches">Не удалось загрузить расписание</div>';
        return;
    }

    var gw = SCHEDULE_DATA.schedule[0];
    var html = '<div class="gameweek-title">' +
        '🏆 Тур ' + gw.gameweek + ' — ' + escapeHtml(gw.round) + ' (' + escapeHtml(gw.date) + ')' +
        '</div>' +
        '<div class="matches-grid gameweek-view">';

    gw.matches.forEach(function(match) {
        html += '<div class="match-card">' +
            '<div class="match-teams">' +
                '<div class="team home">' + escapeHtml(match.home) + '</div>' +
                '<div class="vs">VS</div>' +
                '<div class="team away">' + escapeHtml(match.away) + '</div>' +
            '</div>' +
            '<div class="match-info">' +
                '<span><span class="icon">📅</span> ' + escapeHtml(match.day) + ', ' + escapeHtml(match.date) + '</span>' +
                '<span><span class="icon">⏰</span> ' + escapeHtml(match.time) + '</span>' +
                '<span><span class="icon">🏟️</span> ' + escapeHtml(match.hall) + '</span>' +
                (match.address ? '<span><span class="icon">📍</span> ' + escapeHtml(match.address) + '</span>' : '') +
            '</div>' +
            '</div>';
    });

    html += '</div>';
    document.getElementById('scheduleContainer').innerHTML = html;
}

// Parallax эффект для заголовка (через requestAnimationFrame)
(function() {
    var ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                var h1 = document.querySelector('h1');
                if (h1) {
                    var scrolled = window.pageYOffset;
                    var parallaxSpeed = 0.5;
                    h1.style.transform = 'translateY(' + (scrolled * parallaxSpeed) + 'px)';
                    var opacity = Math.max(0.3, 1 - scrolled / 500);
                    h1.style.opacity = opacity;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
})();

/**
 * Возвращает к текущему активному режиму (используется при закрытии карточки)
 */
function returnToCurrentMode() {
    if (currentViewMode === 'table') {
        showStandingsTable();
    } else if (currentViewMode === 'playoff') {
        showPlayoff();
    } else if (currentViewMode === 'team') {
        var team = document.getElementById('teamSelect').value;
        if (team) {
            showTeamSchedule(team);
        } else {
            document.getElementById('scheduleContainer').innerHTML =
                '<div class="no-matches">Выберите команду для просмотра расписания</div>';
        }
    } else {
        showGameweek(document.getElementById('gameweekSelect').value);
    }
}

// ============= ФУНКЦИИ АНИМАЦИЙ ПЕРЕХОДОВ =============

/**
 * Анимированное переключение контента
 * @param {Function} updateCallback - Функция обновления контента
 */
function animateContentTransition(updateCallback) {
    const container = document.getElementById('scheduleContainer');

    if (!TRANSITION_CONFIG.enabled) {
        updateCallback();
        return;
    }

    // Фаза 1: Fade out
    container.classList.add('fade-out');

    // Фаза 2: Обновление и Fade in
    setTimeout(function() {
        updateCallback();
        container.classList.remove('fade-out');
        container.classList.add('fade-in');

        // Убираем класс после завершения анимации
        setTimeout(function() {
            container.classList.remove('fade-in');
        }, TRANSITION_CONFIG.duration);
    }, TRANSITION_CONFIG.duration);
}

/**
 * Анимированное переключение контролов
 * @param {string} mode - Режим просмотра ('gameweek', 'team', 'table')
 */
function animateControlsTransition(mode) {
    const gameweekSelector = document.getElementById('gameweekSelector');
    const teamSelector = document.getElementById('teamSelector');
    const homeAwayFilter = document.getElementById('homeAwayFilter');
    const teamCardSelector = document.getElementById('teamCardSelector');
    const legend = document.getElementById('legend');

    // Конфигурация видимости для каждого режима
    const visibility = {
        gameweek: {
            gameweekSelector: true,
            teamSelector: false,
            homeAwayFilter: false,
            teamCardSelector: false,
            legend: true
        },
        team: {
            gameweekSelector: false,
            teamSelector: true,
            homeAwayFilter: true,
            teamCardSelector: false,
            legend: true
        },
        table: {
            gameweekSelector: false,
            teamSelector: false,
            homeAwayFilter: false,
            teamCardSelector: true,
            legend: false
        },
        playoff: {
            gameweekSelector: false,
            teamSelector: false,
            homeAwayFilter: false,
            teamCardSelector: false,
            legend: false
        }
    };

    const config = visibility[mode];

    // Анимируем каждый контрол
    animateControl(gameweekSelector, config.gameweekSelector);
    animateControl(teamSelector, config.teamSelector);
    animateControl(homeAwayFilter, config.homeAwayFilter);
    animateControl(teamCardSelector, config.teamCardSelector);

    // Анимируем легенду
    if (config.legend) {
        legend.classList.remove('hidden');
        legend.style.display = 'flex';
    } else {
        legend.classList.add('hidden');
        setTimeout(function() {
            if (legend.classList.contains('hidden')) {
                legend.style.display = 'none';
            }
        }, TRANSITION_CONFIG.duration);
    }
}

/**
 * Анимирует появление/скрытие контрола
 * @param {HTMLElement} element - Элемент контрола
 * @param {boolean} show - Показать/скрыть
 */
function animateControl(element, show) {
    if (!element) return;

    if (show) {
        // Показываем элемент
        element.style.display = 'block';
        element.classList.remove('hiding');
        element.classList.add('showing');

        setTimeout(function() {
            element.classList.remove('showing');
        }, TRANSITION_CONFIG.duration);
    } else {
        // Скрываем элемент
        element.classList.add('hiding');
        element.classList.remove('showing');

        setTimeout(function() {
            if (element.classList.contains('hiding')) {
                element.style.display = 'none';
                element.classList.remove('hiding');
            }
        }, TRANSITION_CONFIG.duration);
    }
}

/**
 * Анимированная смена тура или команды (без смены режима)
 * @param {Function} updateCallback - Функция обновления
 */
function animateQuickTransition(updateCallback) {
    const container = document.getElementById('scheduleContainer');

    if (!TRANSITION_CONFIG.enabled) {
        updateCallback();
        return;
    }

    // Быстрый fade
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';

    setTimeout(function() {
        updateCallback();
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 150);
}
