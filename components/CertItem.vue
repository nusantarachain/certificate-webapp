<template>
  <div class="inline-block">
    <div
      class="relative px-8 py-8 text-black w-96 h-48 max-w-xs overflow-hidden rounded-lg shadow-md bg-white border border-blue-600 hover:shadow-xl transition-shadow duration-300 ease-in-out"
    >
      <div class="absolute top-2 right-0">
        <MedalIcon width="60px" height="60px" />
      </div>
      <h3 class="py-2 text-1xl font-bold cursor-pointer" @click="_onClick">{{ cert.name }}</h3>
      <p class="text-md">
        {{ cert.description }}
      </p>
      <div class="text-center mt-2 leading-none flex justify-between w-full">
        <div class="text-sm py-1 overflow-ellipsis overflow-hidden">
          <strong>ID</strong>:{{ cert.id }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['cert', 'onClick'],
  data() {
    return {}
  },
  methods: {
    _onClick(){
      // this.$router.push(`/cp/cert/${this.cert.id}`)
      this.$emit("click", this.cert)
    }
  }
}
</script>