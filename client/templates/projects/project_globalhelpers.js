/* 
- use this file for template helpers used in multiple templates
- reference: 
 - https://guide.meteor.com/blaze.html#global-helpers
*/

import { Template } from 'meteor/templating';

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