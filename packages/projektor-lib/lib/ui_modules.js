import { Meteor } from 'meteor/meteor';
import lodash from 'lodash';

Projektor.modules = {};

Projektor.modules.create = (zone) => {
  if (!zone || typeof zone !== 'string') {
    throw new Meteor.Error('Projektor.modules.create.invalidName',
      'Zone name must be of type String');
  }

  if (typeof Projektor.modules[zone] === 'function') {
    throw new Meteor.Error('Projektor.modules.create.reservedName',
      `This name is reserved to the ${zone}-function, please choose a different name, e.g. prefix your package name`);
  }

  if (Array.isArray(Projektor.modules[zone])) {
    throw new Meteor.Error('Projektor.modules.create.alreadyExists',
    `Zone "${zone}" already exists, please choose a different name, e.g. prefix your package name`);
  }

  Projektor.modules[zone] = [];
};

Projektor.modules.add = (zone, module) => {
  if (typeof Projektor.modules[zone] === 'undefined') {
    throw new Meteor.Error('Projektor.modules.add.noZone',
      `There is no zone ${zone}, create it before adding modules to it`);
  }

  if (typeof Projektor.modules[zone] === 'function') {
    throw new Meteor.Error('Projektor.modules.add.reservedName',
      `This name is reserved to the ${zone}-function and no zone`);
  }

  const throwErrorIfInvalidModule = (moduleToCheck) => {
    if (!moduleToCheck.template || typeof moduleToCheck.template !== 'string') {
      throw new Meteor.Error('Projektor.modules.add.invalidModule',
        'This module is missing a valid "template" property');
    }
  };

  if (Array.isArray(module)) {
    const modules = module;
    lodash.forEach(modules, (singleModule) => {
      throwErrorIfInvalidModule(singleModule);
      Projektor.modules[zone].push(singleModule);
    });
  } else {
    throwErrorIfInvalidModule(module);
    Projektor.modules[zone].push(module);
  }
};

Projektor.modules.getModulesFromZone = (zone) => {
  return Projektor.modules[zone];
};
