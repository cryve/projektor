import {excel} from "/lib/methods.js";
import { Meteor } from 'meteor/meteor'
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Courses } from '/lib/collections/courses.js';
import { Projects } from '/lib/collections/projects.js';
import { Template } from 'meteor/templating';

Template.currentCourse.helpers({
  projects(){
    return Projects.find({}, { sort: { createdAt: -1 } });
  }
});

Template.currentCourse.onCreated (function courseOnCreated() {
  Meteor.subscribe('files.xlsFiles.all');
  Meteor.subscribe("courses");
  Meteor.subscribe("projects");
});