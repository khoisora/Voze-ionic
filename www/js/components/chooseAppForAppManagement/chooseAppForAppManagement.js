myControllers.controller('chooseAppForAppManagementCtrl', function ($scope, storage, $state, $http, $cordovaToast) {
  $scope.$on('$ionicView.beforeEnter', function () {
    if (!storage.apps) $state.go('login');

    $scope.chosenApp = $scope.apps[0];
  });

  $scope.apps = storage.apps;

  $scope.viewObjects = function (chosenApp) {
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

  $scope.viewTemplates = function (chosenApp2) {
    if(!chosenApp2) return;

    storage.chosenAppId2 = chosenApp2.id;
    $http.get(storage.serverUrl + '/objecttype/get/app/' + storage.chosenAppId2)
      .success(function (data, status, headers, config) {
        storage.templates2 = data;
        $state.go('menu.templateManagement');
      })
      .error(function (data, status, headers, config) {
        console.log(data);
        $cordovaToast.showShortBottom("Cannot connect. Please try again!");
      });
  };
});
