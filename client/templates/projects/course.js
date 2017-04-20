import { Meteor } from 'meteor/meteor'
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Template } from 'meteor/templating';
import lodash from 'lodash';
import {deleteCourse} from "/lib/methods.js";
import toastr from 'toastr';
import './course.html';


Template.course.onCreated (function courseOnCreated() {
  toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-left",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
  }
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
  countCourseProjects(courseId){
    var count = Projects.find({courseId: courseId, supervisors:{$elemMatch:{userId: Meteor.userId()}}}).count();
    return count;
  },
  checkCourseOwner(courseId){
    if (Courses.findOne({_id: courseId, owner: Meteor.userId()})){
      return true;
    }

  },
  countStudents(courseId){
    var students = [];
    const courseProjects = Projects.find({courseId:courseId, supervisors:{$elemMatch:{userId: Meteor.userId()}}})
    courseProjects.forEach(function(project) {
      if(project.team){
        lodash.forEach(project.team, function(value) {
          var user = Meteor.users.findOne(value.userId)
          if((!lodash.includes(students, user._id)) && (user.profile.role == "Student") ){
            students.push(user._id)
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
    var course = Courses.findOne(courseId);
    Modal.show("deleteCourseModal", {
      docId: courseId,
      docTitle: course.courseName,
    });
  },
  "click .btn-edit-course" (event) {
    var result = event.currentTarget;
    var courseId = result.dataset.id;
    Template.instance().editActive.set(false);
    Template.instance().editCourse.set(courseId);
  },
});

Template.deleteCourseModal.events({
  "click #btn-delete"(event) {
    deleteCourse.call({
      courseId: this.docId,
      }, (err, res) => {
        if (err) {
          alert(err);
        } else {
          Command: toastr["success"]("Kurs wurde erfolgreich gelöscht!")
          Modal.hide();
        }
    });
  },
});
