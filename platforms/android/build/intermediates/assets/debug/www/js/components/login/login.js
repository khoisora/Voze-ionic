myControllers.controller('loginCtrl', function ($scope, $http, storage, $state, $cordovaToast) {
  $scope.user = new Object();

  $scope.login = function () {
    storage.$reset();
    storage.serverUrl = 'http://Symplcms.com:9001';
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
