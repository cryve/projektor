import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import '../lib/collections/projects.js';

import { Accounts } from 'meteor/accounts-base';
import { AccountsServer } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) =>{
  options.profile = {};
  options.profile.lastname = "Mustermann";
  options.profile.firstname = "Max";
  options.profile.study = "Media System";
  options.profile.aboutMe = "Lorem Ipsum ist ein einfacher Demo-Text für die Print- und Schriftindustrie. Lorem Ipsum ist in der Industrie bereits der Standard Demo-Text seit 1500, als ein unbekannter Schriftsteller eine Hand voll Wörter nahm und diese durcheinander warf um ein Musterbuch zu erstellen.";
  options.profile.skills = ["Python", "Java", "HTML/CSS", "Webdesign"];
  options.profile.avatar = "/img/samples/member_icon02.png"
  
  
  
  user.profile = options.profile;
  return user;
  
});

SearchSource.defineSource('packages', function(searchText, options) {
  var options = {sort: {isoScore: -1}, limit: 20};
  
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {$or: [
      {packageName: regExp},
      {description: regExp}
    ]};
    
    return Packages.find(selector, options).fetch();
  } else {
    return Packages.find({}, options).fetch();
  }
});

function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ \-\:]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}



