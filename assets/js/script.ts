// api.openweathermap.org/data/2.5/forecast?q={city name}&appid=81e9f56d1663d1d6f860c7b97883e905
var searchButton = document.querySelector("button");
var searchField = document.querySelector("input");

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
	console.log(initialRequestURL);

	// var requestURL = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${cityName}&appid=${API_KEY}&units=imperial`;
	// console.log(initialRequestURL);

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
			fetch(ONE_CALL + `?lat=${coords[0]}&lon=${coords[1]}&exclude=hourly,minutely,alerts&units=imperial&appid=${API_KEY}`).then(
				response => response.json()
			).then(
				data => {
					// set up an expected structure for the parsed JSON
					// solely for better code completion
					let _data: ResponseModel = data;

					console.log(cityName);
					

					let currentWeather = _data.current;
					let dailyWeather = _data.daily;

					let cards = document.querySelectorAll(".card");
					let currentCity = document.querySelector("#city");
					let currentTemperature = document.querySelector("#current-temperature");
					let currentHumidity = document.querySelector("#current-humidity");
					let currentWind = document.querySelector("#current-wind");
					let currentUVIndex = document.querySelector("#current-uv");

					currentCity.innerHTML = `${cityName} (${toDateString(currentWeather.dt)})`;
					currentTemperature.innerHTML = `${currentWeather.temp} °F`;
					currentHumidity.innerHTML = `${currentWeather.humidity}%`;
					currentWind.innerHTML = `${currentWeather.wind_speed} MPH`;
					currentUVIndex.innerHTML = currentWeather.uvi.toLocaleString();

					for (let i = 0; i < cards.length; i++) {
						const currentCard = dailyWeather[i+1];

						cards[i].innerHTML = `
							<div>${toDateString(currentCard.dt)}</div>
							<img src="${iconBaseURL}/${currentCard.weather[0].icon}.png" alt="${currentWeather.weather[0].description}">
							<div>Temp: ${currentCard.temp.day} °F</div>
							<div>Humidity: ${currentCard.humidity}%</div>
						`;
					}
				}
			)
		}
	);
});
