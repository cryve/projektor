Projektor.modules = {};

Projektor.modules.add = (zone, module) => {
  if(typeof Projektor.modules[zone] === "function") {
    return false;
  }

  if (typeof Projektor.modules[zone] === "undefined") {
    Projektor.modules[zone] = [];
  }


  if (Array.isArray(module)) {

    var modules = module; // we're dealing with an Array, so let's add an "s"
    modules.forEach( function (module) {
      Projektor.modules[zone].push(module);
    });

  } else {

    Projektor.modules[zone].push(module);

  }
};
