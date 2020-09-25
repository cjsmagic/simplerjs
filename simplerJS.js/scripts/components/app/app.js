(function () {
    sim.
        component({
            name: 'app',
            viewUrl: '/scripts/components/app/app.html',
            controller: appController,
            model: appModel,
        })
        .modifier({
            name: 'change-background',
            onChange: function (elementRef, value) {
                elementRef.style.backgroundColor = value;
                elementRef.style.color = '#fff';
            }
        }).modifier({
            name: 'double-click',
            onChange: function (elementRef) {
                var counter = 0;
                elementRef.addEventListener('click', function (e) {
                    setTimeout(() => {
                        counter = 0;
                    }, 300)
                    counter++;
                    if (counter === 2) {
                        console.log('double clicked')
                        counter = 0;
                    };
                }, false);
            }
        })

    function appController(model, view) {
        const { viewModel, setViewModel } = view.viewBinder();
        viewModel.content = 'A Simple js Framework that enforces MVC';
        viewModel.info = 'this is attribute binding';
        viewModel.list = ["hello", "hi", "hey"];
        viewModel.isVisible = false;

        viewModel.changeInfo = function () {
            // setViewModel('list', [...viewModel.list, ...viewModel.list]);
            setViewModel('isVisible', !viewModel.isVisible);
        }
    }

    function appModel() {
    }
})();


