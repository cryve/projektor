import {Template} from "meteor/templating" ;
import {Projects} from "../../../lib/collections/projects.js" ;
import {Images} from "../../../lib/images.collection.js";
import "./new_project.html" ;



Template.newProject.onRendered(function() {
  // Initialize bootstrap tagsinput for tags field
  $("#tags-input").tagsinput();
  $("#skills").tagsinput();
});

Template.newProject.events({
  'submit .new-project'(event){
    console.log("submitting...");
    event.preventDefault();
    
    const target = event.target;
    const title = target.title.value;
    const description = target.description.value;
    const skills = $("#skills").tagsinput("items");
    const contacts = target.contacts.value;
    const deadline = new Date(Date.parse(target.deadline.value));
    const tags = $("#tags-input").tagsinput("items");
    
    console.log(Images.findOne(this.path));
    const coverImgPath = Images.findOne(this.path);
    Meteor.call('projects.insert', title, description, skills, contacts, deadline, tags, coverImgPath);

    console.log(title);
   

    // clear form
    target.title.value = '' ;
    target.description.value = '' ;
    target.skills.value = '' ;
    target.contacts.value = '' ;
    target.deadline.value = '' ;
    $("#tags-input").tagsinput("removeAll");
    $("#skills").tagsinput("removeAll");

    Router.go("landingPage");
  },
  
  
})


  

