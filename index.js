const http = require("http");
const URL = require("url");
const fs = require("fs");
const students = JSON.parse(fs.readFileSync("student.json"));
const coursesJson = fs.readFileSync("course.json");
const departments = JSON.parse(fs.readFileSync("department.json"));

const app = http.createServer((req, res) => {
  const { url, method } = req;
  const parsedUrl = URL.parse(req.url, true);

  if (url === "/students" && method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(`"message":"success","data":${JSON.stringify(students)}`);
  } else if (url === "/students" && method === "POST") {
    req.on("data", (chunck) => {
      const body = JSON.parse(chunck);
      console.log(body);
      let existingStudent = students.find((el) => el.name === body.name);
      console.log(existingStudent);
      if (existingStudent) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end("Student name already exist");
      }
      students.push(body);
      fs.writeFileSync("student.json", JSON.stringify(students));
      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.end(`"message":"success",
      "data":${JSON.stringify(body)}`);
    });
  } else if (url === "/allstudents" && method === "GET") {
    const coursesObject = JSON.parse(coursesJson);
    let detailedStudents = students.map((el) => {
      department = departments.find((dep) => dep.id === el.departmentId);
      courses = coursesObject.filter(
        (course) => course.departmentId === el.departmentId
      );
      return {
        id: el.id,
        name: el.name,
        pasword: el.pasword,
        email: el.email,
        department,
        courses,
      };
    });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(detailedStudents));
  } else if (url.startsWith("/students/") && method == "PUT") {
    let id = Number(url.split("/")[2]);
    console.log(id);
    let index = students.findIndex((el) => el.id === id);
    console.log(index);
    if (index == -1) {
      res.statusCode = 404;
      return res.end("index not found");
    }

    req.on("data", (chunck) => {
      let body = JSON.parse(chunck);
      students[index].name = body.name;
      fs.writeFileSync("student.json", JSON.stringify(students));
      res.end(JSON.stringify("Updated"));
    });
  } else if (url.startsWith("/students/") && method == "DELETE") {
    let id = Number(url.split("/")[2]);
    console.log(id);
    let index = students.findIndex((el) => el.id === id);
    console.log(index);
    if (index == -1) {
      res.statusCode = 404;
      return res.end("index not found");
    }
    students.splice(index, 1);
    fs.writeFileSync("student.json", JSON.stringify(students));
    res.statusCode = 200;
    res.end("deleted");
  } else if (parsedUrl.pathname === "/students" && method === "GET") {
    // /students?id=1
    // get id from query string
    let studentId = parsedUrl.query.id;

    if (studentId) {
      let student = students.find((elem) => elem.id == studentId);
      if (student) {
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        res.end(`"message":"success","data":${JSON.stringify(student)}`);
      } else {
        res.statusCode = 404;
        res.end("Student not found");
      }
    } else {
      res.statusCode = 400;
      res.end("Student id required");
    }
  } else if (url === "/courses" && method === "GET") {
    res.statusCode = 200;
    res.end(coursesJson);
  } else if (url === "/courses" && method === "POST") {
    req.on("data", (chunk) => {
      const body = JSON.parse(chunk);
      console.log(body);

      // check if course exist

      let courses = JSON.parse(coursesJson);
      console.log(courses);
      let index = courses.find((el) => el.id === body.id);
      console.log(index);
      if (index) {
        res.statusCode = 404;
        return res.end("Course Already exist");
      }
      courses.push(body);
      console.log(courses);

      fs.writeFileSync("course.json", JSON.stringify(courses));
      res.statusCode = 201;
      res.end("Course successfully created");
    });
  } else if (url.startsWith("/courses/") && method === "GET") {
    console.log(url);
    let id = url.split("/")[2];
    console.log(id);
    let courses = JSON.parse(coursesJson);
    console.log(courses);
    let course = courses.find((el) => el.id === Number(id));

    if (!course) {
      res.statusCode = 404;
      return res.end("Course not Found");
    }
    res.write(`"message:"success","course":${JSON.stringify(course)}`);
    res.end();
  } else if (url.startsWith("/courses/") && method === "DELETE") {
    let id = Number(url.split("/")[2]);
    const courses = JSON.parse(coursesJson);

    let index = courses.findIndex((el) => el.id === id);

    if (index == -1) {
      res.statusCode = 404;
      return res.end("index not found");
    }
    courses.splice(index, 1);
    fs.writeFileSync("course.json", JSON.stringify(courses));
    res.statusCode = 200;
    res.end("deleted");
  } else if (url.startsWith("/courses/") && method === "PUT") {
    let id = Number(url.split("/")[2]);
    const courses = JSON.parse(coursesJson);
    let index = courses.findIndex((el) => el.id === id);

    if (index == -1) {
      res.statusCode = 404;
      return res.end("index not found");
    }

    req.on("data", (chunk) => {
      let course = JSON.parse(chunk);
      courses[index].name = course.name;
      fs.writeFileSync("course.json", JSON.stringify(courses));
      res.statusCode = 200;
      res.end(JSON.stringify("Updated"));
    });
  }
  //departments endpoints
  else if (url === "/departments" && method === "GET") {
    res.statusCode = 200;
    res.end(JSON.stringify(departments));
  } else if (url === "/departments" && method === "POST") {
    req.on("data", (chunck) => {
      let body = JSON.parse(chunck);
      departments.push(body);
      fs.writeFileSync("department.json", JSON.stringify(departments));
      res.statusCode = 201;
      res.end("Successfully added ");
    });
  } else if (url.startsWith("/departments/") && method === "GET") {
    let id = Number(url.split("/")[2]);
    let index = departments.findIndex((el) => el.id === id);

    if (index == -1) {
      res.statusCode = 404;
      return res.end("index not found");
    }
    res.statusCode = 200;
    res.end(`"message":"success",
      data:${JSON.stringify(departments[index])}`);
  } else if (url.startsWith("/departments/") && method === "PUT") {
    let id = Number(url.split("/")[2]);
    let index = departments.findIndex((el) => el.id === id);
    if (index == -1) {
      res.statusCode = 404;
      return res.end("index not found");
    }
    req.on("data", (chunck) => {
      let body = JSON.parse(chunck);
      departments[index].name = body.name;
      fs.writeFileSync("department.json", JSON.stringify(departments));
      res.end(JSON.stringify("Updated"));
    });
  } else if (url.startsWith("/departments/") && method === "DELETE") {
    let id = Number(url.split("/")[2]);

    let index = departments.findIndex((el) => el.id === id);

    if (index == -1) {
      res.statusCode = 404;
      return res.end("index not found");
    }
    departments.splice(index, 1);
    fs.writeFileSync("department.json", JSON.stringify(departments));
    res.statusCode = 200;
    res.end("deleted");
  } else {
    res.end("404 not found");
  }
});
app.listen(8000, () => {
  console.log("server up and running ");
});
