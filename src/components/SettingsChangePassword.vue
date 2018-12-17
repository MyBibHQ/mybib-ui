<template>
  <div class="paper">
    <router-link :to="{name: 'Settings'}" class="main-back">
      <i class="material-icons">arrow_back</i>
    </router-link>
    <router-link :to="{name: 'Root'}" class="main-close">
      <i class="material-icons">close</i>
    </router-link>

    <h1>Change password</h1>

    <form @submit.prevent="save">
      <div class="center-column narrow">
        
        <div class="fields">
          <div class="field string">
            <label>New password</label>
            <div class="input">
              <input type="password" placeholder="New password" v-model="password" minlength="6" required />
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <mu-raised-button type="submit" label="Update" icon="check" :disabled="isSaving" secondary/>
      </div>
    </form>
  </div>
</template>

<script>
import SnackBar from '@/services/snackBar.js';

export default {
  name: 'SettingsChangePassword',
  data () {
    return {
      password: '',
      showPassword: false,
      isSaving: false
    }
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  methods: {
    async save () {
      this.isSaving = true;
      const wasSuccessful = await this.user.changePassword(this.password);
      this.isSaving = false;
      if (wasSuccessful) {
        SnackBar.addSnack({
          message: '👍 Password updated.'
        })
        this.$router.push({name: 'Settings'});
      } else {
        SnackBar.addSnack({
          message: '⛔ Password couldn\'t be updated. Please try again.'
        })
      }
    }
  },
  mounted () {
    if (!this.user.hasRegistered) {
      this.$router.push({name: 'Settings'});
    }
  }
}
</script>

<style lang="scss" scoped>
  .fields {
    .field { display:flex; margin-bottom:20px;
      label { align-items:center; display:flex; font-size:14px; font-weight:500; justify-content:flex-end; padding-right:18px; text-align:right; text-transform:uppercase; width:150px; }
      .input { display:flex; position:relative; width:310px; }
      input[type=text], input[type=email] { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; max-height:35px; padding:12px 12px; }

      &.string {
        input { width:100%; }
      }
      &.date {
        input { width:33.33%; }
      }
    }
  }

  .actions { align-items:center; border-top:1px dotted #e9eaed; display:flex; justify-content:center; padding:20px; }
</style>