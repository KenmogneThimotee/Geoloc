from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Client(TenantMixin):
    schema_name = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    logitude = models.DecimalField(max_digits=100, decimal_places=2)
    lattitude = models.DecimalField(max_digits=100, decimal_places=2)
    ville = models.CharField(max_length=100)


    def __str__(self):
        return self.schema_name


class Domain(DomainMixin):
    pass