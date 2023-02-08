// Menyimpan peta yang ingin ditampilkan
var map;

// Menyimpan rute antar lokasi dan menyimpan request rute antar lokasi ke google maps api
var directionsDisplay = null;
var directionsService;

// Menyimpan garis rute yang akan ditampilkan
// Menyimpan lokasi, lokasi sebelumnya, dan marker pada peta.
var polylinePath;
var nodes = [];
var prevNodes = [];
var markers = [];

// Menyimpan lokasi tujuan dan jarak antar lokasi
var destinations = [];
var distances = [];

// Menyimpan lokasi default yang akan ditampilkan pada peta
var destinationsDefault = [
  ["Istana Anak-Anak Indonesia", -6.302011, 106.900207],
  ["Anjungan Bali", -6.302664, 106.897567],
  ["Sasono Adiguno TMII", -6.301907, 106.891441],
  ["Museum HAKKA Indonesia", -6.305194, 106.903967],
  ["Teater IMAX Keong Emas", -6.304473, 106.890819],
  ["Museum Indonesia", -6.301047, 106.891444],
  ["Museum Purna Bakti Pertiwi", -6.300346, 106.886441],
];

var defaultDest = false;

// Mengisi input box dengan lokasi yang sudah ditentukan sebagai default
var hitung_konten_lokasi = $(".lokasi-tujuan").length - 1;
function auto_isi() {
  if (!defaultDest) {
    for (var i = 0; i < destinationsDefault.length; i++) {
      if (i > 0) {
        hitung_konten_lokasi++;
        // Membuat input box baru setiap kali dijalankan dan mengisi nama lokasi pada input box tersebut.
        var konten =
          '<div class="lokasi-tujuan" id="lokasi-tujuan-' +
          hitung_konten_lokasi +
          '">' +
          '<input type="text" class="lokasi_tujuan m-wrap" autocomplete="off" id="lokasi_tujuan_' +
          hitung_konten_lokasi +
          '" data-id="' +
          hitung_konten_lokasi +
          '">' +
          '<input type="hidden" id="lokasi_tujuan_' +
          hitung_konten_lokasi +
          '_latitude" autocomplete="off">' +
          '<input type="hidden" id="lokasi_tujuan_' +
          hitung_konten_lokasi +
          '_longitude" autocomplete="off">' +
          '<button type="button" class="hapus_lokasi_tujuan" data-id="' +
          hitung_konten_lokasi +
          '">' +
          "Hapus" +
          "</button>" +
          "</div>";
        $("div.lokasi-tujuan").last().after(konten);
      }

      // Memampilkan nama lokasi pada input box
      $("#lokasi_tujuan_" + i).val(destinationsDefault[i][0]);
      $("#lokasi_tujuan_" + i + "_latitude").val(destinationsDefault[i][1]);
      $("#lokasi_tujuan_" + i + "_longitude").val(destinationsDefault[i][2]);
    }

    var inputs = document.getElementsByClassName("lokasi_tujuan");
    var autocompletes = [];

    // Fungsi ini menggunakan API Place Autocomplete dari Google Maps untuk mengisi input box dengan nama alamat lokasi.
    for (var i = 0; i < inputs.length; i++) {
      var autocomplete = new google.maps.places.Autocomplete(inputs[i], {
        types: ["address"],
        componentRestrictions: { country: "idn" },
      });
      autocomplete.inputId = inputs[i].id;
      autocomplete.addListener("place_changed", fillIn);
      autocompletes.push(autocomplete);
    }

    for (var i = 0; i < inputs.length; i++) {
      var autocomplete = new google.maps.places.Autocomplete(inputs[i], {
        types: ["geocode"],
        componentRestrictions: { country: "idn" },
      });
      autocomplete.inputId = inputs[i].id;
      autocomplete.addListener("place_changed", fillIn);
      autocompletes.push(autocomplete);
    }

    for (var i = 0; i < inputs.length; i++) {
      var autocomplete = new google.maps.places.Autocomplete(inputs[i], {
        types: ["establishment"],
        componentRestrictions: { country: "idn" },
      });
      autocomplete.inputId = inputs[i].id;
      autocomplete.addListener("place_changed", fillIn);
      autocompletes.push(autocomplete);
    }

    // Fungsi ini akan mengambil ID dari elemen input yang memicu event tersebut yaitu place_changed dan memasukkan nilai latitude dan longitude dari lokasi yang dipilih ke dalam input tipe hidden dengan ID sesuai.
    function fillIn() {
      var id = this.inputId;
      var place = this.getPlace();
      var latitude = place.geometry.location.lat();
      var longitude = place.geometry.location.lng();

      $("#" + id + "_latitude").val(latitude);
      $("#" + id + "_longitude").val(longitude);
    }

    // Fungsi ini akan berjalan jika "defaultDest" bernilai false. Nilai "defaultDest" akan berubah menjadi true setelah fungsi ini dijalankan.
    destinations = destinationsDefault;
    defaultDest = true;
  }
}

