document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login1").addEventListener("click", async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get input values
        let username = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value.trim();

        // Basic validation
        if (!username || !password) {
            alert("Both fields are required!");
            return;
        }

        // Create request body
        let loginData = {
            username: username,
            password: password
        };

        try {
            let response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            let result = await response.json();

            if (response.ok) {
                alert("Login successful! Redirecting to dashboard...");
                let uname = result.name;
                sessionStorage.setItem("userid", result.id); // Store user ID in session storage
                sessionStorage.setItem("username", uname); // Store username in session storage
                window.location.href = "/tracker.html"; // Redirect to dashboard or homepage
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
