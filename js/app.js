// Глобальная переменная для хранения данных расписания
let scheduleData = null;

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
        populateTeamSelect();
        setupEventListeners();
        showGameweek(1);
    } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback: показываем первый тур статически
        showStaticGameweek();
    }
}

function populateGameweekSelect() {
    const select = document.getElementById('gameweekSelect');
    select.innerHTML = '';

    scheduleData.schedule.forEach(gw => {
        const option = document.createElement('option');
        option.value = gw.gameweek;
        option.textContent = `Тур ${gw.gameweek} (${gw.round})`;
        select.appendChild(option);
    });
}

function populateTeamSelect() {
    const teams = new Set();
    scheduleData.schedule.forEach(gw => {
        gw.matches.forEach(match => {
            teams.add(match.home);
            teams.add(match.away);
        });
    });

    const select = document.getElementById('teamSelect');
    select.innerHTML = '<option value="">Выберите команду...</option>';

    Array.from(teams).sort().forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        select.appendChild(option);
    });

    // Также заполняем селектор для карточки команды
    const cardSelect = document.getElementById('teamCardSelect');
    cardSelect.innerHTML = '<option value="">Выберите команду...</option>';

    Array.from(teams).sort().forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        cardSelect.appendChild(option);
    });
}

function setupEventListeners() {
    // Обработчики для кнопок режимов просмотра
    const viewModeBtns = document.querySelectorAll('.view-mode-btn');
    viewModeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            const currentActiveBtn = document.querySelector('.view-mode-btn.active');
            const currentMode = currentActiveBtn ? currentActiveBtn.getAttribute('data-mode') : null;

            // Не делаем ничего, если режим тот же
            if (mode === currentMode) return;

            // Убираем active класс со всех кнопок
            viewModeBtns.forEach(b => b.classList.remove('active'));
            // Добавляем active класс к текущей кнопке
            this.classList.add('active');

            // Анимированное переключение контролов
            animateControlsTransition(mode);

            // Анимированное переключение контента
            animateContentTransition(() => {
                if (mode === 'gameweek') {
                    showGameweek(document.getElementById('gameweekSelect').value);
                } else if (mode === 'table') {
                    showStandingsTable();
                } else {
                    const team = document.getElementById('teamSelect').value;
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
        animateQuickTransition(() => {
            showGameweek(this.value);
        });
    });
    
    document.getElementById('teamSelect').addEventListener('change', function() {
        if (this.value) {
            // Сбрасываем фильтр при выборе новой команды
            document.getElementById('homeAwaySelect').value = 'all';
            animateQuickTransition(() => {
                showTeamSchedule(this.value);
            });
        } else {
            document.getElementById('homeAwayFilter').style.display = 'none';
        }
    });
    
    document.getElementById('homeAwaySelect').addEventListener('change', function() {
        const team = document.getElementById('teamSelect').value;
        if (team) {
            animateQuickTransition(() => {
                showTeamSchedule(team);
            });
        }
    });
}

function showGameweek(gameweekNum) {
    const gameweek = scheduleData.schedule.find(gw => gw.gameweek == gameweekNum);
    if (!gameweek) return;

    let html = `
        <div class="gameweek-title">
            🏆 Тур ${gameweek.gameweek} — ${gameweek.round} (${gameweek.date})
        </div>
        <div class="matches-grid gameweek-view">
    `;

    gameweek.matches.sort((a, b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));

    gameweek.matches.forEach(match => {
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
                    ...match,
                    gameweek: gw.gameweek,
                    round: gw.round,
                    tourStartDate: gw.date,
                    isHome: match.home === teamName
                });
            }
        });
    });

    teamMatches.sort((a, b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));

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

    let html = `
        <div class="team-header">
            <div class="team-name">🏐 ${teamName}${filterText}</div>
            <div class="team-stats">
                Показано: ${filteredMatches.length} из ${teamMatches.length} |
                <span style="color: #4ade80;">Дома: ${homeGames}</span> |
                <span style="color: #f472b6;">В гостях: ${awayGames}</span>
            </div>
        </div>
        <div class="matches-grid team-view">
    `;

    if (filteredMatches.length === 0) {
        html += '<div class="no-matches">Нет матчей по выбранному фильтру</div>';
    } else {
        filteredMatches.forEach(match => {
            html += createMatchCard(match, teamName);
        });
    }

    html += '</div>';
    document.getElementById('scheduleContainer').innerHTML = html;
}

