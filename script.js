alert("SCRIPT.JS IS RUNNING");

const calendarGrid =
  document.getElementById("calendarGrid");

if (calendarGrid) {

  for (let i = 1; i <= 42; i++) {

    const cell =
      document.createElement("div");

    cell.textContent =
      i;

    cell.style.border =
      "1px solid #ddd";

    cell.style.padding =
      "10px";

    calendarGrid.appendChild(cell);

  }

}
