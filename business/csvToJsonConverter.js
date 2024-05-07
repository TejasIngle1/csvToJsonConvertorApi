const fs = require('fs');
const errorCode = require("../config/errorCodes.json");
const csvToJsonDao = require("../dao/csvToJsonConverter");
const jsonArray = [];

async function csvToJsonConverter(req, res) {
    try {
        const csvFilePath = "./csvFolder/result.csv";
        const jsonData = await csvToJson(csvFilePath);
        const dbResult = await csvToJsonDao.csvToJsonConverter(jsonData);
        const usersData = await csvToJsonDao.getUsersData();
        if (!usersData.status) return usersData;
        const ageDistribution = await calculateAgeDistribution(usersData);
        if (!ageDistribution.status) return ageDistribution;
        return { status: true, message: "Done", result: ageDistribution.result };
    } catch (error) {
        console.log("BUSINESS_csvToJsonConverter_ERROR", error);
        return { status: false, message: "Something went wrong", result: {}, error: errorCode.CTJE1000 };
    }
}
function csvToJson(csvFilePath) {
    return new Promise((resolve, reject) => {
        try {
            const readline = require('readline');
            const inputStream = fs.createReadStream(csvFilePath);

            const rl = readline.createInterface({
                input: inputStream,
                terminal: false
            });

            let headers = [];
            let isFirstLine = true;

            rl.on('line', (line) => {
                if (isFirstLine) {
                    headers = line.split(',').map(header => header.trim().replace(/^"|"$/g, ''));
                    isFirstLine = false;
                } else {
                    const values = line.split(',');
                    const obj = {};
                    headers.forEach((header, i) => {
                        obj[header] = values[i].trim().replace(/^"|"$/g, '').replace(/\\"/g, '"');
                    });
                    jsonArray.push(obj)
                }
            });

            rl.on('close', () => {
                console.log("Conversion complete");
                inputStream.close();
                resolve(jsonArray);
            });
        } catch (error) {
            console.log("csvToJson Error", error);
            reject(error);
        }
    })
}
async function calculateAgeDistribution(usersData) {
    try {
        const ageGroups = [
            { range: '< 20', percentage: 20 },
            { range: '20 to 40', percentage: 45 },
            { range: '40 to 60', percentage: 25 },
            { range: '> 60', percentage: 10 }
        ];

        const ageGroupCounts = {
            '< 20': 0,
            '20 to 40': 0,
            '40 to 60': 0,
            '> 60': 0
        };

        usersData.result.forEach(record => {
            const age = parseInt(record.age);
            if (age < 20) {
                ageGroupCounts['< 20']++;
            } else if (age >= 20 && age <= 40) {
                ageGroupCounts['20 to 40']++;
            } else if (age > 40 && age <= 60) {
                ageGroupCounts['40 to 60']++;
            } else {
                ageGroupCounts['> 60']++;
            }
        });

        const totalCount = usersData.result.length;
        const distribution = ageGroups.map(group => ({
            range: group.range,
            percentage: ((ageGroupCounts[group.range] / totalCount) * group.percentage).toFixed(2)
        }));
        console.log(distribution);
        console.log("BELOW IS THE FINAL RESULT\n");
        console.table(distribution);
        return { status: true, message: "Distribution calculated", result: distribution };
    } catch (error) {
        console.log("calculateAgeDistribution Error", error);
        return { status: false, message: "Something went wrong", result: {} };
    }
}
module.exports = {
    csvToJsonConverter
}