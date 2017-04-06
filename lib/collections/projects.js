import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { projectSchema } from "./schemas.js";
import { Index } from 'meteor/easy:search'
import { ElasticSearchEngine } from 'meteor/easysearch:elasticsearch'
//var mongoose     = require('mongoose');
//var mongoosastic = require('mongoosastic');
//var Schema       = mongoose.Schema;

export const Projects = new Mongo.Collection('projects');

if(Meteor.isServer) {
  Meteor.publish("projects", function projectsPublication() {
    return Projects.find();
  });
}

export const ProjectsIndex = new Index({
  collection: Projects,
  fields: ["title", "subtitle", "description", "jobs.joblabel", "tags", "occasions", "team.userName"],
  /*defaultSearchOptions: {
    sortBy: 'relevance',
  },*/
  engine: new ElasticSearchEngine({
    /*sort: function (searchObject, options) {
      const sortBy = options.search.props.sortBy
      console.log(sortBy);
      // return a mongo sort specifier
      if ('relevance' === sortBy) {
        return ["_score"];

      } else if ('newest' === sortBy) {
        return  [{"deadline" : "desc"}];

      } else if ('bestScore' === sortBy) {
        return [{"deadline" : "asc"}];

      } else {
        throw new Meteor.Error('Invalid sort by prop passed')
      }
    },*/
    query: (searchObject) => {
      if (searchObject.title){
        var finalQuery = { "bool": { "must": [],  } }
        var words = searchObject.title,
        wordArray = words.split(' ');
        console.log(wordArray);
        _.each(wordArray, function(word){
          const queryInput = {
            "bool": {
              "should":[{
                "multi_match" :{
                  "query": word,
                  "fields": [ "title", "subtitle", "description", "jobs.joblabel", "tags", "occasions", "team.userName"]
                }
              },{
                "regexp":{
                  "title":{
                    "value":".*"+word+".*",
                    "boost":1.2
                  }
                }},{
                "regexp":{
                  "subtitle":{
                    "value":".*"+word+".*",
                    "boost":1.2
                  }
                }
              },{
                "regexp":{
                  "description":{
                    "value":".*"+word+".*",
                    "boost":1.2
                  }
                }
              },{
                "regexp":{
                  "jobs.joblabel":{
                    "value":".*"+word+".*",
                    "boost":1.2
                  }
                }
              },{
                "regexp":{
                  "tags":{
                    "value":".*"+word+".*",
                    "boost":1.2
                  }
                }
              },{
                "regexp":{
                  "occasions":{
                    "value":".*"+word+".*",
                    "boost":1.2
                  }
                }
              },{
                "regexp":{
                  "team.userName":{
                    "value":".*"+word+".*",
                    "boost":1.2
                  }
                }}
              ], "minimum_number_should_match": 1
            }
          }
          finalQuery.bool.must.push(queryInput);
        });
        return finalQuery;
      }
    },
     body:(body) => {
       body._source = ["_id"];
       delete body.fields;
       delete body.sort;
       console.log("SearchBody", body);
       return body;
     },
    /*getElasticSearchDoc:(doc, fields) =>{
      console.log("getDoc", doc);
      console.log("getFields", fields);
      return doc;

    }*/
  }),
});

Projects.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset(); // Prevent user manipulation
      }
    },
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true, // Prevent setting on insert
    optional: true,
  },
}).extend(projectSchema));

//Projects.plugin(mongoosastic);

Projects.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
