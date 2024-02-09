define([], function() {
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    class File {
        constructor(file) {
            if(typeof file === 'object') {
                this.id = file.id || generateId();
                this.name = file.name;
                this.fileObj = file;
            } else {
                this.id = generateId();
                this.name = file.substring(file.lastIndexOf('/')+1);
                this.fileObj = null;
                this.src = file;
            }
        }
    }

   return File;
});
