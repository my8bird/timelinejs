$(document).ready(function() {

   window.MyTimelineView = (function(T) {
      var events, collection, view;

      // Convert the input data into backbone models
      events = _.map(demo.data, function(event) {return new T.Event(event);});

      // Create the collection that will be the base for the view
      collection = new T.EventCollection(events);

      // Construct the view
      // id specifies the dom element to put the timeline in
      // colection is the set of events to show
      view = new T.TimelineView({collection: collection});
      // Render it for the first time
      view.render();
      // Show the timeline
      $(document.body).append(view.el)

      return view;

   }(window.Timeline));
});
