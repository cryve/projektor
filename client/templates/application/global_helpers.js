/*
- use this file for template helpers used in multiple templates
- references:
 - http://blazejs.org/guide/reusing-code.html#Global-Helpers
 - http://blazejs.org/api/templates.html#Template-registerHelper
*/

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Images } from 'meteor/projektor:files';
import Users from 'meteor/projektor:users';
import lodash from 'lodash';

Template.registerHelper('readableDate', date => moment(date).format('DD.MM.YYYY'));

Template.registerHelper('formDate', date => moment(date).format('YYYY-MM-DD'));

Template.registerHelper('releaseDate', (date) => {
  moment.locale('de');
  return momentReactive(date).fromNow();
});

Template.registerHelper('getUsername', (userId) => {
  // console.log(userId);
  const user = Users.findOne({ _id: userId });
  // console.log(user.emails[0].address);
  return user && user.emails[0].address;
});

Template.registerHelper('getFullUsername', (userId) => {
  const user = Users.findOne({ _id: userId });
  return user && `${user.profile.firstname} ${user.profile.lastname}`;
});

Template.registerHelper('getEmailName', (userId) => {
  const user = Users.findOne(userId);
  return user && user.profile.email && user.profile.email.split('@')[0];
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

Template.registerHelper('log', (data, description) => {
  console.log(description, data);
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
  const users = Users.find(settings.hash.role ? { 'profile.role': settings.hash.role } : {});
  let userList = [' '];
  users.forEach(function (user) {
    if (user && user.profile) {
      userList.push({
        value: user._id,
        label: user.profile.fullname,
      });
    }
  });
  // remove users who are already in current group, but keep current user selection (firstOption)
  if (settings.hash.exclude) {
    settings.hash.exclude.forEach(function(user) {
      if (user.userId !== settings.hash.firstOption) {
        userList = userList.filter(item => item.value !== user.userId);
      }
    });
  }
  return userList;
});
