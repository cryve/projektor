import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

export const Projects = new Mongo.Collection('projects');

Meteor.methods({
    'projects.insert'(title, description, skills, contacts, deadline) {
        check(title, String);
        check(description, String);
        check(skills, String);
        check(contacts, String);
        check(deadline, String);
        
        Projects.insert({
            //id: new Id,
            //owner: this.userId,
            createdAt: new Date(),
            title,
            description,
            skills,
            contacts,
            deadline,
            likes: 0,

            //tags: tags,
            //deadline: deadline,
            //member: [],
            //
            
            
        });
      
    },
  
    'projects.incrementLikes'(projectId){
      check(projectId, String);
  
      const project = Projects.findOne(projectId);
      Projects.update(project, {$inc: { likes: 1}}); 
  

    }

        
    
  
});
