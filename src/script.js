const WEATHER_CONFIG = {
  apiUrl: "https://api.weatherapi.com/v1",
  apiKey: "83a25a24e11f475eb6895411252507",
};
let currentDay = 0;

// current time update
function updateDateTime() {
  const date = document.getElementById("date");
  const dayDate = document.getElementById("day-date");

  if (date) {
    date.innerHTML = `${dayjs().format(
      "hh"
    )} <span class="pulse-colon">: </span>${dayjs().format("mm A")}`;
  }

  if (dayDate) {
    dayDate.innerHTML = `<span class="w-2 h-2 bg-[#6298f4] rounded-full"></span>
                ${dayjs().format("dddd")}, ${dayjs().format("D MMMM, YYYY")}`;
  }
}

updateDateTime();

/*Weather insights */

const elements = {
  location: document.getElementById("location-name"),
  temperature: document.getElementById("tempreture"),
  windSpeed: document.getElementById("wind-speed"),
  humidity: document.getElementById("humidity"),
  condition: document.getElementById("condition"),
  currentDate: document.getElementById("current-date"),
};

async function updateWeatherData(lat, lon) {
  try {
    if (!elements.temperature && !elements.windSpeed) {
      console.warn("No weather display elements found");
      return;
    }

    const url = `${WEATHER_CONFIG.apiUrl}/current.json?key=${WEATHER_CONFIG.apiKey}&q=${lat},${lon}&alerts=no`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Weather API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const { current, location } = data;
    console.log(data);

    if (elements.currentDate) {
      const now = dayjs();
      const formattedTime = now.format("[Today], D MMMM");
      elements.currentDate.textContent = formattedTime;
    }

    if (elements.location && location.name) {
      elements.location.textContent = location.name;
    }

    if (elements.temperature && current?.temp_c !== undefined) {
      elements.temperature.textContent = `${Math.round(current.temp_c)}°`;
    }

    if (elements.windSpeed && current?.wind_kph !== undefined) {
      elements.windSpeed.textContent = `${current.wind_kph}Km/h`;
    }

    if (elements.humidity && current?.humidity !== undefined) {
      elements.humidity.textContent = `${current.humidity}%`;
    }

    if (elements.condition && current?.condition?.text !== undefined) {
      elements.condition.textContent = `${current.condition.text}`;
    }
  } catch (error) {
    console.error("Failed to fetch weather data:", error);

    if (elements.temperature) {
      elements.temperature.textContent = "--";
    }
    if (elements.windSpeed) {
      elements.windSpeed.textContent = "--";
    }
    if (elements.humidity) {
      elements.humidity.textContent = "--";
    }
    if (elements.condition) {
      elements.condition.textContent = "--";
    }
  }
}
/* End Weather insights */

//Location Access
async function gotLocation(position) {
  await updateWeatherData(position.coords.latitude, position.coords.longitude);
  await forecastWeather(position.coords.latitude, position.coords.longitude);
}

function failedToGet(error) {
  alert("Failed to get location:", error.message);
}

// Ask for location as soon as page loads
window.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(gotLocation, failedToGet);
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
});

/** Search Location  */
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function updateLocation(lat, lon, name) {
  currentDay = 0;
  saveToHistory({ name, lat, lon });

  await updateWeatherData(lat, lon);
  await forecastWeather(lat, lon);

  const dropdown = document.getElementById("dropdown-search");
  const searchInput = document.getElementById("search-input");

  if (dropdown) dropdown.classList.add("hidden");
  if (searchInput) searchInput.value = "";
}

function saveToHistory(location) {
  const historyKey = "weather_location_history";

  let history = JSON.parse(localStorage.getItem(historyKey)) || [];

  // Remove duplicate entries by name
  history = history.filter((item) => item.name !== location.name);

  // Add the new location to the beginning
  history.unshift(location);

  // Limit to last 5 locations (you can change this number)
  history = history.slice(0, 5);

  localStorage.setItem(historyKey, JSON.stringify(history));

  // Optionally re-render drawer if it's open
  renderHistoryDrawer();
}

