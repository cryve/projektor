import {excel} from "/lib/methods.js";
import { Meteor } from 'meteor/meteor'
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import {courseOwnerSchema} from '/lib/collections/schemas.js'
import { Template } from 'meteor/templating';
import { insertEmptyCourseDraft, leaveCourse } from "/lib/methods.js";
import { setDraftIdInProfile, createMassProjects, setSelfEnter, deleteAllProjects, addSupervisorToCourse} from "/lib/methods.js";
import lodash from 'lodash';
import toastr from 'toastr';

Template.currentCourse.onCreated (function courseOnCreated() {
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
  };
  this.autorun(() => {
    this.subscribe('files.xlsFiles.all');
  });
  this.autorun(() => {
    this.subscribe("courses");
  });
  this.autorun(() => {
    this.subscribe("projectsAll");
  });
  this.autorun(() => {
    this.subscribe("usersAll");
  });
  this.autorun(() => {
    this.subscribe("drafts");
  });
  this.editActive = new ReactiveVar(false);
  this.createLink = new ReactiveVar(false);
  this.addSupervisor = new ReactiveVar(false);
  this.selfEntering = new ReactiveVar(false);
  this.deadline = new ReactiveVar(false);
  Session.set("previousRoute", Router.current().route.getName());

});

Template.currentCourse.helpers({
  editActive () {
    return Template.instance().editActive.get();
  },
  createLink () {
    return Template.instance().createLink.get();
  },
  selfEntering(){
    return Template.instance().selfEntering.get();
  },
  addSupervisor () {
    return Template.instance().addSupervisor.get();
  },
  setDeadline(){
    return Template.instance().deadline.get();
  },
  projects(){
    let ownersAsSupervisors = [];
    lodash.forEach(this.owner, function(ownerId) {
      const owner = Meteor.users.findOne(ownerId);
      ownersAsSupervisors.push({userId: owner._id, role: owner.profile.title});
    });
    return Projects.find({courseId: this._id, supervisors: { $in: ownersAsSupervisors}}, { sort: { createdAt: -1 } });
  },
  getCollection() {
    return Courses;
  },
  courseOwnerSchema(){
    return courseOwnerSchema;
  },
  suggestedUsers(settings) {
    const users = Meteor.users.find(settings.hash.role ? { "profile.role" : settings.hash.role } : {});
    let userList = [" "];
    users.forEach(function (user){
      if (user && user.profile){
        userList.push({
          value: user._id,
          label: user.profile.firstname + " " + user.profile.lastname,
        });
      }
    });
    // remove users who are already in current group, but keep current user selection (firstOption)
    if (settings.hash.exclude) {
      settings.hash.exclude.forEach(function(userId) {
        if (userId !== settings.hash.firstOption) {
          userList = userList.filter(item => item.value !== userId);
        }
      });
    }
    return userList;
  },

  isCourseProject(){
    let ownersAsSupervisors = [];
    lodash.forEach(this.owner, function(ownerId) {
      const owner = Meteor.users.findOne(ownerId);
      ownersAsSupervisors.push({userId: owner._id, role: owner.profile.title});
    });
    const courseProjects = Projects.findOne({courseId:this._id, supervisors: { $in: ownersAsSupervisors } });
    if(courseProjects){
      return false;
    } else {
      return true;
    }
  },

  isLastOwner(){
    const course = Courses.findOne(this._id);
    if(course && course.owner && course.owner.length > 1){
      return false;
    } else {
      return true;
    }
  },

  checkCourseAccess(){
    Session.set("currentCourse", this._id);
    /*const courseId = this._id;
    var course = Courses.findOne({_id: this._id, owner: Meteor.userId()});
    console.log(course);
    if(course && (courseId == course._id)){
      console.log(courseId, course.owner)
      return true
    } else {
      Router.go("loginPage");
    }*/
    return true;
  },
  checkIfDraft(){
    var check = false;
    const currentDoc = this;
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && (value.courseId == currentDoc._id)){
          check = true
          return false;
        }
      });
    }
    return check;
  },
  isDraftRendered() {
    var check = false;
    const currentDoc = this;
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && (value.courseId == currentDoc._id)){
          check = Router.current().params._id === value.draftId;
          return false;
        }
      });
    }
    return check
  },
});

