var widthArr = [60, 40, 50];
var loginUserType;
var TheBranchName;
angular.module('starter.controllers', ['firebase'])

.controller('AuthCtrl', function($scope, $ionicConfig) {

})

// APP
.controller('AppCtrl', function($scope, $location, $state, $ionicConfig, $rootScope, $http, $ionicPopup) {

	$scope.selectChat = function() {
		console.log('click chat ' + $rootScope.propertyCnt);
		$state.go('chatMain');
	}  
})

// Invest
.controller('InvestCtrl', function($scope, $state) {
	
	$scope.sideMenuNavigation = function() {
		if(localStorage.getItem("email") != null) {
			$state.go('app.overview');
		} else
			$state.go('auth.main');
	}  
})

//LOGIN
.controller('LoginCtrl', function($scope, $http, $state, $location) {

	$scope.loginClick= 0;
	$scope.errorLogin=0;

	$scope.updateMe = function() { 
		$scope.loginClick = 1;
    };
    
    $scope.investMe = function() {
	    $state.go('invest.marketing');
    };

    $scope.userDetail = {};
	
	if(localStorage.getItem("email") != null) {
		$scope.userDetail.email = localStorage.getItem("email");
		$scope.userDetail.password = localStorage.getItem("password");
	}

	$scope.submit = function() {    
	   $http({
		    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Login', 
		    method: "POST",
		    data:  {mail:$scope.userDetail.email,
		    	    password:$scope.userDetail.password}, 
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		    
		}).then(function(resp) {
			if(resp.data == "false") {
				$scope.msg = "The Email or Password incorrect";
				$scope.errorLogin=1;
				
				
			}
			else {
				// kick off the platform web client
				Ionic.io();

				// this will give you a fresh user or the previously saved 'current user'
				var user = Ionic.User.current();

				// if the user doesn't have an id, you'll need to give it one.
				if (!user.id) {
					user.id = Ionic.User.anonymousId();
					// user.id = 'your-custom-user-id';
				}

				user.set('name', resp.data["ClientName"]);
				user.set('userid', resp.data["UserId"]);

				//persist the user
				user.save();
				
				localStorage.setItem("loginUserType", resp.data["Type"]);
				if(resp.data["Type"] == "user") {


					loginUserType = "user";
					localStorage.setItem("id", resp.data["UserId"]);
					localStorage.setItem("ClientName", resp.data["ClientName"]);
					localStorage.setItem("isAdmin", resp.data["IsAdmin"]);
					localStorage.setItem("branch", resp.data["BranchId"]);
					localStorage.setItem("email", $scope.userDetail.email);
					localStorage.setItem("password", $scope.userDetail.password);
				}
				else {
					user.set('name', resp.data["ClientName"]);
					loginUserType = "client";
					localStorage.setItem("id", resp.data["ClientId"]);
					localStorage.setItem("ClientName", resp.data["ClientName"]);
					localStorage.setItem("email", $scope.userDetail.email);
					localStorage.setItem("password", $scope.userDetail.password);

					var deviceToken = localStorage.getItem("deviceToken");

					$http({
					    url: 'http://updateme.co.il/index.php/api/Login/setDeviceToken', 
					    method: "POST",
					    data:  {Userid: resp.data["ClientId"],
					    DeviceToken: deviceToken,
					    IsconnectToApp: 1}, 
					    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					    
					}).then(function(resp) {

						console.log(resp);

						});
				}
					
				$state.go('app.overview');
			}
		
		}, function(err) {
		    $scope.msg = err;
		    console.error('ERR', err);
		})
    };
})

