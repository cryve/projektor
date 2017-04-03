import { Drafts } from "/lib/collections/drafts.js";
import { insertEmptyDraft } from "/lib/methods.js";
import { setDraftIdInProfile } from "/lib/methods.js";

Template.navigationBar.onCreated(function navigationBarOnCreated() {
  Meteor.subscribe("drafts");
  Meteor.subscribe("usersAll");
});

Template.navigationBar.helpers({
  result: function() {
      return Session.get('result');
  },
  isDraftRendered() {
    return Router.current().params._id === Meteor.user().profile.currentDraftId;
  }
});

Template.navigationBar.events({
  "click .create-project-btn" (event) {
    // Go to a not finished draft if exists, else go to new draft
    let currentDraftId = Meteor.user().profile.currentDraftId;
    Session.set('result', "null");
    if (!currentDraftId) {
      currentDraftId = insertEmptyDraft.call((err, res) => {
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
        draftId: currentDraftId }, (err, res) => {
        if (err) {
          alert(err);
        }
      });
    }
    Router.go("newProject", {_id: currentDraftId});
  }
});
