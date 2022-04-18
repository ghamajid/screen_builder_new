<template>
    <div class="form-group">
        <label>{{ label }}</label>
        <multi-select-view
                :disabled="readonly"
                v-if="options.renderAs === 'dropdown'"
                :option-value="optionsKey"
                :option-content="optionsValue"
                v-uni-id="name"
                v-model="valueProxy"
                :placeholder="placeholder ? placeholder : $t('Select...')"
                :show-labels="false"
                :options="selectListOptions"
                :class="classList"
                :emit-objects="options.valueTypeReturned === 'object'"
                :emit-array="options.allowMultiSelect"
                v-bind="$attrs"
                :fillSelectListOptions="fillSelectListOptions"

        />
        <div v-if="options.renderAs === 'checkbox' && options.allowMultiSelect">
            <checkbox-view
                    :disabled="readonly"
                    v-model="valueProxy"
                    :name="name"
                    :option-value="optionsKey"
                    :option-content="optionsValue"
                    :options="selectListOptions"
                    :emit-objects="options.valueTypeReturned === 'object'"
                    v-bind="$attrs"
            />
        </div>

        <div v-if="options.renderAs === 'checkbox' && !options.allowMultiSelect">
            <optionbox-view
                    :disabled="readonly"
                    v-model="valueProxy"
                    :name="name"
                    :option-value="optionsKey"
                    :option-content="optionsValue"
                    :options="selectListOptions"
                    :emit-objects="options.valueTypeReturned === 'object'"
                    v-bind="$attrs"
            />
        </div>

        <div v-if="(validator && validator.errorCount) || error" class="invalid-feedback d-block">
            <div v-for="(error, index) in validatorErrors" :key="index">{{ error }}</div>
            <div v-if="error">{{ error }}</div>
        </div>
        <small v-if="helper" class="form-text text-muted">{{ helper }}</small>
    </div>
</template>

