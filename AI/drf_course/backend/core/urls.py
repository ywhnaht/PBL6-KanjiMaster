from django.urls import path
from . import views

urlpatterns = [
    path('recognise/', views.recognize_strokes),
    path('kanji_compounds/', views.kanji_compounds),
]
