/*
- use this file for template helpers used in multiple templates
- reference:
 - https://guide.meteor.com/blaze.html#global-helpers
*/

import { Template } from 'meteor/templating';
import {Projects} from "/lib/collections/projects.js" ;

Template.registerHelper("readableDate", (date) => {
  return moment(date).format("DD.MM.YYYY");
});

Template.registerHelper("formDate", (date) => {
  return moment(date).format("YYYY-MM-DD");
});

Template.registerHelper("getUsername", (userId) => {
  console.log(userId);
  var user = Meteor.users.findOne({_id: userId});
  console.log(user.emails[0].address);
  return user && user.emails[0].address;
});



Template.registerHelper("getFullUsername", (userId) => {
  var user = Meteor.users.findOne({_id: userId});
  return user && user.profile.firstname + " " + user.profile.lastname;
});

Template.registerHelper("getProjectsCollection", Projects);



Template.registerHelper("arrayToString", (array) => {
  return array && array.join(", ");
});

Template.registerHelper("getImgURL", (imgId, version) => {
    var image = ImagesGallery.findOne(imgId);
    return image && image.link(version);
});

Template.registerHelper("getAvatarURL", (userId) => {
  //var user = Meteor.users.findOne({_id: userId});
  //var avatar = Images.findOne(user.profile.avatar);
  //return avatar && avatar.link(thumb50);
});
