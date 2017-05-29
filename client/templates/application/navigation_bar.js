import { Drafts } from "/lib/collections/drafts.js";
import { insertEmptyDraft } from "/lib/methods.js";
import { setDraftIdInProfile } from "/lib/methods.js";
import lodash from 'lodash';

Template.navigationBar.onCreated(function navigationBarOnCreated() {
  this.autorun(() => {
    this.subscribe("singleUser", Meteor.userId());
    this.subscribe("singleUserDraft", Meteor.userId());
  })
});

Template.navigationBar.helpers({
  result: function() {
      return Session.get('result');
  },
  isDraftRendered() {
    var check = false;
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && !value.courseId){
          check = FlowRouter.getParam("draftId");
          return false;
        }
      });
    }
    return check;
  },
  checkIfDraft(){
    var check = false;
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && !value.courseId){
          check = true;
          return false
        }
      });
    }
    return check;
  }
});

Template.navigationBar.events({
  "click .create-project-btn" (event) {
    Session.set("previousRoute", FlowRouter.getRouteName());
    let currentDraftId
    // Go to a not finished draft if exists, else go to new draft
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && !value.courseId){
          currentDraftId = value.draftId
        }
      });
    }

    Session.set('result', "null");
    if (!currentDraftId) {
      currentDraftId = insertEmptyDraft.call((err, res) => {
        if (err) {
          if(err.error == "drafts.insertNew.unauthorized") {
            FlowRouter.go("loginPage");
            alert("Bitte melde dich an, um ein neues Projekt zu erstellen.");
          } else {
            alert(err);
          }
        }
      });
      if(Meteor.user()){
        setDraftIdInProfile.call({
          userId: Meteor.userId(),
          draftId: currentDraftId }, (err, res) => {
          if (err) {
            alert(err);
          }
        });
      }
    }
    if(Meteor.user()){
      console.log(currentDraftId);

      FlowRouter.go("newProject", {draftId: currentDraftId});
      console.log(FlowRouter.current())
    }
  }
});
