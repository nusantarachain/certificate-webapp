<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-80"
    x-data="{activeTab: 1}"
    v-show="show"
  >
    <div
      class="flex justify-center items-center h-screen w-auto inset-x-0 -mt-1 md:w-2/5 mx-auto absolute"
    >
      <dialog
        open
        ref="theDialog"
        class="rounded-2xl overflow-hidden p-0 w-auto max-w-7xl md:w-3/4 mx-auto shadow-lg m-8 h-auto"
      >
        <div class="flex flex-col lg:flex-row">
          <div class="w-full">
            <div class="p-5">
              <div class="flex justify-between items-start">
                <span class="text-xl font-bold">
                  {{ title }}
                </span>
                <a
                  href="javascript://"
                  @click="onCancel"
                  class="text-gray-400 hover:text-gray-800 p-1"
                >
                  <svg
                    class="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </a>
              </div>

              <div class="relative">
                <div class="p-2 h-auto overflow-y-auto rounded">
                  <slot></slot>
                </div>
              </div>
              <!-- action buttons -->
              <div
                class="flex justify-center items-center text-center text-sm font-bold mt-8 gap-4"
              >
                <button v-if="!!onSubmit"
                  :class="`${
                    loading
                      ? 'bg-blue-300 hover:bg-blue-400'
                      : 'hover:bg-blue-600 bg-blue-600'
                  } text-white font-bold py-3 px-4 rounded`"
                  @click="onSubmitInternal"
                  :disabled="loading"
                >
                  <span class="flex flex-row"><Loading v-if="loading" /> {{submitText || 'Submit'}}</span>
                </button>
                <button
                  class="bg-red-600 hover:bg-red-400 text-white font-bold py-3 px-4 rounded"
                  @click="onCancel"
                >
                  {{dismissText || 'Cancel'}}
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'onSubmit', 'loading', 'submitText', 'dismissText', 'value'],
  data() {
    return {
      open: true,
    }
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  mounted() {
    this.$refs.theDialog.addEventListener('close', () => {
      this.$emit('onClose');
      this.show = false;
      console.log("🚀 ~ file: Dialog.vue ~ line 101 ~ this.$refs.theDialog.addEventListener ~ this.show", this.show)
    })
  },
  methods: {
    onCancel() {
      if (this.loading){
        return
      }
      this.show = false;
      this.$emit('onClose')
    },
    async onSubmitInternal(){
      this.show = !(await this.onSubmit());
    }
  },
}
</script>