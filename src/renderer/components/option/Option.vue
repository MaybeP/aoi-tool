<template>
<div style="height: 300px;overflow: auto">
    <div v-for="(val, key) in configData">
        <Divider>{{key}}</Divider>
    <Form :label-width="100">
        <FormItem :label="k" v-for="(v,k) in val">
            <Input v-model="configData[key][k]" placeholder="Enter something..."></Input>
        </FormItem>
    </Form>
    </div>
</div>
</template>

<script>

export default {
  name: 'Option',
  data () {
    return {
    }
  },
  props: ['configData'],
  mounted () {
  }
}
</script>

<style scoped>

</style>
