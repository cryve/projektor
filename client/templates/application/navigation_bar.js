import {ProjectDrafts} from "/lib/collections/project_drafts.js";


Template.navigationBar.helpers({
  result: function() {
      return Session.get('result');
  },
  findProjectInDrafts(){
    const currentDraft = ProjectDrafts.findOne({"owner.userId": Meteor.userId()});
    return currentDraft && currentDraft.owner.userId;     
  },
  route(){
    const idDraft = Router.current().params._id;
    const currentDraft = ProjectDrafts.findOne({"_id": idDraft});
    return currentDraft && currentDraft.owner.userId;
  }
  
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
