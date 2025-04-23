console.log('JavaScript file loaded'); // Debug line

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function setCookie(c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=encodeURIComponent(value) + ((exdays==null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

let lastScroll = 0;
const nav = document.querySelector('.nav-container');
let isNavVisible = true;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Scrolling down
    if (currentScroll > lastScroll && isNavVisible && currentScroll > 100) {
        nav.style.transform = 'translateY(-100%)';
        isNavVisible = false;
    }
    // Scrolling up
    else if (currentScroll < lastScroll && !isNavVisible) {
        nav.style.transform = 'translateY(0)';
        isNavVisible = true;
    }
    
    lastScroll = currentScroll;
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded'); // Debug line
    
    const searchWindow = document.querySelector('.search-window');
    let lastScrollPosition = 0;
    const scrollThreshold = 200; // Adjust this value to change when the fade happens

    window.addEventListener('scroll', function() {
        const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        // Fade out when scrolling down past threshold
        if (currentScrollPosition > scrollThreshold) {
            searchWindow.classList.add('fade-out');
        } else {
            // Fade in when scrolling back up
            searchWindow.classList.remove('fade-out');
        }

        lastScrollPosition = currentScrollPosition;
    });

    // Add click event listener to the Add Ride button
    document.getElementById('addRideBtn').addEventListener('click', openForm);
    
    // Add click event listener to the overlay for closing
    document.getElementById('formOverlay').addEventListener('click', closeForm);

    const searchUserBtn = document.getElementById('searchUserBtn');
    const searchDropdown = document.getElementById('searchDropdown');
    const userSearchInput = document.getElementById('userSearchInput');
    
    console.log('Search button:', searchUserBtn); // Debug line
    console.log('Search dropdown:', searchDropdown); // Debug line

    if (searchUserBtn && searchDropdown) {
        console.log('Elements found, adding listeners'); // Debug line
        
        searchUserBtn.addEventListener('click', function(e) {
            console.log('Button clicked'); // Debug line
            e.preventDefault();
            e.stopPropagation();
            const isVisible = searchDropdown.style.display === 'block';
            searchDropdown.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
                userSearchInput.focus();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchDropdown.contains(e.target) && e.target !== searchUserBtn) {
                searchDropdown.style.display = 'none';
            }
        });

        // Handle Enter key in search input
        userSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchUser();
            }
        });
    } else {
        console.log('Elements not found'); // Debug line
    }
});

function openForm() {
    document.getElementById('rideFormPopup').style.display = 'block';
    document.getElementById('formOverlay').style.display = 'block';
}

function closeForm() {
    document.getElementById('rideFormPopup').style.display = 'none';
    document.getElementById('formOverlay').style.display = 'none';
}

function checkForm() {
    // Get form values
    const formData = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        origination: document.getElementById('origination').value,
        destination_city: document.getElementById('destination_city').value,
        destination_state: document.getElementById('destination_state').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        seats_available: document.getElementById('seats_available').value
    };

    // Basic validation
    for (let key in formData) {
        if (!formData[key]) {
            alert('Please fill in all fields');
            return false;
        }
    }

    // Here you would typically send the data to your server
    console.log('Form data:', formData);
    alert('Thank you for submitting your ride!');
    closeForm();
    return false; // Prevent form submission for now
}

// Close popup when clicking outside
window.onclick = function(event) {
    const popup = document.getElementById("rideFormPopup");
    if (event.target === popup) {
        closeForm();
    }
}

function toggleDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.nav-button')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function searchUser(event) {
    if (event) {
        event.preventDefault();
    }
    
    const searchInput = document.getElementById('userSearchInput').value.trim();
    const searchResult = document.getElementById('searchResult');
    
    if (!searchInput) {
        searchResult.textContent = 'Please enter a name';
        searchResult.className = 'error';
        return false;
    }

    fetch('/rides/check_user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name: searchInput })
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            searchResult.className = 'success';
            searchResult.textContent = 'User has submitted form';
        } else {
            searchResult.className = 'error';
            searchResult.textContent = "They're not here";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        searchResult.className = 'error';
        searchResult.textContent = 'An error occurred while searching';
    });

    return false;
}