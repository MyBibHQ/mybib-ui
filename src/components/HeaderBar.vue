<template>
  <header>
    <div class="left-items">
      <div class="logo">
        <router-link :to="{name: 'Root'}">
          <img src="~../../static/images/logo.svg" />
          <span style="font-weight:500;">My</span>
          <span>Bib</span>
        </router-link>
      </div>
      <div class="apps">
        <div style="background:#2a3c4e; color:#fff; border-radius:100px; padding: 2px 14px; ">
          {{$t('References')}}
        </div>
        <div style="filter:grayscale(100%); opacity:0.5;">
          <span>Notecards</span>
          <sup>Coming soon</sup>
        </div>
      </div>
    </div>
    <ul class="right-items">
      <li>
        <WhatsNewWidget>
          What's new?
        </WhatsNewWidget>
      </li>
      <li>
        <button @click="toggleAddonsMenu" ref="addonsMenuBtn" class="btn">
          <span>
            <span>Add-ons</span>
            <i class="material-icons">arrow_drop_down</i>
          </span>
        </button>
        <mu-popover :anchorOrigin="{vertical:'bottom', horizontal:'right'}" :targetOrigin="{vertical:'top', horizontal:'right'}" :open="addonsMenuIsOpen" :trigger="addonsMenuTrigger" @close="handleAddonsMenuClose">
          <mu-menu desktop>
            <mu-menu-item @click="chromeExtensionDialogIsOpen = true" title="Chrome extension" leftIcon=":fab fa-chrome" />
            <!--<mu-menu-item @click="firefoxExtensionDialogIsOpen = true" title="Firefox Web Citer" leftIcon=":fab fa-firefox" />-->
            <!--<mu-menu-item title="Microsoft Edge Web Citer" leftIcon=":fab fa-edge" />-->
            <!--<mu-divider />
            <mu-menu-item title="Google Docs addon" leftIcon=":fab fa-google-drive" />
            <mu-menu-item title="Microsoft Word addon" leftIcon=":fas fa-file-word"/>-->
          </mu-menu>
        </mu-popover>
        <mu-dialog :open="chromeExtensionDialogIsOpen" title="Google Chrome extension" @close="chromeExtensionDialogIsOpen = false">
          <div style="text-align:center;">
            <img src="~../../static/images/chrome-extension.png" style="box-shadow:0 2px 2px rgba(0,0,0,0.2); margin:20px 0;"/>
          </div>
          <p>The MyBib Chrome extension automatically {{$t('referencesVerb')}} your current webpage in a single click. It's super fast, and works on PDFs and login-restricted pages too.</p>
          <p>You can copy the formatted {{$t('reference')}} directly into your work, or seamlessly save it to your project here on the website. 11/10 students say they couldn't work without it!</p>
          <mu-flat-button slot="actions" @click="chromeExtensionDialogIsOpen = false" label="Close"/>
          <mu-flat-button slot="actions" href="https://chrome.google.com/webstore/detail/mybib-free-citation-gener/phidhnmbkbkbkbknhldmpmnacgicphkf" target="_blank" primary @click="chromeExtensionDialogIsOpen = false" label="Get the extension"/>
        </mu-dialog>
        <mu-dialog :open="firefoxExtensionDialogIsOpen" title="Firefox Web Citer" @close="firefoxExtensionDialogIsOpen = false">
          <div style="text-align:center;">
            <img src="~../../static/images/chrome-extension.png" style="box-shadow:0 2px 2px rgba(0,0,0,0.2); margin:20px 0;"/>
          </div>
          <p>The MyBib Firefox extension automatically {{$t('referencesVerb')}} your current webpage in a single click. It's super fast, and works on PDFs and login-restricted pages too.</p>
          <p>You can copy the formatted {{$t('reference')}} directly into your work, or seamlessly save it to your project here on the website. 11/10 students say they couldn't work without it!</p>
          <mu-flat-button slot="actions" @click="firefoxExtensionDialogIsOpen = false" label="Close"/>
          <mu-flat-button slot="actions" href="https://addons.mozilla.org/en-US/firefox/addon/mybib-free-web-citer/" target="_blank" primary @click="firefoxExtensionDialogIsOpen = false" label="Get the extension"/>
        </mu-dialog>
      </li>
      <li v-if="user.hasRegistered">
        <button @click="toggleUserMenu" ref="userMenuBtn" class="btn">
          <span>
            <i class="material-icons">account_box</i>
            <span>{{ user.email || user.firstName }}</span>
            <i class="material-icons">arrow_drop_down</i>
          </span>
        </button>
        <mu-popover :anchorOrigin="{vertical:'bottom', horizontal:'right'}" :targetOrigin="{vertical:'top', horizontal:'right'}" :open="userMenuIsOpen" :trigger="userMenuTrigger" @close="handleUserMenuClose">
          <mu-menu desktop>
            <mu-menu-item :to="{name: 'Settings'}" @click="handleUserMenuClose" title="Settings" leftIcon="settings" />
            <mu-menu-item href="?mobile" title="Switch to mobile mode" leftIcon="smartphone"/>
            <mu-divider />
            <mu-menu-item @click="handleUserLogout" title="Log out" leftIcon="directions_run" />
          </mu-menu>
        </mu-popover>
        <form action="/logout" method="POST" ref="logoutForm" style="display:none"></form>
      </li>
      <li v-else>
        <a href="/login" class="btn btn-outline btn-inline">Login</a> or <a href="/register" class="btn btn-outline btn-inline" ref="createAccountBtn">Create a free account</a>
      </li>
      <li style="position:relative;">
        <button @click="toggleTooltips" v-tooltip.bottom="tooltipsHidden ? 'Click to show tips.' : 'Click to hide tips.'" :style="{color: tooltipsHidden ? 'inherit': '#2196f3'}" ref="toggleTooltipsBtn">
          <span>
            <i class="material-icons">help_outline</i>
          </span>
        </button>
      </li>
    </ul>

    <TooltipLg v-if="!user.hasRegistered && totalCurrentReferenceCount >= 3" tooltipId="createAccount" category="recommended" placement="bottom" :target="createAccountBtnTooltipTarget" secondary>
      <p style="font-weight:500">Great job so far!</p>
      <p>To make sure your work is saved you can create an account. It's totally free - we just need your email address or Google sign-on.</p>
    </TooltipLg>
  </header>
