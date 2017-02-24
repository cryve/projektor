import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';

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
    //   // Drafts.update({ _id : this.template.data.doc._id}, { $set: {"team": newArray }});
    //   Meteor.call("drafts.updateTeam", this.template.data.doc._id, newArray, (err, res) => {
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

AutoForm.addHooks(["setVideoLink"], {
  before: {
    "method-update": function(doc) {
      const key = _.keys(doc["$set"])[0];
      const index = key[6];
      const regExpLinkToId = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      const match = doc["$set"]["media."+index+".id"].match(regExpLinkToId);
      const newUrlId = (match&&match[7].length==11)? match[7] : false;
      const newUrl = "https://www.youtube.com/embed/"+newUrlId;
      doc["$set"]["media."+index+".id"] = newUrl;
      doc["$set"]["media."+index+".type"] = "URL";
      delete doc["$unset"];
      console.log(doc);
      return doc;
    }
  }
});
