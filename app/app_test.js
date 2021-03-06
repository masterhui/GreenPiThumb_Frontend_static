'use strict';

describe('greenPiThumbApp controller', function() {
  var mockScope = {};
  var controller;
  var backend;

  beforeEach(angular.mock.module('greenPiThumbApp'));

  beforeEach(angular.mock.inject(function($httpBackend) {
    backend = $httpBackend;
    backend.expect('GET', '/temperatureHistory.json').respond(
      [
        {'timestamp': '20170408T1315Z', 'temperature': 22.0},
        {'timestamp': '20170408T1330Z', 'temperature': 24.0},
        {'timestamp': '20170408T1345Z', 'temperature': 25.0}
      ]);
    backend.expect('GET', '/waterLevelHistory.json').respond(
      [
        {'timestamp': '20170408T1315Z', 'water_level': 22.0},
        {'timestamp': '20170408T1330Z', 'water_level': 29.0},
        {'timestamp': '20170408T1345Z', 'water_level': 37.0}
      ]);      
    backend.expect('GET', '/humidityHistory.json').respond(
      [
        {'timestamp': '20170408T1315Z', 'humidity': 51.0},
        {'timestamp': '20170408T1330Z', 'humidity': 52.0},
        {'timestamp': '20170408T1345Z', 'humidity': 53.0}
      ]);
    backend.expect('GET', '/lightHistory.json').respond(
      [
        {'timestamp': '20170408T1315Z', 'light': 66.1},
        {'timestamp': '20170408T1330Z', 'light': 66.2},
        {'timestamp': '20170408T1345Z', 'light': 66.3}
      ]);
    backend.expect('GET', '/soilMoistureHistory.json').respond(
      [
        {'timestamp': '20170408T1315Z', 'soil_moisture': 888.0},
        {'timestamp': '20170408T1330Z', 'soil_moisture': 888.1},
        {'timestamp': '20170408T1345Z', 'soil_moisture': 888.2}
      ]);
    backend.expect('GET', '/images.json').respond(
      [
        {'timestamp': '20170408T1315Z', 'filename': '2017-04-08T1315Z.jpg'},
        {'timestamp': '20170408T1330Z', 'filename': '2017-04-08T1330Z.jpg'},
        {'timestamp': '20170408T1345Z', 'filename': '2017-04-08T1355Z.jpg'}
      ]);
  }));

  beforeEach(angular.mock.inject(function($controller, $rootScope, $http) {
    mockScope = $rootScope.$new();
    controller = $controller('DashboardCtrl', {
      $scope: mockScope,
      $http: $http
    });
    backend.flush();
  }));

  it('makes all expected AJAX requests', function() {
    backend.verifyNoOutstandingExpectation();
  });

  it('Creates latest* variables', function() {
    expect(mockScope.latestTemperature).toEqual(77.0);
    expect(mockScope.latestWaterLevel).toEqual(35.0);
    expect(mockScope.latestHumidity).toEqual(53.0);
    expect(mockScope.latestLightLevel).toEqual(66.3);
    expect(mockScope.latestSoilMoisture).toBeCloseTo(86.8, 1);
  });

  it('Creates full history variables', function() {
    expect(mockScope.temperature).toBeDefined();
    expect(mockScope.waterLevel).toBeDefined();
    expect(mockScope.humidity).toBeDefined();
    expect(mockScope.lightLevel).toBeDefined();
    expect(mockScope.soilMoisture).toBeDefined();
  });

  it('initializes currentImage correctly', function() {
    expect(mockScope.currentImage).toEqual(2);
  });

  it('jumps to end-boundary image', function() {
    mockScope.firstImage();
    expect(mockScope.currentImage).toEqual(0);
    mockScope.firstImage();
    expect(mockScope.currentImage).toEqual(0);
    mockScope.lastImage();
    expect(mockScope.currentImage).toEqual(2);
    mockScope.lastImage();
    expect(mockScope.currentImage).toEqual(2);
  });

  it('cycles images forward correctly', function() {
    mockScope.firstImage();
    expect(mockScope.currentImage).toEqual(0);
    mockScope.nextImage();
    expect(mockScope.currentImage).toEqual(1);
    mockScope.nextImage();
    expect(mockScope.currentImage).toEqual(2);
    // Can't go past the end.
    mockScope.nextImage();
    expect(mockScope.currentImage).toEqual(2);
  });

  it('cycles images backward correctly', function() {
    mockScope.previousImage();
    expect(mockScope.currentImage).toEqual(1);
    mockScope.previousImage();
    expect(mockScope.currentImage).toEqual(0);
    // Can't go before first image.
    mockScope.previousImage();
    expect(mockScope.currentImage).toEqual(0);
  });
});
