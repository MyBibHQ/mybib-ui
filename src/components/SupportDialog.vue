<template>
  <mu-dialog :open="open" @close="close" title="Contact support" style="max-height:800px;">
    <div class="fields">
      <div class="field string">
        <label>To</label>
        <div class="input">
          <input type="text" value="MyBib Support <support@mybib.com>" disabled/>
        </div>
      </div>
      <div class="field string">
        <label>From (your email)</label>
        <div class="input">
          <input type="email" v-model="email" placeholder="Enter your email address" required />
        </div>
      </div>
      <div class="field string">
        <label>Subject</label>
        <div class="input">
          <input type="text" v-model="subject" />
        </div>
      </div>
      <div class="field textarea">
        <label>Message</label>
        <div class="input">
          <textarea v-model="message" placeholder="Your message"></textarea>
        </div>
      </div>
    </div>
    <mu-flat-button slot="actions" @click="close" label="Cancel"/>
    <mu-flat-button slot="actions" primary @click="send" :disabled="!email || !message || isSending" :label="isSending ? 'Sending...' : 'Send'" />
  </mu-dialog>
</template>

<script>
import {BASE_API_URL} from '@/config.js';
import SnackBar from '@/services/snackBar.js';

import axios from 'axios';

export default {
  name: 'SupportDialog',
  props: ['open'],
  data () {
    return {
      email: '',
      subject: '',
      message: '',
      isSending: false
    }
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  watch: {
    open (next, prev) {
      if (next && this.user && this.user.hasRegistered) {
        this.email = this.user.email;
      }
    }
  },
  methods: {
    async send () {
      this.isSending = true;
      try {
        await axios.post(BASE_API_URL + '/support', { userId: this.user && this.user.id, email: this.email, subject: this.subject, message: this.message, currentUrl: this.$route.fullPath });
        SnackBar.addSnack({
          message: '👍 Message sent! We\'ll get back to you soon.'
        });
      } catch (e) {
        SnackBar.addSnack({
          message: '👎 There was an error trying to send the message. Please try again, or contact us directly at support@mybib.com.'
        });
      }
      this.isSending = false;
      this.close();
    },
    close () {
      this.subject = '';
      this.message = '';
      this.$emit('close');
    }
  }
}
</script>

<style lang="scss" scoped>
  .fields {
    .field { display:flex; margin-bottom:20px;
      label { align-items:center; display:flex; font-size:12px; font-weight:500; justify-content:flex-end; padding-right:18px; text-align:right; text-transform:uppercase; width:150px; }
      .input { display:flex; position:relative; width:310px; }
      input[type=text], input[type=email], input[type=password], textarea { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; max-height:35px; padding:12px 12px; }
      textarea { min-height:250px; width: 100%; }

      &.names { display: block;
        .add-name-btn { margin-left:150px;
          i { margin-right:4px; }
        }
      }
      &.string {
        input { width:100%; }
      }
      &.date {
        input { width:33.33%; }
      }
      &.textarea {
        label { align-items:flex-start; margin-top:10px; }
        .input { flex-grow:1; }
      }
    }
  }
</style>