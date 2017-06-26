import { Drafts, Projects } from 'meteor/projektor:projects';
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
    let check = false;
    if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts) {
      lodash.forEach(Meteor.user().profile.drafts, function(value) {
        if (value.draftId && !value.courseId) {
          console.log(FlowRouter.getParam('draftId'));
          console.log(FlowRouter.current());
          console.log(this);
          check = FlowRouter.getParam('draftId');
          return false;
        }
      });
    }
    return check;
  },
  checkIfDraft() {
    let check = false;
    if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts) {
      lodash.forEach(Meteor.user().profile.drafts, function(value) {
        if (value.draftId && !value.courseId) {
          check = true;
          return false;
        }
      });
    }
    return check;
  },
});

Template.navigationBar.events({
  'click .create-project-btn' (event) {
    Session.set('previousRoute', FlowRouter.getRouteName());
    let currentDraftId;
    // Go to a not finished draft if exists, else go to new draft
    if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts) {
      lodash.forEach(Meteor.user().profile.drafts, function(value) {
        if (value.draftId && !value.courseId) {
          currentDraftId = value.draftId;
        }
      });
    }

    Session.set('result', 'null');
    if (!currentDraftId) {
      currentDraftId = Drafts.insertEmptyDraft.call((err, res) => {
        if (err) {
          if (err.error === 'drafts.insertNew.unauthorized') {
            FlowRouter.go('loginPage');
            alert('Bitte melde dich an, um ein neues Projekt zu erstellen.');
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

      FlowRouter.go('newProject', { draftId: currentDraftId });
      console.log(FlowRouter.current());
    }
  },
});
