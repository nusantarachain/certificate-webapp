// Konfigurasi utama aplikasi sertifikat
export default {
  title: 'Nuchain App',
  cert: {
    additionalProperties: [
      {
        name: 'NIM',
        key: 'nim',
        isError: false,
        error: 'Please enter NIM',
        placeholder: 'eg: 2015157033',
        value: '',
      },
      {
        name: 'Score',
        key: 'score',
        isError: false,
        error: 'Please enter Score',
        placeholder: 'eg: 90',
        value: '',
      },
    ],
  },
}
