/*
- use this file for template helpers used in multiple templates
- references:
 - http://blazejs.org/guide/reusing-code.html#Global-Helpers
 - http://blazejs.org/api/templates.html#Template-registerHelper
*/

import { Template } from 'meteor/templating';
import { Studies } from '/lib/collections/studies.js';
import lodash from 'lodash';

Template.registerHelper("readableDate", (date) => {
  return moment(date).format("DD.MM.YYYY");
});

Template.registerHelper("formDate", (date) => {
  return moment(date).format("YYYY-MM-DD");
});

Template.registerHelper("releaseDate", (date) => {
  moment.locale("de");
  return momentReactive(date).fromNow();
});

Template.registerHelper("getUsername", (userId) => {
  // console.log(userId);
  var user = Meteor.users.findOne({_id: userId});
  // console.log(user.emails[0].address);
  return user && user.emails[0].address;
});

Template.registerHelper("getFullUsername", (userId) => {
  var user = Meteor.users.findOne({_id: userId});
  return user && user.profile.firstname + " " + user.profile.lastname;
});

Template.registerHelper("arrayToString", (array) => {
  return array && array.join(", ");
});

Template.registerHelper("getImgURL", (imgId, version) => {
  if (imgId){
    Meteor.subscribe("files.images.all");
    var image = Images.findOne(imgId);
    return (image && image.versions[version]) ? image.link(version) : null;
  }
});

Template.registerHelper('encodeUrlString', function(string) {
  return encodeURIComponent(string);
});

Template.registerHelper("getAvatarURL", (userId, version) => {
  Meteor.subscribe("files.images.all");
  Meteor.subscribe("usersAll");
  var user = Meteor.users.findOne({_id: userId});
  var image = user && (user.profile.avatar && Images.findOne(user.profile.avatar));
  return (image && image.versions[version]) ? image.link(version) : "/img/"+version+".jpg";
});

/*Template.registerHelper("getAvatarCardURL", (userId, version) => {
  var user = Meteor.users.findOne({_id: userId});
  var image = user.profile.avatar && Images.findOne(user.profile.avatar);
  return (image && image.versions[version]) ? image.link(version) : "/img/defaultCardMini.jpg";

});*/

Template.registerHelper("log", (data) => {
  console.log(data);
});

Template.registerHelper("getMethodString", (collectionName, methodName) => {
  return collectionName + "." + methodName;
});

Template.registerHelper("isProjectEditableBy", (project, userId) => {
  if (project && _.contains(project.editableBy, userId)) {
    return true;
  }
  return false;
});

Template.registerHelper("studyCourseName", (studyCourseId, departmentId, facultyId) => {
  Meteor.subscribe("studies");
  const studyCourse = Studies.findOne({ $and: [
    { "studyCourseId": studyCourseId },
    { "departmentId": departmentId },
    { "facultyId": facultyId }
  ]});
  return studyCourse && studyCourse.studyCourseName;
});

Template.registerHelper("departmentName", (departmentId) => {
  Meteor.subscribe("studies");
  const studyCourse = Studies.findOne({ "departmentId": departmentId });
  return studyCourse && studyCourse.departmentName;
});

Template.registerHelper("facultyName", (facultyId) => {
  Meteor.subscribe("studies");
  const studyCourse = Studies.findOne({ "facultyId": facultyId });
  return studyCourse && studyCourse.facultyName;
});

Template.registerHelper("isUserInGroup", (group, userId) => {
  let foundUser = false;
  lodash.forEach(group, function(value) {
    if(lodash.includes(value, userId)) {
      foundUser = true;
      return false; // breaks the loop
    }
  });
  return foundUser;
});