//Marketing Ctrl - show all marketing properties per branch
.controller('MarketingCtrl', function($scope, $http, $state, $rootScope, $timeout, $q)  {
    
	var rndval;
	var rndvalKodem = 0;
	var i = 0;
	var $x;
	$scope.selectedBranch = "";
	$scope.showRochester = 1;
	$scope.showCleveland = 1;
	$scope.showColumbus = 1;
	$scope.showJacksonviller = 1;	
	$rootScope.isRouteLoading = true;

	var promise = getProperties($scope, $http, $q);
	promise.then(function() {
	}, function() {
		alert('Failed: ');
	});
	
	$scope.seeMore = function(branchId) {		
		$scope.selectedBranch = branchId;
		$timeout(function() {
			$('.scroll').css('transform', 'translate3d(0px, 0px, 0px) scale(1)');
		});		
	};
	
	$scope.back = function() {
		$scope.selectedBranch = "";
	}
	
	$scope.marketingDetails = function(propertyId) {	
		$state.go('invest.marketingDetails');
		$timeout(function() {
	    	var unbind = $rootScope.$broadcast( "marketingDetails", {marketingPropertyId:propertyId} );
	    });
	};
})

//propertyDetails ctrl
.controller('MarketingDetailsCtrl', function($scope, $http, $rootScope,  $ionicSlideBoxDelegate) {
	$scope.$on( "marketingDetails", function(event, data) {
		propertyId = data.marketingPropertyId;
		getAllMarketingPropertyImages(propertyId, $scope, $http);
		getMarketingPropertyInfo(propertyId, $scope, $http);
	});	
})

.controller('ChatsCtrl', function($scope, $ionicHistory, $state, $rootScope, $firebaseObject ,$firebaseArray, $ionicScrollDelegate, $rootScope ) {



		$scope.branchToChat = function (BranchName) {

		TheBranchName = BranchName;

		console.log(BranchName);

		$scope.chatSelected = false;

		$state.go('chats');

	}

		$scope.selectChat = function() {

			if ($rootScope.propertyCnt > 1 ) {


				$scope.chatSelected = true;



			}

			else {

				TheBranchName = $rootScope.TheBranchName;
				$state.go('chats');



			}



		} 

	





	$scope.chatIsActive = false;

	$scope.myId = localStorage.getItem("id");
	var userId = localStorage.getItem("id");

	var ref = new Firebase("https://updatemeapp.firebaseio.com/messages/" + TheBranchName + "/" + userId);

	ref.on("child_added", function(date) {	

		alert(date)

		$ionicScrollDelegate.scrollBottom();
		$ionicScrollDelegate.scrollBottom();

		

		

	});

		$ionicScrollDelegate.scrollBottom();

	$scope.chats = $firebaseArray(ref);

	var username = localStorage.getItem("ClientName");


	$scope.sendChat = function(chat) {

		$scope.chats.$add({
			user: username,
			userid: userId,
	        message: chat.message,
	        client: 'true',
	        timestamp: new Date().getTime()
		});
		chat.message = "";


	}

	$scope.myGoBack = function() {
    $ionicHistory.goBack();
  };


})




//OverviewProperties Ctrl - logged in user
.controller('OverviewPropertiesCtrl', function($scope, $http, $timeout, $rootScope, $state, $q) {
    var id;  
    $scope.isOverviewLoading = true;
    
    var promise = getOverviewPageData($scope, $rootScope, $http, $q);
	promise.then(function() {
	}, function() {
		alert('Failed: ');
	});
	
	getMainBarValues($scope, $http);
	
	$scope.showPropertyDetails = function(propertyId, imageURL) {
		console.log("showDetails function " + propertyId);
		$state.go('app.propertyDetails');
	    $timeout(function() {
	    	var unbind = $rootScope.$broadcast( "showDetails", {PropertyId:propertyId, ImageURL:imageURL} );
	    });
	}
})

