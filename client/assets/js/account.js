let currentUserId = null;
let currentUserData = null;
const defaultAvatar = './assets/img/avatar/avt.jpg';
let isDefaultAvatar = true;

function updateAvatarState(avatarSrc, containerId = 'avatarContainer') {
    const avatarContainer = document.getElementById(containerId);
    isDefaultAvatar = avatarSrc === defaultAvatar;
    if (isDefaultAvatar) {
        avatarContainer.classList.add('default');
    } else {
        avatarContainer.classList.remove('default');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const userData = JSON.parse(localStorage.getItem('user'));
    console.log('userData:', userData); // Debug dữ liệu
    if (!userData) {
        alert('Vui lòng đăng nhập để xem thông tin cá nhân!');
        window.location.href = 'login.html';
        return;
    }

    currentUserId = userData.id;
    currentUserData = userData;

    document.getElementById('email').innerText = userData.email || 'Chưa có thông tin';
    document.getElementById('last_name').innerText = userData.last_name || 'Chưa có thông tin';
    document.getElementById('first_name').innerText = userData.first_name || 'Chưa có thông tin';
    document.getElementById('phone_number').innerText = userData.phone_number || 'Chưa có thông tin';

    const avatarImage = document.getElementById('avatarImage');
    const avatarSrc = userData.avatar || defaultAvatar;
    avatarImage.src = avatarSrc;
    updateAvatarState(avatarSrc, 'avatarContainer');

    if (typeof window.updateHeader === 'function') {
        window.updateHeader();
    }
});

document.getElementById('editAvatarInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const avatarImage = document.getElementById('editAvatarImage');
            avatarImage.src = e.target.result;
            updateAvatarState(e.target.result, 'editAvatarContainer');
            console.log('Ảnh đã tải lên:', e.target.result);
        };
        reader.onerror = function (e) {
            console.error('Lỗi khi đọc file ảnh:', e);
            alert('Không thể tải ảnh lên. Vui lòng thử lại.');
        };
        reader.readAsDataURL(file);
    } else {
        alert('Vui lòng chọn một file ảnh!');
    }
});

document.getElementById('editModal').addEventListener('show.bs.modal', function () {
    document.getElementById('editEmail').value = currentUserData.email || '';
    document.getElementById('editLastName').value = currentUserData.last_name || '';
    document.getElementById('editFirstName').value = currentUserData.first_name || '';
    document.getElementById('editPhoneNumber').value = currentUserData.phone_number || '';
    const editAvatarImage = document.getElementById('editAvatarImage');
    editAvatarImage.src = currentUserData.avatar || defaultAvatar;
    updateAvatarState(editAvatarImage.src, 'editAvatarContainer');
    // Reset input file để đảm bảo chọn lại ảnh mới
    document.getElementById('editAvatarInput').value = '';
});

// async function saveChanges() {
//     const newEmail = document.getElementById('editEmail').value;
//     const newLastName = document.getElementById('editLastName').value;
//     const newFirstName = document.getElementById('editFirstName').value;
//     const newPhoneNumber = document.getElementById('editPhoneNumber').value;
//     const avatarInput = document.getElementById('editAvatarInput');
//     const avatarFile = avatarInput.files[0];

//     // Kiểm tra các trường bắt buộc
//     if (!newEmail.trim() || !newLastName.trim() || !newFirstName.trim()) {
//         alert('Email, họ và tên không được để trống!');
//         return;
//     }

//     const formData = new FormData();
//     // Thêm dữ liệu JSON
//     const patchData = {};
//     if (newEmail && newEmail.trim() && newEmail !== currentUserData.email) patchData.email = newEmail;
//     if (newLastName && newLastName.trim() && newLastName !== currentUserData.last_name) patchData.last_name = newLastName;
//     if (newFirstName && newFirstName.trim() && newFirstName !== currentUserData.first_name) patchData.first_name = newFirstName;
//     if (newPhoneNumber && newPhoneNumber.trim() && newPhoneNumber !== currentUserData.phone_number) patchData.phone_number = newPhoneNumber;
//     if (Object.keys(patchData).length > 0) {
//         formData.append('data', JSON.stringify(patchData));
//     }

//     // Thêm file ảnh nếu có
//     if (avatarFile) {
//         formData.append('avatar', avatarFile);
//         console.log('Avatar file added to FormData:', avatarFile.name); // Debug
//     }

