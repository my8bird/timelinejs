window.Timeline = T = {}

T.elmBox = (elm) ->
   pos = elm.position()
   x   = pos.left
   y   = pos.top

   return {
      x1: x
      y1: y
      x2: x + elm.outerWidth(true)
      y2: y + elm.outerHeight(true)
   }

T.getWidthHeight = (elm) ->
   return {
      x: x
      y: y
      w: x + elm.outerWidth(true)
      h: y + elm.outerHeight(true)
   }


T.Event = Backbone.Model.extend({})


T.EventCollection = Backbone.Collection.extend
   model: Timeline.Event

   comparator: (event) ->
      event.get('start')



T.EventView = Backbone.View.extend
   tagName:   'div'
   className: 'event'
   template: Handlebars.compile('{{title}}'),

   model: null

   render: () ->
      @$el.html(@template(@model.attributes))
      @



T.TimelineView = Backbone.View.extend
   tagName:   'div'
   className: 'timeline'

   collection:  null
   _eventViews: []

   events: {}

   initialize: (options) ->
      _.defaults(options, {collection: null})
      collection = options.collection

      @_options  = options
      @_layout   = new Timeline.LayoutEngine()
      @_children = []

      if (collection)
         collection.on('add',    @_onEventAdded,   @)
         collection.on('remove', @_onEventRemoved, @)
         collection.on('change', @_onEventChanged, @)

   render: () ->
      collection = @_options.collection

      @_children = collection.map (event) =>
         view = new Timeline.EventView {model: event}
         @el.appendChild(view.render().el)
         view

      @_updateLayout()

   _updateLayout: () ->
      setTimeout () =>
         views = @_children
         new_positions = @_layout.doLayout(@_children[0].model.get('start'), @_children)
         _.each _.zip(views, new_positions), ([v, [left, top]]) ->
            v.$el.css('left', left)
            v.$el.css('top',  top)

   _onEventAdded: (model) ->
      # Build a new view for this event
      view = new Timeline.EventView({model: model})

      # Store it for later
      @_eventViews[model.id] = view

      # Show it to the world
      @$el.append(view.render().el)

      # Ask the layout engine to move anything that may have issues now.

   _onEventRemoved: (model) ->

   _onEventChanged: () ->
