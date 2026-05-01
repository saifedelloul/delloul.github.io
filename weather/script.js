// Configuration
const CONFIG = {
    API_BASE_URL: 'https://geocoding-api.open-meteo.com/v1',
    WEATHER_API_URL: 'https://api.open-meteo.com/v1/forecast',
    REFRESH_INTERVAL: 10 * 60 * 1000, // 10 minutes
};

// DOM Elements
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    weatherCard: document.getElementById('weatherCard'),
    forecastSection: document.getElementById('forecastSection'),
    welcome: document.getElementById('welcome'),
    cityName: document.getElementById('cityName'),
    lastUpdated: document.getElementById('lastUpdated'),
    temperature: document.getElementById('temperature'),
    description: document.getElementById('description'),
    feelsLike: document.getElementById('feelsLike'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    uvIndex: document.getElementById('uvIndex'),
    precipitation: document.getElementById('precipitation'),
    weatherIcon: document.getElementById('weatherIcon'),
    forecastContainer: document.getElementById('forecastContainer'),
};

// Weather condition to emoji mapping
const weatherEmojis = {
    'Clear sky': '☀️',
    'Mainly clear': '🌤️',
    'Partly cloudy': '⛅',
    'Overcast': '☁️',
    'Foggy': '🌫️',
    'Drizzle': '🌧️',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Rain showers': '🌧️',
    'Snow showers': '🌨️',
    'Thunderstorm': '⛈️',
    'Freezing rain': '🧊',
};

// State
let currentWeatherData = null;
let currentLocation = null;
let autoRefreshInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadFromLocalStorage();
});

function setupEventListeners() {
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    elements.locationBtn.addEventListener('click', handleLocationRequest);
    elements.refreshBtn.addEventListener('click', () => {
        if (currentLocation) fetchWeather(currentLocation.latitude, currentLocation.longitude);
    });
}

function handleSearch() {
    const city = elements.cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    geocodeCity(city);
}

function handleLocationRequest() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude);
            getReverseGeocoding(latitude, longitude);
        },
        (error) => {
            showLoading(false);
            let errorMessage = 'Unable to get your location';
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = 'Location permission denied';
            }
            showError(errorMessage);
        }
    );
}

