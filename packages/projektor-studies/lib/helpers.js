import { Template } from 'meteor/templating';
import { Studies } from './studies.js';

Template.registerHelper('studyCourseName', (studyCourseId, departmentId, facultyId) => {
  const studyCourse = Studies.findOne({ $and: [
    { studyCourseId },
    { departmentId },
    { facultyId },
  ] });
  if (studyCourse) {
    return studyCourse.studyCourseName;
  }
  return `Studiengang ${studyCourseId}`;
});

Template.registerHelper('departmentName', (departmentId) => {
  const studyCourse = Studies.findOne({ departmentId });
  if (studyCourse) {
    return studyCourse.departmentName;
  }
  return `Department ${departmentId}`;
});

Template.registerHelper('facultyName', (facultyId) => {
  const studyCourse = Studies.findOne({ facultyId });
  if (studyCourse) {
    return studyCourse.departmentName;
  }
  return `Fakultät ${facultyId}`;
});
