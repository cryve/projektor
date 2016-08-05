import {Template} from "meteor/templating" ;
import {Projects} from "../../../imports/api/projects.js" ;
import "./new_project.html" ;

Template.newProject.onRendered(function() {
  // Initialize bootstrap tagsinput for tags field
  $("#tags-input").tagsinput();
});

Template.newProject.events({
  
  
                           
  'submit .new-project'(event){
    
    function formatDate(value){
      var month = value.getMonth()+1
      if (month > 9){
        return value.getDate() + "/" + month + "/" + value.getFullYear();
      }
      else{
        return value.getDate() + "/" + "0" + month + "/" + value.getFullYear();
      }
    }
    
    console.log("submitting...");
    event.preventDefault();

    const target = event.target;
    const title = target.title.value;
    const description = target.description.value;
    const skills = target.skills.value;
    const contacts = target.contacts.value;
    const deadline = formatDate(new Date(target.deadline.value));
    const tags = $("#tags-input").tagsinput("items");
    
    Meteor.call('projects.insert', title, description, skills, contacts, deadline, tags );
    // clear form
    target.title.value = '' ;
    target.description.value = '' ;
    target.skills.value = '' ;
    target.contacts.value = '' ;
    target.deadline.value = '' ;
    $("#tags-input").tagsinput("removeAll");


  },
})

