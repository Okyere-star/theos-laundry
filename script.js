document.addEventListener("DOMContentLoaded", function () {
    // ----------------------------------------------------
    // CONSTANTS & INITIAL SETUP
    // ----------------------------------------------------
    const ADMIN_PIN = "112222";
    const WHATSAPP_PHONE = "233540807941";

    // DOM Elements - Booking
    const bookingForm = document.getElementById("booking-form");
    const quantities = document.querySelectorAll(".quantity");
    const estimatedTotalEl = document.getElementById("estimated-total");
    const paymentMethodSelect = document.getElementById("payment-method");
    const momoInstructions = document.getElementById("momo-instructions");
    const bookingConfirmation = document.getElementById("booking-confirmation");
    const bookingReferenceEl = document.getElementById("booking-reference");
    const confirmationTotalEl = document.getElementById("confirmation-total");
    const whatsappButton = document.getElementById("whatsapp-button");
    const newBookingButton = document.getElementById("new-booking-button");
    const pickupDateInput = document.getElementById("pickup-date");
    const pickupTimeInput = document.getElementById("pickup-time");

    // DOM Elements - Navigation & Misc
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("navbar");
    const backToTop = document.getElementById("back-to-top");

    // DOM Elements - Tracking
    const trackBtn = document.getElementById("track-btn");
    const trackInput = document.getElementById("track-input");
    const trackerResult = document.getElementById("tracker-result");
    const displayRefId = document.getElementById("display-ref-id");
    const displayOrderDetails = document.getElementById("display-order-details");
    const trackerErrorMsg = document.getElementById("tracker-error-msg");

    const statusSteps = {
        "Received": document.getElementById("status-received"),
        "Collected": document.getElementById("status-collected"),
        "Processing": document.getElementById("status-processing"),
        "Ready": document.getElementById("status-ready"),
        "Delivered": document.getElementById("status-delivered")
    };

    // DOM Elements - Admin
    const adminLoginCard = document.getElementById("admin-login-card");
    const adminContentCard = document.getElementById("admin-content-card");
    const adminPinInput = document.getElementById("admin-pin-input");
    const adminLoginBtn = document.getElementById("admin-login-btn");
    const adminLogoutBtn = document.getElementById("admin-logout-btn");
    const adminLoginError = document.getElementById("admin-login-error");
    const exportCsvBtn = document.getElementById("export-csv-btn");

    let currentWhatsappURL = "";

    // ----------------------------------------------------
    // 0. MOBILE MENU & BACK TO TOP LOGIC
    // ----------------------------------------------------
    if (menuToggle && nav) {
        menuToggle.addEventListener("click", function () {
            nav.classList.toggle("active");
        });

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("active");
            });
        });
    }

    if (backToTop) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTop.style.display = "block";
            } else {
                backToTop.style.display = "none";
            }
        });

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ----------------------------------------------------
    // 1. HELPER FUNCTIONS
    // ----------------------------------------------------
    function getStoredOrders() {
        return JSON.parse(localStorage.getItem("theos_orders")) || {};
    }

    function saveOrdersToStorage(orders) {
        localStorage.setItem("theos_orders", JSON.stringify(orders));
    }

    function calculateTotal() {
        let total = 0;
        quantities.forEach(function (quantity) {
            const price = Number(quantity.dataset.price) || 0;
            const amount = Number(quantity.value) || 0;
            total += price * amount;
        });
        if (estimatedTotalEl) {
            estimatedTotalEl.textContent = "GH₵" + total.toFixed(2);
        }
        return total;
    }

    // Date & Time restrictions
    if (pickupDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        pickupDateInput.min = `${year}-${month}-${day}`;
    }

    if (pickupTimeInput) {
        pickupTimeInput.min = "08:00";
        pickupTimeInput.max = "18:00";
    }

    // Toggle Payment Instructions
    if (paymentMethodSelect && momoInstructions) {
        paymentMethodSelect.addEventListener("change", function () {
            momoInstructions.style.display = this.value === "MoMo" ? "block" : "none";
        });
    }

    // Attach Price Listener to Quantity Inputs
    quantities.forEach(function (quantity) {
        quantity.addEventListener("input", calculateTotal);
    });
    calculateTotal();

    // ----------------------------------------------------
    // 2. BOOKING FORM SUBMISSION
    // ----------------------------------------------------
    if (bookingForm) {
        bookingForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const location = document.getElementById("location").value.trim();
            const pickupDate = document.getElementById("pickup-date").value;
            const pickupTime = document.getElementById("pickup-time").value;
            const notes = document.getElementById("message") ? document.getElementById("message").value.trim() : "";
            const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : "Cash";
            const momoTxIdInput = document.getElementById("momo-tx-id");
            const momoTxId = (paymentMethod === "MoMo" && momoTxIdInput) ? momoTxIdInput.value.trim() || "N/A" : "N/A";

            // Validations
            if (!name) return alert("Please enter your full name.");
            if (!phone) return alert("Please enter your phone number.");

            const phonePattern = /^(0\d{9}|\+233\d{9})$/;
            if (!phonePattern.test(phone)) {
                return alert("Please enter a valid Ghanaian phone number (e.g., 0240000000).");
            }

            if (!location) return alert("Please enter your pickup location.");
            if (!pickupDate) return alert("Please select a pickup date.");
            if (!pickupTime) return alert("Please select a pickup time.");

            let total = 0;
            let itemsList = [];

            quantities.forEach(function (quantity) {
                const amount = Number(quantity.value) || 0;
                const price = Number(quantity.dataset.price) || 0;

                if (amount > 0) {
                    const label = quantity.previousElementSibling.textContent.split("(")[0].trim();
                    itemsList.push(`• ${label} × ${amount} = GH₵${(price * amount).toFixed(2)}`);
                    total += price * amount;
                }
            });

            if (itemsList.length === 0) {
                return alert("Please select at least one item before booking.");
            }

            // Generate Ref Number: THEOS-YYYYMMDD-xxxx
            const dateStr = pickupDate.replace(/-/g, "");
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const refNumber = `THEOS-${dateStr}-${randomCode}`;

            // Save Order to LocalStorage
            const orders = getStoredOrders();
            orders[refNumber] = {
                refNumber: refNumber,
                name: name,
                phone: phone,
                location: location,
                date: pickupDate,
                time: pickupTime,
                notes: notes,
                total: total,
                paymentMethod: paymentMethod,
                momoTxId: momoTxId,
                status: "Received"
            };
            saveOrdersToStorage(orders);

            // Construct WhatsApp Message
            let whatsappMsg = `*THEOS LAUNDRY - NEW BOOKING*\n`;
            whatsappMsg += `-----------------------------------\n`;
            whatsappMsg += `*Booking Ref:* ${refNumber}\n`;
            whatsappMsg += `*Customer:* ${name}\n`;
            whatsappMsg += `*Phone:* ${phone}\n`;
            whatsappMsg += `*Location:* ${location}\n`;
            whatsappMsg += `*Pickup:* ${pickupDate} at ${pickupTime}\n`;
            whatsappMsg += `*Payment:* ${paymentMethod}${momoTxId !== 'N/A' ? ' (TxID: ' + momoTxId + ')' : ''}\n`;
            if (notes) whatsappMsg += `*Note:* ${notes}\n`;
            whatsappMsg += `-----------------------------------\n`;
            whatsappMsg += `*Items Ordered:*\n${itemsList.join("\n")}\n`;
            whatsappMsg += `-----------------------------------\n`;
            whatsappMsg += `*ESTIMATED TOTAL:* GH₵${total.toFixed(2)}`;

            currentWhatsappURL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappMsg)}`;

            // Update UI Confirmation View
            if (bookingReferenceEl) bookingReferenceEl.textContent = refNumber;
            if (confirmationTotalEl) confirmationTotalEl.textContent = `Estimated Total: GH₵${total.toFixed(2)}`;

            bookingForm.style.display = "none";
            if (bookingConfirmation) {
                bookingConfirmation.style.display = "block";
                bookingConfirmation.scrollIntoView({ behavior: "smooth" });
            }

            // Refresh Admin View if active
            renderAdminDashboard();
        });
    }

    if (whatsappButton) {
        whatsappButton.addEventListener("click", function () {
            if (currentWhatsappURL) {
                window.open(currentWhatsappURL, "_blank");
            }
        });
    }

    if (newBookingButton) {
        newBookingButton.addEventListener("click", function () {
            if (bookingForm) {
                bookingForm.reset();
                calculateTotal();
                if (momoInstructions) momoInstructions.style.display = "none";
                bookingForm.style.display = "block";
                bookingForm.scrollIntoView({ behavior: "smooth" });
            }
            if (bookingConfirmation) {
                bookingConfirmation.style.display = "none";
            }
        });
    }

    // ----------------------------------------------------
    // 3. ORDER TRACKING SYSTEM
    // ----------------------------------------------------
    if (trackBtn) {
        trackBtn.addEventListener("click", function () {
            const queryRef = trackInput.value.trim().toUpperCase();

            if (!queryRef) {
                alert("Please enter a valid Booking Reference Number.");
                return;
            }

            const orders = getStoredOrders();
            const foundOrder = orders[queryRef];

            if (trackerResult) trackerResult.style.display = "block";
            if (trackerErrorMsg) trackerErrorMsg.textContent = "";

            // Reset step highlights
            Object.values(statusSteps).forEach(step => {
                if (step) step.classList.remove("active");
            });

            if (foundOrder) {
                if (displayRefId) displayRefId.textContent = foundOrder.refNumber;
                if (displayOrderDetails) {
                    displayOrderDetails.textContent = `Customer: ${foundOrder.name} | Total: GH₵${(foundOrder.total || 0).toFixed(2)}`;
                }

                const currentStatus = foundOrder.status || "Received";
                if (statusSteps[currentStatus]) {
                    statusSteps[currentStatus].classList.add("active");
                }
            } else {
                if (displayRefId) displayRefId.textContent = queryRef;
                if (displayOrderDetails) displayOrderDetails.textContent = "";
                if (trackerErrorMsg) {
                    trackerErrorMsg.textContent = "Order reference not found. Please verify your reference number or contact support via WhatsApp.";
                }
            }
        });
    }

    // ----------------------------------------------------
    // 4. ADMIN DASHBOARD & SECURITY
    // ----------------------------------------------------
    function checkAdminAuth() {
        const isAuthenticated = sessionStorage.getItem("theos_admin_auth") === "true";
        if (isAuthenticated) {
            if (adminLoginCard) adminLoginCard.style.display = "none";
            if (adminContentCard) adminContentCard.style.display = "block";
            renderAdminDashboard();
        } else {
            if (adminLoginCard) adminLoginCard.style.display = "block";
            if (adminContentCard) adminContentCard.style.display = "none";
        }
    }

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener("click", function () {
            const enteredPin = adminPinInput.value.trim();
            if (enteredPin === ADMIN_PIN) {
                sessionStorage.setItem("theos_admin_auth", "true");
                if (adminLoginError) adminLoginError.textContent = "";
                adminPinInput.value = "";
                checkAdminAuth();
            } else {
                if (adminLoginError) adminLoginError.textContent = "Incorrect PIN. Please try again.";
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener("click", function () {
            sessionStorage.removeItem("theos_admin_auth");
            checkAdminAuth();
        });
    }

    function renderAdminDashboard() {
        const ordersBody = document.getElementById("admin-orders-body");
        const statTotal = document.getElementById("stat-total-orders");
        const statActive = document.getElementById("stat-active-orders");
        const statRevenue = document.getElementById("stat-revenue");

        if (!ordersBody) return;

        const orders = getStoredOrders();
        const orderKeys = Object.keys(orders);

        ordersBody.innerHTML = "";

        let activeCount = 0;
        let totalRevenue = 0;

        if (orderKeys.length === 0) {
            ordersBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px; color: #64748b;">No bookings found yet.</td></tr>`;
        } else {
            orderKeys.reverse().forEach(ref => {
                const order = orders[ref];
                const orderTotal = order.total || 0;
                totalRevenue += orderTotal;

                if (order.status !== "Delivered") {
                    activeCount++;
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${order.refNumber}</strong></td>
                    <td>${order.name}</td>
                    <td><a href="tel:${order.phone}">${order.phone}</a></td>
                    <td>${order.location}</td>
                    <td>${order.date} @ ${order.time}</td>
                    <td>GH₵${orderTotal.toFixed(2)}</td>
                    <td>
                        <span class="badge ${order.paymentMethod === 'MoMo' ? 'badge-momo' : 'badge-cash'}">
                            ${order.paymentMethod || 'Cash'}
                        </span>
                        ${order.momoTxId && order.momoTxId !== 'N/A' ? `<br><small>TxID: ${order.momoTxId}</small>` : ''}
                    </td>
                    <td>
                        <select class="status-select" data-ref="${order.refNumber}">
                            <option value="Received" ${order.status === "Received" ? "selected" : ""}>Received</option>
                            <option value="Collected" ${order.status === "Collected" ? "selected" : ""}>Collected</option>
                            <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
                            <option value="Ready" ${order.status === "Ready" ? "selected" : ""}>Ready</option>
                            <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                        </select>
                        <button class="delete-btn" data-ref="${order.refNumber}" style="margin-top:5px;">Delete</button>
                    </td>
                `;
                ordersBody.appendChild(tr);
            });
        }

        // Update Dashboard Stats
        if (statTotal) statTotal.textContent = orderKeys.length;
        if (statActive) statActive.textContent = activeCount;
        if (statRevenue) statRevenue.textContent = `GH₵${totalRevenue.toFixed(2)}`;

        // Event Listeners for Status Selects
        document.querySelectorAll(".status-select").forEach(select => {
            select.addEventListener("change", function () {
                const ref = this.dataset.ref;
                const newStatus = this.value;
                let currentOrders = getStoredOrders();

                if (currentOrders[ref]) {
                    currentOrders[ref].status = newStatus;
                    saveOrdersToStorage(currentOrders);
                    renderAdminDashboard();
                }
            });
        });

        // Event Listeners for Delete Buttons
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const ref = this.dataset.ref;
                if (confirm(`Are you sure you want to delete order ${ref}?`)) {
                    let currentOrders = getStoredOrders();
                    delete currentOrders[ref];
                    saveOrdersToStorage(currentOrders);
                    renderAdminDashboard();
                }
            });
        });
    }

    // CSV Export Logic
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", function () {
            const orders = getStoredOrders();
            const orderKeys = Object.keys(orders);

            if (orderKeys.length === 0) {
                alert("No orders available to export.");
                return;
            }

            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Reference,Customer Name,Phone,Location,Pickup Date,Pickup Time,Payment Method,TxID,Total (GHC),Status\n";

            orderKeys.forEach(ref => {
                const o = orders[ref];
                const row = `"${o.refNumber}","${o.name}","${o.phone}","${o.location}","${o.date}","${o.time}","${o.paymentMethod || 'Cash'}","${o.momoTxId || 'N/A'}","${o.total}","${o.status}"`;
                csvContent += row + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `theos_laundry_orders_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Check Admin status on startup
    checkAdminAuth();

    // ----------------------------------------------------
    // 5. PWA & SERVICE WORKER INSTALLATION HANDLER
    // ----------------------------------------------------
    let deferredPrompt;
    const installBanner = document.getElementById("install-banner");
    const installBtn = document.getElementById("install-btn");
    const installClose = document.getElementById("install-close");
    const installIosTip = document.getElementById("install-ios-tip");
    const installAppTip = document.getElementById("install-app-tip");

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent.toLowerCase());
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./service-worker.js")
                .then(reg => console.log("Service Worker registered successfully:", reg.scope))
                .catch(err => console.error("Service Worker registration failed:", err));
        });
    }

    // Handle BeforeInstallPrompt (Android / Chrome / Edge)
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBanner) installBanner.style.display = "flex";
    });

    // iOS Detection
    if (isIos && !isInStandaloneMode) {
        if (installBanner) {
            installBanner.style.display = "flex";
            if (installBtn) installBtn.style.display = "none";
            if (installIosTip) installIosTip.style.display = "inline";
            if (installAppTip) installAppTip.style.display = "none";
        }
    }

    if (installBtn) {
        installBtn.addEventListener("click", async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") {
                    console.log("User accepted PWA installation");
                }
                deferredPrompt = null;
                if (installBanner) installBanner.style.display = "none";
            }
        });
    }

    if (installClose) {
        installClose.addEventListener("click", () => {
            if (installBanner) installBanner.style.display = "none";
        });
    }
});