function renderHistoryDrawer() {
  const container = document.getElementById("drawer-history");
  const history =
    JSON.parse(localStorage.getItem("weather_location_history")) || [];

  if (!container) return;

  if (history.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-center">No location history found</p>
        <p class="text-gray-400 text-sm text-center mt-1">Search for locations to see them here</p>
      </div>`;
    return;
  }

  container.innerHTML = history
    .map(
      (loc) => `
      <div onclick="updateLocation('${loc.lat}', '${loc.lon}', '${loc.name}')"
           class="group bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md">
        <div class="p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-gray-900 font-semibold text-lg group-hover:text-blue-600 transition-colors">${
                loc.name
              }</h3>
              <p class="text-gray-500 text-sm mt-1">Tap to view weather</p>
            </div>
            <div class="text-right ml-4">
              <div class="bg-gray-50 group-hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors">
                <p class="text-gray-600 text-xs font-medium">Coordinates</p>
                <p class="text-gray-800 text-xs">${parseFloat(loc.lat).toFixed(
                  2
                )}, ${parseFloat(loc.lon).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

async function handleSearchInput(e) {
  const query = e.target.value.trim();
  const dropdown = document.getElementById("dropdown-search");

  if (!dropdown) return;

  dropdown.classList.remove("hidden");

  if (!query) {
    dropdown.classList.add("hidden");
    return;
  } else {
    dropdown.classList.remove("hidden");
  }

  dropdown.innerHTML = Array.from({ length: 5 })
    .map(
      () => `
      <div class="flex flex-row gap-4 items-center p-4 animate-pulse">
        <div class="flex-shrink-0 w-8 h-8 bg-gray-400/30 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 w-24 bg-gray-300/40 rounded mb-1"></div>
          <div class="h-3 w-32 bg-gray-200/40 rounded"></div>
        </div>
        <div class="w-3 h-3 bg-gray-300/30 rounded-full"></div>
      </div>
    `
    )
    .join("");
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${WEATHER_CONFIG.apiKey}&q=${query}`
    );
    const data = await res.json();
    // await delay(2000);

    if (data?.length > 0) {
      dropdown.innerHTML = data
        .map(
          (item) => `
           <div onclick="updateLocation('${item.lat}', '${
            item.lon
          }', '${item.name.replace(/'/g, "\\'")}'); hideDropdown();" 
                 class="flex dropdown-item flex-row gap-4 items-center p-4 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:translate-x-1 border-l-3 border-transparent hover:border-white/30 first:rounded-t-xl last:rounded-b-xl">
              <div class="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i class="fas fa-map-marker-alt text-white text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="font-medium text-base text-white">${item.name}</p>
                <p class="text-sm text-white/70">${
                  item.region ? item.region + ", " : ""
                }${item.country}</p>
              </div>
              <i class="fas fa-chevron-right text-white/40 text-xs"></i>
            </div>`
        )
        .join(""); // Use join() to avoid commas in HTML
    } else {
      dropdown.innerHTML = `
         <div class="flex flex-row gap-4 items-center p-4">
            <div class="flex-shrink-0 w-8 h-8 bg-red-400/20 rounded-full flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-red-300 text-sm"></i>
            </div>
            <p class="font-medium text-base text-white/80">No locations found</p>
          </div>
      `;
    }

    console.log(data);
  } catch (error) {
    console.error("Error fetching location data:", error);
    dropdown.classList.remove("hidden");
  }
}

// Attach input listener with debounce
document
  .getElementById("search-input")
  ?.addEventListener("input", debounce(handleSearchInput, 300));

function updateDate(index) {
  const currentDateAndTempreature = document.getElementById(
    `current-date-and-details-${index}`
  );
  console.log(currentDateAndTempreature);
  currentDay = index; // Update the current day when date is selected
  showHourlyForecast(index);
  updateDateRelatedData(); // Update all date-related data
}

// New function to update all date-related data when date changes
function updateDateRelatedData() {
  const data = JSON.parse(localStorage.getItem("cachedForecast"));
  if (!data) return;

  // Update sunrise/sunset
  updateSunriseSunset(data);

  // Update weather details
  updateWeatherDetails(data);

  // Update air quality
  updateAirQuality(data);
}

// surise sunset skelton
function suriseSkelton() {
  const el = document.getElementById("sunrise-sunset");
  if (el) {
    el.innerHTML = `
      <div class="bg-gray-200 rounded-3xl min-w-30 lg:min-w-full lg:w-full p-8 animate-pulse flex gap-4 border border-gray-300 shadow-md">
        <div class="h-16 w-16 bg-gray-400 rounded-full mb-2"></div>
      <div class="flex flex-col gap-3 ">
        <div class="h-3 w-52 bg-gray-300 rounded-md "></div>
        <div class="h-3 w-42 bg-gray-300 rounded-md"></div>
        <div class="h-3 w-32 bg-gray-300 rounded-md "></div></div>
      </div>
    `;
  }
}

//update sunrise and sunset
function updateSunriseSunset(data) {
  const sunrise = `
    <div class="flex justify-between p-4 rounded-2xl bg-gradient-to-r from-orange-50/50 via-yellow-50/30 to-blue-50/50 border border-orange-200/20 backdrop-blur-sm shadow-sm shadow-orange-200/30">
      
      <!-- Sunrise Section -->
      <div class="flex gap-3 items-center cursor-pointer">
        <div class="relative">
          <img src="./assests/sun-yell.png" class=" h-5 w-5 xl:h-6 xl:w-6 2xl:h-9  2xl:w-9 rotate-12 scale-110 drop-shadow-sm" />
          <div class="absolute -inset-2 bg-yellow-400/30 rounded-full blur-md animate-pulse"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full"></div>
        </div>
        <div class="flex flex-col translate-x-1">
          <h1 class="text-gray-600 text-sm font-semibold">Sunrise</h1>
          <h3 class="text-orange-500 text-sm lg:text-sm xl:text-sm 2xl:text-xl font-semibold scale-105">${data.forecast.forecastday[currentDay].astro.sunrise}</h3>
          <div class="w-full h-0.5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mt-1"></div>
        </div>
      </div>

      <!-- Divider -->
      <div class="flex flex-col items-center justify-center px-4">
        <div class="w-px h-12 bg-gradient-to-b from-orange-300/30 via-gray-300/50 to-blue-300/30"></div>
        <div class="w-2 h-2 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full my-2 animate-pulse"></div>
        <div class="w-px h-12 bg-gradient-to-b from-blue-300/30 via-gray-300/50 to-orange-300/30"></div>
      </div>

      <!-- Sunset Section -->
      <div class="flex gap-3 items-center cursor-pointer">
        <div class="relative">
          <img src="./assests/night-moon.png" class="  h-5 w-5 xl:h-6 xl:w-6 2xl:h-9  2xl:w-9 -rotate-12 scale-110 drop-shadow-sm" />
          <div class="absolute -inset-2 bg-blue-400/30 rounded-full blur-md animate-pulse"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full"></div>
        </div>
        <div class="flex flex-col translate-x-1">
          <h1 class="text-gray-600 text-sm font-semibold">Sunset</h1>
          <h3 class="text-blue-600 text-sm lg:text-sm xl:text-sm 2xl:text-xl font-semibold scale-105">${data.forecast.forecastday[currentDay].astro.sunset}</h3>
          <div class="w-full h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mt-1"></div>
        </div>
      </div>
    </div>
  `;

  const sunriseElement = document.getElementById("sunrise-sunset");
  if (sunriseElement) {
    sunriseElement.innerHTML = sunrise;
  }
}

//update weather details
function updateWeatherDetails(data) {
  const weatherDetails = `
    <div class="bg-[#f0f5ff] p-3 flex flex-col gap-2 rounded-xl ">
      <img src="./assests/clear-sky-hour.png" class="h-6 w-6" />
      <div>
        <h1 class="text-[#8bafe2] text-sm">UV</h1>
        <h1 class="text-[#8bafe2] text-sm  md:text-base font-semibold">${data.forecast.forecastday[currentDay].day.uv} Mo</h1>
      </div>
    </div>
    <div class="bg-[#f0f5ff] p-3 rounded-xl flex flex-col gap-2 ">
      <img src="./assests/thermometer-hour.png" class="h-6 w-6" />
      <div>
        <h1 class="text-[#8bafe2] text-sm">Feels like</h1>
        <h1 class="text-[#8bafe2] text-sm  md:text-base font-semibold">${data.forecast.forecastday[currentDay].day.avgtemp_c}<sup>0</sup></h1>
      </div>
    </div>
    <div class="bg-[#f0f5ff] p-3 rounded-xl flex flex-col gap-2  ">
      <img src="./assests/humidity-blue.png" class="h-6 w-6" />
      <div>
        <h1 class="text-[#8bafe2] text-sm">Humidity</h1>
        <h1 class="text-[#8bafe2] text-sm  md:text-base font-semibold">${data.forecast.forecastday[currentDay].day.avghumidity} %</h1>
      </div>
    </div>
  `;

  const weatherElement = document.getElementById("weather-check");
  if (weatherElement) {
    weatherElement.innerHTML = weatherDetails;
  }
}

//update airqualityskelton
function airQualitySkelton() {
  const el = document.getElementById("air-quality-check");
  if (el) {
    el.innerHTML = `
      <div class="bg-gray-200 rounded-3xl min-w-30 lg:min-w-full lg:w-full p-8 animate-pulse flex gap-4 border border-gray-300 shadow-md">
        <div class="h-16 w-16 bg-gray-400 rounded-full mb-2"></div>
      <div class="flex flex-col gap-3 ">
        <div class="h-3 w-52 bg-gray-300 rounded-md "></div>
        <div class="h-3 w-42 bg-gray-300 rounded-md"></div>
        <div class="h-3 w-32 bg-gray-300 rounded-md "></div></div>
      </div>
    `;
  }
}

// update airquality
function updateAirQuality(data) {
  const airQuality = `
    <div class="flex justify-between items-center">
      <h1 class="text-[#52526e] font-bold text-base md:text-lg flex items-center gap-3">
        <div class="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
        Air Quality Index
      </h1>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-sm text-gray-500 font-medium">Live</span>
      </div>
    </div>
    
    <div class="flex gap-4 items-center p-4 md:p-2  2xl:p-4  rounded-xl bg-gradient-to-r from-green-50/60 to-emerald-50/40 border border-green-100/50 backdrop-blur-sm">
      <div class="relative">
        <img src="./assests/wind.png" class=" h-5 w-5 md:h-8 md:w-8 drop-shadow-sm" />
        <div class="absolute -inset-1 bg-green-400/20 rounded-full blur-sm animate-pulse"></div>
      </div>
      <div class="flex flex-col  2xl:gap-1">
        <h1 class="text-[#5dcb97] text-base md:text-lg font-semibold">Good</h1>
        <p class=" text-xs md:text-sm text-[#ced2e2] font-medium">A perfect day for walk</p>
        <div class="w-12 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-1"></div>
      </div>
    </div>

    <div class="grid grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
      <div class="bg-[#eefff6]  p-3 md:p-3 xl:p-2 2xl:p-3 flex flex-col gap-1 md:gap-2 items-center rounded-xl shadow-sm border border-green-100/30 backdrop-blur-sm">
        <h1 class=" md:text-base text-base xl:text-xs 2xl:text-base  font-bold text-[#37b16f]">${Math.round(
          data?.forecast?.forecastday[currentDay].day.air_quality.pm2_5
        )}</h1>
        <h2 class="text-[#4ebd89] text-xs font-semibold">PM2</h2>
        <div class="w-6 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60"></div>
      </div>
      
      <div class="bg-[#eefff6]  p-3 md:p-3 xl:p-2 2xl:p-3 flex flex-col gap-1 md:gap-2 items-center rounded-xl shadow-sm border border-green-100/30 backdrop-blur-sm">
        <h1 class=" md:text-base text-base xl:text-xs 2xl:text-base  font-bold text-[#37b16f]">${Math.round(
          data?.forecast?.forecastday[currentDay].day.air_quality.pm10
        )}</h1>
        <h2 class="text-[#4ebd89] text-xs font-semibold">PM10</h2>
        <div class="w-6 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60"></div>
      </div>
      
      <div class="bg-[#eefff6]  p-3 md:p-3 xl:p-2 2xl:p-3 flex flex-col gap-1 md:gap-2 items-center rounded-xl shadow-sm border border-green-100/30 backdrop-blur-sm">
        <h1 class=" md:text-base text-base xl:text-xs 2xl:text-base  font-bold text-[#37b16f]">${Math.round(
          data?.forecast?.forecastday[currentDay].day.air_quality.so2
        )}</h1>
        <h2 class="text-[#4ebd89] text-xs font-semibold">SO<sub>2</sub></h2>
        <div class="w-6 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60"></div>
      </div>
      
      <div class="bg-[#eefff6]  p-3 md:p-3 xl:p-2 2xl:p-3 flex flex-col gap-1 md:gap-2 items-center rounded-xl shadow-sm border border-green-100/30 backdrop-blur-sm">
        <h1 class=" md:text-base text-base xl:text-xs 2xl:text-base  font-bold text-[#37b16f]">${Math.round(
          data?.forecast?.forecastday[currentDay].day.air_quality.no2
        )}</h1>
        <h2 class="text-[#4ebd89] text-xs font-semibold">NO<sub>2</sub></h2>
        <div class="w-6 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60"></div>
      </div>
      
      <div class="bg-[#eefff6]  p-3 md:p-3 xl:p-2 2xl:p-3 flex flex-col gap-1 md:gap-2 items-center rounded-xl shadow-sm border border-green-100/30 backdrop-blur-sm">
        <h1 class=" md:text-base text-base xl:text-xs 2xl:text-base  font-bold text-[#37b16f]">${Math.round(
          data?.forecast?.forecastday[currentDay].day.air_quality.o3
        )}</h1>
        <h2 class="text-[#4ebd89] text-xs font-semibold">O<sub>3</sub></h2>
        <div class="w-6 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60"></div>
      </div>
      
      <div class="bg-[#eefff6]  p-3 md:p-3 xl:p-2 2xl:p-3 flex flex-col gap-1 md:gap-2 items-center rounded-xl shadow-sm border border-green-100/30 backdrop-blur-sm">
        <h1 class=" md:text-base text-base xl:text-xs 2xl:text-base  font-bold text-[#37b16f]">${Math.round(
          data?.forecast?.forecastday[currentDay].day.air_quality.co
        )}</h1>
        <h2 class="text-[#4ebd89] text-xs font-semibold">CO</h2>
        <div class="w-6 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60"></div>
      </div>
    </div>
  `;

  const airQualityElement = document.getElementById("air-quality-check");
  if (airQualityElement) {
    airQualityElement.innerHTML = airQuality;
  }
}

// 7days weather skeleton section
function daysWetherSkelton() {
  const forecastContainer = document.getElementById("forecast-container");
  if (forecastContainer) {
    forecastContainer.innerHTML = Array(7)
      .fill()
      .map(
        () => `
    <div
      class="bg-gray-200 rounded-3xl min-w-30 lg:min-w-full lg:w-full p-8 animate-pulse flex flex-col gap-4 items-center justify-center border border-gray-300 shadow-md">
      <div class="w-14 h-14 bg-gray-300 rounded-full"></div>
      <div class="w-10 h-4 bg-gray-300 rounded"></div>
      <div class="w-16 h-4 bg-gray-300 rounded"></div>
    </div>
  `
      )
      .join("");
  }
}

//7 days forecast
async function forecastWeather(lat, lon) {
  daysWetherSkelton();
  suriseSkelton();
  airQualitySkelton();
  hourlySkelton();

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_CONFIG.apiKey}&q=${lat},${lon}&days=7&aqi=yes&alerts=no`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    // await delay(2000);
    localStorage.setItem("cachedForecast", JSON.stringify(data));

    const forecast = data?.forecast?.forecastday
      .map((item, index) => {
        const isSelected = index === currentDay;

        return `
      <div id="current-date-and-details-${index}" onclick="updateDate(${index})"  class="${
          isSelected ? "bg-[#95b8ff]" : "bg-primary-700 cursor-pointer hover"
        } rounded-3xl select-none min-w-30 lg:min-w-full lg:w-full p-6 lg:p-4 xl:p-4  flex flex-col gap-4 items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-2 group relative overflow-hidden backdrop-blur-sm border ${
          isSelected
            ? "border-white/20 shadow-lg shadow-blue-400/30"
            : "md:border-gray-200/10 border-gray-300  shadow-md shadow-gray-300/20"
        }">
        
        <!-- Background decorative elements -->
        <div class="absolute top-2 right-3 w-2 h-2 ${
          isSelected ? "bg-white/20" : "bg-gray-400/20"
        } rounded-full animate-pulse"></div>
        <div class="absolute bottom-3 left-3 w-1.5 h-1.5 ${
          isSelected ? "bg-white/15" : "bg-gray-400/15"
        } rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
        <div class="absolute top-4 left-4 w-1 h-1 ${
          isSelected ? "bg-white/10" : "bg-gray-400/10"
        } rounded-full animate-pulse" style="animation-delay: 1s"></div>

        <!-- Icon with enhanced styling -->
        <div class="relative">
          <div class="absolute inset-0 ${
            isSelected ? "bg-white/10" : "bg-gray-200/10"
          } rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img src="https:${item.day.condition.icon}" alt="${
          item.day.condition.text
        }" class="h-14 w-14 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" />
        </div>

        <!-- Text content with enhanced styling -->
        <div class="flex flex-col gap-1 text-center relative z-10">
          <h1 class="${
            isSelected ? "text-base text-white" : "text-base text-black"
          } font-semibold transition-all duration-300 group-hover:scale-105 ${
          isSelected ? "group-hover:text-white/90" : "group-hover:text-gray-800"
        }">${dayjs(item.date).format("ddd")}</h1>
          
          <div class="w-8 h-0.5 ${
            isSelected ? "bg-white/30" : "bg-gray-400/30"
          } mx-auto rounded-full transition-all duration-300 group-hover:w-12 ${
          isSelected ? "group-hover:bg-white/50" : "group-hover:bg-gray-400/50"
        }"></div>
          
          <h1 class="${
            isSelected ? "text-xs text-white" : "text-xs text-black"
          } font-medium transition-all duration-300 group-hover:font-semibold ${
          isSelected ? "group-hover:text-white/90" : "group-hover:text-gray-800"
        }">${item.day.maxtemp_c}° / ${item.day.mintemp_c}°</h1>
        </div>

        <!-- Shimmer effect overlay -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div class="absolute inset-0 bg-gradient-to-r ${
            isSelected
              ? "from-transparent via-white/5 to-transparent"
              : "from-transparent via-gray-200/10 to-transparent"
          } transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
      `;
      })
      .join("");

    const forecastElement = document.getElementById("forecast-container");
    if (forecastElement) {
      forecastElement.innerHTML = forecast;
    }

    // Initialize all data for the current day
    showHourlyForecast(currentDay);
    updateSunriseSunset(data);
    updateWeatherDetails(data);
    updateAirQuality(data);
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

// hourly weather skelton
function hourlySkelton() {
  const el = document.getElementById("hourly-check");
  if (el) {
    el.innerHTML = Array(7)
      .fill()
      .map(
        () => `
      <div class=" rounded-3xl p-2 animate-pulse flex gap-20 flex-col  ">
      <div class="flex  gap-12 ">
        <div class="h-3 w-25 bg-gray-300 rounded-md "></div>
        <div class="h-3 w-25 bg-gray-300 rounded-md"></div>
        <div class="h-3 w-25 bg-gray-300 rounded-md "></div></div>
      </div>
      </div>
  `
      )
      .join("");
  }
}

// update hourly forecast
function showHourlyForecast(selectedDate) {
  const data = JSON.parse(localStorage.getItem("cachedForecast"));
  if (!data) return;

  const currentEpoch = Math.round(Date.now() / 1000);
  const selectedDay = data.forecast.forecastday[selectedDate];

  const hourDetails = selectedDay?.hour
    .map((item) => {
      const past = item.time_epoch < currentEpoch;
      return `
        <div class="grid grid-cols-3 py-1   gap-5  md:py-2 ${
          past ? "opacity-40" : ""
        }">

          <div class="flex gap-2 items-center">
            <img src="./assests/cloud.png" class="h-6 w-6" />
             <span class="text-xs md:text-sm whitespace-nowrap ">
    ${dayjs.unix(item.time_epoch).format("hh:mm A")}
  </span>
          </div>

          <div class="flex gap-2 items-center">
            <img src="./assests/thermometer-hour.png" class="h-6 w-6" />
            <span class="md:text-sm text-xs whitespace-nowrap md:whitespace-normal">${
              item.temp_c
            }°</span>
          </div>
          <div class="flex gap-2 items-center">
            <img src="./assests/wind-hour.png" class="h-6 w-6" />
            <span class="md:text-sm text-xs whitespace-nowrap md:whitespace-normal  ">${
              item.wind_kph
            } kmph</span>
          </div>

         
        </div>`;
    })
    .join("");

  const hourlyElement = document.getElementById("hourly-check");
  if (hourlyElement) {
    hourlyElement.innerHTML = hourDetails;
  }
}

// Add hideDropdown function that was referenced but missing
function hideDropdown() {
  const dropdown = document.getElementById("dropdown-search");
  if (dropdown) {
    dropdown.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHistoryDrawer();
  const drawer = document.getElementById("drawer");
  const historyBtn = document.getElementById("history-button");
  const closeDrawer = document.getElementById("close-drawer");

  if (drawer && historyBtn) {
    historyBtn.addEventListener("click", () => {
      drawer.classList.toggle("translate-x-full");
      drawer.classList.toggle("translate-x-0");
    });
  }
  if (drawer && closeDrawer) {
    closeDrawer.addEventListener("click", () => {
      drawer.classList.remove("translate-x-0");
      drawer.classList.add("translate-x-full");
    });
  }
});
