<template>
  <Dialog
    title="Issue Certificate"
    :onSubmit="onSubmitIssue"
    v-model="show"
    :loading="inProcessingIssueCert"
  >
    <div
      v-if="errorInfo"
      class="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-5"
    >
      {{ errorInfo }}
    </div>
    <form action="/cp">
      <div class="justify-center items-center w-full text-left">
        <form class="max-w-xl bg-white">
          <div>
            <label for="certId" class="block text-sm text-gray-00"
              >Certificate:</label
            >
            <div class="relative inline-flex">
              <svg
                class="w-2 h-2 absolute top-0 right-0 m-4 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 412 232"
              >
                <path
                  d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
                  fill="#648299"
                  fill-rule="nonzero"
                />
              </svg>
              <select
                name="certId"
                v-model="selectedCertId"
                class="
                  border border-gray-300
                  rounded-md
                  text-gray-600
                  h-10
                  pl-5
                  pr-10
                  bg-white
                  hover:border-gray-400
                  focus:outline-none
                  appearance-none
                  w-64
                "
              >
                <option
                  v-for="cert in certs"
                  v-bind:key="cert.id"
                  :value="cert.id"
                >
                  {{ cert.name }}
                </option>
              </select>
            </div>
            <label class="block text-sm text-gray-00" for="humanIdPrefix"
              >No (Ref):</label
            >
            <input
              :class="`w-full px-5 py-1 text-gray-700 bg-gray-200 rounded ${humanIdPrefixClass}`"
              id="humanIdPrefix"
              name="humanIdPrefix"
              type="text"
              required="true"
              :placeholder="`eg: ${this.org.name}/XXX/2021/0112`"
              aria-label="Name"
              ref="humanIdPrefix"
              v-model="humanIdPrefix"
            />
            <small v-if="humanIdPrefixError" class="text-red-600">{{
              humanIdPrefixError
            }}</small>
          </div>
          <div class="mt-2">
            <label class="block text-sm text-gray-600" for="recipientNameName"
              >Recipient name:</label
            >
            <input
              :class="`w-full px-5 py-2 text-gray-700 bg-gray-200 rounded ${recipientNameClass}`"
              id="recipientNameName"
              name="recipientNameName"
              type="text"
              required="true"
              placeholder="eg: Agus Raharjo"
              aria-label="Recipient"
              v-model="recipientName"
            />
            <small v-if="recipientNameError" class="text-red-600">{{
              recipientNameError
            }}</small>
          </div>

          <!-- <div class="mt-2">
              <label class="block text-sm text-gray-600" for="nim">NIM:</label>
              <input
                class="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded"
                id="nim"
                name="nim"
                type="text"
                required=""
                placeholder="eg: 2015157033"
                aria-label="NIM"
                v-model="nim"
              />
              <small v-if="nimError" class="text-red-600">{{ nimError }}</small>
            </div> -->

          <InputField
            v-for="prop in additionalProperties"
            v-bind:key="prop.key"
            :name="prop.name"
            :submitKey="prop.key"
            :error="prop.error"
            :isError="prop.isError"
            :placeholder="prop.placeholder"
            v-model="prop.value"
          />
        </form>
      </div>
    </form>
  </Dialog>
</template>


