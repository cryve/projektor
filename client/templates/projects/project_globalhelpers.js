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