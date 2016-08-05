import {Template} from "meteor/templating" ;
import {Projects} from "../../../imports/api/projects.js" ;
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
    const $("#skills").tagsinput("items");
    const contacts = target.contacts.value;
    const deadline = new Date(Date.parse(target.deadline.value));
    const tags = $("#tags-input").tagsinput("items");
    
    Meteor.call('projects.insert', title, description, skills, contacts, deadline, tags );
    // clear form
    target.title.value = '' ;
    target.description.value = '' ;
    target.skills.value = '' ;
    target.contacts.value = '' ;
    target.deadline.value = '' ;
    $("#tags-input").tagsinput("removeAll");
    $("#skills").tagsinput("removeAll");


  },
})

