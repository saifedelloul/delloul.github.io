# 🌤️ Weather Dashboard

A beautiful, real-time weather dashboard that fetches data from the **Open-Meteo** free weather API. No API key required!

## ✨ Features

- 🔍 **Search any city worldwide** - Geocoding integration
- 📍 **Geolocation support** - Get weather for your current location
- 📊 **Detailed weather metrics**:
  - Current temperature
  - Feels-like temperature
  - Humidity
  - Wind speed
  - Pressure
  - Visibility
  - UV Index
  - Precipitation
- 📅 **5-day forecast** - Daily weather predictions
- 🔄 **Auto-refresh** - Updates every 10 minutes
- 💾 **Local storage** - Caches last searched city
- 📱 **Fully responsive** - Works on desktop, tablet, and mobile
- 🎨 **Beautiful UI** - Modern design with animations

## 🚀 Getting Started

### Installation

1. Clone or download the project
2. No installation required - it's a static website!
3. Open `weather/index.html` in your browser

### Usage

1. **Search a city**: Type city name and click "Search"
2. **Use your location**: Click "📍 Use My Location" button
3. **Refresh data**: Click the "🔄" button on the weather card

## 🔧 How It Works

### APIs Used

1. **Open-Meteo Geocoding API**
   - Converts city names to coordinates
   - Endpoint: `https://geocoding-api.open-meteo.com/v1/search`

2. **Open-Meteo Weather API**
   - Fetches real-time and forecast weather data
   - Endpoint: `https://api.open-meteo.com/v1/forecast`
   - No authentication required!

### Key Functions

```javascript
// Search for a city and get weather
geocode City(city)     // Geocodes city name to coordinates
fetchWeather()         // Gets weather data for coordinates
updateWeatherUI()      // Renders weather on page
updateForecast()       // Shows 5-day forecast
```

## 📁 File Structure

```
weather/
├── index.html       # Main HTML file
├── styles.css       # Styling and responsive design
├── script.js        # Weather fetching and UI logic
└── README.md        # This file
```

## 🎨 Customization

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #3b82f6;      /* Main color */
    --secondary-color: #1e40af;    /* Secondary color */
    --success-color: #10b981;      /* Success color */
    /* ... more colors ... */
}
```

### Change Refresh Interval

Edit in `script.js`:

```javascript
REFRESH_INTERVAL: 10 * 60 * 1000,  // Change 10 to desired minutes
```

### Add More Weather Details

Modify the API call in `fetchWeather()` to request additional parameters:

```javascript
current=temperature_2m,humidity,wind_speed_10m,weather_code,precipitation
```

[Full list of available parameters](https://open-meteo.com/en/docs)

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Privacy

- **No API key needed** - Uses free Open-Meteo API
- **No tracking** - All data is client-side
- **Geolocation opt-in** - Only used if you click the button
- **Local storage** - Caches only your last search

## 🐛 Troubleshooting

### "City not found" error
- Try using the full city name with country (e.g., "Paris, France")
- Check spelling

### Geolocation not working
- Enable location permission in browser settings
- Not available on non-HTTPS sites (except localhost)

### No forecast showing
- The API returns 7-day forecast; displaying 5 most relevant days
- Some locations may have limited forecast data

## 📚 API Documentation

- [Open-Meteo Weather API](https://open-meteo.com/en/docs)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

## 📄 License

Free to use and modify for personal or commercial projects.

## 🙏 Credits

- Weather data: [Open-Meteo](https://open-meteo.com)
- Icons: Unicode emojis
- Design: Custom CSS

---

**Created with ❤️ for weather enthusiasts**
