<template>
  <div id="Login">
    <div
      class="max-w-lg max-w-xs bg-blue-800 shadow-2xl rounded-lg mx-auto text-center py-12 mt-4 rounded-xl"
    >
      <h2 class="text-gray-200 text-center font-extrabold -mt-3 text-3xl">
        Login
      </h2>
      <div class="login-form py-5 max-w-md mx-auto">
        <form method="" action="" v-on:submit.prevent="doLogin">
          <div class="mb-4">
            <input
              placeholder="Username"
              class="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              v-model="username"
            />
          </div>
          <div class="mb-6">
            <input
              placeholder="Password"
              class="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              v-model="password"
              v-on:keyup.enter="doLogin"
            />
          </div>
          <div class="items-center">
            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              v-on:click="doLogin"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
    }
  },
  methods: {
    doLogin() {
      this.$axios
        .post('/auth', {
          action: 'login',
          data: {
            nickname: this.username,
            password: this.password,
            nonce: 1,
          },
        })
        .then(({ data }) => {
          console.log(data)
          if (data.status == 'success') {
            this.$storage.setUniversal('access_token', data.access_token)
            // this.$ws.send({"action":"chat", "id": "123", "payload": {"LookupPrivateChat": {"account_id":4} }});
            // this.$router.app.refresh();
            // window.location.reload();
            this.$emit("logged-in");
          } else if (data.message == 'Unauthorized') {
            alert('Invalid user name or password.')
          }
        })
    },
  },
}
</script>


<style lang="sass" scoped>
#Login
    min-width: 500px
.login-form
    padding: 1.5em
</style>