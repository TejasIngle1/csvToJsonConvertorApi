const db = require("../config/dbConnection");

async function csvToJsonConverter(jsonData) {
    try {
        if (jsonData.length > 0) {
            let query = 'INSERT INTO users (name, age, address, additional_info) VALUES ?';
            let values =
                [
                    jsonData.map(record =>
                        [
                            record.firstName + " " + record.lastName,
                            record.age,
                            record.line1 + " " + record.line2 + " " + record.city + " " + record.state,
                            JSON.stringify(record)
                        ]
                    )
                ];
            console.log("Query ", query, values);
            var dbResult = await db.executevaluesquery(query, values)
            console.log("dbResult", dbResult);
            if (dbResult.affectedRows) {
                return { status: true, message: "Data inserted successfully.", result: dbResult };
            } else {
                return { status: false, message: "Data insertion failed.", result: {} };
            }
        } else {
            return { status: false, message: "No result found.", result: {} };
        }
    } catch (error) {
        console.log("DAO_csvToJsonConverter_Error", error);
        return { status: false, message: "Something went wrong", result: {} };
    }
}
async function getUsersData() {
    try {
        const query = `SELECT * FROM users;`;
        const dbResult = await db.executequery(query);
        if (dbResult.length > 0) {
            return { status: true, message: "Users data found", result: dbResult };
        } else {
            return { status: false, message: "No users data found", result: {} };
        }
    } catch (error) {
        console.log("getUsersData Error", error);
        return { status: false, message: "Something went wrong.", result: {} }
    }
}
module.exports = {
    csvToJsonConverter,
    getUsersData
}