const imagekit = require("../configs/imageKit");
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const User = require("../models/User");
const fs = require("fs");

// =====================================================
// HELPER - CONVERT VALUE TO ARRAY
// =====================================================

function toArray(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .filter(
                (item) =>
                    item !== undefined &&
                    item !== null &&
                    String(item).trim() !== ""
            )
            .map((item) =>
                String(item).trim()
            );
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        // JSON array string
        if (
            trimmed.startsWith("[") &&
            trimmed.endsWith("]")
        ) {
            try {
                const parsed =
                    JSON.parse(trimmed);

                if (Array.isArray(parsed)) {
                    return parsed
                        .filter(
                            (item) =>
                                item !== undefined &&
                                item !== null &&
                                String(item).trim() !== ""
                        )
                        .map((item) =>
                            String(item).trim()
                        );
                }
            } catch (error) {
                // Normal string
            }
        }

        return [trimmed];
    }

    return [value];
}

// =====================================================
// CHANGE ROLE TO OWNER
// =====================================================

const changeRoleToOwner = async (
    req,
    res
) => {
    try {
        const { _id } = req.user;

        await User.findByIdAndUpdate(
            _id,
            {
                role: "owner",
            }
        );

        return res.json({
            success: true,
            message:
                "Now you can list cars",
        });
    } catch (error) {
        console.error(
            "Change role error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// ADD CAR
// =====================================================

const addCar = async (req, res) => {
    try {
        const { _id } = req.user;

        let carData = {};

        // ------------------------------------------------
        // GET CAR DATA
        // ------------------------------------------------

        if (req.body.carData) {
            try {
                carData =
                    typeof req.body.carData ===
                    "string"
                        ? JSON.parse(
                            req.body.carData
                        )
                        : req.body.carData;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid carData JSON",
                });
            }
        } else {
            carData = {
                ...req.body,
            };
        }

        // ------------------------------------------------
        // FIX ARRAY FIELDS
        // ------------------------------------------------

        if (
            carData.brand !==
            undefined
        ) {
            carData.brand =
                toArray(
                    carData.brand
                );
        }

        if (
            carData.categories !==
            undefined
        ) {
            carData.categories =
                toArray(
                    carData.categories
                );
        }

        // ------------------------------------------------
        // SEATING CAPACITY
        // ------------------------------------------------

        const seatingCapacity =
            Number(
                carData.seating_capacity ??
                carData.seatingCapacity ??
                1
            );

        // ------------------------------------------------
        // AVAILABLE COUNT
        // ------------------------------------------------

        const availableCount =
            Number(
                carData.availableCount ??
                carData.available_count ??
                1
            );

        // ------------------------------------------------
        // VALIDATE SEATING CAPACITY
        // ------------------------------------------------

        if (
            !Number.isFinite(
                seatingCapacity
            ) ||
            seatingCapacity < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Seating capacity must be at least 1",
            });
        }

        // ------------------------------------------------
        // VALIDATE AVAILABLE COUNT
        // ------------------------------------------------

        if (
            !Number.isFinite(
                availableCount
            ) ||
            availableCount < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Available count cannot be negative",
            });
        }

        // ------------------------------------------------
        // IMAGES
        // ------------------------------------------------

        const imageFiles =
            req.files || [];

        let imageUrls = [];

        for (
            const file of imageFiles
        ) {
            try {
                const fileBuffer =
                    fs.readFileSync(
                        file.path
                    );

                const uploaded =
                    await imagekit.upload({
                        file: fileBuffer,
                        fileName:
                            file.originalname,
                        folder: "/cars",
                    });

                const optimizedUrl =
                    imagekit.url({
                        path:
                            uploaded.filePath,

                        transformation: [
                            {
                                width:
                                    "1280",
                            },
                            {
                                quality:
                                    "auto",
                            },
                            {
                                format:
                                    "webp",
                            },
                        ],
                    });

                imageUrls.push(
                    optimizedUrl
                );
            } catch (
                imageError
            ) {
                console.error(
                    "Image upload error:",
                    imageError
                );
            }
        }

        // ------------------------------------------------
        // CREATE CAR
        // ------------------------------------------------

        const newCar =
            await Car.create({

                ...carData,

                owner: _id,

                // IMPORTANT
                seating_capacity:
                    seatingCapacity,

                // IMPORTANT
                availableCount:
                    availableCount,

                whatsapp:
                    carData.whatsapp ||
                    "",

                email:
                    carData.email ||
                    "",

                brand:
                    toArray(
                        carData.brand
                    ),

                categories:
                    toArray(
                        carData.categories
                    ),

                location:
                    carData.location ||
                    {},

                images:
                    imageUrls,

                // Based on stock
                isAvailable:
                    availableCount > 0,
            });

        return res.status(201).json({
            success: true,
            message:
                "Car Added",
            car:
                newCar,
        });

    } catch (error) {
        console.error(
            "Add car error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

// =====================================================
// GET OWNER CARS
// =====================================================

const getOwnerCars = async (
    req,
    res
) => {
    try {
        const { _id } = req.user;

        const cars =
            await Car.find({
                owner: _id,
            }).sort({
                createdAt: -1,
            });

        return res.json({
            success: true,
            cars: cars,
        });

    } catch (error) {
        console.error(
            "Get owner cars error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

// =====================================================
// TOGGLE CAR AVAILABILITY
// =====================================================

const toggleCarAvailability =
    async (req, res) => {
        try {
            const { _id } =
                req.user;

            const carId =
                req.body.carId ||
                req.body.id ||
                req.body.vehicleId;

            if (!carId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Car ID is required",
                });
            }

            const car =
                await Car.findById(
                    carId
                );

            if (!car) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Car not found",
                });
            }

            // OWNER CHECK
            if (
                String(car.owner) !==
                String(_id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Unauthorized",
                });
            }

            car.isAvailable =
                !car.isAvailable;

            await car.save();

            return res.json({
                success: true,
                message:
                    "Availability updated",
                isAvailable:
                    car.isAvailable,
            });

        } catch (error) {
            console.error(
                "Toggle availability error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

// =====================================================
// DELETE CAR
// =====================================================

const deleteCar = async (
    req,
    res
) => {
    try {
        const { _id } =
            req.user;

        const carId =
            req.body.carId ||
            req.body.id ||
            req.body.vehicleId;

        if (!carId) {
            return res.status(400).json({
                success: false,
                message:
                    "Car ID is required",
            });
        }

        const car =
            await Car.findById(
                carId
            );

        if (!car) {
            return res.status(404).json({
                success: false,
                message:
                    "Car not found",
            });
        }

        // OWNER CHECK
        if (
            String(car.owner) !==
            String(_id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Unauthorized",
            });
        }

        // ------------------------------------------------
        // ACTIVE BOOKING CHECK
        // ------------------------------------------------

        const activeBooking =
            await Booking.findOne({
                car: carId,

                status: {
                    $in: [
                        "pending",
                        "confirmed",
                    ],
                },
            });

        if (activeBooking) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete booked car",
            });
        }

        // ------------------------------------------------
        // DELETE
        // ------------------------------------------------

        await Car.findByIdAndDelete(
            carId
        );

        return res.json({
            success: true,
            message:
                "Car deleted permanently",
        });

    } catch (error) {
        console.error(
            "Delete car error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

// =====================================================
// CATEGORY HELPER
// =====================================================

function getCategory(
    category
) {
    const value =
        String(category || "")
            .toLowerCase()
            .trim();

    if (
        value.includes("bike")
    ) {
        return "bike";
    }

    if (
        value.includes("car")
    ) {
        return "car";
    }

    if (
        value.includes("tractor")
    ) {
        return "tractor";
    }

    if (
        value.includes("agriculture") ||
        value.includes("machinery") ||
        value.includes("machinary")
    ) {
        return "agriculture";
    }

    return "";
}

// =====================================================
// DASHBOARD DATA
// =====================================================

const getDashboardData =
    async (req, res) => {
        try {

            const {
                _id,
                role,
            } = req.user;

            if (
                role !== "owner"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Unauthorized",
                });
            }

            // ------------------------------------------------
            // GET CARS + BOOKINGS
            // ------------------------------------------------

            const [
                cars,
                bookings,
            ] = await Promise.all([

                Car.find({
                    owner: _id,
                }).sort({
                    createdAt:
                        -1,
                }),

                Booking.find({
                    owner: _id,
                })
                    .populate("car")
                    .populate("user")
                    .sort({
                        createdAt:
                            -1,
                    }),
            ]);

            // ------------------------------------------------
            // VEHICLE COUNTS
            // ------------------------------------------------

            const vehicleCount = {
                bike: 0,
                car: 0,
                tractor: 0,
                agriculture: 0,
            };

            cars.forEach(
                (car) => {

                    let categoryValue =
                        car.category;

                    if (
                        !categoryValue &&
                        Array.isArray(
                            car.categories
                        ) &&
                        car.categories
                            .length > 0
                    ) {
                        categoryValue =
                            car.categories[0];
                    }

                    const category =
                        getCategory(
                            categoryValue
                        );

                    if (
                        vehicleCount[
                            category
                        ] !== undefined
                    ) {
                        vehicleCount[
                            category
                        ]++;
                    }
                }
            );

            // ------------------------------------------------
            // BOOKING COUNTS
            // ------------------------------------------------

            const pendingBookings =
                bookings.filter(
                    (booking) =>
                        String(
                            booking.status
                        ).toLowerCase() ===
                        "pending"
                );

            const confirmedBookings =
                bookings.filter(
                    (booking) =>
                        String(
                            booking.status
                        ).toLowerCase() ===
                        "confirmed"
                );

            const cancelledBookings =
                bookings.filter(
                    (booking) => {

                        const status =
                            String(
                                booking.status
                            ).toLowerCase();

                        return (
                            status ===
                                "cancelled" ||
                            status ===
                                "canceled" ||
                            booking.cancelledBy ===
                                "user" ||
                            booking.cancelledBy ===
                                "customer" ||
                            booking.userCancelled ===
                                true
                        );
                    }
                );

            // ------------------------------------------------
            // CATEGORY REVENUE
            // ------------------------------------------------

            const revenue = {
                bike: 0,
                car: 0,
                tractor: 0,
                agriculture: 0,
            };

            confirmedBookings.forEach(
                (booking) => {

                    let vehicle =
                        booking.car;

                    if (
                        !vehicle &&
                        booking.car
                    ) {
                        vehicle =
                            cars.find(
                                (car) =>
                                    String(
                                        car._id
                                    ) ===
                                    String(
                                        booking.car
                                    )
                            );
                    }

                    if (!vehicle) {
                        return;
                    }

                    let categoryValue =
                        vehicle.category;

                    if (
                        !categoryValue &&
                        Array.isArray(
                            vehicle.categories
                        ) &&
                        vehicle.categories
                            .length > 0
                    ) {
                        categoryValue =
                            vehicle
                                .categories[0];
                    }

                    const category =
                        getCategory(
                            categoryValue
                        );

                    const amount =
                        Number(
                            booking.totalPrice ||
                            booking.price ||
                            booking.amount ||
                            0
                        );

                    if (
                        revenue[
                            category
                        ] !== undefined
                    ) {
                        revenue[
                            category
                        ] += amount;
                    }
                }
            );

            // ------------------------------------------------
            // TOTAL REVENUE
            // ------------------------------------------------

            const totalRevenue =
                revenue.bike +
                revenue.car +
                revenue.tractor +
                revenue.agriculture;

            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.json({
                success: true,

                dashboardData: {

                    totalCars:
                        cars.length,

                    totalVehicles:
                        cars.length,

                    totalBookings:
                        bookings.length,

                    // VEHICLE COUNTS

                    bikeCount:
                        vehicleCount.bike,

                    carCount:
                        vehicleCount.car,

                    tractorCount:
                        vehicleCount.tractor,

                    agricultureCount:
                        vehicleCount.agriculture,

                    // BOOKING COUNTS

                    pendingBookings:
                        pendingBookings.length,

                    completedBookings:
                        confirmedBookings.length,

                    confirmedBookings:
                        confirmedBookings.length,

                    cancelledBookings:
                        cancelledBookings.length,

                    // REVENUE

                    bikeRevenue:
                        revenue.bike,

                    carRevenue:
                        revenue.car,

                    tractorRevenue:
                        revenue.tractor,

                    agricultureRevenue:
                        revenue.agriculture,

                    totalRevenue:
                        totalRevenue,

                    monthlyRevenue:
                        totalRevenue,

                    // BOOKINGS

                    recentBookings:
                        bookings,
                },
            });

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };

// =====================================================
// UPDATE CAR
// =====================================================

const updateCar = async (
    req,
    res
) => {
    try {

        const { id } =
            req.params;

        const { _id } =
            req.user;

        let updateData = {};

        // ------------------------------------------------
        // GET UPDATE DATA
        // ------------------------------------------------

        if (req.body.carData) {

            try {

                updateData =
                    typeof req.body.carData ===
                    "string"
                        ? JSON.parse(
                            req.body.carData
                        )
                        : req.body.carData;

            } catch (error) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid carData JSON",
                });
            }

        } else {

            updateData = {
                ...req.body,
            };
        }

        // ------------------------------------------------
        // REMOVE PROTECTED FIELDS
        // ------------------------------------------------

        delete updateData.owner;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // ------------------------------------------------
        // FIND CAR
        // ------------------------------------------------

        const car =
            await Car.findById(
                id
            );

        if (!car) {
            return res.status(404).json({
                success: false,
                message:
                    "Car not found",
            });
        }

        // ------------------------------------------------
        // OWNER CHECK
        // ------------------------------------------------

        if (
            String(car.owner) !==
            String(_id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Unauthorized",
            });
        }

        // ------------------------------------------------
        // BRAND
        // ------------------------------------------------

        if (
            updateData.brand !==
            undefined
        ) {
            updateData.brand =
                toArray(
                    updateData.brand
                );
        }

        // ------------------------------------------------
        // CATEGORIES
        // ------------------------------------------------

        if (
            updateData.categories !==
            undefined
        ) {
            updateData.categories =
                toArray(
                    updateData.categories
                );
        }

        // ------------------------------------------------
        // SEATING CAPACITY
        // ------------------------------------------------

        // Support old frontend name too
        if (
            updateData
                .seating_capacity ===
                undefined &&
            updateData
                .seatingCapacity !==
                undefined
        ) {

            updateData
                .seating_capacity =
                updateData
                    .seatingCapacity;
        }

        // Remove wrong field
        delete updateData
            .seatingCapacity;

        if (
            updateData
                .seating_capacity !==
            undefined
        ) {

            updateData
                .seating_capacity =
                Number(
                    updateData
                        .seating_capacity
                );

            if (
                !Number.isFinite(
                    updateData
                        .seating_capacity
                ) ||
                updateData
                    .seating_capacity < 1
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Seating capacity must be at least 1",
                });
            }
        }

        // ------------------------------------------------
        // AVAILABLE COUNT
        // ------------------------------------------------

        // Support old field name
        if (
            updateData
                .availableCount ===
                undefined &&
            updateData
                .available_count !==
                undefined
        ) {

            updateData
                .availableCount =
                updateData
                    .available_count;
        }

        delete updateData
            .available_count;

        if (
            updateData
                .availableCount !==
            undefined
        ) {

            updateData
                .availableCount =
                Number(
                    updateData
                        .availableCount
                );

            if (
                !Number.isFinite(
                    updateData
                        .availableCount
                ) ||
                updateData
                    .availableCount < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Available count cannot be negative",
                });
            }

            // Automatically update availability
            updateData.isAvailable =
                updateData
                    .availableCount > 0;
        }

        // ------------------------------------------------
        // PRICE
        // ------------------------------------------------

        if (
            updateData.pricePerDay !==
            undefined
        ) {

            updateData.pricePerDay =
                Number(
                    updateData.pricePerDay
                );
        }

        // ------------------------------------------------
        // DISCOUNT
        // ------------------------------------------------

        if (
            updateData.discount !==
            undefined
        ) {

            updateData.discount =
                Number(
                    updateData.discount
                );
        }

        // ------------------------------------------------
        // YEAR
        // ------------------------------------------------

        if (
            updateData.year !==
                undefined &&
            updateData.year !== ""
        ) {

            updateData.year =
                Number(
                    updateData.year
                );
        }

        // ------------------------------------------------
        // IMAGES FROM DATA
        // ------------------------------------------------

        if (
            updateData.images !==
            undefined
        ) {

            updateData.images =
                toArray(
                    updateData.images
                );
        }

        // ------------------------------------------------
        // NEW IMAGES
        // ------------------------------------------------

        if (
            req.files &&
            req.files.length > 0
        ) {

            let imageUrls = [];

            for (
                const file of req.files
            ) {

                try {

                    const fileBuffer =
                        fs.readFileSync(
                            file.path
                        );

                    const uploaded =
                        await imagekit.upload({
                            file:
                                fileBuffer,

                            fileName:
                                file.originalname,

                            folder:
                                "/cars",
                        });

                    const optimizedUrl =
                        imagekit.url({

                            path:
                                uploaded.filePath,

                            transformation: [
                                {
                                    width:
                                        "1280",
                                },
                                {
                                    quality:
                                        "auto",
                                },
                                {
                                    format:
                                        "webp",
                                },
                            ],
                        });

                    imageUrls.push(
                        optimizedUrl
                    );

                } catch (
                    imageError
                ) {

                    console.error(
                        "Update image upload error:",
                        imageError
                    );
                }
            }

            // Replace old images
            // only if new images uploaded
            if (
                imageUrls.length > 0
            ) {

                updateData.images =
                    imageUrls;
            }
        }

        // ------------------------------------------------
        // UPDATE CAR
        // ------------------------------------------------

        Object.assign(
            car,
            updateData
        );

        // Mongoose pre-save hook
        // will also run here
        const updatedCar =
            await car.save();

        // ------------------------------------------------
        // RESPONSE
        // ------------------------------------------------

        return res.json({

            success: true,

            message:
                "Car updated successfully",

            car:
                updatedCar,
        });

    } catch (error) {

        console.error(
            "Update car error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message,
        });
    }
};

