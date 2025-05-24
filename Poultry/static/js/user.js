document.getElementById("searchButton").addEventListener("click", searchTable);

function searchTable() {
  const input = document.getElementById("searchInput").value.toUpperCase();
  const table = document.getElementById("dataTable");
  const rows = table.getElementsByTagName("tr");
  let visibleCount = 0;

  for (let i = 1; i < rows.length; i++) {
    let visible = false;
    const cells = rows[i].getElementsByTagName("td");

    for (let j = 0; j < cells.length; j++) {
      if (cells[j] && cells[j].innerText.toUpperCase().includes(input)) {
        visible = true;
        break;
      }
    }

    rows[i].style.display = visible ? "" : "none";
    if (visible) visibleCount++;
  }

  document.getElementById("no-results").style.display = visibleCount === 0 ? "block" : "none";
}
