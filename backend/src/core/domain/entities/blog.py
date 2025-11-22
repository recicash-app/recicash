from django.db import models
from .users import User


class PostBlog(models.Model):
    """
    Blog post written by an administrator user.
    """
    post_id = models.BigAutoField(primary_key=True)

    author_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        db_column='AUTHOR_ID',
        related_name='author_user'
    )

    title = models.CharField(max_length=200)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    last_edition_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'POST_BLOG'
        verbose_name = 'post'
        verbose_name_plural = 'posts'

    def __str__(self):
        return f"Post {self.post_id} - {self.title}"
    

class PostImage(models.Model):
    """
    Image associated with a blog post.
    """
    post = models.ForeignKey(
        PostBlog,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='blog_images/')

    class Meta:
        db_table = 'POST_IMAGE'
        verbose_name = 'post_image'
        verbose_name_plural = 'post_images'

    def __str__(self):
        return f"PostImage of {self.post.title}"
