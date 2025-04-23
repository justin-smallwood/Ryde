from django import forms


class RideForm(forms.Form):
  city = forms.CharField(label='City', max_length=64, required=False)
  state = forms.CharField(label='State', max_length=2, required=False)

