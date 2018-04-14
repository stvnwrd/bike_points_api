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
  var bikePointElement = createFeaturedBikePoint(bikePointObject);
  renderSingleBikePoint(bikePointElement);
}

var renderSingleBikePoint = function(bikePointElement) {
  var mainDiv = document.getElementById('main');
  var existingBikePointListItem = document.querySelector('li');
  if (existingBikePointListItem !== null) {
    mainDiv.removeChild(existingBikePointListItem);
  }
  mainDiv.appendChild(bikePointElement);
}

var createFeaturedBikePoint = function(bikePointObject) {
  var li = document.createElement('li');
  li.innerText = bikePointObject.commonName;
  return li;
}

window.addEventListener('load', app);
