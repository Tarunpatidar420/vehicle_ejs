const API = "/api";

// =====================================================
// GLOBAL DATA
// =====================================================

let ownerCarsData = [];
let ownerBookingsData = [];


// =====================================================
// API 
// =====================================================

async function api(url, options = {}) {

    const token = localStorage.getItem("token");

    const headers = {
        ...(token
            ? {
                Authorization: `Bearer ${token}`
            }
            : {}),
        ...(options.headers || {})
    };

    // FormData ke saath Content-Type manually set nahi karna
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
}



function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHtml(value);
}


// =====================================================
// DATE HELPERS
// =====================================================

function formatDate(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatDateTime(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// =====================================================
// COMMON
// =====================================================

function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// =====================================================
// CATEGORY
// =====================================================

function normalizeCategory(category) {

    const value =
        String(category || "")
            .toLowerCase()
            .trim();

    if (value.includes("bike")) {
        return "Bike";
    }

    if (value.includes("car")) {
        return "Car";
    }

    if (value.includes("tractor")) {
        return "Tractor";
    }

    if (
        value.includes("agriculture") ||
        value.includes("machinery") ||
        value.includes("machinary")
    ) {
        return "Agriculture";
    }

    return "Other";
}


function getVehicleCategory(car) {

    if (!car) {
        return "Other";
    }

    if (Array.isArray(car.categories)) {

        for (const category of car.categories) {

            const normalized =
                normalizeCategory(category);

            if (normalized !== "Other") {
                return normalized;
            }
        }
    }

    if (typeof car.categories === "string") {

        const categories =
            car.categories
                .split(",")
                .map(item => item.trim());

        for (const category of categories) {

            const normalized =
                normalizeCategory(category);

            if (normalized !== "Other") {
                return normalized;
            }
        }
    }

    return normalizeCategory(car.category);
}


// =====================================================
// VEHICLE IMAGE
// =====================================================

function getVehicleImage(car) {

    if (
        car &&
        Array.isArray(car.images) &&
        car.images.length > 0
    ) {
        return car.images[0];
    }

    return "/assets/car_image5.png";
}


// =====================================================
// LOCATION
// =====================================================

function getLocation(car) {

    return car && car.location
        ? car.location
        : {};
}


function locationValue(location, keys) {

    location = location || {};

    for (const key of keys) {

        if (
            location[key] !== undefined &&
            location[key] !== null &&
            String(location[key]).trim() !== ""
        ) {
            return location[key];
        }
    }

    return "";
}


// =====================================================
// ADD VEHICLE
// =====================================================

async function addVehicle(event) {

    event.preventDefault();

    const form = event.target;

    if (!form) {
        return;
    }


    // ---------------------------------------------
    // READ FORM FIELD
    // ---------------------------------------------

    const get = name => {

        const field =
            form.elements[name];

        if (!field) {
            return "";
        }

        return String(field.value || "").trim();
    };


    // ---------------------------------------------
    // BASIC VALUES
    // ---------------------------------------------

    const brand = get("brand");

    const model = get("model");

    const category =
        get("categories") ||
        get("category");


    const year =
        Number(get("year"));


    const seatingCapacity =
        Number(
            get("seating_capacity")
        );


    const pricePerDay =
        Number(
            get("pricePerDay")
        );


    const discountValue =
        get("discount");

    const discount =
        discountValue === ""
            ? 0
            : Number(discountValue);


    // IMPORTANT:
    // Yahan || 1 use nahi karna.
    // User ki actual value preserve karni hai.

    const availableCountValue =
        get("availableCount");

    const availableCount =
        availableCountValue === ""
            ? 0
            : Number(availableCountValue);


    const fuelType =
        get("fuel_type");


    const transmission =
        get("transmission");


    const email =
        get("email");


    const whatsapp =
        get("whatsapp");


    const description =
        get("description");


    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!brand) {

        alert(
            "Please enter vehicle brand."
        );

        return;
    }


    if (!model) {

        alert(
            "Please enter vehicle model."
        );

        return;
    }


    if (!year || year < 1900) {

        alert(
            "Please enter a valid vehicle year."
        );

        return;
    }


    if (!category) {

        alert(
            "Please select vehicle category."
        );

        return;
    }


    if (
        !Number.isFinite(seatingCapacity) ||
        seatingCapacity < 1
    ) {

        alert(
            "Please enter valid seating capacity."
        );

        return;
    }


    if (
        !Number.isFinite(pricePerDay) ||
        pricePerDay < 1
    ) {

        alert(
            "Please enter valid price per day."
        );

        return;
    }


    if (
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
    ) {

        alert(
            "Discount must be between 0 and 100."
        );

        return;
    }


    if (
        !Number.isFinite(availableCount) ||
        availableCount < 0
    ) {

        alert(
            "Available count cannot be negative."
        );

        return;
    }


    // ---------------------------------------------
    // IMAGE
    // ---------------------------------------------

    const imageInput =
        form.elements.images;


    if (
        !imageInput ||
        !imageInput.files ||
        imageInput.files.length === 0
    ) {

        alert(
            "Please select at least one vehicle image."
        );

        return;
    }


    // ---------------------------------------------
    // LOCATION
    // ---------------------------------------------

    // IMPORTANT:
    // Add Vehicle EJS mein names:
    // line1
    // line2
    // city
    // state
    // pincode

    const location = {

        line1:
            get("line1"),

        line2:
            get("line2"),

        city:
            get("city"),

        state:
            get("state"),

        pincode:
            get("pincode")
    };


    // ---------------------------------------------
    // VEHICLE DATA
    // ---------------------------------------------

    const carData = {

        name:
            `${brand} ${model}`.trim(),

        brand,

        model,

        year,

        categories:
            category,

        seating_capacity:
            seatingCapacity,

        fuel_type:
            fuelType,

        transmission,

        pricePerDay,

        discount,

        availableCount,

        email,

        whatsapp,

        description,

        isAvailable:
            availableCount > 0,

        location
    };


    console.log(
        "ADDING VEHICLE:",
        carData
    );


    // ---------------------------------------------
    // FORM DATA
    // ---------------------------------------------

    const formData =
        new FormData();


    formData.append(
        "carData",
        JSON.stringify(carData)
    );


    Array
        .from(imageInput.files)
        .forEach(file => {

            formData.append(
                "images",
                file
            );
        });


    // ---------------------------------------------
    // SUBMIT
    // ---------------------------------------------

    try {

        const submitButton =
            form.querySelector(
                "button[type='submit']"
            );


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Adding Vehicle...";
        }


        const result =
            await api(
                "/api/owner/add-car",
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Vehicle could not be added."
            );
        }


        alert(
            "Vehicle added successfully."
        );


        form.reset();


        window.location.href =
            "/owner/manage-cars";


    } catch (error) {

        console.error(
            "Add vehicle error:",
            error
        );


        alert(
            error.message ||
            "Unable to add vehicle."
        );


        const submitButton =
            form.querySelector(
                "button[type='submit']"
            );


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Add Vehicle";
        }
    }
}


