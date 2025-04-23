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
// function updateAvatarState(avatarSrc, containerId = 'avatarContainer') {
//     const avatarContainer = document.getElementById(containerId);
//     if (!avatarContainer) {
//         console.error(`Không tìm thấy phần tử với ID: ${containerId}`);
//         return;
//     }
//     isDefaultAvatar = avatarSrc === defaultAvatar;
//     if (isDefaultAvatar) {
//         avatarContainer.classList.add('default');
//     } else {
//         avatarContainer.classList.remove('default');
//     }
// }

document.addEventListener('DOMContentLoaded', function () {
    const userData = JSON.parse(localStorage.getItem('user'));
    console.log('userData:', userData); // Debug dữ liệu
    if (!userData) {
        alert('Vui lòng đăng nhập để xem thông tin cá nhân!');
        window.location.href = 'login.html';
        return;
    }

    currentUserId = userData.id;
    console.log('currentUserId:', currentUserId); // Debug ID người dùng
    console.log('currentUserData:', currentUserData); // Debug dữ liệu người dùng
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
// document.addEventListener('DOMContentLoaded', function () {
//     const userData = JSON.parse(localStorage.getItem('user'));
//     console.log('userData:', userData);
//     if (!userData) {
//         alert('Vui lòng đăng nhập để xem thông tin cá nhân!');
//         window.location.href = 'login.html';
//         return;
//     }

//     currentUserId = userData.id;
//     currentUserData = userData;

//     const emailElement = document.getElementById('email');
//     const lastNameElement = document.getElementById('last_name');
//     const firstNameElement = document.getElementById('first_name');
//     const phoneNumberElement = document.getElementById('phone_number');

//     if (!emailElement || !lastNameElement || !firstNameElement || !phoneNumberElement) {
//         console.error('Không tìm thấy các phần tử HTML để hiển thị thông tin người dùng');
//         return;
//     }

//     emailElement.innerText = userData.email || 'Chưa có thông tin';
//     lastNameElement.innerText = userData.last_name || 'Chưa có thông tin';
//     firstNameElement.innerText = userData.first_name || 'Chưa có thông tin';
//     phoneNumberElement.innerText = userData.phone_number || 'Chưa có thông tin';

//     const avatarImage = document.getElementById('avatarImage');
//     const avatarSrc = userData.avatar || defaultAvatar;
//     if (avatarSrc !== defaultAvatar) {
//         loadAvatarWithAuth(getAbsoluteAvatarUrl(avatarSrc), avatarImage);
//     } else {
//         avatarImage.src = avatarSrc;
//     }
//     updateAvatarState(avatarSrc, 'avatarContainer');

//     if (typeof window.updateHeader === 'function') {
//         window.updateHeader();
//     }
// });

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

async function saveChanges() {
    const newEmail = document.getElementById('editEmail').value;
    const newLastName = document.getElementById('editLastName').value;
    const newFirstName = document.getElementById('editFirstName').value;
    const newPhoneNumber = document.getElementById('editPhoneNumber').value;
    const avatarInput = document.getElementById('editAvatarInput');
    //const avatarFile = avatarInput.files[0];

    // Kiểm tra các trường bắt buộc
    if (!newEmail.trim() || !newLastName.trim() || !newFirstName.trim()) {
        alert('Email, họ và tên không được để trống!');
        return;
    }

    // Thêm dữ liệu JSON
    const patchData = {
        email: newEmail,
        last_name: newLastName,
        first_name: newFirstName,
        phone_number: newPhoneNumber
    };

    const formData = new FormData();
    if (avatarInput.files[0]) {
        formData.append('file', avatarInput.files[0]);
    }
    formData.append('profile', new Blob([JSON.stringify(patchData)], {
        type: 'application/json'
    }));

    const token = localStorage.getItem('token');

    if (!token) {
        alert('Không tìm thấy token. Vui lòng đăng nhập lại!');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/event-management/users/${currentUserId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: formData
        });


        const updatedDataFromServer = await response.json();
        console.log('patchData:', patchData); // Debug
        console.log('updatedDataFromServer:', updatedDataFromServer); // Debug

        // Hợp nhất dữ liệu
        const updatedData = {
            ...currentUserData,
            ...patchData,
            avatar: updatedDataFromServer.avatar || currentUserData.avatar,
            id: currentUserId
        };

        // Đảm bảo cập nhật avatar nếu có từ server
        if (updatedDataFromServer && updatedDataFromServer.avatar) {
            updatedData.avatar = updatedDataFromServer.avatar;
        }

        console.log('updatedData:', updatedData); // Debug

        localStorage.setItem('user', JSON.stringify(updatedData));
        currentUserData = updatedData;

        // Cập nhật giao diện
        document.getElementById('email').innerText = updatedData.email || 'Chưa có thông tin';
        document.getElementById('last_name').innerText = updatedData.last_name || 'Chưa có thông tin';
        document.getElementById('first_name').innerText = updatedData.first_name || 'Chưa có thông tin';
        document.getElementById('phone_number').innerText = updatedData.phone_number || 'Chưa có thông tin';
        // const avatarImage = document.getElementById('avatarImage');
        // avatarImage.src = updatedData.avatar || defaultAvatar;
        // updateAvatarState(updatedData.avatar, 'avatarContainer');
        // Cập nhật avatar
        const avatarImage = document.getElementById('avatarImage');
        const newAvatarSrc = updatedData.avatar || defaultAvatar;
        avatarImage.src = newAvatarSrc;
        console.log('Cập nhật avatar mới:', newAvatarSrc); // Debug
        updateAvatarState(newAvatarSrc, 'avatarContainer');

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

function loadAvatarWithAuth(avatarUrl, imageElement) {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(avatarUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            imageElement.src = url;
        })
        .catch(error => {
            console.error('Lỗi tải avatar:', error);
            imageElement.src = defaultAvatar;
        });
}

// Sử dụng trong updateAvatarState hoặc khi cập nhật avatar
const avatarImage = document.getElementById('avatarImage');
const avatarSrc = userData.avatar || defaultAvatar;
if (avatarSrc !== defaultAvatar) {
    loadAvatarWithAuth(getAbsoluteAvatarUrl(avatarSrc), avatarImage);
} else {
    avatarImage.src = avatarSrc;
}