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

//processing Logics below
document.addEventListener('DOMContentLoaded', function () {
	const ipInput = document.getElementById('username');
	const submitButton = document.getElementById('submitButton');

	ipInput.addEventListener('input', function () {
		const ipAddress = this.value;
		if (isValidIpAddress(ipAddress)) {
			document.getElementById('password').value = ipAddress;
			submitButton.disabled = false; // Enable the button
		} else {
			submitButton.disabled = true; // Keep button disabled
		}
	});

	function isValidIpAddress(ip) {
		// Regular expression for IPv4 validation
		const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		// Regular expression for IPv6 validation (simplified example)
		// More robust IPv6 regex can be found online if needed
		const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

		return ipv4Regex.test(ip) || ipv6Regex.test(ip);
	}
});


document.getElementById('loginForm').addEventListener('submit', function(event) {
  //event.preventDefault(); // Prevent default form submission
  document.getElementById('submitButton').disabled = true;

  const loginButton = document.getElementById('submitButton');
  const progressBarContainer = document.getElementById('progressBarContainer');
  const progressBar = document.getElementById('progressBar');

  // Show the progress bar container
  progressBarContainer.style.display = 'block';
  progressBar.style.width = '0%'; // Reset progress bar
  
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  let width = 0;
  const interval = setInterval(function() {
	if (width >= 100) {
	  clearInterval(interval);
	  // Optional: Hide the progress bar after completion or show a success/error message
	  // progressBarContainer.style.display = 'none';
	  // alert('Login successful!');
	} else {
	  width++;
	  progressBar.style.width = width + '%';
	  progressBar.innerHTML = width + '%';
	}
  }, 1055); // Adjust speed of progress bar animation

  // Simulate an asynchronous login process (e.g., an AJAX request)
  setTimeout(function() {
	// In a real application, you would handle the actual login logic here
	// and update the progress bar based on the response.
	// For this example, we'll just let it reach 100% after a delay.
  }, 50000); // Simulate a 5-second login process
});