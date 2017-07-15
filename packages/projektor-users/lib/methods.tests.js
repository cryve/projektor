import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import Users from 'meteor/projektor:users';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import faker from 'faker';
import lodash from 'lodash';

let sampleUserId;
Factory.define('user', Users, {
  createdAt: () => faker.date.past(),
  username: () => Random.hexString(6),
  profile: {
    firstname: () => faker.name.firstName(),
    lastname: () => faker.name.lastName(),
    fullname: () => faker.name.findName(),
    email: () => faker.internet.email(),
    matricNo: () => faker.random.number(),
    role: () => faker.random.arrayElement(['Student', 'Mitarbeiter']),
    title: () => faker.random.arrayElement(['Student', 'Professur']),
    gender: () => faker.random.arrayElement(['male', 'female']),
    studyCourseId: () => faker.random.number(),
    departmentId: () => faker.random.number(),
    facultyId: () => faker.random.number(),
    // draftId: () => Random.id(),
    // aboutMe: () => faker.lorem.sentences(),
    // skills: () => [faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea()],
    // avatar: () => false,
  },
});

describe('Store/remove users project draft id in profile', function() {
  beforeEach(function() {
    sampleUserId = Factory.create('user')._id;
  });
  afterEach(function() {
    Users.remove(sampleUserId);
  });
  it('should not store draft id in profile when logged out', function() {
    let context = {};
    const args = { draftId: Random.id() };
    chai.assert.throws(() => {
      Users.setDraftId._execute(context, args);
    }, Meteor.Error, `users.setDraftId.notLoggedIn`);

    const user = Users.findOne(sampleUserId);
    chai.assert.isUndefined(user.profile.draftId);
  });
  it('should store draft id in profile when logged in', function() {
    const draftId = Random.id();

    const context = { userId: sampleUserId };
    const args = { draftId };
    Users.setDraftId._execute(context, args);

    const user = Users.findOne(sampleUserId);
    chai.assert.equal(user.profile.draftId, draftId);
  });
  it('should not remove draft id from profile when logged out', function() {
    Users.update(sampleUserId, { $set: { 'profile.draftId': Random.id() } });

    const context = {};
    const args = {};
    chai.assert.throws(() => {
      Users.unsetDraftId._execute(context, args);
    }, Meteor.Error, `users.unsetDraftId.notLoggedIn`);

    const user = Users.findOne(sampleUserId);
    chai.assert.isDefined(user.profile.draftId);
  });
  it('should remove project draft id from profile when logged in', function() {
    Users.update(sampleUserId, { $set: { 'profile.draftId': Random.id() } });

    const context = { userId: sampleUserId };
    const args = {};
    Users.unsetDraftId._execute(context, args);

    const sampleUser = Users.findOne(sampleUserId);
    chai.assert.isUndefined(sampleUser.profile.draftId);
  });
});
