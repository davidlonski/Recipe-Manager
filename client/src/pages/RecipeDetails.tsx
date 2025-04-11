import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  Avatar,
  Rating,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccessTime,
  Restaurant,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string;
  cooking_time: number;
  difficulty_level: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  user: {
    id: number;
    username: string;
    profile_picture_url: string;
  };
  created_at: string;
  average_rating: number;
  user_rating: number | null;
}

interface Comment {
  id: number;
  text: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    profile_picture_url: string;
  };
}

const commentValidationSchema = yup.object({
  text: yup.string().required('Comment is required'),
});

const RecipeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  const commentFormik = useFormik({
    initialValues: {
      text: '',
    },
    validationSchema: commentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/comments`,
          {
            recipe_id: id,
            text: values.text,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setComments([response.data, ...comments]);
        resetForm();
      } catch (err) {
        setError('Failed to add comment. Please try again.');
      }
    },
  });

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const [recipeRes, commentsRes, ratingsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/recipes/${id}`),
          axios.get(`${process.env.REACT_APP_API_URL}/comments/recipe/${id}`),
          axios.get(`${process.env.REACT_APP_API_URL}/ratings/recipe/${id}`)
        ]);

        // Transform the recipe data to match our interface
        const recipeData = recipeRes.data;
        const formattedRecipe = {
          id: recipeData.id,
          title: recipeData.title,
          description: recipeData.description || '',
          image_url: recipeData.images && recipeData.images.length > 0 
            ? `${process.env.REACT_APP_UPLOAD_URL}${recipeData.images[0].image_url}`
            : 'https://via.placeholder.com/300x200?text=No+Image',
          cooking_time: recipeData.cooking_time || 0,
          difficulty_level: recipeData.difficulty || 'Medium',
          servings: recipeData.servings || 0,
          ingredients: recipeData.ingredients.map((ing: any) => `${ing.quantity} ${ing.name}`),
          instructions: recipeData.instructions.map((inst: any) => inst.description),
          user: {
            id: recipeData.user_id,
            username: recipeData.username || 'Anonymous',
            profile_picture_url: recipeData.profile_picture_url || ''
          },
          created_at: recipeData.created_at,
          average_rating: ratingsRes.data.averageRating || 0,
          user_rating: null
        };

        setRecipe(formattedRecipe);
        setComments(commentsRes.data.comments || []);
        
        // If user is logged in, find their rating in the ratings list
        if (localStorage.getItem('token')) {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              // Get user ID from token
              const tokenPayload = JSON.parse(atob(token.split('.')[1]));
              const userId = tokenPayload.userId;
              
              // Find user's rating in the ratings list
              const userRating = ratingsRes.data.ratings.find(
                (r: any) => r.user_id === userId
              );
              
              setRating(userRating ? userRating.rating : null);
            } catch (tokenErr) {
              console.error('Error parsing token:', tokenErr);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching recipe details:', err);
        setError('Failed to load recipe details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  const handleRatingChange = async (newValue: number | null) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/ratings`,
        {
          recipe_id: id,
          rating: newValue,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setRating(newValue);
      setRecipe((prev) =>
        prev ? { ...prev, average_rating: response.data.average_rating } : null
      );
    } catch (err) {
      setError('Failed to update rating. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/recipes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      navigate('/');
    } catch (err) {
      setError('Failed to delete recipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !recipe) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Recipe not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Typography variant="h4" component="h1">
                {recipe.title}
              </Typography>
              {user && user.id === recipe.user.id && (
                <Box>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/recipe/${id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={handleDelete}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" color="text.secondary">
                {recipe.description}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip
                icon={<AccessTime />}
                label={`${recipe.cooking_time} mins`}
              />
              <Chip
                icon={<Restaurant />}
                label={recipe.difficulty_level}
              />
              <Chip label={`${recipe.servings} servings`} />
            </Box>

            <Box
              component="img"
              src={recipe.image_url}
              alt={recipe.title}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 3,
              }}
            />

            <Typography variant="h6" gutterBottom>
              Ingredients
            </Typography>
            <Box component="ul" sx={{ mb: 3 }}>
              {recipe.ingredients.map((ingredient, index) => (
                <Typography component="li" key={index}>
                  {ingredient}
                </Typography>
              ))}
            </Box>

            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Box component="ol">
              {recipe.instructions.map((instruction, index) => (
                <Typography component="li" key={index} sx={{ mb: 1 }}>
                  {instruction}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={recipe.user.profile_picture_url}
                alt={recipe.user.username}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1">
                  {recipe.user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posted on{' '}
                  {new Date(recipe.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Average Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={recipe.average_rating} readOnly precision={0.5} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({recipe.average_rating.toFixed(1)})
                </Typography>
              </Box>
            </Box>

            {user && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Your Rating
                </Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => {
                    handleRatingChange(newValue);
                  }}
                  precision={1}
                />
              </Box>
            )}
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>

            {user && (
              <Box component="form" onSubmit={commentFormik.handleSubmit} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="text"
                  placeholder="Write a comment..."
                  value={commentFormik.values.text}
                  onChange={commentFormik.handleChange}
                  error={
                    commentFormik.touched.text &&
                    Boolean(commentFormik.errors.text)
                  }
                  helperText={
                    commentFormik.touched.text && commentFormik.errors.text
                  }
                  sx={{ mb: 1 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!commentFormik.values.text.trim()}
                >
                  Post Comment
                </Button>
              </Box>
            )}

            <Box>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      src={comment.user.profile_picture_url}
                      alt={comment.user.username}
                      sx={{ mr: 1 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">
                        {comment.user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">{comment.text}</Typography>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecipeDetails; 