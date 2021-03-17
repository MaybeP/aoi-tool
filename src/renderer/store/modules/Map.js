import points from '../../util/point.js'
const state = {
  pathDatas: [],
  points: points.points
}

const mutations = {
  pushPath (state, path) {
    state.pathDatas.push(path)
  }
}

const actions = {
  someAsyncTask ({ commit }) {
    // do something async
    commit('INCREMENT_MAIN_COUNTER')
  }
}

export default {
  state,
  mutations,
  actions
}
