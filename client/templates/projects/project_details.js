import { Template } from 'meteor/templating';

import { Projects } from '../../../imports/api/projects.js';

import './project_details.html';

Template.projectDetails.helpers({
  

   deadlineString(){
      var deadlineValue = this.deadline;
      var month = deadlineValue.getMonth()+1;
      if (month > 9){
        return deadlineValue.getDate() + "." + month + "." + deadlineValue.getFullYear();
      }
        return deadlineValue.getDate() + "." + "0" + month + "." + deadlineValue.getFullYear();
 
     
    }
  
});