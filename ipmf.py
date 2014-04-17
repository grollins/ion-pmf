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
            db = MySQLdb.connect(unix_socket='/cloudsql/senpai-io:ion-pmf',
                                 user='root', db='iPMF')
        else:
            db = MySQLdb.connect(host='localhost', user='root', db='iPMF')

        cursor = db.cursor()
        cursor.execute(QUERY % (int(request.charge1), int(request.charge2),
                                float(request.sigma1), float(request.sigma2)))
        query_results = cursor.fetchall()
        distance = [row[0] for row in query_results]
        potential = [row[1] for row in query_results]
        return IonPmfResponse(distance=distance, potential=potential)

application = endpoints.api_server([IonPmfApiV1])
