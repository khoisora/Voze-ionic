angular.module('app', ['ionic','ngMaterial','ngMessages', 'nvd3', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngAnimate','cfp.loadingBarInterceptor'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(['$stateProvider', '$urlRouterProvider','$ionicConfigProvider','cfpLoadingBarProvider', '$mdThemingProvider', '$provide', function($stateProvider, $urlRouterProvider, $ionicConfigProvider,cfpLoadingBarProvider, $mdThemingProvider, $provide) {
  $ionicConfigProvider.views.maxCache(1);
  $ionicConfigProvider.backButton.text('Back').previousTitleText(false);
  cfpLoadingBarProvider.includeSpinner = false;
  cfpLoadingBarProvider.latencyThreshold = 300;
  $mdThemingProvider.theme('default')
  .primaryPalette('blue')
  .accentPalette('orange');

  $provide.decorator("$exceptionHandler", function($delegate, $injector) {
    return function(exception, cause) {

      var data = {
        message: "Exception: " + exception.message,
        stack: exception.stack || "none"
      };



      alert(JSON.stringify(data));

      // Call The original Angular Exception Handler
      $delegate(exception, cause);

    };
  });
}]);

