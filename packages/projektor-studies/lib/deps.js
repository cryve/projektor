import { Meteor } from 'meteor/meteor';
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

if (Meteor.isServer) {
  checkNpmVersions({
    mongoxlsx: '^1.0.12',
  }, 'projektor:studies');
}
checkNpmVersions({
  'simpl-schema': '0.2.3',
  lodash: '4.17.4',
}, 'projektor:studies');
