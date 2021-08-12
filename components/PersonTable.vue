<template>
  <table class="min-w-full table-auto">
    <thead class="justify-between">
      <tr class="bg-gray-800">
        <th class="checkbox">
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-gray-600"
            @click="toggleSelectAll"
          />
        </th>
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
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-gray-600"
            v-model="p.checked"
            @mouseup="toggleSelectItem"
          />
        </td>
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
            class="
              inline-block
              px-5
              ml-5
              text-xs
              font-medium
              leading-6
              text-center text-white
              uppercase
              transition
              bg-blue-700
              rounded
              shadow
              ripple
              hover:shadow-lg
              hover:bg-blue-800
              focus:outline-none
            "
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
            :opts="pdfOptions"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: ['refPrefix', 'certId', 'accountAddress', 'org'],
  data() {
    return {
      loadedPersons: [],
      checkedAll: false,
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
    this.$root.$on('recentsDataUpdated', (recents) => {
      this.loadedPersons = recents
      // this.saveData()
    })
    this.$root.$on('clearRecentHistory', () => {
      this.loadedPersons = []
      this.saveData()
    })
    this.loadData()
  },
  destroyed() {
    console.log('remove listener for recentsDataUpdated')
    this.$root.$off('recentsDataUpdated')
  },
  methods: {
    toggleSelectAll() {
      this.checkedAll = !this.checkedAll
      this.loadedPersons = this.loadedPersons.map((p) => {
        p.checked = this.checkedAll
        return p
      })
      this.$emit('selectionChanged', this.loadedPersons)
    },
    toggleSelectItem() {
      setTimeout(() => {
        this.$emit('selectionChanged', this.loadedPersons)
      }, 100)
    },
    removeItems(items) {
      this.loadedPersons = this.loadedPersons.filter(
        (p) => items.findIndex((a) => a.id == p.id && !p.checked) > -1
      )
      this.saveData()
      this.$emit('selectionChanged', this.loadedPersons)
    },
    saveData() {
      this.$storage.setUniversal('recentsProcessed', this.loadedPersons)
    },
    loadData() {
      const persons = this.$storage.getUniversal('recentsProcessed')
      console.log(persons)
      this.loadedPersons = persons
    },
    async submit(p, index) {
      const refId = this.genRefId(index)
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
            const error = this.getError(events)
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
            this.setProcessing(p, false, { status: 'onchain' })
            this.saveData()
          }
        })
        .catch((e) => console.log(e))
    },
    genRefId(index) {
      return `${this.refPrefix}/${index}`
    },
    showError(msg) {
      this.$emit('onError', msg)
    },
    getError(events) {
      const event = events.find(
        ({ event: { method, section } }) =>
          `${section}.${method}` == 'system.ExtrinsicFailed'
      ).event

      const mod = event.data.find((a) => a.isModule)
      if (mod) {
        const error = mod.registry.findMetaError(mod.asModule)
        console.log(error)
        return error
      } else {
        return null
      }
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
    setProcessing(p, state, status = '') {
      this.loadedPersons = this.loadedPersons.map((a) => {
        if (a.nim == p.nim) {
          a.processing = state
          if (status != '') {
            a.status = status
          }
        }
        return a
      })
    },
    addItem(item) {
      if (this.loadedPersons.filter((p) => p.nim == item.nim).length > 0) {
        return
      }
      this.loadedPersons.push(item)
      this.saveData()
    },
  },
}
</script>

<style scoped>
th.checkbox {
  width: 50px !important;
}
</style>