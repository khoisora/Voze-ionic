angular.module('analytic', []).controller('AnalyticController',
  [ '$q','$http', '$cookies','$window', function($http, $cookies, $window,$q) {


  } ]).factory("SymplAPIService", function($q,$http){
  var users = ["Peter", "Daniel", "Nina"];
  var DOMAIN = "http://symplcms.com/";

  return {
    all: function() {
      return users;
    },
    first: function() {
      return users[0];
    },
    addUser: function(msg){
      users.push(msg);
    },
    getData:function(){

      var d = $q.defer();

      var appID = 37;
      var symplCMS = new window.SymplTrack(appID);

      //Call getSortedByType
      symplCMS.getSortedObjByTypeOrder(129,'desc',function(data){

          d.resolve(data);

        },
        function(data){
          d.reject(data);
        });
      return d.promise;
    },
    getLocationByApp: function(appId,from,to){
      var d = $q.defer();
      var api = DOMAIN + "analytics/key/location/sorted/app/"+appId;
      var data = {};
      data.fromDate = from;
      data.toDate = to;

      $http.post(api,data).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    getAppSize: function(appId){
      var d = $q.defer();
      var api = DOMAIN + "analytics/key/size/app/"+appId;
      $http.get(api).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    //Get Analytic Data
    getObjectCountByApp: function(userId){
      var d = $q.defer();
      var api = DOMAIN + "analytics/get/objectscount/"+userId;
      $http.get(api).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    getTopObjectsByApp: function(userId,from,to){ //Ko can period
      var d = $q.defer();
      var api = DOMAIN + "analytics/get/storage/objects/user/"+userId+"/top/10";
      var data = {};

      data.fromDate = from;
      data.toDate = to;
      $http.post(api).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    getAccStorageAndObj:function(userId,from,to){
      var d = $q.defer();
      var api = DOMAIN + "analytics/get/storage/by/user/"+userId;
      var data = {};
      data.fromDate = from;
      data.toDate = to;

      $http.post(api,data).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    /* API Performance */
    getAPICountAndTime: function(userId,appId,hasCountry,from,to){
      var d = $q.defer();
      var api = DOMAIN + "analytics/get/apiandresponse/user/"+userId+"/app/"+appId;
      var data = {};
      data.fromDate = from;
      data.toDate = to;

      if(hasCountry){
        data.groupByCountry = true;
      }else{
        data.groupByCountry = false;
      }

      $http.post(api,data).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    getAPICountByCountry: function(userId,appId,from,to){

      var d = $q.defer();
      var api = DOMAIN + "analytics/get/apicount/by/country/user/"+userId+"/app/"+appId;
      var data = {};
      data.fromDate = from;
      data.toDate = to;

      $http.post(api,data).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    getAPICountByDevice: function(userId,appId,hasCountry,from,to){
      var d = $q.defer();
      var api = DOMAIN + "analytics/get/apicount/by/device/user/"+userId+"/app/"+appId;
      var data = {};
      data.fromDate = from;
      data.toDate = to;

      if(hasCountry){
        data.groupByCountry = true;
      }else{
        data.groupByCountry = false;
      }

      $http.post(api,data).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    getAPIError:function(userId,appId,hasCountry,from,to){
      var d = $q.defer();
      var api = DOMAIN + "analytics/get/errorlog/user/"+userId+"/app/"+appId;
      var data = {};
      data.fromDate = from;
      data.toDate = to;

      if(hasCountry){
        data.groupByCountry = true;
      }else{
        data.groupByCountry = false;
      }

      $http.post(api,data).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;
    },
    getFileError:function(userId,appId,hasCountry,from,to){
      var d = $q.defer();
      var api = DOMAIN + "analytics/get/files/error/"+userId+"/app/"+appId;
      var data = {};
      data.fromDate = from;
      data.toDate = to;

      if(hasCountry){
        data.groupByCountry = true;
      }else{
        data.groupByCountry = false;
      }

      $http.post(api,data).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;

    },
    getViewHits:function(userId,appId,hasCountry,from,to){
      var d = $q.defer();
      var api = DOMAIN + "analytics/get/objects/viewsandhits/user/"+userId+"/app/"+appId;
      var data = {};
      data.fromDate = from;
      data.toDate = to;

      if(hasCountry){
        data.groupByCountry = true;
      }else{
        data.groupByCountry = false;
      }

      $http.post(api,data).then(function(data){

        d.resolve(data.data);

      },function(data){

        d.reject(data);

      });

      return d.promise;

    }

  }
});
