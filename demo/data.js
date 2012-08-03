(function() {
   function getDate(day, hour) {
      return new Date(2012, 6, day, hour || 0).getTime() / 1000;
   }
   window.demo = {
      'data': [
         {start: getDate(1), title: 'first',  id: 0},
         {start: getDate(3), title: 'second also a little long',  id: 1},
         {start: getDate(3, 23), title: 'ydddd', id: 2},
         {start: getDate(3, 2), title: 'second with really long title that makes the box really big', id: 3},
         {start: getDate(4), title: 'second', id: 4},
         {start: getDate(8), title: 'second', id: 5},
         {start: getDate(10), title: 'second', id: 6},
         {start: getDate(15), title: 'second', id: 7}
      ]
   };
}());