// =====================================================
// MANAGE CARS
// =====================================================

async function loadOwnerCars() {

    const container =
        document.getElementById(
            "ownerCars"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="col-span-full text-center py-10 text-gray-500">
            Loading vehicles...
        </div>
    `;


    try {

        const data =
            await api(
                "/api/owner/cars"
            );


        const cars =
            data.cars ||
            data.vehicles ||
            data.data ||
            [];


        ownerCarsData =
            cars;


        setValue(
            "ownerCarCount",
            cars.length
        );


        if (cars.length === 0) {

            container.innerHTML = `

                <div
                    class="col-span-full bg-white rounded-xl shadow p-10 text-center"
                >

                    <h3 class="font-semibold text-lg">
                        No vehicles found
                    </h3>

                    <p class="text-gray-500 mt-2">
                        Add your first vehicle.
                    </p>

                    <a
                        href="/owner/add-car"
                        class="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
                    >
                        + Add Vehicle
                    </a>

                </div>
            `;

            return;
        }


        container.innerHTML =
            cars
                .map(car => {

                    const id =
                        car._id;


                    const brand =
                        Array.isArray(car.brand)
                            ? car.brand.join(", ")
                            : car.brand || "";


                    const name =
                        car.name ||
                        `${brand} ${car.model || ""}`.trim() ||
                        "Vehicle";


                    const category =
                        getVehicleCategory(car);


                    const price =
                        Number(
                            car.pricePerDay || 0
                        );


                    const discount =
                        Number(
                            car.discount || 0
                        );


                    const availableCount =
                        Number(
                            car.availableCount ?? 0
                        );


                    const available =
                        car.isAvailable !== false;


                    const image =
                        getVehicleImage(car);


                    return `

                        <div
                            class="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
                        >

                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(name)}"
                                class="w-full h-48 object-cover rounded-lg"
                                onerror="this.src='/assets/car_image5.png'"
                            >

                            <div class="mt-4">

                                <div
                                    class="flex justify-between gap-2"
                                >

                                    <h2 class="font-bold text-lg">
                                        ${escapeHtml(name)}
                                    </h2>

                                    <span
                                        class="${
                                            available
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        } text-xs px-2 py-1 rounded-full h-fit"
                                    >
                                        ${
                                            available
                                                ? "Available"
                                                : "Unavailable"
                                        }
                                    </span>

                                </div>


                                <p class="text-gray-500 text-sm mt-1">
                                    ${escapeHtml(category)}
                                </p>


                                <p class="text-gray-600 text-sm mt-1">
                                    Model:
                                    ${escapeHtml(
                                        car.model || "-"
                                    )}
                                </p>


                                <div
                                    class="grid grid-cols-2 gap-2 mt-3 text-sm"
                                >

                                    <div
                                        class="bg-slate-50 rounded-lg p-2"
                                    >
                                        <span class="text-gray-500">
                                            Seating
                                        </span>

                                        <strong class="block">
                                            ${
                                                car.seating_capacity ??
                                                "-"
                                            }
                                        </strong>
                                    </div>


                                    <div
                                        class="bg-slate-50 rounded-lg p-2"
                                    >
                                        <span class="text-gray-500">
                                            Available
                                        </span>

                                        <strong class="block">
                                            ${availableCount}
                                        </strong>
                                    </div>

                                </div>


                                <p class="font-semibold mt-3">
                                    ₹${price.toLocaleString("en-IN")}/day
                                </p>


                                ${
                                    discount > 0
                                        ? `
                                            <p class="text-green-600 text-sm">
                                                ${discount}% discount
                                            </p>
                                        `
                                        : ""
                                }


                                <div
                                    class="grid grid-cols-3 gap-2 mt-4"
                                >

                                    <button
                                        type="button"
                                        onclick="viewCar('${id}')"
                                        class="border border-gray-300 px-2 py-2 rounded-lg hover:bg-gray-100"
                                    >
                                        View
                                    </button>


                                    <button
                                        type="button"
                                        onclick="editCar('${id}')"
                                        class="bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>


                                    <button
                                        type="button"
                                        onclick="deleteCar('${id}')"
                                        class="bg-red-600 text-white px-2 py-2 rounded-lg hover:bg-red-700"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;
                })
                .join("");


    } catch (error) {

        console.error(
            "Load owner cars error:",
            error
        );


        container.innerHTML = `

            <div
                class="col-span-full text-center text-red-500 py-10"
            >
                ${escapeHtml(error.message)}
            </div>

        `;
    }
}


// =====================================================
// VEHICLE VIEW MODAL
// =====================================================

