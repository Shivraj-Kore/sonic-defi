async function checkAuth() {
    const response = await fetch('/api/user');
    const data = await response.json();

    if (data.isAuthenticated) {
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');

        const username = data.twitterUsername || "stev3raj_";
        document.getElementById('username').value = username;

        // Check if username exists in MongoDB
        const userCheck = await fetch(`/api/checkUser?username=${username}`);
        const userExists = await userCheck.json();

        if (userExists.exists) {
            // User exists, show only username and wallet address

            localStorage.setItem("username", username);
            
            document.getElementById('userDisplay').classList.remove('hidden');
            document.getElementById('username').textContent = username;
            document.getElementById('walletAddress').textContent = userExists.walletAddress || "Not available";
            document.getElementById('userForm').classList.add('hidden');
        } else {
            // User does not exist, show form
            document.getElementById('userForm').classList.remove('hidden');
            document.getElementById('sid').value = data.userProfile.sid || "";
            document.getElementById('name').value = data.userProfile.name || "";
            document.getElementById('twitterId').value = data.userProfile.sub ? data.userProfile.sub.split("|")[1] : "";
        }
    } else {
        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
        document.getElementById('userDisplay').classList.add('hidden');
        document.getElementById('userForm').classList.add('hidden');
    }
}

// Form submission
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        sid: document.getElementById('sid').value,
        username: document.getElementById('username').value,
        name: document.getElementById('name').value,
        twitterId: document.getElementById('twitterId').value,
        walletAddress: document.getElementById('walletAddressInput').value
    };

    const response = await fetch('/api/saveUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });

    const result = await response.json();

    localStorage.setItem("username", formData.username);
    alert(result.message);
    location.reload();
});

document.getElementById('loginBtn').addEventListener('click', () => {
    window.location.href = '/login';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem("username"); // Clear username from localStorage on logout
    window.location.href = '/logout';
});

checkAuth();
