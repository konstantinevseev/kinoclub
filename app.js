// Movie Tracker Application
// Используем TMDB API (поддержка русского языка и категорий)

const API_KEY = '2dca580c2a14b55200e784d157207b4d'; // Публичный демо-ключ TMDB
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Состояние приложения
const state = {
    watchlist: [],
    watched: [],
    favorites: [],
    notes: {}, // Заметки по id фильма
    history: [], // История просмотров
    currentMovie: null,
    searchResults: [],
    categories: [],
    currentCategory: null,
    categoryPage: 1,
    currentPage: 'home',
    categoryMovies: [],
    currentTheme: 'gold',
    currentTab: 'watchlist'
};

// Достижения
const achievementsList = [
    { id: 'first_movie', title: 'Первый шаг', desc: 'Посмотрите первый фильм', icon: '🎬', condition: (s) => s.watched.length >= 1 },
    { id: 'ten_movies', title: 'Киноман', desc: 'Посмотрите 10 фильмов', icon: '🎥', condition: (s) => s.watched.length >= 10 },
    { id: 'fifty_movies', title: 'Кинокритик', desc: 'Посмотрите 50 фильмов', icon: '🏆', condition: (s) => s.watched.length >= 50 },
    { id: 'hundred_movies', title: 'Легенда', desc: 'Посмотрите 100 фильмов', icon: '👑', condition: (s) => s.watched.length >= 100 },
    { id: 'first_rating', title: 'Оценщик', desc: 'Оцените первый фильм', icon: '⭐', condition: (s) => s.watched.some(m => m.userRating > 0) },
    { id: 'ten_ratings', title: 'Эксперт', desc: 'Оцените 10 фильмов', icon: '🌟', condition: (s) => s.watched.filter(m => m.userRating > 0).length >= 10 },
    { id: 'first_favorite', title: 'Любимчик', desc: 'Добавьте в избранное', icon: '❤️', condition: (s) => s.favorites.length >= 1 },
    { id: 'five_favorites', title: 'Коллекционер', desc: '5 фильмов в избранном', icon: '💕', condition: (s) => s.favorites.length >= 5 },
    { id: 'first_note', title: 'Заметки', desc: 'Напишите первую заметку', icon: '📝', condition: (s) => Object.keys(s.notes).length >= 1 },
    { id: 'serial_lover', title: 'Сериаломан', desc: '10 сериалов просмотрено', icon: '📺', condition: (s) => s.watched.filter(m => m.mediaType === 'tv').length >= 10 }
];

// DOM элементы
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchResults: document.getElementById('searchResults'),
    loading: document.getElementById('loading'),
    noResults: document.getElementById('noResults'),
    watchlistGrid: document.getElementById('watchlistGrid'),
    watchedGrid: document.getElementById('watchedGrid'),
    favoritesGrid: document.getElementById('favoritesGrid'),
    watchlistCount: document.getElementById('watchlistCount'),
    watchedCount: document.getElementById('watchedCount'),
    favoritesCount: document.getElementById('favoritesCount'),
    emptyWatchlist: document.getElementById('emptyWatchlist'),
    emptyWatched: document.getElementById('emptyWatched'),
    emptyFavorites: document.getElementById('emptyFavorites'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalClose: document.getElementById('modalClose'),
    modalPoster: document.getElementById('modalPoster'),
    modalTitle: document.getElementById('modalTitle'),
    modalYear: document.getElementById('modalYear'),
    modalType: document.getElementById('modalType'),
    modalRuntime: document.getElementById('modalRuntime'),
    modalImdbRating: document.getElementById('modalImdbRating'),
    modalPlot: document.getElementById('modalPlot'),
    modalGenres: document.getElementById('modalGenres'),
    modalDirector: document.getElementById('modalDirector'),
    modalActors: document.getElementById('modalActors'),
    starsContainer: document.getElementById('starsContainer'),
    ratingText: document.getElementById('ratingText'),
    userRatingSection: document.getElementById('userRatingSection'),
    modalActions: document.getElementById('modalActions'),
    toastContainer: document.getElementById('toastContainer'),
    categoriesGrid: document.getElementById('categoriesGrid'),
    categoryResultsSection: document.getElementById('categoryResultsSection'),
    resultsSection: document.getElementById('resultsSection'),
    categoryMovies: document.getElementById('categoryMovies'),
    categoryName: document.getElementById('categoryName'),
    categoryTitle: document.getElementById('categoryTitle'),
    backToCategories: document.getElementById('backToCategories'),
    categoryPagination: document.getElementById('categoryPagination'),
    // Streaming buttons
    btnGoogle: document.getElementById('btnGoogle'),
    btnVk: document.getElementById('btnVk'),
    btnRutube: document.getElementById('btnRutube'),
    btnTvoe: document.getElementById('btnTvoe'),
    btnKinoflex: document.getElementById('btnKinoflex'),
    btnKinopoisk: document.getElementById('btnKinopoisk'),
    btnIvi: document.getElementById('btnIvi'),
    btnOkko: document.getElementById('btnOkko'),
    trailerContainer: document.getElementById('trailerContainer'),
    trailerSection: document.getElementById('trailerSection'),
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    randomMovieBtn: document.getElementById('randomMovieBtn'),
    randomInCategoryBtn: document.getElementById('randomInCategoryBtn'),
    // Pages
    mainHeader: document.getElementById('mainHeader'),
    categoriesSection: document.getElementById('categoriesSection'),
    myListsSection: document.getElementById('myListsSection'),
    discoverSection: document.getElementById('discoverSection'),
    statsSection: document.getElementById('statsSection'),
    settingsSection: document.getElementById('settingsSection'),
    // Discover
    trendingMovies: document.getElementById('trendingMovies'),
    topRatedMovies: document.getElementById('topRatedMovies'),
    upcomingMovies: document.getElementById('upcomingMovies'),
    // New elements
    favoriteBtn: document.getElementById('favoriteBtn'),
    movieNotes: document.getElementById('movieNotes'),
    saveNotesBtn: document.getElementById('saveNotesBtn'),
    notesSection: document.getElementById('notesSection'),
    similarMovies: document.getElementById('similarMovies'),
    similarSection: document.getElementById('similarSection'),
    // Filters
    filterYear: document.getElementById('filterYear'),
    filterGenre: document.getElementById('filterGenre'),
    filterRating: document.getElementById('filterRating'),
    filterSort: document.getElementById('filterSort'),
    clearFilters: document.getElementById('clearFilters'),
    filtersSection: document.getElementById('filtersSection'),
    // Export/Import
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    // Tabs
    tabs: document.querySelectorAll('.tab')
};

// ==================== LocalStorage ====================

function loadFromStorage() {
    try {
        const watchlist = localStorage.getItem('movieTracker_watchlist');
        const watched = localStorage.getItem('movieTracker_watched');
        const favorites = localStorage.getItem('movieTracker_favorites');
        const notes = localStorage.getItem('movieTracker_notes');
        const history = localStorage.getItem('movieTracker_history');
        const theme = localStorage.getItem('movieTracker_theme');
        
        state.watchlist = watchlist ? JSON.parse(watchlist) : [];
        state.watched = watched ? JSON.parse(watched) : [];
        state.favorites = favorites ? JSON.parse(favorites) : [];
        state.notes = notes ? JSON.parse(notes) : {};
        state.history = history ? JSON.parse(history) : [];
        state.currentTheme = theme || 'gold';
        
        // Применяем тему
        document.documentElement.setAttribute('data-theme', state.currentTheme);
        updateThemeOptions();
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        state.watchlist = [];
        state.watched = [];
        state.favorites = [];
        state.notes = {};
        state.history = [];
    }
}

