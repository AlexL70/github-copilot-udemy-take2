// Array of month abbreviations
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Chart instance
let myChart = null;

// Collect data from input fields
function collectData() {
    const incomeData = [];
    const expenseData = [];

    months.forEach(month => {
        const incomeValue = parseFloat(document.getElementById(`income-${month}`).value) || 0;
        const expenseValue = parseFloat(document.getElementById(`expense-${month}`).value) || 0;

        // Validate non-negative
        incomeData.push(Math.max(0, incomeValue));
        expenseData.push(Math.max(0, expenseValue));
    });

    return { incomeData, expenseData };
}

// Initialize or update the chart
function updateChart() {
    const { incomeData, expenseData } = collectData();
    const ctx = document.getElementById('myChart').getContext('2d');

    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    // Create new chart
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(144, 238, 144, 0.7)', // Light green
                    borderColor: 'rgba(144, 238, 144, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 160, 160, 0.7)', // Light red
                    borderColor: 'rgba(255, 160, 160, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': $' + context.parsed.y;
                        }
                    }
                }
            }
        }
    });
}

// Add input validation to prevent negative values
function addInputValidation() {
    const allInputs = document.querySelectorAll('.income-input, .expense-input');
    allInputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
}

// Generate random initial values for all months
function initializeRandomData() {
    months.forEach(month => {
        // Generate two random values between 50 and 8000
        const value1 = Math.floor(Math.random() * (8000 - 50 + 1)) + 50;
        const value2 = Math.floor(Math.random() * (8000 - 50 + 1)) + 50;

        // Assign larger to income, smaller to expense
        const income = Math.max(value1, value2);
        const expense = Math.min(value1, value2);

        // Set values to input fields
        document.getElementById(`income-${month}`).value = income;
        document.getElementById(`expense-${month}`).value = expense;
    });
}

// Validate username
function validateUsername() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value;
    const errorDiv = document.getElementById('username-error');

    // Validation regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (regex.test(username)) {
        usernameInput.classList.remove('is-invalid');
        usernameInput.classList.add('is-valid');
        errorDiv.style.display = 'none';
        alert('Username is valid: ' + username);
        return true;
    } else {
        usernameInput.classList.remove('is-valid');
        usernameInput.classList.add('is-invalid');
        errorDiv.style.display = 'block';
        return false;
    }
}

// Download chart as PNG
function downloadChartAsPNG() {
    if (!myChart) {
        alert('Please view the chart first before downloading.');
        return;
    }

    // Get the chart as a base64 encoded PNG image
    const imageURL = myChart.toBase64Image();

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'income-expenses-chart.png';

    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize on page load
window.onload = function () {
    initializeRandomData();
    addInputValidation();

    // Add event listener to Chart tab to update chart when activated
    const chartTab = document.getElementById('chart-tab');
    chartTab.addEventListener('shown.bs.tab', function () {
        updateChart();
    });

    // Add event listener to download button
    const downloadBtn = document.getElementById('downloadChart');
    downloadBtn.addEventListener('click', downloadChartAsPNG);

    // Add event listener to submit username button
    const submitUsernameBtn = document.getElementById('submitUsername');
    submitUsernameBtn.addEventListener('click', validateUsername);

    // Add real-time validation feedback on input
    const usernameInput = document.getElementById('username');
    usernameInput.addEventListener('input', function () {
        if (this.value.length > 0) {
            validateUsername();
        }
    });
};
