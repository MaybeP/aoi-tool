<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'aoi-area-tool',
    mounted () {
      let keyUp = () => {
        let count = 0
        return function (key) {
          // eslint-disable-next-line eqeqeq
          if (key.keyCode != 116) { return }
          if (count >= 3) {
            window.location.reload()
            count = 0
          } else {
            count++
            setTimeout(() => { count = 0 }, 1000)
          }
        }
      }
      window.onkeyup = keyUp()
    }
  }
</script>

<style>
  /* CSS */
</style>
