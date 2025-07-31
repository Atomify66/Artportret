// Navbar functionality
document.addEventListener('DOMContentLoaded', function() {
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarLinks = document.getElementById('navbar-links');
    
    if (navbarToggle && navbarLinks) {
        navbarToggle.addEventListener('click', function() {
            navbarLinks.classList.toggle('show');
        });
        
        // Close navbar when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navbarToggle.contains(event.target) || 
                                 navbarLinks.contains(event.target);
            
            if (!isClickInside && navbarLinks.classList.contains('show')) {
                navbarLinks.classList.remove('show');
            }
        });
        
        // Close navbar when clicking on a link
        const links = navbarLinks.querySelectorAll('.navbar-link');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navbarLinks.classList.remove('show');
            });
        });
    }
});