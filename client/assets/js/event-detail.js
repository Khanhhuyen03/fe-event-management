let suppliers = [];
const baseImageUrl = "http://localhost:8080/event-management/api/v1/FileUpload/files/";

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return (amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Hàm lấy tên nhà cung cấp
function getSupplierName(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? `${supplier.first_name} ${supplier.last_name}` : "Không xác định";
}

// Hàm gọi API chung
async function fetchData(url, errorMessage) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            }
        });
        if (!response.ok) {
            throw new Error(`${errorMessage}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");

    if (!eventId) {
        document.getElementById("eventName").textContent = "Không tìm thấy sự kiện!";
        document.getElementById("eventDescription").textContent = "Vui lòng quay lại trang danh sách.";
        return;
    }

    try {
        // // 1. Lấy danh sách nhà cung cấp
        // suppliers = await fetchData(
        //     "http://localhost:8080/event-management/users?roleName=SUPPLIER",
        //     "Lỗi khi lấy danh sách nhà cung cấp"
        // ) || [];

        //2. Lấy chi tiết sự kiện (tên, mô tả, hình ảnh)
        const event = await fetchData(
            `http://localhost:8080/event-management/event/${eventId}`
        );
        // const event = fetch(`http://localhost:8080/event-management/event/${eventId}`,
        //     {
        //         headers: {
        //             //"Authorization": `Bearer ${token}`,
        //             "Content-Type": "application/json"
        //         }
        //     })
        //     .then(res => {
        //         if (!res.ok)
        //             throw new Error(`Lỗi EventAPI: ${res.status}`); return res.json();
        //     })
        //     .then(([event]) => {
        //         if (!event) {
        //             document.getElementById("eventName").textContent = "Sự kiện không tồn tại!";
        //             document.getElementById("eventDescription").textContent = "Vui lòng kiểm tra lại.";
        //             return;
        //         }
        //         callback(event);
        //     })
        //     .catch(error => {
        //         console.error("Lỗi khi lấy dữ liệu:", error);
        //         alert("Không thể lấy dữ liệu: " + error.message);
        //     });
        if (!event) {
            document.getElementById("eventName").textContent = "Sự kiện không tồn tại!";
            document.getElementById("eventDescription").textContent = "Vui lòng kiểm tra lại.";
            return;
        }

        // Cập nhật tiêu đề, mô tả và hình ảnh
        document.getElementById("eventName").textContent = event.name || "Không có tiêu đề";
        document.getElementById("eventDescription").textContent = event.description || "Không có mô tả";

        const eventImage = document.getElementById("eventImage");
        const imageFileName = event.img ? event.img.split('/').pop() : null;
        const imageUrl = imageFileName ? `${baseImageUrl}${imageFileName}` : "assets/img/default-image.jpg";
        eventImage.src = imageUrl;
        eventImage.onerror = () => { eventImage.src = "assets/img/default-image.jpg"; };
        eventImage.style.display = "block";

        // // 3. Lấy dữ liệu lịch trình
        // const timeline = await fetchData(
        //     `http://localhost:8080/event-management/timelines/${eventId}`,
        //     "Lỗi khi lấy lịch trình"
        // ) || [];

        // const timelineElement = document.getElementById("eventTimeline");
        // timelineElement.innerHTML = "";
        // if (timeline.length === 0) {
        //     timelineElement.innerHTML = `<li class="list-group-item">Không có thông tin lịch trình</li>`;
        // } else {
        //     timeline.forEach(item => {
        //         const content = typeof item === 'string' ? item : item.content || "Không xác định";
        //         timelineElement.innerHTML += `<li class="list-group-item">${content}</li>`;
        //     });
        // }

        // // 4. Lấy danh sách thiết bị
        // const devices = await fetchData(
        //     `http://localhost:8080/event-management/rentals/event/${eventId}/devices`,
        //     "Lỗi khi lấy danh sách thiết bị"
        // ) || [];

        // const equipmentList = document.getElementById("equipmentList");
        // equipmentList.innerHTML = "";
        // if (devices.length === 0) {
        //     equipmentList.innerHTML = "<tr><td colspan='7'>Không có thiết bị</td></tr>";
        // } else {
        //     devices.forEach(item => {
        //         const deviceImageUrl = item.img ? `${baseImageUrl}${item.img.split('/').pop()}` : "assets/img/default-device.jpg";
        //         const totalPrice = (item.quantity || 0) * (item.hourly_salary || 0);
        //         equipmentList.innerHTML += `
        //             <tr>
        //                 <td><img src="${deviceImageUrl}" onerror="this.src='assets/img/default-device.jpg'" alt="${item.name}" style="max-width: 50px;"></td>
        //                 <td>${item.name || "Không xác định"}</td>
        //                 <td>${item.description || "Không có mô tả"}</td>
        //                 <td>${getSupplierName(item.user_id)}</td>
        //                 <td>${item.quantity || 0}</td>
        //                 <td>${formatCurrency(item.hourly_salary)}</td>
        //                 <td>${formatCurrency(totalPrice)}</td>
        //             </tr>
        //         `;
        //     });
        // }

        // // 5. Lấy danh sách dịch vụ
        // const services = await fetchData(
        //     `http://localhost:8080/event-management/rentals/event/${eventId}/services`,
        //     "Lỗi khi lấy danh sách dịch vụ"
        // ) || [];

        // const serviceList = document.getElementById("serviceList");
        // serviceList.innerHTML = "";
        // if (services.length === 0) {
        //     serviceList.innerHTML = "<tr><td colspan='7'>Không có dịch vụ</td></tr>";
        // } else {
        //     services.forEach(item => {
        //         const serviceImageUrl = item.image ? `${baseImageUrl}${item.image.split('/').pop()}` : "assets/img/default-service.jpg";
        //         const totalPrice = (item.quantity || 0) * (item.hourly_salary || 0);
        //         serviceList.innerHTML += `
        //             <tr>
        //                 <td><img src="${serviceImageUrl}" onerror="this.src='assets/img/default-service.jpg'" alt="${item.name}" style="max-width: 50px;"></td>
        //                 <td>${item.name || "Không xác định"}</td>
        //                 <td>${item.description || "Không có mô tả"}</td>
        //                 <td>${getSupplierName(item.user_id)}</td>
        //                 <td>${item.quantity || 0}</td>
        //                 <td>${formatCurrency(item.hourly_salary)}</td>
        //                 <td>${formatCurrency(totalPrice)}</td>
        //             </tr>
        //         `;
        //     });
        // }

        // 7. Kiểm tra nếu cần mở modal sau khi đăng nhập
        if (localStorage.getItem("openContractAfterLogin") === "true") {
            localStorage.removeItem("openContractAfterLogin");
            openContractModal();
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        document.getElementById("eventName").textContent = "Lỗi tải dữ liệu!";
        document.getElementById("eventDescription").textContent = "Vui lòng thử lại sau.";
        document.getElementById("eventImage").style.display = "none";
    }
});

