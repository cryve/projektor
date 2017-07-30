import { Meteor } from 'meteor/meteor';
import lodash from 'lodash';

Projektor.modules = {};

Projektor.modules.create = (zone) => {
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
  if(typeof Projektor.modules[zone] === 'function') {
    throw new Meteor.Error('Projektor.modules.add.reservedName',
      `This name is reserved to the ${zone}-function and no zone`);
  }

  if (Array.isArray(module)) {
    const modules = module;
    lodash.forEach(modules, (singleModule) => {
      Projektor.modules[zone].push(singleModule);
    });
  } else {
    Projektor.modules[zone].push(module);
  }
};
