// api.openweathermap.org/data/2.5/forecast?q={city name}&appid=81e9f56d1663d1d6f860c7b97883e905
var searchButton = document.querySelector("button");
var searchField = document.querySelector("input");

var cards = document.querySelectorAll(".card");
var headerRow: HTMLElement = document.querySelector(".header-row");
var currentCity: HTMLElement = document.querySelector("#city");
var currentTemperature: HTMLElement = document.querySelector("#current-temperature");
var currentHumidity: HTMLElement = document.querySelector("#current-humidity");
var currentWind: HTMLElement = document.querySelector("#current-wind");
var currentUVIndex: HTMLElement = document.querySelector("#current-uv");

interface DayWeatherModel {
	dt: number;
	wind_speed: number;
	uvi: number;
	temp: {day: number;};
	humidity: number;
	weather: {icon: string; description: string;}[];
}

interface ResponseModel {
	current: DayWeatherModel;
	daily: DayWeatherModel[];
}

const API_KEY = "81e9f56d1663d1d6f860c7b97883e905";

function toDateString(unixTime: number) {
	return (new Date(unixTime * 1000)).toLocaleDateString();
}

searchButton.addEventListener("click", function() {
	const query = searchField.value;
	console.log(`Requested data for city '${query}'`);

	var initialRequestURL: string = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}`;

	var ONE_CALL = "https://api.openweathermap.org/data/2.5/onecall";

	var iconBaseURL = "http://openweathermap.org/img/w";
	let cityName: string;

	// The UV Index is only found in the One Call API
	// which uses lat and lon instead of city name
	// for now, fetch those separately via arbitrary API
	// and pass those into the "main" fetch
	fetch(initialRequestURL).then(
		response => response.json()
	).then(
		data => {
			cityName = data.name;
			return [data.coord.lat, data.coord.lon];
		}
	).then (
		coords => {
			fetch(`${ONE_CALL}?lat=${coords[0]}&lon=${coords[1]}&exclude=hourly,minutely,alerts&units=imperial&appid=${API_KEY}`).then(
				response => response.json()
			).then(
				data => {
					// set up an expected structure for the parsed JSON
					// solely for better code completion
					let _data: ResponseModel = data;

					const uvColors = {
						"8-10" : "violet",
						"6-7" : "red",
						"3-5" : "gold",
						"0-2" : "green"
					};

					let current = _data.current;
					let dailyWeather = _data.daily;

					currentCity.innerHTML = `${cityName} (${toDateString(current.dt)})`;
					currentTemperature.innerHTML = `Temperature: ${current.temp} °F`;
					currentHumidity.innerHTML = `Humidity: ${current.humidity}%`;
					currentWind.innerHTML = `Wind Speed: ${current.wind_speed} MPH`;
					currentUVIndex.innerHTML = `UV Index: <span class="${"extreme"}">${current.uvi}</span>`;

					var currentUVIndexSpan: HTMLSpanElement = currentUVIndex.querySelector("span");

					for (const [bound, color] of Object.entries(uvColors)) {
						let [lower, upper] = bound.split("-").map(_x => Number(_x));

						if (lower < current.uvi && current.uvi < upper) {
							currentUVIndexSpan.style.backgroundColor = color;
							break;
						}

						currentUVIndexSpan.style.backgroundColor = "purple";
					}

					headerRow.innerHTML += `<img src="${iconBaseURL}/${current.weather[0].icon}.png" alt="${current.weather[0].description}">`;

					for (let i = 0; i < cards.length; i++) {
						const currentCard = dailyWeather[i+1];

						cards[i].innerHTML = `
							<div class="forecast-date">${toDateString(currentCard.dt)}</div>
							<img src="${iconBaseURL}/${currentCard.weather[0].icon}.png" alt="${current.weather[0].description}">
							<div>Temp: ${currentCard.temp.day} °F</div>
							<div>Humidity: ${currentCard.humidity}%</div>
						`;
					}
				}
			)
		}
	);
});
