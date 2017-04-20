import SimpleSchema from 'simpl-schema';

export const projectSchema = new SimpleSchema({
  // owner: Object,
  // "owner.userId": {
  //   type: String,
  //   regEx: SimpleSchema.RegEx.Id,
  // },
  // // "owner.wholeName": {
  // //   type: String,
  // // },
  // ownerRole: {
  //   type: String,
  //   optional: true,
  // },
  editableBy: Array,
  "editableBy.$": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  courseId: {
    type: String,
    optional: true,
  },
  title: {
    type: String,
    max: 40,
  },
  subtitle: {
    type: String,
    optional: true,
    max: 200
  },
  coverImg: {
    type: String,
    optional: true,
    max: 200
  },
  media: {
    type: Array,
    optional: true,
    blackbox: true,
    minCount: 0,
    maxCount: 5,
  },
  "media.$": Object,
  "media.$.type": String,
  "media.$.id": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  description: {
    type: String,
    max: 500,
    optional: true,
  },
  notes: {
    type: String,
    max: 500,
    optional: true,
  },
  deadline: {
    type: Date,
    optional: true
  },
  beginning: {
    type: Date,
    optional: true
  },
  tags: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "tags.$": String,
  team: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 20,
  },
  "team.$": Object,
  "team.$.userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // "team.$.userName": {
  //   type: String,
  //   optional: true,
  //
  // },
  "team.$.role": {
    type: String,
    optional: true,
  },
  "team.$.isEditor": {
    type: Boolean,
    label: "Darf Projekt bearbeiten",
  },
  teamCommunication: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "teamCommunication.$": Object,
  "teamCommunication.$.medium": String,
  "teamCommunication.$.url": {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
  },
  "teamCommunication.$.isPrivate": Boolean,
  jobs: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "jobs.$": Object,
  "jobs.$.joblabel": String,
  contacts: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "contacts.$": Object,
  "contacts.$.medium": String,
  "contacts.$.approach": String,
  occasions: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "occasions.$": String,
  supervisors: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  "supervisors.$": Object,
  "supervisors.$.userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  "supervisors.$.role": String
});

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

export const memberSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  member: Object,
  "member.userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  "member.role": {
    type: String,
    optional: true,
  },
  "member.isEditor": {
    type: Boolean,
    label: "Darf Projekt bearbeiten",
  },
}, { tracker: Tracker });

export const supervisorSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  supervisor: Object,
  "supervisor.userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  "supervisor.role": {
    type: String,
    optional: true,
  },
}, { tracker: Tracker });

export const courseOwnerSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  "userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
}, { tracker: Tracker });

export const jobSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  job: Object,
  "job.joblabel": String,
}, { tracker: Tracker });

export const addCourseSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  courseId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  }
}, { tracker: Tracker });

export const teamCommSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  teamComm: Object,
  "teamComm.medium": String,
  "teamComm.url": {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
  },
  "teamComm.isPrivate": Boolean,
}, { tracker: Tracker });

export const contactSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  contact: Object,
  "contact.medium": String,
  "contact.approach": String,
}, { tracker: Tracker });

export const linkSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  link: Object,
  "link.medium": String,
  "link.approach": String,
}, { tracker: Tracker });

export const courseSchema = new SimpleSchema({
  courseSemester: {
    type: String,
  },
  courseName: {
    type: String,
  },
  studyCourse: {
    type: String,
  },
  courseKey:{
    type: String,
  },
  deadline: {
    type: Date,
    optional: true
  },
}, { tracker: Tracker });
