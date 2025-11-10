import React from "react";
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

    return (
        <>
            <CardComponent>
                <InteractiveArea onClick={handleOpenPost}>
                    <CardImage component="img" height="10vh" image={post.image} />
                    <CardText>
                        <Typography gutterBottom component="div">
                            {post.title}
                        </Typography>
                    </CardText>
                </InteractiveArea>
            </CardComponent>
            {openPost && (
                <FullScreenOverlay open={openPost} onClose={handleClosePost} />
            )}
        </>
    );
}

function BlogPage() {
    var posts = [
        { id: 1, title: "Primeiro Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 2, title: "Segundo Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 3, title: "Terceiro Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 4, title: "Quarto Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 5, title: "Quinto Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 6, title: "Sexto Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 7, title: "Sétimo Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 8, title: "Oitavo Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 9, title: "Nono Post", image: "https://placehold.co/600x400/orange/white" },
        { id: 10, title: "Décimo Post", image: "https://placehold.co/600x400/orange/white" }
    ]
const [isOverlayOpen, setIsOverlayOpen] = React.useState(true);

const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
};

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