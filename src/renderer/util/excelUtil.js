const XLSX = require('xlsx')
export default {
  writeFile: (data = [['暂无数据']], option = {}, dataDeal) => {
    let workBook = XLSX.utils.book_new()
    let workSheet = XLSX.utils.aoa_to_sheet(data)
    workSheet['!cols'] = [{wpx: 50}, {wpx: 80}]
    workSheet['!rows'] = [{hpx: 30}]
    XLSX.utils.book_append_sheet(workBook, workSheet, 'sheet')
    XLSX.writeFile(workBook, 'filName')
  }
}
