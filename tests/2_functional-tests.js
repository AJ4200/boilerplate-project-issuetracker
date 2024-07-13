const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Create an issue with every field", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Functional Test - Every field",
        assigned_to: "Chai and Mocha",
        status_text: "In Progress",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "_id");
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "open");
        assert.property(res.body, "status_text");
        done();
      });
  });

  test("Create an issue with only required fields", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Functional Test - Required fields",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "_id");
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "open");
        assert.property(res.body, "status_text");
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
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("View issues on a project", function (done) {
    chai
      .request(server)
      .get("/api/issues/test")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], "_id");
        assert.property(res.body[0], "issue_title");
        assert.property(res.body[0], "issue_text");
        assert.property(res.body[0], "created_on");
        assert.property(res.body[0], "updated_on");
        assert.property(res.body[0], "created_by");
        assert.property(res.body[0], "assigned_to");
        assert.property(res.body[0], "open");
        assert.property(res.body[0], "status_text");
        done();
      });
  });

  test("View issues on a project with one filter", function (done) {
    chai
      .request(server)
      .get("/api/issues/test?open=true")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(function (issue) {
          assert.isTrue(issue.open);
        });
        done();
      });
  });

  test("View issues on a project with multiple filters", function (done) {
    chai
      .request(server)
      .get("/api/issues/test?open=true&assigned_to=Chai%20and%20Mocha")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(function (issue) {
          assert.isTrue(issue.open);
          assert.equal(issue.assigned_to, "Chai and Mocha");
        });
        done();
      });
  });

  test("Update one field on an issue", function (done) {
    let issueId;
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Functional Test - Update one field",
      })
      .end(function (err, res) {
        issueId = res.body._id;
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: issueId,
            issue_text: "Updated text",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, "result");
            assert.property(res.body, "_id");
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issueId);
            done();
          });
      });
  });

  test("Update multiple fields on an issue", function (done) {
    let issueId;
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Functional Test - Update multiple fields",
      })
      .end(function (err, res) {
        issueId = res.body._id;
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: issueId,
            issue_text: "Updated text",
            status_text: "In Progress",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, "result");
            assert.property(res.body, "_id");
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issueId);
            done();
          });
      });
  });

  test("Update an issue with missing _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        issue_text: "Updated text",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test("Update an issue with no fields to update", function (done) {
    let issueId;
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Functional Test - No fields to update",
      })
      .end(function (err, res) {
        issueId = res.body._id;
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: issueId,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, "error");
            assert.equal(res.body.error, "no update field(s) sent");
            done();
          });
      });
  });

  test("Update an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: "invalidId",
        issue_text: "Updated text",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "could not update");
        done();
      });
  });

  test("Delete an issue", function (done) {
    let issueId;
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Functional Test - Delete issue",
      })
      .end(function (err, res) {
        issueId = res.body._id;
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({
            _id: issueId,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, "result");
            assert.property(res.body, "_id");
            assert.equal(res.body.result, "successfully deleted");
            assert.equal(res.body._id, issueId);
            done();
          });
      });
  });

  test("Delete an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: "invalidId",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "could not delete");
        done();
      });
  });

  test("Delete an issue with missing _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
