import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
import './users.js';
import './methods.js';

checkNpmVersions({
  'simpl-schema': '0.2.3',
}, 'projektor:users');
