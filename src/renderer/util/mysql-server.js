const config = require('../config/config.json')
const mysql = require('mysql')
// const conf = require('../config')
// const fileWrite = require('./FileWrite')
let opt = config.数据库配置mySql || {
  host: '192.168.1.144',
  user: 'root',
  port: '3318',
  password: 'mastercom168',
  database: 'upos_city_main'
}
var connection = mysql.createConnection(opt)
// let mysqlQuery = function (sql, callback = () => {}) {
//   try {
//     connection.query(sql, function (error, results, field) {
//       if (error) {
//         console.log(error)
//       }
//       callback(results)
//     })
//   } catch (e) {
//     // fileWrite.writeFile('error.log', `sql执行错误: ${sql}`)
//   }
// }
let mysqlPromise = function (param, table, whereStr, dataConfig = null) {
  let sql = `select ${param} from ${table} ${whereStr || ''}`
  return new Promise(resolve => {
    if (dataConfig) {
      connection = mysql.createConnection(dataConfig)
    }
    connection.query(sql, function (error, results, field) {
      if (error) {
        resolve(error)
      } else {
        resolve(results)
      }
    })
  })
}

// module.exports.mysqlQuery = mysqlQuery
export default {
  mysqlPromise
}
