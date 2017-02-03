import {ProjectDrafts} from "/lib/collections/project_drafts.js";

Template.navigationBar.onCreated(function navigationBarOnCreated() {
  Meteor.subscribe("projectDrafts");
});

Template.navigationBar.helpers({
  result: function() {

      return Session.get('result');
  },

});

Template.navigationBar.events({
  "click .create-project-btn" (event) {
    if(Meteor.user()) {
      // Go to a not finished draft if exists, else go to new draft
      var lastDraft = ProjectDrafts.findOne({"owner.userId": Meteor.userId()});
      let draftId;
      Session.set('result', "null");
      if (lastDraft && lastDraft._id) {
        draftId = lastDraft._id;
      } else {
        draftId = ProjectDrafts.insert({});
      }
      Router.go("newProject", {_id: draftId});
    } else {
      Router.go("loginPage");
      console.log("not signed in");
    }
  }
});
