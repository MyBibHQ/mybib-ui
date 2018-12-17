<template>
  <div>
    <mu-bottom-sheet :open="open" @close="$emit('close')">
      <div class="options-sheet">
        <button @click="$emit('close')" class="main-close">
          <i class="material-icons">close</i>
        </button>

        <div class="sheet-title">Download Bibliography</div>
        <div class="options">
          <div>
            <button class="btn btn-outline" @click="toggleCopyAndPasteSheet">
              <img src="~../../static/images/clipboard.svg" style="width:40px;"/>
            </button>
            <div>Copy &amp; paste</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/docx'" class="btn btn-outline">
              <img src="~../../static/images/ms_word_logo.svg" style="width:36px;" />
            </a>
            <div>Word</div>
          </div>
          <div>
            <button @click="saveBibliographyToGoogleDrive" class="btn btn-outline" style="position:relative;">
              <img v-if="!bibliographyIsSavingToGoogleDrive" src="~../../static/images/google_drive_logo.svg" style="width:42px;" />
              <Spinner v-if="bibliographyIsSavingToGoogleDrive" />
            </button>
            <div>Google Drive</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/bibtex'" class="btn btn-outline">
              <img src="~../../static/images/bibtex_logo.svg" style="width:56px;" />
            </a>
            <div>BibTeX</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/ris'" class="btn btn-outline" style="color:#bc2426;">
              <i class="ai ai-mendeley"></i>
            </a>
            <div>Mendeley</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/ris'" class="btn btn-outline" style="color:#900;">
              <i class="ai ai-zotero"></i>
            </a>
            <div>Zotero</div>
          </div>
          <div>
            <button class="btn btn-outline" @click="toggleEmailDialog">
              <i class="material-icons">email</i>
            </button>
            <div>Email</div>
          </div>
          <div>
            <button class="btn btn-outline" @click="printBibliography">
              <i class="material-icons">print</i>
            </button>
            <div>Print</div>
          </div>
          <div>
            <a :href="'/download/' + selectedProject.id + '/backup'" class="btn btn-outline">
              <i class="material-icons">save</i>
            </a>
            <div>Save backup</div>
          </div>
        </div>
      </div>
    </mu-bottom-sheet>

    <mu-bottom-sheet :open="showCopyAndPasteSheet" @close="showCopyAndPasteSheet = false" sheetClass="page">
      <button @click="showCopyAndPasteSheet = false" class="main-close">
        <i class="material-icons">close</i>
      </button>
      <mu-flat-button @click="copyBibliographyToClipboard" :label="copyBibliographyToClipboardBtnLabel" icon="content_paste" class="outline" style="position:absolute; right:60px; top:16px; text-transform:uppercase;"/>
      <div ref="copyAndPastePage" class="copy-and-paste-page">
        <div :style="'font-size:' + selectedProject.titleSize + 'em; line-height:'+ selectedProject.lineSpacing +'em; margin-bottom:' + selectedProject.titleSpacing + 'em; text-align:' + selectedProject.titleAlign + ';'">{{selectedProject.titleText}}</div>
        <div>
          <p v-for="(reference, index) in selectedProject.references" :key="index" :style="'margin-top:0; margin-bottom:' + selectedProject.entrySpacing + 'em; line-height:' + (selectedProject.lineSpacing < 2 ? 1.5 : selectedProject.lineSpacing) + 'em;' + (selectedProject.hasHangingIndent ? 'margin-left:2.5em; text-indent: -2.5em;' : '')" v-html="reference.formattedStr"></p>
        </div>
      </div>
    </mu-bottom-sheet>

    <mu-dialog :open="showEmailDialog" @close="showEmailDialog = false" title="Email bibliography">
      <div class="fields">
        <div class="field string">
          <label>To (your email)</label>
          <div class="input">
            <input v-model="sendBibliographyToEmail" type="email" placeholder="you@email.com"/>
          </div>
        </div>
      </div>
      <mu-flat-button slot="actions" @click="showEmailDialog = false" label="Close"/>
      <mu-flat-button slot="actions" primary @click="emailBibliography" :disabled="bibliographyIsSending" :label="bibliographyIsSending ? 'Sending...' : 'Send'"/>
    </mu-dialog>
  </div>
