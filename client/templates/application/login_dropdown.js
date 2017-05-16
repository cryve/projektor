import { Template } from 'meteor/templating'
import {Images} from "/lib/collections/images.js";
import './login_dropdown.html';

Template.loginDropdown.onCreated (function(){
  this.autorun(() => {
    this.subscribe("files.images.avatar", Meteor.userId());
    this.subscribe("singleUser", Meteor.userId());
  });
  this.autorun(() => {
    //this.subscribe("usersAll");
  });
});

Template.loginDropdown.helpers(_.extend(LDAP.formHelpers, {
  loggingIn() {
	   return Meteor.loggingIn();
  },
  getAvatarURL (userId, version){
    var user = Meteor.users.findOne({_id: userId});
    var image = user && (user.profile.avatar && Images.findOne(user.profile.avatar));
    return (image && image.versions[version]) ? image.link(version) : "/img/"+version+".jpg";
  },
}));

Template.loginDropdown.events({
  "submit form"(event) {
    event.preventDefault();
  },
});

Template.loginDropdown.events(LDAP.formEvents);

LDAP.customFormTemplate.set("loginDropdown");