function createVehicleViewModal() {

    let modal =
        document.getElementById(
            "vehicleViewModal"
        );


    if (modal) {
        return modal;
    }


    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            id="vehicleViewModal"
            class="hidden fixed inset-0 z-[100] bg-black/60 items-center justify-center p-4"
        >

            <div
                class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto"
            >

                <div
                    class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center"
                >

                    <div>

                        <h2
                            id="vehicleViewTitle"
                            class="text-2xl font-bold"
                        >
                            Vehicle Details
                        </h2>

                        <p class="text-sm text-gray-500">
                            Complete vehicle information
                        </p>

                    </div>


                    <button
                        type="button"
                        onclick="closeVehicleView()"
                        class="text-3xl text-gray-500 hover:text-black"
                    >
                        &times;
                    </button>

                </div>


                <div
                    id="vehicleViewContent"
                    class="p-6"
                ></div>

            </div>

        </div>

        `
    );


    return document.getElementById(
        "vehicleViewModal"
    );
}


// =====================================================
// VIEW CAR
// =====================================================

function viewCar(id) {

    const car =
        ownerCarsData.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!car) {

        alert(
            "Vehicle not found."
        );

        return;
    }


    const modal =
        createVehicleViewModal();


    const title =
        document.getElementById(
            "vehicleViewTitle"
        );


    const content =
        document.getElementById(
            "vehicleViewContent"
        );


    const location =
        getLocation(car);


    const images =
        Array.isArray(car.images) &&
        car.images.length > 0
            ? car.images
            : [
                "/assets/car_image5.png"
            ];


    const category =
        getVehicleCategory(car);


    const brand =
        Array.isArray(car.brand)
            ? car.brand.join(", ")
            : car.brand || "";


    const seating =
        car.seating_capacity ??
        car.seatingCapacity ??
        "-";


    const availableCount =
        car.availableCount ??
        "-";


    title.textContent =
        `${brand} ${car.model || ""}`.trim() ||
        car.name ||
        "Vehicle Details";


    content.innerHTML = `

        <div class="mb-6">

            <h3 class="font-bold text-lg mb-3">
                Vehicle Images
            </h3>

            <div
                class="grid grid-cols-2 md:grid-cols-4 gap-3"
            >

                ${images
                    .map(image => `

                        <img
                            src="${escapeAttribute(image)}"
                            class="w-full h-40 object-cover rounded-xl border"
                            onerror="this.src='/assets/car_image5.png'"
                            alt="Vehicle"
                        >

                    `)
                    .join("")}

            </div>

        </div>


        <div
            class="border rounded-xl p-5 mb-5"
        >

            <h3 class="font-bold text-lg mb-4">
                Basic Information
            </h3>


            <div
                class="grid md:grid-cols-2 gap-4 text-sm"
            >

                <div>
                    <b>Vehicle Name</b>
                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            car.name || "-"
                        )}
                    </p>
                </div>


                <div>
                    <b>Brand</b>
                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            brand || "-"
                        )}
                    </p>
                </div>


                <div>
                    <b>Model</b>
                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            car.model || "-"
                        )}
                    </p>
                </div>


                <div>
                    <b>Year</b>
                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            car.year || "-"
                        )}
                    </p>
                </div>


                <div>
                    <b>Category</b>
                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            category
                        )}
                    </p>
                </div>


                <div>
                    <b>Seating Capacity</b>
                    <p class="text-gray-600 mt-1 font-semibold">
                        ${escapeHtml(
                            seating
                        )}
                    </p>
                </div>


                <div>
                    <b>Fuel Type</b>
                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            car.fuel_type ||
                            car.fuelType ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <b>Transmission</b>
                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            car.transmission ||
                            "-"
                        )}
                    </p>
                </div>


                <div>
                    <b>Available Count</b>
                    <p class="text-gray-600 mt-1 font-semibold">
                        ${escapeHtml(
                            availableCount
                        )}
                    </p>
                </div>


                <div>
                    <b>Status</b>
                    <p class="text-gray-600 mt-1">
                        ${
                            car.isAvailable === false
                                ? "Unavailable"
                                : "Available"
                        }
                    </p>
                </div>

            </div>

        </div>


        <div
            class="border rounded-xl p-5 mb-5"
        >

            <h3 class="font-bold text-lg mb-4">
                Pricing
            </h3>


            <div
                class="grid md:grid-cols-3 gap-4"
            >

                <div
                    class="bg-slate-50 rounded-xl p-4"
                >

                    <p class="text-gray-500 text-sm">
                        Price Per Day
                    </p>

                    <p class="font-bold text-xl mt-1">
                        ₹${Number(
                            car.pricePerDay || 0
                        ).toLocaleString("en-IN")}
                    </p>

                </div>


                <div
                    class="bg-green-50 rounded-xl p-4"
                >

                    <p class="text-gray-500 text-sm">
                        Discount
                    </p>

                    <p
                        class="font-bold text-xl text-green-600 mt-1"
                    >
                        ${Number(
                            car.discount || 0
                        )}%
                    </p>

                </div>


                <div
                    class="bg-blue-50 rounded-xl p-4"
                >

                    <p class="text-gray-500 text-sm">
                        Available
                    </p>

                    <p class="font-bold text-xl mt-1">
                        ${
                            car.isAvailable === false
                                ? "No"
                                : "Yes"
                        }
                    </p>

                </div>

            </div>

        </div>


        <div
            class="border rounded-xl p-5 mb-5"
        >

            <h3 class="font-bold text-lg mb-4">
                Contact Information
            </h3>


            <div
                class="grid md:grid-cols-2 gap-4 text-sm"
            >

                <div>

                    <b>Email</b>

                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            car.email || "-"
                        )}
                    </p>

                </div>


                <div>

                    <b>WhatsApp</b>

                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            car.whatsapp || "-"
                        )}
                    </p>

                </div>

            </div>

        </div>


        <div
            class="border rounded-xl p-5 mb-5"
        >

            <h3 class="font-bold text-lg mb-4">
                Address
            </h3>


            <div
                class="grid md:grid-cols-2 gap-4 text-sm"
            >

                <div>

                    <b>Address Line 1</b>

                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            locationValue(
                                location,
                                [
                                    "line1",
                                    "addressLine1",
                                    "address1"
                                ]
                            ) || "-"
                        )}
                    </p>

                </div>


                <div>

                    <b>Address Line 2</b>

                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            locationValue(
                                location,
                                [
                                    "line2",
                                    "addressLine2",
                                    "address2"
                                ]
                            ) || "-"
                        )}
                    </p>

                </div>


                <div>

                    <b>City</b>

                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            location.city || "-"
                        )}
                    </p>

                </div>


                <div>

                    <b>State</b>

                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            location.state || "-"
                        )}
                    </p>

                </div>


                <div>

                    <b>Pincode</b>

                    <p class="text-gray-600 mt-1">
                        ${escapeHtml(
                            locationValue(
                                location,
                                [
                                    "pincode",
                                    "pinCode",
                                    "zip"
                                ]
                            ) || "-"
                        )}
                    </p>

                </div>

            </div>

        </div>


        <div
            class="border rounded-xl p-5 mb-5"
        >

            <h3 class="font-bold text-lg mb-3">
                Description
            </h3>

            <p
                class="text-gray-600 whitespace-pre-line"
            >
                ${escapeHtml(
                    car.description || "-"
                )}
            </p>

        </div>


        <div
            class="border rounded-xl p-5"
        >

            <h3 class="font-bold text-lg mb-4">
                Record Information
            </h3>


            <div
                class="grid md:grid-cols-2 gap-4 text-sm"
            >

                <div>

                    <b>Created Date & Time</b>

                    <p class="text-gray-600 mt-1">
                        ${formatDateTime(
                            car.createdAt
                        )}
                    </p>

                </div>


                <div>

                    <b>Last Updated</b>

                    <p class="text-gray-600 mt-1">
                        ${formatDateTime(
                            car.updatedAt
                        )}
                    </p>

                </div>

            </div>

        </div>

    `;


    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );
}


function closeVehicleView() {

    const modal =
        document.getElementById(
            "vehicleViewModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );
}


// =====================================================
// EDIT CAR
// =====================================================

function editCar(id) {

    const car =
        ownerCarsData.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!car) {

        alert(
            "Vehicle not found."
        );

        return;
    }


    const modal =
        document.getElementById(
            "editModal"
        );


    const fields =
        document.getElementById(
            "editFields"
        );


    const form =
        document.getElementById(
            "editCarForm"
        );


    if (
        !modal ||
        !fields ||
        !form
    ) {

        alert(
            "Edit form not found."
        );

        return;
    }


    const location =
        getLocation(car);


    const brand =
        Array.isArray(car.brand)
            ? car.brand.join(", ")
            : car.brand || "";


    const categories =
        Array.isArray(car.categories)
            ? car.categories.join(", ")
            : car.categories ||
              car.category ||
              "";


    const seating =
        car.seating_capacity ??
        car.seatingCapacity ??
        "";


    const availableCount =
        car.availableCount ??
        0;


    fields.innerHTML = `

        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Vehicle Name
            </label>

            <input
                name="name"
                value="${escapeAttribute(
                    car.name || ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Brand
            </label>

            <input
                name="brand"
                value="${escapeAttribute(
                    brand
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Model
            </label>

            <input
                name="model"
                value="${escapeAttribute(
                    car.model || ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Year
            </label>

            <input
                type="number"
                name="year"
                value="${escapeAttribute(
                    car.year ?? ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Category
            </label>

            <input
                name="categories"
                value="${escapeAttribute(
                    categories
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Seating Capacity
            </label>

            <input
                type="number"
                min="1"
                name="seating_capacity"
                value="${escapeAttribute(
                    seating
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Fuel Type
            </label>

            <input
                name="fuel_type"
                value="${escapeAttribute(
                    car.fuel_type ||
                    car.fuelType ||
                    ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Transmission
            </label>

            <input
                name="transmission"
                value="${escapeAttribute(
                    car.transmission || ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Price Per Day
            </label>

            <input
                type="number"
                min="1"
                name="pricePerDay"
                value="${escapeAttribute(
                    car.pricePerDay ?? 0
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Discount %
            </label>

            <input
                type="number"
                min="0"
                max="100"
                name="discount"
                value="${escapeAttribute(
                    car.discount ?? 0
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Available Count
            </label>

            <input
                type="number"
                min="0"
                name="availableCount"
                value="${escapeAttribute(
                    availableCount
                )}"
                class="w-full border rounded-lg px-3 py-2"
                required
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Email
            </label>

            <input
                type="email"
                name="email"
                value="${escapeAttribute(
                    car.email || ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                WhatsApp
            </label>

            <input
                name="whatsapp"
                value="${escapeAttribute(
                    car.whatsapp || ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Address Line 1
            </label>

            <input
                name="line1"
                value="${escapeAttribute(
                    locationValue(
                        location,
                        [
                            "line1",
                            "addressLine1",
                            "address1"
                        ]
                    )
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Address Line 2
            </label>

            <input
                name="line2"
                value="${escapeAttribute(
                    locationValue(
                        location,
                        [
                            "line2",
                            "addressLine2",
                            "address2"
                        ]
                    )
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                City
            </label>

            <input
                name="city"
                value="${escapeAttribute(
                    location.city || ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                State
            </label>

            <input
                name="state"
                value="${escapeAttribute(
                    location.state || ""
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div>

            <label
                class="block text-sm font-medium mb-1"
            >
                Pincode
            </label>

            <input
                name="pincode"
                value="${escapeAttribute(
                    locationValue(
                        location,
                        [
                            "pincode",
                            "pinCode",
                            "zip"
                        ]
                    )
                )}"
                class="w-full border rounded-lg px-3 py-2"
            >

        </div>


        <div class="md:col-span-2">

            <label
                class="block text-sm font-medium mb-1"
            >
                Description
            </label>

            <textarea
                name="description"
                rows="4"
                class="w-full border rounded-lg px-3 py-2"
            >${escapeHtml(
                car.description || ""
            )}</textarea>

        </div>


        <div class="md:col-span-2">

            <label
                class="block text-sm font-medium mb-1"
            >
                Replace Images
            </label>

            <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                class="w-full border rounded-lg px-3 py-2"
            >

            <p class="text-xs text-gray-500 mt-1">
                Image select nahi karoge to old images rahengi.
            </p>

        </div>


        <div class="md:col-span-2">

            <label class="flex items-center gap-2">

                <input
                    type="checkbox"
                    name="isAvailable"
                    ${
                        car.isAvailable !== false
                            ? "checked"
                            : ""
                    }
                >

                <span>
                    Vehicle Available
                </span>

            </label>

        </div>

    `;


    form.elements.id.value =
        id;


    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );
}


// =====================================================
// CLOSE EDIT MODAL
// =====================================================

function closeEditModal() {

    const modal =
        document.getElementById(
            "editModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );
}


// =====================================================
// UPDATE CAR
// =====================================================

async function updateOwnerCar(event) {

    event.preventDefault();


    const form =
        event.target;


    const id =
        form.elements.id.value;


    if (!id) {

        alert(
            "Vehicle ID missing."
        );

        return;
    }


    const seatingValue =
        form.elements.seating_capacity
            ?.value
            ?.trim();


    const availableValue =
        form.elements.availableCount
            ?.value
            ?.trim();


    const seatingCapacity =
        Number(seatingValue);


    const availableCount =
        availableValue === ""
            ? 0
            : Number(availableValue);


    if (
        !Number.isFinite(
            seatingCapacity
        ) ||
        seatingCapacity < 1
    ) {

        alert(
            "Please enter valid seating capacity."
        );

        return;
    }


    if (
        !Number.isFinite(
            availableCount
        ) ||
        availableCount < 0
    ) {

        alert(
            "Please enter valid available count."
        );

        return;
    }


    const location = {

        line1:
            form.elements.line1?.value || "",

        line2:
            form.elements.line2?.value || "",

        city:
            form.elements.city?.value || "",

        state:
            form.elements.state?.value || "",

        pincode:
            form.elements.pincode?.value || ""
    };


    const carData = {

        name:
            form.elements.name?.value || "",

        brand:
            form.elements.brand?.value || "",

        model:
            form.elements.model?.value || "",

        year:
            Number(
                form.elements.year?.value || 0
            ),

        categories:
            form.elements.categories?.value || "",

        seating_capacity:
            seatingCapacity,

        fuel_type:
            form.elements.fuel_type?.value || "",

        transmission:
            form.elements.transmission?.value || "",

        pricePerDay:
            Number(
                form.elements.pricePerDay?.value || 0
            ),

        discount:
            Number(
                form.elements.discount?.value || 0
            ),

        availableCount:
            availableCount,

        email:
            form.elements.email?.value || "",

        whatsapp:
            form.elements.whatsapp?.value || "",

        description:
            form.elements.description?.value || "",

        isAvailable:
            availableCount > 0 &&
            form.elements.isAvailable?.checked === true,

        location
    };


    console.log(
        "UPDATING VEHICLE:",
        carData
    );


    if (
        carData.pricePerDay < 1
    ) {

        alert(
            "Price must be greater than 0."
        );

        return;
    }


    if (
        carData.discount < 0 ||
        carData.discount > 100
    ) {

        alert(
            "Discount must be between 0 and 100."
        );

        return;
    }


    const formData =
        new FormData();


    formData.append(
        "carData",
        JSON.stringify(carData)
    );


    const imageInput =
        form.elements.images;


    if (
        imageInput &&
        imageInput.files &&
        imageInput.files.length > 0
    ) {

        Array
            .from(imageInput.files)
            .forEach(file => {

                formData.append(
                    "images",
                    file
                );

            });
    }


    try {

        const result =
            await api(
                `/api/owner/update-car/${id}`,
                {
                    method: "PUT",
                    body: formData
                }
            );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Vehicle update failed."
            );
        }


        alert(
            "Vehicle updated successfully."
        );


        closeEditModal();


        await loadOwnerCars();


    } catch (error) {

        console.error(
            "Update vehicle error:",
            error
        );


        alert(
            error.message ||
            "Unable to update vehicle."
        );
    }
}


// =====================================================
// DELETE CAR
// =====================================================

async function deleteCar(id) {

    const car =
        ownerCarsData.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!car) {

        alert(
            "Vehicle not found."
        );

        return;
    }


    const name =
        car.name ||
        car.brand ||
        "this vehicle";


    if (
        !confirm(
            `Are you sure you want to delete ${name}?`
        )
    ) {
        return;
    }


    try {

        const result =
            await api(
                "/api/owner/delete-car",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            carId: id
                        })
                }
            );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Vehicle could not be deleted."
            );
        }


        alert(
            "Vehicle deleted successfully."
        );


        await loadOwnerCars();


    } catch (error) {

        console.error(
            "Delete vehicle error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =====================================================
// BOOKINGS
// =====================================================

async function loadBookings() {

    const table =
        document.getElementById(
            "ownerBookings"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="p-10 text-center text-gray-500"
            >
                Loading bookings...
            </td>

        </tr>

    `;


    try {

        const data =
            await api(
                "/api/bookings/owner"
            );


        const bookings =
            data.bookings ||
            data.data ||
            [];


        ownerBookingsData =
            bookings;


        updateBookingStats(
            bookings
        );


        if (bookings.length === 0) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="p-10 text-center text-gray-500"
                    >
                        No bookings found.
                    </td>

                </tr>

            `;

            return;
        }


        table.innerHTML =
            bookings
                .map(booking => {

                    const vehicle =
                        booking.car ||
                        booking.vehicle ||
                        {};


                    const user =
                        booking.user ||
                        {};


                    const id =
                        booking._id ||
                        booking.id;


                    const vehicleName =
                        vehicle.name ||
                        (
                            Array.isArray(
                                vehicle.brand
                            )
                                ? vehicle.brand.join(", ")
                                : vehicle.brand
                        ) ||
                        "Vehicle";


                    const customerName =
                        booking.name ||
                        user.name ||
                        "Customer";


                    const email =
                        booking.email ||
                        user.email ||
                        "-";


                    const price =
                        Number(
                            booking.price || 0
                        );


                    const status =
                        booking.status ||
                        "pending";


                    let statusClass =
                        "bg-yellow-100 text-yellow-700";


                    if (
                        status ===
                        "confirmed"
                    ) {

                        statusClass =
                            "bg-green-100 text-green-700";
                    }


                    if (
                        status ===
                        "cancelled"
                    ) {

                        statusClass =
                            "bg-red-100 text-red-700";
                    }


                    if (
                        status ===
                        "completed"
                    ) {

                        statusClass =
                            "bg-blue-100 text-blue-700";
                    }


                    return `

                        <tr
                            class="border-b hover:bg-slate-50"
                        >

                            <td class="p-3">

                                <div
                                    class="flex items-center gap-3"
                                >

                                    <img
                                        src="${escapeAttribute(
                                            getVehicleImage(
                                                vehicle
                                            )
                                        )}"
                                        class="w-14 h-14 rounded-lg object-cover"
                                        alt="Vehicle"
                                        onerror="this.src='/assets/car_image5.png'"
                                    >

                                    <div>

                                        <p class="font-semibold">
                                            ${escapeHtml(
                                                vehicleName
                                            )}
                                        </p>

                                        <p class="text-xs text-gray-500">
                                            ${escapeHtml(
                                                vehicle.model ||
                                                "-"
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </td>


                            <td class="p-3">

                                <p class="font-medium">
                                    ${escapeHtml(
                                        customerName
                                    )}
                                </p>

                                <p class="text-xs text-gray-500">
                                    ${escapeHtml(
                                        email
                                    )}
                                </p>

                                <p class="text-xs text-gray-500">
                                    ${escapeHtml(
                                        booking.whatsapp ||
                                        "-"
                                    )}
                                </p>

                            </td>


                            <td class="p-3">

                                <span class="font-medium">
                                    ${formatDate(
                                        booking.pickupDate
                                    )}
                                </span>

                                <br>

                                <span class="text-gray-500">
                                    to
                                </span>

                                <br>

                                <span class="font-medium">
                                    ${formatDate(
                                        booking.returnDate
                                    )}
                                </span>

                            </td>


                            <td class="p-3 font-semibold">
                                ₹${price.toLocaleString("en-IN")}
                            </td>


                            <td class="p-3">

                                <span
                                    class="
                                        inline-block
                                        px-3
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-semibold
                                        ${statusClass}
                                    "
                                >
                                    ${escapeHtml(
                                        status
                                    )}
                                </span>

                            </td>


                            <td class="p-3">

                                <div
                                    class="flex flex-col gap-2"
                                >

                                    <button
                                        type="button"
                                        onclick="viewBooking('${id}')"
                                        class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                                    >
                                        View
                                    </button>


                                    ${
                                        status !== "cancelled" &&
                                        status !== "completed"
                                            ? `

                                                <select
                                                    class="border rounded-lg px-3 py-2 text-sm"
                                                    onchange="changeStatus('${id}', this.value)"
                                                >

                                                    <option value="">
                                                        Change Status
                                                    </option>

                                                    <option value="confirmed">
                                                        Confirm
                                                    </option>

                                                    <option value="cancelled">
                                                        Cancel
                                                    </option>

                                                </select>

                                            `
                                            : ""
                                    }


                                    ${
                                        status === "cancelled"
                                            ? `

                                                <button
                                                    type="button"
                                                    onclick="deleteBooking('${id}')"
                                                    class="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                                                >
                                                    Delete
                                                </button>

                                            `
                                            : ""
                                    }

                                </div>

                            </td>

                        </tr>

                    `;
                })
                .join("");


    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="p-10 text-center text-red-500"
                >
                    ${escapeHtml(
                        error.message
                    )}
                </td>

            </tr>

        `;
    }
}


