T = window.Timeline


T.LayoutEngine = () ->

_.extend T.LayoutEngine.prototype,
   doLayout: (views) ->
      min_date     = views[0].model.get('start')
      placed_views = []

      _.each views, (view) =>
         x = @_dateToPixel(view.model.get('start'), min_date)
         # filter out views that will never collide with this
         placed_views = @_filterViewsColliding(placed_views, x, x+view.$el.outerWidth(true))

         # Set X now as no force on earth can change this
         view.$el.css('left', x)

         # Determine the lowest Y value that can paint this element without
         # colliding with others
         view.$el.css('top', @_findBestHeight(placed_views, view))

         # Store the view so that we can test for collisions
         # with later events.
         placed_views.push(view)

   _findBestHeight: (placed, view) ->
      y1 = 0
      y2 = view.$el.outerHeight(true)
      height = y2

      for v in placed
         p_box = T.elmBox(v.$el)

         if (y1 < p_box.y2) and (y2 > p_box.y1) # ! collide
            y1 = p_box.y2
            y2 = y1 + height
         else
            break

      # Send back the first stop where we fit
      return y1

   _filterViewsColliding: (views, left, right) ->
      views = _.filter views, (v) ->
         left2  = v.$el.position().left
         right2 = left2 + v.$el.outerWidth(true)

         # Filter out all views that can not collide with the new one.
         return (left < right2) or (right < left2)

      # Sort the views so that the tops are in order
      return _.sortBy views, (v) -> v.$el.position().top

   _dateToPixel: (date, min) ->
      pixels_per_day = 200
      ratio   = 200 / (24 * 60 * 60)
      seconds = (date - min)

      return seconds * ratio
