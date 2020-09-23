const mongoose = require("mongoose");

const dbNames = {
  production: "sceats",
  test: "test-sceats",
  development: "dev-sceats",
};
const connect = () => {
  // replace with your own or MongoCloud string
  const mongoConnectionString = `mongodb://localhost/${
    dbNames[process.env.NODE_ENV]
  }`;
  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };
  mongoose.connect(mongoConnectionString, opts);
  console.log({ mongoConnectionString });
};

module.exports = { connect };
