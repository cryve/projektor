import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { studiesSchema } from './schemas.js';

export const Studies = new Mongo.Collection('studies');
Studies.attachSchema(studiesSchema);

if (Meteor.isServer) {
  Meteor.publish('studies', function studiesPublication() {
    return Studies.find();
  });
  Meteor.publish('singleStudyInfo', function singleStudyInfoPublication(userId) {
    const user = Meteor.users.findOne(userId);
    const studyInfo = Studies.find({ $and: [
      { studyCourseId: user.profile.studyCourseId },
      { departmentId: user.profile.departmentId },
      { facultyId: user.profile.facultyId },
    ] });
    return studyInfo;
  });
}

Studies.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
