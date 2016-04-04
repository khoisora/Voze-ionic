myControllers.controller('analyticsCtrl', function ($scope, SymplAPIService,storage, $http) {
  var self = $scope;
  self.byAPI = false;
  self.byStorage = true;
  self.currentAPIAppChosen="";
  self.currentAPIPeriodFrom = "";
  self.currentAPIPeriodTo = "";

  self.currentStorageAppChosen = "";
  self.currentSPeriodFrom = "";
  self.currentSPeriodTo = "";
  self.showCountry = false;

  /*Data Model*/
  self.storage_model = {};
  self.storage_model.objApp = [];
  self.storage_model.topObj = [];
  self.storage_model.accInfo = [];
  self.api_model = {};
  self.api_model.frequency_responseTime = [];
  self.api_model.fileErrors = [];
  self.api_model.apiErrors = [];
  self.api_model.apiCountry = [];
  self.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  self.apps = [];
  self.apps_api = [];
  self.periodDisableStorage = true;
  self.periodDisableApi = true;
  self.inputFromStorage = "";
  self.inputToStorage = "";
  self.inputFromApi = "";
  self.inputToApi = "";
  self.countries_api = [];
  self.selectedCountry="";

  if(self.apps.length == 0){
    _.each(storage.apps,function(rs) {
      self.apps.push(rs.appName);

    })
  }
  if(self.apps_api.length == 0){
    _.each(storage.apps,function(rs) {
      self.apps_api.push({"id":rs.id,"appName":rs.appName});

    })
  }

  var userId;
  var today;
  var priorDate;
  var from;
  var to;
  var allTopObjectsApps = {};
  var allAccInfoStorage30Days = {};
  var allAccInfoStoragePeriod = {};

  var allApiAndTimeInfo_country = {};
  var allApiAndTimeInfo = [];
  var allApiAndTimeInfo_30day_country = {};
  var allApiAndTimeInfo30days = [];

  var fileErros_country = {};
  var fileErrors_30days = [];
  var fileErrors_30days_country = [];


  var allViewHitsData = [];
  var allViewHitsData_country = {};
  var allViewHitsData_30day_country = {};
  var allViewHitsData_30days = [];


  var userTypeCountry = {};
  var userType_30day_country= {};


  var userType30days = [];


  var apiCountry30days = [];


  var apiError_30days = [];
  var apiError_country = {};
  var apiError_30days_country = {};
  var hasCountry;

  if(self.apps[0]){
    self.showDashBoard = true;

    self.storage_app = JSON.parse(JSON.stringify(self.apps[0]));
    self.api_app = JSON.parse(JSON.stringify(self.apps_api[0].id));

    self.currentAPIAppChosen = JSON.parse(JSON.stringify(self.apps_api[0].appName));

    userId = storage.user.id;

    //if (self.currentUser.superUser){
    //  userId = self.currentUser.superUser.id;
    //}


    today = new Date();
    priorDate = new Date(new Date().setDate(today.getDate()-30));


    from = formatDate(priorDate);
    to = formatDate(today);

    self.currentAPIPeriodFrom = from;
    self.currentAPIPeriodTo = to;

    hasCountry = false;
    self.data_viewHits = [];

    SymplAPIService.getObjectCountByApp(userId).then(function(data){ //Other app with 0 value
      //Push sample app inside
      self.storage_model.objApp = data;
    });

    SymplAPIService.getTopObjectsByApp(userId,from,to).then(function(data){
      LoadTopObjects(data);
      //default - Top objects from first App in dropdown
      //self.storage_model.topObj = convertTopObjsGraphData(allTopObjectsApps[id]);
      //storage.apps[0].appName;
      //console.log(allTopObjectsApps[storage.apps[1].appName]);
      //console.log(allTopObjectsApps);
      self.storage_model.topObj = convertTopObjsGraphData(allTopObjectsApps[self.storage_app]);

    });

    SymplAPIService.getAccStorageAndObj(userId,from,to).then(function(data){
      //default last 30 days;
      //self.storage_model.accInfo = data;
      LoadAccInfo(data);
      //self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStorage30Days[id]);
      self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStorage30Days[self.storage_app]);

    });

    massCallChoosePeriod(self.api_app,from,to);
  }else{
    self.showDashBoard = false;
  }


  function formatDate(today){
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
      dd='0'+dd
    }
    if(mm<10){
      mm='0'+mm
    }
    return dd+'/'+mm+'/'+yyyy;
  }

  function LoadTopObjects(arr_apps){
    _.each(arr_apps, function(app) {
      //allTopObjectsApps[app.app.id] = app.objects;
      allTopObjectsApps[app.app.appName] = app.objects;
    })

  }

  function convertTopObjsGraphData(objectsPerApp){
    var arr_values = [];
    var return_results = [];

    _.each(objectsPerApp, function(obj) {
      var data = {};
      data.label = obj.name+",id = "+ obj.object.id;
      data.value = obj.size;
      arr_values.push(data);
    })
    var data = {};
    data.key = "Size(Mb)";
    data.color="#1f77b4";
    data.values = arr_values;
    return_results[0] = data;
    return return_results;
  }

  function LoadAccInfo(arr_apps){
    _.each(arr_apps, function(app) {
      var object_count = app.OBJECT_COUNT;
      var acc_size = app.ACCUMULATED_SIZE;
      var arr_values = [];
      arr_values[0] = object_count;
      arr_values[1] = acc_size;
      //allAccInfoStorage30Days[app.app.id] = arr_values;
      allAccInfoStorage30Days[app.app.appName] = arr_values;
    })
  }
  function LoadAccInfoPeriod(arr_apps){
    _.each(arr_apps, function(app) {
      var object_count = app.OBJECT_COUNT;
      var acc_size = app.ACCUMULATED_SIZE;
      var arr_values = [];
      arr_values[0] = object_count;
      arr_values[1] = acc_size;
      //allAccInfoStorage30Days[app.app.id] = arr_values;
      allAccInfoStoragePeriod[app.app.appName] = arr_values;
    })
  }


  function toDate(dateStr) {
    var parts = dateStr.split("/");
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  function loadAPIResponseAndTimeCountry(arr){
    _.each(arr,function(rs) {
      var api_count = rs.API_COUNT;
      var response_time = rs.RESPONSE_TIME;
      var arr_values = [];
      arr_values[0] = api_count;
      arr_values[1] = response_time;
      allApiAndTimeInfo_country[rs.country] = arr_values;
    })

    //Create a version of last 30 days
    if(_.isEmpty(allApiAndTimeInfo_30day_country)){
      allApiAndTimeInfo_30day_country = _(allApiAndTimeInfo_country).clone();
    }
  }

  function loadAPIResponseAndTime(rs){
    var api_count = rs.API_COUNT;
    var response_time = rs.RESPONSE_TIME;
    allApiAndTimeInfo[0] = api_count;
    allApiAndTimeInfo[1] = response_time;
    if(allApiAndTimeInfo30days.length == 0){

      allApiAndTimeInfo30days[0] = api_count;
      allApiAndTimeInfo30days[1] = response_time;
    }
  }

  function loadAPICountry(arr){
    var results = [];
    _.each(arr,function(rs) {
      if(rs.country){
        results.push(rs);
      }

    });
    self.countries_api = JSON.parse(JSON.stringify(results));
//console.log(self.countries_api);
    self.selectedCountry =  self.countries_api[0].country;

    self.api_model.apiCountry = results;
    if(apiCountry30days.length ==0){
      apiCountry30days = JSON.parse(JSON.stringify(results));
    }
  }

  function loadFileError(arr){
    var rs = [];
    _.each(arr,function(d) {
      var name = d.object.thing.name;
      var final_name = name.length <= 7? name : name.substring(0,6) + "...";
      rs.push({"key":final_name,"value":d.value});
    });
    self.api_model.fileErrors = rs;
    //Create a version of last 30 days
    if(fileErrors_30days.length == 0){
      fileErrors_30days = JSON.parse(JSON.stringify(rs));
    }

  }
  function loadFileErrorCountry(arr){

    _.each(arr,function(f) {
      var values = f.results;
      var rs = [];
      if(f.country!=null){
        _.each(values,function(d){
          var name = d.object.thing.name;
          var final_name = name.length <= 7? name : name.substring(0,6) + "...";
          rs.push({"key":final_name,"value":d.value});
        })

        fileErros_country[f.country] = rs;
      }

    });

    //Create a version of last 30 days allApiAndTimeInfo_30day_country)
    if( _.isEmpty(fileErrors_30days_country)){
      fileErrors_30days_country = JSON.parse(JSON.stringify(fileErros_country));
    }

  }
  function loadApiErrorCountry(arr){
    _.each(arr,function(f) {
      var values = f.results;
      var rs = [];
      _.each(values,function(d){
        if(d.uriPattern != null){
          rs.push({"key":d.uriPattern,"value":d.value});
        }
      })
      apiError_country[f.country] = rs;
    });
    //Create a version of last 30 days
    if(_.isEmpty(apiError_30days_country)){
      apiError_30days_country = JSON.parse(JSON.stringify(apiError_country));
    }
  }

  function loadApiError(arr){
    var rs = [];
    _.each(arr,function(d) {
      if(d.uriPattern != null){
        rs.push({"key":d.uriPattern,"value":d.value});
      }
    });
    self.api_model.apiErrors = rs;
    if(apiError_30days.length == 0){
      apiError_30days =  JSON.parse(JSON.stringify(rs));
    }
  }

  function loadViewHits(arr){
    var return_results = [];
    _.each(arr,function(data) {
      var obj = {};
      var name = data.object.thing.name;
      var id = data.object.thing.id;
      obj.name = name + ",id = " + id;
      obj.view = data.views;
      obj.hit = data.hits;
      return_results.push(obj);

    });
    allViewHitsData = return_results;
    //Create a version of last 30 days
    if(allViewHitsData_30days.length == 0){
      allViewHitsData_30days = JSON.parse(JSON.stringify(return_results));
    }
  }

  /*function loadViewHitsCountry(arr){
   var return_rs = {};
   _.each(arr,function(data) {
   var country = data.object.country;
   if(country){
   if(!return_rs[country]){
   var obj = {};
   var arr_rs = [];
   obj.name = data.object.thing.name;
   obj.view = data.views;
   obj.hit = data.hits;
   arr_rs.push(obj);
   return_rs[country] = arr_rs;
   }else{
   var arr_rs = return_rs[country];
   var obj = {};
   obj.name = data.object.thing.name;
   obj.view = data.views;
   obj.hit = data.hits;
   arr_rs.push(obj);
   }
   }

   });
   allViewHitsData_country = return_rs;
   //Create a version of last 30 days
   if(_.isEmpty(allViewHitsData_30day_country)){
   allViewHitsData_30day_country = _(allViewHitsData_country).clone();
   }
   }*/
  function convertApiTimeGraphData(arr){
    var arr_values_apicount = [];
    var arr_values_time = [];
    var return_results = [];

    var response_time = arr[1];
    var api_count = arr[0];
    var return_apiCount = {};
    var return_responseTime = {};

    _.each(api_count, function(data) {
      var _data_ = {};
      _data_.series = 0;
      _data_.x = toDate(data.date);
      _data_.y = data.value;
      arr_values_apicount.push(_data_);

    });
    return_apiCount.key="API frequency"
    return_apiCount.type="line";
    return_apiCount.yAxis=1;
    return_apiCount.values = arr_values_apicount;

    _.each(response_time, function(data) {
      var _data_ = {};
      _data_.series = 1;
      _data_.x = toDate(data.date);
      _data_.y = data.value;
      arr_values_time.push(_data_);

    });

    return_responseTime.key = "Response Time(ms)";
    return_responseTime.type = "line";
    return_responseTime.yAxis = 2;
    return_responseTime.values = arr_values_time;

    return_results[0] = return_apiCount;
    return_results[1] = return_responseTime;
    return return_results;
  }

  function convertAccInfoGraphData(objectsPerApp){
    var arr_values_objcount = [];
    var arr_values_storage = [];
    var return_results = [];

    var storage = objectsPerApp[1];
    var object_count = objectsPerApp[0];
    var return_objectCount = {};
    var return_Storage = {};

    _.each(object_count, function(data) {
      var _data_ = {};
      _data_.series = 0;
      _data_.x = toDate(data.date);
      _data_.y = data.value;
      arr_values_objcount.push(_data_);

    });
    return_objectCount.key="Accumulated Number Objects"
    return_objectCount.type="line";
    return_objectCount.yAxis=1;
    return_objectCount.values = arr_values_objcount;

    _.each(storage, function(data) {
      var _data_ = {};
      _data_.series = 1;
      _data_.x = toDate(data.date);
      _data_.y = data.value;
      arr_values_storage.push(_data_);

    });

    return_Storage.key = "Accumulated Storage(Mb)";
    return_Storage.type = "line";
    return_Storage.yAxis = 2;
    return_Storage.values = arr_values_storage;

    return_results[0] = return_objectCount;
    return_results[1] = return_Storage;
    return return_results;
  }
  function convertViewHitsGraphData (arr){
    var arr_views = [];
    var arr_hits = [];
    var obj1 = {};
    var obj2 = {};
    obj1.key = "No of Hits";
    obj1.color = "#d62728";
    obj2.key = "No of Views";
    obj2.color = "#1f77b4";


    _.each(arr, function(data) {
      var name = data.name;

      arr_views.push({"label":name,"value":data.view});
      arr_hits.push({"label":name,"value":data.hit});
    });
    obj1.values = arr_views;
    obj2.values = arr_hits;

    var return_rs = [];
    return_rs.push(obj1);
    return_rs.push(obj2);

    return return_rs;

  }
  function loadAPIDevice(arr){
    var rs = [];
    var obj = {};
    obj.key =  "Number of request";
    obj.color = "#d62728";
    arr_counts = [];
    _.each(arr, function(data) {
      if(data.device){
        arr_counts.push({"label":data.device,"value":data.value});
      }
    });
    obj.values = arr_counts;
    rs.push(obj);
    self.data_userType  = rs;
    if(userType30days.length ==0){
      userType30days = JSON.parse(JSON.stringify(rs));
    }
  }

  function loadAPIDeviceCountry(arr){

    _.each(arr,function(rs) {
      var elements=[];
      var obj = {};
      obj.key =  "Number of request";
      obj.color = "#d62728";
      arr_counts = [];
      _.each(rs.results, function(data) {
        if(data.device){
          arr_counts.push({"label":data.device,"value":data.value});
        }
      });
      obj.values = arr_counts;
      elements.push(obj);
      userTypeCountry[rs.country] = elements;
    })
    if(_.isEmpty(userType_30day_country)){

      userType_30day_country = _(userTypeCountry).clone();
    }
  }

  function sortingView(){

  }

  function sortingHit(){

  }

  function changeAppInStorage(app){
    self.storage_app = app;
    self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStorage30Days[self.storage_app]);
    self.storage_model.topObj = convertTopObjsGraphData(allTopObjectsApps[self.storage_app]);

  }

  function changePeriodInStorage(){

  }

  function massCallChoosePeriod(id,from,to){
    /*Call with country*/
    SymplAPIService.getAPICountAndTime(userId,id,true,from,to).then(function(data){
      loadAPIResponseAndTimeCountry(data);
    });
    SymplAPIService.getAPICountByDevice(userId,id,true,from,to).then(function(data){
      loadAPIDeviceCountry(data);
    });
    /*SymplAPIService.getViewHits(userId,id,true,from,to).then(function(data){
     loadViewHitsCountry(data);
     });*/
    SymplAPIService.getFileError(userId,id,true,from,to).then(function(data){
      loadFileErrorCountry(data);
    });
    SymplAPIService.getAPIError(userId,id,true,from,to).then(function(data){
      loadApiErrorCountry(data);
    });

    /*Call W/o group by Country*/
    SymplAPIService.getAPICountAndTime(userId,id,false,from,to).then(function(data){
      loadAPIResponseAndTime(data);
      self.api_model.frequency_responseTime = convertApiTimeGraphData(allApiAndTimeInfo);
    });
    SymplAPIService.getAPICountByCountry(userId,id,from,to).then(function(data){
      console.log(data);
      loadAPICountry(data);
    });
    SymplAPIService.getAPICountByDevice(userId,id,false,from,to).then(function(data){
      loadAPIDevice(data);

    });
    SymplAPIService.getViewHits(userId,id,false,from,to).then(function(data){
      loadViewHits(data);
      self.data_viewHits = convertViewHitsGraphData(allViewHitsData);
    });

    SymplAPIService.getFileError(userId,id,false,from,to).then(function(data){
      loadFileError(data);

    });
    SymplAPIService.getAPIError(userId,id,false,from,to).then(function(data){
      loadApiError(data);
    });

  }
  self.redirectAppManagement = function(){
    location.href = domain + "/users#/superUser/appManagement";
   //angular.element("#appMngt").addClass("active");
   //angular.element("#sym-dashboard").removeClass("active");
  }

  self.storageLast30 = function(){
    self.periodDisableStorage = true;
   //angular.element("#storage30").addClass("active");
   //angular.element("#storagePeriod").removeClass("active");
    self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStorage30Days[self.storage_app]);


  }

  self.storagePeriod = function(){
    self.periodDisableStorage = false;
   //angular.element("#storagePeriod").addClass("active");
   //angular.element("#storage30").removeClass("active");
  }

  self.apiLast30 = function(){
    self.periodDisableApi = true;
   //angular.element("#api30").addClass("active");
   //angular.element("#apiPeriod").removeClass("active");
    self.currentAPIPeriodFrom = from;
    self.currentAPIPeriodTo = to;

    //allApiAndTimeInfo_30day_country
    //apiDevice_30day_country
    //allViewHitsData_30day_country
    /*SymplAPIService.getFileError(userId,id,true,from,to).then(function(data){
     loadFileErrorCountry(data);
     });*/

    /*Call W/o group by Country*/


    self.api_model.frequency_responseTime = convertApiTimeGraphData(allApiAndTimeInfo30days);
    self.api_model.apiCountry = apiCountry30days;
    self.data_userType  = userType30days;
    self.data_viewHits = convertViewHitsGraphData(allViewHitsData_30days);
    self.api_model.fileErrors = fileErrors_30days
    self.api_model.apiErrors = apiError_30days;

  }
  self.apiPeriod = function(){
    self.periodDisableApi = false;
   //angular.element("#api30").removeClass("active");
   //angular.element("#apiPeriod").addClass("active");

    //applyPreviousCountryData();

  }

  self.submitApiPeriod = function(){
    var from = self.inputFromApi;
    var to = self.inputToApi;
    //call both wCountry & wo Country API
    self.currentAPIPeriodFrom = from;
    self.currentAPIPeriodTo = to;
    massCallChoosePeriod(self.api_app,from,to);


  }

  self.submitStoragePeriod = function(){

    var from = self.inputFromStorage;
    var to = self.inputToStorage;
    SymplAPIService.getAccStorageAndObj(userId,from,to).then(function(data){
      //default last 30 days;
      //self.storage_model.accInfo = data;
      LoadAccInfoPeriod(data);
      //self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStorage30Days[id]);
      self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStoragePeriod[self.storage_app]);
    });
  }

  self.resetAPIAllData = function(){
    apply30DaysData();
    var from = formatDate(priorDate);
    var to = formatDate(today);
    self.periodDisableApi = true;
    self.currentAPIPeriodFrom = from;
    self.currentAPIPeriodTo = to;
    self.showCountry = false;
   //angular.element("#api30").addClass("active");
   //angular.element("#apiPeriod").removeClass("active");

  }

  self.selectApp = function(){
    self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStorage30Days[self.storage_app]);
    self.storage_model.topObj = convertTopObjsGraphData(allTopObjectsApps[self.storage_app]);
  }
  self.selectAppApi = function(p){
    // console.log(self.api_app);
    self.currentAPIAppChosen = p;
    massCallChoosePeriod(self.api_app,from,to);
  }

  function apply30DaysData(){
    self.data_userType  = userType30days;
    self.api_model.fileErrors = fileErrors_30days;
    self.api_model.apiErrors = apiError_30days;
    self.data_viewHits = convertViewHitsGraphData(allViewHitsData_30days);
    self.api_model.frequency_responseTime = convertApiTimeGraphData(allApiAndTimeInfo30days);

    //API Response Time
  }

  function applyPeriodsCountryData(country){

    self.data_userType   = userTypeCountry[self.selectedCountry];


    if(fileErros_country[self.selectedCountry] == undefined){

      self.api_model.fileErrors = [];

    }else{
      self.api_model.fileErrors = fileErros_country[self.selectedCountry];
    }


    if(apiError_country[self.selectedCountry] == undefined){

      self.api_model.apiErrors = [];

    }else{
      self.api_model.apiErrors = apiError_country[self.selectedCountry];
    }


    /*if(allViewHitsData_country[self.selectedCountry] == undefined){

     self.data_viewHits = [];

     }else{
     self.data_viewHits = convertViewHitsGraphData(allViewHitsData_country[self.selectedCountry]);
     }*/

    //API Response Time

    if(allApiAndTimeInfo_country[self.selectedCountry] == undefined){

      self.api_model.frequency_responseTime = [];

    }else{
      self.api_model.frequency_responseTime = convertApiTimeGraphData(allApiAndTimeInfo_country[self.selectedCountry]);
    }
  }

  function apply30DaysCountryData(){
    //Device 30 days
    self.data_userType   = userType_30day_country[self.selectedCountry];

    //fileError 30days
    if(fileErrors_30days_country[self.selectedCountry] == undefined){

      self.api_model.fileErrors = [];

    }else{
      self.api_model.fileErrors = fileErrors_30days_country[self.selectedCountry];
    }

    //API Error 30 days
    if(apiError_30days_country[self.selectedCountry] == undefined){

      self.api_model.apiErrors = [];

    }else{
      self.api_model.apiErrors = apiError_30days_country[self.selectedCountry];
    }

    //View Hit 30 days
    /*if(allViewHitsData_30day_country[self.selectedCountry] == undefined){

     self.data_viewHits = [];

     }else{
     self.data_viewHits = convertViewHitsGraphData(allViewHitsData_30day_country[self.selectedCountry]);
     }*/

    //API Response Time

    if(allApiAndTimeInfo_30day_country[self.selectedCountry] == undefined){

      self.api_model.frequency_responseTime = [];

    }else{
      self.api_model.frequency_responseTime = convertApiTimeGraphData(allApiAndTimeInfo_30day_country[self.selectedCountry]);
    }
  }

  function applyPreviousCountryData(){
    //Device 30 days
    self.data_userType   = userTypeCountry[self.selectedCountry];

    //fileError 30days
    if(fileErros_country[self.selectedCountry] == undefined){

      self.api_model.fileErrors = [];

    }else{
      self.api_model.fileErrors = fileErros_country[self.selectedCountry];
    }

    //API Error 30 days
    if(apiError_country[self.selectedCountry] == undefined){

      self.api_model.apiErrors = [];

    }else{
      self.api_model.apiErrors = apiError_country[self.selectedCountry];
    }

    //View Hit 30 days
    /*if(allViewHitsData_country[self.selectedCountry] == undefined){

     self.data_viewHits = [];

     }else{
     self.data_viewHits = convertViewHitsGraphData(allViewHitsData_country[self.selectedCountry]);
     }*/

    //API Response Time

    if(allApiAndTimeInfo_country[self.selectedCountry] == undefined){

      self.api_model.frequency_responseTime = [];

    }else{
      self.api_model.frequency_responseTime = convertApiTimeGraphData(allApiAndTimeInfo_country[self.selectedCountry]);
    }
  }

  self.selectCountryApi = function(){
    apply30DaysCountryData();

  }




  /* Storage session */
  /* App Storage*/
  self.options_objApp = {
    chart: {
      type: 'pieChart',
      height: 350,
      //width:angular.element("#sym-noObj").width() - 10,
      x: function(d){return d.app;},
      y: function(d){return d.value;},
      showLabels: false,
      duration: 500,
      labelThreshold: 0.01,
      labelSunbeamLayout: true,
      legend: {
        margin: {
          top: 5,
          right: 35,
          bottom: 5,
          left: 0
        }
      },
      pie:{
        dispatch:{
          elementClick:function(e){
            self.storage_app = e.data.app;
           //angular.element("#test").triggerHandler("change");
            if(self.periodDisableStorage){
              self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStorage30Days[self.storage_app]);
            }else{
              self.storage_model.accInfo = convertAccInfoGraphData(allAccInfoStoragePeriod[self.storage_app]);
            }
            self.storage_model.topObj = convertTopObjsGraphData(allTopObjectsApps[self.storage_app]);
           //angular.element("#test").triggerHandler("change");
          }
        }
      }
    }
  };
  /* Top object size */
  self.options_topObjects = {
    chart: {
      type: 'multiBarHorizontalChart',
      height: 350,
      //width:angular.element("#sym-lObj").width() - 10,
      x: function(d){return d.label;},
      y: function(d){return d.value/(1024*1024);},
      showControls: true,
      showValues: true,
      duration: 500,
      xAxis: {
        showMaxMin: false,
        tickFormat: function(d){
          var index = d.indexOf(",");
          var name = d.substring(0,index);
          var label = "";
          if(name.length > 8){ //if label more thang 9 characters would be cropped
            label = name.substring(0,6);
            return label + "..";
          }else{
            return name;
          }
        }

      },
      yAxis: {
        axisLabel: 'Values',
        tickFormat: function(d){
          return d3.format(',.2f')(d);
        }
      },
      useInteractiveGuideline : false,
      interactive: true,
      tooltip:{
        enabled:true,
        contentGenerator: function(d) {
          return '<p>'+d.value+'</p>';
        }
      }
    }
  };

  /*Accumulated Storage And Number Object*/
  /* Chart options */
  self.options_accInfo = {
    chart: {
      type: 'multiChart',
      height: 350,
      //width:angular.element("#sym-storage").width() - 10,
      margin : {
        top: 30,
        right: 60,
        bottom: 50,
        left: 70
      },
      useInteractiveGuideline:true,

      color: d3.scale.category10().range(),
      //useInteractiveGuideline: true,
      duration: 500,
      xAxis: {
        tickFormat: function(d){
          return d3.time.format('%b %d')(new Date(d));
        }
      },
      yAxis1: {
        tickFormat: function(d){
          return d3.format(',.1f')(d);
        }
      },
      yAxis2: {
        tickFormat: function(d){
          return d3.format(',.1f')(d/(1024*1024));
        }
      }
    }
  };
  self.options_file_errors = {
    chart: {
      type: 'pieChart',
      height: 500,
      //width:angular.element("#sym-fileError").width() - 10,
      donut: true,
      x: function(d){return d.key;},
      y: function(d){return d.value;},
      showLabels: false,

      pie: {
        startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
        endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
      },
      duration: 500,
      legend: {
        margin: {
          top: 5,
          right: 70,
          bottom: 5,
          left: 0
        }
      },
      noData:"No Errors have been captured"
    }
  };

  self.options_api_errors = {
    chart: {
      type: 'pieChart',
      height: 300,
      //width:angular.element("#sym-apiError").width() - 10,
      donut: true,
      x: function(d){return d.key;},
      y: function(d){return d.value;},
      showLabels: false,

      pie: {
        startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
        endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
      },
      duration: 500,
      legend: {
        margin: {
          top: 5,
          right: 70,
          bottom: 5,
          left: 0
        }
      },
      noData:"No Errors have been captured"
    }
  };




  /* View toggle	*/
  self.toggleViewByStorage = function(){
    self.byAPI = false;
    self.byStorage = true;
    ////angular.element("#test").triggerHandler("change");
  }

  self.toggleViewByApi = function(){
    self.byAPI = true;
    self.byStorage = false;
    ////angular.element("#test2").triggerHandler("change");
  }

  /* For ViewAPI*/
  self.options_errors = {
    chart: {
      type: 'stackedAreaChart',
      height: 350,
      margin : {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
      },
      x: function(d){return d[0];},
      y: function(d){return d[1];},
      useVoronoi: false,
      clipEdge: true,
      duration: 100,
      useInteractiveGuideline: true,
      xAxis: {
        showMaxMin: false,
        tickFormat: function(d) {
          return d3.time.format('%x')(new Date(d))
        }
      },
      yAxis: {
        tickFormat: function(d){
          return d3.format(',.2f')(d);
        }
      },
      zoom: {
        enabled: true,
        scaleExtent: [1, 10],
        useFixedDomain: false,
        useNiceScale: false,
        horizontalOff: false,
        verticalOff: true,
        unzoomEventType: 'dblclick.zoom'
      }
    }
  };

  self.data_errors = [
    {
      "key" : "Errors found" ,
      "values" : [ [ 1025409600000 , 23.041422681023] , [ 1028088000000 , 19.854291255832] , [ 1030766400000 , 21.02286281168] , [ 1033358400000 , 22.093608385173] , [ 1036040400000 , 25.108079299458] , [ 1038632400000 , 26.982389242348] , [ 1041310800000 , 19.828984957662] , [ 1043989200000 , 19.914055036294] , [ 1046408400000 , 19.436150539916] , [ 1049086800000 , 21.558650338602] , [ 1051675200000 , 24.395594061773] , [ 1054353600000 , 24.747089309384] , [ 1056945600000 , 23.491755498807] , [ 1059624000000 , 23.376634878164] , [ 1062302400000 , 24.581223154533] , [ 1064894400000 , 24.922476843538] , [ 1067576400000 , 27.357712939042] , [ 1070168400000 , 26.503020572593] , [ 1072846800000 , 26.658901244878] , [ 1075525200000 , 27.065704156445] , [ 1078030800000 , 28.735320452588] , [ 1080709200000 , 31.572277846319] , [ 1083297600000 , 30.932161503638] , [ 1085976000000 , 31.627029785554] , [ 1088568000000 , 28.728743674232] , [ 1091246400000 , 26.858365172675] , [ 1093924800000 , 27.279922830032] , [ 1096516800000 , 34.408301211324] , [ 1099195200000 , 34.794362930439] , [ 1101790800000 , 35.609978198951] , [ 1104469200000 , 33.574394968037] , [ 1107147600000 , 31.979405070598] , [ 1109566800000 , 31.19009040297] , [ 1112245200000 , 31.083933968994] , [ 1114833600000 , 29.668971113185] , [ 1117512000000 , 31.490638014379] , [ 1120104000000 , 31.818617451128] , [ 1122782400000 , 32.960314008183] , [ 1125460800000 , 31.313383196209] , [ 1128052800000 , 33.125486081852] , [ 1130734800000 , 32.791805509149] , [ 1133326800000 , 33.506038030366] , [ 1136005200000 , 26.96501697216] , [ 1138683600000 , 27.38478809681] , [ 1141102800000 , 27.371377218209] , [ 1143781200000 , 26.309915460827] , [ 1146369600000 , 26.425199957518] , [ 1149048000000 , 26.823411519396] , [ 1151640000000 , 23.850443591587] , [ 1154318400000 , 23.158355444054] , [ 1156996800000 , 22.998689393695] , [ 1159588800000 , 27.9771285113] , [ 1162270800000 , 29.073672469719] , [ 1164862800000 , 28.587640408904] , [ 1167541200000 , 22.788453687637] , [ 1170219600000 , 22.429199073597] , [ 1172638800000 , 22.324103271052] , [ 1175313600000 , 17.558388444187] , [ 1177905600000 , 16.769518096208] , [ 1180584000000 , 16.214738201301] , [ 1183176000000 , 18.729632971229] , [ 1185854400000 , 18.814523318847] , [ 1188532800000 , 19.789986451358] , [ 1191124800000 , 17.070049054933] , [ 1193803200000 , 16.121349575716] , [ 1196398800000 , 15.141659430091] , [ 1199077200000 , 17.175388025297] , [ 1201755600000 , 17.286592443522] , [ 1204261200000 , 16.323141626568] , [ 1206936000000 , 19.231263773952] , [ 1209528000000 , 18.446256391095] , [ 1212206400000 , 17.822632399764] , [ 1214798400000 , 15.53936647598] , [ 1217476800000 , 15.255131790217] , [ 1220155200000 , 15.660963922592] , [ 1222747200000 , 13.254482273698] , [ 1225425600000 , 11.920796202299] , [ 1228021200000 , 12.122809090924] , [ 1230699600000 , 15.691026271393] , [ 1233378000000 , 14.720881635107] , [ 1235797200000 , 15.387939360044] , [ 1238472000000 , 13.765436672228] , [ 1241064000000 , 14.631445864799] , [ 1243742400000 , 14.292446536221] , [ 1246334400000 , 16.170071367017] , [ 1249012800000 , 15.948135554337] , [ 1251691200000 , 16.612872685134] , [ 1254283200000 , 18.778338719091] , [ 1256961600000 , 16.756026065421] , [ 1259557200000 , 19.385804443146] , [ 1262235600000 , 22.950590240168] , [ 1264914000000 , 23.61159018141] , [ 1267333200000 , 25.708586989581] , [ 1270008000000 , 26.883915999885] , [ 1272600000000 , 25.893486687065] , [ 1275278400000 , 24.678914263176] , [ 1277870400000 , 25.937275793024] , [ 1280548800000 , 29.461381693838] , [ 1283227200000 , 27.357322961861] , [ 1285819200000 , 29.057235285673] , [ 1288497600000 , 28.549434189386] , [ 1291093200000 , 28.506352379724] , [ 1293771600000 , 29.449241421598] , [ 1296450000000 , 25.796838168807] , [ 1298869200000 , 28.740145449188] , [ 1301544000000 , 22.091744141872] , [ 1304136000000 , 25.07966254541] , [ 1306814400000 , 23.674906973064] , [ 1309406400000 , 23.418002742929] , [ 1312084800000 , 23.24364413887] , [ 1314763200000 , 31.591854066817] , [ 1317355200000 , 31.497112374114] , [ 1320033600000 , 26.67238082043] , [ 1322629200000 , 27.297080015495] , [ 1325307600000 , 20.174315530051] , [ 1327986000000 , 19.631084213898] , [ 1330491600000 , 20.366462219461] , [ 1333166400000 , 19.284784434185] , [ 1335758400000 , 19.157810257624]]
    },
  ]

  self.options_api = {
    chart: {
      type: 'multiChart',
      height: 350,
      //width:angular.element("#sym-api").width() - 50,
      margin : {
        top: 30,
        right: 60,
        bottom: 50,
        left: 70
      },
      color: d3.scale.category10().range(),
      //useInteractiveGuideline: true,
      duration: 500,
      xAxis: {
        tickFormat: function(d){
          return d3.time.format('%b %d')(new Date(d));
        }
      },
      yAxis1: {
        tickFormat: function(d){
          return d3.format(',.1f')(d);
        }
      },
      yAxis2: {
        tickFormat: function(d){
          return d3.format(',.1f')(d);
        }
      }
    }
  };

  self.options_origin = {
    chart: {
      type: 'pieChart',
      height: 300,
      //width:angular.element("#sym-origin").width() - 10,
      x: function(d){return d.country;},
      y: function(d){return d.value;},
      showLabels: false,
      duration: 500,
      labelThreshold: 0.01,
      labelSunbeamLayout: true,
      legend: {
        margin: {
          top: 5,
          right: 35,
          bottom: 5,
          left: 0
        }
      },
      pie:{
        //dispatch:{
        //  elementClick:function(e){
        //    //Load graphs based on country
        //    self.selectedCountry = e.data.country;
        //    self.showCountry = true;
        //    if(self.periodDisableApi){ //load 30days records
        //      apply30DaysCountryData();
        //    }else{ //load Period records
        //      applyPeriodsCountryData();
        //    }
        //   //angular.element("#countryHidden").triggerHandler("change");
        //  }
        //}
      }
    }
  };

  self.options_userType = {
    chart: {
      type: 'multiBarHorizontalChart',
      height: 300,
      //width:angular.element("#sym-user").width() - 10,
      x: function(d){return d.label;},
      y: function(d){return d.value;},
      showControls: false,
      showValues: true,
      duration: 500,
      xAxis: {
        showMaxMin: false
      },
      yAxis: {
        axisLabel: 'Values',
        tickFormat: function(d){
          return d3.format(',.2f')(d);
        }
      }
    }
  };

  self.options_viewHits = {
    chart: {
      type: 'multiBarHorizontalChart',
      height: 350,
      //width:angular.element("#sym-viewhits").width() - 10,
      x: function(d){return d.label;},
      y: function(d){return d.value;},
      showControls: true,
      showValues: true,
      duration: 500,
      useInteractiveGuideline : false,
      xAxis: {
        showMaxMin: false,
        tickFormat: function(d){
          var index = d.indexOf(",");
          var name = d.substring(0,index);
          var label = "";
          if(name.length > 8){ //if label more thang 9 characters would be cropped
            label = name.substring(0,6);
            return label + "..";
          }else{
            return name;
          }
        }
      },
      yAxis: {
        axisLabel: 'Values',
        tickFormat: function(d){
          return d3.format(',.2f')(d);
        }
      },
      interactive: true,
      tooltip:{
        enabled:true,
        contentGenerator: function(d) {
          return '<p>'+d.value+'</p>';
        }
      }
    }
  };
});
