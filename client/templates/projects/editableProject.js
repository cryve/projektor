import { Template } from 'meteor/templating';
import { Projects } from 'meteor/projektor:projects';
import { Drafts } from '/lib/collections/drafts.js';
import { Courses } from '/lib/collections/courses.js';
import toastr from 'toastr';
import lodash from 'lodash';
import 'toastr/build/toastr.css';
import { publishDraft } from '/lib/methods.js';
import { deleteDraft } from '/lib/methods.js';
import { enterProject } from '/lib/methods.js';
import './editableProject.html';


Template.editableProject.onCreated(function() {
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
  this.subscribe('courses');
  this.autorun(() => {
    let projectSubHandle;
    if (FlowRouter.getParam('projectId')) {
      projectSubHandle = this.subscribe('projects.details.single', FlowRouter.getParam('projectId'));
    } else if (FlowRouter.getParam('draftId')) {
      projectSubHandle = this.subscribe('singleDraft', FlowRouter.getParam('draftId'));
    }
    this.projectSubReady.set(projectSubHandle.ready());
  });
});

Template.editableProject.helpers({
  authInProgress() {
    const projectSubReady = Template.instance().projectSubReady.get();
    return Meteor.loggingIn() || !projectSubReady;
  },
  canShow() {
    const user = Meteor.user();
    if (!user) {
      return false;
    }
    const draftId = FlowRouter.getParam('draftId');
    const projectId = FlowRouter.getParam('projectId');
    if (draftId) {
      const draft = Drafts.findOne(draftId);
      if (!draft) {
        return false;
      }
      return lodash.find(user.profile.drafts, function(userDraft) {
        return userDraft.draftId === draftId;
      });
    } else if (projectId) {
      const project = Projects.findOne(projectId);
      if (!project) {
        return false;
      }
      return true;
    }
    return false;
  },
  project() {
    console.log(FlowRouter.current());
    const draftId = FlowRouter.getParam('draftId');
    const projectId = FlowRouter.getParam('projectId');
    return Projects.findOne(projectId) || Drafts.findOne(draftId) || {};
  },
  enterProject() {
    const enterCheck = Courses.findOne(this.courseId);
    return enterCheck && enterCheck.selfEnter;
  },
  memberCheck() {
    let check = true;
    lodash.forEach(this.team, function(member) {
      if (member.userId == Meteor.userId()) {
        check = false;
        return false;
      }
    });
    return check;
  },
  supervisorCheck() {
    let check = true;
    lodash.forEach(this.supervisors, function(supervisor) {
      if (supervisor.userId == Meteor.userId()) {
        check = false;
        return false;
      }
    });
    return check;
  },
  result() {
    return Session.get('result');
  },
  previousRoute() {
    return Session.get('previousRoute');
  },
  slot() {
    return Session.get('slot');
  },
  courseProjekt() {
    const course = Courses.findOne(Session.get('currentCourse'));
    if (course) {
      return `${course.courseName} ${course.courseSemester}`;
    }
  },
  getCourseId() {
    return Session.get('currentCourse');
  },
  getCollection() {
    if (this.isNewProject) {
      return Drafts;
    }
    return Projects;
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
    return courseList;
  },
});

Template.editableProject.events({
  'click #btn-publish-draft' (event) {
    const newId = publishDraft.call({
      draftId: this._id,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        toastr.success('Projekt erfolgreich erstellt!');
      }
    });
    deleteDraft.call({
      draftId: this._id,
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    const course = Courses.findOne(this.courseId);
    if (course && this.supervisors.map(function(supervisor) { return supervisor.userId; }).indexOf('Mitarbeiter') && (Session.get('previousRoute') == 'course')) {
      FlowRouter.go('course', { courseId: this.courseId, courseName: encodeURIComponent(course.courseName) });
    } else {
      FlowRouter.go('projectDetails', { projectId: newId, projectTitle: encodeURIComponent(this.title) });
    }

    Session.set('result', 'null');
  },
  'click #btn-delete-draft' (event) {
    // Drafts.remove(this._id);
    deleteDraft.call({
      draftId: this._id,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        alert('Dein Entwurf wurde gelöscht!');
      }
    });
    const course = Courses.findOne(this.courseId);
    if (course && this.supervisors && this.supervisors[0] && (Meteor.userId() == this.supervisors[0].userId) && (Meteor.userId() == course.owner)) {
      FlowRouter.go('course', { _id: this.courseId, name: encodeURIComponent(course.courseName) });
    } else {
      FlowRouter.go('landingPage');
      Session.set('result', 'null');
    }
  },
  'click #btn-show-delete-project'(event) {
    Modal.show('deleteProjectModal', {
      docId: this._id,
      docTitle: this.title,
    });
  },
  'click #btn-enter-project'(event) {
    const projectCheck = Projects.findOne({ courseId: this.courseId, team: { $elemMatch: { userId: Meteor.userId() } } });
    if (projectCheck) {
      toastr.error('Du bist schon Mitglied in einem Projekt dieses Kurses!');
    } else {
      Modal.show('enterProjectModal', {
        docId: this._id,
        docTitle: this.title,
      });
    }
  },
  // "click .btn-edit-owner" (event) {
  //   Template.instance().editOwnerActive.set(true);
  // },
  // "click .btn-abort-owner-editing" (event) {
  //   Template.instance().editOwnerActive.set(false);
  // },
});
Template.deleteProjectModal.events({
  'click #btn-delete'(event) {
    Projects.deleteProject.call({
      projectId: this.docId,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        FlowRouter.go('landingPage');
        Session.set('result', 'null');
        Modal.hide();
      }
    });
  },
});

Template.enterProjectModal.onCreated(function() {
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

Template.enterProjectModal.events({

  'click #btn-enter'(event) {
    console.log(this);
    console.log(document.getElementById('modalInputKey').value);
    enterProject.call({
      projectId: this.docId,
      input: document.getElementById('modalInputKey').value,
    }, (err, res) => {
      if (err) {
        toastr.error('Falscher Einschreibeschlüssel!');
      } else {
          // FlowRouter.go("landingPage");
        Session.set('result', 'null');
        toastr.success('Erfolgreich beigetreten!');
        Modal.hide();
      }
    });
  },
});
