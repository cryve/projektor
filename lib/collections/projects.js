import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Index } from 'meteor/easy:search';
import { ElasticSearchEngine } from 'meteor/easysearch:elasticsearch';
import SimpleSchema from 'simpl-schema';
import lodash from 'lodash';
import { Courses } from '/lib/collections/courses.js';
import { projectSchema } from './schemas.js';

export const Projects = new Mongo.Collection('projects');

Projects.memberFields = {
  _id: 1,
  createdAt: 1,
  isNewProject: 1,
  permissions: 1,
  title: 1,
  subtitle: 1,
  description: 1,
  coverImg: 1,
  media: 1,
  deadline: 1,
  beginning: 1,
  courseId: 1,
  pdfs: 1,
  notes: 1,
  tags: 1,
  team: 1,
  supervisors: 1,
  jobs: 1,
  contacts: 1,
  teamCommunication: 1,
  occasions: 1,
};

Projects.supervisorFields = Projects.memberFields;
Projects.supervisorFields.notes = 1;

if (Meteor.isServer) {
  Meteor.publish('projectsAll', function projectsAllPublication() {
    if (!this.userId) {
      return this.ready();
    }
    return Projects.find({});
  });
  Meteor.publish('projects.all.list', function projectsAllListPublication() {
    return Projects.find({}, {
      fields: {
        _id: 1,
        createdAt: 1,
      },
    });
  });
  Meteor.publish('projects.cards.single', function projectsCardsSinglePublication(projectId) {
    new SimpleSchema({
      projectId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ projectId });
    return Projects.find({ _id: projectId }, {
      fields: {
        _id: 1,
        createdAt: 1,
        title: 1,
        subtitle: 1,
        coverImg: 1,
        deadline: 1,
        beginning: 1,
        tags: 1,
        'team.userId': 1,
        jobs: 1,
      },
    });
  });
  Meteor.publish('projects.details.single', function projectsDetailsSinglePublication(projectId) {
    new SimpleSchema({
      projectId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ projectId });
    if (!this.userId) {
      return this.ready();
    }
    // TODO: publish supervisorFields only for project supervisors
    return Projects.find(projectId, {
      fields: Projects.supervisorFields,
    });
  });
  Meteor.publish('userProjects', function userProjectsPublication(userId) {
    new SimpleSchema({
      userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ userId });
    return Projects.find({ team: { $elemMatch: { userId } } }, {
      fields: Projects.memberFields,
    });
  });
  Meteor.publish('courseProjects', function courseProjectsPublication(courseId) {
    const course = Courses.findOne(courseId);
    const ownersAsSupervisors = [];
    course && lodash.forEach(course.owner, function(ownerId) {
      const owner = Meteor.users.findOne(ownerId);
      ownersAsSupervisors.push({ userId: owner._id, role: owner.profile.title });
    });
    return Projects.find({
      courseId: course._id,
      supervisors: { $in: ownersAsSupervisors },
    }, { sort: { createdAt: -1 } }, { fields: Projects.memberFields });
  });
}

export const ProjectsIndex = new Index({
  collection: Projects,
  fields: ['title', 'subtitle', 'description', 'jobs.joblabel', 'tags', 'occasions', 'team.userName'],
  /* defaultSearchOptions: {
    sortBy: 'relevance',
  },*/
  engine: new ElasticSearchEngine({
    /* sort: function (searchObject, options) {
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
    client: { host: 'http://dev.projektor.mt.haw-hamburg.de:9200', log: 'trace' },
    query: (searchObject) => {
      if (searchObject.title) {
        const finalQuery = { bool: { must: [] } };
        let words = searchObject.title,
          wordArray = words.split(' ');
        console.log(wordArray);
        _.each(wordArray, function(word) {
          const queryInput = {
            bool: {
              should: [{
                multi_match: {
                  query: word,
                  fields: ['title', 'subtitle', 'description', 'jobs.joblabel', 'tags', 'occasions', 'team.userName'],
                },
              }, {
                regexp: {
                  title: {
                    value: `.*${word}.*`,
                    boost: 1.2,
                  },
                } }, {
                  regexp: {
                    subtitle: {
                      value: `.*${word}.*`,
                      boost: 1.2,
                    },
                  },
                }, {
                  regexp: {
                    description: {
                      value: `.*${word}.*`,
                      boost: 1.2,
                    },
                  },
                }, {
                  regexp: {
                    'jobs.joblabel': {
                      value: `.*${word}.*`,
                      boost: 1.2,
                    },
                  },
                }, {
                  regexp: {
                    tags: {
                      value: `.*${word}.*`,
                      boost: 1.2,
                    },
                  },
                }, {
                  regexp: {
                    occasions: {
                      value: `.*${word}.*`,
                      boost: 1.2,
                    },
                  },
                }, {
                  regexp: {
                    'team.userName': {
                      value: `.*${word}.*`,
                      boost: 1.2,
                    },
                  } },
              ],
              minimum_should_match: 1,
            },
          };
          finalQuery.bool.must.push(queryInput);
        });
        return finalQuery;
      }
    },
    body: (body) => {
      body._source = ['_id'];
      delete body.fields;
      delete body.sort;
      console.log('SearchBody', body);
      return body;
    },
    getElasticSearchDoc: (doc, fields) => {
      console.log('getDoc', doc);
      console.log('getFields', fields);
      return doc;
    },
  }),
});

Projects.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset(); // Prevent user manipulation
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true, // Prevent setting on insert
    optional: true,
  },
}).extend(projectSchema));

// Projects.plugin(mongoosastic);

Projects.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
