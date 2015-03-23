(function() {
  'use strict';

  function FormController (groupCreateService) {
    this.model = new GroupCreateModel();

    this.createGroup = function () {
      console.log(this.model);
      this.model = new GroupCreateModel();
    };
  }

  function GroupCreateModel () {
    this.token = '';
    this.copyfrom = '';
    this.copyto = '';
  }

  function GroupCreateService (configInjector) {
    return function () {
    };
  }

  angular
    .module('GroupDup', [])
    .controller('FormController', FormController)
    .factory('groupCreateService', GroupCreateService);
})();
