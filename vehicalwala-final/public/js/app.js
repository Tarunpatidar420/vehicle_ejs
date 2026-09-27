

const API = "";


// =====================================================
// AUTH 
// ====================================================

const token = () => localStorage.getItem("token");

const headers = () =>
    token()
        ? {
              Authorization: "Bearer " + token(),
          }
        : {};


const esc = (s) =>
    String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            }[c])
    );


const img = (u) =>
    u?.startsWith("http")
        ? u
        : u
        ? "/" + u.replace(/^\//, "")
        : "/assets/car_image1.png";


const money = (n) =>
    "₹" +
    Number(n || 0).toLocaleString("en-IN");


// =====================================================
// API
// =====================================================

async function api(url, opt = {}) {
    const h = {
        ...(opt.headers || {}),
        ...headers(),
    };

    if (
        opt.body &&
        !(opt.body instanceof FormData)
    ) {
        h["Content-Type"] =
            "application/json";

        opt.body = JSON.stringify(
            opt.body
        );
    }

    const r = await fetch(
        API + url,
        {
            ...opt,
            headers: h,
        }
    );

    const d = await r
        .json()
        .catch(() => ({
            success: false,
            message:
                "Invalid server response",
        }));

    if (!r.ok) {
        throw new Error(
            d.message ||
                "Something went wrong"
        );
    }

    return d;
}


// =====================================================
// LOGIN MODAL
// =====================================================

function setLogin(open) {
    const m =
        document.getElementById(
            "loginModal"
        );

    if (!m) return;

    m.classList.toggle(
        "hidden",
        !open
    );

    m.classList.toggle(
        "flex",
        open
    );
}


// =====================================================
// NAVIGATION
// =====================================================

function refreshNav() {
    api("/api/user/data")
        .then((d) => {
            if (!d.success) return;

            localStorage.setItem(
                "user",
                JSON.stringify(d.user)
            );

            document
                .querySelectorAll(
                    "#loginNav,#mobileLogin"
                )
                .forEach(
                    (b) =>
                        (b.textContent =
                            "Logout")
                );

            document
                .querySelectorAll(
                    "#primaryNav,#mobilePrimary"
                )
                .forEach(
                    (b) =>
                        (b.textContent =
                            d.user.isOwner
                                ? "Dashboard"
                                : "List cars")
                );
        })
        .catch(() => {
            localStorage.removeItem(
                "user"
            );
        });
}


// =====================================================
// CATEGORY NORMALIZATION
// =====================================================

function normalizeCategory(value) {
    const text = String(
        value || ""
    )
        .toLowerCase()
        .trim();

    if (!text) return "";

    // BIKE
    if (
        text === "bike" ||
        text.includes("bike") ||
        text.includes("motorcycle")
    ) {
        return "bike";
    }

    // CAR
    if (
        text === "car" ||
        text.includes("car") ||
        text.includes("sedan") ||
        text.includes("suv")
    ) {
        return "car";
    }

    // TRACTOR
    if (
        text === "tractor" ||
        text.includes("tractor")
    ) {
        return "tractor";
    }

    // AGRICULTURE
    if (
        text === "agriculture" ||
        text.includes("agriculture") ||
        text.includes("machinery") ||
        text.includes("machinary") ||
        text.includes("harvester") ||
        text.includes("cultivator") ||
        text.includes("rotavator") ||
        text.includes("reaper") ||
        text.includes("seed drill")
    ) {
        return "agriculture";
    }

    return "";
}


// =====================================================
// GET ALL CATEGORIES OF VEHICLE
// =====================================================

function getVehicleCategories(car) {

    const values = [];

    // ---------------------------------------------
    // category
    // ---------------------------------------------

    if (car.category) {
        values.push(
            car.category
        );
    }


    // ---------------------------------------------
    // categories array
    // ---------------------------------------------

    if (
        Array.isArray(
            car.categories
        )
    ) {
        values.push(
            ...car.categories
        );
    }


    // ---------------------------------------------
    // categories string
    // ---------------------------------------------

    if (
        typeof car.categories ===
        "string"
    ) {
        values.push(
            car.categories
        );
    }


    // ---------------------------------------------
    // NORMALIZE
    // ---------------------------------------------

    return [
        ...new Set(
            values
                .map(
                    normalizeCategory
                )
                .filter(Boolean)
        ),
    ];
}


// =====================================================
// CHECK CATEGORY
// =====================================================

function vehicleMatchesCategory(
    car,
    selected
) {

    if (
        !selected ||
        selected === "All"
    ) {
        return true;
    }

    const wanted =
        normalizeCategory(
            selected
        );

    if (!wanted) return false;

    const categories =
        getVehicleCategories(
            car
        );

    return categories.includes(
        wanted
    );
}


// =====================================================
// VEHICLE CARD
// =====================================================

function renderCard(car) {

    const price =
        car.discount
            ? car.pricePerDay -
              (car.pricePerDay *
                  car.discount) /
                  100
            : car.pricePerDay;


    const offer =
        car.offer || "";


    const categories =
        getVehicleCategories(
            car
        );


    return `
        <article
            class="
                card
                overflow-hidden
                cursor-pointer
                hover:-translate-y-1
                transition
            "
            onclick="
                location.href='/car-details/${car._id}'
            "
        >

            <!-- IMAGE -->
            <div
                class="
                    h-56
                    bg-slate-50
                    flex
                    items-center
                    justify-center
                    relative
                "
            >

                <img
                    src="${esc(
                        img(
                            car.images?.[0]
                        )
                    )}"
                    class="
                        w-full
                        h-full
                        object-cover
                    "
                    alt="${esc(
                        Array.isArray(
                            car.brand
                        )
                            ? car.brand.join(
                                  ", "
                              )
                            : car.brand ||
                                  "Vehicle"
                    )}"
                >

                ${
                    car.discount
                        ? `
                    <span
                        class="
                            absolute
                            top-3
                            left-3
                            bg-red-500
                            text-white
                            px-3
                            py-1
                            rounded-full
                            text-xs
                        "
                    >
                        ${car.discount}% OFF
                    </span>
                `
                        : ""
                }

            </div>


            <!-- CONTENT -->
            <div class="p-5">

                <div
                    class="
                        flex
                        justify-between
                        gap-3
                    "
                >

                    <h3
                        class="
                            font-bold
                            text-lg
                        "
                    >
                        ${esc(
                            Array.isArray(
                                car.brand
                            )
                                ? car.brand.join(
                                      ", "
                                  )
                                : car.brand ||
                                      "Vehicle"
                        )}

                        ${esc(
                            car.model || ""
                        )}
                    </h3>


                    <span
                        class="
                            text-blue-600
                            font-bold
                            whitespace-nowrap
                        "
                    >
                        ${money(
                            price
                        )}/day
                    </span>

                </div>


                <p
                    class="
                        text-gray-500
                        text-sm
                        mt-2
                    "
                >
                    ${esc(
                        car.description ||
                            "Premium rental vehicle"
                    )}
                </p>


                <!-- CATEGORY -->
                <div
                    class="
                        flex
                        flex-wrap
                        gap-2
                        mt-3
                    "
                >

                    ${categories
                        .map(
                            (cat) => `
                            <span
                                class="
                                    text-xs
                                    px-2
                                    py-1
                                    bg-slate-100
                                    rounded-full
                                    capitalize
                                "
                            >
                                ${esc(cat)}
                            </span>
                        `
                        )
                        .join("")}

                </div>


                <!-- DETAILS -->
                <div
                    class="
                        grid
                        grid-cols-3
                        gap-2
                        mt-4
                        text-xs
                        text-gray-500
                    "
                >

                    <span>
                        👥
                        ${
                            car.seating_capacity ||
                            "-"
                        }
                        seats
                    </span>

                    <span>
                        ⛽
                        ${esc(
                            car.fuel_type ||
                                "-"
                        )}
                    </span>

                    <span>
                        ⚙️
                        ${esc(
                            car.transmission ||
                                "-"
                        )}
                    </span>

                </div>


                ${
                    offer
                        ? `
                    <p
                        class="
                            mt-3
                            text-green-600
                            font-semibold
                            text-sm
                        "
                    >
                        ${esc(
                            offer
                        )}
                    </p>
                `
                        : ""
                }

            </div>

        </article>
    `;
}


// =====================================================
// FEATURED VEHICLES
// =====================================================

async function loadFeatured() {

    const el =
        document.getElementById(
            "featuredGrid"
        );

    if (!el) return;


    try {

        const d =
            await api(
                "/api/vehicles/available"
            );


        const cars =
            d.cars || [];


        el.innerHTML =
            cars.length
                ? cars
                      .slice(0, 6)
                      .map(
                          renderCard
                      )
                      .join("")
                : `
                    <p>
                        No vehicles available.
                    </p>
                `;

    } catch (e) {

        el.innerHTML = `
            <p class="text-red-500">
                Unable to load vehicles.
            </p>
        `;
    }
}


// =====================================================
// CARS PAGE
// =====================================================

async function loadCars() {

    const grid =
        document.getElementById(
            "carGrid"
        );

    if (!grid) return;


    let cars = [];


    // -------------------------------------------------
    // LOAD VEHICLES
    // -------------------------------------------------

    try {

        let query = "";


        if (
            window.CARS_PAGE &&
            window.CARS_PAGE.pickupDate
        ) {

            query =
                "?pickupDate=" +
                encodeURIComponent(
                    window.CARS_PAGE
                        .pickupDate
                ) +
                "&returnDate=" +
                encodeURIComponent(
                    window.CARS_PAGE
                        .returnDate
                );
        }


        const d =
            await api(
                "/api/vehicles/available" +
                    query
            );


        cars =
            d.cars || [];

    } catch (e) {

        grid.innerHTML = `
            <p class="text-red-500">
                ${esc(e.message)}
            </p>
        `;

        return;
    }


    // -------------------------------------------------
    // SELECTED CATEGORY
    // -------------------------------------------------

    let selected =
        new URLSearchParams(
            location.search
        ).get("category") ||
        window.CARS_PAGE?.category ||
        "All";


    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    let search = "";


    // -------------------------------------------------
    // RENDER FILTERED VEHICLES
    // -------------------------------------------------

    const render = () => {

        let filtered =
            [...cars];


        // ---------------------------------------------
        // CATEGORY FILTER
        // ---------------------------------------------

        if (
            selected !== "All"
        ) {

            filtered =
                filtered.filter(
                    (car) =>
                        vehicleMatchesCategory(
                            car,
                            selected
                        )
                );
        }


        // ---------------------------------------------
        // SEARCH FILTER
        // ---------------------------------------------

        if (search) {

            const keyword =
                search
                    .toLowerCase()
                    .trim();


            filtered =
                filtered.filter(
                    (car) => {

                        const brand =
                            Array.isArray(
                                car.brand
                            )
                                ? car.brand.join(
                                      " "
                                  )
                                : car.brand ||
                                  "";


                        const categories =
                            Array.isArray(
                                car.categories
                            )
                                ? car.categories.join(
                                      " "
                                  )
                                : car.categories ||
                                  "";


                        const searchable = [
                            brand,
                            car.model,
                            car.category,
                            categories,
                            car.transmission,
                            car.fuel_type,
                            car.description,
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        return searchable.includes(
                            keyword
                        );
                    }
                );
        }


        // ---------------------------------------------
        // SHOW RESULT
        // ---------------------------------------------

        if (!filtered.length) {

            grid.innerHTML = `
                <div
                    class="
                        col-span-full
                        text-center
                        py-16
                    "
                >

                    <p
                        class="
                            text-xl
                            font-semibold
                            text-gray-600
                        "
                    >
                        No ${esc(
                            selected === "All"
                                ? ""
                                : selected
                        )}
                        vehicles found
                    </p>

                    <p
                        class="
                            text-gray-400
                            mt-2
                        "
                    >
                        Try another category
                        or search keyword.
                    </p>

                </div>
            `;

        } else {

            grid.innerHTML =
                filtered
                    .map(
                        renderCard
                    )
                    .join("");
        }


        // ---------------------------------------------
        // COUNT
        // ---------------------------------------------

        const count =
            document.getElementById(
                "carCount"
            );

        if (count) {
            count.textContent =
                filtered.length;
        }


        // ---------------------------------------------
        // ACTIVE CATEGORY BUTTON
        // ---------------------------------------------

        document
            .querySelectorAll(
                ".category-btn"
            )
            .forEach(
                (button) => {

                    const buttonCategory =
                        button.dataset
                            .category;


                    button.classList.toggle(
                        "bg-yellow-200",
                        buttonCategory ===
                            selected
                    );
                }
            );
    };


    // =================================================
    // CATEGORY BUTTONS
    // =================================================

    document
        .querySelectorAll(
            ".category-btn"
        )
        .forEach(
            (button) => {

                button.onclick = () => {

                    selected =
                        button.dataset
                            .category ||
                        "All";


                    // URL update
                    const params =
                        new URLSearchParams(
                            location.search
                        );


                    if (
                        selected ===
                        "All"
                    ) {
                        params.delete(
                            "category"
                        );
                    } else {
                        params.set(
                            "category",
                            selected
                        );
                    }


                    const newUrl =
                        params.toString()
                            ? location.pathname +
                              "?" +
                              params.toString()
                            : location.pathname;


                    window.history.replaceState(
                        {},
                        "",
                        newUrl
                    );


                    render();
                };
            }
        );


    // =================================================
    // SEARCH
    // =================================================

    const searchInput =
        document.getElementById(
            "carSearch"
        );


    if (searchInput) {

        searchInput.oninput =
            (e) => {

                search =
                    e.target.value;

                render();
            };
    }


    // =================================================
    // INITIAL RENDER
    // =================================================

    render();
}


// =====================================================
// VEHICLE DETAILS
// =====================================================

async function loadDetails() {

    const el =
        document.getElementById(
            "details"
        );

    if (!el) return;


    try {

        const d =
            await api(
                "/api/vehicles/" +
                    window.CAR_ID
            );


        if (!d.success) {
            throw new Error(
                d.message
            );
        }


        const car = d.car;


        document
            .getElementById(
                "detailsLoading"
            )
            ?.remove();


        const price =
            car.discount
                ? car.pricePerDay -
                  (car.pricePerDay *
                      car.discount) /
                      100
                : car.pricePerDay;


        el.innerHTML = `
            <div
                class="
                    grid
                    lg:grid-cols-2
                    gap-10
                "
            >

                <div>

                    <img
                        src="${img(
                            car.images?.[0]
                        )}"
                        class="
                            w-full
                            h-80
                            object-cover
                            rounded-2xl
                        "
                    >

                    <div
                        class="
                            grid
                            grid-cols-4
                            gap-2
                            mt-3
                        "
                    >

                        ${
                            (
                                car.images ||
                                []
                            )
                                .map(
                                    (x) => `
                                    <img
                                        src="${img(
                                            x
                                        )}"
                                        class="
                                            h-20
                                            w-full
                                            object-cover
                                            rounded
                                        "
                                    >
                                `
                                )
                                .join("")
                        }

                    </div>

                </div>


                <div>

                    <p
                        class="
                            text-blue-600
                            font-semibold
                        "
                    >
                        ${
                            Array.isArray(
                                car.categories
                            )
                                ? car.categories.join(
                                      " • "
                                  )
                                : car.category ||
                                  ""
                        }
                    </p>


                    <h1
                        class="
                            text-4xl
                            font-bold
                            mt-2
                        "
                    >
                        ${esc(
                            Array.isArray(
                                car.brand
                            )
                                ? car.brand.join(
                                      ", "
                                  )
                                : car.brand
                        )}

                        ${esc(
                            car.model
                        )}
                    </h1>


                    <p
                        class="
                            text-gray-600
                            mt-4
                        "
                    >
                        ${esc(
                            car.description
                        )}
                    </p>


                    <div
                        class="
                            grid
                            grid-cols-2
                            gap-3
                            mt-6
                        "
                    >

                        <div
                            class="
                                p-3
                                bg-slate-50
                                rounded
                            "
                        >
                            Year:
                            <b>
                                ${car.year || "-"}
                            </b>
                        </div>


                        <div
                            class="
                                p-3
                                bg-slate-50
                                rounded
                            "
                        >
                            Seats:
                            <b>
                                ${
                                    car.seating_capacity ||
                                    "-"
                                }
                            </b>
                        </div>


                        <div
                            class="
                                p-3
                                bg-slate-50
                                rounded
                            "
                        >
                            Fuel:
                            <b>
                                ${esc(
                                    car.fuel_type ||
                                        "-"
                                )}
                            </b>
                        </div>


                        <div
                            class="
                                p-3
                                bg-slate-50
                                rounded
                            "
                        >
                            Transmission:
                            <b>
                                ${esc(
                                    car.transmission ||
                                        "-"
                                )}
                            </b>
                        </div>

                    </div>


                    <div class="mt-6">

                        <label>
                            Pickup Date
                        </label>

                        <input
                            id="pickup"
                            type="date"
                            class="
                                border
                                p-3
                                rounded
                                w-full
                                mt-1
                            "
                        >


                        <label
                            class="
                                block
                                mt-3
                            "
                        >
                            Return Date
                        </label>

                        <input
                            id="return"
                            type="date"
                            class="
                                border
                                p-3
                                rounded
                                w-full
                                mt-1
                            "
                        >


                        <div
                            class="
                                flex
                                justify-between
                                items-center
                                mt-6
                            "
                        >

                            <div>

                                <span
                                    class="
                                        text-3xl
                                        font-bold
                                        text-blue-600
                                    "
                                >
                                    ${money(
                                        price
                                    )}
                                </span>

                                /day

                            </div>


                            <button
                                id="bookBtn"
                                class="
                                    bg-blue-600
                                    text-white
                                    px-7
                                    py-3
                                    rounded-lg
                                "
                            >
                                Book Now
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        `;


        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        const pickupInput =
            document.getElementById(
                "pickup"
            );

        const returnInput =
            document.getElementById(
                "return"
            );

        const bookButton =
            document.getElementById(
                "bookBtn"
            );


        pickupInput.min =
            today;

        returnInput.min =
            today;


        pickupInput.onchange =
            () => {
                returnInput.min =
                    pickupInput.value ||
                    today;
            };


        bookButton.onclick =
            () => {

                if (
                    !pickupInput.value ||
                    !returnInput.value
                ) {
                    return alert(
                        "Please select pickup and return dates first!"
                    );
                }


                if (
                    new Date(
                        returnInput.value
                    ) <=
                    new Date(
                        pickupInput.value
                    )
                ) {
                    return alert(
                        "Return date must be after pickup date"
                    );
                }


                openBooking(
                    car,
                    pickupInput.value,
                    returnInput.value
                );
            };

    } catch (e) {

        const loading =
            document.getElementById(
                "detailsLoading"
            );

        if (loading) {
            loading.textContent =
                e.message;
        }
    }
}


