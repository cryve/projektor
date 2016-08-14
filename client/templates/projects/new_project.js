import {Template} from "meteor/templating" ;
import {Projects} from "../../../lib/collections/projects.js" ;
import {Images} from "../../../lib/images.collection.js";
import {coverImgPath} from "./image_upload.js" ;

import "./new_project.html" ;



Template.newProject.onRendered(function() {
  // Initialize bootstrap tagsinput for tags field
  $("#tags-input").tagsinput({
    maxTags: 10, // max 10 tags allowed
    maxChars: 20, // max 10 chars per tag allowed
    trimValue: true // removes whitespace around a tag
  });
  $("#skills").tagsinput({
    maxTags: 10, // max 10 tags allowed
    maxChars: 20, // max 10 chars per tag allowed
    trimValue: true // removes whitespace around a tag
  });
});

Template.newProject.events({
  'submit .new-project'(event){
    console.log("submitting...");
    event.preventDefault();
    
    const target = event.target;
    const title = target.title.value;
    const subtitle = target.subtitle.value;
    const description = target.description.value;
    const skills = $("#skills").tagsinput("items");
    const contacts = target.contacts.value;
    const deadline = new Date(Date.parse(target.deadline.value));
    const tags = $("#tags-input").tagsinput("items");
    const member = Meteor.userId();
    console.log(Images.findOne());
    const coverImgPath = "coverImgPath";
    Meteor.call('projects.insert', title,subtitle, description, skills, contacts, deadline, tags, coverImgPath, member);


    console.log(title);
   

    // clear form
    target.title.value = '' ;
    target.subtitle.value = '' ;
    target.description.value = '' ;
    target.skills.value = '' ;
    target.contacts.value = '' ;
    target.deadline.value = '' ;
    $("#tags-input").tagsinput("removeAll");
    $("#skills").tagsinput("removeAll");

    Router.go("landingPage");
  },
  
  
})


  

