// Lukkas Barbers
//
// Edit the services and products below to change what shows on the page.
// The rest of the file builds the page from those lists.


// ---------------------------------------------------------------
// Data
// ---------------------------------------------------------------

// priceLabel is the text visitors see. minPrice is the lowest price as a
// number, or null when the price isn't listed. bookable: false keeps a
// service out of the booking form.
const services = [
  { group: "Haircuts", name: "Haircut", minPrice: 350, priceLabel: "from ₱350" },
  { group: "Haircuts", name: "Premium cut", minPrice: 350, priceLabel: "₱350" },
  { group: "Haircuts", name: "Cuts for tots", minPrice: 300, priceLabel: "₱300" },

  { group: "Shaves and beards", name: "Shaves", minPrice: 200, priceLabel: "₱200 to ₱350" },
  { group: "Shaves and beards", name: "Beard grooming", minPrice: null, priceLabel: "Ask in store" },

  { group: "Color and perms", name: "Perms", minPrice: 1950, priceLabel: "₱1,950 to ₱2,200" },
  { group: "Color and perms", name: "Color", minPrice: 750, priceLabel: "₱750 to ₱1,800" },
  { group: "Color and perms", name: "Highlights", minPrice: null, priceLabel: "Ask in store" },

  { group: "Treatments and extras", name: "Threading", minPrice: 250, priceLabel: "₱250" },
  { group: "Treatments and extras", name: "Hair art", minPrice: 650, priceLabel: "₱650" },
  {
    group: "Treatments and extras",
    name: "Scalp care",
    minPrice: 250,
    priceLabel: "₱250 to ₱900",
    note: "Price depends on hair length.",
  },
  { group: "Treatments and extras", name: "Add-ons", minPrice: 50, priceLabel: "₱50", bookable: false },
];

const products = [
  { name: "Chico", brand: "Pañero", details: "Strong hold, oil based, 50 g", image: "images/pomade-chico.webp" },
  { name: "Primo", brand: "Pañero", details: "Medium grip, oil based, 50 g", image: "images/pomade-primo.webp" },
  { name: "Classico", brand: "Pañero", details: "Styling hold, oil based, 50 g", image: "images/pomade-classico.webp" },
  { name: "Frost Bite", brand: "Eight Wolves", details: "Hair pomade", image: "images/pomade-frost-bite.webp" },
  { name: "Cherry Bomb", brand: "Eight Wolves", details: "Hair pomade", image: "images/pomade-cherry-bomb.webp" },
  { name: "Crazy Eight", brand: "Eight Wolves", details: "Hair pomade", image: "images/pomade-crazy-eight.webp" },
  { name: "Sour Blue", brand: "Eight Wolves", details: "Hair pomade", image: "images/pomade-sour-blue.webp" },
];


// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function byId(id) {
  return document.getElementById(id);
}

// 13 -> "1:00 pm"
function formatHour(hour) {
  const displayHour = hour % 12 || 12;
  const suffix = hour < 12 ? "am" : "pm";
  return `${displayHour}:00 ${suffix}`;
}

// Date -> "Wed 11"
function formatDay(date) {
  return date.toLocaleDateString("en-PH", { weekday: "short", day: "numeric" });
}

function getNextDays(count) {
  const days = [];

  for (let i = 0; i < count; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    days.push(day);
  }

  return days;
}


// ---------------------------------------------------------------
// Price list
// ---------------------------------------------------------------

function serviceRowHtml(service) {
  const note = service.note
    ? `<small class="service-note">${service.note}</small>`
    : "";

  return `
    <li>
      <span class="service-name">${service.name}${note}</span>
      <span class="service-price">${service.priceLabel}</span>
    </li>`;
}

function serviceGroupHtml(groupName) {
  const rows = services
    .filter(service => service.group === groupName)
    .map(serviceRowHtml)
    .join("");

  return `
    <div class="service-group">
      <h3>${groupName}</h3>
      <ul>${rows}</ul>
    </div>`;
}

function renderServices() {
  // Groups show up in the order they first appear in the services list
  const groupNames = [...new Set(services.map(service => service.group))];

  byId("services-list").innerHTML = groupNames.map(serviceGroupHtml).join("");
}


// ---------------------------------------------------------------
// Products
// ---------------------------------------------------------------

