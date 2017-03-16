import {excel} from "/lib/methods.js";
import { Meteor } from 'meteor/meteor'
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Template } from 'meteor/templating';

Template.course.events({

  "click #excel-button" (event){

    Meteor.call("excel", function (error) {
  // identify the error
      if (error && error.error === "logged-out") {
        // show a nice error message
        Session.set("errorMessage", "Please log in to post a comment.");
      }
    });
    console.log(this);

  },
});


/*Template.course.helpers({
  file: function () {
    return XlsFiles.findOne();
  }
});*/