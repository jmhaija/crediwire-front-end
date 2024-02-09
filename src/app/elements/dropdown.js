define([

    'Vue',
    'models/DictionaryModel',
    'services/SortingService',
    'directives/click-outside-closable'

], function(Vue, DictionaryModel, SortingService, clickOutsideClosable) {
    'use strict';
    /**
     * Element template
     *
     */
    const template = `
    <div class="sorting-dropdown" ref="sortingDropdown">
        <div class="selected-item" >
            <span class="dropdown-title">
                {{dictionary.sorting.sortBy}}:
            </span>
            <div class="selected-title-wrapper">
                <span class="selected-item-title" @click.stop="toggleSortDirection()">{{selectedOption.title}}</span>
                <i :class="directionClass" class="sorting-i" @click="toggleDropdown()"></i>
            </div>     
        </div>
        <div class="options-container"
             v-show="dropdownOpened"
             v-clickOutsideClosable="{
                 exclude: ['sortingDropdown'],
                 handler: 'closeDropdown'
            }">
            <div class="triangle-with-shadow"></div>
            <div v-for="option in options" class="sorting-dropdown-option" :class="{'option-selected': isOptionSelected(option)}" @click="selectOption(option)">
                {{option.title}}
            </div>
        </div>
    </div>
    `;

    const defaultOption = {title: '', id: null};

    const sortingDirectionClasses = {
        down: 'cwi-down',
        up: 'cwi-up'
    };

    /**
     * Data bindings
     */

    const bindings =  function() {
        return {
            dictionary: DictionaryModel.getHash(),
            selectedOption: this.defaultOption,
            selectedSortDirection: SortingService.sortDirections.DESC,
            dropdownOpened: false
        };
    };

    /**
     * Passed in props
     */

    const props = {
        options: {type: Array, default: () => []},
        defaultOption: {type: Object, default: () => defaultOption}
    };

    /**
     * Methods
     */
    const methods = {
        selectOption: function(selectedOption) {
            this.selectedOption = selectedOption;
            this.toggleDropdown();
        },
        toggleSortDirection: function () {
            const {selectedSortDirection} = this;
            const {ASC, DESC} = SortingService.sortDirections;

            this.selectedSortDirection = (selectedSortDirection === DESC) ? ASC : DESC;
        },
        toggleDropdown: function() {
            this.dropdownOpened = !this.dropdownOpened;
        },
        closeDropdown: function () {
            this.dropdownOpened = false;
        },
        isOptionSelected(option) {
            return option.id === this.selectedOption.id;
        }
    };


    /**
     * Properties to watch
     */
    const watch = {
        'selectedOption' : function (selectedOption){
            const {selectedSortDirection} = this;

            this.$emit('optionSelected', {
                selectedSortDirection,
                selectedOption
            });
        },
        'selectedSortDirection' : function (selectedSortDirection) {
            const {selectedOption} = this;

            this.$emit('optionSelected', {
               selectedSortDirection,
               selectedOption
            });
        }
    };

    const computed = {
      directionClass: function () {
          const {up, down} = sortingDirectionClasses;

          return {
              [up]: this.selectedSortDirection === SortingService.sortDirections.ASC,
              [down]: this.selectedSortDirection === SortingService.sortDirections.DESC
          };
      }
    };

    return Vue.extend({
        name: 'sorting-dropdown',
        template : template,
        data : bindings,
        methods,
        props,
        watch,
        computed,
        mounted : function () {
            if (this.defaultOption.id) {
                const {selectedOption, selectedSortDirection} = this;

                this.$emit('optionSelected', {
                    selectedSortDirection,
                    selectedOption
                });
            }
        },
        directives: {
            clickOutsideClosable
        }
    });
});
