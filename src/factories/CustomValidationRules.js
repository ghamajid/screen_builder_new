const Validator = require('validatorjs');
import moment from 'moment-timezone';

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
  const inputDate = moment(date).toISOString();
  const afterDate = moment(params).toISOString();

  return inputDate > afterDate;
}, 'The :attribute must be after :after.');

Validator.register('after_or_equal', function(date, params) {
  // checks if incoming 'params' is a date or a key reference.
  const inputDate = moment(date).toISOString();
  const equalOrAfterDate = moment(params).toISOString();
    
  return inputDate >= equalOrAfterDate;
}, 'The :attribute must be equal or after :after_or_equal.');

Validator.register('before', function(date, params) {
  // checks if incoming 'params' is a date or a key reference.
  const inputDate = moment(date).toISOString();
  const beforeDate = moment(params).toISOString();
    
  return inputDate < beforeDate;
}, 'The :attribute must be before :before.');

Validator.register('before_or_equal', function(date, params) {
  // checks if incoming 'params' is a date or a key reference.
  const inputDate = moment(date).toISOString();
  const beforeDate = moment(params).toISOString();
    
  return inputDate <= beforeDate;
}, 'The :attribute must be equal or before :before_or_equal.');

Validator.register('custom_date', function(date) {
  let format = 'MM/DD/YYYY';
  if (typeof window.ProcessMaker !== 'undefined' && window.ProcessMaker.user && window.ProcessMaker.user.datetime_format) {
    format = window.ProcessMaker.user.datetime_format.replace(/[\sHh:msaAzZ]/g, '');
  }

  let checkDate = moment(date, [format, moment.ISO_8601], true);
  return checkDate.isValid();
}, 'The :attribute must be a valid date.');

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
        return true;
    }
}, 'Invalid shenase meli');