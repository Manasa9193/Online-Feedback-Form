function createChart(canvasId, label, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Ensure data includes all ratings from 1 to 5
    const allRatings = ['1', '2', '3', '4', '5'];
    const chartData = allRatings.map(rating => data[rating] || 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allRatings,
            datasets: [{
                label: label,
                data: chartData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Bar color
                borderColor: 'rgba(75, 192, 192, 1)', // Bar border color
                borderWidth: 1,
                barPercentage: 0.9,
                categoryPercentage: 0.7
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 10
                    },
                    border: {
                        display: true,
                        color: 'rgba(0, 0, 0, 1)',
                        width: 2
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1, // Ensure y-axis increments by 1
                        precision: 0 // Remove decimal points
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: Math.round,
                    color: 'black'
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}