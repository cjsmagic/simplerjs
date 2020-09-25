/**
   * @version 1.0.0
   * @author clarence jospeh merchant <clarencemerchant1995@gmail.com>
   * @namespace
   * @description A javascript framework for MVC
   * @constructor
   */
function simpler() { };

(function (window, document, simpler, undefined) {
    /**
    * root node.
    * @memberof simpler
    * @access protected 
    */
    simpler.prototype.rootNode = null;
    /**
    * componentsCount.
    * @memberof simpler
    * @access protected 
    */
    simpler.prototype.componentsCount = 0;
    /**
     * errors.
     * @memberof simpler
     * @access protected 
     */
    simpler.prototype.errors = {
        COMPONENT_NAME_NOT_FOUND: 'Component name not found'
    };
    /**
     * componentMap.
     * @memberof simpler
     * @access protected 
     */
    simpler.prototype.componentMap = {};
    /**
     * modelMap.
     * @memberof simpler
     * @access protected 
     */
    simpler.prototype.modelMap = {};
    /**
     * viewAttributeMap.
     * @memberof simpler
     * @access protected 
     */
    simpler.prototype.viewAttributeMap = {};
    /**
     * viewModelMap.
     * @memberof simpler
     * @access protected 
     */
    simpler.prototype.viewModelMap = {};
    /**
     * validates component options.
     * @param {object} options - options of a component!.
     * @memberof simpler
     */
    simpler.prototype.validateOptions = function (options) {
        var isValid = true;
        var error = null;
        if (typeof options.name === 'undefined') {
            error = this.errors.COMPONENT_NAME;
        }
        return { isValid, error };
    };
    /**
     * validates component options.
     * @param {string} error - errors of the framework.
     */
    simpler.prototype.errorLogger = function (error) {
        console.error('Simpler: ', error);
    };

    simpler.prototype.modifierMap = {};
    /**
    * creates component.
    * @param {object} options - creates component.
    */
    simpler.prototype.modifier = function (modifierOptions) {
        var callback = function (componentHostRef, modifierId, modifierValue, viewModel, isUpdate) {
            var options = Object.assign({}, modifierOptions);
            var check = this.validateOptions(options);
            if (check.isValid) {
                options.modifierId = modifierId;
                var dependencies = [componentHostRef, modifierValue, viewModel, this.errorLogger, isUpdate];
                if (options.onChange) {
                    options.onChange.apply(null, dependencies);
                }
            } else {
                this.errorLogger(check.error);
            }
        }.bind(this);
        this.modifierMap[modifierOptions.name] = callback;
        return this;
    }
    /**
     * creates component.
     * @param {object} options - creates component.
     */
    simpler.prototype.component = function (createComponentOptions) {
        var callback = function (componentHostRef, componentId) {
            var options = Object.assign({}, createComponentOptions);
            var check = this.validateOptions(options);
            if (check.isValid) {
                options.componentId = componentId;
                var model = null
                var dependencies = [];
                if (options.model) {
                    model = new options.model();
                    this.modelMap[options.name] = model;
                    dependencies.push(model);
                }
                var view = this.getView(options);
                dependencies.push(view);

                if (options.controller) {
                    options.controller.apply(null, dependencies);
                }
                this.renderComponent(options, componentHostRef);
            } else {
                this.errorLogger(check.error);
            }
        }.bind(this);
        this.componentMap[createComponentOptions.name] = callback;
        return this;
    };
    /**
     * creates a view model based on options.
     * @param {object} options - creates view.
     */
    simpler.prototype.getView = function (options) {
        var self = this;
        var obj = {
            viewBinder(initialValue) {
                function view() {
                    this.viewModel = Object.assign({}, initialValue);
                };
                view.prototype.setViewModel = function (key, value) {
                    this[key] = value;
                    self.notifyChange(options.componentId);
                }

                var newView = new view();
                self.viewModelMap[options.componentId] = newView;
                return { viewModel: newView.viewModel, setViewModel: newView.setViewModel.bind(newView.viewModel) }
            },
        };
        return obj;
    };
    /**
     * creates a view model based on options.
     * @param {string} context - notify change in components view model.
     */
    simpler.prototype.notifyChange = function (componentContext) {
        console.log('Change requested from', componentContext);
        /* update binded attribute */
        this.updateBindedAttributes(componentContext);
        /* update modifiers */
        this.updateModifiers(componentContext);

    };
    /**
     * renders component.
     * @param {string} context - renders component.
     */
    simpler.prototype.renderComponent = async function (options, componentHostRef) {
        var parser = new DOMParser();
        var domString = options.viewUrl ? await fetch(options.viewUrl).then(data => data.text()) : viewUrl;
        var html = parser.parseFromString(domString, 'text/html');
        var componentElement = html.body.firstChild;
        componentHostRef.append(componentElement);
        var model = this.viewModelMap[options.componentId];
        this.bindEvent(componentElement, model.viewModel, options.componentId);
        this.bindAttributes(componentElement, model.viewModel, options.componentId);
        this.scanComponents(componentElement);
        this.scanModifiers(componentElement, model.viewModel, options.componentId);
    };
    /**
     * scans for component tags.
     * @param {node} element - element ref.
     */
    simpler.prototype.scanComponents = function (element) {
        for (var componentName of Object.keys(this.componentMap)) {
            var nodes = element.getElementsByTagName(componentName);
            var node = 0;
            for (node = 0; node < nodes.length; node++) {
                var currentNode = nodes[node];
                var renderComponentCallback = this.componentMap[currentNode.localName];
                var componentId = this.getUniqueComponentId(currentNode.localName);
                renderComponentCallback && renderComponentCallback(currentNode, componentId);
            }
        }
    };
    /**
     * scans for component tags.
     * @param {node} element - element ref.
     */
    simpler.prototype.componentsModifierMap = {};
    simpler.prototype.scanModifiers = function (element, viewModel, componentId) {
        for (var modifierName of Object.keys(this.modifierMap)) {
            var nodes = element.querySelectorAll('[' + modifierName + ']');
            var node = 0;
            for (node = 0; node < nodes.length; node++) {
                var currentNode = nodes[node];
                var modifierValue = currentNode.getAttribute(modifierName);
                var onModiferLoadCallback = this.modifierMap[modifierName];
                var modifierId = this.getUniqueModifierId(modifierName);

                if (!this.componentsModifierMap[componentId]) {
                    this.componentsModifierMap[componentId] = {};
                }
                this.componentsModifierMap[componentId][modifierName] = { currentNode, modifierId, modifierValue, viewModel };

                onModiferLoadCallback && onModiferLoadCallback(currentNode, modifierId, modifierValue, viewModel, false);
            }
        }
    };
    /**
        * returns hashmap of attribute and its binded variable
        * @param {node} node - element ref.
        * @param {array} supportedAttributes - list of attributes.
        */
    simpler.prototype.getSupportedAttributes = function (node, supportedAttributes) {
        const attributesToRegister = {};
        var attributeNames = node.getAttributeNames();

        for (var attributeName of attributeNames) {
            if (supportedAttributes.includes(attributeName)) {
                attributesToRegister[attributeName] = { attribute: attributeName, variableName: node.getAttribute(attributeName), };
            };
        }

        return attributesToRegister;
    }
    /**
     * binds to <bindable variables>="<variable>"
     * @param {node} element - element ref.
     * @param {object} model - view model of component.
     * @param {string} componentName - component name.
     */
    simpler.prototype.bindAttributes = function (element, model, componentName) {
        var bindableKeys = [];
        for (var key in model) {
            if (typeof model[key] !== 'function') {
                bindableKeys.push(key);
            }
        }
        var supportedAttributes = ['bind', 'loop-on', 'loop-with'];
        var nodes = element.parentElement.querySelectorAll('[bind]');
        var bindables = [];
        if (!this.viewAttributeMap[componentName]) {
            for (var currentNode of nodes) {
                var attributeMap = this.getSupportedAttributes(currentNode, supportedAttributes);
                for (var attribute in attributeMap) {
                    var variableName = attributeMap[attribute].variableName;

                    var previousValue = typeof model[variableName] === 'function' ? model[variableName]() : model[variableName];
                    currentNode.textContent = previousValue;

                    bindables.push({ nodeRef: currentNode, key: variableName, previousValue: previousValue });
                }
            }
            this.viewAttributeMap[componentName] = { viewRef: element, bindables: bindables };
        }
    };
    /**
    * updates view based on viewModel"
    * @param {string} componentName - component name.
    */
    simpler.prototype.updateBindedAttributes = function (componentName) {
        var view = this.viewModelMap[componentName];
        var viewModel = view.viewModel;
        var currentBindables = this.viewAttributeMap[componentName].bindables;
        currentBindables.forEach(function (bind) {
            var newValue = typeof viewModel[bind.key] === 'function' ? viewModel[bind.key]() : viewModel[bind.key];
            if (bind.previousValue !== newValue) {
                bind.nodeRef.textContent = newValue;
            }
        });
    }

    /**
    * updates view based on viewModel"
    * @param {string} componentName - component name.
    */
    simpler.prototype.updateModifiers = function (componentName) {
        var view = this.viewModelMap[componentName];
        var viewModel = view.viewModel;
        // var currentBindables = this.viewAttributeMap[componentName].bindables;

        var modifiers = this.componentsModifierMap[componentName];

        Object.keys(modifiers).forEach(modifierKey => {
            const data = modifiers[modifierKey];
            this.modifierMap[modifierKey](
                data.currentNode, modifierKey, data.modifierValue, viewModel, true);
        })
    }
    /**
     * binds to <bindable events>="<view model method name>"
     * @param {node} element - element ref.
     * @param {object} model - view model of component.
     */
    simpler.prototype.bindEvent = function (element, model) {
        var nodes = element.parentElement.querySelectorAll('[sim-events]');
        for (var currentNode of nodes) {
            const eventsValue = currentNode.attributes['sim-events'].value.split(',');
            for (value of eventsValue) {
                const eventInfo = value.split(':');
                var eventName = eventInfo[0];
                var eventMethod = model[eventInfo[1]];
                currentNode.addEventListener(eventName, eventMethod, false);
            }
        }
    };
    /**
     * returns unique component id
     */
    simpler.prototype.getUniqueComponentId = function (componentName) {
        return componentName + '-' + (++this.componentsCount);
    }
    simpler.prototype.modifierCount = 0;
    simpler.prototype.getUniqueModifierId = function (modifierName) {
        return modifierName + '-' + (++this.modifierCount);
    }
    /**
    * sets the initial configuration
    */
    simpler.prototype.configure = function () {
    }
    /**
     * register the app
     * @param {object} options - app registration options.
     * @param {string} options.rootComponentName - root component name.
     * @param {string} options.rootId - root parent node id.     
     */
    simpler.prototype.app = function (options) {
        this.configure();
        this.rootComponentName = options.rootComponentName;
        this.rootNode = document.getElementById(options.rootId);

        //called DOM loaded with all script and content
        window.onload = function () {
            var componentId = this.getUniqueComponentId(this.rootComponentName);
            //calls the callback registered while creating component
            (
                this.componentMap[this.rootComponentName]
                ||
                function () {
                    this.errorLogger('Root Component Not Found.');
                }.bind(this)
            )(this.rootNode, componentId);
        }.bind(this)
    };
    window.simpler = window.sim = new simpler();
})(window, document, !simpler ? function () { } : simpler)