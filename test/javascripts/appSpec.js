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

  it('passes because canary', function () {
    expect(true).toBe(true);
  });
});
