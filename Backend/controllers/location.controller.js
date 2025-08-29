import Location from "../models/location.model.js";

// Get all locations with optional filtering
export const getLocations = async (req, res) => {
  try {
    const { type, lat, lng, radius = 5000, limit = 20 } = req.query;
    
    let query = {};
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // If coordinates are provided, find locations within radius (in meters)
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }
    
    const locations = await Location.find(query).limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get location by ID
export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    
    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create new location (admin only)
export const createLocation = async (req, res) => {
  try {
    // Check if user is admin (implement proper admin check)
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to add locations" });
    }
    
    const {
      name,
      type,
      coordinates,
      address,
      description,
      contactNumber,
      website,
      operatingHours
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !coordinates || !address) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }
    
    const newLocation = new Location({
      name,
      type,
      location: {
        type: "Point",
        coordinates
      },
      address,
      description,
      contactNumber,
      website,
      operatingHours
    });
    
    const savedLocation = await newLocation.save();
    
    res.status(201).json({
      success: true,
      data: savedLocation
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update location (admin only)
export const updateLocation = async (req, res) => {
  try {
    // Check if user is admin (implement proper admin check)
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to update locations" });
    }
    
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedLocation
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete location (admin only)
export const deleteLocation = async (req, res) => {
  try {
    // Check if user is admin (implement proper admin check)
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete locations" });
    }
    
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    
    await location.remove();
    
    res.status(200).json({
      success: true,
      message: "Location deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Save location analysis
export const saveLocationAnalysis = async (req, res) => {
  try {
    const { locationId, peacefulnessScore, areaDistribution } = req.body;
    const userId = req.user._id;

    if (!locationId || !peacefulnessScore || !areaDistribution) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const location = await Location.findById(locationId);

    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    // Save the analysis result to the location
    location.analysis = {
      userId,
      peacefulnessScore,
      areaDistribution,
      createdAt: Date.now()
    };

    await location.save();

    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error("Error saving location analysis:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Seed initial locations data
export const seedLocations = async (req, res) => {
  try {
    // Check if user is admin (implement proper admin check)
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to seed locations" });
    }
    
    // Sample location data
    const locationData = [
      {
        name: "Mental Health Clinic Jakarta",
        type: "clinic",
        location: {
          type: "Point",
          coordinates: [106.8456, -6.2088] // Jakarta coordinates
        },
        address: "Jl. Sudirman No. 123, Jakarta",
        description: "Professional mental health services",
        contactNumber: "+62 21 5551234",
        website: "www.mhcjakarta.com",
        operatingHours: "Mon-Fri: 8AM-5PM",
        rating: 4.5,
        verified: true
      },
      {
        name: "Peaceful Park",
        type: "park",
        location: {
          type: "Point",
          coordinates: [106.8230, -6.1754]
        },
        address: "Jl. Taman Suropati, Menteng, Jakarta",
        description: "Quiet park for relaxation and meditation",
        operatingHours: "Open 24/7",
        rating: 4.2,
        verified: true
      },
      {
        name: "Mindful Counseling Center",
        type: "counseling",
        location: {
          type: "Point",
          coordinates: [106.8142, -6.2022]
        },
        address: "Jl. Gatot Subroto No. 56, Jakarta",
        description: "Professional counseling services",
        contactNumber: "+62 21 5559876",
        website: "www.mindfulcounseling.id",
        operatingHours: "Mon-Sat: 9AM-6PM",
        rating: 4.8,
        verified: true
      },
      {
        name: "Serenity Cafe",
        type: "cafe",
        location: {
          type: "Point",
          coordinates: [106.8132, -6.2252]
        },
        address: "Jl. Senopati No. 45, Jakarta",
        description: "Quiet cafe with calming atmosphere",
        contactNumber: "+62 21 5557890",
        website: "www.serenitycafe.id",
        operatingHours: "Daily: 7AM-10PM",
        rating: 4.3,
        verified: true
      }
    ];
    
    // Clear existing data and insert new data
    await Location.deleteMany({});
    await Location.insertMany(locationData);
    
    res.status(200).json({
      success: true,
      message: "Locations seeded successfully",
      count: locationData.length
    });
  } catch (error) {
    console.error("Error seeding locations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
