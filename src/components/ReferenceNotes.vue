<template>
  <div class="paper">
    <a href="javascript:history.back(1)" class="main-back">
      <i class="material-icons">arrow_back</i>
    </a>
    <router-link :to="{name: 'Project', params:{projectId: $route.params.projectId}}" class="main-close">
      <i class="material-icons">close</i>
    </router-link>

    <h1>Notes &amp; Quotes</h1>

    <div class="center-column narrow reference-form">
      <transition-group name="fade-forward" ref="notesAndQuotes">
        <div v-for="note in notes" :key="note" class="note">
          <div class="top">
            <div class="page">
              
            </div>
            <button class="btn red" @click="removeNote(note)">
              <i class="material-icons">delete</i>
            </button>
          </div>
          <div class="fields">
            <div style="padding:20px 40px 0 50px;">
              <i class="material-icons orange">format_quote</i>
              <mu-text-field hintText="Insert quote here" inputClass="italic" :rows="2" fullWidth multiLine v-model="note.quote"></mu-text-field>
            </div>
            <div style="padding:0 40px 0 50px;">
              <i class="icon-pin orange"></i>
              <mu-text-field hintText="Insert note here" inputClass="italic" :rows="2" fullWidth multiLine v-model="note.note"></mu-text-field>
            </div>
          </div>
        </div>
      </transition-group>

      <TooltipLg tooltipId="notesAndQuotes" category="intro" placement="right" :target="tooltipTarget">
        <p>Keep track of the texts you've used by adding them here. You can add notes to refer to in the future, too.</p>
      </TooltipLg>

      <div style="display:flex; justify-content:flex-end; ">
        <button @click="addNote()" class="btn orange">
          <span>
            <i class="material-icons">add_circle_outline</i> Add another
          </span>
        </button>
      </div>
    </div>

    <div class="actions">
      <mu-raised-button @click="saveNotes()" :label="isSaving ? 'Saving...' : 'Save'" icon="check" :disabled="isSaving" secondary/>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import SnackBar from '@/services/snackBar.js';

import TooltipLg from '@/components/TooltipLg';

export default {
  name: 'ReferenceNotes',
  components: {
    TooltipLg
  },
  data () {
    return {
      notes: [],
      tooltipTarget: null,
      isSaving: false
    }
  },
  computed: {
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    },
    reference () {
      return this.selectedProject.references.find((r) => {
        return r.id === parseInt(this.$route.params.referenceId);
      })
    }
  },
  methods: {
    addNote () {
      this.notes.push({});
    },
    removeNote (note) {
      this.notes.splice(this.notes.indexOf(note), 1);
    },
    async saveNotes () {
      this.reference.notes = this.notes;
      this.isSaving = true;
      await this.selectedProject.updateReference(this.reference);
      this.isSaving = false;
      SnackBar.addSnack({message: '👍 Notes updated.'});
      this.$router.push({name: 'Project', params: {projectId: this.$route.params.projectId}})
    }
  },
  created () {
    this.notes = _.cloneDeep(this.reference.notes);
    if (this.notes.length === 0) {
      this.notes.push({});
    }
  },
  mounted () {
    this.tooltipTarget = this.$refs.notesAndQuotes;
  }
}
</script>

<style lang="scss" scoped>
  .note { border-bottom:1px solid #f2f4f6; padding-bottom:20px; margin-bottom:20px;
    .top { align-items:center; display:flex; justify-content: space-between; margin-bottom:20px;
      .page { display:flex; justify-content:flex-start; }
      label { align-items:center; display:flex; font-size:12px; font-weight:500; justify-content:flex-end; padding-right:18px; text-align:right; text-transform:uppercase; }
      .input { display:flex; }
      input[type=text] { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; max-height:35px; padding:12px 12px; }
      button { filter:grayscale(1);
        &:hover { filter:grayscale(0); }
      }
    }
    .fields { border:1px solid #d7dbe0;
      > div { position:relative;
        i { font-size:26px; left:16px; position:absolute; }
      }
    }
  }
  .actions { align-items:center; border-top:1px dotted #e9eaed; display:flex; justify-content:center; padding:20px; }
</style>