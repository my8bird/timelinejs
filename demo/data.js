(function() {
   function getDate(day) {
      return new Date(2012, 6, day).getTime() / 1000;
   }
   window.demo = {
      'data': [
         {start: getDate(1), title: 'first',  id: 0},
         {start: getDate(3), title: 'third',  id: 1},
         {start: getDate(2), title: 'second', id: 2}
      ]
   };
}());
