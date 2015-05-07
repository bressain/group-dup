describe('GroupDup', function () {
  'use strict';

  describe('FormController', function () {
    var $controller;
    var groupCreateService;

    beforeEach(function () {
      angular.mock.module('GroupDup');

      inject(function(_$controller_) {
        groupCreateService = {
          dupGroup: function (model) {
            return { then: function (f) { f(); }};
          }
        };
        spyOn(groupCreateService, 'dupGroup').and.callThrough();
        $controller = _$controller_('FormController', { groupCreateService: groupCreateService });
      });
    });

    it('should have a model', function () {
      expect($controller.model).toBeDefined();
    });

    describe('createGroup', function () {
      it('should ask the groupCreateService to create a new group', function () {
        $controller.createGroup();
        expect(groupCreateService.dupGroup).toHaveBeenCalled();
        expect(groupCreateService.dupGroup.calls.argsFor(0)).toEqual([$controller.model]);
      });

      it('should refresh the model on success', function () {
        $controller.model.token = 'herp';
        $controller.createGroup();
        expect($controller.model.token).not.toBe('herp');
      });
    });
  });

  describe('GroupCreateService', function () {
    var groupCreateService;
    var httpBackend;
    var configInjector;
    var model = { token: 'derp', copyto: 'new-group', copyfrom: 'old-group' };

    beforeEach(function () {
      angular.mock.module('GroupDup', function($provide) {
        configInjector = { baseUri: 'baseUri' };
        $provide.value('configInjector', configInjector);
      });

      inject(function(_groupCreateService_, $httpBackend) {
        groupCreateService = _groupCreateService_;
        httpBackend = $httpBackend;
      });
    });

    it('should ask the group-dup service to create the group', function () {
      var result = null;
      httpBackend.expectPOST('baseUri', model).respond(200, {ok:true});
      
      groupCreateService.dupGroup(model).then(function (x) { result = x; });
      httpBackend.flush();

      expect(result).not.toBeNull();
    });
  });

  it('passes because canary', function () {
    expect(true).toBe(true);
  });
});
