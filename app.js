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

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 13,
        mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();

    for (var i = 0; i < locations.length; i++) {

        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        markers.push(marker);
        markers[i].setMap(map);
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
    }

    ko.applyBindings(new ViewModel(largeInfowindow));
}


function populateInfoWindow(marker, infowindow) {
    var client_id = 'AQSGIQYJFQIUZUAIBNGBWMN0UELAZHYN4HBNTETXQFC1QROG';
    var client_secret = 'MZUV4WHGSEKL25Z353K0PIRBFAKQEUABDSLLYSEQEWNEZ4FG', content = '', address = '', imgUrl = '';
    var URL = "https://api.foursquare.com/v2/venues/search?v=20161016&ll=" + marker.position.lat() + ", " + marker.position.lng()
    + "&query=" + marker.title + "&intent=checkin&client_id=" + client_id + "&client_secret=" + client_secret;
    
    if (infowindow.marker != marker) {
         $.ajax({
            url: URL,
            dataType: "json",
            async: true,
            success: function(data){
                content = data.response.venues[0].name;
                address = data.response.venues[0].location.formattedAddress[0];
                imgUrl =  data.response.venues[0].categories[0].icon.prefix + '250' + data.response.venues[0].categories[0].icon.suffix;
                infowindow.setContent('<div>' + '<h5>' + content + '</h5>' + ' <p>' + address + '</p>' +  '<img src=' + imgUrl + '>' +  '</div>');
                infowindow.marker = marker;
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                    marker.setAnimation(null);
                 });
                infowindow.open(map, marker);
                for (var i in markers) {
                    markers[i].setAnimation(null);
                    if (markers[i].id == marker.id) {
                        markers[i].setAnimation(google.maps.Animation.BOUNCE);
                    }
                }
            }   
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
