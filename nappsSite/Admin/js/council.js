// Security Check
(function checkAccess() {
    const activeRole = sessionStorage.getItem('council_role');
    const pageTitle = document.title.toLowerCase();

    if(!activeRole) {
        window.location.href = 'council.html'; // Kick out if not logged in
        return;
    }

    // Verify if they are in the right room
    if (pageTitle.includes("treasury") && activeRole !== "Treasurer" && activeRole !== "Super Admin") {
        alert("Access Denied: Treasury ONLY.");
        window.location.href = 'council.html';
    }
    
    if (pageTitle.includes("pro") && activeRole !== "PRO" && activeRole !== "Super Admin") {
        alert("Access Denied: PRO ONLY.");
        window.location.href = 'council.html';
    }
})();

// Personalized Greeting
window.addEventListener('DOMContentLoaded', () => {
    const welcome = document.getElementById('councilGreeting');
    if(welcome) welcome.innerText = `Welcome, Worthy State ${sessionStorage.getItem('council_role')}`;
});