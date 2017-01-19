import { Template } from 'meteor/templating';

import { Projects } from '/lib/collections/projects.js';


import './landing_page.html';

var keyWord = new ReactiveArray([]);

Template.landingPage.onCreated (function(){
  this.setSearch = new ReactiveVar(true);
 
});

Template.landingPage.helpers({
  projects() {
    return Projects.find({}, { sort: { createdAt: -1 } });
  },

  searchFilter() {
    var search ;  
    if(keyWord.length == 0){
      search = Projects.find({}, { sort: { createdAt: -1 } });
    }
    else{
      _.each(keyWord, function(input){
        console.log(keyWord);
        search = Projects.find({$or: [{title:{$regex: input, $options : 'i'}},{subtitle:{$regex: input, $options : 'i'}},{jobs:{$elemMatch:{joblabel: {$regex: input, $options : 'i'}}}},{tags:{$elemMatch:{$regex: input, $options : 'i'}}}]}, { sort: { createdAt: -1 } });
      });
    };
    
    Template.instance().setSearch.set(true);
    console.log(search);
    return search;
    
  },
  searchFilterNew(){
    Template.instance().setSearch.set(true);
  },
  isSearch(){
    return Template.instance().setSearch.get();
  },
  tags: function() {
    return keyWord.list();
  }

});

Template.landingPage.events({

  /*'submit #listExName'(event) {

    // Prevent default browser form submit

    event.preventDefault();

 

    // Get value from form element

    const target = event.target;

    const text = target.text.value;
    Template.instance().keyWord.set(text);

    console.log(text);

    // Clear form
    Template.instance().setSearch.set(true);

  },*/
  'click #listExAdd' (event){
    event.preventDefault();
    keyWord.push($('#listExName').val());
    Template.instance().setSearch.set(false);
    return $('#listExName').val('');
    
  },
  'click .listExRemove' (event) {
    Template.instance().setSearch.set(false);
    return keyWord.remove(this.toString());
    
  }

});
