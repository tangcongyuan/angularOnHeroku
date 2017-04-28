(function(){
  'use strict';

  angular.module('angular-app')
    .controller('MainCtrl', MainCtrl);

  // When not injecting $scope, must use Controller As syntax. Because that way
  // Angular will treat MainCtrl as construction function and MainCtrl will have
  // its own namespace, $scope.main, according to index.html file.
  function MainCtrl(user, auth){
    var vm = this;
    user.getAccounts().then(function (res) {
      console.log("You're seeing this because Eric is displaying all the accounts in the backend server.");
      console.log(res);
    });
  }
})();
