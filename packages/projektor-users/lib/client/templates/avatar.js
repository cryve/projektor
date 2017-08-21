import { Template } from 'meteor/templating';
import './avatar.html';
import Users from 'meteor/projektor:users';
import { Images } from 'meteor/projektor:files';

Template.avatar.onCreated(function () {
  this.autorun(() => {
    const user = Users.findOne(Template.currentData().userId);
    if (user && user.profile.avatar) {
      this.subscribe('files.images.single', user.profile.avatar);
    }
  });
});

Template.avatar.helpers({
  avatarUrl() {
    const user = Users.findOne(this.userId);
    const avatarImage = user && Images.findOne(user.profile.avatar);
    const avatarUrl = (avatarImage && avatarImage.versions[this.version]) ? avatarImage.link(this.version) : `/img/${this.version}.jpg`;
    return avatarUrl;
  },
});
