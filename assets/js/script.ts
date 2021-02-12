// api.openweathermap.org/data/2.5/forecast?q={city name}&appid=81e9f56d1663d1d6f860c7b97883e905
var searchButton = document.querySelector("button");
var searchField = document.querySelector("input");

interface DayWeatherModel {
	dt: number;
	wind_speed: number;
	uvi: number;
	humidity: number;
	weather: {icon: string; description: string;};
}

interface ResponseModel {
	current: DayWeatherModel;
	daily: DayWeatherModel[];
}

const API_KEY = "81e9f56d1663d1d6f860c7b97883e905";

searchButton.addEventListener("click", function() {
	const cityName = searchField.value;
	console.log(`Requested data for city '${cityName}'`);


	var initialRequestURL: string = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
	// var requestURL = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${cityName}&appid=${API_KEY}&units=imperial`;
	// console.log(initialRequestURL);

	var ONE_CALL = "https://api.openweathermap.org/data/2.5/onecall";

	// The UV Index is only found in the One Call API
	// which uses lat and lon instead of city name
	// for now, fetch those separately via arbitrary API
	// and pass those into the "main" fetch
	fetch(initialRequestURL).then(
		response => response.json()
	).then(
		data => [data.coord.lat, data.coord.lon]
	).then (
		coords => {
			fetch(ONE_CALL + `?lat=${coords[0]}&lon=${coords[1]}&exclude=hourly,minutely,alerts&units=imperial&appid=${API_KEY}`).then(
				response => response.json()
			).then(
				data => {
					// let responseData: ResponseModel = data;
					console.log(data);
				}
			)
		}
	);
});
