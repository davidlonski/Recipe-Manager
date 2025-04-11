-- Mock data for Recipe Manager database with fixed ingredient IDs

-- First, let's create a temporary table to store ingredient IDs
CREATE TEMPORARY TABLE temp_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- Insert ingredients and capture their IDs
INSERT INTO temp_ingredients (name) VALUES
('Beef chuck'),
('Carrots'),
('Potatoes'),
('Onion'),
('Garlic'),
('Beef broth'),
('Tomato paste'),
('Worcestershire sauce'),
('Salt'),
('Black pepper'),
('Salmon fillets'),
('Asparagus'),
('Lemon'),
('Olive oil'),
('Butter'),
('All-purpose flour'),
('Sugar'),
('Brown sugar'),
('Eggs'),
('Vanilla extract'),
('Chocolate chips'),
('Baking soda'),
('Baking powder'),
('Apples'),
('Cinnamon'),
('Nutmeg'),
('Pie crust'),
('Quinoa'),
('Sweet potato'),
('Chickpeas'),
('Kale'),
('Avocado'),
('Tahini'),
('Lemon juice'),
('Arborio rice'),
('Mushrooms'),
('White wine'),
('Parmesan cheese'),
('Pizza dough'),
('Tomato sauce'),
('Mozzarella cheese'),
('Pancetta'),
('Spaghetti'),
('Tofu'),
('Broccoli'),
('Soy sauce'),
('Ginger'),
('Pasta'),
('Cherry tomatoes'),
('Basil');

-- Now insert into the actual ingredients table
INSERT INTO ingredients (name)
SELECT name FROM temp_ingredients;

-- Users
INSERT INTO users (username, email, password_hash, profile_picture_url, bio, created_at, email_verified_at) VALUES
('chef_john', 'john@example.com', '$2a$10$X7UrE9N9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9Zq', '/uploads/profile1.jpg', 'Professional chef with 15 years of experience', NOW(), NOW()),
('baking_betty', 'betty@example.com', '$2a$10$X7UrE9N9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9Zq', '/uploads/profile2.jpg', 'Passionate baker and dessert enthusiast', NOW(), NOW()),
('vegan_victor', 'victor@example.com', '$2a$10$X7UrE9N9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9Zq', '/uploads/profile3.jpg', 'Plant-based cooking advocate', NOW(), NOW()),
('italian_irene', 'irene@example.com', '$2a$10$X7UrE9N9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9Zq', '/uploads/profile4.jpg', 'Authentic Italian recipes from my grandmother', NOW(), NOW()),
('quick_cook', 'quick@example.com', '$2a$10$X7UrE9N9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9ZqX9Zq', '/uploads/profile5.jpg', '30-minute meals for busy people', NOW(), NOW());

-- Recipes
INSERT INTO recipes (user_id, title, description, cooking_time, servings, difficulty, cuisine, created_at, updated_at) VALUES
(1, 'Classic Beef Stew', 'A hearty beef stew with vegetables, perfect for cold days', 120, 6, 'Medium', 'American', NOW(), NOW()),
(1, 'Grilled Salmon with Asparagus', 'Fresh salmon fillets grilled with asparagus and lemon', 30, 4, 'Easy', 'Seafood', NOW(), NOW()),
(2, 'Chocolate Chip Cookies', 'Classic chocolate chip cookies that are crispy outside and chewy inside', 25, 24, 'Easy', 'Dessert', NOW(), NOW()),
(2, 'Apple Pie', 'Traditional apple pie with a flaky crust', 90, 8, 'Medium', 'Dessert', NOW(), NOW()),
(3, 'Vegan Buddha Bowl', 'A colorful bowl filled with quinoa, roasted vegetables, and tahini dressing', 45, 2, 'Easy', 'Vegan', NOW(), NOW()),
(3, 'Mushroom Risotto', 'Creamy mushroom risotto with arborio rice', 40, 4, 'Medium', 'Italian', NOW(), NOW()),
(4, 'Homemade Pizza', 'Authentic Italian pizza with tomato sauce and mozzarella', 60, 4, 'Medium', 'Italian', NOW(), NOW()),
(4, 'Pasta Carbonara', 'Classic carbonara with pancetta, egg, and parmesan', 25, 4, 'Medium', 'Italian', NOW(), NOW()),
(5, '15-Minute Stir Fry', 'Quick and healthy vegetable stir fry with tofu', 15, 2, 'Easy', 'Asian', NOW(), NOW()),
(5, 'One-Pot Pasta', 'Easy one-pot pasta with tomatoes and basil', 20, 4, 'Easy', 'Italian', NOW(), NOW());

