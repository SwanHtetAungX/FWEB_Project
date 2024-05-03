describe("SignUpForm Tests", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
  });

  it("successfully loads the sign-up form", () => {
    cy.get(".ant-card").should("be.visible");
    cy.contains(
      "Welcome to Information Technology Student Interest Group"
    ).should("be.visible");
  });

  it("allows a user to sign up as a Main Committee member", () => {
    cy.contains("Main Committee").click();
    cy.get("#sign-up-main-name").type("Swan Htet Aung");
    cy.get("#sign-up-main-email").type("swanhtetaung@gmail.com");
    cy.get("#sign-up-main-password").type("Password123");
    cy.get("#sign-up-main-re-password").type("Password123");
    cy.get("#sign-up-main-code").type("ITSIGMainCom");

    // Mock the API request
    cy.intercept("POST", "http://localhost:5050/members", {
      statusCode: 200,
      body: { username: "Swan Htet Aung" },
    }).as("signUpRequest");
    cy.get('button[type="submit"]').click();
    cy.wait("@signUpRequest");
    cy.contains("Signed Up Successfully! Welcome Swan Htet Aung").should(
      "be.visible"
    );
  });

  it("validates input fields", () => {
    cy.get(".ant-tabs-tab").contains("Main Committee").click();
    cy.get('button[type="submit"]').click();
    cy.contains("Please input your full name!").should("be.visible");
    cy.contains("Please input your school E-mail!").should("be.visible");
    cy.contains("Please input your password!").should("be.visible");
    cy.contains("Please input the secret code!").should("be.visible");
  });

  it("shows error for unmatched password", () => {
    cy.get("#sign-up-main-name").type("Swan Htet Aung");
    cy.get("#sign-up-main-email").type("swanhtetaung@gmail.com");
    cy.get("#sign-up-main-password").type("Password123");
    cy.get("#sign-up-main-re-password").type("Password121");
    cy.get("#sign-up-main-code").type("ITSIGMain");
    cy.get('button[type="submit"]').click();
    cy.contains("The two passwords that you entered do not match!").should(
      "be.visible"
    );
  });

  it("shows error for incorrect secret code in Main Committee sign-up", () => {
    cy.get("#sign-up-main-name").type("Swan Htet Aung");
    cy.get("#sign-up-main-email").type("swanhtetaung@gmail.com");
    cy.get("#sign-up-main-password").type("Password123");
    cy.get("#sign-up-main-re-password").type("Password123");
    cy.get("#sign-up-main-code").type("WrongCode");
    cy.get('button[type="submit"]').click();
    cy.contains("Invalid secret code. Please try again.").should("be.visible");
  });

  it("displays message if email is already taken", () => {
    cy.get(".ant-tabs-tab").contains("Main Committee").click();
    cy.get("#sign-up-main-name").type("Swan Htet Aung");
    cy.get("#sign-up-main-email").type("swanhtetaung@gmail.com");
    cy.get("#sign-up-main-password").type("Password123");
    cy.get("#sign-up-main-re-password").type("Password123");
    cy.get("#sign-up-main-code").type("ITSIGMainCom");
    cy.intercept("POST", "http://localhost:5050/members", {
      statusCode: 400,
      body: { message: "Email already taken" },
    }).as("emailTaken");
    cy.get('button[type="submit"]').click();
    cy.wait("@emailTaken");
    cy.contains("Email already taken").should("be.visible");
  });
  it("allows a user to sign up as a  Sub Committee member", () => {
    cy.contains("Sub Committee").click();
    cy.get("#sign-up-sub-name").type("Swan Htet Aung");
    cy.get("#sign-up-sub-email").type("swanhtetaung@gmail.com");
    cy.get("#sign-up-sub-reason").type("I really want to join");

    // Mock the API request
    cy.intercept("POST", "http://localhost:5050/members", {
      statusCode: 200,
      body: { username: "Swan Htet Aung" },
    }).as("signUpRequest");
    cy.get("#submit-sub").click();
    cy.wait("@signUpRequest");
    cy.contains("Sub Committee member added successfully").should("be.visible");
  });
});

