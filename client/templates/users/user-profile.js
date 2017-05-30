import { Template } from 'meteor/templating';
import { Images } from '/lib/collections/images.js';
import { Projects } from '../../../lib/collections/projects.js';
import { Studies } from '/lib/collections/studies.js';
import { avatarRemove } from '/lib/methods.js';
import './user-profile.html';
import '../projects/project_card.js';

Template.userProfile.onCreated(function userProfileOnCreated() {
  Session.set('previousRoute', FlowRouter.getRouteName());
  this.autorun(() => {
    const userId = FlowRouter.getParam('userId');
    this.subscribe('users.profile.single', userId);
    this.subscribe('userProjects', userId);
    this.subscribe('singleStudyInfo', userId);
    this.subscribe('files.images.avatar', userId);
  });
});

Template.userProfile.helpers({
  user() {
    return Meteor.users.findOne(FlowRouter.getParam('userId'));
  },
  facultyName(facultyId) {
    const studyCourse = Studies.findOne({ facultyId });
    return studyCourse && studyCourse.facultyName;
  },
  departmentName(departmentId) {
    const studyCourse = Studies.findOne({ departmentId });
    return studyCourse && studyCourse.departmentName;
  },
  studyCourseName(studyCourseId, departmentId, facultyId) {
    const studyCourse = Studies.findOne({ $and: [
      { studyCourseId },
      { departmentId },
      { facultyId },
    ] });
    return studyCourse && studyCourse.studyCourseName;
  },
  getAvatarURL (userId, version) {
    const user = Meteor.users.findOne({ _id: userId });
    const image = user && (user.profile.avatar && Images.findOne(user.profile.avatar));
    return (image && image.versions[version]) ? image.link(version) : `/img/${version}.jpg`;
  },
  userProjects() {
    return Projects.find({ team: { $elemMatch: { userId: this._id } } }, { sort: { createdAt: -1 } });
  },
  getUserCollection() {
    return Meteor.users;
  },
});

Template.userProfile.events({
  'click #delete-avatar-button' (event, template) {
  // Images.remove({_id: currentArray[currentSlot].id});
    avatarRemove.call({
      userId: Meteor.userId(),
    }, (err, res) => {
      if (err) {
        alert(err);
      }
    });
  },
});
