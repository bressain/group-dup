(function() {
  'use strict';

  function FormController (groupCreateService) {
    var vm = this;

    vm.model = new GroupCreateModel();

    vm.createGroup = function () {
      groupCreateService.copyGroup(vm.model)
        .then(function () { vm.model = new GroupCreateModel(); });
    };
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
        return $http.post(configInjector.slackApi + 'groups.list', { token: token })
          .then(function (result) { return result.data.groups; });
      }
    };
  }

  function GroupCreateService (slackService) {
    function copyGroup (groupCreateModel) {
      return slackService.listGroups(groupCreateModel.token)
        .success(function (data) {
          var groups = data.filter(function (x) {
            return x.name === groupCreateModel.copyfrom;
          });
          return groups.length > 0 ? groups[0] : null;
        })
        .error(function (data, status) {
          console.log(data);
          return null;
        });
    }

    return { copyGroup: copyGroup };
  }

  angular
    .module('GroupDup', [])
    .factory('slackService', SlackService)
    .factory('groupCreateService', GroupCreateService)
    .controller('FormController', FormController);
})();
