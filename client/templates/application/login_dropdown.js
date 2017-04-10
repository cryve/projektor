import { Template } from 'meteor/templating'
import './login_dropdown.html';

Template.loginDropdown.helpers(_.extend(LDAP.formHelpers, {
  loggingIn() {
	   return Meteor.loggingIn();
  },
}));

Template.loginDropdown.events({
  "submit form"(event) {
    event.preventDefault();
  },
});

Template.loginDropdown.events(LDAP.formEvents);

LDAP.customFormTemplate.set("loginDropdown");
