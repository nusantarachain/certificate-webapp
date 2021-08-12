<template>
  <div>
    <ErrorInfo v-if="errorInfo" :errorInfo="errorInfo" />
    <div v-if="!loading && accounts.length == 0"
      class="bg-yellow-100 border border-yellow-400 text-red-700 px-4 py-3 rounded w-3/4 md:w-2/5 mx-auto mt-10"
      role="alert"
    >
      <div>
        <strong class="font-bold uppercase">Tidak ada akses</strong>
      </div>
      <div>
        <p>Belum ada akun desentralisasi yang terhubung untuk mengakses portal sertifikasi ini.
          Anda perlu memasang browser extension <a class="link" href="https://chrome.google.com/webstore/detail/nuchain-app/hfcdboaniimgkememgmilhmnkdgggkne">Nuchain App</a> terlebih dahulu agar bisa menggunakannya.</p>
      </div>
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
      selectMode: false,
      errorInfo: null,
      loading: false,
      accounts: []
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
  async fetch() {
    this.loading = true;
    await this.$nuchain.init()
    console.log('in index mounted()')
    if (this.org) {
      this.accounts = this.$nuchain.getInjectedAccounts();
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
    this.loading = false;
    // this.$root.$on('showIssueCertDialog', (state) => {
    //   this.viewIssueCertDialog = true
    // })
    // })
  },
  methods: {
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

    onError(error) {
      this.showError(error)
    },

  },
}
</script>

<style>
a.link {
  color: #0a64ca !important;
}

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
