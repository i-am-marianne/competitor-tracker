const fetchAircallUpdates = require('./aircallScraper');

fetchAircallUpdates().then(updates => {
  console.log(updates);
});