// Event handler untuk memanggil fungsi auto_isi() agar bisa menampilkan default lokasi tujuan
$(document).on("click", "#default_lokasi_tujuan", function () {
  auto_isi();
});

// Fungsi autocomplete google maps api untuk lokasi tujuan pertama
var lokasi_tujuan = new google.maps.places.Autocomplete(
  document.getElementById("lokasi_tujuan_0"),
  {
    types: ["establishment"],
    componentRestrictions: { country: "idn" },
  }
);
lokasi_tujuan.addListener("place_changed", function () {
  var place = lokasi_tujuan.getPlace();
  var latitude = place.geometry.location.lat();
  var longitude = place.geometry.location.lng();
  $("#lokasi_tujuan_0_latitude").val(latitude);
  $("#lokasi_tujuan_0_longitude").val(longitude);
});

// Menyimpan jumlah elemen dengan kelas lokasi-tujuan dan menggunakannya dalam perhitungan selanjutnya
var hitung_konten_lokasi = $(".lokasi-tujuan").length - 1;

// Fungsi untuk penggunaan tombol tambah lokasi sebagai validasi
$(document).on("click", "#tambah_lokasi_tujuan", function () {
  // Mengecek apakah input box lokasi sudah terisi atau belum. Jika belum, maka akan muncul pesan alert dan event fokus pada input box tersebut.
  if ($("#lokasi_tujuan_" + hitung_konten_lokasi).val() == "") {
    alert("Lokasi Dibutuhkan! Input Box Tidak Boleh Kosong.");
    document.getElementById("lokasi_tujuan_" + hitung_konten_lokasi).focus();
    return false;
  }

  // Mengecek apakah input lokasi yang dimasukkan adalah lokasi yang valid, jika tidak akan muncul sebuah alert
  if (
    $("#lokasi_tujuan_" + hitung_konten_lokasi + "_latitude").val() == "" &&
    $("#lokasi_tujuan_" + hitung_konten_lokasi).val() != ""
  ) {
    alert("Lokasi Tidak Ditemukan! Silahkan Periksa Kembali Inputan Anda.");
    document.getElementById("lokasi_tujuan_" + hitung_konten_lokasi).focus();
    return false;
  }

  // Membatasi jumlah lokasi yang bisa ditambahkan, jika sudah mencapai batas maksimal maka akan memunculkan alert
  if ($(".lokasi-tujuan").length == 9) {
    alert("Jumlah Lokasi Sudah Maksimal!");
    return;
  }

  // Untuk menampilkan input box jika tombol tambah lokasi diklik
  hitung_konten_lokasi++;
  var konten =
    '<div class="lokasi-tujuan" id="lokasi-tujuan-' +
    hitung_konten_lokasi +
    '">' +
    '<input type="text" class="lokasi_tujuan m-wrap" autocomplete="off" id="lokasi_tujuan_' +
    hitung_konten_lokasi +
    '" data-id="' +
    hitung_konten_lokasi +
    '">' +
    '<input type="hidden" id="lokasi_tujuan_' +
    hitung_konten_lokasi +
    '_latitude" autocomplete="off">' +
    '<input type="hidden" id="lokasi_tujuan_' +
    hitung_konten_lokasi +
    '_longitude" autocomplete="off">' +
    '<button type="button" class="hapus_lokasi_tujuan" data-id="' +
    hitung_konten_lokasi +
    '">' +
    "Hapus" +
    "</button>" +
    "</div>";
  $("div.lokasi-tujuan:last").after(konten);

  var inputs = document.getElementsByClassName("lokasi_tujuan");
  var autocompletes = [];

  // Fungsi ini menggunakan API Place Autocomplete dari Google Maps untuk mengisi input box dengan nama alamat lokasi.
  for (var i = 0; i < inputs.length; i++) {
    var autocomplete = new google.maps.places.Autocomplete(inputs[i], {
      types: ["address"],
      componentRestrictions: { country: "idn" },
    });
    autocomplete.inputId = inputs[i].id;
    autocomplete.addListener("place_changed", fillIn);
    autocompletes.push(autocomplete);
  }

  for (var i = 0; i < inputs.length; i++) {
    var autocomplete = new google.maps.places.Autocomplete(inputs[i], {
      types: ["geocode"],
      componentRestrictions: { country: "idn" },
    });
    autocomplete.inputId = inputs[i].id;
    autocomplete.addListener("place_changed", fillIn);
    autocompletes.push(autocomplete);
  }

  for (var i = 0; i < inputs.length; i++) {
    var autocomplete = new google.maps.places.Autocomplete(inputs[i], {
      types: ["establishment"],
      componentRestrictions: { country: "idn" },
    });
    autocomplete.inputId = inputs[i].id;
    autocomplete.addListener("place_changed", fillIn);
    autocompletes.push(autocomplete);
  }

  // Fungsi ini akan mengambil ID dari elemen input yang memicu event tersebut yaitu place_changed dan memasukkan nilai latitude dan longitude dari lokasi yang dipilih ke dalam input tipe hidden dengan ID sesuai.
  function fillIn() {
    var id = this.inputId;
    var place = this.getPlace();
    var latitude = place.geometry.location.lat();
    var longitude = place.geometry.location.lng();

    $("#" + id + "_latitude").val(latitude);
    $("#" + id + "_longitude").val(longitude);
  }
});

