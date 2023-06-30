const Ajv = require('ajv')  // import library for validate json schema
const avj = new Ajv()       // create an instance

describe("HTTP requests", () => {
    it("POST Call with valid data", () => {
        cy.fixture("createBooking").then((data) => {
            const requestBody = data;
            cy.request({
                method: 'POST',
                url: '/booking',
                body: requestBody
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.booking.firstname).to.eq(requestBody.firstname)
                expect(response.body.booking.lastname).to.eq(requestBody.lastname)
                expect(response.body.booking.totalprice).to.eq(requestBody.totalprice)
                expect(response.body.booking.depositpaid).to.eq(requestBody.depositpaid)
                expect(response.body.booking.bookingdates.checkin).to.eq(requestBody.bookingdates.checkin)
                expect(response.body.booking.bookingdates.checkout).to.eq(requestBody.bookingdates.checkout)
                expect(response.body.booking.additionalneeds).to.eq(requestBody.additionalneeds)
            })
        })

    })

    it("POST Call with Invalid data", () => {
        cy.fixture("invalidDataForCreateBooking").then((data) => {
            const requestBody = data;
            cy.request({
                method: 'POST',
                url: '/booking',
                body: requestBody,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(500)
                cy.wrap(response.body).should('contains', 'Internal Server Error')
            })
        })

    })

    it("Create Auto Token with Possitive scenario(Valid UserName and Valid Password)", () => {
        cy.fixture("validUserAndPass").then((data) => {
            const fixtureData = data
            cy.request({
                method: 'POST',
                url: '/auth',
                body: fixtureData,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.token).to.exist
            })
        })
    })

    it("Try to create Auth Token with Negative scenario(InValid UserName and Valid Pass)", () => {
        cy.fixture("invalidUserNameValidPass").then((data) => {
            const fixData = data
            cy.request({
                method: 'POST',
                url: '/auth',
                body: fixData,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.reason).to.eq("Bad credentials")
            })
        })
    })

    it("Try to create Auth Token with Negative scenario(Valid UserName and InValid Pass)", () => {
        cy.fixture("validUserNameInvalidPass").then((data) => {
            const fixData = data
            cy.request({
                method: 'POST',
                url: '/auth',
                body: fixData,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.reason).to.eq("Bad credentials")
            })
        })
    })

    it("Try to create Auth Token with Negative scenario(Blank UserName or Password)", () => {
        cy.fixture("blankUserNameOrPass").then((data) => {
            const fixData = data
            cy.request({
                method: 'POST',
                url: '/auth',
                body: fixData,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.reason).to.eq("Bad credentials")
            })
        })
    })

    it("Verify GET Request and JSON Schema", () => {
        cy.request({
            method: 'GET',
            url: '/booking',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(200)
            const schema = require("../fixtures/schema.json")
            const validate = avj.compile(schema)
            const isvalid = validate(response.body)
            expect(isvalid).to.be.true
        })
    })

    it("Verify PUT request for updating booking", () => {
        const uname = Cypress.env("username")
        const pass = Cypress.env("password")
        cy.fixture("updateDetails").then((data)=>{
            const updatedBooking = data
        cy.request({
          method: 'PUT',
          url: '/booking/821',
          auth: {
            username: uname,
            password: pass
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Cookie": "token=abc123"
          },
          body: updatedBooking,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.deep.equal(updatedBooking)
          expect(response.body.firstname).to.deep.equal(updatedBooking.firstname)
          expect(response.body.lastname).to.deep.equal(updatedBooking.lastname)
          expect(response.body.totalprice).to.deep.equal(updatedBooking.totalprice)
          expect(response.body.depositpaid).to.deep.equal(updatedBooking.depositpaid)
          expect(response.body.bookingdates.checkin).to.deep.equal(updatedBooking.bookingdates.checkin)
          expect(response.body.bookingdates.checkout).to.deep.equal(updatedBooking.bookingdates.checkout)
          expect(response.body.additionalneeds).to.deep.equal(updatedBooking.additionalneeds)
        })
      })
    })
})