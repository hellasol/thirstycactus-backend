const express = require("express");
const helmet = require("helmet");
const compresion = require("compression");
const mongoose = require("mongoose");

const { PORT, MONGO_URL } = require("./config");
  
mongoose
    .connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(() => console.info(`connected to mongo`));

const app = express();

app.use(helmet());
app.use(compresion());
app.use(express.json());

app.use("/api/plants", require("./routes/plants"));
app.use("/api/users", require("./routes/users"));
app.use("/api/calenderEntries", require("./routes/calenderEntries"));
app.use("/api/comments", require("./routes/comments"));


module.exports = app.listen(PORT, () => console.info(`listening on port ${PORT}`));