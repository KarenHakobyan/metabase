import { signInAsAdmin, restore, USERS } from "__support__/cypress";
const { normal } = USERS;

describe("scenarios > admin > people", () => {
  beforeEach(() => {
    restore();
    signInAsAdmin();
  });

  const email = `testy${Math.round(Math.random() * 100000)}@metabase.com`;

  describe("user management", () => {
    it("should render (metabase-enterprise#210)", () => {
      cy.visit("/admin/people");

      cy.log("**Assert it loads People by default**");
      cy.get(".PageTitle").contains("People");

      cy.get(".ContentTable tbody tr")
        .as("result-rows")
        // Bobby Tables, No Collection Tableton, No Data Tableton, None Tableton, Robert Tableton
        .should("have.length", 5);

      // A small sidebar selector
      cy.get(".AdminList-items").within(() => {
        cy.findByText("People").should("have.class", "selected");
        cy.findByText("Groups").click();
      });

      cy.log("**Switch to 'Groups' and make sure it renders properly**");
      cy.get(".PageTitle").contains("Groups");

      // Administrators, All Users, collection, data
      cy.get("@result-rows").should("have.length", 4);

      cy.get(".AdminList-items").within(() => {
        cy.findByText("Groups").should("have.class", "selected");
      });

      cy.log(
        "**Dig into one of the user groups and make sure its members are listed**",
      );
      cy.findByText("All Users").click();
      cy.get(".PageTitle").contains("All Users");

      // The same list as for "People"
      cy.get("@result-rows").should("have.length", 5);
    });

    it("should allow admin to create new users", () => {
      cy.visit("/admin/people");
      cy.findByText("Add someone").click();

      // first modal
      cy.findByLabelText("First name").type("Testy");
      cy.findByLabelText("Last name").type("McTestface");
      // bit of a hack since there are multiple "Email" nodes
      cy.findByLabelText("Email").type(email);
      cy.findByText("Create").click();

      // second modal
      cy.findByText("Testy McTestface has been added");
      cy.findByText("Show").click();
      cy.findByText("Done").click();

      cy.findByText("Testy McTestface");
    });
    it("should disallow admin to create new users with case mutation of existing user", () => {
      cy.visit("/admin/people");
      cy.findByText("Add someone").click();

      // first modal
      cy.findByLabelText("First name").type(normal.first_name + "New");
      cy.findByLabelText("Last name").type(normal.last_name + "New");
      // bit of a hack since there are multiple "Email" nodes
      cy.findByLabelText("Email").type(normal.username.toUpperCase());
      cy.findByText("Create").click();
      cy.contains("Email address already in use.");
    });

    // Migrated from `frontend/test/metabase/admin/people/containers/EditUserModal.integ.spec.js`
    it("should edit existing user details", () => {
      const NEW_NAME = "John";

      cy.visit("/admin/people");
      cy.findByText(`${normal.first_name} ${normal.last_name}`)
        .closest("tr")
        .within(() => {
          cy.get(".Icon-ellipsis").click();
        });
      cy.findByText("Edit user").click();
      cy.findByDisplayValue(normal.first_name)
        .click()
        .clear()
        .type(NEW_NAME);
      cy.findByText("Update")
        .closest(".Button")
        .should("not.be.disabled")
        .click();
      cy.findByText(`${NEW_NAME} ${normal.last_name}`);
    });
  });
});
