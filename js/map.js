/* This is the script to create ArcGIS map*/
require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/Color",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "esri/graphic",
        "dojo/domReady!",
        "dojo/ready",
        "dojo/on",
    ],
    function(
        Map,
        FeatureLayer,
        SimpleFillSymbol,
        SimpleLineSymbol,
        SimpleRenderer,
        Color,
        Query,
        QueryTask,
        Graphic,
        ready,
        on
    ) {

        var map = new Map("map", {
            basemap: "dark-gray-vector",
            center: [-83.052738,42.335301],
            zoom: 16
        });

        /****************************************************************
         * Add feature layer - A FeatureLayer at minimum should point
         * to a URL to a feature service or point to a feature collection
         * object.
         ***************************************************************/

            // Carbon storage of trees in Warren Wilson College.
        /*var ORBIS = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/ORBIS_BIZ/FeatureServer/0",{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ['*'],
                opacity: 0.2,
                visible: false,
                orderByFields: ["Field1"]
            });*/
        /*var BUILDING = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/BUILDING_BIZ/FeatureServer/0",{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ['*'],
                opacity: 0.2,
                visible: false,
                orderByFields: ["FID"]
            });*/
        var parcel_fieldmapping = {
            /* address+ zipcode */
            address: 'Address',
            BIZ: 'BIZ',
            parcelnum: 'Parcel Number',
            related_pa: 'Related Parcel',
            /* owner info */
            owner1: 'Owner Information',
            owner_stre: 'Owner Address',
            /* tax info */
            taxable_st: 'Tax Information',
            taxable_va: 'Taxable Values',
            taxpayer: 'Tax Payer',
            zoning: 'Zoning Code',
            council_di: 'Council District',
            nez: 'NEZ',
            property_c: 'Property Class',
            sqft: 'Square Feet',
            frontage: 'Frontage',
            legaldesc: 'Legal Description'
        };
        load_parcel = function(attributes) {
            $("#parcel_tablebody").empty();
            for (attribute in parcel_fieldmapping) {
                if (attribute == 'address') {
                    var field_name = parcel_fieldmapping[attribute];
                    var value = attributes[attribute] + ', ' + attributes['zip_code'];
                    $("#parcel_tablebody").append(
                        '<tr>' +
                        '<td class="text-left">' + field_name + '</td>' +
                        '<td class="text-right">' + value + '</td>' +
                        '</tr>');
                } else if (attribute == 'owner_stre') {
                    var field_name = parcel_fieldmapping[attribute];
                    var value = attributes['owner_stre']+attributes['owner_city']+attributes['owner_stat']+attributes['owner_zip'];
                    $("#parcel_tablebody").append(
                        '<tr>' +
                        '<td class="text-left">' + field_name + '</td>' +
                        '<td class="text-right">' + value + '</td>' +
                        '</tr>');
                } else {
                    var field_name = parcel_fieldmapping[attribute];
                    var value = attributes[attribute];
                    $("#parcel_tablebody").append(
                        '<tr>' +
                        '<td class="text-left">' + field_name + '</td>' +
                        '<td class="text-right">' + value + '</td>' +
                        '</tr>')
                }
            }
        };
        var business_fieldmapping = {
            Company_na: 'Company Name',
            Street__no: 'Address',
            City: 'City',
            Last_avail: 'Last Available Year',
            NAICS_2018: 'NAICS Core Classification',
            NAICS_2020: 'NAICS Seconday Classification',
            NAICS_2022: 'NAICS Minor Classification',
            Consolidat: 'Consolidation CODE',
            Type_: 'Type of Address',
            Telephone_: 'Phone Number'
        };
        load_business = function(parcelnum){
            var  business_query;
            business_query = new Query();
            business_query.outFields = ["*"];
            business_query.where =  "parcelnum='"+parcelnum+"'";
            var business_num = 0;
            orbis_querytask.execute(business_query, function (results) {
                if (results['features'].length === 0) {
                    $("#business_tablebody").append('<tr class="table-dark">' +
                        '<td class="text-left text-danger">Business Not Found</td>' +
                        '<td class="text-right text-danger"></td>' +
                        '</tr>')
                } else {
                    results['features'].forEach(function (feature) {
                        var attributes = feature['attributes'];
                        business_num += 1;
                        $("#business_tablebody").append(
                            '<tr class="table-dark">' +
                            '<td colspan="2">' +'<a class="text text-info" data-toggle="collapse" ' +
                            'href="#business'+business_num+'"  aria-controls="business'+business_num+'">'+
                            feature['attributes']['Company_na'] + '</a></td>' +
                            '</tr>'+
                            '</div>');
                        $("#business_tablebody").append(
                            '<div class="collapse" id="business'+business_num+'">'+
                            '</div>'
                        );
                        for (attribute in business_fieldmapping) {
                            if (attribute == 'Street__no') {
                                var field_name = business_fieldmapping[attribute];
                                var value = attributes[attribute] + ', ' + attributes['Street___1'];
                            } else if (attribute == 'City') {
                                var field_name = business_fieldmapping[attribute];
                                var value = attributes[attribute] + ', ' + attributes['Postcode'];
                            } else if (attribute == 'Telephone_') {
                                var field_name = business_fieldmapping[attribute];
                                var value = attributes[attribute] + ', ' + attributes['E_mail_add'];
                            } else {
                                var field_name = business_fieldmapping[attribute];
                                var value = attributes[attribute];
                            }
                            $("#business"+business_num).append(
                                '<tr>' +
                                '<td class="text-left">' + field_name + '</td>' +
                                '<td class="text-right">' + value + '</td>' +
                                '</tr>')
                        }
                    });
                }
            });
        };
        var building_fieldmapping = {
            /* address+ zipcode */
            AKA: 'Building Name',
            APN: 'Parcel Number',
            BUILDING_I: 'Building ID',
            BUILD_TYPE: 'Building Type',
            YEAR_BUILT: 'Built Year',
            CONDITION: 'Condition',
            HOUSING_UN: 'Housing Units',
            STORIES: 'Stories',
            MEDIAN_HGT: 'Median Height',
            RES_SQFT: 'Residential Area',
            NONRES_SQF: 'NOT-Residential Area'
        };
        load_building= function(parcelnum) {
            var building_query;
            building_query = new Query();
            building_query.outFields = ["*"];
            building_query.where = "APN='" + parcelnum + "'";
            $("#building_tablebody").empty();
            building_querytask.execute(building_query, function (results) {
                if (results['features'].length === 0) {
                    $("#building_tablebody").append('<tr class="table-dark">' +
                        '<td class="text-left text-danger">Building Not Found</td>' +
                        '<td class="text-right text-danger"></td>' +
                        '</tr>')
                } else {
                    results['features'].forEach(function (feature) {
                        var attributes = feature['attributes'];
                        for (attribute in building_fieldmapping) {
                            var field_name = building_fieldmapping[attribute];
                            var value = attributes[attribute];
                            $("#building_tablebody").append(
                                '<tr>' +
                                '<td class="text-left">' + field_name + '</td>' +
                                '<td class="text-right">' + value + '</td>' +
                                '</tr>')

                        }
                    });
                }
            });
        };
        select_parcel = function(evt) {
            var idProperty = PARCEL.objectIdField;
            var feature, featureId, query;

            if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes[idProperty]) {
                feature = evt.graphic;
                featureId = feature.attributes[idProperty];

                query = new Query();
                query.returnGeometry = false;
                query.objectIds = [featureId];
                query.where = "1=1";

                PARCEL.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (feature) {
                    var attribute = feature[0]["attributes"];
                    var parcelnum = feature[0]["attributes"]["parcelnum"];
                    $("#business_tablebody").empty();
                    load_parcel(attribute);
                    load_business(parcelnum);
                    load_building(parcelnum);
                });
            }
        };
        select_parcel_by_address = function(address) {
            var query;
            query = new Query();
            query.returnGeometry = false;
            query.where = "address="+"'"+address['target']['value']+"'";
            console.log(query);

            PARCEL.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (feature) {
                var attribute = feature[0]["attributes"];
                var parcelnum = feature[0]["attributes"]["parcelnum"];
                $("#business_tablebody").empty();
                load_parcel(attribute);
                load_business(parcelnum);
                load_building(parcelnum);
            });

        };
        var orbis_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/ORBIS_BIZ/FeatureServer/0");
        var building_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/BUILDING_BIZ/FeatureServer/0");
        var parcel_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/May2018Parcels/FeatureServer/0");
        var PARCEL = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/May2018Parcels/FeatureServer/0",{
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            opacity: 0.8,
            visible: true,
            orderByFields: ["objectid"]
        });

        var address_list = [];
        address_query = new Query();
        address_query.returnGeometry = false;
        address_query.outFields = ['address'];
        address_query.where = "1=1";
        parcel_querytask.execute(address_query, function (results){
            results['features'].forEach(function (feature) {
                address_list.push(feature['attributes']['address'])
            });
        });
        console.log(address_list);

        // set selection symbol style
        var parcel_symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#adb2b8'));
        var renderer = new SimpleRenderer(parcel_symbol);
        PARCEL.setRenderer(renderer);
        // apply the selection symbol for the layer
        var selectionSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('lightgrey'), 2),
            new Color('red'));
        PARCEL.setSelectionSymbol(selectionSymbol);
        // setting click event, when click parcel, graphic will change, business
        // and building info will be retrieved
        PARCEL.on("click", select_parcel);
        // address change => select new parcel
        $(".inputAddress").change(select_parcel_by_address);
        // default show parcel info
        $("#parcel_detail").collapse('show');
        // add parcel vector to the map
        map.addLayer(PARCEL);
        // auto complete setting
        $(".inputAddress").autocomplete({
            source: address_list,
            autoFocus: true,
        });
    });
