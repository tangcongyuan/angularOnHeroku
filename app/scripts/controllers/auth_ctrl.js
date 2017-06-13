(function(){
  'use strict';

  var url = 'https://erictang.herokuapp.com';
  // var url = 'http://localhost:8000';

  angular.module('angular-app')
    .factory('authInterceptor', authInterceptor)
    .service('user', userService)
    .service('auth', authService)
    .constant('API', url)
    .config(function($httpProvider) {
      $httpProvider.interceptors.push('authInterceptor');
    })
    .controller('AuthCtrl', AuthCtrl);

  function authInterceptor(API, auth) {
    return {
      // automatically attach Authorization header
      request: function(config) {
        var token = auth.getToken();
        if(config.url.indexOf(API) === 0 && token) {
          config.headers.Authorization = 'JWT ' + token;
        }
        return config;
      },

      // If a token was sent back, save it
      response: function(res) {
        if(res.config.url.indexOf(API) === 0 && res.data.token) {
          auth.saveToken(res.data.token);
        }
        return res;
      },
    };
  }

  function authService($window) {
    var vm = this;

    // Add JWT methods here
    vm.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    };

    vm.saveToken = function(token) {
      $window.localStorage['jwtToken'] = token;
    };

    vm.getToken = function() {
      return $window.localStorage['jwtToken'];
    };

    vm.isAuthed = function() {
      var token = vm.getToken();
      if(token) {
        var params = vm.parseJwt(token);
        return Math.round(new Date().getTime() / 1000) <= params.exp;
      } else {
        return false;
      }
    };

    vm.logout = function() {
      $window.localStorage.removeItem('jwtToken');
    };
  }

  function userService($http, API, auth) {
    var vm = this;
    vm.getAPIs = function() {
      return $http.get(API + '/auth/');
    };

    // add authentication methods here
    vm.signup = function(form) {
      return $http.post(API + '/auth/accounts/', { username: form.username, email: form.email, password: form.password, confirm_password: form.confirmPassword });
    };

    vm.login = function(form) {
      return $http.post(API + '/api-token-auth/', { email: form.email, password: form.password });
    };
  }

  // When not injecting $scope, must use Controller As syntax. Because that way
  // Angular will treat LoginCtrl as construction function and LoginCtrl will have
  // its own namespace, $scope.login, according to index.html file.
  function AuthCtrl(user, auth, $state, $timeout){
    var vm = this;

    function handleLoginRequest(res) {
      console.log("handleLoginRequest: ");
      console.log(res);
      var token = res.data ? res.data.token : null;
      if(token) {
        console.log('JWT: ', token);
        $state.go('home');
      }
      // vm.message = res.data.message;
      vm.message = res.data.message ? res.data.message : "";
      if (res.data.non_field_errors) { vm.message = res.data.non_field_errors[0]; }
    }

    function handleFailedLoginRequest(res) {
      console.log("handleFailedLoginRequest: ");
      console.log(res);
      vm.message = res.data.message ? res.data.message : "";
      if (res.data.non_field_errors) { vm.message = res.data.non_field_errors[0]; }
    }

    function handleSignupRequest(res) {
      console.log("handleSignupRequest: ");
      console.log(res);
      vm.message = res.data.message ? res.data.message : "";
      // if (res.data.username) {
      //   $state.go('login');
      // }
      return res;
    }

    function handlePostSignupRequest(res) {
      console.log("handlePostSignupRequest: ");
      console.log(res);
      vm.message = res.data.message ? res.data.message : "";
      if (res.data.username) {
        user.login(res.data)
            .then(handleLoginRequest, handleFailedLoginRequest);
      }
      return res;
    }

    vm.login = function() {
      user.login(vm.loginForm)
          .then(handleLoginRequest, handleFailedLoginRequest);
    };
    vm.signup = function() {
      user.signup(vm.signupForm)
          .then(handleSignupRequest, handleSignupRequest)
          .then(handlePostSignupRequest, handlePostSignupRequest);
    };
    vm.getAPIs = function() {
      user.getAPIs()
          .then(handleLoginRequest, handleLoginRequest);
    };
    vm.logout = function() {
      auth.logout && auth.logout();
    };
    vm.isAuthed = function() {
      return auth.isAuthed ? auth.isAuthed() : false;
    };
  }
})();
