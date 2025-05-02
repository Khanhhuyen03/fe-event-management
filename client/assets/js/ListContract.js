const CONTRACT_API_URL = "https://67eabf6734bcedd95f647797.mockapi.io/Contract";

const contractsPerPage = 10;
let currentPage = 1;
let contractList = [];

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
        case "draft": return '<span class="badge bg-success">Bản Nháp</span>';
        case "deposit_paid": return '<span class="badge bg-info">Đã đặt cọc</span>';
        case "inprogress": return '<span class="badge bg-warning">Đang Thực Hiện</span>';
        case "waiting_paid": return '<span class="badge bg-primary">Chờ Thanh Toán</span>';
        case "completed": return '<span class="badge bg-dark">Đã Hoàn Thành</span>';
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
        contractList = await fetchData(CONTRACT_API_URL);
        return contractList.map(contract => ({
            id: contract.id,
            contractName: contract.name,
            value: contract.total_price || 0,
            validity: {
                startDate: contract.rental_start_time,
                endDate: contract.rental_end_time
            },
            status: contract.status || 'draft'
        }));
    } catch (error) {
        alert(`Error fetching contract list (GET): ${error.message}`);
        return [];
    }
}

function displayContractList(list, page) {
    const start = (page - 1) * contractsPerPage;
    const end = start + contractsPerPage;
    const displayList = list.slice(start, end);

    const contractTable = document.getElementById("danhSachHopDong");
    contractTable.innerHTML = "";

    displayList.forEach((contract, index) => {
        const stt = start + index + 1;
        const row = `
    <tr>
        <td>${stt}</td>
        <td>${contract.contractName}</td>
        <td>${formatCurrency(contract.value)}</td>
        <td>${formatDate(contract.validity.startDate)} - ${formatDate(contract.validity.endDate)}</td>
        <td>${formatStatus(contract.status)}</td>
        <td>
            <button class="btn btn-sm" onclick="viewDetails('${contract.id}')"><i class="fas fa-eye"></i>Xem Chi Tiết</button>
            <button class="btn btn-sm" onclick="makeDeposit('${contract.id}')"><i class="fas fa-money-bill-wave"></i>Đặt Cọc</button>
        </td>
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
        value: contract.total_price || 0,
        validity: {
            startDate: contract.rental_start_time,
            endDate: contract.rental_end_time
        },
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
    window.location.href = `contract_detail.html?id=${contractId}`;
}

function makeDeposit(contractId) {
    window.location.href = `deposit.html?id=${contractId}`;
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