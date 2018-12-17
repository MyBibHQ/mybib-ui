<template>
  <mu-snackbar v-if="snackBar.activeSnack && snackBar.activeSnack.message" :message="snackBar.activeSnack.message" :action="snackBar.activeSnack.action || ''" :actionColor="snackBar.activeSnack.actionColor || ''" @actionClick="doAction" />
</template>

<script>
import SnackBar from '@/services/snackBar.js';

export default {
  name: 'Snackbar',
  data () {
    return {
      snackBar: SnackBar
    }
  },
  computed: {
  },
  methods: {
    doAction () {
      this.snackBar.activeSnack.actionClick();
      this.snackBar.removeActiveSnack();
    }
  }
}
</script>

<style lang="scss" scoped>
  .mu-snackbar { left:50%; position:absolute; top:6px; transform: translateX(-50%); right:auto; /* right: auto is to override the muse default */ }

  .mu-snackbar-enter-active,.mu-snackbar-leave-active { transition: transform .2s ease-out, opacity .2s ease-out; backface-visibility: hidden; }
  .mu-snackbar-enter, .mu-snackbar-leave-active { transform: translate3d(-50%, -50%, 0); opacity: 0; }
</style>