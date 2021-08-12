<template>
  <div class="container">
    <div class="flex gap-10 flex-wrap">
      <CertItem
        v-for="cert in certs"
        v-bind:key="cert.id"
        :cert="cert"
        @click="onCertItemClick"
      />
    </div>
    <Dialog
      v-if="selectedCert"
      title="Certificate Detail"
      v-model="viewCertDetailDialog"
      dismissText="Close"
    >
      <h2>{{ selectedCert.name }}</h2>
      <strong>description:</strong>
      <p>{{selectedCert.description}}</p>
      <p></p>
      <strong>signer:</strong>
      <p>{{selectedCert.signer_name}}</p>
      <div class="text-sm py-1 overflow-ellipsis overflow-hidden">
          <strong>ID</strong>:{{ selectedCert.id }}
        </div>
    </Dialog>
    <Dialog
      title="Add Certificate"
      :onSubmit="onSubmitAdd"
      v-model="viewAddCertDialog"
      :loading="inProcessAddCert"
    >
      <div v-if="errorInfo" class="bg-red-100 border border-red-400 text-red-700 py-3 rounded">
        {{errorInfo}}
      </div>
      <form action="/cp">
        <div class="justify-center items-center w-full text-left">
          <form class="max-w-xl bg-white">
            <div class="">
              <label class="block text-sm text-gray-00" for="certName"
                >Name:</label
              >
              <input
                :class="`w-full px-5 py-1 text-gray-700 bg-gray-200 rounded ${certNameClass}`"
                id="certName"
                name="certName"
                type="text"
                required="true"
                placeholder="eg: Sertifikat Komputer"
                aria-label="Name"
                ref="certName"
                v-model="certName"
              />
              <small v-if="certNameError" class="text-red-600">{{
                certNameError
              }}</small>
            </div>
            <div class="mt-2">
              <label class="block text-sm text-gray-600" for="certDesc"
                >Description:</label
              >
              <input
                :class="`w-full px-5 py-4 text-gray-700 bg-gray-200 rounded ${certDescriptionClass}`"
                id="certDesc"
                name="certDesc"
                type="text"
                required="true"
                placeholder="eg: Sertifikat komputer yang diberikan setelah menyelesaikan tugas komputer"
                aria-label="Description"
                v-model="certDescription"
              />
              <small v-if="certDescriptionError" class="text-red-600">{{
                certDescriptionError
              }}</small>
            </div>

            <div class="mt-2">
              <label class="block text-sm text-gray-600" for="certSignerName"
                >Signer name: (optional)</label
              >
              <input
                class="w-full px-5 py-4 text-gray-700 bg-gray-200 rounded"
                id="certSignerName"
                name="certSignerName"
                type="text"
                required=""
                placeholder="eg: Mahfud, MM"
                aria-label="Signer name"
                v-model="certSignerName"
              />
            </div>
          </form>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script>
import { decodeAddress } from '@polkadot/util-crypto'
export default {
  data() {
    return {
      orgId: process.env.orgId,
      certs: [],
      viewAddCertDialog: false,
      viewCertDetailDialog: false,
      selectedCert: null,
      errorInfo: null,
      certName: '',
      certNameClass: '',
      certNameError: null,
      certDescription: '',
      certDescriptionClass: '',
      certDescriptionError: null,
      certSignerName: '',
      inProcessAddCert: false,
    }
  },
  async mounted() {
    await this.loadCerts()
    this.$root.$on('showAddCertDialog', (state) => {
      this.viewAddCertDialog = state
    })
  },
  destroyed() {
    this.$root.$off('showAddCertDialog')
  },
  methods: {
    onCertItemClick(cert) {
      console.log(
        '🚀 ~ file: certificates.vue ~ line 108 ~ onCertItemClick ~ cert',
        cert
      )
      this.selectedCert = cert;
      this.showCertDetailDialog(true);
    },
    showCertDetailDialog(state) {
      this.viewCertDetailDialog = state;
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
    async onSubmitAdd() {
      if (this.validateAddCert()) {
        this.errorInfo = null
        this.inProcessAddCert = true
        const certDetail = {
          name: this.certName,
          description: this.certDescription,
          org_id: this.orgId,
          signer_name: this.certSignerName,
        }
        console.log(
          '🚀 ~ file: certificates.vue ~ line 162 ~ onSubmitAdd ~ certDetail',
          certDetail
        )

        const currentUser = this.$session.currentUser()
        if (!currentUser) {
          alert('Please select account to sign')
          return
        }
        const accountAddress = currentUser.address

        const signer = await this.$nuchain.useAccount(accountAddress)

        this.$nuchain.api.tx.certificate
          .create(certDetail)
          .signAndSend(accountAddress, signer, ({ events = [], status }) => {
            if (status.isInBlock) {
              this.inProcessAddCert = false
              const error = this.$nuchain.getError(events)
              if (error) {
                this.showError(error.documentation[0])
              } else {
                this.errorInfo = null
                this.viewAddCertDialog = false
                this.loadCerts()
              }
            }
          })
          .catch((err) => {
            console.log(
              '🚀 ~ file: certificates.vue ~ line 193 ~ onSubmitAdd ~ err',
              err
            )
            this.showError(err)
            this.inProcessAddCert = false
          })
      }
    },
    showError(msg) {
      this.errorInfo = msg
    },
    validateAddCert() {
      this.certNameClass = ''
      this.certNameError = null
      this.certDescriptionClass = ''
      this.certDescriptionError = null
      var failed = false
      if (this.certName.trim().length == 0) {
        this.certNameClass = 'border border-red-500 hover:border-red-500'
        this.certNameError = 'Please enter cert name'
        failed = true
      }
      if (this.certDescription.trim().length == 0) {
        this.certDescriptionClass = 'border border-red-500 hover:border-red'
        this.certDescriptionError = 'Please enter description'
        failed = true
      }

      return !failed
    },
    showAddCertDialog() {
      const currentUser = this.$session.currentUser()
      if (!currentUser) {
        alert('Please select account to sign')
        return
      }
      this.viewAddCertDialog = true
    },
  },
}
</script>

<style lang="sass" scoped>
.container
  padding: 1em
</style>