function saveToStorage() {
    try {
        localStorage.setItem('movieTracker_watchlist', JSON.stringify(state.watchlist));
        localStorage.setItem('movieTracker_watched', JSON.stringify(state.watched));
        localStorage.setItem('movieTracker_favorites', JSON.stringify(state.favorites));
        localStorage.setItem('movieTracker_notes', JSON.stringify(state.notes));
        localStorage.setItem('movieTracker_history', JSON.stringify(state.history));
        localStorage.setItem('movieTracker_theme', state.currentTheme);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Ошибка сохранения данных', 'error');
    }
}

// ==================== API Functions ====================

async function fetchFromAPI(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    url.searchParams.append('language', 'ru-RU');
    
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (error) {
        console.error('API fetch error:', error);
        return null;
    }
}

async function searchMovies(query) {
    showLoading(true);
    hideNoResults();
    hideCategorySection();
    
    const data = await fetchFromAPI('/search/multi', { query, page: 1 });
    
    showLoading(false);
    
    if (data && data.results && data.results.length > 0) {
        // Фильтруем только фильмы и сериалы
        const results = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
        state.searchResults = results;
        renderSearchResults(results);
        elements.resultsSection.style.display = 'block';
    } else {
        state.searchResults = [];
        showNoResults();
    }
}

async function getMovieDetails(id, mediaType = 'movie') {
    const endpoint = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const data = await fetchFromAPI(endpoint, { append_to_response: 'credits,similar' });
    return data;
}

async function loadCategories() {
    const movieGenres = await fetchFromAPI('/genre/movie/list');
    const tvGenres = await fetchFromAPI('/genre/tv/list');
    
    if (movieGenres && movieGenres.genres) {
        state.categories = movieGenres.genres;
        renderCategories();
    }
}

async function loadMoviesByCategory(genreId, page = 1) {
    showLoading(true);
    
    const data = await fetchFromAPI('/discover/movie', { 
        with_genres: genreId,
        page: page,
        sort_by: 'popularity.desc'
    });
    
    showLoading(false);
    
    if (data && data.results) {
        state.categoryPage = page;
        state.currentCategory = genreId;
        state.categoryMovies = data.results;
        renderCategoryMovies(data.results);
        renderPagination(data.page, data.total_pages, genreId);
        showCategorySection();
    }
}

// ==================== Discover Functions ====================

async function loadDiscoverContent() {
    // Trending
    const trending = await fetchFromAPI('/trending/movie/week');
    if (trending && trending.results) {
        elements.trendingMovies.innerHTML = trending.results.slice(0, 10).map(movie => {
            movie.media_type = 'movie';
            return createMovieCardTMDB(movie);
        }).join('');
        attachCardListeners();
    }
    
    // Top Rated
    const topRated = await fetchFromAPI('/movie/top_rated');
    if (topRated && topRated.results) {
        elements.topRatedMovies.innerHTML = topRated.results.slice(0, 10).map(movie => {
            movie.media_type = 'movie';
            return createMovieCardTMDB(movie);
        }).join('');
        attachCardListeners();
    }
    
    // Upcoming
    const upcoming = await fetchFromAPI('/movie/upcoming');
    if (upcoming && upcoming.results) {
        elements.upcomingMovies.innerHTML = upcoming.results.slice(0, 10).map(movie => {
            movie.media_type = 'movie';
            return createMovieCardTMDB(movie);
        }).join('');
        attachCardListeners();
    }
}

// ==================== Random Movie ====================

async function loadRandomMovie() {
    showToast('Ищем случайный фильм...', 'success');
    
    // Выбираем случайную категорию
    const randomGenre = state.categories[Math.floor(Math.random() * state.categories.length)];
    
    // Выбираем случайную страницу (1-10)
    const randomPage = Math.floor(Math.random() * 10) + 1;
    
    const data = await fetchFromAPI('/discover/movie', { 
        with_genres: randomGenre.id,
        page: randomPage,
        sort_by: 'popularity.desc'
    });
    
    if (data && data.results && data.results.length > 0) {
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        randomMovie.media_type = 'movie';
        openModal(randomMovie.id, 'movie');
    }
}

async function loadRandomInCategory() {
    if (!state.currentCategory) return;
    
    // Выбираем случайную страницу
    const randomPage = Math.floor(Math.random() * 10) + 1;
    
    const data = await fetchFromAPI('/discover/movie', { 
        with_genres: state.currentCategory,
        page: randomPage,
        sort_by: 'popularity.desc'
    });
    
    if (data && data.results && data.results.length > 0) {
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        randomMovie.media_type = 'movie';
        openModal(randomMovie.id, 'movie');
    }
}

// ==================== Page Navigation ====================

