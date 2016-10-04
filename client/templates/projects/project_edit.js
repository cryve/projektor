import { Template } from "meteor/templating";
import { Projects } from '/lib/collections/projects.js';
import "./project_edit.html";

Template.projectEdit.onRendered(function() {
  $.fn.editable.defaults.mode = "inline";
  var data = Blaze.getData();
  this.$("#title.editable").editable("destroy").editable({
    display: function() {},
    success: function(response, newValue) {
      Projects.update(data._id, {$set: {title: newValue}});
      console.log(data._id + " set to " + newValue);
    }
  });
});