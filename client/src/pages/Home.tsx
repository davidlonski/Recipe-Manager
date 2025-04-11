import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string;
  cooking_time: number;
  difficulty: string;
  user: {
    username: string;
    profile_picture_url: string;
  };
}

interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StyledCardMedia = styled(CardMedia)({
  height: 200,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const Home: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipesRes = await axios.get(`${process.env.REACT_APP_API_URL}/recipes?limit=6`);
        
        const formattedRecipes = recipesRes.data.recipes.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description || '',
          image_url: recipe.images && recipe.images.length > 0 
            ? `${process.env.REACT_APP_UPLOAD_URL}${recipe.images[0].image_url}`
            : 'https://via.placeholder.com/300x200?text=No+Image',
          cooking_time: recipe.cooking_time || 0,
          difficulty: recipe.difficulty || 'Medium',
          user: {
            username: recipe.username || 'Anonymous',
            profile_picture_url: recipe.profile_picture_url || ''
          }
        }));
        
        setRecipes(formattedRecipes);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Recipe Manager
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover, create, and share your favorite recipes
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Latest Recipes" />
          <Tab label="Popular Recipes" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={4}>
          {recipes.map((recipe) => (
            <Grid item key={recipe.id} xs={12} sm={6} md={4}>
              <StyledCard>
                <StyledCardMedia
                  image={recipe.image_url}
                  title={recipe.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {recipe.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {recipe.description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={`${recipe.cooking_time} mins`}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      size="small"
                      label={recipe.difficulty}
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      By {recipe.user.username}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    component={RouterLink}
                    to={`/recipes/${recipe.id}`}
                    variant="contained"
                    fullWidth
                  >
                    View Recipe
                  </Button>
                </Box>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={4}>
          {recipes.map((recipe) => (
            <Grid item key={recipe.id} xs={12} sm={6} md={4}>
              <StyledCard>
                <StyledCardMedia
                  image={recipe.image_url}
                  title={recipe.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h2">
                    {recipe.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recipe.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    component={RouterLink}
                    to={`/recipes/${recipe.id}`}
                    variant="contained"
                    fullWidth
                  >
                    View Recipe
                  </Button>
                </Box>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home; 