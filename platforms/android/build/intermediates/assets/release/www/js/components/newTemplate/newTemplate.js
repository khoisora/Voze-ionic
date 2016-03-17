myControllers.controller('newTemplateCtrl', function ($scope, storage, $state, $http, SweetAlert, $cordovaToast, $timeout) {
  //before enter
  $scope.$on('$ionicView.beforeEnter', function () {
    if (storage.chosenAppId2 == undefined)  $state.go('menu.templateManagement');

    $scope.template = new Object();

    $scope.template.objectType = new Object();

    $scope.template.objectTypeTemplate = new Object();

    $scope.template.objectTypeTemplate.template = [];

    resetAttr();
  });

  //init
  {
    //all file types
    $scope.fileTypes = ['text', 'paragraph', 'file', 'link', 'number', 'relationship'];

    //reset
    var resetAttr = function () {
      $scope.newAttr = new Object();
      $scope.newAttr.required = false;
      $scope.newAttr.type = $scope.fileTypes[0];
    }

    resetAttr();
    //template key hash to check duplicate attr names
    var templateHash = {};

    //add new attr
    $scope.addNewAttr = function (form) {
      if (!$scope.newAttr.key) {
        $scope.errorMessage = "Please enter attribute name!";

        $timeout(function () {
          $scope.errorMessage = "";
        }, 3000);

        return;
      } else if (templateHash[$scope.newAttr.key]) {
        $scope.errorMessage = "Duplicate attribute name!";

        $timeout(function () {
          $scope.errorMessage = "";
        }, 3000);

        return;
      }

      templateHash[$scope.newAttr.key] = 1;
      $scope.template.objectTypeTemplate.template.push($scope.newAttr);
      resetAttr();
    }
  }

  //before leave
  {
    $scope.setForm = function (f) {
      $scope.form = f;
      //$scope.formValid = f.$valid;
    }
    $scope.$on('$ionicView.beforeLeave', function () {
      //if form is dirty but user has not saved
      if ($scope.form.$dirty) {
        if ($scope.form.$valid) {
          SweetAlert.swal({
              title: "Do you wanna save?",
              text: "You've added some properties",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55", confirmButtonText: "Yes",
              cancelButtonText: "No",
              closeOnConfirm: !($scope.newAttr.key)
            },
            function (isConfirm) {
              if (isConfirm) $scope.save(false);
            });
        } else {
          //if the form is invalid
          $cordovaToast.showShortBottom("Invalid input(s). Template was not saved!");
        }
      }
    });
  }

  //save
  {
    $scope.save = function (goBackBoolean) {
      if (!$scope.template.name) {
        $scope.errorMessage = "Please enter template name!";
        $timeout(function () {
          $scope.errorMessage = "";
        }, 3000);
        return;
      }

      ///save helper function
      var saveHelper = function (tems) {
        var newTemplate = {
          name: $scope.template.name,
          appId: storage.chosenAppId2,
          template: tems
        };

        $http.post(storage.serverUrl + '/objecttype/create', JSON.stringify(newTemplate))
          .success(function (data, status, headers, config) {
            storage.templates2.push(data);
            $scope.form.$setPristine();
            $cordovaToast.showShortBottom("Created successfully!");
            if (goBackBoolean) $state.go('menu.templateManagement');
          })
          .error(function (data, status, headers, config) {
            $cordovaToast.showShortBottom("Cannot create new template. Please try again!");
          });
      };

      //construct template attrs to send to server
      var tems = [];

      $scope.template.objectTypeTemplate.template.forEach(function (temp) {
        var tem = {};
        tem.key = temp.key;
        tem.required = temp.required;
        tem.type = temp.type;
        tems.push(tem);
      });

      //if user entered new attr but hasn't added(click + button)
      if ($scope.newAttr.key) {
        SweetAlert.swal({
            title: "Also save " + $scope.newAttr.key + "?",
            text: "You have added unsaved attribute",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55", confirmButtonText: "Yes",
            cancelButtonText: "No",
          },
          function (isConfirm) {
            if (isConfirm) {//add this new attr to tems to save
              var tem = {};
              tem.key = $scope.newAttr.key;
              tem.required = $scope.newAttr.required;
              tem.type = $scope.newAttr.type;
              tems.push(tem);
              $scope.addNewAttr();
            }
            saveHelper(tems);
          });
      } else {
        saveHelper(tems);
      }
    }
  }

  //delete
  $scope.deleteAttribute = function (index) {
    $scope.template.objectTypeTemplate.template.splice(index, 1);
  };
});
