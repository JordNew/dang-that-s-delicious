const axios = require('axios');

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result"> 
        <strong>${store.name}</strong>
      </a>
    `; // extra suggestion to add into above backticks: <p>${store.description}</p>
  }).join('');
}

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
    // if there is nothing to show, blow it away
    searchResults.innerHTML = '';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
       // console.log('There is something to show!');
          searchResults.innerHTML = searchResultsHTML(res.data); // effectively the same as: const html = searchResultsHTML(res.data);
                                                                                          // searchResults.innerHTML = html;
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
};

export default typeAhead;