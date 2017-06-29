import { Meteor } from 'meteor/meteor';
import { XlsFiles } from 'meteor/projektor:courses';
import { Courses } from 'meteor/projektor:courses';
import { Projects } from 'meteor/projektor:projects';
import { Drafts } from 'meteor/projektor:projects';
import { courseOwnerSchema } from '/lib/collections/schemas.js';
import { Template } from 'meteor/templating';
import { insertNewCourseProjectDraft, leaveCourse, createAndInsertCourseSpreadsheet } from '/lib/methods.js';
import { insertMultipleNewCourseProjects, setSelfEnter, deleteAllProjectsInCourse, addCourseOwner } from '/lib/methods.js';
import Users from 'meteor/projektor:users';
import lodash from 'lodash';
import toastr from 'toastr';

Template.currentCourse.onCreated(function courseOnCreated() {
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
  this.subscribe('files.xlsFiles.all');
  this.subscribe('userSupervisor');
  this.autorun(() => {
    this.subscribe('courses', FlowRouter.getParam('courseId'));
    this.subscribe('courseProjects', FlowRouter.getParam('courseId'));
    this.subscribe('singleUserCourseDraft', FlowRouter.getParam('courseId'));
  });
  this.editActive = new ReactiveVar(false);
  this.createLink = new ReactiveVar(false);
  this.addSupervisor = new ReactiveVar(false);
  this.selfEntering = new ReactiveVar(false);
  this.deadline = new ReactiveVar(false);
  Session.set('previousRoute', FlowRouter.getRouteName());
});

