import SimpleSchema from 'simpl-schema';

export const studiesSchema = new SimpleSchema({
  studyCourseId: SimpleSchema.Integer,
  studyCourseName: String,
  degreeId: SimpleSchema.Integer,
  degreeName: String,
  examRegulationsId: SimpleSchema.Integer,
  departmentId: SimpleSchema.Integer,
  departmentName: String,
  facultyId: SimpleSchema.Integer,
  facultyName: String,
});
