import { Projects } from 'meteor/projektor:projects';
import Users from 'meteor/projektor:users';
import lodash from 'lodash';

Template.navigationBar.onCreated(function navigationBarOnCreated() {
  this.autorun(() => {
    this.subscribe('singleUserDraft', Meteor.userId());
  });
});

Template.navigationBar.helpers({
  result() {
    return Session.get('result');
  },
  isDraftRendered() {
    const project = Projects.findOne(FlowRouter.getParam('projectId'));
    return project && project.state.draft;
  },
  checkIfDraft() {
    if (Meteor.user() && Meteor.user().profile.draftId) {
      return true;
    }
    return false;
  },
});

Template.navigationBar.events({
  'click .create-project-btn' (event) {
    Session.set('previousRoute', FlowRouter.getRouteName());
    let currentDraftId;
    // Go to a not finished draft if exists, else go to new draft
    if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts) {
      lodash.forEach(Meteor.user().profile.drafts, function(value) {
        if (value.draftId) {
          currentDraftId = value.draftId;
        }
      });
    }

    Session.set('result', 'null');
    if (!currentDraftId) {
      currentDraftId = Projects.insertNewDraft.call((err, res) => {
        if (err) {
          if (err.error === 'projects.insertNewDraft.notLoggedIn') {
            FlowRouter.go('loginPage');
          } else {
            alert(err);
          }
        }
      });

      if (Meteor.user()) {
        Users.setDraftIdInProfile.call({
          userId: Meteor.userId(),
          draftId: currentDraftId }, (err, res) => {
          if (err) {
            alert(err);
          }
        });
      }
    }
    if (Meteor.user()) {
      console.log(currentDraftId);

      FlowRouter.go('newProject', { projectId: currentDraftId });
      console.log(FlowRouter.current());
    }
  },
});
