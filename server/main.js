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
  options.profile.role= "Dozent";
  options.profile.study = "Media System";
  options.profile.aboutMe = "Lorem Ipsum ist ein einfacher Demo-Text für die Print- und Schriftindustrie. Lorem Ipsum ist in der Industrie bereits der Standard Demo-Text seit 1500, als ein unbekannter Schriftsteller eine Hand voll Wörter nahm und diese durcheinander warf um ein Musterbuch zu erstellen.";
  options.profile.skills = ["Python", "Java", "HTML/CSS", "Webdesign"];
  options.profile.avatar = "null";



  user.profile = options.profile;
  return user;

});

LDAP.generateSettings = function (request) {
  return {
    // "serverDn": "DC=ad,DC=university,DC=edu",
    "serverDn": "DC=bui,DC=haw-hamburg,DC=de",
    // "serverUrl": "ldap://ad.university.edu:389",
    "serverUrl": "ldap://ldap2.mt.haw-hamburg.de:389",
    "whiteListedFields": ["uid", "uidNumber", "sn", "givenName", "departmentNumber", "mail"],
    "autopublishFields": ["uid", "uidNumber", "sn", "givenName", "departmentNumber", "mail"]
  }
}

Meteor.startup(function() {
    WebApp.addHtmlAttributeHook(function() {
        return {
            "lang": "de"
        }
    })
});
