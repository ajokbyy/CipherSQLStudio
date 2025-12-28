const mongoose = require('mongoose');
const { Pool } = require('pg');
const Assignment = require('./models/Assignment');
require('dotenv').config();

const seedAssignments = [
  {
    title: 'High Earners',
    difficulty: 'Easy',
    description: 'Retrieve all employees who earn more than $80,000. Return their names and salaries.',
    schemaSQL: `
      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        department VARCHAR(50),
        salary INT
      );
      INSERT INTO employees (name, department, salary) VALUES
      ('Alice', 'Engineering', 90000),
      ('Bob', 'HR', 50000),
      ('Charlie', 'Engineering', 120000),
      ('David', 'Marketing', 75000),
      ('Eve', 'Engineering', 80000);
    `,
    solutionSQL: `SELECT name, salary FROM employees WHERE salary > 80000`,
    defaultCode: '',
    examples: [
      {
        inputText: `**Input:**
**Employees table:**
| id | name    | department  | salary |
|----|---------|-------------|--------|
| 1  | Alice   | Engineering | 90000  |
| 2  | Bob     | HR          | 50000  |
| 3  | Charlie | Engineering | 120000 |
| 4  | David   | Marketing   | 75000  |
| 5  | Eve     | Engineering | 80000  |`,
        outputText: `**Output:**
| name    | salary |
|---------|--------|
| Alice   | 90000  |
| Charlie | 120000 |`,
        explanation: "Alice and Charlie are the only employees who earn more than $80,000."
      }
    ]
  },
  {
    title: 'Department Headcounts',
    difficulty: 'Medium',
    description: 'Find the number of employees in each department. Result should have columns "department" and "count".',
    schemaSQL: `
        CREATE TABLE employees (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          department VARCHAR(50),
          salary INT
        );
        INSERT INTO employees (name, department, salary) VALUES
        ('Alice', 'Engineering', 90000),
        ('Bob', 'HR', 50000),
        ('Charlie', 'Engineering', 120000),
        ('David', 'Marketing', 75000),
        ('Eve', 'Engineering', 80000),
        ('Frank', 'HR', 60000);
      `,
    solutionSQL: `SELECT department, COUNT(*) as count FROM employees GROUP BY department`,
    defaultCode: '',
    examples: [
      {
        inputText: `**Input:**
**Employees table:**
| id | name    | department  | salary |
|----|---------|-------------|--------|
| 1  | Alice   | Engineering | 90000  |
| 2  | Bob     | HR          | 50000  |
| ...| ...     | ...         | ...    |`,
        outputText: `**Output:**
| department  | count |
|-------------|-------|
| Engineering | 3     |
| HR          | 2     |
| Marketing   | 1     |`,
        explanation: "Engineering has 3 employees, HR has 2, and Marketing has 1."
      }
    ]
  },
  {
    title: 'Second Highest Salary',
    difficulty: 'Medium',
    description: 'Write a solution to find the second highest distinct salary from the Employee table. If there is no second highest salary, return null (return None in Pandas).',
    schemaSQL: `
      CREATE TABLE Employee (
        id INT PRIMARY KEY,
        salary INT
      );
      INSERT INTO Employee (id, salary) VALUES (1, 100), (2, 200), (3, 300);
    `,
    solutionSQL: `SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC OFFSET 1 LIMIT 1) AS SecondHighestSalary`,
    defaultCode: '',
    examples: [
      {
        inputText: `**Input:** 
Employee table:
+----+--------+
| id | salary |
+----+--------+
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
+----+--------+`,
        outputText: `**Output:** 
+---------------------+
| SecondHighestSalary |
+---------------------+
| 200                 |
+---------------------+`,
        explanation: ""
      },
      {
        inputText: `**Input:** 
Employee table:
+----+--------+
| id | salary |
+----+--------+
| 1  | 100    |
+----+--------+`,
        outputText: `**Output:** 
+---------------------+
| SecondHighestSalary |
+---------------------+
| null                |
+---------------------+`,
        explanation: ""
      }
    ]
  },
  {
    title: 'Nth Highest Salary',
    difficulty: 'Medium',
    description: 'Write a solution to find the nth highest distinct salary from the Employee table. If there are less than n distinct salaries, return null.',
    schemaSQL: `
      CREATE TABLE Employee (
        id INT PRIMARY KEY,
        salary INT
      );
      INSERT INTO Employee (id, salary) VALUES (1, 100), (2, 200), (3, 300);
    `,
    solutionSQL: `
    -- NOTE: Function logic verification is complex. This solutionSQL is a placeholder or reference.
    -- Real verification needs to CREATE FUNCTION then SELECT function(N).
    CREATE OR REPLACE FUNCTION getNthHighestSalary(n INT) RETURNS INT AS $$
    BEGIN
      RETURN (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC OFFSET n-1 LIMIT 1);
    END;
    $$ LANGUAGE plpgsql;
    `,
    defaultCode: `CREATE OR REPLACE FUNCTION getNthHighestSalary(n INT) RETURNS INT AS $$
BEGIN
  RETURN (
      -- Write your PostgreSQL query statement below.
      
  );
END;
$$ LANGUAGE plpgsql;`,
    examples: [
      {
        inputText: `**Input:** 
Employee table:
+----+--------+
| id | salary |
+----+--------+
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
+----+--------+
n = 2`,
        outputText: `**Output:** 
+------------------------+
| getNthHighestSalary(2) |
+------------------------+
| 200                    |
+------------------------+`,
        explanation: ""
      },
      {
        inputText: `**Input:** 
Employee table:
+----+--------+
| id | salary |
+----+--------+
| 1  | 100    |
+----+--------+
n = 2`,
        outputText: `**Output:** 
+------------------------+
| getNthHighestSalary(2) |
+------------------------+
| null                   |
+------------------------+`,
        explanation: ""
      }
    ]
  },
  {
    title: 'Rank Scores',
    difficulty: 'Medium',
    description: 'Write a solution to find the rank of the scores. The ranking should be calculated according to the following rules: The scores should be ranked from the highest to the lowest. If there is a tie between two scores, both should have the same ranking. After a tie, the next ranking number should be the next consecutive integer value. In other words, there should be no holes between ranks. Return the result table ordered by score in descending order.',
    schemaSQL: `CREATE TABLE Scores (id INT PRIMARY KEY, score DECIMAL(3,2)); INSERT INTO Scores VALUES (1, 3.50), (2, 3.65), (3, 4.00), (4, 3.85), (5, 4.00), (6, 3.65);`,
    solutionSQL: `SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) as rank FROM Scores ORDER BY score DESC`,
    defaultCode: '',
    examples: [
      {
        inputText: `**Input:** 
Scores table:
+----+-------+
| id | score |
+----+-------+
| 1  | 3.50  |
| 2  | 3.65  |
| 3  | 4.00  |
| 4  | 3.85  |
| 5  | 4.00  |
| 6  | 3.65  |
+----+-------+`,
        outputText: `**Output:** 
+-------+------+
| score | rank |
+-------+------+
| 4.00  | 1    |
| 4.00  | 1    |
| 3.85  | 2    |
| 3.65  | 3    |
| 3.65  | 3    |
| 3.50  | 4    |
+-------+------+`,
        explanation: ""
      }
    ]
  },
  {
    title: 'Dept Top Three Salaries',
    difficulty: 'Hard',
    description: 'A company\'s executives are interested in seeing who earns the most money in each of the company\'s departments. A high earner in a department is an employee who has a salary in the top three unique salaries for that department.\\n\\nWrite a solution to find the employees who are high earners in each of the departments.\\n\\nReturn the result table in any order.',
    schemaSQL: `CREATE TABLE Employee(id INT PRIMARY KEY, name VARCHAR(255), salary INT, departmentId INT); CREATE TABLE Department(id INT PRIMARY KEY, name VARCHAR(255)); INSERT INTO Employee VALUES(1, 'Joe', 85000, 1), (2, 'Henry', 80000, 2), (3, 'Sam', 60000, 2), (4, 'Max', 90000, 1), (5, 'Janet', 69000, 1), (6, 'Randy', 85000, 1), (7, 'Will', 70000, 1); INSERT INTO Department VALUES(1, 'IT'), (2, 'Sales'); `,
    solutionSQL: `WITH DepartmentSalaries AS ( SELECT d.name AS Department, e.name AS Employee, e.salary, DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) as rank FROM Employee e JOIN Department d ON e.departmentId = d.id ) SELECT Department, Employee, Salary FROM DepartmentSalaries WHERE rank <= 3`,
    defaultCode: '',
    examples: [
      {
        inputText: `**Input:** 
Employee table:
+----+-------+--------+--------------+
| id | name  | salary | departmentId |
+----+-------+--------+--------------+
| 1  | Joe   | 85000  | 1            |
| 2  | Henry | 80000  | 2            |
| 3  | Sam   | 60000  | 2            |
| 4  | Max   | 90000  | 1            |
| 5  | Janet | 69000  | 1            |
| 6  | Randy | 85000  | 1            |
| 7  | Will  | 70000  | 1            |
+----+-------+--------+--------------+
Department table:
+----+-------+
| id | name  |
+----+-------+
| 1  | IT    |
| 2  | Sales |
+----+-------+`,
        outputText: `**Output:** 
+------------+----------+--------+
| Department | Employee | Salary |
+------------+----------+--------+
| IT         | Max      | 90000  |
| IT         | Joe      | 85000  |
| IT         | Randy    | 85000  |
| IT         | Will     | 70000  |
| Sales      | Henry    | 80000  |
| Sales      | Sam      | 60000  |
+------------+----------+--------+`,
        explanation: "In the IT department:\\n- Max earns the highest unique salary\\n- Both Randy and Joe earn the second-highest unique salary\\n- Will earns the third-highest unique salary\\n\\nIn the Sales department:\\n- Henry earns the highest salary\\n- Sam earns the second-highest salary\\n- There is no third-highest salary as there are only two employees"
      }
    ]
  },
  {
    title: 'Consecutive Numbers',
    difficulty: 'Medium',
    description: 'Find all numbers that appear at least three times consecutively.\\n\\nReturn the result table in any order.',
    schemaSQL: `
      CREATE TABLE Logs (
        id SERIAL PRIMARY KEY,
        num VARCHAR(10)
      );
      INSERT INTO Logs (num) VALUES ('1'), ('1'), ('1'), ('2'), ('1'), ('2'), ('2');
    `,
    solutionSQL: `SELECT DISTINCT l1.num as ConsecutiveNums FROM Logs l1 JOIN Logs l2 ON l1.id = l2.id - 1 JOIN Logs l3 ON l1.id = l3.id - 2 WHERE l1.num = l2.num AND l2.num = l3.num`,
    defaultCode: '',
    examples: [
      {
        inputText: `**Input:** 
Logs table:
+----+-----+
| id | num |
+----+-----+
| 1  | 1   |
| 2  | 1   |
| 3  | 1   |
| 4  | 2   |
| 5  | 1   |
| 6  | 2   |
| 7  | 2   |
+----+-----+`,
        outputText: `**Output:** 
+-----------------+
| ConsecutiveNums |
+-----------------+
| 1               |
+-----------------+`,
        explanation: "1 is the only number that appears consecutively for at least three times."
      }
    ]
  },
  {
    title: 'Trips and Users',
    difficulty: 'Hard',
    description: 'The cancellation rate is computed by dividing the number of canceled (by client or driver) requests with unbanned users by the total number of requests with unbanned users on that day.\\n\\nWrite a solution to find the cancellation rate of requests with unbanned users (both client and driver must not be banned) each day between "2013-10-01" and "2013-10-03" with at least one trip. Round Cancellation Rate to two decimal points.\\n\\nReturn the result table in any order.',
    schemaSQL: `
      CREATE TABLE Users (
        users_id INT PRIMARY KEY,
        banned VARCHAR(10),
        role VARCHAR(10)
      );
      CREATE TABLE Trips (
        id INT PRIMARY KEY,
        client_id INT,
        driver_id INT,
        city_id INT,
        status VARCHAR(50),
        request_at VARCHAR(20)
      );
      INSERT INTO Users (users_id, banned, role) VALUES 
        (1, 'No', 'client'),
        (2, 'Yes', 'client'),
        (3, 'No', 'client'),
        (4, 'No', 'client'),
        (10, 'No', 'driver'),
        (11, 'No', 'driver'),
        (12, 'No', 'driver'),
        (13, 'No', 'driver');
      INSERT INTO Trips (id, client_id, driver_id, city_id, status, request_at) VALUES 
        (1, 1, 10, 1, 'completed', '2013-10-01'),
        (2, 2, 11, 1, 'cancelled_by_driver', '2013-10-01'),
        (3, 3, 12, 6, 'completed', '2013-10-01'),
        (4, 4, 13, 6, 'cancelled_by_client', '2013-10-01'),
        (5, 1, 10, 1, 'completed', '2013-10-02'),
        (6, 2, 11, 6, 'completed', '2013-10-02'),
        (7, 3, 12, 6, 'completed', '2013-10-02'),
        (8, 2, 12, 12, 'completed', '2013-10-03'),
        (9, 3, 10, 12, 'completed', '2013-10-03'),
        (10, 4, 13, 12, 'cancelled_by_driver', '2013-10-03');
    `,
    solutionSQL: `SELECT request_at as Day, ROUND(SUM(CASE WHEN status != 'completed' THEN 1 ELSE 0 END)::decimal / COUNT(*), 2) as "Cancellation Rate" FROM Trips t JOIN Users c ON t.client_id = c.users_id JOIN Users d ON t.driver_id = d.users_id WHERE c.banned = 'No' AND d.banned = 'No' AND request_at BETWEEN '2013-10-01' AND '2013-10-03' GROUP BY request_at`,
    defaultCode: '',
    examples: [
      {
        inputText: `**Input:** 
Trips table:
+----+-----------+-----------+---------+---------------------+------------+
| id | client_id | driver_id | city_id | status              | request_at |
+----+-----------+-----------+---------+---------------------+------------+
| 1  | 1         | 10        | 1       | completed           | 2013-10-01 |
| 2  | 2         | 11        | 1       | cancelled_by_driver | 2013-10-01 |
...`,
        outputText: `**Output:** 
+------------+-------------------+
| Day        | Cancellation Rate |
+------------+-------------------+
| 2013-10-01 | 0.33              |
| 2013-10-02 | 0.00              |
| 2013-10-03 | 0.50              |
+------------+-------------------+`,
        explanation: ""
      }
    ]
  },
  {
    title: 'Human Traffic of Stadium',
    difficulty: 'Hard',
    description: 'Write a solution to display the records with three or more rows with consecutive id\'s, and the number of people is greater than or equal to 100 for each.\\n\\nReturn the result table ordered by visit_date in ascending order.',
    schemaSQL: `
      CREATE TABLE Stadium (
        id INT PRIMARY KEY,
        visit_date DATE,
        people INT
      );
      INSERT INTO Stadium (id, visit_date, people) VALUES 
        (1, '2017-01-01', 10),
        (2, '2017-01-02', 109),
        (3, '2017-01-03', 150),
        (4, '2017-01-04', 99),
        (5, '2017-01-05', 145),
        (6, '2017-01-06', 1455),
        (7, '2017-01-07', 199),
        (8, '2017-01-09', 188);
    `,
    solutionSQL: `WITH t AS (SELECT *, id - ROW_NUMBER() OVER (ORDER BY id) as diff FROM Stadium WHERE people >= 100) SELECT id, visit_date, people FROM t WHERE diff IN (SELECT diff FROM t GROUP BY diff HAVING COUNT(*) >= 3) ORDER BY visit_date`,
    defaultCode: '',
    examples: [
      {
        inputText: `**Input:** 
Stadium table:
+------+------------+-----------+
| id   | visit_date | people    |
+------+------------+-----------+
| 1    | 2017-01-01 | 10        |
| 2    | 2017-01-02 | 109       |
...`,
        outputText: `**Output:** 
+------+------------+-----------+
| id   | visit_date | people    |
+------+------------+-----------+
| 5    | 2017-01-05 | 145       |
| 6    | 2017-01-06 | 1455      |
| 7    | 2017-01-07 | 199       |
| 8    | 2017-01-09 | 188       |
+------+------------+-----------+`,
        explanation: ""
      }
    ]
  },
  {
    title: 'Find High Salary Employees',
    difficulty: 'Easy',
    description: 'List all employees earning more than 50,000.',
    schemaSQL: `
      CREATE TABLE employees (
        id INT PRIMARY KEY,
        name VARCHAR(100),
        salary INT,
        department VARCHAR(50)
      );
      INSERT INTO employees (id, name, salary, department) VALUES
      (1, 'Alice', 45000, 'HR'),
      (2, 'Bob', 60000, 'Engineering'),
      (3, 'Charlie', 75000, 'Engineering'),
      (4, 'Diana', 48000, 'Sales');
    `,
    solutionSQL: `SELECT * FROM employees WHERE salary > 50000`,
    defaultCode: 'SELECT * FROM employees',
    examples: [
      {
        inputText: `**Input:**
Employees table:
| id | name    | salary | department  |
|----|---------|--------|-------------|
| 1  | Alice   | 45000  | HR          |
| 2  | Bob     | 60000  | Engineering |
| 3  | Charlie | 75000  | Engineering |
| 4  | Diana   | 48000  | Sales       |`,
        outputText: `**Output:**
| id | name    | salary | department  |
|----|---------|--------|-------------|
| 2  | Bob     | 60000  | Engineering |
| 3  | Charlie | 75000  | Engineering |`,
        explanation: 'Bob and Charlie show earn more than 50,000.'
      }
    ]
  },
  {
    title: 'Department-wise Employee Count',
    difficulty: 'Medium',
    description: 'Find the number of employees in each department.',
    schemaSQL: `
      CREATE TABLE employees (
        id INT PRIMARY KEY,
        name VARCHAR(100),
        department VARCHAR(50)
      );
      INSERT INTO employees (id, name, department) VALUES
      (1, 'Alice', 'HR'),
      (2, 'Bob', 'Engineering'),
      (3, 'Charlie', 'Engineering'),
      (4, 'Diana', 'Sales'),
      (5, 'Eve', 'Sales');
    `,
    solutionSQL: `SELECT department, COUNT(*) as count FROM employees GROUP BY department`,
    defaultCode: 'SELECT department, COUNT(*) as count FROM employees GROUP BY department',
    examples: [
      {
        inputText: `**Input:**
Employees table:
| id | name    | department  |
|----|---------|-------------|
| 1  | Alice   | HR          |
| 2  | Bob     | Engineering |
| 3  | Charlie | Engineering |
| 4  | Diana   | Sales       |
| 5  | Eve     | Sales       |`,
        outputText: `**Output:**
| department  | count |
|-------------|-------|
| HR          | 1     |
| Engineering | 2     |
| Sales       | 2     |`,
        explanation: 'HR has 1 employee, Engineering has 2, Sales has 2.'
      }
    ]
  },
  {
    title: 'Total Order Value per Customer',
    difficulty: 'Medium',
    description: 'Find total order value for each customer.',
    schemaSQL: `
      CREATE TABLE customers (
        id INT PRIMARY KEY,
        name VARCHAR(100)
      );
      CREATE TABLE orders (
        id INT PRIMARY KEY,
        customer_id INT,
        amount REAL
      );
      INSERT INTO customers (id, name) VALUES
      (1, 'Aman'),
      (2, 'Saurabh');
      INSERT INTO orders (id, customer_id, amount) VALUES
      (1, 1, 1200.5),
      (2, 1, 800.0),
      (3, 2, 1500.0);
    `,
    solutionSQL: `SELECT c.name, SUM(o.amount) as total_amount FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name`,
    defaultCode: 'SELECT c.name, SUM(o.amount) as total_amount FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name',
    examples: [
      {
        inputText: `**Input:**
Customers table:
| id | name    |
|----|---------|
| 1  | Aman    |
| 2  | Saurabh |

Orders table:
| id | customer_id | amount |
|----|-------------|--------|
| 1  | 1           | 1200.5 |
| 2  | 1           | 800.0  |
| 3  | 2           | 1500.0 |`,
        outputText: `**Output:**
| name    | total_amount |
|---------|--------------|
| Aman    | 2000.5       |
| Saurabh | 1500.0       |`,
        explanation: 'Aman total: 1200.5 + 800.0 = 2000.5. Saurabh total: 1500.0.'
      }
    ]
  },
  {
    title: 'Highest Paid Employee',
    difficulty: 'Hard',
    description: 'Find the employee(s) with the highest salary.',
    schemaSQL: `
      CREATE TABLE employees (
        id INT PRIMARY KEY,
        name VARCHAR(100),
        salary INT
      );
      INSERT INTO employees (id, name, salary) VALUES
      (1, 'Alice', 70000),
      (2, 'Bob', 85000),
      (3, 'Charlie', 85000);
    `,
    solutionSQL: `SELECT * FROM employees WHERE salary = (SELECT MAX(salary) FROM employees)`,
    defaultCode: 'SELECT * FROM employees',
    examples: [
      {
        inputText: `**Input:**
Employees table:
| id | name    | salary |
|----|---------|--------|
| 1  | Alice   | 70000  |
| 2  | Bob     | 85000  |
| 3  | Charlie | 85000  |`,
        outputText: `**Output:**
| id | name    | salary |
|----|---------|--------|
| 2  | Bob     | 85000  |
| 3  | Charlie | 85000  |`,
        explanation: 'Bob and Charlie share the highest salary of 85000.'
      }
    ]
  }
];

