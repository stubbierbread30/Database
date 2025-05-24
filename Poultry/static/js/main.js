document.querySelectorAll('.icon-click').forEach(icon => {
  icon.addEventListener('click', function () {
    this.classList.add('clicked');
    setTimeout(() => this.classList.remove('clicked'), 200);
  });
});

// Search table function
document.getElementById("searchButton").addEventListener("click", searchTable);
document.getElementById("searchInput").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    searchTable();
  }
});

function searchTable() {
  const input = document.getElementById("searchInput").value.toUpperCase();
  const table = document.getElementById("dataTable");
  const rows = table.getElementsByTagName("tr");
  const noResults = document.getElementById("no-results");
  let visibleCount = 0;

  // Start from 1 to skip header row
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

  // Show no results message if no rows are visible (excluding header)
  noResults.style.display = visibleCount === 0 ? "block" : "none";
  
  // Also show the message if there are no rows at all
  if (rows.length <= 1) {
    noResults.style.display = "block";
  }
}