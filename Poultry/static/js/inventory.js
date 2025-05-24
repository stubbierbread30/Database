document.addEventListener("DOMContentLoaded", () => {
  fetchInventoryData();

  document.getElementById("feedsTable").addEventListener('click', highlightRow);
  document.getElementById("medicineTable").addEventListener('click', highlightRow);
});

function fetchInventoryData() {
  fetch("/inventory/data/")
    .then(response => response.json())
    .then(data => {
      renderTable(data.feeds, "feedsTable", "feed_type", "feed_id");
      renderTable(data.medicines, "medicineTable", "medicine_name", "medicine_id", "expiry_date");
    });
}

function renderTable(items, tableId, nameKey, idKey, dateKey = null) {
  const tableBody = document.getElementById(tableId).querySelector("tbody");
  tableBody.innerHTML = "";
  
  if (items.length === 0) {
    document.getElementById(`${tableId.includes('feed') ? 'feeds' : 'medicine'}-no-results`).style.display = "block";
    return;
  }
  
  document.getElementById(`${tableId.includes('feed') ? 'feeds' : 'medicine'}-no-results`).style.display = "none";

  items.forEach(item => {
    const row = document.createElement("tr");
    row.dataset.id = item[idKey];

    // Name column
    const nameTd = document.createElement("td");
    nameTd.textContent = item[nameKey];
    row.appendChild(nameTd);

    // Quantity column
    const quantityTd = document.createElement("td");
    quantityTd.textContent = item.quantity;
    row.appendChild(quantityTd);

    // Date column (for medicine table)
    if (dateKey && item[dateKey]) {
      const dateTd = document.createElement("td");
      
      // Format the date as a simple string (e.g., "2023-12-31")
      let dateValue = item[dateKey];
      if (typeof dateValue === 'string') {
        // If it's in ISO format (from database), extract the date part
        if (dateValue.includes('T')) {
          dateValue = dateValue.split('T')[0];
        }
        dateTd.textContent = dateValue;
      }
      // If it's a Date object (unlikely in this case)
      else if (dateValue instanceof Date) {
        dateTd.textContent = dateValue.toISOString().split('T')[0];
      }
      else {
        dateTd.textContent = dateValue; // fallback
      }
      
      row.appendChild(dateTd);
    }

    tableBody.appendChild(row);
  });
}

function enableEditing() {
  const table = document.querySelector('.highlight')?.closest('table');
  const rows = table.querySelectorAll("tbody tr");

  rows.forEach(row => {
    row.querySelectorAll('td').forEach(cell => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = cell.textContent;
      cell.innerHTML = '';
      cell.appendChild(input);
    });
  });

  if (!document.getElementById("saveBtn")) {
    const saveBtn = document.createElement("button");
    saveBtn.id = "saveBtn";
    saveBtn.textContent = "Save";
    saveBtn.className = "save-btn";
    saveBtn.onclick = () => saveUpdates(table.id);
    document.querySelector(".main-content").appendChild(saveBtn);
  }
}

function saveUpdates() {
  const csrfToken = getCSRFToken();

  // Handle Feed Table
  const feedRows = document.querySelectorAll('#feedsTable tbody tr');
  const feedData = [];

  feedRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      const feed_type = cells[0].textContent.trim();
      const quantity = parseInt(cells[1].textContent.trim(), 10);
      if (feed_type && !isNaN(quantity)) {
        feedData.push({ feed_type, quantity });
      }
    }
  });

  if (feedData.length > 0) {
    fetch('/inventory/update/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({ type: 'feed', data: feedData })
    });
  }

  // Handle Medicine Table
  const medicineRows = document.querySelectorAll('#medicineTable tbody tr');
  const medicineData = [];

  medicineRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const medicine_name = cells[0].textContent.trim();
      const quantity = parseInt(cells[1].textContent.trim(), 10);
      const expiry_date = cells[2].querySelector('input')?.value;

      if (medicine_name && !isNaN(quantity) && expiry_date) {
        medicineData.push({ medicine_name, quantity, expiry_date });
      }
    }
  });

  if (medicineData.length > 0) {
    fetch('/inventory/update/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({ type: 'medicine', data: medicineData })
    });
  }

  // Remove Save button after submitting
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.remove();
}

