import { Template } from 'meteor/templating';
import './login_page.html';

Template.loginPage.helpers(_.extend(LDAP.formHelpers, {
  loggingIn() {
	   return Meteor.loggingIn();
  },
}));

Template.loginPage.events({
  'submit form'(event) {
    event.preventDefault();
  },
});

Template.loginPage.events(LDAP.formEvents);