//propertyDetails ctrl
.controller('PropertyDetailsCtrl', function($scope, $ionicScrollDelegate, $http, $rootScope, $timeout, $q) {
	
	$scope.showPurchase = 1;
	$scope.showClosing = 0;
	$scope.showRenovation = 0;
	$scope.showLeasing = 0;
	$scope.showOccupied = 0;
	$scope.showEviction = 0;
	
	$scope.requestPopup = 0;
	$scope.Info = {};
	
	$rootScope.isPropertyDetailsLoading = true;
	
	var propertyId;
	$scope.$on( "showDetails", function(event, data) {
		propertyId = data.PropertyId;	
		var promise = getOverviewDetailsPageData(propertyId, $scope, $http, $q);
		promise.then(function() {
		}, function() {
			alert('Failed: ');
		});	
		getPropertyChart(propertyId, $scope, $http);
	});
	
	$scope.click = function(section) {		
		switch(section){
			case 1:
				$scope.showPurchase = ($scope.showPurchase) ? 0 : 1;
				break;
			case 2:
				$scope.showClosing = ($scope.showClosing) ? 0 : 1;
				break;
			case 3:
				$scope.showRenovation = ($scope.showRenovation) ? 0 : 1;
				break;
			case 4:
				$scope.showLeasing = ($scope.showLeasing) ? 0 : 1;
				break;
			case 5:
				$scope.showOccupied = ($scope.showOccupied) ? 0 : 1;
				break;
			case 6:
				$scope.showEviction = ($scope.showEviction) ? 0 : 1;
				break;
		}		
	};
	
	$scope.requestInfo = function() {
		$ionicScrollDelegate.scrollBottom();
		$scope.requestPopup = 1;
		$('#requestInfo').removeClass('fadeOut').addClass('fadeIn');		
		$('input[type=checkbox]').removeAttr('checked');
	};

	$scope.sendRequestInfo = function() {
	$ionicScrollDelegate.scrollTop();		
		console.log($scope.Info);
		for(var i in $scope.Info) {
			if($scope.Info[i]) {
				$http({
		    	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/RequestUpdate', 
		    	    method: "GET",
		    	    params:  { id:propertyId, table:i }, 
		    	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		    	}).then(function(resp) {
		    		
		    	}, function(err) {
		    	    console.error('ERR', err);
		    	})
			}
		}
		
		$('#requestInfo').removeClass('fadeIn').addClass('fadeOut');		
		$timeout(function() {					
			$scope.requestPopup = 0;
		});	
	};
})


.controller('DashCtrl', function($scope) {})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

