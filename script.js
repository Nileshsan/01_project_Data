document.addEventListener("DOMContentLoaded", fetchEntries);

// Function to add an entry to the table
function addEntryToTable(entry_id, qr_code) {
    let table = document.getElementById("qrTable");
    let row = table.insertRow();

    let idCell = row.insertCell(0);
    idCell.textContent = entry_id;

    let qrCell = row.insertCell(1);
    let img = document.createElement("img");
    img.src = qr_code;
    img.width = 100;
    qrCell.appendChild(img);

    let deleteCell = row.insertCell(2);
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = function() { deleteEntry(entry_id, row); };
    deleteCell.appendChild(deleteBtn);
}

// Function to add an entry (sending data to Flask)
async function addEntry() {
    let idInput = document.getElementById("idInput").value;
    let qrInput = document.getElementById("qrInput").files[0];

    if (!idInput || !qrInput) {
        alert("Please enter an ID and select an image!");
        return;
    }

    let reader = new FileReader();
    reader.onloadend = async function() {
        let qrBase64 = reader.result;

        let response = await fetch('/add_entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entry_id: idInput, qr_code: qrBase64 })
        });

        let result = await response.json();
        if (response.ok) {
            addEntryToTable(idInput, qrBase64);
        } else {
            alert("Error: " + result.message);
        }
    };

    reader.readAsDataURL(qrInput);
}

// Fetch entries from Flask and display them
async function fetchEntries() {
    const response = await fetch('/get_entries');
    const entries = await response.json();

    let tableBody = document.getElementById("qrTable");
    tableBody.innerHTML = "";  

    entries.forEach(entry => {
        addEntryToTable(entry.entry_id, entry.qr_code);
    });
}

// Function to delete an entry
async function deleteEntry(entry_id, row) {
    let response = await fetch(`/delete_entry/${entry_id}`, { method: 'DELETE' });
    if (response.ok) {
        row.remove();
    } else {
        alert("Failed to delete entry.");
    }
}

fetch('https://project-data-qr.onrender.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'value' })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

const API_URL = "https://qr-code-backend.onrender.com";

// Example: adding an entry
fetch(`${API_URL}/add_entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry_id: idInput, qr_code: qrBase64 })
})
.then(response => response.json())
.then(data => {
    // Handle success
})
.catch(error => console.error("Error:", error));