function productHtml(product) {
  return `
    <div class="product">
      <img src="${product.image}" width="130" height="130" alt="${product.brand} ${product.name} pomade tin">
      <h3>${product.name}</h3>
      <small>${product.brand}<br>${product.details}</small>
    </div>`;
}

function renderProducts() {
  byId("products-list").innerHTML = products.map(productHtml).join("");
}


// ---------------------------------------------------------------
// Booking form
// ---------------------------------------------------------------

// Hours the shop takes bookings, in 24-hour time
const bookingHours = [10, 11, 12, 13, 14, 15, 16, 17, 18];

const bookableServices = services.filter(service => service.bookable !== false);
const bookingDays = getNextDays(7);

// What the visitor has picked so far (null means nothing yet)
const selection = {
  serviceIndex: 0,
  dayIndex: null,
  hour: null,
};

// Demo only: marks a few slots as taken so the form looks realistic.
// Replace this with real availability once a booking system is connected.
function isSlotTaken(dayIndex, hour) {
  return (dayIndex * 7 + hour * 3) % 5 === 0;
}

function createOption(label, isSelected, isDisabled, onClick) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "option";
  button.textContent = label;
  button.disabled = isDisabled;
  button.setAttribute("aria-pressed", String(isSelected));
  button.addEventListener("click", onClick);

  return button;
}

function renderServiceOptions() {
  const buttons = bookableServices.map((service, index) => {
    const isSelected = selection.serviceIndex === index;

    return createOption(service.name, isSelected, false, () => {
      selection.serviceIndex = index;
      renderBooking();
    });
  });

  byId("service-options").replaceChildren(...buttons);
}

function renderDayOptions() {
  const buttons = bookingDays.map((day, index) => {
    const isSelected = selection.dayIndex === index;

    return createOption(formatDay(day), isSelected, false, () => {
      selection.dayIndex = index;
      selection.hour = null; // the old time may not be free on the new day
      renderBooking();
    });
  });

  byId("day-options").replaceChildren(...buttons);
}

function renderTimeOptions() {
  const buttons = bookingHours.map(hour => {
    const isSelected = selection.hour === hour;
    const isUnavailable =
      selection.dayIndex === null || isSlotTaken(selection.dayIndex, hour);

    return createOption(formatHour(hour), isSelected, isUnavailable, () => {
      selection.hour = hour;
      renderBooking();
    });
  });

  byId("time-options").replaceChildren(...buttons);
}

function renderSummary() {
  const summary = byId("booking-summary");
  const submitButton = byId("booking-submit");
  const isComplete = selection.dayIndex !== null && selection.hour !== null;

  submitButton.disabled = !isComplete;

  if (!isComplete) {
    summary.textContent =
      selection.dayIndex === null
        ? "Choose a day to see open times."
        : "Choose a time.";
    return;
  }

  const service = bookableServices[selection.serviceIndex];
  const day = formatDay(bookingDays[selection.dayIndex]);
  const time = formatHour(selection.hour);
  const price = service.minPrice ? service.priceLabel : "price confirmed in store";

  summary.textContent = `${service.name} on ${day} at ${time}, ${price}`;
}

function renderBooking() {
  renderServiceOptions();
  renderDayOptions();
  renderTimeOptions();
  renderSummary();
}

// This only shows a message for now. A real version would send the request
// to the shop (a booking service, or a Messenger message with the details).
byId("booking-submit").addEventListener("click", () => {
  byId("booking-summary").textContent =
    "Demo only: this is where the request would be sent to the shop.";
});


// ---------------------------------------------------------------
// Menu (burger button)
// ---------------------------------------------------------------

const menuButton = byId("menu-button");
const menu = byId("site-menu");

function setMenuOpen(isOpen) {
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menu.hidden = !isOpen;
}

menuButton.addEventListener("click", event => {
  // Stop the click reaching the document, or the handler below would close the menu again straight away
  event.stopPropagation();
  setMenuOpen(menu.hidden);
});

// Close after choosing a link
menu.addEventListener("click", event => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

// Close when clicking anywhere outside the menu
document.addEventListener("click", event => {
  if (!menu.hidden && !menu.contains(event.target)) {
    setMenuOpen(false);
  }
});

// Close with the Escape key and put focus back on the button
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !menu.hidden) {
    setMenuOpen(false);
    menuButton.focus();
  }
});


// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------

renderServices();
renderProducts();
renderBooking();
