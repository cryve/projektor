import {Template} from "meteor/templating" ;
import {Projects} from "../../../imports/api/projects.js" ;
import "./new_project.html" ;

Template.newProject.onRendered(function() {
  // Initialize bootstrap tagsinput for tags field
  $("#tags-input").tagsinput();
});

Template.newProject.events({
  'submit .new-project'(event){
    console.log("submitting...");
    event.preventDefault();
    
    const target = event.target;
    const title = target.title.value;
    const description = target.description.value;
    //const tags = target.tags.tagsinput("items");
    const tags = $("#tags-input").tagsinput("items");
    
    Meteor.call('projects.insert', title, description, tags);
    
    // clear form
    target.title.value = '' ;
    target.description.value = '' ;
  },
})

