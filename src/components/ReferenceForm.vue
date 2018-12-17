<template>
  <div>
    <div>
      <h1 ref="sourcesMenuBtn">
        <button v-if="source" @click="toggleSourcesMenu()">
          <span>
            {{actionWord}} {{source.name}} <i class="material-icons">arrow_drop_down</i>
          </span>
        </button>
      </h1>
      <mu-popover :anchorOrigin="{vertical:'bottom', horizontal:'middle'}" :targetOrigin="{vertical:'top', horizontal:'middle'}" :open="sourcesMenuIsOpen" :trigger="sourcesMenuTrigger" @close="handleSourcesMenuClose()">
        <div class="sources-container" @click="handleSourcesMenuClose()">
          <router-link v-for="(source, index) in config.sources" :key="index" :to="{name: $route.name, params: {sourceId: source.id}, query: $route.query}" replace class="btn">{{source.name}}</router-link>
        </div>
      </mu-popover>
    </div>
    <div class="center-column narrow reference-form" ref="referenceForm">
      <div v-if="source && referenceMetadata" class="fields">
        <div v-for="(field, index) in source.fields" :key="index" >
          <transition name="fade">
            <div v-if="field.type === 'name'" class="field names">
              <transition-group name="fade-forward">
                <ReferenceFormName v-for="name in referenceMetadata[field.id]" :key="name" :label="field.label" :name="name" :isImportant="field.isImportant" :tooltip="field.tooltip" @onDelete="referenceMetadata[field.id].splice(referenceMetadata[field.id].indexOf(name), 1)"></ReferenceFormName>
              </transition-group>
              <button class="add-name-btn blue" @click="referenceMetadata[field.id].push({})">
                <span>
                  <i class="material-icons">add_circle_outline</i>Add another
                </span>  
              </button> 
            </div>
            <div v-if="field.type === 'string'" class="field string">
              <label>{{field.label}}</label>
              <div class="input">
                <input type="text" :placeholder="field.placeholder" :name="field.id" v-model="referenceMetadata[field.id]" :class="{'important': field.isImportant && !referenceMetadata[field.id]}" v-tooltip.left="{content: field.tooltip, classes: ['reference-form-field__tooltip'], offset:166, trigger:'focus', hideOnTargetClick:false }" />
              </div>
            </div>
            <div v-if="field.type === 'text'" class="field text">
              <label>{{field.label}}</label>
              <div class="input">
                <textarea :placeholder="field.placeholder" :name="field.id" v-model="referenceMetadata[field.id]" :class="{'important': field.isImportant && !referenceMetadata[field.id]}" v-tooltip.left="{content: field.tooltip, classes: ['reference-form-field__tooltip'], offset:166, trigger:'focus', hideOnTargetClick:false }"></textarea>
              </div>
            </div>
            <div v-if="field.type === 'richtext'" class="field text">
              <label>{{field.label}}</label>
              <div class="input">
                <RichTextarea v-once :content.sync="referenceMetadata[field.id]" v-tooltip.left="{content: field.tooltip, classes: ['reference-form-field__tooltip'], offset:166, trigger:'focus', hideOnTargetClick:false }"></RichTextarea>
              </div>
            </div>
            <div v-if="field.type === 'date'" class="field date">
              <label>{{field.label}}</label>
              <div class="input">
                <input type="number" placeholder="YYYY" v-model="referenceMetadata[field.id].year" :class="{'important': field.isImportant && !referenceMetadata[field.id].year}" v-tooltip.left="{content: field.tooltip, classes: ['reference-form-field__tooltip'], offset:166, trigger:'focus', hideOnTargetClick:false }"/>
                <input type="number" placeholder="MM" v-model="referenceMetadata[field.id].month" />
                <input type="number" placeholder="DD" v-model="referenceMetadata[field.id].day" />
                <button @click="setDateToToday(referenceMetadata[field.id])" class="reference-form__today-btn">today</button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <TooltipLg v-if="actionWord === 'New'" tooltipId="newReferenceForm" category="intro" placement="right start" :target="referenceFormTooltipTarget" primary>
      <p>👀 Make sure the details are correct and enter any that are missing. Fields with a <img src="./../../static/images/star.svg" style="margin:-2px 0px -4px 0px; width:20px;"> are especially important.</p>
      <p>If you can't find all of them don't worry - we can still create the {{$t('reference')}} accurately.</p>
      <p>When you've done as much as you can, click the Save button to continue.</p>
    </TooltipLg>
  </div>
</template>

<script>
import Config from '@/config.js';

import ReferenceFormName from '@/components/ReferenceFormName';
import TooltipLg from '@/components/TooltipLg';
import RichTextarea from '@/components/RichTextarea';

export default {
  name: 'ReferenceForm',
  props: ['actionWord', 'referenceMetadata'],
  components: {
    ReferenceFormName,
    TooltipLg,
    RichTextarea
  },
  data () {
    return {
      config: Config,
      sourcesMenuIsOpen: false,
      sourcesMenuTrigger: null,
      referenceFormTooltipTarget: null
    };
  },
  computed: {
    source () {
      return this.config.sources.find((s) => {
        return s.id === this.$route.params.sourceId;
      });
    }
  },
  methods: {
    toggleSourcesMenu () {
      this.sourcesMenuIsOpen = !this.sourcesMenuIsOpen
    },
    handleSourcesMenuClose () {
      this.sourcesMenuIsOpen = false;
    },
    setDateToToday (field) {
      const dt = new Date();
      field.day = dt.getDate();
      field.month = dt.getMonth() + 1;
      field.year = dt.getFullYear();
      this.$forceUpdate();
    }
  },
  mounted () {
    this.sourcesMenuTrigger = this.$refs.sourcesMenuBtn;
    this.referenceFormTooltipTarget = this.$refs.referenceForm;
  }
}
</script>

<style lang="scss">
  @import '../variables.scss';

  .reference-form {
    .fields {
      .field { display:flex; margin-bottom:20px;
        label { align-items:center; display:flex; font-size:14px; font-weight:500; justify-content:flex-end; padding-right:18px; text-align:right; text-transform:uppercase; width:150px; }
        .input { display:flex; position:relative; width:310px;
          .reference-form__today-btn { color:$secondary-color; font-size:13px; left:100%; margin-left:4px; position:absolute; text-transform:uppercase; top:7px; }
        }
        input[type=text], input[type=number] { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; max-height:35px; padding:12px 12px;
          &.important { background: url("./../../static/images/star.svg") no-repeat right 4px center; background-size:20px 20px; border-color:rgba(#FF5722, 0.5); }
        }
        textarea { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; min-height:100px; padding:12px 12px; width:100%; }

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
      }
    }
    .more-fields { color:#959eba; font-size:12px; text-align:right; text-transform:uppercase; }
  }
  .mu-popover {
    .sources-container { display:flex; flex-wrap:wrap; flex-direction:column; height:462px; margin:10px; width:638px; z-index:5;
      .btn { border-radius:3px; padding:10px; width:33%;
        &:hover { background: #f4f6f8; font-weight:500; }
      }
    }
  }
  .reference-form-field__tooltip { max-width:210px; }
</style>