var ContractAPI = 'http://localhost:3000/contract';
var CustomerAPI ='http://localhost:3000/customer';
var RentalAPI = 'http://localhost:3000/rental';
function start(){
    getData((contract, customer, rental) => {
        renderContracts(contract, customer, rental)
        
    });
    
}
start();
function getData(callback) {
    Promise.all([
        fetch(ContractAPI).then(res => res.json()),
        fetch(CustomerAPI).then(res => res.json()),
        fetch(RentalAPI).then(res => res.json()),
    ])
        .then(([contract, customer, rental]) => {
            callback(contract, customer, rental);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}
//render table data
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

        return `
            <tr class="list-contract-${contract.id}">
                <td>${contract.name}</td>
                <td>${customerName}</td>
                <td>${totalPrice}</td>
                <td>${contract.status === 1 ? 'Đặt cọc' : 'Khác'}</td>
                <td>${rentalStartTime}</td>
                <td>${rentalEndTime}</td>
                <td>${new Date(contract.created_at).toLocaleDateString()}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${contract.id}">Xoá</button>
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

    // Xử lý sự kiện xoá
    $('#list-contact tbody').on('click', '.delete-btn', function () {
        let contractId = $(this).data('id');
        handleDeleteContract(contractId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).click(function () {
        $('.dropdown-content').hide();
    });
}


//Tạo Xoá hợp đồng
function handleDeleteContract(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },

    };
    fetch(ContractAPI + '/' + id, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listContract = document.querySelector('.list-contract-' + id)
            if (listContract) {
                listContract.remove();
            }
            alert("Xoá hợp đồng thành công!");
        })
        .catch(function () {
            alert("Xoá không thành công!");
        });

}