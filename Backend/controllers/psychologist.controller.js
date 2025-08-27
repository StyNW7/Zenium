import Psychologist from "../models/psychologist.model.js";
import { isAdmin } from "../middleware/authMiddleware.js";

// Get all psychologists with optional filtering
export const getAllPsychologists = async (req, res) => {
  try {
    const { lat, lng, radius = 10, specialization } = req.query;
    
    let query = {};
    
    // Filter by specialization if provided
    if (specialization) {
      query.specialization = { $in: Array.isArray(specialization) ? specialization : [specialization] };
    }
    
    // Filter by location if coordinates are provided
    if (lat && lng) {
      const radiusInMeters = radius * 1000; // Convert km to meters
      
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)], // MongoDB uses [longitude, latitude]
          },
          $maxDistance: radiusInMeters,
        },
      };
    }
    
    const psychologists = await Psychologist.find(query);
    
    // Calculate match score and distance if coordinates are provided
    let results = psychologists;
    
    if (lat && lng) {
      results = psychologists.map(psych => {
        // Calculate distance in kilometers
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          psych.location.coordinates[1], // latitude
          psych.location.coordinates[0]  // longitude
        );
        
        // Calculate a simple match score (can be enhanced with more factors)
        const matchScore = Math.round(100 - (distance * 5) + (psych.rating * 10));
        
        return {
          ...psych._doc,
          distance: parseFloat(distance.toFixed(1)),
          matchScore: Math.min(Math.max(matchScore, 50), 99) // Clamp between 50-99
        };
      });
      
      // Sort by match score
      results.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error getting psychologists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get psychologists",
      error: error.message,
    });
  }
};

// Get a single psychologist by ID
export const getPsychologistById = async (req, res) => {
  try {
    const psychologist = await Psychologist.findById(req.params.id);
    
    if (!psychologist) {
      return res.status(404).json({
        success: false,
        message: "Psychologist not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: psychologist,
    });
  } catch (error) {
    console.error("Error getting psychologist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get psychologist",
      error: error.message,
    });
  }
};

// Create a new psychologist (admin only)
export const createPsychologist = async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }
    
    const newPsychologist = new Psychologist(req.body);
    const savedPsychologist = await newPsychologist.save();
    
    res.status(201).json({
      success: true,
      message: "Psychologist created successfully",
      data: savedPsychologist,
    });
  } catch (error) {
    console.error("Error creating psychologist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create psychologist",
      error: error.message,
    });
  }
};

// Update a psychologist (admin only)
export const updatePsychologist = async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }
    
    const updatedPsychologist = await Psychologist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPsychologist) {
      return res.status(404).json({
        success: false,
        message: "Psychologist not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Psychologist updated successfully",
      data: updatedPsychologist,
    });
  } catch (error) {
    console.error("Error updating psychologist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update psychologist",
      error: error.message,
    });
  }
};

// Delete a psychologist (admin only)
export const deletePsychologist = async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }
    
    const deletedPsychologist = await Psychologist.findByIdAndDelete(req.params.id);
    
    if (!deletedPsychologist) {
      return res.status(404).json({
        success: false,
        message: "Psychologist not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Psychologist deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting psychologist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete psychologist",
      error: error.message,
    });
  }
};

// Seed psychologists data (admin only)
export const seedPsychologists = async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }
    
    // Sample data for Jakarta area
    const samplePsychologists = [
      {
        name: "Dr. Anita Wijaya, M.Psi",
        specialization: ["Depresi", "Kecemasan", "Trauma"],
        rating: 4.9,
        experience: 8,
        address: "Jl. Kesehatan Mental No. 123, Jakarta Selatan",
        location: {
          type: "Point",
          coordinates: [106.8294, -6.2088] // [longitude, latitude] for Jakarta Selatan
        },
        price: "Rp350.000 / sesi",
        availability: ["Pagi", "Sore", "Akhir Pekan"],
        description: "Psikolog klinis dengan pengalaman menangani kasus depresi dan kecemasan. Menggunakan pendekatan CBT dan mindfulness dalam terapi.",
        photoUrl: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        name: "Dr. Budi Santoso, Psi.",
        specialization: ["Hubungan", "Keluarga", "Stres"],
        rating: 4.7,
        experience: 12,
        address: "Jl. Harmoni Keluarga No. 45, Jakarta Pusat",
        location: {
          type: "Point",
          coordinates: [106.8456, -6.1751] // [longitude, latitude] for Jakarta Pusat
        },
        price: "Rp400.000 / sesi",
        availability: ["Siang", "Sore", "Malam"],
        description: "Spesialis terapi keluarga dan pasangan dengan pendekatan sistemik. Berpengalaman menangani konflik keluarga dan masalah hubungan.",
        photoUrl: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        name: "Dra. Citra Handayani, M.Psi",
        specialization: ["Anak & Remaja", "Trauma", "Kesehatan Mental Umum"],
        rating: 4.8,
        experience: 10,
        address: "Jl. Tumbuh Kembang No. 78, Jakarta Timur",
        location: {
          type: "Point",
          coordinates: [106.9187, -6.2382] // [longitude, latitude] for Jakarta Timur
        },
        price: "Rp300.000 / sesi",
        availability: ["Pagi", "Siang", "Akhir Pekan"],
        description: "Psikolog anak dan remaja dengan keahlian dalam perkembangan dan trauma masa kecil. Menggunakan pendekatan bermain dan art therapy.",
        photoUrl: "https://randomuser.me/api/portraits/women/68.jpg"
      },
      {
        name: "Dr. Denny Pratama, Psi.",
        specialization: ["Adiksi", "Depresi", "Stres"],
        rating: 4.6,
        experience: 7,
        address: "Jl. Pemulihan No. 56, Jakarta Barat",
        location: {
          type: "Point",
          coordinates: [106.7892, -6.1754] // [longitude, latitude] for Jakarta Barat
        },
        price: "Rp250.000 / sesi",
        availability: ["Sore", "Malam"],
        description: "Spesialis adiksi dan pemulihan dengan pendekatan holistik. Berpengalaman menangani kasus ketergantungan zat dan perilaku.",
        photoUrl: "https://randomuser.me/api/portraits/men/55.jpg"
      },
      {
        name: "Dr. Eka Putri, M.Psi",
        specialization: ["Karir", "Stres", "Kecemasan"],
        rating: 4.5,
        experience: 5,
        address: "Jl. Profesional No. 90, Jakarta Selatan",
        location: {
          type: "Point",
          coordinates: [106.8249, -6.2360] // [longitude, latitude] for another area in Jakarta Selatan
        },
        price: "Rp300.000 / sesi",
        availability: ["Pagi", "Siang", "Malam"],
        description: "Psikolog karir dan pengembangan profesional. Membantu klien mengatasi stres kerja, burnout, dan menemukan keseimbangan hidup-kerja.",
        photoUrl: "https://randomuser.me/api/portraits/women/22.jpg"
      }
    ];
    
    // Clear existing data
    await Psychologist.deleteMany({});
    
    // Insert sample data
    const seededPsychologists = await Psychologist.insertMany(samplePsychologists);
    
    res.status(200).json({
      success: true,
      message: "Psychologists data seeded successfully",
      count: seededPsychologists.length,
      data: seededPsychologists,
    });
  } catch (error) {
    console.error("Error seeding psychologists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed psychologists data",
      error: error.message,
    });
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}