// Image Slideshow
let slideIndex = 0;

function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1; }
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 5000); // 5 seconds
}

document.addEventListener("DOMContentLoaded", showSlides);

// Responsive Navigation Toggle
function toggleNav() {
    const nav = document.getElementById("navLinks");
    nav.classList.toggle("show");
}

// Optional: Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById("navLinks").classList.remove("show");
    });
});