//     if (!avatarFile && Object.keys(patchData).length === 0) {
//         alert('Không có thay đổi để lưu!');
//         const modalElement = document.getElementById('editModal');
//         const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
//         modal.hide();
//         return;
//     }

//     const token = localStorage.getItem('token');
//     if (!token) {
//         alert('Không tìm thấy token. Vui lòng đăng nhập lại!');
//         window.location.href = 'login.html';
//         return;
//     }

//     try {
//         const response = await fetch(`http://localhost:8080/event-management/users/${currentUserId}`, {
//             method: 'PATCH',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             },
//             body: formData
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`Lỗi khi cập nhật dữ liệu: ${response.status} - ${errorText}`);
//         }

//         const updatedDataFromServer = await response.json();
//         console.log('patchData:', patchData); // Debug
//         console.log('updatedDataFromServer:', updatedDataFromServer); // Debug

//         // Hợp nhất dữ liệu
//         const updatedData = {
//             ...currentUserData,
//             ...patchData,
//             avatar: updatedDataFromServer.avatar || currentUserData.avatar,
//             id: currentUserId
//         };

//         // Đảm bảo cập nhật avatar nếu có từ server
//         if (updatedDataFromServer && updatedDataFromServer.avatar) {
//             updatedData.avatar = updatedDataFromServer.avatar;
//         }

//         console.log('updatedData:', updatedData); // Debug

//         localStorage.setItem('user', JSON.stringify(updatedData));
//         currentUserData = updatedData;

//         // Cập nhật giao diện
//         document.getElementById('email').innerText = updatedData.email || 'Chưa có thông tin';
//         document.getElementById('last_name').innerText = updatedData.last_name || 'Chưa có thông tin';
//         document.getElementById('first_name').innerText = updatedData.first_name || 'Chưa có thông tin';
//         document.getElementById('phone_number').innerText = updatedData.phone_number || 'Chưa có thông tin';
//         // const avatarImage = document.getElementById('avatarImage');
//         // avatarImage.src = updatedData.avatar || defaultAvatar;
//         // updateAvatarState(updatedData.avatar, 'avatarContainer');
//         // Cập nhật avatar
//         const avatarImage = document.getElementById('avatarImage');
//         const newAvatarSrc = updatedData.avatar || defaultAvatar;
//         avatarImage.src = newAvatarSrc;
//         console.log('Cập nhật avatar mới:', newAvatarSrc); // Debug
//         updateAvatarState(newAvatarSrc, 'avatarContainer');

//         if (typeof window.updateHeader === 'function') {
//             window.updateHeader();
//         }

//         const modalElement = document.getElementById('editModal');
//         const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
//         modal.hide();
//         alert('Cập nhật thông tin thành công!');
//     } catch (error) {
//         console.error('Lỗi chi tiết:', error);
//         alert(`Không thể cập nhật thông tin: ${error.message}`);
//     }
// }

// async function saveChanges() {
//     const newEmail = document.getElementById('editEmail').value;
//     const newLastName = document.getElementById('editLastName').value;
//     const newFirstName = document.getElementById('editFirstName').value;
//     const newPhoneNumber = document.getElementById('editPhoneNumber').value;
//     const avatarInput = document.getElementById('editAvatarInput');
//     const avatarFile = avatarInput.files[0];

//     // Kiểm tra các trường bắt buộc
//     if (!newEmail.trim() || !newLastName.trim() || !newFirstName.trim()) {
//         alert('Email, họ và tên không được để trống!');
//         return;
//     }

//     const formData = new FormData();
//     // Thêm dữ liệu JSON
//     const patchData = {};
//     if (newEmail && newEmail.trim() && newEmail !== currentUserData.email) patchData.email = newEmail;
//     if (newLastName && newLastName.trim() && newLastName !== currentUserData.last_name) patchData.last_name = newLastName;
//     if (newFirstName && newFirstName.trim() && newFirstName !== currentUserData.first_name) patchData.first_name = newFirstName;
//     if (newPhoneNumber && newPhoneNumber.trim() && newPhoneNumber !== currentUserData.phone_number) patchData.phone_number = newPhoneNumber;
//     if (Object.keys(patchData).length > 0) {
//         formData.append('data', JSON.stringify(patchData));
//     }

