import { Images } from 'meteor/projektor:files';
import Users from 'meteor/projektor:users';

Template.userList.onCreated(function userListOnCreated() {
  this.endOfUsers = new ReactiveVar(2);
  this.userItems = new ReactiveArray(['loadUser']);
});

Template.userList.helpers({
  userItems() {
    if (Template.instance().userItems.array()) {
      return Template.instance().userItems.array();
    }
  },
  endOfUsers() {
    return Template.instance().endOfUsers.get();
  },
});

Template.userList.events({
  'click #viewMore'(event) {
    const amountOfUser = Users.find({});
    const value = Template.instance().endOfUsers.get();
    const number = value * 50;
    $('#loader').css({ display: 'block' });
    // $(event.currentTarget).addClass('load-more--loading');
    event.preventDefault();
    Template.instance().userItems.push('loadUser');
    if (number < amountOfUser.count()) {
      console.log(number);
      console.log(amountOfUser.count());
      const newValue = value + 1;
      Template.instance().endOfUsers.set(newValue);
    } else {
      console.log(number);
      console.log(amountOfUser.count());
      Template.instance().endOfUsers.set(false);
    }
  },

  'submit .new-tag' (event) {
    event.preventDefault();
    Template.instance().keyWord.push($('#listExName').val());
    Template.instance().setSearch.set(false);
    return $('#listExName').val('');
  },
  'click #listExAdd' (event) {
    event.preventDefault();
    Template.instance().keyWord.push($('#listExName').val());
    Template.instance().setSearch.set(false);
    return $('#listExName').val('');
  },
  'click .listExRemove' (event) {
    Template.instance().setSearch.set(false);
    return Template.instance().keyWord.remove(this.toString());
  },
  'click .listRemove' (event) {
    Template.instance().setSearch.set(false);
    return Template.instance().keyWord.clear();
  },
  'change #sortStatus' (event, template) {
    const selectedSort = template.$('#sortStatus').val();
    console.log(selectedSort);
    Template.instance().setSort.set(selectedSort);
  },
  'change .sorting': (event) => {
    ProjectsIndex.getComponentMethods()
      .addProps('sortBy', $(event.target).val());
  },
});

Template.loadUser.onCreated(function loadUserOnCreated() {
  this.subscribe('users.list.all');
});

Template.loadUser.helpers({
  documents () {
    const skip = Template.instance().data * 50;
    $('#loader').css({ display: 'none' });
    // $('.load-more--loading').removeClass('load-more--loading');
    return Users.find({}, { skip, limit: 50, sort: { createdAt: -1 } });
  },
});

Template.userListItem.onCreated(function userListItemOnCreated() {
  this.autorun(() => {
    this.subscribe('users.profile.single', Template.currentData().userId);
  });
});

Template.userListItem.helpers({
  user() {
    return Users.findOne(this.userId);
  },
});
