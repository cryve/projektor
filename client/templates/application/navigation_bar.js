import { Projects } from 'meteor/projektor:projects';
import Users from 'meteor/projektor:users';
import lodash from 'lodash';

Template.navigationBar.onCreated(function navigationBarOnCreated() {
  this.autorun(() => {
    this.subscribe('singleUserDraft', Meteor.userId());
  });
});

Template.navigationBar.helpers({
  selectedMediumId() {
    return Session.get('selectedMediumId');
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
    let currentDraftId = Meteor.user() && Meteor.user().profile.draftId;

    Session.set('selectedMediumId', 'null');
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
        Users.setDraftId.call({
          draftId: currentDraftId,
        }, (err, res) => {
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
