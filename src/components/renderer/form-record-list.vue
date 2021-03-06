<template>
  <div class="data-table overflow-auto">
    <div class="row mb-2 ml-0 mr-0">
      <div class="col">
        <h4>{{ label }}</h4>
      </div>
      <div class="col text-right">
        <!--<button class="btn btn-primary" v-if="editable && !selfReferenced" @click="showAddForm" data-cy="add-row">
          {{ $t('Add') }}
        </button>-->
      </div>
    </div>
    <div v-if="!recordListOptions.length">
      {{ $t('This record list is empty or contains no data.') }}
    </div>
    <template v-else>
      <b-table
          :per-page="perPage"
          ref="vuetable"
          :data-manager="dataManager"
          :fields="tableFields"
          :items="tableData.data"
          sort-icon-left
          :css="css"
          :empty-text="$t('No Data Available')"
          :current-page="currentPage"
          data-cy="table"
          :selectable="selectable"
          select-mode="single"
          @row-selected="onRowSelected"
      >
        <template #cell()="{index,field,item}">
          <template v-if="isFiledownload(field, item)">
            <span @click="downloadFile(item, field.key, index)" href="#">{{ mustache(field.key, item) }}</span>
          </template>
          <template v-else-if="isImage(field, item)">
            <img :src="mustache(field.key, item)" style="record-list-image">
          </template>
          <template v-else>
            {{ formatIfDate(mustache(field.key, item)) }}
          </template>
        </template>
        <template #cell(__actions)="{index}">
          <div class="actions">
            <div class="btn-group btn-group-sm" role="group" aria-label="Actions">
              <button @click="showEditForm(index)" class="btn btn-primary" :title="$t('Edit')" data-cy="edit-row">
                <i class="fas fa-edit"/>
              </button>
              <button @click="showDeleteConfirmation(index)" class="btn btn-danger" :title="$t('Delete')"
                      data-cy="remove-row">
                <i class="fas fa-trash-alt"/>
              </button>
            </div>
          </div>
        </template>

        <template #cell(__select)="{ rowSelected }">
          <template v-if="rowSelected">
            <span aria-hidden="true" style="font-size: 1.25rem;">⦿</span>
            <span class="sr-only">Selected</span>
          </template>
          <template v-else>
            <span aria-hidden="true" style="font-size: 1.25rem;">⦾</span>
            <span class="sr-only">Not selected</span>
          </template>
        </template>

      </b-table>
      <b-pagination
          v-if="tableData.total > perPage"
          data-cy="table-pagination"
          v-model="currentPage"
          :total-rows="tableData.total"
          :per-page="perPage"
          :aria-label="$t('Pagination')"
          aria-controls="vuetable"
          @change="onChangePage"
      />
    </template>

    <b-modal
        :static="true"
        @ok="handleOk"
        @hidden="addItem = initFormValues"
        size="lg"
        v-if="editable && !selfReferenced"
        ref="addModal"
        :ok-title="$t('Ok')"
        :cancel-title="$t('Cancel')"
        :title="$t('Add')"
        header-close-content="&times;"
        data-cy="modal-add"
    >
      <vue-form-renderer
          :page="0"
          ref="addRenderer"
          v-model="addItem"
          :config="popupConfig"
          :current-page="form"
          :computed="formComputed"
          :watchers="formWatchers"
          debug-context="Record List Add"
          :key="Array.isArray(value) ? value.length : 0"
          :_parent="validationData"
      />
    </b-modal>
    <b-modal
        :static="true"
        @ok="edit"
        size="lg"
        v-if="editable && !selfReferenced"
        ref="editModal"
        :ok-title="$t('Save')"
        :cancel-title="$t('Cancel')"
        :title="$t('Edit Record')"
        header-close-content="&times;"
        data-cy="modal-edit"
    >
      <vue-form-renderer
          :page="0"
          ref="editRenderer"
          v-model="editItem"
          :config="popupConfig"
          :current-page="form"
          :computed="formComputed"
          :watchers="formWatchers"
          debug-context="Record List Edit"
          :_parent="validationData"
          :key="editFormVersion"
      />
    </b-modal>
    <b-modal
        @ok="remove"
        size="lg"
        v-if="editable && !selfReferenced"
        ref="deleteModal"
        :ok-title="$t('Delete')"
        :cancel-title="$t('Cancel')"
        :title="$t('Delete Record')"
        header-close-content="&times;"
        data-cy="modal-remove"
    >
      <p>{{ $t('Are you sure you want to remove this record?') }}</p>
    </b-modal>
    <b-modal
        @ok="hideInformation"
        size="sm"
        v-if="editable && !selfReferenced"
        ref="infoModal"
        :ok-title="$t('OK')"
        :title="$t('Information form')"
        header-close-content="&times;"
        ok-only
        data-cy="modal-not-assigned"
    >
      <p>{{ $t('The form to be displayed is not assigned.') }}</p>
    </b-modal>
    <div v-if="editable && selfReferenced" class="alert alert-danger">
      {{
        $t('The Record List control is not allowed to reference other controls on its own page to add or edit records. Specify a secondary page with controls to enter records.')
      }}
    </div>
  </div>
