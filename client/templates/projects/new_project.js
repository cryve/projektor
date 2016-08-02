import {Projects} from "../../../imports/api/projects.js" ;
import {Template} from "meteor/templating" ;
import "./new_project.html" ;

Template.newProject.helpers({
  projects: function() {
    return Projects.find();
  }
});

Template.newProject.events({
  'submit .new-project'(event){
    event.preventDefault();
    
    const target = event.target;
    const title = target.title.value;
    
    Meteor.call('projects.insert', title, description);
    
    // clear form
    target.title.value = '' ;
    target.description.value = '' ;
  }
})