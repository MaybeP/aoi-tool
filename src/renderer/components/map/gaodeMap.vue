<template>
    <div>
        <Button  class="say"  @click="helpClick" type="primary" shape="circle">
            <Icon type="md-at" />
        </Button>
        <ButtonGroup class="button" >
            <Button size="small" shape="circle" type="primary" :loading="loading" @click="modal_point=true" >
                <Icon type="md-ionic" />
                点归属数据输入</Button>
            <Button size="small" shape="circle" type="primary" :loading="loading" @click="modal_aoi=true" >
                <Icon type="ios-ionitron" />
                aoi数据输入</Button>
            <Button size="small" shape="circle" type="primary" :loading="loading" @click="modal_pconfig=true" >
                <Icon type="ios-construct" />
                设置</Button>
        </ButtonGroup>
        <ButtonGroup class="button1">
            <Button type="warning"  size="small" v-if="tableData.length > 0" @click="modal_result = true" >
                <Icon type="ios-book" />
                查看分析结果
            </Button>
            <Button v-if="markers.length > 0 && polygons.length > 0" size="small" type="warning" :loading="loading" @click="createReport" >
                <Icon type="md-ionitron" />
                点归属查看</Button>
            <Button v-if="polygons.length > 0" size="small" type="warning" :loading="loading" @click="createAoiReport" >
                <Icon type="ios-ionitron-outline" />
                aoi归属查看</Button>
            <Button v-if="polygons.length > 0" size="small" type="warning" :loading="loading" @click="createAoiBeReport" >
                <Icon type="ios-ionitron-outline" />
                aoi关系查看</Button>
        </ButtonGroup>
    <div id="container"></div>
        <Modal v-model="modal_point" draggable scrollable title="输入数据"
                @on-ok="modalPointOk"
        >
            <Steps :current="current">
                <Step title="输入aoi轮廓" content="多个来源会被汇聚">

                </Step>
                <Step title="输入点数据" content="待判断点数据输入"></Step>
            </Steps>
            <man-input v-if="current === 0" :itemCanAdd="false" :select-list="aoiSelectList" :formDynamic="aoiForm"></man-input>
            <man-input :itemCanAdd="true" v-if="current === 1" :selectList="selectList" :formDynamic="formDynamic"></man-input>
            <div slot="footer">
                <Button v-if="current> 0" type="primary" @click="preNext">上一步</Button>
                <Button v-if="current< 1" type="primary" @click="next">下一步</Button>
                <Button v-else type="primary" @click="handle">提交</Button>
            </div>

        </Modal>
        <Modal v-model="modal_aoi" draggable scrollable title="输入aoi序列"
               @on-ok="modalAoiOk"
        >
            <Steps :current="aoiCurrent">
                <Step title="输入aoi轮廓" content="待判断归属aoi">

                </Step>
                <Step title="输入aoi轮廓" content="归属aoi来源"></Step>
            </Steps>
            <man-input v-if="aoiCurrent===0"  :itemCanAdd="false" :select-list="aoiSelectList" :formDynamic="aoiForm"></man-input>
            <man-input  v-if="aoiCurrent===1" :itemCanAdd="false" :select-list="aoiSelectList" :formDynamic="aoiFormB"></man-input>
            <div slot="footer">
                <Button v-if="aoiCurrent> 0" type="primary" @click="preNextAoi">上一步</Button>
                <Button v-if="aoiCurrent< 1" type="primary" @click="nextAoi">下一步</Button>
                <Button v-else type="primary" @click="handleAoi">提交</Button>
            </div>
        </Modal>
        <Modal draggable   title="归属分析结果"  placement="left" width="80" height="80" :closable="true" v-model="modal_result">
            <Button @click="resultExport">
                <Icon type="md-arrow-round-down" />
                导出分析结果
            </Button>
            <Table @on-row-dblclick="tableDouClick" stripe style="padding-top: 10px" height="300" :columns="dataCol" :data="tablePageData" size="small" ref="table"></Table>
            <div slot="footer"> <Page :page-size="20" :total="tableData.length" :current="currentPage" @on-change="changePage"></Page></div>
        </Modal>
        <Modal @on-ok="optionSave" height="80" draggable scrollable title="设置" v-model="modal_pconfig">
            <Option :config-data="config"></Option>
        </Modal>
    </div>
