'use strict';

angular
    .module('angular-app',['ngRoute']);

angular
    .module('angular-app')
    .config(function($routeProvider){
        $routeProvider
        .when('/',{
            //templateUrl:'modules/menu/menu.html',
            templateUrl:'modules/video/video.html',
            //controller:'MenuController',
            controller:'VideoController',
            controllerAs:'vm'  
        })    
        .when('/video',{
            templateUrl:'modules/video/video.html',
            controller:'VideoController',
            controllerAs:'vm'
        })
        .when('/images',{
            templateUrl:'modules/images/images.html',
            controller:'ImageController',
            controllerAs:'vm'
        })
        .otherwise({
            redirectTo: '/'
        });  
    })

    .controller('MainController', function($scope, keyListen){
        //online & offline events could be added here
    })

