<template>
  <div class="flex flex-col">
    <div class="flex justify-end bg-grey-lighter p-5 gap-5">
      <label
        class="
          w-32
          flex flex-none flex-col
          items-center
          px-4
          py-2
          bg-blue-100
          text-blue
          rounded-lg
          shadow-lg
          tracking-wide
          uppercase
          border border-blue
          cursor-pointer
          hover:bg-blue-300
          hover:text-white
        "
      >
        <span v-if="!loading" class="text-base leading-normal font-semibold"
          >Upload CSV</span
        >
        <Loading v-if="loading" />
        <input ref="inputFile" type="file" class="hidden" />
      </label>
      <label
        v-if="persons && persons.length > 0"
        class="
          w-32
          flex flex-none flex-col
          items-center
          px-4
          py-2
          bg-blue-100
          text-blue
          rounded-lg
          shadow-lg
          tracking-wide
          uppercase
          border border-blue
          cursor-pointer
          hover:bg-blue-300
          hover:text-white
        "
        @click="showConfirmClearDialog"
      >
        <span class="text-base leading-normal font-semibold">Clear</span>
      </label>

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
            mt-1
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
          <option v-for="cert in certs" v-bind:key="cert.id" :value="cert.id">
            {{ cert.name }}
          </option>
        </select>
      </div>

      <div class="mt-2">
        <input
          class="w-full px-5 py-1 rounded border border-grey-600"
          id="refPrefix"
          name="refPrefix"
          type="text"
          required="true"
          placeholder="Ref ID (prefix), eg: XXX/2021/IIV/50117"
          aria-label="Ref ID (prefix)"
          v-model="refPrefix"
          @input="onPrefixChanged"
        />
      </div>

      <div class="flex-grow"></div>
      <!-- 
      <label
        class="w-32 flex flex-none flex-col items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-500 hover:text-white"
        @click="showConfirmSubmitAllDialog"
      >
        <span v-if="!loading" class="text-base leading-normal font-semibold"
          >Submit All</span
        >
        <Loading v-if="loading" />
      </label> -->

      <!-- <label
        class="w-auto flex items-center px-4 py-2 bg-yellow-700 text-white rounded-lg shadow-lg tracking-wide uppercase border border-yellow cursor-pointer hover:bg-yellow-800 hover:text-white"
        @click="generatePdf"
      >
        <Loading v-if="!loading" />
        <span class="text-base leading-normal font-semibold"
          >Generate PDF</span
        >
      </label> -->

      <BigButton
        caption="Submit All"
        :loading="loading"
        @click="showConfirmSubmitAllDialog"
      />
      <BigButton
        caption="Generate PDF"
        :loading="loading"
        @click="generatePdf"
        color="yellow"
      />
    </div>

    <div
      v-if="errorInfo != null"
      class="
        alert
        flex flex-row
        absolute
        inset-x-0
        w-3/4
        md:w-2/5
        mx-auto
        -mt-1
        bg-red-200
        p-5
        rounded
        border-b-2 border-red-300
      "
    >
      <div
        class="
          alert-icon
          flex
          items-center
          bg-red-100
          border-2 border-red-500
          justify-center
          h-10
          w-10
          flex-shrink-0
          rounded-full
        "
      >
        <span class="text-red-500">
          <svg fill="currentColor" viewBox="0 0 20 20" class="h-6 w-6">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </span>
      </div>
      <div class="alert-content ml-4">
        <div class="alert-title font-semibold text-lg text-red-800">Error</div>
        <div class="alert-description text-sm text-red-600">
          {{ errorInfo }}
        </div>
      </div>
    </div>

    <Dialog
      title="Confirmation"
      :onSubmit="clearQueueData"
      v-model="viewConfirmClearDialog"
      submitText="OK"
    >
      <p>Clear all loaded data?</p>
    </Dialog>

    <Dialog
      title="Confirmation"
      :onSubmit="buildCerts"
      v-model="viewConfirmSubmitAllDialog"
      submitText="OK"
    >
      <p>Are you sure to submit all?</p>
    </Dialog>

    <Dialog
      v-model="viewGeneratePdfDialog"
      title="Generate PDF"
      :onSubmit="doGeneratePdf"
      submitText="OK"
    >
      <p>Are you sure to generate all entry to single PDF file?</p>
      <div>
        <div class="flex mt-2">
          <label class="inline-flex items-center mt-3">
            <input
              type="checkbox"
              class="form-checkbox h-5 w-5 text-gray-600"
              v-model="pdfQrCodeOnly"
            /><span class="ml-2 text-gray-700">QR-Code only</span>
          </label>
        </div>
      </div>
    </Dialog>

    <div v-if="org" class="flex flex-col px-5">
      <label for="recents" class="font-semibold text-left">Loaded:</label>

      <PersonBatchTable
        v-if="currentUser"
        :refPrefix="refPrefix"
        :certId="selectedCertId"
        :accountAddress="currentUser.address"
        :persons="persons"
        :org="org"
        :loading="loading"
        @onError="onError"
        @onUpdated="onListUpdated"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      org: null,
      currentUser: null,
      errorInfo: null,
      certs: [],
      selectedCertId: null,
      refPrefix: this.$storage.getUniversal('refPrefix'),
      persons: [],
      viewConfirmClearDialog: false,
      viewConfirmSubmitAllDialog: false,
      viewGeneratePdfDialog: false,
      pdfQrCodeOnly: false,
    }
  },
  async mounted() {
    this.org = this.$storage.getUniversal('org')
    this.currentUser = this.$storage.getUniversal('currentUser')
    this.persons = this.$storage.getUniversal('processingQueue') || []
    if (this.org) {
      this.setupFileUploader()
      this.loadData()
      this.loadCerts()
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
  },
  methods: {
    onListUpdated(persons) {
      this.persons = persons
    },
    showConfirmClearDialog() {
      if (this.loading) {
        return
      }
      this.viewConfirmClearDialog = true
    },
    clearQueueData() {
      this.persons = []
      this.$storage.setUniversal('processingQueue', this.persons)
      this.viewConfirmClearDialog = false
    },
    onError(msg) {
      this.showError(msg)
    },
    showError(msg) {
      this.errorInfo = msg
      setTimeout(() => (this.errorInfo = null), 3000)
    },
    setupFileUploader() {
      const inputFile = this.$refs.inputFile
      if (!inputFile) {
        setTimeout(() => this.setupFileUploader(), 1000)
        return
      }
      console.log('inputFile:', inputFile)
      inputFile.onchange = (e) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const textContent = e.target.result
          console.log('file content:')
          var lines = textContent.split('\n').splice(1)
          lines = lines
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => line.split(','))
          console.log(lines)
          this.saveData(lines)
        }
        reader.onerror = (e) => {
          alert(e.target.error)
        }
        const file = inputFile.files[0]
        if (file) {
          reader.readAsText(file)
        }
      }
    },
    loadData() {
      const persons = this.$storage.getUniversal('processingQueue')
      this.persons = persons
    },
    saveData(nimPairs) {
      const persons = nimPairs.map(this.mapPersonData)
      this.$storage.setUniversal('processingQueue', persons)
      this.persons = persons
    },

    mapPersonData([nim, personName, score]) {
      return { nim, personName, score }
    },
    async loadCerts() {
      const data = await this.$nuchain.api.query.certificate.certificateOfOrg(
        this.org.id
      )

      const certs = await Promise.all(
        data
          .unwrapOr([])
          .map((a) => a.toHuman())
          .map(async (certId) => [
            await this.$nuchain.api.query.certificate.certificates(certId),
            certId,
          ])
      )

      this.certs = certs.map(([a, id]) => {
        let cert = a.toHuman()
        cert.id = id
        return cert
      })
    },
    async buildCerts() {
      this.viewConfirmSubmitAllDialog = false
      if (!this.selectedCertId) {
        this.showError('Please select certificate to issue first')
        return
      }
      if (!this.persons) {
        this.showError('No data to process')
        return
      }
      this.loading = true
      var txs = this.persons
        .filter((a) => !a.onchainId)
        .map(({ nim, personName, score }, index) => {
          console.log(
            '🚀 ~ file: batches.vue ~ line 264 ~ txs ~ { nim, personName, score }',
            { nim, personName, score }
          )
          const refId = this.genRefId(index + 1)
          const props = [
            { name: 'nim', value: nim },
            { name: 'score', value: score },
          ]
          const query = this.$nuchain.api.tx.certificate.issue(
            process.env.orgId,
            this.selectedCertId,
            refId,
            personName,
            props,
            null,
            null
          )
          console.log(
            process.env.orgId,
            this.selectedCertId,
            refId,
            personName,
            props
          )
          return query
        })
      const batch = this.$nuchain.api.tx.utility.batch(txs)
      // const batch = txs[0];
      console.log('Proposal hash: ' + batch.method.hash.toHex())

      const currentUser = this.$session.currentUser()
      if (!currentUser) {
        alert('Please select account to sign first')
        return
      }

      const acc = await this.$nuchain.useAccount(currentUser.address)
      console.log(`Use acc: ${acc}`, currentUser.address)
      batch
        .signAndSend(currentUser.address, acc, ({ events = [], status }) => {
          console.log('Transaction status:', status.type)
          if (status.isInBlock) {
            this.loading = false
            console.log('tx mined in block hash:', status.asInBlock.toHex())
            console.log('events:')

            events.forEach(({ event: { data, method, section }, phase }) => {
              const eventName = `${section}.${method}`
              if (eventName == 'utility.BatchInterrupted') {
                this.showError('Cannot build certificate, batch interrupted.')
              }
              console.log(
                '\t',
                phase.toString(),
                `: ${eventName}`,
                data.toHuman()
              )
            })

            this.printEvents(events)

            events
              .filter(
                ({ event: { section, method } }) =>
                  `${section}.${method}` == 'certificate.CertIssued'
              )
              .map((event) => {
                const [onchainId, _orgId, _recipientAddr] =
                  event.event.data.toHuman()
                this.lookupIssuedCertId(onchainId)
              })
          }
        })
        .catch((err) => {
          console.log('🚀 ~ file: index.vue ~ line 404 ~ buildCerts ~ err', err)
          this.loading = false
        })
    },
    genRefId(index) {
      return `${this.refPrefix}/${index}`
    },
    onPrefixChanged(event) {
      console.log(
        '🚀 ~ file: batches.vue ~ line 317 ~ onPrefixChanged ~ prefix',
        event.target.value
      )
      this.$storage.setUniversal('refPrefix', event.target.value)
    },
    showConfirmSubmitAllDialog() {
      this.viewConfirmSubmitAllDialog = true
    },
    printEvents(events) {
      events.forEach(({ event: { data, method, section }, phase }) => {
        const eventName = `${section}.${method}`
        console.log('\t', phase.toString(), `: ${eventName}`, data.toHuman())
      })
    },
    lookupIssuedCertId(issuedId) {
      this.$nuchain.api.query.certificate.issuedCert(issuedId).then((d) => {
        const issuedCert = d.toHuman()
        console.log(
          '🚀 ~ file: batches.vue ~ line 362 ~ .then ~ issuedCert',
          issuedCert
        )
        if (issuedCert) {
          this.patchModel(issuedId, issuedCert)
        }
      })
    },
    patchModel(issuedId, issuedCert) {
      this.persons = this.persons.map((person) => {
        console.log('🚀 ~ file: batches.vue ~ line 380 ~ .map ~ person', person)
        if (person.nim == issuedCert.props[0].value) {
          person.status = 'onchain'
          person.onchainId = issuedId
        }
        return person
      })
      this.$storage.setUniversal('processingQueue', this.persons)
    },
    generatePdf() {
      this.viewGeneratePdfDialog = !this.viewGeneratePdfDialog
    },
    doGeneratePdf() {
      const options = {
        left: parseInt(process.env.pdfMarginLeft),
        top: parseInt(process.env.pdfMarginTop),
        qrcode: {
          left: process.env.pdfQrcodePosLeft,
          top: process.env.pdfQrcodePosTop,
        },
        qrCodeOnly: this.pdfQrCodeOnly,
      }
      this.$pdf.generateBatched(
        this.persons.filter((p) => !!p.onchainId),
        this.org,
        options
      )
    },
  },
}
</script>