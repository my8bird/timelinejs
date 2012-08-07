/*global console:true, window:true, setTimeout:true */
;(function(Timeline, Handlebars, _) {
   "use strict";

   function elmBox(elm) {
      var pos = elm.position(),
      x   = pos.left,
      y   = pos.top;

      return {x1: x,
              y1: y,
              x2: x + elm.outerWidth(true),
              y2: y + elm.outerHeight(true)
             };
   }

   Timeline.LayoutEngine = function () {
   };

   _.extend(Timeline.LayoutEngine.prototype, {
      doLayout: function(views) {
         var min_date = views[0].model.get('start'),
         placed_views = [];

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
         var y1 = 0,
         y2     = view.$el.outerHeight(true),
         height = y2,
         p_box, v, i;

         for (i = 0; i < placed.length; i++) {
            v     = placed[i];
            p_box = elmBox(v.$el);

            if ((y1 < p_box.y2) && (y2 > p_box.y1)) { // ! collide
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
            var left2  = v.$el.position().left,
            right2 = left2 + v.$el.outerWidth(true);

            return (left < right2) || (right < left2);
         });

         return _.sortBy(views, function(v) {
            return v.$el.position().top;
         });
      },

      dateToPixel: function(date, min) {
         var pixels_per_day = 200,
         ratio   = 200 / (24 * 60 * 60),
         seconds = (date - min);
         return seconds * ratio;
      }
   });
}(window.Timeline = window.Timeline || {}, window.Handlebars, window._));
