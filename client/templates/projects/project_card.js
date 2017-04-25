import { Template } from 'meteor/templating';
import { Projects } from '/lib/collections/projects.js';
import truncate from "truncate.js";
import trunk8 from "trunk8";

import './project_card.html';


Template.projectCard.onCreated(function projectCardOnCreated() {
  Meteor.subscribe("projectsAll");
});

/*Template.projectCard.onRendered(function() {
  // this.autorun(function(){
  //   data = Blaze.getData();
  //   $('img[rel="tooltip"]').tooltip();
  // });
  $(".title-1row").trunk8({
    lines: 2, // bug in trunk8? lines: n seems to result in n-1 lines
    tooltip: false
  });
  $(".title-2row").trunk8({
    lines: 3, // bug in trunk8? lines: n seems to result in n-1 lines
    tooltip: false,
    parseHTML: true,
    // fill: "<span class='label label-default'>...<span>"
  });
  $(".subtitle-1row").trunk8({
    lines: 1,
    tooltip: false,
  });
});*/

Template.projectCard.events({
  "mouseenter .list-div": function(event, template){
        $(event.currentTarget).find('.description').stop().animate({
          height: "toggle",
          opacity: "toggle"
        }, 300);
      },
  "mouseleave .list-div": function(event, template){
        $(event.currentTarget).find('.description').stop().animate({
          height: "toggle",
          opacity: "toggle"
        }, 300);
      },
});

/*Template.projectCardCoverless.onRendered(function() {
  this.autorun(function(){
    data = Blaze.getData();
    $('img[rel="tooltip"]').tooltip();
  });
});

*/
Template.projectCard.helpers({
   projects() {
       return Projects.find({}, { sort: { createdAt: -1 } });
   },
   itemsToShow(totalItems, maxItems, placeholderItems) {
     return (totalItems <= maxItems) ? totalItems : maxItems-placeholderItems;
    },
   itemsRemaining(totalItems, maxItems, placeholderItems) {
     if(totalItems > maxItems)
       return totalItems-(maxItems-placeholderItems);
   }
 });

/*Template.projectCardCoverless.onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});*/

Template.projectCardCoverless.onCreated(function() {
  // var tmplInst = this;
  // tmplInst.autorun(function() {
  //   console.log("autorun");
  //   Tracker.afterFlush(function() {
  //     tmplInst.$(".title-1row").trunk8();
  //     console.log("trunk8");
  //   });
  // });
  this.remainingMemberCount = new ReactiveVar(0);
  this.remainingJobsCount = new ReactiveVar(0);
  Meteor.subscribe("projectsAll");
});

Template.projectCardCoverless.onRendered(function() {
  // var tmplInst = this;
  // tmplInst.autorun(function() {
  //   Tracker.afterFlush(function() {
  //     tmplInst.$(".title-1row").trunk8();
  //     console.log("trunk8");
  //   });
  // });

  // this.$(".subtitle-2row").trunk8({
  //   lines: 2
  // });
  // template = this;
  // this.autorun(() => {
  //   let dataContext = Template.currentData(); // Triggers reactive updating
  //   Tracker.afterFlush(() => {
  //     //FIXME: Workaround to force trunk8 to use the new titel
  //     // should not be neccessary and using the elements text reactively instead
  //     this.$(".title-1row").trunk8("update", dataContext.title);
  //     this.$(".subtitle-1row").trunk8("update", dataContext.subtitle);
  //     this.$(".subtitle-2row").trunk8("update", dataContext.subtitle);
  //   });
  // });
  // $(".title-1row").trunk8({
  //   lines: 2, // bug in trunk8? lines: n seems to result in n-1 lines
  //   tooltip: false
  // });
  // $(".title-1row").trunk8("update", "Test mit viel zu langem String");

  $(".title-2row").trunk8({
    lines: 3, // bug in trunk8? lines: n seems to result in n-1 lines
    tooltip: false,
    parseHTML: true,
    // fill: "<span class='label label-default'>...<span>"
  });
  // $(".subtitle-2row").trunk8({
  //   lines: 2,
  //   tooltip: false,
  //   //parseHTML: true,
  //   // fill: "<span class='label label-default'>...<span>"
  // });
  // $(".truncate-2row").trunk8({
  //   lines: 1,
  //   tooltip: false,
  //   // parseHTML: true,
  //   // fill: "<span class='label label-default'>...<span>"
  // });
  // $('[data-truncate="true"]').each(function( index, element ) {
  //   $(element).trunk8({
  //     lines: $(this).data("truncate-lines"),
  //     parseHTML: true
  //   });
  //   console.log("Lines for " + $(element).text() + ": " + $(element).data("truncate-lines"));
  // });

  // $(".title-1row").dotdotdot({
  //   ellipsis  : '...',
  //   wrap    : 'word',
  //   fallbackToLetter: true,
  //   after   : null,
  //   watch   : false,
  //   height    : 27,
  //   tolerance : 5,
  //   callback  : function( isTruncated, orgContent ) {},
  //   lastCharacter : {
  //     remove    : [ ' ', ',', ';', '.', '!', '?' ],
  //     noEllipsis  : []
  //   }
  // });
  // $(".title-2row").dotdotdot({
  //   ellipsis  : '...',
  //   wrap    : 'word',
  //   fallbackToLetter: true,
  //   after   : null,
  //   watch   : false,
  //   height    : 60,
  //   tolerance : 5,
  //   callback  : function( isTruncated, orgContent ) {},
  //   lastCharacter : {
  //     remove    : [ ' ', ',', ';', '.', '!', '?' ],
  //     noEllipsis  : []
  //   }
  // });
  // $(".subtitle-2row").dotdotdot({
  //   ellipsis  : '...',
  //   wrap    : 'word',
  //   fallbackToLetter: true,
  //   after   : null,
  //   watch   : false,
  //   height    : 43,
  //   tolerance : 5,
  //   callback  : function( isTruncated, orgContent ) {},
  //   lastCharacter : {
  //     remove    : [ ' ', ',', ';', '.', '!', '?' ],
  //     noEllipsis  : []
  //   }
  // });
  // $(".title-1row").trunk8("update");
});

