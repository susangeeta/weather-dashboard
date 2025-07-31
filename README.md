# githublink: https://github.com/susangeeta/weather-dashboard

# Weather Forecast Application

- Current weather conditions
- Location-based forecasts
- Extended multi-day forecast
- User-friendly UI and interactions

# Features

# Setup and Tools

HTML, Tailwind CSS (compiled using npx @tailwindcss/cli)
JavaScript ES6
Git for version control

# API Integration

Weather data is fetched using WeatherAPI.com
Endpoints used: /current.json, /forecast.json

# UI Design (Responsive)

Clean and intuitive design using Tailwind CSS

# Location-Based Forecast

Search by city name  
 Use current location (via navigator.geolocation)
Recently searched cities in a dropdown (stored in localStorage)
Input validation for empty or invalid inputs
Display of current weather details:
Temperature
Humidity
Wind speed
Sunrise & sunset
Weather icons based on condition (data.day.condition.icon from API)

# Extended Forecast

Multi-day forecast (7 days)
Includes:
Date
Weather icon
Max/min temp
Wind speed
Humidity
Styled as interactive weather cards

# Error Handling

Graceful error messages on:
Invalid API response
No internet or geolocation access
Empty search
