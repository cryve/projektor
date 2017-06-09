import { Meteor } from 'meteor/meteor';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Template } from 'meteor/templating';
import lodash from 'lodash';
import toastr from 'toastr';
import './course.html';
import { addCourseToCourseSchema } from '/lib/collections/schemas.js';

Template.course.onCreated (function courseOnCreated() {
  this.subscribe('courses');
  this.editActive = new ReactiveVar(false);
});

Template.course.helpers({
  addCourseToCourseSchema () {
    return addCourseToCourseSchema;
  },
  suggestedCourses() {
    const courses = Courses.find({});
    const courseList = [' '];
    courses.forEach(function (course) {
      courseList.push({
        value: course._id,
        label: `${course.courseName} ${course.courseSemester} ${course.studyCourse}`,
      });
    });
    console.log(courseList)
    return courseList;
  },
  getCollection() {
    return Courses;
  },
  currentDoc(){
    return Courses.find({});
  },
  courses(){
    return Courses.find({owner: Meteor.userId()});
  },
  checkIfCourse(){
    if (Courses.findOne({owner: Meteor.userId()})){
      return true;
    }
  },
  editActive () {
    return Template.instance().editActive.get();
  }
});

Template.course.events({
  "click .btn-create-course" (event) {
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
});
