<template>
  <div id="app">
    <Snackbar />
    
    <HeaderBar/>

    <main>
      <Spinner v-if="user.isLoading"></Spinner>
      <div v-if="!user.isLoading && user.wasError" style="align-items:center; bottom:0; display:flex; flex-direction:column; justify-content:center; left:0; position:absolute; right:0; top:0;">
        <div style="font-size:140px;">☹️</div>
        <div style="font-size:40px; font-weight:500; text-align:center;">Oh snap! Something went wrong, please reload the page.</div>
      </div>
      <template v-if="!user.isLoading && user.isReady">
        <Projects/>
        <div id="page">
          <transition :name="transitionName">
            <router-view :key="$route.fullPath"></router-view>
          </transition>
        </div>
      </template>
    </main>

    <div id="footer" :style="!user.isLoading && user.isReady ? 'width:304px;': ''">
      <ul>
        <li>
          <button @click="showSupportDialog = true"><i class="far fa-envelope-open"></i>Contact support</button>
          <SupportDialog :open="showSupportDialog" @close="showSupportDialog = false" />
        </li>
        <li>
          <button @click="extrasMenuIsOpen = true" ref="extrasMenuBtn"><i class="material-icons">menu</i></button>
          <mu-popover :anchorOrigin="{vertical:'top', horizontal:'middle'}" :targetOrigin="{vertical:'bottom', horizontal:'middle'}" :open="extrasMenuIsOpen" :trigger="extrasMenuTrigger" @close="extrasMenuIsOpen = false">
            <mu-menu desktop>
              <mu-menu-item href="/privacy" title="Privacy policy" leftIcon="lock"/>
              <mu-menu-item href="/terms" title="Terms" leftIcon="verified_user"/>
              <mu-menu-item href="?intro" title="Homepage" leftIcon="view_carousel"/>
            </mu-menu>
          </mu-popover>
        </li>
      </ul>
    </div>

    <PdfDropzone/>
  </div>
</template>

<script>
import Snackbar from '@/components/Snackbar';
import HeaderBar from '@/components/HeaderBar';
import Projects from '@/components/Projects';
import Spinner from '@/components/Spinner';
import SupportDialog from '@/components/SupportDialog';
import PdfDropzone from '@/components/PdfDropzone';