describe("Login Component Tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/login"); // Assuming your login page is at /login
  });

  it("renders the login form correctly", () => {
    cy.get("#login-email").should("exist");
    cy.get("#login-password").should("exist");
    cy.get("#login-secret").should("exist");
    cy.get('button[type="submit"]').should("exist");
    cy.contains("Not a member? Sign Up").should("exist");
  });

  it("displays an error message for invalid secret code", () => {
    cy.get("#login-email").type("john.doe@example.com");
    cy.get("#login-password").type("Password123");
    cy.get("#login-secret").type("InvalidCode");
    cy.get('button[type="submit"]').click();
    cy.contains("Invalid secret code").should("be.visible");
  });

  it("logs in a user with valid credentials", () => {
    cy.intercept("POST", "http://localhost:5050/members/login", {
      statusCode: 200,
      body: {
        token: "yourAuthToken",
        userId: "yourUserId",
      },
    }).as("loginRequest");

    cy.get("#login-email").type("john.doe@example.com");
    cy.get("#login-password").type("Password123");
    cy.get("#login-secret").type("ITSIGMainCom");
    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest");
    cy.url().should("include", "/verify2fa");
    cy.window().its("localStorage.token").should("equal", "yourAuthToken");
    cy.window().its("sessionStorage.userId").should("equal", "yourUserId");
    cy.contains("Verfication Code Will Be Sent To Your Email!").should(
      "be.visible"
    );
  });

  it("displays an error message for invalid credentials", () => {
    cy.intercept("POST", "http://localhost:5050/members/login", {
      statusCode: 400,
      body: {
        message: "Invalid email or password",
      },
    }).as("failedLogin");

    cy.get("#login-email").type("invalid@example.com");
    cy.get("#login-password").type("InvalidPassword");
    cy.get("#login-secret").type("ITSIGMainCom");
    cy.get('button[type="submit"]').click();

    cy.wait("@failedLogin");
    cy.contains("Invalid email or password").should("be.visible");
  });
});
describe("2FA Verification Tests", () => {
  beforeEach(() => {
    // Set a fake userId in sessionStorage before each test
    cy.visit("localhost:3000/login", {
      onBeforeLoad(win) {
        win.sessionStorage.setItem("userId", "fakeUserId");
        win.localStorage.setItem("token", "fake_token");
      },
    });
    cy.visit("localhost:3000/verify2fa"); // Adjust this to your actual route
  });

  it("renders the 2FA verification form", () => {
    cy.contains("Please Enter the 2FA Code Sent To Your Email").should(
      "be.visible"
    );
    cy.get("#2factor-field").should("be.visible");
    cy.contains("Verify").should("be.visible");
  });

  it("successfully verifies 2FA code", () => {
    cy.intercept("POST", "http://localhost:5050/members/verify-2fa", {
      statusCode: 200,
      body: { message: "2FA Verification Successful!" },
    }).as("verify2FA");

    cy.get("#2factor-field").type("123456");
    cy.get('button[type="submit"]').click();

    cy.wait("@verify2FA");
    cy.contains("2FA Verification Successful!").should("be.visible");
    // Assuming your application navigates to "/members" upon successful verification
    cy.url().should("include", "/members");
  });

  it("shows error for invalid or expired 2FA code", () => {
    cy.intercept("POST", "http://localhost:5050/members/verify-2fa", {
      statusCode: 400,
      body: { message: "Invalid or expired 2FA code" },
    }).as("invalid2FA");

    cy.get("#2factor-field").type("654321");
    cy.get('button[type="submit"]').click();

    cy.wait("@invalid2FA");
    cy.contains("Invalid or expired 2FA code").should("be.visible");
  });
});

describe("Members Component Tests", () => {
  beforeEach(() => {
    
    cy.intercept("GET", "http://localhost:5050/members", {
      fixture: "members.json", 
    }).as("fetchMembers");

    cy.visit("localhost:3000/members", {
        onBeforeLoad(win) {
          win.sessionStorage.setItem("userId", "fakeUserId");
          win.localStorage.setItem("token", "fake_token");
        },
      });
  });

  it('renders members data after loading', () => {
    cy.wait('@fetchMembers');
    cy.get('.ant-table-row').should('have.length.greaterThan', 0); // Adjust based on your fixture data
  });

  
  
  it('rejects (removes) a member', () => {
    cy.wait('@fetchMembers');
    cy.intercept('DELETE', 'http://localhost:5050/members/*', {
    statusCode: 200,
    body: { message: 'Member removed successfully' },
  }).as('removeMember');
    cy.contains('button', 'Pending').click(); // Switch to Pending members view
    cy.get('.ant-table-row').first().find('button').contains('Reject').click(); // Click the first Reject button found
    cy.get('.ant-modal-confirm-btns button').contains('Yes').click(); // Confirm removal
    cy.wait('@removeMember');
    cy.contains('Member removed successfully').should('be.visible');
  });

  it('Remove member', () => {
    cy.wait('@fetchMembers');
    cy.intercept('DELETE', 'http://localhost:5050/members/*', {
    statusCode: 200,
    body: { message: 'Member removed successfully' },
  }).as('removeMember');  
    cy.contains('button', 'All Members').click();
    cy.get('.ant-table-row').eq(1).find('button').contains('Remove').click(); 
    cy.get('.ant-modal-confirm-btns button').contains('Yes').click(); // Confirm removal
    cy.wait('@removeMember');
    cy.contains('Member removed successfully').should('be.visible');
  });

  it('should navigate to the edit screen', () => { 
    cy.contains('button', 'All Members').click();
    cy.get('.ant-table-row').eq(1).find('button').contains('Edit').click(); 
    cy.url().should("include", "/edit-member");
  });
  


 
});

describe('Edit Member Tests', () => {
    beforeEach(() => {
      const token = 'testToken';
      cy.intercept('GET', 'http://localhost:5050/members/*', {
        fixture: 'member.json' 
      }).as('getMember');
  
      cy.visit('localhost:3000/edit-member/65a4015fe8ebcd444bd1f46e', {
        onBeforeLoad: (window) => {
          window.localStorage.setItem('token', token);
        }
      });
    });
  
    it('loads member data into form fields', () => {
      cy.wait('@getMember');
      cy.get('#edit-name').should('have.value', 'Chit');
      cy.get('#edit-email').should('have.value', 'chit@gmail.com');
    });

    it('submits updated member data successfully', () => {
        cy.intercept('PATCH', 'http://localhost:5050/members/*', {
          statusCode: 200,
          body: { message: "Member Updated successfully" },
        }).as('updateMember');
      
        cy.get('#edit-name').clear().type('Chaw Updated');
        cy.get('#edit-email').clear().type('chaw@gmail.com');
        cy.get('button[type="submit"]').click();
      
        cy.wait('@updateMember');
        cy.contains('Member Updated successfully').should('be.visible');
      });

      it('displays an error message on API failure', () => {
        cy.intercept('PATCH', 'http://localhost:5050/members/*', {
          statusCode: 500,
          body: { message: "Error Updating member" },
        }).as('updateFail');
      
        cy.get('#edit-name').clear().type('Failure Case');
        cy.get('#edit-email').click();
        cy.get('button[type="submit"]').click();
        cy.wait('@updateFail');
        cy.contains('Error Updating member. Please try again.').should('be.visible');
      });
      
      
  });
  
