<template>
  <div class="list-reference">
    <img v-if="reference.urlToImage" :src="reference.urlToImage" class="avatar square" :title="source && source.name" referrerpolicy="no-referrer" />
    <div v-else class="avatar" :title="source && source.name">
      <i class="material-icons" style="font-size:28px;">{{sourceIdToMaterialIconDictionary[reference.sourceId] || sourceIdToMaterialIconDictionaryDefault}}</i>
    </div>
    <div>
      <div class="title">{{reference.metadata.title || 'Untitled'}}</div>
      <div class="details">
        <span class="detail">By <span>{{reference.authorStr}}</span></span>
        <span v-if="reference.metadata.issued && reference.metadata.issued.year" class="detail">Year: <span>{{reference.metadata.issued.year}}</span></span>
        <span v-if="reference.metadata.containerTitle" class="detail">Container: <span>{{reference.metadata.containerTitle}}</span></span>
        <span v-if="reference.metadata.publisher" class="detail">Publisher: <span>{{reference.metadata.publisher}}</span></span>
        <span v-if="reference.metadata.publisherPlace" class="detail">Publisher Place: <span>{{reference.metadata.publisherPlace}}</span></span>
        <span v-if="reference.metadata.edition" class="detail">Edition: <span>{{reference.metadata.edition}}</span></span>
        <span v-if="reference.metadata.volume" class="detail">Volume: <span>{{reference.metadata.volume}}</span></span>
        <span v-if="reference.metadata.issue" class="detail">Issue: <span>{{reference.metadata.issue}}</span></span>
        <span v-if="reference.metadata.page" class="detail">Page: <span>{{reference.metadata.page}}</span></span>
        <span v-if="reference.metadata.doi" class="detail">DOI: <span>{{reference.metadata.doi}}</span></span>
        <span v-if="reference.metadata.isbn" class="detail">ISBN: <span>{{reference.metadata.isbn}}</span></span>
        <span v-if="reference.metadata.url" class="detail">URL: <span style="word-break:break-all;">{{reference.metadata.url}}</span></span>
      </div>
    </div>
    <i class="material-icons chevron">chevron_right</i>
  </div>
</template>

<script>
import {sourceIdToMaterialIconDictionary, sourceIdToMaterialIconDictionaryDefault} from '@/utils/sourceIdToMaterialIconDictionary.js';

import Config from '@/config.js';

export default {
  name: 'ListReference',
  props: ['reference'],
  data () {
    return {
      sourceIdToMaterialIconDictionary: sourceIdToMaterialIconDictionary,
      sourceIdToMaterialIconDictionaryDefault: sourceIdToMaterialIconDictionaryDefault
    }
  },
  computed: {
    source () {
      return Config.sources.find((s) => {
        return s.id === this.reference.sourceId;
      });
    }
  }
}
</script>

<style lang="scss">
  .list-reference { display: flex; padding:16px 14px; text-align:left; width:100%;
    .avatar { align-items:center; background:#bdbdbd; border-radius:50%; color:#fff; display:flex; flex-shrink: 0; height:60px; justify-content:center; margin-right:20px; margin-top:4px; width:60px;
      &.square { background:#fff; border-radius:5px; box-shadow:0 1px 2px rgba(0,0,0,0.2); object-fit:cover; }
    }
    .title { font-size:18px; font-weight:500; margin-bottom:4px; }
    .details { color:#959eba; font-size:15px; line-height:1.6em;
      .detail { margin-right:6px; padding-right:8px;
        span { color:#2c3e50; }
        &:after { background:#959eba; content:''; display:inline-block; height:10px; left:8px; opacity:0.6; position:relative; width:1px;}
        &:last-child:after { display:none; }
      }
    }
    .chevron { display:none; } // this only appears if the reference is in a button
  }

  button {
    .list-reference {
      .chevron { align-items:center; color:#959eba; display:flex; }
      &:hover { background:#f4f6f8; }
    }
  }
</style>