// =====================================================
// BOOKING STATS
// =====================================================

function updateBookingStats(
    bookings
) {

    const total =
        bookings.length;


    const pending =
        bookings.filter(
            booking =>
                booking.status ===
                "pending"
        ).length;


    const confirmed =
        bookings.filter(
            booking =>
                booking.status ===
                "confirmed"
        ).length;


    const cancelled =
        bookings.filter(
            booking =>
                booking.status ===
                "cancelled"
        ).length;


    setValue(
        "totalBookings",
        total
    );


    setValue(
        "pendingBookings",
        pending
    );


    setValue(
        "confirmedBookings",
        confirmed
    );


    setValue(
        "cancelledBookings",
        cancelled
    );
}


// =====================================================
// CHANGE BOOKING STATUS
// =====================================================

async function changeStatus(
    id,
    status
) {

    if (!status) {
        return;
    }


    try {

        if (
            status ===
            "cancelled"
        ) {

            if (
                !confirm(
                    "Are you sure you want to cancel this booking?"
                )
            ) {

                await loadBookings();

                return;
            }
        }


        const result =
            await api(
                "/api/bookings/change-status",
                {
                    method: "PUT",

                    body:
                        JSON.stringify({
                            bookingId: id,
                            status
                        })
                }
            );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to change booking status."
            );
        }


        alert(
            status === "confirmed"
                ? "Booking confirmed successfully."
                : "Booking cancelled successfully."
        );


        await loadBookings();


    } catch (error) {

        console.error(
            "Change booking status error:",
            error
        );


        alert(
            error.message
        );


        await loadBookings();
    }
}


