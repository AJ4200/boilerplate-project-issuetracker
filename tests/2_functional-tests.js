const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Routing tests", function () {
    suite(
      "POST /api/issues/{project} => create issue object/expect issue object",
      function () {
        test("Create an issue with every field", function (done) {
          chai
            .request(server)
            .post("/api/issues/test")
            .send({
              issue_title: "Title",
              issue_text: "text",
              created_by: "Functional Test - Every field",
              assigned_to: "Chai and Mocha",
              status_text: "In QA",
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.issue_title, "Title");
              assert.equal(res.body.issue_text, "text");
              assert.equal(
                res.body.created_by,
                "Functional Test - Every field"
              );
              assert.equal(res.body.assigned_to, "Chai and Mocha");
              assert.equal(res.body.status_text, "In QA");
              done();
            });
        });

        test("Create an issue with only required fields", function (done) {
          chai
            .request(server)
            .post("/api/issues/test")
            .send({
              issue_title: "Title",
              issue_text: "text",
              created_by: "Functional Test - Required fields",
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.issue_title, "Title");
              assert.equal(res.body.issue_text, "text");
              assert.equal(
                res.body.created_by,
                "Functional Test - Required fields"
              );
              assert.isUndefined(res.body.assigned_to);
              assert.isUndefined(res.body.status_text);
              done();
            });
        });

        test("Create an issue with missing required fields", function (done) {
          chai
            .request(server)
            .post("/api/issues/test")
            .send({
              issue_title: "Title",
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.error, "required field(s) missing");
              done();
            });
        });
      }
    );

    suite("GET /api/issues/{project} => array of issues", function () {
      test("View issues on a project", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });

      test("View issues on a project with one filter", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({ created_by: "Functional Test - Required fields" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((issue) => {
              assert.equal(
                issue.created_by,
                "Functional Test - Required fields"
              );
            });
            done();
          });
      });

      test("View issues on a project with multiple filters", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({
            created_by: "Functional Test - Required fields",
            issue_title: "Title",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((issue) => {
              assert.equal(
                issue.created_by,
                "Functional Test - Required fields"
              );
              assert.equal(issue.issue_title, "Title");
            });
            done();
          });
      });
    });

    suite("PUT /api/issues/{project} => update issue object", function () {
      test("Update one field on an issue", function (done) {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: "60f1e7716e4fbb24fcd38dc0",
            created_by: "Sam",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, "60f1e7716e4fbb24fcd38dc0");
            done();
          });
      });

      test("Update multiple fields on an issue", function (done) {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: "60f1e7716e4fbb24fcd38dc0",
            created_by: "Sam",
            issue_text: "Sir",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, "60f1e7716e4fbb24fcd38dc0");
            done();
          });
      });

      test("Update an issue with missing _id", function (done) {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });

      test("Update an issue with no fields to update", function (done) {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({ _id: "60f1e7716e4fbb24fcd38dc0" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "no update field(s) sent");
            assert.equal(res.body._id, "60f1e7716e4fbb24fcd38dc0");
            done();
          });
      });

      test("Update an issue with an invalid _id", function (done) {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({ _id: "invalid_id", issue_text: "sam" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not update");
            assert.equal(res.body._id, "invalid_id");
            done();
          });
      });
    });

    suite("DELETE /api/issues/{project} => delete issue object", function () {
      test("Delete an issue", function (done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({ _id: "60f1e7716e4fbb24fcd38dc0" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully deleted");
            assert.equal(res.body._id, "60f1e7716e4fbb24fcd38dc0");
            done();
          });
      });

      test("Delete an issue with an invalid _id", function (done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({ _id: "invalid_id" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not delete");
            assert.equal(res.body._id, "invalid_id");
            done();
          });
      });

      test("Delete an issue with missing _id", function (done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });
    });
  });
});
