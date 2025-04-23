from django.urls import path, include

from . import views

app_name = 'rides'
urlpatterns = [
    path('', views.intro, name='intro'),
    path('rides/', views.index, name='index'),
    path('founders/', views.founders, name='founders'),
    path('story/', views.story, name='story'),
    path('help/', views.help, name='help'),
    path('add_ride/', views.add_ride, name='add_ride'),
    path('search-users/', views.search_users, name='search_users'),
    path('check_user/', views.check_user, name='check_user'),
]
