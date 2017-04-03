import { Meteor } from 'meteor/meteor'
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Template } from 'meteor/templating';
import lodash from 'lodash';
import {deleteCourse} from "/lib/methods.js";

import './course.html';


Template.course.onCreated (function courseOnCreated() {
  Meteor.subscribe("courses");
  Meteor.subscribe("projects");
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
  countCourseProjects(courseId, owner){
    var count = Projects.find({courseId: courseId},{supervisors:{$elemMatch:{userId: owner}}}).count();
    return count;
  },
  countStudents(courseId, owner){
    var students = [];
    const courseProjects = Projects.find({courseId:courseId}, {supervisors:{$elemMatch:{userId: owner}}})
    courseProjects.forEach(function(project) {
      if(project.team){
        lodash.forEach(project.team, function(value) {
          if((!lodash.includes(students, value.userId)) && (value.userId != owner)){
            students.push(value.userId)
          }
        });
      }
    });
    return students.length;
  },
  editActive () {
    return Template.instance().editActive.get();
  },
  editCourse () {
    return Template.instance().editCourse.get();
  },
  currentDoc(){
    var result = Template.instance().editCourse.get();
    //document.getElementById('idUpdate');
    if(result){
      var test = Courses.findOne(result);
      return test
    } else {
      Template.instance().editCourse.set(false);
    }

  }
});

Template.course.events({
  "click .btn-create-course" (event) {
    Template.instance().editCourse.set(false);
    Template.instance().editActive.set(true);
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
  },
  "click .btn-abort-course-editing" (event) {
    Template.instance().editCourse.set(false);
  },
  "click .btn-delete-course" (event) {
    var result = event.currentTarget;
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
    var result = event.currentTarget;
    var courseId = result.dataset.id;
    Template.instance().editActive.set(false);
    Template.instance().editCourse.set(courseId);
  },
});
