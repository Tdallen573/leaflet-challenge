// Create a console log to track progress
console.log("Step 1 working");

// Create tile layer for map background
let basemap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });


// Create our map with object options
let map = L.map("map", {
    center: [
        40.7, -94.5
    ],
    zoom: 3
});

// Add a basemap tile layer to the map
basemap.addTo(map);

// Make an AJAX call to retrieve our earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
  
  // Create function to style the data for each earthquake plot
  function styleInfo(feature) {
    return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
    };
  }

  // Function to determine the color of marker based on magnitude
  function getColor(depth) {
    switch (true) {
        case depth > 90:
            return "#ea2c2c";
        case depth > 70:
            return "#ea822c";
        case depth > 50:
            return "#ee9c00";
        case depth > 30:
            return "#eecc00";
        case depth > 10:
            return "#d4ee00";
        default:
            return "#98ee00";
    }
  }

  // Function to determine radius of the earthqwake marker based on magnitude
  function getRadius(magnitude) {
    if (magnitude === 0) {
        return 1;
    }

    return magnitude * 4;
  }

  // Add a GeoJSON layer to the map once file is loaded
  L.geoJson(data, {
    // Make each feature a circle on our map
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
    },
    // Style each circleMarker using our styleinfo function
    style: styleInfo,
    // Create a popup for each marker to display magnitude and location after it's creation
    onEachFeature: function (feature, layer) {
        layer.bindPopup(
            "Magnitude: "
            + feature.properties.mag
            + "<br>Depth: "
            + feature.geometry.coordinates[2]
            + "<br>Location: "
            + feature.properties.place
        );
    }
  }).addTo(map);

  // Create a legend control object
  let legend = L.control({
    position: "bottomright"
  });

  // Add legend details
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    let grades = [-10, 10, 30, 50, 70, 90];
    let colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
    ];

    // Loop through intervals to generate labels
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
          + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to our map
  legend.addTo(map);
});
