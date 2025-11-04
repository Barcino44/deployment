INSERT INTO admin (id,name, email, password)
SELECT 1, 'Juan', 'juanjo@gmail.com', '1234'
    WHERE NOT EXISTS (SELECT 1 FROM admin WHERE email='juanjo@gmail.com');