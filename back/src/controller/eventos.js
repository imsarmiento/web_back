const mu = require("../lib/mongoUtils");

const getEventos = (callback) => {
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
        getEventos((data) => {
          console.log(data);
          callback(JSON.stringify(data));
        });
      });
  });
};

const evento = { getEventos, notifyChanges };

module.exports = evento;
