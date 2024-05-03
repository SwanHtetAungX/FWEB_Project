// Import necessary modules and dependencies
import { expect } from "chai";
import supertest from "supertest";
import app from "../server/server.mjs"; // Assuming 'app' is the Express application

// Create a supertest instance for making HTTP requests to the app
const request = supertest(app);
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWJlNGQyNjlkMGUwM2ZmMGUwNWUzMTciLCJpYXQiOjE3MDcxOTYyMTksImV4cCI6MTcwNzI4MjYxOX0.D3oALXpZrRCc2DXAz5p8ATyc-8c49vYVPPhEOzmANW4"
// Test suite for CCA (Co-Curricular Activity) management
describe("CCA management", () => {
  let memberId; // Variable to store the ID of a member for later use

  // Subsuite for testing the endpoint to GET all members
  describe("GET all members", () => {
    
    // Test case: It should return a list of members
    it("should return a list of members", async () => {
      const response = await request
        .get("/members")
        .set('Authorization', `Bearer ${token}`); // Correct way to set the Authorization header
  
      expect(response.status).to.equal(200); // Expecting a successful response status
      expect(response.body).to.be.an("array"); // Expecting the response body to be an array
    });
  });

  // Subsuite for testing the login functionality
  describe("Login", () => {
    // Test case: It should return a user object on successful login
    it("should return a user object on successful login", async () => {
      const response = await request.post("/members/login").send({
        email: "2200200J@student.tp.edu.sg",
        password: "123456",
      });
      expect(response.body).to.have.property("userId");
      expect(response.body).to.have.property("token");
    }).timeout(10000);;

    // Test case: It should return 404 if the email is not found
    it("should return 404 if email is not found", async () => {
      const response = await request.post("/members/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message", "Email not found");
    });

    // Test case: It should return 400 if the password is incorrect
    it("should return 400 if password is incorrect", async () => {
      const response = await request.post("/members/login").send({
        email: "2200200J@student.tp.edu.sg",
        password: "12345",
      });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "message",
        "Passwords do not match"
      );
    });
  });

  // Subsuite for testing the signup functionality
  describe("Add New Members, Sign Up", () => {
    // Test case: It should create a new member and return their details
    it("should create a new member and return their details", async () => {
      const response = await request.post("/members").send({
        name: "New User",
        email: "newuser1@example.com",
        role: "user",
        approvalStatus: "pending",
        profileImg: "avatar.jpg",
        password: "newUserPassword",
        joinedDate: "2022-01-14",
        reason: "New member",
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("username", "New User");
      expect(response.body).to.have.property("id");

      memberId = response.body.id; // Save the ID of the created member
    });

    // Test case: It should return 400 if the email is already taken
    it("should return 400 if email is already taken", async () => {
      const response = await request.post("/members").send({
        name: "Duplicate User",
        email: "newuser1@example.com", // This email should already exist
        role: "user",
        approvalStatus: "pending",
        profileImg: "avatar.jpg",
        password: "duplicateUserPassword",
        joinedDate: "2022-01-14",
        reason: "Duplicate member",
      });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("message", "Email already taken");
    });
  });

  // Subsuite for testing updating member details
  describe("Update Member Details", () => {
    // Test case: It should update a member and return the result
    it("should update a member and return the result", async () => {
      const response = await request.patch(`/members/${memberId}`).send({
        name: "Updated User",
        email: "updateduser@example.com",
        role: "admin",
        approvalStatus: "approved",
        profileImg: "new_avatar.jpg",
        password: "updatedUserPassword",
        joinedDate: "2022-01-15",
        reason: "Updated member details",
      })
      .set('Authorization', `Bearer ${token}`); 

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("modifiedCount", 1);
    });
  });

  // Subsuite for testing getting a member by ID
  describe("GET member by Id", () => {
    // Test case: It should return the details of a specific member
    it("should return the details of a specific member", async () => {
      const response = await request.get("/members/65a3a465c4a53b8f3b49d769")
      .set('Authorization', `Bearer ${token}`); ;

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("name", "Swan Htet Aung");
    });
  });

  // Subsuite for testing deleting a member
  describe("DELETE the Member", () => {
    // Test case: It should delete a member and return the result
    it("should delete a member and return the result", async () => {
      // Assume you have an existing member with ID 'existingUserId'
      const response = await request.delete(`/members/${memberId}`)
      .set('Authorization', `Bearer ${token}`); ;

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("deletedCount", 1);
    });
  });
});
