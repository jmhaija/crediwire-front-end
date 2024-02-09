define([

    'Vue',
    'models/DictionaryModel',
    'services/SortingService',
    'directives/click-outside-closable'

], function(Vue, DictionaryModel, SortingService, clickOutsideClosable) {
    'use strict';
    const template = `
    <div :class="dropdownClass" ref="sortingDropdown">
        <label v-if="label">{{label}}</label>
        <div class="label" @click.stop="toggleDropdown">
            <span>{{selectedOption.name || selectedOption.title}}</span> <i class="cwi-down"></i>
            <div class="options" :class="{ show : dropdownOpened }" v-clickOutsideClosable="{exclude: ['sortingDropdown'], handler: 'closeDropdown'}">
                <slot scoped v-bind="bindOptions"></slot>
            </div>
        </div>
    </div>
    `;

    const defaultOption = {title: '', id: null, name: ''};

    const { ASC, DESC } = SortingService.sortDirections;

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
            selectedOption: this.defaultOption || defaultOption,
            selectedSortDirection: SortingService.sortDirections.DESC,
            dropdownOpened: false
        };
    };

    /**
     * Passed in props
     */

    const props = {
        options: {type: Array, default: () => []},
        sortDirection: {type: String, default: DESC},
        defaultOption: {type: Object,
            default: () => defaultOption
        },
        label: {type: String},
        dropdownClass: {
            type: String,
            default: 'selector small fade'
        }
    };

    /**
     * Methods
     */
    const methods = {
        selectOption: function(selectedOption) {
            this.selectedOption = selectedOption;
            this.closeDropdown();
        },
        toggleSortDirection: function () {
            const { selectedSortDirection } = this;

            const toggledValue = (selectedSortDirection === DESC) ? ASC : DESC;

            this.$emit('sortDirectionChanged', toggledValue)
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
        selectedOption : function (selectedOption){
            this.$emit('optionSelected', selectedOption);
        },
        defaultOption(defaultOption, oldOption) {
            if (defaultOption.id) {
                this.selectOption(defaultOption);

                const {selectedOption, selectedSortDirection} = this;

                this.$emit('option-selected', selectedOption);
                this.$emit('sortDirectionChanged', selectedSortDirection);

            }
        }
    };

    const computed = {
        directionClass: function () {
            const {up, down} = sortingDirectionClasses;

            return {
                [up]: this.selectedSortDirection === ASC,
                [down]: this.selectedSortDirection === DESC
            };
        },

        bindOptions: function () {
            const {selectedOption, selectOption, options} = this;
            return {
                selectOption,
                selectedOption,
                options
            }
        }
    };

    return Vue.extend({
        name: 'custom-dropdown',
        template : template,
        data : bindings,
        methods,
        props,
        watch,
        computed,
        directives: {
            clickOutsideClosable
        }
    });
});