</template>

<script>
import {BASE_API_URL} from '@/config.js';
import copyHtmlToClipboard from '@/utils/copyHtmlToClipboard.js';
import AccessToken from '@/services/accessToken.js';
import SnackBar from '@/services/snackBar.js';
import ExportApi from '@/services/exportApi.js';

import Spinner from '@/components/Spinner';

import axios from 'axios';

const GOOGLE_API_SCOPE = 'https://www.googleapis.com/auth/drive.file';
let gapiFailedToInit = false;

export default {
  name: 'DownloadOptionsBottomSheet',
  components: { Spinner },
  props: ['open', 'selectedProject'],
  data () {
    return {
      showCopyAndPasteSheet: false,
      copyBibliographyToClipboardBtnLabel: 'Click to copy to clipboard',
      bibliographyIsSavingToGoogleDrive: false,
      showEmailDialog: false,
      sendBibliographyToEmail: null,
      bibliographyIsSending: false
    }
  },
  methods: {
    toggleCopyAndPasteSheet () {
      this.showCopyAndPasteSheet = true;
      this.$emit('close');
    },
    toggleEmailDialog () {
      this.showEmailDialog = true;
      this.$emit('close');
    },
    copyBibliographyToClipboard () {
      copyHtmlToClipboard(this.$refs.copyAndPastePage.innerHTML);
      this.copyBibliographyToClipboardBtnLabel = 'Copied!'
      setTimeout(() => {
        this.copyBibliographyToClipboardBtnLabel = 'Click to copy to clipboard';
      }, 2000);
    },
    async saveBibliographyToGoogleDrive () {
      this.bibliographyIsSavingToGoogleDrive = true;

      if (gapiFailedToInit) {
        this.bibliographyIsSavingToGoogleDrive = false;
        SnackBar.addSnack({
          message: 'There was a problem trying to save your bibliography to Google Drive. It may be because your computer isn\'t allowing cookies. Please enable cookies and refresh the page.'
        });
        return;
      }

      const googleAuthInstance = window.gapi.auth2.getAuthInstance();
      if (!googleAuthInstance) {
        this.bibliographyIsSavingToGoogleDrive = false;
        SnackBar.addSnack({
          message: 'There was a problem trying to save your bibliography to Google Drive. It may be because your computer isn\'t allowing cookies. Please enable cookies and refresh the page.'
        });
        return;
      }

      const user = googleAuthInstance.currentUser.get();
      let isAuthorized = user.hasGrantedScopes(GOOGLE_API_SCOPE);
      if (isAuthorized) {
        const result = await ExportApi.saveBibliographyToGoogleDrive(this.selectedProject.id, user.Zi.access_token);
        if (result && result.status === 'ok') {
          // success
          this.bibliographyIsSavingToGoogleDrive = false;
          SnackBar.addSnack({
            message: '💾 Bibliography saved to Google Drive.'
          });
          this.$emit('close');
        } else {
          this.bibliographyIsSavingToGoogleDrive = false;
          SnackBar.addSnack({
            message: 'There was a problem trying to save your bibliography. Please refresh the page and try again.'
          });
        }
      } else {
        // not authorized, try signing in
        googleAuthInstance.signIn().then(async () => {
          // success
          isAuthorized = user.hasGrantedScopes(GOOGLE_API_SCOPE);
          if (isAuthorized) {
            const result = await ExportApi.saveBibliographyToGoogleDrive(this.selectedProject.id, user.Zi.access_token);
            if (result && result.status === 'ok') {
              // success
              this.bibliographyIsSavingToGoogleDrive = false;
              SnackBar.addSnack({
                message: '💾 Bibliography saved to Google Drive.'
              });
              this.$emit('close');
            } else {
              this.bibliographyIsSavingToGoogleDrive = false;
              SnackBar.addSnack({
                message: 'There was a problem trying to save your bibliography. Please refresh the page and try again.'
              });
            }
          } else {
            this.bibliographyIsSavingToGoogleDrive = false;
            SnackBar.addSnack({
              message: 'There was a problem trying to save your bibliography. Please refresh the page and try again.'
            });
          }
        }, () => {
          // error - window was closed or something
          this.bibliographyIsSavingToGoogleDrive = false;
          SnackBar.addSnack({
            message: 'Please accept the permissions in the popup window to continue.'
          });
        });
      }
    },
    printBibliography () {
      var printWindow = window.open('', 'PRINT', 'height=' + window.innerHeight + ',width=' + window.innerWidth);

      printWindow.document.write('<html><head><title></title>');
      printWindow.document.write('<style type="text/css" media="print">@page { margin:0; } body { margin: 2.54cm; }</style>')
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1 style="font-weight:normal; font-size:' + this.selectedProject.titleSize + 'em; line-height:' + this.selectedProject.lineSpacing + 'em; margin-bottom:' + this.selectedProject.titleSpacing + 'em; text-align:' + this.selectedProject.titleAlign + ';">' + this.selectedProject.titleText + '</h1>');
      const indentStyle = this.selectedProject.hasHangingIndent ? 'margin-left:2.5em; text-indent: -2.5em;' : '';
      const lineSpacingStyle = 'line-height:' + (this.selectedProject.lineSpacing < 2 ? 1.5 : this.selectedProject.lineSpacing) + 'em;';
      const entrySpacingStyle = 'margin-bottom:' + this.selectedProject.entrySpacing + 'em;';
      printWindow.document.write('<div>')
      for (const referenceIndex in this.selectedProject.references) {
        printWindow.document.write('<p style="margin-top:0;' + entrySpacingStyle + lineSpacingStyle + indentStyle + '">' + this.selectedProject.references[referenceIndex].formattedStr + '</p>');
      }
      printWindow.document.write('</div></body></html>');

      printWindow.document.close(); // necessary for IE >= 10
      printWindow.focus(); // necessary for IE >= 10*/

      printWindow.print();
      printWindow.close();
    },
    async emailBibliography () {
      this.bibliographyIsSending = true;
      try {
        await axios.post(BASE_API_URL + '/download/' + this.selectedProject.id + '/email-bibliography', { email: this.sendBibliographyToEmail }, { headers: { 'Access-Token': AccessToken.get() } });
        this.bibliographyIsSending = false;
        this.showEmailDialog = false;
        SnackBar.addSnack({
          message: '📧 Bibliography sent.'
        });
      } catch (e) {
        this.bibliographyIsSending = false;
        this.showEmailDialog = false;
        SnackBar.addSnack({
          message: '👎 There was an error trying to send your bibliography. Please try again.'
        });
      }
    }
  },
  created () {
    window.gapi.load('client:auth2', async () => {
      try {
        await window.gapi.client.init({
          'apiKey': process.env.GOOGLE_API_KEY,
          'clientId': process.env.GOOGLE_API_CLIENT,
          'scope': GOOGLE_API_SCOPE,
          'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });
      } catch (e) {
        gapiFailedToInit = true;
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .options-sheet { padding:20px;
    .sheet-title { font-size:22px; font-weight:400; text-align:center; margin-bottom:40px; }
    .options { align-items:center; display:flex; flex-wrap:wrap; margin:auto; width:440px;
      > div { align-items:center; display: flex; flex-direction:column; justify-content:center; margin:0 10px 20px; }
      .btn { align-items:center; display:flex; filter:grayscale(100%); height:90px; justify-content:center; margin-bottom: 10px; width:90px;
        i { font-size:40px; margin:0; }
        &:hover { filter:none;}
      }
    }
  }
  .copy-and-paste-page { color:#000000; font-family: 'Times New Roman'; font-size:16px; }

  .main-close { position:absolute; right:20px; top:20px; }

  .fields {
    .field { display:flex; margin-bottom:20px;
      label { align-items:center; display:flex; font-size:12px; font-weight:500; justify-content:flex-end; padding-right:18px; text-align:right; text-transform:uppercase; width:150px; }
      .input { display:flex; position:relative; width:310px; }
      input[type=email] { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; max-height:35px; padding:12px 12px; }

      &.string {
        input { width:100%; }
      }
    }
  }
</style>