// Menghapus input box lokasi tujuan
$(document).on("click", ".hapus_lokasi_tujuan", function () {
  var id = $(this).data("id");
  $("#lokasi-tujuan-" + id).remove();
});

// Membuat objek peta Google Maps
function initializeMap() {
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: { lat: -6.302478152274517, lng: 106.8951792972926 },
    zoom: 16,
    mapTypeId: "hybrid",
    streetViewControl: false,
    mapTypeControl: false,
  });
}

// Fungsi untuk mendapatkan info perjalanan yaitu jarak perjalanan
function getDistance(callback) {
  // Mengumpulkan informasi tentang lokasi tujuan dari elemen HTML yang memiliki class "lokasi_tujuan".
  var service = new google.maps.DistanceMatrixService();
  var nodes = [];
  $(".lokasi_tujuan").each(function (i, obj) {
    var id = $(this).data("id");
    var latitude_tujuan = parseFloat(
      $("#lokasi_tujuan_" + id + "_latitude").val()
    );
    var longitude_tujuan = parseFloat(
      $("#lokasi_tujuan_" + id + "_longitude").val()
    );

    // Informasi tersebut dikumpulkan dalam bentuk latitude dan longitude, yang kemudian disimpan dalam array "nodes".
    var myLatLng = { lat: latitude_tujuan, lng: longitude_tujuan };
    nodes.push(myLatLng);
  });

  // MENDAPATKAN JUMLAH TOTAL LOKASI TUJUAN
  $("#jumlah-lokasi").html(nodes.length);

  // Untuk menghitung jarak antara setiap lokasi tujuan
  service.getDistanceMatrix(
    {
      origins: nodes,
      destinations: nodes,
      travelMode: google.maps.TravelMode[$("#tipe-perjalanan").val()],
      avoidHighways: false,
      avoidTolls: false,
    },

    //Hasil perhitungan jarak diterima oleh callback function yang disediakan oleh sistem dan disimpan dalam array "distances".
    function (distanceData) {
      var nodeDistanceData;
      for (originNodeIndex in distanceData.rows) {
        nodeDistanceData = distanceData.rows[originNodeIndex].elements;
        distances[originNodeIndex] = [];
        for (destinationNodeIndex in nodeDistanceData) {
          if (
            (distances[originNodeIndex][destinationNodeIndex] =
              nodeDistanceData[destinationNodeIndex].distance == undefined)
          ) {
            alert("Error: couldn't get a trip distance from API");
            return;
          }
          distances[originNodeIndex][destinationNodeIndex] =
            nodeDistanceData[destinationNodeIndex].distance.value;
        }
      }

      // Fungsi callback diterima dari method getDistanceMatrix akan dipanggil setelah informasi jarak diterima.
      // Jika callback tidak undefined, maka function callback akan dipanggil.
      if (callback != undefined) {
        callback();
      }
    }
  );
}

// Untuk membersihkan marker pada peta
function clearMapMarkers() {
  for (index in markers) {
    markers[index].setMap(null);
  }

  prevNodes = nodes;
  nodes = [];

  if (polylinePath != undefined) {
    polylinePath.setMap(null);
  }

  markers = [];

  $("#ga-buttons").show();
}

// Untuk menghilangkan petunjuk arah pada google maps
function clearDirections() {
  if (directionsDisplay != null) {
    directionsDisplay.setMap(null);
    directionsDisplay = null;
  }
}

// Untuk membersihkan maps dan informasi yang ditampilkan
function clearMap() {
  clearMapMarkers();
  clearDirections();

  $("#jumlah-lokasi").html("0");
}

// Membuat objek peta baru menggunakan api google maps
google.maps.event.addDomListener(window, "load", initializeMap);

// Event listener untuk membersihkan maps
$("#clear-map").click(clearMap);

// Menjalankan perhitungan sistem dengan fungsi dari algoritma genetika
$("#cari-rute").click(function () {
  initMap();
});

