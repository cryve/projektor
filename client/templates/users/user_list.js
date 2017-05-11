Template.userList.onCreated(function userListOnCreated() {
  Meteor.subscribe("usersAll");
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
      console.log(amountOfUsers.count());
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

Template.loadUser.helpers({
  documents: function () {
    var skip = Template.instance().data * 50
    $("#loader").css({'display':'none'});
    // $('.load-more--loading').removeClass('load-more--loading');
    return Meteor.users.find({}, {skip: skip, limit: 50,sort: { createdAt: -1 }})
  },
});
