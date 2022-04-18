<template>
  <div>
    <label for="data-sources">{{ $t('Data Source') }}</label>
    <b-form-select id="data-sources" v-model="dataSource" :options="dataSourceTypes" class="mb-3"
                   data-cy="inspector-data-sources"/>

    <div v-if="dataSource === dataSourceValues.recordForm">
      <label class="typo__label">{{ label }}</label>
      <multiselect
          v-bind="$attrs"
          v-on="$listeners"
          :placeholder="$t('Select...')"
          :show-labels="false"
          :options="page_options.map(option => option.value)"
          :custom-label="getLabelFromValue"
      >
        <template slot="noResult">
          {{ $t('No elements found. Consider changing the search query.') }}
        </template>
        <template slot="noOptions">
          {{ $t('No Data Available') }}
        </template>
      </multiselect>
      <small v-if="helper" class="form-text text-muted">{{ helper }}</small>
    </div>
    <div v-if="dataSource === dataSourceValues.dataObject">
      <label for="value">{{ $t('url') }}</label>
      <b-form-input id="data_url" v-model="dataUrl" placeholder="Url"/>
      <small class="form-text text-muted mb-3">{{ $t('Enter the url of your json file.') }}</small>
    </div>
    <div v-if="dataSource === dataSourceValues.dataObject">
      <label>{{ $t('Dependent Variable') }}</label>
      <b-form-input id="data_depend" v-model="dataDependentVariable"/>
      <small class="form-text text-muted mb-3">{{ $t('Enter the name of the variable that needs to be sent.') }}</small>
    </div>
    <div v-if="dataSource === dataSourceValues.dataVariable">
      <label>{{ $t('Variable Name') }}</label>
      <b-form-input id="data_var" v-model="dataVariableName"/>
      <small class="form-text text-muted mb-3"></small>
    </div>
    <div v-if="dataSource === dataSourceValues.dataObject">
      <label for="element-name">{{ $t('Options Variable') }}</label>
      <mustache-helper/>
      <b-form-input id="element-name" v-model="dataName" placeholder="Request Variable Name"
                    data-cy="inspector-options-variable"/>
      <small class="form-text text-muted mb-3">{{ $t('Get options from this variable. Must be an array.') }}</small>
    </div>
    <div v-if="dataSource === dataSourceValues.dataObject || dataSource === dataSourceValues.dataVariable">
      <label for="value">{{ $t('Option Label Shown') }}</label>
      <b-form-input id="value" v-model="value" placeholder="Request Variable Property"
                    data-cy="inspector-options-label"/>
      <small class="form-text text-muted mb-3">{{
          $t('Enter the property name from the Request data variable that displays to the user on the screen.')
        }}</small>
    </div>
  </div>
</template>

<script>
import {dataSources, dataSourceValues} from './record_list_data-source-types';
import MustacheHelper from './mustache-helper';

export default {
  inheritAttrs: false,
  props: ['label', 'helper', 'formConfig', 'currentPage', 'inspection'],

  components: {
    MustacheHelper,
  },
  watch:{
    dataObjectOptions(dataObjectOptions) {
      this.$emit('change', dataObjectOptions);
    }
  },
  data() {
    if (typeof this.inspection.config.options === 'undefined') {
      this.inspection.config.options = {}
    }
    return {
      dataSourceValues,
      dataSources,
      dataSource: this.inspection.config.options.dataSource,
      dataName:this.inspection.config.options.dataName ,
      dataUrl:this.inspection.config.options.dataUrl,
      dataVariableName:this.inspection.config.options.dataVariableName,
      dataDependentVariable:this.inspection.config.options.dataDependentVariable,
      value:this.inspection.config.options.value
    }
  },
  methods: {

    getLabelFromValue(value) {
      const selectedOption = this.page_options.find(option => option.value == value);
      return selectedOption ? selectedOption.content : null;
    },
  },
  computed: {
    dataSourceTypes() {
      return this.dataSources.map((item) => {
        return {
          value: item.value,
          text: this.$t(item.text),
        };
      });
    },
    page_options() {
      return Object.keys(this.formConfig)
          .filter(page => page != this.currentPage)
          .map(page => ({value: page, content: this.formConfig[page].name}));
    },
    dataObjectOptions() {
      if (typeof this.inspection.config.options === 'undefined') {
        this.inspection.config.options = {}
      }
      this.inspection.config.options.dataSource=this.dataSource;
      this.inspection.config.options.dataName=this.dataName;
      this.inspection.config.options.dataUrl=this.dataUrl;
      this.inspection.config.options.dataVariableName=this.dataVariableName;
      this.inspection.config.options.dataDependentVariable=this.dataDependentVariable;
      this.inspection.config.options.value=this.value;
      return {
        dataSource: this.dataSource,
        dataName: this.dataName ,
        dataUrl: this.dataUrl,
        dataVariableName: this.dataVariableName,
        dataDependentVariable: this.dataDependentVariable,
        value: this.inspection.value
      };
    },
  },

};
</script>