// Untuk mengelola data dari perhitungan algoritma genetika
function initMap() {
  // Menampilkan informasi
  $("#jarak-terbaik").html("?");
  // $("#jumlah-generasi").html("?");
  $("#rangkuman-rute").html("?");
  $("#panel-petunjuk").hide();
  var nodes = [];

  // selektor yang mengambil elemen dari DOM yang memiliki kelas "lokasi_tujuan"
  $(".lokasi_tujuan").each(function (i, obj) {
    var id = $(this).data("id");
    var lokasi_tujuan = $(this).val();
    var latitude_tujuan = parseFloat(
      $("#lokasi_tujuan_" + id + "_latitude").val()
    );
    var longitude_tujuan = parseFloat(
      $("#lokasi_tujuan_" + id + "_longitude").val()
    );

    // Mmebuat objek baru bernama "myLatLng" dengan memasukkan latitude dan longitude yang diambil. Objek "myLatLng" kemudian dimasukkan ke dalam array "nodes".
    var myLatLng = { lat: latitude_tujuan, lng: longitude_tujuan };
    nodes.push(myLatLng);
  });

  // Memunculkan alert box jika input box lokasi tujuan kurang dari 2 titik
  if (nodes.length < 2) {
    if (prevNodes.length >= 2) {
      nodes = prevNodes;
    } else {
      alert("Lokasi Tujuan Harus Lebih Dari 2 Titik");
      return;
    }
  }

  // memastikan bahwa petunjuk jalan yang tampil pada peta (map) dihapus (dihilangkan)
  if (directionsDisplay != null) {
    directionsDisplay.setMap(null);
    directionsDisplay = null;
  }

  $("#ga-buttons").hide();

  // Fungsi untuk mendapatkan jarak rute perjalanan
  getDistance(function () {
    $(".info-algoritma").show();

    // Mengambil nilai konfigurasi algoritma genetika
    ga.getConfig();

    // Membuat class populasi untuk algoritma genetika kemudian disimpan di variable pop
    var pop = new ga.population();

    // Mengitialisasi populasi sesuai dengan Panjang node / titik yang diinputkan
    pop.initialize(nodes.length);

    // Ambil kromosom dengan nilai fittest terbaik kemudian masukkan ke variable route
    var route = pop.getFittest().chromosome;

    //Memulai proses evolusi dari populasi awal,
    ga.evolvePopulation(
      // Sebagai populasi yang akan dievolusikan
      pop,
      function (update) {
        // Menampilkan generation yang sudah selesai di front-end html
        $("#jumlah-generasi").html(update.generation);

        // Get route coordinates
        // Simpan kromosom dengan nilai fittest paling baik di generation sekarang ke route
        var route = update.population.getFittest().chromosome;

        // Inisialisasi array routeCoordinates kemudian masukkan semua route ke dalam routeCoordinates
        var routeCoordinates = [];
        for (index in route) {
          routeCoordinates[index] = nodes[route[index]];
        }
        // Di routeCoordinates terakhir tambah node di route ke 0
        routeCoordinates[route.length] = nodes[route[0]];

        // Tampilkan Polyline dari routeCoordinates setiap generation di peta dengan warna #0066ff
        //  memeriksa apakah objek "polylinePath" sudah terdefinisi atau tidak
        if (polylinePath != undefined) {
          polylinePath.setMap(null);
        }
        polylinePath = new google.maps.Polyline({
          path: routeCoordinates,
          strokeColor: "#0066ff",
          strokeOpacity: 0.75,
          strokeWeight: 2,
        });
        polylinePath.setMap(map);
      },

      // Sebagai generationCallBack yang akan dipanggil saat update generation selesai.
      function (result) {
        // Simpan kromosom dengan nilai fittest paling baik di generation terakhir ke route
        // mendapatkan nilai rute
        route = result.population.getFittest().chromosome;

        // Meminta google maps service untuk direction
        // menampilkan rute antar lokasi pada peta.
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);

        // Menyimpan route ke array waypts sesuai format untuk direction google maps
        var waypts = [];
        for (var i = 1; i < route.length; i++) {
          waypts.push({
            location: nodes[route[i]],
            stopover: true,
          });
        }

        /* 
        membuat objek request untuk meminta layanan rute dari Google Maps API melalui objek directionsService. Objek ini menentukan informasi yang dibutuhkan oleh API seperti titik awal (origin), titik tujuan (destination), titik-titik yang harus dilewati (waypoints), jenis perjalanan (travelMode), dan opsi untuk menghindari jalan bebas hambatan (avoidHighways) dan jalan tol (avoidTolls). Nilai-nilai ini diambil dari elemen HTML yang sesuai dengan ID-nya.
        */
        var request = {
          origin: nodes[route[0]],
          destination: nodes[route[0]],
          waypoints: waypts,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode[$("#tipe-perjalanan").val()],
          avoidHighways: false,
          avoidTolls: false,
        };

        // meminta Google Maps API untuk menemukan rute antara titik awal dan akhir, dengan waypoint (titik tengah) jika ada
        // jika permintaan berhasil dilakukan dan Google Maps API mengirimkan status "OK", maka hasil rute akan ditampilkan pada peta menggunakan objek "DirectionsRenderer".
        directionsService.route(request, function (response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);

            // Menampilkan Huruf secara berurutan mulai dari A, B, C dan seterusnya
            var current_huruf = 0;
            function next_huruf() {
              current_huruf++;
              var alphabet = String.fromCharCode(64 + current_huruf);

              return alphabet;
            }

            // Initialisasi rangkuman-rute = “ ”, totalDist = 0, dan myroute = route pertama dari response
            var rangkuman_rute = "";
            var totalDist = 0;
            var myroute = response.routes[0];

            // menghitung total jarak dan menampilkan ringkasan rute dari setiap titik tujuan.
            for (i = 0; i < myroute.legs.length; i++) {
              totalDist += myroute.legs[i].distance.value;

              var jarak_route = myroute.legs[i].distance.text;

              // Tampilkan urutan huruf, alamat jalan awal rute dan jarak jalan rute.
              rangkuman_rute += "<p>";
              rangkuman_rute +=
                '<strong style="color:red;">' +
                next_huruf() +
                "</strong>. " +
                myroute.legs[i].start_address;
              rangkuman_rute += "<br>";
              rangkuman_rute += "<strong>" + jarak_route + " </strong>";
              rangkuman_rute += "</p>";

              // Jika sudah jalan rute terakhir maka tampilkan urutan huruf , alamat jalan rute dan jarak jalan rute.
              if (i + 1 == myroute.legs.length) {
                rangkuman_rute += "<p>";
                rangkuman_rute +=
                  '<strong style="color:red;">' +
                  next_huruf() +
                  "</strong>. " +
                  myroute.legs[i].end_address;
                rangkuman_rute += "<br>";
                rangkuman_rute += "<strong> </strong>";
                rangkuman_rute += "</p>";
              }
            }

            // Menghitung total jarak (totalDist) dalam format KM dan rangkuman_rute
            var jarak = totalDist / 1000;
            document.getElementById("jarak-terbaik").innerHTML = jarak + " KM";
            document.getElementById("rangkuman-rute").innerHTML =
              rangkuman_rute;

            //menampilkan rute pada peta dan juga direction panel sebagai petunjuk text
            $("#panel-petunjuk").html("");
            directionsDisplay.set(map);
            directionsDisplay.setPanel(
              document.getElementById("panel-petunjuk")
            );

            // menampilkan layer traffic atau lalu-lintas pada peta
            var trafficLayer = new google.maps.TrafficLayer();
            trafficLayer.setMap(map);
          }
          // Bersihkan marker dari sebelumnya jika ada
          clearMapMarkers();
        });
      }
    );
  });
}

