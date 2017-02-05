var map;
var markers = [];
var locations = [
    { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
    { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
    { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
    { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
    { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
    { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
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
    if (infowindow.marker != marker) {
        infowindow.setContent(marker.title);
        infowindow.marker = marker;
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            marker.setAnimation(null);
        });
        infowindow.open(map, marker);
    }
    for (var i in markers) {
        markers[i].setAnimation(null);
        if (markers[i].id == marker.id) {
            markers[i].setAnimation(google.maps.Animation.BOUNCE);
        }
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
