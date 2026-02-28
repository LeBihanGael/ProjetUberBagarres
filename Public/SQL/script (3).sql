CREATE TABLE utilisateur(
   id_user INT AUTO_INCREMENT,
   pseudo VARCHAR(50) NOT NULL,
   email VARCHAR(150) NOT NULL,
   password VARCHAR(50) NOT NULL,
   age DECIMAL(3,0) NOT NULL,
   PRIMARY KEY(id_user)
);

CREATE TABLE appointement(
   id_rdv INT AUTO_INCREMENT,
   place VARCHAR(200) NOT NULL,
   hour_app TIME NOT NULL,
   date_ DATE NOT NULL,
   state BOOL,
   PRIMARY KEY(id_rdv)
);

CREATE TABLE accept(
   id_user INT,
   id_rdv INT,
   PRIMARY KEY(id_user, id_rdv),
   FOREIGN KEY(id_user) REFERENCES utilisateur(id_user),
   FOREIGN KEY(id_rdv) REFERENCES appointement(id_rdv)
);

CREATE TABLE take(
   id_user INT,
   id_rdv INT,
   PRIMARY KEY(id_user, id_rdv),
   FOREIGN KEY(id_user) REFERENCES utilisateur(id_user),
   FOREIGN KEY(id_rdv) REFERENCES appointement(id_rdv)
);
