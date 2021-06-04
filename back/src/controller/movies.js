const mu = require("../lib/mongoUtils");

const getMovies = (callback) => {
  mu.then((client) => {
    client
      .db("meetSpot")
      .collection("eventos")
      .find({})
      .toArray((err, data) => {
        callback(data);
      });
  });
};

const notifyChanges = (callback) => {
  mu.then((client) => {
    const cursor = client
      .db("meetSpot")
      .collection("eventos")
      .watch()
      .on("change", (change) => {
        console.log("Collection changing");
        getMovies((data) => {
          console.log(data);
          callback(JSON.stringify(data));
        });
      });
  });
};

const movie = { getMovies, notifyChanges };

module.exports = movie;
