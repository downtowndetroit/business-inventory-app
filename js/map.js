require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "dojo/domReady!"
    ],
    function(
        Map,
        FeatureLayer
    ) {

        var map = new Map("map", {
            basemap: "hybrid",
            center: [-83.052738,42.335301],
            zoom: 17
        });

        /****************************************************************
         * Add feature layer - A FeatureLayer at minimum should point
         * to a URL to a feature service or point to a feature collection
         * object.
         ***************************************************************/

            // Carbon storage of trees in Warren Wilson College.
        var featureLayer = new FeatureLayer("https://services6.arcgis.com/kpe5MwFGvZu9ezGW/arcgis/rest/services/May2018Parcels/FeatureServer/0");

        map.addLayer(featureLayer);

    });