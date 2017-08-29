/*
- use this file for template helpers used in multiple templates
- references:
 - http://blazejs.org/guide/reusing-code.html#Global-Helpers
 - http://blazejs.org/api/templates.html#Template-registerHelper
*/

/*Global-Helpers sind globale Funktionen, welche von jedem anderen HTML-Template aufgerufen werden können, um
bestimmte Daten zu erhalten oder zu formatieren*/
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Studies } from '/lib/collections/studies.js';
import lodash from 'lodash';

Template.registerHelper('readableDate', date => moment(date).format('DD.MM.YYYY'));

Template.registerHelper('formDate', date => moment(date).format('YYYY-MM-DD'));

Template.registerHelper('releaseDate', (date) => {
  moment.locale('de');
  return momentReactive(date).fromNow();
});

Template.registerHelper('getUsername', (userId) => {
  const user = Meteor.users.findOne({ _id: userId });
  return user && user.emails[0].address;
});

Template.registerHelper('getFullUsername', (userId) => {
  const user = Meteor.users.findOne({ _id: userId });
  return user && `${user.profile.firstname} ${user.profile.lastname}`;
});
Template.registerHelper('getMatr', (userId) => {
  const user = Meteor.users.findOne({ _id: userId });
  return  `${user.profile.matricNo}`;
});

Template.registerHelper('getEmailName', (userId) => {
  const user = Meteor.users.findOne(userId);
  if (user && user.profile.email){
    return user.profile.email.split('@')[0];
  } else {
    return user && user.profile.firstname + "." + user.profile.lastname;
  }
});

Template.registerHelper('arrayToString', array => array && array.join(', '));

Template.registerHelper('getImgURL', (imgId, version) => {
  if (imgId) {
    const image = Images.findOne(imgId);
    return (image && image.versions[version]) ? image.link(version) : null;
  }
});

Template.registerHelper('encodeUrlString', function(string) {
  return encodeURIComponent(string);
});


Template.registerHelper('log', (data) => {
  console.log(data);
});

Template.registerHelper('getMethodString', (collectionName, methodName) => `${collectionName}.${methodName}`);


Template.registerHelper('isUserInGroup', (group, userId) => {
  let foundUser = false;
  lodash.forEach(group, function(value) {
    if (lodash.includes(value, userId)) {
      foundUser = true;
      return false; // breaks the loop
    }
  });
  return foundUser;
});

Template.registerHelper('hasPermissions', (permissionNames, doc) => {
  if (doc && doc.permissions) {
    permissionNames = permissionNames.split(',');
    let hasMissingPermission = false;
    lodash.forEach(permissionNames, function(permissionName) {
      if (!lodash.includes(doc.permissions[permissionName], Meteor.userId())) {
        hasMissingPermission = true;
        return false;
      }
    });
    return !hasMissingPermission;
  }
  return false;
});

Template.registerHelper('suggestedUsers', (settings) => {
  const users = Meteor.users.find(settings.hash.role ? { 'profile.role': settings.hash.role } : {});
  let userList = [' '];
  users.forEach(function (user) {
    if (user && user.profile) {
      userList.push({
        value: user._id,
        label: user.profile.fullname + " (" + user.username + ")",
      });
    }
  });
  if (settings.hash.exclude) {
    settings.hash.exclude.forEach(function(user) {
      if (user.userId !== settings.hash.firstOption) {
        userList = userList.filter(item => item.value !== user.userId);
      }
    });
  }
  return userList;
});
