-- The file is milkshake.jpg; the Linux web host is case-sensitive, so the uppercase path 404s.
UPDATE products SET image = '/menu/milkshake.jpg' WHERE image = '/menu/MILKSHAKE.jpg';
