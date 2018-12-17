<template>
  <div class="whats-new-widget">
    <button @click="openPopover" ref="toggleBtn" class="btn">
      <slot></slot>
    </button>
    <div v-if="countOfNewArticles > 0" class="whats-new-widget__new-article-notification">
      {{ countOfNewArticles }}
    </div>
    <mu-popover :trigger="popoverTrigger" :open="popoverIsOpen" @close="handleClose" :anchorOrigin="{vertical:'top', horizontal:'left'}" :targetOrigin="{vertical:'top', horizontal:'left'}" :overlay="true" overlayOpacity="0.4">
      <div class="" style="background:#f5f7f9; max-height:600px; overflow:auto; position:relative; width:500px;">
        <header class="whats-new-widget__header">
          <div>What's new on MyBib</div>
          <button @click="handleClose" class="whats-new-widget__close-btn"><i class="material-icons">close</i></button>
        </header>
        <div v-if="articles.length == 0" style="padding:20px; text-align:center;">
          There have been no updates recently. Check back soon!
        </div>
        <a v-for="article in articles" :key="article.id" :href="article.link" target="_blank" class="whats-new-widget__article">
          <div class="whats-new-widget__article-metadata">
            <div class="whats-new-widget__article-tag">{{ tagsDictionary[article.tags[0]] }}</div>
            <div style="color:#747f8b;">{{ article.dateStr }}</div>
          </div>
          <div class="whats-new-widget__article-title">{{ article.title.rendered }}</div>
          <div v-html="article.excerpt.rendered" class="whats-new-widget__article-excerpt"></div>
        </a>
      </div>
    </mu-popover>
  </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';

import Config from '@/config.js';

const MONTH_NAMES = [
  'January', 'February', 'March',
  'April', 'May', 'June', 'July',
  'August', 'September', 'October',
  'November', 'December'
];
const COOKIE_NAME = Config.cookiePrefixString + '-' + 'whatsNew';

export default {
  name: 'WhatsNewWidget',
  data () {
    return {
      popoverTrigger: null,
      popoverIsOpen: false,
      articles: [],
      countOfNewArticles: 0,
      tagsDictionary: {
        4: 'New feature'
      }
    }
  },
  methods: {
    openPopover () {
      this.popoverIsOpen = true;
      // and update the cookie
      Cookies.set(COOKIE_NAME, JSON.stringify({ lastCheckedAt: Date.now() }), 730);
      this.countOfNewArticles = 0;
    },
    handleClose () {
      this.popoverIsOpen = false;
    }
  },
  async mounted () {
    this.$nextTick(() => {
      this.popoverTrigger = this.$refs.toggleBtn;
      // and load the stories
    })
    // load articles
    try {
      const response = await axios.get('https://www.mybib.com/wp-json/wp/v2/posts');
      // take top 5
      this.articles = response.data.slice(0, 5).map((article) => {
        article.date = new Date(article.date);
        article.dateStr = `${MONTH_NAMES[article.date.getMonth()]} ${article.date.getDate()}, ${article.date.getFullYear()}`;
        return article;
      });
    } catch (error) {
      // nothing
    }

    // now check if there's new ones
    // this is the default (5 days)
    let articleIsNewUntil = new Date();
    articleIsNewUntil.setDate(articleIsNewUntil.getDate() - 5);

    const whatsNewSettingsJson = Cookies.get(COOKIE_NAME);
    if (whatsNewSettingsJson) {
      const whatsNewSettings = JSON.parse(whatsNewSettingsJson);
      if (whatsNewSettings.lastCheckedAt > articleIsNewUntil) {
        // the last checked date is greater than the default, so use that
        articleIsNewUntil = whatsNewSettings.lastCheckedAt;
      }
    }

    // now calculate how many articles are newer than this date
    this.countOfNewArticles = this.articles.filter((a) => {
      return a.date > articleIsNewUntil;
    }).length;
  }
}
</script>

<style lang="scss">
  @import '../variables.scss';

  .whats-new-widget { position:relative; }
  .whats-new-widget__new-article-notification { align-items:center; background:$primary-color; border-radius:100px; color:#fff; display:flex; font-size:10px; height:13px; position:absolute; justify-content:center; top:0; right:0; width:13px;
    &:after { animation: pulsing 1500ms infinite;content: ""; background-color:$primary-color; border-radius:50%; height:13px; opacity:1; position:absolute; transform:scale(1, 1); width:13px; z-index:-1; }
  }

  .whats-new-widget__header { align-items:center; background:#fff; box-shadow:0 0 3px rgba(0, 0, 0, 0.2); font-family:'Google Sans'; display:flex; font-size:22px; left:0; height:55px; justify-content:space-between; position:sticky; right:0; top:0; padding:20px; }
  .whats-new-widget__close-btn { align-items:center; display:flex; position:relative; right:-10px; }

  .whats-new-widget__article { background:#fff; border-radius:2px; box-shadow:0 0 3px rgba(0, 0, 0, 0.2); margin:14px 8px 16px; display:block; padding:16px 10px; }
  .whats-new-widget__article-metadata { align-items:center; display:flex; margin-bottom:10px; }
  .whats-new-widget__article-tag { border-radius:20px; background:$secondary-color; color:#fff; font-size:10px; margin-right:8px; padding:2px 8px; text-transform:uppercase; }
  .whats-new-widget__article-title { font-family:'Google Sans'; font-size:22px; margin-bottom:12px }
  .whats-new-widget__article-excerpt {
    img { box-shadow:0 0 4px rgba(0,0,0,.1); max-width:100%; margin:10px 0; }
  }

  @keyframes pulsing {
    0% {
      transform: scale(1, 1);
      opacity: 1;
    }
    100% {
      transform: scale(1.7, 1.7);
      opacity: 0;
    }
  }
</style>