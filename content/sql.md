[![Home](https://img.shields.io/badge/Home-README-blue?style=for-the-badge&logo=homeassistant)](../ReadME.md)
## Introduction to SQL

Structured Query Language (SQL) is a powerful and widely used language for managing and manipulating relational databases. SQL allows you to interact with databases to store, retrieve, update, and delete data. In this section, we will cover the fundamental concepts and syntax of SQL.

### Database Basics

A database is an organized collection of data stored in a structured format. It consists of tables, which hold the data, and relationships between the tables. Each table consists of rows (also known as records) and columns (also known as fields). Columns define the type of data that can be stored, such as text, numbers, or dates.

## Normalisation

Normalisation is **the process to eliminate data redundancy and enhance data integrity in the table.**

### 1NF (First Normal Form) Rules

- Each table cell should contain a single value.
- No multivalued value, e.g., Phone number.
- Each record needs to be unique.
- No repeating columns, e.g., phone number.

### 2NF (Second Normal Form) Rules

- Rule 1: Be in 1NF.
- No partial dependency. All the non-prime attributes should be fully dependent on the candidate key.

### 3NF (Third Normal Form) Rules

- Tables should be in 1NF and 2NF.
- No transitive dependency: all fields must only be determinable by the primary/composite key, not by other keys. (Occurs when we can guess any value of a column from any non-key column.)



### Creating a Database
```sql
CREATE DATABASE IF NOT EXISTS niit;
```
This command creates a database named `niit` if it does not already exist.

### Creating Tables
```sql
CREATE TABLE niit.student (
    stu_id INT,
    stu_name VARCHAR(100),
    stu_address VARCHAR(100)
);
```
Defines a table `student` in the `niit` database with the following columns:
- `stu_id`: Integer
- `stu_name`: String up to 100 characters
- `stu_address`: String up to 100 characters

```sql
USE niit; -- Selects the niit database

CREATE TABLE niit.student1 (
    stu_id INT,
    stu_name VARCHAR(100),
    stu_address VARCHAR(100)
);
```
Creates another table `student1` in the `niit` database.

### Adding a Column
```sql
ALTER TABLE niit.student1 ADD age INT;
```
Adds a new column `age` of type Integer to the `student1` table.

### Removing a Column
```sql
ALTER TABLE student1 DROP age;
```
Removes the `age` column from the `student1` table.

### Modifying Column Data Types
```sql
ALTER TABLE student1 MODIFY stu_address VARCHAR(200);
```
Changes the data type of the `stu_address` column in the `student1` table to `VARCHAR(200)`.

```sql
ALTER TABLE student_details 
MODIFY COLUMN stu_name CHAR(30), 
MODIFY full_address VARCHAR(100);
```
Allows modification of multiple columns at once:
- Changes `stu_name` to `CHAR(30)`.
- Changes `full_address` to `VARCHAR(100)`.

### Renaming Table
```sql
ALTER TABLE student1 RENAME student_details;
```
Renames the table `student1` to `student_details`.

### Renaming Columns
```sql
ALTER TABLE student_details RENAME COLUMN stu_address TO full_address;
```
Renames the column `stu_address` to `full_address` in the `student_details` table.

### Inserting Data
```sql
INSERT INTO student_details VALUES
(101, "Atul", "delhi"),
(103, "disha", "delhi"),
(102, "neha", "delhi");
```
Inserts multiple rows into the `student_details` table.

### Displaying Data
```sql
SELECT * FROM student_details;
```
Retrieves and displays all the data from the `student_details` table.

### Cloning Tables and Copying Data
```sql
CREATE TABLE IF NOT EXISTS student_bk LIKE student_details;
INSERT student_bk SELECT * FROM student_details WHERE stu_id < 103;
USE niit;
DESC student_bk; -- Displays the table structure
TRUNCATE TABLE student_bk; -- Deletes data but retains structure
SELECT * FROM student_bk;
```
Creates a backup table and inserts selected data from `student_details`.

### Managing Databases
```sql
CREATE DATABASE niit1;
DROP DATABASE niit1; -- Deletes the database
```
Creates and deletes a database.

### Constraints
```sql
CREATE DATABASE IF NOT EXISTS school;
DROP DATABASE school;
CREATE DATABASE IF NOT EXISTS school_data;
```
Defines database creation and removal for constraint examples.

#### Primary Key, Unique, and Not Null Constraints
```sql
CREATE TABLE school_data.student_data(
    student_roll_no INT PRIMARY KEY, 
    name VARCHAR(100) NOT NULL UNIQUE,
    age INT
);
```
Defines a table with `PRIMARY KEY`, `UNIQUE`, and `NOT NULL` constraints.

#### Foreign Key Constraints
```sql
CREATE DATABASE IF NOT EXISTS shop;
CREATE TABLE shop.customer_data(
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(50) NOT NULL,
    address VARCHAR(50)
);
CREATE TABLE shop.orders(
    order_id INT PRIMARY KEY,
    order_name VARCHAR(60) NOT NULL,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES shop.customer_data(customer_id)
);
```
Defines relationships between tables using foreign keys.

### Inserting Data with Constraints
```sql
INSERT INTO school_data.student_data VALUES (101, "adam", 13);
```
Inserts data adhering to constraints.

### Using Check Constraints
```sql
CREATE TABLE Persons (
    ID INT NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    FirstName VARCHAR(255),
    Age INT,
    CHECK (Age >= 18)
);
```
Ensures `Age` values meet specified conditions.

### Using Default Values
```sql
CREATE TABLE Persons (
    ID INT NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    FirstName VARCHAR(255),
    Age INT,
    City VARCHAR(255) DEFAULT 'Sandnes'
);
```
Provides a default value for `City` column if not specified.

### Updating Data
```sql
UPDATE school_data.student_data SET age = 16 WHERE student_roll_no = 101;
SELECT * FROM school_data.student_data;
```
Updates specific rows and retrieves the table data.

### Deleting Data
```sql
SET sql_safe_updates = 0;
DELETE FROM school_data.student_data;
INSERT INTO school_data.student_data VALUES (102, "jon", 12);
INSERT INTO school_data.student_data VALUES (101, "adam", 13);

-- Delete specific row
DELETE FROM school_data.student_data WHERE student_roll_no = 102;
SELECT * FROM school_data.student_data;
SHOW VARIABLES LIKE "sql_safe_updates";
SET sql_safe_updates = 1;
SELECT * FROM school_data.student_data WHERE student_roll_no BETWEEN 101 AND 102;
```
Removes all or specific rows from the table.

### Altering and Inserting into Specific Columns
```sql
ALTER TABLE employee_details DROP COLUMN sales; -- Deletes a column
INSERT INTO employee_details(department_name) VALUES ("sales"); -- Inserts data into specific column
```

### Adding Constraints
```sql
ALTER TABLE employee_details ADD CONSTRAINT t PRIMARY KEY(employee_id);
ALTER TABLE employee_details MODIFY employee_id INT PRIMARY KEY;
```
Adds or modifies a primary key constraint to the `employee_id` column.

### String Functions
```sql
SELECT SUBSTR('disha', 1, 2);
SELECT LEFT('disha', 2) AS customer;
SELECT UPPER('disha') AS customer;
SELECT LOWER('Disha') AS customer;
SELECT REVERSE('Disha');
```
Performs various string operations such as substring extraction, case conversion, and reversing.

#### Concatenation
```sql
SET sql_mode = 'ANSI'; -- Enables "pipes_as_concat"
SELECT CONCAT(first_name, last_name) AS customer FROM sakila.customer;
SELECT first_name || ' ' || last_name AS customer FROM sakila.customer;
```
Concatenates strings using different methods.

#### Counting Characters in a String
```sql
SELECT CHARACTER_LENGTH('abhishek') AS name;
```
Counts the number of characters in a string.

#### Regular Expressions
```sql
SELECT * FROM sakila.actor WHERE first_name REGEXP ('p*'); -- 0 or more matches
SELECT * FROM sakila.actor WHERE first_name REGEXP ('p+'); -- 1 or more matches
SELECT * FROM sakila.actor WHERE first_name REGEXP ('p?'); -- 0 or 1 match
SELECT * FROM sakila.actor WHERE first_name REGEXP ('^p'); -- Matches first character
```
Filters data based on regular expression patterns.

### Date Functions
```sql
SELECT CURDATE();
SELECT MONTH();
SELECT DATE();
SELECT MONTHNAME();
SELECT ADDDATE('2008-8-24 15:25:52', INTERVAL '8:20' HOUR_MINUTE);
```
Performs various date operations such as fetching current date or adding intervals.

### Mathematical Functions
```sql
SELECT FLOOR(12.30);
SELECT CEIL(12.30);
SELECT PI();
SELECT POW(5, 2);
SELECT ROUND(2.3443, 1);
```
Executes mathematical operations like rounding, exponentiation, and more.

### Information Functions
```sql
SELECT CONNECTION_ID();
SELECT CURRENT_USER();
SELECT DATABASE();
SELECT VERSION();
```
Retrieves database-related information.

### Aggregate Functions
```sql
SELECT COUNT(*) FROM sakila.film;
SELECT AVG(rental_duration) AS 'Average' FROM sakila.film;
SELECT MIN(rental_duration) AS 'Minimum' FROM sakila.film;
SELECT MAX(rental_duration) AS 'Maximum' FROM sakila.film;
SELECT SUM(rental_duration) AS 'Sum' FROM sakila.film;
```
Performs aggregation operations on data.

### Order By Clause
```sql
SELECT rental_id, amount, payment_date FROM sakila.payment ORDER BY amount DESC;
```
Sorts data in descending order of `amount`.

## Grouping Data
```sql
SELECT SUM(amount) AS 'amount', customer_id 
FROM sakila.payment 
GROUP BY customer_id 
ORDER BY amount;
```
Groups data by `customer_id` and calculates the total `amount`, then sorts the results by `amount`.

## Having Clause
```sql
SELECT SUM(amount) AS 'amount', customer_id 
FROM sakila.payment 
GROUP BY customer_id 
HAVING amount > 100 
ORDER BY amount;
```
Filters grouped data to include only customers with a total `amount` greater than 100, then sorts the results.

## Inner Join
```sql
SELECT * 
FROM employee 
INNER JOIN dept 
ON employee.e_id = dept.e_id;
```
Combines rows from `employee` and `dept` tables based on matching `e_id` values.

## Creating Views
```sql
CREATE VIEW customer_detailsbbbb AS 
SELECT customer_id, first_name, last_name, email 
FROM customer 
GROUP BY customer_id;

SELECT * FROM customer_details;
```
Creates a view named `customer_detailsbbbb` to display grouped customer details.

## Subqueries

### Scalar Subqueries
```sql
SELECT language 
FROM CountryLanguage 
WHERE countrycode = (SELECT code FROM country WHERE name = 'Finland');

SELECT name, 
    (SELECT COUNT(*) FROM city WHERE countrycode = code) AS cities,
    (SELECT COUNT(*) FROM CountryLanguage WHERE countrycode = code) AS languages 
FROM Country;

SELECT AVG(cnt_sum) 
FROM (
    SELECT continent, SUM(population) AS cnt_sum 
    FROM Country 
    GROUP BY continent
) t;
```
Performs subqueries to fetch specific values, such as languages spoken in Finland, city and language counts for each country, and average population sums by continent.

### Using `WHERE IN`
```sql
SELECT * 
FROM city 
WHERE countrycode IN (SELECT code FROM country WHERE continent = 'Asia');

SELECT * 
FROM city 
WHERE (countrycode, name) IN (SELECT code, name FROM country WHERE continent = 'Asia');
```
Filters rows from `city` where `countrycode` or `(countrycode, name)` matches values from a subquery.

### Using `WHERE EXISTS`
```sql
SELECT * 
FROM city 
WHERE EXISTS (
    SELECT capital 
    FROM country 
    WHERE country.capital = city.id
);
```
Filters rows where a related record exists in another table.

### Using `ALL`, `ANY`, and `SOME`
```sql
SELECT 'finland' = ANY (SELECT name FROM world.country);

SELECT * 
FROM country 
WHERE population > ALL (SELECT population FROM city);

SELECT * 
FROM country 
WHERE population > ANY (SELECT population FROM city);

SELECT * 
FROM country 
WHERE population = SOME (SELECT population FROM city);
```
Compares values with subqueries using `ALL`, `ANY`, or `SOME` to check conditions across multiple rows.

## Pivot Table
```sql
SELECT 
    language,
    SUM(CASE
        WHEN isofficial = 'T' THEN percentage
        ELSE 0
    END) AS 'off%',
    SUM(CASE
        WHEN isofficial = 'F' THEN percentage
        ELSE 0
    END) AS 'unoff%'
FROM
    countrylanguage 
GROUP BY language;
```
Creates a pivot table to calculate the percentage of official and unofficial languages grouped by language.

## Partitioning
### With Partition
```sql
SELECT id, name, countrycode, district, population,
    ROW_NUMBER() OVER (PARTITION BY countrycode) AS rownumber 
FROM city;
```
Applies row numbering within each `countrycode` group.

### Without Partition
```sql
SELECT id, name, countrycode, district, population,
    ROW_NUMBER() OVER () AS rownumber 
FROM city;
```
Applies row numbering across the entire table without grouping.

## Window Functions
### Rank and Dense Rank
```sql
SELECT canditate_no, physics, chem, maths,
    RANK() OVER (ORDER BY maths DESC) AS maths_rank,
    DENSE_RANK() OVER (ORDER BY maths DESC) AS dense_maths_rank 
FROM results;
```
Calculates rank and dense rank based on descending `maths` scores.

### Lag and Lead
#### Lag
```sql
SELECT id, name, countrycode, district, population,
    LAG(population) OVER (PARTITION BY countrycode) AS lag_population 
FROM city;
```
Fetches the previous population value within each `countrycode` group.

#### Lead
```sql
SELECT id, name, countrycode, district, population,
    MIN(population) OVER (PARTITION BY countrycode) AS min_population,
    MAX(population) OVER (PARTITION BY countrycode) AS max_population,
    SUM(population) OVER (PARTITION BY countrycode) AS sum_population,
    AVG(population) OVER (PARTITION BY countrycode) AS average_population 
FROM city;
```
Calculates minimum, maximum, sum, and average population within each `countrycode` group.

## Triggers
### Insert Trigger
```sql
CREATE TRIGGER oninsert 
BEFORE INSERT ON student 
FOR EACH ROW 
SET 
    NEW.firstname = UPPER(NEW.firstname),
    NEW.lastname = UPPER(NEW.lastname),
    NEW.hometown = UPPER(NEW.hometown);
```
Modifies inserted data by converting specific fields to uppercase.

### Update Trigger
```sql
CREATE TRIGGER onupdate 
BEFORE UPDATE ON student 
FOR EACH ROW 
SET 
    NEW.firstname = UPPER(NEW.firstname),
    NEW.lastname = UPPER(NEW.lastname),
    NEW.hometown = UPPER(NEW.hometown);
```
Ensures updated data fields are converted to uppercase.

### Delete Trigger
```sql
DELIMITER $$

CREATE TRIGGER teacherresigns
BEFORE DELETE
ON Teachers 
FOR EACH ROW
BEGIN
    INSERT INTO PrevTeachers (EmpNo, FirstName, LastName)
    VALUES (OLD.EmpNo, OLD.FirstName, OLD.LastName);
END$$

DELIMITER;
```
Inserts deleted teacher records into the `PrevTeachers` table for record-keeping.




