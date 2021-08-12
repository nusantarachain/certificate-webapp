<template>
  <button
    v-if="item.status == 'onchain'"
    :class="`
      inline-block
      px-5
      ml-5
      text-xs
      font-medium
      leading-6
      text-center
      text-white
      uppercase
      transition
      rounded
      shadow
      ripple
      hover:shadow-lg
      ${classState}
      focus:outline-none
    `"
    @click="downloadPdf"
  >
    <span>PDF</span>
  </button>
</template>


<script>
export default {
  props: {
    item: { type: Object, required: true },
    org: { type: Object, required: true },
    loading: {type: Boolean, required: false},
    opts: { type: Object }
  },
  data(){
    return {
      options: this.opts
    }
  },
  watch: {
    loading(b){
      this.loading = b
    },
    opts(b){
      this.options = b
    }
  },
  computed: {
    classState(){
      return this.loading ? `bg-gray-400 hover:bg-gray-400` : `bg-yellow-700 hover:bg-yellow-800`
    }
  },
  methods: {
    downloadPdf() {
      if (this.loading){
        return
      }
      const options = {
        left: this.marginLeft(),
        top: this.marginTop(),
        right: this.marginRight(),
        bottom: this.marginBottom(),
        qrcode: {
          left: process.env.pdfQrcodePosLeft,
          top: process.env.pdfQrcodePosTop,
        },
        ...this.options
      }
      this.$pdf.generate(this.item, this.org, options)
    },
    marginLeft() {
      // return this.$storage.getUniversal(`print-margin-left`) || '5px'
      return parseInt(process.env.pdfMarginLeft)
    },
    marginTop() {
      // return this.$storage.getUniversal(`print-margin-top`) || '5px'
      return parseInt(process.env.pdfMarginTop)
    },
    marginRight() {
      return this.$storage.getUniversal(`print-margin-right`) || '5px'
    },
    marginBottom() {
      return this.$storage.getUniversal(`print-margin-bottom`) || '5px'
    },
    height() {
      return this.$storage.getUniversal('print-height') || '100%'
    },
    width() {
      return this.$storage.getUniversal('print-width') || '100%'
    },
    showBorder() {
      return this.$storage.getUniversal('print-border') == true
    },
  },
}
</script>