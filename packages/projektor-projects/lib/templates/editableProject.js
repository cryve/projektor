import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Projects } from 'meteor/projektor:projects';
import Users from 'meteor/projektor:users';
import toastr from 'toastr';
import lodash from 'lodash';
import './editableProject.html';

Template.registerHelper('getMethodString', (projectsWins) => 'Nonono');

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
  this.autorun(() => {
    let projectSubHandle;
    if (FlowRouter.getParam('projectId')) {
      projectSubHandle = this.subscribe('projects.details.single', FlowRouter.getParam('projectId'));
    }
    this.projectSubReady.set(projectSubHandle && projectSubHandle.ready());
  });
});

Template.editableProject.helpers({
  authInProgress() {
    const projectSubReady = Template.instance().projectSubReady.get();
    return Meteor.loggingIn() || !projectSubReady;
  },
  canShow() {
    if (!Meteor.user()) {
      return false;
    }
    const projectId = FlowRouter.getParam('projectId');
    const project = Projects.findOne(projectId);
    if (!project) {
      return false;
    } else if (project.state.draft && projectId !== Meteor.user().profile.draftId) {
      return false;
    }
    return true;
  },
  project() {
    const projectId = FlowRouter.getParam('projectId');
    return Projects.findOne(projectId);
  },
  memberCheck() {
    let check = true;
    lodash.forEach(this.team, function(member) {
      if (member.userId === Meteor.userId()) {
        check = false;
        return false;
      }
    });
    return check;
  },
  supervisorCheck() {
    let check = true;
    lodash.forEach(this.supervisors, function(supervisor) {
      if (supervisor.userId === Meteor.userId()) {
        check = false;
        return false;
      }
    });
    return check;
  },
  selectedMediumId() {
    return Session.get('selectedMediumId');
  },
  previousRoute() {
    return Session.get('previousRoute');
  },
  slot() {
    return Session.get('slot');
  },
  getCollection() {
    return Projects;
  },
});

Template.editableProject.events({
  'click #btn-publish-draft' (event) {
    Projects.makePublic.call({
      projectId: this._id,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        toastr.success('Projekt erfolgreich erstellt!');
      }
    });
    Users.unsetDraftId.call({}, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    FlowRouter.go('projectDetails', { projectId: this._id, projectTitle: encodeURIComponent(this.title) });
    Session.set('selectedMediumId', 'null');
  },
  'click #btn-delete-draft' (event) {
    Projects.delete.call({
      projectId: this._id,
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    Users.unsetDraftId.call({}, (err, res) => {
      if (err) {
        alert(err);
      }
    });
    FlowRouter.go('landingPage');
    Session.set('selectedMediumId', 'null');
  },
  'click #btn-show-delete-project'(event) {
    Modal.show('deleteProjectModal', {
      docId: this._id,
      docTitle: this.title,
    });
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
    Projects.delete.call({
      projectId: this.docId,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        FlowRouter.go('landingPage');
        Session.set('selectedMediumId', 'null');
        Modal.hide();
      }
    });
  },
});