function createMatchCard(match, highlightTeam = null) {
    const homeClass = highlightTeam === match.home ? 'team home highlight' : 'team home';
    const awayClass = highlightTeam === match.away ? 'team away highlight' : 'team away';

    let badges = '';
    // Показываем бейджи только в режиме просмотра по командам
    if (match.gameweek && match.isHome !== undefined) {
        const tourDateText = match.tourStartDate ? ` (${match.tourStartDate})` : '';
        badges = `<span class="round-badge">Тур ${match.gameweek}${tourDateText}</span>`;
        badges += match.isHome ?
            ' <span class="home-badge">ДОМА</span>' :
            ' <span class="away-badge">ГОСТИ</span>';
    }

    // Бейджи в начале для режима по командам
    const badgesHtml = badges ? `<div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; margin-bottom: 5px;">${badges}</div>` : '';

    return `
        <div class="match-card" onclick="event.stopPropagation()">
            ${badgesHtml}
            <div class="match-teams">
                <div class="${homeClass}" onclick="showTeamCard('${match.home}')" style="cursor: pointer;">${match.home}</div>
                <div class="vs">VS</div>
                <div class="${awayClass}" onclick="showTeamCard('${match.away}')" style="cursor: pointer;">${match.away}</div>
            </div>
            <div class="match-info">
                <span><span class="icon">📅</span> ${match.day}, ${match.date}</span>
                <span><span class="icon">⏰</span> ${match.time}</span>
                <span><span class="icon">🏟️</span> ${match.hall}</span>
                ${match.address ? `<span><span class="icon">📍</span> ${match.address}</span>` : ''}
            </div>
        </div>
    `;
}

