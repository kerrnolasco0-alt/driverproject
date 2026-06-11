from django.urls import path

from api.views import GenerateTripView, DownloadPDFView


urlpatterns = [
    path(
        "generate-trip/",
        GenerateTripView.as_view(),
        name="generate-trip"
    ),
    path(
        "download-pdf/<str:filename>/",
        DownloadPDFView.as_view(),
        name="download-pdf"
    ),
]