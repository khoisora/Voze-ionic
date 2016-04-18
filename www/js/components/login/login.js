myControllers.controller('loginCtrl', function ($scope, $http, storage, $state, $cordovaToast, $ionicSlideBoxDelegate) {
  $scope.user = new Object();
  //storage.notFirstTimeOpenApp = false;
  $scope.firstTime = storage.notFirstTimeOpenApp? false : true;
  if(!storage.notFirstTimeOpenApp) storage.notFirstTimeOpenApp = true;

  console.log("fist time" + $scope.firstTime);
    $ionicSlideBoxDelegate.enableSlide($scope.firstTime);

  $scope.nextSlide = function() {
    $ionicSlideBoxDelegate.next();
  }


  $scope.login = function () {
    storage.$reset();
    storage.serverUrl = 'http://symplcms.com:80';
    $http.post(storage.serverUrl + '/user/login', $scope.user).then(function (resp) {
      var apps = [];
      resp.data.apps.forEach(function (app) {
        apps.push({
          id: app.id,
          appName: app.appName
        })
      });
      storage.apps = apps;

      storage.user = {};
      storage.user.id = resp.data.id;

      $state.go('menu.chooseAppForAppManagement');

    }, function (resp) {
      $cordovaToast.showShortBottom(resp.data);
    });
  }
})
