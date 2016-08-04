import {Template} from "meteor/templating" ;
import {Projects} from "../../../imports/api/projects.js" ;
import "./new_project.html" ;

Template.newProject.events({
  'submit .new-project'(event){
    console.log("submitting...");
    event.preventDefault();
    
    const target = event.target;
    const title = target.title.value;
    const description = target.description.value;
    const skills = target.skills.value;
    const contacts = target.contacts.value;
    const deadline = target.deadline.value;
    
    Meteor.call('projects.insert', title, description, skills, contacts, deadline );
    
    // clear form
    target.title.value = '' ;
    target.description.value = '' ;
    target.skills.value = '' ;
    target.contacts.value = '' ;
    target.deadline.value = '' ;

  },
})