function switchPage(pageName) {
    state.currentPage = pageName;
    
    // Update nav links
    elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });
    
    // Hide all sections
    elements.mainHeader.style.display = 'none';
    elements.categoriesSection.style.display = 'none';
    elements.myListsSection.style.display = 'none';
    elements.discoverSection.style.display = 'none';
    elements.resultsSection.style.display = 'none';
    elements.categoryResultsSection.style.display = 'none';
    elements.statsSection.style.display = 'none';
    elements.settingsSection.style.display = 'none';
    
    // Show relevant sections
    switch(pageName) {
        case 'home':
            elements.mainHeader.style.display = 'block';
            elements.categoriesSection.style.display = 'block';
            elements.myListsSection.style.display = 'block';
            break;
        case 'discover':
            elements.discoverSection.style.display = 'block';
            loadDiscoverContent();
            break;
        case 'mylist':
            elements.myListsSection.style.display = 'block';
            break;
        case 'stats':
            elements.statsSection.style.display = 'block';
            updateStatistics();
            break;
        case 'settings':
            elements.settingsSection.style.display = 'block';
            updateSettingsStats();
            break;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== Tab Navigation ====================

function switchTab(tabName) {
    state.currentTab = tabName;
    
    // Update tabs
    elements.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Hide all grids
    elements.watchlistGrid.style.display = 'none';
    elements.watchedGrid.style.display = 'none';
    elements.favoritesGrid.style.display = 'none';
    elements.emptyWatchlist.classList.remove('active');
    elements.emptyWatched.classList.remove('active');
    elements.emptyFavorites.classList.remove('active');
    
    // Show relevant grid
    switch(tabName) {
        case 'watchlist':
            elements.watchlistGrid.style.display = 'grid';
            if (state.watchlist.length === 0) {
                elements.emptyWatchlist.classList.add('active');
            }
            break;
        case 'watched':
            elements.watchedGrid.style.display = 'grid';
            elements.watchedGrid.classList.add('active');
            if (state.watched.length === 0) {
                elements.emptyWatched.classList.add('active');
            }
            break;
        case 'favorites':
            elements.favoritesGrid.style.display = 'grid';
            elements.favoritesGrid.classList.add('active');
            if (state.favorites.length === 0) {
                elements.emptyFavorites.classList.add('active');
            }
            break;
    }
}

// ==================== Render Functions ====================

function renderCategories() {
    const categoryIcons = {
        28: '💥', // Боевик
        12: '🗺️', // Приключения
        16: '🎨', // Мультфильм
        35: '😂', // Комедия
        80: '🔍', // Криминал
        99: '📹', // Документальный
        18: '🎭', // Драма
        10751: '👨‍👩‍👧‍👦', // Семейный
        14: '🔮', // Фэнтези
        36: '📜', // История
        27: '👻', // Ужасы
        10402: '🎵', // Музыка
        9648: '🧩', // Детектив
        10749: '❤️', // Мелодрама
        878: '🚀', // Научная фантастика
        10770: '📺', // Телевизионный фильм
        53: '😱', // Триллер
        10752: '⚔️', // Военный
        37: '🤠' // Вестерн
    };
    
    elements.categoriesGrid.innerHTML = state.categories.map(category => `
        <button class="category-card" data-genre-id="${category.id}" data-genre-name="${category.name}">
            <span class="category-icon">${categoryIcons[category.id] || '🎬'}</span>
            <span class="category-name">${category.name}</span>
        </button>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const genreId = card.dataset.genreId;
            const genreName = card.dataset.genreName;
            elements.categoryName.textContent = genreName;
            loadMoviesByCategory(genreId);
        });
    });
}

function renderCategoryMovies(movies) {
    elements.categoryMovies.innerHTML = movies.map(movie => createMovieCardTMDB(movie)).join('');
    attachCardListeners();
}

function renderPagination(currentPage, totalPages, genreId) {
    if (totalPages <= 1) {
        elements.categoryPagination.innerHTML = '';
        return;
    }
    
    let paginationHtml = '';
    
    if (currentPage > 1) {
        paginationHtml += `<button class="page-btn" data-page="${currentPage - 1}" data-genre="${genreId}">← Назад</button>`;
    }
    
    paginationHtml += `<span class="page-info">Страница ${currentPage} из ${totalPages}</span>`;
    
    if (currentPage < totalPages && currentPage < 10) {
        paginationHtml += `<button class="page-btn" data-page="${currentPage + 1}" data-genre="${genreId}">Вперёд →</button>`;
    }
    
    elements.categoryPagination.innerHTML = paginationHtml;
    
    // Add pagination listeners
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            const genre = btn.dataset.genre;
            loadMoviesByCategory(genre, page);
            window.scrollTo({ top: elements.categoryResultsSection.offsetTop - 20, behavior: 'smooth' });
        });
    });
}

function renderSearchResults(movies) {
    elements.searchResults.innerHTML = movies.map(movie => createMovieCardTMDB(movie)).join('');
    attachCardListeners();
}

function renderWatchlist() {
    const filtered = applyFilters(state.watchlist);
    elements.watchlistGrid.innerHTML = filtered.map(movie => createMovieCardFromStorage(movie, 'watchlist')).join('');
    elements.watchlistCount.textContent = state.watchlist.length;
    
    if (state.watchlist.length === 0 || filtered.length === 0) {
        if (state.watchlist.length === 0) {
            elements.emptyWatchlist.classList.add('active');
            elements.watchlistGrid.style.display = 'none';
        }
    } else {
        elements.emptyWatchlist.classList.remove('active');
        elements.watchlistGrid.style.display = 'grid';
    }
    
    attachCardListeners();
}

function renderWatched() {
    const filtered = applyFilters(state.watched);
    elements.watchedGrid.innerHTML = filtered.map(movie => createMovieCardFromStorage(movie, 'watched')).join('');
    elements.watchedCount.textContent = state.watched.length;
    
    if (state.watched.length === 0 || filtered.length === 0) {
        if (state.watched.length === 0) {
            elements.emptyWatched.classList.add('active');
        }
    } else {
        elements.emptyWatched.classList.remove('active');
    }
    
    attachCardListeners();
}

function renderFavorites() {
    const filtered = applyFilters(state.favorites);
    elements.favoritesGrid.innerHTML = filtered.map(movie => createMovieCardFromStorage(movie, 'favorites')).join('');
    elements.favoritesCount.textContent = state.favorites.length;
    
    if (state.favorites.length === 0 || filtered.length === 0) {
        if (state.favorites.length === 0) {
            elements.emptyFavorites.classList.add('active');
        }
    } else {
        elements.emptyFavorites.classList.remove('active');
    }
    
    attachCardListeners();
}

// ==================== Filters ====================

function applyFilters(movies) {
    let filtered = [...movies];
    
    const yearFilter = elements.filterYear?.value;
    const genreFilter = elements.filterGenre?.value;
    const ratingFilter = elements.filterRating?.value;
    const sortFilter = elements.filterSort?.value;
    
    // Filter by year
    if (yearFilter) {
        filtered = filtered.filter(m => m.year === yearFilter);
    }
    
    // Filter by genre
    if (genreFilter) {
        filtered = filtered.filter(m => m.genres && m.genres.includes(parseInt(genreFilter)));
    }
    
    // Filter by rating
    if (ratingFilter) {
        filtered = filtered.filter(m => m.userRating >= parseInt(ratingFilter));
    }
    
    // Sort
    if (sortFilter) {
        switch(sortFilter) {
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
                break;
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.addedAt || 0) - new Date(b.addedAt || 0));
                break;
            case 'rating-desc':
                filtered.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
                break;
            case 'rating-asc':
                filtered.sort((a, b) => (a.userRating || 0) - (b.userRating || 0));
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
                break;
        }
    }
    
    return filtered;
}

function populateFilters() {
    // Populate years
    const years = new Set();
    [...state.watchlist, ...state.watched, ...state.favorites].forEach(m => {
        if (m.year) years.add(m.year);
    });
    
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    elements.filterYear.innerHTML = '<option value="">Все годы</option>' + 
        sortedYears.map(y => `<option value="${y}">${y}</option>`).join('');
    
    // Populate genres
    elements.filterGenre.innerHTML = '<option value="">Все жанры</option>' +
        state.categories.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
}

function clearFilters() {
    elements.filterYear.value = '';
    elements.filterGenre.value = '';
    elements.filterRating.value = '';
    elements.filterSort.value = 'date-desc';
    renderAllLists();
}

function renderAllLists() {
    renderWatchlist();
    renderWatched();
    renderFavorites();
}

// ==================== Movie Cards ====================

function createMovieCardTMDB(movie) {
    const isInWatchlist = state.watchlist.some(m => m.id === movie.id);
    const isInWatched = state.watched.some(m => m.id === movie.id);
    const isInFavorites = state.favorites.some(m => m.id === movie.id);
    const watchedMovie = state.watched.find(m => m.id === movie.id);
    
    const title = movie.title || movie.name;
    const year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const mediaType = movie.media_type === 'tv' ? 'Сериал' : 'Фильм';
    
    const posterHtml = movie.poster_path 
        ? `<img src="${IMG_BASE_URL}${movie.poster_path}" alt="${title}" loading="lazy">`
        : `<div class="poster-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
           </div>`;
    
    let actionsHtml = '';
    
    if (isInWatched) {
        actionsHtml = `
            <button class="card-btn card-btn-details" data-action="details" data-id="${movie.id}" data-type="${movie.media_type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Детали</span>
            </button>
        `;
    } else if (isInWatchlist) {
        actionsHtml = `
            <button class="card-btn card-btn-watched" data-action="move-watched" data-id="${movie.id}" data-type="${movie.media_type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Смотрел</span>
            </button>
            <button class="card-btn card-btn-details" data-action="details" data-id="${movie.id}" data-type="${movie.media_type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Детали</span>
            </button>
        `;
    } else {
        actionsHtml = `
            <button class="card-btn card-btn-watchlist" data-action="add-watchlist" data-id="${movie.id}" data-type="${movie.media_type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Буду смотреть</span>
            </button>
            <button class="card-btn card-btn-details" data-action="details" data-id="${movie.id}" data-type="${movie.media_type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Детали</span>
            </button>
        `;
    }
    
    const userRatingBadge = watchedMovie && watchedMovie.userRating 
        ? `<div class="user-rating-badge">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            ${watchedMovie.userRating}/10
           </div>`
        : '';
    
    const favoriteBadge = isInFavorites 
        ? `<div class="favorite-badge">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
           </div>`
        : '';
    
    return `
        <div class="movie-card" data-id="${movie.id}" data-type="${movie.media_type}">
            <div class="movie-card-poster">
                ${posterHtml}
                ${userRatingBadge}
                ${favoriteBadge}
                <div class="movie-card-overlay">
                    <div class="movie-card-actions">
                        ${actionsHtml}
                    </div>
                </div>
            </div>
            <div class="movie-card-info">
                <h3 class="movie-card-title">${title}</h3>
                <div class="movie-card-meta">
                    <span class="movie-card-year">${year || '—'}</span>
                    <span class="movie-card-type">${mediaType}</span>
                </div>
                <div class="movie-card-rating">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    ${rating}
                </div>
            </div>
        </div>
    `;
}

function createMovieCardFromStorage(movie, context) {
    const posterHtml = movie.poster_path 
        ? `<img src="${IMG_BASE_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">`
        : `<div class="poster-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
           </div>`;
    
    let actionsHtml = '';
    
    if (context === 'watchlist') {
        actionsHtml = `
            <button class="card-btn card-btn-watched" data-action="move-watched" data-id="${movie.id}" data-type="${movie.mediaType}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Смотрел</span>
            </button>
            <button class="card-btn card-btn-details" data-action="details" data-id="${movie.id}" data-type="${movie.mediaType}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Детали</span>
            </button>
            <button class="card-btn card-btn-remove" data-action="remove" data-id="${movie.id}" data-list="watchlist">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span></span>
            </button>
        `;
    } else if (context === 'watched') {
        actionsHtml = `
            <button class="card-btn card-btn-details" data-action="details" data-id="${movie.id}" data-type="${movie.mediaType}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Детали</span>
            </button>
            <button class="card-btn card-btn-remove" data-action="remove" data-id="${movie.id}" data-list="watched">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span></span>
            </button>
        `;
    } else if (context === 'favorites') {
        actionsHtml = `
            <button class="card-btn card-btn-details" data-action="details" data-id="${movie.id}" data-type="${movie.mediaType}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Детали</span>
            </button>
            <button class="card-btn card-btn-remove" data-action="remove-favorite" data-id="${movie.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span></span>
            </button>
        `;
    }
    
    const userRatingBadge = movie.userRating 
        ? `<div class="user-rating-badge">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            ${movie.userRating}/10
           </div>`
        : '';
    
    const favoriteBadge = state.favorites.some(f => f.id === movie.id)
        ? `<div class="favorite-badge">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
           </div>`
        : '';
    
    const rating = movie.voteAverage ? movie.voteAverage.toFixed(1) : '—';
    
    return `
        <div class="movie-card" data-id="${movie.id}" data-type="${movie.mediaType}">
            <div class="movie-card-poster">
                ${posterHtml}
                ${userRatingBadge}
                ${favoriteBadge}
                <div class="movie-card-overlay">
                    <div class="movie-card-actions">
                        ${actionsHtml}
                    </div>
                </div>
            </div>
            <div class="movie-card-info">
                <h3 class="movie-card-title">${movie.title}</h3>
                <div class="movie-card-meta">
                    <span class="movie-card-year">${movie.year || '—'}</span>
                    <span class="movie-card-type">${movie.mediaType === 'tv' ? 'Сериал' : 'Фильм'}</span>
                </div>
                <div class="movie-card-rating">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    ${rating}
                </div>
            </div>
        </div>
    `;
}

// ==================== Modal Functions ====================

async function openModal(id, mediaType = 'movie') {
    const movie = await getMovieDetails(id, mediaType);
    if (!movie) {
        showToast('Не удалось загрузить информацию', 'error');
        return;
    }
    
    state.currentMovie = { ...movie, mediaType };
    
    const title = movie.title || movie.name;
    const year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
    const runtime = movie.runtime ? `${movie.runtime} мин` : (movie.episode_run_time ? `${movie.episode_run_time[0]} мин` : '—');
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—';
    
    elements.modalPoster.src = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : '';
    elements.modalPoster.alt = title;
    elements.modalTitle.textContent = title;
    elements.modalYear.textContent = year || '—';
    elements.modalType.textContent = mediaType === 'tv' ? 'Сериал' : 'Фильм';
    elements.modalRuntime.textContent = runtime;
    elements.modalImdbRating.textContent = rating;
    elements.modalPlot.textContent = movie.overview || 'Описание отсутствует';
    
    // Режиссёр
    const director = movie.credits?.crew?.find(p => p.job === 'Director');
    elements.modalDirector.textContent = director ? director.name : '—';
    
    // Актёры
    const actors = movie.credits?.cast?.slice(0, 5).map(a => a.name).join(', ') || '—';
    elements.modalActors.textContent = actors;
    
    // Жанры
    if (movie.genres && movie.genres.length > 0) {
        elements.modalGenres.innerHTML = movie.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('');
    } else {
        elements.modalGenres.innerHTML = '';
    }
    
    // Проверяем статус
    const isInWatchlist = state.watchlist.some(m => m.id === movie.id);
    const isInWatched = state.watched.some(m => m.id === movie.id);
    const isInFavorites = state.favorites.some(m => m.id === movie.id);
    const watchedMovie = state.watched.find(m => m.id === movie.id);
    
    // Кнопка избранного
    elements.favoriteBtn.classList.toggle('active', isInFavorites);
    
    // Заметки
    const note = state.notes[movie.id] || '';
    elements.movieNotes.value = note;
    
    // Рейтинг пользователя
    renderStars(watchedMovie?.userRating || 0);
    
    // Кнопки действий
    let actionsHtml = '';
    
    if (isInWatched) {
        elements.userRatingSection.style.display = 'block';
        elements.notesSection.style.display = 'block';
        actionsHtml = `
            <button class="modal-btn modal-btn-remove" data-action="remove" data-list="watched">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Удалить из списка
            </button>
        `;
    } else if (isInWatchlist) {
        elements.userRatingSection.style.display = 'none';
        elements.notesSection.style.display = 'block';
        actionsHtml = `
            <button class="modal-btn modal-btn-watched" data-action="move-watched">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Уже смотрел
            </button>
            <button class="modal-btn modal-btn-remove" data-action="remove" data-list="watchlist">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Удалить из списка
            </button>
        `;
    } else {
        elements.userRatingSection.style.display = 'block';
        elements.notesSection.style.display = 'block';
        actionsHtml = `
            <button class="modal-btn modal-btn-watched" data-action="mark-watched">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Уже смотрел
            </button>
            <button class="modal-btn modal-btn-watchlist" data-action="add-watchlist">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Буду смотреть
            </button>
        `;
    }
    
    elements.modalActions.innerHTML = actionsHtml;
    attachModalListeners();
    
    // Обновляем ссылки на стриминговые сервисы
    updateStreamingLinks(title, year);
    
    // Загружаем похожие фильмы
    renderSimilarMovies(movie.similar?.results || []);
    
    // Загружаем трейлер
    loadTrailer(title);
    
    elements.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ==================== Similar Movies ====================

function renderSimilarMovies(movies) {
    if (!movies || movies.length === 0) {
        elements.similarSection.style.display = 'none';
        return;
    }
    
    elements.similarSection.style.display = 'block';
    
    elements.similarMovies.innerHTML = movies.slice(0, 8).map(movie => {
        const title = movie.title || movie.name;
        return `
            <div class="similar-movie" data-id="${movie.id}" data-type="${movie.media_type || 'movie'}">
                ${movie.poster_path 
                    ? `<img src="${IMG_BASE_URL}${movie.poster_path}" alt="${title}">`
                    : `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236e7681'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3C/svg%3E" alt="${title}">`
                }
                <div class="similar-movie-title">${title}</div>
            </div>
        `;
    }).join('');
    
    // Add click listeners
    elements.similarMovies.querySelectorAll('.similar-movie').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.id;
            const type = el.dataset.type;
            openModal(id, type);
        });
    });
}

// ==================== Streaming Links ====================

function updateStreamingLinks(title, year) {
    const searchQuery = encodeURIComponent(title);
    const searchQueryOnline = encodeURIComponent(title + ' смотреть онлайн');
    
    // Google - смотреть онлайн
    if (elements.btnGoogle) {
        elements.btnGoogle.href = `https://www.google.com/search?q=${searchQueryOnline}`;
    }
    
    // VK Видео - поиск
    if (elements.btnVk) {
        elements.btnVk.href = `https://vk.com/video?section=search&q=${encodeURIComponent(title)}`;
    }
    
    // RUTUBE - поиск
    if (elements.btnRutube) {
        elements.btnRutube.href = `https://rutube.ru/search/?query=${searchQuery}`;
    }
    
    // TVOE - используем Google поиск по сайту (tvoe.live не имеет прямого URL для поиска)
    if (elements.btnTvoe) {
        elements.btnTvoe.href = `https://www.google.com/search?q=site%3Atvoe.live+${searchQuery}`;
    }
    
    // Kinoflex - используем Google поиск по сайту (kinoflex.ru не имеет прямого URL для поиска)
    if (elements.btnKinoflex) {
        elements.btnKinoflex.href = `https://www.google.com/search?q=site%3Akinoflex.ru+${searchQuery}`;
    }
    
    // Кинопоиск - поиск
    if (elements.btnKinopoisk) {
        elements.btnKinopoisk.href = `https://www.kinopoisk.ru/index.php?kp_query=${searchQuery}`;
    }
    
    // IVI - поиск (без слеша после /search)
    if (elements.btnIvi) {
        elements.btnIvi.href = `https://www.ivi.ru/search?q=${searchQuery}`;
    }
    
    // Okko - поиск (query в пути URL)
    if (elements.btnOkko) {
        elements.btnOkko.href = `https://okko.tv/search/${searchQuery}`;
    }
}

// ==================== Trailer ====================

async function loadTrailer(title) {
    try {
        // Ищем видео на YouTube через API
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' официальный трейлер русская озвучка')}`;
        
        // Показываем iframe с поиском YouTube
        elements.trailerContainer.innerHTML = `
            <div class="trailer-placeholder">
                <p>Нажмите, чтобы найти трейлер на YouTube</p>
                <a href="${searchUrl}" target="_blank" class="trailer-link">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                    Смотреть трейлер
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Error loading trailer:', error);
        elements.trailerContainer.innerHTML = '<p class="trailer-error">Не удалось загрузить трейлер</p>';
    }
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    state.currentMovie = null;
}

