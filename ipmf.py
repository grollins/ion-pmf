import endpoints
import MySQLdb
from os import getenv
from protorpc.messages import IntegerField, FloatField, Message
from protorpc.remote import Service


QUERY = "SELECT Distance, Potential FROM IonPMF WHERE charge1 = %d AND " \
        "charge2 = %d AND sigma1 = %.2f AND sigma2 = %.2f"


class IonPmfRequest(Message):
    charge1 = IntegerField(1, required=True)
    charge2 = IntegerField(2, required=True)
    sigma1 = FloatField(3, required=True)
    sigma2 = FloatField(4, required=True)


class IonPmfResponse(Message):
    distance = FloatField(1, repeated=True)
    potential = FloatField(2, repeated=True)


@endpoints.api(name='ionPmfApi', version='v1', description='REST API for iPMF')
class IonPmfApiV1(Service):

    @endpoints.method(IonPmfRequest, IonPmfResponse, path='pmf/1d',
                      http_method='GET', name='ipmf.get1d')
    def get1d(self, request):
        if (getenv('SERVER_SOFTWARE') and
            getenv('SERVER_SOFTWARE').startswith('Google App Engine/')):
            db = MySQLdb.connect(unix_socket='/cloudsql/ionpmf:ion-pmf',
                                 user='root', db='iPMF')
        else:
            db = MySQLdb.connect(host='localhost', user='root', db='iPMF')

        cursor = db.cursor()
        charge1 = request.charge1
        charge2 = request.charge2
        sigma1 = request.sigma1
        sigma2 = request.sigma2
        if charge1 < charge2:
            # 1,-1 is valid, but -1,1 is not.
            # swap the values if necessary
            charge1, charge2 = charge2, charge1
        elif charge1 == charge2 and sigma1 > sigma2:
            # we only store the upper right half
            # of the sigma matrices since they are
            # symmetric for +1,+1 and -1,-1 charge pairs
            sigma1, sigma2 = sigma2, sigma1

        cursor.execute(QUERY % (int(charge1), int(charge2),
                                float(sigma1), float(sigma2)))
        query_results = cursor.fetchall()
        distance = [float(row[0]) for row in query_results]
        potential = [float(row[1]) for row in query_results]
        return IonPmfResponse(distance=distance, potential=potential)

application = endpoints.api_server([IonPmfApiV1])
