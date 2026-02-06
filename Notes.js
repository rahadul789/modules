/*
  
Food Delivery Application – Functional Overview

This food delivery platform will be built using Node.js, Express.js, MongoDB for the backend, and React Native for mobile applications. The system will support multiple user roles, real-time operations, and scalable business workflows.

Technology Stack
Backend: Node.js, Express.js
Database: MongoDB
Mobile Applications: React Native
Web Applications: React (or any modern frontend framework)
Real-time Services: Socket.IO  (for live tracking and order updates)
Maps & Location: Google Maps API or similar 
also there will be Error handling and activity logging

User Roles (Actors)
There are four primary actors in the system:
Customer
Delivery Man
Restaurant Owner
Super Admin

Each actor has a dedicated interface and role-based permissions.
Mobile Applications (3)

1. Customer Mobile App
Customers will be able to:
Register, log in, and manage their profile
View nearby restaurants within a 5 km radius
Browse restaurant menus with item details and prices
Add items to cart and manage cart contents
Apply discount vouchers (if eligible)
Place food orders
Choose delivery address (GPS-based and manual entry also draggable on map)
Track order status in real time
View live location of the delivery man on the map(after order is picked up. If user minimize the app and when back in the app again the location should be updated. If user close the app then no location update until he open the app again)
View order history and reorder previous items
Rate restaurants and delivery experience
Receive push notifications for order updates

2. Delivery Man Mobile App
Delivery partners will be able to:
Register and get verified by the system
Go online/offline for delivery availability
Delivery partner can accept multiple orders simultaneously
Receive new delivery requests(push notifications along side if he in this app  then request popup on the screen with accept/reject option)
Accept or reject delivery orders (Within in 30 seconds of receiving request otherwise auto reject)
View pickup and drop-off locations via map
Update delivery status (Picked up, On the way, Delivered)
Share live location with customers
View completed deliveries and earnings summary

3. Restaurant Owner Mobile App
Restaurant owners can:
Log in and manage restaurant profile
Set restaurant online/offline status
View incoming customer orders in real time
Accept, prepare, or reject orders
Update order status (Preparing, Ready for pickup, Completed)
If he needs more time to prepare the order he can request extension (maximum 15 minutes) to customer with predefined reasons
View daily, weekly, and monthly order summaries

Web Applications (2)
1. Restaurant Owner Web Dashboard
The web dashboard provides full management features:
Create, update, and delete restaurant information
Manage menu items (CRUD operations)
Upload food images and set availability
Create, update, and delete discount  vouchers
Define voucher rules (expiry date, minimum order value, usage limit, percentage/flat discount)
View all orders with detailed status
Access sales reports and performance analytics

2. Super Admin Web Panel
The Super Admin has full system control, including:
Manage all users (customers, delivery men, restaurant owners)
Approve, block, or suspend accounts
Create, edit, or delete any restaurant or menu item
Override order statuses when necessary
Manage global vouchers and promotional campaigns
Monitor live orders and delivery tracking
Access complete system analytics and revenue reports
Control application-wide settings and configurations
Additional Core Functionalities

To ensure a smooth and scalable system, the following features will also be required:
Role-based authentication and authorization
Secure payment integration (Cash on Delivery, Online Payment)
Real-time order and delivery status updates
Push notifications (order status, offers, delivery updates)
Error handling and activity logging
Admin moderation and audit trails
Scalable API architecture for future expansion
Data security and privacy compliance 


////////////////////////////////////////////////// CONTEXT FOR PUSH NOTIFICATION //////////////////////////////////////////////////
i am working in node js, express js, mongodb and react native.

i want to implement push notification.

first i want to learn basics things about push notification then i want to move complex parts that are needed.  guide me step by step to leaning.

Do a final project after teaching and guiding while i practise.

Take a food delivery application as an example for push notification portion.
lets say i have 5 users. I can send push notification to a particular user or a group of users. There will be various type of push notifications

Do best production practises while making application.


 

////////////////////////////////////////////////// CONTEXT FOR NEARBY RESTAURANTS //////////////////////////////////////////////////
email: haqrahadul@gmail.com

i am working on node js express js , mongodb and react native.
this is my coordinate:__24.876535, 90.724821. it will needed for creating dummy restaurants.__

i want you first take location permission from user, and also show map on user screeen and also allow dragable location set. If denied then show a denied message and show a back button.

then show only nearby restaurant within 2 km from user current location.

i want you to make all the code with production level. so that i can start a startup.

guide me in all the step by step. also give me dummy data. so that i can see the nearby restaurant and what is not in nearby.


*/
