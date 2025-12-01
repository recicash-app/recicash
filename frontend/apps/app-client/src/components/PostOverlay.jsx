import FullScreenOverlay from '@shared/ui/FullScreenOverlay';
import PostLayout from '@shared/ui/PostLayout';

function PostOverlay({ data, open, onClose }) { 
  return (
    <FullScreenOverlay open={open} onClose={onClose}>
      <PostLayout data={data} />
    </FullScreenOverlay>
  )
}

export default PostOverlay;