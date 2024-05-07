const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const routes = require("./routes/routes");
require("./config/dbConnection");

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());

app.use("/api/v1", routes);

app.listen(process.env.PORT || 5000, (req, res) => {
    console.log("Server is listening on port 5000");
})