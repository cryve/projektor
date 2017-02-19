import { Random } from 'meteor/random'
import faker from 'faker';

import { Projects } from '/lib/collections/projects.js';

faker.locale = "de";

/* Set amount of sample docs */
const sampleCountUsers = 20;
const sampleCountProjects = 30;

/* Set field limits */
const maxSizeTeam = 10;
const maxSizeTags = 10;
const maxSizeTeamComm = 5;
const maxSizeContacts = 3;
const maxSizeOccasions = 5;
const maxSizeJobs = 10;
const maxSizeSupervisors = 5;

/* Clear databases */
Meteor.users.remove({});
Projects.remove({});

/* Create sample users */
Factory.define('user', Meteor.users, {
  createdAt: () => faker.date.past(),
  username: () => Random.hexString(6),
  profile: {
    firstname: () => faker.name.firstName(),
    lastname: () => faker.name.lastName(),
    study: () => faker.name.jobArea(),
    aboutMe: () => faker.lorem.sentences(),
    skills: () => [faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea(), faker.name.jobArea()],
    avatar: () => null,
  },
});
const sampleUsers = _.times(sampleCountUsers, i => Factory.create("user"));

/* Create sample projects */
Factory.define("project", Projects, {
  title: () => faker.commerce.productName(),
  subtitle: () => faker.company.catchPhrase(),
  description: () => faker.lorem.sentences(),
  owner: () => ({
    userId: faker.random.arrayElement(sampleUsers)._id,
    wholeName: faker.name.findName(),
  }),
  ownerRole: () => faker.name.jobTitle(),
  team: () => _.times(_.random(maxSizeTeam), i => ({
    userId: faker.random.arrayElement(sampleUsers)._id,
    role: faker.name.jobTitle(),
  })),
  tags: () => _.times(_.random(maxSizeTags), i => faker.commerce.department()),
  contacts: () => _.times(_.random(maxSizeContacts), i => ({
    medium: faker.internet.domainWord(),
    approach: faker.internet.email(),
  })),
  teamCommunication: () => _.times(_.random(maxSizeTeamComm), i => ({
    medium: faker.internet.domainWord(),
    url: faker.internet.url(),
    isPrivate: faker.random.boolean(),
  })),
  occasions: () => _.times(_.random(maxSizeOccasions), i => faker.name.jobArea()),
  jobs: () => _.times(_.random(maxSizeJobs), i => ({
    joblabel: faker.name.jobTitle(),
  })),
  deadline: () => faker.date.future(),
  supervisors: () => _.times(_.random(maxSizeSupervisors), i => {
    return faker.name.prefix() + " " + faker.name.findName();
  }),
  // media: () => [{type: "image", id: Images.findOne()._id}],
  // coverImg: () => Images.findOne()._id,
});
_.times(sampleCountProjects, i => Factory.create("project"));
