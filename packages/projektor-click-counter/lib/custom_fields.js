import SimpleSchema from 'simpl-schema';
import { Projects } from 'meteor/projektor:projects';

Projects.addField({
  name: 'click-counter_clickCount',
  schema: {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 0,
  },
});