-- RecipeIngredients with correct ingredient IDs
-- For recipe 1 (Beef Stew)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '2 lbs' FROM temp_ingredients WHERE name = 'Beef chuck';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '4' FROM temp_ingredients WHERE name = 'Carrots';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '4' FROM temp_ingredients WHERE name = 'Potatoes';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '1' FROM temp_ingredients WHERE name = 'Onion';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '4 cloves' FROM temp_ingredients WHERE name = 'Garlic';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '4 cups' FROM temp_ingredients WHERE name = 'Beef broth';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '2 tbsp' FROM temp_ingredients WHERE name = 'Tomato paste';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '1 tbsp' FROM temp_ingredients WHERE name = 'Worcestershire sauce';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '1 tsp' FROM temp_ingredients WHERE name = 'Salt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 1, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Black pepper';

-- For recipe 2 (Grilled Salmon)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 2, id, '4 fillets' FROM temp_ingredients WHERE name = 'Salmon fillets';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 2, id, '1 lb' FROM temp_ingredients WHERE name = 'Asparagus';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 2, id, '2' FROM temp_ingredients WHERE name = 'Lemon';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 2, id, '2 tbsp' FROM temp_ingredients WHERE name = 'Olive oil';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 2, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Salt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 2, id, '1/4 tsp' FROM temp_ingredients WHERE name = 'Black pepper';

-- For recipe 3 (Chocolate Chip Cookies)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '2 1/4 cups' FROM temp_ingredients WHERE name = 'All-purpose flour';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '1 cup' FROM temp_ingredients WHERE name = 'Sugar';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '1 cup' FROM temp_ingredients WHERE name = 'Brown sugar';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '2' FROM temp_ingredients WHERE name = 'Eggs';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '1 tsp' FROM temp_ingredients WHERE name = 'Vanilla extract';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '2 cups' FROM temp_ingredients WHERE name = 'Chocolate chips';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '1 tsp' FROM temp_ingredients WHERE name = 'Baking soda';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Baking powder';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 3, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Salt';

-- For recipe 4 (Apple Pie)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 4, id, '6' FROM temp_ingredients WHERE name = 'Apples';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 4, id, '1 tsp' FROM temp_ingredients WHERE name = 'Cinnamon';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 4, id, '1/4 tsp' FROM temp_ingredients WHERE name = 'Nutmeg';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 4, id, '2' FROM temp_ingredients WHERE name = 'Pie crust';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 4, id, '1/2 cup' FROM temp_ingredients WHERE name = 'Sugar';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 4, id, '1/4 tsp' FROM temp_ingredients WHERE name = 'Salt';

-- For recipe 5 (Vegan Buddha Bowl)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 5, id, '1 cup' FROM temp_ingredients WHERE name = 'Quinoa';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 5, id, '1' FROM temp_ingredients WHERE name = 'Sweet potato';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 5, id, '1 can' FROM temp_ingredients WHERE name = 'Chickpeas';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 5, id, '2 cups' FROM temp_ingredients WHERE name = 'Kale';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 5, id, '1' FROM temp_ingredients WHERE name = 'Avocado';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 5, id, '2 tbsp' FROM temp_ingredients WHERE name = 'Tahini';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 5, id, '1 tbsp' FROM temp_ingredients WHERE name = 'Lemon juice';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 5, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Salt';

-- For recipe 6 (Mushroom Risotto)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 6, id, '1 cup' FROM temp_ingredients WHERE name = 'Arborio rice';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 6, id, '8 oz' FROM temp_ingredients WHERE name = 'Mushrooms';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 6, id, '1' FROM temp_ingredients WHERE name = 'Onion';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 6, id, '2 cloves' FROM temp_ingredients WHERE name = 'Garlic';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 6, id, '1/2 cup' FROM temp_ingredients WHERE name = 'White wine';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 6, id, '1/2 cup' FROM temp_ingredients WHERE name = 'Parmesan cheese';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 6, id, '2 tbsp' FROM temp_ingredients WHERE name = 'Olive oil';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 6, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Salt';

-- For recipe 7 (Homemade Pizza)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 7, id, '1' FROM temp_ingredients WHERE name = 'Pizza dough';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 7, id, '1 cup' FROM temp_ingredients WHERE name = 'Tomato sauce';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 7, id, '2 cups' FROM temp_ingredients WHERE name = 'Mozzarella cheese';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 7, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Salt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 7, id, '1/4 tsp' FROM temp_ingredients WHERE name = 'Black pepper';

