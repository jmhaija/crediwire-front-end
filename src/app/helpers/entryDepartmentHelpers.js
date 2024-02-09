define([
    'models/EntryDepartmentModel'
], function(EntryDepartmentModel) {
    const changeDepartmentModel = (getPresentationPageInfo, selectedDepartmentId) => {
        if (getPresentationPageInfo) {
            EntryDepartmentModel.setEntryDepartment({ name: '', id:  getPresentationPageInfo});
        } else if (getPresentationPageInfo && EntryDepartmentModel.getEntryDepartment()?.id) {
            EntryDepartmentModel.forgetEntryDepartment();
        } else if (!selectedDepartmentId && EntryDepartmentModel.getEntryDepartment()?.id) {
            EntryDepartmentModel.forgetEntryDepartment();
        }
    }

    const clearDepartmentModel = selectedDepartmentId => {
        if (!selectedDepartmentId && EntryDepartmentModel.getEntryDepartment()?.id) {
            EntryDepartmentModel.forgetEntryDepartment();
        }
    }

    return { changeDepartmentModel, clearDepartmentModel };
})
