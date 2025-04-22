let allItems = [];
let allTypes = [];
let allCities = [];
let currentTypeId = null;
let currentCategory = null;
const API_BASE_URL = "http://localhost:8080/event-management";
const IMAGE_BASE_URL = `${API_BASE_URL}/api/v1/FileUpload/files/`;

document.addEventListener("DOMContentLoaded", async function () {
    const preloader = document.getElementById("preloader");
    const floatingBtn = document.querySelector(".floating-register-btn");

    // Hiển thị/ẩn nút nổi khi cuộn
    window.addEventListener("scroll", function () {
        floatingBtn.classList.toggle("visible", window.scrollY > 100);
    });

    try {
        const urlParams = new URLSearchParams(window.location.search);
        currentCategory = urlParams.get("category") || "event";

        // Lấy dữ liệu từ API
        const [cities, types, items] = await Promise.all([
            fetchCities(),
            fetchTypes(),
            fetchItems()
        ]);

        allCities = cities;
        allTypes = types;
        allItems = items;

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

// Lấy danh sách thành phố
async function fetchCities() {
    try {
        const response = await fetch(`${API_BASE_URL}/city`, {
            headers: { Authorization: Bearer `${localStorage.getItem("token")}` }
        });
        if (!response.ok) throw new Error("Lỗi khi lấy danh sách thành phố");
        return await response.json();
    } catch (error) {
        console.error("Lỗi fetchCities:", error);
        return [];
    }
}

// Lấy danh sách loại theo danh mục
async function fetchTypes() {
    try {
        let endpoint;
        if (currentCategory === "event") endpoint = "/event-type";
        else if (currentCategory === "device") endpoint = "/deviceType/list";
        else if (currentCategory === "service") endpoint = "/service-type";
        else if (currentCategory === "location") return [];

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { Authorization: Bearer `${localStorage.getItem("token")}` }
        });
        if (!response.ok) throw new Error(`Lỗi khi lấy danh sách ${currentCategory} types`);
        const types = await response.json();
        if(currentCategory === "device"){
            types=types.data.items;}
        console.log("type: ",types);
        return types.map((type, index) => ({
            id: type.id || index + 1,
            name: type.name
        }));
    } catch (error) {
        console.error("Lỗi fetchTypes:", error);
        return [];
    }
}

// Lấy danh sách mục theo danh mục
async function fetchItems() {
    try {
        let endpoint;
        if (currentCategory === "event") endpoint = "/event";
        else if (currentCategory === "device") endpoint = "/device";
        else if (currentCategory === "service") endpoint = "/service";
        else if (currentCategory === "location") endpoint = "/location";
        else return [];

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { Authorization: Bearer `${localStorage.getItem("token")}` }
        });
        if (!response.ok) throw new Error(`Lỗi khi lấy danh sách ${currentCategory}`);
        return await response.json();
    } catch (error) {
        console.error("Lỗi fetchItems:", error);
        return [];
    }
}

function populateCityFilter(cities) {
    const cityFilter = document.getElementById("cityFilter");
    cityFilter.innerHTML = '<option value="">Tất cả tỉnh</option>';
    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city.id;
        option.textContent = city.name;
        cityFilter.appendChild(option);
    });
}

function populateServicesList(types) {
    const servicesList = document.getElementById("services-list");
    const categoryTitle = document.getElementById("category-title");
    servicesList.innerHTML = "";

    const titles = {
        event: "Danh mục sự kiện",
        device: "Danh mục thiết bị",
        service: "Danh mục dịch vụ",
        location: "Địa điểm"
    };
    categoryTitle.textContent = titles[currentCategory] || "Danh mục";

    if (currentCategory === "service" || currentCategory === "location") {
        servicesList.style.display = "none";
        return;
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

    items.forEach((item, index) => {
        let detailPage = currentCategory === "event" ? "./event-detail.html" : "./item-detail.html";
        let buttonText = "Xem Chi Tiết";
        let itemId = currentCategory === "event" ? item.id : encodeURIComponent(item.name);
        let hoverInfo = "";

        if (currentCategory === "event") {
            hoverInfo = `
                <div class="row propery-info"><div class="col">Địa điểm</div></div>
                <div class="row"><div class="col">${item.location?.name || "Không xác định"}</div></div>
            `;
        } else if (currentCategory === "device") {
            hoverInfo = `
                <div class="row propery-info"><div class="col">Số lượng</div></div>
                <div class="row"><div class="col">${item.quantity || "Không xác định"}</div></div>
            `;
        } else if (currentCategory === "service") {
            hoverInfo = `
                <div class="row propery-info"><div class="col">Chi phí/giờ</div></div>
                <div class="row"><div class="col">${item.hourly_salary ? item.hourly_salary.toLocaleString() + " VNĐ" : "Không xác định"}</div></div>
            `;
        } else if (currentCategory === "location") {
            hoverInfo = `
                <div class="row propery-info"><div class="col">Chi phí thuê/giờ</div></div>
                <div class="row"><div class="col">${item.hourly_rental_fee ? item.hourly_rental_fee.toLocaleString() + " VNĐ" : "Không xác định"}</div></div>
            `;
        }

        const imageFileName = item.img ? item.img.split('/').pop() : null;
        const imageUrl = imageFileName ? `${IMAGE_BASE_URL}${imageFileName}` : '../client/assets/img/events/sk2.jpg';

        const itemCard = `
            <div class="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card">
                    <img src="${imageUrl}" onerror="this.src='../client/assets/img/events/sk2.jpg'" alt="${item.name}" class="img-fluid">
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
            filteredItems = filteredItems.filter(item => item.eventTypeId === currentTypeId);
        } else if (currentCategory === "device") {
            filteredItems = filteredItems.filter(item => item.device_type_id === currentTypeId);
        } else if (currentCategory === "service") {
            filteredItems = filteredItems.filter(item => item.service_type_id === currentTypeId);
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
        localStorage.setItem("redirectAfterLogin", `service.html?category=${currentCategory}`);
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