// =====================================================
// BOOKING MODAL
// =====================================================

function openBooking(
    car,
    pickupDate,
    returnDate
) {

    const m =
        document.getElementById(
            "bookingModal"
        );

    if (!m) return;


    m.classList.remove(
        "hidden"
    );

    m.classList.add("flex");


    m.dataset.car =
        car._id;

    m.dataset.pickup =
        pickupDate;

    m.dataset.return =
        returnDate;
}


function closeBooking() {

    const m =
        document.getElementById(
            "bookingModal"
        );

    if (!m) return;


    m.classList.add(
        "hidden"
    );

    m.classList.remove(
        "flex"
    );
}


// =====================================================
// SUBMIT BOOKING
// =====================================================

async function submitBooking(e) {

    e.preventDefault();


    if (!token()) {

        closeBooking();

        return setLogin(
            true
        );
    }


    const m =
        document.getElementById(
            "bookingModal"
        );


    const f =
        new FormData(
            e.target
        );


    const body =
        Object.fromEntries(
            f.entries()
        );


    body.car =
        m.dataset.car;

    body.pickupDate =
        m.dataset.pickup;

    body.returnDate =
        m.dataset.return;


    try {

        const d =
            await api(
                "/api/bookings/create",
                {
                    method: "POST",
                    body,
                }
            );


        alert(
            d.message ||
                "Booking confirmed"
        );



        if (d.success) {

            e.target.reset();

            closeBooking();
        }

    } catch (x) {

        alert(
            x.message
        );
    }
}


