const CONTRACT_API_URL = "http://localhost:8080/event-management/api/contracts";
const RENTAL_API_URL = "http://localhost:8080/event-management/rentals";


const contractsPerPage = 10;
let currentPage = 1;
let contractList = [];
let rental = [];

function getToken() {
    return localStorage.getItem("token");
}

function formatCurrency(value) {
    return value.toLocaleString('vi-VN') + " ₫";
}

function formatDate(date) {
    // Date is already in dd/mm/yyyy format, no conversion needed
    return date || '';
}

function formatStatus(status) {
    switch (status) {
        case "Draft": return '<span class="badge bg-success">Bản Nháp</span>';
        case "DepositPaid": return '<span class="badge bg-info">Đã đặt cọc</span>';
        case "InProgress": return '<span class="badge bg-warning">Đang Thực Hiện</span>';
        case "WaitingPaid": return '<span class="badge bg-primary">Chờ Thanh Toán</span>';
        case "Completed": return '<span class="badge bg-dark">Đã Hoàn Thành</span>';
        case "Cancel": return '<span class="badge bg-dark">Đã hủy</span>';
        case "AdminCancel": return '<span class="badge bg-dark">Đã hủy bởi Admin</span>';

        // default: return '<span class="badge bg-secondary">Unknown</span>';
    }
}

async function fetchData(url, method = "GET", data = null) {
    const token = getToken();
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`${method} failed! Status: ${response.status}`);
    }
    return response.json();
}

async function fetchContractList() {
    try {
        // Lấy dữ liệu song song từ hai API
        let [contractList, rental] = await Promise.all([
            fetchData(CONTRACT_API_URL),
            fetchData(RENTAL_API_URL)
        ]);
        contractList = contractList.result;
        console.log('Dữ liệu contractList:', contractList);
        console.log('Dữ liệu rental:', rental);

        // Ánh xạ contractList thành định dạng mong muốn
        return contractList.map(contract => {
            const rentalMatch = rental.find(r => r.id === contract.rentalId);
            return {
                id: contract.id,
                contractName: contract.name,
                rental: rentalMatch || null,
                totalPrice: rentalMatch && rentalMatch.totalPrice ? rentalMatch.totalPrice.toLocaleString() + " VND" : "0 VND",
                rentalStartTime: rentalMatch && rentalMatch.rentalStartTime
                    ? new Date(rentalMatch.rentalStartTime).toLocaleDateString() : "N/A",
                rentalEndTime: rentalMatch && rentalMatch.rentalEndTime
                    ? new Date(rentalMatch.rentalEndTime).toLocaleDateString() : "N/A",
                status: contract.status || 'Draft'
            };
        });
    } catch (error) {
        console.error(`Lỗi lấy danh sách hợp đồng: ${error.message}`);
        return [];
    }
}

