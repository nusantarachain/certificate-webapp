<template>
  <label
    :class="`w-auto flex items-center px-4 py-2 text-white rounded-lg shadow-lg tracking-wide uppercase border border-yellow ${stateClass}`"
    @click="$emit('click')"
  >
    <Loading v-if="loading" />
    <span class="text-base leading-normal font-semibold">{{caption}}</span>
  </label>
</template>

<script>
export default {
  props: {
      "caption": {required: true},
      "loading": {required: true},
      "color": {default:"blue"}
  },
  data() {
    return {
      disabled: this.loading,
    }
  },
  computed: {
      stateClass(){
          return this.disabled ? 'bg-gray-400 hover:bg-gray-400 hover:text-white' : `bg-${this.color}-700 hover:bg-${this.color}-800 hover:text-white cursor-pointer`
      }
  },
  watch: {
    loading(b) {
      this.disabled = b
      console.log("🚀 ~ file: BigButton.vue ~ line 27 ~ loading ~ this.disabled", this.disabled)
    },
  },
}
</script>