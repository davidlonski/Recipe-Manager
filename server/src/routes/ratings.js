const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Get ratings for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const [ratings] = await pool.execute(
      `SELECT r.*, u.username, u.profile_picture_url
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.recipe_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.recipeId]
    );

    // Calculate average rating
    const averageRating = ratings.length
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0;

    res.json({
      ratings,
      averageRating: Number(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add or update rating
router.post('/',
  auth,
  [
    body('recipe_id').isInt(),
    body('rating').isInt({ min: 1, max: 5 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { recipe_id, rating } = req.body;

      // Check if recipe exists
      const [recipes] = await pool.execute(
        'SELECT id FROM recipes WHERE id = ?',
        [recipe_id]
      );

      if (!recipes.length) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Check if user has already rated
      const [existingRatings] = await pool.execute(
        'SELECT * FROM ratings WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, recipe_id]
      );

      if (existingRatings.length) {
        // Update existing rating
        await pool.execute(
          'UPDATE ratings SET rating = ? WHERE user_id = ? AND recipe_id = ?',
          [rating, req.user.id, recipe_id]
        );
      } else {
        // Insert new rating
        await pool.execute(
          'INSERT INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)',
          [req.user.id, recipe_id, rating]
        );
      }

      // Get updated ratings
      const [updatedRatings] = await pool.execute(
        `SELECT r.*, u.username, u.profile_picture_url
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.recipe_id = ?
         ORDER BY r.created_at DESC`,
        [recipe_id]
      );

      // Calculate new average rating
      const averageRating = updatedRatings.length
        ? updatedRatings.reduce((acc, curr) => acc + curr.rating, 0) / updatedRatings.length
        : 0;

      res.json({
        message: 'Rating saved successfully',
        ratings: updatedRatings,
        averageRating: Number(averageRating.toFixed(1))
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete rating
router.delete('/:recipeId', auth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM ratings WHERE user_id = ? AND recipe_id = ?',
      [req.user.id, req.params.recipeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Get updated ratings
    const [updatedRatings] = await pool.execute(
      `SELECT r.*, u.username, u.profile_picture_url
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.recipe_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.recipeId]
    );

    // Calculate new average rating
    const averageRating = updatedRatings.length
      ? updatedRatings.reduce((acc, curr) => acc + curr.rating, 0) / updatedRatings.length
      : 0;

    res.json({
      message: 'Rating deleted successfully',
      ratings: updatedRatings,
      averageRating: Number(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 