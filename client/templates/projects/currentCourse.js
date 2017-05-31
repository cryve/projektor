import { excel } from '/lib/methods.js';
import { Meteor } from 'meteor/meteor';
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import { courseOwnerSchema } from '/lib/collections/schemas.js';
import { Template } from 'meteor/templating';
import { insertEmptyCourseDraft, leaveCourse } from '/lib/methods.js';
import { setDraftIdInProfile, createMassProjects, setSelfEnter, deleteAllProjects, addSupervisorToCourse } from '/lib/methods.js';
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
    this.subscribe('singleCourse', FlowRouter.getParam('courseId'));
    this.subscribe('courseProjects', FlowRouter.getParam('courseId'));
    this.subscribe('singleUserCourseDraft', FlowRouter.getParam('courseId'));
  });
  this.editActive = new ReactiveVar(false);
  TemplateVar.set('createLink', false);
  //this.createLink = new ReactiveVar(false);
  this.addSupervisor = new ReactiveVar(false);
  this.selfEntering = new ReactiveVar(false);
  this.deadline = new ReactiveVar(false);
  XlsFiles.remove({userId:FlowRouter.getParam('courseId')});
  Session.set('previousRoute', FlowRouter.getRouteName());
  Session.set('currentCourse', FlowRouter.getParam('courseId'));
});

Template.currentCourse.helpers({
  canShow() {
    const user = Meteor.user();
    if(!user) {
      return false;
    }
    const courseId = FlowRouter.getParam("courseId");
    if(courseId) {
      const course = Courses.findOne(courseId);
      if(!course) {
        return false;
      }
      return true;
      // return lodash.find(user.profile.drafts, function(userDraft) {
      //   return userDraft.draftId === draftId;
    };
    return false;
  },
  course() {
    return Courses.findOne(FlowRouter.getParam('courseId'));
  },
  editActive () {
    return Template.instance().editActive.get();
  },
  createLink () {
    return TemplateVar.get('createLink');
    //return Template.instance().createLink.get();
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
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    const ownersAsSupervisors = [];
    course && lodash.forEach(course.owner, function(ownerId) {
      const owner = Meteor.users.findOne(ownerId);
      ownersAsSupervisors.push({ userId: owner._id, role: owner.profile.title });
    });
    return Projects.find({courseId:course._id, supervisors: { $in: ownersAsSupervisors },
    }, { sort: { createdAt: -1 } }, { fields: Projects.memberFields });
  },
  getCollection() {
    return Courses;
  },
  courseOwnerSchema() {
    return courseOwnerSchema;
  },
  suggestedUsers(settings) {
    const users = Meteor.users.find(settings.hash.role ? { 'profile.role': settings.hash.role } : {});
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
      const owner = Meteor.users.findOne(ownerId);
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
    event.preventDefault();
    Modal.show('deleteAllCourseProjectsModal', {
      courseId: this._id,
    });
  },
  'click #btn-edit-course' (event) {
    event.preventDefault();
    Modal.show('editCourse', {
      courseId: this._id,
    });
  },
  'click #btn-leave-course' (event) {
    event.preventDefault();
    Modal.show('leaveCourseModal', {
      courseId: this._id,
    });
  },
  'click .create-mass-course-projects-btn' (event) {
    event.preventDefault();
    Modal.show('createMassProjectsModal', {
      courseId: this._id,
    });
  },
  'click #btn-delete-course' (event) {
    Modal.show('deleteCourseModal', {
      docId: this._id,
      docTitle: this.courseName,
    });
  },
  'click .btn-edit-deadline' (event) {
    event.preventDefault();
    if(Template.instance().deadline.get()){
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
      buttonEvent: this.selfEnter,
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
    event.preventDefault();
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
      draftId = insertEmptyCourseDraft.call({
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
      setDraftIdInProfile.call({
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
  'click #excel-button' (event){
    event.preventDefault();
    XlsFiles.remove({userId:this._id});
    Meteor.call(
    'excel',{
      courseId: this._id,
      },
    );
    TemplateVar.set('createLink', true);
  },

});

Template.file.onCreated (function fileLinkOnCreated() {
  this.subscribe('files.xlsFiles.all');
});
Template.file.helpers({
  fileLink:function(){
    var file = XlsFiles.findOne({userId:this._id}, { sort: { createdAt: -1 } });
    if(file && file._id){
      if(file._id != Session.get('fileId')){
        window.location = file.link();
        TemplateVar.setTo('.createLink', 'createLink' ,  false);
        Session.set('fileId', file._id);
      }
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
    deleteAllProjects.call({
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
    createMassProjects.call({
      courseId: this.courseId,
      text: document.getElementById('myTextarea').value,
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
      FlowRouter.go('courses');
      toastr.success('Kurs erfolgreich verlassen!');
      Modal.hide();
    });
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
          FlowRouter.go("courses");
        }
    });
  },
});

Template.editCourse.onCreated(function editModalOnCreated(){
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
  this.editActive = new ReactiveVar(true);
  this.autorun(() => {
    if(!Template.instance().editActive.get()){
      toastr.success('Kursdaten wurden erfolgreich Aktualisiert!');
      Modal.hide();
    }
  });
});

Template.editCourse.helpers({
  getCollection(){
    return Courses;
  },
  currentDoc(){
    return Courses.findOne(this.courseId);
  },
});
