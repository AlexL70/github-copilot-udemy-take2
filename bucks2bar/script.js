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

// Initialize on page load
window.onload = function () {
    initializeRandomData();
    addInputValidation();

    // Add event listener to Chart tab to update chart when activated
    const chartTab = document.getElementById('chart-tab');
    chartTab.addEventListener('shown.bs.tab', function () {
        updateChart();
    });
};
