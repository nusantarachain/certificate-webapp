<template>
  <nav class="bg-white shadow" role="navigation">
    <div class="mx-auto p-4 flex flex-wrap items-center md:flex-no-wrap">
      <div>
        <a href="/cp" rel="home">
          <img src="~/assets/instance-logo-small.png" class="navbar-logo" />
        </a>
      </div>
      <div class="ml-auto md:hidden">
        <button
          class="flex items-center px-3 py-2 border rounded"
          type="button"
        >
          <svg
            class="h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>{{ title }}</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div class="w-full md:w-auto md:flex-grow md:flex md:items-center">
        <div class="flex divide-x">
          <span class="block px-4 py-1 md:p-2 lg:px-4 font-semibold">{{
            title
          }}</span>
          <ul
            class="
              flex flex-col
              mt-4
              -mx-4
              pt-4
              border-t
              md:flex-row
              md:items-center
              md:mx-0
              md:mt-0
              md:pt-0
              md:mr-4
              lg:mr-8
              md:border-0
            "
          >
            <li>
              <NuxtLink
                to="/cp/settings"
                :class="`block px-4 py-1 md:p-2 lg:px-4 ${activeLink(
                  '/cp/settings'
                )}`"
                >Settings</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/cp/certificates"
                :class="`block px-4 py-1 md:p-2 lg:px-4 ${activeLink(
                  '/cp/certificates'
                )}`"
                >Certificates</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/cp/issued"
                :class="`block px-4 py-1 md:p-2 lg:px-4 ${activeLink(
                  '/cp/issued'
                )}`"
                >Issued</NuxtLink
              >
            </li>
            <!-- <li>
            <a class="block px-4 py-1 md:p-2 lg:px-4" href="#" title="Link"
              >Link</a
            >
          </li> -->
          </ul>
          <ul
            v-if="$route.path == '/cp/certificates'"
            class="
              flex flex-col
              mt-4
              -mx-4
              pt-4
              border-t
              md:flex-row
              md:items-center
              md:mx-0
              md:mt-0
              md:pt-0
              md:mr-4
              lg:mr-8
              md:border-0
            "
          >
            <li>
              <a
                href="javascript://"
                class="block px-4 py-1 ml-5 md:p-2 lg:px-4"
                @click="showAddCertDialog"
              >
                Add Certificate
              </a>
            </li>
          </ul>
          <ul
            v-if="$route.path == '/cp/issued' || $route.path == '/cp/batches'"
            class="
              flex flex-col
              mt-4
              -mx-4
              pt-4
              border-t
              md:flex-row
              md:items-center
              md:mx-0
              md:mt-0
              md:pt-0
              md:mr-4
              lg:mr-8
              md:border-0
            "
          >
            <li>
              <a
                href="javascript://"
                class="block px-4 py-1 ml-5 md:p-2 lg:px-4"
                @click="showIssueCertDialog"
              >
                Issue Certificate
              </a>
            </li>
            <li>
              <NuxtLink
                to="/cp/batches"
                :class="`block px-4 py-1 ml-5 md:p-2 lg:px-4 ${activeLink(
                  '/cp/batches'
                )}`"
              >
                Batch
              </NuxtLink>
            </li>
            <li>
              <div class="relative ml-6">
                <input
                  type="search"
                  class="bg-purple-white shadow rounded border-0 pl-2 pt-1 pb-2"
                  v-model="issuedCertId"
                  @keyup="onCodeChange"
                  placeholder="Search by code..."
                />
                <div
                  class="absolute pin-r pin-t mt-3 mr-4 text-purple-lighter"
                  style="top: 0; right: 0"
                >
                  <svg
                    version="1.1"
                    class="h-4 text-dark"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 52.966 52.966"
                    style="enable-background: new 0 0 52.966 52.966"
                    xml:space="preserve"
                  >
                    <path
                      d="M51.704,51.273L36.845,35.82c3.79-3.801,6.138-9.041,6.138-14.82c0-11.58-9.42-21-21-21s-21,9.42-21,21s9.42,21,21,21
        c5.083,0,9.748-1.817,13.384-4.832l14.895,15.491c0.196,0.205,0.458,0.307,0.721,0.307c0.25,0,0.499-0.093,0.693-0.279
        C52.074,52.304,52.086,51.671,51.704,51.273z M21.983,40c-10.477,0-19-8.523-19-19s8.523-19,19-19s19,8.523,19,19
        S32.459,40,21.983,40z"
                    />
                  </svg>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <ul
          class="
            flex flex-col
            mt-4
            -mx-4
            pt-4
            border-t
            md:flex-row
            md:items-center
            md:mx-0
            md:ml-auto
            md:mt-0
            md:pt-0
            md:border-0
          "
        >
          <li>
            <span
              class="block px-4 py-1 md:p-2 lg:px-4 cursor-pointer"
              @click="toggleSelectAccount"
              title="Link"
              >{{ loggedInName }}</span
            >
          </li>
        </ul>

        <div class="relative">
          <div
            v-if="selectMode"
            class="flex flex-col items-center absolute right-0"
          >
            <div class="w-full px-4">
              <div class="flex flex-col items-center text-left relative">
                <div
                  class="
                    shadow
                    bg-white
                    top-100
                    z-40
                    w-full
                    lef-0
                    rounded
                    max-h-select
                    overflow-y-auto
                  "
                >
                  <div class="flex flex-col w-full">
                    <div
                      v-for="(a, index) in injectedAccounts"
                      v-bind:key="a.address"
                      class="
                        cursor-pointer
                        w-full
                        border-gray-100
                        rounded-t
                        border-b
                        hover:bg-green-100
                      "
                    >
                      <AccountItem
                        :account="a"
                        :index="index"
                        @click="useAccount"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: [],
  data() {
    const currentUser = this.$session.currentUser()
    return {
      loggedInName: currentUser ? currentUser.meta.name : 'Connect',
      // injectedAccounts: this.accounts || [],
      selectMode: false,
      issuedCertId: '',
    }
  },
  computed: {
    title() {
      const org = this.$storage.getUniversal('org')
      return org ? org.name : process.env.appTitle
    },
    injectedAccounts() {
      return this.$nuchain.getInjectedAccounts();
    },
  },
  mounted() {
    // this.$root.$on("initialized", (org)=>{
    //   if (org){
    //     this.title = org.name;
    //   }
    // });
  },
  methods: {
    async useAccount(a) {
      this.loggedInName = a.meta.name
      this.selectMode = false
      await this.$nuchain.useAccount(a.address)
      console.log('account selected:', a.meta.name)
      this.$emit('selectAccount', a)
    },
    toggleSelectAccount() {
      this.selectMode = !this.selectMode
      // console.log(this.selectMode)
    },
    activeLink(path) {
      if (this.$route.path == path) {
        return 'text-purple-600'
      }
      return ''
    },
    showAddCertDialog() {
      this.$root.$emit('showAddCertDialog', true)
    },
    showIssueCertDialog() {
      this.$root.$emit('showIssueCertDialog', true)
    },
    async onCodeChange() {
      if (this.issuedCertId.length == 11) {
        if (/^[a-zA-Z0-9]+$/.test(this.issuedCertId)) {
          let issued = await this.$nuchain.getIssuedCertificate(this.issuedCertId)
          console.log("🚀 ~ file: NavBar.vue ~ line 315 ~ onCodeChange ~ issued", issued)
          if (issued) {
            console.log(
              '🚀 ~ file: NavBar.vue ~ line 314 ~ onCodeChange ~ issued.data',
              issued
            )
            this.addToRecent(issued, this.issuedCertId)
          }
        }
      }
    },
    addToRecent(item, id) {
      if (!item) return;
      var recents = this.$storage.getUniversal('recentsProcessed') || []
      const d = item.toHuman();
      if (!d) return;
      const nim = this.$util.getPropValue(d.props, "nim");
      const score = this.$util.getPropValue(d.props, "score");
      const personName = d.recipient;
      if (recents.findIndex((a) => a.nim == nim) > -1){
        return;
      }
      recents.push({
        nim,
        personName,
        score,
        processing: false,
        status: 'onchain',
        onchainId: id,
      })
      this.$storage.setUniversal('recentsProcessed', recents)
      this.$root.$emit('recentsDataUpdated', recents)
    },
  },
}
</script>

<style scoped>
img.navbar-logo {
  width: 40px;
  height: 40px;
}
</style>