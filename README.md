<img width="3188" height="1202" alt="frame (3)" src="https://github.com/user-attachments/assets/517ad8e9-ad22-457d-9538-a9e62d137cd7" />


# PothuHole 🎯


## Basic Details
### Team Name: Bugs


### Team Members
- Team Lead: Sinaj P S - Govt. Engineering College Palakkad
- Member 2: Navami B R - Govt. Engineering College Palakkad

### Project Description
"PothuHole" (a play on "Pothole" and the Malayalam word "Pothu" for Public) is a revolutionary web app that turns the civic duty of reporting public holes into a fun, competitive, and shareable experience. Users can upload photos of potholes, rate their danger level with a satisfying slider, and see all reported hazards on an interactive map. It’s not just about fixing roads; it’s about making bureaucracy fun with a touch of local Mallu humor.


### The Problem (that doesn't exist)
Reporting potholes is a dull, soul-crushing process that involves navigating drab government websites. Plus, there's no way to express the true emotional and spinal damage a particularly nasty pothole inflicts upon you and your vehicle. The world desperately needed a way to gamify road maintenance.


### The Solution (that nobody asked for)
We've built a platform where every pothole report is a chance for glory! Our app assigns a "Danger Level" to each pothole, accompanied by a witty, context-aware Malayalam quote. Users can climb the district leaderboard, share hilarious, auto-generated "Pothole Warning" cards on social media, and finally give a voice to the silent suffering of their car's suspension.



## Technical Details
### Technologies/Components Used
For Software:
- *Languages:* JavaScript (ES6+)
- *Frameworks:* React.js
- *Libraries:* Material-UI, React-Leaflet, Firebase, React-Router-DOM, browser-image-compression, dayjs
- *Tools:* npm, git, GitHub, Firebase CLI

For Hardware:
- Not applicable. Our project is 100% digital, requiring only a device with a web browser and an internet connection to function.

### Implementation
For Software:
# Run
http://pothu-hole.vercel.app

### Project Documentation
For Software:

# Screenshots (Add at least 3)
<img width="2880" height="1524" alt="Screenshot 2025-08-09 212432" src="https://github.com/user-attachments/assets/a94845cb-3dde-44b7-a21e-2709a583c5a2" />

<img width="2880" height="1524" alt="Screenshot 2025-08-09 212647" src="https://github.com/user-attachments/assets/d7e5c722-7f28-4558-9e9c-6a0173b188cf" />

<img width="2880" height="1524" alt="Screenshot 2025-08-09 212659" src="https://github.com/user-attachments/assets/f3b67d09-e0e8-41fd-8600-36cc3ea64a7c" />

<img width="2880" height="1524" alt="Screenshot 2025-08-09 212712" src="https://github.com/user-attachments/assets/42ae30b9-c2fc-46c1-bc64-d4a2d54b62f1" />

# Diagrams
![WhatsApp Image 2025-08-09 at 21 42 36_7f36b196](https://github.com/user-attachments/assets/e186e6e9-24f9-4260-8f2b-83fb530d257e)

[User] --> [React App: PothuHole]

  React App --> [Report Page]
    - User uploads photo (compressed to Base64)
    - User sets location & danger level (sees a funny quote)
    - On submit, data is sent to Firestore

  React App --> [Firebase Firestore]
    - (Writes) New report document is created in 'reports' collection
    - (Reads) Fetches all reports for Map, List, and Leaderboard pages

  Firebase Firestore --> [React App]
    - Data is displayed on [Map Page], [List Page], and [Leaderboard Page]

  Report Page --> [Success Page]
    - Displays the submitted report details and the quote
    - User can generate and share a 'Pothole Warning' card


## Team Contributions
- Navami BR: Developer
- Sinaj PS: Developer


---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--25-25?link=https%3A%2F%2Fwww.tinkerhub.org%2Fevents%2FQ2Q1TQKX6Q%2FUseless%2520Projects)




