import { Projects } from '/lib/collections/projects.js';
import { Drafts } from '/lib/collections/drafts.js';

AutoForm.addHooks([
  "editTitle",
  "addMember",
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
  "addMember"
  
],{
  onSuccess:function(formType, result){
  
    console.log(this);
   var count = 0;
   var newArray = this.template.data.doc.team;
      _.each(this.template.data.doc.team, function(member, index){
        if(!member.userName){
          var user = Meteor.users.findOne({_id: member.userId});
          user = user && user.profile.firstname + " " + user.profile.lastname; 
          newArray[index].userName = user;
        }
      });
    if(this.template.data.doc.isNewProject){
      Drafts.update({ _id : this.template.data.doc._id}, { $set: {"team": newArray }});
    }
    else{
      Projects.update({ _id : this.template.data.doc._id}, { $set: {"team": newArray }});
    }
  },
  
});

