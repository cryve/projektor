import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
export const Courses = new Mongo.Collection('courses');

if(Meteor.isServer) {
  Meteor.publish("courses", function coursePublication() {
    return Courses.find({});
  });
  Meteor.publish("singleCourse", function singleCoursePublication(courseId) {
    return Courses.find(courseId);
  });
  Meteor.publish("courseCard", function courseCardPublication(courseId) {
    return Courses.find({_id: courseId},{
      fields:{
        _id:1,
        courseName:1,
        courseSemester:1,
        studyCourse:1,
        courseKey:1
      }
    });
  });
  FindFromPublication.publish("userCourses", function coursePublication(){
    return Courses.find({owner: this.userId},{
      fields:{
        _id:1,
        owner:1
      }
    });
  });
}

Courses.attachSchema(new SimpleSchema({
  courseSemester: {
    type: String,
  },
  courseName: {
    type: String,
    max: 15,
  },
  owner: {
    type: Array,
    autoValue: function() {
      if(this.isInsert) {
        console.log(this)
        return [this.userId];
      }
    }
  },
  "owner.$":{
    type:String,
    regEx: SimpleSchema.RegEx.Id,
  },
  studyCourse: {
    type: String,
    max: 200
  },
  courseKey: {
    type: String,
  },
  selfEnter: {
    type: Boolean,
    autoValue: function() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  deadline: {
    type: Date,
    optional: true
  },
}));

Courses.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
