<template>
  <mu-popover :anchorOrigin="{vertical:'center', horizontal:'left'}" :targetOrigin="{vertical:'center', horizontal:'right'}" :autoPosition="false" :open="open" :trigger="trigger">
    <div style="min-height:200px; width:600px;">
      <Spinner v-if="isLoading" />
      <div v-if="!isLoading && references.length > 0">
        <div style="font-style:italic; padding:10px;"><strong>{{ styleName }}</strong> - Preview</div>
        <div style="padding:10px;">
          <div style="margin-bottom:10px;">
            <div style="font-size:13px; font-weight:700; text-transform:uppercase;">Website</div>
            <div v-html="references.find(r => r.sourceId === 'webpage').bibliographyString"></div>
          </div>
          <div style="margin-bottom:10px;">
            <div style="font-size:13px; font-weight:700; text-transform:uppercase;">Book</div>
            <div v-html="references.find(r => r.sourceId === 'book').bibliographyString"></div>
          </div>
          <div style="margin-bottom:10px;">
            <div style="font-size:13px; font-weight:700; text-transform:uppercase;">Journal article</div>
            <div v-html="references.find(r => r.sourceId === 'article_journal').bibliographyString"></div>
          </div>
          <div>
            <div style="font-size:13px; font-weight:700; text-transform:uppercase;">Video</div>
            <div v-html="references.find(r => r.sourceId === 'video').bibliographyString"></div>
          </div>
        </div>
      </div>
    </div>
  </mu-popover>
</template>

<script>
import Spinner from '@/components/Spinner';

import StylesApi from '@/services/stylesApi.js';

export default {
  name: 'StylePreview',
  components: {
    Spinner
  },
  props: ['styleId', 'open', 'trigger'],
  data () {
    return {
      isLoading: false,
      styleName: '',
      references: []
    }
  },
  watch: {
    async styleId (next) {
      await this.loadStylePreview(next);
    }
  },
  computed: {
  },
  methods: {
    async loadStylePreview (styleId) {
      this.isLoading = true;
      const result = await StylesApi.preview(styleId);
      this.references = result.references;
      this.styleName = result.styleName;
      this.isLoading = false;
    }
  }
}
</script>

<style lang="scss" scoped>
</style>