// =====================================================
// VIEW BOOKING
// =====================================================

function viewBooking(id) {

    const booking =
        ownerBookingsData.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!booking) {

        alert(
            "Booking not found."
        );

        return;
    }


    const modal =
        document.getElementById(
            "bookingViewModal"
        );


    const content =
        document.getElementById(
            "bookingViewContent"
        );


    const vehicle =
        booking.car ||
        booking.vehicle ||
        {};


    const user =
        booking.user ||
        {};


    if (
        !modal ||
        !content
    ) {

        alert(`

Customer:
${booking.name || user.name || "-"}

Email:
${booking.email || user.email || "-"}

WhatsApp:
${booking.whatsapp || "-"}

Address:
${booking.address || "-"}

Pincode:
${booking.pincode || "-"}

Vehicle:
${
    vehicle.name ||
    vehicle.brand ||
    "-"
}

Pickup:
${formatDate(booking.pickupDate)}

Return:
${formatDate(booking.returnDate)}

Price:
₹${Number(
    booking.price || 0
).toLocaleString("en-IN")}

Payment:
${booking.paymentMethod || "-"}

Status:
${booking.status || "-"}

Created:
${formatDateTime(
    booking.createdAt
)}

        `);

        return;
    }


    content.innerHTML = `

        <div
            class="grid md:grid-cols-2 gap-5"
        >

            <div
                class="border rounded-xl p-5"
            >

                <h3
                    class="font-bold text-lg mb-4"
                >
                    Customer Information
                </h3>


                <p>
                    <b>Name:</b>
                    ${escapeHtml(
                        booking.name ||
                        user.name ||
                        "-"
                    )}
                </p>


                <p class="mt-2">
                    <b>Email:</b>
                    ${escapeHtml(
                        booking.email ||
                        user.email ||
                        "-"
                    )}
                </p>


                <p class="mt-2">
                    <b>WhatsApp:</b>
                    ${escapeHtml(
                        booking.whatsapp ||
                        "-"
                    )}
                </p>


                <p class="mt-2">
                    <b>Address:</b>
                    ${escapeHtml(
                        booking.address ||
                        "-"
                    )}
                </p>


                <p class="mt-2">
                    <b>Pincode:</b>
                    ${escapeHtml(
                        booking.pincode ||
                        "-"
                    )}
                </p>

            </div>


            <div
                class="border rounded-xl p-5"
            >

                <h3
                    class="font-bold text-lg mb-4"
                >
                    Vehicle Information
                </h3>


                <img
                    src="${escapeAttribute(
                        getVehicleImage(
                            vehicle
                        )
                    )}"
                    class="w-full h-48 object-cover rounded-xl mb-4"
                    alt="Vehicle"
                    onerror="this.src='/assets/car_image5.png'"
                >


                <p>
                    <b>Vehicle:</b>
                    ${escapeHtml(
                        vehicle.name ||
                        vehicle.brand ||
                        "-"
                    )}
                </p>


                <p class="mt-2">
                    <b>Model:</b>
                    ${escapeHtml(
                        vehicle.model ||
                        "-"
                    )}
                </p>


                <p class="mt-2">
                    <b>Category:</b>
                    ${escapeHtml(
                        getVehicleCategory(
                            vehicle
                        )
                    )}
                </p>

            </div>


            <div
                class="border rounded-xl p-5"
            >

                <h3
                    class="font-bold text-lg mb-4"
                >
                    Booking Information
                </h3>


                <p>
                    <b>Pickup Date:</b>
                    ${formatDate(
                        booking.pickupDate
                    )}
                </p>


                <p class="mt-2">
                    <b>Return Date:</b>
                    ${formatDate(
                        booking.returnDate
                    )}
                </p>


                <p class="mt-2">
                    <b>Quantity:</b>
                    ${booking.quantity || 1}
                </p>


                <p class="mt-2">
                    <b>Vehicle Use:</b>
                    ${escapeHtml(
                        booking.vehicleUse ||
                        "-"
                    )}
                </p>


                <p class="mt-2">
                    <b>Other Use:</b>
                    ${escapeHtml(
                        booking.otherUse ||
                        "-"
                    )}
                </p>

            </div>


            <div
                class="border rounded-xl p-5"
            >

                <h3
                    class="font-bold text-lg mb-4"
                >
                    Payment & Status
                </h3>


                <p>
                    <b>Total Price:</b>
                    ₹${Number(
                        booking.price || 0
                    ).toLocaleString("en-IN")}
                </p>


                <p class="mt-2">
                    <b>Payment Method:</b>
                    ${escapeHtml(
                        booking.paymentMethod ||
                        "-"
                    )}
                </p>


                <p class="mt-2">
                    <b>Status:</b>
                    ${escapeHtml(
                        booking.status ||
                        "pending"
                    )}
                </p>


                <p class="mt-2">
                    <b>Created:</b>
                    ${formatDateTime(
                        booking.createdAt
                    )}
                </p>


                <p class="mt-2">
                    <b>Updated:</b>
                    ${formatDateTime(
                        booking.updatedAt
                    )}
                </p>


                <p class="mt-2 break-all">
                    <b>Booking ID:</b>
                    ${escapeHtml(
                        booking._id ||
                        "-"
                    )}
                </p>

            </div>

        </div>

    `;


    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );
}


