angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'js/components/login/login.html',
      controller: 'loginCtrl'
    })
    .state('menu.viewByTemplate', {
      url: '/viewByTemplate',
      views: {
        'side-menu': {
          templateUrl: 'js/components/viewByTemplate/viewByTemplate.html',
          controller: 'viewByTemplateCtrl'
        }
      }
    })
    .state('menu.templateManagement', {
      url: '/templateManagement',
      views: {
        'side-menu': {
          templateUrl: 'js/components/templateManagement/templateManagement.html',
          controller: 'templateManagementCtrl'
        }
      }
    })
    .state('menu.template', {
      url: '/template',
      views: {
        'side-menu': {
          templateUrl: 'js/components/template/template.html',
          controller: 'templateCtrl'
        }
      }
    })
    .state('menu.newObject', {
      url: '/newObject',
          views: {
            'side-menu': {
              templateUrl: 'js/components/newObject/newObject.html',
              controller: 'newObjectCtrl'
            }
          }
    })
    .state('menu.object', {
      url: '/object',
      views: {
        'side-menu': {
          templateUrl: 'js/components/object/object.html',
          controller: 'objectCtrl'
        }
      }
    })
    .state('menu.chooseAppForAppManagement', {
      url: '/chooseAppForAppManagement',
      views: {
        'side-menu': {
          templateUrl: 'js/components/chooseAppForAppManagement/chooseAppForAppManagement.html',
          controller: 'chooseAppForAppManagementCtrl'
        }
      }
    })
    .state('menu.newTemplate', {
      url: '/newTemplate',
      views: {
        'side-menu': {
          templateUrl: 'js/components/newTemplate/newTemplate.html',
          controller: 'newTemplateCtrl'
        }
      }
    })
    .state('menu.analytics', {
      url: '/analytics',
      views: {
        'side-menu': {
          templateUrl: 'js/components/analytics/analytics.html',
          controller: 'analyticsCtrl'
        }
      }
    })
    .state('menu', {
      url: '/menu',
      abstract:true,
      templateUrl: 'js/components/menu/menu.html'
    })
   ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