</template>
<script>
  import manInput from '../manInput.vue'
import Option from '../option/Option.vue'
import mysqlUtil from '../../util/mysql-server.js'
import pos from '../../util/postion_translate'
export default {
    name: 'gaodeMap',
    components: {
      manInput,
      Option
    },
    data () {
      return {
        map: null,
        aoiCurrent: 0,
        modal_pconfig: false,
        current: 0,
        config: window.top.myOption,
        currentPage: 1,
        modal_result: false,
        dataCol: [

        ],
        tableData: [],
        loading: false,
        selectList: [
          {label: '手动输入',
            value: 1
          },
          {
            label: '文件输入',
            value: 2
          },
          {
            label: '数据库查询',
            value: 3
          }
        ],
        aoiSelectList: [
          {label: '手动输入',
            value: 1
          },
          {
            label: '文件输入',
            value: 2
          },
          {
            label: '数据库查询',
            value: 3
          },
          {
            label: '在线查询',
            value: 4
          }
        ],
        markers: [],
        labelsLayer: null,
        veLayer: null,
        count: 0,
        polygons: [],
        marker: null,
        mass: null,
        formDynamic: {
          preFix: '数据点组',
          items: [
          ],
          tip: [
            {
              label: '手动输入',
              val: '中国|114,25'
            },
            {
              label: '文件输入',
              val: '多行手动输入格式数据，回车符分割'
            },
            {
              label: '数据库查询',
              val: '固定select，输入名称字段和数据字段，可选输入条件语句'
            }
          ]
        },
        aoiForm: {
          preFix: 'aoi序列组',
          items: [
            {
              value: '',
              index: 0,
              status: 1,
              title: '需要判断归属aoi',
              type: 3
            }
          ],
          tip: [
            {
              label: '手动输入',
              val: '中国|114,25;115,26'
            },
            {
              label: '文件输入',
              val: '多行手动输入格式数据，回车符分割'
            },
            {
              label: '数据库查询',
              val: '固定select，输入名称字段和数据字段，可选输入条件语句'
            },
            {
              label: '在线查询',
              val: '直接输入关键字(深圳市科兴科学园)'
            }
          ]
        },
        aoiFormB: {
          preFix: 'aoi序列组',
          items: [
            {
              value: '',
              index: 1,
              status: 1,
              title: '需要判断归属aoi',
              type: 3
            }
          ],
          tip: [
            {
              label: '手动输入',
              val: '中国|114,25;115,26'
            },
            {
              label: '文件输入',
              val: '多行手动输入格式数据，回车符分割'
            },
            {
              label: '数据库查询',
              val: '固定select，输入名称字段和数据字段，可选输入条件语句'
            },
            {
              label: '在线查询',
              val: '直接输入关键字(深圳市科兴科学园)'
            }
          ]
        },
        path: [],
        labels: [],
        modal_point: false,
        modal_aoi: false,
        paths: [],
        points: [],
        AMap: window.AMap
      }
    },
    computed: {
      tablePageData () {
        return this.tableData.slice((this.currentPage - 1) * 20, this.currentPage * 20)
      }
    },
    methods: {
      helpClick () {
        this.$Notice.info({
          title: '工具说明',
          // desc: '主要用于验证点与aoi轮廓、aoi轮廓和aoi轮廓之间的关系   -位置服务部',
          duration: 10,
          render: h => {
            return h('p', [
              '主要用于验证点与aoi轮廓、aoi轮廓和aoi轮廓之间的关系。',
              h('br'),
              h('br'),
              h('span', '-位置能力')
            ])
          }
        })
      },
      changePage (p) {
        this.currentPage = p
      },
      optionSave () {
        localStorage.setItem('myConfig', JSON.stringify(this.config))
      },
      tableDouClick (nowData, index) {
        if (nowData.pLngLat) {
          this.map.setZoomAndCenter(18, nowData.pLngLat.split('|'))
        } else {
          let bound = this.polygons[nowData.polIndex].getBounds()
          this.map.setZoomAndCenter(10, this.getCenter(bound.northeast, bound.southwest))
        }
      },
      handle () {
        this.$Spin.show()
        this.current = 0
        this.modal_point = false
        setImmediate(() => {
          this.modalAoiOk()
          this.modalPointOk()
        })
      },
      handleAoi () {
        this.$Spin.show()
        this.aoiCurrent = 0
        this.modal_aoi = false
        setImmediate(() => {
          this.modalAoiOk()
        })
      },
      preNext () {
        if (this.current > 0) {
          this.current--
        }
      },
      next () {
        if (this.current < 1) {
          this.current++
        }
      },
      preNextAoi () {
        if (this.aoiCurrent > 0) {
          this.aoiCurrent--
        }
      },
      nextAoi () {
        if (this.aoiCurrent < 1) {
          this.aoiCurrent++
        }
      },
      resultExport () {
        this.$refs.table.exportCsv({
          filename: 'Custom data',
          columns: this.dataCol,
          data: this.tableData
        })
      },
      createAoiBeReport () {
        this.dataCol = [
          {
            'title': 'aoi关系',
            'key': 'aoiRelation'
          }, {
            'title': 'aoi名称一',
            'key': 'aName1'
          },
          {
            'title': 'aoi数据组一',
            'key': 'aGroup1'
          },
          {
            'title': 'aoi名称二',
            'key': 'aName2'
          },
          {
            'title': 'aoi数据组二',
            'key': 'aGroup2'
          }
        ]
        this.$Spin.show()
        this.modal_result = true
        setTimeout(() => {
          this.aoiDataBeDeal()
        }, 500)
      },
      createAoiReport () {
        this.dataCol = [{
          'title': 'aoi名称',
          'key': 'pName'
        },
        {
          'title': '归属aoi名称',
          'key': 'aName'
        },
        {
          'title': '归属aoi数据组',
          'key': 'aGroup'
        }
        ]
        this.$Spin.show()
        this.modal_result = true
        setTimeout(() => {
          this.aoiDataDeal()
        }, 500)
      },
      createReport () {
        this.dataCol = [
          {
            'title': '点名称',
            'key': 'pName'
          },
          {
            'title': '点经纬度',
            'key': 'pLngLat'
          },
          {
            'title': '归属aoi名称',
            'key': 'aName'
          },
          {
            'title': '归属aoi信息',
            'key': 'aPath'
          }]
        this.$Spin.show()
        this.modal_result = true
        setTimeout(() => {
          this.dataDeal()
        }, 500)
      },
      aoiDataBeDeal () {
        let table = []
        let group1 = []
        let group2 = []
        for (let m = 0; m < this.polygons.length; m++) {
          if (this.polygons[m].getExtData().group === 'aoi序列组0') {
            group1.push(this.polygons[m])
          } else {
            group2.push(this.polygons[m])
          }
        }
        for (let i = 0; i < group1.length; i++) {
          for (let j = 0; j < group2.length; j++) {
            let d = {}
            let path1 = group1[i].getPath()
            let path2 = group2[j].getPath()
            let isRingInRing = this.AMap.GeometryUtil.isRingInRing(path1, path2)
            // 两圈是否交叉
            let doesRingRingIntersect = this.AMap.GeometryUtil.doesRingRingIntersect(path1, path2)
            // let ringRingClip = this.AMap.GeometryUtil.ringRingClip(path1, path2)
            // console.log(ringRingClip)
            // let ringArea = parseInt(this.AMap.GeometryUtil.ringArea(ringRingClip))
            let text = 'aoi1在aoi2外'
            if (isRingInRing) {
              text = 'aoi1在aoi2内'
            } else if (doesRingRingIntersect) {
              text = 'aoi相交'
            }
            d.aName1 = group1[i].getExtData().name
            d.aName2 = group2[j].getExtData().name
            d.aGroup1 = group1[i].getExtData().group
            d.aGroup2 = group2[j].getExtData().group
            d.aoiRelation = text
            d.polIndex = i
            table.push(d)
          }
        }
        this.tableData = table
        this.$Spin.hide()
      },
      aoiDataDeal () {
        let table = []
        this.count = 0
        let group1 = []
        let group2 = []
        for (let m = 0; m < this.polygons.length; m++) {
          if (this.polygons[m].getExtData().group === 'aoi序列组0') {
            group1.push(this.polygons[m])
          } else {
            group2.push(this.polygons[m])
          }
        }
        for (let i = 0; i < group1.length; i++) {
          let d = {}
          let findR = false
          for (let j = 0; j < group2.length; j++) {
            let isIn = this.AMap.GeometryUtil.isRingInRing(group1[i].getPath(), group2[j].getPath())
            if (isIn) {
              d.pName = group1[i].getExtData().name
              // d.pLngLat = this.polygons[i].getPath()
              // d.pLngLat = ''
              d.aName = group2[j].getExtData().name
              // d.aPath = ''
              d.aGroup = group2[j].getExtData().group
              table.push(d)
              findR = true
              break
            }
          }
          if (!findR) {
            d.pName = group1[i].getExtData().name
            // d.pLngLat = ''
            d.aName = '暂无'
            d.aGroup = '暂无'
            // d.aPath = '暂无'
            table.push(d)
          }
        }
        this.tableData = table
        this.$Spin.hide()
      },
      dataDeal () {
        let table = []
        this.count = 0
        this.markers.forEach(marker => {
          let findRe = false
          this.polygons.forEach(polygon => {
            if (polygon.contains(marker.getPosition())) {
              findRe = true
              let d = {}
              marker.setExtData('归属区域:' + polygon.getExtData().name)
              d.pName = marker.getName()
              d.pLngLat = marker.getPosition().join('|').toString()
              d.aName = polygon.getExtData().name
              d.aPath = polygon.getExtData().group
              table.push(d)
            }
            this.count++
          })
          if (!findRe) {
            let d = {}
            marker.setExtData('未找到归属')
            d.pName = marker.getName()
            d.pLngLat = marker.getPosition().join('|').toString()
            d.aName = '暂无'
            d.aPath = '暂无'
            table.push(d)
          }
        })
        this.tableData = table
        this.$Spin.hide()
      },
      modalPointOk () {
        this.loading = true
        let promises = []
        this.formDynamic.items.filter(item => item.value !== '' || item.valueName).forEach(v => {
          this.restMark()
          let _this = this
          let promis = null
          switch (v.type) {
            case 1:
              promis = new Promise((resolve) => {
                let objArry = v.value.split('|')
                let obj = {}
                obj['name'] = objArry[0]
                obj['group'] = this.formDynamic.preFix + v.index
                let pArry = objArry[1].split(',')
                let translated = pos.gps84_To_Gcj02({lng: Number(pArry[0]), lat: Number(pArry[1])})
                obj['lnglat'] = [translated['lng'], translated['lat']]
                obj.style = v.index % 2
                resolve(obj)
              })
              break
            case 2:
              promis = new Promise(resolve => {
                let arry = []
                let objs = v.value.split('\r\n')
                objs.forEach((item) => {
                  let obj = {}
                  let objArry = item.split('|')
                  obj['name'] = objArry[0]
                  obj['group'] = this.formDynamic.preFix + v.index
                  let pArry = objArry[1].split(',')
                  let translated = pos.gps84_To_Gcj02({lng: Number(pArry[0]), lat: Number(pArry[1])})
                  obj['lnglat'] = [translated['lng'], translated['lat']]
                  obj.style = v.index % 2
                  arry.push(obj)
                })
                resolve(arry)
              })
              break
            case 3:
              promis = new Promise(resolve => {
                let objArry = v.valueWhere.split('|')
                mysqlUtil.mysqlPromise(v.valueName, objArry[0], objArry[1], _this.config.数据库配置mySql).then(
                  (data) => {
                    let arry = []
                    if (!Array.isArray(data)) {
                      this.$Message.error({
                        content: data.toString(),
                        duration: 0,
                        closable: true
                      })
                      resolve(arry)
                      return
                    }
                    data.forEach((item) => {
                      let fileds = v.valueName.split(',')
                      let obj = {}
                      obj['name'] = item[fileds[0]]
                      obj['group'] = this.formDynamic.preFix + v.index
                      let pArry = item[fileds[1]].split(',')
                      let translated = pos.gps84_To_Gcj02({lng: Number(pArry[0]), lat: Number(pArry[1])})
                      obj['lnglat'] = [translated['lng'], translated['lat']]
                      obj.style = v.index % 2
                      arry.push(obj)
                    })
                    resolve(arry)
                  }
                )
              })
              break
            default: break
          }
          if (promis) {
            promises.push(promis)
          }
        })
        if (promises.length > 0) {
          let func = (data) => {
            data.forEach((item) => {
              if (Array.isArray(item)) {
                this.setMarkers(item)
              } else {
                this.setMarkers([item])
              }
            })
            this.loading = false
            // this.formDynamic.items = []
          }
          func = func.bind(this)
          Promise.all(promises).then(func)
        } else {
          this.loading = false
        }
      },
      modalAoiOk () {
        let promises = []
        this.loading = true
        this.map.remove(this.polygons)
        this.map.remove(this.labels)
        this.polygons = []
        this.restMark()
        this.aoiForm.items.filter(item => item.value !== '' || item.valueName).forEach(v => {
          let _this = this
          let promis = null
          switch (v.type) {
            case 1:
              promis = new Promise((resolve) => {
                let objArry = v.value.split('|')
                let obj = {}
                obj['name'] = objArry[0]
                obj['group'] = this.aoiForm.preFix + v.index
                obj['points'] = this.strToPoints(objArry[1])
                obj.style = v.index % 2
                resolve(obj)
              })
              break
            case 2:
              promis = new Promise(resolve => {
                let arry = []
                let objs = v.value.split('\r\n')
                objs.forEach((item) => {
                  let obj = {}
                  let objArry = item.split('|')
                  obj['name'] = objArry[0]
                  obj['group'] = this.aoiForm.preFix + v.index
                  obj['points'] = this.strToPoints(objArry[1])
                  obj.style = v.index % 2
                  arry.push(obj)
                })
                resolve(arry)
              })
              break
            case 3:
              promis = new Promise(resolve => {
                let objArry = v.valueWhere.split('|')
                mysqlUtil.mysqlPromise(v.valueName, objArry[0], objArry[1], _this.config.数据库配置mySql).then(
                  (data) => {
                    let arry = []
                    if (!Array.isArray(data)) {
                      this.$Message.error({
                        content: data.toString(),
                        duration: 0,
                        closable: true
                      })
                      resolve(arry)
                      return
                    }
                    data.forEach((item) => {
                      let fileds = v.valueName.split(',')
                      let obj = {}
                      obj['name'] = item[fileds[0]]
                      obj['group'] = this.aoiForm.preFix + v.index
                      obj['points'] = this.strToPoints(item[fileds[1]])
                      obj.style = v.index % 2
                      arry.push(obj)
                    })
                    resolve(arry)
                  }
                )
              })
              break
            case 4:
              promis = new Promise(resolve => {
                this.$http.get(`http://www.maybe123.top:3642/aoiInfo/2?name=${v.value}&selectArea=0,0`)
                  .then(res => {
                    let data = res.data.data[0].searchList[0] || []
                    let obj = {}
                    obj['name'] = data.name
                    obj['group'] = this.aoiForm.preFix + v.index
                    if (data.domainList) {
                      obj['points'] = data.domainList.map(vl => {
                        let r = []
                        let after = pos.gps84_To_Gcj02({lat: vl.lat, lng: vl.lng})
                        r.push(after.lng)
                        r.push(after.lat)
                        return r
                      })
                    } else {
                      obj['points'] = []
                    }
                    obj.style = v.index % 2
                    resolve(obj)
                  })
              })
              break
            default: break
          }
          if (promis) {
            promises.push(promis)
          }
        })
        this.aoiFormB.items.filter(item => item.value !== '' || item.valueName).forEach(v => {
          let _this = this
          let promis = null
          switch (v.type) {
            case 1:
              promis = new Promise((resolve) => {
                let objArry = v.value.split('|')
                let obj = {}
                obj['name'] = objArry[0]
                obj['group'] = this.aoiForm.preFix + v.index
                obj['points'] = this.strToPoints(objArry[1])
                obj.style = v.index % 2
                resolve(obj)
              })
              break
            case 2:
              promis = new Promise(resolve => {
                let arry = []
                let objs = v.value.split('\r\n')
                objs.forEach((item) => {
                  let obj = {}
                  let objArry = item.split('|')
                  obj['name'] = objArry[0]
                  obj['group'] = this.aoiForm.preFix + v.index
                  obj['points'] = this.strToPoints(objArry[1])
                  obj.style = v.index % 2
                  arry.push(obj)
                })
                resolve(arry)
              })
              break
            case 3:
              promis = new Promise(resolve => {
                let objArry = v.valueWhere.split('|')
                mysqlUtil.mysqlPromise(v.valueName, objArry[0], objArry[1], _this.config.数据库配置mySql).then(
                  (data) => {
                    let arry = []
                    if (!Array.isArray(data)) {
                      this.$Message.error({
                        content: data.toString(),
                        duration: 0,
                        closable: true
                      })
                      resolve(arry)
                      return
                    }
                    data.forEach((item) => {
                      let fileds = v.valueName.split(',')
                      let obj = {}
                      obj['name'] = item[fileds[0]]
                      obj['group'] = this.aoiForm.preFix + v.index
                      obj['points'] = this.strToPoints(item[fileds[1]])
                      obj.style = v.index % 2
                      arry.push(obj)
                    })
                    resolve(arry)
                  }
                )
              })
              break
            case 4:
              promis = new Promise(resolve => {
                this.$http.get(`http://www.maybe123.top:3642/aoiInfo/2?name=${v.value}&selectArea=0,0`)
                  .then(res => {
                    let data = res.data.data[0].searchList[0] || []
                    let obj = {}
                    obj['name'] = data.name
                    obj['group'] = this.aoiForm.preFix + v.index
                    if (data.domainList) {
                      obj['points'] = data.domainList.map(vl => {
                        let r = []
                        let after = pos.gps84_To_Gcj02({lat: vl.lat, lng: vl.lng})
                        r.push(after.lng)
                        r.push(after.lat)
                        return r
                      })
                    } else {
                      obj['points'] = []
                    }
                    obj.style = v.index % 2
                    resolve(obj)
                  })
              })
              break
            default: break
          }
          if (promis) {
            promises.push(promis)
          }
        })
        if (promises.length > 0) {
          let func = (data) => {
            data.forEach((item) => {
              if (Array.isArray(item)) {
                this.setPloys(item)
              } else {
                this.setPloys([item])
              }
            })
            // this.formDynamic.items = []
          }
          func = func.bind(this)
          Promise.all(promises).then(func)
        } else {
          this.setPloys([])
        }
      },
      restMark () {
        this.labelsLayer.clear()
        this.markers = []
      },
      setMarkers (data) {
        let icon = [
          {
            type: 'image',
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            size: [6, 9],
            anchor: 'bottom-center'
          },
          {
            type: 'image',
            image: 'https://a.amap.com/jsapi_demos/static/images/mass2.png',
            size: [6, 9],
            anchor: 'bottom-center'
          }
        ]
        let ms = []
        data.forEach(item => {
          let marker = new this.AMap.LabelMarker({
            name: item.name,
            position: item.lnglat,
            extData: item.group,
            icon: icon[item.style]
          })
          let mouserOver = function (e) {
            var position = e.data.data && e.data.data.position
            let str = `${e.target.getExtData()},${e.target.getName()},
              ${Number(position[0]).toFixed(1)},${Number(position[1]).toFixed(1)}`
            if (position) {
              this.marker.setContent(
                '<div style="width: 220px;background: #fff;border-radius: 3px;padding: 3px 7px;box-shadow: 0 2px 6px 0 rgba(114, 124, 245, .5);position: relative;" class="amap-info-window">' +
                  str + '<div style="position: absolute;top: 21px;bottom: 0;left: 50%;margin-left: -8px;border-left: 8px solid transparent;border-right: 8px solid transparent;border-top: 8px solid #fff;"></div>' +
                  '</div>')
              this.marker.setPosition(position)
              this.map.add(this.marker)
            }
          }
          mouserOver = mouserOver.bind(this)
          marker.on('mouseover', mouserOver)
          let mouseOut = function () {
            this.map.remove(this.marker)
          }
          mouseOut = mouseOut.bind(this)
          marker.on('mouseout', mouseOut)
          ms.push(marker)
          this.markers.push(marker)
        })
        // this.markers.push({[data[0].group]: ms})
        // this.formDynamic.items = []
        this.labelsLayer.add(ms)
      },
      setPloys (data) {
        // let pols = []
        let renders = []
        for (let i = 0; i < data.length; i++) {
          let ren = this.render.bind(this, data[i])
          renders.push(ren)
        }
        this.bigNmuRender(renders, 1)
      },
      bigNmuRender (renders, num) {
        let updateFunc = () => {
          for (let i = 0; i < num; i++) {
            let func = renders.shift()
            if (func) {
              func()
              requestAnimationFrame(updateFunc)
            } else {
              this.map.setFitView(null, false, [0, 0, 0, 0])
              this.loading = false
              this.$Spin.hide()
              return
            }
          }
        }
        updateFunc = updateFunc.bind(this)
        requestAnimationFrame(updateFunc)
      },
      render (item) {
        let colors = ['#00BFFF', '#006600']
        let fillColors = ['#98FB98', '#FFAA00']
        if (item.points.length === 0) {
          this.$Message.error(`${item.name}轮廓点为0`)
          return
        }
        try {
          let newPoints
          if (item.points.length >= this.config.其它配置.aoi抽稀阈值) { newPoints = this.shorterPoint(item.points) }
          let polygon = new this.AMap.Polygon({
            fillOpacity: 0.2,
            borderWeight: 0.5,
            path: newPoints || item.points,
            strokeStyle: 'dashed',
            strokeColor: colors[item.style],
            fillColor: fillColors[item.style],
            extData: item
          })
          this.map.add(polygon)
          this.polygons.push(polygon)
          let bound = polygon.getBounds()
          let text = new this.AMap.Text({
            text: item.name,
            anchor: 'center', // 设置文本标记锚点
            draggable: false,
            cursor: 'pointer',
            position: this.getCenter(bound.northeast, bound.southwest)
          })
          this.labels.push(text)
          text.setMap(this.map)
        } catch (e) {
          this.$Message.error(e.toString())
        }
      },
      compute () {
        var point = this.marker.getPosition()
        var isPointInRing = this.AMap.GeometryUtil.isPointInRing(point, this.path)
        this.marker.setLabel({
          content: isPointInRing ? '内部' : '外部',
          offset: new this.AMap.Pixel(20, 0)
        })
      },
      getCenter (obj1, obj2) {
        return [(obj1.lng + obj2.lng) / 2, ((obj1.lat + obj2.lat) / 2)]
      },
      strToPoints (str) {
        let re = []
        str = str.replace(/;*$/, '')
        let strArry = str.split(';')
        strArry.forEach(item => {
          let pStr = item.split(',')
          let arr = []
          let after = pos.gps84_To_Gcj02({lng: Number(pStr[0]), lat: Number(pStr[1])})
          arr.push(after.lng, after.lat)
          re.push(arr)
        })
        return re
      },
      initMap () {
        this.map.plugin(['AMap.ToolBar'], () => {
          let ToolBar = new this.AMap.ToolBar({
            direction: false,
            locate: false
          })
          ToolBar.on('location', ({type, lnglat}) => {
            console.log(type + lnglat)
          })
          this.map.addControl(ToolBar)
        })
        this.labelsLayer = new this.AMap.LabelsLayer({
          zooms: [3, 20],
          zIndex: 1000,
          // 关闭标注避让，默认为开启，v1.4.15 新增属性
          animation: false,
          // 关闭标注淡入动画，默认为开启，v1.4.15 新增属性
          collision: false
        })
        this.map.add(this.labelsLayer)
        this.marker = new this.AMap.Marker({
          offset: new this.AMap.Pixel(-110, -40)
        })
      },
      shorterPoint (points = [], n = this.config.其它配置.aoi抽稀误差) {
        let re = []
        let index = 0
        let dMax = 0
        let path = [points[0], points[points.length - 1]]
        points.forEach((item, c) => {
          let d = this.AMap.GeometryUtil.distanceToLine(item, path)
          if (d > dMax) {
            dMax = d
            index = c
          }
        })
        if (dMax > n) {
          let re1 = this.shorterPoint(points.slice(0, index), n)
          let re2 = this.shorterPoint(points.slice(index), n)
          re.push(...re1, ...re2)
        } else {
          re = [points[0], points[points.length - 1]]
        }
        return re
      },
      shorToNum (n, points) {
        let dis = 0
        while (points.length >= n) {
          dis += 10
          points = this.shorterPoint(points, dis)
        }
        return points
      }
    },
    mounted () {
      this.map = new this.AMap.Map('container', {
        resizeEnable: true,
        zoom: 13,
        showLabel: true
        // pitch: 60,
        // viewMode: '3D',
        // mapStyle: 'amap://styles/whitesmoke'
      })
      this.initMap()
      window.pos = pos
      this.$Notice.config({
        top: 100
      })
      this.$Notice.info({
        title: '工具说明',
        // desc: '主要用于验证点与aoi轮廓、aoi轮廓和aoi轮廓之间的关系   -位置服务部',
        duration: 10,
        render: h => {
          return h('p', [
            '主要用于验证点与aoi轮廓、aoi轮廓和aoi轮廓之间的关系。',
            h('br'),
            h('br'),
            h('span', '-位置能力')
          ])
        }
      })
    }
  }
</script>

<style scoped>
#container{
    width: 100%;
    height: 100vh;
    z-index: 0;
}
.points{
        position: fixed;
        top: 10px;
        left: 100px;
        z-index: 1;
    }
.say{
    position: fixed;
    left: 30px;
    bottom: 10%;
    z-index: 1;
}
.button{
    position: fixed;
    top: 30px;
    right: 20px;
    z-index: 1;
}
.button1{
    position: fixed;
    top: 60px;
    right: 20px;
    z-index: 1;
}
.points_aoi{
        position: fixed;
        top: 10px;
        left: 210px;
        z-index: 1;
    }
.points_belong{
        position: fixed;
        top: 10px;
        left: 320px;
        z-index: 1;
    }
.amap-info-window{

}
.amap-info-sharp{
    position: absolute;top: 21px;bottom: 0;left: 50%;margin-left: -8px;border-left: 8px solid transparent;border-right: 8px solid transparent;border-top: 8px solid #fff;
}
</style>