//     // Thêm file ảnh nếu có
//     if (avatarFile) {
//         formData.append('avatar', avatarFile);
//         console.log('Avatar file added to FormData:', avatarFile.name); // Sửa lỗi ở đây: avatarFile không có thuộc tính avatar
//     }

//     if (!avatarFile && Object.keys(patchData).length === 0) {
//         alert('Không có thay đổi để lưu!');
//         const modalElement = document.getElementById('editModal');
//         const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
//         modal.hide();
//         return;
//     }

//     const token = localStorage.getItem('token');
//     if (!token) {
//         alert('Không tìm thấy token. Vui lòng đăng nhập lại!');
//         window.location.href = 'login.html';
//         return;
//     }

//     try {
//         const response = await fetch(`http://localhost:8080/event-management/users/${currentUserId}`, {
//             method: 'PATCH',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             },
//             body: formData
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`Lỗi khi cập nhật dữ liệu: ${response.status} - ${errorText}`);
//         }

//         const updatedDataFromServer = await response.json();
//         console.log('patchData:', patchData); // Debug
//         console.log('updatedDataFromServer:', updatedDataFromServer); // Debug

//         // Hợp nhất dữ liệu - đảm bảo lấy avatar mới từ server
//         const updatedData = {
//             ...currentUserData,
//             ...patchData
//         };

//         // Đảm bảo cập nhật avatar nếu có từ server
//         if (updatedDataFromServer && updatedDataFromServer.avatar) {
//             updatedData.avatar = updatedDataFromServer.avatar;
//         }

//         // console.log('updatedData sau khi merge:', updatedData); // Debug

//         // Cập nhật localStorage và biến toàn cục
//         localStorage.setItem('user', JSON.stringify(updatedData));
//         currentUserData = updatedData;

//         // Cập nhật giao diện
//         document.getElementById('email').innerText = updatedData.email || 'Chưa có thông tin';
//         document.getElementById('last_name').innerText = updatedData.last_name || 'Chưa có thông tin';
//         document.getElementById('first_name').innerText = updatedData.first_name || 'Chưa có thông tin';
//         document.getElementById('phone_number').innerText = updatedData.phone_number || 'Chưa có thông tin';

//         // Cập nhật avatar
//         const avatarImage = document.getElementById('avatarImage');
//         const newAvatarSrc = updatedData.avatar || defaultAvatar;
//         avatarImage.src = newAvatarSrc;
//         console.log('Cập nhật avatar mới:', newAvatarSrc); // Debug
//         updateAvatarState(newAvatarSrc, 'avatarContainer');

//         if (typeof window.updateHeader === 'function') {
//             window.updateHeader();
//         }

//         const modalElement = document.getElementById('editModal');
//         const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
//         modal.hide();
//         alert('Cập nhật thông tin thành công!');
//     } catch (error) {
//         console.error('Lỗi chi tiết:', error);
//         alert(`Không thể cập nhật thông tin: ${error.message}`);
//     }
// }

