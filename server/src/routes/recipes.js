const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  }
});

// Upload endpoint for handling image uploads
router.post('/upload', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    res.json({ 
      url: `/uploads/${req.file.filename}`,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// Create recipe
router.post('/',
  auth,
  upload.array('images', 5),
  [
    body('title').trim().notEmpty(),
    body('description').optional().trim(),
    body('cooking_time').optional().isInt({ min: 1 }),
    body('servings').optional().isInt({ min: 1 }),
    body('difficulty_level').optional().isIn(['Easy', 'Medium', 'Hard']),
    body('cuisine').optional().trim(),
    body('ingredients').isArray(),
    body('instructions').isArray(),
    body('image_url').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        cooking_time,
        servings,
        difficulty_level,
        cuisine,
        ingredients,
        instructions,
        image_url = null
      } = req.body;

      // Map client field names to server field names
      const difficulty = difficulty_level;
      
      // Ensure image_url is defined
      const imageUrl = image_url || null;
      
      // Transform ingredients from array of strings to array of objects
      const formattedIngredients = ingredients.map(ingredient => {
        // Split by first space to separate quantity and name
        const parts = ingredient.split(' ');
        const quantity = parts[0];
        const name = parts.slice(1).join(' ');
        return { name, quantity };
      });

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Insert recipe
        const [recipeResult] = await connection.execute(
          `INSERT INTO recipes (user_id, title, description, cooking_time, servings, difficulty, cuisine)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [req.user.id, title, description, cooking_time, servings, difficulty, cuisine]
        );

        const recipeId = recipeResult.insertId;

        // Insert image if provided
        if (imageUrl) {
          await connection.execute(
            'INSERT INTO recipe_images (recipe_id, image_url) VALUES (?, ?)',
            [recipeId, imageUrl]
          );
        }

        // Insert ingredients
        for (const ingredient of formattedIngredients) {
          // Check if ingredient exists
          let [existingIngredient] = await connection.execute(
            'SELECT id FROM ingredients WHERE name = ?',
            [ingredient.name]
          );

          let ingredientId;
          if (!existingIngredient.length) {
            // Create new ingredient
            const [newIngredient] = await connection.execute(
              'INSERT INTO ingredients (name) VALUES (?)',
              [ingredient.name]
            );
            ingredientId = newIngredient.insertId;
          } else {
            ingredientId = existingIngredient[0].id;
          }

          // Link ingredient to recipe
          await connection.execute(
            'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)',
            [recipeId, ingredientId, ingredient.quantity]
          );
        }

        // Insert instructions
        for (let i = 0; i < instructions.length; i++) {
          await connection.execute(
            'INSERT INTO instructions (recipe_id, step_number, description) VALUES (?, ?, ?)',
            [recipeId, i + 1, instructions[i]]
          );
        }

        // Insert images
        if (req.files) {
          for (const file of req.files) {
            await connection.execute(
              'INSERT INTO recipe_images (recipe_id, image_url) VALUES (?, ?)',
              [recipeId, `/uploads/${file.filename}`]
            );
          }
        }

        await connection.commit();
        connection.release();

        res.status(201).json({ message: 'Recipe created successfully', recipeId });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all recipes with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      cuisine,
      difficulty,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    let query = `
      SELECT r.*, u.username, u.profile_picture_url,
             COUNT(DISTINCT c.id) as comment_count,
             COUNT(DISTINCT f.user_id) as favorite_count,
             AVG(rt.rating) as average_rating
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN comments c ON r.id = c.recipe_id
      LEFT JOIN favorites f ON r.id = f.recipe_id
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
    `;

    const whereConditions = [];
    const queryParams = [];

    if (search) {
      whereConditions.push('(r.title LIKE ? OR r.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (cuisine) {
      whereConditions.push('r.cuisine = ?');
      queryParams.push(cuisine);
    }

    if (difficulty) {
      whereConditions.push('r.difficulty = ?');
      queryParams.push(difficulty);
    }

    if (whereConditions.length) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' GROUP BY r.id';

    // Add sorting
    const allowedSortFields = ['created_at', 'title', 'average_rating', 'favorite_count'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [recipes] = await pool.execute(query, queryParams);

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(DISTINCT r.id) as total FROM recipes r' +
      (whereConditions.length ? ' WHERE ' + whereConditions.join(' AND ') : ''),
      queryParams.slice(0, -2)
    );

    res.json({
      recipes,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single recipe
router.get('/:id', async (req, res) => {
  try {
    const [recipes] = await pool.execute(
      `SELECT r.*, u.username, u.profile_picture_url,
              COUNT(DISTINCT c.id) as comment_count,
              COUNT(DISTINCT f.user_id) as favorite_count,
              AVG(rt.rating) as average_rating
       FROM recipes r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN comments c ON r.id = c.recipe_id
       LEFT JOIN favorites f ON r.id = f.recipe_id
       LEFT JOIN ratings rt ON r.id = rt.recipe_id
       WHERE r.id = ?
       GROUP BY r.id`,
      [req.params.id]
    );

    if (!recipes.length) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const recipe = recipes[0];

    // Get ingredients
    const [ingredients] = await pool.execute(
      `SELECT i.name, ri.quantity
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = ?`,
      [req.params.id]
    );

    // Get instructions
    const [instructions] = await pool.execute(
      'SELECT step_number, description FROM instructions WHERE recipe_id = ? ORDER BY step_number',
      [req.params.id]
    );

    // Get images
    const [images] = await pool.execute(
      'SELECT image_url FROM recipe_images WHERE recipe_id = ?',
      [req.params.id]
    );

    res.json({
      ...recipe,
      ingredients,
      instructions,
      images
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recipe
router.put('/:id',
  auth,
  upload.array('images', 5),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('cooking_time').optional().isInt({ min: 1 }),
    body('servings').optional().isInt({ min: 1 }),
    body('difficulty_level').optional().isIn(['Easy', 'Medium', 'Hard']),
    body('cuisine').optional().trim(),
    body('ingredients').optional().isArray(),
    body('instructions').optional().isArray(),
    body('image_url').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if recipe exists and belongs to user
      const [recipes] = await pool.execute(
        'SELECT * FROM recipes WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );

      if (!recipes.length) {
        return res.status(404).json({ message: 'Recipe not found or unauthorized' });
      }

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Update recipe
        const updateFields = [];
        const updateValues = [];

        if (req.body.title) {
          updateFields.push('title = ?');
          updateValues.push(req.body.title);
        }
        if (req.body.description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(req.body.description);
        }
        if (req.body.cooking_time) {
          updateFields.push('cooking_time = ?');
          updateValues.push(req.body.cooking_time);
        }
        if (req.body.servings) {
          updateFields.push('servings = ?');
          updateValues.push(req.body.servings);
        }
        if (req.body.difficulty_level) {
          updateFields.push('difficulty = ?');
          updateValues.push(req.body.difficulty_level);
        }
        if (req.body.cuisine) {
          updateFields.push('cuisine = ?');
          updateValues.push(req.body.cuisine);
        }

        if (updateFields.length) {
          updateValues.push(req.params.id);
          updateValues.push(req.user.id);
          const [updateResult] = await connection.execute(
            `UPDATE recipes SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            updateValues
          );
        }

        // Handle image update if provided
        const imageUrl = req.body.image_url || null;
        if (imageUrl) {
          // Delete existing images
          await connection.execute(
            'DELETE FROM recipe_images WHERE recipe_id = ?',
            [req.params.id]
          );
          
          // Insert new image
          await connection.execute(
            'INSERT INTO recipe_images (recipe_id, image_url) VALUES (?, ?)',
            [req.params.id, imageUrl]
          );
        }

        // Handle ingredients update if provided
        if (req.body.ingredients) {
          // Delete existing ingredients
          await connection.execute(
            'DELETE FROM recipe_ingredients WHERE recipe_id = ?',
            [req.params.id]
          );

          // Insert new ingredients
          for (const ingredient of req.body.ingredients) {
            let [existingIngredient] = await connection.execute(
              'SELECT id FROM ingredients WHERE name = ?',
              [ingredient.name]
            );

            let ingredientId;
            if (!existingIngredient.length) {
              const [newIngredient] = await connection.execute(
                'INSERT INTO ingredients (name) VALUES (?)',
                [ingredient.name]
              );
              ingredientId = newIngredient.insertId;
            } else {
              ingredientId = existingIngredient[0].id;
            }

            await connection.execute(
              'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)',
              [req.params.id, ingredientId, ingredient.quantity]
            );
          }
        }

        // Update instructions if provided
        if (req.body.instructions) {
          // Delete existing instructions
          await connection.execute(
            'DELETE FROM instructions WHERE recipe_id = ?',
            [req.params.id]
          );

          // Insert new instructions
          for (let i = 0; i < req.body.instructions.length; i++) {
            await connection.execute(
              'INSERT INTO instructions (recipe_id, step_number, description) VALUES (?, ?, ?)',
              [req.params.id, i + 1, req.body.instructions[i]]
            );
          }
        }

        // Add new images if provided
        if (req.files && req.files.length) {
          for (const file of req.files) {
            await connection.execute(
              'INSERT INTO recipe_images (recipe_id, image_url) VALUES (?, ?)',
              [req.params.id, `/uploads/${file.filename}`]
            );
          }
        }

        await connection.commit();
        connection.release();

        res.json({ message: 'Recipe updated successfully' });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete recipe
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM recipes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized' });
    }

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 