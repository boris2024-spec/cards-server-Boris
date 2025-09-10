import mongoose from "mongoose"

export const users = [
    // Regular user
    {
        "_id": new mongoose.Types.ObjectId("68a9956e78ea8c56cb07ba1f"),
        "name": {
            "first": "John",
            "middle": "Michael",
            "last": "Smith"
        },
        "phone": "050-1234567",
        "email": "user@example.com",
        "password": "User123!",
        "image": {
            "url": "https://picsum.photos/300/300?random=1",
            "alt": "User photo"
        },
        "address": {
            "state": "Central District",
            "country": "Israel",
            "city": "Tel Aviv",
            "street": "Dizengoff",
            "houseNumber": 10,
            "zip": 12345
        },
        "isAdmin": false,
        "isBusiness": false,
        "isBlocked": false,
        "createdAt": new Date("2025-08-23T10:18:22.027Z"),
        "__v": 0
    },
    // Business user
    {
        "_id": new mongoose.Types.ObjectId("68a63f25494280a3ea7110cf"),
        "name": {
            "first": "Sarah",
            "middle": "Rachel",
            "last": "Cohen"
        },
        "phone": "054-2663030",
        "email": "business@example.com",
        "password": "Business123!",
        "image": {
            "url": "https://picsum.photos/300/300?random=2",
            "alt": "Business user photo"
        },
        "address": {
            "state": "Southern District",
            "country": "Israel",
            "city": "Beer Sheva",
            "street": "Ben Gurion",
            "houseNumber": 25,
            "zip": 84105
        },
        "isAdmin": false,
        "isBusiness": true,
        "isBlocked": false,
        "createdAt": new Date("2025-08-20T21:33:25.222Z"),
        "__v": 0
    },
    // Administrator
    {
        "_id": new mongoose.Types.ObjectId("68a61aa3249b730d4d3dbddc"),
        "name": {
            "first": "Boris",
            "middle": "Alexander",
            "last": "Admin"
        },
        "phone": "052-1234567",
        "email": "admin@example.com",
        "password": "Admin123!",
        "image": {
            "url": "https://picsum.photos/300/300?random=3",
            "alt": "Administrator photo"
        },
        "address": {
            "state": "Northern District",
            "country": "Israel",
            "city": "Haifa",
            "street": "Herzl",
            "houseNumber": 15,
            "zip": 31048
        },
        "isAdmin": true,
        "isBusiness": true,
        "isBlocked": false,
        "createdAt": new Date("2025-08-20T18:57:39.859Z"),
        "__v": 0
    }
]

export const cards = [
    // Card from regular user
    {
        "_id": new mongoose.Types.ObjectId("68bad8610a9970f774b6e815"),
        "title": "Personal Services",
        "subtitle": "Math Tutoring",
        "description": "Experienced math teacher offers individual lessons for school and college students. Quality exam preparation and academic support.",
        "phone": "050-1234567",
        "email": "user@example.com",
        "web": "https://math-tutor.example.com",
        "image": {
            "url": "https://picsum.photos/400/300?random=10",
            "alt": "Math books and calculator"
        },
        "address": {
            "state": "Central District",
            "country": "Israel",
            "city": "Tel Aviv",
            "street": "Dizengoff",
            "houseNumber": 10,
            "zip": 12345
        },
        "bizNumber": 1234567,
        "likes": ["68a61aa3249b730d4d3dbddc"],
        "isBlocked": false,
        "user_id": "68a9956e78ea8c56cb07ba1f",
        "createdAt": new Date("2025-09-05T12:32:33.205Z"),
        "__v": 0
    },
    // Card from business user
    {
        "_id": new mongoose.Types.ObjectId("55819f31b1c4ba0d21f276bf"),
        "title": "Shalom Cafe",
        "subtitle": "Kosher Food & Cozy Atmosphere",
        "description": "Family cafe with traditional Israeli and Jewish cuisine. Fresh ingredients, homely atmosphere, kosher food certified by local rabbinate.",
        "phone": "054-2663030",
        "email": "business@example.com",
        "web": "https://shalom-cafe.example.com",
        "image": {
            "url": "https://picsum.photos/400/300?random=11",
            "alt": "Cafe interior with tables"
        },
        "address": {
            "state": "Southern District",
            "country": "Israel",
            "city": "Beer Sheva",
            "street": "Ben Gurion",
            "houseNumber": 25,
            "zip": 84105
        },
        "bizNumber": 2345678,
        "likes": ["68a61aa3249b730d4d3dbddc", "68a9956e78ea8c56cb07ba1f"],
        "isBlocked": false,
        "user_id": "68a63f25494280a3ea7110cf",
        "createdAt": new Date("2025-08-21T10:15:30.000Z"),
        "__v": 0
    },
    // Card from administrator
    {
        "_id": new mongoose.Types.ObjectId("83e632aa5ab7073ffd2baab8"),
        "title": "IT Consulting Services",
        "subtitle": "Web Development & Technical Support",
        "description": "Professional web application development services, IT consulting, and technical support for small and medium businesses. Full-stack solutions.",
        "phone": "052-1234567",
        "email": "admin@example.com",
        "web": "https://it-consulting.example.com",
        "image": {
            "url": "https://picsum.photos/400/300?random=12",
            "alt": "Modern IT office workspace"
        },
        "address": {
            "state": "Northern District",
            "country": "Israel",
            "city": "Haifa",
            "street": "Herzl",
            "houseNumber": 15,
            "zip": 31048
        },
        "bizNumber": 3456789,
        "likes": ["68a63f25494280a3ea7110cf"],
        "isBlocked": false,
        "user_id": "68a61aa3249b730d4d3dbddc",
        "createdAt": new Date("2025-08-22T14:20:15.000Z"),
        "__v": 0
    }
]

