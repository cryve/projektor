import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import lodash from 'lodash';
import SimpleSchema from 'simpl-schema';

describe('Projektor Collection API', function() {
  let TestCollection;
  before(function() {
    TestCollection = new Mongo.Collection(null);
    TestCollection.attachSchema(new SimpleSchema({
      existingField: String,
    }, {replace: true}));
  });
  it('should give every collection addField method', function() {
    assert.isFunction(TestCollection.addField);
  });
  it('should add new field to collection', function() {
    const field = {
      name: 'testField',
      schema: {
        type: 'String',
        optional: true,
      },
    }
    TestCollection.addField(field);

    testFieldSchema = new SimpleSchema({
      testField: field.schema,
    });
    assert.deepEqual(['existingField', 'testField'], TestCollection.simpleSchema()._schemaKeys);
    assert.deepEqual(TestCollection.simpleSchema().pick(field.name)._schema, testFieldSchema._schema);
  });
  it('should not add field with existing field name', function() {
    const existingField = {
      name: 'existingField',
      schema: String,
    };
    assert.throws(() => {
      TestCollection.addField(existingField);
    }, Meteor.Error, 'null.addField.alreadyExists');
  });
});
