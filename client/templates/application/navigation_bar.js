import { Drafts } from "/lib/collections/drafts.js";
import { insertEmptyDraft } from "/lib/methods.js";

Template.navigationBar.onCreated(function navigationBarOnCreated() {
  Meteor.subscribe("drafts");
});

Template.navigationBar.helpers({
  result: function() {
      return Session.get('result');
  },
  findProjectInDrafts(){
    const currentDraft = Drafts.findOne({"owner.userId": Meteor.userId()});
    return currentDraft && currentDraft.owner && currentDraft.owner.userId;
  },
  route(){
    const idDraft = Router.current().params._id;
    const currentDraft = Drafts.findOne({"_id": idDraft});
    return currentDraft && currentDraft.owner && currentDraft.owner.userId;
  }
});

Template.navigationBar.events({
  "click .create-project-btn" (event) {
    // Go to a not finished draft if exists, else go to new draft
    const lastDraft = Drafts.findOne({"owner.userId": Meteor.userId()});
    let draftId;
    Session.set('result', "null");
    if (lastDraft && lastDraft._id) {
      draftId = lastDraft._id;
    } else {
      draftId = insertEmptyDraft.call((err, res) => {
        if (err) {
          if(err.error == "drafts.insertNew.unauthorized") {
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
