import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
export const Courses = new Mongo.Collection('courses');

if(Meteor.isServer) {
  Meteor.publish("courses", function projectsPublication() {
    return Courses.find();
  });
}

Courses.attachSchema(new SimpleSchema({
  courseSemester: {
    type: String,
  },
  courseName: {
    type: String,
    max: 40,
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.isInsert) {
        return this.userId;
      } else if (this.isUpsert) {
        return {$setOnInsert: this.userId};
      } else {
        this.unset(); // Prevent user manipulation
      }
    },
  },
  studyCourse: {
    type: String,
    max: 200
  }
}));

Courses.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