-- For recipe 8 (Pasta Carbonara)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 8, id, '4 oz' FROM temp_ingredients WHERE name = 'Pancetta';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 8, id, '2' FROM temp_ingredients WHERE name = 'Eggs';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 8, id, '1/2 cup' FROM temp_ingredients WHERE name = 'Parmesan cheese';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 8, id, '1 lb' FROM temp_ingredients WHERE name = 'Spaghetti';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 8, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Salt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 8, id, '1/4 tsp' FROM temp_ingredients WHERE name = 'Black pepper';

-- For recipe 9 (15-Minute Stir Fry)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 9, id, '8 oz' FROM temp_ingredients WHERE name = 'Tofu';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 9, id, '2 cups' FROM temp_ingredients WHERE name = 'Broccoli';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 9, id, '2 tbsp' FROM temp_ingredients WHERE name = 'Soy sauce';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 9, id, '1 tbsp' FROM temp_ingredients WHERE name = 'Ginger';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 9, id, '1 tsp' FROM temp_ingredients WHERE name = 'Garlic';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 9, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Salt';

-- For recipe 10 (One-Pot Pasta)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 10, id, '1 lb' FROM temp_ingredients WHERE name = 'Pasta';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 10, id, '2 cups' FROM temp_ingredients WHERE name = 'Cherry tomatoes';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 10, id, '1/2 cup' FROM temp_ingredients WHERE name = 'Basil';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 10, id, '2 tbsp' FROM temp_ingredients WHERE name = 'Olive oil';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 10, id, '1/2 tsp' FROM temp_ingredients WHERE name = 'Salt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT 10, id, '1/4 tsp' FROM temp_ingredients WHERE name = 'Black pepper';

-- Instructions
INSERT INTO instructions (recipe_id, step_number, description) VALUES
(1, 1, 'Cut the beef into 1-inch cubes and season with salt and pepper'),
(1, 2, 'Heat oil in a large pot over medium-high heat and brown the beef in batches'),
(1, 3, 'Remove the beef and add onions, carrots, and garlic to the pot'),
(1, 4, 'Cook until vegetables are softened, about 5 minutes'),
(1, 5, 'Add the beef back to the pot along with broth, tomato paste, and Worcestershire sauce'),
(1, 6, 'Bring to a boil, then reduce heat and simmer for 1-2 hours until beef is tender'),
(1, 7, 'Add potatoes and cook for an additional 30 minutes until potatoes are tender'),
(1, 8, 'Season with salt and pepper to taste'),
(2, 1, 'Preheat grill to medium-high heat'),
(2, 2, 'Season salmon with salt, pepper, and lemon juice'),
(2, 3, 'Toss asparagus with olive oil, salt, and pepper'),
(2, 4, 'Place salmon and asparagus on the grill'),
(2, 5, 'Cook salmon for 4-5 minutes per side until opaque'),
(2, 6, 'Cook asparagus for 5-7 minutes until tender'),
(3, 1, 'Preheat oven to 375°F'),
(3, 2, 'Cream together butter and sugars until light and fluffy'),
(3, 3, 'Beat in eggs and vanilla'),
(3, 4, 'Mix in dry ingredients (flour, baking soda, baking powder, salt)'),
(3, 5, 'Stir in chocolate chips'),
(3, 6, 'Drop rounded tablespoons onto baking sheets'),
(3, 7, 'Bake for 9-11 minutes until edges are set but centers are still soft'),
(4, 1, 'Preheat oven to 425°F'),
(4, 2, 'Peel and slice apples, toss with sugar, cinnamon, and nutmeg'),
(4, 3, 'Roll out pie crust and place in pie dish'),
(4, 4, 'Fill with apple mixture'),
(4, 5, 'Roll out second crust and place on top, crimp edges'),
(4, 6, 'Cut slits in top crust and brush with egg wash'),
(4, 7, 'Bake for 45-50 minutes until golden brown and bubbling'),
(5, 1, 'Cook quinoa according to package instructions'),
(5, 2, 'Roast sweet potato cubes with olive oil, salt, and pepper at 400°F for 25 minutes'),
(5, 3, 'Drain and rinse chickpeas, season with spices'),
(5, 4, 'Massage kale with olive oil until softened'),
(5, 5, 'Make tahini dressing by whisking tahini, lemon juice, and water'),
(5, 6, 'Assemble bowls with quinoa, roasted vegetables, chickpeas, kale, and avocado'),
(5, 7, 'Drizzle with tahini dressing'),
(6, 1, 'Heat olive oil in a large pan over medium heat'),
(6, 2, 'Sauté mushrooms until golden brown, remove from pan'),
(6, 3, 'Add onion and garlic to the same pan, cook until softened'),
(6, 4, 'Add arborio rice and toast for 1-2 minutes'),
(6, 5, 'Add wine and cook until absorbed'),
(6, 6, 'Add hot broth 1/2 cup at a time, stirring constantly until absorbed'),
(6, 7, 'Continue until rice is creamy and al dente'),
(6, 8, 'Stir in mushrooms, parmesan, and season to taste'),
(7, 1, 'Preheat oven to 450°F'),
(7, 2, 'Roll out pizza dough on a floured surface'),
(7, 3, 'Transfer to a pizza stone or baking sheet'),
(7, 4, 'Spread tomato sauce over dough'),
(7, 5, 'Top with mozzarella cheese and desired toppings'),
(7, 6, 'Bake for 12-15 minutes until crust is golden and cheese is melted'),
(8, 1, 'Bring a large pot of salted water to boil'),
(8, 2, 'Cook spaghetti according to package instructions'),
(8, 3, 'Meanwhile, cook pancetta in a large pan until crispy'),
(8, 4, 'Whisk eggs and parmesan in a bowl'),
(8, 5, 'Drain pasta, reserving some pasta water'),
(8, 6, 'Working quickly, add hot pasta to the pan with pancetta'),
(8, 7, 'Remove from heat and stir in egg mixture'),
(8, 8, 'Add pasta water as needed to create a creamy sauce'),
(9, 1, 'Press tofu to remove excess water, then cube'),
(9, 2, 'Heat oil in a large wok or skillet over high heat'),
(9, 3, 'Add tofu and cook until golden brown'),
(9, 4, 'Add broccoli and stir-fry for 2-3 minutes'),
(9, 5, 'Add soy sauce, ginger, and garlic'),
(9, 6, 'Cook for 1-2 minutes more until vegetables are tender-crisp'),
(10, 1, 'In a large pot, combine pasta, cherry tomatoes, garlic, basil, and olive oil'),
(10, 2, 'Add water and salt, bring to a boil'),
(10, 3, 'Reduce heat and simmer, stirring occasionally, until pasta is cooked and water is absorbed'),
(10, 4, 'Season with salt and pepper to taste');

