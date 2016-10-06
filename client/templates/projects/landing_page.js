import { Template } from 'meteor/templating';

import { Projects } from '/lib/collections/projects.js';

import './landing_page.html';


Template.landingPage.helpers({
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },
    

});

