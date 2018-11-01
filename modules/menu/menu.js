'use strict';

angular
    .module('angular-app')

    .controller('MenuController', function ($scope, $location, $timeout) {
        var vm = this;
        vm.index = 0; //<--- variable propia de vm, status o posicion inicial     
        var temp_index = 0;

       // $scope.$on('navKeys', navKeys); //<--- funcion que atrapa y recibe parametro 
        $scope.$on('$destroy', $scope.$on('navKeys', navKeys));
        
        function navKeys(event, move) {
            temp_index = vm.index;
            switch (move) {
                case 'right':
                    if (vm.index < 1) {
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
                    console.log('enter in menu');
                    $timeout(function () {
                        if (vm.index === 0) {
                            $location.path('video');
                        }
                        else {
                           // $location.path('images');
                        }
                    })

                    break;
            }
            //solo si hubo un cambio de index se actualiza, si no no pasa nada
            if (vm.index != temp_index) {
                temp_index = vm.index;
                $scope.$apply() //---> actualiza "manualmente" los cambios realizados por no ser una funcion propia de Angular
            }
        }
    })




