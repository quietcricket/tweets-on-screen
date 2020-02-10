function login() {
    var message = {
        command: 'login'
    };
    for (var key of ['project', 'api-key', 'email', 'password']) {
        var v = document.getElementById(key).value.trim();
        if (v.length == 0) {
            alert('Please enter all fields');
            return
        }
        message[key] = v;
    }

    chrome.runtime.sendMessage(message, resp => {
        if (resp == 'ok') {
            alert('Login successfully.');
            window.close();
        } else {
            alert(resp);
        }
    });
}

function logout() {
    if (!confirm("Are you sure you want to log out?")) return;
    chrome.runtime.sendMessage({
        command: 'logout'
    });

    document.querySelector('.logtout').classList.add('d-none');
    document.querySelector('.login').classList.remove('d-none');
    window.close();
}

chrome.storage.local.get(['project', 'email'], resp => {
    let project = resp['project'];
    let email = resp['email'];
    if (project && email) {
        document.querySelector('.status').innerHTML = `
        You have logged in as 
        <span>${email}</span> 
        for <span>${project}</span>`;
        document.querySelector('.logout').classList.remove('d-none');
    } else {
        document.querySelector('.login').classList.remove('d-none');
    }
});

document.querySelector('#login-btn').addEventListener('click', login);
document.querySelector('#logout-btn').addEventListener('click', logout);