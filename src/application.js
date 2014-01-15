var calendar = angular.module('calendar', ['ui.bootstrap']);
calendar.factory('CalendarService', function() {
	return {
		weeksFor: function(date) {
			var today = new Date();
			today.setHours(0,0,0,0)
			var first = new Date(date.getTime());
			first.setHours(0,0,0,0)
			first.setDate(1);
	       	first.setDate(-1*first.getDay() + 1);

	       	//Let's find out how many weeks we need to paint (either 5 or 6)
	       	var tmp = new Date(first.getTime());
	       	var numWeeks = 5;
	       	tmp.setDate(first.getDate() + 5*7);
	       	if (tmp.getMonth() == date.getMonth()) {
	       		numWeeks = 6;
	       	}

			var result = [];
			for(var w = 0; w < numWeeks; w++) {
				var days = new Array();
				for (var d=0; d < 7; d++ ) {
					var events = [];
					if (first.getTime() === today.getTime()) {
						events = [{description:'Angular day @ MWC'},{description: 'Angular 101 workshop'}]
					}
					days.push( {
						date: new Date(first.getTime()),
						events: events
					});
					first.setDate(first.getDate()+1);
				}
				result.push(days);
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
});