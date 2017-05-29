import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

const Schema = {};

Schema.UserProfile = new SimpleSchema({
  firstname: String,
  lastname: String,
  fullname: String,
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.EmailWithTLD,
  },
  matricNo: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  role: String,
  title: String,
  gender: {
    type: String,
    optional: true,
  },
  studyCourseId: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  departmentId: SimpleSchema.Integer,
  facultyId: SimpleSchema.Integer,
  aboutMe: {
    type: String,
    optional: true,
  },
  avatar: {
    type: String,
    optional: true,
  },
  skills: {
    type: Array,
    optional: true
  },
  "skills.$": String,
  contacts: {
    type: Array,
    optional: true,
  },
  "contacts.$": Object,
  "contacts.$.medium": String,
  "contacts.$.approach": String,
  links: {
    type: Array,
    optional: true,
  },
  "links.$": Object,
  "links.$.medium": String,
  "links.$.approach": String,
  drafts:{
    type: Array,
    optional: true,
  },
  "drafts.$":Object,
  "drafts.$.courseId":{
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  "drafts.$.draftId":{
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
});


Schema.User = new SimpleSchema({
  username: {
        type: String,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
  createdAt: {
    type: Date
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  }
});
Meteor.users.attachSchema(Schema.User);

if (Meteor.isServer) {
  Meteor.publish('users.list.all', function usersListAllPublication() {
    if (!this.userId) {
      return this.ready();
    }
    return Meteor.users.find({}, {
      fields: {
        _id: 1,
        createdAt: 1,
        'profile.fullname': 1,
        'profile.role': 1,
        'profile.email': 1,
      },
    });
  });
  Meteor.publish('users.list.single', function usersListSinglePublication() {
    return Meteor.users.find({}, {
      fields: {
        _id: 1,
        'profile.fullname': 1,
        'profile.email': 1,
        'profile.avatar': 1,
      },
    });
  });
  Meteor.publish("usersAll", function usersAllPublication() {
    return Meteor.users.find({});
  });
  Meteor.publish("usersCourseAll", function usersAllPublication() {
    return Meteor.users.find({},{
      fields:{
        _id:1,
        "profile.role":1,
      }
    });
  });
  Meteor.publish('users.profile.single', function usersProfileSinglePublication(userId) {
    if (!this.userId) {
      return this.ready();
    }
    new SimpleSchema({
      userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ userId });
    return Meteor.users.find(userId, {
      fields: {
        _id: 1,
        'profile.email': 1,
        'profile.avatar': 1,
        'profile.fullname': 1,
        'profile.firstname': 1,
        'profile.lastname': 1,
        'profile.title': 1,
        'profile.role': 1,
        'profile.studyCourseId': 1,
        'profile.departmentId': 1,
        'profile.facultyId': 1,
        'profile.skills': 1,
        'profile.aboutMe': 1,
        'profile.contacts': 1,
        'profile.links': 1,
      },
    });
  });
  Meteor.publish("userSupervisor", function userSupervisorPublication() {
    return Meteor.users.find({"profile.role": "Mitarbeiter"});
  });
  Meteor.publish("usersTeam", function usersTeamPublication(team) {
    var teamIds = team.map(function(user){
      return user.userId
    });
    return Meteor.users.find({_id: {$in: teamIds}});
  });
}

Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
