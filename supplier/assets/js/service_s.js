var ServiceAPI = 'http://localhost:3000/service'; // Có thể thêm ?user_id=${user.id} nếu API hỗ trợ

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

function start() {
    getData((services) => {
        renderServices(services);
    });
    handleCreateForm()
}
start();
function getData(callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(ServiceAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Service: ${res.status}`);
            return res.json();
        })
    ])
    .then(([services]) => {
        callback(services);
    })
    .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

function renderServices(services) {
    var listServicesBlock = document.querySelector('#list-service tbody');
    if (!listServicesBlock) return;

    // Lọc dịch vụ của user hiện tại
    const userServices = services.filter(service => String(service.user_id) === String(user.id));
    if (userServices.length === 0) {
        console.warn("Không có dịch vụ nào thuộc về user hiện tại!");
        listServicesBlock.innerHTML = '<tr><td colspan="7">Bạn chưa sở hữu dịch vụ nào</td></tr>';
        return;
    }

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-service')) {
        $('#list-service').DataTable().destroy();
    }

    var htmls = userServices.map(function (service) {
        return `
            <tr class="list-service-${service.id}">
                <td>${service.name || "Không có tên"}</td>
                <td style="width: 40%;">${service.description || 'Không có mô tả'}</td>
                <td>${service.quantity || 0}</td>
                <td>${service.hourly_salary ? service.hourly_salary.toLocaleString() + " VND" : '0 VND'}</td>
                <td>${service.created_at || "Không xác định"}</td>
                <td>${service.place || "Không xác định"}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item update-btn" data-id="${service.id}">Cập nhật</button>
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

    // Gán sự kiện dùng delegate để hoạt động trên tất cả các trang
    $('#list-service tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    $('#list-service tbody').off('click', '.update-btn').on('click', '.update-btn', function () {
        let serviceId = $(this).data('id');
        handleUpdateService(serviceId); 
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}
// Thêm dịch vụ
function handleCreateForm() {
    var createBtn = document.querySelector('#create');
    if (!createBtn) return;

    var editServiceId = localStorage.getItem("editServiceId");

    if (editServiceId) {
        loadEditForm(editServiceId); // Gọi hàm cập nhật nếu đang chỉnh sửa
        return;
    }

    createBtn.onclick = function (event) {
        event.preventDefault();

        var pictureInput = document.querySelector('input[name="picture"]');
        var name = document.querySelector('input[name="name"]').value;
        var description = document.querySelector('input[name="description"]').value;
        var price = document.querySelector('input[name="price"]').value;
        var quantity = document.querySelector('input[name="quantity"]').value;
        var location = document.querySelector('input[name="location"]').value;

        // Validation
        if (!name || !price || !quantity) {
            alert("Vui lòng nhập đầy đủ tên dịch vụ, tiền công và số lượng!");
            return;
        }

        if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
            alert("Vui lòng chọn ảnh cho dịch vụ!");
            return;
        }

        // Create object containing service info
        const serviceData = {
            name: name,
            description: description,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            location: location
        };

        // Create FormData
        const formData = new FormData();

        // Append file with key 'file'
        formData.append('file', pictureInput.files[0]);

        // Append service data as JSON string with key 'service'
        formData.append('service', new Blob([JSON.stringify(serviceData)], {
            type: 'application/json'
        }));

        createService(formData, function (serviceResponse) {
            console.log("Service vừa tạo có ID:", serviceResponse.id);
            console.log("Đã tạo dịch vụ thành công:", serviceResponse);
            alert("Tạo dịch vụ thành công!");
        });
    };
}

function createService(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");
  
    fetch(ServiceAPI, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(response => {
        if (!response.ok) throw new Error("Lỗi server");
        return response.json();
      })
      .then(data => {
        callback(data.result || data);
      })
      .catch(error => alert(`Lỗi tạo dịch vụ: ${error.message}`));
  }

