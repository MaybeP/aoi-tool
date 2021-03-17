/**
 * 坐标系转换函数-来源 （GIS math.js）
 *
 */
/* eslint-disable */
// const bddecode = require('./baidu/decode')
const pi = Math.PI
const ee = 0.00669342162296594323// 经纬度换算系数
const a = 6378245.0// 地球半径
function transformLat (x, y) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0
  return ret
}
function transformLon (x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 *
        pi)) * 2.0 / 3.0
  return ret
}
function transform (lat, lon) {
  let dLat = transformLat(lon - 105.0, lat - 35.0)
  let dLon = transformLon(lon - 105.0, lat - 35.0)
  let radLat = lat / 180.0 * pi
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  let sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi)
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi)
  let mgLat = Number(lat) + dLat
  let mgLon = Number(lon) + dLon
  return {lat: mgLat, lng: mgLon}
}
function numTo7Fix (num) {
  return (num * 10 ** 7).toFixed()
}
/*
base 转换
 */
// eslint-disable-next-line camelcase
let gps84_To_Gcj02 = function ({lat, lng: lon}) {
  let dLat = transformLat(lon - 105.0, lat - 35.0)
  let dLon = transformLon(lon - 105.0, lat - 35.0)
  let radLat = lat / 180.0 * pi
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  let sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi)
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi)
  let mgLat = lat + dLat
  let mgLon = lon + dLon
  return {lat: mgLat, lng: mgLon}
}
// eslint-disable-next-line camelcase
let gcj02_To_Gps84 = ({lat, lng}) => {
  let gps = transform(lat, lng)
  let lontitude = lng * 2 - gps.lng
  let latitude = lat * 2 - gps.lat
  return {lat: latitude, lng: lontitude}
}
// eslint-disable-next-line camelcase
let gcj02_To_Bd09 = ({lat, lng}) => {
  // eslint-disable-next-line one-var
  let x = lng, y = lat
  let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * pi)
  let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * pi)
  // eslint-disable-next-line camelcase
  let bd_lon = z * Math.cos(theta) + 0.0065
  // eslint-disable-next-line camelcase
  let bd_lat = z * Math.sin(theta) + 0.006
  return {lat: bd_lat, lng: bd_lon}
}
// eslint-disable-next-line camelcase
let gps84_To_Bd09 = ({lat, lng}) => {
  let bd09 = this.gcj02_To_Bd09({lat: lat, lng: lng})
  return bd09
}
// eslint-disable-next-line camelcase
let bd09_To_Gcj02 = ({lat, lng}) => {
  // eslint-disable-next-line one-var
  let x = lng - 0.0065, y = lat - 0.006
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi)
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi)
  // eslint-disable-next-line camelcase
  let gg_lon = z * Math.cos(theta)
  // eslint-disable-next-line camelcase
  let gg_lat = z * Math.sin(theta)
  return {lat: gg_lat, lng: gg_lon}
}

/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 * @param bd_lon
 * @param bd_lat
 * @returns {*[]}
 */
function bd09togcj02 (bd_lon, bd_lat) {
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0
  var x = bd_lon - 0.0065
  var y = bd_lat - 0.006
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi)
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi)
  var gg_lng = z * Math.cos(theta)
  var gg_lat = z * Math.sin(theta)
  return {lng: gg_lng, lat: gg_lat}
}

let bd09_To_Gps84 = ({lat, lng}) => {
  let gcj02 = bd09togcj02(lng, lat)
  let map84 = this.gcj02_To_Gps84(gcj02)
  return map84
}
/* 百度经纬度转墨卡托投影坐标 */
function lonlatTomercator (lonlat) {
  let mercator = {x: 0, y: 0}
  let x = lonlat.x * 20037508.34 / 180
  let y = Math.log(Math.tan((90 + lonlat.y) * Math.PI / 360)) / (Math.PI / 180)
  y = y * 20037508.34 / 180
  mercator.x = x
  mercator.y = y
  return mercator
}

// 百度墨卡to百度经纬度
function mercatorTolonlat ({merX, merY}) {
  var band = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0]
  var MC2LL = [[1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2], [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86], [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37], [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06], [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4], [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]]
  var params
  for (var i = 0; i < band.length; i++) {
    if (Math.abs(merY) >= band[i]) {
      params = MC2LL[i]
      break
    }
  }
  var lng = params[0] + params[1] * Math.abs(merX)
  var lat = Math.abs(merY) / params[9]
  lat = params[2] + params[3] * lat + params[4] * Math.pow(lat, 2) + params[5] * Math.pow(lat, 3) + params[6] * Math.pow(lat, 4) + params[7] * Math.pow(lat, 5) + params[8] * Math.pow(lat, 6)
  lng *= (merX < 0 ? -1 : 1)
  lat *= (merY < 0 ? -1 : 1)
  // // 输出 '纬度,经度' 的格式，可调
  // console.log({lat,lng});
  return {lat, lng}
}

