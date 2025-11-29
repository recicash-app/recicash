import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, CardMedia, Typography, CardActionArea } from "@mui/material";
import { styled } from '@mui/system';
import FullScreenOverlay from '@shared/ui/FullScreenOverlay';

function PostCard({ post }) {

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

    const [openPost, setOpenPost] = React.useState(false);

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
                Ultima atualização: {new Date(post.last_edition_date).toLocaleDateString()}
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
                            {post.title}
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

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://api.docker.localhost:81/api/v1/posts/');
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

    if (loading) {
        return <Typography>Carregando posts...</Typography>;
    }

    return (
        <div>
            <Grid container spacing={3}>
                {posts.map((post) => (
                    <Grid item key={post.id}>
                        <PostCard post={post} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default BlogPage;