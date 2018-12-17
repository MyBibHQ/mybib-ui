<template>
  <button class="btn btn-outline" style="position:relative;">
    <span>
      <slot v-if="!isUploading"></slot>
      <Spinner v-if="isUploading" />
      <form enctype="multipart/form-data" novalidate>
        <input ref="fileInput" @change="readFile" :disabled="isUploading" type="file" class="btn btn-outline" :accept="acceptFileType" style="bottom:0; cursor:pointer; left:0; opacity:0; right:0; top:0; position:absolute; pointer:" />
      </form>
    </span>
  </button>
</template>

<script>
import ReferenceImporter from '@/services/referenceImporter.js';

import Spinner from '@/components/Spinner';

export default {
  name: 'ImportButton',
  props: ['acceptFileType', 'importType'],
  components: {
    Spinner
  },
  data () {
    return {
      isUploading: false
    }
  },
  methods: {
    readFile (e) {
      if (!this.$refs.fileInput.value) {
        return;
      }

      this.isUploading = true;
      const files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = async () => {
        const importToken = await ReferenceImporter.import(this.importType, fileReader.result);
        this.isUploading = false;
        this.$refs.fileInput.value = null;
        this.$emit('onImportComplete', importToken)
      };
      fileReader.onerror = () => {
        this.isUploading = false;
        this.$refs.fileInput.value = null;
      };
      fileReader.readAsText(files[0]);
    }
  }
}
</script>

<style scoped>

</style>