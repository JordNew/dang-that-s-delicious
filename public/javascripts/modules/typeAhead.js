import axios from 'axios';
import dompurify from 'dompurify';

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

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
       // console.log('There is something to show!');
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data)); // effectively the same as: const html = searchResultsHTML(res.data);
          return;                                                                         // searchResults.innerHTML = html;
        }
        // tell user nothing came back (literally: res came back with a length of 0)
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found!</div>`);
      })
      .catch(err => {
        console.error(err);
      });
  });
    // handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // if they aren't pressing up, down or enter, who cares!
    if (![38, 40, 13].includes(e.keyCode)) {
      return;
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`); // class of currently highlighted search result
    const items = search.querySelectorAll('.search__result'); // gives back a node list of ALL search results
    let next; // determines the next search result, when user presses up or down (hence: let, not const, to update variable value)
    
    if (e.keyCode === 40 && current) { // if pressing up AND there is a currently highlighted search result
      next = current.nextElementSibling || items[0]; 
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) { // if pressing down AND there is a currently highlighted search result
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) { // if pressing enter AND there is a highlighted search result that contains a hyperlink      
      window.location = current.href; // go to hyperlink
      return; // 
    }

    console.log(next);
    if (current) {   // if any search result currently has the activeClass, remove it when arrowing up/down,
      current.classList.remove(activeClass); // otherwise multiple results are 'active', which makes no sense
    } 
    next.classList.add(activeClass);  // add activeClass to next
  });
};

export default typeAhead; 