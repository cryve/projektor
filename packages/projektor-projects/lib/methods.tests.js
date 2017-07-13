import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import ValidationError from 'meteor/mdg:validation-error'
import { Projects } from 'meteor/projektor:projects';
import { Random } from 'meteor/random';
import lodash from 'lodash';

let meteorUserFunction = null;

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
    chai.assert.instanceOf(Projects.makePublic, ValidatedMethod, 'makePublic is a ValidatedMethod');
  });

  it('should only allow project id as argument', function() {
    const context = {};
    const invalidArgs = [
      {},
      { projectId: 'test' },
      { projectId: true },
      { test: 'test'},
      { projectId: 1234, test: 'test' },
    ];

    lodash.forEach(invalidArgs, function(args) {
      chai.assert.throws(() => {
        Projects.makePublic._execute(context, args);
      }, ValidationError);
    });
  });

  it('should deny making public for users without all permissions', function() {
    const otherUserId = Random.id();
    const context = { userId: otherUserId };
    const args = { projectId: sampleProjectId };
    
    chai.assert.throws(() => {
      Projects.makePublic._execute(context, args);
    }, Meteor.Error, /projects.makePublic.unauthorized/);
  });

  it('should set project state to public and draft state to false', function() {
    const context = { userId: creatorUserId };
    const args = { projectId: sampleProjectId };

    Projects.makePublic._execute(context, args);

    const project = Projects.findOne(sampleProjectId);
    chai.assert.isTrue(project.state.public, 'project is public');
    chai.assert.isFalse(project.state.draft, 'project is not draft');
  });
});
