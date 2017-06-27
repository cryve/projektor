import { Meteor } from 'meteor/meteor';
import lodash from 'lodash';
import mongoxlsx from 'mongo-xlsx';
import { Studies } from './studies.js';

Meteor.startup(function() {
  Studies.remove({});

  const xlsxFile = Assets.absoluteFilePath('assets/studycourse_lookup.xlsx');

  const model = [
    { displayName: 'Studiengangsnummer', access: 'studyCourseId', type: 'number' },
    { displayName: 'Studiengangsname', access: 'studyCourseName', type: 'string' },
    { displayName: 'Abschlussnummer', access: 'degreeId', type: 'number' },
    { displayName: 'Abschlussname', access: 'degreeName', type: 'string' },
    { displayName: 'Prüfungsordnung', access: 'examRegulationsId', type: 'number' },
    { displayName: 'Departmentnummer', access: 'departmentId', type: 'number' },
    { displayName: 'Departmentname', access: 'departmentName', type: 'string' },
    { displayName: 'Fakultätsnummer', access: 'facultyId', type: 'number' },
    { displayName: 'Fakultätsname', access: 'facultyName', type: 'string' },
  ];
  mongoxlsx.xlsx2MongoData(xlsxFile, model, Meteor.bindEnvironment((err, data) => {
    lodash.each(data, function(studyCourse) {
      Studies.insert(studyCourse);
    });
  }));
});