function renderStars(currentRating) {
    let starsHtml = '';
    for (let i = 1; i <= 10; i++) {
        const activeClass = i <= currentRating ? 'active' : '';
        starsHtml += `
            <div class="star ${activeClass}" data-rating="${i}">
                <svg viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </div>
        `;
    }
    elements.starsContainer.innerHTML = starsHtml;
    
    if (currentRating > 0) {
        elements.ratingText.textContent = `Моя оценка: ${currentRating} из 10`;
        elements.ratingText.classList.add('has-rating');
    } else {
        elements.ratingText.textContent = 'Нажмите, чтобы оценить';
        elements.ratingText.classList.remove('has-rating');
    }
    
    attachStarListeners();
}

// ==================== List Management ====================

function addToWatchlist(movie, mediaType) {
    if (state.watchlist.some(m => m.id === movie.id)) {
        showToast('Уже в списке "Буду смотреть"', 'error');
        return false;
    }
    
    if (state.watched.some(m => m.id === movie.id)) {
        showToast('Уже в списке "Просмотрено"', 'error');
        return false;
    }
    
    const title = movie.title || movie.name;
    const year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
    
    state.watchlist.push({
        id: movie.id,
        title: title,
        year: year,
        mediaType: mediaType,
        poster_path: movie.poster_path,
        voteAverage: movie.vote_average,
        genres: movie.genres?.map(g => g.id) || [],
        userRating: 0,
        addedAt: new Date().toISOString()
    });
    
    saveToStorage();
    renderWatchlist();
    showToast(`"${title}" добавлен в "Буду смотреть"`, 'success');
    return true;
}

