
import AppConfig from './app.config';

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  env: {
    nuchainEndpoint:
      process.env.NUCHAIN_ENDPOINT || 'wss://testnet.nuchain.riset.tech',
    appTitle: process.env.APP_TITLE || 'NUCHAIN',
    proofBaseUrl:
      process.env.PROOF_BASE_URL || 'https://cert.fastikom-unsiq.ac.id',
    orgId: process.env.ORG_ID,
    pdfPageSize: process.env.PDF_PAGE_SIZE || 'A4',
    pdfMarginLeft: process.env.PDF_MARGIN_LEFT || '100',
    pdfMarginTop: process.env.PDF_MARGIN_TOP || '10',
    pdfQrcodePosLeft: parseInt(process.env.PDF_QRCODE_POS_LEFT || '600'),
    pdfQrcodePosTop: parseInt(process.env.PDF_QRCODE_POS_TOP || '320'),
    pdfRecipientNamePosTop: process.env.PDF_RECIPIENT_NAME_POS_TOP || '120',
    pdfRefIdPosTop: process.env.PDF_REF_ID_POS_TOP || '150',
    pdfSignerNamePosLeft: process.env.PDF_SIGNER_NAME_POS_LEFT || '100',
  },

  publicRuntimeConfig: AppConfig,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuchain-certificate-app',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    script: [
      { hid: 'pdfkit', src: '/js/blob-stream.js' },
      { hid: 'pdfkit', src: '/js/pdfkit.js' },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/main'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/axios',
    '~/plugins/ws',
    '~/plugins/nuchain',
    '~/plugins/session',
    '~/plugins/pdf',
    '~/plugins/tooltip',
    '~/plugins/util',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/svg',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/dotenv',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/universal-storage',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:8080',
    retry: { retries: 3 },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
    workbox: false,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  storage: {
    vuex: {
      namespace: 'storage',
    },
    cookie: {
      prefix: '',
      options: {
        path: '/',
      },
    },
    localStorage: {
      prefix: '',
    },
    ignoreExceptions: false,
  },
}