function getPropertyImage(propertyId, $scope, $http) {	
	console.log("getPropertyImage function" + propertyId);
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage/getAllPropertyImages', 
	    method: "GET",
	    params:  {PropertyId: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			console.log(resp.data);
			$scope.allImages = resp.data;			
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getPropertyChart(propertyId, $scope, $http) {
	console.log("getPropertyChart function" + propertyId);
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Property/getPropertyROIChartAPI', 
	    method: "GET",
	    params:  {index: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.propertyChart = resp.data[0];
			
			var totalReturn = parseFloat(resp.data[0]['TotalReturn']);
			var investmentAmount = parseFloat(resp.data[0]['InvestmentAmount']);
			var dbDate = resp.data[0]['InvestmentDate'];
			
			var today = new Date();
			var date = (dbDate != "0000-00-00") ? new Date(dbDate) : new Date();
			
			var months;
		    months = (today.getFullYear() - date.getFullYear()) * 12;
		    months -= date.getMonth() + 1;
		    months += today.getMonth();
		    $scope.month = months <= 0 ? 0 : months;
 
		    
		    $scope.currentYield = ($scope.month && investmentAmount) ? totalReturn / $scope.month * 12 / investmentAmount : 0;
			var val = (investmentAmount != 0) ? totalReturn / investmentAmount * 100 : 0;
			
			$scope.propertyChart.InvestmentAmount = numberWithCommas($scope.propertyChart.InvestmentAmount);
			$scope.propertyChart.TotalReturn = numberWithCommas($scope.propertyChart.TotalReturn);
			
			// bar
			var div1 = d3.select(document.getElementById('div2'));
			start();

			function onClick1() {
			    deselect();
			}

			function labelFunction(val,min,max) {

			}

			function deselect() {
			    //div1.attr("class","radial");
			}

			function start() {
				$('.label').val("sghdsfhsdf");
			    var rp1 = radialProgress(document.getElementById('div2'))
			            .label("ROI")
			            .onClick(onClick1)
			            .diameter(120)
			            .value(val)
			            .render();
			}
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getPurchaseDetails(propertyId, $scope, $http) {
	console.log("getPurchaseDetails function");
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PurchaseAndSale', 
	    method: "GET",
	    params:  {index: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.purchaseAndSale = resp.data[0];
			
			$scope.purchaseAndSale['ClosignDate'] = dateFormat($scope.purchaseAndSale['ClosignDate']);
			$scope.purchaseAndSale['Closed'] = dateFormat($scope.purchaseAndSale['Closed']);
			
			$scope.isHasPurchaseFile = $scope.purchaseAndSale['IsHasFile'] == 1 ? true : false;
			$scope.IsBuyerFile = $scope.purchaseAndSale['IsBuyerFile'] == 1 ? true : false;
			$scope.IsSignedDocsFile = $scope.purchaseAndSale['IsSignedDocsFile'] == 1 ? true : false;
			$scope.IsBalanceFile = $scope.purchaseAndSale['IsBalanceFile'] == 1 ? true : false;
			$scope.IsFilesTo = $scope.purchaseAndSale['IsFilesToS‌ignFile'] == 1 ? true : false;
			$scope.showPurchaseNote = $scope.purchaseAndSale['ShowNote'] == 1 ? true : false;
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getClosingDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Closing', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.closing = resp.data[0];

			$scope.IsClosingHasFile = $scope.closing['IsHasFile'] == 1 ? true : false;
			$scope.IsWalkThroghFile = $scope.closing['IsWalkThroghFile'] == 1 ? true : false;
			$scope.IsInsuranceFile = $scope.closing['IsInsuranceFile'] == 1 ? true : false;
			$scope.IsClosingDocsFile = $scope.closing['IsClosingDocsFile'] == 1 ? true : false;
			$scope.showClosingNote = $scope.closing['ShowNote'] == 1 ? true : false;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getRenovationDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Renovation', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.renovation = resp.data[0];
		
			$scope.renovation['StartDate'] = dateFormat($scope.renovation['StartDate']);
			$scope.renovation['FinishDate'] = dateFormat($scope.renovation['FinishDate']);
			$scope.renovation['CofODate'] = dateFormat($scope.renovation['CofODate']);
			
			$scope.IsHasRenovationFile = $scope.renovation['IsHasFile'] == 1 ? true : false;
			$scope.IsFundsSentFile = $scope.renovation['IsFundsSentFile'] == 1 ? true : false;
			$scope.IsWorkEstimateFile = $scope.renovation['IsWorkEstimateFile'] == 1 ? true : false;
			$scope.IsPayment1File = $scope.renovation['IsPayment1File'] == 1 ? true : false;
			$scope.IsPayment2File = $scope.renovation['IsPayment2File'] == 1 ? true : false;
			$scope.IsPayment3File = $scope.renovation['IsPayment3File'] == 1 ? true : false;
			$scope.IsCOFOFile = $scope.renovation['IsCOFOFile'] == 1 ? true : false;
			$scope.showRenovationNote = $scope.renovation['ShowNote'] == 1 ? true : false;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getLeasingDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Leasing', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
			$scope.leasing = resp.data[0];
		
			$scope.leasing['StartDate'] = dateFormat($scope.leasing['StartDate']);
			$scope.leasing['EstimateRentDate'] = dateFormat($scope.leasing['EstimateRentDate']);
			$scope.leasing['MoveInDate'] = dateFormat($scope.leasing['MoveInDate']);
			
			$scope.IsHasLeasingFile = $scope.leasing['IsHasFile'] == 1 ? true : false;
			$scope.IsApplicationFile = $scope.leasing['IsApplicationFile'] == 1 ? true : false;
			$scope.IsLeaseFile = $scope.leasing['IsLeaseFile'] == 1 ? true : false;
			$scope.showLeasingNote = $scope.leasing['ShowNote'] == 1 ? true : false;
		}		
	}, function(err) {
	    console.error('ERR', err);
	})	
}

function getOccupiedDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Occupied', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
			$scope.occupied = resp.data[0];
			console.log($scope.occupied);
			$scope.occupied['EvictionDate'] = dateFormat($scope.occupied['EvictionDate']);
			$scope.occupied['GoingToBeVacent'] = dateFormat($scope.occupied['GoingToBeVacent']);
			
			$scope.IsHasOccupiedFile = $scope.occupied['IsHasFile'] == 1 ? true : false;
			$scope.IsMaintanenceFile = $scope.occupied['IsMaintanenceFile'] == 1 ? true : false;
			$scope.showOccupiedNote = $scope.occupied['ShowNote'] == 1 ? true : false;
		}
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getEvictionDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Eviction', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.eviction = resp.data[0];

			$scope.eviction['CourtDate'] = dateFormat($scope.eviction['CourtDate']);
			$scope.eviction['RemovedDate'] = dateFormat($scope.eviction['RemovedDate']);
			
			$scope.IsHasEvictionFile = $scope.eviction['IsHasFile'] == 1 ? true : false;
			$scope.showEvictionNote = $scope.eviction['ShowNote'] == 1 ? true : false;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function addClass(data) {
	var length = data.length;
	var rndvalKodem;
	var rndval;
	
	//----------------------
	//add col- class
	if(data.length % 2 != 0) {
		data[data.length - 1].class = "col-100";
		length -= 1;
	}
	
	rndvalKodem = 0;
	for(var i = 0; i < length; i+=2) {
		do {
			rndval = widthArr[Math.floor(Math.random()*widthArr.length)];
		} while (rndval == rndvalKodem);
		rndvalKodem = rndval;				
		data[i].class = "col-" + rndval;
		rndval = 100 - rndval;
		data[i+1].class = "col-" + rndval;
	}
	
	//----------------------
	//add desaturate class
	for(i = 0; i < data.length; i++) {
		if(data[i]["IsSoled"] == 1) {
			data[i].class += " desaturate";
		}
	}
}

function getRochesterProperties($scope, $http) {
	// get properties to Rochester branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:1}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.rochesterProperties = [];
		$scope.rochesterProperties = resp.data;
		
		if(resp.data.length == 0) {
			$scope.showRochester = 0;
		}
		addClass($scope.rochesterProperties);
		
	}, function(err) {
	    console.error('ERR', err);
	});
}

