import { Template } from 'meteor/templating';

import './layout.html';

// if (Meteor.isClient) {
//   Deps.autorun(function () {
//       this.subscribe("userData");
//   });
// }
//
// if (Meteor.isServer) {
//   Accounts.onLogin(function(info) {
//     console.log("onLogin fired");
//   });
//   Meteor.startup(function () {
//     // code to run on server at startup
//     Meteor.publish("userData", function () {
//       return Meteor.users.find();
//     });
//   });
// }
//
// UI.registerHelper('addKeys', function (all) {
//     return _.map(all, function(i, k) {
//         return {key: k, value: i};
//     });
// });