// KODE PENERAPAN ALGORITMA GENETIKA

/*
DEFAULT CONFIG ALGORITMA GENETIKA
Nilai pengaturan default untuk algoritma genetika yang akan dijalankan seperti crossoverRate 0.5,  mutationRate 0.1, jumlah populasi 50, elitism true, maxGenerations 50, tickerSpeed 60.
*/
var ga = {
  crossoverRate: 0.5,
  mutationRate: 0.1,
  populationSize: 50,
  elitism: true,
  maxGenerations: 50,
  tickerSpeed: 60,

  /*
  MENGAMBIL NILAI CONFIG DARI INPUT FORM
  Mengembalikan nilai pengaturan default untuk algoritma genetika jika tidak diubah maka nilai pengaturan default algoritma genetika dikembalikan
  */
  getConfig: function () {
    ga.crossoverRate = parseFloat($("#rasio-crossover").val());
    ga.mutationRate = parseFloat($("#rasio-mutasi").val());
    ga.populationSize = parseInt($("#jumlah-populasi").val());
    ga.elitism = parseInt($("#elitism").val()) || false;
    ga.maxGenerations = parseInt($("#generations").val());
  },

  // Deklarasikan function evolvePopulation
  // Evolves given population
  /* Kode ini adalah bagian dari implementasi Algoritma Genetika (GA). Fungsi evolvePopulation memiliki tiga parameter, yaitu population, generationCallBack, dan completeCallBack. Fungsi ini memulai proses evolusi pada populasi. Setiap evolusi mencakup proses crossover dan mutasi. Proses evolusi berlangsung secara berulang selama jumlah generasi tidak melebihi jumlah maksimal yang ditentukan oleh ga.maxGenerations.
  
  Pada setiap iterasi evolusi, fungsi akan memanggil generationCallBack jika ada dan memberikan informasi populasi dan generasi saat ini. Jika evolusi sudah selesai dan jumlah generasi melebihi jumlah maksimal, fungsi evolvePopulation akan memanggil completeCallBack jika ada dan memberikan informasi populasi dan generasi terakhir. */
  evolvePopulation: function (
    population,
    generationCallBack,
    completeCallBack
  ) {
    // Initialisasi generasi sekarang dengan nilai awal 1
    // Start evolution
    var generation = 1;
    // Mulai evolve generation
    var evolveInterval = setInterval(function () {
      // Jika generationCallBack tidak sama dengan undefined maka set population : population dan generation : generation
      if (generationCallBack != undefined) {
        generationCallBack({
          population: population,
          generation: generation,
        });
      }

      // Evolve population
      /*
      Lakukan crossover ke population (Proses kawin silang atau yang lebih dikenal dengan nama proses crossover (disebut juga pindah silang atau rekombinasi) adalah menyilangkan dua kromosom sehingga membentuk kromosom baru yang harapannya lebih baik dari pada parent-nya.)
      */
      population = population.crossover();
      population.mutate();
      generation++;

      // Jika generation sudah lebih dari maxGeneration maka hentikan algoritma dan panggil completeCallBack dan tampilkan hasil
      // If max generations passed
      if (generation > ga.maxGenerations) {
        // Stop looping
        clearInterval(evolveInterval);

        if (completeCallBack != undefined) {
          completeCallBack({
            population: population,
            generation: generation,
          });
        }
      }
    }, ga.tickerSpeed);
  },

  // Menyimpan semua individu dari populasi
  // Population class
  /* Kode ini adalah bagian dari GA (Genetic Algorithm), yaitu pemodelan dari sebuah populasi. Bagian ini membuat objek populasi yang terdiri dari array objek individu. Pada method initialize, populasi dibuat dengan mengulang sebanyak jumlah populasi yang ditentukan oleh properti ga.populationSize dan membuat objek individu baru yang berisi informasi kromosom dengan panjang yang ditentukan oleh chromosomeLength. Masing-masing individu baru kemudian di-push ke dalam array this.individuals. */
  population: function () {
    // Holds individuals of population
    this.individuals = [];

    // Menginisialisasi populasi dengan individual. Simpan hasil inisialisasi di this.individuals
    // Initial population of random individuals with given chromosome length
    this.initialize = function (chromosomeLength) {
      this.individuals = [];

      // Looping sebanyak jumlah populasi
      for (var i = 0; i < ga.populationSize; i++) {
        // Initialisasi individu sesuai dengan Panjang kromosom yang didapatkan dari Panjang node
        var newIndividual = new ga.individual(chromosomeLength);
        // Initialisasi individual baru
        newIndividual.initialize();
        // Masukkan newIndidual yang dibuat tadi ke this.individuals
        this.individuals.push(newIndividual);
      }
    };

    // Mutates current population
    /*  bagian dari objek populasi dalam algoritma genetika. Fungsi mutate akan mengubah individu dalam populasi secara acak. Algoritma akan memperoleh indeks dari individu terbaik dalam populasi menggunakan getFittestIndex. Jika pengaturan elitism diatur sebagai benar, individu terbaik tidak akan terpengaruh oleh mutasi. Namun, jika elitism tidak diterapkan, semua individu dalam populasi akan terpengaruh oleh mutasi. */
    this.mutate = function () {
      // Cari fittestIndex kemudian simpan di fittestIndex
      var fittestIndex = this.getFittestIndex();

      // Looping semua individu yang ada
      for (index in this.individuals) {
        // Don't mutate if this is the elite individual and elitism is enabled
        if (ga.elitism != true || index != fittestIndex) {
          this.individuals[index].mutate();
        }
      }
    };

    // Buat newPopulation dan initialisasi
    // Applies crossover to current population and returns population of offspring
    this.crossover = function () {
      // Create offspring population
      var newPopulation = new ga.population();

      // Cari fittestIndex kemudian simpan di fittestIndex
      // Find fittest individual
      var fittestIndex = this.getFittestIndex();

      // Looping semua individu yang ada
      for (index in this.individuals) {
        // Add unchanged into next generation if this is the elite individual and elitism is enabled
        if (ga.elitism == true && index == fittestIndex) {
          // Replicate individual
          // Replicate individual ke eliteIndividual dengan individual sekarang
          var eliteIndividual = new ga.individual(
            this.individuals[index].chromosomeLength
          );
          // SetChromosome eliteIndividual dengan kromosom dari individual sekarang
          eliteIndividual.setChromosome(
            this.individuals[index].chromosome.slice()
          );
          // Tambahkan eliteIndividual ke newPopulation
          newPopulation.addIndividual(eliteIndividual);
        } else {
          // Jika tidak maka lakukan roulleteWheelSelection
          // Select mate
          var parent = this.rouletteWheelSelection();
          // Apply crossover
          this.individuals[index].crossover(parent, newPopulation);
        }
      }

      return newPopulation;
    };

    // Adds an individual to current population
    this.addIndividual = function (individual) {
      this.individuals.push(individual);
    };

    // Deklarasikan function roulletteWheelSelection, initialization totalFitness : 0, dan fitness : array
    // Selects an individual with Roulette Wheel selection
    /* Fungsi rouletteWheelSelection bertugas memilih satu individu yang memiliki fitness terbaik dari populasi saat ini menggunakan metode roulette wheel selection. Fungsi ini memiliki beberapa langkah:

    - Menghitung total fitness dari semua individu dalam populasi.
    - Menghitung probabilitas relatif setiap individu dalam populasi dengan membagi fitness setiap individu dengan total fitness.
    - Menghitung probabilitas cumulative dari setiap individu.
    - Melakukan random sampling sebanyak jumlah individu dalam populasi.
    - Melakukan iterasi terhadap hasil random sampling dan membandingkannya dengan probabilitas cumulative. Individu yang memiliki probabilitas cumulative paling dekat dengan hasil random sampling akan dipilih sebagai individu dengan fitness terbaik.
    - Hasil akhir dari fungsi ini adalah individu dengan fitness terbaik yang dipilih menggunakan roulette wheel selection.*/
    this.rouletteWheelSelection = function () {
      var totalFitness = 0;
      var fitness = [];
      // Looping sebanyak jumlah individual
      for (var i = 0; i < this.individuals.length; i++) {
        // Set fitness index ke i sebanyak nilai fitness individual ke i
        fitness[i] = this.individuals[i].calcFitness();
        // kemudian jumlahkan semua nilai fitness ke totalFitness
        totalFitness = totalFitness + fitness[i];
      }

      // Initialisasi array P & C
      var P = [];
      var C = [];
      // Looping sebanyak jumlah individual
      for (let i = 0; i < this.individuals.length; i++) {
        // Cari nilai P dengan rumus Pk = Fk/totalFitness kemudian simpan di array P
        P[i] = fitness[i] / totalFitness;

        // Jika individual pertama atau == 0 maka nilai C sama dengan nilai P, jika merupakan individual terakhir atau == jumlah individual C = 1, Jika tidak maka C = Ck = Pk-1 +Pk
        if (i == 0) {
          C[i] = P[i];
        } else if (i == this.individuals.length) {
          C[i] = 1;
        } else {
          C[i] = C[i - 1] + P[i];
        }
      }

      // Initialisasi array R dan roletteWheelPopulation
      var R = [];
      var rouletteWheelPopulation = new ga.population();
      for (let i = 0; i < this.individuals.length; i++) {
        // Isi R dengan nilai random dari 0 – 1
        R[i] = Math.random();
        // Looping sebanyak jumlah array C
        for (let j = 0; j < C.length; j++) {
          // Jika R lebih kecil dari C[j] maka tambahkan individual ke rouletteWheelPopulation
          if (R[i] <= C[j]) {
            rouletteWheelPopulation.addIndividual(this.individuals[j]);
            break;
          }
        }
      }
      // Cari getFittesst dari rouletteWheelPopulation kemudian kembalikan
      return rouletteWheelPopulation.getFittest();
    };

    // Return the fittest individual's population index
    // Membandingkan fitness masing-masing individu dan memastikan bahwa yang terpilih adalah individu dengan fitness terbesar.
    this.getFittestIndex = function () {
      // Nilai fittestIndex = 0
      var fittestIndex = 0;

      // Looping sebanyak jumlah individual
      // Loop over population looking for fittest
      for (var i = 1; i < this.individuals.length; i++) {
        // Jika nilai fitness individual lebih besar dari nilai fittestIndex sekarang maka ubah nilai fittestIndex ke i. Jika looping sudah selesai kembalikan nilai fittestIndex.
        if (
          this.individuals[i].calcFitness() >
          this.individuals[fittestIndex].calcFitness()
        ) {
          fittestIndex = i;
        }
      }

      return fittestIndex;
    };

    // Kembalikan individuals dengan index dimana nilai fittest terbaik
    // Return fittest individual
    this.getFittest = function () {
      return this.individuals[this.getFittestIndex()];
    };
  },

  // Simpan Panjang kromosom di this.chromosomeLength, nilai fitness di this.fitness (), dan kromosom di this.chromosome.
  // Individual class

  /* Kode ini adalah implementasi dari individu dalam suatu populasi dalam Algoritma Genetika (GA). Individu memiliki beberapa fitur yaitu panjang kromosom (chromosomeLength), fitness, dan kromosom (chromosome). Ada beberapa metode yang didefinisikan dalam individu, seperti:

  initialize: membuat kromosom secara acak.
  setChromosome: menetapkan kromosom untuk individu.
  mutate: melakukan mutasi pada kromosom.
  getDistance: menghitung jarak total dari rute yang ditentukan oleh kromosom.
  calcFitness: menghitung nilai fitness dari individu.
  crossover: melakukan crossover antara individu dengan individu lain, hasilnya ditambahkan ke populasi anak.
  Fitness digunakan untuk menilai kualitas dari individu dan akan menentukan individu yang akan memasuki generasi selanjutnya. Algoritma genetika memanfaatkan mekanisme mutasi, crossover, dan seleksi untuk membuat individu yang lebih baik dari generasi ke generasi.*/
  individual: function (chromosomeLength) {
    this.chromosomeLength = chromosomeLength;
    this.fitness = null;
    this.chromosome = [];

    // Simpan kromosom individual baru di this.chromosome.
    // Initialize random individual
    this.initialize = function () {
      this.chromosome = [];

      // Looping sebanyak Panjang kromosom, inputkan nilai 0 – Panjang kromosom secara berurutan ke dalam kromosom.
      // Generate random chromosome
      for (var i = 0; i < this.chromosomeLength; i++) {
        this.chromosome.push(i);
      }

      // Looping sebanyak Panjang kromosom. Kemudian buat angka random kemudian kalikan dengan Panjang kromosom lalu bulatkan kebawah gunakan sebagai randomIndex untuk memilih kromosom yang akan diganti nilainya dengan kromosom ke-I atau sekarang.
      for (var i = 0; i < this.chromosomeLength; i++) {
        // Buat randomIndex dengan kalikan bilangan random dengan Panjang kromosom kemudian bulatkan kebawah.
        var randomIndex = Math.floor(Math.random() * this.chromosomeLength);
        // Kemudian simpan hasil kromosom index ke randomIndex ke tempNode dan swap ke kromosom ke index
        var tempNode = this.chromosome[randomIndex];
        this.chromosome[randomIndex] = this.chromosome[i];
        this.chromosome[i] = tempNode;
      }
    };

    // Set kromosom individual dengan kromosom baru
    // Set individual's chromosome
    this.setChromosome = function (chromosome) {
      this.chromosome = chromosome;
    };

    // Mutate individual
    this.mutate = function () {
      this.fitness = null;

      // Looping sebanyak jumlah kromosom
      // Loop over chromosome making random changes
      for (index in this.chromosome) {
        if (ga.mutationRate > Math.random()) {
          var randomIndex = Math.floor(Math.random() * this.chromosomeLength);
          var tempNode = this.chromosome[randomIndex];
          this.chromosome[randomIndex] = this.chromosome[index];
          this.chromosome[index] = tempNode;
        }
      }
    };

    // Returns individuals route distance
    this.getDistance = function () {
      // Nilai totalDistance = 0
      var totalDistance = 0;

      // Looping sebanyak jumlah kromosom
      for (index in this.chromosome) {
        // Nilai endNode = kromosom index ke 0
        // Nilai startNode = kromosom index mulai dari 0 sampai akhir
        var startNode = this.chromosome[index];
        var endNode = this.chromosome[0];

        // Jika index + 1 lebih kecil dari jumlah kromosom maka endNode = kromosom index sekarang + 1
        if (parseInt(index) + 1 < this.chromosome.length) {
          endNode = this.chromosome[parseInt(index) + 1];
        }

        // Tambah distance dari startNode hingga endNode dimana startNode adalah node dengan index sekarang ke endNode
        totalDistance += distances[startNode][endNode];
      }

      // Jika semua kromosom sudah diloop maka kembalikan totalDistance
      totalDistance += distances[startNode][endNode];

      return totalDistance;
    };

    // Jika nilai fitness tidak sama dengan null maka kembalikan nilai fitness
    // Calculates individuals fitness value
    this.calcFitness = function () {
      if (this.fitness != null) {
        return this.fitness;
      }

      // Jika tidak maka hitung totalDistance
      var totalDistance = this.getDistance();

      // Kemudian cari fitness dengan rumus F(x)=1/f(x) dimana f(x) adalah total distance yang didapatkan tadi kemudian kembalikan nilai fitness.
      this.fitness = 1 / totalDistance;
      return this.fitness;
    };

    // Applies crossover to current individual and mate, then adds it's offspring to given population
    this.crossover = function (individual, offspringPopulation) {
      var offspringChromosome = [];

      // Add a random amount of this individual's genetic information to offspring
      var startPos = Math.floor(this.chromosome.length * Math.random());
      var endPos = Math.floor(this.chromosome.length * Math.random());

      var i = startPos;
      while (i != endPos) {
        offspringChromosome[i] = individual.chromosome[i];
        i++;

        if (i >= this.chromosome.length) {
          i = 0;
        }
      }

      // Add any remaining genetic information from individual's mate
      for (parentIndex in individual.chromosome) {
        var node = individual.chromosome[parentIndex];

        var nodeFound = false;
        for (offspringIndex in offspringChromosome) {
          if (offspringChromosome[offspringIndex] == node) {
            nodeFound = true;
            break;
          }
        }

        if (nodeFound == false) {
          for (
            var offspringIndex = 0;
            offspringIndex < individual.chromosome.length;
            offspringIndex++
          ) {
            if (offspringChromosome[offspringIndex] == undefined) {
              offspringChromosome[offspringIndex] = node;
              break;
            }
          }
        }
      }

      // Add chromosome to offspring and add offspring to population
      var offspring = new ga.individual(this.chromosomeLength);
      offspring.setChromosome(offspringChromosome);
      offspringPopulation.addIndividual(offspring);
    };
  },
};
