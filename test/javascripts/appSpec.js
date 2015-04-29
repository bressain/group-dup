describe('GroupDup', function () {
  'use strict';

  describe('FormController', function () {
    var $controller;
    var groupCreateService;

    beforeEach(function () {
      angular.mock.module('GroupDup');

      inject(function(_$controller_) {
        groupCreateService = {
          copyGroup: function (model) {
            return { then: function (f) { f(); }};
          }
        };
        spyOn(groupCreateService, 'copyGroup').and.callThrough();
        $controller = _$controller_('FormController', { groupCreateService: groupCreateService });
      });
    });

    it('should have a model', function () {
      expect($controller.model).toBeDefined();
    });

    describe('createGroup', function () {
      it('should ask the groupCreateService to create a new group', function () {
        $controller.createGroup();
        expect(groupCreateService.copyGroup).toHaveBeenCalled();
        expect(groupCreateService.copyGroup.calls.argsFor(0)).toEqual([$controller.model]);
      });

      it('should refresh the model on success', function () {
        $controller.model.token = 'herp';
        $controller.createGroup();
        expect($controller.model.token).not.toBe('herp');
      });
    });
  });

  describe('SlackService', function () {
    var slackService;
    var httpBackend;
    var configInjector;

    beforeEach(angular.mock.module('GroupDup', function ($provide) {
      configInjector = { slackApi: 'slackApi.' };
      $provide.value('configInjector', configInjector);
    }));

    beforeEach(inject(function (_slackService_, $httpBackend) {
      slackService = _slackService_;
      httpBackend = $httpBackend;
    }));

    it('should post groups.list for the group name', function () {
      var token = 'teh-token';
      var result = null;
      httpBackend.expectPOST('slackApi.groups.list', { token: token }).respond(200, {ok:true, groups:[{},{}]});
      slackService.listGroups(token).then(function (x) { result = x; });
      httpBackend.flush();
      expect(result.length).toBe(2);
    });
  });

  describe('groupCreateService', function () {
    var groupCreateService;
    var slackService;
    var model = { token: 'derp', copyto: 'new-group', copyfrom: 'old-group' };

    beforeEach(function () {
      angular.mock.module('GroupDup', function($provide) {
        slackService = {
          listGroups: function (token) {
            return { then: function (f) { f([{name:model.copyfrom, members:[]}]); } };
          },
          createGroup: function (token, name) {
            return { then: function (f) { f(); } };
          },
          inviteToGroup: function (token, groupId, userId) {
            return { then: function (f) { f(); } };
          }
        };

        $provide.value('slackService', slackService);
      });

      inject(function(_groupCreateService_) {
        groupCreateService = _groupCreateService_;
      });
    });

    it('should get all the groups from slack', function () {
      spyOn(slackService, 'listGroups').and.callThrough();

      groupCreateService.copyGroup(model);

      expect(slackService.listGroups).toHaveBeenCalled();
      expect(slackService.listGroups.calls.argsFor(0)).toEqual([model.token]);
    });

    it('should tell slack to create a new group', function () {
      spyOn(slackService, 'createGroup').and.callThrough();

      groupCreateService.copyGroup(model);

      expect(slackService.createGroup).toHaveBeenCalled();
      expect(slackService.createGroup.calls.argsFor(0)).toEqual([model.token, model.copyto]);
    });

    it('should invite users from the copied group to the new group', function () {
      var groups = [{name: 'G1', members: []}, {name: model.copyfrom, members: ['U1', 'U2']}, {name: 'G3', members: []}];
      spyOn(slackService, 'listGroups').and.callFake(function (token) {
        return { then: function (f) { f(groups); } };
      });
      spyOn(slackService, 'createGroup').and.callFake(function (token, name) {
        return { then: function (f) { f({id: 'NG1'}); } };
      });
      spyOn(slackService, 'inviteToGroup').and.callThrough();

      groupCreateService.copyGroup(model);

      expect(slackService.inviteToGroup).toHaveBeenCalled();
      expect(slackService.inviteToGroup.calls.argsFor(0)).toEqual([model.token, 'NG1', 'U1']);
      expect(slackService.inviteToGroup.calls.argsFor(1)).toEqual([model.token, 'NG1', 'U2']);
    });
  });

  it('passes because canary', function () {
    expect(true).toBe(true);
  });
});
