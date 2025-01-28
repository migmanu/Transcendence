from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView, FriendRequestView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name= 'profile'), #for seeing, editing user data and deleting accout & use query params for specification?
    path('friend-request', FriendRequestView.as_view(), name='friend-request'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
]