</template>

<script>
import bowser from 'bowser';
import _ from 'lodash';

import TooltipLg from '@/components/TooltipLg';
import WhatsNewWidget from '@/components/WhatsNewWidget';

import Tooltips from '@/services/tooltips.js';

export default {
  name: 'HeaderBar',
  components: { TooltipLg, WhatsNewWidget },
  data () {
    return {
      addonsMenuIsOpen: false,
      addonsMenuTrigger: null,
      chromeExtensionDialogIsOpen: false,
      firefoxExtensionDialogIsOpen: false,
      userMenuIsOpen: false,
      userMenuTrigger: null,
      tooltips: Tooltips,
      bowser: bowser,
      createAccountBtnTooltipTarget: null
    };
  },
  computed: {
    user () {
      return this.$store.getters.user
    },
    tooltipsHidden () {
      return this.tooltips.categoriesToHide.indexOf('intro') > -1
    },
    totalCurrentReferenceCount () {
      return _.flatten(this.user.projects.map(p => p.references)).length;
    }
  },
  methods: {
    toggleAddonsMenu () {
      this.addonsMenuIsOpen = !this.addonsMenuIsOpen;
    },
    handleAddonsMenuClose () {
      this.addonsMenuIsOpen = false;
    },
    toggleUserMenu () {
      this.userMenuIsOpen = !this.userMenuIsOpen;
    },
    handleUserMenuClose () {
      this.userMenuIsOpen = false;
    },
    handleUserLogout () {
      this.$refs.logoutForm.submit();
    },
    handleToggleTooltipBtnHover () {
      this.showToggleTooltipsBtnTooltip = true;
    },
    handleToggleTooltipBtnHoverExit () {
      this.showToggleTooltipsBtnTooltip = false;
    },
    toggleTooltips () {
      // if any intro tooltips are hidden, show them all
      if (this.tooltips.categoriesToHide.indexOf('intro') > -1) {
        this.tooltips.showCategory('intro');
      } else { // else hide them all
        this.tooltips.hideCategory('intro');
      }
    }
  },
  mounted () {
    this.addonsMenuTrigger = this.$refs.addonsMenuBtn;
    this.createAccountBtnTooltipTarget = this.$refs.createAccountBtn;
  },
  updated () {
    this.userMenuTrigger = this.$refs.userMenuBtn;
  }
}
</script>

<style lang="scss" scoped>
  header { align-items: center; background:#ffffff; box-shadow:0 1px 2px rgba(0,0,0,0.1); display:flex; height:62px; justify-content: space-between; left:0; position:fixed; right:0; top:0; z-index:1;
    .left-items { align-items: center; display:flex;
      .logo { font-family:'Google Sans', sans-serif; font-size:20px; margin-right:40px; padding:0 20px;
        a { align-items:center; display:flex;
          img { margin-right:6px; width:40px; }
        }
      }
      .apps { align-items:center; display:flex;
        > div { margin-right:10px; }
      }
    }
    .right-items { align-items: center; display:flex;
      > li { align-items:center; border-right:1px solid #dde0e4; display:flex; padding:0 14px;
        &:last-child { border-right:none;}
      }
    }
  }
</style>