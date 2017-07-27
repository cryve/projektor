import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import ValidationError from 'meteor/mdg:validation-error'
import { Random } from 'meteor/random';
import lodash from 'lodash';

describe("Projektor.modules", function() {
  beforeEach(function() {
    // Reset all existing zones
    lodash.forEach(Projektor.modules, (value, key) => {
      console.log(value, key);
      if(!lodash.isFunction(value)) {
        lodash.unset(Projektor.modules, key);
      }
    });
  });
  it('should have function: add', function() {
    chai.assert.isFunction(Projektor.modules.add, "has add function");
  });
  it('should add module to zone', function() {
    const zone = "sampleZone";
    const module = {
      template: "sampleModuleTemplate"
    };
    Projektor.modules.add(zone, module);
    chai.assert.isArray(Projektor.modules[zone], "zone has been created");
    chai.assert.deepEqual(Projektor.modules[zone][0], module, "module was added to zone");
  });
  it('should add multiple modules to zone', function() {
    console.log(Projektor.modules);
    const zone = "sampleZone";
    const modules = [
      { template: "firstTemplate" },
      { template: "secondTemplate" },
    ];
    Projektor.modules.add(zone, modules);
    chai.assert.isArray(Projektor.modules[zone], "zone has been created");
    chai.assert.deepEqual(Projektor.modules[zone], modules, "module was added to zone");
  });
  it('should not overwrite add function', function() {
    const zone = "add";
    const module = {
      template: "sampleModuleTemplate"
    };
    Projektor.modules.add(zone, module);
    console.log(Projektor);
    chai.assert.isFunction(Projektor.modules.add, "add has not been overwritten");

  });
  it('should deliver modules from a zone', function() {
    const zone = "sampleZone";
    const firstModule = {
      template: "firstTemplate"
    }
  });
});
