<template>
  
    <Dialog
      title="Confirmation"
      v-show="show"
      :onSubmit="onSubmit"
      @onClose="onCloseInternal"
      submitText="OK"
    >
      <p>{{text}}</p>
    </Dialog>

</template>

<script>
export default {
  props: ['text', 'onSubmit', 'onClose', 'value'],
  data() {
    return {

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
  methods: {
    onCloseInternal() {
      if (this.onClose) {
        this.onClose()
      }
      this.show = false
    }
  },
}
</script>