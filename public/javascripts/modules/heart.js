import axios from 'axios';
import { $ } from './bling';

function ajaxHeart (e) {
  e.preventDefault(); // stop default, which is POST
  // instead of having the browser to post data, post data with the following JavaScript:
  console.log('HEART ITTT!!!');
  console.log(this); // this = the heart form tag (being the thing this function is called against)
  axios
   .post(this.action)
   .then(res => {
    const isHearted = this.heart.classList.toggle('heart__button--hearted'); // this.heart = _storeCard.pug > heart form tag (name="heart")
    $('.heart-count').textContent = res.data.hearts.length; // heart counter value === amount of hearts in user hearts array
   })
   .catch(console.error);

}

export default ajaxHeart;