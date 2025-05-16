
const tablePart = document.querySelector(".table-part");
const transactionTable = document.getElementById("transaction-table");
if (sessionStorage.getItem("userid") === null) {
    window.location.href = "/login.html";
}
const uname = document.getElementById("Uname");
uname.textContent = sessionStorage.getItem("username").split('@')[0];
document.addEventListener('DOMContentLoaded', () => {
    getTransactions(); // Load transactions when page loads
});

function checkTableScroll() {
    const rowCount = transactionTable.rows.length - 1;
    const maxRowCount = 10;
    if (rowCount > maxRowCount) {
        tablePart.classList.add("scrollable");
    } else {
        tablePart.classList.remove("scrollable");
    }
}
checkTableScroll();

const observer = new MutationObserver(checkTableScroll);
observer.observe(transactionTable, {
    childList: true,
    subtree: true,
});


let transactions = [];
let editedTransaction = null;
async function getTransactions() {
    try {
        const userId = sessionStorage.getItem("userid");

        const response = await fetch(`/transactions?user_id=${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        // Convert string amounts to numbers
        transactions = data.map(transaction => ({
            ...transaction,
            date: new Date(transaction.created_at), // Convert to date object
            amount: parseFloat(transaction.amount) // Convert to number
        }));

        updateTransactionTable();
        updateBalance();
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

async function addTransaction() {
    const descriptionInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type");
    const dateInput = document.getElementById("date");

    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const chosenDate = new Date(dateInput.value);

    descriptionInput.value = "";
    amountInput.value = "";
    dateInput.value = "";

    if (description.trim() === "" || isNaN(amount) || !chosenDate) {
        alert("Please enter valid description, amount, and date.");
        return;
    }

    const transaction = {
        date: chosenDate,
        description: description,
        amount: amount,
        type: type,
        user_id: sessionStorage.getItem("userid"),
    };




    try {
        const response = await fetch("/add-transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add transaction');
        }

        const newTransaction = await response.json();
        transactions.push(newTransaction); // Only push after successful server response

        // Clear inputs
        amountInput.value = "";
        typeInput.value = "";
        descriptionInput.value = "";
        dateInput.value = "";

        // Update UI
        updateTransactionTable();
        updateBalance();

    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }


    // Update the balance
    updateBalance();

    // Update the transaction table
    updateTransactionTable();
}

// Function to delete a transaction
async function deleteTransaction(id) { // Changed from primeId to id
    try {
        const response = await fetch(`/delete-transaction/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete transaction");
        }

        // Only remove from array if delete was successful
        const index = transactions.findIndex(
            (transaction) => transaction.id === id // Changed from primeId to id
        );

        if (index > -1) {
            transactions.splice(index, 1);
        }

        updateBalance();
        updateTransactionTable();
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}
// Function to edit a transaction
function editTransaction(primeId) {
    // Find the transaction with the given primeId
    const transaction = transactions.find(
        (transaction) => transaction.id === primeId
    );

    // Populate the input fields with the transaction details for editing
    document.getElementById("description").value = transaction.description;
    document.getElementById("amount").value = transaction.amount;
    document.getElementById("type").value = transaction.type;

    // Store the current transaction being edited
    editedTransaction = transaction;

    // Show the Save button and hide the Add Transaction button


    // Set the date input value to the chosen date
    const dateInput = document.getElementById("date");
    const chosenDate = new Date(transaction.primeId);
    const formattedDate = formatDate(chosenDate);
    dateInput.value = formattedDate;
}

// Function to save the edited transaction
async function saveTransaction() {
    if (!editedTransaction) {
        return;
    }

    const descriptionInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type");
    const dateInput = document.getElementById("date");

    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const date = dateInput.value;

    // Validate the input
    if (description.trim() === "" || isNaN(amount) || !date) {
        alert("Please fill all fields correctly");
        return;
    }

    try {
        const response = await fetch(`/update-transaction/${editedTransaction.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description,
                amount,
                type,
                date
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update transaction");
        }

        // Update the local transaction
        editedTransaction.description = description;
        editedTransaction.amount = amount;
        editedTransaction.type = type;
        editedTransaction.date = date;

        // Clear the form
        descriptionInput.value = "";
        amountInput.value = "";
        dateInput.value = "";
        editedTransaction = null;

        // Update UI
        updateBalance();
        updateTransactionTable();

        // Reset buttons


    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

function updateBalance() {
    const balanceElement = document.getElementById("balance");
    let balance = 0.0;

    // Calculate the total balance
    transactions.forEach((transaction) => {
        if (transaction.type === "income") {
            balance += transaction.amount;
        } else if (transaction.type === "expense") {
            balance -= transaction.amount;
        }
    });

    // Format the balance with currency symbol
    const currencySelect = document.getElementById("currency");
    const currencyCode = currencySelect.value;
    const formattedBalance = formatCurrency(balance, currencyCode);

    // Update the balance display
    balanceElement.textContent = formattedBalance;

    // Check if the balance is negative or positive
    if (balance < 0) {
        balanceElement.classList.remove("positive-balance");
        balanceElement.classList.add("negative-balance");
    } else {
        balanceElement.classList.remove("negative-balance");
        balanceElement.classList.add("positive-balance");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    // Set initial balance value
    let balance = 0.0;
    updateBalance(balance); // Update the balance display

    // Other code for adding transactions, updating balance, etc.

    // Function to update the balance display
    function updateBalance(balance) {
        const balanceElement = document.getElementById("balance");
        balanceElement.textContent = balance.toFixed(2); // Format balance with 2 decimal places
    }
});
// Function to format currency based on the selected currency code
function formatCurrency(amount, currencyCode) {
    // Define currency symbols and decimal separators for different currency codes
    const currencySymbols = {
        USD: "$",
        EUR: "€",
        INR: "₹",
    };

    const decimalSeparators = {
        USD: ".",
        EUR: ",",
        INR: ".",
    };

    // Get the currency symbol and decimal separator based on the currency code
    const symbol = currencySymbols[currencyCode] || "";
    const decimalSeparator = decimalSeparators[currencyCode] || ".";

    // Format the amount with currency symbol and decimal separator
    const formattedAmount =
        symbol + amount.toFixed(2).replace(".", decimalSeparator);
    return formattedAmount;
}

// Function to format date as DD/MM/YYYY
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Function to update the transaction table
function updateTransactionTable() {
    const transactionTable = document.getElementById("transaction-table");

    // Clear the existing table rows
    while (transactionTable.rows.length > 1) {
        transactionTable.deleteRow(1);
    }

    // Add new rows to the table
    transactions.forEach((transaction) => {
        const newRow = transactionTable.insertRow();

        const dateCell = newRow.insertCell();
        const date = new Date(transaction.date); // Changed from date to created_at
        dateCell.textContent = formatDate(date);

        const descriptionCell = newRow.insertCell();
        descriptionCell.textContent = transaction.description;

        const amountCell = newRow.insertCell();
        const currencySelect = document.getElementById("currency");
        const currencyCode = currencySelect.value;
        const formattedAmount = formatCurrency(transaction.amount, currencyCode);
        amountCell.textContent = formattedAmount;

        const typeCell = newRow.insertCell();
        typeCell.textContent = transaction.type;

        const actionCell = newRow.insertCell();

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("edit-button");
        editButton.addEventListener("click", () =>
            editTransaction(transaction.id) // Changed from primeId to id
        );
        actionCell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", () =>
            deleteTransaction(transaction.id) // Changed from primeId to id
        );
        actionCell.appendChild(deleteButton);
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("save-button");
        // Hide by default
        saveButton.addEventListener("click", () => {
            saveTransaction(transaction.id);

        });
        actionCell.appendChild(saveButton);
    });

}// Event listener for the Add Transaction button

document
    .getElementById("add-transaction-btn")
    .addEventListener("click", addTransaction);

// Event listener for the Save Transaction button
document
    .getElementById("save-transaction-btn")
    .addEventListener("click", saveTransaction);

// Initial update of the balance and transaction table
updateBalance();
updateTransactionTable();

// Function to handle the download of data in PDF and CSV formats