function moveToWatched(id) {
    const movieIndex = state.watchlist.findIndex(m => m.id === id);
    if (movieIndex === -1) return;
    
    const movie = state.watchlist[movieIndex];
    
    state.watchlist.splice(movieIndex, 1);
    
    state.watched.push({
        ...movie,
        userRating: 0,
        watchedAt: new Date().toISOString()
    });
    
    // Add to history
    state.history.push({
        movieId: id,
        action: 'watched',
        timestamp: new Date().toISOString()
    });
    
    saveToStorage();
    renderWatchlist();
    renderWatched();
    closeModal();
    showToast(`"${movie.title}" перемещён в "Просмотрено"`, 'success');
    checkAchievements();
}

function markAsWatched(movieData) {
    if (state.watched.some(m => m.id === movieData.id)) {
        showToast('Уже в списке "Просмотрено"', 'error');
        return false;
    }
    
    // Удаляем из watchlist если там был
    const watchlistIndex = state.watchlist.findIndex(m => m.id === movieData.id);
    if (watchlistIndex !== -1) {
        state.watchlist.splice(watchlistIndex, 1);
    }
    
    const title = movieData.title || movieData.name;
    const year = (movieData.release_date || movieData.first_air_date || '').substring(0, 4);
    
    state.watched.push({
        id: movieData.id,
        title: title,
        year: year,
        mediaType: movieData.mediaType,
        poster_path: movieData.poster_path,
        voteAverage: movieData.vote_average,
        genres: movieData.genres?.map(g => g.id) || [],
        userRating: 0,
        watchedAt: new Date().toISOString(),
        addedAt: new Date().toISOString()
    });
    
    // Add to history
    state.history.push({
        movieId: movieData.id,
        action: 'watched',
        timestamp: new Date().toISOString()
    });
    
    saveToStorage();
    renderWatchlist();
    renderWatched();
    openModal(movieData.id, movieData.mediaType);
    showToast(`"${title}" добавлен в "Просмотрено"`, 'success');
    checkAchievements();
    return true;
}

function removeFromList(id, listName) {
    const list = listName === 'watchlist' ? state.watchlist : state.watched;
    const movieIndex = list.findIndex(m => m.id === id);
    
    if (movieIndex !== -1) {
        const movie = list[movieIndex];
        list.splice(movieIndex, 1);
        saveToStorage();
        
        if (listName === 'watchlist') {
            renderWatchlist();
        } else {
            renderWatched();
        }
        
        showToast(`"${movie.title}" удалён из списка`, 'success');
    }
    
    closeModal();
}

