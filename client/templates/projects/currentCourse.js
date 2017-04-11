import {excel} from "/lib/methods.js";
import { Meteor } from 'meteor/meteor'
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import { Template } from 'meteor/templating';
import { insertEmptyCourseDraft } from "/lib/methods.js";
import { setDraftIdInProfile } from "/lib/methods.js";
import lodash from 'lodash';

Template.currentCourse.onCreated (function courseOnCreated() {
  XlsFiles.remove({userId:this._id});
  Meteor.subscribe('files.xlsFiles.all');
  Meteor.subscribe("courses");
  Meteor.subscribe("projects");
  Meteor.subscribe("usersAll");
  Meteor.subscribe("drafts");
  this.createLink = new ReactiveVar(false);
  Session.set("previousRoute", Router.current().route.getName());
});

Template.currentCourse.helpers({
  createLink () {
    return Template.instance().createLink.get();
  },
  projects(){
    return Projects.find({}, { sort: { createdAt: -1 } });
  },
  checkIfDraft(){
    var check = false;
    const currentDoc = this;
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && (value.courseId == currentDoc._id)){
          console.log("test");
          console.log(this);
          console.log(value.draftId)
          console.log(value.courseId);
          console.log(currentDoc._id);
          check = true
          return false;
        }
      });
    }
    return check;
  },
  isDraftRendered() {
    var check = false;
    const currentDoc = this;
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && (value.courseId == currentDoc._id)){
          check = Router.current().params._id === value.draftId;
          return false;
        }
      });
    }
    return check
  },
});

Template.currentCourse.events({
  "click .create-course-project-btn" (event) {
    // Go to a not finished draft if exists, else go to new draft
    var lastDraft
    const currentDoc = this;
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.drafts){
      lodash.forEach(Meteor.user().profile.drafts, function(value){
        if (value.draftId && (value.courseId == currentDoc._id)){
          lastDraft = Drafts.findOne(value.draftId);
        }
      });
    }

    let draftId;
    Session.set('result', "null");
    if (lastDraft && lastDraft._id) {
      draftId = lastDraft._id;
    } else {
      draftId = insertEmptyCourseDraft.call({
        courseId: this._id,
      }, (err, res) => {
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
        draftId: draftId,
        courseId: this._id}, (err, res) => {
        if (err) {
          alert(err);
        }
      });
    }
    Router.go("newProject", {_id: draftId});
  },
  "click #excel-button" (event){
     XlsFiles.remove({userId:this._id});
     Meteor.call(
      'excel',{
        courseId: this._id,
       },
      // function(error, result){
      //     if(error){
      //         console.error(error);
      //     } else {
      //
      //         console.info(typeof result);
      //
      //     }
      // }
    );
    Template.instance().createLink.set(true);
    console.log(Template.instance().createLink.get());
  },


});

Template.file.onCreated (function fileLinkOnCreated() {
  Meteor.subscribe('files.xlsFiles.all');
  this.createLink = new ReactiveVar(true);

});
Template.file.helpers({
  file: function () {
    return XlsFiles.findOne({userId:this._id});
  },
  fileLink:function(){
    var file = XlsFiles.findOne({userId:this._id});
    if(file && file._id){
      console.log(this._id);
      console.log(file._id);
      var link = "http://localhost:3000/cdn/storage/XlsFiles/"+file._id+"/original/"+file._id+"?download=true"
      window.location = link;
      Template.instance().createLink.set(false);
    }
  }
});
