const errorCode = require("../config/errorCodes.json");
const csvToJsonConverterBusiness = require("../business/csvToJsonConverter");

async function csvToJsonConverter(req, res) {
    try {
        const response = await csvToJsonConverterBusiness.csvToJsonConverter(req, res);
        if (!response.status) return res.send(response);
        return res.send({ status: true, message: "Age distribution is calculated successfully kindly check the server console for table output and below is the sample result in json array format.", result: response.result });
    } catch (error) {
        console.log("CONTROLLER_csvToJsonConverter_ERROR", error);
        return res.send({ status: false, message: "Something went wrong", result: {}, error: errorCode.CTJE1000 });
    }
}
module.exports = {
    csvToJsonConverter
}