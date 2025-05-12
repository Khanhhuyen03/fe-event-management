let allItems = [];
let allTypes = [];
let allCities = [];
let suppliers = [];
let currentTypeId = null;
let currentCategory = null;
let provinces = [];
const PROVINCE_API_URL = 'https://provinces.open-api.vn/api/p';

document.addEventListener("DOMContentLoaded", async function () {
    const preloader = document.getElementById("preloader");
    const floatingBtn = document.querySelector(".floating-register-btn");

    // Hiển thị/ẩn nút nổi khi cuộn
    window.addEventListener("scroll", function () {
        if (window.scrollY > 100) { // Hiển thị sau khi cuộn 100px
            floatingBtn.classList.add("visible");
        } else {
            floatingBtn.classList.remove("visible");
        }
    });

    try {
        const urlParams = new URLSearchParams(window.location.search);
        currentCategory = urlParams.get("category") || "event";
        let endpoint;
        if (currentCategory === "device") {
            endpoint = "http://localhost:8080/event-management/devices/list";
        } else if (currentCategory === "service") {
            endpoint = "http://localhost:8080/event-management/services/list";
        } else if (currentCategory === "location") {
            endpoint = "http://localhost:8080/event-management/locations/list";
        } else if (currentCategory === "event") {
            endpoint = "http://localhost:8080/event-management/event";
        } else {
            throw new Error("Danh mục không hợp lệ");
        }

        // Gọi API dữ liệu chính
        const dataResponse = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!dataResponse.ok) {
            throw new Error(`Lỗi khi lấy dữ liệu chính: ${dataResponse.statusText}`);
        }
        var a = await dataResponse.json();

        if (!(currentCategory === "event")) {
            var data = a.data.items;
            a = data;
        }

        console.log("Dữ liệu API:", a);

        allTypes = getTypesByCategory(a);
        allItems = getItemsByCategory(a);
        console.log("allTypes:", allTypes);
        console.log("allItems:", allItems);

        populateCityFilter(allCities);
        populateServicesList(allTypes);
        filterItems();

        // Kiểm tra nếu cần mở modal sau khi đăng nhập
        if (localStorage.getItem("openContractAfterLogin") === "true") {
            localStorage.removeItem("openContractAfterLogin");
            openContractModal();
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        document.getElementById("item-container").innerHTML = "<p class='text-center'>Lỗi tải dữ liệu! Vui lòng thử lại sau.</p>";
    } finally {
        preloader.style.display = "none";
    }
});

function getTypesByCategory(data) {
    if (currentCategory === "event") {
        const types = Array.isArray(data)
            ? [...new Set(data.map(item => item.eventTypeName))].map((name, index) => ({
                id: index + 1,
                name
            }))
            : [{ id: 1, name: data.eventTypeName }];
        return types;

    } else if (currentCategory === "device") {
        const types = Array.isArray(data)
            ? [...new Set(data.map(item => item.deviceType_name))].map((name, index) => ({
                id: index + 1,
                name
            }))
            : [{ id: 1, name: data.eventTypeName }];
        return types;
    }
    return [];
}

function getItemsByCategory(data) {
    // if (!(currentCategory === "")) {
    //     return Array.isArray(data) ? data : [data];
    // }
    // return [];
    if (!(currentCategory === "")) {
        const items = Array.isArray(data) ? data : [data];
        // Lọc hoặc sửa các item không có img/image
        return items.map(item => ({
            ...item,
            img: item.img || item.image || "", // Đảm bảo luôn có giá trị, mặc định là chuỗi rỗng
            image: item.image || item.img || ""
        }));
    }
    return [];
}

async function populateCityFilter(cities) {
    // const cityFilter = document.getElementById("cityFilter");
    // cityFilter.innerHTML = '<option value="">Tất cả tỉnh</option>';
    // Thêm logic nếu có dữ liệu tỉnh thành
    const provinceResponse = await fetch(PROVINCE_API_URL);
    if (!provinceResponse.ok) {
        throw new Error(`HTTP error! status: ${provinceResponse.status}`);
    }
    provinces = await provinceResponse.json();
    console.log("Dữ liệu Provinces:", provinces);

    const provinceSelect = document.getElementById('cityFilter');
    if (!provinceSelect) {
        console.error("Không tìm thấy phần tử với ID 'province'");
        return;
    }
    provinceSelect.innerHTML = '<option value="">Tỉnh/Thành phố</option>';

    // Thêm các tỉnh thành vào select
    if (Array.isArray(provinces)) {
        provinces.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.code;
            option.textContent = prov.name;
            provinceSelect.appendChild(option);
        });
        console.log("Số lượng tỉnh/thành phố đã thêm vào dropdown:", provinceSelect.options.length - 1);
    } else {
        console.warn("Dữ liệu provinces không phải là mảng:", provinces);
        provinces = [];
    }
}

