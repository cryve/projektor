import { Projects } from '/lib/collections/projects.js';


Projects.insert({
  createdAt: new Date(),
  title: "Beispielprojekt",
  coverImg: "kzhYWad3tTBY3qoQv",
  images: ["Nqdea9R87YpgqooLn", "h4SXySB6R9zhjPQT6", "gL5jxGQQy8EQCGm93", ""],
  subtitle: "Ein Beispiel für ein Projekt",
  description: "Dieses Projekt dient nur als Beispiel. Es zeigt den Entwicklern, ob das Layout funktioniert und wie andere Projekte später wirken. Mehr gibt's hier nicht zu sehen.",
  skills: ["CSS", "HTML5", "Webdesign", "Meteor", "JavaScript"],
  contacts: "Skype, Email und Whatsapp",
  deadline: new Date(),
  likes: 14,
  tags: ["WebApp", "Modern", "Projekt-Plattform", "Kollaboration"],
  owner: "5zSsWpT8GthpzLziB",
});