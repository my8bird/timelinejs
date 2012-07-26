window.Timeline = {};

(function (Timeline, Handlebars) {

}(window.Timeline, window.Handlebars));

(function(Timeline, Backbone) {
   Timeline.Event = Backbone.Model.extend({
   });

   Timeline.EventCollection = Backbone.Collection.extend({
      model: Event,

      comparator: function(event) {
         return event.get('start')
      }
   });

   Timeline.EventView = Backbone.View.extend({
      tagName:   'div',
      className: 'event',

      model: null,

      render: function() {
         this.$el.html(JSON.stringify(this.model.attributes));
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
         var el         = this.el
         ,   collection = this._options.collection;

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

   Timeline.LayoutEngine = function () {
   };

   _.extend(Timeline.LayoutEngine.prototype, {
      doLayout: function(views) {
         var y = 0, min = views[0].model.get('start');

         _.each(views, function(view) {
            var new_y = y + view.$el.outerHeight(true)
            ,   x = this.dateToPixel(view.model.get('start'), min);
            console.log(x);
            view.$el.css('left', x);
            view.$el.css('top', y);
            y  = new_y;
         }, this);
      },

      dateToPixel: function(date, min) {
         var pixels_per_day = 200
         ,   ratio = 200 / (24 * 60 * 60)
         ,   seconds = (date - min);
         return seconds * ratio;
      }
   });

}(window.Timeline, window.Backbone));
