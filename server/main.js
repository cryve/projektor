import { Meteor } from 'meteor/meteor';

import '../lib/collections/projects.js';

import { Accounts } from 'meteor/accounts-base';
import { AccountsServer } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) =>{
  options.profile = {};
  options.profile.lastname = "hgdh";
  user.profile = options.profile;
  return user;
});

