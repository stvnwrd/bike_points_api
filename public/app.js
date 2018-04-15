const app = function(){
  const url = 'https://api.tfl.gov.uk/BikePoint';
  makeRequest(url, requestComplete);
};

const makeRequest = function(url, callback) {
  const request = new XMLHttpRequest();
  request.open("GET", url);
  request.addEventListener('load', callback);
  request.send();
};

const requestComplete = function() {
  if(this.status !== 200) return;
  const jsonString = this.responseText;
  const bikePointsData = JSON.parse(jsonString);
  renderDropDown(bikePointsData);
  // initialize();
};


// Drop-down select

const renderDropDown = function (bikePointData) {
  var dropDown = createDropDown(bikePointData);
  var mainDiv = document.getElementById('main');
  mainDiv.appendChild(dropDown);
}

var createDropDown = function (bikePoints) {
  var select = document.createElement('select');
  var defaultOption = document.createElement('option');
  defaultOption.innerText = 'Select a Bike Point';
  defaultOption.value = -1;
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  bikePoints.forEach(function (bikePointObject, index){
    var optionTag = createOptionTag(bikePointObject.commonName, index);
    select.appendChild(optionTag);
  });
  select.addEventListener('change', function (event) {
    var selectedIndex = event.target.value;
    selectBikePoint(bikePoints, selectedIndex);
  });
  return select;
}

var createOptionTag = function (text, index) {
  var option = document.createElement('option');
  option.innerText = text;
  option.value = index;
  return option;
}

var selectBikePoint = function (bikePoints, selectedIndex) {
  var bikePointObject = bikePoints[selectedIndex];
  var bikePointElement = createListItem(bikePointObject);
  renderSingleBikePoint(bikePointElement);
  findPostCode(bikePointObject);
  findAirQuality();
  initializeMap(bikePointObject);
  makeChart(bikePointObject);

}

var renderSingleBikePoint = function(bikePointElement) {
  var mainDiv = document.getElementById('main');
  var existingBikePointListItem = document.querySelector('ul');
  if (existingBikePointListItem !== null) {
    mainDiv.removeChild(existingBikePointListItem);
  }
  mainDiv.appendChild(bikePointElement);
}

var createListItem = function(bikePointObject) {
  var list = document.createElement('ul');
  var name = document.createElement('h3');
  name.innerText = bikePointObject.commonName;
  list.appendChild(name);
  var bikesAvailable = document.createElement('li');
  bikesAvailable.innerText = `Bikes Available:  ${bikePointObject.additionalProperties[6].value}`;
  list.appendChild(bikesAvailable);
  var docksFree = document.createElement('li');
  docksFree.innerText = `Docks Free: ${bikePointObject.additionalProperties[7].value}`;
  list.appendChild(docksFree);
  return list;
};




// Create a broken dock alert
// var docksResponding = (NbBike + NbEmptyDocks)
// var dockDiscrepancy = NbDocks - docksResponding;
// if docksDiscprepancy = 0 return
//  docksDiscprepancy >=1 message = "Docks Out of Service: ${docksDiscprepancy}"
// docksDiscprepancy <= -1 message = "Engineers have been notified of a potential issue with this Bike Point."


// Request and process Air Quality Data

var findAirQuality = function () {
  var airQualityUrl = 'https://api.tfl.gov.uk/AirQuality';
  var airQualityRequest = new XMLHttpRequest();
  airQualityRequest.open('GET', airQualityUrl);

  airQualityRequest.addEventListener('load', function () {
    var airQualityData = JSON.parse(airQualityRequest.responseText);
    renderAirQualityData(airQualityData);
  });
  airQualityRequest.send();
};


const renderAirQualityData = function(airQualityData) {
  var mainDiv = document.getElementById('main');
  var foundAirQuality = document.createElement('li');
  foundAirQuality.innerText = `Air Quality:  ${airQualityData.currentForecast[0].forecastSummary}`;
  mainDiv.appendChild(foundAirQuality);
}

// Get postcode for Bike Point


var findPostCode = function (bikePointObject) {
  // var pcLat = bikePointObject.lat;
  // var pcLng = bikePointObject.lon;
  var postCodeUrl = 'https://api.postcodes.io/postcodes?lon=-0.10997&lat=51.529163';
  var postCodeRequest = new XMLHttpRequest();
  postCodeRequest.open('GET', postCodeUrl);

  postCodeRequest.addEventListener('load', function () {
    var postCodeData = JSON.parse(postCodeRequest.responseText);
    renderPostCodeData(postCodeData);
  });
  postCodeRequest.send();
};

var renderPostCodeData = function(postCodeData) {
  var mainDiv = document.getElementById('main');
  var foundPostCode = document.createElement('li');
  foundPostCode.innerText = `Post Code:  ${postCodeData.result[0].postcode}`;
  mainDiv.appendChild(foundPostCode);
};



// Make Map

var initializeMap = function(bikePointObject){
  var mapDiv = document.getElementById('main-map');
  var center = {lat: bikePointObject.lat, lng: bikePointObject.lon};
  var mainMap = new MapWrapper(mapDiv, center, 16);


  mainMap.addInfoWindow(center, `<h3>${bikePointObject.commonName}</h3><h4><br>Bikes Available: ${bikePointObject.additionalProperties[6].value}<br>Docks Free: ${bikePointObject.additionalProperties[7].value}</h4>`);
}





// Make Chart

var makeChart = function(bikePointObject){
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart(){
    var data = google.visualization.arrayToDataTable([
      ['Dock Status', 'Bikes', 'Empty', 'Out of Order'],
      ['Dock Status', Number(bikePointObject.additionalProperties[6].value), Number(bikePointObject.additionalProperties[7].value), (Number(bikePointObject.additionalProperties[8].value) - (Number(bikePointObject.additionalProperties[6].value) + Number(bikePointObject.additionalProperties[7].value)))]
    ]);

    var options = {'title': 'Bikes Available',
    'width': 400,
    'height': 300,
    isStacked: 'absolute'
  };

  var chart = new google.visualization.BarChart(document.getElementById('chart-div'));
  chart.draw(data, options);
}
};






window.addEventListener('load', app);
