const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.username, u.email, u.profile_picture_url, u.bio, u.created_at,
              COUNT(DISTINCT r.id) as recipe_count,
              COUNT(DISTINCT f1.follower_id) as follower_count,
              COUNT(DISTINCT f2.following_id) as following_count
       FROM users u
       LEFT JOIN recipes r ON u.id = r.user_id
       LEFT JOIN followers f1 ON u.id = f1.following_id
       LEFT JOIN followers f2 ON u.id = f2.follower_id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.params.id]
    );

    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile',
  auth,
  upload.single('profile_picture'),
  [
    body('username').optional().trim().isLength({ min: 3 }),
    body('bio').optional().trim(),
    body('current_password').optional(),
    body('new_password').optional().isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, bio, current_password, new_password } = req.body;

      // Check if username is already taken
      if (username && username !== req.user.username) {
        const [existingUsers] = await pool.execute(
          'SELECT id FROM users WHERE username = ? AND id != ?',
          [username, req.user.id]
        );

        if (existingUsers.length) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }

      // Verify current password if changing password
      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ message: 'Current password is required' });
        }

        const [users] = await pool.execute(
          'SELECT password_hash FROM users WHERE id = ?',
          [req.user.id]
        );

        const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
      }

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const updateFields = [];
        const updateValues = [];

        if (username) {
          updateFields.push('username = ?');
          updateValues.push(username);
        }

        if (bio !== undefined) {
          updateFields.push('bio = ?');
          updateValues.push(bio);
        }

        if (new_password) {
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(new_password, salt);
          updateFields.push('password_hash = ?');
          updateValues.push(passwordHash);
        }

        if (req.file) {
          updateFields.push('profile_picture_url = ?');
          updateValues.push(`/uploads/${req.file.filename}`);
        }

        if (updateFields.length) {
          updateValues.push(req.user.id);
          await connection.execute(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
          );
        }

        await connection.commit();
        connection.release();

        res.json({ message: 'Profile updated successfully' });
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

// Follow user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const [existingFollow] = await pool.execute(
      'SELECT * FROM followers WHERE follower_id = ? AND following_id = ?',
      [req.user.id, req.params.id]
    );

    if (existingFollow.length) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add follow relationship
    await pool.execute(
      'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
      [req.user.id, req.params.id]
    );

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow user
router.delete('/follow/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
      [req.user.id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const [followers] = await pool.execute(
      `SELECT u.id, u.username, u.profile_picture_url, f.followed_at
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?
       ORDER BY f.followed_at DESC`,
      [req.params.id]
    );

    res.json(followers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's following
router.get('/:id/following', async (req, res) => {
  try {
    const [following] = await pool.execute(
      `SELECT u.id, u.username, u.profile_picture_url, f.followed_at
       FROM followers f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?
       ORDER BY f.followed_at DESC`,
      [req.params.id]
    );

    res.json(following);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's recipes
router.get('/:id/recipes', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [recipes] = await pool.execute(
      `SELECT r.*, 
              COUNT(DISTINCT c.id) as comment_count,
              COUNT(DISTINCT f.user_id) as favorite_count,
              AVG(rt.rating) as average_rating
       FROM recipes r
       LEFT JOIN comments c ON r.id = c.recipe_id
       LEFT JOIN favorites f ON r.id = f.recipe_id
       LEFT JOIN ratings rt ON r.id = rt.recipe_id
       WHERE r.user_id = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.params.id, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM recipes WHERE user_id = ?',
      [req.params.id]
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

module.exports = router; 