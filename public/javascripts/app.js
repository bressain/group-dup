(function() {
  'use strict';

  function FormController (groupCreateService) {
    var vm = this;

    vm.model = new GroupCreateModel();

    vm.createGroup = function () {
      console.log(vm.model);
      groupCreateService.filterToGroup(vm.model.token, vm.model.copyfrom)
        .then(cloneGroup);
    };

    function cloneGroup (oldGroup) {
      groupCreateService.createGroup(vm.model.token, vm.model.copyto, oldGroup);
      vm.model = new GroupCreateModel();
    }
  }

  function GroupCreateModel () {
    this.token = '';
    this.copyfrom = '';
    this.copyto = '';
  }

  // configInjector found in server-rendered template
  function SlackService ($http, configInjector) {
    return {
      listGroups: function (token) {
        return $http.post(configInjector.slackApi + 'groups.list', { token: token });
      }
    };
  }

  function GroupCreateService (slackService) {
    function filterToGroup (token, groupName) {
      return slackService.listGroups(token)
        .success(function (data) {
          var groups = data.groups.filter(function (x) {
            return x.name === groupName;
          });
          return groups.length > 0 ? groups[0] : null;
        })
        .error(function (data, status) {
          console.log(data);
          return null;
        });
    }

    return { findGroup: filterToGroup };
  }

  angular
    .module('GroupDup', [])
    .factory('slackService', SlackService)
    .factory('groupCreateService', GroupCreateService)
    .controller('FormController', FormController);
})();
