# framework for MVC using javascript

# supported features

- variable text node binding
- variable attribute binding
- function binding
- component creation
- view template
- view url
- model for component
- view model for component
- controller for component

# Framework architecture and workings

- app is registered using register method which takes rootId and rootComponentName

- components are registered using createComponent method which takes options for component
  creation

  options ={
  name: '<component-name>',
  viewUrl: <view url>,
  view: <view template>,
  controller: <controller function>,
  model: <controller model>,
  }

- components gets recorded in componentMap which is a hashmap that holds key as component name and value as callback method thats going to start the processes of rendering the component

- on window.load when everything is loaded which means all possible components are loaded, the rootComponent name is used to fetch callback method from componentMap and call it, this starts the rendering of rootComponent

- when rootComponent renders the callback has these operations to conduct

  - validate the component options, throw error if options are invalid or due to exceptions
  - check if options has model, if present create an instance of it and save it in modelMap which is a hashmap that holds key as component name and value as model instance, we will use it later features
  - once model instance is created, it is pushed into dependency array
  - viewModel instance is also created and pushed in dependency array
  - viewModel acts a binding bridge between UI and controller, changes are reflexted if view model is change
    using setViewModel(<model property name>,value), binding can be using @attribute or bind="attribute"
  - viewModel can hold function as property for event binding
  - if controller is found then the controll is called using appl using these dependencies

- once controller is called renderComponent is called, which intern does these operation

  - fetches template for the component if view url is present or uses view template string
  - creates dom element out of it using dom parser
  - if the component is rootComponent then it appends it to rootNode
  - it then gets the viewModel from viewModelMap which has the instance of viewModel was creates
  - then these methods are called
    - bindData - uses view model to bind attributes to text nodes (soon to be removed)
    - bindEvent - uses view model to bind methods to events on elements
    - bindAttributes - uses view model to bind events to elements (replaced bindData soon)
    - scanComponents - scans the dom of a component for further component, if found calls the render component
      cycle continues recursively

eg: register a event
sim-events="click:changeInfo,mouseover:changeInfo"

eg: bind a attribute
bind="info"
