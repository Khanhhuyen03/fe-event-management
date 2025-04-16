var ContractAPI = 'http://localhost:3000/contract';
var UserAPI = 'http://localhost:8080/event-management/users';
var RentalAPI = 'http://localhost:3000/rental';
document.addEventListener("DOMContentLoaded", () => {
    fetchContractsAndRenderChart();
});

let contractChartInstance = null;

function fetchContractsAndRenderChart() {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(ContractAPI, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(contracts => {
            const monthlyData = countContractsByMonth(contracts);
            renderBarChart(monthlyData);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu hợp đồng:", error));
}

function countContractsByMonth(contracts) {
    const months = Array(12).fill(0);

    contracts.forEach(contract => {
        const date = new Date(contract.created_at);
        const month = date.getMonth(); // Lấy tháng từ 0 - 11
        months[month]++;
    });

    return months;
}

function renderBarChart(monthlyData) {
    const canvas = document.querySelector('#contactChart');
    if (!canvas) return;

    // Hủy biểu đồ cũ nếu có
    if (contractChartInstance) {
        contractChartInstance.destroy();
    }

    // Màu sắc riêng cho từng tháng
    const backgroundColors = [
        'rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)'
    ];

    const borderColors = [
        'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)',
        'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)',
        'rgb(201, 203, 207)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)',
        'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)'
    ];

    // Tạo biểu đồ mới
    contractChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Số hợp đồng',
                data: monthlyData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
//Thông kê người dùng
document.addEventListener("DOMContentLoaded", () => {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(UserAPI, {
        headers: {
            //"Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(users => {
            const monthlyData = Array(12).fill(0); // Mảng 12 tháng, khởi tạo 0

            users.forEach(user => {
                const month = new Date(user.created_at).getMonth(); // Lấy tháng từ 0-11
                monthlyData[month]++; // Tăng số lượng user trong tháng tương ứng
            });

            new Chart(document.querySelector('#useChart'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Số lượng người dùng',
                        data: monthlyData,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu người dùng:", error));
});


//Thông kê doanh thu
document.addEventListener("DOMContentLoaded", () => {
    fetchRentalsAndRenderChart();
});

let revenueChartInstance = null;
function fetchRentalsAndRenderChart() {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(RentalAPI, {
        headers: {
           // "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(rentals => {
            const monthlyRevenueData = calculateMonthlyRevenue(rentals);
            renderLineChart(monthlyRevenueData);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu rental:", error));
}
function calculateMonthlyRevenue(rentals) {
    const monthlyRevenue = Array(12).fill(0); // Mảng 12 tháng, khởi tạo 0

    rentals.forEach(rental => {
        const rentalDate = new Date(rental.updated_at); // Sử dụng updated_at hoặc created_at tùy theo yêu cầu
        const month = rentalDate.getMonth(); // Lấy tháng từ 0-11
        monthlyRevenue[month] += rental.total_price; // Cộng dồn doanh thu vào tháng tương ứng
    });

    return monthlyRevenue;
}

function renderLineChart(monthlyRevenueData) {
    const canvas = document.querySelector('#revenueChart');
    if (!canvas) return;

    // Hủy biểu đồ cũ nếu có
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    // Tạo biểu đồ mới
    revenueChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Doanh thu hàng tháng',
                data: monthlyRevenueData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}