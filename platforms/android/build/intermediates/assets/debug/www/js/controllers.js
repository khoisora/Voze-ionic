var myControllers = angular.module('app.controllers', ['app.services', 'analytic', 'ionic', 'ngStorage', 'oitozero.ngSweetAlert', 'ngCordova', 'focus-if'])
  .factory('storage', function ($localStorage) {
    return $localStorage;
  });

myControllers.factory('fileType', function(){
  var imageType = ['jpg','jpeg','png','gif'];
  return {
    imageType : imageType
  }
});

myControllers.constant('$ionicLoadingConfig', {
  template: '<ion-spinner icon="ripple"></ion-spinner>'
});