async function geocodeCity(city) {
    try {
        showLoading(true);
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            showError(`City "${city}" not found. Please try another name.`);
            showLoading(false);
            return;
        }

        const result = data.results[0];
        currentLocation = {
            latitude: result.latitude,
            longitude: result.longitude,
            name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`,
        };
        elements.cityInput.value = '';
        fetchWeather(result.latitude, result.longitude);
    } catch (error) {
        showError('Error searching for city: ' + error.message);
        showLoading(false);
    }
}

async function getReverseGeocoding(latitude, longitude) {
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
            const result = data.results[0];
            if (currentLocation) {
                currentLocation.name = `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`;
                updateLocationDisplay();
            }
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
    }
}

async function fetchWeather(latitude, longitude) {
    try {
        showLoading(true);
        const response = await fetch(
            `${CONFIG.WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,weather_code,visibility,uv_index,precipitation&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`
        );
        const data = await response.json();
        currentWeatherData = data;
        updateWeatherUI(data);
        saveToLocalStorage();
        setupAutoRefresh();
        showLoading(false);
    } catch (error) {
        showError('Error fetching weather data: ' + error.message);
        showLoading(false);
    }
}

function updateWeatherUI(data) {
    const current = data.current;
    const daily = data.daily;

    // Hide welcome section and show weather card
    elements.welcome.classList.add('hidden');
    elements.weatherCard.classList.remove('hidden');
    elements.error.classList.add('hidden');

    // Update current weather
    updateLocationDisplay();
    elements.temperature.textContent = Math.round(current.temperature_2m);
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    elements.pressure.textContent = `${data.current_units.pressure}` || 'N/A';
    elements.visibility.textContent = `${Math.round(current.visibility / 1000)} km`;
    elements.uvIndex.textContent = `${Math.round(current.uv_index * 10) / 10}`;
    elements.precipitation.textContent = `${current.precipitation} mm`;
    elements.feelsLike.textContent = `Feels like ${Math.round(current.apparent_temperature)}°C`;

    // Get weather description and icon
    const weatherCode = current.weather_code;
    const { description, emoji } = getWeatherDescription(weatherCode);
    elements.description.textContent = description;
    elements.weatherIcon.textContent = emoji;

    // Update timestamp
    elements.lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

    // Update forecast
    updateForecast(daily);
}

function updateLocationDisplay() {
    if (currentLocation) {
        elements.cityName.textContent = currentLocation.name;
    }
}

function updateForecast(daily) {
    elements.forecastContainer.innerHTML = '';
    elements.forecastSection.classList.remove('hidden');

    const today = new Date().toDateString();

    for (let i = 1; i < Math.min(6, daily.time.length); i++) {
        const date = new Date(daily.time[i]);
        if (date.toDateString() === today) continue;

        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const weatherCode = daily.weather_code[i];
        const { emoji } = getWeatherDescription(weatherCode);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div class="forecast-icon">${emoji}</div>
            <div class="forecast-temps">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
        `;
        elements.forecastContainer.appendChild(card);
    }
}

function getWeatherDescription(code) {
    // WMO Weather interpretation codes
    const descriptions = {
        0: { text: 'Clear sky', emoji: weatherEmojis['Clear sky'] },
        1: { text: 'Mainly clear', emoji: weatherEmojis['Mainly clear'] },
        2: { text: 'Partly cloudy', emoji: weatherEmojis['Partly cloudy'] },
        3: { text: 'Overcast', emoji: weatherEmojis['Overcast'] },
        45: { text: 'Foggy', emoji: weatherEmojis['Foggy'] },
        48: { text: 'Foggy', emoji: weatherEmojis['Foggy'] },
        51: { text: 'Drizzle', emoji: weatherEmojis['Drizzle'] },
        53: { text: 'Drizzle', emoji: weatherEmojis['Drizzle'] },
        55: { text: 'Drizzle', emoji: weatherEmojis['Drizzle'] },
        61: { text: 'Rain', emoji: weatherEmojis['Rain'] },
        63: { text: 'Rain', emoji: weatherEmojis['Rain'] },
        65: { text: 'Rain', emoji: weatherEmojis['Rain'] },
        71: { text: 'Snow', emoji: weatherEmojis['Snow'] },
        73: { text: 'Snow', emoji: weatherEmojis['Snow'] },
        75: { text: 'Snow', emoji: weatherEmojis['Snow'] },
        77: { text: 'Snow', emoji: weatherEmojis['Snow'] },
        80: { text: 'Rain showers', emoji: weatherEmojis['Rain showers'] },
        81: { text: 'Rain showers', emoji: weatherEmojis['Rain showers'] },
        82: { text: 'Rain showers', emoji: weatherEmojis['Rain showers'] },
        85: { text: 'Snow showers', emoji: weatherEmojis['Snow showers'] },
        86: { text: 'Snow showers', emoji: weatherEmojis['Snow showers'] },
        80: { text: 'Thunderstorm', emoji: weatherEmojis['Thunderstorm'] },
        82: { text: 'Thunderstorm', emoji: weatherEmojis['Thunderstorm'] },
        95: { text: 'Thunderstorm', emoji: weatherEmojis['Thunderstorm'] },
        96: { text: 'Thunderstorm', emoji: weatherEmojis['Thunderstorm'] },
        99: { text: 'Thunderstorm', emoji: weatherEmojis['Thunderstorm'] },
    };

    return descriptions[code] || { text: 'Unknown', emoji: '🌐' };
}

function setupAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(() => {
        if (currentLocation) {
            fetchWeather(currentLocation.latitude, currentLocation.longitude);
        }
    }, CONFIG.REFRESH_INTERVAL);
}

function showLoading(show) {
    if (show) {
        elements.loading.classList.remove('hidden');
    } else {
        elements.loading.classList.add('hidden');
    }
}

function showError(message) {
    elements.error.textContent = message;
    elements.error.classList.remove('hidden');
    setTimeout(() => {
        elements.error.classList.add('hidden');
    }, 5000);
}

function saveToLocalStorage() {
    if (currentLocation && currentWeatherData) {
        localStorage.setItem('lastWeatherLocation', JSON.stringify({
            location: currentLocation,
            weather: currentWeatherData,
            timestamp: Date.now(),
        }));
    }
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('lastWeatherLocation');
    if (stored) {
        const data = JSON.parse(stored);
        const oneHourAgo = Date.now() - 60 * 60 * 1000;

        if (data.timestamp > oneHourAgo) {
            currentLocation = data.location;
            currentWeatherData = data.weather;
            updateWeatherUI(data.weather);
        }
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
});