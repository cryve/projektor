import { Template } from 'meteor/templating';
import { Projects } from '/lib/collections/projects.js';
import { ProjectsIndex } from '/lib/collections/projects.js';
import { Images } from 'meteor/projektor:files';
import './landing_page.html';


Template.landingPage.onCreated(function landingPageOnCreated() {
  this.skipValue = 0;
  this.setSearch = new ReactiveVar(true);
  this.endOfProjects = new ReactiveVar(2);
  this.setSort = new ReactiveVar('new');
  this.keyWord = new ReactiveArray([]);
  this.navItems = new ReactiveArray(['loadCards']);
  console.log(FlowRouter.current());
  Session.set('previousRoute', FlowRouter.getRouteName());
});

Template.landingPage.onRendered(function landingPageOnRendered() {
  const keyWord = this.keyWord;
  Tracker.autorun(function() {
    keyWord.depend();
    ProjectsIndex.getComponentMethods().search(keyWord.join([separator = ' ']));
  });
});

Template.landingPage.helpers({
  isReady () {
    return Template.instance().pagination.ready();
  },
  templatePagination () {
    return Template.instance().pagination;
  },
  documents () {
    return Template.instance().pagination.getPage();
  },
  clickEvent() {
    return function(e, templateInstance, clickedPage) {
      e.preventDefault();
    };
  },
  projects() {
    return Projects.find({}, { sort: { createdAt: -1 } });
  },
  projectsIndex: () => ProjectsIndex,
  originalDoc(searchDoc) {
    searchDoc._id = searchDoc.__originalId;
    delete searchDoc.__originalId;
    return searchDoc;
  },
  /* projects2() {
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
    /* searchFilter() {
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


  /* searchFilterNew(){
    Template.instance().setSearch.set(true);
  },
  isSearch(){
    return Template.instance().setSearch.get();
  },
  isSort(){
    return Template.instance().setSort.get();
  },*/
  tags() {
    return Template.instance().keyWord.array();
  },
  navItems() {
    if (Template.instance().navItems.array()) {
      return Template.instance().navItems.array();
    }
  },
  endOfDocuments () {
    return Template.instance().endOfProjects.get();
  },
});

Template.landingPage.events({

  'click #viewMore'(event) {
    const amountOfProjects = Projects.find({});
    const value = Template.instance().endOfProjects.get();
    const number = value * 12;
    $('#loader').css({ display: 'block' });
    // $(event.currentTarget).addClass('load-more--loading');
    event.preventDefault();
    Template.instance().navItems.push('loadCards');
    if (number < amountOfProjects.count()) {
      const newValue = value + 1;
      Template.instance().endOfProjects.set(newValue);
    } else {
      Template.instance().endOfProjects.set(false);
    }
  },
  'click #change' (event, templateInstance) {
    templateInstance.pagination.currentPage(Math.round(Math.random() * 10));
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

Template.loadCards.onCreated(function loadCardsOnCreated() {
  this.subscribe('projects.all.list');
});

Template.loadCards.helpers({
  documents () {
    const skip = Template.instance().data * 12;
    $('#loader').css({ display: 'none' });
    // $('.load-more--loading').removeClass('load-more--loading');
    return Projects.find({}, { skip, limit: 12, sort: { createdAt: -1 } });
  },
});
