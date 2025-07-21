document.addEventListener("DOMContentLoaded", function () {
  // Initialize Fibonacci sequence
  let fibSequence = [1, 1];
  let sequenceIndex = 1;
  const chart = document.getElementById("chart");
  const nextBtn = document.getElementById("nextBtn");
  const resetBtn = document.getElementById("resetBtn");
  const sequenceLength = document.getElementById("sequenceLength");
  const currentNumber = document.getElementById("currentNumber");
  const nextNumber = document.getElementById("nextNumber");

  // Create initial bars
  createBar(0, 1);
  createBar(1, 1);

  // Update info display
  updateInfo();

  // Next button event
  nextBtn.addEventListener("click", generateNext);

  // Reset button event
  resetBtn.addEventListener("click", resetSequence);

  // Generate next Fibonacci number
  function generateNext() {
    sequenceIndex++;

    // Calculate next Fibonacci number
    const nextFib =
      fibSequence[sequenceIndex - 1] + fibSequence[sequenceIndex - 2];
    fibSequence.push(nextFib);

    // Create new bar
    createBar(sequenceIndex, nextFib);

    // Highlight the two previous bars
    highlightBars(sequenceIndex - 2, sequenceIndex - 1);

    // Show plus sign animation
    showPlusAnimation();

    // Update info display
    updateInfo();
  }

  // Create a bar for the chart
  function createBar(index, value) {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.dataset.index = index;

    // Calculate bar height (logarithmic scale to handle large numbers)
    const height = Math.log(value + 1) * 40;
    bar.style.height = `${height}px`;

    // Create bar value display
    const barValue = document.createElement("div");
    barValue.className = "bar-value";
    barValue.textContent = value;
    bar.appendChild(barValue);

    // Create bar label
    const barLabel = document.createElement("div");
    barLabel.className = "bar-label";
    barLabel.textContent = `F${index}`;
    bar.appendChild(barLabel);

    chart.appendChild(bar);
  }

  // Highlight two bars that are being added
  function highlightBars(index1, index2) {
    const bars = document.querySelectorAll(".bar");
    if (bars[index1]) {
      bars[index1].classList.add("highlight");
    }
    if (bars[index2]) {
      bars[index2].classList.add("highlight");
    }

    // Remove highlight after animation completes
    setTimeout(() => {
      if (bars[index1]) bars[index1].classList.remove("highlight");
      if (bars[index2]) bars[index2].classList.remove("highlight");
    }, 1500);
  }

  // Show plus sign animation between highlighted bars
  function showPlusAnimation() {
    const bars = document.querySelectorAll(".bar");
    if (bars.length < 3) return;

    const bar1 = bars[sequenceIndex - 2];
    const bar2 = bars[sequenceIndex - 1];

    const plus = document.createElement("div");
    plus.className = "plus-sign";
    plus.textContent = "+";
    plus.style.left = `${(bar1.offsetLeft + bar2.offsetLeft) / 2}px`;
    plus.style.top = `${Math.min(bar1.offsetTop, bar2.offsetTop) - 50}px`;

    chart.appendChild(plus);

    // Remove plus sign after animation
    setTimeout(() => {
      plus.remove();
    }, 1500);
  }

  // Update information display
  function updateInfo() {
    sequenceLength.textContent = fibSequence.length;
    currentNumber.textContent = fibSequence[sequenceIndex];

    if (sequenceIndex >= 1) {
      nextNumber.textContent =
        fibSequence[sequenceIndex] + fibSequence[sequenceIndex - 1];
    } else {
      nextNumber.textContent = fibSequence[0] + fibSequence[1];
    }
  }

  // Reset sequence to initial state
  function resetSequence() {
    fibSequence = [1, 1];
    sequenceIndex = 1;
    chart.innerHTML = "";
    createBar(0, 1);
    createBar(1, 1);
    updateInfo();
  }
});
