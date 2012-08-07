/*global console:true, window:true, _:true, setTimeout:true */

;(function (Timeline, Handlebars, _, Backbone) {
   "use strict";

   Timeline.Event = Backbone.Model.extend({
   });

   Timeline.EventCollection = Backbone.Collection.extend({
      model: Timeline.Event,

      comparator: function(event) {
         return event.get('start');
      }
   });

   Timeline.EventView = Backbone.View.extend({
      tagName:   'div',
      className: 'event',

      template: Handlebars.compile('{{title}}'),

      model: null,

      render: function() {
         this.$el.html(this.template(this.model.attributes));
         return this;
      }
   });

   Timeline.TimelineView = Backbone.View.extend({
      tagName:   'div',
      className: 'timeline',

      collection:  null,
      _eventViews: [],

      events: {},

      initialize: function(options) {
         _.defaults(options, {collection: null});
         var collection = options.collection;

         this._options = options;
         this._layout  = new Timeline.LayoutEngine();
         this._children = [];

         if (collection) {
            collection.on('add',    this._onEventAdded,   this);
            collection.on('remove', this._onEventRemoved, this);
            collection.on('change', this._onEventChanged, this);
         }
      },

      render: function() {
         var el     = this.el,
         children   = null,
         collection = this._options.collection;

         this._children = children = collection.map(function(event) {
            var view = new Timeline.EventView({model: event});
            el.appendChild(view.render().el);
            return view;
         });

         this._updateLayout();
         return this;
      },

      _updateLayout: function() {
         var me = this;
         setTimeout(function() {
            me._layout.doLayout(me._children);
         });
      },

      _onEventAdded: function(model) {
         console.log('add');
         // Build a new view for this event
         var view = new Timeline.EventView({model: model});
         // Store it for later
         this._eventViews[model.id] = view;
         // Show it to the world
         this.$el.append(view.render().el);
         // Ask the layout engine to move anything that may have issues now.
      },

      _onEventRemoved: function(model) {
         console.log('removed', this.$el);

         this.$el.remove(this._eventViews[model.id].el);
         delete this._eventViews[model.id];
      },

      _onEventChanged: function() {
         console.log('changed');
      }
   });

}(window.Timeline = window.Timeline || {}, window.Handlebars, window._, window.Backbone));
