<template>
  <div
    :style="`margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft}; height: ${height} !important; width: ${width} !important;`"
    keep-alive
    :class="`${
      showBorder ? 'border-8 border-green-600' : ''
    }  main content-center justify-center justify-items-center justify-self-center place-content-center text-center`"
  >
    <div v-if="loading || $fetchState.pending" class="p-64 h-64">
      <Loading />
    </div>

    <div v-if="!loading && showEnterCode">
      <div class="p-10">
        <div>
          <div
            class="
              flex
              justify-center justify-items-center justify-self-center
              pb-10
            "
          >
            <img
              src="~/assets/instance-logo.png"
              class="institution-logo center"
            />
          </div>
          <h1 class="title">{{ title }}</h1>
        </div>

        <div class="title">Masukan 11 digit kode sertifikat:</div>
        <div>
          <input
            type="text"
            placeholder="Contoh: CENpr3BctaF"
            class="w-64 px-5 py-1 text-gray-700 bg-gray-200 rounded"
            v-model="typedIssuedId"
            @keyup="onCodeChange"
          />
        </div>
        <div>
          <div class="bg-white">
            <v-popover>
              <a class="text-xs italic" href="#">kode apa ini?</a>
              <div
                slot="popover"
                class="
                  help-cert-code
                  flex
                  justify-center justify-items-center justify-self-center
                "
              >
                <p>
                  Ini adalah kode sertifikat 11 digit yang bisa didapat di
                  lembar sertifikat:
                </p>
                <img
                  :src="require('~/assets/help-cert-code.png')"
                  class="institution-logo center"
                />
              </div>
            </v-popover>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="!loading && !valid" class="alert">
        <h2>Invalid Certificate</h2>
      </div>
    </div>

    <div v-if="valid && !loading && cert">
      <div v-if="!printable" class="absolute flex-shrink">
        <MedalIcon />
        <!-- <img :src="require('~/assets/instance-logo.jpg')" class="institution-logo medal" /> -->
      </div>

      <div
        class="
          flex flex-col
          pt-10
          mt-5
          flex-grow
          justify-items-center
          items-center
        "
      >
        <div>
          <div
            class="flex justify-center justify-items-center justify-self-center"
          >
            <img
              :src="require('~/assets/instance-logo.png')"
              class="institution-logo center"
            />
          </div>
          <h1 class="title">{{ title }}</h1>
        </div>

        <div
          class="
            flex flex-col
            justify-center justify-items-center justify-self-center
          "
        >
          <h2 class="subtitle py-0 my-0">{{ cert.name }}</h2>
          <h3 class="cert-code">{{ humanId }}</h3>

          <h3 class="subtitle-2 py-5">Diberikan kepada:</h3>

          <div class="person-name">{{ personName }}</div>
          <strong>Pada tanggal {{ issuedDate }}</strong>
        </div>

        <!-- <Loading /> -->
      </div>
    </div>

    <div
      v-if="valid && !loading"
      class="
        flex
        md:flex-row
        flex-col
        md:justify-between
        justify-center
        items-end
        px-20
        relative
      "
    >
      <div class="ttd mt-10">
        <img
          v-if="ttdmap[authoritySigner]"
          :src="require(`~/assets/ttd/${ttdmap[authoritySigner]}.png`)"
          class="ttd"
        />
        <p>
          <strong>{{ authoritySigner }}</strong>
        </p>
        <p>
          <strong>{{ authoritySignerPosition }}</strong>
        </p>
      </div>
      <div
        class="
          text-center
          items-center
          justify-center justify-items-center justify-content-center
          content-center
        "
      >
        <vue-qrcode :value="proofUrl" :options="{ width: 100 }"></vue-qrcode>
        <p>{{ issuedId }}</p>
      </div>
    </div>

    <div v-if="valid && !loading" class="notes">
      <p>Sertifikat ini tersimpan secara digital di dalam Blockchain</p>
    </div>
  </div>
</template>

<script>
import VueQrcode from '@chenfengyuan/vue-qrcode'
import MedalIcon from '~/assets/cert-medal.svg?inline'
export default {
  components: {
    VueQrcode,
    MedalIcon,
  },
  async asyncData({ params }) {
    return {
      printable: true,
      valid: false,
      title: '',
      humanId: 'XXX/XX/11/22',
      cert: {
        name: 'Sertifikat XXX',
        date: '21 Desember 2021',
      },
      issuedDate: '21 Desember 2001',
      personName: '',
      loading: true,
      authoritySigner: '-',
      authoritySignerPosition: '',
      ttdmap: require('../ttdmap').default,
      showEnterCode: false,
      typedIssuedId: '' // issued id yg di-type manual oleh user
    }
  },
  computed: {
    issuedId() {
      return this.$route.query.i;
    },
    proofUrl(){
      return `${process.env.proofBaseUrl}/?i=${this.issuedId}`;
    },
    marginLeft() {
      return this.$storage.getUniversal(`print-margin-left`) || '5px'
    },
    marginTop() {
      return this.$storage.getUniversal(`print-margin-top`) || '5px'
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
  mounted(){
    console.log("in mounted() index.vue");
  },
  async fetch() {
    console.log("issued id:", this.issuedId)
    if (!this.issuedId) {
      this.showEnterCode = true
      this.loading = false
      return
    }
    console.log('get issued cert with id', this.issuedId)
    let issued = await this.$nuchain.api.query.certificate.issuedCert(
      this.issuedId
    )
    console.log('after get issuedCert')
    console.log(issued.toHuman())

    const issuedCert = issued.toHuman()

    if (issuedCert == null) {
      this.loading = false
      return
    }

    let certResp = await this.$nuchain.api.query.certificate.certificates(
      issuedCert.cert_id
    )
    const cert = certResp.toHuman()
    console.log(cert)

    if (cert.org_id != process.env.orgId) {
      this.loading = false
      return
    }

    const org = (
      await this.$nuchain.api.query.organization.organizations(cert.org_id)
    ).toHuman()
    console.log('🚀 ~ file: _issuedId.vue ~ line 119 ~ fetch ~ org', org)

    // assign to this data

    this.title = org ? org.name : process.env.appTitle
    this.humanId = issuedCert.human_id
    this.personName = issuedCert.recipient
    this.issuedDate = this.$util.formatDate(new Date(issued.toJSON().time))

    this.cert = cert
    this.authoritySigner = cert.signer_name
    this.loading = false
    this.valid = true
  },
  methods: {
    onCodeChange() {
      if (this.typedIssuedId.length == 11) {
        if (this.$util.validIssuedId(this.typedIssuedId)) {
          // this.$router.push(`/?i=${this.typedIssuedId}`)
          window.location = `${process.env.proofBaseUrl}/?i=${this.typedIssuedId}`
        }
      }
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

.main {
  margin: 0 auto;
  /* min-height: 100vh; */
  overflow: hidden;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
}

.cert-code {
  font-size: 1em;
}

.help-cert-code {
  width: 300px;
  border: 1px solid #cacaca;
  padding: 10px;
}

.title {
  font-family: 'Georgia', 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 1.5em;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 500;
  font-size: 25px;
  word-spacing: 5px;
}

.subtitle-2 {
  font-size: 20px;
}

.person-name {
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
.ttd {
  /* position: relative; */
  /* min-height:400px; */
}
.ttd img {
  /* position: absolute; */
  left: 0;
  bottom: 0;
  /* width: 500px; */
  height: 100px;
}
.notes {
  font-size: 11px;
}
</style>