// Main Execution Block
// Main Execution Block
const seed = async () => {
  let pgPool = null;
  let pgClient = null;

  try {
    console.log('--- Starting Database Seeding Process ---');

    console.log('[1/3] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);

    console.log('      Clearing old assignments...');
    await Assignment.deleteMany({});

    console.log('      Inserting new assignment data...');
    const assignmentsData = seedAssignments;
    const createdAssignments = await Assignment.insertMany(assignmentsData);
    console.log(`      Success: Seeded ${createdAssignments.length} assignments in MongoDB.`);

    console.log('[2/3] Connecting to PostgreSQL...');
    pgPool = new Pool({ connectionString: process.env.PG_URI });
    pgClient = await pgPool.connect();

    console.log('      Setting up schemas for each assignment...');
    for (const currentAssignment of createdAssignments) {
      const schemaName = `assignment_${currentAssignment._id}`;

      await pgClient.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      await pgClient.query(`CREATE SCHEMA "${schemaName}"`);

      await pgClient.query(`SET search_path TO "${schemaName}"`);
      await pgClient.query(currentAssignment.schemaSQL);
    }

    console.log('      Success: PostgreSQL schemas seeded successfully.');

  } catch (err) {
    console.error('!!! Seeding Failed !!!');
    console.error(err);
    process.exit(1);
  } finally {
    console.log('[3/3] Closing connections...');
    if (pgClient) pgClient.release();
    if (pgPool) await pgPool.end();
    await mongoose.connection.close();
    console.log('--- Seeding Complete ---');
  }
};

seed();
