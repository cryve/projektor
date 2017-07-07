import { Projects } from '../../../lib/collections/projects.js';
import { Images } from '/lib/collections/images.js';
import { Studies } from '/lib/collections/studies.js';
import { Courses } from '/lib/collections/courses.js';

Template.courseList.onCreated(function userListOnCreated() {
  this.endOfUsers = new ReactiveVar(2);
  this.userItems = new ReactiveArray(['loadCourseUser']);
});

Template.courseList.helpers({
  userItems() {
    if (Template.instance().userItems.array()) {
      return Template.instance().userItems.array();
    }
  },
  endOfUsers() {
    return Template.instance().endOfUsers.get();
  },
});

Template.courseList.events({
  'click #viewMore'(event) {
    const amountOfUser = Meteor.users.find({});
    const value = Template.instance().endOfUsers.get();
    const number = value * 50;
    $('#loader').css({ display: 'block' });
    // $(event.currentTarget).addClass('load-more--loading');
    event.preventDefault();
    Template.instance().userItems.push('loadCourseUser');
    if (number < amountOfUser.count()) {
      const newValue = value + 1;
      Template.instance().endOfUsers.set(newValue);
    } else {
      Template.instance().endOfUsers.set(false);
    }
  },

  'submit .new-tag' (event) {
    event.preventDefault();
    Template.instance().searchTerms.push($('#input-search-term').val());
    Template.instance().setSearch.set(false);
    return $('#input-search-term').val('');
  },
  'click #btn-search' (event) {
    event.preventDefault();
    Template.instance().searchTerms.push($('#input-search-term').val());
    Template.instance().setSearch.set(false);
    return $('#input-search-term').val('');
  },
  'click .btn-remove-search-term' (event) {
    Template.instance().setSearch.set(false);
    return Template.instance().searchTerms.remove(this.toString());
  },
  'click .btn-remove-search-terms' (event) {
    Template.instance().setSearch.set(false);
    return Template.instance().searchTerms.clear();
  },
  'change #sortStatus' (event, template) {
    const selectedSort = template.$('#sortStatus').val();
    Template.instance().setSort.set(selectedSort);
  },
  'change .sorting': (event) => {
    ProjectsIndex.getComponentMethods()
      .addProps('sortBy', $(event.target).val());
  },
});

Template.loadCourseUser.onCreated(function loadCourseUserOnCreated() {
  this.subscribe('user.profile.course', FlowRouter.getParam('courseId'));
});

Template.loadCourseUser.helpers({
  documents () {
    const skip = Template.instance().data * 50;
    $('#loader').css({ display: 'none' });
    // $('.load-more--loading').removeClass('load-more--loading');
    return Meteor.users.find({}, { skip, limit: 50, sort: { createdAt: -1 } });
  },
});

Template.userCourseListItem.onCreated(function userCourseListItemOnCreated() {
  this.autorun(() => {
    //this.subscribe('users.profile.single', Template.currentData().userId);
    if (Template.currentData().userId){
      this.subscribe('files.images.avatar', Template.currentData().userId);
      this.subscribe('singleStudyInfo', Template.currentData().userId);
    }
  });
});

Template.userCourseListItem.helpers({
  studyCourseName(studyCourseId, departmentId, facultyId) {
    const studyCourse = Studies.findOne({ $and: [
      { studyCourseId },
      { departmentId },
      { facultyId },
    ] });
    return studyCourse && studyCourse.studyCourseName;
  },
  user() {
    return Meteor.users.findOne(this.userId);
  },
  avatarURL() {
    const user = Meteor.users.findOne(this._id);
    const image = user && user.profile.avatar && Images.findOne(user.profile.avatar);
    return (image && image.versions.avatar50) ? image.link('avatar50') : '/img/avatar50.jpg';
  },
});
