"use strict";

window.Timeline = {};


function elmBox(elm) {
   var pos = elm.position()
   ,   x   = pos.left
   ,   y   = pos.top;
   return {x1: x,
           y1: y,
           x2: x + elm.outerWidth(true),
           y2: y + elm.outerHeight(true)}
}


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
         var el         = this.el
         ,   children   = null
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
         var min_date = views[0].model.get('start')
         ,   placed_views = [];

         _.each(views, function(view) {
            var x = this.dateToPixel(view.model.get('start'), min_date);

            // filter out views that will never collide with this
            placed_views = this._filterViewsColliding(placed_views, x, x+view.$el.outerWidth(true));

            // Set X now as no force on earth can change this
            view.$el.css('left', x);

            // Determine the lowest Y value that can paint this element without
            // colliding with others
            view.$el.css('top', this._findBestHeight(placed_views, view));

            // Store the view so that we can test for collisions
            // with later events.
            placed_views.push(view);
         }, this);
      },

      _findBestHeight: function(placed, view) {
         var y1     = 0
         ,   y2     = view.$el.outerHeight(true)
         ,   height = y2
         ,   p_box, v, i;

         for (i = 0; i < placed.length, v = placed[i]; i++) {
            p_box = elmBox(v.$el);
            if ((y1 < p_box.y2), (y2 > p_box.y1)) { // ! collide
               y1 = p_box.y2;
               y2 = y1 + height;
            }
            else {
               break;
            }
         }

         return y1;
      },

      _filterViewsColliding: function(views, left, right) {
         views = _.filter(views, function(v) {
            var left2  = v.$el.position().left
            ,   right2 = left2 + v.$el.outerWidth(true);

            return (left < right2) || (right < left2);
         });

         return _.sortBy(views, function(v) {
            return v.$el.position().top;
         });
      },

      dateToPixel: function(date, min) {
         var pixels_per_day = 200
         ,   ratio = 200 / (24 * 60 * 60)
         ,   seconds = (date - min);
         return seconds * ratio;
      }
   });

}(window.Timeline, window.Backbone));
