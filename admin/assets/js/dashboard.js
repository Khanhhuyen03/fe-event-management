var RentalAPI = 'http://localhost:8080/event-management/rentals';
//var CustomerAPI='http://localhost:3000/customer';
function start() {
    getData((rental) => {
        renderSales(rental);
        renderTotalRevenue(rental);
        //renderCustomer(customer); // Gọi đúng hàm với dữ liệu khách hàng
        //updateChart(rental, customer); // Cập nhật biểu đồ
    });
};
start();
function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(RentalAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        // fetch(CustomerAPI, {
        //     headers: {
        //         "Authorization": `Bearer ${token}`,
        //         "Content-Type": "application/json"
        //     }
        // }).then(res => res.json()),
    ])
        .then(([rental]) => {
            callback(rental);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}


//Sale
function renderSales(rental) {
    // Lấy ngày hiện tại
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Tính tổng doanh thu hôm nay
    const todayRevenue = rental.reduce((total, item) => {
        // Chuyển rental_start_time thành định dạng YYYY-MM-DD để so sánh
        const rentalDate = item.rentalStartTime.split('T')[0];

        // Nếu ngày bắt đầu thuê là hôm nay, cộng vào tổng
        if (rentalDate === todayString) {
            return total + item.totalPrice;
        }
        return total;
    }, 0);

    // Cập nhật giá trị lên HTML
    const revenueElement = document.querySelector('.sales-card .ps-3 h6');
    if (revenueElement) {
        // Format số tiền với dấu phân cách hàng nghìn
        revenueElement.textContent = todayRevenue.toLocaleString('vi-VN') + ' VNĐ';
    }
}


//Total revenue
function renderTotalRevenue(rental) {
    // Lấy tháng và năm hiện tại
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11 (0 là tháng 1)
    const currentYear = today.getFullYear();

    // Tính tổng doanh thu trong tháng
    const monthlyRevenue = rental.reduce((total, item) => {
        const rentalDate = new Date(item.rentalStartTime);
        const rentalMonth = rentalDate.getMonth();
        const rentalYear = rentalDate.getFullYear();

        // Nếu cùng tháng và năm với hiện tại, cộng vào tổng
        if (rentalMonth === currentMonth && rentalYear === currentYear) {
            return total + item.totalPrice;
        }
        return total;
    }, 0);

    // Cập nhật giá trị lên HTML
    const revenueElement = document.querySelector('.revenue-card .ps-3 h6');
    if (revenueElement) {
        revenueElement.textContent = monthlyRevenue.toLocaleString('vi-VN') + ' VNĐ';
    }
}


//Customer
function renderCustomer(customer) {
    const currentYear = new Date().getFullYear(); // 2025
    console.log("Năm hiện tại:", currentYear); // Debug năm

    const yearlyCustomers = customer.filter(item => {
        const year = new Date(item.created_at).getFullYear();
        console.log("Khách hàng:", item.name, "Năm:", year); // Debug từng khách
        return year === currentYear;
    }).length;

    console.log("Số khách hàng:", yearlyCustomers); // Debug kết quả

    const customerElement = document.querySelector('.customers-card .ps-3 h6');
    if (customerElement) {
        customerElement.textContent = yearlyCustomers.toLocaleString('vi-VN');
    } else {
        console.log("Không tìm thấy element HTML");
    }
}

//Biểu đồ

function updateChart(rental, customer) {
    // Sắp xếp dữ liệu rental theo thời gian
    const rentalData = rental.map(item => ({
        total_price: item.totalPrice,
        rental_start_time: new Date(item.rentalStartTime)
    }));

    // Sắp xếp dữ liệu rental theo thời gian tăng dần
    rentalData.sort((a, b) => a.rentalStartTime - b.rentalStartTime);

    // Tạo mảng salesData và revenueData từ rental
    const salesData = rentalData.map(item => item.totalPrice);
    const revenueData = rentalData.map(item => item.totalPrice);

    // Đảm bảo có đủ dữ liệu cho mỗi điểm thời gian
    const customersData = rentalData.map((item, index) => {
        // Giả sử mỗi rental là một khách hàng mới (có thể thay đổi tùy vào cách tính)
        return customer.filter(c => {
            const customerYear = new Date(c.createdAt).getFullYear();
            const rentalYear = item.rentalStartTime.getFullYear();
            return customerYear === rentalYear; // Lọc khách hàng trong cùng năm
        }).length;
    });

    // Lấy danh sách thời gian từ rentalData
    const timeCategories = rentalData.map(item => item.rentalStartTime.toISOString());

    // Cập nhật biểu đồ
    const chart = new ApexCharts(document.querySelector("#reportsChart"), {
        series: [{
            name: 'Sales',
            data: salesData,
        }, {
            name: 'Revenue',
            data: revenueData
        }, {
            name: 'Customers',
            data: customersData
        }],
        chart: {
            height: 350,
            type: 'area',
            toolbar: {
                show: false
            },
        },
        markers: {
            size: 4
        },
        colors: ['#4154f1', '#2eca6a', '#ff771d'],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.4,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            type: 'datetime',
            categories: timeCategories // Sử dụng thời gian đã sắp xếp cho trục X
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm'
            },
        }
    });

    chart.render();
}