function populateServicesList(types) {
    const servicesList = document.getElementById("services-list");
    const categoryTitle = document.getElementById("category-title");
    servicesList.innerHTML = "";

    if (currentCategory === "event") {
        categoryTitle.textContent = "Danh mục sự kiện";
    }

    if (!types || types.length === 0) {
        servicesList.innerHTML = "<p>Không có danh mục nào!</p>";
        return;
    }

    const allItem = document.createElement("a");
    allItem.className = currentTypeId === null ? "active" : "";
    allItem.innerHTML = `<i class="bi bi-arrow-right-circle"></i><span>Tất cả</span>`;
    allItem.addEventListener("click", (e) => {
        e.preventDefault();
        selectCategory(null);
    });
    servicesList.appendChild(allItem);

    types.forEach(type => {
        const serviceItem = document.createElement("a");
        serviceItem.className = type.id === currentTypeId ? "active" : "";
        serviceItem.innerHTML = `<i class="bi bi-arrow-right-circle"></i><span>${type.name}</span>`;
        serviceItem.addEventListener("click", (e) => {
            e.preventDefault();
            selectCategory(type.id);
        });
        servicesList.appendChild(serviceItem);
    });
}

function selectCategory(typeId) {
    currentTypeId = typeId;
    const links = document.querySelectorAll("#services-list a");
    links.forEach(link => {
        link.classList.remove("active");
        if ((typeId === null && link.textContent === "Tất cả") ||
            (typeId !== null && link.textContent === allTypes.find(t => t.id === typeId)?.name)) {
            link.classList.add("active");
        }
    });
    filterItems();
}

function displayItems(items) {
    const itemContainer = document.getElementById("item-container");
    itemContainer.innerHTML = "";
    if (!items || items.length === 0) {
        itemContainer.innerHTML = "<p class='text-center'>Không có mục nào!</p>";
        return;
    }

    const baseImageUrl = "http://localhost:8080/event-management/api/v1/FileUpload/files/";

    items.forEach((item, index) => {
        let detailPage = currentCategory === "event" ? "./event-detail.html" : "./item-detail.html";
        let endpoint;
        let buttonText = "Xem Chi Tiết";
        let itemId = item.id;
        let hoverInfo = '';
        if (currentCategory === "event") {
            hoverInfo = `
                    <div class="row"><div class="col">${item.eventTypeName}</div></div>
                `;
        }
        else {
            hoverInfo = `    
                    <div class="row propery-info"><div class="col">Địa điểm</div></div>
                    <div class="row"><div class="col">${item.place || item.address}</div></div>
                `;
        }
        const imageFileName = item.img ? item.img.split('/').pop() : item.image.split('/').pop();
        const imageUrl = imageFileName ? `${baseImageUrl}${imageFileName}` : '../client/assets/img/events/sk2.jpg';
        console.log(`Image URL for event ${item.name}:`, imageUrl);

        const itemCard = `
                    <div class="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="card">
                            <img src="${imageUrl}" 
                                 onerror="this.src='../client/assets/img/events/sk2.jpg'" 
                                 alt="${item.name}" 
                                 class="img-fluid">
                            <div class="card-body">
                                <span class="sale-rent"><a href="${detailPage}?id=${itemId}&category=${currentCategory}">${buttonText}</a></span>
                                <h3><a href="${detailPage}?id=${itemId}&category=${currentCategory}" class="stretched-link">${item.name}</a></h3>
                                <div class="card-content">${hoverInfo}</div>
                            </div>
                        </div>
                    </div>
                `;
        itemContainer.innerHTML += itemCard;
    });
}

function filterItems() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const cityId = document.getElementById("cityFilter").value;
    let filteredItems = allItems;

    if (currentTypeId !== null) {

        if (currentCategory === "event") {
            filteredItems = filteredItems.filter(item => item.eventTypeName === allTypes.find(t => t.id === currentTypeId)?.name);
        } else if (currentCategory === "device") {
            filteredItems = filteredItems.filter(item => item.deviceType_name === allTypes.find(t => t.id === currentTypeId)?.name);
        }

    }

    if (cityId) {
        filteredItems = filteredItems.filter(item => item.city_id == cityId);
    }

    filteredItems = filteredItems.filter(item => {
        return item.name.toLowerCase().includes(searchInput);
    });

    displayItems(filteredItems);
}

function checkLoginAndOpenContract() {
    console.log("Nút Đăng ký được nhấn");
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.setItem("openContractAfterLogin", "true");
        localStorage.setItem("redirectAfterLogin", "service.html?category=event");
        window.location.href = "login.html";
    } else {
        openContractModal();
    }
}

function openContractModal() {
    console.log("Mở modal hợp đồng");
    const iframe = document.getElementById("contractIframe");
    if (!iframe) {
        console.error("Không tìm thấy iframe!");
        return;
    }
    iframe.src = "contract.html";

    const modalElement = document.getElementById("iframeModal");
    if (!modalElement) {
        console.error("Không tìm thấy modal!");
        return;
    }
    const modal = new bootstrap.Modal(modalElement, {});
    modal.show();

    iframe.onload = function () {
        console.log("Iframe loaded");
    };

    window.addEventListener("message", function closeModal(event) {
        if (event.data === "closeIframe") {
            console.log("Nhận tín hiệu đóng modal");
            modal.hide();
            window.removeEventListener("message", closeModal);
        }
    }, { once: true });
}