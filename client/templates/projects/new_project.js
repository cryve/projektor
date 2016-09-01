import {Template} from "meteor/templating" ;
import {Projects} from "/lib/collections/projects.js" ;
import {Images} from "/lib/images.collection.js";

import "./new_project.html" ;
//import "./image_upload.html" ;


/*
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

*/

Template.newProject.helpers({
  getProjectsCollection() {
    return Projects;
  }
});

/*

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
    const owner = Meteor.userId();
    console.log(Images.findOne());
    console.log($("#imageLink").attr("href"));
    const coverImgPath = $("#imageLink").attr("href");
    Meteor.call('projects.insert', title, subtitle, description, skills, contacts, deadline, tags, coverImgPath, owner);   

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

*/

  