// 1. Function to redirect/scroll to the review form when clicked
function goToReviewForm() {
  const targetSection = document.getElementById('reviewFormSection');
  const nameInput = document.getElementById('reviewerName');

  if (targetSection) {
    // Smooth scroll down to the review form
    targetSection.scrollIntoView({ behavior: 'smooth' });
    
    // Focus on the name field after scrolling starts
    setTimeout(() => {
      nameInput.focus();
    }, 500);
  }
}

// 2. Dynamic handling when a new review is submitted
document.getElementById('laundryReviewForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('reviewerName').value.trim();
  const ratingVal = document.getElementById('ratingSelect').value;
  const comments = document.getElementById('reviewComments').value.trim();

  if (!name || !comments) return;

  // Build star representation
  const starString = '★'.repeat(ratingVal) + '☆'.repeat(5 - ratingVal);

  // Dynamically create a new card element
  const newCard = document.createElement('div');
  newCard.className = 'review-card clickable-card';
  newCard.onclick = goToReviewForm;
  newCard.innerHTML = `
    <div class="card-header">
      <span class="customer-name">${escapeHtml(name)}</span>
      <span class="badge">Verified Customer</span>
    </div>
    <div class="stars">${starString}</div>
    <p class="review-text">"${escapeHtml(comments)}"</p>
    <div class="card-action">Tap to leave your review →</div>
  `;

  // Prepend new review so all visitors see it at the top
  const grid = document.querySelector('.reviews-grid');
  grid.prepend(newCard);

  // Reset form & show notification
  this.reset();
  const alertBox = document.getElementById('formSuccessAlert');
  alertBox.style.display = 'block';

  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
});

// Helper function to sanitize user inputs
function escapeHtml(str) {
  const tempDiv = document.createElement('div');
  tempDiv.innerText = str;
  return tempDiv.innerHTML;
}

function toggleFaq(buttonElement) {
  const currentItem = buttonElement.parentElement;
  const allItems = document.querySelectorAll('.faq-item');

  // Close all other open FAQ items (Optional: keeps accordion clean)
  allItems.forEach(item => {
    if (item !== currentItem) {
      item.classList.remove('active');
    }
  });

  // Toggle the clicked FAQ item open/close
  currentItem.classList.toggle('active');
}