// =====================================================
// USER BOOKINGS
// =====================================================

async function loadBookings() {

    const el =
        document.getElementById(
            "bookingsGrid"
        );


    if (!el) return;


    if (!token()) {

        el.innerHTML = `
            <div
                class="
                    card
                    p-8
                    text-center
                "
            >
                <p>
                    Please login to view your bookings.
                </p>

                <button
                    class="
                        mt-4
                        bg-blue-600
                        text-white
                        px-5
                        py-2
                        rounded
                    "
                    onclick="setLogin(true)"
                >
                    Login
                </button>
            </div>
        `;

        return;
    }


    try {

        const d =
            await api(
                "/api/bookings/user"
            );


        const bookings =
            d.bookings || [];


        el.innerHTML =
            bookings.length
                ? bookings
                      .map(
                          (b) => {

                              const c =
                                  b.car ||
                                  {};


                              return `
                                <article
                                    class="
                                        card
                                        p-5
                                    "
                                >

                                    <div
                                        class="
                                            grid
                                            md:grid-cols-[220px_1fr_auto]
                                            gap-5
                                            items-center
                                        "
                                    >

                                        <img
                                            src="${img(
                                                c.images?.[0]
                                            )}"
                                            class="
                                                h-44
                                                w-full
                                                object-cover
                                                rounded-lg
                                            "
                                        >


                                        <div>

                                            <h2
                                                class="
                                                    text-xl
                                                    font-bold
                                                "
                                            >
                                                ${esc(
                                                    Array.isArray(
                                                        c.brand
                                                    )
                                                        ? c.brand.join(
                                                              ", "
                                                          )
                                                        : c.brand
                                                )}

                                                ${esc(
                                                    c.model
                                                )}
                                            </h2>


                                            <span
                                                class="
                                                    inline-block
                                                    mt-2
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    text-sm
                                                    bg-slate-100
                                                "
                                            >
                                                ${esc(
                                                    b.status
                                                )}
                                            </span>


                                            <p
                                                class="
                                                    mt-4
                                                    text-gray-500
                                                "
                                            >
                                                Rental Period
                                            </p>


                                            <b>
                                                ${
                                                    new Date(
                                                        b.pickupDate
                                                    ).toLocaleDateString()
                                                }

                                                →

                                                ${
                                                    new Date(
                                                        b.returnDate
                                                    ).toLocaleDateString()
                                                }
                                            </b>

                                        </div>


                                        <div
                                            class="
                                                flex
                                                flex-col
                                                gap-2
                                            "
                                        >

                                            <button
                                                class="
                                                    bg-slate-700
                                                    text-white
                                                    px-4
                                                    py-2
                                                    rounded
                                                "
                                                onclick='viewCar(${JSON.stringify(
                                                    c
                                                )})'
                                            >
                                                View Vehicle Info
                                            </button>


                                            ${
                                                b.status !==
                                                "cancelled"
                                                    ? `
                                                        <button
                                                            class="
                                                                bg-blue-500
                                                                text-white
                                                                px-4
                                                                py-2
                                                                rounded
                                                            "
                                                            onclick='exchangeBooking(${JSON.stringify(
                                                                b
                                                            )})'
                                                        >
                                                            Exchange Vehicle
                                                        </button>

                                                        <button
                                                            class="
                                                                bg-red-500
                                                                text-white
                                                                px-4
                                                                py-2
                                                                rounded
                                                            "
                                                            onclick="cancelBooking('${b._id}')"
                                                        >
                                                            Cancel Booking
                                                        </button>
                                                    `
                                                    : `
                                                        <button
                                                            class="
                                                                bg-red-600
                                                                text-white
                                                                px-4
                                                                py-2
                                                                rounded
                                                            "
                                                            onclick="deleteBooking('${b._id}')"
                                                        >
                                                            Delete Booking
                                                        </button>
                                                    `
                                            }


                                            <div
                                                class="
                                                    text-right
                                                    mt-2
                                                "
                                            >
                                                <span
                                                    class="
                                                        text-2xl
                                                        font-bold
                                                        text-blue-600
                                                    "
                                                >
                                                    ${money(
                                                        b.price
                                                    )}
                                                </span>
                                            </div>

                                        </div>

                                    </div>

                                </article>
                            `;
                          }
                      )
                      .join("")
                : `
                    <div
                        class="
                            card
                            p-8
                            text-center
                        "
                    >
                        No bookings found.
                    </div>
                `;
    } catch (e) {

        el.innerHTML = `
            <p class="text-red-500">
                ${esc(e.message)}
            </p>
        `;
    }
}


