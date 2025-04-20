var LocationsAPI = 'http://localhost:3000/location';
var UsersAPI ='http://localhost:3000/user';
function start(){
    getData((locations, users) => {
        renderLocation(locations, users);
    });
    var editLocationId = localStorage.getItem("editLocationId");
    if (editLocationId && window.location.pathname.includes("detail_location.html")) {
        watchDetailLocation(editLocationId);
    }
    
}
start();
function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(LocationsAPI, {
            headers: {
               "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(UsersAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
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
                <td>${location.address}||"Ko tìm thấy địa chỉ"</td>
                <td>${supplierName}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${location.id}">Xoá</button>
                            <button class="dropdown-item detail-btn" data-id="${location.id}">Xem chi tiết</button>
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
    // Xử lý sự kiện xem chi tiết
    $('#list-place tbody').on('click', '.detail-btn', function () {
        let locationId = $(this).data('id');
        handleDetailLocation(locationId);
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
//Xem chi tiết
function handleDetailLocation(locationId) {
    localStorage.setItem("editLocationId", locationId); // Lưu ID vào localStorage
    window.location.href = "detail_location.html"; // Chuyển đến trang chi tiết
}
function watchDetailLocation(editLocationId) {
    if (!editLocationId) return;

    const imagePreview = document.getElementById("Image"); // Khớp với id trong HTML
    const defaultImagePath = "assets/img/card.jpg";

    // Lấy token từ localStorage
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return;
    }

    // Lấy danh sách người dùng
    fetch(UsersAPI, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(users => {
            // Lấy thông tin địa điểm
            return fetch(`${LocationsAPI}/${editLocationId}`, {
                method: 'GET',
                headers: {
                   'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(location => ({ location, users })); // Trả về cả location và users
        })
        .then(({ location, users }) => {
            // Tìm nhà cung cấp từ users dựa trên location.user_id
            const supplier = users.find(user => user.id === location.user_id);
            const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không xác định";

            // Cập nhật các thẻ <div> với dữ liệu địa điểm
            document.getElementById("name").textContent = location.name || "Không có tên";
            document.getElementById("description").textContent = location.description || "Không có mô tả";
            document.getElementById("address").textContent = location.address || "Không có địa điểm";
            document.getElementById("price").textContent = location.hourly_rental_fee ? `${location.hourly_rental_fee.toLocaleString()} VND` : "Không xác định";
            document.getElementById("supplier").textContent = supplierName;

            // Hiển thị ảnh địa điểm
            if (location.img) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = location.img.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;

                    if (imagePreview) {
                        imagePreview.src = imageUrl;
                        imagePreview.onerror = function () {
                            console.error('Lỗi tải ảnh:', imageUrl);
                            this.src = defaultImagePath;
                        };
                    }
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error);
                    if (imagePreview) imagePreview.src = defaultImagePath;
                }
            } else {
                if (imagePreview) imagePreview.src = defaultImagePath;
            }
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu địa điểm:", error);
            alert("Không thể tải thông tin địa điểm!");
        });
}