import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

interface RecipeFormValues {
  title: string;
  description: string;
  cooking_time: string;
  difficulty_level: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
}

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  cooking_time: yup
    .number()
    .required('Cooking time is required')
    .min(1, 'Cooking time must be at least 1 minute'),
  difficulty_level: yup.string().required('Difficulty level is required'),
  servings: yup
    .number()
    .required('Servings is required')
    .min(1, 'Servings must be at least 1'),
  ingredients: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one ingredient is required'),
  instructions: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one instruction is required'),
});

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<RecipeFormValues>({
    initialValues: {
      title: '',
      description: '',
      cooking_time: '',
      difficulty_level: '',
      servings: '',
      ingredients: [''],
      instructions: [''],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        let imageUrl = '';
        if (image) {
          const formData = new FormData();
          formData.append('image', image);

          const uploadResponse = await axios.post(
            `${process.env.REACT_APP_API_URL}/recipes/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          imageUrl = uploadResponse.data.url;
        }

        const recipeData = {
          ...values,
          cooking_time: parseInt(values.cooking_time),
          servings: parseInt(values.servings),
          image_url: imageUrl,
        };

        console.log('Submitting recipe data:', recipeData);

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/recipes`,
          recipeData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        navigate(`/recipe/${response.data.id}`);
      } catch (err) {
        setError('Failed to create recipe. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  const getFieldError = (fieldName: string, index?: number) => {
    if (index !== undefined) {
      const touched = formik.touched[fieldName as keyof typeof formik.touched] as boolean[] | undefined;
      const errors = formik.errors[fieldName as keyof typeof formik.errors] as string[] | undefined;
      return touched?.[index] && errors?.[index];
    }
    return formik.touched[fieldName as keyof typeof formik.touched] && 
           formik.errors[fieldName as keyof typeof formik.errors];
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = () => {
    formik.setFieldValue('ingredients', [...formik.values.ingredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = formik.values.ingredients.filter((_, i) => i !== index);
    formik.setFieldValue('ingredients', newIngredients);
  };

  const handleAddInstruction = () => {
    formik.setFieldValue('instructions', [...formik.values.instructions, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = formik.values.instructions.filter((_, i) => i !== index);
    formik.setFieldValue('instructions', newInstructions);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Recipe
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Recipe Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={Boolean(getFieldError('title'))}
                helperText={getFieldError('title')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={Boolean(getFieldError('description'))}
                helperText={getFieldError('description')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                id="cooking_time"
                name="cooking_time"
                label="Cooking Time (minutes)"
                value={formik.values.cooking_time}
                onChange={formik.handleChange}
                error={Boolean(getFieldError('cooking_time'))}
                helperText={getFieldError('cooking_time')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                id="servings"
                name="servings"
                label="Servings"
                value={formik.values.servings}
                onChange={formik.handleChange}
                error={Boolean(getFieldError('servings'))}
                helperText={getFieldError('servings')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                id="difficulty_level"
                name="difficulty_level"
                label="Difficulty Level"
                value={formik.values.difficulty_level}
                onChange={formik.handleChange}
                error={Boolean(getFieldError('difficulty_level'))}
                helperText={getFieldError('difficulty_level')}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  border: '1px dashed grey',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button variant="outlined" component="span">
                    Upload Recipe Image
                  </Button>
                </label>
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              {formik.values.ingredients.map((ingredient, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    name={`ingredients.${index}`}
                    value={ingredient}
                    onChange={formik.handleChange}
                    error={Boolean(getFieldError('ingredients', index))}
                    helperText={getFieldError('ingredients', index)}
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveIngredient(index)}
                    disabled={formik.values.ingredients.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddIngredient}
                sx={{ mt: 1 }}
              >
                Add Ingredient
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              {formik.values.instructions.map((instruction, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    name={`instructions.${index}`}
                    value={instruction}
                    onChange={formik.handleChange}
                    error={Boolean(getFieldError('instructions', index))}
                    helperText={getFieldError('instructions', index)}
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveInstruction(index)}
                    disabled={formik.values.instructions.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddInstruction}
                sx={{ mt: 1 }}
              >
                Add Instruction
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Recipe'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateRecipe; 