// =====================================================
// CANCEL BOOKING
// =====================================================

async function cancelBooking(id) {

    if (
        !confirm(
            "Cancel this booking?"
        )
    ) {
        return;
    }


    try {

        const d =
            await api(
                "/api/bookings/" +
                    id +
                    "/cancel",
                {
                    method: "DELETE",
                }
            );


        alert(
            d.message
        );


        loadBookings();

    } catch (e) {

        alert(
            e.message
        );
    }
}


// =====================================================
// DELETE BOOKING
// =====================================================

// =====================================================
// DELETE USER BOOKING
// =====================================================

async function deleteBooking(id) {

    if (
        !confirm(
            "Delete this cancelled booking?"
        )
    ) {
        return;
    }

    try {

        const d = await api(
            "/api/bookings/user-delete/" + id,
            {
                method: "DELETE",
            }
        );

        alert(
            d.message ||
            "Booking deleted successfully"
        );

        loadBookings();

    } catch (e) {

        console.error(
            "Delete booking error:",
            e
        );

        alert(
            e.message ||
            "Unable to delete booking"
        );
    }
}


// =====================================================
// GENERIC MODAL
// =====================================================

function showGeneric(html) {

    const modal =
        document.getElementById(
            "genericModal"
        );

    const content =
        document.getElementById(
            "genericContent"
        );


    if (!modal || !content)
        return;


    content.innerHTML =
        html;


    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );
}


