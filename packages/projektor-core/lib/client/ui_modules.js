import { Template } from 'meteor/templating';

/*
* Partially inspired by Telescope code base: https://github.com/VulcanJS/Vulcan/blob/legacy/packages/telescope-core/lib/client/templates/modules/modules.js
*/

Template.uiModules.helpers({
  getUiModules(zone) {
    return Projektor.modules.getModulesFromZone(zone);
  },
});
