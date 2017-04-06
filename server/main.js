import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import { XlsFiles } from '/lib/collections/xlsFiles.js';
import { Courses } from '/lib/collections/courses.js';
import mongoxlsx from 'mongo-xlsx';
import lodash from 'lodash';

import '../lib/collections/projects.js';
import { Studies } from '/lib/collections/studies.js';

import { Accounts } from 'meteor/accounts-base';
import { AccountsServer } from 'meteor/accounts-base';

// Accounts.onCreateUser((options, user) =>{
//   options.profile = {};
//   options.profile.lastname = "Mustermann";
//   options.profile.firstname = "Max";
//   options.profile.fullname = "Max Mustermann";
//   options.profile.matricNo = 123456;
//   options.profile.role = "Dozent";
//   options.profile.title = "Dozent";
//   options.profile.studyCourse = {
//     id: 908,
//     departmentId: 23,
//     facultyId: 20
//   },
//   options.profile.gender = "male";
//   options.profile.aboutMe = "Lorem Ipsum ist ein einfacher Demo-Text für die Print- und Schriftindustrie. Lorem Ipsum ist in der Industrie bereits der Standard Demo-Text seit 1500, als ein unbekannter Schriftsteller eine Hand voll Wörter nahm und diese durcheinander warf um ein Musterbuch zu erstellen.";
//   options.profile.skills = ["Python", "Java", "HTML/CSS", "Webdesign"];
//   options.profile.avatar = "null";
//   user.profile = options.profile;
//   return user;
// });

LDAP.logging = false;

LDAP.bindValue = function (usernameOrEmail) {
  return "cn="+usernameOrEmail+",ou=User,o=haw";
}

LDAP.attributes = [
  "cn",
  "hhEduPersonStaffCategory",
  "hhEduPersonActCat",
  "sn",
  "givenName",
  "fullName",
  "hhEduPersonStdMatrNoStrg",
  "hhEduPersonPrimaryStudyCourse",
  "hhEduPersonPrimaryDept",
  "hhEduPersonPrimaryFaculty",
  "mail",
  "hhEduPersonGender",
];

LDAP.addFields = function(person) {
  const getGenderString = (genderId) => {
    if(genderId === '0') {
      return "female";
    } else if(genderId === '1') {
      return "male";
    }
    return "unknown";
  };
  let profile = {
    firstname: person.givenName,
    lastname: person.sn,
    fullname: person.fullName,
    role: person.hhEduPersonStaffCategory,
    title: person.hhEduPersonActCat,
    studyCourse: {
      id: person.hhEduPersonPrimaryStudyCourse,
      departmentId: person.hhEduPersonPrimaryDept,
      facultyId: person.hhEduPersonPrimaryFaculty,
    },
    matricNo: person.hhEduPersonStdMatrNoStrg,
    gender: getGenderString(person.hhEduPersonGender),
  };
  console.log(profile);
  profile.studyCourse = lodash.omitBy(profile.studyCourse, lodash.isNil);
  profile = lodash.omitBy(profile, lodash.isNil);
  console.log(profile);
  return {
    "profile": profile,
  };
};

Meteor.startup(function() {
  WebApp.addHtmlAttributeHook(function() {
    return {
        "lang": "de"
    }
  });
  XlsFiles.remove({});
  Courses.remove({});
});

Meteor.startup(function () {
  fs = require('fs');
  const model = [
    { "displayName": "Studiengangsnummer", "access": "studyCourseId", "type": "number" },
    { "displayName": "Studiengangsname", "access": "studyCourse", "type": "string" },
    { "displayName": "Abschlussnummer", "access": "degreeId", "type": "number" },
    { "displayName": "Abschlussname", "access": "degree", "type": "string" },
    { "displayName": "Abschlussnummer", "access": "degreeId", "type": "number" },
    { "displayName": "Prüfungsordnung", "access": "examRegulationsId", "type": "number" },
    { "displayName": "Abschlussname", "access": "degree", "type": "string" },
    { "displayName": "Departmentnummer", "access": "departmentId", "type": "number" },
    { "displayName": "Departmentname", "access": "department", "type": "string" },
    { "displayName": "Fakultätsnummer", "access": "facultyId", "type": "number" },
    { "displayName": "Fakultätsname", "access": "faculty", "type": "string" },
  ];
  const xlsxFile  = Assets.absoluteFilePath('studycourse_lookup.xlsx');
  Studies.remove();
  mongoxlsx.xlsx2MongoData(xlsxFile, model, Meteor.bindEnvironment((err, data) => {
    _.each(data, function(studyCourse) {
      Studies.insert(studyCourse);
    });
  }));
});
