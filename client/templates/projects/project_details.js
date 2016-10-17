import { Template } from 'meteor/templating';
import { Projects } from '/lib/collections/projects.js';
import {ImagesGallery} from "/lib/images.collection.js";

import './project_details.html';

Template.projectDetails.onCreated(function() {
  this.editMode = new ReactiveVar(false);
  
});

Template.projectDetails.helpers({

  getEditMode(){
    return Template.instance().editMode.get();
  }
});

Template.projectDetails.events({

"click #edit-gallery-button" (event){
    const target = event.target;
    Template.instance().editMode.set(true);
    
  }               
});