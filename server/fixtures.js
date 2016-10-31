import { Projects } from '/lib/collections/projects.js';

Projects.insert({
  createdAt: new Date(),
  coverImg: "ddfsdfdsf",
  title: "BeispielprojektB",
  pictures: ["", "", "", "", ""],
  subtitle: "Ein Beispiel für ein Projekt",
  description: "Dieses Projekt dient nur als Beispiel. Es zeigt den Entwicklern, ob das Layout funktioniert und wie andere Projekte später wirken. Mehr gibt's hier nicht zu sehen.",
  team: [{userId: "userId1", role: "3D-Design, Kaffee kochen"}, {userId: "userId2", role: "Level-Design, C# programmieren"}, {userId: "userId3", role: "Bug fixing, Testing"}],
  jobs: ["C# Programmierung", "Testing", "Unity-Experte"],
  contact: "Skype: nickname, Email: project@email.de und Whatsapp: nickname",
  occasions: ["Projekt C (Media Systems)", "Projekt B (Media Systems)", "Mediengestaltung 3 (Media Systems)"],
  supervisors: ["Herr Rehfeld", "Herr Kuhr"],
  owner: {userId: "ownerId", role: "Projektmanagement, Game Design"},
  deadline: new Date(),
  tags: ["WebApp", "Modern", "Projekt-Plattform", "Kollaboration"],
});