export default {
  name: 'app',
  components: {
    Snackbar,
    HeaderBar,
    Projects,
    Spinner,
    SupportDialog,
    PdfDropzone
  },
  data () {
    return {
      transitionName: 'fade-back',
      showSupportDialog: false,
      extrasMenuTrigger: null,
      extrasMenuIsOpen: false
    }
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  watch: {
    '$route' (to, from) {
      const toDepth = to.path.split('/').length;
      const fromDepth = from.path.split('/').length;
      this.transitionName = toDepth === fromDepth ? 'no-transition' : toDepth < fromDepth ? 'fade-back' : 'fade-forward';

      window.Intercom('update');
    }
  },
  mounted () {
    this.extrasMenuTrigger = this.$refs.extrasMenuBtn;
  }
}
</script>

<style lang="scss">
  @import '/variables.scss';

  html { overflow:hidden; }
  body { color:#2a3c4e; font-family: 'Roboto', sans-serif; font-size:15px; }
  a, article, body, code, dd, div, dl, dt, fieldset, footer, form, h1, h2, h3, h4, h5, h6, header, html, input[type=email], input[type=number], input[type=password], input[type=tel], input[type=text], input[type=url], legend, li, main, ol, p, pre, section, table, td, textarea, th, tr, ul { box-sizing: border-box; }
  ul { list-style-type: none; margin:0; padding:0; }
  button { background:none; border:none; color:inherit; cursor: pointer; font-family: 'Roboto', sans-serif; outline:none;
    > span { align-items:center; display:flex; }
  }
  input, textarea { border:none; font-family: 'Roboto', sans-serif; outline:none;
    &:focus { border-color:$secondary-color !important; }
  }
  a { color:inherit; text-decoration:none; }
  .btn { align-items:center; display:flex; padding:4px 12px;
    span > i:first-child { margin:0 6px 0 0; }
    &:hover { opacity:0.9; }
    &.btn-inline { display:inline-flex; margin-left:6px; margin-right:6px; }
    &[disabled] { filter:grayscale(100%); }
  }

  .btn-flat, .btn-outline, .btn-raised { border-radius:3px; font-size:13px; }
  .btn-outline { border:1px solid #b6c3d0; }
  .btn-raised { padding-top:5px; padding-bottom:5px; box-shadow:0 2px 1px rgba(0,0,0,0.1); }

  ::-webkit-scrollbar { width: 10px; }
  ::-webkit-scrollbar-thumb { border-radius: 10px; background-color: rgba(0,0,0,0.5); }
  ::placeholder { color: #747f8b; opacity: 1; /* Firefox */ }
  :-ms-input-placeholder { /* Internet Explorer 10-11 */ color: #747f8b; }
  ::-ms-input-placeholder { /* Microsoft Edge */ color: #747f8b; }

  .white { color:#ffffff; }
  .orange {color:$primary-color; }
  .blue { color:$secondary-color; }
  .red { color:#f44336; }
  .grey { color:#d6d6d6; }

  .bg-orange { background: $primary-color; }
  .bg-blue { background:$secondary-color; }
  .bg-red { background:#f44336; }
  .bg-grey { background:#d6d6d6; }

  .b-orange { border-color: $primary-color; }
  .b-blue { border-color:$secondary-color; }
  .b-red {border-color:#f44336; }

  .italic { font-style:italic; }

  main { bottom:0; left:0; position:fixed; right:0; top:62px; }

  #page { bottom:0; left:304px; position:absolute; top:0; right:0;
    > div { bottom:0; left:0; overflow-x:hidden; overflow-y:auto; position:absolute; right:0; top:0; }
    .paper { background:#ffffff; box-shadow:0 0 3px rgba(0,0,0,0.2);
      h1 { align-items:center; display:flex; font-weight:400; font-size:22px; justify-content:center; margin:20px 0 40px; }
      .actions { align-items:center; background:#fff; border-top:1px dotted #e9eaed; bottom:0; display:flex; left:0; justify-content:center; padding:20px; position:sticky; right:0; }
    }
    .main-back { left:20px; opacity: 0.6; position:absolute; top:20px;
      &:hover { opacity:1; }
    }
    .main-close { opacity: 0.6; position:absolute; right:20px; top:20px;
      &:hover { opacity:1; }
    }

    .center-column { margin:26px auto; width:638px;
      &.narrow { width:460px; }
    }
  }

  #footer { align-items:center; bottom:0; display:flex; justify-content:center; left:0; font-size:13px; padding:6px 0; position:absolute; right:0;
    ul { align-items: center; background:rgba(255,255,255,0.7); border-radius:100px; display:flex; padding:4px 12px;
      li { align-items:center; display:flex; padding:0 2px; margin:0 10px;
        button, a { align-items:center; color:rgba(0,0,0,0.6); display:flex; padding:0; }
        svg { margin-right:4px; }
      }
    }
  }

  .csl-left-margin { display:inline-block; min-width:1em; }
  .csl-right-inline { display:inline; }

  .mu-bottom-sheet.page { background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.6); height:90vh; left:50%; margin-left:-450px; overflow-y:auto; padding:80px; width:900px; }
  .mu-menu-destop { padding:8px 0; }
  .mu-menu-item-wrapper.active { color:$secondary-color; }
  .mu-raised-button, .mu-flat-button { font-weight:500; text-transform: none; }
  .mu-raised-button-primary { background-color: $primary-color; }
  .mu-raised-button-secondary { background-color: $secondary-color; }
  .mu-raised-button-label { font-size:14px; }
  .mu-flat-button.outline { border:1px solid #b6c3d0; }
  .mu-dialog { position:relative; }
  .mu-dialog-body { color: #2c3e50; }
  .mu-dialog-actions, .mu-snackbar {
    .mu-flat-button-label, .mu-raised-button-label { text-transform:uppercase; }
  }
  .mu-tabs { background:#ffffff; }
  .mu-tab-link { color:#2a3c4e; font-size:15px; }
  .mu-tab-active { color:#2a3c4e; }
  .mu-tab-link > div { align-items:center; display:flex;}
  .mu-tab-text.has-icon { margin:0 0 0 4px; }

  /* V-Tooltip */
  .tooltip { display: block !important; line-height: 22px; padding: 4px 8px; color:#fff; border-radius: 2px; background-color: #616161; opacity: 0.9; z-index: 10000;
    .tooltip-arrow { width:0; height:0; border-style: solid; position: absolute; margin: 5px; border-color:#616161; opacity:0.9; z-index: 1; }

    &[x-placement^="top"] { margin-bottom: 5px;
      .tooltip-arrow { border-width: 5px 5px 0 5px; border-left-color: transparent !important; border-right-color: transparent !important; border-bottom-color: transparent !important; bottom: -5px; left: calc(50% - 5px); margin-top: 0; margin-bottom: 0; }
    }
    &[x-placement^="bottom"] { margin-top: 5px;
      .tooltip-arrow { border-width: 0 5px 5px 5px; border-left-color: transparent !important; border-right-color: transparent !important; border-top-color: transparent !important; top: -5px; left: calc(50% - 5px); margin-top: 0; margin-bottom: 0; }
    }
    &[x-placement^="right"] { margin-left: 5px;
      .tooltip-arrow { border-width: 5px 5px 5px 0; border-left-color: transparent !important; border-top-color: transparent !important; border-bottom-color: transparent !important; left: -5px; top: calc(50% - 5px); margin-left: 0; margin-right: 0; }
    }
    &[x-placement^="left"] { margin-right: 5px;
      .tooltip-arrow { border-width: 5px 0 5px 5px; border-top-color: transparent !important; border-right-color: transparent !important; border-bottom-color: transparent !important; right: -5px; top: calc(50% - 5px); margin-left: 0; margin-right: 0; }
    }
    &[aria-hidden='true'] { visibility: hidden; opacity: 0; transition: opacity .15s, visibility .15s; }
    &[aria-hidden='false'] { visibility: visible; opacity: 1; transition: opacity .15s; }

    p { margin:8px 0; }
    ul { list-style-type: disc; margin-bottom:8px; padding-left:20px; }
  }

  /* Transitions */
  .fade-back-enter-active, .fade-back-leave-active { transition: all .5s }
  .fade-back-enter, .fade-back-leave-to {  opacity: 0 }
  .fade-back-enter { transform: translate3d(-50px,0,0) }
  .fade-back-leave-to { transform: translate3d(50px,0,0) }

  .fade-forward-enter-active, .fade-forward-leave-active { transition: all .5s }
  .fade-forward-enter, .fade-forward-leave-to {  opacity: 0 }
  .fade-forward-enter {  transform: translate3d(50px,0,0) }
  .fade-forward-leave-to {  transform: translate3d(-50px,0,0) }

  .fade-enter-active, .fade-leave-active { transition: all .5s }
  .fade-enter, .fade-leave-to {  opacity: 0 }

  .no-transition-enter-active, .no-transition-leave-active { transition: none; }
</style>
