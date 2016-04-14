myControllers.controller('templateManagementCtrl', function ($scope, storage, $state, $http, $timeout, $cordovaToast) {
  $scope.$on('$ionicView.beforeEnter', function () {
    if (!storage.apps) $state.go('login');

    if (!$scope.templates) {
      $scope.templates = storage.templates2;
    }
  });


  //$scope.chooseApp = function (chosenApp2) {
  //  if(!chosenApp2) return;
  //  chosenApp2 = angular.fromJson(chosenApp2);
  //
  //  storage.chosenAppId2 = chosenApp2.id;
  //  $scope.chosenApp2 = chosenApp2;
  //  $http.get(storage.serverUrl + '/objecttype/get/app/' + storage.chosenAppId2)
  //    .success(function (data, status, headers, config) {
  //      storage.templates2 = data;
  //      $scope.templates = storage.templates2;
  //    })
  //    .error(function (data, status, headers, config) {
  //      console.log(data);
  //      $cordovaToast.showShortBottom("Cannot connect. Please try again!");
  //    });
  //};

  $scope.chooseTemplate = function (chosenTemplateIndex) {
    storage.chosenTemplateIndex2 = chosenTemplateIndex;
    $state.go('menu.template', {}, {reload: true});
  };
});
