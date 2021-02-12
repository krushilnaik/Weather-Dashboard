// api.openweathermap.org/data/2.5/forecast?q={city name}&appid=81e9f56d1663d1d6f860c7b97883e905
var searchButton = document.querySelector("button");
var searchField = document.querySelector("input");
var API_KEY = "81e9f56d1663d1d6f860c7b97883e905";
function toDateString(unixTime) {
    return (new Date(unixTime * 1000)).toLocaleDateString();
}
searchButton.addEventListener("click", function () {
    var query = searchField.value;
    console.log("Requested data for city '" + query + "'");
    var initialRequestURL = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + API_KEY;
    console.log(initialRequestURL);
    var ONE_CALL = "https://api.openweathermap.org/data/2.5/onecall";
    var iconBaseURL = "http://openweathermap.org/img/w";
    var cityName;
    // The UV Index is only found in the One Call API
    // which uses lat and lon instead of city name
    // for now, fetch those separately via arbitrary API
    // and pass those into the "main" fetch
    fetch(initialRequestURL).then(function (response) { return response.json(); }).then(function (data) {
        cityName = data.name;
        return [data.coord.lat, data.coord.lon];
    }).then(function (coords) {
        fetch(ONE_CALL + ("?lat=" + coords[0] + "&lon=" + coords[1] + "&exclude=hourly,minutely,alerts&units=imperial&appid=" + API_KEY)).then(function (response) { return response.json(); }).then(function (data) {
            // set up an expected structure for the parsed JSON
            // solely for better code completion
            var _data = data;
            console.log(cityName);
            var currentWeather = _data.current;
            var dailyWeather = _data.daily;
            var cards = document.querySelectorAll(".card");
            var currentCity = document.querySelector("#city");
            var currentTemperature = document.querySelector("#current-temperature");
            var currentHumidity = document.querySelector("#current-humidity");
            var currentWind = document.querySelector("#current-wind");
            var currentUVIndex = document.querySelector("#current-uv");
            currentCity.innerHTML = cityName + " (" + toDateString(currentWeather.dt) + ")";
            currentTemperature.innerHTML = currentWeather.temp + " \u00B0F";
            currentHumidity.innerHTML = currentWeather.humidity + "%";
            currentWind.innerHTML = currentWeather.wind_speed + " MPH";
            currentUVIndex.innerHTML = currentWeather.uvi.toLocaleString();
            for (var i = 0; i < cards.length; i++) {
                var currentCard = dailyWeather[i + 1];
                cards[i].innerHTML = "\n\t\t\t\t\t\t\t<div>" + toDateString(currentCard.dt) + "</div>\n\t\t\t\t\t\t\t<img src=\"" + iconBaseURL + "/" + currentCard.weather[0].icon + ".png\" alt=\"" + currentWeather.weather[0].description + "\">\n\t\t\t\t\t\t\t<div>Temp: " + currentCard.temp.day + " \u00B0F</div>\n\t\t\t\t\t\t\t<div>Humidity: " + currentCard.humidity + "%</div>\n\t\t\t\t\t\t";
            }
        });
    });
});
