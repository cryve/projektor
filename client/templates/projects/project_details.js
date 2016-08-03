import { Template } from 'meteor/templating';

import { Projects } from '../../../imports/api/projects.js';

import './project_details.html';

Template.projectDetails.helpers({
 
  description: function () { // data context set to profile.name
    return this.description;
  },
  title: function () { // data context set to profile.name
    return this.title;
  }
});