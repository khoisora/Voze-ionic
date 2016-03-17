myControllers.controller('chooseAppForAppManagementCtrl', function ($scope, storage, $state, $http, $cordovaToast) {
  $scope.$on('$ionicView.beforeEnter', function () {
    if (!storage.apps) $state.go('login');

    $scope.chosenApp = $scope.apps[0];
  });

  $scope.apps = storage.apps;

  $scope.chooseApp = function (chosenApp) {
    if (!chosenApp) return;

    storage.chosenApp = chosenApp;
    console.log(chosenApp.id)
    storage.chosenAppId = chosenApp.id;

    $http.get(storage.serverUrl + '/objecttype/get/app/' + storage.chosenAppId)
      .success(function (data, status, headers, config) {
        //console.log(angular.toJson(data));

        storage.templates = data;
        $state.go('menu.viewByTemplate', null, {reload: true});
      })
      .error(function (data, status, headers, config) {
        console.error(data);
        $cordovaToast.showShortBottom("Cannot connect. Please try again!");
        return;
      });
  };
});
