import SimpleSchema from 'simpl-schema';

export const projectSchema = new SimpleSchema({
  owner: Object,
  "owner.userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // "owner.wholeName": {
  //   type: String,
  // },
  ownerRole: {
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
  "supervisors.$": String,
});
