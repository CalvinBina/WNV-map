//Initialize function for google map api-JS
function initialize() {
    var year = '2015';
    var species = 'Culex_Tarsalis';

    // Populate the counties dropdowns
    var c1_elem = document.getElementById("countyOne");
    var c2_elem = document.getElementById("countyTwo");
    var c3_elem = document.getElementById("countyThree");
    var countyElements = [c1_elem, c2_elem, c3_elem];
    for (var c = 0; c < COUNTIES.length; c++) {
        for (var f = 0; f < countyElements.length; f++) {
            var opt = document.createElement("option");
            opt.innerHTML = COUNTIES[c];
            opt.value = COUNTIES[c];
            countyElements[f].appendChild(opt);
        }
    }

    // Set up map
    google.maps.visualRefresh = true;
    var map = new google.maps.Map(document.getElementById('nd-map'), {
        center: new google.maps.LatLng(47.48302099252042, -100.40016706835941),
        zoom: 7,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
    });

    // Set up fusion tables layer
    var layer = new google.maps.FusionTablesLayer();
    updateLayerQuery(layer, year);
    layer.setMap(map);

    // Create legend, style the polygons, draw charts
    createLegend(map, year, species);
    styleLayerBySpecies(layer, year, species);
    styleMap(map);
    updateVis();

    google.maps.event.addListener(layer, 'click', function(e) {
        // Update the graph
        var county = e.row['Counties'].value;
        var county_element = document.getElementById('countyOne');
        county_element.value = county;
        updateVis();

        // do a synchronous call to get location data
        var sql = "SELECT " + species + ", Location FROM 1ERyLhkU4tx1_bbaU_7_z0Lh5XELJw2xUa1IeD3uD WHERE Counties = '" + county + "' AND Data = 'Location' AND Year = '" + year + "'";
        var key = "AIzaSyBE0auVG-OhNhm6ySNuftYtZUEAfIakxHU";
        sql = encodeURIComponent(sql);
        sql = sql.replace(/'/g, "%27");
        var built_url = "https://www.googleapis.com/fusiontables/v2/query?sql=" + sql + "&key=" + key;
        var window_html = "";
        $.ajax({ 
            type: "GET",
            async: false,
            success: function(result) {
                var built_html = "";
                for (row in result.rows) {
                    built_html = built_html + "<p>" + result.rows[row][1] + ": " + result.rows[row][0] + "</p>";
                }
                window_html = built_html;
            },
            url: built_url
        });

        // Apply location data html to popup window
        e.infoWindowHtml = window_html;
    });
    //This is something to do with loading the google map by element... addDomListener
    google.maps.event.addDomListener(document.getElementById('year'), 'change', function() {
        year = this.value;
        updateLayerQuery(layer, year);
        styleLayerBySpecies(layer, year, species);
        updateLegend(year, species);
    });

    google.maps.event.addDomListener(document.getElementById('countyOne'), 'change', function() {
        var county = this.value;
        updateVis();
    });

    google.maps.event.addDomListener(document.getElementById('countyTwo'), 'change', function() {
        var county = this.value;
        updateVis();
    });

    google.maps.event.addDomListener(document.getElementById('countyThree'), 'change', function() {
        var county = this.value;
        updateVis();
    });

    google.maps.event.addDomListener(document.getElementById('species'), 'change', function() {
        species = this.value;
        styleLayerBySpecies(layer, year, species);
        updateLegend(year, species);
        updateVis();
    });

    google.maps.event.addDomListener(document.getElementById('entire_state'), 'change', function() {
        updateLayerQuery(layer, year);
    });
} //End of the initialize function (initializes and reinitializes google map

function updateLayerQuery(layer, year) {
    // Where clause for year and record type
    var where = "col13\x3e\x3e0 \x3d \x27Jan 1, " + year + "\x27 and col14\x3e\x3e0 \x3d \x27Total\x27";
    var checked = document.getElementById('entire_state').checked;
    if (!checked) {
        var county1 = document.getElementById('countyOne').value;
        var county2 = document.getElementById('countyTwo').value;
        var county3 = document.getElementById('countyThree').value;
        // Where clause for limiting records returned to counties chosen for visualizations
        where = where + "and col0\x3e\x3e0 in (\x27" + county1 + "\x27, \x27" + county2 + "\x27, \x27" + county3 + "\x27)";
    }
    layer.setOptions({
        query: {
            select: 'geometry',
            from: '1ERyLhkU4tx1_bbaU_7_z0Lh5XELJw2xUa1IeD3uD',
            where: where
        }
    });
    // synchronous call to update max values for styling
    var sql = "SELECT MAXIMUM(tmale), MAXIMUM(Anopheles), MAXIMUM(Aedes), MAXIMUM(Aedes_vexans), MAXIMUM(Culex), MAXIMUM(Culex_Tarsalis), MAXIMUM(Culex_salinarius), MAXIMUM(Culiseta), MAXIMUM(Other), MAXIMUM(tfemale), MAXIMUM(Total_Mosquitoes) FROM 1ERyLhkU4tx1_bbaU_7_z0Lh5XELJw2xUa1IeD3uD WHERE Data = 'Total' AND Year = 'Jan 1, " + year + "'";
    var key = "AIzaSyBE0auVG-OhNhm6ySNuftYtZUEAfIakxHU";
    sql = encodeURIComponent(sql);
    sql = sql.replace(/'/g, "%27");
    var built_url = "https://www.googleapis.com/fusiontables/v2/query?sql=" + sql + "&key=" + key;
    $.ajax({ 
        type: "GET",
        async: false,
        success: function(result) {
            var count = 0;
            for (max in result.rows[0]) {
                var col_name = result.columns[count].replace("MAXIMUM(","").replace(")","");
                LAYER_STYLES[col_name].max = parseInt(result.rows[0][max]) + 1;
                count = count + 1;
            }
        },
        url: built_url
    });
}

function createLegend(map, year, species) {
    var legendWrapper = document.createElement('div');
    legendWrapper.id = 'legendWrapper';
    legendWrapper.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legendWrapper);
    legendContent(legendWrapper, year, species);
}

function legendContent(legendWrapper, year, species) {
    var legend = document.createElement('div');
    legend.id = 'legend';

    var title = document.createElement('p');
    var species_tag = document.getElementById('species');
    var species_text = species_tag.options[species_tag.selectedIndex].text;
    title.innerHTML = year + ' ' + species_text + ' Trap Counts';
    legend.appendChild(title);

    var layerStyle = LAYER_STYLES[species];
    var colors = layerStyle.colors;
    var minNum = layerStyle.min;
    var maxNum = layerStyle.max;
    var step = Math.floor((maxNum - minNum) / colors.length) + 1;
    for (var i = 0; i < colors.length; i++) {
        var legendItem = document.createElement('div');

        var color = document.createElement('div');
        color.setAttribute('class', 'legendColor');
        color.style.backgroundColor = colors[i];
        color.style.opacity = 0.8;
        legendItem.appendChild(color);

        var newMin = minNum + step * i;
        var newMax = newMin + step;
        var minMax = document.createElement('span');
        minMax.innerHTML = newMin + ' - ' + newMax;
        legendItem.appendChild(minMax);

        legend.appendChild(legendItem);
    }

    legendWrapper.appendChild(legend);
}

function updateLegend(year, species) {
    var legendWrapper = document.getElementById('legendWrapper');
    var legend = document.getElementById('legend');
    legendWrapper.removeChild(legend);
    legendContent(legendWrapper, year, species);
}

function styleLayerBySpecies(layer, year, species) {
    var layerStyle = LAYER_STYLES[species];
    var colors = layerStyle.colors;
    var minNum = layerStyle.min;
    var maxNum = layerStyle.max;
    var step = (maxNum - minNum) / colors.length;

    var styles = new Array();
    for (var i = 0; i < colors.length; i++) {
        var newMin = minNum + step * i;
        styles.push({
            where: generateWhere(newMin, year, species),
            polygonOptions: {
                fillColor: colors[i],
                fillOpacity: 0.6
            }
        });
    }
    layer.set('styles', styles);
}

function generateWhere(minNum, year, species) {
    var whereClause = new Array();
    whereClause.push("Year = 'Jan 1, ");
    whereClause.push(year);
    whereClause.push("' AND '");
    whereClause.push(species);
    whereClause.push("' >= ");
    whereClause.push(minNum);
    return whereClause.join('');
}

function styleMap(map) {
    var style = [{
        featureType: 'all',
        stylers: [{
            saturation: -99
        }]
        }, {
        featureType: 'poi',
        stylers: [{
            visibility: 'off'
        }]
        }, {
        featureType: 'road',
        stylers: [{
            visibility: 'off'
        }]
    }];

    var styledMapType = new google.maps.StyledMapType(style, {
        map: map,
        name: 'Styled Map'
    });
    map.mapTypes.set('map-style', styledMapType);
    map.setMapTypeId('map-style');
}

function drawVisualization(county, species, container) {
    var sql = "SELECT " + species + ", Year FROM 1ERyLhkU4tx1_bbaU_7_z0Lh5XELJw2xUa1IeD3uD WHERE Counties = '" + county + "' AND Data = 'Total'";
    var key = "AIzaSyBE0auVG-OhNhm6ySNuftYtZUEAfIakxHU";
    sql = encodeURIComponent(sql);
    sql = sql.replace(/'/g, "%27");
    var built_url = "https://www.googleapis.com/fusiontables/v2/query?sql=" + sql + "&key=" + key;

    $.ajax({ 
        type: "GET",
        success: function(result) {
            drawChart(result, container);
        },
        url: built_url
    });
}

function drawChart(json, container) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    data.addColumn('number', 'Trap Counts');
    var row = 0;
    var indx = 0;
    for (row in json.rows) {
        indx = data.addRow();
        data.setCell(indx, 0, json.rows[row][1]);
        data.setCell(indx, 1, json.rows[row][0]);
    }
    if (container == "visualization1") {
        var county = document.getElementById('countyOne').value;
    } else if (container == "visualization2") {
        var county = document.getElementById('countyTwo').value;
    } else {
        var county = document.getElementById('countyThree').value;
    }
    var species_tag = document.getElementById('species');
    var species_text = species_tag.options[species_tag.selectedIndex].text;
    var title = county + " " + species_text + " Trap Counts by Year";
    google.visualization.drawChart({
        containerId: container,
        dataTable: data,
        chartType: "ColumnChart",
        options: {
            legend: 'none',
            title: title,
            height: 350,
            width: 370
        }
    });
}

function updateVis() {
    var targets = ["visualization1", "visualization2", "visualization3"];
    var elements = ["countyOne", "countyTwo", "countyThree"];
    for (i = 0; i < targets.length; i++) {
        var county = document.getElementById(elements[i]).value;
        var species = document.getElementById("species").value;
        drawVisualization(county, species, targets[i]);
    }
}
