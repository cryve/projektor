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
* @param {string} zone The name of the new zone, should be prefixed with
* package-name (like "my-package.my-zone") to avoid naming conflicts
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
* @param {Object|Object[]} module The module object or an array of module objects
* @param {string} module.template The name of the template to add
* @param {number} [module.position] The position of the template inside the zone
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
    if (moduleToCheck.position && typeof moduleToCheck.position !== 'number') {
      throw new Meteor.Error('Projektor.modules.add.invalidModule',
        'The position of the module must be of type "number"');
    }
  };

  const throwErrorIfPositionOccupied = (moduleToCheck) => {
    const moduleWithSamePosition = lodash.find(Projektor.modules[zone],
      lodash.matchesProperty('position', moduleToCheck.position));
    if (moduleWithSamePosition) {
      throw new Meteor.Error('Projektor.modules.add.positionOccupied',
        `This position inside the zone ${zone} is already taken by the module
          with template ${moduleWithSamePosition.template}`);
    }
  };

  if (Array.isArray(module)) {
    const modules = module;
    lodash.forEach(modules, (singleModule) => {
      throwErrorIfInvalidModule(singleModule);
      throwErrorIfPositionOccupied(singleModule);
      Projektor.modules[zone].push(singleModule);
    });
  } else {
    throwErrorIfInvalidModule(module);
    throwErrorIfPositionOccupied(module);
    Projektor.modules[zone].push(module);
  }
};

/**
 * Retrieve an array containing all modules for a zone sorted by their
 * position number (increasing). Modules without specified position are appended
 * last in the order they were added.
 * @summary Retrieve an array containing all modules for a zone
 * @locus Anywhere
 * @param {string} zone - The name of the zone
 * @returns {Object[]} Returns a sorted array of the zone's modules
 */
Projektor.modules.getModulesFromZone = (zone) => {
  throwErrorIfReservedZoneName('getModulesFromZone', zone);
  return lodash.sortBy(Projektor.modules[zone], 'position');
};

/**
 * @summary Removes a module from a zone
  * @locus Anywhere
 * @param {string} zone - The name of the zone
 * @param {string} template - The name of the template to remove
 */
Projektor.modules.remove = (zone, template) => {
  throwErrorIfReservedZoneName('remove', zone);

  Projektor.modules[zone] = lodash.reject(Projektor.modules[zone],
    module => module.template === template);
};
