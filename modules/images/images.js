'use strict';
/*
    $scope.apply() -> used only for asincronus processes, if is used with a angular function it might cause conflicts in the scope
    $timeout      -> wait until angular procees is finished, then it is trigered
*/
angular
    .module('angular-app')

    .controller('ImageController', function ($scope, $location, $timeout) {
        var vm = this;
        vm.index = 0;

        $scope.$on('$destroy', $scope.$on('navKeys', navKeys));

        function navKeys(event, move) {
            //console.warn(move)
            switch (move) {
                case 'right':
                    if (vm.index < 4) {
                        vm.index++;
                    }
                    $scope.$apply();
                    break;
                case 'left':
                    if (vm.index > 0) {
                        vm.index--;
                    }
                    $scope.$apply();
                    break;
                case 'enter':
                    console.log('enter in images');
                    break;
                case 'back':
                    $timeout(function () {
                        $location.path('/');
                    });
                    break;
                default:
                    break;
            }
        }
    })