define([
    'models/DictionaryModel'
], function(DictionaryModel) {
    'use strict';

    const sortTypes = {
         BY_NAME: 'BY_NAME',
         CREATED: 'CREATED'
    };

    const {BY_NAME, CREATED} = sortTypes;

    const sortDirections = { ASC: 'ASC', DESC: 'DESC' };

    const {ASC, DESC} = sortDirections;

    return {
    sortTypes,
    sortDirections,
    getSortOptions() {
        const dictionary = DictionaryModel.getHash();

        return {
            [BY_NAME]: {
                id: BY_NAME,
                title: dictionary.sorting.name
            },
            [CREATED]: {
                id: CREATED,
                title: dictionary.sorting.created
            }
        };
    },
    sortingMethods: {
        [BY_NAME]: (items, sortDirection = DESC) => {
            return [...items].sort((a, b) => {
                    if(a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return sortDirection === DESC ? -1 : 1; }
                    if(a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return sortDirection === DESC?  1 : -1; }
                    return 0;
                });
        },
        [CREATED]: (items, sortDirection = DESC) => {
                return [...items].sort((a,b) => {
                    const dateA = new Date(a.created);
                    const dateB = new Date(b.created);
                    return sortDirection === DESC ? dateB - dateA : dateA - dateB;
                });
        }
    }

    };
});