function getClevelandProperties($scope, $http) {
	// get properties to cleveland branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:2}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.clevelandProperties = [];
		$scope.clevelandProperties = resp.data;
		if(resp.data.length == 0) {
			$scope.showCleveland = 0;
		}
		addClass($scope.clevelandProperties);
	
	}, function(err) {
	    console.error('ERR', err);
	});
} 


function getColumbusProperties($scope, $http) {
	// get properties to columbus branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:3}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.columbusProperties = [];
		$scope.columbusProperties = resp.data;
		if(resp.data.length == 0) {
			$scope.showColumbus = 0;
		}
		addClass($scope.columbusProperties);
	
	}, function(err) {
	    console.error('ERR', err);
	});
}

function getJacksonvilleProperties($scope, $http) {
	// get properties to jacksonville branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:4}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.jacksonvilleProperties = [];
		$scope.jacksonvilleProperties = resp.data;
		if(resp.data.length == 0) {
			$scope.showJacksonviller = 0;
		}
		addClass($scope.jacksonvilleProperties);
		
	}, function(err) {
	    console.error('ERR', err);
	}); 
}

function getProperties($scope, $http, $q) {	 
	return $q.all([getRochesterProperties($scope, $http), getClevelandProperties($scope, $http), 
	                getColumbusProperties($scope, $http), getJacksonvilleProperties($scope, $http)]).
	                then(function(results) {
		$scope.isRouteLoading = false;
	});
}

