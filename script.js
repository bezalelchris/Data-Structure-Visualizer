const barsContainer = document.getElementById('bars-container');
const algorithmSelect = document.getElementById('algorithm');
const speedInput = document.getElementById('speed');
const sizeInput = document.getElementById('size');
const generateBtn = document.getElementById('generate');
const sortBtn = document.getElementById('sort');

let array = [];
let delay = 200;

// Generate random array
function generateArray(size = 30) {
  array = [];
  barsContainer.innerHTML = '';
  for (let i = 0; i < size; i++) {
    const value = Math.floor(Math.random() * 300) + 10;
    array.push(value);
    const bar = document.createElement('div');
    bar.classList.add('bar');
    bar.style.height = `${value}px`;
    bar.style.width = `${Math.floor(800 / size)}px`;
    barsContainer.appendChild(bar);
  }
}

// Swap two bars in the DOM
function swapBars(i, j) {
  const bars = document.querySelectorAll('.bar');
  let tempHeight = bars[i].style.height;
  bars[i].style.height = bars[j].style.height;
  bars[j].style.height = tempHeight;
}

// Delay function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Bubble Sort
async function bubbleSort() {
  const bars = document.querySelectorAll('.bar');
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      bars[j].style.backgroundColor = 'red';
      bars[j + 1].style.backgroundColor = 'red';
      await sleep(delay);
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapBars(j, j + 1);
      }
      bars[j].style.backgroundColor = 'steelblue';
      bars[j + 1].style.backgroundColor = 'steelblue';
    }
    bars[array.length - i - 1].style.backgroundColor = 'green';
  }
}

// Selection Sort
async function selectionSort() {
  const bars = document.querySelectorAll('.bar');
  for (let i = 0; i < array.length; i++) {
    let minIdx = i;
    bars[minIdx].style.backgroundColor = 'orange';
    for (let j = i + 1; j < array.length; j++) {
      bars[j].style.backgroundColor = 'red';
      await sleep(delay);
      if (array[j] < array[minIdx]) {
        bars[minIdx].style.backgroundColor = 'steelblue';
        minIdx = j;
        bars[minIdx].style.backgroundColor = 'orange';
      } else {
        bars[j].style.backgroundColor = 'steelblue';
      }
    }
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      swapBars(i, minIdx);
    }
    bars[i].style.backgroundColor = 'green';
    if (minIdx !== i) bars[minIdx].style.backgroundColor = 'steelblue';
  }
}

// Handle sort button
sortBtn.addEventListener('click', () => {
  delay = +speedInput.value;
  if (algorithmSelect.value === 'bubble') {
    bubbleSort();
  } else {
    selectionSort();
  }
});

// Regenerate array when user clicks
generateBtn.addEventListener('click', () => {
  generateArray(sizeInput.value);
});

// Regenerate when size slider changes
sizeInput.addEventListener('input', () => {
  generateArray(sizeInput.value);
});

// Initial array
generateArray(sizeInput.value);