function closeGeneric() {

    const modal =
        document.getElementById(
            "genericModal"
        );


    if (!modal) return;


    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );
}


// =====================================================
// VIEW VEHICLE
// =====================================================

function viewCar(c) {

    showGeneric(`

        <div
            class="
                flex
                justify-between
            "
        >

            <h2
                class="
                    text-2xl
                    font-bold
                "
            >
                ${esc(
                    Array.isArray(
                        c.brand
                    )
                        ? c.brand.join(
                              ", "
                          )
                        : c.brand
                )}

                ${esc(
                    c.model
                )}
            </h2>


            <button
                onclick="closeGeneric()"
                class="
                    bg-red-500
                    text-white
                    px-3
                    py-1
                    rounded
                "
            >
                Close
            </button>

        </div>


        <div
            class="
                grid
                md:grid-cols-2
                gap-4
                mt-5
            "
        >

            ${
                (
                    c.images ||
                    []
                )
                    .map(
                        (x) => `
                            <img
                                src="${img(
                                    x
                                )}"
                                class="
                                    w-full
                                    h-56
                                    object-cover
                                    rounded
                                "
                            >
                        `
                    )
                    .join("")
            }

        </div>


        <div
            class="
                grid
                md:grid-cols-2
                gap-3
                mt-5
                text-sm
            "
        >

            <p>
                <b>Brand:</b>
                ${esc(
                    Array.isArray(
                        c.brand
                    )
                        ? c.brand.join(
                              ", "
                          )
                        : c.brand
                )}
            </p>


            <p>
                <b>Model:</b>
                ${esc(
                    c.model
                )}
            </p>


            <p>
                <b>Year:</b>
                ${c.year || "-"}
            </p>


            <p>
                <b>Fuel:</b>
                ${esc(
                    c.fuel_type ||
                        "-"
                )}
            </p>


            <p>
                <b>Transmission:</b>
                ${esc(
                    c.transmission ||
                        "-"
                )}
            </p>


            <p>
                <b>Seats:</b>
                ${
                    c.seating_capacity ||
                    "-"
                }
            </p>


            <p>
                <b>Price:</b>
                ${money(
                    c.pricePerDay
                )}
            </p>


            <p>
                <b>Available:</b>
                ${
                    c.availableCount ??
                    "-"
                }
            </p>


            <p>
                <b>Email:</b>
                ${esc(
                    c.email ||
                        "-"
                )}
            </p>


            <p>
                <b>Whatsapp:</b>
                ${esc(
                    c.whatsapp ||
                        "-"
                )}
            </p>


            <p
                class="
                    md:col-span-2
                "
            >
                <b>Description:</b>
                ${esc(
                    c.description ||
                        "-"
                )}
            </p>

        </div>
    `);
}


