import { Template } from 'meteor/templating';
import {ImagesGallery} from "/lib/images.collection.js";
import { Projects } from '../../../lib/collections/projects.js';
import truncate from "truncate.js";
import trunk8 from "trunk8";

import './project_card.html';

/*Template.projectCard.onRendered(function() {
  // this.autorun(function(){
  //   data = Blaze.getData();
  //   $('img[rel="tooltip"]').tooltip();
  // });
  $(".ellipsis-tags").trunk8({
    lines: 1,
    tooltip: false,
  });
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
});

Template.projectCardCoverless.onRendered(function() {
  // var tmplInst = this;
  // tmplInst.autorun(function() {
  //   Tracker.afterFlush(function() {
  //     tmplInst.$(".title-1row").trunk8();
  //     console.log("trunk8");
  //   });
  // });

  // $(".ellipsis-tags").truncate({
  //   lines: 1,
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

  $(".ellipsis-tags").trunk8({
    lines: 1,
    tooltip: false,
    // parseHTML: true,
    // fill: "<span class='label label-default'>...<span>"
  });
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

  // $(".ellipsis-tags").truncate("update");
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
  // $(".ellipsis-tags").dotdotdot({
  //       /*  The text to add as ellipsis. */
  //   ellipsis  : '... ',
  //
  //   /*  How to cut off the text/html: 'word'/'letter'/'children' */
  //   wrap    : 'word',
  //
  //   /*  Wrap-option fallback to 'letter' for long words */
  //   fallbackToLetter: true,
  //
  //   /*  jQuery-selector for the element to keep and put after the ellipsis. */
  //   after   : null,
  //
  //   /*  Whether to update the ellipsis: true/'window' */
  //   watch   : false,
  //
  //   /*  Optionally set a max-height, if null, the height will be measured. */
  //   height    : 18,
  //
  //   /*  Deviation for the height-option. */
  //   tolerance : 5,
  //
  //   /*  Callback function that is fired after the ellipsis is added,
  //     receives two parameters: isTruncated(boolean), orgContent(string). */
  //   callback  : function( isTruncated, orgContent ) {},
  //
  //   lastCharacter : {
  //
  //     /*  Remove these characters from the end of the truncated text. */
  //     remove    : [ ' ', ',', ';', '.', '!', '?' ],
  //
  //     /*  Don't add an ellipsis if this array contains
  //       the last character of the truncated text. */
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

Template.projectCardTitle.onRendered(function() {
  this.$(".title-1row").trunk8();
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
      this.$(".subtitle-1row").trunk8("update", dataContext.subtitle);
      this.$(".subtitle-2row").trunk8("update", dataContext.subtitle);
    });
  });
});

Template.projectCardJobs.onRendered(function() {
  this.$(".jobBreak").trunk8();
  // $(".jobs-box-body").dotdotdot({
  //   wrap: "letter"
  // });
  template = this;
  this.autorun(() => {
    let dataContext = Template.currentData(); // Triggers reactive updating
    Tracker.afterFlush(() => {
      //FIXME: Workaround to force trunk8 to use the new titel
      // should not be neccessary and using the elements text reactively instead
      this.$(".jobBreak").trunk8("update",dataContext.jobs.joblabel);
      //$(".jobs-box-body > ul").dotdotdot({
        //wrap: "letter"
      //});
    });
  });
});

Template.projectCard.onRendered(function() {
  this.$(".jobBreak").trunk8();
  // $(".jobs-box-body").dotdotdot({
  //   wrap: "letter"
  // });
  template = this;
  this.autorun(() => {
    let dataContext = Template.currentData(); // Triggers reactive updating
    Tracker.afterFlush(() => {
      //FIXME: Workaround to force trunk8 to use the new titel
      // should not be neccessary and using the elements text reactively instead
      this.$(".jobBreak").trunk8("update",dataContext.jobs.joblabel);
      //$(".jobs-box-body > ul").dotdotdot({
        //wrap: "letter"
      //});
    });
  });
});