Template.projectCardCoverless.helpers({
   projects() {
    return Projects.find({}, { sort: { createdAt: -1 } });
   },
  itemsToShow(totalItems, maxItems, placeholderItems) {
    return (totalItems <= maxItems) ? totalItems : maxItems-placeholderItems;
   },
  itemsRemaining(totalItems, maxItems, placeholderItems) {
    if(totalItems > maxItems)
      return totalItems-(maxItems-placeholderItems);
  }
});

Template.projectCardJobs.onRendered(function() {
  template = this;
  this.autorun(() => {
    let dataContext = Template.currentData(); // Triggers reactive updating
    Tracker.afterFlush(() => {
      const lines = (dataContext.expandable)? 6 : 8;
      this.$(".jobBreak").trunk8({
        lines: lines,
        tooltip: false,
      });
    });
  });
});

Template.projectCardJobs.helpers({
   projects() {
    return Projects.find({}, { sort: { createdAt: -1 } });
   },
  itemsToShow(totalItems, maxItems, placeholderItems) {
    return (totalItems <= maxItems) ? totalItems : maxItems-placeholderItems;
   },
  itemsRemaining(totalItems, maxItems, placeholderItems) {
    if(totalItems > maxItems)
      return totalItems-(maxItems-placeholderItems);
  }
});

Template.projectCardTitle.onRendered(function() {
  this.$(".title-1row").trunk8({
    lines: 2
  });
  this.$(".title-2row").trunk8({
    lines: 3
  });
  this.$(".subtitle-1row").trunk8();
  this.$(".subtitle-2row").trunk8({
    lines: 2
  });
  template = this;
  this.autorun(() => {
    let dataContext = Template.currentData(); // Triggers reactive updating
    Tracker.afterFlush(() => {
      //FIXME: Workaround to force trunk8 to use the new titel
      // should not be neccessary and using the elements text reactively instead
      this.$(".title-1row").trunk8("update", dataContext.title);
      this.$(".title-2row").trunk8("update", dataContext.title);
      this.$(".subtitle-1row").trunk8("update", dataContext.subtitle);
      this.$(".subtitle-2row").trunk8("update", dataContext.subtitle);
    });
  });
});

Template.projectCardTags.onRendered(function() {
  template = this;
  this.autorun(() => {
    let dataContext = Template.currentData();
    Tracker.afterFlush(() => {
      //FIXME: Rerender tags when dataContext changes
      $(".ellipsis-tags").trunk8({
        lines: 1,
        tooltip: false,
        // parseHTML: true,
        // fill: "<span class='label label-default'>...<span>"
      });
    });
  });
});
