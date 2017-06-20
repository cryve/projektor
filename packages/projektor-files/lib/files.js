import { Meteor } from 'meteor/meteor';
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

if (Meteor.isServer) {
  checkNpmVersions({
    imagemagick: '^0.1.3',
    'fs-extra': '^0.30.0',
  }, 'projektor:users');
}
checkNpmVersions({
  'simpl-schema': '0.2.3',
  lodash: '4.17.4',
}, 'projektor:users');

export const Images = require('./images.js').Images;
export const imageRemove = require('./methods.js').imageRemove;
