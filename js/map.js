/* This is the script to create ArcGIS map*/
require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/Color",
        "esri/tasks/query",
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
        var ORBIS = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/ORBIS_BIZ/FeatureServer/0",{
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ['*'],
                opacity: 0.2,
                visible: false,
                orderByFields: ["Field1"]
            });
        var PARCEL = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/May2018Parcels/FeatureServer/0",{
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            opacity: 0.8,
            visible: true,
            orderByFields: ["objectid"]
        });
        var parcel_symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('white'), 1),
            new Color('#adb2b8'));
        var renderer = new SimpleRenderer(parcel_symbol);
        PARCEL.setRenderer(renderer);

        var BUILDING = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/ArcGIS/rest/services/BUILDING_BIZ/FeatureServer/0",{
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            opacity: 0.2,
            visible: false,
            orderByFields: ["FID"]
        });
        // apply the selection symbol for the layer
        var selectionSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('lightgrey'), 2),
            new Color('red'));
        PARCEL.setSelectionSymbol(selectionSymbol);
        // setting click event, when click parcel, graphic will change
        PARCEL.on("click", function(evt) {
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
                    console.log("arrtribute:"+attribute);
                    console.log("parcel number: "+parcelnum);
                });
            }
        });




        map.addLayer(ORBIS);
        map.addLayer(PARCEL);
        map.addLayer(BUILDING);


    });