<template>
    <div>
        <Form style="padding-top: 10px" ref="formDynamic" :model="formDynamic"  >
            <FormItem
                    v-for="(item, index) in formDynamic.items"  :key="index"
                    :label="formDynamic.preFix + item.index"
                    :prop="'items.' + index + '.value'"
                   >
                <Row>
                    <Col span="1">
                        <Tooltip transfer max-width="200" placement="left">
                            <Icon type="ios-help-circle" />
                            <div slot="content">
                                <p><span style="color: #4fc08d">{{formDynamic.tip[item.type - 1].label}}:</span>
                                    <span>{{formDynamic.tip[item.type - 1].val}}</span>
                                </p>
                            </div>
                        </Tooltip>
                    </Col>
                    <Col span="16">
                        <Row v-if="item.type===3"  >
                            <Col span="4"><span style="color: #42b983">select</span></Col>
                            <Col span="7" ><Input v-model="item.valueName"  :rows="1" placeholder="名称,数据"></Input></Col>
                            <Col span="3" offset="1"><span style="color: #42b983">from</span></Col>
                            <Col span="9"><Input v-model="item.valueWhere"  type="textarea" :rows="2" placeholder="表名,条件"></Input></Col>
                        </Row>
                        <input  v-else-if="item.type===2" style="width: 100%" type="file"
                               @change="handleUpload(index,$event)"></input>
                        <Input v-else v-model="item.value" type="textarea" :rows="4" placeholder="请输入数据" ></Input>
                    </Col>
                    <Col span="4" offset="1">
                        <Select v-model="item.type" >
                            <Option v-for="i in selectList" :value="i.value" :key="i.value">{{ i.label }}</Option>
                        </Select>
                    </Col>
                    <Col span="2" >
                        <Button v-if="itemCanAdd" icon="ios-trash" size="large" type="text" style="color: darkred" @click="handleRemove(index)"></Button>
                    </Col>
                </Row>
            </FormItem>
            <FormItem v-if="itemCanAdd">
                <Row>
                    <Col offset="4" span="12">
<!--                        <Tooltip max-width="30%"  placement="left">-->
                        <Button type="dashed" long @click="handleAdd" icon="md-add">添加数据来源</Button>
<!--                            <div slot="content">-->
<!--                                <div v-for="item in formDynamic.tip">-->
<!--                                    <p><span style="color: #4fc08d">{{item.label}}:</span>-->
<!--                                    <span>{{item.val}}</span>-->
<!--                                    </p>-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </Tooltip>-->
                    </Col>
                </Row>
            </FormItem>
        </Form>
    </div>
</template>

<script>
  import FileRead from '../util/FileRead.js'
  export default {
    name: 'manInput',
    data () {
      return {
      }
    },
    props: ['formDynamic', 'selectList', 'itemCanAdd'],
    methods: {
      handleUpload (index, e) {
        try {
          this.formDynamic.items[index].value = FileRead.oneFileDeal(e.currentTarget.files[0].path)
        } catch (e) {
          this.$Message.error(e.toString())
          console.log(e)
        }
      },
      handleAdd () {
        if (this.formDynamic.items.length >= 3) {
          this.$Message.warning('最多输入3组数据！')
          return
        }
        let len = this.formDynamic.items.length
        this.formDynamic.items.push({
          value: '',
          valueName: '',
          valueWhere: '',
          index: (len + 1),
          status: 1,
          type: 1
        })
      },
      handleRemove (index) {
        // this.formDynamic.items[index].status = 0
        this.formDynamic.items.splice(index, 1)
      }
    }
  }
</script>

<style scoped>

</style>
