import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import ValidationError from 'meteor/mdg:validation-error'
import { Projects } from 'meteor/projektor:projects';
import { Random } from 'meteor/random';
import lodash from 'lodash';

let meteorUserFunction = null;

const assertIsValidatedMethod = (method) => {
  chai.assert.instanceOf(method, ValidatedMethod, 'method is a ValidatedMethod');
};

const assertThrowsErrorWhenLoggedOut = (validatedMethod, args) => {
  const context = {};
  chai.assert.throws(() => {
    validatedMethod._execute(context, args);
  }, Meteor.Error, `${validatedMethod.name}.notLoggedIn`);
};

const assertThrowsErrorWhenNotPermitted = (validatedMethod, userId, args, permissions) => {
  const context = { userId };
  chai.assert.throws(() => {

  });
}

const assertAcceptsProjectIdOnly = (validatedMethod) => {
  const context = {};
  const invalidTypeArgs = [
    { projectId: true },
    { projectId: 1234 },
  ];

  chai.assert.throws(() => {
    validatedMethod._execute(context, {});
  }, 'Project ID is required');

  chai.assert.throws(() => {
    validatedMethod._execute(context, { test: 'test' });
  }, 'test is not allowed by the schema');

  chai.assert.throws(() => {
    validatedMethod._execute(context, { projectId: 'test' });
  }, 'Project ID must be a valid alphanumeric ID');

  lodash.forEach(invalidTypeArgs, function(args) {
    chai.assert.throws(() => {
      validatedMethod._execute(context, args);
    }, 'Project ID must be of type String');
  });
};

describe('Project.insertNewDraft', function() {
  beforeEach(function() {
    meteorUserFunction = Meteor.user;
    Meteor.user = () => {
      return {
        profile: {
          drafts: [],
        }
      }
    };
  });

  afterEach(function() {
    Meteor.user = meteorUserFunction;
  });

  it('should insert new project draft when logged in', function() {
    const creatorUserId = Random.id();
    const context = { userId: creatorUserId };
    const args = {};

    const projectId = Projects.insertNewDraft._execute(context, args);

    const project = Projects.findOne(projectId);
    chai.assert.equal(project.title, "Unbenanntes Projekt", 'sample title is set');
    chai.assert.isTrue(project.state.draft, 'project is marked as draft');
    chai.assert.isFalse(project.state.public, 'project is not marked as public');
    chai.assert.deepEqual(project.permissions, {
      editInfos: [creatorUserId],
      manageMembers: [creatorUserId],
      manageCourses: [creatorUserId],
      deleteProject: [creatorUserId],
    }, 'creator user has all permissions');
    chai.assert.deepEqual(project.team, [{
      userId: creatorUserId,
      role: 'Projektleitung',
      permissions: {
        editInfos: true,
        manageMembers: true,
        manageCourses: true,
        deleteProject: true,
      },
    }], 'creator user is team member with all permissions');
  });

  it('should not insert when logged out', function() {
    const context = {};
    const args = {};
    let projectId;
    chai.assert.throws(() => {
      projectId = Projects.insertNewDraft._execute(context, args);
    }, Meteor.Error, /projects.insertNewDraft.notLoggedIn/);
    chai.assert.isUndefined(projectId, 'no project draft inserted');
  });

  it('should not insert when draft already exists', function() {
    Meteor.user = () => {
      return {
        profile: {
          drafts: [{ 'draftId': 'testDraft' }],
        }
      }
    };
    const context = { userId: Random.id() };
    const args = {};
    let projectId;
    chai.assert.throws(() => {
      projectId = Projects.insertNewDraft._execute(context, args);
    }, Meteor.Error, /projects.insertNewDraft.alreadyExists/);
  });
});

let sampleProjectId;
let creatorUserId;

describe('Projects.makePublic', function() {
  beforeEach(function() {
    creatorUserId = Random.id();
    const sampleProject = {
      state: { public: false, draft: true },
      title: 'Example Project',
      permissions: {
        editInfos: [creatorUserId],
        manageMembers: [creatorUserId],
        manageCourses: [creatorUserId],
        deleteProject: [creatorUserId],
      },
      team: [{
        userId: creatorUserId,
        role: 'Projektleitung',
        permissions: {
          editInfos: true,
          manageMembers: true,
          manageCourses: true,
          deleteProject: true,
        },
      }],
    };
    sampleProjectId = Projects.insert(sampleProject);
  });

  afterEach(function() {
    creatorUserId = null;
    sampleProjectId = null;
    Projects.remove(sampleProjectId);
  });

  it('should be a ValidatedMethod', function() {
    assertIsValidatedMethod(Projects.makePublic);
  });

  it('should only accept project id as argument', function() {
    assertAcceptsProjectIdOnly(Projects.makePublic);
  });

  it('should not publish projects without all permissions', function() {
    const otherUserId = Random.id();
    const context = { userId: otherUserId };
    const args = { projectId: sampleProjectId };

    chai.assert.throws(() => {
      Projects.makePublic._execute(context, args);
    }, Meteor.Error, /projects.makePublic.unauthorized/);
  });

  it('should set project state to public and draft state to false if permitted', function() {
    const context = { userId: creatorUserId };
    const args = { projectId: sampleProjectId };

    Projects.makePublic._execute(context, args);

    const project = Projects.findOne(sampleProjectId);
    chai.assert.isTrue(project.state.public, 'project is public');
    chai.assert.isFalse(project.state.draft, 'project is not draft');
  });
});

describe('Projects.delete', function() {
  beforeEach(function() {
    creatorUserId = Random.id();
    const sampleProject = {
      state: { public: false, draft: true },
      title: 'Example Project',
      permissions: {
        editInfos: [creatorUserId],
        manageMembers: [creatorUserId],
        manageCourses: [creatorUserId],
        deleteProject: [creatorUserId],
      },
      team: [{
        userId: creatorUserId,
        role: 'Projektleitung',
        permissions: {
          editInfos: true,
          manageMembers: true,
          manageCourses: true,
          deleteProject: true,
        },
      }],
    };
    sampleProjectId = Projects.insert(sampleProject);
  });

  afterEach(function() {
    creatorUserId = null;
    sampleProjectId = null;
    Projects.remove(sampleProjectId);
  });

  it('should be a ValidatedMethod', function() {
    assertIsValidatedMethod(Projects.delete);
  });

  it('should only accept projectId as argument', function() {
    assertAcceptsProjectIdOnly(Projects.delete);
  });

  it('should not delete when user is not logged in', function() {
    assertThrowsErrorWhenLoggedOut(Projects.delete, { projectId: sampleProjectId });
    chai.assert.isDefined(Projects.findOne(sampleProjectId));
  });

  it('should not delete when user is not permitted', function() {
    Projects.update(sampleProjectId, { $set: { 'permissions.deleteProject': [] } });
    const context = { userId: creatorUserId };
    const args = { projectId: sampleProjectId };
    chai.assert.throws(() => {
      Projects.delete._execute(context, args);
    }, Meteor.Error, /projects.delete.unauthorized/);
    chai.assert.isDefined(Projects.findOne(sampleProjectId));
  });

  it('should delete project when logged in and permitted', function() {
    const context = { userId: creatorUserId };
    const args = { projectId: sampleProjectId };
    Projects.delete._execute(context, args);
    chai.assert.isUndefined(Projects.findOne(sampleProjectId));
  });
});