Template.currentCourse.events({
  "click #btn-delete-course-projects" (event) {
    Modal.show("deleteAllCourseProjectsModal", {
      courseId: this._id,
    });
  },
  "click #btn-leave-course" (event) {
    Modal.show("leaveCourseModal", {
      courseId: this._id,
    });
  },
  "click .create-mass-course-projects-btn" (event) {
    Modal.show("createMassProjectsModal", {
      courseId: this._id,
    });
  },
  "click .btn-edit-deadline" (event) {
    if(Template.instance().deadline.get()){
      Template.instance().deadline.set(false);
    } else {
      Template.instance().deadline.set(true);
    }
  },
  "click .btn-abort-editing" (event) {
    Template.instance().editActive.set(false);
    Template.instance().deadline.set(false);
  },
  "click .btn-abort-adding" (event) {
    Template.instance().addSupervisor.set(false);
  },
  "click .btn-add-supervisor" (event) {
    if(Template.instance().addSupervisor.get()){
      Template.instance().addSupervisor.set(false);
    } else {
      Template.instance().addSupervisor.set(true);
    }
  },
  "click .btn-add-selfEntering" (event) {
    if(Template.instance().selfEntering.get()){
      Template.instance().selfEntering.set(false);
    } else {
      Template.instance().selfEntering.set(true);
    }
  },
  "click .btn-toggle"(event){
    event.stopPropagation();
    setSelfEnter.call({
      buttonEvent: this.selfEnter,
      courseId: this._id
    }, (err, res) => {
      if (err) {
        alert(err);
      }
      if(this.selfEnter){
        Command: toastr["success"]("Selbsteinschreibung wurde deaktiviert!");
      } else {
        Command: toastr["success"]("Selbsteinschreibung wurde aktiviert!");
      }
    });
  },
  "click .create-course-project-btn" (event) {
    Session.set("currentCourse", this._id);
    // Go to a not finished draft if exists, else go to new draft
    var lastDraft
    const currentDoc = this;
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && (value.courseId == currentDoc._id)){
          lastDraft = Drafts.findOne(value.draftId);
        }
      });
    }
    let draftId;
    Session.set('result', "null");
    if (lastDraft && lastDraft._id) {
      draftId = lastDraft._id;
    } else {
      draftId = insertEmptyCourseDraft.call({
        courseId: this._id,
      }, (err, res) => {
        if (err) {
          if(err.error == "drafts.insertNew.unauthorized") {
            Router.go("loginPage");
            alert("Bitte melde dich an, um ein neues Projekt zu erstellen.");
          } else {
            alert(err);
          }
        }
      });
      setDraftIdInProfile.call({
        userId: Meteor.userId(),
        draftId: draftId,
        courseId: this._id}, (err, res) => {
        if (err) {
          alert(err);
        }
      });
    }
    Router.go("newProject", {_id: draftId});
  },
  "click #excel-button" (event){
     XlsFiles.remove({userId:this._id});
     Meteor.call(
      'excel',{
        courseId: this._id,
       },
      // function(error, result){
      //     if(error){
      //         console.error(error);
      //     } else {
      //
      //         console.info(typeof result);
      //
      //     }
      // }
    );

    Template.instance().createLink.set(true);
    console.log(Template.instance().createLink.get());
  },

});

Template.file.onCreated (function fileLinkOnCreated() {
  this.autorun(() => {
    this.subscribe('files.xlsFiles.all');
  });
  this.createLink = new ReactiveVar(true);

});
Template.file.helpers({
  file: function () {
    return XlsFiles.findOne({userId:this._id});
  },
  fileLink:function(){
    var file = XlsFiles.findOne({userId:this._id});
    if(file && file._id){
      var link = file.link();
      //var link = "https://projektor.mt.haw-hamburg.de/cdn/storage/XlsFiles/"+file._id+"/original/"+file._id+"?download=true"
      //var link = "http://localhost:3000/cdn/storage/XlsFiles/"+file._id+"/original/"+file._id+"?download=true"
      window.location = link;
      Template.instance().createLink.set(false);
    }
  }
});

Template.deleteAllCourseProjectsModal.onCreated(function deleteModalOnCreated(){
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
})

Template.deleteAllCourseProjectsModal.events({
  "click #btn-delete"(event) {
    deleteAllProjects.call({
      courseId: this.courseId,
      }, (err, res) => {
        if (err) {
          alert(err);
        } else {
          Command: toastr["success"]("Alle Projekte wurden erfolgreich gelöscht!");
          Modal.hide();
        }
    });
  },
});


Template.createMassProjectsModal.onCreated(function deleteModalOnCreated(){
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
})


Template.createMassProjectsModal.events({
  "click #create-mass-course-projects-btn"(event) {
    createMassProjects.call({
      courseId: this.courseId,
      text: document.getElementById("myTextarea").value,
      }, (err, res) => {
        if (err) {
          alert(err);
        } else {
          Command: toastr["success"]("Alle Projekte wurden erfolgreich erstellt!");
          Modal.hide();
        }
    });
  },
});

Template.leaveCourseModal.events({
  "click #btn-leave-course-modal"(event){
    console.log(this.selfEnter);
    leaveCourse.call({
      courseId: this.courseId,
    }, (err, res) => {
      if (err) {
        alert(err);
      }
      Router.go("courseLink", {_id: Meteor.userId()});
      Command: toastr["success"]("Kurs erfolgreich verlassen!");
      Modal.hide();
    });
  },
});
