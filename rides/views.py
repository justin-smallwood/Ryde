from django.shortcuts import render
from django.db.models import Q
import os
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django import forms

from .models import Person

# relative import of forms
from .forms import RideForm

# Add the RideForm class
class RideForm(forms.Form):
    destination_city = forms.CharField(required=False)
    destination_state = forms.CharField(required=False)

# Create your views here.


def index(request):
    form = RideForm(request.GET)
    people = []
    inputExists = False

    # Load from fixtures directory with absolute path
    json_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'riders.json')
    
    try:
        with open(json_path, 'r') as file:
            riders_data = json.load(file)
            riders = [item['fields'] for item in riders_data]
            
            # Sort riders by date in descending order
            riders.sort(key=lambda x: x['date'], reverse=True)
            
            if request.GET:
                inputExists = True
                destination_city = request.GET.get('destination_city', '').strip().lower()
                destination_state = request.GET.get('destination_state', '').strip().lower()
                
                matching_riders = []
                
                # Search if either city or state is entered
                if destination_city or destination_state:
                    for rider in riders:
                        rider_city = rider['destination_city'].lower()
                        rider_state = rider['destination_state'].lower()
                        
                        # Match both city and state if both are provided
                        if destination_city and destination_state:
                            if destination_city in rider_city and destination_state in rider_state:
                                matching_riders.append(rider)
                        # Match only city if only city is provided
                        elif destination_city and destination_city in rider_city:
                            matching_riders.append(rider)
                        # Match only state if only state is provided
                        elif destination_state and destination_state in rider_state:
                            matching_riders.append(rider)
                
                people = matching_riders
    
    except FileNotFoundError:
        print(f"File not found at: {json_path}")
        riders = []
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        riders = []
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        riders = []

    context = {
        'form': form,
        'people': people,
        'inputExists': inputExists,
        'no_results': inputExists and len(people) == 0
    }
    return render(request, 'index_view.html', context)

def founders(request):
    return render(request, 'founders.html')

def story(request):
    return render(request, 'story.html')

def help(request):
    return render(request, 'help.html')

def intro(request):
    return render(request, 'intro.html')

def add_ride(request):
    return render(request, 'add_ride.html')

def search_users(request):
    """
    Renders the Search Users page and tells the user
    if the exact first+last name combo is found or not.
    """
    # 1) Pull & trim GET params
    first = request.GET.get('first_name', '').strip()
    last  = request.GET.get('last_name', '').strip()
    inputExists = bool(request.GET)

    # 2) Build context
    context = {
        'inputExists': inputExists,
        'first_name': first,
        'last_name': last,
    }

    if inputExists:
        try:
            # 1) require both names
            if not first or not last:
                raise ValueError('Please enter both first and last name.')

            # 2) build an absolute path to your fixture file
            json_path = os.path.join(
                settings.BASE_DIR, 'rides', 'fixtures', 'riders.json'
            )

            # 3) load & parse the JSON
            with open(json_path, 'r') as f:
                riders_data = json.load(f)

            # 4) exact, case-insensitive match
            found = any(
                r['fields']['first_name'].lower() == first.lower() and
                r['fields']['last_name'].lower()  == last.lower()
                for r in riders_data
            )
            context['user_exists'] = found

        except (ValueError, FileNotFoundError, json.JSONDecodeError) as e:
            # user-facing errors: missing input, file not found, bad JSON
            context['error_msg'] = str(e)
        except Exception as e:
            # catch-all (so nothing ever 500s)
            context['error_msg'] = f"Unexpected error: {e}"

    return render(request, 'search_users.html', context)

@csrf_exempt
def check_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        search_name = data.get('name', '').lower()
        
        try:
            with open('riders.json', 'r') as file:
                riders = json.load(file)
            
            # Check if the name exists in riders.json
            for rider in riders:
                full_name = f"{rider['first_name']} {rider['last_name']}".lower()
                if search_name in full_name:
                    return JsonResponse({'exists': True})
            
            return JsonResponse({'exists': False})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def index_view(request):
    """
    Renders the Find‑a‑Ride form, validates that both 
    city and state are provided, and then runs the search.
    """
    # Grab & trim GET params
    destination_city  = request.GET.get('destination_city', '').strip()
    destination_state = request.GET.get('destination_state', '').strip()
    inputExists       = bool(request.GET)  # did the user submit the form?

    # Base context
    context = {
        'inputExists': inputExists,
    }

    if inputExists:
        # 1) Validation: both fields must be non‑empty
        if not destination_city or not destination_state:
            context['error_msg'] = 'Please enter both a city and a state.'
        else:
            # 2) Perform the actual lookup
            people = Person.objects.filter(
                destination_city__iexact=destination_city,
                destination_state__iexact=destination_state
            )
            context['people']     = people
            context['no_results'] = not people

    return render(request, 'index_view.html', context)
