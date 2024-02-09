define(function() {
    var delay = 5000; //How long to show the toast

    return {
        show : function(message, addClass, actions = []) {
            var toast = document.createElement('div');
            const textSpan = document.createElement('span');
            var text = document.createTextNode(message);
            const hideToast =  () => toast.classList.remove('show');

            // Action is an object of type
            // {
            //  text: String,
            //  onClick: Function
            // }

            const actionLinks = actions.map(({text, onClick}) => {
                const element = document.createElement('div');
                element.className = 'toast-action';
                element.innerText = text;
                element.addEventListener('click', () => {onClick(); hideToast()});
                return element;
            })

            textSpan.appendChild(text);
            toast.appendChild(textSpan);

            toast.classList.add('toast');

            if (actions.length) {
                const actionsContainerElem = document.createElement('div');
                actionsContainerElem.className = 'toast-actions-container';

                actionLinks.map(link => {
                    actionsContainerElem.appendChild(link)
                });

                toast.appendChild(actionsContainerElem);
            }



            if (addClass) {
                toast.classList.add(addClass);
            }

            document.body.appendChild(toast);

            setTimeout(function() {
                toast.classList.add('show');
            }, 250);



            setTimeout(function() {
               hideToast()
            }, delay);
        }
    };
});
