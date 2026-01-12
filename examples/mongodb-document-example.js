// Example MongoDB User Document After Cloudinary Upload

// BEFORE UPLOAD
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2a$10$hashedpassword...",
  "profilePicUrl": null,
  "resumeUrl": null,
  "savedJobs": [],
  "appliedJobs": [],
  "role": "user",
  "createdAt": ISODate("2026-01-12T10:00:00.000Z"),
  "updatedAt": ISODate("2026-01-12T10:00:00.000Z"),
  "__v": 0
}

// AFTER UPLOADING PROFILE PICTURE
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2a$10$hashedpassword...",
  "profilePicUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1705056789/jobscout/profile-pictures/abc123xyz789.jpg",
  "resumeUrl": null,
  "savedJobs": [],
  "appliedJobs": [],
  "role": "user",
  "createdAt": ISODate("2026-01-12T10:00:00.000Z"),
  "updatedAt": ISODate("2026-01-12T10:15:30.000Z"),
  "__v": 0
}

// AFTER UPLOADING RESUME
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2a$10$hashedpassword...",
  "profilePicUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1705056789/jobscout/profile-pictures/abc123xyz789.jpg",
  "resumeUrl": "https://res.cloudinary.com/your-cloud-name/raw/upload/v1705057012/jobscout/resumes/def456uvw123.pdf",
  "savedJobs": [],
  "appliedJobs": [],
  "role": "user",
  "createdAt": ISODate("2026-01-12T10:00:00.000Z"),
  "updatedAt": ISODate("2026-01-12T10:18:45.000Z"),
  "__v": 0
}

// WITH SAVED AND APPLIED JOBS
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2a$10$hashedpassword...",
  "profilePicUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1705056789/jobscout/profile-pictures/abc123xyz789.jpg",
  "resumeUrl": "https://res.cloudinary.com/your-cloud-name/raw/upload/v1705057012/jobscout/resumes/def456uvw123.pdf",
  "savedJobs": [
    ObjectId("507f191e810c19729de860ea"),
    ObjectId("507f191e810c19729de860eb"),
    ObjectId("507f191e810c19729de860ec")
  ],
  "appliedJobs": [
    ObjectId("507f191e810c19729de860ea")
  ],
  "role": "user",
  "createdAt": ISODate("2026-01-12T10:00:00.000Z"),
  "updatedAt": ISODate("2026-01-12T11:30:00.000Z"),
  "__v": 0
}

/*
 * KEY OBSERVATIONS:
 * 
 * 1. File URLs are stored as strings, NOT base64 data
 *    - profilePicUrl: Full HTTPS Cloudinary image URL
 *    - resumeUrl: Full HTTPS Cloudinary raw file URL
 * 
 * 2. URL Structure:
 *    - Base: https://res.cloudinary.com/
 *    - Cloud Name: your-cloud-name
 *    - Resource Type: image/upload or raw/upload
 *    - Version: v1705056789 (timestamp)
 *    - Folder: jobscout/profile-pictures or jobscout/resumes
 *    - Public ID: unique identifier with extension
 * 
 * 3. Benefits of URL Storage:
 *    - Small document size (vs base64)
 *    - Fast queries
 *    - CDN delivery
 *    - Built-in transformations
 *    - Automatic optimization
 * 
 * 4. Document Size Comparison:
 *    - With URLs: ~500 bytes
 *    - With base64 (5MB image): ~6.7MB
 *    - Reduction: 99.99%
 * 
 * 5. updatedAt timestamp changes with each upload
 * 
 * 6. null values before upload (not undefined)
 */

// EXAMPLE CLOUDINARY URLS BREAKDOWN

// Profile Picture URL:
// https://res.cloudinary.com/demo-cloud/image/upload/v1705056789/jobscout/profile-pictures/abc123.jpg
//        └─────────┬─────────┘ └──┬──┘ └─┬─┘ └──┬─┘ └──┬──┘ └────────┬──────────┘ └────┬────┘ └─┬─┘
//           Cloudinary CDN    Cloud  Type Version   Upload  Folder Path              Public ID  Format
//                            Name                   Method

// Resume URL:
// https://res.cloudinary.com/demo-cloud/raw/upload/v1705057012/jobscout/resumes/def456.pdf
//        └─────────┬─────────┘ └──┬──┘ └┬┘ └──┬─┘ └──┬──┘ └────┬────┘ └──┬──┘ └──┬──┘ └┬┘
//           Cloudinary CDN    Cloud Raw Upload Version  Folder    Resumes Public ID PDF
//                            Name  Type Method                   Subfolder

// QUERY EXAMPLES

// Find users with profile pictures
db.users.find({ profilePicUrl: { $ne: null } })

// Find users with resumes
db.users.find({ resumeUrl: { $ne: null } })

// Find users with both
db.users.find({ 
  profilePicUrl: { $ne: null },
  resumeUrl: { $ne: null }
})

// Get user profile for frontend
db.users.findOne(
  { email: "john.doe@example.com" },
  { 
    name: 1, 
    email: 1, 
    profilePicUrl: 1, 
    resumeUrl: 1,
    savedJobs: 1,
    appliedJobs: 1
  }
)

// Update profile picture URL
db.users.updateOne(
  { email: "john.doe@example.com" },
  { 
    $set: { 
      profilePicUrl: "https://res.cloudinary.com/.../new-pic.jpg",
      updatedAt: new Date()
    }
  }
)

// Remove resume
db.users.updateOne(
  { email: "john.doe@example.com" },
  { 
    $set: { 
      resumeUrl: null,
      updatedAt: new Date()
    }
  }
)
