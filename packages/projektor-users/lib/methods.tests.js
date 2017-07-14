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
    draftId: () => Random.id(),
    // aboutMe: () => faker.lorem.sentences(),
    // skills: () => [faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea()],
    // avatar: () => false,
  },
});

describe('Store/remove project draft in profile', function() {
  beforeEach(function() {
    sampleUserId = Factory.create('user')._id;
  });
  it('should not remove project draft id from foreign user', function() {
    let context = {};
    const args = { userId: sampleUserId };
    chai.assert.throws(() => {
      Users.unsetDraftId._execute(context, args);
    }, Meteor.Error, `users.unsetDraftId.notLoggedIn`);

    context = { userId: Random.id() };
    chai.assert.throws(() => {
      Users.unsetDraftId._execute(context, args);
    }, Meteor.Error, `users.unsetDraftId.unauthorized`);

    const user = Users.findOne(sampleUserId);
    chai.assert.isDefined(user.profile.draftId);
  });
  it('should remove project draft id from profile', function() {
    const context = { userId: sampleUserId };
    const args = { userId: sampleUserId };

    Users.unsetDraftId._execute(context, args);

    const sampleUser = Users.findOne(sampleUserId);
    chai.assert.isUndefined(sampleUser.profile.draftId);
  });
});
