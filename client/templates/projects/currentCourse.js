import { Meteor } from 'meteor/meteor';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import { courseOwnerSchema } from '/lib/collections/schemas.js';
import { Template } from 'meteor/templating';
import { insertEmptyCourseDraft, leaveCourse, deleteCourse } from '/lib/methods.js';
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
  this.projectSubReady = new ReactiveVar();
  this.subscribe('userSupervisor');
  this.autorun(() => {
    let projectSubHandle;
    projectSubHandle = this.subscribe('singleCourse', FlowRouter.getParam('courseId'));
    this.subscribe('courseProjects', FlowRouter.getParam('courseId'));
    this.subscribe('singleUserCourseDraft', FlowRouter.getParam('courseId'));
    this.projectSubReady.set(projectSubHandle.ready());
  });
  this.editActive = new ReactiveVar(false);
  this.addSupervisor = new ReactiveVar(false);
  this.selfEntering = new ReactiveVar(false);
  this.deadline = new ReactiveVar(false);
  Session.set('previousRoute', FlowRouter.getRouteName());
  Session.set('currentCourse', FlowRouter.getParam('courseId'));
});

Template.currentCourse.helpers({
  authInProgress() {
    const projectSubReady = Template.instance().projectSubReady.get();
    return Meteor.loggingIn() || !projectSubReady;
  },
  canShow() {
    if (!Meteor.user()) {
      return false;
    }

    const courseId = FlowRouter.getParam('courseId');
    const course = Courses.findOne(courseId);

    if(!course) {
      return false;
    }
    const courseOwnersAndMembers = lodash.concat(course.owner, course.member);
    if (!lodash.includes(courseOwnersAndMembers, Meteor.userId())) {
      return false;
    }

    return true;
  },
  course() {
    return Courses.findOne(FlowRouter.getParam('courseId'));
  },
  editActive () {
    return Template.instance().editActive.get();
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
      if(owner){
        ownersAsSupervisors.push({ userId: owner._id, role: owner.profile.title });
      }
    });
    return Projects.find({courseId:course._id, supervisors: { $in: ownersAsSupervisors },
    }, { sort: { createdAt: -1 } }, { fields: Projects.memberFields });
  },
  getCollection() {
    return Courses;
  },
  checkUser() {
    const course = Courses.findOne(FlowRouter.getParam('courseId'));
    if(lodash.includes(course.owner, Meteor.userId())){
      return true;
    }
  },
  courseOwnerSchema() {
    return courseOwnerSchema;
  },
  //helper zum erstellen eines Arrays in denen alle Professoren aufgelistet werden, außer denen die schon im Kurs als Betreuer eingetragen sind.
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
  // Helper zum gucken ob ein Kursprojekt vorhanden ist
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

  // es wird geguckt ob nur noch ein Betreuer im Kurs ist
  isLastOwner() {
    const course = Courses.findOne(this._id);
    if (course && course.owner && course.owner.length > 1) {
      return false;
    }
    return true;
  },
  // Helper zum gucken ob der eingeloggte Nutzer ein Kurspojekt draft noch offen hat
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
  'click #btn-show-course-members'(event){
    FlowRouter.go('courseMembers', { courseId: this._id, courseName: this.courseName });
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
  //Aktivieren/deaktivieren der Selbsteinschreibung
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
    //hat der Nutzer ein Kurs draft Projekt noch offen?
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
      //erstellen eines neuen Kurs draft Projekt
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
      //id des draft Documents wird in das Document des erstellers gespeichert
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
});

Template.userGrading.onCreated(function userGradingOnCreated(){
  this.autorun(() => {
    this.subscribe('projects.user.grading', FlowRouter.getParam('courseId'));
  });
})

Template.userGrading.helpers({
  //Anzeigen der Benotung des Studenten
  userGrade(){
    console.log(FlowRouter.getParam('courseId'));
    const projects = Projects.find({ courseId: FlowRouter.getParam('courseId'), team: { $elemMatch: { userId: Meteor.userId() } } })
    var grading = "-";
    if(projects){
      projects.forEach(function(project) {
        lodash.forEach(project.team, function(member){
          if (member.userId == Meteor.userId()){
            grading = member.grading;
            return false;
          }
        });

      });
    }
    return grading;
  },
})

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
  //Button zum löschen aller Projekte
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
    leaveCourse.call({
      courseId: this.courseId,
    }, (err, res) => {
      if (err) {
        toastr.error('Es ist leider ein Fehler aufgetreten!');
      }
      FlowRouter.go('courses');
      toastr.success('Kurs erfolgreich verlassen!');
      Modal.hide();
    });
  },
});

Template.deleteCourseModal.events({
  //Button zum Löschen des Kurses
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
