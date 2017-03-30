import {excel} from "/lib/methods.js";
import { Meteor } from 'meteor/meteor'
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';
import { Template } from 'meteor/templating';
import { insertEmptyCourseDraft } from "/lib/methods.js";

Template.currentCourse.onCreated (function courseOnCreated() {
  XlsFiles.remove({userId:this._id});
  Meteor.subscribe('files.xlsFiles.all');
  Meteor.subscribe("courses");
  Meteor.subscribe("projects");
  Meteor.subscribe("drafts");
  this.createLink = new ReactiveVar(false);
});

Template.currentCourse.helpers({
  createLink () {
    return Template.instance().createLink.get();
  },
  projects(){
    return Projects.find({}, { sort: { createdAt: -1 } });
  },
  findProjectInDrafts(){
    const currentDraft = Drafts.findOne({"owner.userId": Meteor.userId()});
    return currentDraft && currentDraft.owner && currentDraft.owner.userId;
  },
});

Template.currentCourse.events({
  "click .create-course-project-btn" (event) {
    // Go to a not finished draft if exists, else go to new draft
    const lastDraft = Drafts.findOne({"owner.userId": Meteor.userId()});
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
