const express = require('express');
const router = express.Router();

const csvToJsonController = require("../controllers/csvToJsonConverter");

router.post("/csvtojsonconverter", csvToJsonController.csvToJsonConverter);

module.exports = router;
