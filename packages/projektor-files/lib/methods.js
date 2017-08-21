import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Images } from './collections/images.js';

Images.imageRemove = new ValidatedMethod({
  name: 'imageRemove',
  validate: new SimpleSchema({
    imageId: String,
  }).validator(),
  run({ imageId }) {
    // TODO: this method should be callable only from server
    Images.remove({ _id: imageId });
  },
});
