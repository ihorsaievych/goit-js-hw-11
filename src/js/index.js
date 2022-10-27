import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'notiflix/dist/notiflix-3.2.5.min.css';
import '../css/styles.css';
import '../css/gallery.css';
import { ItemsApi } from './items-api';
import { getItemMarkup } from './markup/get-item-markup';

// Описаний в документації
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";

const galleryRef = document.querySelector('.gallery');
const searchFormRef = document.querySelector('.search-form');
const loadMoreRef = document.querySelector('.load-more');

const itemsApi = new ItemsApi();

searchFormRef.addEventListener('submit', onSearchFormSubmit);
loadMoreRef.addEventListener('click', onLoadMoreClick);

// const { height: cardHeight } = galleryRef.firstElementChild.getBoundingClientRect();

// //console.log(cardHeight);

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: "smooth",
// });

// let gallery_Light = new SimpleLightbox('.gallery', {
//     captionsData: "alt",
//     captionDelay: 250,
//   });
// refresh


async function onSearchFormSubmit(event) {
  event.preventDefault();
  const { value } = event.target.elements.searchQuery;

  await itemsApi
    .fetchItems(value)
    .then(res => {
      removeChildren(galleryRef);
      onSuccessFetchItems(res);
    })
    .catch(err => {
      removeChildren(galleryRef);
      Notify.failure(err.message);
    });

  if (!itemsApi.isLastPage()) {
    loadMoreRef.classList.remove('is-hidden');
  } else {
    loadMoreRef.classList.add('is-hidden');
  }
}

function onSuccessFetchItems(result) {
  renderList(result.data.hits);
}

async function onLoadMoreClick(event) {
  event.preventDefault();
  itemsApi.incrementPage();

  try {
    const res = await itemsApi.fetchItems();
    onSuccessFetchItems(res);
  } catch (err) {
    Notify.failure(err.message);
  }

  if (itemsApi.isLastPage()) {
    loadMoreRef.classList.add('is-hidden');
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    itemsApi.resetPage();
  }
}

function removeChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function renderList(itemList) {
  galleryRef.insertAdjacentHTML('beforeend', getItemListMarkup(itemList));
}

function getItemListMarkup(itemList) {
  return itemList.map(it => getItemMarkup(it)).join('');
}