'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const mobileLayout = window.matchMedia('(max-width: 700px)');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.hidden = mobileLayout.matches;
}

closeMenu();
mobileLayout.addEventListener('change', closeMenu);
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  navigation.hidden = expanded;
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

const filters = document.querySelectorAll('.filter');
const products = document.querySelectorAll('.product');
filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    filters.forEach((button) => {
      const active = button === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    products.forEach((product) => {
      product.hidden = filter.dataset.filter !== 'all' && product.dataset.category !== filter.dataset.filter;
    });
  });
});

const selected = new Set();
const dialog = document.querySelector('#selection-dialog');
const selectionList = document.querySelector('#selection-list');
const selectionCount = document.querySelector('#selection-count');
const clearButton = document.querySelector('#clear-selection');
const toast = document.querySelector('#toast');
let toastTimer;

function announce(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

function updateSelection() {
  selectionCount.textContent = selected.size;
  document.querySelector('.selection-button').setAttribute('aria-label', `Sua seleção: ${selected.size} produtos`);
  document.querySelector('#empty-selection').hidden = selected.size > 0;
  clearButton.disabled = selected.size === 0;
  selectionList.replaceChildren();
  selected.forEach((name) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remover';
    remove.setAttribute('aria-label', `Remover ${name}`);
    remove.addEventListener('click', () => {
      const names = [...selected];
      const index = names.indexOf(name);
      selected.delete(name);
      updateSelection();
      const remaining = selectionList.querySelectorAll('button');
      (remaining[Math.min(index, remaining.length - 1)] || dialog.querySelector('.close-button')).focus();
      announce('Produto removido da seleção.');
    });
    item.append(label, remove);
    selectionList.append(item);
  });
  document.querySelectorAll('.add-button').forEach((button) => {
    const added = selected.has(button.dataset.product);
    button.textContent = added ? '✓' : '↗';
    button.disabled = added;
    button.setAttribute('aria-label', added ? `${button.dataset.product} adicionado à seleção` : `Adicionar ${button.dataset.product} à seleção`);
  });
}

document.querySelectorAll('.add-button').forEach((button) => {
  button.addEventListener('click', () => {
    selected.add(button.dataset.product);
    updateSelection();
    announce(`${button.dataset.product} adicionado à seleção.`);
  });
});
document.querySelector('.selection-button').addEventListener('click', () => dialog.showModal());
dialog.querySelector('.close-button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
clearButton.addEventListener('click', () => {
  selected.clear();
  updateSelection();
  dialog.querySelector('.close-button').focus();
  announce('Seleção limpa.');
});
document.querySelector('#year').textContent = new Date().getFullYear();
updateSelection();
