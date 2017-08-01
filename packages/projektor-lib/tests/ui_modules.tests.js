import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
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

  it('should have function: create', function() {
    chai.assert.isFunction(Projektor.modules.createZone, 'has create function');
  });

  it('should have function: add', function() {
    chai.assert.isFunction(Projektor.modules.add, 'has add function');
  });

  it('should create zone', function() {
    const zone = 'sampleZone';
    Projektor.modules.createZone(zone);
    chai.assert.isArray(Projektor.modules[zone], 'zone has been created');
  });

  it('should add module to existing zone', function() {
    const zone = 'sampleZone';
    Projektor.modules[zone] = [];
    const module = {
      template: 'sampleModuleTemplate'
    };
    Projektor.modules.add(zone, module);
    chai.assert.deepEqual(Projektor.modules[zone][0], module, 'module was added to zone');
  });

  it('should add multiple modules to zone', function() {
    const zone = 'sampleZone';
    Projektor.modules[zone] = [];

    const modules = [
      { template: 'firstTemplate' },
      { template: 'secondTemplate' },
    ];
    Projektor.modules.add(zone, modules);

    chai.assert.deepEqual(Projektor.modules[zone], modules, 'modules were added to zone');
  });

  it('should not overwrite existing zone', function() {
    const zone = 'sampleZone';
    Projektor.modules[zone] = [];
    chai.assert.throws(() => {
      Projektor.modules.createZone(zone);
    }, Meteor.Error, 'Projektor.modules.createZone.alreadyExists');
  });

  it('should deny using function names for zones', function() {
    const functionNames = ['createZone', 'add', 'remove', 'getModulesFromZone'];

    const assertThrowsReservedNameError = function(functionName, reservedNames) {
      lodash.forEach(reservedNames, function(reservedName) {
        const zone = reservedName;
        const module = { template: 'sampleTemplate' };
        chai.assert.throws(() => {
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
      chai.assert.isFunction(Projektor.modules[functionName], `${functionName} has not been overwritten`);
    });
  });

  it('should only add to existing zone', function() {
    const zone = 'sampleZone';
    const module = {
      template: 'sampleModuleTemplate',
    };

    chai.assert.throws(() => {
      Projektor.modules.add(zone, module);
    }, Meteor.Error, 'Projektor.modules.add.noZone');
  });

  it('should not create zone with invalid name argument', function() {
    const invalidZones = ['', {}, [], 123];

    lodash.forEach(invalidZones, function(zone) {
      chai.assert.throws(() => {
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
    ];
    lodash.forEach(invalidModules, function(module) {
      const invalidArgs = [module, [module, module]];
      lodash.forEach(invalidArgs, function(invalidArg) {
        chai.assert.throws(() => {
          Projektor.modules.add(zone, invalidArg);
        }, Meteor.Error, 'Projektor.modules.add.invalidModule');
      });
    });
  });

  it('should deliver modules from a zone', function() {
    const zone = 'sampleZone';
    const modules = [
      { template: 'firstSampleModuleTemplate' },
      { template: 'secondSampleModuleTemplate' },
    ];
    Projektor.modules[zone] = modules;

    chai.assert.deepEqual(Projektor.modules.getModulesFromZone(zone), modules);
  });
  it('should remove a module from a zone', function() {
    const zone = 'sampleZone';
    const firstModule = { template: 'firstSampleModuleTemplate' };
    const secondModule = { template: 'secondSampleModuleTemplate' };
    Projektor.modules[zone] = [firstModule, secondModule];

    Projektor.modules.remove(zone, firstModule.template);

    chai.assert.deepEqual(Projektor.modules[zone], [secondModule]);
  });

  it('should only remove from valid zones', function() {
    const invalidZones = ['', {}, [], 123];

    lodash.forEach(invalidZones, function(zone) {
      chai.assert.throws(() => {
        Projektor.modules.createZone(zone);
      }, Meteor.Error, 'Projektor.modules.createZone.invalidName');
    });
  });

  it('should remove multiple modules from a zone');
});
