import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Template } from 'meteor/templating';
import ValidationError from 'meteor/mdg:validation-error'
import { Projects } from 'meteor/projektor:projects';
import { Random } from 'meteor/random';
import lodash from 'lodash';
import '../lib/ui_modules.js';
// import { withRenderedTemplate } from './test_helpers.js';
// import '../lib/gallery.js';

describe("Gallery UI Modules", function() {
  it('should has access to Projektor.modules.add()', function() {
    chai.assert.isFunction(Projektor.modules.add, "can add UI modules to Projektor");
  });
  it('should have gallery template', function() {
    if (Meteor.isClient) {
      chai.assert.isTrue(Blaze.isTemplate(Template.gallery), "gallery is a Blaze Template");
    }
  });
  it('gallery template should have zones galleryPreview and galleryThumbs');
  it('should add gallery template to projectContent zone', function() {
    const galleryModule = { template: "gallery" };

    const module = lodash.find(Projektor.modules.projectContent, value => lodash.isEqual(galleryModule, value));
    chai.assert.isDefined(module, "gallery template was added to projectContent");
  });
});
