/* This is the script to create ArcGIS map*/
require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/renderers/ClassBreaksRenderer",
        "esri/Color",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "esri/graphic",
        "esri/dijit/Legend",
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
        ClassBreaksRenderer,
        Color,
        Query,
        QueryTask,
        Graphic,
        Legend,
        ready,
        on
) {
        token = 'ba3GxzBYsI8jbkBJufobRmQ_Fne6VthssHBYCKtrxjp50bopz-o1c6ojIggmAAOercSPMehX6YCHFrGOkyPWyi8kOO-gbnOJL3EbM5FQrvc1LG_GvCTXbdQO79X6IA7ro5tUW3fHE5WITul2IA8DT179bS4nWFbPweC36VC82WaSs7dBANfyVRIjjU-ZGzBcP0lgMQpivYELFzfywkRtoTwb9inxXwUcNjAvyVO_vKdeNZ_jNvVg6VljoKEZc8OW';
        var map = new Map("map", {
            basemap: "gray",
            center: [-83.057738, 42.332301],
            zoom: 15
        });

        /****************************************************************
         * Add feature layer - A FeatureLayer at minimum should point
         * to a URL to a feature service or point to a feature collection
         * object.
         ***************************************************************/

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
        load_parcel = function (attributes) {
            $("#parcel_tablebody").empty();
            $("#parcel_tablebody").append('<img class="image" alt="parcel image" src="#" style="display:none">');
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
                    var value = attributes['owner_stre'] + attributes['owner_city'] + attributes['owner_stat'] + attributes['owner_zip'];
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
            COMPANY_NA: 'Company Name',
            LOCATION_A: 'Address',
            FIRST_NAME: 'Contact Name',
            PHONE_NUMB: 'Phone Number',
            WEB_ADDRES: 'Website',
            ACTUAL_EMP: 'Actual Employee',
            SALES_VOLU: 'Sales Volume Range',
            PRIMARY__1: 'SCI Classification',
            NAICS_DESC: 'NAICS Classification',
            SQUARE_FOO: 'Office Area'
        };
        add_business_img = function (business_num) {
            $("#business_tablebody #business" + business_num + " img").each(function (index) {
                var display = $(this).css("display");
                var attr = $(this).attr("src");
                console.log(typeof attr);
                console.log(display);
                if (display === 'none') {
                    var building_img_url = $("#building_tablebody img").attr("src");
                    console.log(business_num + ': ' + building_img_url);
                    if (building_img_url != undefined) {
                        $(this).css("display", 'block');
                        $(this).attr("src", building_img_url);
                    }
                }
            });
        };
        load_business = function (parcelid) {
            var business_query;
            business_query = new Query();
            business_query.outFields = ["*"];
            business_query.where = "parcelobji=" + parcelid;
            var business_num = 0;
            infousa_querytask.execute(business_query, function (results) {
                if (results['features'].length === 0) {
                    $("#business_tablebody").append('<tr class="table-info">' +
                        '<td class="text-left text-danger">Business Not Found</td>' +
                        '<td class="text-right text-danger"></td>' +
                        '</tr>')
                } else {
                    results['features'].forEach(function (feature) {
                        var img_id, business_id;
                        img_url = '';
                        display = 'none';
                        var attributes = feature['attributes'];
                        business_id = attributes['OBJECTID_1'];
                        $.getJSON('https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/collector/FeatureServer/0/' + business_id + '/attachments' +
                            '?f=pjson&token=' + token, function (result) {
                            if (result['attachmentInfos'].length !== 0) {
                                img_id = result['attachmentInfos'][0]['id'];
                                img_url = "https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/0/" + business_id + "/attachments/" + img_id +
                                    "?token=" + token;
                                display = 'block';
                            } else {
                                img_url = '';
                                display = 'none';
                            }
                            business_num += 1;
                            $("#business_tablebody").append(
                                '<tr class="table-info">' +
                                '<td colspan="2">' + '<a class="text text-info" data-toggle="collapse" ' +
                                'href="#business' + business_num + '"  aria-controls="business' + business_num + '">' +
                                feature['attributes']['COMPANY_NA'] + '</a></td>' +
                                '</tr>' +
                                '</div>');
                            $("#business_tablebody").append(
                                '<div class="collapse" id="business' + business_num + '">' +
                                '<img class="image" src="' + img_url + '" alt="business image" style="display: ' + display + '">' +
                                '</div>'
                            );
                            for (attribute in business_fieldmapping) {
                                if (attribute == 'LOCATION_A') {
                                    var field_name = business_fieldmapping[attribute];
                                    var value = attributes[attribute] + ', ' + attributes['CITY'] + ' ' + attributes['STATE'] + ', ' + attributes['ZIP_CODE'];
                                } else if (attribute == 'FIRST_NAME') {
                                    var field_name = business_fieldmapping[attribute];
                                    var value = attributes[attribute] + ' ' + attributes['LAST_NAME'] + '-' + attributes['CONTACT_TI'];
                                } else if (attribute == 'PRIMARY__1') {
                                    var field_name = business_fieldmapping[attribute];
                                    var value = attributes[attribute] + '-' + attributes['SECONDARY1'] + '-' + attributes['SECONDAR_2'];
                                } else {
                                    var field_name = business_fieldmapping[attribute];
                                    var value = attributes[attribute];
                                }
                                $("#business" + business_num).append(
                                    '<tr>' +
                                    '<td class="text-left">' + field_name + '</td>' +
                                    '<td class="text-right">' + value + '</td>' +
                                    '</tr>')
                            }
                            setTimeout(add_business_img(business_num), 1000);
                        });
                    });
                }
            });
        };
        var building_fieldmapping = {
            /* address+ zipcode */
            AKA: 'Building Name',
            APN: 'Parcel Number',
            TotalBusinessSpace: 'Total Space',
            NonEmptySpace: 'Occupied Space',
            BUILD_TYPE: 'Building Type',
            YEAR_BUILT: 'Built Year',
            CONDITION: 'Condition',
            HOUSING_UN: 'Housing Units',
            STORIES: 'Stories',
            MEDIAN_HGT: 'Median Height',
            RES_SQFT: 'Residential Area',
            NONRES_SQF: 'NOT-Residential Area'
        };
        load_building = function (parcelnum) {
            var building_query;
            building_query = new Query();
            building_query.outFields = ["*"];
            building_query.where = "APN='" + parcelnum + "'";
            $("#building_tablebody").empty();
            building_querytask.execute(building_query, function (results) {
                if (results['features'].length === 0) {
                    $("#building_tablebody").append('<tr class="table-info">' +
                        '<td class="text-left text-danger">Building Not Found</td>' +
                        '<td class="text-right text-danger"></td>' +
                        '</tr>')
                } else {
                    var featrues = results['features'];
                    featrues.forEach(function (feature) {
                        display = 'none';
                        var building_id;
                        var attributes = feature['attributes'];
                        building_id = attributes['OBJECTID_12'];
                        $.getJSON('https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/collector/FeatureServer/1/' + building_id + '/attachments' +
                            '?f=pjson&token=' + token, function (result) {
                            var img_id, img_url;
                            if (result['attachmentInfos'].length !== 0) {
                                img_id = result['attachmentInfos'][0]['id'];
                                img_url = "https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/1/" + building_id + "/attachments/" + img_id +
                                    "?token=" + token;
                                display = 'block';
                            } else {
                                img_url = '';
                                display = 'none';
                            }
                            $("#building_tablebody").append(
                                '<img class="image" src="' + img_url + '" alt="building image" style="display: ' + display + '">'
                            );
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
                    });
                }
            });
        };
        select_parcel = function (evt) {
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
                    var parcelid = feature[0]["attributes"]["objectid"];
                    $("#business_tablebody").empty();
                    load_parcel(attribute);
                    load_business(parcelid);
                    load_building(parcelnum);
                });
            }
        };
        select_parcel_by_address = function (address) {
            var query;
            query = new Query();
            query.returnGeometry = false;
            var objectid = address_id_list[address['target']['value']];
            query.where = "OBJECTID_1=" + objectid;
            PARCEL.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (feature) {
                var attribute = feature[0]["attributes"];
                var parcelnum = feature[0]["attributes"]["parcelnum"];
                var parcelid = feature[0]["attributes"]["objectid"];
                $("#business_tablebody").empty();
                load_building(parcelnum);
                load_parcel(attribute);
                load_business(parcelid);
            });

        };
        var infousa_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/0");
        var building_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/1");
        var parcel_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/2");
        var PARCEL = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/2", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            opacity: 0.5,
            visible: true,
            orderByFields: ["objectid"]
        });
        var BUILIDNG = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/1",{
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: [],
            opacity: 0.8,
            visible: true
        });

        var address_id_list = [];
        var address_list = [];
        address_query = new Query();
        address_query.returnGeometry = false;
        address_query.outFields = ['OBJECTID_1', 'address'];
        address_query.where = "1=1";
        parcel_querytask.execute(address_query, function (results) {
            for (i = 0; i < results['features'].length; i++) {
                address_id_list[results['features'][i]['attributes']['address']] = results['features'][i]['attributes']['OBJECTID_1'];
                address_list.push(results['features'][i]['attributes']['address']);
            }
        });

        // set parcel symbol style
        var parcel_symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#c3c8ce'));
        var renderer = new SimpleRenderer(parcel_symbol);
        PARCEL.setRenderer(renderer);

        // set building symbol style
        var building_symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#393e44'));
        var building_renderer = new ClassBreaksRenderer(building_symbol, "NonEmptySpace");
        building_renderer.normalizationType = "TotalBusinessSpace";
        building_renderer.addBreak(0, 0, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#0036ff')));
        building_renderer.addBreak(0, 0.3, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#48a7ff')));
        building_renderer.addBreak(0.3, 0.6, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#af9ed6')));
        building_renderer.addBreak(0.6, 0.9, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#8862b8')));
        building_renderer.addBreak(0.9, 1, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#b7008b')));
        BUILIDNG.setRenderer(building_renderer);
        /*
        map.on("load", function(evt){
            var legend = new Legend({
                map: map,
                layerInfos: [{
                    layer: BUILIDNG,
                    title: "Occupancy Rate"
                }]
            }, "legendDiv");
            legend.startup();
        });*/

        // set the selection symbol for the parcel
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
        $("#building_detail").collapse('show');
        // add parcel and building vector to the map
        map.addLayer(BUILIDNG);
        map.addLayer(PARCEL);
        // auto complete setting
        $(".inputAddress").autocomplete({
            source: address_list,
            autoFocus: true,
        });
    });
