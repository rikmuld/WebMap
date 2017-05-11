
function initMap(){
  const map = new GMaps({
    el: '#map',
    lat: -12.043333,
    lng: -77.028333,
    zoomControl : true,
    zoomControlOpt: {
        style : 'SMALL',
        position: 'TOP_LEFT'
    },
    panControl : true,
    streetViewControl : false,
    mapTypeControl: false,
    overviewMapControl: false
  });
}