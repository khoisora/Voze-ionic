myControllers.controller('viewByTemplateCtrl', function ($ionicHistory, $scope, storage, $state, $http, orderByFilter) {

  $scope.changeTemplate = function (chosenTemplate) {
    if (!chosenTemplate) return;

    chosenTemplate = angular.fromJson(chosenTemplate);

    storage.template = chosenTemplate;
    $scope.chosenTemplate = storage.template;
    $http.get(storage.serverUrl + '/object/get/app/' + storage.chosenAppId + '/objecttype/'
      + chosenTemplate.id).then(function (resp) {
      storage.objects = orderByFilter(resp.data, "thing.name");
      storage.objects.forEach(function(o,index){
        o.indexx = index;
      });
      $scope.objects = storage.objects;

    }, function (resp) {
      console.error('ERR', resp.data);
    });
  };



  $scope.$on('$ionicView.beforeEnter', function () {
    if (!storage.templates) $state.go('login');
    $scope.templates = storage.templates;
    $scope.chosenTemplate = (storage.template) ? storage.template : $scope.templates[0];
    $scope.changeTemplate($scope.chosenTemplate);
  });

  $scope.chooseObject = function (index) {
    storage.chosenObjectIndex = index;
    $state.go('menu.object');
  };
});
