Template.userList.onCreated(function userListOnCreated() {
  Meteor.subscribe("usersAll");
});

Template.userList.helpers({
  usersAll() {
    return Meteor.users.find({});
  }
});
