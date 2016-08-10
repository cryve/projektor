import { Template } from 'meteor/templating';

import { Projects } from '../../../lib/collections/projects.js';

import './project_details.html';

Template.projectDetails.helpers({
  

   deadlineString(){
      const deadlineValue = this.deadline;
      if(deadlineValue) {
        const month = deadlineValue.getMonth() + 1;
        if (month > 9) {
          return deadlineValue.getDate() + "." + month + "." + deadlineValue.getFullYear();
        }
        return deadlineValue.getDate() + "." + "0" + month + "." + deadlineValue.getFullYear();
      }
      
     
    }
  
});