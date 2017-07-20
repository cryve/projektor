import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Projects } from 'meteor/projektor:projects';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';

export const initialize = new ValidatedMethod({
  name: 'gallery.initialize',
  validate: new SimpleSchema({
    projectId: String,
  }).validator(),
  run({ projectId }) {
    const project = Projects.findOne(projectId);
    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('gallery.initialize.unauthorized',
      'Cannot initialize gallery in project that is not yours');
    }

    const mediaEmpty = [
      { type: null, id: null },
      { type: null, id: null },
      { type: null, id: null },
      { type: null, id: null },
      { type: null, id: null },
    ];

    Projects.update(projectId, { $set: { media: mediaEmpty } });
    Projects.update(projectId, { $set: { coverImg: null } });
  },
});

export const deleteImage = new ValidatedMethod({
  name: 'gallery.deleteImage',
  validate: new SimpleSchema({
    imageId: String,
    projectId: String,
  }).validator(),
  run({ imageId, projectId }) {
    const project = Projects.findOne(projectId);

    if ((!lodash.includes(project.permissions.editInfos, this.userId))) {
      throw new Meteor.Error('gallery.deleteImage.unauthorized',
      'Cannot delete gallery image in project that is not yours');
    }

    Images.remove({ _id: imageId });
  },
});

export const setCoverImage = new ValidatedMethod({
  name: 'gallery.setCoverImage',
  validate: new SimpleSchema({
    projectId: String,
    galleryItemIndex: SimpleSchema.Integer,
    imageId: String,
  }).validator(),
  run({ projectId, imageId, galleryItemIndex }) {
    let newCoverImageId;
    const project = Projects.findOne(projectId);
    if (imageId == 'empty') {
      newCoverImageId = project.media[galleryItemIndex].id;
    } else {
      newCoverImageId = imageId;
    }
    if (!_.contains(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('gallery.setCoverImage.unauthorized',
      'Cannot set cover image for project that is not yours');
    }
    Projects.update(projectId, { $set: { coverImg: newCoverImageId } });
  },
});

export const setItemImageId = new ValidatedMethod({
  name: 'gallery.setItemImageId',
  validate: new SimpleSchema({
    projectId: String,
    itemIndex: SimpleSchema.Integer,
    imageId: String,
  }).validator(),
  run({ projectId, itemIndex, imageId }) {
    const project = Projects.findOne(projectId);

    if (!_.contains(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('gallery.setItemImageId.unauthorized',
      'Cannot edit gallery item in project that is not yours');
    }

    if (imageId == 'null') {
      imageId = null;
    }
    const newMedia = project.media;
    newMedia[itemIndex].id = imageId;

    Projects.update(projectId, { $set: { media: newMedia } });
  },
});

export const removeCoverImage = new ValidatedMethod({
  name: 'project.removeCoverImage',
  validate: new SimpleSchema({
    projectId: String,
  }).validator(),
  run({ projectId }) {
    const project = Projects.findOne(projectId);

    if (!_.contains(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('project.removeCoverImage.unauthorized',
      'Cannot remove cover image from project that is not yours');
    }

    Projects.update(projectId, { $set: { coverImg: null } });
  },
});

export const setItemType = new ValidatedMethod({
  name: 'gallery.setItemType',
  validate: new SimpleSchema({
    projectId: String,
    itemType: String,
    itemIndex: SimpleSchema.Integer,
  }).validator(),
  run({ projectId, itemIndex, itemType }) {
    const project = Projects.findOne(projectId);

    if (!_.contains(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('gallery.setItemType.unauthorized',
      'Cannot edit gallery item in project that is not yours');
    }

    if (itemType == 'null') {
      itemType = null;
    }
    const newMedia = project.media;
    newMedia[itemIndex].type = itemType;

    Projects.update(projectId, { $set: { media: newMedia } });
  },
});

export const updateItem = new ValidatedMethod({
  name: 'gallery.updateItem',
  validate: new SimpleSchema({
    projectId: String,
    itemIndex: Number,
    newItemType: String,
    imageId: String,
  }).validator(),
  run({ projectId, itemIndex, newItemType, imageId }) {
    const project = Projects.findOne(projectId);

    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('gallery.updateItem.unauthorized',
      'Cannot edit gallery item in project that is not yours');
    }

    const mediaNew = project.media;
    mediaNew[itemIndex].type = newItemType;
    mediaNew[itemIndex].id = imageId;
    Projects.update(projectId, { $set: { media: mediaNew } });

    const oldImageIdAtIndex = project.media[itemIndex].id;
    if (project.coverImg == oldImageIdAtIndex) {
      Projects.update(projectId, { $set: { coverImg: imageId } });
    }
  },
});

const setItemVideoUrl = new ValidatedMethod({
  name: 'gallery.setItemVideoUrl',
  validate: new SimpleSchema({
    _id: String,
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier, _id }) {
    const project = Projects.findOne(_id);
    if (!lodash.includes(project.permissions.editInfos, this.userId)) {
      throw new Meteor.Error('gallery.setItemVideoUrl.unauthorized',
      'Cannot edit gallery item in project that is not yours');
    }
    return Projects.update({
      _id,
    }, modifier);
  },
});
