<template>
    <div class="form-group">
        <label>{{ label }}</label>
        <div class="row" :style="cssProps">
            <input
                    type="text"
                    maxlength="2"
                    :disabled="disabled"
                    v-model="value1"
                    style="width: 50px;padding: 10px;font-weight: bold;"
                    placeholder=""
            >
            <select v-model="value2" :disabled="disabled" style="width: 50px;padding: 1px;font-weight: bold;">
                <option>ب</option>
                <option>ج</option>
                <option>د</option>
                <option>ژ</option>
                <option>س</option>
                <option>ص</option>
                <option>ط</option>
                <option>ق</option>
                <option>ل</option>
                <option>م</option>
                <option>ن</option>
                <option>و</option>
                <option>هـ</option>
                <option>ی</option>
            </select>
            <input
                    type="text"
                    maxlength="3"
                    :disabled="disabled"
                    v-model="value3"
                    style="width: 55px;padding: 10px;font-weight: bold;"
                    placeholder=""
            >
            <input
                    type="text"
                    maxlength="2"
                    :disabled="disabled"
                    v-model="value4"
                    style="width: 40px;padding: 7px;margin-top:12px;margin-left:1px;height: 35px;font-weight: bold;"
                    placeholder=""
            >
        </div>
        <display-errors v-if="error || (validator && validator.errorCount)"  :name="name" :error="error"
                        :validator="validator" class="invalid-feedback d-block"/>
        <small v-if="helper" class="form-text text-muted" v-html="helper"/>
    </div>
</template>

<script>
    import VuePersianDatetimePicker from 'vue-persian-datetime-picker';
    import {createUniqIdsMixin} from 'vue-uniq-ids';
    import ValidationMixin from './mixins/validation';
    import DataFormatMixin from './mixins/DataFormat';
    import DisplayErrors from './common/DisplayErrors';
    import image from './../../assets/pelak2.jpg';

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
            'disabled'
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
            value1: {
                handler() {
                    if(this.value1 && this.value2 && this.value3 && this.value4){
                        this.arrValue[0] = this.value1;
                        this.arrValue[1] = this.value2;
                        this.arrValue[2] = this.value3;
                        this.arrValue[3] = this.value4;
                        this.$emit('input', this.arrValue);
                    }else{
                        this.$emit('input', null);
                    }
                },
                deep: true,
                immediate: true,

            },
            value2: {
                handler() {
                    if(this.value1 && this.value2 && this.value3 && this.value4){
                        this.arrValue[0] = this.value1;
                        this.arrValue[1] = this.value2;
                        this.arrValue[2] = this.value3;
                        this.arrValue[3] = this.value4;
                        this.$emit('input', this.arrValue);
                    }else{
                        this.$emit('input', null);
                    }
                },
                deep: true,
                immediate: true,

            },
            value3: {
                handler() {
                    if(this.value1 && this.value2 && this.value3 && this.value4){
                        this.arrValue[0] = this.value1;
                        this.arrValue[1] = this.value2;
                        this.arrValue[2] = this.value3;
                        this.arrValue[3] = this.value4;
                        this.$emit('input', this.arrValue);
                    }else{
                        this.$emit('input', null);
                    }
                },
                deep: true,
                immediate: true,

            },
            value4: {
                handler() {
                    if(this.value1 && this.value2 && this.value3 && this.value4){
                        this.arrValue[0] = this.value1;
                        this.arrValue[1] = this.value2;
                        this.arrValue[2] = this.value3;
                        this.arrValue[3] = this.value4;
                        this.$emit('input', this.arrValue);
                    }else{
                        this.$emit('input', null);
                    }
                },
                deep: true,
                immediate: true,

            },
            disabled: {
                handler() {
                    //console.log(this.disabled,'disabled')
                },
                deep: true,
                immediate: true,

            },
            value: {
                handler() {
                    //console.log(this.value.split(","),'value1111111111111')
                    if(this.value){
                        this.arrValue = this.value.split(",");
                        if(this.arrValue.length == 4){
                            this.value1 = this.arrValue[0];
                            this.value2 = this.arrValue[1];
                            this.value3 = this.arrValue[2];
                            this.value4 = this.arrValue[3];
                        }
                    }
                },
                deep: true,
                immediate: true,

            }
        },
        computed: {
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
                num_element_id: this.name + new Date().getUTCMilliseconds(),
                cssProps: {
                    backgroundImage: `url('https://irngv.hamahang-co.ir/pelak2.jpg')`,
                    backgroundRepeat: `no-repeat`,
                    width: `225px`,
                    backgroundSize: `contain`,
                    paddingLeft:'22px',
                    textAlign:'center',
                    direction: 'ltr',
                    margin: '0px'
                },
                selected: '',
                arrValue: [],
                value1:'',
                value2:'',
                value3:'',
                value4:''
            };
        },
    };
</script>

