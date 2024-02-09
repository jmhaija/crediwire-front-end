define([

], () => {
    //let entryDepartment = localStorage.getItem('entryDepartment') ? JSON.parse(localStorage.getItem('entryDepartment')) : null
    let entryDepartment = null

    return {
        getEntryDepartment() {
            return entryDepartment
        },
        
        setEntryDepartment(dep) {
            entryDepartment = dep
            //localStorage.setItem('entryDepartment', JSON.stringify(dep))
        },
        
        forgetEntryDepartment() {
            entryDepartment = null
            //localStorage.removeItem('entryDepartment')
        }
    }
})