<script>
export default {
  props: ['org', 'value'],
  data() {
    return {
      additionalProperties: this.$config.cert.additionalProperties,
      certs: [],
      humanIdPrefix: '',
      humanIdPrefixError: null,
      humanIdPrefixClass: '',
      recipientName: '',
      recipientNameError: null,
      recipientNameClass: '',
      nim: '',
      nimError: null,
      score: '',
      scoreError: null,
      inProcessingIssueCert: false,

      selectedCertId: '',
      errorInfo: null,
      loading: false,
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
  },
  mounted() {
    this.loadCerts()
  },
  methods: {
    async loadCerts() {
      const data = await this.$nuchain.api.query.certificate.certificateOfOrg(
        this.org.id
      )

      const certs = await Promise.all(
        data
          .unwrapOr([])
          .map((a) => a.toHuman())
          .map(async (certId) => [
            await this.$nuchain.getCertificate(certId),
            certId,
          ])
      )

      this.certs = certs.map(([a, id]) => {
        let cert = a.toHuman()
        cert.id = id
        return cert
      })
    },
    validateIssueCerts() {
      this.errorInfo = null
      this.humanIdPrefixError = null
      this.recipientNameError = null
      this.nimError = null
      var error = false
      for (let i = 0; i < this.additionalProperties.length; i++) {
        const prop = this.additionalProperties[i]
        prop.isError = false
        this.$set(this.additionalProperties, i, prop)
      }
      if (this.humanIdPrefix.trim().length == 0) {
        this.humanIdPrefixError = 'Please enter No (ref)'
        error = true
      }
      if (this.recipientName.trim().length == 0) {
        this.recipientNameError = 'Please enter recipient name'
        error = true
      }

      const selectedAccount = this.$session.currentUser()
      if (!selectedAccount) {
        this.errorInfo = 'Please select an account for signing this operation'
        error = true
      }
      // validate additional properties
      for (let i = 0; i < this.additionalProperties.length; i++) {
        const prop = this.additionalProperties[i]
        if (prop.value.trim().length == 0) {
          this.errorInfo = prop.error
          this.additionalProperties[i].isError = true
          this.$set(this.additionalProperties, i, this.additionalProperties[i])
          error = true
        }
      }
      console.log(
        '🚀 ~ file: IssueCertificate.vue ~ line 213 ~ validateIssueCerts ~ this.errorInfo',
        this.errorInfo
      )
      console.log(
        '🚀 ~ file: IssueCertificate.vue ~ line 223 ~ validateIssueCerts ~ error',
        error
      )
      return !error
    },

    async onSubmitIssue() {
      console.log('in onSubmitIssue()')
      if (this.validateIssueCerts()) {
        return await this.doIssueCert()
      }
    },

    async doIssueCert() {
      console.log('in doIssueCert()')
      const refId = this.humanIdPrefix.trim()
      const personName = this.recipientName.trim()
      const nim = this.nim.trim()
      const score = this.score.trim()

      let props = []

      for (let i = 0; i < this.additionalProperties.length; i++) {
        const prop = this.additionalProperties[i]
        if (prop.value.trim().length > 0) {
          const submitProp = { name: prop.key, value: prop.value }
          props.push(submitProp)
        }
      }

      this.errorInfo = null
      this.inProcessingIssueCert = true
      const selectedAccount = this.$session.currentUser()
      const signer = await this.$nuchain.useAccount(selectedAccount.address)
      console.log(
        '🚀 ~ file: index.vue ~ line 447 ~ doIssueCert ~ signer',
        signer
      )
      return await new Promise((resolve, reject) => {
        this.$nuchain.api.tx.certificate
          .issue(
            this.org.id,
            this.selectedCertId,
            refId,
            personName,
            props,
            null,
            null
          )
          .signAndSend(
            selectedAccount.address,
            signer,
            ({ events = [], status }) => {
              if (status.isInBlock) {
                this.inProcessingIssueCert = false
                const error = this.$nuchain.getError(events)
                console.log(
                  '🚀 ~ file: IssueCertificate.vue ~ line 277 ~ awaitnewPromise ~ error',
                  error
                )
                if (error) {
                  this.showError(error.documentation[0])
                  reject(false)
                } else {
                  this.errorInfo = null
                  this.viewIssueCertDialog = false
                  this.printEvents(events)
                  const event = this.$nuchain.getEventByName(
                    events,
                    'certificate.CertIssued'
                  )
                  if (event.event) {
                    const args = event.event.data.toHuman()
                    const [id, _orgId, _recipientAddr] = args
                    var recents =
                      this.$storage.getUniversal('recentsProcessed') || []
                    let entry = {
                      personName,
                      processing: false,
                      status: 'onchain',
                      onchainId: id,
                    }
                    for (let i = 0; i < this.additionalProperties.length; i++) {
                      const prop = this.additionalProperties[i]
                      if (prop.value.trim().length > 0) {
                        entry[prop.key] = prop.value;
                      }
                    }
                    recents.push(entry);
                    this.$storage.setUniversal('recentsProcessed', recents)
                    this.$root.$emit('recentsDataUpdated', recents)
                    resolve(true)
                  }
                }
              }
            }
          )
          .catch((err) => {
            this.showError(err)
            this.inProcessingIssueCert = false
            reject(err)
          })
      })
    },
    showError(msg) {
      this.errorInfo = msg
    },
    printEvents(events) {
      events.forEach(({ event: { data, method, section }, phase }) => {
        const eventName = `${section}.${method}`
        console.log('\t', phase.toString(), `: ${eventName}`, data.toHuman())
      })
    },
  },
}
</script>

<style>
</style>
