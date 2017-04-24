import { Template } from 'meteor/templating';
import { Projects } from '/lib/collections/projects.js';
//import { ProjectsIndex } from '/lib/collections/projects.js';
import './landing_page.html';



Template.landingPage.onCreated (function landingPageOnCreated() {
  this.setSearch = new ReactiveVar(true);
  this.setSort = new ReactiveVar("new");
  this.keyWord = new ReactiveArray([]);
  Meteor.subscribe("projects");
  Session.set("previousRoute", Router.current().route.getName());
});

// Template.landingPage.onRendered(function landingPageOnRendered(){
//   const keyWord = this.keyWord;
//   Tracker.autorun(function(){
//     keyWord.depend();
//     ProjectsIndex.getComponentMethods().search(keyWord.join([separator = ' ']));
//   });
//
// });

Template.landingPage.helpers({
  projects() {
    return Projects.find({}, { sort: { createdAt: -1 } });
  },
  // projectsIndex: () => {
  //   return ProjectsIndex;
  // },
  originalDoc(searchDoc) {
    searchDoc._id = searchDoc.__originalId;
    delete searchDoc.__originalId;
    return searchDoc;

  },
  /*projects2() {
    const body = Projects.search({
      "query": {
          "match" : {
              "title" : "steel"
          }
      }
    }, function(err, people){
       // all the people who fit the age group are here!
    });

    return body;
  },*/
    /*searchFilter() {
    var getSort = Template.instance().setSort.get();
    var search ;
    var count = 0;
    if(Template.instance().setSort.get()){
      if(getSort == "new"){
        var sortValue = {};
        sortValue["createdAt"] = -1;
      }
      else if (getSort == "old"){
        var sortValue = {};
        sortValue["createdAt"] = +1;
      }
      else if (getSort == "deadlineNear"){
        var sortValue = {};
        sortValue["deadline"] = +1;
      }
      else if (getSort == "deadlineFar"){
        var sortValue = {};
        sortValue["deadline"] = -1;
      }
      if(keyWord.length == 0){
        Template.instance().setSearch.set(true);
        search = Projects.find({}, { sort: sortValue });
      }
      else{
        _.each(keyWord, function(input){
          if(keyWord[count] == keyWord[0]){
            search = Projects.find({$or: [{title:{$regex: input, $options : 'i'}},{subtitle:{$regex: input, $options : 'i'}},{jobs:{$elemMatch:{joblabel: {$regex: input, $options : 'i'}}}},{tags:{$elemMatch:{$regex: input, $options : 'i'}}},{occasions:{$elemMatch:{$regex: input, $options : 'i'}}},{description:{$regex: input, $options : 'i'}},{"owner.wholeName":{$regex: input, $options : 'i'}},{team:{$elemMatch:{userName: {$regex: input, $options : 'i'}}}}]}, { sort: sortValue });
            count++;
          }
          else{
            var searchArray = [];
              search.forEach(function(x){
                var id = x._id;

                search = Projects.find({ _id: id,
                    $or:[
                         {title:{$regex: input, $options : 'i'}},{subtitle:{$regex: input, $options : 'i'}},{jobs:{$elemMatch:{joblabel: {$regex: input, $options : 'i'}}}},{tags:{$elemMatch:{$regex: input, $options : 'i'}}},{occasions:{$elemMatch:{$regex: input, $options : 'i'}}},{description:{$regex: input, $options : 'i'}},{"owner.wholeName":{$regex: input, $options : 'i'}},{team:{$elemMatch:{userName: {$regex: input, $options : 'i'}}}}
                    ]});
                if(search.count() == 1){
                  searchArray.push(x);
                }
              });
              search = searchArray;
          }
        });
      }
      if(getSort == "deadlineFar" || getSort == "deadlineNear"){
        var searchDeadline = [];
        var emptyDeadline = [];
        search.forEach(function(x){
          var deadline = x.deadline;

          if(deadline != undefined){
            if (deadline > new Date()){
              searchDeadline.push(x);
            }
          }
          else{
            emptyDeadline.push(x);
          }
        });
        if(getSort == "deadlineFar"){
          Array.prototype.push.apply(emptyDeadline, searchDeadline);
          search = emptyDeadline;
        }
        else if(getSort == "deadlineNear"){
        Array.prototype.push.apply(searchDeadline,emptyDeadline);
          search = searchDeadline;
        }

      }
    }

    Template.instance().setSearch.set(true);
    return search;

  },*/



  /*searchFilterNew(){
    Template.instance().setSearch.set(true);
  },
  isSearch(){
    return Template.instance().setSearch.get();
  },
  isSort(){
    return Template.instance().setSort.get();
  },*/
  tags: function() {
    return Template.instance().keyWord.array();
  }

});

Template.landingPage.events({

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
