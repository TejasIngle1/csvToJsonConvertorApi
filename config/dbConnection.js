const mysql = require('mysql');
const config = require("../config/config.json").db;

let pool
createPool()

async function createPool() {
    pool = await createDB_Pool();
    pool.getConnection(async function (err, connection) {
        if (err) {
            console.log('DB_CONNECTION', `Connection error, ${JSON.stringify(err)},${err}`);
            console.error('DB_CONNECTION', `Connection error, ${JSON.stringify(err)},${err}`);
            if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                err = new Error('Could not access the database. Check MySQL config and authentication credentials');
            }
            if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
                err = new Error('Could not connect to the database. Check MySQL host and port configuration');
            }
            await setTimeout(async function () { await today_date(); }, 800)
        } else {
            let query = `select now()`;
            connection.query(query, async function (error, rows, fields) {
                console.info('DB_CONNECTION', `Query: ${query}`);
                console.info('DB_CONNECTION', `Rows: ${JSON.stringify(rows)}`);
                if (error) {
                    console.error('DB_CONNECTION', `Connection error, ${JSON.stringify(error)},${error}`);
                    await setTimeout(async function () { await today_date(); }, 800)
                }
            });
        }
    });


    pool.on('acquire', function (connection) {
        console.info('DB_CONNECTION', `${new Date()} Connection %d acquired, ${connection.threadId}`);
    });

    pool.on('connection', function (connection) {
        console.log('Connection %d connected', connection.threadId);
        console.info('DB_CONNECTION', `${new Date()} Connection %d connected, ${connection.threadId}`);
    });
    pool.on('enqueue', async function () {
        console.log('Waiting for available connection slot');
        console.info('DB_CONNECTION', `${new Date()} Waiting for available connection slot`);
    });
    pool.on('release', function (connection) {
        console.info('DB_CONNECTION', `${new Date()} Connection %d released, ${connection.threadId}`);
    });
}

async function createDB_Pool() {
    console.log("config", config);
    let mysqlPool = mysql.createPool(
        {
            host: config.host,
            user: config.user,
            database: config.database,
            password: config.password,
            port: config.port,
            connectionLimit: config.connectionLimit,
            connectTimeout: config.connectionTimeout,
            acquireTimeout: config.acquireTimeout,
            timeout: config.timeout
        })

    return mysqlPool
}
exports.getConnection = function (query) {
    return new Promise((result, reject) => {
        result(pool);
    });
}
async function today_date() {
    try {
        pool.getConnection(async function (err, connection) {
            if (err) {
                console.log("**************** DB Reconnected err 1**********************")
                console.error('DB_CONNECTION_TODAY', `Connection error, ${JSON.stringify(err)}`);
                console.error('DB_CONNECTION_TODAY', `Connection error, ${err}`);
                if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                    err = new Error('Could not access the database. Check MySQL config and authentication credentials');
                }
                if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
                    err = new Error('Could not connect to the database. Check MySQL host and port configuration');
                }
                console.error('DB_CONNECTION_TODAY', `Connection error, ${err}`);
                await setTimeout(async function () { await today_date(); }, 800)

            } else {
                let query = `select now()`
                connection.query(query, async function (error, rows, fields) {
                    if (error) {
                        console.log("**************** DB Reconnected err 2**********************")
                        console.error('DB_CONNECTION_TODAY', `Connection error, ${JSON.stringify(error)}`);
                        console.error('DB_CONNECTION_TODAY', `Connection error, ${error}`);
                        await setTimeout(async function () { await today_date(); }, 800)
                    } else {
                        console.info('DB_CONNECTION', `Query: ${query}`);
                        console.info('DB_CONNECTION', `Rows: ${JSON.stringify(rows)}`);
                    }
                    if (rows.length > 0) {
                        return true
                    }
                });
            }
        });
    } catch (error) {
        console.error("DB_CONNECTION_TODAY", error)
        await setTimeout(async function () { await today_date(); }, 800)
    }
}
module.exports.dbCheck = function (callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log("DB_CONNECTION_dbCheck Error -> ", err);
            console.error('DB_CONNECTION_dbCheck', error);
            if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                err = new Error('Could not access the database. Check MySQL config and authentication credentials');
            }
            if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
                err = new Error('Could not connect to the database. Check MySQL host and port configuration');
            }
            callback(err);
        } else {
            connection.release();
            callback();
        }
    })
}
exports.executequery = async function (query) {
    return new Promise(function (resolve, reject) {
        pool.getConnection((error, connection) => {
            if (error) {
                console.error('DB_CONNECTION', error);
                resolve(error)
            } else {
                connection.query(query, function (err, rows, fields) {
                    connection.release();
                    if (err) {
                        console.error('DB_CONNECTION', `Query: ${query}`);
                        console.error('DB_CONNECTION', `Rows: ${JSON.stringify(rows)}`);
                        console.error('DB_CONNECTION', err);
                        resolve(err)
                    } else {
                        console.info('DB_CONNECTION', `Query: ${query}`);
                        console.info('DB_CONNECTION', `Rows: ${JSON.stringify(rows)}`);
                        resolve(rows)
                    }
                })
            }
        })
    })
}
exports.executevaluesquery = async function (query, values) {
    return new Promise(function (resolve, reject) {
        pool.getConnection((error, connection) => {
            if (error) {
                console.error('DB_CONNECTION', error);
                resolve(error)
            } else {
                const queryWithPlaceholders = mysql.format(query, values);
                console.log('DB_CONNECTION Generated Query:', queryWithPlaceholders);
                console.info('DB_CONNECTION Generated Query:', queryWithPlaceholders);
                connection.query(query, values, function (err, rows, fields) {
                    connection.release();
                    if (err) {
                        console.error('DB_CONNECTION', `Query: ${query}, Values:  ${values}`);
                        console.error('DB_CONNECTION', `Rows: ${JSON.stringify(rows)}`);
                        console.error('DB_CONNECTION', err);
                        resolve(err)
                    } else {
                        console.info('DB_CONNECTION', `Query: ${query}, Values:  ${values}`);
                        console.info('DB_CONNECTION', `Rows: ${JSON.stringify(rows)}`);
                        resolve(rows)
                    }
                })
            }
        })
    })
}