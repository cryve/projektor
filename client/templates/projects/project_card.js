import { Template } from 'meteor/templating';
import { Projects } from 'meteor/projektor:projects';
import { Images } from 'meteor/projektor:files';
import Users from 'meteor/projektor:users';
// import truncate from "truncate.js";
// import trunk8 from "trunk8";
import './project_card.html';


// Template.projectCard.onCreated(function projectCardOnCreated() {
//   this.subscribe("projectsAll");
// });

/* Template.projectCard.onRendered(function() {
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

// Template.projectCard.events({
//   "mouseenter .list-div": function(event, template){
//         $(event.currentTarget).find('.description').stop().animate({
//           height: "toggle",
//           opacity: "toggle"
//         }, 300);
//       },
//   "mouseleave .list-div": function(event, template){
//         $(event.currentTarget).find('.description').stop().animate({
//           height: "toggle",
//           opacity: "toggle"
//         }, 300);
//       },
// });

Template.projectCard.events({
  'click .front'(event, template) {
    $('.flipped').removeClass('flipped');
    $(event.currentTarget).parent().addClass('flipped');
  },
  'click .back'(event, template) {
    $(event.currentTarget).parent().removeClass('flipped');
  },
});
// Template.projectCard.events({
//   "click .front": function(event, template){
//       $('.flipped').removeClass("flipped");
//     $(event.currentTarget).parent().addClass("flipped");
//
//   },
//   "click .back": function(event, template){
//     $(event.currentTarget).parent().removeClass("flipped");
//   },
// });
/* Template.projectCardCoverless.onRendered(function() {
  this.autorun(function(){
    data = Blaze.getData();
    $('img[rel="tooltip"]').tooltip();
  });
});

*/
// Template.projectCard.helpers({
//    projects() {
//        return Projects.find({}, { sort: { createdAt: -1 } });
//    },
//    itemsToShow(totalItems, maxItems, placeholderItems) {
//      return (totalItems <= maxItems) ? totalItems : maxItems-placeholderItems;
//     },
//    itemsRemaining(totalItems, maxItems, placeholderItems) {
//      if(totalItems > maxItems)
//        return totalItems-(maxItems-placeholderItems);
//    }
//  });

/* Template.projectCardCoverless.onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});*/

Template.projectCard.onCreated(function() {
  this.remainingMemberCount = new ReactiveVar(0);
  this.remainingJobsCount = new ReactiveVar(0);
  this.autorun(() => {
    this.subscribe('projects.cards.single', Template.currentData().projectId);
  });
});

Template.projectCard.onRendered(function() {
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

  // $(".title-2row").trunk8({
  //   lines: 3, // bug in trunk8? lines: n seems to result in n-1 lines
  //   tooltip: false,
  //   parseHTML: true,
  //   // fill: "<span class='label label-default'>...<span>"
  // });
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

Template.projectCard.helpers({
  projectCard() {
    return Projects.findOne(this.projectId);
  },
  getAvatarURL (userId, version) {
    const user = Users.findOne({ _id: userId });
    const image = user && (user.profile.avatar && Images.findOne(user.profile.avatar));
    return (image && image.versions[version]) ? image.link(version) : `/img/${version}.jpg`;
  },
  itemsToShow(totalItems, maxItems, placeholderItems) {
    return (totalItems <= maxItems) ? totalItems : maxItems - placeholderItems;
  },
  itemsRemaining(totalItems, maxItems, placeholderItems) {
    if (totalItems > maxItems) { return totalItems - (maxItems - placeholderItems); }
  },
});

Template.projectCardCover.onCreated(function projectCardCoverOnCreated() {
  this.autorun(() => {
    this.subscribe('files.images.single', Template.currentData().imgId);
  });
});

Template.projectCardCover.helpers({
  randomColor() {
    const colorArray = [
      '#ef9a9a',
      '#F48FB1',
      '#CE93D8',
      '#B39DDB',
      '#9FA8DA',
      '#90CAF9',
      '#81D4FA',
      '#80DEEA',
      '#80CBC4',
      '#A5D6A7',
      '#C5E1A5',
      '#E6EE9C',
      '#FFF59D',
      '#FFE082',
      '#FFCC80',
      '#FFAB91',
      '#BCAAA4',
      '#EEEEEE',
      '#B0BEC5',
    ];
    const color = colorArray[Math.floor(Math.random() * colorArray.length)];
    return color;
  },
});

// Template.projectCardJobs.onRendered(function() {
//   template = this;
//   this.autorun(() => {
//     let dataContext = Template.currentData(); // Triggers reactive updating
//     Tracker.afterFlush(() => {
//       const lines = (dataContext.expandable)? 6 : 8;
//       this.$(".jobBreak").trunk8({
//         lines: lines,
//         tooltip: false,
//       });
//     });
//   });
// });

Template.projectCardMemberItem.onCreated(function projectCardMemberItemOnCreated() {
  this.autorun(() => {
    this.subscribe('users.list.single', Template.currentData().userId);
    this.subscribe('files.images.avatar', Template.currentData().userId);
  });
});

Template.projectCardMemberItem.helpers({
  user() {
    return Users.findOne(this.userId);
  },
  getAvatarURL (userId, version) {
    const user = Users.findOne(userId);
    const image = user && user.profile && Images.findOne(user.profile.avatar);
    return (image && image.versions[version]) ? image.link(version) : `/img/${version}.jpg`;
  },
});

Template.projectCardJobs.helpers({
  projects() {
    return Projects.find({}, { sort: { createdAt: -1 } });
  },
  itemsToShow(totalItems, maxItems, placeholderItems) {
    return (totalItems <= maxItems) ? totalItems : maxItems - placeholderItems;
  },
  itemsRemaining(totalItems, maxItems, placeholderItems) {
    if (totalItems > maxItems) { return totalItems - (maxItems - placeholderItems); }
  },
});

// Template.projectCardTitle.onRendered(function() {
  // this.$(".title-1row").trunk8({
  //   lines: 2
  // });
  // this.$(".title-2row").trunk8({
  //   lines: 3
  // });
  // this.$(".subtitle-1row").trunk8();
  // this.$(".subtitle-2row").trunk8({
  //   lines: 2
  // });
  // template = this;
  // this.autorun(() => {
  //   let dataContext = Template.currentData(); // Triggers reactive updating
  //   Tracker.afterFlush(() => {
      // should not be neccessary and using the elements text reactively instead
      // this.$(".title-1row").trunk8("update", dataContext.title);
      // this.$(".title-2row").trunk8("update", dataContext.title);
      // this.$(".subtitle-1row").trunk8("update", dataContext.subtitle);
      // this.$(".subtitle-2row").trunk8("update", dataContext.subtitle);
//     });
//   });
// });

// Template.projectCardTitle.onRendered(function() {
//   console.log(document.getElementById("title-ellipses"))
//   var test = $clamp(document.getElementById("title-ellipses"), {clamp: 2});
//   return test;
// });
// Template.projectCardTags.onRendered(function() {
//   template = this;
//   this.autorun(() => {
//     let dataContext = Template.currentData();
//     Tracker.afterFlush(() => {
//       $(".ellipsis-tags").trunk8({
//         lines: 1,
//         tooltip: false,
//         // parseHTML: true,
//         // fill: "<span class='label label-default'>...<span>"
//       });
//     });
//   });
// });
