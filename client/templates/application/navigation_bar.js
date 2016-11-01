import {ProjectDrafts} from "/lib/collections/project_drafts.js";

Template.navigationBar.events({
  "click .create-project-btn" (event) {
    if(Meteor.user()) {
      var id = ProjectDrafts.insert({});
      Router.go("newProject", {_id: id});
    } else {
      Router.go("loginPage");
      console.log("not signed in");
    }
  }
});