// =====================================================
// EXCHANGE BOOKING
// =====================================================

async function exchangeBooking(b) {

    try {

        const d =
            await api(
                "/api/vehicles/available" +
                    "?pickupDate=" +
                    encodeURIComponent(
                        b.pickupDate
                    ) +
                    "&returnDate=" +
                    encodeURIComponent(
                        b.returnDate
                    )
            );


        const cars =
            (d.cars || []).filter(
                (c) =>
                    String(
                        c._id
                    ) !==
                    String(
                        b.car?._id
                    )
            );


        showGeneric(`

            <h2
                class="
                    text-xl
                    font-bold
                "
            >
                Select New Vehicle
            </h2>


            <div
                class="
                    grid
                    md:grid-cols-2
                    gap-4
                    mt-5
                "
            >

                ${cars
                    .map(
                        (c) => `
                            <div
                                class="
                                    border
                                    rounded
                                    p-3
                                "
                            >

                                <img
                                    src="${img(
                                        c.images?.[0]
                                    )}"
                                    class="
                                        h-40
                                        w-full
                                        object-cover
                                        rounded
                                    "
                                >

                                <h3
                                    class="
                                        font-semibold
                                        mt-2
                                    "
                                >
                                    ${esc(
                                        Array.isArray(
                                            c.brand
                                        )
                                            ? c.brand.join(
                                                  ", "
                                              )
                                            : c.brand
                                    )}

                                    ${esc(
                                        c.model
                                    )}
                                </h3>


                                <button
                                    onclick="
                                        doExchange(
                                            '${b._id}',
                                            '${c._id}'
                                        )
                                    "
                                    class="
                                        mt-3
                                        w-full
                                        bg-blue-500
                                        text-white
                                        py-2
                                        rounded
                                    "
                                >
                                    Select
                                </button>

                            </div>
                        `
                    )
                    .join("")}

            </div>


            <button
                onclick="closeGeneric()"
                class="
                    mt-5
                    bg-gray-500
                    text-white
                    px-5
                    py-2
                    rounded
                "
            >
                Close
            </button>

        `);

    } catch (e) {

        alert(
            e.message
        );
    }
}


