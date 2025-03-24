var UsersAPI ='http://localhost:3000/user';
function login(){
    getUser(handleLogin);
}
function getUser(callback){
    fetch(UsersAPI).then(function(res){
        return res.json().then(callback)
    });
}
function handleLogin(data){
    let username = document.getElementById('yourUsername').value;
    let password = document.getElementById('yourPassword').value;

    let user = data.find(user => user.email === username && user.password === password);

    toastr.options = {
        positionClass: "toast-top-right",
        timeOut: 2000,
        closeButton: true,
        progressBar: true
    };

    if (user) {
        toastr.success("Đăng nhập thành công!", "Thành công");

        // Lưu thông tin vào localStorage
        localStorage.setItem("user", JSON.stringify({
            user_id: user.id,
            email: user.email,
            last_name: user.last_name,
            first_name: user.first_name,
            avatar: user.avatar, 
            phone_number: user.phone_number,
            password:user.password
        }));

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    } else {
        toastr.error("Sai tài khoản hoặc mật khẩu!", "Lỗi");
    }
}
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngăn chặn reload trang
    login();
});