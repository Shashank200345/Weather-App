const searchInput = document.querySelector(".search-input");
const locationButton  = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeatherDiv = document.querySelector(".hourly-weather .weather-list")

const API_KEY = "f48b877ca88d40c1b56152619243112";

// Weather codes for mapping to custom icons 
const weatherCodes = {
    clear: [1000],
    clouds: [1003, 1006, 1009],
    mist: [1030, 1135, 1147],
    rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273,1276],
    moderate_heavy_rain: [1186,1189,1192,1195,1243,1256],
    snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222,1225, 1225, 137, 1249, 1252, 
        1255, 1258, 1264, 1279, 1282],
    thunder: [1087, 1279, 1282],
    thunder_rain: [1273, 1276],    
}

// function for icons according to temperature
const getWeatherIcon = (conditionCode) =>  {
  return (
    Object.keys(weatherCodes).find((icon) =>
      weatherCodes[icon].includes(conditionCode)
    ) || "default"
  );
}


const displayHourlyForecast = (hourlyData) => {
    const currentHour = new Date().setMinutes(0, 0, 0);
    const next24Hours = currentHour + 24 * 60 * 60 * 1000;

    // Filter the Hourly data to  only include the next 24 hours 

    const next24HoursData = hourlyData.filter(({time}) => {
        const forecastTime = new Date(time).getTime();
        return forecastTime >= currentHour && forecastTime <= next24Hours;
    })
    
    // Generate HTML for each hourly forecast and dispaly it 

    hourlyWeatherDiv.innerHTML = next24HoursData.map(item => {

        return `<li class="weather-item">
                        <p class="time">${item.time.slice(11, 16)}</p>
                         <img src="icons/${getWeatherIcon(item.condition.code)}.svg" class="weather-icon">
                        <p class="temperature">${Math.floor(item.temp_c)}°</p>
                    </li>`;
      }).join("");

      console.log(hourlyWeatherDiv);
      
};


const getWeatherDetails = async (API_URL) => {
    window.innerWidth <= 768 && searchInput.blur()
    document.body.classList.remove("show-no-results");
    try {
        // fetch weather data from th api and parse the respnse as JSON
        const response = await fetch(API_URL)
        const data = await response.json()
        
        // extract current weather details
        const temperature = Math.floor(data.current.temp_c)
        const description = data.current.condition.text
        getWeatherIcon(data.current.condition.code);
        
        // Update current Weather Display
        currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature}<span>°C</span>`
        currentWeatherDiv.querySelector(".description").innerText = description
        currentWeatherDiv.querySelector(".weather-icon").src = `icons/${getWeatherIcon(data.current.condition.code)}.svg`;
        
        // combined hourly data
        const combinedHourlyData = [...data.forecast.forecastday[0].hour, ...data.forecast.forecastday[1].hour]
        
        displayHourlyForecast(combinedHourlyData);
        searchInput.value = data.location.name
    } catch (error) {
        document.body.classList.add("show-no-results")
    }
};

// setup weather request for a specific city
const setupWeatherRequest = (cityName) => {
    const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
    getWeatherDetails(API_URL)
}

// handle user input in search box
searchInput.addEventListener("keyup" , (e) => {
    const cityName = searchInput.value.trim();


    if(e.key == "Enter" && cityName){
        setupWeatherRequest(cityName)
    }
});

// Get user's Coordinates
locationButton.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
        getWeatherDetails(API_URL)
        
    }, error => {
        alert("Location access denied. Please enable permissions to use this feature.")
    })
})

