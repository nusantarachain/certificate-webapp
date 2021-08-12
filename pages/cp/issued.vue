<template>
  <div>
    <div class="container relative">
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
          <div class="alert-title font-semibold text-lg text-red-800">
            Error
          </div>
          <div class="alert-description text-sm text-red-600">
            {{ errorInfo }}
          </div>
        </div>
      </div>

      <div v-if="org" class="flex flex-col">
        <div class="flex flex-row">

          <div class="m4 flex-row">
            <div for="recents" class="font-semibold text-left"
              >Recents:</div
            >
            <div class="flex flex-horizontal">
              <BigButton v-if="hasSelection" caption="Remove" :loading="false" @click="removeSelected" />
            </div>
          </div>
          <div class="flex-grow"></div>


          <label
            class="
              m-4
              w-16
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
            @click="openAddByIdDialog()"
          >
            <span class="text-base leading-normal font-semibold">Add</span>
          </label>

          <label
            class="
              m-4
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
        </div>

        <ConfirmDialog
          v-model="viewConfirmClearDialog"
          :onSubmit="clearRecentHistory"
          text="Are you sure to clear all recent history?"
        />

        <PersonTable
          v-if="currentUser"
          ref="table"
          humanIdPrefix=""
          :certId="selectedCertId"
          :accountAddress="currentUser.address"
          :org="this.org"
          @selectionChanged="onSelectionChanged"
          @onError="onError"
        />
      </div>
      <!-- <iframe width="600" height="775" border="1"></iframe> -->

      <Dialog
        v-model="viewAddByIdDialog"
        title="Add by ID"
        :onSubmit="onAddById"
        :loading="addByIdInProgress"
        submitText="Fetch"
      >
      <input
        ref="addByIdInput"
            type="text"
            placeholder="Contoh: CENpr3BctaF"
            class="w-64 px-5 py-1 text-gray-700 bg-gray-200 rounded"
            @keyup.enter="onAddById"
          />
      </Dialog>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      title: process.env.appTitle,
      orgId: process.env.orgId,
      org: null,
      injectedAccounts: [],
      selectMode: false,
      certs: [],
      selectedCertId: '',
      errorInfo: null,
      loading: false,
      recentsProcessed: [],
      viewConfirmClearDialog: false,
      viewAddByIdDialog: false,
      addByIdInProgress: false,
      checkedItems: [],
    }
  },
  computed: {
    currentUser() {
      return this.$session.currentUser()
    },
    hasSelection() {
      return this.checkedItems.length > 0;
    }
  },
  async mounted() {
    // this.$root.$on("initialized", async (org)=>{
    // console.log('org:', org)
    this.org = this.$storage.getUniversal('org')
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

    this.$root.$on('recentsDataUpdated', (recents) => {
      this.recentsProcessed = recents
      // this.$storage.setUniversal('recentsProcessed', recents)
      // this.loadData();
    })

    // })
  },
  destroyed() {
    this.$root.$off('recentsDataUpdated')
  },
  methods: {
    // async init() {
    //   return await this.$nuchain.api.query.organization.organizations(
    //     this.orgId
    //   )
    // },
    onSelectionChanged(items){
      this.checkedItems = items.filter(item => item.checked);
    },
    removeSelected(){
      this.$refs.table.removeItems(this.checkedItems);
    },
    showConfirmClearDialog() {
      this.viewConfirmClearDialog = true
    },
    clearRecentHistory() {
      this.$root.$emit('clearRecentHistory')
      this.viewConfirmClearDialog = false
    },
    async loadCerts() {
      const data = await this.$nuchain.api.query.certificate.certificateOfOrg(
        this.orgId
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
      const recentsProcessed =
        this.$storage.getUniversal('recentsProcessed') || []
      this.recentsProcessed = recentsProcessed
    },
    saveData(nimPairs) {
      const recentsProcessed = nimPairs.map(this.mapPersonData)
      this.$storage.setUniversal('recentsProcessed', recentsProcessed)
      this.recentsProcessed = recentsProcessed
    },
    mapPersonData([nim, personName, score]) {
      return { nim, personName, score }
    },
    async onAddById() {
      const issuedId = this.$refs.addByIdInput.value;
      console.log("this.$refs.addByIdInput.value:", issuedId)
      this.addByIdInProgress = true
      try {
        let resp = await this.$nuchain.getIssuedCertificate(issuedId)
        console.log("🚀 ~ file: issued.vue ~ line 299 ~ onAddById ~ issuedCert", resp.toHuman())
        let issuedCert = resp.toHuman()
        if (!issuedCert){
          this.showError("Not found or invalid ID")
          return
        }
        let p = {
          nim: this.$util.getPropValue(issuedCert.props, "nim"),
          score: this.$util.getPropValue(issuedCert.props, "score"),
          personName: issuedCert.recipient,
          processing: false,
          status: 'onchain',
          onchainId: issuedId
        };
        this.$refs.table.addItem(p)
      }catch(e){
        this.showError(e)
      }finally{
        this.viewAddByIdDialog = false
        this.addByIdInProgress = false
      }
      this.$refs.addByIdInput.value = ""
    },
    openAddByIdDialog(){
      this.viewAddByIdDialog = true
      const addByInput = this.$refs.addByIdInput;
      setTimeout(()=> {
        addByInput.focus()
      }, 100);
    },
    genRefId(index) {
      return `${this.humanIdPrefix}/${index}`
    },
    onError(error) {
      this.showError(error)
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
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/

h2.subtitle {
  text-decoration: underline;
}
h3 {
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
