import json
import requests
import pandas as pd
import csv



# generate days in the given year for response
def generate_days(year):
    startdate = year + "0101"
    enddate = year + "1231"
    # startdate = datetime.datetime(2016,1,1)
    # enddate = datetime.datetime(2016,12,31)
    days_list = pd.date_range(startdate, enddate).tolist()
    #days_list.apply
    days_list = [(lambda x:x.date().strftime('%Y%m%d'))(x) for x in days_list]
    start_days = [(lambda x:x+"0000")(x) for x in days_list]
    end_days = [(lambda x:x+"2359")(x) for x in days_list]
    return start_days, end_days


# generate api requests and store the data in a csv file
def generate_requests(API_ENDPOINT, API_KEY, data, year="2017"):
    start_days, end_days = generate_days(year)
    download_dir = "data.csv"
    headers = ["date", "minimum", "median", "maximum"]
    with open(download_dir, "w", newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        for startdate, enddate in zip(start_days, end_days):
            # print('{},{}'.format(startdate, enddate))
            data['start'], data['end']= startdate, enddate
            response = requests.post(url=API_ENDPOINT, data=data, timeout=20)
            response_data=response.json()["STATION"][0]["STATISTICS"]["air_temp_set_1"]
            row = [startdate[:8], response_data["minimum"],
                   response_data["median"], response_data["maximum"]] 
                   #response_data["average"], response_data["count"], response_data["standard_deviation"]]
            writer.writerow(row)
            # print(json.dumps(response_data, indent=2))


if __name__ == '__main__':
    # defining the api-endpoint
    API_ENDPOINT = "https://api.mesowest.net/v2/stations/statistics"
    # your API key here
    API_KEY = "1234567890"
    # data to be sent to the api
    data = {'token': API_KEY, 'vars': 'air_temp', 'type': 'all', 'stid': 'wbb'}

    generate_requests(API_ENDPOINT=API_ENDPOINT, API_KEY=API_KEY, data=data, year="2017")


