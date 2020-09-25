(function () {
    sim.component({
        name: 'app-header',
        viewUrl: '/scripts/components/app-header/app-header.html',
        controller: appHeaderController,
        model: appHeaderModel,
    });

    function appHeaderController(model, view) {
        const { viewModel, setViewModel } = view.viewBinder({ appName: 'Simpler Framework' });
    }

    function appHeaderModel() {
    }
})();