function checkLoginAndOpenContract() {
    console.log("Nút Đăng ký ngay được nhấn!");
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.setItem("openContractAfterLogin", "true");
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get("id");
        localStorage.setItem("redirectAfterLogin", `event_detail.html?id=${eventId}`);
        window.location.href = "login.html";
    } else {
        openContractModal();
    }
}

function openContractModal() {
    console.log("Mở modal hợp đồng");
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");

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

    // Gửi dữ liệu sự kiện đến contract.html
    iframe.onload = async () => {
        try {
            const event = await fetchData(
                `http://localhost:8080/event-management/event/${eventId}`,
                "Lỗi khi tải chi tiết sự kiện"
            );
            if (event) {
                iframe.contentWindow.postMessage({
                    type: "preloadEvent",
                    event: {
                        id: eventId,
                        name: event.name,
                        description: event.description,
                        img: event.img,
                        device: await fetchData(
                            `http://localhost:8080/event-management/rentals/event/${eventId}/devices`,
                            "Lỗi khi lấy thiết bị"
                        ) || [],
                        service: await fetchData(
                            `http://localhost:8080/event-management/rentals/event/${eventId}/services`,
                            "Lỗi khi lấy dịch vụ"
                        ) || [],
                        locations: await fetchData(
                            `http://localhost:8080/event-management/rentals/event/${eventId}/locations`,
                            "Lỗi khi lấy địa điểm"
                        ) || [],
                        timeline: await fetchData(
                            `http://localhost:8080/event-management/events/${eventId}/timeline`,
                            "Lỗi khi lấy timeline"
                        ) || []
                    }
                }, "*");
            }
        } catch (error) {
            console.error("Lỗi khi gửi dữ liệu sự kiện đến iframe:", error);
        }
    };

    window.addEventListener("message", function closeModal(event) {
        if (event.data === "closeIframe") {
            console.log("Nhận tín hiệu đóng modal");
            modal.hide();
            window.removeEventListener("message", closeModal);
        }
    }, { once: true });
}