import { Projects } from '../../../lib/collections/projects.js';
import {Images} from "/lib/collections/images.js";
import { Studies } from "/lib/collections/studies.js";

Template.userList.onCreated(function userListOnCreated() {
  this.autorun(() => {
    this.subscribe("usersAll");
  });
  this.endOfUsers = new ReactiveVar(2);
  this.userItems = new ReactiveArray(["loadUser"]);
});

Template.userList.helpers({
  usersAll() {
    return Meteor.users.find({});
  },
  userItems(){
    if (Template.instance().userItems.array()){
      return Template.instance().userItems.array();
    }
  },
  endOfUsers() {
    return Template.instance().endOfUsers.get();
  },
});

Template.userList.events({
  "click #viewMore"(event){
    var amountOfUser =  Meteor.users.find({});
    const value = Template.instance().endOfUsers.get();
    var number = value * 50;
    $("#loader").css({'display':'block'});
    //$(event.currentTarget).addClass('load-more--loading');
    event.preventDefault();
    Template.instance().userItems.push("loadUser");
    if (number < amountOfUser.count()){
      console.log(number);
      console.log(amountOfUser.count());
      const newValue = value + 1;
      Template.instance().endOfUsers.set(newValue);
    }
    else {
      console.log(number);
      console.log(amountOfUser.count());
      Template.instance().endOfUsers.set(false);
    }
  },

  'submit .new-tag' (event){
    event.preventDefault();
    Template.instance().keyWord.push($('#listExName').val());
    Template.instance().setSearch.set(false);
    return $('#listExName').val('');

  },
  'click #listExAdd' (event){
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
  'change #sortStatus' (event, template){
    var selectedSort = template.$("#sortStatus").val();
    console.log(selectedSort);
    Template.instance().setSort.set(selectedSort);
  },
  'change .sorting': (event) => {
    ProjectsIndex.getComponentMethods()
      .addProps('sortBy', $(event.target).val())
  },
});

Template.loadUser.onCreated (function(){
  this.autorun(() => {
    this.subscribe("files.images.all");
  });
  this.autorun(() => {
    this.subscribe("usersAll");
  });
  this.autorun(() => {
    this.subscribe("studies");
  });
});

Template.loadUser.helpers({
  studyCourseName(studyCourseId, departmentId, facultyId) {
    const studyCourse = Studies.findOne({ $and: [
      { "studyCourseId": studyCourseId },
      { "departmentId": departmentId },
      { "facultyId": facultyId }
    ]});
    return studyCourse && studyCourse.studyCourseName;
  },
  getAvatarURL (userId, version){
    var user = Meteor.users.findOne({_id: userId});
    var image = user && (user.profile.avatar && Images.findOne(user.profile.avatar));
    return (image && image.versions[version]) ? image.link(version) : "/img/"+version+".jpg";
  },
  documents: function () {
    var skip = Template.instance().data * 50
    $("#loader").css({'display':'none'});
    // $('.load-more--loading').removeClass('load-more--loading');
    return Meteor.users.find({}, {skip: skip, limit: 50,sort: { createdAt: -1 }})
  },
});
