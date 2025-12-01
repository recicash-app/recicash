import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, CardMedia, Typography, CardActionArea } from "@mui/material";
import { styled } from '@mui/system';
import FullScreenOverlay from '@shared/ui/FullScreenOverlay';
import { API_URL } from '@shared/utils/constants';

const CardComponent = styled(Card)({
  width: '300px',
  height: '184px',
  maxWidth: '25vw',
  maxHeight: '25vh',
  borderRadius: '0px',
  cursor: 'pointer',
      
  // removes the ripple effect on click
  '& .MuiTouchRipple-root': {
    display: 'none !important', 
  },
});

const InteractiveArea = CardComponent.withComponent(CardActionArea);

const CardImage = styled(CardMedia)({
  height: '65%',
  width: '100%',
  margin: 'auto',
  objectFit: 'cover',
});

const CardText = styled(CardContent)({
  height: '35%',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
});

function PostCard({ post }) {

  const [openPost, setOpenPost] = useState(false);

  const handleOpenPost = () => {
    setOpenPost(true);
  };

  const handleClosePost = () => {
    setOpenPost(false);
  };

  const postContent = (
    <div>
      <Typography variant="h4" gutterBottom>
        {post.title}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
                Publicação: {new Date(post.created_at).toLocaleDateString()} - 
                Última atualização: {new Date(post.last_edition_date).toLocaleDateString()}
      </Typography>
            
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '30px' }}>
        {post.images.map((image, index) => (
          <img
            key={index}
            src={image.image_url}
            alt={`${post.title} - ${index + 1}`}
            style={{ width: '40%', height: 'auto' }}
          />
        ))}
      </div>
      <Typography variant="body1" gutterBottom>
        {post.text}
      </Typography>
    </div>
  );

  return (
    <>
      <CardComponent>
        <InteractiveArea onClick={handleOpenPost}>
          <CardImage component="img" height="10vh" image={post.images[0].image_url} />
          <CardText>
            <Typography gutterBottom component="div">
              {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
            </Typography>
          </CardText>
        </InteractiveArea>
      </CardComponent>
      {openPost && (
        <FullScreenOverlay open={openPost} onClose={handleClosePost} children={postContent} />
      )}
    </>
  );
}

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/`);
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
    
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim() === '') {
        setFilteredPosts([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/posts/search/?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setFilteredPosts(data.results);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500); // debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  if (loading) {
    return <Typography>Carregando posts...</Typography>;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar posts..."
          style={{ padding: '10px', width: '30vw', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>
      <Grid container spacing={3} justifyContent="center">
        {(filteredPosts.length > 0 ? filteredPosts : posts).map((post) => (
          <Grid item key={post.id}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default BlogPage;