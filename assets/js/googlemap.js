var lat;
var long_;
var latLong;
var map;
var geocoder;
var distanceService;
var markers = [];

function initialize() {
	
  navigator.geolocation.getCurrentPosition(function(position) {

    lat = position.coords.latitude;
    long_ = position.coords.longitude;
    latLong = new google.maps.LatLng(lat, long_);

    geocoder = new google.maps.Geocoder();
    distanceService = new google.maps.DistanceMatrixService();

  	var mapProp = {
  		center: latLong,
  		zoom: 15,
  		mapTypeId: google.maps.MapTypeId.ROADMAP
  	};

  	map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

    var image = '../img/pushpin.png';
    var marker = new google.maps.Marker({
      map: map,
      icon: image,
      position: latLong,
      title: "You are here!"
    });

    // getAddress(latLong, function(town) {
    //   console.log(town);
    // })
  });
}

function getCoords(address, callback) {
  geocoder.geocode( {'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        
        return callback(results[0].geometry.location);

      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
  });
}

function dropPin(address, title) {
  
  getCoords(address, function(coords) {
    
    var marker = new google.maps.Marker({
      map: map,
      position: new google.maps.LatLng(coords.lat(), coords.lng()),
      title: title
    });
    // Add marker to array
    markers.push(marker);
  });
}

function getAddress(lat_long, callback) {
  geocoder.geocode({'location': lat_long}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      
      return callback(results[0].address_components[2].long_name);
    } else {
      return null;
    }
  });
}

function clearMarkers() {
  for (var marker of markers) {
    marker.setMap(null);
  }
  markers = [];
}

function getDistance(dest, callback) {
  distanceService.getDistanceMatrix({
    origins: [latLong],
    destinations: [dest],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.IMPERIAL
  }, function(response, status) {
    
    return callback(response.rows[0].elements[0].distance.value);
  });
}

function setCenter(address) {
  getCoords(address, function(coords) {
    map.setCenter(coords);
  });
}




