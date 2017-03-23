import { Meteor } from 'meteor/meteor'
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Courses } from '/lib/collections/courses.js';
import { Template } from 'meteor/templating';

import {excel} from "/lib/methods.js";
import {deleteCourse} from "/lib/methods.js";

import './course.html';


Template.course.onCreated (function courseOnCreated() {
  Meteor.subscribe('files.xlsFiles.all');
  Meteor.subscribe("courses");
  this.editActive = new ReactiveVar(false);
  this.editCourse = new ReactiveVar(false);
});

Template.course.helpers({
  getCollection(){
    return Courses;
  },
  courses(){
    return Courses.find({});
  },
  editActive () {
    return Template.instance().editActive.get();
  },
  editCourse () {
    return Template.instance().editCourse.get();
  },
  currentDoc(){
    var result = document.getElementById('idUpdate');
    if(result && result.dataset && result.dataset.id){
      var courseId = result.dataset.id
      return Courses.findOne(courseId);
    } else {
      Template.instance().editCourse.set(false);
    }

  }
});

Template.course.events({

  "click #excel-button" (event){

   Meteor.call('excel', {
      test1: '12345',
      test2: 'This is a todo item.',
      test3: 'cookies.'
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {

      }
    });
  },
  "click .btn-create-course" (event) {
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
  "click .btn-abort-course-editing" (event) {
    Template.instance().editCourse.set(false);
  },
  "click .btn-delete-course" (event) {
    var result = document.getElementById('idResult');
    var courseId = result.dataset.id
    deleteCourse.call({
      courseId: courseId
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  },
  "click .btn-edit-course" (event) {
    Template.instance().editCourse.set(true);
  },
});

Template.fileLink.onCreated (function fileLinkOnCreated() {
  Meteor.subscribe('files.xlsFiles.all');

});
Template.fileLink.helpers({
  file: function () {
    return XlsFiles.findOne();
  }

});
