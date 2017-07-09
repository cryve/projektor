import { Template } from 'meteor/templating';
import { Projects, ProjectsIndex } from '/lib/collections/projects.js';
import './landing_page.html';


Template.landingPage.onCreated(function landingPageOnCreated() {
  this.skipValue = 0;
  this.endOfProjects = new ReactiveVar(2);
  this.setSort = new ReactiveVar('new');
  this.searchTerms = new ReactiveArray([]);
  this.cardsAreas = new ReactiveArray(['cardArea']);
  Session.set('previousRoute', FlowRouter.getRouteName());
});

Template.landingPage.onRendered(function landingPageOnRendered() {
  const searchTerms = this.searchTerms;
  this.autorun(function() {
    searchTerms.depend();
    ProjectsIndex.getComponentMethods().search(searchTerms.join([separator = ' ']));
  });
});

Template.landingPage.helpers({
  isReady () {
    return Template.instance().pagination.ready();
  },
  templatePagination () {
    return Template.instance().pagination;
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
  originalId(searchDoc) {
    return searchDoc.__originalId;
  },
  tags() {
    return Template.instance().searchTerms.array();
  },
  cardsAreas() {
    if (Template.instance().cardsAreas.array()) {
      return Template.instance().cardsAreas.array();
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
    Template.instance().cardsAreas.push('cardArea');
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
  'click #btn-search' (event) {
    event.preventDefault();
    Template.instance().searchTerms.push($('#input-search-term').val());
    $('#input-search-term').val('');
  },
  'click .btn-remove-search-term' (event) {
    Template.instance().searchTerms.remove(this.toString());
  },
  'click .btn-remove-search-terms' (event) {
    Template.instance().searchTerms.clear();
  },
  'change #sortStatus' (event, template) {
    const selectedSort = template.$('#sortStatus').val();
    console.log(selectedSort);
    Template.instance().setSort.set(selectedSort);
  },
  'change .sorting': (event) => {
    // ProjectsIndex.getComponentMethods()
    //   .addProps('sortBy', $(event.target).val());
  },

});

Template.cardArea.onCreated(function cardAreaOnCreated() {
  this.subscribe('projects.all.list');
});

Template.cardArea.helpers({
  documents () {
    const skip = Template.instance().data * 12;
    $('#loader').css({ display: 'none' });
    // $('.load-more--loading').removeClass('load-more--loading');
    //console.log(Projects.find({ courseId: { $exists: false} }).count());
    return Projects.find({ courseId: { $exists: false} }, { skip, limit: 12, sort: { createdAt: -1 } });
  },
});
