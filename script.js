const quantities = document.querySelectorAll(".quantity");
const estimatedTotal = document.getElementById("estimated-total");

function calculateTotal() {
    let total = 0;

    quantities.forEach(function(quantity) {
        
        const price = Number(quantity.dataset.price);
        const amount = Number(quantity.value);

        total += price * amount;

    });

    if (estimatedTotal) {
        estimatedTotal.textContent = total.toFixed(2);
    }
}

quantities.forEach(function(quantity) {
    quantity.addEventListener("input", calculateTotal);
});

calculateTotal();


const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
    
    bookingForm.addEventListener("submit", function(event) {
        
        event.preventDefault();

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const location = document.getElementById("location").value;
        const pickupDate = document.getElementById("pickup-date").value;
        const pickupTime = document.getElementById("pickup-time").value;
        

        let total = 0;
        let items = "";

        quantities.forEach(function(quantity) {
            
            const amount = Number(quantity.value);
            const price = Number(quantity.dataset.price);

            if (amount > 0) {
                const label = quantity.previousElementSibling.textContent.trim();

                items += "_ " + label + " * " + amount + "\n";
                total += price * amount;
            }
        });

        if (name === "") {
            
            alert("Please enter your full name.");
            return;
        }

        if (phone === "") {
            
            alert("Please enter your phone number.");
            return;
        }

        const phonePattern = /^(0\d{9}|\+233\d{9})$/;
        
        if (!phonePattern.test(phone)) {
            
            alert(
                "Please enter a valid Ghanaian phone number.\n\n" +
                "Example: 0280000009"
            );
            return;
        }

        if (location === "") {
            
            alert("Please enter your pickup location.");
            return;
        }

        if (pickupDate === "") {
            
            alert("Please select your pickup date.");
            return;
        }

        if (pickupTime === "") {
            
            alert("Plese select your pickup time.");
            return;
        }

        if (items === "") {
            
            alert("Please select at least one laundry item.");
            return;
        }

        const message = 
        "Hello THEOS LAUNDRY,\n\n" +
        "I would like to make a laundry booking.\n\n" +
        "Name: " + name + "\n" +
        "Phone: " + phone + "\n" +
        "Pickup Location: " + location + "\n" +
        "Pickup Date: " + pickupDate + "\n" +
        "Pickup Time: " + pickupTime + "\n\n" +
        "Items:\n" + items +
        "\nEstimated Total: GHS" +  total.toFixed(2);

        const whatsappNumber = "233540807941";

        const whatsappURL = 
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);

        window.open(whatsappURL, "_blank");
    });
}

const pickupDateInput = document.getElementById("pickup-date");
if (pickupDateInput) {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayFormatted = year + "-" + month + "-" + day;

    pickupDateInput.min = todayFormatted;
}

const pickupTimeInput = document.getElementById("pickup-time");
 
if (pickupTimeInput) {
    
    pickupTimeInput.min = "08:00";
    pickupTimeInput.max = "18:00"
}

const backToTop = document.getElementById("back-to-top");

window.addEventListener("scroll", function() {
    
    if (window.scrollY > 400) {
        
        backToTop.style.display = "block";

    } else {
        backToTop.style.display = "none";
    }
});

backToTop.addEventListener("click", function(paams) {
    
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

const menuToggle = document.getElementById("menu-toggle");
const nav = document.querySelector("nav");

if (menuToggle && nav) {

    menuToggle.addEventListener("click", function() {

        nav.classList.toggle("active");

    });

}

const navLinks = document.querySelectorAll("nav a");

navLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        nav.classList.remove("active");

    });

});