<template>
  <div class="mt-2">
    <label class="block text-sm text-gray-600" :for="name">{{name}}:</label>
    <input
      class="w-full px-5 py-2 text-gray-700 bg-gray-200 rounded"
      :id="submitKey"
      :name="name"
      type="text"
      required=""
      :placeholder="placeholder"
      :aria-label="name"
      v-model="value"
      @keyup="onChange"
    />
    <small v-if="isErrorInternal" class="text-red-600">{{ error }}</small>
  </div>
</template>

<script>
export default {
    props: {
        "name": {type: String, required: true},
        "submitKey": {type: String, required: true},
        "error": {type: String},
        "isError": {type: Boolean, default: false},
        "placeholder": {type: String}
    },
    data(){
        return {
            value: "",
            isErrorInternal: false,
        }
    },
    watch: {
        isError(b){
            this.isErrorInternal = b;
        }
    },
    methods: {
        onChange(){
            console.log("🚀 ~ file: InputField.vue ~ line 40 ~ onChange ~ this.value", this.value)
            this.$emit("input", this.value);
        }
    }
}
</script>