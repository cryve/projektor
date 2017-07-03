import { Tracker } from 'meteor/tracker'
import SimpleSchema from 'simpl-schema';

export const projectSchema = new SimpleSchema({
  isDraft: Boolean,
  permissions: Object,
  'permissions.editInfos': Array,
  'permissions.editInfos.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'permissions.manageMembers': Array,
  'permissions.manageMembers.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'permissions.manageCourses': Array,
  'permissions.manageCourses.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'permissions.deleteProject': Array,
  'permissions.deleteProject.$': {
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
    max: 200,
  },
  coverImg: {
    type: String,
    optional: true,
    max: 200,
  },
  media: {
    type: Array,
    optional: true,
    blackbox: true,
    minCount: 0,
    maxCount: 5,
  },
  'media.$': Object,
  'media.$.type': String,
  'media.$.id': {
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
    optional: true,
  },
  beginning: {
    type: Date,
    optional: true,
  },
  tags: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  'tags.$': String,
  pdfs: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  'pdfs.$': String,
  team: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 20,
  },
  'team.$': Object,
  'team.$.userId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // "team.$.userName": {
  //   type: String,
  //   optional: true,
  //
  // },
  'team.$.role': {
    type: String,
    optional: true,
  },
  'team.$.permissions': Object,
  'team.$.permissions.editInfos': Boolean,
  'team.$.permissions.manageMembers': Boolean,
  'team.$.permissions.manageCourses': Boolean,
  'team.$.permissions.deleteProject': Boolean,
  teamCommunication: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  'teamCommunication.$': Object,
  'teamCommunication.$.medium': String,
  'teamCommunication.$.url': {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
  },
  'teamCommunication.$.isPrivate': Boolean,
  jobs: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  'jobs.$': Object,
  'jobs.$.joblabel': String,
  contacts: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  'contacts.$': Object,
  'contacts.$.medium': String,
  'contacts.$.approach': String,
  occasions: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  'occasions.$': String,
  supervisors: {
    type: Array,
    optional: true,
    minCount: 0,
    maxCount: 10,
  },
  'supervisors.$': Object,
  'supervisors.$.userId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'supervisors.$.role': String,
});

export const memberSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  member: Object,
  'member.userId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'member.role': {
    type: String,
    optional: true,
  },
  'member.permissions': Object,
  'member.permissions.editInfos': Boolean,
  'member.permissions.manageMembers': Boolean,
  'member.permissions.manageCourses': Boolean,
  'member.permissions.deleteProject': Boolean,
}, { tracker: Tracker });

export const jobSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  job: Object,
  'job.joblabel': String,
}, { tracker: Tracker });

export const supervisorSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  supervisor: Object,
  'supervisor.userId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'supervisor.role': {
    type: String,
    optional: true,
  },
}, { tracker: Tracker });

export const contactSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  contact: Object,
  'contact.medium': String,
  'contact.approach': String,
}, { tracker: Tracker });

export const teamCommSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  teamComm: Object,
  'teamComm.medium': String,
  'teamComm.url': {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
  },
  'teamComm.isPrivate': Boolean,
}, { tracker: Tracker });
