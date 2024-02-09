define([
    'Vue',
], function(Vue) {
    const template = `
        <article class="help">
               <div class="flex-column flex-align-center">
               <h2>We are having technical problems right now.</h2>
               <h2>Please, try again in a moment.</h2>
               <h2>If the problem persist, contact CrediWire</h2>
               <h2>Email: <a href="mailto:info@crediwire.com">info@crediwire.com</a></h2>
               <h2>Phone: <a href="tel:+4591540965">+45 9154 0965</a></h2>
           </div>
        </article>
    `;

    return Vue.extend({
        template
    });
});
