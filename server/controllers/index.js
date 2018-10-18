// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

const Cat = models.Cat.CatModel;
const Dog = models.Dog.DogModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);
let lastAddedDog = new Dog(defaultData);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

const readAllCats = (req, res, callback) => {
  Cat.find(callback);
};

const readAllDogs = (req, res, callback) => {
  Dog.find(callback);
};

const readCat = (req, res) => {
  const name1 = req.query.name;

  const callback = (err, doc) => {
    if (err) {
      return res.json({ err });
    }

    return res.json(doc);
  };

  Cat.findByName(name1, callback);
};

const readDog = (req, res) => {
  const name1 = req.query.name;

  const callback = (err, doc) => {
    if (err) {
      return res.json({ err });
    }

    return res.json(doc);
  };

  Dog.findByName(name1, callback);
};

const hostPage1 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    return res.render('page1', { cats: docs });
  };

  readAllCats(req, res, callback);
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    return res.render('page4', { dogs: docs });
  };

  readAllDogs(req, res, callback);
};

const getName = (req, res) => {
  res.json({ name: lastAdded.name });
};

const getDogName = (req, res) => {
  res.json({ name: lastAddedDog.name });
};

const setName = (req, res) => {
  let index;
  if (!req.body.beds) {
    index = 1;
  } else {
    index = 0;
  }
  if (index === 0) {
    if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
      return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
    }
    const name = `${req.body.firstname} ${req.body.lastname}`;

    // dummy JSON to insert into database
    const catData = {
      name,
      bedsOwned: req.body.beds,
    };

    const newCat = new Cat(catData);
    const savePromise = newCat.save();

    savePromise.then(() => {
      lastAdded = newCat;
      res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned });
    });

    savePromise.catch(err => res.json({ err }));

    return res;
  } else if (index === 1) {
    if (!req.body.name || !req.body.breed || !req.body.age) {
      return res.status(400).json({ error: 'name, breed and age are all required' });
    }
    const name = `${req.body.name}`;

    // dummy JSON to insert into database
    const dogData = {
      name,
      breed: req.body.breed,
      age: req.body.age,
    };

    const newDog = new Dog(dogData);
    const savePromise = newDog.save();

    savePromise.then(() => {
      lastAddedDog = newDog;
      res.json({ name: lastAddedDog.name, breed: lastAddedDog.breed, age: lastAddedDog.age });
    });

    savePromise.catch(err => res.json({ err }));

    return res;
  }
  return 0;
};

const searchName = (req, res) => {
  if (!req.query.name) {
    return res.json({ error: 'Name is required to perform a search' });
  }

  return Cat.findByName(req.query.name, (err, doc) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    return res.json({ name: doc.name, beds: doc.bedsOwned });
  });
};

const searchDog = (req, res) => {
  if (!req.query.name) {
    return res.json({ error: 'Name is required to perform a search' });
  }
  return Dog.findByName(req.query.name, (err, doc) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }
    console.log(doc.age);
    let tempAge = doc.age;
    tempAge++;
    Dog.findByName(req.query.name).age = tempAge;
    const tempData = {
      name: req.query.name,
      breed: Dog.findByName(req.query.name).breed,
      age: tempAge,
    };
    const tempDog = new Dog(tempData);
    const savePromise = tempDog.save();
    savePromise.then(() =>
    res.json({ name: tempDog.name, breed: tempDog.breed, age: tempDog.age }));
    savePromise.catch(err2 => res.json({ err2 }));
    return res.json({ name: tempDog.name, breed: tempDog.breed, age: tempDog.age });
  });
};

const updateLast = (req, res) => {
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();

  savePromise.then(() => res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned }));

  savePromise.catch(err => res.json({ err }));
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readCat,
  getName,
  setName,
  updateLast,
  searchName,
  notFound,
  readAllDogs,
  readDog,
  getDogName,
  searchDog,
};
