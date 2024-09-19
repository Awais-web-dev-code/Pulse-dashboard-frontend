

const SHEET_ID = '1jTwWd2rRJBrffNng67miCHNnMs6MmuwQH9M2oautWDw'; // Replace with your actual sheet ID
const API_KEY = 'AIzaSyAIKw2GkYnyvX0bLrcNkgz7bpYkAN7crL8'; // Replace with your actual API Key
const SHEET_NAME = 'Data'; // Sheet name containing the data

const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        const rows = data.values;

        // Initialize counters
        let georefMouzaCount = 0;
        let digitizedMouzaCount = 0;

        // Process the rows
        rows.forEach(row => {
            if (row[12] === "COMPLETE") { // Assuming column M (index 12) is for Georef Mouza
                georefMouzaCount++;
            }
            if (row[13] === "COMPLETE") { // Assuming column N (index 13) is for Digitized Mouza
                digitizedMouzaCount++;
            }
        });

        // Static values
        const staticValues = {
            "Total": 2734,  // Total Mouza
            "Received": 2319
        };

        // Calculate the percentage for the percentage bar
        const totalMouza = staticValues["Total"];
        const percentage = ((digitizedMouzaCount / totalMouza) * 100).toFixed(1);

        // Update the cards
        document.querySelector('.overview_card1 h4').textContent = staticValues["Total"];
        document.querySelector('.overview_card2 h4').textContent = staticValues["Received"];
        document.querySelector('.overview_card3 h4').textContent = georefMouzaCount;
        document.querySelector('.overview_card4 h4').textContent = digitizedMouzaCount;
        document.querySelector('.overview_card5 h4').textContent = '30'; // Placeholder for "Rejected" if needed

        // Update the percentage bar
        document.querySelector('.percentageBar_color').style.width = `${percentage}%`;
        document.querySelector('.percentage-text').textContent = `${percentage}%`;
        document.querySelector('.completed-para').textContent = `Completed: ${digitizedMouzaCount} / ${totalMouza}`;

        // Call function to create the bar chart for district data
        createDistrictBarChart(rows);
        createApprovedChart(rows); // Call for checked and approved charts

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function createDistrictBarChart(rows) {
    // Helper function to count completed records based on district and column (M or N)
    const countCompleted = (rows, district, columnIndex) => {
        return rows.filter(row => row[3] === district && row[columnIndex] === 'COMPLETE').length;
    };

    // Calculate values for each district
    const rasterAttockDone = countCompleted(rows, 'Attock', 12); // Column M (index 12)
    const vectorAttockDone = countCompleted(rows, 'Attock', 13); // Column N (index 13)
    const rasterJhelumDone = countCompleted(rows, 'Jhelum', 12);
    const vectorJhelumDone = countCompleted(rows, 'Jhelum', 13);
    const rasterChakwalDone = countCompleted(rows, 'Chakwal', 12) + countCompleted(rows, 'Talagang', 12);
    const vectorChakwalDone = countCompleted(rows, 'Chakwal', 13) + countCompleted(rows, 'Talagang', 13);
    const rasterRawalpindiDone = countCompleted(rows, 'Rawalpindi', 12);
    const vectorRawalpindiDone = countCompleted(rows, 'Rawalpindi', 13);

    // Total number of Mouzas for each district
    const totalRasterData = [455, 595, 455, 1229];
    const doneRasterData = [rasterAttockDone, rasterJhelumDone, rasterChakwalDone, rasterRawalpindiDone];

    const totalVectorData = [455, 595, 455, 1229];
    const doneVectorData = [vectorAttockDone, vectorJhelumDone, vectorChakwalDone, vectorRawalpindiDone];

    // Labels for districts
    const districtLabels = ['ATTOCK', 'JHELUM', 'CHAKWAL', 'RAWALPINDI'];




    // Create Bar Chart for R2v perrformance for overview tabwith 


    const ctx = document.getElementById('districtBarChart').getContext('2d');
    const districtBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: districtLabels,
            datasets: [
                {
                    label: 'Total Raster',
                    data: totalRasterData,
                    backgroundColor: 'rgba(173, 216, 230, 0.3)', // Light blue
                    borderColor: 'rgba(173, 216, 230, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Done Raster',
                    data: doneRasterData,
                    backgroundColor: 'rgba(0, 191, 255, 0.8)', // Sky blue
                    borderColor: 'rgba(0, 191, 255, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Total Vector',
                    data: totalVectorData,
                    backgroundColor: 'rgba(216, 191, 216, 0.3)', // Light purple
                    borderColor: 'rgba(216, 191, 216, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Done Vector',
                    data: doneVectorData,
                    backgroundColor: 'rgba(148, 0, 211, 0.8)', // Dark purple
                    borderColor: 'rgba(148, 0, 211, 1)',
                    borderWidth: 1,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Districts'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Mouzas'
                    }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: 'black',
                    formatter: (value, context) => {
                        const label = context.dataset.label;
                        if (label.includes('Done')) {
                            const index = context.dataIndex;
                            const total = label.includes('Raster') ? totalRasterData[index] : totalVectorData[index];
                            return ((value / total) * 100).toFixed(2) + '%'; // Calculate percentage
                        }
                        return null; // No label for 'Total' bars
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Ensure this plugin is loaded
    });
}