// =====================================================
// DO EXCHANGE
// =====================================================

async function doExchange(
    bookingId,
    carId
) {

    try {

        const d =
            await api(
                "/api/bookings/" +
                    bookingId +
                    "/exchange",
                {
                    method: "PUT",
                    body: {
                        newCarId:
                            carId,
                    },
                }
            );


        alert(
            d.message
        );


        closeGeneric();

        loadBookings();

    } catch (e) {

        alert(
            e.message
        );
    }
}


// =====================================================
// AUTH SUBMIT
// =====================================================

async function authSubmit(e) {

    e.preventDefault();


    const mode =
        document.getElementById(
            "authTitle"
        ).textContent ===
        "Login"
            ? "login"
            : "register";


    const email =
        authEmail.value;


    const body = {
        email,
        password:
            authPassword.value,
    };


    if (
        mode ===
        "register"
    ) {
        body.name =
            authName.value;
    }


    if (
        mode === "login" &&
        email.toLowerCase() ===
            "tarunpatidarrupariya@gmail.com"
    ) {
        body.dashboardKey =
            dashboardKey.value;
    }


    try {

        const d =
            await api(
                "/api/user/" +
                    mode,
                {
                    method: "POST",
                    body,
                }
            );


        if (!d.success) {
            return alert(
                d.message
            );
        }


        localStorage.setItem(
            "token",
            d.token
        );


        setLogin(false);


        if (d.isOwner) {
            location.href =
                "/owner";
        } else {
            location.reload();
        }

    } catch (x) {

        alert(
            x.message
        );
    }
}


// =====================================================
// AUTH INITIALIZATION
// =====================================================

function initAuth() {

    document
        .getElementById(
            "loginForm"
        )
        ?.addEventListener(
            "submit",
            authSubmit
        );


    document
        .getElementById(
            "closeLogin"
        )
        ?.addEventListener(
            "click",
            () =>
                setLogin(
                    false
                )
        );


    document
        .getElementById(
            "togglePassword"
        )
        ?.addEventListener(
            "click",
            () =>
                (authPassword.type =
                    authPassword.type ===
                    "password"
                        ? "text"
                        : "password")
        );


    document
        .getElementById(
            "authSwitch"
        )
        ?.addEventListener(
            "click",
            () => {

                const reg =
                    authTitle.textContent ===
                    "Login";


                authTitle.textContent =
                    reg
                        ? "Create Account"
                        : "Login";


                authName.classList.toggle(
                    "hidden",
                    !reg
                );


                dashboardKey.classList.add(
                    "hidden"
                );


                forgotLink.classList.toggle(
                    "hidden",
                    reg
                );


                authSwitchText.textContent =
                    reg
                        ? "Already have account?"
                        : "Create account?";


                authSwitch.textContent =
                    "click here";


                authSubmit.textContent =
                    reg
                        ? "Create Account"
                        : "Login";
            }
        );


    authEmail?.addEventListener(
        "input",
        () => {

            dashboardKey.classList.toggle(
                "hidden",
                authEmail.value
                    .toLowerCase() !==
                    "tarunpatidarrupariya@gmail.com"
            );
        }
    );
}


