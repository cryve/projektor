import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Images } from './images.js';

Images.imageRemove = new ValidatedMethod({
  name: 'imageRemove',
  validate: new SimpleSchema({
    imageId: String,
  }).validator(),
  run({ imageId }) {
    const image = Images.findOne(imageId);
    // TODO: Authorization check, allowed only with editInfos permission for project
    // if (image.userId != Meteor.userId()){
    //   throw new Meteor.Error("imageRemove.unauthorized",
    //   "Cannot delete Image from this Project");
    // }
    Images.remove({ _id: imageId });
  },
});