function createApprovedChart(rows) {
    // Filter by 'APPROVED' status in column N (index 13)
    const approvedData = rows.filter(row => row[13] === 'APPROVED');
    const checkedData = rows.filter(row => row[13] === 'CHECKED');

    // Update cards for 'Checked' and 'Approved'
    document.querySelector('.approved-card h4').textContent = approvedData.length;
    document.querySelector('.checked-card h4').textContent = checkedData.length;

    // Additional data visualization if required (e.g., pie chart or bar chart for checked/approved by district)
}

// Fetch the data when the script is loaded
fetchData();


// District overview barchart performance from PULSE

document.addEventListener('DOMContentLoaded', function () {
    const districtLabels = ['ATTOCK', 'JHELUM', 'CHAKWAL', 'RAWALPINDI'];

    // Data for Checked Mouzas (RASTER & VECTOR)
    const checkedRasterData = [285, 505, 436, 0];
    const checkedVectorData = [68, 243, 70, 0];

    // Data for PULSE Approved Mouzas (RASTER & VECTOR)
    const approvedRasterData = [164, 386, 355, 0];
    const approvedVectorData = [15, 160, 8, 0];

    // Total Mouzas for RASTER & VECTOR
    const totalRasterData = [447, 588, 459, 887];
    const totalVectorData = [447, 588, 459, 887];

    const getPercentage = (value, total) => (total > 0 ? (value / total * 100).toFixed(2) + '%' : '0%');

    const createHorizontalBarChart = (ctx, labels, rasterData, vectorData, totalRaster, totalVector) => {
        return new Chart(ctx, {
            type: 'bar', // Use 'bar' for horizontal bars
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Mouza',
                        data: totalRaster,
                        backgroundColor: 'rgba(255, 210, 48 , 0.4)', // Light blue
                        // borderColor: 'rgba(166, 255, 252)',
                        borderWidth: 0.5,
                        barThickness: 20,
                    },
                    {
                        label: 'Checked Raster',
                        data: rasterData,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 0,
                        barThickness: 20,
                    },


                    {
                        label: 'Checked Vector',
                        data: vectorData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 0,
                        barThickness: 20,
                    }


                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y', // Make bars horizontal
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Mouzas'
                        },
                        // Increase space between bars by adjusting the maxBarThickness and grid lines
                        grid: {
                            display: true // Hide grid lines for better spacing
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Districts'
                        },
                        // Increase space between bars by adjusting the bar percentage and category percentage
                        grid: {
                            display: false // Hide grid lines for better spacing
                        },
                        ticks: {
                            padding: 10 // Increase padding between  
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 0,
                        bottom: 0
                    }
                },
                plugins: {
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: 'black',
                        formatter: (value, context) => {
                            const label = context.dataset.label;
                            if (label.includes('Total')) {
                                // Show total numbers at the end of total bars
                                return value;
                            } else if (label.includes('Checked')) {
                                // Show percentage for 'Checked' bars
                                const index = context.dataIndex;
                                const total = label.includes('Raster') ? totalRaster[index] : totalVector[index];
                                return getPercentage(value, total);
                            }
                            return null; // No label for other bars
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    };

    const pulseCheckedCtx = document.getElementById('pulseCheckedBarChart').getContext('2d');
    const pulseApprovedCtx = document.getElementById('pulseApprovedBarChart').getContext('2d');

    createHorizontalBarChart(pulseCheckedCtx, districtLabels, checkedRasterData, checkedVectorData, totalRasterData, totalVectorData);
    createHorizontalBarChart(pulseApprovedCtx, districtLabels, approvedRasterData, approvedVectorData, totalRasterData, totalVectorData);
});



// Attock tab stats starts from here

 // Attock barchart performance from r2v

document.addEventListener('DOMContentLoaded', function () {
    // Labels for the districts and tehsils
    const districtTehsilLabels = [
        'ATTOCK', 'PINDI GHEB', 'JAND',
        'HASSAN ABDAL', 'HAZRO', 'FATEH JANG'
    ];

    // Raster and Vector data
    const totalRasterData = [55, 75, 75, 48, 81, 113];  // Total Raster Mouzas
    const doneRasterData = [41, 59, 47, 38, 66, 32];    // Done Raster Mouzas

    const totalVectorData = [55, 75, 75, 48, 81, 113];  // Total Vector Mouzas
    const doneVectorData = [4, 7, 6, 13, 18, 0];        // Done Vector Mouzas

    // Function to calculate the percentage
    const getPercentage = (done, total) => total > 0 ? ((done / total) * 100).toFixed(2) + '%' : '0%';

    // Get the context for the bar chart
    const ctx = document.getElementById('attockR2vChart').getContext('2d');

    // Create the chart
    const attockR2vChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: districtTehsilLabels,
            datasets: [
                {
                    label: 'Total Raster',
                    data: totalRasterData,
                    backgroundColor: 'rgba(173, 216, 230, 0.3)', // Light blue
                    borderColor: 'rgba(173, 216, 230, 1)',
                    borderWidth: 1,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                },
                {
                    label: 'Done Raster',
                    data: doneRasterData,
                    backgroundColor: 'rgba(0, 191, 255, 0.8)', // Sky blue
                    borderColor: 'rgba(0, 191, 255, 1)',
                    borderWidth: 1,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                },
                {
                    label: 'Total Vector',
                    data: totalVectorData,
                    backgroundColor: 'rgba(216, 191, 216, 0.3)', // Light purple
                    borderColor: 'rgba(216, 191, 216, 1)',
                    borderWidth: 1,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                },
                {
                    label: 'Done Vector',
                    data: doneVectorData,
                    backgroundColor: 'rgba(148, 0, 211, 0.8)', // Dark purple
                    borderColor: 'rgba(148, 0, 211, 1)',
                    borderWidth: 1,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Ensures the chart scales properly
            scales: {
                x: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Attock-District'
                    }
                },
                y: {
                    beginAtZero: true,
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Number of Mouzas'
                    }
                }
            },



            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: 'black',
                    formatter: (value, context) => {
                        const label = context.dataset.label;
                        if (label.includes('Done')) {  // Only show percentage for 'Done' bars
                            const index = context.dataIndex;
                            const total = label.includes('Raster') ? totalRasterData[index] : totalVectorData[index];
                            return getPercentage(value, total);
                        }
                        return null; // No label for 'Total' bars
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
});




// Jhelum tab stats starts from here

// Jhelum barchart performance from r2v


document.addEventListener('DOMContentLoaded', function () {
    const tehsilLabels = ['PINDI DADAN KHAN', 'JHELUM', 'DINA', 'SOHAWAH'];

    const totalRasterData = [133, 162, 135, 158]; // Total Raster Mouzas
    const doneRasterData = [111, 143, 112, 147]; // Done Raster Mouzas

    const totalVectorData = [133, 162, 135, 158]; // Total Vector Mouzas
    const doneVectorData = [6, 58, 26, 24];      // Done Vector Mouzas

    const getPercentage = (done, total) => (total > 0 ? (done / total * 100).toFixed(2) + '%' : '0%');

    const ctx = document.getElementById('jhehlumR2vChart').getContext('2d');

    const jhehlumR2vChart = new Chart(ctx, {
        type: 'bar',


        data: {
            labels: tehsilLabels,
            datasets: [
                {
                    label: 'Total Raster',
                    data: totalRasterData,
                    backgroundColor: 'rgba(173, 216, 230, 0.3)', // Light blue
                    borderColor: 'rgba(173, 216, 230, 1)',
                    borderWidth: 1,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                },
                {
                    label: 'Done Raster',
                    data: doneRasterData,
                    backgroundColor: 'rgba(0, 191, 255, 0.8)', // Sky blue
                    borderColor: 'rgba(0, 191, 255, 1)',
                    borderWidth: 1,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                },
                {
                    label: 'Total Vector',
                    data: totalVectorData,
                    backgroundColor: 'rgba(216, 191, 216, 0.3)', // Light purple
                    borderColor: 'rgba(216, 191, 216, 1)',
                    borderWidth: 1,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                },
                {
                    label: 'Done Vector',
                    data: doneVectorData,
                    backgroundColor: 'rgba(148, 0, 211, 0.8)', // Dark purple
                    borderColor: 'rgba(148, 0, 211, 1)',
                    borderWidth: 1,
                    categoryPercentage: 0.8,
                    barPercentage: 0.8,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Jhehlum-District'
                    }
                },
                y: {
                    beginAtZero: true,
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Number of Mouzas'
                    }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: 'black',
                    formatter: (value, context) => {
                        const label = context.dataset.label;
                        if (label.includes('Done')) {  // Only show percentage for 'Done' bars
                            const index = context.dataIndex;
                            const total = label.includes('Raster') ? totalRasterData[index] : totalVectorData[index];
                            return getPercentage(value, total);
                        }
                        return null; // No label for 'Total' bars
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
});






