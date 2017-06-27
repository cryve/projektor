import { Meteor } from 'meteor/meteor';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Template } from 'meteor/templating';
import lodash from 'lodash';
import toastr from 'toastr';
import './course.html';
import { addCourseToCourseSchema } from '/lib/collections/schemas.js';
import { enterCourse } from '/lib/methods.js';

Template.course.onCreated (function courseOnCreated() {
  this.subscribe('courses');
  this.editActive = new ReactiveVar(false);

});

Template.course.helpers({
  courses(){
    console.log("keks");
    return Courses.find({$or:[{owner: Meteor.userId()},{member: Meteor.userId()}]});
  },
  checkIfCourse(){
    console.log("kuchen");
    if (Courses.findOne({$or:[{owner: Meteor.userId()},{member: Meteor.userId()}]})){
      console.log("Muffin");
      return true;
    }
  },
  getCollection() {
    return Courses;
  },
  currentDoc(){
    return Courses.find();
  },
  editActive () {
    return Template.instance().editActive.get();
  },
});

Template.course.events({
  "click .btn-create-course" (event) {
    Template.instance().editActive.set(true);
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
  },
  'click .btn-enter-course'(event) {
    event.preventDefault();
    console.log(this);
    Modal.show('enterCourseModal', {
      docId: this._id,
    });
  },
});

Template.enterCourseModal.onCreated(function() {
  toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: 'toast-top-left',
    preventDuplicates: false,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
  };
  this.addCourse = new ReactiveVar(true);
});

Template.enterCourseModal.helpers({
  addCourseToCourseSchema () {
    return addCourseToCourseSchema;
  },
  getCollection() {
    return Courses;
  },
  currentDoc(){
    return Courses.find();
  },
  suggestedCourses() {
    const courses = Courses.find();
    const courseList = [' '];
    Courses.find({$and:[{owner:{$not:Meteor.userId()}},{member: {$not:Meteor.userId()}}]}).forEach(function (course) {
      courseList.push({
        value: course._id,
        label: `${course.courseName} ${course.courseSemester} ${course.studyCourse}`,
      });
    });
    return courseList;
  },
  closeCourseModal(){
    if (!Template.instance().addCourse.get()){
      toastr.success('Projekt erfolgreich beigetreten!');
      Modal.hide();
    }
  }
});

Template.enterCourseModal.events({
  'click .btn-abort-course' (event) {
    Modal.hide();
  },
})
