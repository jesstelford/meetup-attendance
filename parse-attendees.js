const attendees = require('./meetup-attendees-export.json');

attendees
  .filter(({arrived}) => !!arrived)
  .map(({firstName, lastName}) => `${firstName} ${lastName}`.trim())
  .forEach(name => console.log(name));
