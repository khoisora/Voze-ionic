myControllers.controller('viewByTemplateCtrl', function ($scope, storage, $state, $http, orderByFilter) {
  var convertColor = function(name){
    var colorCode = new Array();
    var i = 0;
    var j = 1;
    var t = 2
    //console.log(name);
    while(true){
      if(colorCode.length >= 3) return colorCode;
      if(j >= name.length) j = 0;
      if(i >= name.length) i = 0;
      if(t >= name.length) t = 0;

      if(name.charCodeAt(i) === 0 || name.charCodeAt(j) === 0 || name.charCodeAt(t) === 0) {
        j++;
        t++;
        i++;
        continue;
      }

      colorCode[colorCode.length] = (name.charCodeAt(i) * name.charCodeAt(j) + name.charCodeAt(t)) % 255;

      console.log((name.charCodeAt(i) ));

      j++;
      t++;
      i++;
    }
  };

  $scope.colorArray = ['#D3D3D3','#D3D3D3','#D3D3D3','#D3D3D3','#D3D3D3','#D3D3D3'];
  //$scope.colorArray = ['#09FFD6','#FC22FF','#CCA51B','#FF6D02','#18FF10','#3216CC'];

  $scope.changeTemplate = function (chosenTemplate) {
    if (!chosenTemplate) return;

    chosenTemplate = angular.fromJson(chosenTemplate);

    storage.template = chosenTemplate;
    $scope.chosenTemplate = storage.template;
    $http.get(storage.serverUrl + '/object/get/app/' + storage.chosenAppId + '/objecttype/'
      + chosenTemplate.id).then(function (resp) {
      storage.objects = orderByFilter(resp.data, "thing.name");
      $scope.objects = storage.objects;

      //$scope.objects.forEach(function(object){
      //  object.colorCode = convertColor(object.thing.name);
      //});


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
