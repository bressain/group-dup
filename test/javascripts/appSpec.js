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
    var token = 'teh-token';

    beforeEach(angular.mock.module('GroupDup', function ($provide) {
      configInjector = { baseUri: 'baseUri.' };
      $provide.value('configInjector', configInjector);
    }));

    beforeEach(inject(function (_slackService_, $httpBackend) {
      slackService = _slackService_;
      httpBackend = $httpBackend;
    }));

    it('should post groups.list for the group name', function () {
      var result = null;
      httpBackend.expectPOST('baseUri.listgroups', { token: token }).respond(200, {ok:true, groups:[{},{}]});
      
      slackService.listGroups(token).then(function (x) { result = x; });
      httpBackend.flush();

      expect(result.length).toBe(2);
    });

    it('should post groups.create to create the new group', function () {
      var result = null;
      var name = 'new-name';
      httpBackend.expectPOST('baseUri.creategroup', { token: token, name: name })
        .respond(200, { ok: true, group: { name: name } });

      slackService.createGroup(token, name).then(function (x) { result = x; });
      httpBackend.flush();

      expect(result.name).toEqual(name);
    });

    it('should post groups.invite to invite a new user to a group', function () {
      var result = null;
      httpBackend.expectPOST('baseUri.invitetogroup', { token: token, channel: 'G1', user: 'U1' })
        .respond(200, { ok: true, group: {} });

      slackService.inviteToGroup(token, 'G1', 'U1').then(function (x) { result = x; });
      httpBackend.flush();

      expect(result).not.toBe(null);
    });
  });

  describe('GroupCreateService', function () {
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
