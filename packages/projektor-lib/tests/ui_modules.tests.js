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
    chai.assert.isFunction(Projektor.modules.create, 'has create function');
  });

  it('should have function: add', function() {
    chai.assert.isFunction(Projektor.modules.add, 'has add function');
  });

  it('should create zone', function() {
    const zone = 'sampleZone';
    Projektor.modules.create(zone);
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
      Projektor.modules.create(zone);
    }, Meteor.Error, 'Projektor.modules.create.alreadyExists');
  });

  it('should deny creating or adding to "add"/"create"', function() {
    const zones = ['create', 'add'];
    const module = {
      template: 'sampleModuleTemplate'
    };
    lodash.forEach(zones, function(zone) {
      chai.assert.throws(() => {
        Projektor.modules.create(zone);
      }, Meteor.Error, 'Projektor.modules.create.reservedName');
      chai.assert.throws(() => {
        Projektor.modules.add(zone, module);
      }, Meteor.Error, 'Projektor.modules.add.reservedName');
    });
    chai.assert.isFunction(Projektor.modules.create, 'create has not been overwritten');
    chai.assert.isFunction(Projektor.modules.add, 'create has not been overwritten');
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
        Projektor.modules.create(zone);
      }, Meteor.Error, 'Projektor.modules.create.invalidName');
    });
  });

  it('should not add invalid modules', function() {
    const zone = 'sampleZone';
    Projektor.modules.create(zone);

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
    Projektor.modules.create(zone);
    Projektor.modules.add(zone, modules);

    chai.assert.deepEqual(Projektor.modules.getModulesFromZone(zone), modules);
  });
  it('should remove a module from a zone');
  it('should remove multiple modules from a zone');
});
