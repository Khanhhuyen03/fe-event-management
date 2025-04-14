var ContractAPI = 'http://localhost:3000/contract';
var CustomerAPI = 'http://localhost:3000/customer';
var RentalAPI = 'http://localhost:3000/rental';

function start() {
    getData((contract, customer, rental) => {
        renderContracts(contract, customer, rental);
    });

    // Khởi tạo modal
    initializeModal();
}

start();

function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(ContractAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(CustomerAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(RentalAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
    ])
        .then(([contract, customer, rental]) => {
            callback(contract, customer, rental);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

// Status contract
const ContractStatus = {
    Draft: 0,
    DepositPaid: 1,
    InProgress: 2,
    WaitingPaid: 3,
    Completed: 4,
    Cancel: 5,
    AdminCancel: 6
};

function getStatusInfo(status) {
    switch (status) {
        case ContractStatus.Draft:
            return { text: "Nháp", color: "black" };
        case ContractStatus.DepositPaid:
            return { text: "Đã Đặt cọc", color: "green" };
        case ContractStatus.InProgress:
            return { text: "Đang thực hiện", color: "blue" };
        case ContractStatus.WaitingPaid:
            return { text: "Chờ thanh toán", color: "orange" };
        case ContractStatus.Completed:
            return { text: "Hoàn thành", color: "orange" };
        case ContractStatus.Cancel:
            return { text: "Hủy", color: "red" };
        case ContractStatus.AdminCancel:
            return { text: "Bị hủy bởi admin", color: "red" };
        default:
            return { text: "Không xác định", color: "gray" };
    }
}
function getLighterColor(color) {
    const colorMap = {
        black: "rgba(0, 0, 0, 0.1)",
        green: "rgba(68, 158, 68, 0.1)",
        blue: "rgba(94, 163, 206, 0.1)",
        orange: "rgba(206, 159, 73, 0.1)",
        red: "rgba(212, 81, 81, 0.1)",
        gray: "rgba(128, 128, 128, 0.1)"
    };
    return colorMap[color] || "rgba(128, 128, 128, 0.1)"; // Mặc định là màu xám nhạt nếu không xác định
}

// Render table data
function renderContracts(contracts, customers, rentals) {
    var listContractsBlock = document.querySelector('#list-contact tbody');
    if (!listContractsBlock) return;

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-contact')) {
        $('#list-contact').DataTable().destroy();
    }

    var htmls = contracts.map(function (contract) {
        var customer = customers.find(c => c.id === contract.customer_id);
        var customerName = customer ? customer.name : "Không xác định";

        var rental = rentals.find(r => r.id === contract.rental_id);
        var totalPrice = rental ? rental.total_price.toLocaleString() + " VND" : "0 VND";
        var rentalStartTime = rental ? new Date(rental.rental_start_time).toLocaleDateString() : "N/A";
        var rentalEndTime = rental ? new Date(rental.rental_end_time).toLocaleDateString() : "N/A";
        const statusInfo = getStatusInfo(Number(contract.status));

        return `
            <tr class="list-contract-${contract.id}">
                <td>${contract.name}</td>
                <td>${customerName}</td>
                <td>${totalPrice}</td>
                <td>
                    <span class="status-label" style="color: ${statusInfo.color}; background-color: ${getLighterColor(statusInfo.color)};">
                        ${statusInfo.text}
                    </span>
                </td>
                <td>${rentalStartTime}</td>
                <td>${rentalEndTime}</td>
                <td>${new Date(contract.created_at).toLocaleDateString()}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
                            <button class="dropdown-item update-btn" data-id="${contract.id}">Duyệt hợp đồng</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listContractsBlock.innerHTML = htmls.join('');

    // Khởi tạo lại DataTables
    $('#list-contact').DataTable({
        "order": [[6, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ hợp đồng",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ hợp đồng",
            "infoEmpty": "Không có dữ liệu",
            "zeroRecords": "Không tìm thấy kết quả",
            "paginate": {
                "first": "Đầu",
                "last": "Cuối",
                "next": "Tiếp",
                "previous": "Trước"
            }
        }
    });

    // 🛠 Gán sự kiện dùng delegate để dropdown hoạt động trên tất cả các trang
    $('#list-contact tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện hủy
    $('#list-contact tbody').on('click', '.cancel-btn', function () {
        let contractId = $(this).data('id');
        handleCancelContract(contractId);
    });

    // Xử lý sự kiện cập nhật (mở modal)
    $('#list-contact tbody').on('click', '.update-btn', function () {
        let contractId = $(this).data('id');
        handleUpdateContract(contractId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).click(function () {
        $('.dropdown-content').hide();
    });
}

// Khởi tạo modal
function initializeModal() {
    const modalElement = document.getElementById("upgradeRoleModal");
    if (!modalElement) {
        console.error("Lỗi: Không tìm thấy modal.");
        return;
    }

    const modal = new bootstrap.Modal(modalElement);
    let selectedContractId = null;

    window.handleUpdateContract = function (contractId) {
        selectedContractId = contractId;
        modal.show();
    };

    const saveButton = document.getElementById("saveRole");
    saveButton.addEventListener("click", function () {
        const selectedStatus = document.querySelector('input[name="contractStatus"]:checked').value;
        updateContractStatus(selectedContractId, selectedStatus, (success) => {
            modal.hide();
            if (success) {
                alert("Hợp đồng đã được duyệt và sẽ được tiến hành thực hiện.");
            }
        });
    });
}

// Cập nhật trạng thái hợp đồng qua API
function updateContractStatus(contractId, status, callback) {
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(`${ContractAPI}/${contractId}`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: parseInt(status) })
    })
        .then(res => res.json())
        .then(() => {
            callback(true);
        })
        .catch(error => {
            console.error("Lỗi khi cập nhật trạng thái hợp đồng:", error);
            alert("Lỗi khi cập nhật trạng thái hợp đồng!");
            callback(false);
        });
}

// Xử lý mở modal để chọn trạng thái
function handleUpdateContract(contractId) {
    // Gọi hàm window.handleUpdateContract để mở modal
    window.handleUpdateContract(contractId);
}

// Xử lý hủy hợp đồng (chuyển trạng thái sang AdminCancel)
function handleCancelContract(contractId) {
    updateContractStatus(contractId, ContractStatus.AdminCancel, () => {
        alert("Hợp đồng đã bị hủy bởi hệ thống. Trong trường hợp khách hàng đã đặt cọc, tiền đặt cọc sẽ được hoàn trả lại cho khách hàng.");
    });
}