import { Template } from 'meteor/templating';

import { Projects } from '/lib/collections/projects.js';

import './project_card.js';
import './landing_page.html';


Template.landingPage.helpers({
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },

});