</template>


<script>
import mustacheEvaluation from '../../mixins/mustacheEvaluation';
import _, {get} from 'lodash';
import {dateUtils} from '@processmaker/vue-form-elements';
import axios from "axios";
//import ScreenRenderer from '../screen-renderer.vue';

const jsonOptionsActionsColumn = {
  key: '__actions',
  label: 'Actions',
  thClass: 'text-right',
  tdClass: 'text-right',
};

const jsonOptionsSelectColumn = {
  key: '__select',
  label: 'Select',
};

export default {
  mixins: [mustacheEvaluation],
  props: ['transientData', 'name', 'label', 'fields', 'value', 'editable', 'selectable', '_config', 'form', 'validationData', 'formConfig', 'formComputed', 'formWatchers'],
  data() {
    this.fillRecordListOptions()
    return {
      recordListOptions: [],
      editFormVersion: 0,
      single: '',
      plural: '',
      addItem: {},
      editItem: {},
      editIndex: null,
      currentPage: 1,
      paginatorPage: 1,
      perPageSelectEnabled: false,
      perPage: 5,
      lastPage: 1,
      css: {
        tableClass: 'table table-hover table-responsive text-break mb-0 d-table',
        loadingClass: 'loading',
        detailRowClass: 'vuetable-detail-row',
        handleIcon: 'grey sidebar icon',
        sortableIcon: 'fas fa-sort',
        ascendingIcon: 'fas fa-sort-up',
        descendingIcon: 'fas fa-sort-down',
        ascendingClass: 'ascending',
        descendingClass: 'descending',
        renderIcon(classes) {
          return `<i class="${classes.join(' ')}"></i>`;
        },
      },
      initFormValues: {},
    };
  },
  computed: {
    popupConfig() {
      const config = [];
      config[this.form] = this.formConfig[this.form];
      return config;
    },
    debug() {
      return {
        perPageSelectEnabled: this.perPageSelectEnabled,
        perPageSelectEnabled2: this.$refs.pagination && this.$refs.pagination.perPageSelectEnabled,
      };
    },
    parentObj() {
      let parent = this.$parent;
      while ('transientData' in parent.$props) {
        parent = parent.$parent;
      }
      return parent;
    },
    dataManager() {
      if (this.$refs.vuetable) {
        let pagination = this.$refs.vuetable.makePagination(this.value.length);
        return {
          pagination,
          data: this.value.slice(pagination.from - 1, pagination.to),
        };
      } else {
        // eslint-disable-next-line no-console
        console.log('refs vuetable not exists');
      }

    },
    tableData() {
      let value = this.recordListOptions || [];
      JSON.parse(JSON.stringify(value.map(obj => {
        this.$set(obj, 'row_id', Math.random().toString(36).substring(2) + Date.now().toString(36))
        this.$set(obj, 'is_selected', false)
      })))

      let from = this.paginatorPage - 1;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.lastPage = Math.ceil(value.length / this.perPage);
      let data = {
        total: value.length,
        per_page: this.perPage,
        current_page: this.paginatorPage,
        last_page: this.lastPage,
        next_page_url: null,
        prev_page_url: null,
        from,
        to: value.length,
        data: value,
      };
      this.$emit('input', data.data);
      return data;
    },
    // The fields used for our vue table
    tableFields() {
      const fields = this.getTableFieldsFromDataSource();
      if (this.editable && !this.selfReferenced) {
        fields.push(jsonOptionsActionsColumn);
      }
      if (this.selectable) {
        fields.unshift(jsonOptionsSelectColumn);
      }
      return fields;
    },
    // Determines if the form used for add/edit is self referencing. If so, we should not show it
    selfReferenced() {
      return this.form && this.form === this.$parent.currentPage;
    },
  },
  watch: {
    value: {
      deep: true,
      handler() {
        var self = this;
        let recurse = function (obj) {
          for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
              if (obj[property] != null && typeof obj[property] === "object") {
                if (property != self.name) {
                  recurse(obj[property]);
                }
              } else {
                //console.log(property , self.transientData[self.name],'456');
                obj[property] = property in self.value[0] ? null : obj[property];
                //obj[property] = property in self.transientData[self.name][0] ? "" : obj[property];
              }
            }
          }
        }
        recurse(this.transientData);
      },
    },
  },
  methods: {
    //get record item
    fillRecordListOptions() {

      if (this.$attrs.options.dataSource === 'recordForm') {
        this.recordListOptions = this.value || [];
      }
      if (this.$attrs.options.dataSource === 'dataObject') {
        // eslint-disable-next-line no-unused-vars
        if (this.$attrs.options.dataUrl) {
          var data_get = (this.$attrs.options.dataDependentVariable && this.transientData[this.$attrs.options.dataDependentVariable]) ? this.transientData[this.$attrs.options.dataDependentVariable] : '';
          window.ProcessMaker.apiClient
              .post(this.$attrs.options.dataUrl, {select_content: '', var_id: data_get})
              .then((response) => {
                // eslint-disable-next-line no-unused-vars
                this.recordListOptions = response.data;

              })
              .finally(() => {
              });

        }
      }
    },
    onRowSelected(items) {
      typeof items[0] !== 'undefined' ? JSON.parse(JSON.stringify(this.tableData.data.map(obj => {
        this.$set(obj, 'is_selected', items[0].row_id == obj.row_id);
      }))) : JSON.parse(JSON.stringify(this.tableData.data.map(obj => {
        this.$set(obj, 'is_selected', false);
      })));
    },
    formatIfDate(string) {
      return dateUtils.formatIfDate(string);
    },
    isImage(field, item) {
      const content = _.get(item, field.key);
      return typeof content === 'string' && content.substr(0, 11) === 'data:image/';
    },
    isFiledownload(field) {
      return field.key === '__filedownload';
    },
    setUploadDataNamePrefix(index = null) {
      let rowId = null;
      if (index !== null && this.editItem) {
        rowId = this.editItem.row_id;
      } else {
        if (this.addItem) {
          rowId = this.addItem.row_id;
        }
      }

      this.$root.$emit('set-upload-data-name', this, index, rowId);
    },
    getTableFieldsFromDataSource() {
      const {jsonData, key, value, dataName} = this.fields;

      const convertToVuetableFormat = (option) => {
        //let slot = '__filedownload';
        return {
          key: option[key || 'value'],
          sortable: true,
          label: option[value || 'content'],
          tdClass: 'table-column',
        };
      };

      return this.getValidFieldData(jsonData, dataName).map(convertToVuetableFormat);
    },
    getValidFieldData(jsonData, dataName) {
      let validationData = this.validationData[dataName];

      if (jsonData) {
        try {
          validationData = JSON.parse(jsonData);
        } catch (error) {
          validationData = [];
        }
      }

      return Array.isArray(validationData)
          ? validationData
          : [];
    },
    hideInformation() {
      this.$refs.infoModal.hide();
    },
    onPaginationData(paginationData) {
      this.$refs.pagination.setPaginationData(paginationData);
    },
    onChangePerPage(perPage) {
      this.perPage = parseInt(perPage);
    },
    onChangePage(page) {
      if (page == 'next') {
        this.paginatorPage = this.paginatorPage + 1;
      } else if (page == 'prev') {
        this.paginatorPage = this.paginatorPage - 1;
      } else {
        this.paginatorPage = page;
      }
      if (this.paginatorPage <= 0) {
        this.paginatorPage = 1;
      }
      if (this.paginatorPage > this.lastPage) {
        this.paginatorPage = this.lastPage;
      }
    },
    showEditForm(index) {
      let pageIndex = ((this.paginatorPage - 1) * this.perPage) + index;
      // Reset edit to be a copy of our data model item
      this.editItem = JSON.parse(JSON.stringify(this.value[pageIndex]));
      this.editIndex = pageIndex;
      // rebuild the edit screen to avoid
      this.editFormVersion++;
      this.$nextTick(() => {
        this.setUploadDataNamePrefix(pageIndex);
        this.$refs.editModal.show();
      });
    },
    edit(event) {
      if (this.$refs.editRenderer.$refs.renderer.$refs.component.$v.$invalid) {
        event.preventDefault();
        return;
      }

      // Edit the item in our model and emit change
      let data = this.value ? JSON.parse(JSON.stringify(this.value)) : [];
      data[this.editIndex] = JSON.parse(JSON.stringify(this.editItem));

      // Remove the parent object
      delete data[this.editIndex]._parent;

      // Emit the newly updated data model
      this.$emit('input', data);
    },
    showAddForm() {
      const uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      this.$set(this.addItem, 'row_id', uniqueId);
      if (this.selectable) {
        this.$set(this.addItem, 'is_selected', false);
      }
      this.setUploadDataNamePrefix();
      if (!this.form) {
        this.$refs.infoModal.show();
        return;
      }
      // Open form
      this.$refs.addModal.show();

      // eslint-disable-next-line no-unused-vars
      let {_parent, ...result} = this.addItem;
      this.initFormValues = _.cloneDeep(result);
    },
    handleOk(bvModalEvt) {
      bvModalEvt.preventDefault();

      if (this.$refs.addRenderer.$refs.renderer.$refs.component.$v.$invalid) {
        return;
      }

      // Add the item to our model and emit change
      // @todo Also check that value is an array type, if not, reset it to an array
      let data = this.value ? JSON.parse(JSON.stringify(this.value)) : [];

      const item = JSON.parse(JSON.stringify(this.addItem));
      delete item._parent;
      data[data.length] = item;

      // Emit the newly updated data model
      this.$emit('input', data);

      // Reset our add item
      this.addItem = {};

      this.$nextTick(() => {
        this.$refs.addModal.hide();
      });
    },
    showDeleteConfirmation(index) {
      let pageIndex = ((this.paginatorPage - 1) * this.perPage) + index;
      this.deleteIndex = pageIndex;
      this.$refs.deleteModal.show();
    },
    downloadFile(rowData, rowField, rowIndex) {
      let requestId = this.$root.task.request_data._request.id;
      let name = this.name + '.' + rowIndex + '.' + rowField;

      window.ProcessMaker.apiClient
          .get('requests/' + requestId + '/files?name=' + name)
          .then(response => {
            let respData = response.data;
            if (respData && respData.data && respData.data.length) {
              let file = respData.data[0];
              this.downloadRecordListFile(file, requestId);
            }
          });
    },
    downloadRecordListFile(file, requestId) {
      window.ProcessMaker.apiClient({
        baseURL: '/',
        url: '/request/' + requestId + '/files/' + file.id,
        method: 'GET',
        responseType: 'blob', // important
      }).then(response => {
        //axios needs to be told to open the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.file_name);
        document.body.appendChild(link);
        link.click();
      });
    },
    remove() {
      // Add the item to our model and emit change
      // @todo Also check that value is an array type, if not, reset it to an array
      let data = this.value ? JSON.parse(JSON.stringify(this.value)) : [];
      let recordData = data[this.deleteIndex];
      // Remove item from data array
      data.splice(this.deleteIndex, 1);
      // Emit the newly updated data model
      this.$emit('input', data);
      this.$root.$emit('removed-record', this, recordData);
    },
  },
created() {
  this.fillRecordListOptions()
}
};
</script>

<style>
.table td.table-column {
  max-width: 300px;
}
</style>
