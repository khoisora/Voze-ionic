myControllers.controller('objectCtrl', function ($scope, storage,$mdBottomSheet, $state, $http, SweetAlert, UploadService, fileType, $ionicModal, $ionicLoading, $cordovaToast, $ionicPlatform, $timeout) {
  //other functions
  $scope.fileType = fileType;


  $scope.toggleRefreshBoolean = function () {
    $scope.refreshBoolean = true;
  }

  //before enter
  $scope.$on('$ionicView.beforeEnter', function () {
    if (storage.chosenObjectIndex == null) $state.go('login');
    $scope.refreshBoolean = false;
    //helper functions
    {
      //get relationship name
      $scope.updateRelationshipForTems = function () {
        $scope.tems.forEach(function (tem) {
          //if value is of array, this prop is relationship
          if (tem.value instanceof Array) {
            $http.get(storage.serverUrl + "/object/get/relationship/valueandobjecttype/object/" +
              $scope.object.id + "/key/" + tem.key.replace(" ", "%20")).then(function (resp) {
              if (!resp.data.objectTypeName || resp.data.objectTypeName.toLowerCase() == 'unknown') return;
              var objectTypeName = resp.data.objectTypeName;
              var value = resp.data.value;
              tem.relationship = [value.length, objectTypeName];

              var newValue = new Object();
              newValue[objectTypeName] = value;

              tem.relationshipPara = newValue;
            }, function (resp) {
              console.log(resp.data);
            });
          }
        });
      }

      //get object type of this object
      $http.get(storage.serverUrl + '/objecttype/get/' + storage.template.id).then(function (resp) {
        storage.template = resp.data;
        $scope.tems = storage.template.objectTypeTemplate.template;

        {//construct scope object
          $scope.object = storage.objects[storage.chosenObjectIndex];
          $scope.cacheObject = angular.copy($scope.object);

          //construct tems
          var constructTems = function () {
            $scope.tems.forEach(function (tem) {
              var prop = $scope.propHash[tem.key];
              if (!prop) return;
              tem.value = prop.value;
              tem.file = prop.file;
            });
          }

          //construct propHash
          $scope.propHash = {};
          var counter = 0;
          $scope.object.properties.forEach(function (prop) {
            $scope.propHash[prop.key] = prop;

            counter++;
            //run constructTems only after propHash is constructed
            if (counter == $scope.object.properties.length) constructTems();
          });
        }

        $scope.updateRelationshipForTems();
      }, function (resp) {
        console.error(resp.data);
      });
    }
  });

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
                $scope.save($scope.refreshBoolean);
              } else {
                storage.objects[storage.chosenObjectIndex] = $scope.cacheObject;
              }
            });

          $scope.form.$setPristine();
        } else {
          //if the form is invalid
          storage.objects[storage.chosenObjectIndex] = $scope.cacheObject;
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

    $scope.templates = storage.templates;

    $scope.changeTemplate = function (chosenTemplate) {
      if (!chosenTemplate) return;
      console.log(storage.serverUrl + '/object/get/app/' + storage.chosenAppId + '/objecttype/'
        + chosenTemplate.id);
      //chosenTemplate = angular.fromJson(chosenTemplate);
      //http://symplcms.com/object/get/app/1/objecttype/8
      $http.get(storage.serverUrl + '/object/get/app/' + storage.chosenAppId + '/objecttype/'
        + chosenTemplate.id).then(function (resp) {
        $scope.objects = resp.data;
      }, function (resp) {
        console.error('ERR', resp);
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

      var property = new Object();
      property[$scope.chosenTem.key] = relatedObjects;

      $scope.chosenTem.relationship = [$scope.chosenRelationshipObjects.length, templateName];
      $scope.chosenTem.relationshipPara = relatedObjects;
      $scope.modal.hide();
      $scope.chosenTem.value = relationshipValue;
      $scope.form.$setDirty();
    }
  }

//save
  $scope.save = function (goBackBoolean) {
    var props = [];

    $scope.tems.forEach(function (tem) {
      var obj = {};

      if (!tem.type) return;

      if (tem.type === 'file' && tem.file) {
        obj[tem.key] = {file: tem.file.id};
      }

      else if (tem.type === 'number') {
        //console.log((tem.value));
        obj[tem.key] = ((tem.value) && !isNaN(tem.value)) ? parseFloat(tem.value) : '';
      }

      else if (tem.type === 'text' || tem.type === 'paragraph' || tem.type === 'link')
        obj[tem.key] = (tem.value) ? tem.value : '';

      else if (tem.type === 'relationship')
        obj[tem.key] = (tem.relationshipPara) ? tem.relationshipPara : '';

      else return;

      props.push(obj);
    });

    var para = {
      appId: storage.chosenAppId,
      name: $scope.object.thing.name,
      properties: props
    };

    $http.put(storage.serverUrl + '/object/update/' + $scope.object.id, JSON.stringify(para))
      .success(function (data, status, headers, config) {
        $scope.form.$setPristine();
        //$cordovaToast.showShortBottom("Saved");
        if (goBackBoolean) {
          console.log("reload:" + $scope.refreshBoolean);
          $state.go('menu.viewByTemplate', {}, {reload: $scope.refreshBoolean});
        }
      })
      .error(function (data, status, headers, config) {
        $cordovaToast.showShortBottom("Cannot update object. Please try again!");
      });
  }

//delete
  $scope.delete = function () {
    SweetAlert.swal({
        title: "Are you sure?",
        text: "Your will not be able to recover this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55", confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel plx!",
        closeOnConfirm: false,
        closeOnCancel: false
      },
      function (isConfirm) {
        if (isConfirm) {
          $http.delete(storage.serverUrl + '/object/delete/' + $scope.object.id)
            .success(function (data) {
              storage.objects.splice(storage.chosenObjectIndex, 1);
              SweetAlert.swal("Deleted!", "Your object has been deleted.", "success");
              $state.go('menu.viewByTemplate');
            }).error(function (data) {
            SweetAlert.swal("Cannot delete object", "Please try again", "error");
          });
        } else {
          SweetAlert.swal("Cancelled", "Your object is safe ", "error");
        }
      });
  };

//take picture and browse file
  $scope.showActionSheet = function(index1){

    $mdBottomSheet.show({
      templateUrl: 'js/components/object/bottomSheet.html',
      controller: ObjectBottomSheetCtrl
    }).then(function(index) {
      if(index == 0) $scope.takePicture(index1);
          else $scope.browseFile(index1);
    });
    //$ionicActionSheet.show({
    //  buttons: [
    //    { text: '<b>Take Photo</b>' },
    //    { text: '<b>Upload File</b>' }
    //  ],
    //  //destructiveText: 'Delete',
    //  titleText: 'Choose 1 option:',
    //  cancelText: 'Cancel',
    //  buttonClicked: function(index) {
    //    if(index == 0) $scope.takePicture(index1);
    //    else $scope.browseFile(index1);
    //  }
    //});
  };

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
                $scope.tems[index].file = angular.fromJson(res);

                //if user upload new image => avatar may change, reload the viewByTemplate to update this
                $scope.refreshBoolean = true;
                $scope.form.$setDirty();
              });
            });
          }, function (err) {
            $cordovaToast.showShortBottom("Cannot upload file. Please try again!");
          },
          options);
      } else {
        $cordovaToast.showShortBottom("Cannot take picture. Please try again!");
      }
    };

    $scope.browseFile = function (index) {
      window.plugins.mfilechooser.open([], function (uri) {
        $scope.$apply(function () {
          UploadService.uploadFile(uri, $ionicLoading).then(function (res) {
            $ionicLoading.hide();
            $scope.tems[index].file = angular.fromJson(res);

            //if user upload new image => avatar may change, reload the viewByTemplate to update this
            $scope.refreshBoolean = true;
            $scope.form.$setDirty();
          });
        });
      }, function (error) {
        $cordovaToast.showShortBottom("Cannot browse file. Please try again!");
      });
    }
  }, false);
});



function ObjectBottomSheetCtrl($scope, $mdBottomSheet) {
  $scope.cancel = function() {
    $mdBottomSheet.cancel();
  };
  $scope.confirm = function(index) {
    $mdBottomSheet.hide(index);
  };
}
