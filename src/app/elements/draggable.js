define([
    'Vue',
], function (Vue) {
    const data = () => ({
        draggedItem: null
    })

    return Vue.extend({
        name: 'draggable-items',
        data,
        render: function(createElement) {
            return createElement('span',
                this.$scopedSlots.default({
                    dragEvents: item => ({
                        drop: () => {
                            const {draggedItem: droppedItem} = this;
                            this.$emit('item-dropped',{
                                droppedItem,
                                item
                            });
                        },
                        dragover: event => {
                            event.preventDefault();
                        },
                        dragstart: () => {
                            this.draggedItem = item;
                        },
                        dragend: () => {
                            this.draggedItem = null;
                        }
                    })
                })
            )
        }
    });
});