Template.currentCourse.helpers({
  course() {
    return Courses.findOne(FlowRouter.getParam('courseId'));
  },
  editActive () {
    return Template.instance().editActive.get();
  },
  createLink () {
    return Template.instance().createLink.get();
  },
  selfEntering() {
    return Template.instance().selfEntering.get();
  },
  addSupervisor () {
    return Template.instance().addSupervisor.get();
  },
  setDeadline() {
    return Template.instance().deadline.get();
  },
  courseProjects() {
    return Projects.findFromPublication('courseProjects');
  },
  getCollection() {
    return Courses;
  },
  courseOwnerSchema() {
    return courseOwnerSchema;
  },
  suggestedUsers(settings) {
    const users = Users.find(settings.hash.role ? { 'profile.role': settings.hash.role } : {});
    let userList = [' '];
    users.forEach(function (user) {
      if (user && user.profile) {
        userList.push({
          value: user._id,
          label: `${user.profile.firstname} ${user.profile.lastname}`,
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

  isCourseProject() {
    const ownersAsSupervisors = [];
    lodash.forEach(this.owner, function(ownerId) {
      const owner = Users.findOne(ownerId);
      if (owner) {
        ownersAsSupervisors.push({ userId: owner._id, role: owner.profile.title });
      }
    });
    const courseProjects = Projects.findOne({ courseId: this._id, supervisors: { $in: ownersAsSupervisors } });
    if (courseProjects) {
      return false;
    }
    return true;
  },

  isLastOwner() {
    const course = Courses.findOne(this._id);
    if (course && course.owner && course.owner.length > 1) {
      return false;
    }
    return true;
  },

  checkIfDraft() {
    let check = false;
    const currentDoc = this;
    if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts) {
      lodash.forEach(Meteor.user().profile.drafts, function(value) {
        if (value.draftId && (value.courseId == currentDoc._id)) {
          check = true;
          return false;
        }
      });
    }
    return check;
  },
});

Template.currentCourse.events({
  'click #btn-delete-course-projects' (event) {
    Modal.show('deleteAllCourseProjectsModal', {
      courseId: this._id,
    });
  },
  'click #btn-leave-course' (event) {
    Modal.show('leaveCourseModal', {
      courseId: this._id,
    });
  },
  'click .create-mass-course-projects-btn' (event) {
    Modal.show('createMassProjectsModal', {
      courseId: this._id,
    });
  },
  'click .btn-edit-deadline' (event) {
    event.preventDefault();
    if (Template.instance().deadline.get()) {
      Template.instance().deadline.set(false);
    } else {
      Template.instance().deadline.set(true);
    }
  },
  'click .btn-abort-editing' (event) {
    Template.instance().editActive.set(false);
    Template.instance().deadline.set(false);
  },
  'click .btn-abort-adding' (event) {
    Template.instance().addSupervisor.set(false);
  },
  'click .btn-add-supervisor' (event) {
    event.preventDefault();
    if (Template.instance().addSupervisor.get()) {
      Template.instance().addSupervisor.set(false);
    } else {
      Template.instance().addSupervisor.set(true);
    }
  },
  'click .btn-add-selfEntering' (event) {
    event.preventDefault();
    if (Template.instance().selfEntering.get()) {
      Template.instance().selfEntering.set(false);
    } else {
      Template.instance().selfEntering.set(true);
    }
  },
  'click .btn-toggle'(event) {
    event.stopPropagation();
    setSelfEnter.call({
      selfEnterAllowed: this.selfEnter,
      courseId: this._id,
    }, (err, res) => {
      if (err) {
        alert(err);
      }
      if (this.selfEnter) {
        toastr.success('Selbsteinschreibung wurde deaktiviert!');
      } else {
        toastr.success('Selbsteinschreibung wurde aktiviert!');
      }
    });
  },
  'click .create-course-project-btn' (event) {
    Session.set('currentCourse', this._id);
    // Go to a not finished draft if exists, else go to new draft
    let lastDraft;
    const currentDoc = this;
    if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts) {
      lodash.forEach(Meteor.user().profile.drafts, function(value) {
        if (value.draftId && (value.courseId == currentDoc._id)) {
          lastDraft = Drafts.findOne(value.draftId);
        }
      });
    }
    let draftId;
    Session.set('result', 'null');
    if (lastDraft && lastDraft._id) {
      draftId = lastDraft._id;
    } else {
      draftId = insertNewCourseProjectDraft.call({
        courseId: this._id,
      }, (err, res) => {
        if (err) {
          if (err.error == 'drafts.insertNew.unauthorized') {
            FlowRouter.go('loginPage');
            alert('Bitte melde dich an, um ein neues Projekt zu erstellen.');
          } else {
            alert(err);
          }
        }
      });
      Users.setDraftIdInProfile.call({
        userId: Meteor.userId(),
        draftId,
        courseId: this._id }, (err, res) => {
        if (err) {
          alert(err);
        }
      });
    }
    FlowRouter.go('newProject', { draftId });
  },
  'click #excel-button' (event) {
    XlsFiles.remove({ userId: this._id });
    createAndInsertCourseSpreadsheet.call({
      courseId: this._id,
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    Template.instance().createLink.set(true);
  },

});

Template.file.onCreated(function fileLinkOnCreated() {
  this.autorun(() => {
    this.subscribe('files.xlsFiles.all');
  });
  this.createLink = new ReactiveVar(true);
});
Template.file.helpers({
  file () {
    return XlsFiles.findOne({ userId: this._id });
  },
  fileLink() {
    const file = XlsFiles.findOne({ userId: this._id });
    if (file && file._id) {
      const link = file.link();
      // var link = "https://projektor.mt.haw-hamburg.de/cdn/storage/XlsFiles/"+file._id+"/original/"+file._id+"?download=true"
      // var link = "http://localhost:3000/cdn/storage/XlsFiles/"+file._id+"/original/"+file._id+"?download=true"
      window.location = link;
      Template.instance().createLink.set(false);
    }
  },
});

Template.deleteAllCourseProjectsModal.onCreated(function deleteModalOnCreated() {
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
});

Template.deleteAllCourseProjectsModal.events({
  'click #btn-delete'(event) {
    deleteAllProjectsInCourse.call({
      courseId: this.courseId,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        toastr.success('Alle Projekte wurden erfolgreich gelöscht!');
        Modal.hide();
      }
    });
  },
});


Template.createMassProjectsModal.onCreated(function deleteModalOnCreated() {
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
});


Template.createMassProjectsModal.events({
  'click #create-mass-course-projects-btn'(event) {
    const titlesInput = document.getElementById('myTextarea').value;
    const titles = titlesInput.split('\n');
    insertMultipleNewCourseProjects.call({
      courseId: this.courseId,
      courseProjectTitles: titles,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        toastr.success('Alle Projekte wurden erfolgreich erstellt!');
        Modal.hide();
      }
    });
  },
});

Template.leaveCourseModal.events({
  'click #btn-leave-course-modal'(event) {
    console.log(this.selfEnter);
    leaveCourse.call({
      courseId: this.courseId,
    }, (err, res) => {
      if (err) {
        alert(err);
      }
      FlowRouter.go('courses', { _id: Meteor.userId() });
      toastr.success('Kurs erfolgreich verlassen!');
      Modal.hide();
    });
  },
});
