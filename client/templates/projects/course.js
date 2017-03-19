import {excel} from "/lib/methods.js";
import { Meteor } from 'meteor/meteor'
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Template } from 'meteor/templating';

import './course.html';


Template.course.onCreated (function courseOnCreated() {
  Meteor.subscribe('files.xlsFiles.all');
  this.downloadLink = new ReactiveVar(false);
});

Template.course.events({

  "click #excel-button" (event){

   Meteor.call('excel', {
      test1: '12345',
      test2: 'This is a todo item.',
      test3: 'cookies.'
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        
      }
    });
    Template.instance().downloadLink.set(true);
  }
});

Template.fileLink.onCreated (function fileLinkOnCreated() {
  Meteor.subscribe('files.xlsFiles.all');

});
Template.fileLink.helpers({
  file: function () {
    return XlsFiles.findOne();
  }
  
});