function toggleFavorite(movie) {
    const index = state.favorites.findIndex(m => m.id === movie.id);
    
    if (index !== -1) {
        state.favorites.splice(index, 1);
        showToast('Удалено из избранного', 'success');
    } else {
        state.favorites.push({
            id: movie.id,
            title: movie.title || movie.name,
            year: (movie.release_date || movie.first_air_date || '').substring(0, 4),
            mediaType: state.currentMovie.mediaType,
            poster_path: movie.poster_path,
            voteAverage: movie.vote_average,
            addedAt: new Date().toISOString()
        });
        showToast('Добавлено в избранное', 'success');
    }
    
    elements.favoriteBtn.classList.toggle('active', index === -1);
    saveToStorage();
    renderFavorites();
    checkAchievements();
}

function removeFromFavorites(id) {
    const index = state.favorites.findIndex(m => m.id === id);
    if (index !== -1) {
        state.favorites.splice(index, 1);
        saveToStorage();
        renderFavorites();
        showToast('Удалено из избранного', 'success');
    }
}

function setUserRating(rating) {
    if (!state.currentMovie) return;
    
    const movieIndex = state.watched.findIndex(m => m.id === state.currentMovie.id);
    if (movieIndex === -1) return;
    
    state.watched[movieIndex].userRating = rating;
    saveToStorage();
    renderStars(rating);
    renderWatched();
    showToast(`Ваша оценка: ${rating}/10`, 'success');
    checkAchievements();
}

function saveNote() {
    if (!state.currentMovie) return;
    
    const note = elements.movieNotes.value.trim();
    
    if (note) {
        state.notes[state.currentMovie.id] = note;
        showToast('Заметка сохранена', 'success');
    } else {
        delete state.notes[state.currentMovie.id];
    }
    
    saveToStorage();
    checkAchievements();
}

// ==================== Export/Import ====================

function exportData() {
    const data = {
        watchlist: state.watchlist,
        watched: state.watched,
        favorites: state.favorites,
        notes: state.notes,
        history: state.history,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movie-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Данные экспортированы', 'success');
}

function importData(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.watchlist) state.watchlist = data.watchlist;
            if (data.watched) state.watched = data.watched;
            if (data.favorites) state.favorites = data.favorites;
            if (data.notes) state.notes = data.notes;
            if (data.history) state.history = data.history;
            
            saveToStorage();
            renderAllLists();
            populateFilters();
            showToast('Данные импортированы', 'success');
            checkAchievements();
        } catch (error) {
            showToast('Ошибка при импорте данных', 'error');
        }
    };
    
    reader.readAsText(file);
}

