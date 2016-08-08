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
    this.tags && $("#tags-input").tagsinput("add", this.tags.toString()); 
  },  
  initSkills() {
    this.skills && $("#skills").tagsinput("add", this.skills.toString());  
  },
  deadlineString() {
    var deadlineValue = this.deadline;
    var month = deadlineValue.getMonth() + 1;
    if (month > 9) {
      return deadlineValue.getFullYear() + "-" + month + "-" + deadlineValue.getDate();
    }
    return deadlineValue.getFullYear() + "-" + "0" + month + "-" + deadlineValue.getDate();
  }
});

