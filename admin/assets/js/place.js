var LocationsAPI = 'http://localhost:3000/location';
var UsersAPI ='http://localhost:3000/user';
function start(){
    getData((locations, users) => {
        renderLocation(locations, users);
    });
    
}
start();
function getData(callback) {
    Promise.all([
        fetch(LocationsAPI).then(res => res.json()),
        fetch(UsersAPI).then(res => res.json()),
    ])
        .then(([locations, users]) => {
            callback(locations, users);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}
//render table data
function renderLocation(locations, users) {
    var listLocationBlock = document.querySelector('#list-place tbody');
    if (!listLocationBlock) return;

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-place')) {
        $('#list-place').DataTable().destroy();
    }

    var htmls = locations.map(function (location) {
        var supplier = users.find(user => user.id === location.user_id);
        var supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : 'Không có nhà cung cấp';

        return `
            <tr class="list-place-${location.id}">
                <td>${location.name}</td>
                <td style="width: 40%;">${location.description || 'Không có mô tả'}</td>
                <td>${location.hourly_rental_fee ? location.hourly_rental_fee.toLocaleString() + " VND" : '0 VND'}</td>
                <td>${location.created_at}</td>
                <td>${supplierName}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${location.id}">Xoá</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listLocationBlock.innerHTML = htmls.join('');

    // Khởi tạo lại DataTables
    $('#list-place').DataTable({
        "order": [[3, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "",//Hiển thị _MENU_ địa điểm",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ địa điểm",
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
    $('#list-place tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện xoá
    $('#list-place tbody').on('click', '.delete-btn', function () {
        let locationId = $(this).data('id');
        handleDeleteLocation(locationId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).click(function () {
        $('.dropdown-content').hide();
    });
}

//Tạo Xoá dich vu
function handleDeleteLocation(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },

    };
    fetch(LocationsAPI + '/' + id, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listLocation = document.querySelector('.list-place-' + id)
            if (listLocation) {
                listLocation.remove();
            }
            alert("Xoá địa điểm thành công!");
        })
        .catch(function () {
            alert("Xoá không thành công!");
        });

}