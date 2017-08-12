/**
* Add new field to a collection
* @param {Object} field
* @param {string} field.name
* @param {Object} field.schema
*/
Mongo.Collection.prototype.addField = function(field) {
  const collection = this;
  const fieldSchema = {};

  fieldSchema[field.name] = field.schema;
  collection.attachSchema(fieldSchema);
};
