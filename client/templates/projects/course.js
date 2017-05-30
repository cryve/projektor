import { Meteor } from 'meteor/meteor';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Template } from 'meteor/templating';
import lodash from 'lodash';
import toastr from 'toastr';
import './course.html';

Template.course.onCreated (function courseOnCreated() {
  this.subscribe("userCourses");
  this.editActive = new ReactiveVar(false);
});

Template.course.helpers({
  getCollection() {
    return Courses;
  },
  currentDoc(){
    return Courses.findOne(this.courseId);
  },
  courses(){
    return Courses.findFromPublication('userCourses');
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
