var lat;
var long_;
var latLong;
var map;
var geocoder;
navigator.geolocation.getCurrentPosition(success, error);

function initialize() {
	
  
  //geocoder = new google.maps.Geocoder();

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

}
  
function success(position) {
  lat = position.coords.latitude;
  long_ = position.coords.longitude;
  latLong = new google.maps.LatLng(lat, long_);

}

function error(err) {
  console.warn(err.message);
}

function dropPin(coordinates) {

}