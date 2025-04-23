def index(request):
    # Is this really pointing at "index_view.html"?
    return render(request, 'index_view.html', context) 