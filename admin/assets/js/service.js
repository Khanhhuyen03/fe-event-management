var ServiceAPI = 'http://localhost:3000/service';
var UsersAPI ='http://localhost:3000/user';
var RoleAPI='http://localhost:3000/role';
function start(){
    getData((services, user, role) => {
        renderServices(services, user, role);
        
    });
    
}
start();
function getData(callback) {
    Promise.all([
        fetch(ServiceAPI).then(res => res.json()),
        fetch(UsersAPI).then(res => res.json()),
        fetch(RoleAPI).then(res => res.json()),
    ])
        .then(([services, users, role]) => {
            callback(services, users, role);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}
//render table data
function renderServices(services, users) {
    var listServicesBlock = document.querySelector('#list-service tbody');
    if (!listServicesBlock) return;

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-service')) {
        $('#list-service').DataTable().destroy();
    }

    var htmls = services.map(function (service) {
        var supplier = users.find(user => user.id === service.user_id);
        var supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : 'Không có nhà cung cấp';

        return `
            <tr class="list-service-${service.id}">
                <td>${service.name}</td>
                <td style="width: 40%;">${service.description || 'Không có mô tả'}</td>
                <td>${service.quantity}</td>
                <td>${service.hourly_salary ? service.hourly_salary.toLocaleString() + " VND" : '0 VND'}</td>
                <td>${service.created_at}</td>
                <td>${supplierName}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${service.id}">Xoá</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listServicesBlock.innerHTML = htmls.join('');

    // Khởi tạo lại DataTables
    var table = $('#list-service').DataTable({
        "order": [[4, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ dịch vụ",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ dịch vụ",
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

    // 🛠 Gán sự kiện dùng delegate để hoạt động trên tất cả các trang
    $('#list-service tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn các dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện xoá
    $('#list-service tbody').on('click', '.delete-btn', function () {
        let serviceId = $(this).data('id');
        handleDeleteService(serviceId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).click(function () {
        $('.dropdown-content').hide();
    });
}

//Tạo Xoá dich vu
function handleDeleteService(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },

    };
    fetch(ServiceAPI + '/' + id, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listService = document.querySelector('.list-service-' + id)
            if (listService) {
                listService.remove();
            }
            alert("Xoá dịch vụ thành công!");
        })
        .catch(function () {
            alert("Xoá không thành công!");
        });

}