async function saveChanges() {
    const newEmail = document.getElementById('editEmail').value;
    const newLastName = document.getElementById('editLastName').value;
    const newFirstName = document.getElementById('editFirstName').value;
    const newPhoneNumber = document.getElementById('editPhoneNumber').value;
    const avatarInput = document.getElementById('editAvatarInput');
    const avatarFile = avatarInput.files[0];

    // Kiểm tra các trường bắt buộc
    if (!newEmail.trim() || !newLastName.trim() || !newFirstName.trim()) {
        alert('Email, họ và tên không được để trống!');
        return;
    }

    const formData = new FormData();
    // Thêm dữ liệu JSON
    const patchData = {};
    if (newEmail && newEmail.trim() && newEmail !== currentUserData.email) patchData.email = newEmail;
    if (newLastName && newLastName.trim() && newLastName !== currentUserData.last_name) patchData.last_name = newLastName;
    if (newFirstName && newFirstName.trim() && newFirstName !== currentUserData.first_name) patchData.first_name = newFirstName;
    if (newPhoneNumber && newPhoneNumber.trim() && newPhoneNumber !== currentUserData.phone_number) patchData.phone_number = newPhoneNumber;

    if (Object.keys(patchData).length > 0) {
        formData.append('data', JSON.stringify(patchData));
    }

    // Thêm file ảnh nếu có
    if (avatarFile) {
        formData.append('avatar', avatarFile);
        console.log('Avatar file added to FormData:', avatarFile.name);
    }

    if (!avatarFile && Object.keys(patchData).length === 0) {
        alert('Không có thay đổi để lưu!');
        const modalElement = document.getElementById('editModal');
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Không tìm thấy token. Vui lòng đăng nhập lại!');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Sửa URL endpoint
        const response = await fetch(`http://localhost:8080/users/${currentUserId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Không cần set Content-Type vì FormData tự set
                'Access-Control-Allow-Origin': '*'  // Thêm header này
            },
            body: formData,
            mode: 'cors', // Thêm mode CORS
            // credentials: 'include' // Thêm credentials
            credentials: 'same-origin'  // Đổi thành same-origin thay vì include
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi khi cập nhật dữ liệu: ${response.status} - ${errorText}`);
        }

        const updatedDataFromServer = await response.json();
        console.log('Server response:', updatedDataFromServer);

        // Cập nhật dữ liệu từ response server
        const updatedData = {
            ...currentUserData,
            ...updatedDataFromServer // Sử dụng toàn bộ dữ liệu từ server
        };
        // Cập nhật avatar với URL tuyệt đối
        if (updatedData.avatar) {
            updatedData.avatar = getAbsoluteAvatarUrl(updatedData.avatar);
        }

        // Cập nhật localStorage và biến toàn cục
        localStorage.setItem('user', JSON.stringify(updatedData));
        currentUserData = updatedData;

        // Cập nhật giao diện
        document.getElementById('email').innerText = updatedData.email || 'Chưa có thông tin';
        document.getElementById('last_name').innerText = updatedData.last_name || 'Chưa có thông tin';
        document.getElementById('first_name').innerText = updatedData.first_name || 'Chưa có thông tin';
        document.getElementById('phone_number').innerText = updatedData.phone_number || 'Chưa có thông tin';

        // // Cập nhật avatar - sử dụng URL trực tiếp từ server
        // const avatarImage = document.getElementById('avatarImage');
        // if (updatedData.avatar) {
        //     // Đảm bảo sử dụng URL đầy đủ từ server
        //     avatarImage.src = updatedData.avatar;
        //     console.log('Avatar URL from server:', updatedData.avatar);
        // } else {
        //     avatarImage.src = defaultAvatar;
        // }
        // // Sửa phần cập nhật avatar trong hàm saveChanges:
        // const avatarImage = document.getElementById('avatarImage');
        // if (updatedData.avatar) {
        //     const validAvatarUrl = getValidAvatarUrl(updatedData.avatar);
        //     avatarImage.src = validAvatarUrl;
        //     console.log('Avatar URL being used:', validAvatarUrl);
        // } else {
        //     avatarImage.src = defaultAvatar;
        // }

        // Cập nhật avatar trong header nếu có
        if (typeof window.updateHeader === 'function') {
            window.updateHeader();
        }

        const modalElement = document.getElementById('editModal');
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
        alert('Cập nhật thông tin thành công!');
    } catch (error) {
        console.error('Lỗi chi tiết:', error);
        alert(`Không thể cập nhật thông tin: ${error.message}`);
    }
}
function updateUserInterface(userData) {
    // Cập nhật thông tin text
    document.getElementById('email').innerText = userData.email || 'Chưa có thông tin';
    document.getElementById('last_name').innerText = userData.last_name || 'Chưa có thông tin';
    document.getElementById('first_name').innerText = userData.first_name || 'Chưa có thông tin';
    document.getElementById('phone_number').innerText = userData.phone_number || 'Chưa có thông tin';

    // Cập nhật avatar
    const avatarImage = document.getElementById('avatarImage');
    const avatarUrl = userData.avatar ? getAbsoluteAvatarUrl(userData.avatar) : defaultAvatar;
    avatarImage.src = avatarUrl;
    console.log('Setting avatar URL to:', avatarUrl);

    // Cập nhật trạng thái avatar
    updateAvatarState(avatarUrl, 'avatarContainer');

    // Cập nhật header nếu cần
    if (typeof window.updateHeader === 'function') {
        window.updateHeader();
    }
}
function getAbsoluteAvatarUrl(path) {
    if (!path) return defaultAvatar;
    if (path.startsWith('http')) return path;

    // Xử lý path để đảm bảo format đúng
    const baseUrl = 'http://localhost:8080';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
}
function checkResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
}