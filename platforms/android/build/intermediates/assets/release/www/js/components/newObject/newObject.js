myControllers.controller('newObjectCtrl', function ($scope, storage, $state, $http, UploadService, fileType, SweetAlert, $ionicModal, $cordovaToast, $ionicLoading) {
  //before enter
  {
    $scope.$on('$ionicView.beforeEnter', function () {
      if (storage.templates.length == 0) {
        $state.go('menu.viewByTemplate');
        $cordovaToast.showShortBottom("Please create template first!");
      }

      $scope.templates = storage.templates;
      $scope.chosenTemplate = (storage.template) ? storage.template : $scope.templates[0];
      $scope.changeTemplateOfNewObject($scope.chosenTemplate);
    });
  }

  //init
  {
    $scope.fileType = fileType;

    $scope.template = [];
    $scope.changeTemplateOfNewObject = function (chosenTemplate) {
      $http.get(storage.serverUrl + '/objecttype/get/' + chosenTemplate.id).then(function (resp) {
        $scope.chosenObjectType = resp.data;
        $scope.template = $scope.chosenObjectType.objectTypeTemplate.template;
      }, function (resp) {
        console.error(resp);
      });
    };
  }

  //before leave, if user made any changes, ask to save
  {
    $scope.setForm = function (f) {
      $scope.form = f;
    }

    $scope.$on('$ionicView.beforeLeave', function () {
      if ($scope.form.$dirty) {
        if ($scope.form.$valid) {
          SweetAlert.swal({
              title: "Do you wanna save?",
              text: "You've made some changes",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55", confirmButtonText: "Yes",
              cancelButtonText: "No",
            },
            function (isConfirm) {
              if (isConfirm) {
                $scope.save();
              }
            });
          $scope.form.$setPristine();
        } else {
          //if the form is invalid
          $cordovaToast.showShortBottom("Invalid input(s). Object was not saved!");
        }
      }
    });
  }

  //modal
  {
    $ionicModal.fromTemplateUrl('js/components/chooseRelationshipObjects/chooseRelationshipObjects.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    $scope.$on('modal.hidden', function () {
      $scope.chosenRelationshipObjects = [];
    });

    $scope.changeTemplate = function (chosenTemplate) {
      if (!chosenTemplate) return;

      $http.get(storage.serverUrl + '/object/get/app/' + storage.chosenAppId + '/objecttype/'
        + chosenTemplate.id).then(function (resp) {
        $scope.objects = resp.data;
      }, function (resp) {
        console.error(resp);
      });

      $scope.chosenRelationshipObjects = [];
    };
  }

  //relationship
  {
    $scope.chosenRelationshipObjects = [];

    $scope.toggleChosenRelationshipObject = function (object) {
      if ($scope.chosenRelationshipObjects.indexOf(object) > -1) {
        $scope.chosenRelationshipObjects.splice($scope.chosenRelationshipObjects.indexOf(object), 1)
      } else {
        $scope.chosenRelationshipObjects.push(object);
      }
    };

    $scope.addRelationship = function (tem) {
      $scope.chosenTem = tem;
      $scope.modal.show();
    };

    $scope.saveRelationship = function () {
      if ($scope.chosenRelationshipObjects.length == 0) {
        $scope.errorMessage2 = "Please choose at least 1 object!";
        $timeout(function () {
          $scope.errorMessage2 = "";
        }, 3000);
        return;
      }

      var templateName = $scope.chosenRelationshipObjects[0].objectType.name;
      var relatedObjects = new Object();
      relatedObjects[templateName] = [];

      var relationshipValue = [];
      for (var i = 0; i < $scope.chosenRelationshipObjects.length; i++) {
        relatedObjects[templateName].push($scope.chosenRelationshipObjects[i].id);
        relationshipValue.push({id: $scope.chosenRelationshipObjects[i].id});
      }

      $scope.chosenTem.relationshipPara = relatedObjects;

      $scope.chosenTem.relationship = [$scope.chosenRelationshipObjects.length, templateName];

      $scope.chosenTem.value = relationshipValue;

      $scope.form.$setDirty();

      $scope.modal.hide();
    }
  }

  //save
  {
    $scope.save = function () {
      var props = [];

      $scope.template.forEach(function (tem) {
        var obj = {};

        if (tem.type === 'file' && tem.file)
          obj[tem.key] = {file: tem.file.id};

        else if (tem.type === 'number')
          obj[tem.key] = !isNaN(tem.value) ? parseFloat(tem.value) : '';

        else if (tem.type === 'text' || tem.type === 'paragraph' || tem.type === 'link')
          obj[tem.key] = (tem.value) ? tem.value : '';

        else if (tem.type === 'relationship') {
          obj[tem.key] = (tem.value) ? tem.relationshipPara : '';
        }

        else return;

        props.push(obj);
      });

      var object = {
        appId: storage.chosenAppId,
        objectTypeId: $scope.chosenObjectType.id,
        userId: storage.user.id,
        properties: props
      };

      if ($scope.template.name) object.name = $scope.template.name;

      else object.name = "New Object";

      $http.post(storage.serverUrl + '/object/create', JSON.stringify(object))
        .success(function (data, status, headers, config) {
          storage.objects.push(data);
          $scope.form.$setPristine();
          $cordovaToast.showShortBottom("Created successfully!");
          $state.go('menu.viewByTemplate');
        })
        .error(function (data, status, headers, config) {
          console.log(data);
          $cordovaToast.showShortBottom("Cannot create new object. Please try again!");
        });
    };
  }

  //take picture and browse file
  document.addEventListener("deviceready", function () {
    $scope.takePicture = function (index) {
      var options = {
        quality: 75,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        targetWidth: 750,
        targetHeight: 750,
        encodingType: 0,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation: true,
      };

      if (navigator.camera) {
        navigator.camera.getPicture(
          function (imageURI) {
            $scope.$apply(function () {
              UploadService.uploadFile(imageURI, $ionicLoading).then(function (res) {
                $ionicLoading.hide();
                $scope.template[index].file = angular.fromJson(res);
                $scope.form.$setDirty();
              });
            });
          }, function (err) {
            $cordovaToast.showShortBottom("Cannot take picture. Please try again!");
          },
          options);
      } else {
        $cordovaToast.showShortBottom("Camera not available. Please try again!");
      }
    };

    $scope.browseFile = function (index) {
      window.plugins.mfilechooser.open([], function (uri) {
        $scope.$apply(function () {
          UploadService.uploadFile(uri, $ionicLoading).then(function (res) {
            $ionicLoading.hide();
            $scope.template[index].file = angular.fromJson(res);
            $scope.form.$setDirty();
          });
        });

      }, function (error) {
        $cordovaToast.showShortBottom("Cannot browse file. Please try again!");
      });
    }
  }, false);
});
