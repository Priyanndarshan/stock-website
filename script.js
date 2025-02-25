const hamburgerBtn = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');
const contentWrapper = document.querySelector('.content-wrapper');

hamburgerBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  contentWrapper.classList.toggle('active');
}); 