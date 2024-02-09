define([

  'Vue',
  'models/DictionaryModel',
  'models/EntryDepartmentModel',
  'collections/EntryDepartmentsCollection',
  'services/EventBus',
  'directives/click-outside-closable'

], (Vue, DictionaryModel, EntryDepartmentModel, EntryDepartmentsCollection, EventBus, clickOutsideClosable) => {

  const template = `
  <article ref="entry-department-selector" class="company-list selector pull-up">
    <label>{{ui.dictionary.entryDepartments.department}}</label>
    <div class="label primary" v-on:click.stop="ui.departmentOptions = true">
      <i class="cwi-down"></i>
      <span v-if="selectedDepartment" class="name">{{selectedDepartment.name}}</span>
      <span v-if="!selectedDepartment" class="name">{{ui.dictionary.entryDepartments.companyData}}</span>
      <div class="options" v-bind:class="{ show : ui.departmentOptions }" v-clickOutsideClosable="{ exclude: ['entry-department-selector'],  handler: 'closeAllOptions' }">
        <div class="option" v-bind:class="{ selected : selectedDepartment === null }" v-on:click.stop="removeDepartment()">
          <span class="name">{{ui.dictionary.entryDepartments.companyData}}</span>
        </div>
        <div class="option" v-for="department in departments" v-bind:class="{ selected : selectedDepartment && department.id == selectedDepartment.id }" v-on:click.stop="setDepartment(department)">
          <span class="name no-overflow">{{department.name}}</span>
        </div>
      </div>
    </div>
  </article>
  `

  const data = () => {
    return {
      ui : {
        dictionary : DictionaryModel.getHash(),
        departmentOptions : false
      },
      departments : [],
      selectedDepartment : null,
      loadingDepartments : false
    }
  }

  const methods = {
    init() {
      this.removeDepartment()
      this.getDepartments()
      EventBus.$on('getEntryDepartments', this.getDepartments)
      EventBus.$on('companyUserChanged', this.getDepartments)
    },

    closeAllOptions () {
      this.ui.departmentOptions = false
    },

    getDepartments() {
      if (this.loadingDepartments) {
        return false
      }

      this.loadingDepartments = true
      EntryDepartmentsCollection.getEntryDepartments()
        .then(res => {
          if (res._embedded?.items?.length > 0) {
            this.departments = res._embedded.items
            if (this.selectedDepartmentId) {
              const selectedDepartment = this.departments.find(dep => dep.id === this.selectedDepartmentId);
              if (selectedDepartment) {
                this.setDepartment(selectedDepartment);
              }
            }
          }
          this.loadingDepartments = false
        })
    },

    setDepartment(dep) {
      this.ui.departmentOptions = false
      this.selectedDepartment = dep
      EntryDepartmentModel.setEntryDepartment(dep)
      this.$emit('getDepartmentId', dep.id);
    },

    removeDepartment() {
      this.ui.departmentOptions = false;
      this.$emit('getDepartmentId', null);
      this.selectedDepartment = null;
      EntryDepartmentModel.forgetEntryDepartment();
    }
  }

  return Vue.extend({
    template,
    data,
    methods,
    props: {
      selectedDepartmentId: {}
    },
    mounted() {
      this.init()
    },
    directives: {
      clickOutsideClosable
  }
  })

})