function addRow(tableId, type) {
  const table = document.getElementById(tableId).querySelector("tbody");
  const row = document.createElement("tr");

  if (type === "feed") {
    row.innerHTML = `
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
    `;
  } else {
    row.innerHTML = `
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td><input type="date" /></td>
    `;
  }

  table.appendChild(row);
  document.getElementById(`${type}-no-results`).style.display = "none";

  showSaveButton();
}

function addMedicineRow() {
  const tableBody = document.querySelector('#medicineTable tbody');
  const row = document.createElement('tr');
  const today = new Date().toISOString().split('T')[0];

  row.innerHTML = `
    <td contenteditable="true"></td>
    <td contenteditable="true"></td>
    <td><input type="date" min="${today}" /></td>
  `;

  tableBody.appendChild(row);

  if (!document.getElementById('saveBtn')) {
    createSaveButton();
  }
}

function addFeedRow() {
  const tableBody = document.querySelector('#feedsTable tbody');
  const row = document.createElement('tr');

  row.innerHTML = `
    <td contenteditable="true"></td>
    <td contenteditable="true"></td>
  `;

  tableBody.appendChild(row);

  if (!document.getElementById('saveBtn')) {
    createSaveButton();
  }
}


function deleteSelectedRow(tableId) {
  const table = document.getElementById(tableId);
  const selected = table.querySelector('.highlight');
  if (!selected) {
    alert("Please select a row to delete.");
    return;
  }

  const type = tableId === "feedsTable" ? "feed" : "medicine";
  const id = selected.dataset.id;

  if (!id) {
    // Just remove the row if it hasn't been saved yet
    selected.remove();
    return;
  }

  fetch("/inventory/delete/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() },
    body: JSON.stringify({ type, id }),
  }).then(fetchInventoryData);
}

function highlightRow(e) {
  if (e.target.tagName === 'TH') return;
  const table = e.target.closest('table');
  table.querySelectorAll("tr").forEach(tr => tr.classList.remove("highlight"));
  e.target.closest("tr").classList.add("highlight");
}

function getCSRFToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return decodeURIComponent(value);
  }
}

document.querySelectorAll("table").forEach(table => {
  table.addEventListener("click", function (e) {
    if (e.target.tagName === "TH") return;
    const rows = this.querySelectorAll("tbody tr");
    rows.forEach(row => row.classList.remove("highlight"));

    const clickedRow = e.target.closest("tr");
    if (clickedRow) clickedRow.classList.add("highlight");
  });
});

function loadInventoryData() {
  loadTable("feedsTable", initialFeeds, "feed");
  loadTable("medicineTable", initialMedicines, "medicine");
}

function loadTable(tableId, items, type) {
  const table = document.getElementById(tableId).querySelector("tbody");
  table.innerHTML = "";

  if (items.length === 0) {
    document.getElementById(`${type}-no-results`).style.display = "block";
    return;
  }

  document.getElementById(`${type}-no-results`).style.display = "none";

  items.forEach(item => {
    const row = document.createElement("tr");
    row.dataset.id = item[`${type === "feed" ? "feed_id" : "medicine_id"}`];

    if (type === "feed") {
      row.innerHTML = `
        <td contenteditable="true">${item.feed_type}</td>
        <td contenteditable="true">${item.quantity}</td>
      `;
    } else {
      row.innerHTML = `
        <td contenteditable="true">${item.medicine_name}</td>
        <td contenteditable="true">${item.quantity}</td>
        <td><input type="date" value="${item.expiry_date}" /></td>
      `;
    }

    table.appendChild(row);
  });
}

function createSaveButton() {
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.id = 'saveBtn';
  saveBtn.className = 'save-btn';
  saveBtn.onclick = saveUpdates;
  document.querySelector('.main-content').appendChild(saveBtn);
}

document.addEventListener("DOMContentLoaded", () => {
  loadInventoryData();
});