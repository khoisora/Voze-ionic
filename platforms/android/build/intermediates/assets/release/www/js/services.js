angular.module('app.services', ['ngCordova', 'cfp.loadingBar', 'ngAnimate'])
.service('UploadService',  function(cfpLoadingBar, $cordovaFileTransfer, $cordovaToast){
  this.uploadFile = function(fileURI, ionicLoading) {
    var trustAllHosts = true;

    var ftOptions = new FileUploadOptions();
    ftOptions.fileKey = 'file';
    ftOptions.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    ftOptions.httpMethod = 'POST';

    return $cordovaFileTransfer.upload('http://161.202.13.188:9000/file/upload', fileURI, ftOptions, trustAllHosts)
      .then(function (result) {
          $cordovaToast.showShortBottom("File Uploaded!");
          return result.response;
        },
        function (err) {
          // Error
          console.log('error: ' + err);
          //return err;
        }, function (progress) {
          ionicLoading.show();
        });
  }});
