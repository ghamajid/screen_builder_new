<template>
  <div class="form-group">
    <label>{{ label }}</label>
    <input
      type="text"
      :class="(error || (validator && validator.errorCount)? 'form-control form-control-lg is-invalid': 'form-control form-control-lg')"
      v-model="value"
      :id="num_element_id"
      placeholder=""
    >
    <date-picker
      @change="$emit('input', (dataFormat == 'datetime')?$event.format('jYYYY/jMM/jDD HH:mm'):$event.format('jYYYY/jMM/jDD'))"
      :placeholder="placeholder ? placeholder : ''"
      :type="(dataFormat == 'datetime')?'datetime':'date'"
      :color="thcolor?thcolor.split('-')[0]:'#007bff'"
      :disabled="readonly"
      :max="maxDateChange"
      :min="minDateChange"
      :element="num_element_id"
    />
    <display-errors v-if="error || (validator && validator.errorCount)" :name="name" :error="error" :validator="validator" class="invalid-feedback d-block"/>
    <small v-if="helper" class="form-text text-muted" v-html="helper"/>
  </div>
</template>

<script>
import VuePersianDatetimePicker from 'vue-persian-datetime-picker';
import { createUniqIdsMixin } from 'vue-uniq-ids';
import ValidationMixin from './mixins/validation';
import DataFormatMixin from './mixins/DataFormat';
import DisplayErrors from './common/DisplayErrors';

const uniqIdsMixin = createUniqIdsMixin();

export default {
  inheritAttrs: false,
  components: {
    DisplayErrors,
    datePicker: VuePersianDatetimePicker,
  },
  mixins: [uniqIdsMixin, ValidationMixin, DataFormatMixin],
  props: [
    'value',
    'label',
    'error',
    'helper',
    'name',
    'controlClass',
    'placeholder',
    'dataFormat',
    'thcolor',
    'readonly',
    'minDate',
    'maxDate',
  ],
  watch: {
    minDate: {
      handler() {
        this.minDateChange = (this.minDate) ? this.minDate.replaceAll('-', '/') : '';
      },
      deep: true,
      immediate: true,

    },
    maxDate: {
      handler() {
        this.maxDateChange = (this.maxDate) ? this.maxDate.replaceAll('-', '/') : '';
      },
      deep: true,
      immediate: true,

    },
    value: {
      handler() {
        //console.log(this.validator, 'value')
        //console.log((this.dataFormat == 'datetime'), 'minDate')
      },
      deep: true,
      immediate: true,

    },
  },
  computed:{
    classList() {
      return {
        'is-invalid': (this.validator && this.validator.errorCount) || this.error,
        [this.controlClass]: !!this.controlClass,
      };
    },
  },
  data() {
    return {
      date: '',
      minDateChange: '',
      maxDateChange: '',
      num_element_id: this.name + new Date().getUTCMilliseconds()
    };
  },
};
</script>

