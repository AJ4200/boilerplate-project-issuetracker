const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Issue = require("../models/issue");
const { ObjectId } = require("mongodb");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Test POST", () => {
    test("Create an issue with every field", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          assigned_to: "Soham",
          status_text: "Not yet completed",
          issue_title: "to be deleted",
          issue_text: "Auth error",
          created_by: "John",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.assigned_to, "Soham");
          assert.equal(res.body.status_text, "Not yet completed");
          assert.equal(res.body.issue_title, "to be deleted");
          assert.equal(res.body.issue_text, "Auth error");
          assert.equal(res.body.created_by, "John");
          assert.property(res.body, "created_on");
          assert.property(res.body, "updated_on");
          assert.property(res.body, "open");
          assert.property(res.body, "_id");
          done();
        });
    });

    test("Create an issue with only required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "to be deleted",
          issue_text: "Auth error",
          created_by: "John",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "to be deleted");
          assert.equal(res.body.issue_text, "Auth error");
          assert.equal(res.body.created_by, "John");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.property(res.body, "created_on");
          assert.property(res.body, "updated_on");
          assert.property(res.body, "open");
          assert.property(res.body, "_id");
          done();
        });
    });

    test("Create an issue with missing required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Text",
        })
        .end((err, res) => {
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  suite("Test GET", () => {
    test("View issues on a project", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body, "is array");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "_id");
          done();
        });
    });

    test("View issues on a project with one filter", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ created_by: "Sam" })
        .end((err, res) => {
          assert.isArray(res.body, "is array");
          res.body.forEach((issue) => {
            assert.equal(issue.created_by, "Sam");
          });
          done();
        });
    });

    test("View issues on a project with multiple filters", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ created_by: "Sam", open: true })
        .end((err, res) => {
          assert.isArray(res.body, "is array");
          res.body.forEach((issue) => {
            assert.equal(issue.created_by, "Sam");
            assert.equal(issue.open, true);
          });
          done();
        });
    });
  });

  suite("Test PUT", () => {
    test("Update one field on an issue", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: "60f1e7716e4fbb24fcd38dc0", created_by: "Sam" })
        .end((err, res) => {
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, "60f1e7716e4fbb24fcd38dc0");
          done();
        });
    });

    test("Update multiple fields on an issue", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id: "60f1e7716e4fbb24fcd38dc0",
          created_by: "Sam",
          issue_text: "Sir",
        })
        .end((err, res) => {
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, "60f1e7716e4fbb24fcd38dc0");
          done();
        });
    });

    test("Update an issue with missing _id", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({})
        .end((err, res) => {
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    test("Update an issue with no fields to update", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: "60f1e7716e4fbb24fcd38dc0" })
        .end((err, res) => {
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, "60f1e7716e4fbb24fcd38dc0");
          done();
        });
    });

    test("Update an issue with an invalid _id", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: "invalid_id", issue_text: "sam" })
        .end((err, res) => {
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "invalid_id");
          done();
        });
    });
  });

  suite("Test DELETE", () => {
    test("Delete an issue", async () => {
      const toDelete = await Issue.findOne({
        issue_title: "to be deleted",
      }).exec();
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({ _id: toDelete._id })
        .end((err, res) => {
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, ObjectId(toDelete._id).toString());
        });
    });

    test("Delete an issue with invalid _id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({ _id: "invalid_id" })
        .end((err, res) => {
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "invalid_id");
          done();
        });
    });

    test("Delete an issue with missing _id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({})
        .end((err, res) => {
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
