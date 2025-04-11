const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Get comments for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [comments] = await pool.execute(
      `SELECT c.*, u.username, u.profile_picture_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = ?
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.params.recipeId, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM comments WHERE recipe_id = ?',
      [req.params.recipeId]
    );

    res.json({
      comments,
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

// Add comment to recipe
router.post('/',
  auth,
  [
    body('recipe_id').isInt(),
    body('text').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { recipe_id, text } = req.body;

      // Check if recipe exists
      const [recipes] = await pool.execute(
        'SELECT id FROM recipes WHERE id = ?',
        [recipe_id]
      );

      if (!recipes.length) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Insert comment
      const [result] = await pool.execute(
        'INSERT INTO comments (user_id, recipe_id, text) VALUES (?, ?, ?)',
        [req.user.id, recipe_id, text]
      );

      // Get the created comment with user info
      const [comments] = await pool.execute(
        `SELECT c.*, u.username, u.profile_picture_url
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [result.insertId]
      );

      res.status(201).json(comments[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update comment
router.put('/:id',
  auth,
  [
    body('text').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text } = req.body;

      // Check if comment exists and belongs to user
      const [comments] = await pool.execute(
        'SELECT * FROM comments WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );

      if (!comments.length) {
        return res.status(404).json({ message: 'Comment not found or unauthorized' });
      }

      // Update comment
      await pool.execute(
        'UPDATE comments SET text = ? WHERE id = ?',
        [text, req.params.id]
      );

      res.json({ message: 'Comment updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 