// =====================================================
// INIT
// =====================================================

function init() {

    initAuth();

    refreshNav();

    loadFeatured();

    loadCars();

    loadDetails();

    loadBookings();


    // HOME SEARCH

    document
        .getElementById(
            "homeSearch"
        )
        ?.addEventListener(
            "click",
            () => {

                const p =
                    new URLSearchParams({
                        pickupLocation:
                            homeLocation.value,

                        pickupDate:
                            homePickup.value,

                        returnDate:
                            homeReturn.value,
                    });


                location.href =
                    "/cars?" +
                    p.toString();
            }
        );


    // CONTACT FORM

    document
        .getElementById(
            "contactForm"
        )
        ?.addEventListener(
            "submit",
            async (e) => {

                e.preventDefault();


                try {

                    const d =
                        await api(
                            "/api/contact",
                            {
                                method:
                                    "POST",

                                body:
                                    Object.fromEntries(
                                        new FormData(
                                            e.target
                                        ).entries()
                                    ),
                            }
                        );


                    alert(
                        d.message
                    );


                    if (d.success) {
                        e.target.reset();
                    }

                } catch (error) {

                    alert(
                        error.message
                    );
                }
            }
        );


    // BOOKING MODAL

    document
        .getElementById(
            "closeBooking"
        )
        ?.addEventListener(
            "click",
            closeBooking
        );


    document
        .getElementById(
            "bookingForm"
        )
        ?.addEventListener(
            "submit",
            submitBooking
        );


    // FORGOT PASSWORD

    document
        .getElementById(
            "forgotForm"
        )
        ?.addEventListener(
            "submit",
            async (e) => {

                e.preventDefault();


                try {

                    const d =
                        await api(
                            "/api/auth/forgot-password",
                            {
                                method:
                                    "POST",

                                body:
                                    Object.fromEntries(
                                        new FormData(
                                            e.target
                                        ).entries()
                                    ),
                            }
                        );


                    forgotResult.textContent =
                        d.message;


                    if (d.token) {

                        forgotResult.innerHTML += `
                            <br>
                            <a
                                class="text-blue-600"
                                href="/reset-password/${d.token}"
                            >
                                Open reset page
                            </a>
                        `;
                    }

                } catch (error) {

                    forgotResult.textContent =
                        error.message;
                }
            }
        );


    // RESET PASSWORD

    document
        .getElementById(
            "resetForm"
        )
        ?.addEventListener(
            "submit",
            async (e) => {

                e.preventDefault();


                try {

                    const d =
                        await api(
                            "/api/auth/reset-password/" +
                                window.RESET_TOKEN,
                            {
                                method:
                                    "POST",

                                body:
                                    Object.fromEntries(
                                        new FormData(
                                            e.target
                                        ).entries()
                                    ),
                            }
                        );


                    resetResult.textContent =
                        d.message;


                    if (d.success) {

                        setTimeout(
                            () =>
                                (location.href =
                                    "/"),
                            800
                        );
                    }

                } catch (error) {

                    resetResult.textContent =
                        error.message;
                }
            }
        );


    // LOGIN / LOGOUT

    [
        "loginNav",
        "mobileLogin",
    ].forEach(
        (id) => {

            document
                .getElementById(id)
                ?.addEventListener(
                    "click",
                    () => {

                        if (token()) {

                            localStorage.removeItem(
                                "token"
                            );

                            location.reload();

                        } else {

                            setLogin(
                                true
                            );
                        }
                    }
                );
        }
    );


    // PRIMARY NAV

    [
        "primaryNav",
        "mobilePrimary",
    ].forEach(
        (id) => {

            document
                .getElementById(id)
                ?.addEventListener(
                    "click",
                    async () => {

                        if (!token()) {
                            return setLogin(
                                true
                            );
                        }


                        try {

                            const d =
                                await api(
                                    "/api/user/data"
                                );


                            location.href =
                                d.user?.isOwner
                                    ? "/owner"
                                    : "/cars";

                        } catch (e) {

                            alert(
                                e.message
                            );
                        }
                    }
                );
        }
    );


    // MOBILE MENU

    document
        .getElementById(
            "menuBtn"
        )
        ?.addEventListener(
            "click",
            () =>
                mobileNav.classList.remove(
                    "hidden"
                )
        );


    document
        .getElementById(
            "closeMobile"
        )
        ?.addEventListener(
            "click",
            () =>
                mobileNav.classList.add(
                    "hidden"
                )
        );
}


// =====================================================
// 
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    init
);