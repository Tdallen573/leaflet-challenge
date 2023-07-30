console.log("Step 2 working");


// Create tile layer for the background of our map
let basemap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

// Create a map object with options
let map = L.map("map", {
  center: [
    40.7, -94.5
  ],
  zoom: 3,
});

// Add basemap tile layer
basemap.addTo(map);

// Create the two layers of our map, tectonic plates and earthquakes
let tectonicplates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

// Define object to contain map for layer control
let baseMaps = {
  "Global Earthquakes": basemap,
};

// Define object to contain overlays
let overlays = {
  "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// Add control to the map to decide which layers are visible
L
  .control
  .layers(baseMaps, overlays)
  .addTo(map);

// AJAX call to retreive geoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Function to return style data for each earthquake we plot
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

  // Function to determine color of the marker based on magnitude
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

  // Function to determine radius of earthquake marker based on magnitude
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Add GeoJson layer to the map after file is loaded
  L.geoJson(data, {
    // Turn our features into a circleMarker on the map
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style of the markers with our styleInfo function
    style: styleInfo,
    // Add popups for each marker to display magnitude and location of earthquake after marker is styled
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
    // Add data to earthquake layer
  }).addTo(earthquakes);

  // Add earthquake layer to the map
  earthquakes.addTo(map);

  // Create legend control object
  let legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    let grades = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"];

    // Create loop to generate labels for each interval
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i> "
        + grades[i]
        + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add our legend to the map
  legend.addTo(map);

  // Make AJAX call to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {
    // Add geoJSON data and style info to tectonicplates
    L.geoJson(platedata, {
      color: "orange",
      weight: 2
    })
      .addTo(tectonicplates);

    // Add tectonicplates layer
    tectonicplates.addTo(map);
  });
});
