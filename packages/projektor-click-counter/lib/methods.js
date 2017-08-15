import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Projects } from 'meteor/projektor:projects';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';

export const incrementClickCount = new ValidatedMethod({
  name: 'click-counter.incrementClickCount',
  validate: new SimpleSchema({
    projectId: {
      type: 'String',
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ projectId }) {
    const project = Projects.findOne(projectId);
    let currentClickCount = project['click-counter_clickCount'];
    if (!currentClickCount) {
      currentClickCount = 0;
    }
    const newClickCount = currentClickCount + 1;

    Projects.update(projectId, { $set: { 'click-counter_clickCount': newClickCount }});
  }
});
