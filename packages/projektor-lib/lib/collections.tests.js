import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import lodash from 'lodash';
import SimpleSchema from 'simpl-schema';

describe('Projektor Collection API', function() {
  let TestCollection = {};
  before(function() {
    TestCollection = new Mongo.Collection('testCollection');
    TestCollection.attachSchema(new SimpleSchema({}));
  });
  it('should give every collection addField method', function() {
    assert.isFunction(TestCollection.addField);
  });
  it('should add new field to collection', function() {
    const field = {
      name: "testField",
      schema: {
        type: 'String',
        optional: true,
      }
    }
    TestCollection.addField(field);

    testFieldSchema = new SimpleSchema({
      testField: field.schema,
    });
    assert.deepEqual(TestCollection.simpleSchema().pick(field.name)._schema, testFieldSchema._schema);
  });
});
