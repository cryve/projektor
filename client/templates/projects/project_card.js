import { Template } from 'meteor/templating';

import { Projects } from '../../../lib/collections/projects.js';

import './project_card.html';

Template.projectCard.onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
  
  
