
-- studyroom
CREATE TABLE studyrooms (
  room_number VARCHAR(5) NOT NULL,
  chair_number TINYINT(4) NOT NULL,
  reservable TINYINT(1) NOT NULL,
  UNIQUE (room_number),
  PRIMARY KEY (room_number)
);

-- groups
CREATE TABLE student_groups (
  group_id int NOT NULL AUTO_INCREMENT,
  num_of_students TINYINT(2),
  UNIQUE (group_id),
  PRIMARY KEY (group_id)
);

-- individuals
CREATE TABLE individuals(
  email VARCHAR(30) NOT NULL,
  group_id INT(50) NOT NULL,
  first_name VARCHAR(25) NOT NULL,
  last_name VARCHAR(25) NOT NULL,
  CONSTRAINT uc_student UNIQUE (email,group_id),
  PRIMARY KEY (email, group_id),
  FOREIGN KEY (group_id)
    REFERENCES student_groups(group_id)
    ON DELETE CASCADE
);

-- reservations
CREATE TABLE reservations(
  reservation_id INT(50) NOT NULL AUTO_INCREMENT,
  room_number VARCHAR(5) NOT NULL,
  group_id INT(50) NOT NULL,
  date_made DATE NOT NULL,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE (reservation_id),
  PRIMARY KEY (reservation_id),
  FOREIGN KEY (room_number)
    REFERENCES studyrooms(room_number)
    ON DELETE CASCADE,
  FOREIGN KEY (group_id)
    REFERENCES student_groups(group_id)
    ON DELETE CASCADE
);
