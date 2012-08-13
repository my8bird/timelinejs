T = window.Timeline


"""
Todo;
Take in views and return only the new [top, left] corners instead of mutating internally.
"""


dateToLeft = (date) ->
   # XXX cache this math
   pixels_per_day = 200
   ratio   = 200 / (24 * 60 * 60)

   return Math.round(date * ratio)


getWidthHeight = (view) ->
   return {
      w: view.$el.outerWidth(true)
      h: view.$el.outerHeight(true)
   }


T.LayoutEngine = () ->

_.extend T.LayoutEngine.prototype,
   doLayout: (minDate, views) ->
      # Find the offset on the X scale so that the first event is at 0
      left = dateToLeft(minDate)

      # Find the x for all views, [int]
      lefts = _.map(views, (v) -> dateToLeft(v.model.get('start')) - left)

      # Pre compute all of the views rects
      rects = _.map(views, getWidthHeight)

      tops = @bestFit(lefts, rects)

      # [ [left, top] ]
      return _.zip(lefts, tops)

   bestFit: (lefts, rects) ->
      placed = []

      tops = _.map lefts, (left, i) =>
         rect = rects[i]
         # filter out views that will never collide with this rect
         placed = @_filterToCollidingX(placed, left, rect.w)

         # Find the best top value for this view.
         top = @_findBestHeight(placed, rect)

         # Store the box for the next rect to check against.
         placed.push({t: top, l: left, w: rect.w, h: rect.h})

         # Since the map is the tops send it back
         return top

      return tops

      _.each views, (view) =>
         left = @_dateToPixel(view.model.get('start') - minDate)

         # filter out views that will never collide with this
         placed_views = @_filterToCollidingX(placed_views, left, box.w)

         # Set X now as no force on earth can change this
         view.$el.css('left', x)

         # Determine the lowest Y value that can paint this element without
         # colliding with others
         view.$el.css('top', @_findBestHeight(placed_views, view))

         # Store the view so that we can test for collisions
         # with later events.
         placed_views.push(view)

   _findBestHeight: (placed, rect) ->
      y1 = 0
      y2 = rect.h
      height = y2

      for box in placed
         if (y1 < (box.t + box.h)) and (y2 > box.t) # ! collide
            y1 = box.t + box.h
            y2 = y1 + height
         else
            break

      # Send back the first stop where we fit
      return y1

   _filterToCollidingX: (boxes, left, width) ->
      right = left + width

      colliding = _.filter boxes, (b) ->
         # Filter out all views that can not collide with the new one.
         return (left < (b.l + b.w)) or (right < b.l)

      # Sort the views so that the tops are in order
      return _.sortBy(colliding, (b) -> b.t)

   _dateToPixel: (date) ->
      # XXX cache this math
      pixels_per_day = 200
      ratio   = 200 / (24 * 60 * 60)

      return date * ratio
