import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  profile_picture_url: string;
  created_at: string;
  recipes_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string;
  cooking_time: number;
  difficulty_level: string;
  created_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userRes, recipesRes, followersRes, followingRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/users/${id}`),
          axios.get(`${process.env.REACT_APP_API_URL}/users/${id}/recipes`),
          axios.get(`${process.env.REACT_APP_API_URL}/users/${id}/followers`),
          axios.get(`${process.env.REACT_APP_API_URL}/users/${id}/following`),
        ]);

        setUser(userRes.data);
        setRecipes(recipesRes.data);
        setFollowers(followersRes.data);
        setFollowing(followingRes.data);
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleFollow = async () => {
    try {
      if (user?.is_following) {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/users/follow/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/users/follow/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              is_following: !prev.is_following,
              followers_count: prev.is_following
                ? prev.followers_count - 1
                : prev.followers_count + 1,
            }
          : null
      );
    } catch (err) {
      setError('Failed to update follow status. Please try again.');
    }
  };

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

  if (error || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'User not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={user.profile_picture_url}
                alt={user.username}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {user.username}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {user.bio}
              </Typography>
              {currentUser && currentUser.id !== user.id && (
                <Button
                  variant={user.is_following ? 'outlined' : 'contained'}
                  startIcon={
                    user.is_following ? <PersonRemoveIcon /> : <PersonAddIcon />
                  }
                  onClick={handleFollow}
                  sx={{ mb: 2 }}
                >
                  {user.is_following ? 'Unfollow' : 'Follow'}
                </Button>
              )}
              {currentUser && currentUser.id === user.id && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/profile/edit')}
                  sx={{ mb: 2 }}
                >
                  Edit Profile
                </Button>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{user.recipes_count}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recipes
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{user.followers_count}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Followers
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{user.following_count}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Following
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Recipes" />
                <Tab label="Followers" />
                <Tab label="Following" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {recipes.map((recipe) => (
                  <Grid item key={recipe.id} xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={recipe.image_url}
                        alt={recipe.title}
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
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Chip
                            size="small"
                            label={`${recipe.cooking_time} mins`}
                          />
                          <Chip
                            size="small"
                            label={recipe.difficulty_level}
                            color="primary"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                {followers.map((follower) => (
                  <Grid item key={follower.id} xs={12} sm={6}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/profile/${follower.id}`)}
                    >
                      <Avatar
                        src={follower.profile_picture_url}
                        alt={follower.username}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {follower.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {follower.recipes_count} recipes
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                {following.map((followed) => (
                  <Grid item key={followed.id} xs={12} sm={6}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/profile/${followed.id}`)}
                    >
                      <Avatar
                        src={followed.profile_picture_url}
                        alt={followed.username}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {followed.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {followed.recipes_count} recipes
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 