import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Projects } from "/lib/collections/projects.js" ;
import { ProjectDrafts } from "/lib/collections/project_drafts.js";

export const insertEmptyDraft = new ValidatedMethod({
  name: "projectDrafts.insertEmptyDraft",
  validate: new SimpleSchema({}).validator(),
  run() {
    if (!this.userId) {
      throw new Meteor.Error('projectDrafts.insertNew.unauthorized',
        'Cannot insert new draft because you are not logged in');
    }
    return ProjectDrafts.insert({});
  }
});

export const publishDraft = new ValidatedMethod({
  name: "projects.publishDraft",
  validate: new SimpleSchema({
    "draftId": { type: String },
  }).validator(),
  run({ draftId }) {
    const draft = ProjectDrafts.findOne(draftId);
    if (!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error('projects.publishDraft.unauthorized',
        'Cannot publish draft that is not yours');
    }
    return Projects.insert(draft);
  }
});

export const deleteDraft = new ValidatedMethod({
  name: "projectDrafts.deleteDraft",
  validate: new SimpleSchema({
    "draftId": { type: String },
  }).validator(),
  run({ draftId }) {
    const draft = ProjectDrafts.findOne(draftId);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("projectDrafts.deleteDraft.unauthorized",
      "Cannot delete draft that is not yours");
    }
    ProjectDrafts.remove(draftId);
  }
});

// export const addMemberNames = new ValidatedMethod({
//   name: "project.addMemberNames",
//   validate: new SimpleSchema({
//     "projectId": { type: String },
//     "isDraft": { type: Boolean },
//   }).validator(),
//   run({ projectId, isDraft }) {
//     let project;
//     if(isDraft) {
//       project = ProjectDrafts.findOne(projectId);
//     } else {
//       project = Projects.findOne(projectId);
//     }
//     if(!(project.owner.userId == this.userId)) {
//       throw new Meteor.Error("project.addMemberNames.unauthorized",
//       "Cannot update draft/project that is not yours");
//     }
//   }
// });

export const addMember = new ValidatedMethod({
  name: "project.addMember",
  validate: new SimpleSchema({
    "_id": { type: String },
    "modifier": {
      type: Object,
      blackbox: true
    },
  }).validator({modifier: false}),
  // validate: null,
  run({ _id, modifier }) {
    console.log(_id);
    console.log(modifier);
    ProjectDrafts.update(_id, modifier);
  }
});

export const updateEditableInDraft = new ValidatedMethod({
  name: 'projectDrafts.updateEditable',
  validate: new SimpleSchema({
    _id: { type: String },
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const draft = ProjectDrafts.findOne(_id);
    if(!(draft.owner.userId == this.userId)) {
      throw new Meteor.Error("projectDrafts.updateEditable.unauthorized",
      "You cannot edit draft that is not yours");
    }
    return ProjectDrafts.update({
      _id: _id
    }, modifier);
  }
});

export const updateEditableInProject = new ValidatedMethod({
  name: 'projects.updateEditable',
  validate: new SimpleSchema({
    _id: { type: String },
    modifier: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({modifier, _id}) {
    const project = Projects.findOne(_id);
    if(!(project.owner.userId == this.userId)) {
      throw new Meteor.Error("projects.updateEditable.unauthorized",
      "You cannot edit project that is not yours");
    }
    return Projects.update({
      _id: _id
    }, modifier);
  }
});

// export const updateTitle = new ValidatedMethod({
//   name: 'project.updateTitle',
//   validate: new SimpleSchema({
//     _id: { type: String },
//     modifier: {
//       type: Object,
//       // blackbox: true
//     }
//   }).validator(),
//   run({modifier, _id}) {
//     return ProjectDrafts.update({
//       _id: _id
//     }, modifier);
//   }
// });
