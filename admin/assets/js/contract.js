var ContractAPI = 'http://localhost:8080/event-management/api/contracts';
//var CustomerAPI = 'http://localhost:3000/customer';
var RentalAPI = 'http://localhost:8080/event-management/rentals';

function start() {
    getData((contract, rental) => {
        renderContracts(contract, rental);
    });

    // Khởi tạo modal
    initializeModal();
}

start();

// function getData(callback) {
//     let token = localStorage.getItem("token"); // Lấy token từ localStorage

//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         return;
//     }

//     Promise.all([
//         fetch(ContractAPI, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),

//         // fetch(CustomerAPI, {
//         //     headers: {
//         //         "Authorization": `Bearer ${token}`,
//         //         "Content-Type": "application/json"
//         //     }
//         // }).then(res => res.json()),

//         fetch(RentalAPI, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),
//     ])
//         .then(([contract, rental]) => {
//             callback(contract, rental);
//         })
//         .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
// }

// Status contract
function getData(callback) {
    let token = localStorage.getItem("token");
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
        })
            .then(res => {
                if (!res.ok) throw new Error(`Lỗi ContractAPI: ${res.status}`);
                return res.json();
            }),
        fetch(RentalAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Lỗi RentalAPI: ${res.status}`);
                return res.json();
            }),
    ])
        .then(([contractData, rentalData]) => {
            // Log phản hồi thô để debug
            console.log("Phản hồi thô ContractAPI:", contractData);
            console.log("Phản hồi thô RentalAPI:", rentalData);

            // Chuẩn hóa dữ liệu hợp đồng
            let contracts = contractData.result || contractData.data?.items || contractData.data || contractData || [];
            if (!Array.isArray(contracts)) {
                contracts = [];
            }

            // Chuẩn hóa dữ liệu rental
            let rentals = Array.isArray(rentalData) ? rentalData : rentalData.data || rentalData.result || [];
            if (!Array.isArray(rentals)) {
                rentals = [];
            }

            console.log("Hợp đồng đã xử lý:", contracts);
            console.log("Rental đã xử lý:", rentals);
            callback(contracts, rentals);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể lấy dữ liệu: " + error.message);
            callback([], []); // Fallback về mảng rỗng
        });
}
// function getData(callback) {
//     let token = localStorage.getItem("token");

//     if (!token) {
//         console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
//         return;
//     }

//     Promise.all([
//         fetch(ContractAPI, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         }).then(res => res.json()),
//     ])
//         .then(([res]) => {
//             console.log("Dữ liệu contract từ API:", res);
//             callback(res.result);
//         })
//         .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
// }
const ContractStatus = {
    Draft: "Draft",
    DepositPaid: "DepositPaid",
    InProgress: "InProgress",
    WaitingPaid: "WaitingPaid",
    Completed: "Completed",
    Cancel: "Cancel",
    AdminCancel: "AdminCancel"
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
// function renderContracts(contracts, rentals) {
//     var listContractsBlock = document.querySelector('#list-contact tbody');
//     if (!listContractsBlock) return;

//     // Hủy DataTables nếu đã khởi tạo
//     if ($.fn.DataTable.isDataTable('#list-contact')) {
//         $('#list-contact').DataTable().destroy();
//     }

//     var htmls = contracts.map(function (contract) {
//         // var customer = customers.find(c => c.id === contract.customer_id);
//         // var customerName = customer ? customer.name : "Không xác định";

//         var rental = rentals.find(r => r.id === contract.rental_id);
//         var totalPrice = rental ? rental.totalPrice.toLocaleString() + " VND" : "0 VND";
//         var rentalStartTime = rental ? new Date(rental.rentalStartTime).toLocaleDateString() : "N/A";
//         var rentalEndTime = rental ? new Date(rental.rentalEndTime).toLocaleDateString() : "N/A";
//         const statusInfo = getStatusInfo(Number(contract.status));

//         return `
//             <tr class="list-contract-${contract.id}">
//                 <td>${contract.name}</td>
//                 <td>Min nè</td>
//                 <td>${totalPrice}</td>
//                 <td>
//                     <span class="status-label" style="color: ${statusInfo.color}; background-color: ${getLighterColor(statusInfo.color)};">
//                         ${statusInfo.text}
//                     </span>
//                 </td>
//                 <td>${rentalStartTime}</td>
//                 <td>${rentalEndTime}</td>
//                 <td>${new Date(contract.created_at).toLocaleDateString()}</td>
//                 <td class="text-center">
//                     <div class="action-dropdown">
//                         <button class="btn btn-light action-btn">...</button>
//                         <div class="dropdown-content">
//                             <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
//                             <button class="dropdown-item update-btn" data-id="${contract.id}">Duyệt hợp đồng</button>
//                             <button class="dropdown-item detail-btn" data-id="${contract.id}">Xem chi tiết</button>
//                         </div>
//                     </div>
//                 </td>
//             </tr>
//         `;
//     });

//     listContractsBlock.innerHTML = htmls.join('');

//     // Khởi tạo lại DataTables
//     $('#list-contact').DataTable({
//         "order": [[6, "desc"]],
//         "language": {
//             "search": "Tìm kiếm:",
//             "lengthMenu": "Hiển thị _MENU_ hợp đồng",
//             "info": "Hiển thị _START_ đến _END_ của _TOTAL_ hợp đồng",
//             "infoEmpty": "Không có dữ liệu",
//             "zeroRecords": "Không tìm thấy kết quả",
//             "paginate": {
//                 "first": "Đầu",
//                 "last": "Cuối",
//                 "next": "Tiếp",
//                 "previous": "Trước"
//             }
//         }
//     });

//     // 🛠 Gán sự kiện dùng delegate để dropdown hoạt động trên tất cả các trang
//     $('#list-contact tbody').on('click', '.action-btn', function (event) {
//         let dropdown = $(this).next('.dropdown-content');
//         $('.dropdown-content').not(dropdown).hide(); // Ẩn dropdown khác
//         dropdown.toggle();
//         event.stopPropagation();
//     });

//     // Xử lý sự kiện hủy
//     $('#list-contact tbody').on('click', '.cancel-btn', function () {
//         let contractId = $(this).data('id');
//         handleCancelContract(contractId);
//     });

//     // Xử lý sự kiện cập nhật (mở modal)
//     $('#list-contact tbody').on('click', '.update-btn', function () {
//         let contractId = $(this).data('id');
//         handleUpdateContract(contractId);
//     });
//     //Xử lý sự kiện xem hợp đồng
//     $('#list-contact tbody').on('click', '.detail-btn', function () {
//         let contractId = $(this).data('id');
//         handleDetailContract(contractId);
//     });

//     // Đóng dropdown khi bấm ra ngoài
//     $(document).click(function () {
//         $('.dropdown-content').hide();
//     });
// }
function renderContracts(contracts, rentals) {
    var listContractsBlock = document.querySelector('#list-contact tbody');
    if (!listContractsBlock) {
        console.warn("Không tìm thấy #list-contact tbody trong DOM");
        return;
    }

    if ($.fn.DataTable.isDataTable('#list-contact')) {
        $('#list-contact').DataTable().destroy();
    }

    if (!Array.isArray(contracts)) {
        console.error("contracts không phải mảng:", contracts);
        listContractsBlock.innerHTML = `<tr><td colspan="8">Không có dữ liệu hợp đồng</td></tr>`;
        return;
    }

    var htmls = contracts.map(function (contract) {
        var rental = rentals.find(r => r.id === contract.rental_id);
        var totalPrice = rental ? rental.totalPrice.toLocaleString() + " VND" : "0 VND";
        var rentalStartTime = rental ? new Date(rental.rentalStartTime).toLocaleDateString() : "N/A";
        var rentalEndTime = rental ? new Date(rental.rentalEndTime).toLocaleDateString() : "N/A";
        const statusInfo = getStatusInfo(contract.status) || { text: "Không xác định", color: "gray" };

        return `
            <tr class="list-contract-${contract.id}">
                <td>${contract.name}</td>
                <td>${contract.customerName}</td>
                <td>${totalPrice}</td>
                <td>
                    <span class="status-label" style="color: ${statusInfo.color}; background-color: ${getLighterColor(statusInfo.color)};">
                        ${statusInfo.text}
                    </span>
                </td>
                <td>${rentalStartTime}</td>
                <td>${rentalEndTime}</td>
                <td>${new Date(contract.created_at || contract.createdAt).toLocaleDateString()}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item cancel-btn" data-id="${contract.id}">Hủy hợp đồng</button>
                            <button class="dropdown-item update-btn" data-id="${contract.id}">Duyệt hợp đồng</button>
                            <button class="dropdown-item detail-btn" data-id="${contract.id}">Xem chi tiết</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listContractsBlock.innerHTML = htmls.join('');

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

    $('#list-contact tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    $('#list-contact tbody').on('click', '.cancel-btn', function () {
        let contractId = $(this).data('id');
        handleCancelContract(contractId);
    });

    $('#list-contact tbody').on('click', '.update-btn', function () {
        let contractId = $(this).data('id');
        handleUpdateContract(contractId);
    });

    $('#list-contact tbody').on('click', '.detail-btn', function () {
        let contractId = $(this).data('id');
        handleDetailContract(contractId);
    });

    $(document).click(function () {
        $('.dropdown-content').hide();
    });
}
//render table data
// function renderContracts(contracts) {
//     var listContractsBlock = document.querySelector('#list-contact tbody');
//     if (!listContractsBlock) return;

//     // Hủy DataTables nếu đã khởi tạo
//     if ($.fn.DataTable.isDataTable('#list-contact')) {
//         $('#list-contact').DataTable().destroy();
//     }

//     var htmls = contracts.map(function (contract) {

//         return `
//             <tr class="list-contract-${contract.id}">
//                 <td>${contract.name}</td>
//                 <td>Minh</td>
//                 <td>5000</td>
//                 <td>${contract.status}</td>
//                 <td>10/8</td>
//                 <td>24/6</td>
//                 <td>${new Date(contract.createdAt).toLocaleDateString()}</td>
//                 <td class="text-center">
//                     <div class="action-dropdown">
//                         <button class="btn btn-light action-btn">...</button>
//                         <div class="dropdown-content">
//                             <button class="dropdown-item delete-btn" data-id="${contract.id}">Xoá</button>
//                         </div>
//                     </div>
//                 </td>
//             </tr>
//         `;
//     });

//     listContractsBlock.innerHTML = htmls.join('');

//     // Khởi tạo lại DataTables
//     $('#list-contact').DataTable({
//         "order": [[6, "desc"]],
//         "language": {
//             "search": "Tìm kiếm:",
//             "lengthMenu": "Hiển thị MENU hợp đồng",
//             "info": "Hiển thị START đến END của TOTAL hợp đồng",
//             "infoEmpty": "Không có dữ liệu",
//             "zeroRecords": "Không tìm thấy kết quả",
//             "paginate": {
//                 "first": "Đầu",
//                 "last": "Cuối",
//                 "next": "Tiếp",
//                 "previous": "Trước"
//             }
//         }
//     });

//     // 🛠 Gán sự kiện dùng delegate để dropdown hoạt động trên tất cả các trang
//     $('#list-contact tbody').on('click', '.action-btn', function (event) {
//         let dropdown = $(this).next('.dropdown-content');
//         $('.dropdown-content').not(dropdown).hide(); // Ẩn dropdown khác
//         dropdown.toggle();
//         event.stopPropagation();
//     });

//     // Xử lý sự kiện xoá
//     $('#list-contact tbody').on('click', '.delete-btn', function () {
//         let contractId = $(this).data('id');
//         handleDeleteContract(contractId);
//     });

//     // Đóng dropdown khi bấm ra ngoài
//     $(document).click(function () {
//         $('.dropdown-content').hide();
//     });
// }

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
        callback(false);
        return;
    }

    // Log dữ liệu gửi đi để debug
    console.log("Cập nhật trạng thái hợp đồng:", { contractId, status });

    fetch(`${ContractAPI}/${contractId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status }) // Status là chuỗi, không cần parseInt
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Lỗi HTTP: ${res.status}`);
            }
            return res.json();

        })
        .then(data => {
            console.log("Phản hồi từ API:", data); // Log phản hồi để debug
            callback(true);
        })
        .catch(error => {
            console.error("Lỗi khi cập nhật trạng thái hợp đồng:", error);
            alert("Lỗi khi cập nhật trạng thái hợp đồng: " + error.message);
            console.log("Cập nhật trạng thái hợp đồng 2:", { contractId, status });
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
//Xem hợp đồng
function handleDetailContract(contractId) {
    localStorage.setItem("editContractId", contractId);
    window.location.href = "detail_contract.html";
}

function watchDetailContract(editContractId) {
    if (!editContractId) {
        console.error("Không có ID hợp đồng để xem chi tiết!");
        return;
    }

    console.log("Xem chi tiết hợp đồng ID:", editContractId);

    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(`http://localhost:8080/event-management/api/contracts/${editContractId}`, { // Đổi endpoint
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`Lỗi khi lấy dữ liệu hợp đồng: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Chuẩn hóa dữ liệu hợp đồng giống getData
            const contract = data.result || data.data || data || {};
            console.log("Dữ liệu hợp đồng:", contract);
            if (!contract.id) {
                throw new Error("Dữ liệu hợp đồng không hợp lệ!");
            }
            return { contract };
        })
        .then(({ contract }) => {
            return fetch(RentalAPI, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error(`Lỗi RentalAPI: ${response.status}`);
                    return response.json();
                })
                .then(rentals => {
                    // Chuẩn hóa rentals giống getData
                    rentals = Array.isArray(rentals) ? rentals : rentals.data || rentals.result || [];
                    return { contract, rentals };
                });
        })
        .then(({ contract, rentals }) => {
            // const customer = customers.find(c => c.id === contract.customer_id);
            // const customerName = customer ? customer.name : "Không xác định";
            // const customerPhone = customer ? customer.phone_number : "N/A";
            // const customerAddress = customer ? customer.address : "N/A";
            console.log("tên hợp đồng:", contract.n);
            const rental = rentals.find(r => r.id === contract.rental_id);
            const totalPrice = rental ? rental.totalPrice.toLocaleString() + " ₫" : "0 ₫";
            const rentalStartTime = rental ? new Date(rental.rentalStartTime).toLocaleDateString() : "N/A";
            const rentalEndTime = rental ? new Date(rental.rentalEndTime).toLocaleDateString() : "N/A";

            // Dùng status dạng chuỗi, thêm fallback
            const statusInfo = getStatusInfo(contract.status) || { text: "Không xác định", color: "gray" };

            // Cập nhật giao diện, giữ nguyên các trường mi đã comment
            document.getElementById("status").textContent = statusInfo.text;
            document.getElementById("name").textContent = contract.name || "Hợp đồng không xác định";
            document.getElementById("RentalStart").textContent = rentalStartTime;
            document.getElementById("RentalEnd").textContent = rentalEndTime;
            document.getElementById("price").textContent = totalPrice;
            document.getElementById("customerName").textContent = contract.customerName || "Khách hàng không xác định";
            document.getElementById("phone").textContent = contract.customerPhone;
            document.getElementById("address").textContent = contract.eventAddress || "Địa chỉ không xác định";

            const statusElement = document.getElementById("status");
            statusElement.style.color = statusInfo.color;
            statusElement.style.backgroundColor = getLighterColor(statusInfo.color);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu chi tiết hợp đồng:", error);
            alert("Không thể tải thông tin hợp đồng!");
        });
}