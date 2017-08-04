import { Meteor } from 'meteor/meteor';
import lodash from 'lodash';

/**
 * @summary Template modules let you insert templates in specific zones in the app's layout.
 * @locus Anywhere
 * @namespace Projektor.modules
 */
Projektor.modules = {};

const throwErrorIfReservedZoneName = (functionName, zoneName, errorMessageAppendix) => {
  if (typeof Projektor.modules[zoneName] === 'function') {
    throw new Meteor.Error(`Projektor.modules.${functionName}.reservedName`,
      `This name is reserved to the ${zoneName}-function. ${errorMessageAppendix}`);
  }
};

/**
* @summary Creates a new template zone
* @locus Anywhere
* @param {string} zone The name of the new zone, should be prefixed with package-name (like "my-package.my-zone") to avoid naming conflicts
*/
Projektor.modules.createZone = (zone) => {
  if (!zone || typeof zone !== 'string') {
    throw new Meteor.Error('Projektor.modules.createZone.invalidName',
      'Zone name must be of type String');
  }

  throwErrorIfReservedZoneName('createZone', zone, 'Please choose a different name, e.g. prefix your package name');

  if (Array.isArray(Projektor.modules[zone])) {
    throw new Meteor.Error('Projektor.modules.createZone.alreadyExists',
    `Zone "${zone}" already exists, please choose a different name, e.g. prefix your package name`);
  }

  Projektor.modules[zone] = [];
};

/**
* @summary Adds a template module to a template zone
* @locus Anywhere
* @param {string} zone The name of an existing zone add to
* @param {Object} module The module object
* @param {string} module.template The name of the template to add
*/
Projektor.modules.add = (zone, module) => {
  if (typeof Projektor.modules[zone] === 'undefined') {
    throw new Meteor.Error('Projektor.modules.add.noZone',
      `There is no zone ${zone}, create it before adding modules to it`);
  }

  throwErrorIfReservedZoneName('add', zone);

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

/**
 * @summary Retrieve an array containing all modules for a zone
 * @locus Anywhere
 * @param {string} zone - The name of the zone
 * @returns {Object[]} Returns a sorted array of the zone's modules
 */
Projektor.modules.getModulesFromZone = (zone) => {
  throwErrorIfReservedZoneName('getModulesFromZone', zone);

  return Projektor.modules[zone];
};

/**
 * @summary Removes a module from a zone
  * @locus Anywhere
 * @param {string} zone - The name of the zone
 * @param {string} template - The name of the template to remove
 */
Projektor.modules.remove = (zone, template) => {
  throwErrorIfReservedZoneName('remove', zone);

  Projektor.modules[zone] = lodash.reject(Projektor.modules[zone], (module) => {
    return module.template === template;
  });
};
