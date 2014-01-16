var calendar = angular.module('calendar', ['ui.bootstrap']);
//This is not very secure but will do for the example :)
calendar.value('apiKey', '2jdls3j01yfsjygh515y');
calendar.factory('apiUrl', function(apiKey) {
	return function(url) {
		return 'https://api.mongohq.com/databases/angular101/collections/calendars' + url + '?_apikey=' + apiKey;
	}
});

/*calendar.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);
*/

calendar.value('calendarId', function() {
	var calendarId = localStorage.getItem('calendarId') 
	if ( !calendarId ) {
		calendarId = (Math.random() + 1).toString(36).substring(7);
		localStorage.setItem('calendarId',calendarId);
	}
	return calendarId;
}());

calendar.factory('CalendarStore', function(calendarId, apiUrl, $http) {
	var store = function(calendar) {
		//Let's make sure that the calendar has an id
		calendar._id = calendarId;
		var data = { document: calendar };
		return $http.put(apiUrl('/documents/'+calendarId), data)
	};

	var createEmptyCalendar = function() {
		$http.post(apiUrl('/documents'), {document: {_id: calendarId}});
	};

	return {
		get: function() {
			return $http.get(apiUrl('/documents/'+calendarId)).then(function(response) {
				if (response.data === "null") {
					createEmptyCalendar();
					return({});
				} else {
					return response.data;					
				}
			});
		},
		store: store
	}
});

//TODO: Get rid of this?
calendar.run(function(CalendarStore) {
	//Create the calendar if it does not exist yet
	//Let's create the calendar if it does not exist already
	CalendarStore.get().then(function(data) {
		if (data === "null") {
			//Calendar does not exist, create an empty one
		}
	});
})

calendar.factory('CalendarService', function(CalendarStore, $q, $filter) {
	var calendar = {};

	var sameDate = function(date1, date2) {
		var res =  
			date1.getDate() == date2.getDate() && 
			date1.getMonth() == date2.getMonth() &&
			date1.getYear() == date2.getYear();
		return res;
	};

	var firstDayOfWeek = function(date) {
		var result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		if (date.getDay() != 0) {
			result.setDate(-1*date.getDay() + 1);
		} 
		return result;
	};

	var weekNameFor = function(date) {
		var first = firstDayOfWeek(date);
		return first.getFullYear() + "-" + first.getMonth() + "-" + first.getDate();
	};

	var emptyWeek = function(firstDay) {
		var currentDay = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate());
		var result = [];
		for (var i=0; i < 7; i++) {
			result.push({
				date: $filter('date')(currentDay, 'yyyy-MM-dd'),
				events: []
			});
			currentDay.setDate(currentDay.getDate()+1);
		}
		return result;
	}

	return {
		weeksFor: function(date) {
			var r = $q.defer();
			var currentDay = firstDayOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));

			CalendarStore.get().then(function(c) {
				calendar = c;
				var result = [];
				var showMoreWeeks = true;
				while(showMoreWeeks) {
					var weekName = weekNameFor(currentDay);
					if (! (weekName in calendar)) {
						//This week has no events
						calendar[weekName] = emptyWeek(currentDay);
					} 
					result.push(calendar[weekName]);
					currentDay.setDate(currentDay.getDate()+7);
					showMoreWeeks = currentDay.getMonth() === date.getMonth();
				}
				r.resolve(result);
			});
			return r.promise;
		},
		addEvent: function(day, description) {
			day.events.push({date: day.date, description: description});
			CalendarStore.store(calendar);
		},
		updateEvent: function(day, event, newEvent) {
			event.description = newEvent.description;
			CalendarStore.store(calendar);
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
 		CalendarService.weeksFor($scope.today).then(function(weeks) {
 			$scope.weeks = weeks;
 		})
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
		   	CalendarService.updateEvent(day, event, newEvent);

		});
		window.event.stopPropagation();
	}

	$scope.otherMonth = function(dateAsString) {
		var date = new Date(dateAsString);
		return date.getMonth()!=$scope.today.getMonth();
	}
});

calendar.run(function() {

})