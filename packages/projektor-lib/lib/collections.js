import lodash from 'lodash';

/**
* Add new field to a collection
* @param {Object} field
* @param {string} field.name
* @param {Object} field.schema
*/
Mongo.Collection.prototype.addField = function(field) {
  const collection = this;
  if (lodash.includes(collection.simpleSchema()._schemaKeys, field.name)) {
    throw new Meteor.Error(`${collection._name}.addField.alreadyExists`,
      `The field "${field.name}" already exists. Please choose another name, e.g. prefix with package name`);
  }
  const fieldSchema = {};

  fieldSchema[field.name] = field.schema;
  collection.attachSchema(fieldSchema);
};