// =====================================================
// DELETE BOOKING
// =====================================================

async function deleteBooking(id) {

    const booking = ownerBookingsData.find(
        item => String(item._id) === String(id)
    );

    // Booking not found
    if (!booking) {
        alert("Booking not found.");
        return;
    }

    // Only cancelled booking can be deleted
    if (booking.status !== "cancelled") {
        alert("User not cancelled this booking");
        return;
    }

    // Confirmation
    const confirmed = confirm(
        "This booking is cancelled. Delete it permanently?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const result = await api(
            `/api/bookings/delete/${id}`,
            {
                method: "DELETE"
            }
        );

        // Backend validation failed
        if (!result.success) {
            throw new Error(
                result.message ||
                "Booking could not be deleted."
            );
        }

        // Success
        alert(
            "Cancelled booking deleted successfully."
        );

        // Refresh booking list
        await loadBookings();

    } catch (error) {

        console.error(
            "Delete booking error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete booking."
        );
    }
}

// =====================================================
// CLOSE BOOKING MODAL
// =====================================================

function closeBooking() {

    const modal =
        document.getElementById(
            "bookingViewModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );
}


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {

    const dashboardPage =
        document.getElementById(
            "dashboardVehicleStats"
        );


    const availableElement =
        document.getElementById(
            "availableVehicleCount"
        );


    if (
        !dashboardPage &&
        !availableElement
    ) {
        return;
    }


    try {

        const [
            carResponse,
            bookingResponse
        ] = await Promise.all([

            api(
                "/api/owner/cars"
            ),

            api(
                "/api/bookings/owner"
            )

        ]);


        const cars =
            carResponse.cars ||
            carResponse.vehicles ||
            carResponse.data ||
            [];


        const bookings =
            bookingResponse.bookings ||
            bookingResponse.data ||
            [];


        const totalCars =
            cars.length;


        const availableCars =
            cars.filter(
                car =>
                    car.isAvailable !== false
            );


        // ---------------------------------------------
        // CATEGORY COUNT
        // ---------------------------------------------

        const categoryCount =
            category => {

                return cars.filter(
                    car =>
                        getVehicleCategory(
                            car
                        ) === category
                ).length;
            };


        setValue(
            "availableVehicleCount",
            totalCars
        );


        setValue(
            "totalVehicleCount",
            totalCars
        );


        setValue(
            "bikeVehicleCount",
            categoryCount(
                "Bike"
            )
        );


        setValue(
            "carVehicleCount",
            categoryCount(
                "Car"
            )
        );


        setValue(
            "tractorVehicleCount",
            categoryCount(
                "Tractor"
            )
        );


        setValue(
            "agricultureVehicleCount",
            categoryCount(
                "Agriculture"
            )
        );


        // ---------------------------------------------
        // BOOKING COUNTS
        // ---------------------------------------------

        const pendingBookings =
            bookings.filter(
                booking =>
                    booking.status ===
                    "pending"
            );


        const confirmedBookings =
            bookings.filter(
                booking =>
                    booking.status ===
                    "confirmed"
            );


        const cancelledBookings =
            bookings.filter(
                booking =>
                    booking.status ===
                    "cancelled"
            );


        setValue(
            "dashboardTotalBookings",
            bookings.length
        );


        setValue(
            "dashboardPendingBookings",
            pendingBookings.length
        );


        setValue(
            "dashboardConfirmedBookings",
            confirmedBookings.length
        );


        setValue(
            "dashboardCancelledBookings",
            cancelledBookings.length
        );


        // Also support normal booking IDs
        setValue(
            "totalBookings",
            bookings.length
        );


        setValue(
            "pendingBookings",
            pendingBookings.length
        );


        setValue(
            "confirmedBookings",
            confirmedBookings.length
        );


        setValue(
            "cancelledBookings",
            cancelledBookings.length
        );


        // ---------------------------------------------
        // REVENUE
        // ---------------------------------------------

        const confirmedRevenue =
            confirmedBookings.reduce(
                (
                    total,
                    booking
                ) => {

                    return (
                        total +
                        Number(
                            booking.totalPrice ||
                            booking.price ||
                            0
                        )
                    );

                },
                0
            );


        const totalRevenue =
            document.getElementById(
                "totalRevenue"
            );


        if (totalRevenue) {

            totalRevenue.textContent =
                `₹${confirmedRevenue.toLocaleString("en-IN")}`;
        }


        // ---------------------------------------------
        // CATEGORY-WISE REVENUE
        // ---------------------------------------------

        const revenueByCategory = {

            Bike: 0,

            Car: 0,

            Tractor: 0,

            Agriculture: 0,

            Other: 0
        };


        confirmedBookings.forEach(
            booking => {

                const vehicle =
                    booking.car ||
                    booking.vehicle ||
                    {};


                const category =
                    getVehicleCategory(
                        vehicle
                    );


                const amount =
                    Number(
                        booking.totalPrice ||
                        booking.price ||
                        0
                    );


                if (
                    revenueByCategory[
                        category
                    ] !== undefined
                ) {

                    revenueByCategory[
                        category
                    ] += amount;

                } else {

                    revenueByCategory.Other +=
                        amount;
                }

            }
        );


        setValue(
            "bikeRevenue",
            `₹${revenueByCategory.Bike.toLocaleString("en-IN")}`
        );


        setValue(
            "carRevenue",
            `₹${revenueByCategory.Car.toLocaleString("en-IN")}`
        );


        setValue(
            "tractorRevenue",
            `₹${revenueByCategory.Tractor.toLocaleString("en-IN")}`
        );


        setValue(
            "agricultureRevenue",
            `₹${revenueByCategory.Agriculture.toLocaleString("en-IN")}`
        );


        // ---------------------------------------------
        // AVAILABLE VEHICLE TOTAL
        // ---------------------------------------------

        setValue(
            "availableVehicleTotal",
            availableCars.length
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        if (dashboardPage) {

            dashboardPage.innerHTML = `

                <p class="text-red-500">
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            `;
        }
    }
}


// =====================================================
// CLOSE MODALS BY OUTSIDE CLICK
// =====================================================

document.addEventListener(
    "click",
    event => {

        const vehicleModal =
            document.getElementById(
                "vehicleViewModal"
            );


        if (
            vehicleModal &&
            event.target ===
                vehicleModal
        ) {

            closeVehicleView();
        }


        const bookingModal =
            document.getElementById(
                "bookingViewModal"
            );


        if (
            bookingModal &&
            event.target ===
                bookingModal
        ) {

            closeBooking();
        }


        const editModal =
            document.getElementById(
                "editModal"
            );


        if (
            editModal &&
            event.target ===
                editModal
        ) {

            closeEditModal();
        }

    }
);


// =====================================================
// ESC KEY
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        closeVehicleView();

        closeBooking();

        closeEditModal();

    }
);


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ---------------------------------------------
        // ADD VEHICLE FORM
        // ---------------------------------------------

        const addCarForm =
            document.getElementById(
                "addCarForm"
            );


        if (addCarForm) {

            addCarForm.addEventListener(
                "submit",
                addVehicle
            );
        }


        // ---------------------------------------------
        // EDIT VEHICLE FORM
        // ---------------------------------------------

        const editCarForm =
            document.getElementById(
                "editCarForm"
            );


        if (editCarForm) {

            editCarForm.addEventListener(
                "submit",
                updateOwnerCar
            );
        }


        // ---------------------------------------------
        // CLOSE EDIT
        // ---------------------------------------------

        const closeEdit =
            document.getElementById(
                "closeEdit"
            );


        if (closeEdit) {

            closeEdit.addEventListener(
                "click",
                closeEditModal
            );
        }


        // ---------------------------------------------
        // MANAGE CARS
        // ---------------------------------------------

        if (
            document.getElementById(
                "ownerCars"
            )
        ) {

            loadOwnerCars();
        }


        // ---------------------------------------------
        // BOOKINGS
        // ---------------------------------------------

        if (
            document.getElementById(
                "ownerBookings"
            )
        ) {

            loadBookings();
        }


        // ---------------------------------------------
        // DASHBOARD
        // ---------------------------------------------

        if (
            document.getElementById(
                "dashboardVehicleStats"
            ) ||
            document.getElementById(
                "availableVehicleCount"
            )
        ) {

            loadDashboard();
        }


        // ---------------------------------------------
        // BOOKING CLOSE BUTTON
        // ---------------------------------------------

        const closeBookingView =
            document.getElementById(
                "closeBookingView"
            );


        if (closeBookingView) {

            closeBookingView.addEventListener(
                "click",
                closeBooking
            );
        }

    }
);


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.addVehicle =
    addVehicle;

window.loadOwnerCars =
    loadOwnerCars;

window.viewCar =
    viewCar;

window.closeVehicleView =
    closeVehicleView;

window.editCar =
    editCar;

window.closeEditModal =
    closeEditModal;

window.updateOwnerCar =
    updateOwnerCar;

window.deleteCar =
    deleteCar;

window.loadBookings =
    loadBookings;

window.changeStatus =
    changeStatus;

window.viewBooking =
    viewBooking;

window.deleteBooking =
    deleteBooking;

window.closeBooking =
    closeBooking;

window.loadDashboard =
    loadDashboard;