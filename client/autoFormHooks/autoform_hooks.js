import { Projects } from '/lib/collections/projects.js';
import { ProjectDrafts } from '/lib/collections/project_drafts.js';

AutoForm.addHooks([
  "editTitle",
  // "addMember",
  "addContact",
  "member",
  "contactItem",
  "editDescription",
  "editTags",
  "jobItem",
  "editOccasions",
  "editSupervisors",
  "editDeadline",
  "editBeginning",
  "editOwnerRole",
  "setVideoLink"
], {
  onSuccess: function(formType, result) {
    this.template.parent().editActive.set(false);
  }
});

AutoForm.addHooks([
  "addMember",
],{
  onSubmit: function(insertDoc, updateDoc, currentDoc) {
    console.log(insertDoc, updateDoc, currentDoc);
    this.done();
    return false;
  },
  onSuccess:function(formType, result){
    console.log(result);
    // console.log(this);
    //  var count = 0;
    // enhance the member object that is going to be added with userName
    // var newArray = this.template.data.doc.team;
    // _.each(this.template.data.doc.team, function(member, index){
    //   if(!member.userName){
    //     var user = Meteor.users.findOne({_id: member.userId});
    //     user = user && user.profile.firstname + " " + user.profile.lastname;
    //     newArray[index].userName = user;
    //   }
    // });
    // if(this.template.data.doc.isNewProject){
    //
    //   // ProjectDrafts.update({ _id : this.template.data.doc._id}, { $set: {"team": newArray }});
    //   Meteor.call("projectDrafts.updateTeam", this.template.data.doc._id, newArray, (err, res) => {
    //     if (err) {
    //       alert(err);
    //     }
    //   });
    // } else {
    //   // Projects.update({ _id : this.template.data.doc._id}, { $set: {"team": newArray }});
    //   Meteor.call("projects.updateTeam", this.template.data.doc._id, newArray, (err, res) => {
    //     if (err) {
    //       alert(err);
    //     }
    //   });
    // }
  },
});
