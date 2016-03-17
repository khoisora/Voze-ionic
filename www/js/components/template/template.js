myControllers.controller('templateCtrl', function ($scope,$mdDialog, $mdBottomSheet, storage, $state, $http, SweetAlert, $timeout, $cordovaToast) {
//templateHash to check duplicate attr name
  $scope.templateHash = {
    _currentIndex: 0,
    _keyList: new Object(),
    _resetCurrentIndex: function () {
      this._keyList = new Object(),
        this._currentIndex = 0
    },
    _add: function (item) {
      this._keyList[item] = this._currentIndex;
      this._currentIndex++;
    }
  };

  $scope.toggleRefreshBoolean = function () {
    $scope.refreshBoolean = true;
  }
  //before enter
  $scope.$on('$ionicView.beforeEnter', function () {
    if (storage.chosenTemplateIndex2 == null) $state.go('login');
    $scope.refreshBoolean = false;
    $scope.template = storage.templates2[storage.chosenTemplateIndex2];
    $scope.cacheTemplate = angular.copy($scope.template);
    $scope.updateTemplateHash();
    resetAttr();
  });

  //init & other functions
  {
    //all file types
    $scope.fileTextTypes = ['text', 'paragraph', 'link', 'number'];
    $scope.fileTypes = ['text', 'paragraph', 'link', 'number', 'relationship', 'file'];

    $scope.updateTemplateHash = function () {
      //console.log("called update template hash");
      $scope.templateHash._resetCurrentIndex();
      $scope.template.objectTypeTemplate.template.forEach(function (tem) {
        if ($scope.templateHash._keyList[tem.key]) {
          $scope.errorMessage = "Please enter attribute name!";
          $timeout(function () {
            $scope.errorMessage = "";
          }, 3000);
        }
        $scope.templateHash._add(tem.key);
      });
    }

    $scope.checkDuplicateKey = function (key, index, fieldForm) {
      //if index exists, templateHash must contain key and the index must not equal the index of the key
      if ($scope.templateHash._keyList[key] !== undefined && index != $scope.templateHash._keyList[key]) {
        if (fieldForm) fieldForm.$setValidity('duplicateKey', false);
        return true;
      }
      else {
        if (fieldForm) fieldForm.$setValidity('duplicateKey', true);
        return false;
      }
    }

    $scope.showAddNewDialog = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'js/components/template/addNewDialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })  .then(function(newAttr) {
        if(newAttr.key){
          $scope.newAttr = newAttr;
          $scope.addNewAttr();
        }
      }, function() {

      });
    };

    $scope.addNewAttr = function () {
      if (!$scope.newAttr.key) {
        $scope.errorMessage = "Please enter attribute name!";
        $timeout(function () {
          $scope.errorMessage = "";
        }, 3000);
        return;
      } else if ($scope.checkDuplicateKey($scope.newAttr.key)) {
        $cordovaToast.showShortBottom("Failed! Duplicate attribute name!");
        //$scope.errorMessage = "Duplicate attribute name!";
        //$timeout(function () {
        //  $scope.errorMessage = "";
        //}, 3000);
        return;
      } else {
        //add new attr
        $scope.templateHash._add($scope.newAttr.key);

        $scope.form.$setDirty();
        $scope.newAttr.isNewAttr = true;
        $scope.template.objectTypeTemplate.template.push($scope.newAttr);
        resetAttr();
      }
    }


    //reset
    var resetAttr = function () {
      $scope.newAttr = new Object();
      $scope.newAttr.required = false;
      $scope.newAttr.type = $scope.fileTypes[0];
    }

    resetAttr();
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
              closeOnConfirm: !($scope.newAttr.key)
            },
            function (isConfirm) {
              if (isConfirm) $scope.save($scope.refreshBoolean);
              else {
                storage.templates2[storage.chosenTemplateIndex2] = $scope.cacheTemplate;
              }
            });
          $scope.form.$setPristine();
        } else {
          //if the form is invalid
          storage.templates2[storage.chosenTemplateIndex2] = $scope.cacheTemplate;
          $cordovaToast.showShortBottom("Invalid input(s). Template was not saved!");
        }
      }
    });
  }

  $scope.save = function (goBackBoolean, form) {
    if ($scope.template.objectTypeTemplate.template.length < 1) {
      $scope.errorMessage = "Please add at lease 1 attribute!";
      $timeout(function () {
        $scope.errorMessage = "";
      }, 3000);
      return;
    } else if (form && form.$invalid) return;

    var tems = [];

    $scope.template.objectTypeTemplate.template.forEach(function (temp) {
      var tem = {};
      if (!temp.isNewAttr && temp.key != temp.oldKey) tem.oldKey = temp.oldKey;
      tem.key = temp.key;
      tem.required = temp.required;
      tem.type = temp.type;
      tems.push(tem);
    });

    var saveHelper = function (tems) {
      var newTemplate = {
        name: $scope.template.name,
        appId: storage.chosenAppId2,
        template: tems
      };

      $http.put(storage.serverUrl + '/objecttype/update/' + $scope.template.id, JSON.stringify(newTemplate))
        .success(function (data, status, headers, config) {
          $scope.form.$setPristine();
          $cordovaToast.showShortBottom("Saved!");
          if (goBackBoolean) $state.go('menu.templateManagement', {}, {reload: $scope.refreshBoolean});
        })
        .error(function (data, status, headers, config) {
          $cordovaToast.showShortBottom("Cannot create new template. Please try again!");
          //console.log(data);
        });
    };

    //if ($scope.newAttr.key) {
    //  SweetAlert.swal({
    //      title: "Save " + $scope.newAttr.key + " ?",
    //      text: "You have an unsaved new property",
    //      type: "warning",
    //      showCancelButton: true,
    //      confirmButtonColor: "#DD6B55", confirmButtonText: "Yes",
    //      cancelButtonText: "No",
    //    },
    //    function (isConfirm) {
    //      if (isConfirm) {
    //        var tem = {};
    //        tem.key = $scope.newAttr.key;
    //        tem.required = $scope.newAttr.required;
    //        tem.type = $scope.newAttr.type;
    //        tems.push(tem);
    //        $scope.addNewAttr();
    //      }
    //      saveHelper(tems);
    //    });
    //} else {
      saveHelper(tems);
    //}
  };

  //delete
  {
    $scope.showDeleteActionSheet = function(){
      $mdBottomSheet.show({
        controller: TemplateBottomSheetCtrl,
        templateUrl: 'js/components/template/deleteBottomSheet.html'

      }).then(function(index) {
        if(index === -1)  $scope.deleteTemplate();
        else {
          console.log("delete");
          $scope.deleteAttribute(index);
        }
      });


      //$ionicActionSheet.show({
      //  buttons: buttons,
      //  titleText: '<b>Which attribute to delete?</b>',
      //  cancelText: 'Cancel',
      //  buttonClicked: function(index) {
      //    if(index == $scope.template.objectTypeTemplate.template.length - 1) $scope.deleteTemplate();
      //    else $scope.deleteAttribute(index);
      //  }
      //});
    };

    $scope.deleteTemplate = function () {
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
            $http.delete(storage.serverUrl + '/objecttype/delete/' + $scope.template.id).then(function (res) {
              //console.log("deleted " + res);
              storage.templates2.splice(storage.chosenTemplateIndex2, 1);
              SweetAlert.swal("Deleted!", "Your template has been deleted.", "success");
              $state.go('menu.templateManagement');
            }, function (error) {
              console.log(error.data);
            });
          } else {
            SweetAlert.swal("Cancelled", "Your template is safe :)", "error");
          }
        });
    };

    $scope.deleteAttribute = function (index) {
      $scope.form.$setDirty();
      $scope.template.objectTypeTemplate.template.splice(index, 1);
    };
  }
});


function DialogController($scope, $mdDialog) {
  $scope.newAttr = {
    key : '',
    required : false,
    type: 'text'
  }

  $scope.fileTypes = ['text', 'paragraph', 'link', 'number', 'relationship', 'file'];

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.confirm = function(form) {
    if(form.$valid) $mdDialog.hide($scope.newAttr);
  };
}

function TemplateBottomSheetCtrl($scope, $mdBottomSheet, storage) {
  $scope.template = storage.templates2[storage.chosenTemplateIndex2];
  $scope.attrs = $scope.template.objectTypeTemplate.template;

  $scope.cancel = function() {
    $mdBottomSheet.hide();
  };
  $scope.confirm = function(index) {
    $mdBottomSheet.hide(index);
  };
}
