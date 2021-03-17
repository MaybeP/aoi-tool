const sql = require('mssql')
const config = require('../config/config.json')
// eslint-disable-next-line camelcase
let sqlserver_config = config.数据库配置sqlServer

let noFunc = () => {}

let sqlexec = async (s) => {
  try {
    await sql.connect(`mssql://${sqlserver_config.user}:${sqlserver_config.password}@${sqlserver_config.host}:${sqlserver_config.port}/${sqlserver_config.database}`)
    // console.log(s);
    const result = await sql.query(s)
    return result
  } catch (err) {
    // ... error checks
    console.log(err)
  }
}

async function bigNumsSqlExec (s, {oncolumns = noFunc, onrow = noFunc, onerror = noFunc, ondone = noFunc}) {
  try {
    await sql.connect(`mssql://${sqlserver_config.user}:${sqlserver_config.password}@${sqlserver_config.host}:${sqlserver_config.port}/${sqlserver_config.database}`)
    console.log(s)
    const request = new sql.Request()
    request.stream = true // You can set streaming differently for each request
    request.query(s) // or request.execute(procedure)
    request.on('recordset', columns => {
      oncolumns(columns)
    })

    request.on('row', row => {
      onrow(row)
      console.log(row)
      // Emitted for each row in a recordset
    })

    request.on('error', err => {
      onerror(err)
      console.log(err)
      // May be emitted multiple times
    })

    request.on('done', result => {
      ondone(result)
      // Always emitted as the last one
    })
  } catch (err) {
    // ... error checks
    console.log(err)
  }
}

// bigNumsSqlExec(getQuerSql(),{onrow:(r)=>{console.log(r)}});
module.exports.bigNumsSqlExec = bigNumsSqlExec
module.exports.sqlexec = sqlexec
