/***********************************************************************
This is the script for the business, building and parcel web application

Credit: Tian Xie (intern in Downtown Detroit Partnership)
Contact Email: tian.xie@downtowndetroit.org or tianxie@umich.edu

Script Summary:
    This script pull out layers hosted by ArcGIS and visualize them using
ArcGIS Javascript API. For complete documentation for this API, please go
to https://developers.arcgis.com/javascript/3/jsapi/

Layers Summary
    This is a collection of layers created by Tian Xie(Intern in DDP)
 in August, 2018. This collection includes Detroit Parcel Data(Parcel_collector),
 InfoUSA business data(BIZ_INFOUSA), and building data(Building). The building
 and business data have been edited by Tian during field research and have
 attached images.

Licence Information:
                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.
*************************************************************************/
require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/LineSymbol",
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
        LineSymbol,
        Color,
        Query,
        QueryTask,
        Graphic,
        ready,
        on
    ) {
        /***********************************************************************
        define querytask for extract data from other layers by SQL statement
         ***********************************************************************/
        var development_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/developmentGDB/FeatureServer/0");
        var public_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/developmentGDB/FeatureServer/1");
        var infousa_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/0");
        var building_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/1");
        var parcel_querytask = new QueryTask("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/2");
        /***********************************************************************
        define map object and set center point and zoom level
         ***********************************************************************/
        var map = new Map("map", {
            basemap: "gray",
            center: [-83.052738, 42.333301],
            zoom: 16
        });
        /*****************************
        import layers from ArcGIS server
         *****************************/
        var NewBuilding = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/developmentGDB/FeatureServer/0", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            opacity: 0.8,
            visible: true
        });
        var PublicSpaceInvestment = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/developmentGDB/FeatureServer/1", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            opacity: 0.8,
            visible: true
        });
        var QLINE = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/QLineRoute/FeatureServer/0", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: [],
            opacity: 0.8,
            visible: true
        });
        /*******************************************
        after importing layers, add those to the map
         *******************************************/
        map.addLayer(NewBuilding);
        map.addLayer(PublicSpaceInvestment);
        map.addLayer(QLINE);

        /*********************************************************
        define functions used for loading data from hosted layers
         *********************************************************/

        /*********************************************************
        define functions used for loading development data
         *********************************************************/
        load_development = function(attributes){
            $("#detail_tablebody").empty();
            var building_name = attributes['BuildingName'];
            var description = attributes['description'];
            var projectCost = attributes['ProjectCost'];
            var sqft = attributes['TotSqFt'];
            var owner = attributes['Owner'];
            $("#detail_tablebody").append('<img class="image" alt="image" src="#" style="display: none;' +
                'width: 100%; ">');
            $("#detail_tablebody").append('<div style="margin: 1rem">'+'<h2>'+building_name+'</h2></div>');
            $("#detail_tablebody").append('<hr>');
            if (description!=null){
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+description+'</p></div>');
                $("#detail_tablebody").append('<hr>');
            }
            if (projectCost > 0){
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+'Project Cost:'+' $'+projectCost.toLocaleString()+'</p></div>');
                $("#detail_tablebody").append('<hr>');
            } else {
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+'Project Cost:'+'Undisclosed'+'</p></div>');
                $("#detail_tablebody").append('<hr>');
            }
            if (sqft!=null){
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+'Total Sq Ft: '+sqft.toLocaleString()+'</p></div>');
                $("#detail_tablebody").append('<hr>');
            }
            if (owner!=null){
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+'Owner: '+owner+'</p></div>');
            }
            /*****************************
            add image for development detail
             *****************************/
            var building_id = attributes['OBJECTID'];
            $.getJSON('https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/developmentGDB/FeatureServer/0/' + building_id + '/attachments' +
                '?f=pjson', function (result) {
                var img_id, img_url;
                if (result['attachmentInfos'].length !== 0) {
                    img_id = result['attachmentInfos'][0]['id'];
                    img_url = "https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/developmentGDB/FeatureServer/0/" + building_id + "/attachments/" + img_id;
                    display = 'block';
                } else {
                    img_url = '';
                    display = 'none';
                }
                $("#detail_tablebody img").attr("src", img_url);
                $("#detail_tablebody img").css("display", display);
            });
        };
        /*********************************************************
        define functions used for loading public space data
         *********************************************************/
        load_publicspace = function(attributes){
            $("#detail_tablebody").empty();
            var project = attributes['Project'];
            var description = attributes['Description'];
            var projectCost = attributes['TotalInvestment'];
            var partner = attributes['Partners'];
            $("#detail_tablebody").append('<img class="image" alt="image" src="#" style="display: none;' +
                'width: 100%; ">');
            $("#detail_tablebody").append('<div style="margin: 1rem">'+'<h2>'+project+'</h2></div>');
            $("#detail_tablebody").append('<hr>');
            if (description!=null){
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+description+'</p></div>');
                $("#detail_tablebody").append('<hr>');
            }
            if (projectCost > 0){
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+'Project Cost:'+' $'+projectCost.toLocaleString()+'</p></div>');
                $("#detail_tablebody").append('<hr>');
            } else {
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+'Project Cost:'+'Undisclosed'+'</p></div>');
                $("#detail_tablebody").append('<hr>');
            }
            if (partner!=null){
                $("#detail_tablebody").append('<div style="margin: 1rem">'+'<p>'+'Partner: '+partner+'</p></div>');
            }
            /*****************************
            add image for public space detail
             *****************************/
            var publicspace_id = attributes['OBJECTID'];
            $.getJSON('https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/developmentGDB/FeatureServer/1/' + publicspace_id + '/attachments' +
                '?f=pjson', function (result) {
                var img_id, img_url;
                if (result['attachmentInfos'].length !== 0) {
                    img_id = result['attachmentInfos'][0]['id'];
                    img_url = "https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/developmentGDB/FeatureServer/1/" + publicspace_id + "/attachments/" + img_id;
                    display = 'block';
                } else {
                    img_url = '';
                    display = 'none';
                }
                $("#detail_tablebody img").attr("src", img_url);
                $("#detail_tablebody img").css("display", display);
            });
        };
        /*******************************************
        define functions used for loading parcel data
         *******************************************/
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
        load_parcel = function(parcelnum){
            // clean the parcel table body
            $("#parcel_tablebody").empty();
            /***********************************************************************
            create a new query to select parcel with the development parcel number
             ***********************************************************************/
            var parcel_query;
            parcel_query = new Query();
            parcel_query.outFields = ["*"];
            parcel_query.where = "parcelnum=" + "'"+parcelnum+"'";
            parcel_querytask.execute(parcel_query, function (results) {
                if (results['features'].length === 0) {
                    $("#parcel_tablebody").append('<tr class="table-dark">' +
                        '<td class="text-left text-danger">Parcel Not Found</td>' +
                        '<td class="text-right text-danger"></td>' +
                        '</tr>')
                } else {
                    var attributes = results['features'][0]['attributes'];
                    /*************************************************************************************
                     loop through every needed attributes in the mapping and show them in the table
                     *************************************************************************************/
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
                }
            });
        };
        /*******************************************
        define functions used for loading business data
         *******************************************/
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
        /*************************************************************************************
        define function to add image to the business table. When there is no image for this
        business, use the building image.
         *************************************************************************************/
        add_business_img = function (business_num) {
            $("#business_tablebody #business" + business_num + " img").each(function (index) {
                var display = $(this).css("display");
                var attr = $(this).attr("src");
                if (display === 'none') {
                    var building_img_url = $("#building_tablebody img").attr("src");
                    if (building_img_url != undefined) {
                        $(this).css("display", 'block');
                        $(this).attr("src", building_img_url);
                    }
                }
            });
        };
        load_business = function (parcelnum) {
            /***********************************************************************
            create a new query to select business with the development parcel number
             ***********************************************************************/
            var business_query;
            business_query = new Query();
            business_query.outFields = ["*"];
            business_query.where = "parcelnum=" + "'"+parcelnum+"'";
            var business_num = 0;
            infousa_querytask.execute(business_query, function (results) {
                if (results['features'].length === 0) {
                    $("#business_tablebody").append('<tr class="table-dark">' +
                        '<td class="text-left text-danger">Business Not Found</td>' +
                        '<td class="text-right text-danger"></td>' +
                        '</tr>')
                } else {
                    /* -------------------
                    loop through every business for this parcel number
                    ------------------- */
                    results['features'].forEach(function (feature) {
                        var img_id, business_id;
                        img_url = '';
                        display = 'none';
                        var attributes = feature['attributes'];
                        business_id = attributes['OBJECTID_1'];
                        $.getJSON('https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/collector/FeatureServer/0/' + business_id + '/attachments' +
                            '?f=pjson', function (result) {
                            if (result['attachmentInfos'].length !== 0) {
                                img_id = result['attachmentInfos'][0]['id'];
                                img_url = "https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/0/" + business_id + "/attachments/" + img_id;
                                display = 'block';
                            } else {
                                img_url = '';
                                display = 'none';
                            }
                            business_num += 1;
                            $("#business_tablebody").append(
                                '<tr class="table-dark">' +
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
        /*******************************************
        define functions used for loading building data
         *******************************************/
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
        load_building = function (parcelnum) {
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
                    var featrues = results['features'];
                    featrues.forEach(function (feature) {
                        display = 'none';
                        var building_id;
                        var attributes = feature['attributes'];
                        building_id = attributes['OBJECTID_12'];
                        $.getJSON('https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/collector/FeatureServer/1/' + building_id + '/attachments' +
                            '?f=pjson', function (result) {
                            var img_id, img_url;
                            if (result['attachmentInfos'].length !== 0) {
                                img_id = result['attachmentInfos'][0]['id'];
                                img_url = "https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/collector/FeatureServer/1/" + building_id + "/attachments/" + img_id;
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
        /*********************************************************
        define functions used for handle development selection event
         *********************************************************/
        select_development = function (evt) {
            var idProperty = NewBuilding.objectIdField;
            var feature, featureId, query;

            if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes[idProperty]) {
                feature = evt.graphic;
                featureId = feature.attributes[idProperty];

                query = new Query();
                query.returnGeometry = false;
                query.objectIds = [featureId];
                query.where = "1=1";

                NewBuilding.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (feature) {
                    var attributes = feature[0]["attributes"];
                    var parcelnum = feature[0]["attributes"]["parcelnum"];
                    $("#business_tablebody").empty();
                    load_development(attributes);
                    load_parcel(parcelnum);
                    /*
                    load_business(parcelnum);
                    load_building(parcelnum);
                    */
                    if ($("#sidebar").hasClass("active")){
                        $('#sidebar').toggleClass('active');
                    }
                });
            }
        };
        /*******************************************
        set up symbol style for development
         *******************************************/
        var developmentColor = '#3027b8';
        var develoment_symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color(developmentColor));
        var renderer = new SimpleRenderer(develoment_symbol);
        /*******************************************
        set up legend for development
         *******************************************/
        $("#development_legend").css("background", developmentColor);
        NewBuilding.setRenderer(renderer);
        var selectionSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('lightgrey'), 2),
            new Color('red'));
        NewBuilding.setSelectionSymbol(selectionSymbol);
        NewBuilding.on("click", select_development);
        /*********************************************************
        define functions used for handle public space selection event
         *********************************************************/
        select_publicspace = function (evt) {
            var idProperty = PublicSpaceInvestment.objectIdField;
            var feature, featureId, query;

            if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes[idProperty]) {
                feature = evt.graphic;
                featureId = feature.attributes[idProperty];

                query = new Query();
                query.returnGeometry = false;
                query.objectIds = [featureId];
                query.where = "1=1";

                PublicSpaceInvestment.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (feature) {
                    console.log(feature);
                    var attributes = feature[0]["attributes"];
                    var parcelnum = feature[0]["attributes"]["parcelnum"];
                    $("#business_tablebody").empty();
                    load_publicspace(attributes);
                    load_parcel(parcelnum);
                    /*
                    load_business(parcelnum);
                    load_building(parcelnum);
                    */
                    if ($("#sidebar").hasClass("active")){
                        $('#sidebar').toggleClass('active');
                    }
                });
            }
        };
        PublicSpaceInvestment.on("click", select_publicspace);
        /*******************************************
        set up symbol style for public space
         *******************************************/
        var publicSpaceColor = '#61b838';
        var public_space_symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color(publicSpaceColor));
        $("#publicspace_legend").css("background", publicSpaceColor);
        var public_space_renderer = new SimpleRenderer(public_space_symbol);
        PublicSpaceInvestment.setRenderer(public_space_renderer);
        /*********************************************************
        set up symbol style for QLINE
         *********************************************************/
        var QLINEColor = '#b80099';
        var QLINE_symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_LONGDASH, new Color(QLINEColor), 3);
        $("#QLINE_legend_legend").css("color", QLINEColor);
        var QLINE_renderer = new SimpleRenderer(QLINE_symbol);
        QLINE.setRenderer(QLINE_renderer);
        /***********************************************************************
        when open the web app, set detail table as the first one to show up
         ***********************************************************************/
        $("#detail").collapse('show');

    });