-- RecipeImages
INSERT INTO recipe_images (recipe_id, image_url) VALUES
(1, '/uploads/beef_stew.jpg'),
(2, '/uploads/grilled_salmon.jpg'),
(3, '/uploads/chocolate_cookies.jpg'),
(4, '/uploads/apple_pie.jpg'),
(5, '/uploads/buddha_bowl.jpg'),
(6, '/uploads/mushroom_risotto.jpg'),
(7, '/uploads/homemade_pizza.jpg'),
(8, '/uploads/carbonara.jpg'),
(9, '/uploads/stir_fry.jpg'),
(10, '/uploads/one_pot_pasta.jpg');

-- Ratings
INSERT INTO ratings (user_id, recipe_id, rating, created_at) VALUES
(2, 1, 5, NOW()),
(3, 1, 4, NOW()),
(4, 1, 5, NOW()),
(5, 1, 4, NOW()),
(1, 2, 5, NOW()),
(3, 2, 4, NOW()),
(4, 2, 5, NOW()),
(5, 2, 4, NOW()),
(1, 3, 5, NOW()),
(3, 3, 5, NOW()),
(4, 3, 4, NOW()),
(5, 3, 5, NOW()),
(1, 4, 4, NOW()),
(2, 4, 5, NOW()),
(3, 4, 4, NOW()),
(5, 4, 5, NOW()),
(1, 5, 4, NOW()),
(2, 5, 5, NOW()),
(4, 5, 4, NOW()),
(5, 5, 5, NOW()),
(1, 6, 5, NOW()),
(2, 6, 4, NOW()),
(3, 6, 5, NOW()),
(5, 6, 4, NOW()),
(1, 7, 5, NOW()),
(2, 7, 5, NOW()),
(3, 7, 4, NOW()),
(5, 7, 5, NOW()),
(1, 8, 4, NOW()),
(2, 8, 5, NOW()),
(3, 8, 5, NOW()),
(4, 8, 4, NOW()),
(1, 9, 4, NOW()),
(2, 9, 4, NOW()),
(3, 9, 5, NOW()),
(4, 9, 4, NOW()),
(1, 10, 5, NOW()),
(2, 10, 4, NOW()),
(3, 10, 5, NOW()),
(4, 10, 5, NOW());

