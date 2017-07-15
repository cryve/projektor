import { Template } from 'meteor/templating';
import { Projects, ProjectsIndex } from 'meteor/projektor:projects';
import './landing_page.html';


Template.landingPage.onCreated(function landingPageOnCreated() {
  this.endOfProjects = new ReactiveVar(2);
  this.navItems = new ReactiveArray(['loadCards']);
  Session.set('previousRoute', FlowRouter.getRouteName());
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
