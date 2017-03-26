import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import '../lib/collections/projects.js';

import { Accounts } from 'meteor/accounts-base';
import { AccountsServer } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) =>{
  options.profile = {};
  options.profile.lastname = "Mustermann";
  options.profile.firstname = "Max";
  options.profile.role= "Student";
  options.profile.study = "Media System";
  options.profile.aboutMe = "Lorem Ipsum ist ein einfacher Demo-Text für die Print- und Schriftindustrie. Lorem Ipsum ist in der Industrie bereits der Standard Demo-Text seit 1500, als ein unbekannter Schriftsteller eine Hand voll Wörter nahm und diese durcheinander warf um ein Musterbuch zu erstellen.";
  options.profile.skills = ["Python", "Java", "HTML/CSS", "Webdesign"];
  options.profile.avatar = "null";
  user.profile = options.profile;
  return user;
});

LDAP.logging = false;

// LDAP.generateSettings = function (request) {
//   return {
//     "serverDn": "ou=User,o=haw",
//     "serverUrl": "ldaps://corpdir-new.haw-hamburg.de:636",
//     "whiteListedFields": [
//       "cn",
//       "hhEduPersonStaffCategory",
//       "sn",
//       "givenName",
//       "fullName",
//       "hhEduPersonPrimaryFaculty",
//       "hhEduPersonPrimaryStudyCourse",
//       "mail",
//       "hhEduPersonGender",
//     ],
//     "autopublishFields": [
//       "cn",
//       "hhEduPersonStaffCategory",
//       "sn",
//       "givenName",
//       "fullName",
//       "hhEduPersonPrimaryFaculty",
//       "hhEduPersonPrimaryStudyCourse",
//       "mail",
//       "hhEduPersonGender"
//     ],
//   }
// }

LDAP.bindValue = function (usernameOrEmail) {
  return "cn="+usernameOrEmail+",ou=User,o=haw";
}

LDAP.attributes = [
  "cn",
  "hhEduPersonStaffCategory",
  "sn",
  "givenName",
  "fullName",
  "hhEduPersonPrimaryFaculty",
  "hhEduPersonPrimaryStudyCourse",
  "mail",
  "hhEduPersonGender",
];

LDAP.addFields = function(person) {
  return {
    "profile.firstname": person.givenName,
    "profile.lastname": person.sn,
    "profile.role": person.hhEduPersonStaffCategory,
  }
}

Meteor.startup(function() {
  WebApp.addHtmlAttributeHook(function() {
    return {
        "lang": "de"
    }
  })
});

Meteor.startup(function () {
   fs = require('fs');
});
