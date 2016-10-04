import { Accounts } from 'meteor/accounts-base';
import { AccountsServer } from 'meteor/accounts-base';

 

Accounts.ui.config({

  passwordSignupFields: 'USERNAME_ONLY',
  
});

/*var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 5,
  },
  
  pwd
]); */

