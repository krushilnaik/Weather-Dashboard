var searchButton = document.querySelector("button");
var searchField = document.querySelector("input");
var cards = document.querySelectorAll(".card");
var headerRow = document.querySelector(".header-row");
var currentCity = document.querySelector("#city");
var currentTemperature = document.querySelector("#current-temperature");
var currentHumidity = document.querySelector("#current-humidity");
var currentWind = document.querySelector("#current-wind");
var currentUVIndex = document.querySelector("#current-uv");
var searchHistoryElement = document.querySelector("#search-history");
var API_KEY = "81e9f56d1663d1d6f860c7b97883e905";
var ONE_CALL = "https://api.openweathermap.org/data/2.5/onecall?appid=" + API_KEY + "&exclude=hourly,minutely,alerts&units=imperial";
var WEATHER = "https://api.openweathermap.org/data/2.5/weather?appid=" + API_KEY;
var ICON = "http://openweathermap.org/img/w";
/**
 * Convert UNIX time to a human-readable format
 * @param unixTime the UNIX integer representation of time
 */
function toDateString(unixTime) {
    return (new Date(unixTime * 1000)).toLocaleDateString();
}
/**
 * Build a list of cities the user has previous searched for
 * and put then on the left side of the screen, under the search bar
 */
function renderSearchHistory() {
    searchHistoryElement.innerHTML = "";
    var searchHistoryString = localStorage.getItem("searchHistory");
    if (searchHistoryString === null) {
        return;
    }
    for (var _i = 0, _a = searchHistoryString.split("|").reverse(); _i < _a.length; _i++) {
        var city = _a[_i];
        if (city === "undefined") {
            continue;
        }
        var entry = document.createElement("div");
        entry.className = "history-item";
        entry.innerText = city;
        searchHistoryElement.appendChild(entry);
    }
}
searchButton.addEventListener("click", function () {
    var query = searchField.value;
    var cityName;
    // The UV Index is only found in the One Call API
    // which uses lat and lon instead of city name
    // for now, fetch those separately via arbitrary API
    // and pass those into the "main" fetch
    fetch(WEATHER + "&q=" + query).then(function (response) { return response.json(); }).then(function (data) {
        cityName = data.name;
        var searchHistoryString = localStorage.getItem("searchHistory");
        if (searchHistoryString) {
            searchHistoryString += "|" + cityName;
        }
        else {
            searchHistoryString = cityName;
        }
        localStorage.setItem("searchHistory", searchHistoryString);
        renderSearchHistory();
        return [data.coord.lat, data.coord.lon];
    }).then(function (coords) {
        fetch(ONE_CALL + "&lat=" + coords[0] + "&lon=" + coords[1]).then(function (response) { return response.json(); }).then(function (data) {
            // set up an expected structure for the parsed JSON
            // solely for better code completion
            var _data = data;
            var uvColors = {
                "8-10": "violet",
                "6-7": "red",
                "3-5": "gold",
                "0-2": "green"
            };
            var current = _data.current;
            var dailyWeather = _data.daily;
            currentCity.innerHTML = cityName + " (" + toDateString(current.dt) + ")";
            currentTemperature.innerHTML = "Temperature: " + current.temp + " \u00B0F";
            currentHumidity.innerHTML = "Humidity: " + current.humidity + "%";
            currentWind.innerHTML = "Wind Speed: " + current.wind_speed + " MPH";
            currentUVIndex.innerHTML = "UV Index: <span class=\"" + "extreme" + "\">" + current.uvi + "</span>";
            var currentUVIndexSpan = currentUVIndex.querySelector("span");
            // Add a background color to the UV Index
            // based on where in the range (defined in 'uvColors')
            // the numberical value falls
            for (var _i = 0, _a = Object.entries(uvColors); _i < _a.length; _i++) {
                var _b = _a[_i], bound = _b[0], color = _b[1];
                var _c = bound.split("-").map(function (_x) { return Number(_x); }), lower = _c[0], upper = _c[1];
                if (lower < current.uvi && current.uvi < upper) {
                    currentUVIndexSpan.style.backgroundColor = color;
                    break;
                }
                currentUVIndexSpan.style.backgroundColor = "purple";
            }
            headerRow.innerHTML += "<img src=\"" + ICON + "/" + current.weather[0].icon + ".png\" alt=\"" + current.weather[0].description + "\">";
            for (var i = 0; i < cards.length; i++) {
                var currentCard = dailyWeather[i + 1];
                cards[i].innerHTML = "\n\t\t\t\t\t\t\t<div class=\"forecast-date\">" + toDateString(currentCard.dt) + "</div>\n\t\t\t\t\t\t\t<img src=\"" + ICON + "/" + currentCard.weather[0].icon + ".png\" alt=\"" + currentCard.weather[0].description + "\">\n\t\t\t\t\t\t\t<div>Temp: " + currentCard.temp.day + " \u00B0F</div>\n\t\t\t\t\t\t\t<div>Humidity: " + currentCard.humidity + "%</div>\n\t\t\t\t\t\t";
            }
        });
    });
});
/**
 * Load the page
 */
renderSearchHistory();
