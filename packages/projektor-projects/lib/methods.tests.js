import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import { Projects } from 'meteor/projektor:projects';
import { Random } from 'meteor/random';

describe('Project.insertNewDraft', function() {
  it('should insert new project draft when logged in', function() {
    const creatorUserId = Random.id();
    const context = { userId: creatorUserId };

    const projectId = Projects.insertNewDraft._execute(context);

    const project = Projects.findOne(projectId);
    chai.assert.equal(project.title, "Unbenanntes Projekt", 'sample title is set');
    chai.assert.isTrue(project.isDraft, 'project is marked as draft');
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
    chai.assert.throws(() => {
      Projects.insertNewDraft._execute(context);
    }, Meteor.Error, /projects.insertNewDraft.notLoggedIn/);
  });
  it('should not insert when draft already exists');
});
