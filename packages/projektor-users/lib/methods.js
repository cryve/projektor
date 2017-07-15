import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import Users from './users';

Users.addContactToProfile = new ValidatedMethod({
  name: 'users.addContact',
  validate: new SimpleSchema({
    docId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    contact: Object,
    'contact.medium': String,
    'contact.approach': String,
  }).validator(),
  run({ docId, contact }) {
    console.log(docId, contact);
    const user = Users.findOne(docId);
    if (!(user._id === this.userId)) {
      throw new Meteor.Error('users.addContact.unauthorized',
      'You cannot edit profile that is not yours');
    }
    if (_.findWhere(user.profile.contacts, contact)) {
      throw new Meteor.Error('users.addContact.alreadyExists',
      'You cannot add the same contact twice');
    }
    Users.update(docId, { $push: { 'profile.contacts': contact } });
  },
});

const linkSchema = new SimpleSchema({
  docId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  link: Object,
  'link.medium': String,
  'link.approach': String,
}, { tracker: Tracker });

Users.addLinkToProfile = new ValidatedMethod({
  name: 'users.addLink',
  validate: linkSchema.validator(),
  run({ docId, link }) {
    console.log(docId, link);
    const user = Users.findOne(docId);
    if (!(user._id === this.userId)) {
      throw new Meteor.Error('users.addLink.unauthorized',
      'You cannot edit profile that is not yours');
    }
    if (_.findWhere(user.profile.links, link)) {
      throw new Meteor.Error('users.addLink.alreadyExists',
      'You cannot add the same link twice');
    }
    Users.update(docId, { $push: { 'profile.links': link } });
  },
});

Users.setDraftId = new ValidatedMethod({
  name: 'users.setDraftId',
  validate: new SimpleSchema({
    draftId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ draftId }) {
    if (!this.userId) {
      throw new Meteor.Error('users.setDraftId.notLoggedIn',
      'Cannot set draft to user profile when you are logged out');
    }
    Users.update(this.userId, { $set: { 'profile.draftId': draftId } });
  },
});

Users.updateEditableInUsers = new ValidatedMethod({
  name: 'users.updateEditable',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    if (_id !== this.userId) {
      throw new Meteor.Error('users.updateEditable.unauthorized',
      'You cannot edit a profile that is not yours');
    }
    return Users.update({
      _id,
    }, modifier);
  },
});

Users.userAvatar = new ValidatedMethod({
  name: 'userAvatar',
  validate: new SimpleSchema({
    userId: String,
    imageId: String,
  }).validator(),
  run({ userId, imageId }) {
    if (userId !== Meteor.userId()) {
      throw new Meteor.Error('userAvatar.unauthorized',
      'Its not your profile');
    }
    Users.update({ _id: userId }, { $set: { 'profile.avatar': imageId } });
  },
});

Users.unsetDraftId = new ValidatedMethod({
  name: 'users.unsetDraftId',
  validate: null,
  run() {
    if (!this.userId) {
      throw new Meteor.Error('users.unsetDraftId.notLoggedIn', 'Cannot unset draft id when your are not logged in');
    }
    Users.update(this.userId, { $unset: { 'profile.draftId': '' } });
  }
});
