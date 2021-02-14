var searchButton = document.querySelector("button");
var searchField = document.querySelector("input");

var cards = document.querySelectorAll(".card");
var headerRow: HTMLElement = document.querySelector(".header-row");
var currentCity: HTMLElement = document.querySelector("#city");
var currentTemperature: HTMLElement = document.querySelector("#current-temperature");
var currentHumidity: HTMLElement = document.querySelector("#current-humidity");
var currentWind: HTMLElement = document.querySelector("#current-wind");
var currentUVIndex: HTMLElement = document.querySelector("#current-uv");
var searchHistoryElement: HTMLElement = document.querySelector("#search-history");

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
const ONE_CALL = `https://api.openweathermap.org/data/2.5/onecall?appid=${API_KEY}&exclude=hourly,minutely,alerts&units=imperial`;
const WEATHER = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}`;
const ICON = "http://openweathermap.org/img/w";


/**
 * Convert UNIX time to a human-readable format
 * @param unixTime the UNIX integer representation of time
 */
function toDateString(unixTime: number) {
	return (new Date(unixTime * 1000)).toLocaleDateString();
}

/**
 * Build a list of cities the user has previous searched for
 * and put then on the left side of the screen, under the search bar
 */
function renderSearchHistory() {
	searchHistoryElement.innerHTML = "";
	const searchHistoryString = localStorage.getItem("searchHistory");

	if (searchHistoryString === null) {
		return;
	}

	for (const city of searchHistoryString.split("|").reverse()) {
		if (city === "undefined") {
			continue;
		}

		let entry = document.createElement("div");
		entry.className = "history-item";
		entry.innerText = city;

		searchHistoryElement.appendChild(entry);
	}
}

searchButton.addEventListener("click", function() {
	const query = searchField.value;

	let cityName: string;

	// The UV Index is only found in the One Call API
	// which uses lat and lon instead of city name
	// for now, fetch those separately via arbitrary API
	// and pass those into the "main" fetch
	fetch(`${WEATHER}&q=${query}`).then(
		response => response.json()
	).then(
		data => {
			cityName = data.name;

			var searchHistoryString = localStorage.getItem("searchHistory") || "";

			var historySet = new Set(searchHistoryString.split("|").reverse().filter(_str => _str.trim().length !== 0));
			historySet.add(cityName);

			localStorage.setItem("searchHistory", Array.from(historySet).join("|"));

			renderSearchHistory();

			return [data.coord.lat, data.coord.lon];
		}
	).then (
		coords => {
			fetch(`${ONE_CALL}&lat=${coords[0]}&lon=${coords[1]}`).then(
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

					// Add a background color to the UV Index
					// based on where in the range (defined in 'uvColors')
					// the numberical value falls
					for (const [bound, color] of Object.entries(uvColors)) {
						let [lower, upper] = bound.split("-").map(_x => Number(_x));

						if (lower < current.uvi && current.uvi < upper) {
							currentUVIndexSpan.style.backgroundColor = color;
							break;
						}

						currentUVIndexSpan.style.backgroundColor = "purple";
					}

					headerRow.innerHTML += `<img src="${ICON}/${current.weather[0].icon}.png" alt="${current.weather[0].description}">`;

					for (let i = 0; i < cards.length; i++) {
						const currentCard = dailyWeather[i+1];

						cards[i].innerHTML = `
							<div class="forecast-date">${toDateString(currentCard.dt)}</div>
							<img src="${ICON}/${currentCard.weather[0].icon}.png" alt="${currentCard.weather[0].description}">
							<div>Temp: ${currentCard.temp.day} °F</div>
							<div>Humidity: ${currentCard.humidity}%</div>
						`;
					}
				}
			)
		}
	);
});



/**
 * Load the page
 */
renderSearchHistory();
