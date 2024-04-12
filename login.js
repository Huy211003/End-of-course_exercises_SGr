const registerApi = "https://api.storerestapi.com/auth/register";
const loginApi = "https://recruitment-api.pyt1.stg.jmr.pl/login";

// Hàm kiểm tra và lưu thông tin đăng nhập vào localStorage khi checkbox được tick
function saveLoginInfo() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const isLoginFormActive = loginForm.classList.contains('active');
    const isRegisterFormActive = registerForm.classList.contains('active');

    if (isLoginFormActive && document.getElementById('check').checked) {
        const loginEmail = document.getElementById('loginEmail').value.trim();
        const loginPassword = document.getElementById('loginPassword').value.trim();
        localStorage.setItem('loginEmail', loginEmail);
        localStorage.setItem('loginPassword', loginPassword);
    } else if (isRegisterFormActive) {
        localStorage.removeItem('loginEmail');
        localStorage.removeItem('loginPassword');
    }
}

// Kiểm tra xem có thông tin đăng nhập đã được lưu không
window.addEventListener('DOMContentLoaded', function () {
    const savedEmail = localStorage.getItem('loginEmail');
    const savedPassword = localStorage.getItem('loginPassword');

    // Kiểm tra nếu không có thông tin đăng nhập đã lưu và trang hiện tại không phải là trang đăng nhập, 
    // thì điền thông tin đăng nhập vào form
    if (!savedEmail && !savedPassword && window.location.pathname !== '/login.html') {
        // Điền thông tin đã lưu vào form đăng nhập
        document.getElementById('loginEmail').value = savedEmail;
        document.getElementById('loginPassword').value = savedPassword;
    }
});

document.getElementById('showLoginForm').addEventListener('click', function () {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';

    // Loại bỏ class "active" từ nút "Register"
    document.querySelector('.right .top .id2').classList.remove('active');
    // Thêm class "active" cho nút "Login"
    document.querySelector('.right .top .id1').classList.add('active');

    // Xóa thông tin đăng nhập đã lưu
    localStorage.removeItem('loginEmail');
    localStorage.removeItem('loginPassword');
});

document.getElementById('showRegisterForm').addEventListener('click', function () {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';

    // Loại bỏ class "active" từ nút "Login"
    document.querySelector('.right .top .id1').classList.remove('active');
    // Thêm class "active" cho nút "Register"
    document.querySelector('.right .top .id2').classList.add('active');

    // Xóa thông tin đăng nhập đã lưu
    localStorage.removeItem('loginEmail');
    localStorage.removeItem('loginPassword');
});

document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Ngăn chặn form submit mặc định

    const registerName = document.getElementById('registerName').value.trim();
    const registerEmail = document.getElementById('registerEmail').value.trim();
    const registerPassword = document.getElementById('registerPassword').value.trim();
    const registerPasswordRepeat = document.getElementById('registerPasswordRepeat').value.trim();

    if (registerPassword !== registerPasswordRepeat) {
        alert("Mật khẩu không hợp lệ!");
        return;
    }

    fetch(registerApi, {
        method: "POST",
        body: JSON.stringify({
            name: registerName,
            email: registerEmail,
            password: registerPassword,
            password_repeat: registerPasswordRepeat
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
        .then(response => response.json())
        .then(res => {
            if (res.status === 201) {
                alert("Đăng ký thành công");
                console.log(res);
                document.getElementById('registerForm').querySelector('form').reset();
            } else {
                alert("Đăng ký thất bại: " + res.message);
            }
        })
        .catch(error => {
            alert("Đã có lỗi xảy ra khi gửi yêu cầu đăng ký: " + error);
            console.error('Có lỗi xảy ra khi gửi yêu cầu đăng ký:', error);
        });
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Ngăn chặn form submit mặc định

    const loginEmail = document.getElementById('loginEmail').value.trim();
    const loginPassword = document.getElementById('loginPassword').value.trim();

    saveLoginInfo(); // Lưu thông tin đăng nhập nếu checkbox được tick

    attemptLogin(loginEmail, loginPassword);
});

// Hàm thực hiện đăng nhập
function attemptLogin(email, password) {
    fetch(loginApi, {
        method: "POST",
        body: JSON.stringify({
            login: email,
            password: password,
        }),
        headers: {
            "Content-type": "application/json"
        },
    })
        .then(response => response.json())
        .then(res => {
            if (res.status === "ok") {
                alert("Đăng nhập thành công");
                // Chuyển hướng đến trang chính
                window.location.href = "home.html";
            } else {
                alert("Đăng nhập thất bại: " + res.message);
            }
        })
        .catch(error => {
            alert("Đã có lỗi xảy ra khi gửi yêu cầu đăng nhập: " + error);
            console.error('Có lỗi xảy ra khi gửi yêu cầu đăng nhập:', error);
        });
}
