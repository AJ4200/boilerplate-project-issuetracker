//test/2_functional-tests.js
const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("POST /api/issues/:project", function () {
    test("Create an issue with every field", async function () {
      try {
        const res = await chai.request(server).post("/api/issues/test").send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field",
          assigned_to: "Chai and Mocha",
          status_text: "In QA",
        });
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "status_text");
      } catch (err) {
        throw err;
      }
    });

    test("Create an issue with only required fields", async function () {
      try {
        const res = await chai.request(server).post("/api/issues/test").send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Required fields",
        });
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
      } catch (err) {
        throw err;
      }
    });

    test("Create an issue with missing required fields", async function () {
      try {
        const res = await chai.request(server).post("/api/issues/test").send({
          issue_title: "Title",
        });
        assert.equal(res.status, 400);
        assert.equal(res.body.error, "required field(s) missing");
      } catch (err) {
        throw err;
      }
    });
  });

  suite("GET /api/issues/:project", function () {
    test("View issues on a project", async function () {
      try {
        const res = await chai.request(server).get("/api/issues/test");
        assert.equal(res.status, 200);
        assert.isArray(res.body);
      } catch (err) {
        throw err;
      }
    });

    test("View issues on a project with one filter", async function () {
      try {
        const res = await chai
          .request(server)
          .get("/api/issues/test")
          .query({ open: true });
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.equal(issue.open, true);
        });
      } catch (err) {
        throw err;
      }
    });

    test("View issues on a project with multiple filters", async function () {
      try {
        const res = await chai
          .request(server)
          .get("/api/issues/test")
          .query({
            open: true,
            created_by: "Functional Test - Required fields",
          });
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.equal(issue.open, true);
          assert.equal(issue.created_by, "Functional Test - Required fields");
        });
      } catch (err) {
        throw err;
      }
    });
  });

  suite("PUT /api/issues/:project", function () {
    test("Update one field on an issue", async function () {
      try {
        const res = await chai.request(server).put("/api/issues/test").send({
          _id: "existing_id",
          issue_text: "new text",
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.message, "successfully updated");
      } catch (err) {
        throw err;
      }
    });

    test("Update multiple fields on an issue", async function () {
      try {
        const res = await chai.request(server).put("/api/issues/test").send({
          _id: "existing_id",
          issue_text: "new text",
          status_text: "In Review",
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.message, "successfully updated");
      } catch (err) {
        throw err;
      }
    });

    test("Update an issue with missing _id", async function () {
      try {
        const res = await chai.request(server).put("/api/issues/test").send({
          issue_text: "new text",
        });
        assert.equal(res.status, 400);
        assert.equal(res.body.error, "missing _id");
      } catch (err) {
        throw err;
      }
    });

    test("Update an issue with no fields to update", async function () {
      try {
        const res = await chai.request(server).put("/api/issues/test").send({
          _id: "existing_id",
        });
        assert.equal(res.status, 400);
        assert.equal(res.body.error, "no update field(s) sent");
      } catch (err) {
        throw err;
      }
    });

    test("Update an issue with an invalid _id", async function () {
      try {
        const res = await chai.request(server).put("/api/issues/test").send({
          _id: "invalid_id",
          issue_text: "new text",
        });
        assert.equal(res.status, 400);
        assert.equal(res.body.error, "could not update");
      } catch (err) {
        throw err;
      }
    });
  });

  suite("DELETE /api/issues/:project", function () {
    test("Delete an issue", async function () {
      try {
        const res = await chai.request(server).delete("/api/issues/test").send({
          _id: "existing_id",
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.message, "deleted existing_id");
      } catch (err) {
        throw err;
      }
    });

    test("Delete an issue with an invalid _id", async function () {
      try {
        const res = await chai.request(server).delete("/api/issues/test").send({
          _id: "invalid_id",
        });
        assert.equal(res.status, 400);
        assert.equal(res.body.error, "could not delete");
      } catch (err) {
        throw err;
      }
    });

    test("Delete an issue with missing _id", async function () {
      try {
        const res = await chai
          .request(server)
          .delete("/api/issues/test")
          .send({});
        assert.equal(res.status, 400);
        assert.equal(res.body.error, "missing _id");
      } catch (err) {
        throw err;
      }
    });
  });
});
