# Practical Exam Reference — JDBC, Servlet, JSP

> Common setup for all JDBC programs:
> - MySQL table: `CREATE TABLE Employee(id INT PRIMARY KEY, name VARCHAR(50), salary DOUBLE);`
> - Driver: `com.mysql.cj.jdbc.Driver`, URL: `jdbc:mysql://localhost:3306/testdb`
> - Add `mysql-connector-j` jar to classpath before compiling/running.

---

## 1. Insert multiple employees using PreparedStatement + display all

```java
import java.sql.*;
import java.util.Scanner;

public class InsertMultipleEmployees {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/testdb";
        String user = "root", pass = "root";

        try (Connection con = DriverManager.getConnection(url, user, pass)) {
            String insertSQL = "INSERT INTO Employee(id, name, salary) VALUES (?, ?, ?)";
            PreparedStatement ps = con.prepareStatement(insertSQL);
            Scanner sc = new Scanner(System.in);

            System.out.print("How many employees to insert? ");
            int n = Integer.parseInt(sc.nextLine());

            for (int i = 0; i < n; i++) {
                System.out.print("Enter ID: ");
                int id = Integer.parseInt(sc.nextLine());
                System.out.print("Enter Name: ");
                String name = sc.nextLine();
                System.out.print("Enter Salary: ");
                double salary = Double.parseDouble(sc.nextLine());

                ps.setInt(1, id);
                ps.setString(2, name);
                ps.setDouble(3, salary);
                ps.executeUpdate();
            }

            System.out.println("\n--- All Employees ---");
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM Employee");
            while (rs.next()) {
                System.out.println(rs.getInt("id") + "\t" +
                        rs.getString("name") + "\t" +
                        rs.getDouble("salary"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

---

## 2. Search employee by ID

```java
import java.sql.*;
import java.util.Scanner;

public class SearchEmployeeById {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/testdb";
        String user = "root", pass = "root";

