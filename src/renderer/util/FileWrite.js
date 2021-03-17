const fs = require('fs')
const path = require('path')
var writeFileLast = function (fileName, data, callback = () => {}) {
  let file = path.resolve('../')
  file = path.join(file, fileName)
  fs.writeFile(file, '\r\n' + data, {flag: 'a'}, function (err) {
    if (err) {
      return console.error(err)
    }
    // console.log(`日志在${file}`);
    callback()
  })
}
var writeFile = function (fileName, data, callback = () => {}) {
  fs.writeFileSync(fileName, data + '\r\n', {flag: 'a'}, function (err) {
    if (err) {
      return console.error(err)
    }
    // console.log(`日志在${file}`);
    callback()
  })
}
var deleteFile = function (fileName, callback = () => {}) {
  let file = path.resolve('../')
  file = path.join(file, fileName)
  fs.unlink(file, () => {
    callback()
    console.log(`删除文件成功!${fileName}\r\n`)
  })
}
var deleteFileNoPath = function (fileName, callback = () => {}) {
  fs.unlink(fileName, () => {
    callback()
    console.log(`删除文件成功!${fileName}\r\n`)
  })
}

export default {
  writeFileLast,
  deleteFile,
  writeFile,
  deleteFileNoPath
}
