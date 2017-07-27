import { Template } from 'meteor/templating';

Template.uiModules.helpers({
  getUiModules(zone) {
    return Projektor.modules[zone];
  },
});
