'use strict';

var WATER_LEVEL_LOW_THRESHOLD = 5.0;

var greenPiThumbApp = angular.module('greenPiThumbApp', [
  'greenPiThumbApp.directives',
  'greenPiThumbApp.version'
  ]);

angular.module('d3', []);
angular.module('greenPiThumbApp.directives', ['d3']);

// Input: datetime sting with format "20171207T0610Z"
// Return: javascript date object
function createDateFromString(dateTimeStr) {
  var year = dateTimeStr.substring(0, 4);
  var month = dateTimeStr.substring(4, 6);
  var day = dateTimeStr.substring(6, 8);
  var hour = dateTimeStr.substring(9, 11);
  var minute = dateTimeStr.substring(11, 13);  
  var d = new Date(year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00Z" );  
  return d
}

// Input: datetime sting with format "20171207T1410Z"
// Return: Date string with format "Do., 7.12.2017 15:10"
function formatDate(date_str) {
	var date = createDateFromString(date_str);
	var date_options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' };
  var date_formatted = date.toLocaleDateString("en-EN", date_options);
  var time = ('0'  + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  var date_time = date_formatted + " " + time;    
  return date_time;
}

greenPiThumbApp.controller('DashboardCtrl', function($scope, $http) {
  $http.get('/temperatureHistory.json').success(function(temperatureHistory) {    
    $scope.temperature = temperatureHistory;
    $scope.temperatureRecords = temperatureHistory.length;
    $scope.latestTemperature = temperatureHistory[temperatureHistory.length - 1].temperature;
    $scope.temperatureTimestamp = formatDate(temperatureHistory[temperatureHistory.length - 1].timestamp);
  });
  $http.get('/waterLevelHistory.json').success(function(waterLevelHistory) {    
    $scope.waterLevel = waterLevelHistory;
    $scope.waterLevelRecords = waterLevelHistory.length;
    $scope.latestWaterLevel = waterLevelHistory[waterLevelHistory.length - 1].water_level;
    $scope.waterLevelTimestamp = formatDate(waterLevelHistory[waterLevelHistory.length - 1].timestamp);
    $scope.customStyleWaterLevelLow = {};
    $scope.customStyleWaterLevelLow.style = ($scope.latestWaterLevel <= WATER_LEVEL_LOW_THRESHOLD) ? {"color":"red", "font-weight":"bold"} : {"color":"black"};     
  });  
  $http.get('/humidityHistory.json').success(function(humidityHistory) {
    $scope.humidity = humidityHistory;
    $scope.humidityRecords = humidityHistory.length;
    $scope.latestHumidity = humidityHistory[humidityHistory.length - 1].humidity;
    $scope.humidityTimestamp = formatDate(humidityHistory[humidityHistory.length - 1].timestamp);	  
  });
  $http.get('/lightHistory.json').success(function(lightHistory) {
    $scope.lightLevel = lightHistory;
    $scope.lightRecords = lightHistory.length;
    $scope.latestLightLevel = lightHistory[lightHistory.length - 1].light;
    $scope.lightLevelTimestamp = formatDate(lightHistory[lightHistory.length - 1].timestamp);	  
  });
  $http.get('/soilMoistureHistory.json').success(function(moistureHistory) {
    $scope.soilMoisture = moistureHistory;
    $scope.soilMoistureRecords = $scope.soilMoisture.length;    
    $scope.latestSoilMoisture = $scope.soilMoisture[$scope.soilMoisture.length - 1].soil_moisture;
    var waterPresent = $scope.soilMoisture[$scope.soilMoisture.length - 1].water_present;
    $scope.soilMoistureTimestamp = formatDate($scope.soilMoisture[$scope.soilMoisture.length - 1].timestamp);
    $scope.customStyleWaterPresent = {};
    $scope.customStyleWaterPresent.style = waterPresent ? {"color":"blue", "font-weight":"bold"} : {"color":"black"};    
  });
  $http.get('/wateringEventHistory.json').success(function(wateringEventHistory) {
    $scope.waterPumped = wateringEventHistory;    
    if (wateringEventHistory.length >= 1) {
        $scope.latestPumpEvent1 = wateringEventHistory[wateringEventHistory.length - 1].water_pumped;
        $scope.pumpEventTimestamp1 = formatDate(wateringEventHistory[wateringEventHistory.length - 1].timestamp);
        $scope.waterRecords1 = wateringEventHistory.length;
    }
    if (wateringEventHistory.length >= 2) {
        $scope.latestPumpEvent2 = wateringEventHistory[wateringEventHistory.length - 2].water_pumped;
        $scope.pumpEventTimestamp2 = formatDate(wateringEventHistory[wateringEventHistory.length - 2].timestamp);
        $scope.waterRecords2 = wateringEventHistory.length - 1;
    }
    if (wateringEventHistory.length >= 3) {
        $scope.latestPumpEvent3 = wateringEventHistory[wateringEventHistory.length - 3].water_pumped;
        $scope.pumpEventTimestamp3 = formatDate(wateringEventHistory[wateringEventHistory.length - 3].timestamp);
        $scope.waterRecords3 = wateringEventHistory.length - 2;
    }
  });	
  $http.get('/images_reduced_res.json').success(function(images) {
    $scope.images = [];
    images.forEach(function(image) {
      $scope.images.push({
        'timestamp': image.timestamp,
        'filename': 'images/' + image.filename
      });
    });
    $scope.images.sort(function(a, b) {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    });
    $scope.currentImage = $scope.images.length - 1;
  });  

  $scope.firstImage = function() {
    $scope.currentImage = 0;
  };

  $scope.previousImage = function() {
    $scope.currentImage = Math.max(0, $scope.currentImage - 1);
  };

  $scope.nextImage = function() {
    $scope.currentImage = Math.min(($scope.currentImage + 1),
                                   ($scope.images.length - 1));
  };

  $scope.lastImage = function() {
    $scope.currentImage = $scope.images.length - 1;
  };
});
