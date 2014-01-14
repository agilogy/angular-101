var calendar = angular.module('calendar', []);
calendar.controller('CalendarController', function ($scope) {
	function weeksFor(date) {
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
					events = [{text:'Angular day @ MWC'},{text: 'Angular 101 workshop'}]
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
	}

	$scope.today = new Date();
	$scope.$watch('today.getMonth()', function() {
 		$scope.weeks = weeksFor($scope.today);		
	}); 

	$scope.prev = function() {
		$scope.today.setMonth($scope.today.getMonth()-1);
	}
	$scope.next = function() {
		$scope.today.setMonth($scope.today.getMonth()+1);
	}
});