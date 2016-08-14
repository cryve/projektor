import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';


export const Projects = new Mongo.Collection('projects');

Meteor.methods({
    'projects.insert'(title, description, skills, contacts, deadline, tags, coverImgPath, member) {
        check(title, String);
        check(description, String);
        check(skills, [String]);
        check(contacts, String);
        check(coverImgPath, String);
        check(deadline, Date);
        check(tags, Match.Maybe([String]));
        check(member, String);// optional input, but if present must be string array

        
        Projects.insert({
            //id: new Id,
            //owner: this.userId,
            createdAt: new Date(),
            title,
            coverImgPath,
            description,
            skills,
            contacts,
            deadline,
            likes: 0,
            tags: tags,
            member,
        });
      
    },
    "projects.update"(projectId, projectProperties) {
      check(projectId, String);
      check(projectProperties.title, String);
      check(projectProperties.description, String);
      check(projectProperties.skills, [String]);
      check(projectProperties.contacts, String);
      check(projectProperties.deadline, Date);
      check(projectProperties.tags, Match.Maybe([String]));
      
      Projects.update(projectId, { 
        $set: {
          title: projectProperties.title,
          description: projectProperties.description,
          skills: projectProperties.skills,
          contacts: projectProperties.contacts,
          deadline: projectProperties.deadline,
          tags: projectProperties.tags,
          lastEdit: new Date()
        }
      });
    },  
    "projects.incrementLikes"(projectId){
      check(projectId, String);
  
      const project = Projects.findOne(projectId);
      Projects.update(project, {$inc: { likes: 1}}); 
  

    }

        
    
  
});
