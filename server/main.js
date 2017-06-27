import { Meteor } from 'meteor/meteor';
import { Courses, XlsFiles } from 'meteor/projektor:courses';
import lodash from 'lodash';
import 'meteor/projektor:projects';
import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) => {
  options.profile = {};
  options.profile.lastname = 'Mustermann';
  options.profile.firstname = 'Max';
  options.profile.fullname = 'Max Mustermann';
  options.profile.email = 'max.mustermann@haw-hamburg.de';
  options.profile.matricNo = 123456;
  options.profile.role = 'Mitarbeiter';
  options.profile.title = 'Akadem. Mitarbeiter/in';
  options.profile.studyCourseId = 908;
  options.profile.departmentId = 23;
  options.profile.facultyId = 20;
  options.profile.gender = 'male';
  options.profile.aboutMe = 'Lorem Ipsum ist ein einfacher Demo-Text für die Print- und Schriftindustrie. Lorem Ipsum ist in der Industrie bereits der Standard Demo-Text seit 1500, als ein unbekannter Schriftsteller eine Hand voll Wörter nahm und diese durcheinander warf um ein Musterbuch zu erstellen.';
  options.profile.skills = ['Python', 'Java', 'HTML/CSS', 'Webdesign'];
  options.profile.avatar = 'null';
  user.profile = options.profile;
  return user;
});

LDAP.logging = false;
LDAP.tryDBFirst = true;

LDAP.bindValue = function (usernameOrEmail) {
  return `cn=${usernameOrEmail},ou=User,o=haw`;
};

LDAP.attributes = [
  'cn',
  'hhEduPersonStaffCategory',
  'hhEduPersonActCat',
  'sn',
  'givenName',
  'fullName',
  'hhEduPersonStdMatrNoStrg',
  'hhEduPersonPrimaryStudyCourse',
  'hhEduPersonPrimaryDept',
  'hhEduPersonPrimaryFaculty',
  'mail',
  'hhEduPersonGender',
];

LDAP.addFields = function(person) {
  const getGenderString = (genderId) => {
    if (genderId === '0') {
      return 'female';
    } else if (genderId === '1') {
      return 'male';
    }
    return 'unknown';
  };
  let profile = {
    firstname: person.givenName,
    lastname: person.sn,
    fullname: person.fullName,
    role: person.hhEduPersonStaffCategory,
    title: person.hhEduPersonActCat,
    studyCourseId: person.hhEduPersonPrimaryStudyCourse,
    departmentId: person.hhEduPersonPrimaryDept,
    facultyId: person.hhEduPersonPrimaryFaculty,
    matricNo: person.hhEduPersonStdMatrNoStrg,
    gender: getGenderString(person.hhEduPersonGender),
    email: person.mail,
  };
  profile = lodash.omitBy(profile, lodash.isNil);
  return {
    profile,
  };
};

Meteor.startup(function() {
  WebApp.addHtmlAttributeHook(function() {
    return {
      lang: 'de',
    };
  });
  XlsFiles.remove({});
  Courses.remove({});
});
