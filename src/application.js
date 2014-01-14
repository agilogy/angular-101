var calendar = angular.module('calendar', []);
calendar.controller('CalendarController', function ($scope) {
  $scope.today = new Date();
  $scope.prev = function() {
  	$scope.today.setDate($scope.today.getDate()-1);
  }
  $scope.next = function() {
  	$scope.today.setDate($scope.today.getDate()+1);

  }
});