function displayContractList(list, page) {
    const start = (page - 1) * contractsPerPage;
    const end = start + contractsPerPage;
    const displayList = list.slice(start, end);

    const contractTable = document.getElementById("danhSachHopDong");
    contractTable.innerHTML = "";

    //     displayList.forEach((contract, index) => {
    //         const stt = start + index + 1;
    //         const row = `
    //     <tr>
    //         <td>${stt}</td>
    //         <td>${contract.contractName}</td>
    //         <td>${formatCurrency(contract.totalPrice)}</td>
    //         <td>${formatDate(contract.rentalStartTime)} - ${formatDate(contract.rentalEndTime)}</td>
    //         <td>${formatStatus(contract.status)}</td>
    //         <td>
    //             <button class="btn btn-sm" onclick="viewDetails('${contract.id}')"><i class="fas fa-eye"></i>Xem Chi Tiết</button>
    //             <button class="btn btn-sm" onclick="makeDeposit('${contract.id}')"><i class="fas fa-money-bill-wave"></i>Đặt Cọc</button>
    //         </td>
    //     </tr>
    // `;
    //         contractTable.innerHTML += row;
    //     });

    //     updatePagination(list.length);
    displayList.forEach((contract, index) => {
        const stt = start + index + 1;
        let actionButtons = `
                     <button class="btn btn-sm" onclick="viewDetails('${contract.id}')"><i class="fas fa-eye"></i>Xem Chi Tiết</button>
                `;
        if (contract.status === "Draft") {
            actionButtons += `
                         <button class="btn btn-sm" onclick="makeDeposit('${contract.id}')"><i class="fas fa-money-bill-wave"></i>Đặt Cọc</button>
         
                        `;
        } else if (contract.status === "Completed") {
            actionButtons += `
                         <button class="btn btn-sm" onclick="makeDeposit('${contract.id}')"><i class="fas fa-money-bill-wave"></i>Đã Thanh Toán</button>
                    `;
        } else {
            actionButtons += `
                         <button class="btn btn-sm" onclick="makeDeposit('${contract.id}')"><i class="fas fa-money-bill-wave"></i>Thanh Toán Còn Lại</button>
                    `;
        }

        const row = `
                    <tr>
                        <td>${stt}</td>
                       <td>${contract.contractName}</td>
                        <td>${formatCurrency(contract.totalPrice)}</td>
                        <td>${formatDate(contract.rentalStartTime)} - ${formatDate(contract.rentalEndTime)}</td>
                        <td>${formatStatus(contract.status)}</td>
                        <td>${actionButtons}</td>
                    </tr>
                `;
        contractTable.innerHTML += row;
    });

    updatePagination(list.length);
}

function updatePagination(totalContracts) {
    const totalPages = Math.ceil(totalContracts / contractsPerPage);
    const pagination = document.getElementById("phanTrang");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = "page-item" + (i === currentPage ? " active" : "");
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
}

function changePage(page) {
    currentPage = page;
    const filteredList = filterContractList();
    displayContractList(filteredList, currentPage);
}

function filterContractList() {
    const contractName = document.getElementById("tenHopDong").value.toLowerCase();
    const status = document.getElementById("trangThai").value;

    return contractList.map(contract => ({
        id: contract.id,
        contractName: contract.name,
        rental: rental.find(r => r.id === contract.rentalId),
        totalPrice: rental ? rental.totalPrice.toLocaleString() + " VND" : "0 VND",
        rentalStartTime: rental ? new Date(rental.rentalStartTime).toLocaleDateString() : "N/A",
        rentalEndTime: rental ? new Date(rental.rentalEndTime).toLocaleDateString() : "N/A",
        status: contract.status || 'draft'
    })).filter(contract => {
        const matchesName = contractName === "" || contract.contractName.toLowerCase().includes(contractName);
        const matchesStatus = status === "" || contract.status === status;
        return matchesName && matchesStatus;
    });
}

function searchContracts() {
    currentPage = 1;
    const filteredList = filterContractList();
    displayContractList(filteredList, currentPage);
}

function resetFilters() {
    document.getElementById("tenHopDong").value = "";
    document.getElementById("trangThai").value = "";
    currentPage = 1;
    fetchContractList().then(list => {
        displayContractList(list, currentPage);
    });
}

function viewDetails(contractId) {
    window.location.href = `contractDetail.html?id=${contractId}`;
}

function makeDeposit(contractId) {
    window.location.href = `payment.html?id=${contractId}`;
}

window.onload = async function () {
    const list = await fetchContractList();
    displayContractList(list, currentPage);

    // Listen for messages from the contract creation form
    window.addEventListener('message', function (event) {
        if (event.data.type === 'newContract') {
            const newContract = {
                id: event.data.contract.id,
                contractName: event.data.contract.name,
                value: event.data.contract.total_price,
                validity: {
                    startDate: event.data.contract.rental_start_time,
                    endDate: event.data.contract.rental_end_time
                },
                status: event.data.contract.status
            };
            contractList.push(newContract);
            const filteredList = filterContractList();
            displayContractList(filteredList, currentPage);
        }
    });
};