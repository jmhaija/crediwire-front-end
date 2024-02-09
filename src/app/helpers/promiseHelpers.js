define([], function(){
    const rejectedPromise = () => {
        const promise = new Promise((res, reject) => {
            setTimeout(() => reject());
        });
        return promise;
    };

   return  { rejectedPromise };
});
