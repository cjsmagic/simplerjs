(function () {
    sim.modifier({
        name: 'sim-for',
        onChange: function (elementRef, value, viewModel, errorLogger, isUpdate) {
            // debugger;
            var items = viewModel[value];
            var clonedNode = elementRef.cloneNode(true);
            var parentElement = elementRef.parentElement;

            // var parentNode = elementRef.parentElement.cloneNode();
            // parentNode.innerHTML = null;
            if (isUpdate) {
                while (parentElement.firstChild) {
                    parentElement.removeChild(parentElement.lastChild);
                }
            }


            if (Array.isArray(items)) {
                items.forEach((item, index) => {
                    var newNode = index === 0 ? elementRef : clonedNode.cloneNode(true)
                    newNode.innerText = item;
                    parentElement.appendChild(newNode);
                });
            } else {
                errorLogger(value + ' Not an array');
            }

        }
    })
        .modifier({
            name: 'sim-show',
            onChange: function (elementRef, value, viewModel) {
                elementRef.style.display = viewModel[value] ? 'initial' : 'none';
            }
        })
})()