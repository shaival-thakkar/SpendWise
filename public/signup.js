document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("register").addEventListener("click", async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get form input values
        let name = document.getElementById("fullname").value.trim();
        let email = document.getElementById("email").value.trim();
        let mobile = document.getElementById("mobile").value.trim();
        let password = document.getElementById("password").value.trim();
        let confirmPassword = document.getElementById("confirm-password").value.trim();

        // Basic validation
        if (!name || !email || !mobile || !password || !confirmPassword) {
            alert("All fields are required!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Create request body
        let userData = { name, email, mobile, password };

        try {

            let response = await fetch("/register", { // Correct API endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            let result = await response.json();

            if (response.ok) {
                alert("Signup successful! Redirecting to login...");
                window.location.href = "/login.html"; // Redirect to login page
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
