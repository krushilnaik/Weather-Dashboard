// api.openweathermap.org/data/2.5/forecast?q={city name}&appid=81e9f56d1663d1d6f860c7b97883e905
var searchButton = document.querySelector("button");
var searchField = document.querySelector("input");

interface ResponseModel {
	list: Object[];
	city: Object;
	cod: number;
}

const API_KEY = "81e9f56d1663d1d6f860c7b97883e905";

searchButton.addEventListener("click", function() {
	const cityName = searchField.value;
	console.log(`Requested data for city '${cityName}'`);

	// The UV Index is only found in the One Call API
	// which uses lat and lon instead of city name
	// for now, fetch those separately
	var latitude: number;
	var longitude: number;

	var requestURL = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${cityName}&appid=${API_KEY}&units=imperial`;
	// var requestURL = `https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid=${API_KEY}&exclude=minutely,hourly`;

	// var parsedResponse;

	// fetch(`https://maps.googleapis.com/maps/api/geocode/json?${cityName}`).then(
	// 	response => response.json()
	// ).then(data => {
	// 	console.log(data);
	// });

	fetch(requestURL).then(
		response => response.json()
	).then(data => {
		let responseData: ResponseModel = data;
		console.log(responseData.list);
	});
});