<script>
    import ValidationMixin from './mixins/validation';
    import {createUniqIdsMixin} from 'vue-uniq-ids';
    import MultiSelectView from './FormSelectList/MultiSelectView';
    import CheckboxView from './FormSelectList/CheckboxView';
    import OptionboxView from './FormSelectList/OptionboxView';
    import FormMultiSelect from './FormMultiSelect';
    import Mustache from 'mustache';
    import {get} from 'lodash';
    const uniqIdsMixin = createUniqIdsMixin();
    // eslint-disable-next-line no-unused-vars
    function removeInvalidOptions(option) {
        return Object.keys(option).includes('value', 'content') &&
            option.content != null;
    }
    export default {
        inheritAttrs: false,
        components: {
            OptionboxView,
            MultiSelectView,
            CheckboxView,
            // eslint-disable-next-line vue/no-unused-components
            FormMultiSelect,
        },
        mixins: [uniqIdsMixin, ValidationMixin],
        props: [
            'transientData',
            'label',
            'error',
            'value',
            'options',
            'helper',
            'name',
            'controlClass',
            'validationData',
            'placeholder',
            'multiple',
            'readonly',
        ],
        data() {
            return {
                isOk:0,
                info: [],
                lastRequest: {},
                // apiClient: window.ProcessMaker.apiClient.create(),
                selectListOptions: [],
                // eslint-disable-next-line no-undef
                doDebounce: _.debounce(options => {
                    const selectedEndPoint = options.selectedEndPoint;
                    const selectedDataSource = options.selectedDataSource;
                    // const dataNam-e = options.dataName;
                    // If no data source has been specified, do not make the api call
                    if (selectedDataSource === null || typeof selectedDataSource === 'undefined' || selectedDataSource.toString().trim().length === 0) {
                        return;
                    }
                    // Do not run in sandalone mode
                    if (!this.$dataProvider) {
                        return;
                    }
                    let params = {
                        config: {
                            endpoint: selectedEndPoint,
                        },
                    };
                    if (typeof this.options.pmqlQuery !== 'undefined' && this.options.pmqlQuery !== '' && this.options.pmqlQuery !== null) {
                        const pmql = Mustache.render(this.options.pmqlQuery, {data: this.validationData});
                        params.config.outboundConfig = [
                            {type: 'PARAM', key: 'pmql', value: pmql},
                        ];
                    }
                    // Do not re-run the same request
                    const request = {selectedDataSource, params};
                    // eslint-disable-next-line no-undef
                    if (_.isEqual(this.lastRequest, request)) {
                        return;
                    }
                    // eslint-disable-next-line no-undef
                    this.lastRequest = _.cloneDeep(request);
                    this.$dataProvider.postDataSource(selectedDataSource, null, params)
                        .then(response => {
                            // eslint-disable-next-line no-undef
                            const list = dataName ? eval('response.data.' + dataName) : response.data;
                            const transformedList = this.transformOptions(list);
                            this.$root.$emit('selectListOptionsUpdated', transformedList);
                            this.selectListOptions = transformedList;
                        })
                        // eslint-disable-next-line no-unused-vars
                        .catch(err => {
                            /* Ignore error */
                        });
                }, 700),
            };
        },
        created() {

        },
        methods: {
            searchChange(filter) {
                this.filter = filter;
                this.optionsFromDataSource();
            },
            fillSelectListOptions(val) {
                    if (this.options.dataSource && this.options.dataSource === 'provideData') {

                        this.selectListOptions = this.options && this.options.optionsList ? this.options.optionsList : [];
                    }
                    if (this.options.dataSource && this.options.dataSource === 'dataObject') {
                        // eslint-disable-next-line no-unused-vars
                        let requestOptions = [];

                        try {
                            requestOptions = get(this.validationData, this.options.dataName);
                        } catch (e) {
                            // eslint-disable-next-line no-unused-vars
                            requestOptions = [];
                        }
                        if (this.options.dataUrl && (val || this.isOk == 0)) {

                            this.isOk++;
                            var data_get = (this.options.dataDependentVariable && this.transientData[this.options.dataDependentVariable]) ? this.transientData[this.options.dataDependentVariable] : '';
                            window.ProcessMaker.apiClient
                                .post(this.options.dataUrl, {select_content: val  ,var_id: data_get })
                                .then((response) => {
                                    // eslint-disable-next-line no-unused-vars
                                    var self = this;
                                    // eslint-disable-next-line no-unused-vars
                                    var number = 0;
                                    this.selectListOptions = response.data;

                                })
                                .finally(() => {
                                });
                        }
                    }
                    if (this.options.dataSource && this.options.dataSource === 'dataVariable') {
                        let recurse = function (obj,options) {
                            for (var property in obj) {
                                if (obj.hasOwnProperty(property)) {
                                    if (obj[property] != null && typeof obj[property] === "object"){
                                        if(options.dataVariableName == property){
                                            return obj[property];
                                        }else{
                                            recurse(obj[property],options);
                                        }
                                    }
                                }
                            }
                        }

                        this.selectListOptions = (recurse(this.transientData,this.options))?recurse(this.transientData,this.options):[];
                    }
                    if (this.options.dataSource && this.options.dataSource === 'dataConnector') {
                        this.doDebounce(this.sourceConfig);
                    }
            },
            /**
             * @param {*|*[]} list, array of objects
             */
            transformOptions(list) {
                const suffix = this.attributeParent(this.options.value);
                let resultList = [];
                list.forEach(item => {
                    // if the content has a mustache expression
                    const escape = Mustache.escape;
                    Mustache.escape = (t) => t; // Do not escape mustache content
                    let itemContent = (this.options.value.indexOf('{{') >= 0)
                        ? Mustache.render(this.options.value, item)
                        : Mustache.render('{{' + (this.options.value || 'content') + '}}', item);
                    let itemValue = (this.options.key.indexOf('{{') >= 0)
                        ? Mustache.render(this.options.key, item)
                        : Mustache.render('{{' + (this.options.key || 'value') + '}}', item);
                    Mustache.escape = escape; // Reset mustache to original escape function
                    let parsedOption = {};
                    parsedOption[this.optionsKey] = itemValue;
                    parsedOption[this.optionsValue] = itemContent;
                    if (this.options.valueTypeReturned === 'object') {
                        resultList.push(eval(suffix.length > 0 ? 'item.' + suffix : 'item'));
                    } else {
                        resultList.push(parsedOption);
                    }
                });
                return resultList;
            },
            stripMustache(str) {
                const removed = str.replace(/{{/g, '')
                    .replace(/}}/g, '')
                    .split('.')
                    .pop();
                return removed ? removed : str;
            },
            attributeParent(str) {
                let parts = str.replace(/{{/g, '')
                    .replace(/}}/g, '')
                    .split('.');
                parts.pop();
                return parts.join('.');
            },
            updateWatcherDependentFieldValue(newSelectOptions, oldSelectOptions) {
                let dataName = this.options.dataName.split('.');
                // Check to see if the watcher output variable has been loaded.
                // eslint-disable-next-line no-prototype-builtins
                if (this.validationData && this.validationData.hasOwnProperty(dataName[0]) && this.validationData[dataName[0]] !== null) {
                    // eslint-disable-next-line no-undef
                    if (_.isEqual(newSelectOptions, oldSelectOptions)) {
                        return;
                    }
                    this.$emit('input', null);
                }
            },
            /**
             * Returns true if one or more items in list (an array) are in Select List's options
             */
            areItemsInSelectListOptions(list) {
                if (!Array.isArray(list)) {
                    return true;
                }
                const itemsInOptionsList = list.filter(item => {
                    // if items are objects use the object's key attribute, use the item itself otherwise
                    const testValue = (typeof item === 'object' && item[this.optionsKey] !== undefined)
                        ? item[this.optionsKey]
                        : item;
                    if (testValue === 'undefined') {
                        return false;
                    }
                    return this.selectListOptions.some(option => option[this.optionsKey] === testValue);
                });
                return itemsInOptionsList.length > 0;
            },
        },
        watch: {
            sourceConfig: {
                immediate: true,
                deep: true,
                handler() {
                    this.fillSelectListOptions();
                },
            },
            /*id_value: {
             immediate:true,
             deep: true,
             handler() {
             this.optionsKey = this.id_value;
             },
             },
             val_value: {
             immediate:true,
             deep: true,
             handler() {
             this.optionsValue = this.val_value;
             },
             },
             jsonurl: {
             immediate:true,
             deep: true,
             handler() {
             var self=this;
             fetch(this.jsonurl)
             .then(response => response.json())
             .then(data => {
             self.selectListOptions = data;
             });
             },
             },*/
            // React to local data scope
            validationData: {
                immediate: true,
                deep: true,
                handler() {
                    this.fillSelectListOptions();
                },
            },
            value: {
                handler() {
                              },
                deep: true,
                immediate: true,

            },
            // React to a parent data scope
            'validationData._parent': {
                deep: true,
                handler() {
                    this.fillSelectListOptions();
                },
            },
            selectListOptions(newValue, oldValue) {
                this.updateWatcherDependentFieldValue(newValue, oldValue);
            },
        },
        computed: {
            validatorErrors() {
                return this.validator && this.validator.errors.get(this.name) || [];
            },
            divClass() {
                return this.toggle ? 'custom-control custom-radio' : 'form-check';
            },
            sourceConfig() {
                return {
                    dataSource: this.options.dataSource,
                    selectedEndPoint: this.options.selectedEndPoint,
                    selectedDataSource: this.options.selectedDataSource,
                    valueTypeReturned: this.options.valueTypeReturned,
                    dataName: this.options.dataName,
                    value: this.options.value,
                    key: this.options.key,
                };
            },
            valueProxy: {
                get() {
                    if (this.options.renderAs === 'dropdown') {
                        return this.areItemsInSelectListOptions(this.value) ? this.value : [];
                    }
                    return this.value;
                },
                set(val) {
                    return this.$emit('input', val);
                },
            },
            optionsKey() {
                if (this.options.dataSource && this.options.dataSource === 'provideData') {
                    return 'value';
                }
                if (this.options.dataSource && this.options.dataSource === 'dataConnector' && this.options.valueTypeReturned === 'object') {
                    return this.optionsValue;
                }
                if (this.options.dataSource && this.options.dataSource === 'dataObject') {
                    return this.options.key;
                }
                if (this.options.dataSource && this.options.dataSource === 'dataVariable') {
                    return this.options.key;
                }
                const fieldName = this.options.key || 'value';
                return this.stripMustache(fieldName);
            },
            optionsValue() {
                if (this.options.dataSource && this.options.dataSource === 'provideData') {
                    return 'content';
                }
                if (this.options.dataSource && this.options.dataSource === 'dataObject') {

                    return this.options.value;
                }
                if (this.options.dataSource && this.options.dataSource === 'dataVariable') {

                    return this.options.value;
                }
                const fieldName = this.options.value || 'content';
                return this.stripMustache(fieldName);
            },
            classList() {
                return {
                    'is-invalid': (this.validator && this.validator.errorCount) || this.error,
                    [this.controlClass]: !!this.controlClass,
                };
            },
        },
    };
</script>
