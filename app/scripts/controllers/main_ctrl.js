(function(){
  'use strict';

  angular.module('angular-app')
    .controller('MainCtrl', MainCtrl);

  // When not injecting $scope, must use Controller As syntax. Because that way
  // Angular will treat MainCtrl as construction function and MainCtrl will have
  // its own namespace, $scope.main, according to index.html file.
  function MainCtrl(user, auth){
    var vm = this;
    console.log("auth.isAuthed(): " + auth.isAuthed());
    user.getAPIs().then(function (res) {
      console.log("If you have problem viewing following content, please try to login first.");
      console.log(res);
    },
    function (res) {
      console.log("If you have problem viewing following content, please try to login first.");
      console.log(res);
    });
  }
})();
