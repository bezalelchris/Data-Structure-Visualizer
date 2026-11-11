const barsEl = document.getElementById('bars');
const sizeInput = document.getElementById('size');
const sizeOut = document.getElementById('size-out');
const speedInput = document.getElementById('speed');
const shuffleBtn = document.getElementById('shuffle');
const runBtn = document.getElementById('run');
const cmpEl = document.getElementById('cmp');
const swpEl = document.getElementById('swp');
const bigOEl = document.getElementById('big-o');
const aboutEl = document.getElementById('about');
const algoInputs = document.querySelectorAll('input[name="algo"]');

const ALGOS = {
  bubble: {
    bigO: 'O(n²)',
    about: 'Repeatedly swaps neighbors that are out of order. The largest unsorted value "bubbles" to the end on every pass.',
  },
  selection: {
    bigO: 'O(n²)',
    about: 'Scans for the smallest remaining value and moves it to the front. Few swaps, but always n² comparisons.',
  },
  insertion: {
    bigO: 'O(n²)',
    about: 'Grows a sorted prefix by sliding each new value left into place. Very fast on nearly sorted input.',
  },
  merge: {
    bigO: 'O(n log n)',
    about: 'Splits the array in half, sorts each half, then merges them. Counts writes instead of swaps.',
  },
};

let array = [];
let bars = [];
let running = false;
let stopRequested = false;
let comparisons = 0;
let swaps = 0;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Speed slider 1–100 maps to a delay of ~500ms down to ~1ms.
function delay() {
  const s = +speedInput.value;
  return Math.round(500 * Math.pow(0.93, s));
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, delay()));
}

function selectedAlgo() {
  return document.querySelector('input[name="algo"]:checked').value;
}

function updateStats() {
  cmpEl.textContent = comparisons.toLocaleString();
  swpEl.textContent = swaps.toLocaleString();
}

function describeAlgo() {
  const info = ALGOS[selectedAlgo()];
  bigOEl.textContent = info.bigO;
  aboutEl.textContent = info.about;
}

function render() {
  barsEl.innerHTML = '';
  const max = Math.max(...array);
  bars = array.map((v) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${(v / max) * 100}%`;
    barsEl.appendChild(bar);
    return bar;
  });
}

function setHeight(i) {
  const max = Math.max(...array);
  bars[i].style.height = `${(array[i] / max) * 100}%`;
}

function mark(indices, cls) {
  indices.forEach((i) => bars[i] && bars[i].classList.add(cls));
}

function unmark(indices, cls) {
  indices.forEach((i) => bars[i] && bars[i].classList.remove(cls));
}

function shuffle() {
  const n = +sizeInput.value;
  array = Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
  comparisons = 0;
  swaps = 0;
  updateStats();
  render();
}

async function compare(i, j) {
  comparisons++;
  updateStats();
  mark([i, j], 'compare');
  await sleep();
  unmark([i, j], 'compare');
  if (stopRequested) throw new Error('stopped');
}

async function swap(i, j) {
  swaps++;
  updateStats();
  [array[i], array[j]] = [array[j], array[i]];
  mark([i, j], 'swap');
  setHeight(i);
  setHeight(j);
  await sleep();
  unmark([i, j], 'swap');
}

async function bubbleSort() {
  const n = array.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      await compare(j, j + 1);
      if (array[j] > array[j + 1]) {
        await swap(j, j + 1);
        swapped = true;
      }
    }
    mark([n - i - 1], 'done');
    if (!swapped) break;
  }
}

async function selectionSort() {
  const n = array.length;
  for (let i = 0; i < n; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      await compare(min, j);
      if (array[j] < array[min]) min = j;
    }
    if (min !== i) await swap(i, min);
    mark([i], 'done');
  }
}

async function insertionSort() {
  for (let i = 1; i < array.length; i++) {
    let j = i;
    while (j > 0) {
      await compare(j - 1, j);
      if (array[j - 1] <= array[j]) break;
      await swap(j - 1, j);
      j--;
    }
  }
}

async function mergeSort(lo = 0, hi = array.length - 1) {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  await mergeSort(lo, mid);
  await mergeSort(mid + 1, hi);

  const left = array.slice(lo, mid + 1);
  const right = array.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    await compare(lo + i, mid + 1 + j);
    array[k] = left[i] <= right[j] ? left[i++] : right[j++];
    await write(k++);
  }
  while (i < left.length) { array[k] = left[i++]; await write(k++); }
  while (j < right.length) { array[k] = right[j++]; await write(k++); }
}

async function write(k) {
  swaps++;
  updateStats();
  mark([k], 'swap');
  setHeight(k);
  await sleep();
  unmark([k], 'swap');
  if (stopRequested) throw new Error('stopped');
}

async function finish() {
  const step = reducedMotion ? 0 : Math.max(2, 400 / bars.length);
  for (const bar of bars) {
    bar.classList.add('done');
    if (step) await new Promise((r) => setTimeout(r, step));
  }
}

function setRunning(state) {
  running = state;
  runBtn.textContent = state ? 'Stop' : 'Sort';
  shuffleBtn.disabled = state;
  sizeInput.disabled = state;
  algoInputs.forEach((input) => { input.disabled = state; });
}

async function run() {
  if (running) {
    stopRequested = true;
    return;
  }
  // Start fresh if the array is already sorted from a previous run.
  if (bars.some((b) => b.classList.contains('done'))) shuffle();

  stopRequested = false;
  comparisons = 0;
  swaps = 0;
  updateStats();
  setRunning(true);

  const algo = { bubble: bubbleSort, selection: selectionSort, insertion: insertionSort, merge: mergeSort }[selectedAlgo()];
  try {
    await algo();
    await finish();
  } catch (err) {
    bars.forEach((b) => b.classList.remove('compare', 'swap'));
  } finally {
    setRunning(false);
  }
}

sizeInput.addEventListener('input', () => {
  sizeOut.textContent = sizeInput.value;
  shuffle();
});
shuffleBtn.addEventListener('click', shuffle);
runBtn.addEventListener('click', run);
algoInputs.forEach((input) => input.addEventListener('change', describeAlgo));

describeAlgo();
shuffle();