let pointsDealToData = (points = []) => {
  let re = ''
  let allPoints = []
  points.forEach(point => {
    let dataX = numToArry(numTo7Fix(point.lng))
    let dataY = numToArry(numTo7Fix(point.lat))
    allPoints.push(...dataX, ...dataY)
  })
  allPoints.forEach(v => {
    let temp = (v & 0xFF).toString(16)
    if (temp.length < 2) {
      re = re + '0'
    }
    re = re + temp
  })
  console.log(re.toUpperCase())
  return re.toUpperCase()
}

/**
 * intToArry 函数
 * @param n
 * @returns {[]}
 */
let numToArry = (n) => {
  let re = []
  re.push(n & 255)
  re.push((n >> 8) & 255)
  re.push((n >> 16) & 255)
  re.push((n >> 24) & 255)
  return re
}

/*
* 具体业务转换
 */
let gaode_toGps84 = function (p) {
  let points = p.split('_')
  let gps84Arr = []
  points.forEach(v => {
    let values = v.split(',')
    gps84Arr.push(gcj02_To_Gps84({lat: values[1], lng: values[0]}))
  })
  return gps84Arr
}
let baidu_toGps84 = function (e) {
  let p = bddecode.parseGeo(e)['points'].toString()
  let points = p.split(';')
  let gps84Arr = []
  points.forEach(v => {
    let values = v.split(',')
    let i = {merX: values[0], merY: values[1]}
    gps84Arr.push(bd09_To_Gps84(mercatorTolonlat(i)))
    // gps84Arr.push(mercatorTolonlat(i));
  })
  return gps84Arr
}
let sougou_toGps84 = function (points) {
  let gps84Arr = []
  points.forEach(v => {
    gps84Arr.push(bd09_To_Gps84(v))
  })
  debugger
  return gps84Arr
}

// pointsDealToData([{lng:2255268,lat:1139401},{lng:2255259,lat:1139371}]);

// module.exports.bd09_To_Gps84 = bd09_To_Gps84
// module.exports.bd09_To_Gcj02 = bd09_To_Gcj02
// module.exports.gps84_To_Bd09 = gps84_To_Bd09
// module.exports.gcj02_To_Bd09 = gcj02_To_Bd09
// module.exports.gps84_To_Gcj02 = gps84_To_Gcj02
// module.exports.gcj02_To_Gps84 = gcj02_To_Gps84
// module.exports.gaode_toGps84 = gaode_toGps84
// module.exports.pointsDealToData = pointsDealToData
// module.exports.baidu_toGps84 = baidu_toGps84
// module.exports.sougou_toGps84 = sougou_toGps84
// bd09_To_Gps84(mercatorTolonlat({x:12684842.95,y:2561786.28}));
// console.log(bd09_To_Gps84(mercatorTolonlat({merX:12683480.46875,merY:2561252.197265625})));
// console.log(baidu_toGps84('4|12684833.39,2561406.68;12685191.98,2561794.26|1-12684842.95,2561786.28,12684974.24,2561788.55,12685167.91,2561794.26,12685179.47,2561791.45,12685186.47,2561786.09,12685189.69,2561780.35,12685190.19,2561707.48,12685191.98,2561572.64,12685190.58,2561491.25,12685189.02,2561483.93,12685185.45,2561478.63,12685182.01,2561476.34,12685177.33,2561475.12,12685171.1,2561473.17,12685147.64,2561473.77,12685118.72,2561471.24,12685089.9,2561465.48,12685062.2,2561459.01,12685013.13,2561446.12,12684973.85,2561431.96,12684942.46,2561424.33,12684925.98,2561421.21,12684906.53,2561414.86,12684887.5,2561411.69,12684863.91,2561408.28,12684846.32,2561406.68,12684838.2,2561411.22,12684836.32,2561420.32,12684833.39,2561525.32,12684835.92,2561669.76,12684834.48,2561779.3,12684842.95,2561786.28;'))
export default {
  gps84_To_Gcj02
}
