var LocationAPI = 'http://localhost:3000/location'; // Có thể thêm ?user_id=${user.id} nếu API hỗ trợ
var ProvinceAPI = 'http://localhost:3000/provinces';
var DistrictAPI = 'http://localhost:3000/districts';
var WardAPI = 'http://localhost:3000/wards';

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
    getData((locations, provinces, districts, wards) => {
        renderLocation(locations);
        // Populate danh sách tỉnh/thành
        if (document.querySelector("#selectCity")) {
            populateCities(provinces);
        }
        // Lưu dữ liệu quận/huyện, phường/xã vào biến toàn cục để sử dụng sau
        window.districts = districts;
        window.wards = wards;
    });
    handleCreateForm();
    if (document.querySelector('#selectCity')) {
        setupEventListeners();
    }


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
        fetch(LocationAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Location: ${res.status}`);
            return res.json();
        }),
        // Lấy danh sách tỉnh/thành
        fetch(ProvinceAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Provinces: ${res.status}`);
            return res.json();
        }),
        // Lấy danh sách quận/huyện
        fetch(DistrictAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Districts: ${res.status}`);
            return res.json();
        }),
        // Lấy danh sách phường/xã
        fetch(WardAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Wards: ${res.status}`);
            return res.json();
        })
    ])
        .then(([locations, provinces, districts, wards]) => {
            callback(locations, provinces, districts, wards);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

function renderLocation(locations) {
    var listLocationBlock = document.querySelector('#list-place tbody');
    if (!listLocationBlock) return;

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

// Thêm địa điểm
function handleCreateForm() {
    const createBtn = document.querySelector('#create');
    if (!createBtn) return;

    const editLocationId = localStorage.getItem("editLocationId");

    if (editLocationId) {
        loadEditForm(editLocationId); // Gọi hàm cập nhật nếu đang chỉnh sửa
        return;
    }

    createBtn.onclick = function (event) {
        event.preventDefault();

        const pictureInput = document.querySelector('input[name="picture"]');
        const name = document.querySelector('input[name="name"]').value;
        const description = document.querySelector('input[name="description"]').value;
        const price = document.querySelector('input[name="price"]').value;
        const cityElement = document.querySelector('select[name="selectCity"]');
        const districtElement = document.querySelector('select[name="selectDistrict"]');
        const wardElement = document.querySelector('select[name="selectWard"]');
        const street = document.querySelector('input[name="inputStreet"]').value;

        // Validation
        if (!name || !price || !cityElement?.value || !districtElement?.value || !wardElement?.value || !street) {
            alert("Vui lòng nhập đầy đủ thông tin: tên địa điểm, giá, tỉnh/thành, quận/huyện, phường/xã và số nhà, tên đường!");
            return;
        }

        if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
            alert("Vui lòng chọn ảnh cho địa điểm!");
            return;
        }

        // Lấy tên thay vì ID từ dropdown
        const city = cityElement.options[cityElement.selectedIndex]?.text;
        const district = districtElement.options[districtElement.selectedIndex]?.text;
        const ward = wardElement.options[wardElement.selectedIndex]?.text;

        // Create object containing location info
        const locationData = {
            name: name,
            description: description,
            price: parseFloat(price),
            city: city,
            district: district,
            ward: ward,
            street: street
        };

        // Create FormData
        const formData = new FormData();
        formData.append('file', pictureInput.files[0]);
        formData.append('location', new Blob([JSON.stringify(locationData)], {
            type: 'application/json'
        }));

        createLocation(formData, function (locationResponse) {
            console.log("Location vừa tạo có ID:", locationResponse.id);
            console.log("Đã tạo địa điểm thành công:", locationResponse);
            alert("Tạo địa điểm thành công!");
            window.location.href = "location_table.html"; // Chuyển hướng sau khi tạo thành công
        });
    };
}

function createLocation(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");

    fetch(LocationAPI, {
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
        .catch(error => alert(`Lỗi tạo địa điểm: ${error.message}`));
}

// Populate dropdown tỉnh/thành
function populateCities(provinces) {
    const select = document.querySelector('#selectCity');
    if (!select) return; // Tránh lỗi nếu không tìm thấy phần tử
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`;
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province.id;
        option.textContent = province.name;
        select.appendChild(option);
    });
}

// Populate dropdown quận/huyện
function populateDistricts(districts) {
    const select = document.querySelector('#selectDistrict');
    if (!select) return; // Tránh lỗi nếu không tìm thấy phần tử
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`;
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.id;
        option.textContent = district.name;
        select.appendChild(option);
    });
}

// Populate dropdown phường/xã
function populateWards(wards) {
    const select = document.querySelector('#selectWard');
    if (!select) return; // Tránh lỗi nếu không tìm thấy phần tử
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`;
    wards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward.id;
        option.textContent = ward.name;
        select.appendChild(option);
    });
}

// Xử lý sự kiện khi người dùng chọn tỉnh/thành, quận/huyện
function setupEventListeners() {
    const selectCity = document.getElementById("selectCity");
    const selectDistrict = document.getElementById("selectDistrict");

    if (!selectCity || !selectDistrict) return; // Tránh lỗi nếu không tìm thấy phần tử

    selectCity.addEventListener("change", function () {
        const provinceId = this.value;
        if (provinceId) {
            const filteredDistricts = window.districts.filter(d => d.province_id === provinceId);
            populateDistricts(filteredDistricts);
            document.getElementById("selectDistrict").dispatchEvent(new Event("change"));
        } else {
            populateDistricts([]);
            populateWards([]);
        }
    });

    selectDistrict.addEventListener("change", function () {
        const districtId = this.value;
        if (districtId) {
            const filteredWards = window.wards.filter(w => w.district_id === districtId);
            populateWards(filteredWards);
        } else {
            populateWards([]);
        }
    });
}

// Gọi hàm để thiết lập sự kiện (chỉ chạy trên trang form)
