"use strict";

angular
  .module("angular-app")

  .directive("finalTime", function() {
    var finalTime = {
      restrict: "EA",
      template: "<span>{{vm.PlayTime}}</span>",
      controllerAs: "vm"
    };
    return finalTime;
  })
  .directive("onCurrentPlayTime", function() {
    var currentTime = {
      restrict: "EA",
      template: "<span>{{vm.currentPlayTime}}</span>",
      controllerAs: "vm"
    };
    return currentTime;
  });