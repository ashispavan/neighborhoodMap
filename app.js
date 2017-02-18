var map;
var markers = [];
var locations = [
    { title: 'Burger Joint', location: { lat: 40.7643, lng: -73.9786 } },
    { title: 'Bill\'s Bar and Burger', location: { lat: 40.7593, lng: -73.9775 } },
    { title: 'JG Melon', location: { lat: 40.7711, lng: -73.9593 } },
    { title: 'B and B Winepub', location: { lat: 40.7257, lng: -73.9980 } },
    { title: 'The Spotted Pig', location: { lat: 40.7356, lng: -74.0067 } },
    { title: 'New York Burger Co', location: { lat: 40.7416, lng: -73.9933 } }
];

var listItems = locations.map(function(item) {
    return item.title;
});

function initMap() {
    var styles = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#193341"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2c5a71"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#29768a"},{"lightness":-37}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#3e606f"},{"weight":2},{"gamma":0.84}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"weight":0.6},{"color":"#1a3541"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#2c5a71"}]}];
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 13,
        mapTypeControl: false,
        styles: styles
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < locations.length; i++) {

        var position = locations[i].location;
        var title = locations[i].title;
        locations[i].latlng = new google.maps.LatLng(position);
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        markers.push(marker);
        markers[i].setMap(map);
        bounds.extend(locations[i].latlng);
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
    }

    map.fitBounds(bounds);
    ko.applyBindings(new ViewModel(largeInfowindow));
}


function populateInfoWindow(marker, infowindow) {
    var client_id = 'AQSGIQYJFQIUZUAIBNGBWMN0UELAZHYN4HBNTETXQFC1QROG';
    var client_secret = 'MZUV4WHGSEKL25Z353K0PIRBFAKQEUABDSLLYSEQEWNEZ4FG',
        content = '',
        address = '',
        contact = '',
        twitter = '';
    var URL = "https://api.foursquare.com/v2/venues/search?v=20161016&ll=" + marker.position.lat() + ", " + marker.position.lng() + "&query=" + marker.title + "&intent=checkin&client_id=" + client_id + "&client_secret=" + client_secret;

    if (infowindow.marker != marker) {
        $.ajax({
            url: URL,
            dataType: "json",
            async: true,
            success: function(data) {
                content = data.response.venues[0].name;
                address = data.response.venues[0].location.formattedAddress[0];
                contact = data.response.venues[0].contact.formattedPhone;
                twitter = data.response.venues[0].contact.twitter || 'NA';
                infowindow.setContent('<div>' + '<h4>' + content + '</h4>' + ' <h6>' + address + '</h6>' + '<h5>Ph: ' + contact + '</h5>' +  '<h5 style="color:blue">Twitter: ' + twitter + '</h5>' + '</div>');
                infowindow.marker = marker;
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                    marker.setAnimation(null);
                });
                infowindow.open(map, marker);
                for (var i in markers) {
                    markers[i].setAnimation(null);
                    if (markers[i].id == marker.id) {
                        markers[i].setAnimation(4);
                    }
                }
            }
        }).fail(function(){
            infowindow.setContent('<h5>Failed to access Foursquare API</h5>');
            infowindow.open(map, marker);
        });
    }
}



var ListItemModel = function() {
    this.listItems = ko.observable([]);
};

var ViewModel = function(largeInfowindow) {
    var self = this;
    self.currentModel = ko.observable(new ListItemModel());
    self.currentModel().listItems(listItems);

    self.filterList = function() {
        var inputText = document.getElementById('search').value.toUpperCase();
        var newArray = listItems.map(function(item) {
            if (item.toUpperCase().includes(inputText)) {
                return item;
            }
        }).filter(function(element) {
            return element !== undefined;
        });

        self.currentModel().listItems(newArray);

        markers.forEach(function(marker) {
            if (newArray.includes(marker.title)) {
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });
    }

    self.showInfoWindow = function(item, event) {
        var clicked = $(event.currentTarget).text().toUpperCase();
        var selectedMarker = markers.find(function(item) {
            return clicked === item.title.toUpperCase();
        });

        populateInfoWindow(selectedMarker, largeInfowindow);
    }
};

function resizePage() {
    var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
    if (width < 700) {
        $('.listings').removeClass('active');
        $('.hamburger').removeClass('is-active');
    } else {
        $('.listings').addClass('active');
        $('.hamburger').addClass('is-active');
    }
}

$(document).ready(function() {

    $('.hamburger').click(function() {
        $(this).toggleClass('is-active');
        $('.listings').toggleClass('active');
    });
    window.onresize = resizePage;
    resizePage();
});
