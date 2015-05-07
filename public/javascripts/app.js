(function() {
  'use strict';

  function FormController (groupCreateService) {
    var vm = this;

    vm.model = new GroupCreateModel();

    vm.createGroup = function () {
      groupCreateService.dupGroup(vm.model)
        .then(function () { vm.model = new GroupCreateModel(); });
    };
  }

  function GroupCreateModel () {
    this.token = '';
    this.copyfrom = '';
    this.copyto = '';
  }

  function GroupCreateService ($http, configInjector) {
    return {
      dupGroup: function (groupCreateModel) {
        return $http.post(configInjector.baseUri, groupCreateModel)
          .then(function (result) { return result.data; });
      }
    };
  }

  angular
    .module('GroupDup', [])
    .factory('groupCreateService', GroupCreateService)
    .controller('FormController', FormController);
})();
