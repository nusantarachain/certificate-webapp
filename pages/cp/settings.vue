<template>
  <div>
    <div class="container relative">
      <ErrorInfo v-if="errorInfo" :errorInfo="errorInfo" />

      <form class="mt-2">
        <div class="justify-center items-center w-full text-left">
          <form class="max-w-xl bg-white">
            <div>
              <h2>Print Layout</h2>

              <h3>Margin:</h3>
              <label class="block text-sm text-gray-00" for="marginLeft"
                >Left:</label
              >
              <input
                :class="`w-full px-5 py-1 text-gray-700 bg-gray-200 rounded ${marginLeftClass}`"
                id="marginLeft"
                name="marginLeft"
                type="text"
                required="true"
                placeholder="eg: 5px"
                aria-label="marginLeft"
                ref="marginLeft"
                v-model="marginLeft"
                @input="(value) => validateMarginValue('left', value)"
              />
              <small v-if="marginLeftError" class="text-red-600">{{
                marginLeftError
              }}</small>
            </div>
            <div class="mt-2">
              <label class="block text-sm text-gray-600" for="marginTop"
                >Top:</label
              >
              <input
                :class="`w-full px-5 py-2 text-gray-700 bg-gray-200 rounded ${marginTopClass}`"
                id="marginTop"
                name="marginTop"
                type="text"
                required="true"
                placeholder="eg: 5px"
                aria-label="MarginTop"
                v-model="marginTop"
                @input="(value) => validateMarginValue('top', value)"
              />
              <small v-if="marginTopError" class="text-red-600">{{
                marginTopError
              }}</small>
            </div>

            <div class="mt-2">
              <label class="block text-sm text-gray-600" for="marginRight"
                >Right:</label
              >
              <input
                class="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded"
                id="marginRight"
                name="marginRight"
                type="text"
                required=""
                placeholder="eg: 5px"
                aria-label="MarginRight"
                v-model="marginRight"
                @input="(value) => validateMarginValue('right', value)"
              />
              <small v-if="marginRightError" class="text-red-600">{{
                marginRightError
              }}</small>
            </div>
            <div class="mt-2">
              <label class="block text-sm text-gray-600" for="marginBottom"
                >Bottom:</label
              >
              <input
                class="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded"
                id="marginBottom"
                name="marginBottom"
                type="text"
                required=""
                placeholder="eg: 5px"
                aria-label="Bottom"
                v-model="marginBottom"
                @input="(value) => validateMarginValue('bottom', value)"
              />
              <small v-if="marginBottomError" class="text-red-600">{{
                marginBottomError
              }}</small>
            </div>

            <h3>Height &amp; Width</h3>

            <div class="mt-2">
              <label class="block text-sm text-gray-600" for="height"
                >Height:</label
              >
              <input
                class="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded"
                id="height"
                name="height"
                type="text"
                required=""
                placeholder="eg: 5px"
                aria-label="Bottom"
                v-model="height"
                @input="(event) => storeDimValue('height', event.target.value)"
              />
              <small v-if="heightError" class="text-red-600">{{
                heightError
              }}</small>
            </div>

            <div class="mt-2">
              <label class="block text-sm text-gray-600" for="width"
                >Width:</label
              >
              <input
                class="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded"
                id="width"
                name="width"
                type="text"
                required=""
                placeholder="eg: 5px"
                aria-label="Bottom"
                v-model="width"
                @input="(event) => storeDimValue('width', event.target.value)"
              />
              <small v-if="widthError" class="text-red-600">{{
                widthError
              }}</small>
            </div>

            <h3>Border</h3>

            <div class="flex mt-2">
              <label class="inline-flex items-center mt-3">
                <input
                  type="checkbox"
                  class="form-checkbox h-5 w-5 text-gray-600"
                  v-model="showBorder"
                  @input="borderCheck"
                /><span class="ml-2 text-gray-700">Show border</span>
              </label>
            </div>

            <div class="mt-10 mb-10">
              <h2>PDF Settings</h2>
              <div>
                <label class="inline-flex items-center mt-3">
                  <input
                    type="checkbox"
                    class="form-checkbox h-5 w-5 text-gray-600"
                    v-model="pdfQrCodeOnly"
                    @input="pdfQrCodeCheck"
                  /><span class="ml-2 text-gray-700"
                    >Generate QR-Code only for PDF generated document.</span
                  >
                </label>
              </div>
            </div>
          </form>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      marginLeft: this.$storage.getUniversal('print-margin-left') || '5px',
      marginTop: this.$storage.getUniversal('print-margin-top') || '5px',
      marginRight: this.$storage.getUniversal('print-margin-right') || '5px',
      marginBottom: this.$storage.getUniversal('print-margin-bottom') || '5px',
      height: this.$storage.getUniversal('print-height') || '100%',
      width: this.$storage.getUniversal('print-width') || '100%',
      errorInfo: null,
      marginLeftError: '',
      marginTopError: '',
      marginRightError: '',
      marginBottomError: '',
      heightError: '',
      widthError: '',
      marginLeftClass: '',
      marginTopClass: '',
      marginRightClass: '',
      showBorder: this.$storage.getUniversal('print-border') || true,
      pdfQrCodeOnly: this.$storage.getUniversal('settings.pdfQrCodeOnly') || false
    }
  },
  computed: {
    currentUser() {
      return this.$session.currentUser()
    },
    org() {
      return this.$storage.getUniversal('org')
    },
  },
  async mounted() {
    console.log('in index mounted()')
    if (this.org) {
    } else {
      if (this.orgId) {
        this.showError(
          `Organization not exists in blockchain with ID ${this.orgId}`
        )
      } else {
        this.showError(
          'Invalid ORG_ID, please check your configuration for ORG_ID'
        )
      }
    }
    // this.$root.$on('showIssueCertDialog', (state) => {
    //   this.viewIssueCertDialog = true
    // })
    // })
  },
  methods: {
    borderCheck(event) {
      this.$storage.setUniversal('print-border', event.target.checked)
    },
    pdfQrCodeCheck(event) {
      this.$storage.setUniversal('settings.pdfQrCodeOnly', event.target.checked)
    },
    validateMarginValue(pos, event) {
      // console.log("🚀 ~ file: settings.vue ~ line 128 ~ validateMarginValue ~ pos, value", pos, event.target.value)
      this.marginLeftError = null
      this.marginTopError = null
      this.marginRightError = null
      this.marginBottomError = null

      const valid = /^\d*(px|pt|em)$/.test(event.target.value)

      if (pos == 'left') {
        if (!valid) this.marginLeftError = 'Invalid value'
      } else if (pos == 'right') {
        if (!valid) this.marginRightError = 'Invalid value'
      } else if (pos == 'top') {
        if (!valid) this.marginTopError = 'Invalid value'
      } else if (pos == 'bottom') {
        if (!valid) this.marginBottomError = 'Invalid value'
      }
      if (valid) {
        this.$storage.setUniversal(`print-margin-${pos}`, event.target.value)
      }
    },
    storeDimValue(pos, value) {
      this.heightError = null
      this.widthError = null
      const valid = /^\d*(px|pt|em|%)$/.test(value)
      if (!valid) {
        if (pos == 'height') this.heightError = 'Invalid value'
        if (pos == 'width') this.widthError = 'Invalid value'
      } else
        this.$storage.setUniversal(`print-${pos}`, encodeURIComponent(value))
    },
    showError(msg) {
      this.errorInfo = msg
      setTimeout(() => (this.errorInfo = null), 3000)
    },
    onError(error) {
      this.showError(error)
    },
  },
}
</script>

<style scoped>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/

h2 {
  margin-top: 0;
}
h3 {
  margin-top: 30px;
  font-size: 1.5em;
}
.container {
  margin: 0 auto;
  min-height: 100vh;
  /* display: flex; */
  justify-content: center;
  align-items: center;
  text-align: center;
}

.cert-code {
  font-size: 1.5em;
}

.title {
  font-family: 'Georgia', 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 2.5em;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  word-spacing: 5px;
}

.subtitle-2 {
  font-size: 25px;
}

.links {
  padding-top: 15px;
}
img.institution-logo {
  width: 100px;
  height: 100px;
}
img.institution-logo.medal {
  position: absolute;
  top: 25px;
  left: 65px;
}
</style>
