<template>
  <table class="min-w-full table-auto">
    <thead class="justify-between">
      <tr class="bg-gray-800">
        <th class="px-16 py-2">
          <span class="text-gray-300">NIM</span>
        </th>
        <th class="px-16 py-2">
          <span class="text-gray-300">Nama</span>
        </th>
        <th class="px-16 py-2">
          <span class="text-gray-300">Score</span>
        </th>
        <th class="px-16 py-2">
          <span class="text-gray-300">Status</span>
        </th>
        <th class="px-16 py-2">
          <span class="text-gray-300"></span>
        </th>
      </tr>
    </thead>
    <tbody class="bg-gray-200">
      <tr
        v-for="(p, index) in loadedPersons"
        class="bg-white border-4 border-gray-200"
        v-bind:key="p.onchainId || p.nim"
      >
        <td class="text-center">
          <span class="text-center ml-2 font-semibold">{{ p.nim }}</span>
        </td>
        <td class="text-left">
          <span class="text-left ml-2 font-semibold">{{ p.personName }}</span>
        </td>
        <td class="text-center">
          <span class="text-center ml-2 font-semibold">{{ p.score }}</span>
        </td>

        <td class="px-16 py-2 flex text-center items-center">
          <span v-if="p.status == 'onchain'" class="text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span
            v-if="p.status == 'onchain'"
            class="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs"
            >on-chain
            <a
              v-if="p.onchainId"
              :href="`/?i=${p.onchainId}`"
              target="_blank"
              class="font-bold"
              >({{ p.onchainId }})</a
            >
          </span>
          <span
            v-if="p.status == 'pending'"
            class="bg-yellow-200 text-yellow-600 py-1 px-3 rounded-full text-xs"
            >off-chain</span
          >
          <span
            v-if="p.status == null"
            class="bg-yellow-200 text-yellow-600 py-1 px-3 rounded-full text-xs"
            >unknown</span
          >
        </td>

        <td>
          <button
            v-if="p.status == null || p.status == 'pending'"
            :class="`
              inline-block
              px-5
              ml-5
              text-xs
              font-medium
              leading-6
              text-center text-white
              uppercase
              transition
              rounded
              shadow
              ripple
              hover:shadow-lg
              ${
                p.processing
                  ? 'bg-gray-400 hover:bg-gray-400'
                  : 'bg-blue-700 hover:bg-blue-800'
              }
              focus:outline-none
            `"
            @click="submit(p, index)"
          >
            <div v-if="p.processing" class="pt-2 pl-3">
              <Loading :withText="false" />
            </div>

            <span v-if="!p.processing">Submit</span>
          </button>

          <DownloadPdfButton
            v-if="p.status == 'onchain'"
            :item="p"
            :org="org"
            :loading="loading"
            :opts="pdfOptions"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: [
    'refPrefix',
    'certId',
    'accountAddress',
    'persons',
    'org',
    'loading'
  ],
  data() {
    return {
      loadedPersons: this.persons || [],
    }
  },
  computed: {
    pdfOptions() {
      return {
        qrCodeOnly: this.$storage.getUniversal('settings.pdfQrCodeOnly') || false
      }
    }
  },
  mounted() {
    this.loadData()
  },
  destroyed() {},
  watch: {
    persons(b, a) {
      this.loadedPersons = b
    },
    refPrefix(b, a) {
      this.refPrefix = b
    },
    loading(b) {
      this.loading = b
    },
    pdfOptions(b) {
      this.pdfOptions = b
    },
  },
  methods: {
    saveData() {
      this.$storage.setUniversal('processingQueue', this.persons)

      // update recents processed data
      var recentsProcessed =
        this.$storage.getUniversal('recentsProcessed') || []
      for (var i = 0; i < this.persons.length; i++) {
        let p = this.persons[i]
        if (p.onchainId) {
          if (
            recentsProcessed.findIndex((r) => r.onchainId == p.onchainId) == -1
          ) {
            recentsProcessed.push(p)
          }
        }
      }
      this.$storage.setUniversal('recentsProcessed', recentsProcessed)
    },
    loadData() {
      const persons = this.$storage.getUniversal('processingQueue') || []
      console.log(persons)
      this.loadedPersons = persons
      this.$emit('onUpdated', persons)
    },
    async submit(p, index) {
      if (p == null) {
        return
      }
      if (!this.certId) {
        alert('Please select certificate to issue')
        return
      }
      const refId = this.genRefId(index + 1)
      if (!refId || refId.trim().length < 2) {
        this.showError('Ref ID (prefix) belum diset, mohon isi terlebih dahulu')
        return
      }
      const props = [
        { name: 'nim', value: p.nim },
        { name: 'score', value: p.score },
      ]
      console.log('props:', props)
      const signer = await this.$nuchain.useAccount(this.accountAddress)
      this.setProcessing(p, true)
      this.$nuchain.api.tx.certificate
        .issue(
          process.env.orgId,
          this.certId,
          refId,
          p.personName,
          props,
          null,
          null
        )
        .signAndSend(this.accountAddress, signer, ({ events = [], status }) => {
          if (status.isInBlock) {
            events.forEach(({ event: { data, method, section }, _phase }) => {
              const eventName = `${section}.${method}`
              console.log(eventName)
              console.log(data.toHuman())
            })
            this.printEvents(events)
            const error = this.$nuchain.getError(events)
            if (error) {
              if (error.method == 'NotExists') {
                this.showError(
                  'Certificate not exists, please create certificate first'
                )
              } else {
                this.showError(error.documentation[0])
              }
              this.resetProcessing()
              return
            }
            const event = this.$nuchain.getEventByName(
              events,
              'certificate.CertIssued'
            )
            if (event && event.event) {
              const args = event.event.data.toHuman()
              const [onchainId, _orgId, _recipientAddr] = args
              this.setProcessing(p, false, { status: 'onchain', onchainId })
              this.saveData()
            }
          }
        })
        .catch((e) => console.log(e))
    },
    genRefId(index) {
      if (!this.refPrefix) {
        return null
      }
      return `${this.refPrefix}/${index}`
    },
    showError(msg) {
      this.$emit('onError', msg)
    },
    isSuccess(events) {
      const result = this.getError(events)
      return result == null
    },
    resetProcessing() {
      this.loadedPersons = this.loadedPersons.map((a) => {
        a.processing = false
        return a
      })
    },
    setProcessing(p, state, fields = {}) {
      this.loadedPersons = this.loadedPersons.map((a) => {
        if (a.nim == p.nim) {
          a.processing = state
          for (const [key, value] of Object.entries(fields)) {
            a[key] = value
          }
        }
        return a
      })
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