// =====================================================
// UPDATE OWNER PROFILE IMAGE
// =====================================================

const updateUserImage =
    async (
        req,
        res
    ) => {

        try {

            const { _id } =
                req.user;

            const imageFile =
                req.file;

            if (!imageFile) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No image uploaded",
                });
            }

            const fileBuffer =
                fs.readFileSync(
                    imageFile.path
                );

            const uploaded =
                await imagekit.upload({
                    file:
                        fileBuffer,

                    fileName:
                        imageFile.originalname,

                    folder:
                        "/users",
                });

            const imageUrl =
                imagekit.url({

                    path:
                        uploaded.filePath,

                    transformation: [
                        {
                            width:
                                "400",
                        },
                        {
                            quality:
                                "auto",
                        },
                        {
                            format:
                                "webp",
                        },
                    ],
                });

            await User.findByIdAndUpdate(
                _id,
                {
                    image:
                        imageUrl,
                }
            );

            return res.json({

                success: true,

                message:
                    "Image updated",

                image:
                    imageUrl,
            });

        } catch (error) {

            console.error(
                "Update user image error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message,
            });
        }
    };

// =====================================================
// EXPORT
// =====================================================

module.exports = {

    changeRoleToOwner,

    addCar,

    getOwnerCars,

    toggleCarAvailability,

    deleteCar,

    getDashboardData,

    updateCar,

    updateUserImage,
};