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
        .then(function (groups) {
          slackService.createGroup(groupCreateModel.token, groupCreateModel.copyto)
            .then(function (newGroup) {
              var oldGroup = getGroupToCopyFrom(groups, groupCreateModel.copyfrom);
              oldGroup.members.forEach(function (x) {
                slackService.inviteToGroup(groupCreateModel.token, newGroup.id, x);
              });
            });
        });
    }

    function getGroupToCopyFrom (groups, copyfrom) {
      var filtered = groups.filter(function (x) {
        return x.name === copyfrom;
      });
      return filtered.length > 0 ? filtered[0] : null;
    } 

    return { copyGroup: copyGroup };
  }

  angular
    .module('GroupDup', [])
    .factory('slackService', SlackService)
    .factory('groupCreateService', GroupCreateService)
    .controller('FormController', FormController);
})();
