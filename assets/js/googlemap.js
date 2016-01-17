function initialize() {
	navigator.geolocation.getCurrentPosition(function(position) {
  		var lat = position.coords.latitude;
  		var long_ = position.coords.longitude;
  		var mapProp = {
    		center:new google.maps.LatLng(lat, long_),
    		zoom:9,
    		mapTypeId:google.maps.MapTypeId.ROADMAP
  		};
  		var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
	});
  	
}
