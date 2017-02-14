import {ProjectDrafts} from "/lib/collections/project_drafts.js";
import { insertEmptyDraft } from "/lib/methods.js";

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
    // Go to a not finished draft if exists, else go to new draft
    const lastDraft = ProjectDrafts.findOne({"owner.userId": Meteor.userId()});
    let draftId;
    Session.set('result', "null");
    if (lastDraft && lastDraft._id) {
      draftId = lastDraft._id;
    } else {
      draftId = insertEmptyDraft.call((err, res) => {
        if (err) {
          if(err.error == "projectDrafts.insertNew.unauthorized") {
            Router.go("loginPage");
            alert("Bitte melde dich an, um ein neues Projekt zu erstellen.");
          } else {
            alert(err); 
          }
        }
      });
    }
    Router.go("newProject", {_id: draftId});
  }
});
