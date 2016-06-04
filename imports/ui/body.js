import { Template } from 'meteor/templating';

import { Projects } from '../api/projects.js';

import './project.js'
import './body.html'

Template.body.onCreated(function bodyOnCreated() {
    Meteor.subscribe('projects');    
});

Template.body.helpers({
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },
    projectCount() {
        return Projects.find().count();
    }
});

Template.body.events({
   'submit .new-project'(event) {
        //Prevent default browser event
       event.preventDefault();
       
       
       // Get value from form element
       const target = event.target;
       const title = target.title.value;
       
       
       // Insert a project into the collection
       Meteor.call('projects.insert', title);
       
       // clear form
       target.title.value = '';
   },
});