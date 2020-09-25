(function () {
    sim.component({
        name: 'app-footer',
        viewUrl: '/scripts/components/app-footer/app-footer.html',
        controller: appFooterController,
        model: appFooterModel,
    });

    function appFooterController(model, view) {
        const { viewModel, setViewModel } = view.viewBinder({ copyRight: 'copy right at clarence merchant' });

        viewModel.sayFooter = function () {
            console.log('footer');
        }
    }

    function appFooterModel() {
    }
})();