-- Comments
INSERT INTO comments (user_id, recipe_id, text, created_at) VALUES
(2, 1, 'This stew is amazing! Perfect for winter nights.', NOW()),
(3, 1, 'I added some red wine to the broth and it was even better.', NOW()),
(4, 1, 'My family loved this recipe. Will make it again!', NOW()),
(1, 2, 'The lemon really makes this dish pop. Great recipe!', NOW()),
(3, 2, 'I used cedar planks for grilling and it added a nice smoky flavor.', NOW()),
(5, 2, 'Quick and healthy dinner. Perfect for weeknights.', NOW()),
(1, 3, 'These cookies are the best I\'ve ever made!', NOW()),
(3, 3, 'I added some sea salt on top and it was perfect.', NOW()),
(5, 3, 'My kids love these cookies. They\'re gone in a day!', NOW()),
(1, 4, 'This pie reminds me of my grandmother\'s recipe.', NOW()),
(2, 4, 'I used a mix of Granny Smith and Honeycrisp apples. Delicious!', NOW()),
(5, 4, 'The crust was perfectly flaky. Great recipe!', NOW()),
(1, 5, 'This bowl is so colorful and nutritious. Love it!', NOW()),
(2, 5, 'I added some roasted chickpeas for extra protein.', NOW()),
(4, 5, 'The tahini dressing is the perfect finishing touch.', NOW()),
(1, 6, 'This risotto is creamy and delicious. Restaurant quality!', NOW()),
(2, 6, 'I used a mix of mushrooms and it was amazing.', NOW()),
(5, 6, 'The wine really adds depth to this dish.', NOW()),
(1, 7, 'This pizza crust is perfect! So crispy.', NOW()),
(3, 7, 'I added some fresh basil after baking and it was perfect.', NOW()),
(5, 7, 'My new favorite pizza recipe. So easy!', NOW()),
(1, 8, 'This carbonara is authentic and delicious.', NOW()),
(2, 8, 'I used guanciale instead of pancetta and it was amazing.', NOW()),
(4, 8, 'The egg sauce was perfectly creamy. Great recipe!', NOW()),
(1, 9, 'This stir fry is so quick and healthy. Perfect for busy nights.', NOW()),
(3, 9, 'I added some sesame oil at the end and it was delicious.', NOW()),
(4, 9, 'The ginger really makes this dish pop. Love it!', NOW()),
(1, 10, 'This one-pot pasta is genius! So easy and delicious.', NOW()),
(2, 10, 'I added some red pepper flakes for a little heat.', NOW()),
(3, 10, 'Perfect weeknight dinner. Will make this again!', NOW());

-- Favorites
INSERT INTO favorites (user_id, recipe_id, saved_at) VALUES
(2, 1, NOW()),
(3, 1, NOW()),
(4, 2, NOW()),
(5, 2, NOW()),
(1, 3, NOW()),
(3, 3, NOW()),
(4, 4, NOW()),
(5, 4, NOW()),
(1, 5, NOW()),
(2, 5, NOW()),
(3, 6, NOW()),
(5, 6, NOW()),
(1, 7, NOW()),
(2, 7, NOW()),
(3, 8, NOW()),
(4, 8, NOW()),
(1, 9, NOW()),
(2, 9, NOW()),
(3, 10, NOW()),
(4, 10, NOW());

-- Followers
INSERT INTO followers (follower_id, following_id, followed_at) VALUES
(2, 1, NOW()),
(3, 1, NOW()),
(4, 1, NOW()),
(5, 1, NOW()),
(1, 2, NOW()),
(3, 2, NOW()),
(4, 2, NOW()),
(5, 2, NOW()),
(1, 3, NOW()),
(2, 3, NOW()),
(4, 3, NOW()),
(5, 3, NOW()),
(1, 4, NOW()),
(2, 4, NOW()),
(3, 4, NOW()),
(5, 4, NOW()),
(1, 5, NOW()),
(2, 5, NOW()),
(3, 5, NOW()),
(4, 5, NOW());

-- Drop the temporary table
DROP TEMPORARY TABLE IF EXISTS temp_ingredients; 