function updateSettingsStats() {
    const statsEl = document.getElementById('settingsStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stats-summary-item">
                <div class="stats-summary-value">${state.watched.length}</div>
                <div class="stats-summary-label">Просмотрено</div>
            </div>
            <div class="stats-summary-item">
                <div class="stats-summary-value">${state.watchlist.length}</div>
                <div class="stats-summary-label">В списке</div>
            </div>
            <div class="stats-summary-item">
                <div class="stats-summary-value">${state.favorites.length}</div>
                <div class="stats-summary-label">Избранное</div>
            </div>
        `;
    }
    
    // Load settings values
    const startPage = document.getElementById('startPage');
    const showBadges = document.getElementById('showBadges');
    const confirmDelete = document.getElementById('confirmDelete');
    
    if (startPage) startPage.value = state.settings?.startPage || 'home';
    if (showBadges) showBadges.checked = state.settings?.showBadges !== false;
    if (confirmDelete) confirmDelete.checked = state.settings?.confirmDelete !== false;
}

function saveSettings() {
    const startPage = document.getElementById('startPage')?.value || 'home';
    const showBadges = document.getElementById('showBadges')?.checked !== false;
    const confirmDelete = document.getElementById('confirmDelete')?.checked !== false;
    
    state.settings = {
        startPage,
        showBadges,
        confirmDelete
    };
    
    localStorage.setItem('movieTracker_settings', JSON.stringify(state.settings));
}

function loadSettings() {
    try {
        const settings = localStorage.getItem('movieTracker_settings');
        state.settings = settings ? JSON.parse(settings) : {
            startPage: 'home',
            showBadges: true,
            confirmDelete: true
        };
    } catch (e) {
        state.settings = {
            startPage: 'home',
            showBadges: true,
            confirmDelete: true
        };
    }
}

function clearAllData() {
    if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
        state.watchlist = [];
        state.watched = [];
        state.favorites = [];
        state.notes = {};
        state.history = [];
        
        saveToStorage();
        renderAllLists();
        populateFilters();
        updateStatistics();
        
        showToast('Все данные удалены', 'success');
    }
}

// ==================== Statistics ====================

function updateStatistics() {
    // Total movies
    document.getElementById('statTotalMovies').textContent = state.watched.length;
    
    // Average rating
    const ratedMovies = state.watched.filter(m => m.userRating > 0);
    const avgRating = ratedMovies.length > 0 
        ? (ratedMovies.reduce((sum, m) => sum + m.userRating, 0) / ratedMovies.length).toFixed(1)
        : '0';
    document.getElementById('statAvgRating').textContent = avgRating;
    
    // Total hours (assuming average 2 hours per movie)
    const totalHours = state.watched.length * 2;
    document.getElementById('statTotalTime').textContent = totalHours;
    
    // Favorites
    document.getElementById('statFavorites').textContent = state.favorites.length;
    
    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const watchedThisMonth = state.watched.filter(m => 
        new Date(m.watchedAt) >= startOfMonth
    ).length;
    document.getElementById('statMonthWatched').textContent = watchedThisMonth;
    
    const addedThisMonth = [...state.watchlist, ...state.watched, ...state.favorites]
        .filter(m => new Date(m.addedAt || m.watchedAt) >= startOfMonth).length;
    document.getElementById('statMonthAdded').textContent = addedThisMonth;
    
    // Genre chart
    renderGenreChart();
    
    // Top directors
    renderTopDirectors();
    
    // Achievements
    renderAchievements();
}

function renderGenreChart() {
    const genreCounts = {};
    
    state.watched.forEach(movie => {
        if (movie.genres) {
            movie.genres.forEach(genreId => {
                const genre = state.categories.find(c => c.id === genreId);
                const name = genre ? genre.name : 'Другое';
                genreCounts[name] = (genreCounts[name] || 0) + 1;
            });
        }
    });
    
    const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    const maxCount = sortedGenres.length > 0 ? sortedGenres[0][1] : 1;
    
    const chartHtml = sortedGenres.map(([name, count]) => `
        <div class="genre-bar">
            <span class="genre-name">${name}</span>
            <div class="genre-progress">
                <div class="genre-fill" style="width: ${(count / maxCount) * 100}%">
                    <span class="genre-count">${count}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('genreChart').innerHTML = chartHtml || '<p style="color: var(--text-secondary);">Нет данных</p>';
}

function renderTopDirectors() {
    // This would require storing director info when adding movies
    document.getElementById('topDirectors').innerHTML = '<p style="color: var(--text-secondary);">Данные появятся после просмотра фильмов</p>';
}

function renderAchievements() {
    const achievementsHtml = achievementsList.map(achievement => {
        const unlocked = achievement.condition(state);
        return `
            <div class="achievement ${unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('achievementsGrid').innerHTML = achievementsHtml;
}

function checkAchievements() {
    achievementsList.forEach(achievement => {
        const wasUnlocked = localStorage.getItem(`achievement_${achievement.id}`);
        const isUnlocked = achievement.condition(state);
        
        if (isUnlocked && !wasUnlocked) {
            localStorage.setItem(`achievement_${achievement.id}`, 'true');
            showToast(`🏆 Достижение: ${achievement.title}`, 'success');
        }
    });
}

// ==================== Theme ====================

function setTheme(themeName) {
    state.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    saveToStorage();
    updateThemeOptions();
    updateThemeToggleIcon();
}

function cycleTheme() {
    const themes = ['light', 'gold', 'blue', 'green', 'purple', 'red', 'cyan'];
    const currentIndex = themes.indexOf(state.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    setTheme(nextTheme);
    
    const themeNames = {
        'light': 'Светлая',
        'gold': 'Золотая',
        'blue': 'Синяя',
        'green': 'Зелёная',
        'purple': 'Фиолетовая',
        'red': 'Красная',
        'cyan': 'Бирюзовая'
    };
    
    showToast(`Тема: ${themeNames[nextTheme]}`, 'success');
}

function updateThemeToggleIcon() {
    // Иконка палитры - просто обновляем title
    const themeNames = {
        'light': 'Светлая',
        'gold': 'Золотая',
        'blue': 'Синяя',
        'green': 'Зелёная',
        'purple': 'Фиолетовая',
        'red': 'Красная',
        'cyan': 'Бирюзовая'
    };
    if (elements.themeToggle) {
        elements.themeToggle.title = `Тема: ${themeNames[state.currentTheme]} (нажмите для выбора)`;
    }
    // Update active state in popup
    document.querySelectorAll('.theme-popup-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === state.currentTheme);
    });
}

function updateThemeOptions() {
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === state.currentTheme);
    });
}

// ==================== UI Helpers ====================

function showLoading(show) {
    elements.loading.classList.toggle('active', show);
    if (show) {
        elements.searchResults.innerHTML = '';
    }
}

function showNoResults() {
    elements.noResults.classList.add('active');
    elements.searchResults.innerHTML = '';
}

function hideNoResults() {
    elements.noResults.classList.remove('active');
}

function showCategorySection() {
    elements.categoryResultsSection.style.display = 'block';
    elements.resultsSection.style.display = 'none';
}

function hideCategorySection() {
    elements.categoryResultsSection.style.display = 'none';
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
           </svg>`
        : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
           </svg>`;
    
    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== Event Listeners ====================

function attachCardListeners() {
    document.querySelectorAll('.movie-card').forEach(card => {
        // Клик по постеру открывает детали
        const poster = card.querySelector('.movie-card-poster');
        if (poster) {
            poster.style.cursor = 'pointer';
            poster.addEventListener('click', (e) => {
                // Не открываем если клик был по кнопке
                if (e.target.closest('[data-action]')) return;
                const id = parseInt(card.dataset.id);
                const mediaType = card.dataset.type;
                openModal(id, mediaType);
            });
        }
        
        card.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                const action = btn.dataset.action;
                const id = parseInt(btn.dataset.id);
                const mediaType = btn.dataset.type;
                const list = btn.dataset.list;
                
                switch (action) {
                    case 'add-watchlist':
                        const movie = state.searchResults.find(m => m.id === id) || 
                                     state.watchlist.find(m => m.id === id) ||
                                     state.watched.find(m => m.id === id) ||
                                     state.favorites.find(m => m.id === id) ||
                                     state.categoryMovies.find(m => m.id === id);
                        if (movie) {
                            if (addToWatchlist(movie, mediaType)) {
                                // Re-render if in search results
                                if (state.searchResults.length > 0) {
                                    renderSearchResults(state.searchResults);
                                }
                            }
                        }
                        break;
                    case 'move-watched':
                        moveToWatched(id);
                        break;
                    case 'remove':
                        removeFromList(id, list);
                        break;
                    case 'remove-favorite':
                        removeFromFavorites(id);
                        break;
                    case 'details':
                        openModal(id, mediaType);
                        break;
                }
            });
        });
    });
}

function attachModalListeners() {
    elements.modalActions.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const list = btn.dataset.list;
            
            switch (action) {
                case 'add-watchlist':
                    if (state.currentMovie) {
                        if (addToWatchlist(state.currentMovie, state.currentMovie.mediaType)) {
                            openModal(state.currentMovie.id, state.currentMovie.mediaType);
                        }
                    }
                    break;
                case 'mark-watched':
                    if (state.currentMovie) {
                        markAsWatched(state.currentMovie);
                    }
                    break;
                case 'move-watched':
                    if (state.currentMovie) {
                        moveToWatched(state.currentMovie.id);
                    }
                    break;
                case 'remove':
                    if (state.currentMovie) {
                        removeFromList(state.currentMovie.id, list);
                    }
                    break;
            }
        });
    });
}

function attachStarListeners() {
    elements.starsContainer.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            setUserRating(rating);
        });
        
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            elements.starsContainer.querySelectorAll('.star').forEach((s, i) => {
                s.classList.toggle('active', i < rating);
            });
        });
    });
    
    elements.starsContainer.addEventListener('mouseleave', () => {
        const watchedMovie = state.watched.find(m => m.id === state.currentMovie?.id);
        renderStars(watchedMovie?.userRating || 0);
    });
}

// ==================== Init ====================

function init() {
    loadFromStorage();
    loadSettings();
    updateThemeToggleIcon();
    loadCategories();
    renderAllLists();
    populateFilters();
    
    // Search
    elements.searchBtn.addEventListener('click', () => {
        const query = elements.searchInput.value.trim();
        if (query) searchMovies(query);
    });
    
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = elements.searchInput.value.trim();
            if (query) searchMovies(query);
        }
    });
    
    // Modal
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });
    
    // Favorite button
    elements.favoriteBtn.addEventListener('click', () => {
        if (state.currentMovie) {
            toggleFavorite(state.currentMovie);
        }
    });
    
    // Notes
    elements.saveNotesBtn.addEventListener('click', saveNote);
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            switchPage(link.dataset.page);
        });
    });
    
    // Tabs
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });
    
    // Random movie
    elements.randomMovieBtn.addEventListener('click', loadRandomMovie);
    elements.randomInCategoryBtn?.addEventListener('click', loadRandomInCategory);
    
    // Back to categories
    elements.backToCategories?.addEventListener('click', () => {
        elements.categoryResultsSection.style.display = 'none';
        elements.categoriesSection.style.display = 'block';
    });
    
    // Filters
    elements.filterYear?.addEventListener('change', renderAllLists);
    elements.filterGenre?.addEventListener('change', renderAllLists);
    elements.filterRating?.addEventListener('change', renderAllLists);
    elements.filterSort?.addEventListener('change', renderAllLists);
    elements.clearFilters?.addEventListener('click', clearFilters);
    
    // Export/Import
    elements.exportBtn?.addEventListener('click', exportData);
    elements.importBtn?.addEventListener('click', () => elements.importFile?.click());
    elements.importFile?.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            importData(e.target.files[0]);
        }
    });
    
    // Theme toggle - cycle themes
    elements.themeToggle?.addEventListener('click', () => {
        const themes = ['gold', 'blue', 'green', 'purple', 'red', 'cyan', 'light'];
        const currentIndex = themes.indexOf(state.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    });
    
    // Theme grid on settings page
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            setTheme(card.dataset.theme);
            // Update active state
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
    
    elements.clearAllData?.addEventListener('click', clearAllData);
    
    // Settings inputs
    document.getElementById('startPage')?.addEventListener('change', saveSettings);
    document.getElementById('showBadges')?.addEventListener('change', saveSettings);
    document.getElementById('confirmDelete')?.addEventListener('change', saveSettings);
    
    // Export/Import in settings
    document.getElementById('exportBtnSettings')?.addEventListener('click', exportData);
    document.getElementById('importBtnSettings')?.addEventListener('click', () => elements.importFile?.click());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Sync functionality
    document.getElementById('generateSyncCode')?.addEventListener('click', generateSyncCode);
    document.getElementById('loadSyncCode')?.addEventListener('click', loadFromSyncCode);
    document.getElementById('copySyncCode')?.addEventListener('click', copySyncCode);
    
    // Enter key for sync code input
    document.getElementById('syncCodeInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadFromSyncCode();
        }
    });
}

// ==================== Sync Functions ====================

// Simple compression using base64
function compressData(data) {
    try {
        const json = JSON.stringify(data);
        // Try to use LZ-based compression if available, otherwise use base64
        if (typeof LZString !== 'undefined') {
            return LZString.compressToEncodedURIComponent(json);
        }
        // Fallback to base64
        return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
    } catch (e) {
        console.error('Compression error:', e);
        return null;
    }
}

function decompressData(compressed) {
    try {
        let json;
        // Try LZ-based decompression if available
        if (typeof LZString !== 'undefined') {
            json = LZString.decompressFromEncodedURIComponent(compressed);
        } else {
            // Fallback from base64
            json = decodeURIComponent(atob(compressed).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }
        return JSON.parse(json);
    } catch (e) {
        console.error('Decompression error:', e);
        return null;
    }
}

async function generateSyncCode() {
    const syncBtn = document.getElementById('generateSyncCode');
    const syncCodeDisplay = document.getElementById('syncCodeDisplay');
    const syncCodeEl = document.getElementById('syncCode');
    
    syncBtn.disabled = true;
    syncBtn.innerHTML = '<span class="loading-spinner"></span> Создание...';
    
    try {
        // Prepare minimal data for sync
        const data = {
            w: state.watchlist.map(m => ({
                id: m.id,
                t: m.title,
                y: m.year,
                m: m.mediaType,
                p: m.poster_path,
                r: m.userRating,
                g: m.genres
            })),
            wd: state.watched.map(m => ({
                id: m.id,
                t: m.title,
                y: m.year,
                m: m.mediaType,
                p: m.poster_path,
                r: m.userRating,
                g: m.genres
            })),
            f: state.favorites.map(m => ({
                id: m.id,
                t: m.title,
                y: m.year,
                m: m.mediaType,
                p: m.poster_path
            })),
            n: state.notes,
            th: state.currentTheme
        };
        
        const compressed = compressData(data);
        
        if (!compressed) {
            throw new Error('Ошибка сжатия данных');
        }
        
        // Check if code is too long
        if (compressed.length > 8000) {
            showToast('Слишком много данных! Используйте экспорт в файл.', 'error');
            syncBtn.disabled = false;
            syncBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Создать код
            `;
            return;
        }
        
        // Store in localStorage and show
        const codeId = 'KK' + Date.now().toString(36).toUpperCase();
        localStorage.setItem('syncCode_' + codeId, compressed);
        
        // Also copy to clipboard automatically
        syncCodeEl.textContent = compressed;
        syncCodeDisplay.style.display = 'block';
        
        // Update warning text
        const warningEl = syncCodeDisplay.querySelector('.sync-warning');
        if (warningEl) {
            warningEl.textContent = '📋 Код скопирован в буфер обмена. Вставьте его на другом устройстве.';
        }
        
        // Copy to clipboard
        try {
            await navigator.clipboard.writeText(compressed);
            showToast('Код создан и скопирован!', 'success');
        } catch (e) {
            showToast('Код создан! Скопируйте его вручную.', 'success');
        }
        
    } catch (error) {
        console.error('Sync error:', error);
        showToast(error.message || 'Ошибка создания кода', 'error');
    } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Создать код
        `;
    }
}

async function loadFromSyncCode() {
    const codeInput = document.getElementById('syncCodeInput');
    const loadBtn = document.getElementById('loadSyncCode');
    const code = codeInput.value.trim();
    
    if (!code || code.length < 10) {
        showToast('Введите код синхронизации', 'error');
        return;
    }
    
    loadBtn.disabled = true;
    loadBtn.innerHTML = '<span class="loading-spinner"></span> Загрузка...';
    
    try {
        // Try to decompress the code
        const data = decompressData(code);
        
        if (!data) {
            throw new Error('Неверный код или повреждённые данные');
        }
        
        // Confirm before overwriting
        const hasExistingData = state.watched.length > 0 || state.watchlist.length > 0 || state.favorites.length > 0;
        
        if (hasExistingData) {
            const confirmed = window.confirm(
                'У вас уже есть данные. Загрузка заменит их. Продолжить?\n\n' +
                'Текущие данные будут заменены данными из кода синхронизации.'
            );
            if (!confirmed) {
                showToast('Загрузка отменена', 'error');
                return;
            }
        }
        
        // Apply loaded data (convert back from compressed format)
        state.watchlist = (data.w || []).map(m => ({
            id: m.id,
            title: m.t,
            year: m.y,
            mediaType: m.m,
            poster_path: m.p,
            userRating: m.r || 0,
            genres: m.g || [],
            voteAverage: null,
            addedAt: new Date().toISOString()
        }));
        
        state.watched = (data.wd || []).map(m => ({
            id: m.id,
            title: m.t,
            year: m.y,
            mediaType: m.m,
            poster_path: m.p,
            userRating: m.r || 0,
            genres: m.g || [],
            voteAverage: null,
            watchedAt: new Date().toISOString(),
            addedAt: new Date().toISOString()
        }));
        
        state.favorites = (data.f || []).map(m => ({
            id: m.id,
            title: m.t,
            year: m.y,
            mediaType: m.m,
            poster_path: m.p,
            voteAverage: null,
            addedAt: new Date().toISOString()
        }));
        
        state.notes = data.n || {};
        
        if (data.th) {
            state.currentTheme = data.th;
            document.documentElement.setAttribute('data-theme', state.currentTheme);
            localStorage.setItem('movieTracker_theme', state.currentTheme);
            updateThemeToggleIcon();
        }
        
        saveToStorage();
        renderAllLists();
        populateFilters();
        updateSettingsStats();
        
        codeInput.value = '';
        switchPage('home');
        
        showToast(`Загружено: ${state.watched.length} просмотрено, ${state.watchlist.length} в списке`, 'success');
        
    } catch (error) {
        console.error('Load sync error:', error);
        showToast(error.message || 'Ошибка загрузки. Проверьте код.', 'error');
    } finally {
        loadBtn.disabled = false;
        loadBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Загрузить
        `;
    }
}

function copySyncCode() {
    const codeEl = document.getElementById('syncCode');
    const code = codeEl.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        showToast('Код скопирован!', 'success');
    }).catch(() => {
        // Fallback - select text
        const range = document.createRange();
        range.selectNodeContents(codeEl);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
        showToast('Код скопирован!', 'success');
    });
}

// Start app
init();
