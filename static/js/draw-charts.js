function displayChart(container, chart_type, data, double_questions) {
    $("#" + container).empty();
    chart_type = chart_type.replace("-chart", "");

    var series_data = [];
    var drilldown_series = [];
    var duplicates = [];
    for (var item in data) {
        var serie = {};
        if (double_questions) {
            if (duplicates.indexOf(data[item]['type2']) == -1) {
                serie = getSerieJson(data, item, "type2");
                serie['drilldown'] = serie['name'];
                duplicates.push(data[item]['type2']);
                series_data.push(serie);
            } else {
                var index = series_data.map(function (d) {
                    return d['name'];
                }).indexOf(data[item]['type2']);
                series_data[index]['y'] += data[item]['count'];
            }
        } else {
            serie = getSerieJson(data, item, "type1");
            series_data.push(serie);
        }
    }


    var e = document.getElementById("main-indicator-select");
    var title = e.options[e.selectedIndex].text;

    if (double_questions) {

        var e2 = document.getElementById("disaggregate-select");
        title = e2.options[e2.selectedIndex].text;
        for (var element in series_data) {
            var drilldown_serie = {
                "name": series_data[element]["name"],
                "id": series_data[element]["name"],
                "data": []
            };
            for (var json in data) {
                if (data[json]['type2'] == series_data[element]['name']) {
                    drilldown_serie['data'].push([data[json]['type1'], data[json]['count']])
                }
            }
            drilldown_series.push(drilldown_serie);
        }
    }

    sortResults(series_data, "y", false);

    Highcharts.setOptions({
        lang: {
            drillUpText: 'Back'
        }
    });

    var chart_plot_options = {
        series: {
            dataLabels: {
                enabled: true,
                formatter: function () {
                    var name = this.point.name;
                    var value = this.point.y;
                    var formatter;
                    if (chart_type == "pie") {
                        var percentage = this.point.percentage.toString();
                        formatter = name.length > 30 ? name.substring(0, 30) + '...:' + percentage.substring(0, 4) + "%" : name + ':' + percentage.substring(0, 4) + "%";
                    } else {
                        formatter = name.length > 30 ? name.substring(0, 30) + '...:' + value + "%" : name + ':' + value + "%"
                    }
                    return formatter;
                }
            }
        }
    };
    if (window.screen.width < 768) {
        chart_plot_options['series']['dataLabels']["enabled"] = false;
    }

    $('#' + container).highcharts({
        chart: {
            type: chart_type,
            style: {
                fontFamily: 'Exo'
            }
        },
        title: {
            text: title
        },
        xAxis: {
            type: 'category'
        },
        plotOptions: chart_plot_options,
        tooltip: {
            headerFormat: '<span style="font-size:15px"></span>',
            pointFormat: '<span style="font-size: 13px; color:{point.color}">{point.name}</span>: <b style="font-size: 13px; font-weight: bolder;">{point.y} organizations</b><br/>'
        },
        series: [{
            name: 'Series',
            colorByPoint: true,
            data: series_data
        }],
        drilldown: {
            drillUpButton: {
                position: {
                    align: 'right'
                }
            },
            series: drilldown_series
        }
    });
}

function getSerieJson(data, item, type) {
    var name = data[item][type];
    var count = data[item]['count'];
    return {
        "name": name,
        "y": count
    };
}

function sortResults(json_array, prop, asc) {
    return json_array.sort(function (a, b) {
        if (asc) {
            return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        } else {
            return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
        }
    });
}