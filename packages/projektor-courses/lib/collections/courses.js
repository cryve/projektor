import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { coursesCollectionSchema } from '../schemas.js';

export const Courses = new Mongo.Collection('courses');

if (Meteor.isServer) {
  Meteor.publish('courses', function coursePublication() {
    return Courses.find();
  });
  Meteor.publish('singleCourse', function singleCoursePublication(courseId) {
    return Courses.find(courseId);
  });
}

Courses.attachSchema(coursesCollectionSchema);

Courses.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
