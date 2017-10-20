import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import lodash from 'lodash';

describe('Projektor.modules', function() {
  beforeEach(function() {
    // Reset all existing zones
    lodash.forEach(Projektor.modules, (value, key) => {
      if (!lodash.isFunction(value)) {
        lodash.unset(Projektor.modules, key);
      }
    });
  });

  it('should have function to create new zone', function() {
    assert.isFunction(Projektor.modules.createZone, 'has createZone function');
  });

  it('should have function: add', function() {
    assert.isFunction(Projektor.modules.add, 'has add function');
  });

  it('should create zone', function() {
    const zone = 'sampleZone';
    Projektor.modules.createZone(zone);
    assert.isArray(Projektor.modules[zone], 'zone has been created');
  });

  it('should add module to existing zone', function() {
    const zone = 'sampleZone';
    Projektor.modules[zone] = [];
    const module = {
      template: 'sampleModuleTemplate',
      position: 10,
    };
    Projektor.modules.add(zone, module);
    assert.deepEqual(Projektor.modules[zone][0], module, 'module was added to zone');
  });

  it('should add multiple modules to zone', function() {
    const zone = 'sampleZone';
    Projektor.modules[zone] = [];

    const modules = [
      { template: 'firstTemplate', position: 5 },
      { template: 'secondTemplate', position: 10 },
    ];
    Projektor.modules.add(zone, modules);

    assert.deepEqual(Projektor.modules[zone], modules, 'modules were added to zone');
  });

  it('should not add module when position already occupied', function() {
    const zone = 'sampleZone';
    Projektor.modules[zone] = [];
    const firstModule = {
      template: 'sampleModuleTemplate',
      position: 10,
    };
    const secondModule = firstModule;
    Projektor.modules.add(zone, firstModule);
    assert.throws(() => {
      Projektor.modules.add(zone, secondModule);
    }, Meteor.Error, 'Projektor.modules.add.positionOccupied');

    const thirdModule = firstModule;
    thirdModule.position = 50;
    const fourthModule = thirdModule;
    assert.throws(() => {
      Projektor.modules.add(zone, [thirdModule, fourthModule]);
    }, Meteor.Error, 'Projektor.modules.add.positionOccupied');
  });

  it('should not overwrite existing zone', function() {
    const zone = 'sampleZone';
    Projektor.modules[zone] = [];
    assert.throws(() => {
      Projektor.modules.createZone(zone);
    }, Meteor.Error, 'Projektor.modules.createZone.alreadyExists');
  });

  it('should deny using function names for zones', function() {
    const functionNames = ['createZone', 'add', 'remove', 'getModulesFromZone'];

    const assertThrowsReservedNameError = function(functionName, reservedNames) {
      lodash.forEach(reservedNames, function(reservedName) {
        const zone = reservedName;
        const module = { template: 'sampleTemplate' };
        assert.throws(() => {
          Projektor.modules[functionName](zone, module);
        }, Meteor.Error, `Projektor.modules.${functionName}.reservedName`,
          `throws Error: Projektor.modules.${functionName}.reservedName`);
      });
    };

    lodash.forEach(functionNames, function(functionName) {
      const reservedNames = functionNames;
      assertThrowsReservedNameError(functionName, reservedNames);
    });
    lodash.forEach(functionNames, function(functionName) {
      assert.isFunction(Projektor.modules[functionName], `${functionName} has not been overwritten`);
    });
  });

  it('should only add to existing zone', function() {
    const zone = 'sampleZone';
    const module = {
      template: 'sampleModuleTemplate',
    };

    assert.throws(() => {
      Projektor.modules.add(zone, module);
    }, Meteor.Error, 'Projektor.modules.add.noZone');
  });

  it('should not create zone with invalid name argument', function() {
    const invalidZones = ['', {}, [], 123];

    lodash.forEach(invalidZones, function(zone) {
      assert.throws(() => {
        Projektor.modules.createZone(zone);
      }, Meteor.Error, 'Projektor.modules.createZone.invalidName');
    });
  });

  it('should not add invalid modules', function() {
    const zone = 'sampleZone';
    Projektor.modules.createZone(zone);

    const invalidModules = [
      '',
      {},
      123,
      { invalidKey: 'test' },
      { template: '' },
      { template: {} },
      { template: 123 },
      { template: 'validTemplate', position: 'invalidPosition' },
      { template: 'validTemplate', position: {} },
      { template: 'validTemplate', position: () => 4 },
    ];
    lodash.forEach(invalidModules, function(module) {
      const invalidArgs = [module, [module, module]];
      lodash.forEach(invalidArgs, function(invalidArg) {
        assert.throws(() => {
          Projektor.modules.add(zone, invalidArg);
        }, Meteor.Error, 'Projektor.modules.add.invalidModule');
      });
    });
  });

  it('should deliver modules from a zone in correct order', function() {
    const zone = 'sampleZone';
    const modulesUnordered = [
      { template: 'firstSampleModuleTemplate', position: 1 },
      { template: 'firstSampleModuleTemplateWithoutPosition' },
      { template: 'thirdSampleModuleTemplate', position: 3 },
      { template: 'secondSampleModuleTemplateWithoutPosition' },
      { template: 'secondSampleModuleTemplate', position: 2 },
    ];
    Projektor.modules[zone] = modulesUnordered;
    const modulesOrdered = [
      { template: 'firstSampleModuleTemplate', position: 1 },
      { template: 'secondSampleModuleTemplate', position: 2 },
      { template: 'thirdSampleModuleTemplate', position: 3 },
      { template: 'firstSampleModuleTemplateWithoutPosition' },
      { template: 'secondSampleModuleTemplateWithoutPosition' },
    ];
    assert.sameDeepOrderedMembers(Projektor.modules.getModulesFromZone(zone), modulesOrdered);
  });
  it('should remove a module from a zone', function() {
    const zone = 'sampleZone';
    const firstModule = { template: 'firstSampleModuleTemplate' };
    const secondModule = { template: 'secondSampleModuleTemplate' };
    Projektor.modules[zone] = [firstModule, secondModule];

    Projektor.modules.remove(zone, firstModule.template);

    assert.deepEqual(Projektor.modules[zone], [secondModule]);
  });

  it('should only remove from valid zones', function() {
    const invalidZones = ['', {}, [], 123];

    lodash.forEach(invalidZones, function(zone) {
      assert.throws(() => {
        Projektor.modules.createZone(zone);
      }, Meteor.Error, 'Projektor.modules.createZone.invalidName');
    });
  });

  it('should remove multiple modules from a zone');
});
