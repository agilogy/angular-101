var calendar = angular.module('calendar', ['ui.bootstrap']);
calendar.factory('CalendarService', function() {
	var calendar = {};

	var sameDate = function(date1, date2) {
		var res =  
			date1.getDate() == date2.getDate() && 
			date1.getMonth() == date2.getMonth() &&
			date1.getYear() == date2.getYear();
		return res;
	};

	return {
		weeksFor: function(date) {
			var year = date.getFullYear();
			var currentDay = new Date(date.getFullYear(), date.getMonth(), 1);
			currentDay.setDate(-1*currentDay.getDay() + 1);
			var result = [];
			var showMoreWeeks = true
			while(showMoreWeeks) {
				var weekName = currentDay.getFullYear() + "-" + currentDay.getMonth() + "-" + currentDay.getDate();
				if (! (weekName in calendar)) {
					calendar[weekName] = [];
					for (var i=0; i < 7; i++) {
						calendar[weekName].push({
							date: new Date(currentDay.getTime()),
							events: []
						});
						currentDay.setDate(currentDay.getDate()+1);
					}
				} else {					
					currentDay.setDate(currentDay.getDate()+7);
				}
				result.push(calendar[weekName]);
				var tmp = new Date(currentDay.getTime());
				tmp.setDate(tmp.getDate()+1);
				showMoreWeeks = date.getMonth() === tmp.getMonth();
			}
			return result;
		},
		addEvent: function(day, description) {
			day.events.push({date: day.date, description: description});
		}
	}
});

calendar.controller('AddEventController', function($scope, $modalInstance, title, event) {
	$scope.title = title;
	$scope.event = event;
	$scope.ok = function () {
    	$modalInstance.close($scope.event);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});

calendar.controller('CalendarController', function ($scope, $modal, CalendarService) {

	$scope.today = new Date();
	$scope.$watch('today.getMonth()', function() {
 		$scope.weeks = CalendarService.weeksFor($scope.today);		
	}); 

	$scope.prev = function() {
		$scope.today.setMonth($scope.today.getMonth()-1);
	}
	$scope.next = function() {
		$scope.today.setMonth($scope.today.getMonth()+1);
	}

	$scope.addEvent = function(day) {
		var modalInstance = $modal.open({
		    templateUrl: 'addEvent.html',
		    controller: 'AddEventController',
		    backdrop: false,
		    resolve: {
		    	title: function() { return 'Add new event'; },
		    	event: function() {
		    		return {description: ""}
		    	}
		    }
		 });

		modalInstance.result.then(function (event) {
		    CalendarService.addEvent(day, event.description);
		});
	}

	$scope.editEvent = function(day, event) {
		var modalInstance = $modal.open({
		    templateUrl: 'addEvent.html',
		    controller: 'AddEventController',
		    backdrop: false,
		    resolve: {
		    	title: function() { return 'Edit event'; },
		    	event: function() {
		    		return {date: event.date, description: event.description};
		    	}
		    }
		 });

		modalInstance.result.then(function (newEvent) {
		    event.description = newEvent.description;
		});   		
		window.event.stopPropagation();
	}
});