import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
  'simpl-schema': '0.2.3',
  lodash: '4.17.4',
}, 'projektor:projects');