function showStandingsTable() {
    // Получаем актуальную турнирную таблицу
    const standings = refreshStandings();

    // Подсчет сыгранных матчей
    const totalPlayedMatches = MATCH_RESULTS.results.filter(m => m.played).length;
    const totalMatches = MATCH_RESULTS.results.length;

    let html = `
        <div class="table-container">
            <div class="gameweek-title">
                🏆 Турнирная таблица
            </div>
            <div style="text-align: center; margin-bottom: 20px; color: #ccc; font-size: 0.95em;">
                Сыграно матчей: ${totalPlayedMatches} из ${totalMatches}
            </div>
            <table class="standings-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Команда</th>
                        <th title="Сыгранные матчи">И</th>
                        <th title="Партии (выиграно-проиграно)">Партии</th>
                        <th title="Разница партий">+/-</th>
                        <th title="Турнирные очки">Очки</th>
                    </tr>
                </thead>
                <tbody>
    `;

    standings.forEach((team, index) => {
        const setsDiffSign = team.sets_diff > 0 ? '+' : '';
        const position = index + 1;

        html += `
            <tr onclick="showTeamCard('${team.team}')">
                <td>${position}</td>
                <td style="cursor: pointer; transition: all 0.3s;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='#fff'">${team.team}</td>
                <td>${team.played}</td>
                <td>${team.sets_won}-${team.sets_lost}</td>
                <td>${setsDiffSign}${team.sets_diff}</td>
                <td class="points">${team.tournament_points}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
            <div class="table-legend">
                <div class="table-legend-item">
                    <div class="table-legend-box legend-gold"></div>
                    <span>1 место - Лидер</span>
                </div>
                <div class="table-legend-item">
                    <div class="table-legend-box legend-playoff"></div>
                    <span>1-4 места - Плей-офф</span>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #aaa; font-size: 0.9em;">
                <p><strong>И</strong> - Игры | <strong>Партии</strong> - Выиграно-Проиграно | <strong>+/-</strong> - Разница партий | <strong>Очки</strong> - Турнирные очки</p>
                <p style="margin-top: 10px; color: #00d4ff; font-size: 0.95em; font-weight: 600;">
                    📊 Система начисления очков (всегда 3 партии в матче):
                </p>
                <p style="margin-top: 5px; color: #ccc; font-size: 0.85em;">
                    Победа 3-0 → <strong style="color: #5eff99;">3 очка</strong> |
                    Победа 2-1 → <strong style="color: #4ade80;">2 очка</strong> |
                    Поражение 1-2 → <strong style="color: #fbbf24;">1 очко</strong> |
                    Поражение 0-3 → <strong style="color: #ef4444;">0 очков</strong>
                </p>
                ${totalPlayedMatches === 0 ? '<p style="margin-top: 15px; color: #888; font-size: 0.85em;">* Таблица обновится после проведения первых матчей</p>' : ''}
            </div>
        </div>
    `;

    document.getElementById('scheduleContainer').innerHTML = html;
}

function showStaticGameweek() {
    const staticHtml = `
        <div class="gameweek-title">
            🏆 Тур 1 — Первый круг (23.02.2026)
        </div>
        <div class="matches-grid gameweek-view">
            <div class="match-card">
                <div class="match-teams">
                    <div class="team home">Макиато</div>
                    <div class="vs">VS</div>
                    <div class="team away">Dream team</div>
                </div>
                <div class="match-info">
                    <span><span class="icon">📅</span> Воскресенье, 01.03.2026</span>
                    <span><span class="icon">⏰</span> 18:00-20:00</span>
                    <span><span class="icon">🏟️</span> ФОК Орловского</span>
                </div>
            </div>
            <div class="match-card">
                <div class="match-teams">
                    <div class="team home">Серволюкс</div>
                    <div class="vs">VS</div>
                    <div class="team away">Сетка 37</div>
                </div>
                <div class="match-info">
                    <span><span class="icon">📅</span> Вторник, 24.02.2026</span>
                    <span><span class="icon">⏰</span> 19:00-21:00</span>
                    <span><span class="icon">🏟️</span> МГУ Кулешова</span>
                </div>
            </div>
            <div class="match-card">
                <div class="match-teams">
                    <div class="team home">Могилевгражданпроект</div>
                    <div class="vs">VS</div>
                    <div class="team away">Отцы и дети</div>
                </div>
                <div class="match-info">
                    <span><span class="icon">📅</span> Среда, 25.02.2026</span>
                    <span><span class="icon">⏰</span> 18:00-20:00</span>
                    <span><span class="icon">🏟️</span> Зал МГП</span>
                </div>
            </div>
            <div class="match-card">
                <div class="match-teams">
                    <div class="team home">Могилевгипрозем</div>
                    <div class="vs">VS</div>
                    <div class="team away">33</div>
                </div>
                <div class="match-info">
                    <span><span class="icon">📅</span> Воскресенье, 01.03.2026</span>
                    <span><span class="icon">⏰</span> 17:00-18:30</span>
                    <span><span class="icon">🏟️</span> ФОК Орловского</span>
                </div>
            </div>
        </div>
    `;
    document.getElementById('scheduleContainer').innerHTML = staticHtml;
}

// Parallax эффект для заголовка
window.addEventListener('scroll', () => {
    const h1 = document.querySelector('h1');
    if (!h1) return;

    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;

    // Parallax эффект - заголовок двигается медленнее
    h1.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;

    // Дополнительный эффект масштабирования при скролле
    const opacity = Math.max(0.3, 1 - scrolled / 500);
    h1.style.opacity = opacity;
});

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
    setTimeout(() => {
        updateCallback();
        container.classList.remove('fade-out');
        container.classList.add('fade-in');

        // Убираем класс после завершения анимации
        setTimeout(() => {
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
        setTimeout(() => {
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

        setTimeout(() => {
            element.classList.remove('showing');
        }, TRANSITION_CONFIG.duration);
    } else {
        // Скрываем элемент
        element.classList.add('hiding');
        element.classList.remove('showing');

        setTimeout(() => {
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

    setTimeout(() => {
        updateCallback();
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 150);
}

