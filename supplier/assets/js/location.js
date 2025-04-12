// Lấy thông tin user từ localStorage
const token = localStorage.getItem("token");
let user;
try {
    user = JSON.parse(localStorage.getItem("user"));
    console.log("Dữ liệu user từ localStorage:", user);
} catch (e) {
    console.error("Dữ liệu user không hợp lệ:", e);
    user = null;
}

var LocationsAPI = 'http://localhost:3000/location'; // Có thể thêm ?user_id=${user.id} nếu API hỗ trợ
function start() {
    getData((locations) => {
        renderLocation(locations);
    });
}
start();
function getData(callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
        // Có thể chuyển hướng đến trang đăng nhập nếu cần
        // window.location.href = "login.html";
        return;
    }

    Promise.all([
        fetch(LocationsAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Location: ${res.status}`);
            return res.json();
        })
    ])
    .then(([locations]) => {
        callback(locations);
    })
    .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

function renderLocation(locations) {
    var listLocationBlock = document.querySelector('#list-place tbody');
    if (!listLocationBlock) {
        console.error("Không tìm thấy #list-place tbody trong DOM");
        return;
    }

    if (!locations || locations.length === 0) {
        console.warn("Danh sách locations rỗng!");
        listLocationBlock.innerHTML = '<tr><td colspan="5">Không có địa điểm nào</td></tr>';
        return;
    }

    // Lọc địa điểm của user hiện tại
    const userLocations = locations.filter(location => String(location.user_id) === String(user.id));
    if (userLocations.length === 0) {
        console.warn("Không có địa điểm nào thuộc về user hiện tại!");
        listLocationBlock.innerHTML = '<tr><td colspan="5">Bạn chưa sở hữu địa điểm nào</td></tr>';
        return;
    }

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-place')) {
        $('#list-place').DataTable().destroy();
    }

    var htmls = userLocations.map(function (location) {
        return `
            <tr class="list-place-${location.id}">
                <td>${location.name || "Không có tên"}</td>
                <td style="width: 40%;">${location.description || 'Không có mô tả'}</td>
                <td>${location.hourly_rental_fee ? location.hourly_rental_fee.toLocaleString() + " VND" : '0 VND'}</td>
                <td>${location.created_at || "Không xác định"}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item update-btn" data-id="${location.id}">Cập nhật</button>
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
            "lengthMenu": "", // Bạn có thể thêm lại "Hiển thị _MENU_ địa điểm" nếu muốn
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

    // Gán sự kiện dùng delegate để dropdown hoạt động trên tất cả các trang
    $('#list-place tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện xóa
    $('#list-place tbody').off('click', '.update-btn').on('click', '.update-btn', function () {
        let locationId = $(this).data('id');
        handleUpdateLocation(locationId); 
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}

