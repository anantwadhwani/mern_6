// Weather App JavaScript

'use strict';

// API Key for OpenWeatherMap
const API_KEY = '0b8a96bead959add57c913765c55722f';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-btn');
const refreshButton = document.getElementById('refresh-btn');
const cityNameElement = document.getElementById('city-name');
const dateTimeElement = document.getElementById('date-time');
const temperatureElement = document.getElementById('temperature');
const feelsLikeElement = document.getElementById('feels-like');
const weatherIconElement = document.getElementById('weather-icon');
const weatherDescriptionElement = document.getElementById('weather-description');
const tempMaxElement = document.getElementById('temp-max');
const tempMinElement = document.getElementById('temp-min');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');
const lastUpdatedElement = document.getElementById('last-updated');
const currentYearElement = document.getElementById('current-year');
const errorModal = document.getElementById('error-modal');
const errorMessageElement = document.getElementById('error-message');
const closeModalButton = document.querySelector('.close-btn');

// Current city for refresh functionality
let currentCity = 'London'; // Default city

// Initialize the app
function initApp() {
    // Set current year in footer
    currentYearElement.textContent = new Date().getFullYear();
    
    // Add event listeners
    searchButton.addEventListener('click', handleSearch);
    refreshButton.addEventListener('click', handleRefresh);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    closeModalButton.addEventListener('click', closeErrorModal);
    
    // Load default city weather on initial load
    getWeatherData(currentCity);
}

// Handle search button click
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (city !== '') {
        getWeatherData(city);
        cityInput.value = '';
    } else {
        showError('Please enter a city name');
    }
}

// Handle refresh button click
function handleRefresh() {
    // Add loading animation
    refreshButton.classList.add('loading');
    refreshButton.disabled = true;
    
    // Get weather for current city
    getWeatherData(currentCity);
}

// Fetch weather data from API
async function getWeatherData(city) {
    try {
        const url = `${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(await response.json().then(data => data.message) || 'City not found');
        }
        
        const data = await response.json();
        updateWeatherUI(data);
        
        // Update current city for refresh functionality
        currentCity = data.name;
        
        // Remove loading animation if it exists
        refreshButton.classList.remove('loading');
        refreshButton.disabled = false;
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message || 'Failed to fetch weather data');
        
        // Remove loading animation if it exists
        refreshButton.classList.remove('loading');
        refreshButton.disabled = false;
    }
}

// Update UI with weather data
function updateWeatherUI(data) {
    // Extract data from API response
    const { name } = data;
    const { temp, feels_like, temp_min, temp_max, humidity, pressure } = data.main;
    const { description, icon } = data.weather[0];
    const { speed } = data.wind;
    const visibilityKm = data.visibility / 1000; // Convert meters to kilometers
    
    // Update UI elements
    cityNameElement.textContent = name;
    dateTimeElement.textContent = formatDateTime(new Date());
    temperatureElement.textContent = `${Math.round(temp)}°C`;
    feelsLikeElement.textContent = `Feels like: ${Math.round(feels_like)}°C`;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIconElement.alt = description;
    weatherDescriptionElement.textContent = description;
    tempMaxElement.textContent = `${Math.round(temp_max)}°C`;
    tempMinElement.textContent = `${Math.round(temp_min)}°C`;
    humidityElement.textContent = `${humidity}%`;
    windSpeedElement.textContent = `${speed} m/s`;
    pressureElement.textContent = `${pressure} hPa`;
    visibilityElement.textContent = `${visibilityKm.toFixed(1)} km`;
    lastUpdatedElement.textContent = `Last updated: ${formatTime(new Date())}`;
}

// Helper function to format date and time
function formatDateTime(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return `${date.toLocaleDateString('en-US', options)} ${formatTime(date)}`;
}

// Helper function to format time
function formatTime(date) {
    const options = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    };
    
    return date.toLocaleTimeString('en-US', options);
}

// Show error modal
function showError(message) {
    errorMessageElement.textContent = message;
    errorModal.style.display = 'flex';
}

// Close error modal
function closeErrorModal() {
    errorModal.style.display = 'none';
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target === errorModal) {
        closeErrorModal();
    }
});

// Initialize the app when DOM content is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Optional: Geolocation feature
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Success callback
            async position => {
                const { latitude, longitude } = position.coords;
                try {
                    const url = `${BASE_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error('Unable to fetch weather for your location');
                    }
                    
                    const data = await response.json();
                    updateWeatherUI(data);
                    currentCity = data.name;
                    
                } catch (error) {
                    console.error('Error fetching geolocation weather:', error);
                    // Fall back to default city
                    getWeatherData(currentCity);
                }
            },
            // Error callback
            () => {
                console.log('Geolocation permission denied or unavailable');
                // Fall back to default city
                getWeatherData(currentCity);
            }
        );
    } else {
        console.log('Geolocation is not supported by this browser');
        // Fall back to default city
        getWeatherData(currentCity);
    }
}

document.addEventListener('DOMContentLoaded', getLocationWeather);