function getAllMarketingPropertyImages(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getAllMarketingPropertyImages', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.marketingPropertyImages = resp.data;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getMarketingPropertyInfo(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getMarketingId', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.marketingData = resp.data[0];
			console.log($scope.marketingData);
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

//get main bar values
function getMainBarValues($scope, $http) {	
    url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Property/getPropertiesROIChartAPI';
	id = localStorage.getItem('id');
	$http({
	    url: url, 
	    method: "GET",
	    params:  {index:id}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.propertyBar = [];

		$scope.propertyBar = resp.data[0];
		
		var val = resp.data[0]['TotalReturn'] / resp.data[0]['InvestmentAmount'] * 100;
		
		$scope.propertyBar.InvestmentAmount = numberWithCommas($scope.propertyBar.InvestmentAmount);
		$scope.propertyBar.TotalReturn = numberWithCommas($scope.propertyBar.TotalReturn);
		
		// bar
		var div1 = d3.select(document.getElementById('div1'));
		start();

		function onClick1() {
		    deselect();
		}

		function labelFunction(val,min,max) {

		}

		function deselect() {
		    //div1.attr("class","radial");
		}

		function start() {
			$('.label').val("sghdsfhsdf");
		    var rp1 = radialProgress(document.getElementById('div1'))
		            .label("ROI")
		            .onClick(onClick1)
		            .value(val)
		            .render();
		}
	
	}, function(err) {
	    console.error('ERR', err);
	})
}

//get properties for 'your properties' section
function getPropertiesForYourPropertiesSection($scope, $rootScope, $http) {	
	if(loginUserType == "client") {    	
    	url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage';
    	id = localStorage.getItem('id');
    	return $http({
    	    url: url, 
    	    method: "GET",
    	    params:  {index:id}, 
    	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    	}).then(function(resp) {

    		$scope.propertyImage = [];
    		$scope.propertyImage = resp.data;

    		console.log(resp.data[0]);
    		
    		$rootScope.propertyCnt = resp.data.length;

    		if ($rootScope.propertyCnt == 1) {


    			$rootScope.TheBranchName = resp.data['BranchName'];


    		}
    		
    		addClass($scope.propertyImage);
    		
    	}, function(err) {
    	    console.error('ERR', err);
    	})
    }
}

//get properties for 'special deals section'
function getPropertiesForSpecialDealsSection($scope, $http) {
	if(loginUserType == "client") {    	
		url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage/getSpecialDealsPropertyImage';
		id = localStorage.getItem('id');
		return $http({
		    url: url, 
		    method: "GET",
		    params:  {index:id}, 
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		}).then(function(resp) {
	
			$scope.specialPropertyImage = [];
			$scope.specialPropertyImage = resp.data;
	
			addClass($scope.specialPropertyImage);
			
		}, function(err) {
		    console.error('ERR', err);
		})
	}
}

function getOverviewPageData($scope, $rootScope, $http, $q) {	 
	return $q.all([getPropertiesForYourPropertiesSection($scope, $rootScope, $http), 
	               getPropertiesForSpecialDealsSection($scope, $http)]).
	                then(function(results) {
		$scope.isOverviewLoading = false;
	});
}

function getOverviewDetailsPageData(propertyId, $scope, $http, $q) {
	return $q.all([getPropertyImage(propertyId, $scope, $http),	                
	               getPurchaseDetails(propertyId,$scope, $http), 
	               getClosingDetails(propertyId, $scope, $http),
	               getRenovationDetails(propertyId, $scope, $http), 
	               getLeasingDetails(propertyId, $scope, $http),
	               getOccupiedDetails(propertyId, $scope, $http),
	               getEvictionDetails(propertyId, $scope, $http)]).
	                then(function(results) {
		$scope.isPropertyDetailsLoading = false;
	});
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dateFormat(date) {
	var formattedDate = new Date(date);
	return (formattedDate.getMonth() + 1) + '/' + formattedDate.getDate() + '/' +  formattedDate.getFullYear();
}