import { Template } from "meteor/templating";
import "./project_edit.html";

import { Projects } from '../../../lib/collections/projects.js';

Template.projectEdit.onRendered(function() {
  $("#tags-input").tagsinput();
  $("#skills").tagsinput();
});

Template.projectEdit.helpers({
  initTags() {    
    // first check if this.tags is accessible for the client already - TODO: Better solution?
    return this.tags && this.tags.toString();
  },
  initSkills() {    
    return this.skills && this.skills.toString();
  }
});

Template.projectEdit.events({
  'submit .edit-project'(event) {
    event.preventDefault();
    const currentProjectId = this._id;
    const target = event.target;
    
    console.log(target.title.value);
    
    const newProjectProperties = {
      title: target.title.value,
      description: target.description.value,
      skills: $("#skills").tagsinput("items"),
      contacts: target.contacts.value,
      deadline: new Date(Date.parse(target.deadline.value)),
      tags: $("#tags-input").tagsinput("items")
    }
    Meteor.call('projects.update', currentProjectId, newProjectProperties);
    
    Router.go("projectDetails", {_id: this._id, title: this.title});
  }
});
