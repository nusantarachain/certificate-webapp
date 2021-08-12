<template>
  <div>
    <NavBar
      v-if="injectedAccounts && inCp"
      @selectAccount="selectAccount"
    />
    <Nuxt />
    <DialogIssueCertificate v-if="inCp && org" v-model="viewIssueCertDialog" :org="org" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      orgId: process.env.orgId,
      org: null,
      viewIssueCertDialog: false,
      selectedCertId: '',
      errorInfo: null,
      loading: false,
    }
  },
  computed: {
    inCp() {
      return (
        this.$route.path.startsWith('/cp/') || this.$route.path.endsWith('/cp')
      )
    },
    injectedAccounts(){
      return this.$nuchain.getInjectedAccounts();
    }
  },
  async mounted() {
    await this.$nuchain.init()
    this.init()
    // if (this.inCp){
    //   this.loadAccounts()
    // }
    this.$root.$on('showIssueCertDialog', (state) => {
      this.errorInfo = null
      this.viewIssueCertDialog = true
    })
  },
  methods: {
    async init() {
      this.org = (
        await this.$nuchain.api.query.organization.organizations(this.orgId)
      ).toHuman()
      console.log('Use organization id:', this.orgId)
      if (this.org) {
        this.$storage.setUniversal('org', this.org)
      }
      console.log('this.org:', this.org)
      this.$root.$emit('initialized', this.org)
    },
    // loadAccounts() {
    //   this.injectedAccounts = this.$nuchain.getInjectedAccounts()
    //   console.log('this.injectedAccounts:')
    //   console.log(this.injectedAccounts)
    // },
    selectAccount(acc) {
      this.$session.setCurrentUser(acc)
    },
  },
}
</script>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
