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

Template.registerHelper("releaseDate", (date) => {
  moment.locale("de");
  return momentReactive(date).fromNow();
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
    var image = Images.findOne(imgId);
    return image && image.link(version);
});

Template.registerHelper("getAvatarURL", (userId, version) => {
  var user = Meteor.users.findOne({_id: userId});
  var image = Images.findOne(user.profile.avatar);
  return (image && image.versions[version]) //? image.link(version) : '/img/placeholder.png'
});

Template.registerHelper("log", (data) => {
  console.log(data);
});
