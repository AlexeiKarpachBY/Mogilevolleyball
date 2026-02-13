// Глобальная переменная для хранения данных расписания
let scheduleData = null;

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
}

function setupEventListeners() {
    // Обработчики для кнопок режимов просмотра
    const viewModeBtns = document.querySelectorAll('.view-mode-btn');
    viewModeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');

            // Убираем active класс со всех кнопок
            viewModeBtns.forEach(b => b.classList.remove('active'));
            // Добавляем active класс к текущей кнопке
            this.classList.add('active');

            // Показываем/скрываем контролы
            document.getElementById('gameweekSelector').style.display = mode === 'gameweek' ? 'block' : 'none';
            document.getElementById('teamSelector').style.display = mode === 'team' ? 'block' : 'none';
            document.getElementById('homeAwayFilter').style.display = mode === 'team' ? 'block' : 'none';

            // Скрываем легенду в режиме таблицы
            document.getElementById('legend').style.display = mode === 'table' ? 'none' : 'flex';

            // Показываем соответствующий контент
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

    document.getElementById('gameweekSelect').addEventListener('change', function() {
        showGameweek(this.value);
    });

    document.getElementById('teamSelect').addEventListener('change', function() {
        if (this.value) {
            // Сбрасываем фильтр при выборе новой команды
            document.getElementById('homeAwaySelect').value = 'all';
            showTeamSchedule(this.value);
        } else {
            document.getElementById('homeAwayFilter').style.display = 'none';
        }
    });

    document.getElementById('homeAwaySelect').addEventListener('change', function() {
        const team = document.getElementById('teamSelect').value;
        if (team) {
            showTeamSchedule(team);
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
        <div class="match-card">
            ${badgesHtml}
            <div class="match-teams">
                <div class="${homeClass}">${match.home}</div>
                <div class="vs">VS</div>
                <div class="${awayClass}">${match.away}</div>
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
    // Собираем статистику по командам
    const teams = {};

    // Инициализируем команды
    scheduleData.schedule.forEach(gw => {
        gw.matches.forEach(match => {
            if (!teams[match.home]) {
                teams[match.home] = {
                    name: match.home,
                    played: 0,
                    setsWon: 0,
                    setsLost: 0,
                    pointsFor: 0,
                    pointsAgainst: 0,
                    points: 0
                };
            }
            if (!teams[match.away]) {
                teams[match.away] = {
                    name: match.away,
                    played: 0,
                    setsWon: 0,
                    setsLost: 0,
                    pointsFor: 0,
                    pointsAgainst: 0,
                    points: 0
                };
            }
        });
    });

    // Сортируем команды по алфавиту для стабильного отображения
    const sortedTeams = Object.values(teams).sort((a, b) => a.name.localeCompare(b.name));

    let html = `
        <div class="table-container">
            <div class="gameweek-title">
                🏆 Турнирная таблица
            </div>
            <table class="standings-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Команда</th>
                        <th title="Сыгранные матчи">И</th>
                        <th title="Разница партий">+/-</th>
                        <th title="Набранные очки в партиях">Оч</th>
                        <th title="Итоговые очки">О</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sortedTeams.forEach((team, index) => {
        const setsDiff = team.setsWon - team.setsLost;
        const setsDiffSign = setsDiff > 0 ? '+' : '';

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.played}</td>
                <td>${setsDiffSign}${setsDiff}</td>
                <td>${team.pointsFor}</td>
                <td class="points">${team.points}</td>
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
                <p><strong>И</strong> - Игры (сыгранные матчи) | <strong>+/-</strong> - Разница партий | <strong>Оч</strong> - Набранные очки в партиях | <strong>О</strong> - Итоговые очки</p>
                <p style="margin-top: 10px; color: #888; font-size: 0.85em;">
                    * Таблица будет обновляться после завершения матчей
                </p>
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

