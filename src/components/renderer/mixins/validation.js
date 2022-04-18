let Validator = require('validatorjs');
import moment from 'moment-timezone';

export default {
  props: [
    'validation',
    'validationData',
    'validationField',
    'validationMessages',
  ],
  data() {
    return {
      validator: null,
    };
  },
  mounted() {
    this.setValidatorLanguage();
    this.updateValidation();
  },
  watch: {
    // Triggered whenever the v-model is updated
    value() {
      this.updateValidation();
    },
    // Triggered whenever the validation rule is updated
    validation() {
      this.updateValidation();
    },
    label() {
      this.updateValidation();
    },
    validationData: {
      handler() {
        this.updateValidation();
      },
      deep: true,
    },
  },
  methods: {
    setValidatorLanguage() {
      let globalObject = typeof window === 'undefined' ? global : window;

      if (globalObject.validatorLanguageSet) {
        return;
      }

      // eslint-disable-next-line no-undef
      if (_.has(globalObject, 'ProcessMaker.user.lang')) {
        Validator.useLang('en');
      } else if (document.documentElement.lang) {
        Validator.useLang('en');
      }

      globalObject.validatorLanguageSet = true;
    },
    updateValidation() {
      if (this.validation) {
        let fieldName = this.validationField ? this.validationField : this.name;
        let data = this.validationData ? this.validationData : {[fieldName]: this.value};
        let validationRules = '';
               
        if (typeof this.validation !== 'string' && this.validation.length) {
          let rules = [];

          this.validation.forEach(configs => {
            if (!configs.value) {
              return;
            }
            rules.push(configs.value); 
          });
            
          validationRules = rules;
        } else {
          validationRules = this.validation;
        }

        let rules = {
          [fieldName]: validationRules,
        };
        this.registerCustomRules(data);
        this.validator = new Validator(data, rules, this.validationMessages ? this.validationMessages : null);
        this.validator.setAttributeNames({ [fieldName]: this.label });
        this.validator.errors.first(this.name);
        // Validation will not run until you call passes/fails on it
        this.validator.passes();
      } else {
        this.validator = null;
      }
    },
    registerCustomRules(data) {

      Validator.register('custom-same', function(val, req) {
        let val1;
        let val2 = val;
        if (!req.includes('.')) {
          val1 = this.validator._flattenObject(this.validator.input)[req];
        } else {
          val1 = req.split('.').reduce((obj,i)=>obj[i], this.validator.input);
        }
                
        if (val1 === val2) {
          return true;
        }
                
        return false;
      }, 'The :attribute and :custom-same fields must match.');

      Validator.register('after', function(date, params) {
        // checks if incoming 'params' is a date or a key reference.
        let checkDate = moment(params);
        if (!checkDate.isValid()) {
          params = data[params];
        }
                
        const inputDate = moment(date).toISOString();
        const afterDate = moment(params).toISOString();
            
        return inputDate > afterDate;
      }, 'The :attribute must be after :after.');
            
      Validator.register('after_or_equal', function(date, params) {
        // checks if incoming 'params' is a date or a key reference.
        let checkDate = moment(params);
        if (!checkDate.isValid()) {
          params = data[params];
        }

        const inputDate = moment(date).toISOString();
        const equalOrAfterDate = moment(params).toISOString();
                
        return inputDate >= equalOrAfterDate;
      }, 'The :attribute must be equal or after :after_or_equal.');
            
      Validator.register('before', function(date, params) {
        // checks if incoming 'params' is a date or a key reference.
        let checkDate = moment(params);
        if (!checkDate.isValid()) {
          params = data[params];
        }

        const inputDate = moment(date).toISOString();
        const beforeDate = moment(params).toISOString();
                
        return inputDate < beforeDate;
      }, 'The :attribute must be before :before.');
            
      Validator.register('before_or_equal', function(date, params) {
        // checks if incoming 'params' is a date or a key reference.
        let checkDate = moment(params);
        if (!checkDate.isValid()) {
          params = data[params];
        }
                
        const inputDate = moment(date).toISOString();
        const beforeDate = moment(params).toISOString();
                
        return inputDate <= beforeDate;
      }, 'The :attribute must be equal or before :before_or_equal.');

      Validator.register('custom_meli_code', function(code) {
          // checks if incoming 'params' is a date or a key reference.
          if(code){
              var L=code.length;
              if(L<8 || parseInt(code,10)==0) return false;
              code=('0000'+code).substr(L+4-10);
              if(parseInt(code.substr(3,6),10)==0) return false;
              var c=parseInt(code.substr(9,1),10);
              var s=0;
              for(var i=0;i<9;i++)
                  s+=parseInt(code.substr(i,1),10)*(10-i);
              s=s%11;
              if((s<2 && c==s) || (s>=2 && c==(11-s))){
                  return true
              }
              return false;
          }else{
              return true;
          }
      }, 'Invalid code meli');

      Validator.register('custom_shenase_meli_hoghoghi', function(code) {
          // checks if incoming 'params' is a date or a key reference.
          if(code){
              var L=code.length;

              if(L<11 || parseInt(code,10)==0) return false;

              if(parseInt(code.substr(3,6),10)==0) return false;
              var c=parseInt(code.substr(10,1),10);
              var d=parseInt(code.substr(9,1),10)+2;
              var z=new Array(29,27,23,19,17);
              var s=0;
              for(var i=0;i<10;i++)
                  s+=(d+parseInt(code.substr(i,1),10))*z[i%5];
              s=s%11;if(s==10) s=0;
              return (c==s);
          }else{
              return false;
          }
      }, 'Invalid shenase meli');

      // eslint-disable-next-line no-unused-vars
      Validator.register('required_if', function(val, req, attribute) {
        if (typeof req === 'string') {
          req = req.split(',');
        }
                
        let inputtedValue = this.validator._objectPath(this.validator.input, req[0]);
            
        switch (typeof inputtedValue) {
          case 'boolean':
          case 'number':
            if (inputtedValue.toString() == req[1]) {
              return this.validator.getRule('required').validate(val);
            }
            break;
          default:
            if (inputtedValue == req[1]) {
              return this.validator.getRule('required').validate(val);
            }
            break;
        }
        return true;
      }, 'The :attribute field is required.');

      // eslint-disable-next-line no-unused-vars
      Validator.register('required_unless', function(val, req, attribute) {
        if (typeof req === 'string') {
          req = req.split(',');
        }
                
        let inputtedValue = this.validator._objectPath(this.validator.input, req[0]);
            
        switch (typeof inputtedValue) {
          case 'boolean':
          case 'number':
            if (inputtedValue.toString() !== req[1]) {
              return this.validator.getRule('required').validate(val);
            }
            break;
          default:
            if (inputtedValue !== req[1]) {
              return this.validator.getRule('required').validate(val);
            }
            break;
        }
        return true;
      }, 'The :attribute field is required.');
    },
  },
};
