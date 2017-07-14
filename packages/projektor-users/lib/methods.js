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
    const user = Meteor.users.findOne(docId);
    if (!(user._id === this.userId)) {
      throw new Meteor.Error('users.addContact.unauthorized',
      'You cannot edit profile that is not yours');
    }
    if (_.findWhere(user.profile.contacts, contact)) {
      throw new Meteor.Error('users.addContact.alreadyExists',
      'You cannot add the same contact twice');
    }
    Meteor.users.update(docId, { $push: { 'profile.contacts': contact } });
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
    const user = Meteor.users.findOne(docId);
    if (!(user._id === this.userId)) {
      throw new Meteor.Error('users.addLink.unauthorized',
      'You cannot edit profile that is not yours');
    }
    if (_.findWhere(user.profile.links, link)) {
      throw new Meteor.Error('users.addLink.alreadyExists',
      'You cannot add the same link twice');
    }
    Meteor.users.update(docId, { $push: { 'profile.links': link } });
  },
});

Users.setDraftIdInProfile = new ValidatedMethod({
  name: 'users.addDraftId',
  validate: new SimpleSchema({
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    draftId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ userId, draftId }) {
    if (userId !== this.userId) {
      throw new Meteor.Error('users.addDraftId.unauthorized',
      'You cannot add draft to profile that is not yours');
    }
    Meteor.users.update(userId, { $addToSet: { 'profile.drafts': { draftId } } });
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
    return Meteor.users.update({
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
    Meteor.users.update({ _id: userId }, { $set: { 'profile.avatar': imageId } });
  },
});
