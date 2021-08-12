<template>
  <div
    class="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-green-100"
    @click="$emit('click', account)"
  >
    <div class="w-6 flex flex-col items-center">
      <div
        class="flex relative w-5 h-5 bg-orange-500 justify-center items-center m-1 mr-2 w-4 h-4 mt-1 rounded-full"
      >
        <img
          class="rounded-full"
          alt="A"
          :src="`https://randomuser.me/api/portraits/men/${index}.jpg`"
        />
      </div>
    </div>
    <div class="w-full items-center flex">
      <div class="mx-2 -mt-1">
        {{ account.meta.name }}
        <div
          class="text-xs truncate w-full normal-case font-normal -mt-1 text-gray-500"
        >
          {{ account.address }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    props: ["account", "index"],
    methods: {
        useAccount(a){
            console.log(a)
            this.$emit("accountSelect", a)
        }
    }
}
</script>