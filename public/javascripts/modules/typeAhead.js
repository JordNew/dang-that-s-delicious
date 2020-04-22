const axios = require('axios');

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function () {  // .on is a bling.js shortcut for .addEventListener
    // if there is no value, quit it
    if(!this.value) {
      searchResults.style.display = 'none'; // hide it
      return;
    }

    // show the search results
    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          console.log('There is something to show!');
        }
      });
  });
};

export default typeAhead;