        try (Connection con = DriverManager.getConnection(url, user, pass)) {
            Scanner sc = new Scanner(System.in);
            System.out.print("Enter Employee ID to search: ");
            int id = Integer.parseInt(sc.nextLine());

            String sql = "SELECT * FROM Employee WHERE id = ?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                System.out.println("ID: " + rs.getInt("id"));
                System.out.println("Name: " + rs.getString("name"));
                System.out.println("Salary: " + rs.getDouble("salary"));
            } else {
                System.out.println("No employee found with ID " + id);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

---

## 3. Delete employee by name

```java
import java.sql.*;
import java.util.Scanner;

public class DeleteEmployeeByName {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/testdb";
        String user = "root", pass = "root";

        try (Connection con = DriverManager.getConnection(url, user, pass)) {
            Scanner sc = new Scanner(System.in);
            System.out.print("Enter Employee Name to delete: ");
            String name = sc.nextLine();

            String sql = "DELETE FROM Employee WHERE name = ?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, name);
            int rows = ps.executeUpdate();

            System.out.println(rows > 0 ? rows + " record(s) deleted." : "No matching record found.");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

---

## 4. Display employees with salary > ₹30,000

```java
import java.sql.*;

public class HighSalaryEmployees {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/testdb";
        String user = "root", pass = "root";

        try (Connection con = DriverManager.getConnection(url, user, pass)) {
            String sql = "SELECT * FROM Employee WHERE salary > ?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setDouble(1, 30000);
            ResultSet rs = ps.executeQuery();

            System.out.println("Employees with salary > 30000:");
            while (rs.next()) {
                System.out.println(rs.getInt("id") + "\t" +
                        rs.getString("name") + "\t" +
                        rs.getDouble("salary"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

---

## 5. Login form (HTML) + Servlet validation against MySQL

**login.html**
```html
<!DOCTYPE html>
<html>
<body>
    <h2>Login</h2>
    <form action="LoginServlet" method="post">
        Username: <input type="text" name="username"><br><br>
        Password: <input type="password" name="password"><br><br>
        <input type="submit" value="Login">
    </form>
</body>
</html>
```

**LoginServlet.java**
```java
import java.io.*;
import java.sql.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;

public class LoginServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("text/html");
        PrintWriter out = res.getWriter();

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        try {
            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/testdb", "root", "root");
            String sql = "SELECT * FROM users WHERE username=? AND password=?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, username);
            ps.setString(2, password);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                out.println("<h2>Welcome, " + username + "!</h2>");
            } else {
                out.println("<h2>Invalid username or password.</h2>");
            }
            con.close();
        } catch (SQLException e) {
            out.println("Database error: " + e.getMessage());
        }
    }
}
```
> Table needed: `CREATE TABLE users(username VARCHAR(50), password VARCHAR(50));`
> web.xml mapping (if not using annotations): map `/LoginServlet` to this class, or add `@WebServlet("/LoginServlet")` above the class.

---

## 6. Servlet: square and cube of a number

**number.html**
```html
<form action="SquareCubeServlet" method="post">
    Enter a number: <input type="text" name="num">
    <input type="submit" value="Calculate">
</form>
```

**SquareCubeServlet.java**
```java
import java.io.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

@WebServlet("/SquareCubeServlet")
public class SquareCubeServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("text/html");
        PrintWriter out = res.getWriter();

        int num = Integer.parseInt(req.getParameter("num"));
        int square = num * num;
        int cube = num * num * num;

        out.println("<h3>Number: " + num + "</h3>");
        out.println("<h3>Square: " + square + "</h3>");
        out.println("<h3>Cube: " + cube + "</h3>");
    }
}
```

---

## 7. Servlet: student grade from marks

**marks.html**
```html
<form action="GradeServlet" method="post">
    Name: <input type="text" name="name"><br><br>
    Marks: <input type="text" name="marks"><br><br>
    <input type="submit" value="Submit">
</form>
```

**GradeServlet.java**
```java
import java.io.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

@WebServlet("/GradeServlet")
public class GradeServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("text/html");
        PrintWriter out = res.getWriter();

        String name = req.getParameter("name");
        int marks = Integer.parseInt(req.getParameter("marks"));
        String grade;

        if (marks >= 90) grade = "A+";
        else if (marks >= 75) grade = "A";
        else if (marks >= 60) grade = "B";
        else if (marks >= 40) grade = "C";
        else grade = "Fail";

        out.println("<h3>Student: " + name + "</h3>");
        out.println("<h3>Marks: " + marks + "</h3>");
        out.println("<h3>Grade: " + grade + "</h3>");
    }
}
```

---

## 8. Servlet: Session to pass name between pages

**NameServlet.java** (sets session)
```java
import java.io.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

@WebServlet("/NameServlet")
public class NameServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String name = req.getParameter("name");
        HttpSession session = req.getSession();
        session.setAttribute("username", name);

        res.sendRedirect("DisplayServlet");
    }
}
```

**DisplayServlet.java** (reads session)
```java
import java.io.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

@WebServlet("/DisplayServlet")
public class DisplayServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("text/html");
        PrintWriter out = res.getWriter();

        HttpSession session = req.getSession();
        String name = (String) session.getAttribute("username");

        out.println("<h3>Welcome back, " + name + "!</h3>");
    }
}
```
**form.html**
```html
<form action="NameServlet" method="post">
    Enter your name: <input type="text" name="name">
    <input type="submit" value="Submit">
</form>
```

---

## 9. Servlet: Cookies for preferred background color

**ColorServlet.java** (sets cookie, shows page)
```java
import java.io.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

@WebServlet("/ColorServlet")
public class ColorServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String color = req.getParameter("color");
        Cookie cookie = new Cookie("bgcolor", color);
        cookie.setMaxAge(60 * 60 * 24); // 1 day
        res.addCookie(cookie);

        showPage(res, color);
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String color = "white";
        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if (c.getName().equals("bgcolor")) color = c.getValue();
            }
        }
        showPage(res, color);
    }

    private void showPage(HttpServletResponse res, String color) throws IOException {
        res.setContentType("text/html");
        PrintWriter out = res.getWriter();
        out.println("<body bgcolor='" + color + "'>");
        out.println("<h3>Your preferred background color is: " + color + "</h3>");
        out.println("</body>");
    }
}
```
**colorform.html**
```html
<form action="ColorServlet" method="post">
    Choose background color: <input type="text" name="color" placeholder="e.g. lightblue">
    <input type="submit" value="Set Color">
</form>
```

---

## 10. JSP: area & circumference of a circle (scriptlet)

**circle.jsp**
```jsp
<%@ page language="java" contentType="text/html" %>
<html>
<body>
<form method="post">
    Enter radius: <input type="text" name="radius">
    <input type="submit" value="Calculate">
</form>

<%
    String r = request.getParameter("radius");
    if (r != null && !r.isEmpty()) {
        double radius = Double.parseDouble(r);
        double area = Math.PI * radius * radius;
        double circumference = 2 * Math.PI * radius;
%>
        <h3>Area: <%= area %></h3>
        <h3>Circumference: <%= circumference %></h3>
<%
    }
%>
</body>
</html>
```

---

## 11. JSP: multiplication table

**table.jsp**
```jsp
<%@ page language="java" contentType="text/html" %>
<html>
<body>
<form method="post">
    Enter a number: <input type="text" name="num">
    <input type="submit" value="Show Table">
</form>

<%
    String n = request.getParameter("num");
    if (n != null && !n.isEmpty()) {
        int num = Integer.parseInt(n);
        for (int i = 1; i <= 10; i++) {
%>
            <%= num %> x <%= i %> = <%= num * i %><br>
<%
        }
    }
%>
</body>
</html>
```

---

## 12. JSP: total, average, grade for 5 subjects

**studentmarks.jsp**
```jsp
<%@ page language="java" contentType="text/html" %>
<html>
<body>
<form method="post">
    Sub1: <input type="text" name="s1"><br>
    Sub2: <input type="text" name="s2"><br>
    Sub3: <input type="text" name="s3"><br>
    Sub4: <input type="text" name="s4"><br>
    Sub5: <input type="text" name="s5"><br>
    <input type="submit" value="Calculate">
</form>

<%
    String p1 = request.getParameter("s1");
    if (p1 != null && !p1.isEmpty()) {
        int s1 = Integer.parseInt(p1);
        int s2 = Integer.parseInt(request.getParameter("s2"));
        int s3 = Integer.parseInt(request.getParameter("s3"));
        int s4 = Integer.parseInt(request.getParameter("s4"));
        int s5 = Integer.parseInt(request.getParameter("s5"));

        int total = s1 + s2 + s3 + s4 + s5;
        double average = total / 5.0;
        String grade;

        if (average >= 90) grade = "A+";
        else if (average >= 75) grade = "A";
        else if (average >= 60) grade = "B";
        else if (average >= 40) grade = "C";
        else grade = "Fail";
%>
        <h3>Total: <%= total %></h3>
        <h3>Average: <%= average %></h3>
        <h3>Grade: <%= grade %></h3>
<%
    }
%>
</body>
</html>
```

---

## 13. JSP: even/odd using JSTL `<c:if>` and EL

**evenodd.jsp**
```jsp
<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<html>
<body>
<form method="post">
    Enter a number: <input type="text" name="num">
    <input type="submit" value="Check">
</form>

<c:set var="num" value="${param.num}" />

<c:if test="${not empty num}">
    <c:if test="${num % 2 == 0}">
        <h3>${num} is Even</h3>
    </c:if>
    <c:if test="${num % 2 != 0}">
        <h3>${num} is Odd</h3>
    </c:if>
</c:if>
</body>
</html>
```
> Note: for older Tomcat/JSP versions the taglib uri may instead be `http://java.sun.com/jsp/jstl/core` — use whichever matches your JSTL jar version. You'll also need the `jakarta.servlet.jsp.jstl` (or `jstl`) jar on the classpath.

---

## 14. JSP: current date/time, server name, browser info (implicit objects)

**implicitinfo.jsp**
```jsp
<%@ page import="java.util.Date" %>
<html>
<body>
    <h3>Current Date & Time: <%= new Date() %></h3>
    <h3>Server Name: <%= request.getServerName() %></h3>
    <h3>Server Port: <%= request.getServerPort() %></h3>
    <h3>Client Browser Info: <%= request.getHeader("User-Agent") %></h3>
    <h3>Protocol: <%= request.getProtocol() %></h3>
</body>
</html>
```
> Uses implicit objects `request` directly (no need to declare) — that's the point examiners usually check for.

---

## 15. Full Employee Management System (JDBC + Servlet + JSP CRUD)

**Employee.java** (model)
```java
public class Employee {
    private int id;
    private String name;
    private double salary;

    public Employee(int id, String name, double salary) {
        this.id = id; this.name = name; this.salary = salary;
    }
    public int getId() { return id; }
    public String getName() { return name; }
    public double getSalary() { return salary; }
}
```

**EmployeeDAO.java** (all DB operations, reused by servlets)
```java
import java.sql.*;
import java.util.*;

public class EmployeeDAO {
    private static final String URL = "jdbc:mysql://localhost:3306/testdb";
    private static final String USER = "root";
    private static final String PASS = "root";

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }

    public void insert(int id, String name, double salary) throws SQLException {
        try (Connection con = getConnection()) {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO Employee(id,name,salary) VALUES(?,?,?)");
            ps.setInt(1, id); ps.setString(2, name); ps.setDouble(3, salary);
            ps.executeUpdate();
        }
    }

    public Employee search(int id) throws SQLException {
        try (Connection con = getConnection()) {
            PreparedStatement ps = con.prepareStatement("SELECT * FROM Employee WHERE id=?");
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next())
                return new Employee(rs.getInt("id"), rs.getString("name"), rs.getDouble("salary"));
            return null;
        }
    }

    public void update(int id, String name, double salary) throws SQLException {
        try (Connection con = getConnection()) {
            PreparedStatement ps = con.prepareStatement(
                    "UPDATE Employee SET name=?, salary=? WHERE id=?");
            ps.setString(1, name); ps.setDouble(2, salary); ps.setInt(3, id);
            ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        try (Connection con = getConnection()) {
            PreparedStatement ps = con.prepareStatement("DELETE FROM Employee WHERE id=?");
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    public List<Employee> getAll() throws SQLException {
        List<Employee> list = new ArrayList<>();
        try (Connection con = getConnection()) {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM Employee");
            while (rs.next())
                list.add(new Employee(rs.getInt("id"), rs.getString("name"), rs.getDouble("salary")));
        }
        return list;
    }
}
```

**EmployeeServlet.java** (handles insert/update/delete/search via an `action` parameter)
```java
import java.io.*;
import java.util.List;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;

@WebServlet("/EmployeeServlet")
public class EmployeeServlet extends HttpServlet {
    private EmployeeDAO dao = new EmployeeDAO();

    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String action = req.getParameter("action");

        try {
            switch (action) {
                case "insert":
                    dao.insert(Integer.parseInt(req.getParameter("id")),
                               req.getParameter("name"),
                               Double.parseDouble(req.getParameter("salary")));
                    break;
                case "update":
                    dao.update(Integer.parseInt(req.getParameter("id")),
                               req.getParameter("name"),
                               Double.parseDouble(req.getParameter("salary")));
                    break;
                case "delete":
                    dao.delete(Integer.parseInt(req.getParameter("id")));
                    break;
                case "search":
                    Employee emp = dao.search(Integer.parseInt(req.getParameter("id")));
                    req.setAttribute("employee", emp);
                    req.getRequestDispatcher("result.jsp").forward(req, res);
                    return;
            }

            List<Employee> list = dao.getAll();
            req.setAttribute("employeeList", list);
            req.getRequestDispatcher("employeelist.jsp").forward(req, res);

        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}
```

**employeeform.html** (input form for insert/update/delete/search — pick action via hidden field or separate forms)
```html
<h3>Insert Employee</h3>
<form action="EmployeeServlet" method="post">
    <input type="hidden" name="action" value="insert">
    ID: <input type="text" name="id"><br>
    Name: <input type="text" name="name"><br>
    Salary: <input type="text" name="salary"><br>
    <input type="submit" value="Insert">
</form>

<h3>Search Employee</h3>
<form action="EmployeeServlet" method="post">
    <input type="hidden" name="action" value="search">
    ID: <input type="text" name="id">
    <input type="submit" value="Search">
</form>

<h3>Delete Employee</h3>
<form action="EmployeeServlet" method="post">
    <input type="hidden" name="action" value="delete">
    ID: <input type="text" name="id">
    <input type="submit" value="Delete">
</form>
```

**employeelist.jsp** (display all, uses JSTL)
```jsp
<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<html>
<body>
<h3>All Employees</h3>
<table border="1">
    <tr><th>ID</th><th>Name</th><th>Salary</th></tr>
    <c:forEach var="emp" items="${employeeList}">
        <tr>
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.salary}</td>
        </tr>
    </c:forEach>
</table>
</body>
</html>
```

**result.jsp** (single employee search result)
```jsp
<html>
<body>
<c:if test="${not empty employee}">
    <h3>ID: ${employee.id}</h3>
    <h3>Name: ${employee.name}</h3>
    <h3>Salary: ${employee.salary}</h3>
</c:if>
<c:if test="${empty employee}">
    <h3>Employee not found.</h3>
</c:if>
</body>
</html>
```

---

## Quick exam-day notes
- If your lab uses old-style Servlet API (`javax.servlet.*` instead of `jakarta.servlet.*`), just swap the import package — logic stays identical.
- Always register servlets either via `@WebServlet("/name")` annotation OR a `<servlet>`/`<servlet-mapping>` entry in `web.xml` — check which style your lab expects.
- For JSTL, make sure the taglib jar is in `WEB-INF/lib` or you'll get a translation error.
- Test JDBC connectivity string and credentials against whatever MySQL setup the lab machine actually has — `root/root` is a placeholder.
